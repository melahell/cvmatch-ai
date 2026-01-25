/**
 * Helper pour générer AI_WIDGETS_SCHEMA depuis RAG + match analysis
 * Utilise le prompt Gemini pour produire des widgets scorés
 *
 * [AUDIT FIX CRITIQUE-1] : Utilise buildRAGForCVPrompt pour optimiser le contexte
 * envoyé à Gemini, réduisant les tokens et améliorant la qualité.
 *
 * [INTÉGRATION] : Sector detection, cache intelligent, observability
 */

import { generateWithGemini, GEMINI_MODELS } from "@/lib/ai/gemini";
import { getAIWidgetsGenerationPrompt } from "@/lib/ai/prompts";
import { validateAIWidgetsEnvelope, AIWidgetsEnvelope } from "./ai-widgets";
import { buildRAGForCVPrompt, calculateRAGCompletenessScore } from "./rag-transform";
import { detectSector, getSectorPromptInstructions, applySectorScoringBoost, type Sector } from "./sector-customization";
import { getSmartCachedWidgets, saveToSmartCache, hashFullContext } from "./smart-widget-cache";
import { compressRAGProfile, estimateTokens } from "@/lib/ai/prompt-optimization";
import { detectLanguage, getTranslationPromptInstructions } from "./multi-language";
import { calculateDynamicLimits } from "./ai-adapter";
import { logger } from "@/lib/utils/logger";

export interface GenerateWidgetsParams {
    ragProfile: any;
    matchAnalysis: any;
    jobDescription: string;
    userId?: string;  // Pour le cache
    skipCache?: boolean;
}

export interface GenerateWidgetsResult {
    envelope: AIWidgetsEnvelope;
    ragCompletenessScore: number;
    optimizedRAGUsed: boolean;
    sector: Sector;
    fromCache: boolean;
    tokensSaved: number;
}

/**
 * Génère des widgets scorés depuis RAG + match analysis
 * @returns AIWidgetsEnvelope validé ou null si erreur
 *
 * [AUDIT FIX CRITIQUE-1] : Le RAG est maintenant optimisé avant d'être passé au prompt
 * [INTÉGRATION] : Cache intelligent, détection secteur, prompt optimization
 */
