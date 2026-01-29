/**
 * Client-Side Cache pour widgets et CVData
 *
 * Gestion du cache multi-niveaux :
 * 1. Cache widgets : localStorage (widgets générés, persistants)
 * 2. Cache CVData : sessionStorage (CV converti, session uniquement)
 * 3. Cache preview : mémoire React (preview thèmes, non persisté)
 *
 * IMPORTANT: Incrémenter CACHE_VERSION quand la logique de conversion change
 * pour invalider automatiquement les anciens caches.
 */

import type { AIWidgetsEnvelope } from "./ai-widgets";
import type { RendererResumeSchema } from "./renderer-schema";

// VERSION DU CACHE - Incrémenter pour invalider les anciens caches
const CACHE_VERSION = 5; // v5: Fix fallback matching par poste+entreprise (pas IDs)

const WIDGETS_CACHE_PREFIX = "cv_widgets:";
const CVDATA_CACHE_PREFIX = "cv_data:";
const MAX_CACHE_SIZE = 5 * 1024 * 1024; // 5MB max

interface CachedWidgets {
    version?: number; // Version du cache
    widgets: AIWidgetsEnvelope;
    metadata: {
        analysisId: string;
        jobId?: string;
        generatedAt: string;
        widgetsCount: number;
        model: string;
    };
    timestamp: number;
}

interface CachedCVData {
    version?: number; // Version du cache
    cvData: RendererResumeSchema;
    templateId: string;
    options: {
        minScore: number;
        maxExperiences: number;
        maxBulletsPerExperience: number;
    };
    timestamp: number;
}

/**
 * Sauvegarde widgets dans localStorage
 */
export function saveWidgetsToCache(
    analysisId: string,
    widgets: AIWidgetsEnvelope,
    metadata: CachedWidgets["metadata"]
): void {
    try {
        const key = `${WIDGETS_CACHE_PREFIX}${analysisId}`;
        const cached: CachedWidgets = {
            version: CACHE_VERSION,
            widgets,
            metadata,
            timestamp: Date.now(),
        };

        const serialized = JSON.stringify(cached);
        
        // Vérifier taille avant sauvegarde
        if (serialized.length > MAX_CACHE_SIZE) {
            console.warn("Widgets cache trop volumineux, nettoyage...");
            cleanupOldCache();
        }

        localStorage.setItem(key, serialized);
    } catch (error) {
        console.error("Erreur sauvegarde widgets cache:", error);
        // Si localStorage plein, nettoyer anciens caches
        if (error instanceof DOMException && error.name === "QuotaExceededError") {
            cleanupOldCache();
            // Réessayer une fois
            try {
                const key = `${WIDGETS_CACHE_PREFIX}${analysisId}`;
                const cached: CachedWidgets = {
                    widgets,
                    metadata,
                    timestamp: Date.now(),
                };
                localStorage.setItem(key, JSON.stringify(cached));
            } catch (retryError) {
                console.error("Échec sauvegarde après nettoyage:", retryError);
            }
        }
    }
}

/**
 * Récupère widgets depuis localStorage
 */
export function getWidgetsFromCache(analysisId: string): CachedWidgets | null {
    try {
        const key = `${WIDGETS_CACHE_PREFIX}${analysisId}`;
        const cached = localStorage.getItem(key);

        if (!cached) return null;

        const parsed: CachedWidgets = JSON.parse(cached);

        // Vérifier VERSION - invalider si ancienne version
        if (parsed.version !== CACHE_VERSION) {
            console.log(`[client-cache] Cache invalidé: version ${parsed.version} != ${CACHE_VERSION}`);
            localStorage.removeItem(key);
            return null;
        }

        // Vérifier expiration (24h)
        const maxAge = 24 * 60 * 60 * 1000; // 24h
        if (Date.now() - parsed.timestamp > maxAge) {
            localStorage.removeItem(key);
            return null;
        }

        return parsed;
    } catch (error) {
        console.error("Erreur récupération widgets cache:", error);
        return null;
    }
}

/**
 * Sauvegarde CVData dans sessionStorage
 */
