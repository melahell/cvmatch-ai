/**
 * Server-Side Cache pour widgets générés
 * 
 * Cache les widgets générés dans Supabase pour éviter régénération identique.
 * Clé de cache : hash(analysisId + ragVersion + jobDescriptionHash)
 */

import { createSupabaseAdminClient } from "@/lib/supabase";
import type { AIWidgetsEnvelope } from "./ai-widgets";
import { logger } from "@/lib/utils/logger";
import crypto from "crypto";

const CACHE_TABLE = "widget_cache";
const CACHE_TTL_HOURS = 24; // 24 heures

interface CachedWidgets {
    id: string;
    cache_key: string;
    widgets: AIWidgetsEnvelope;
    metadata: {
        analysisId: string;
        jobId?: string;
        generatedAt: string;
        widgetsCount: number;
        model: string;
    };
    created_at: string;
    expires_at: string;
}

/**
 * Génère une clé de cache unique basée sur analysisId, RAG version et job description
 */
export function generateCacheKey(
    analysisId: string,
    ragCompletenessScore: number,
    jobDescriptionHash: string
): string {
    const input = `${analysisId}:${ragCompletenessScore}:${jobDescriptionHash}`;
    return crypto.createHash("sha256").update(input).digest("hex");
}

/**
 * Hash une description d'emploi pour la clé de cache
 */
export function hashJobDescription(jobDescription: string): string {
    // Normaliser le texte (supprimer espaces multiples, lowercase)
    const normalized = jobDescription
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
    return crypto.createHash("sha256").update(normalized).digest("hex").substring(0, 16);
}

/**
 * Récupère widgets depuis le cache serveur
 */
export async function getWidgetsFromServerCache(
    cacheKey: string
): Promise<{ widgets: AIWidgetsEnvelope; metadata: CachedWidgets["metadata"] } | null> {
    try {
        const supabase = createSupabaseAdminClient();
        
        const { data, error } = await supabase
            .from(CACHE_TABLE)
            .select("*")
            .eq("cache_key", cacheKey)
            .gt("expires_at", new Date().toISOString())
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        if (error || !data) {
            return null;
        }

        return {
            widgets: data.widgets as AIWidgetsEnvelope,
            metadata: data.metadata as CachedWidgets["metadata"],
        };
    } catch (error) {
        console.error("[widget-cache] Erreur récupération cache:", error);
        return null;
    }
}

/**
 * Sauvegarde widgets dans le cache serveur
 */
export async function saveWidgetsToServerCache(
    cacheKey: string,
    widgets: AIWidgetsEnvelope,
    metadata: CachedWidgets["metadata"]
): Promise<void> {
    try {
        const supabase = createSupabaseAdminClient();
        
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + CACHE_TTL_HOURS);

        const { error } = await supabase
            .from(CACHE_TABLE)
            .upsert({
                cache_key: cacheKey,
                widgets,
                metadata,
                created_at: new Date().toISOString(),
                expires_at: expiresAt.toISOString(),
            }, {
                onConflict: "cache_key",
            });

        if (error) {
            logger.error("[widget-cache] Erreur sauvegarde cache", { error });
        }
    } catch (error) {
        logger.error("[widget-cache] Erreur sauvegarde cache", { error });
    }
}

/**
 * Calcule minScore optimal selon qualité RAG
 * 
 * Logique :
 * - Score RAG < 50 : minScore = 30 (profil pauvre, accepter plus de widgets)
 * - Score RAG 50-70 : minScore = 50 (profil moyen, filtre standard)
 * - Score RAG 70-85 : minScore = 60 (profil bon, être plus sélectif)
 * - Score RAG > 85 : minScore = 70 (profil excellent, très sélectif)
 */
export function calculateOptimalMinScore(ragCompletenessScore: number): number {
    if (ragCompletenessScore < 50) {
        return 30; // Profil pauvre : accepter plus de widgets
    } else if (ragCompletenessScore < 70) {
        return 50; // Profil moyen : filtre standard
    } else if (ragCompletenessScore < 85) {
        return 60; // Profil bon : être plus sélectif
    } else {
        return 70; // Profil excellent : très sélectif
    }
}