export async function generateWidgetsFromRAGAndMatch(
    params: GenerateWidgetsParams
): Promise<AIWidgetsEnvelope | null> {
    const startTime = Date.now();

    try {
        // [INTÉGRATION] Détection du secteur pour personnaliser les prompts
        const sector = detectSector(params.jobDescription, params.matchAnalysis?.company);

        // [INTÉGRATION] Détection de la langue de l'offre
        const langDetection = detectLanguage(params.jobDescription);
        const detectedLanguage = langDetection.language;

        logger.debug("[generate-widgets] Contexte détecté", {
            sector,
            language: detectedLanguage,
            languageConfidence: langDetection.confidence,
        });

        // [INTÉGRATION] Vérifier le cache si userId fourni
        if (params.userId && !params.skipCache) {
            try {
                const cacheResult = await getSmartCachedWidgets(
                    params.userId,
                    params.ragProfile,
                    params.jobDescription,
                    params.matchAnalysis
                );

                if (cacheResult.fromCache && cacheResult.widgets.length > 0) {
                    logger.info("[generate-widgets] Cache hit!", {
                        level: cacheResult.cacheLevel,
                        widgetCount: cacheResult.widgets.length,
                        savedTimeMs: Date.now() - startTime,
                    });

                    // Appliquer le boost sectoriel même sur les widgets cachés
                    const boostedWidgets = cacheResult.widgets.map((widget: any) => ({
                        ...widget,
                        relevance_score: (widget.relevance_score || 50) + applySectorScoringBoost(widget, sector, params.ragProfile),
                    }));

                    return {
                        version: "2.0",
                        generated_at: new Date().toISOString(),
                        widgets: boostedWidgets,
                        meta: {
                            model: "cache",
                            sector,
                            fromCache: true,
                            cacheLevel: cacheResult.cacheLevel,
                        },
                    } as AIWidgetsEnvelope;
                }
            } catch (cacheError) {
                logger.warn("[generate-widgets] Cache lookup failed, continuing without cache", { error: cacheError });
            }
        }

        // [AUDIT FIX CRITIQUE-1] : Optimiser le RAG pour réduire les tokens
        const ragCompletenessScore = calculateRAGCompletenessScore(params.ragProfile);
        const optimizedRAG = buildRAGForCVPrompt(params.ragProfile);

        // [INTÉGRATION] Compression supplémentaire si RAG très volumineux
        const originalTokens = estimateTokens(JSON.stringify(params.ragProfile));
        let finalRAG = optimizedRAG;
        let tokensSaved = 0;

        if (originalTokens > 50000) {
            const { compressed, metrics } = compressRAGProfile(optimizedRAG, {
                compressionLevel: "medium",
            });
            finalRAG = compressed;
            tokensSaved = metrics.originalTokens - metrics.optimizedTokens;
            logger.debug("[generate-widgets] Compression supplémentaire appliquée", {
                reduction: `${metrics.reductionPercent}%`,
                tokensSaved,
            });
        }

        logger.debug("[generate-widgets] RAG optimisé pour prompt", {
            originalSize: JSON.stringify(params.ragProfile).length,
            optimizedSize: JSON.stringify(finalRAG).length,
            reduction: `${Math.round((1 - JSON.stringify(finalRAG).length / JSON.stringify(params.ragProfile).length) * 100)}%`,
            ragCompletenessScore,
            sector,
        });

        // [INTÉGRATION] Calculer les limites dynamiques selon la richesse du RAG
        const dynamicLimits = calculateDynamicLimits(params.ragProfile);
        logger.info("[generate-widgets] Limites dynamiques calculées", {
            nbExperiencesRAG: params.ragProfile?.experiences?.length || 0,
            minExperiences: dynamicLimits.minExperiences,
            maxExperiences: dynamicLimits.maxExperiences,
            maxWidgets: dynamicLimits.maxWidgets,
            minScore: dynamicLimits.minScore,
        });

        // [INTÉGRATION] Ajouter les instructions sectorielles et linguistiques au prompt
        const sectorInstructions = getSectorPromptInstructions(sector);
        const languageInstructions = detectedLanguage !== "fr"
            ? getTranslationPromptInstructions(detectedLanguage, "fr", [])
            : "";

        const prompt = getAIWidgetsGenerationPrompt(
            finalRAG,
            params.matchAnalysis,
            params.jobDescription,
            dynamicLimits  // Passer les limites dynamiques au prompt
        ) + (sectorInstructions ? `\n\n${sectorInstructions}` : "")
          + (languageInstructions ? `\n\n${languageInstructions}` : "");

        const response = await generateWithGemini({
            prompt,
            model: GEMINI_MODELS.principal,
        });

        // Parser la réponse JSON
        let parsed: unknown;
        try {
            const cleaned = response
                .replace(/```json\n?/g, "")
                .replace(/```\n?/g, "")
                .trim();
            parsed = JSON.parse(cleaned);
        } catch (parseError) {
            logger.error("[generate-widgets] Erreur parsing JSON", { error: parseError });
            console.error("Réponse brute:", response.substring(0, 500));
            return null;
        }

        // Valider avec Zod
        const validation = validateAIWidgetsEnvelope(parsed);
        if (!validation.success) {
            logger.error("[generate-widgets] Erreur validation", { error: validation.error });
            return null;
        }

        // [INTÉGRATION] Appliquer le boost sectoriel aux scores
        const boostedWidgets = validation.data.widgets.map((widget: any) => ({
            ...widget,
            relevance_score: (widget.relevance_score || 50) + applySectorScoringBoost(widget, sector, params.ragProfile),
        }));
        const envelope: AIWidgetsEnvelope = {
            ...validation.data,
            widgets: boostedWidgets,
            meta: {
                ...validation.data.meta,
                model: GEMINI_MODELS.principal,
                sector,
                language: detectedLanguage,
                fromCache: false,
                generationTimeMs: Date.now() - startTime,
            },
        };

        // [INTÉGRATION] Sauvegarder dans le cache si userId fourni
        if (params.userId && !params.skipCache) {
            try {
                await saveToSmartCache(
                    params.userId,
                    params.ragProfile,
                    params.jobDescription,
                    params.matchAnalysis,
                    envelope
                );
                logger.debug("[generate-widgets] Widgets sauvegardés dans le cache");
            } catch (saveError) {
                logger.warn("[generate-widgets] Cache save failed", { error: saveError });
            }
        }

        return envelope;
    } catch (error) {
        logger.error("[generate-widgets] Erreur génération", { error });
        return null;
    }
}