export function saveCVDataToCache(
    analysisId: string,
    templateId: string,
    cvData: RendererResumeSchema,
    options: CachedCVData["options"]
): void {
    try {
        const key = `${CVDATA_CACHE_PREFIX}${analysisId}:${templateId}`;
        const cached: CachedCVData = {
            version: CACHE_VERSION,
            cvData,
            templateId,
            options,
            timestamp: Date.now(),
        };

        sessionStorage.setItem(key, JSON.stringify(cached));
    } catch (error) {
        console.error("Erreur sauvegarde CVData cache:", error);
    }
}

/**
 * Récupère CVData depuis sessionStorage
 */
export function getCVDataFromCache(
    analysisId: string,
    templateId: string
): CachedCVData | null {
    try {
        const key = `${CVDATA_CACHE_PREFIX}${analysisId}:${templateId}`;
        const cached = sessionStorage.getItem(key);

        if (!cached) return null;

        const parsed: CachedCVData = JSON.parse(cached);

        // Vérifier VERSION - invalider si ancienne version
        if (parsed.version !== CACHE_VERSION) {
            console.log(`[client-cache] CVData invalidé: version ${parsed.version} != ${CACHE_VERSION}`);
            sessionStorage.removeItem(key);
            return null;
        }

        // Vérifier expiration (1h pour sessionStorage)
        const maxAge = 60 * 60 * 1000; // 1h
        if (Date.now() - parsed.timestamp > maxAge) {
            sessionStorage.removeItem(key);
            return null;
        }

        return parsed;
    } catch (error) {
        console.error("Erreur récupération CVData cache:", error);
        return null;
    }
}

/**
 * Nettoie les anciens caches (garder seulement les 10 plus récents)
 */
function cleanupOldCache(): void {
    try {
        // Récupérer toutes les clés widgets
        const widgetsKeys: Array<{ key: string; timestamp: number }> = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(WIDGETS_CACHE_PREFIX)) {
                try {
                    const cached = localStorage.getItem(key);
                    if (cached) {
                        const parsed: CachedWidgets = JSON.parse(cached);
                        widgetsKeys.push({ key, timestamp: parsed.timestamp });
                    }
                } catch {
                    // Ignorer les entrées corrompues
                }
            }
        }

        // Trier par timestamp (plus récent en premier)
        widgetsKeys.sort((a, b) => b.timestamp - a.timestamp);

        // Supprimer les anciens (garder seulement les 10 plus récents)
        if (widgetsKeys.length > 10) {
            for (let i = 10; i < widgetsKeys.length; i++) {
                localStorage.removeItem(widgetsKeys[i].key);
            }
        }
    } catch (error) {
        console.error("Erreur nettoyage cache:", error);
    }
}

/**
 * Supprime tous les caches pour un analysisId
 */
export function clearCacheForAnalysis(analysisId: string): void {
    try {
        // Supprimer widgets cache
        const widgetsKey = `${WIDGETS_CACHE_PREFIX}${analysisId}`;
        localStorage.removeItem(widgetsKey);

        // Supprimer tous les CVData caches pour cet analysisId
        const keysToRemove: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key?.startsWith(`${CVDATA_CACHE_PREFIX}${analysisId}:`)) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach((key) => sessionStorage.removeItem(key));
    } catch (error) {
        console.error("Erreur suppression cache:", error);
    }
}

/**
 * Obtient la taille totale du cache
 */
export function getCacheSize(): { widgets: number; cvData: number } {
    let widgetsSize = 0;
    let cvDataSize = 0;

    try {
        // Taille widgets cache
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(WIDGETS_CACHE_PREFIX)) {
                const value = localStorage.getItem(key);
                if (value) widgetsSize += value.length;
            }
        }

        // Taille CVData cache
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key?.startsWith(CVDATA_CACHE_PREFIX)) {
                const value = sessionStorage.getItem(key);
                if (value) cvDataSize += value.length;
            }
        }
    } catch (error) {
        console.error("Erreur calcul taille cache:", error);
    }

    return { widgets: widgetsSize, cvData: cvDataSize };
}
