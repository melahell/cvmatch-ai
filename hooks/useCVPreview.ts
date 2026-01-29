/**
 * Hook pour preview temps réel de CV avec switch thème instantané
 * 
 * Gère la conversion widgets → CVData pour chaque template
 * avec cache intelligent pour performance maximale.
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { convertWidgetsToCV, type ConvertOptions } from "@/lib/cv/client-bridge";
import { getCVDataFromCache, saveCVDataToCache } from "@/lib/cv/client-cache";
import type { AIWidgetsEnvelope } from "@/lib/cv/ai-widgets";
import type { RendererResumeSchema } from "@/lib/cv/renderer-schema";
import { TEMPLATES } from "@/components/cv/templates";

interface UseCVPreviewOptions {
    widgets: AIWidgetsEnvelope | null;
    analysisId: string;
    convertOptions?: ConvertOptions;
    enabledTemplates?: string[]; // Templates à précharger (par défaut: tous)
}

interface PreviewCache {
    [templateId: string]: RendererResumeSchema;
}

export function useCVPreview({
    widgets,
    analysisId,
    convertOptions = { minScore: 0, maxExperiences: 99, maxBulletsPerExperience: 99 },
    enabledTemplates,
}: UseCVPreviewOptions) {
    const [previewCache, setPreviewCache] = useState<PreviewCache>({});
    const [loadingTemplates, setLoadingTemplates] = useState<Set<string>>(new Set());

    // Templates à précharger
    const templatesToPreload = useMemo(() => {
        const available = TEMPLATES.filter((t) => t.available).map((t) => t.id);
        if (enabledTemplates) {
            return available.filter((id) => enabledTemplates.includes(id));
        }
        return available;
    }, [enabledTemplates]);

    // Convertir widgets pour un template spécifique
    const getCVForTemplate = useCallback(
        (templateId: string): RendererResumeSchema | null => {
            if (!widgets) return null;

            // Vérifier cache mémoire d'abord
            if (previewCache[templateId]) {
                return previewCache[templateId];
            }

            // Options pour le cache (sans ragProfile)
            const cacheOptions = {
                minScore: convertOptions.minScore ?? 0,
                maxExperiences: convertOptions.maxExperiences ?? 99,
                maxBulletsPerExperience: convertOptions.maxBulletsPerExperience ?? 99,
            };

            // Vérifier cache sessionStorage
            const cached = getCVDataFromCache(analysisId, templateId);
            if (cached && JSON.stringify(cached.options) === JSON.stringify(cacheOptions)) {
                setPreviewCache((prev) => ({
                    ...prev,
                    [templateId]: cached.cvData,
                }));
                return cached.cvData;
            }

            // Convertir (instantané côté client)
            try {
                const cvData = convertWidgetsToCV(widgets, cacheOptions);

                // Sauvegarder dans caches
                saveCVDataToCache(analysisId, templateId, cvData, cacheOptions);
                setPreviewCache((prev) => ({
                    ...prev,
                    [templateId]: cvData,
                }));

                return cvData;
            } catch (error) {
                console.error(`Erreur conversion template ${templateId}:`, error);
                return null;
            }
        },
        [widgets, analysisId, convertOptions, previewCache]
    );

    // Précharger tous les templates en arrière-plan
    useEffect(() => {
        if (!widgets) return;

        const preloadTemplates = async () => {
            for (const templateId of templatesToPreload) {
                // Skip si déjà en cache
                if (previewCache[templateId] || getCVDataFromCache(analysisId, templateId)) {
                    continue;
                }

                setLoadingTemplates((prev) => new Set(prev).add(templateId));

                // Options pour le cache (sans ragProfile)
                const cacheOpts = {
                    minScore: convertOptions.minScore ?? 0,
                    maxExperiences: convertOptions.maxExperiences ?? 99,
                    maxBulletsPerExperience: convertOptions.maxBulletsPerExperience ?? 99,
                };

                // Conversion synchrone mais rapide (<10ms)
                try {
                    const cvData = convertWidgetsToCV(widgets, cacheOpts);
                    saveCVDataToCache(analysisId, templateId, cvData, cacheOpts);
                    setPreviewCache((prev) => ({
                        ...prev,
                        [templateId]: cvData,
                    }));
                } catch (error) {
                    console.error(`Erreur préchargement ${templateId}:`, error);
                } finally {
                    setLoadingTemplates((prev) => {
                        const next = new Set(prev);
                        next.delete(templateId);
                        return next;
                    });
                }
            }
        };

        // Précharger avec un petit délai pour ne pas bloquer le rendu initial
        const timeout = setTimeout(preloadTemplates, 100);
        return () => clearTimeout(timeout);
    }, [widgets, analysisId, convertOptions, templatesToPreload, previewCache]);

    // Invalider cache quand options changent
    useEffect(() => {
        setPreviewCache({});
    }, [convertOptions]);

    return {
        getCVForTemplate,
        previewCache,
        isLoading: loadingTemplates.size > 0,
        loadingTemplates: Array.from(loadingTemplates),
    };
}
