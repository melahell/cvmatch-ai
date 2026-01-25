/**
 * Smart Widget Cache - Cache intelligent avec réutilisation partielle
 *
 * [AMÉLIORATION P0-1] : Cache sophistiqué qui peut réutiliser des widgets
 * d'expériences même si l'offre d'emploi change.
 *
 * Architecture:
 * - Cache niveau 1: Widgets complets (hash: RAG + Job)
 * - Cache niveau 2: Widgets par expérience (hash: RAG expérience seule)
 * - Cache niveau 3: Widgets génériques (skills, formations, langues)
 *
 * Gain potentiel: -80% temps génération pour profils déjà analysés
 */

import { createSupabaseAdminClient } from "@/lib/supabase";
import type { AIWidgetsEnvelope, AIWidget } from "./ai-widgets";
import { logger } from "@/lib/utils/logger";
import crypto from "crypto";

// ============================================================================
// TYPES
// ============================================================================

export interface CacheStats {
    level1Hits: number;
    level2Hits: number;
    level3Hits: number;
    misses: number;
    partialHits: number;
    savedTokens: number;
    savedTimeMs: number;
}

export interface SmartCacheResult {
    widgets: AIWidget[];
    fromCache: boolean;
    cacheLevel: 1 | 2 | 3 | null;
    needsGeneration: {
        experiences: string[];  // IDs des expériences à générer
        sections: string[];     // Sections à générer (skills, education, etc.)
    };
    reusedWidgets: AIWidget[];
    stats: Partial<CacheStats>;
}

export interface ExperienceWidgetCache {
    experienceHash: string;
    widgets: AIWidget[];
    createdAt: string;
    ragExperienceId: string;
}

export interface GenericWidgetCache {
    sectionHash: string;
    section: string;
    widgets: AIWidget[];
    createdAt: string;
}

// ============================================================================
// HASHING UTILITIES
// ============================================================================

/**
 * Hash une expérience pour le cache niveau 2
 */
export function hashExperience(experience: any): string {
    const normalized = {
        poste: experience.poste?.toLowerCase().trim(),
        entreprise: experience.entreprise?.toLowerCase().trim(),
        debut: experience.debut || experience.date_debut,
        fin: experience.fin || experience.date_fin,
        realisations: (experience.realisations || []).map((r: any) =>
            typeof r === "string" ? r.toLowerCase().trim() : (r.description || "").toLowerCase().trim()
        ).sort(),
    };
    return crypto.createHash("sha256").update(JSON.stringify(normalized)).digest("hex").substring(0, 16);
}

/**
 * Hash une section générique (skills, formations, langues)
 */
export function hashSection(sectionData: any, sectionName: string): string {
    const normalized = JSON.stringify(sectionData).toLowerCase();
    return crypto.createHash("sha256").update(`${sectionName}:${normalized}`).digest("hex").substring(0, 16);
}

/**
 * Hash le contexte job pour le cache niveau 1
 */
export function hashJobContext(jobDescription: string, matchAnalysis: any): string {
    const normalized = {
        job: jobDescription.toLowerCase().replace(/\s+/g, " ").trim().substring(0, 500),
        keywords: (matchAnalysis?.missing_keywords || []).sort(),
        title: (matchAnalysis?.job_title || "").toLowerCase(),
    };
    return crypto.createHash("sha256").update(JSON.stringify(normalized)).digest("hex").substring(0, 16);
}

/**
 * Hash complet pour cache niveau 1
 */
export function hashFullContext(ragProfile: any, jobDescription: string, matchAnalysis: any): string {
    const ragHash = crypto.createHash("sha256")
        .update(JSON.stringify(ragProfile))
        .digest("hex")
        .substring(0, 16);
    const jobHash = hashJobContext(jobDescription, matchAnalysis);
    return `${ragHash}_${jobHash}`;
}

// ============================================================================
// CACHE TABLES (utilise Supabase)
// ============================================================================

const CACHE_TABLE_L1 = "widget_cache";           // Existant
const CACHE_TABLE_L2 = "widget_cache_experience"; // Nouveau
const CACHE_TABLE_L3 = "widget_cache_generic";    // Nouveau

const CACHE_TTL_L1_HOURS = 24;
const CACHE_TTL_L2_HOURS = 168;  // 7 jours
const CACHE_TTL_L3_HOURS = 720;  // 30 jours

// ============================================================================
// SMART CACHE OPERATIONS
// ============================================================================

/**
 * Tente de récupérer des widgets depuis le cache multi-niveau
 */
export async function getSmartCachedWidgets(
    userId: string,
    ragProfile: any,
    jobDescription: string,
    matchAnalysis: any
): Promise<SmartCacheResult> {
    const startTime = Date.now();
    const stats: Partial<CacheStats> = {
        level1Hits: 0,
        level2Hits: 0,
        level3Hits: 0,
        misses: 0,
        partialHits: 0,
    };

    const supabase = createSupabaseAdminClient();
    const reusedWidgets: AIWidget[] = [];
    const needsGeneration = {
        experiences: [] as string[],
        sections: [] as string[],
    };

    // ========================================================================
    // NIVEAU 1: Cache complet (RAG + Job)
    // ========================================================================
    const fullHash = hashFullContext(ragProfile, jobDescription, matchAnalysis);

    try {
        const { data: l1Cache } = await supabase
            .from(CACHE_TABLE_L1)
            .select("widgets")
            .eq("cache_key", fullHash)
            .gt("expires_at", new Date().toISOString())
            .single();

        if (l1Cache?.widgets) {
            stats.level1Hits = 1;
            stats.savedTimeMs = Date.now() - startTime;
            logger.info("[smart-cache] L1 HIT - Cache complet trouvé", { fullHash });

            return {
                widgets: l1Cache.widgets.widgets || [],
                fromCache: true,
                cacheLevel: 1,
                needsGeneration: { experiences: [], sections: [] },
                reusedWidgets: l1Cache.widgets.widgets || [],
                stats,
            };
        }
    } catch (e) {
        // Pas de cache L1, continuer
    }

    // ========================================================================
    // NIVEAU 2: Cache par expérience
    // ========================================================================
    const experiences = ragProfile?.experiences || [];
    const experienceHashes = experiences.map((exp: any, idx: number) => ({
        id: `exp_${idx}`,
        hash: hashExperience(exp),
    }));

    try {
        const hashes = experienceHashes.map((e: any) => e.hash);
        const { data: l2Cache } = await supabase
            .from(CACHE_TABLE_L2)
            .select("*")
            .in("experience_hash", hashes)
            .eq("user_id", userId)
            .gt("expires_at", new Date().toISOString());

        const cachedExpHashes = new Set((l2Cache || []).map((c: any) => c.experience_hash));

        for (const expInfo of experienceHashes) {
            if (cachedExpHashes.has(expInfo.hash)) {
                const cached = (l2Cache || []).find((c: any) => c.experience_hash === expInfo.hash);
                if (cached?.widgets) {
                    reusedWidgets.push(...cached.widgets);
                    stats.level2Hits = (stats.level2Hits || 0) + 1;
                }
            } else {
                needsGeneration.experiences.push(expInfo.id);
                stats.misses = (stats.misses || 0) + 1;
            }
        }
    } catch (e) {
        // Erreur L2, marquer toutes les expériences à générer
        needsGeneration.experiences = experienceHashes.map((e: any) => e.id);
    }

    // ========================================================================
    // NIVEAU 3: Cache sections génériques
    // ========================================================================
    const sections = ["skills", "education", "languages", "certifications"];

    try {
        const sectionData: Record<string, { hash: string; data: any }> = {
            skills: { hash: hashSection(ragProfile?.competences, "skills"), data: ragProfile?.competences },
            education: { hash: hashSection(ragProfile?.formations, "education"), data: ragProfile?.formations },
            languages: { hash: hashSection(ragProfile?.langues, "languages"), data: ragProfile?.langues },
            certifications: { hash: hashSection(ragProfile?.certifications, "certifications"), data: ragProfile?.certifications },
        };

        const sectionHashes = Object.values(sectionData).map(s => s.hash);
        const { data: l3Cache } = await supabase
            .from(CACHE_TABLE_L3)
            .select("*")
            .in("section_hash", sectionHashes)
            .eq("user_id", userId)
            .gt("expires_at", new Date().toISOString());

        const cachedSectionHashes = new Set((l3Cache || []).map((c: any) => c.section_hash));

        for (const section of sections) {
            const info = sectionData[section];
            if (cachedSectionHashes.has(info.hash)) {
                const cached = (l3Cache || []).find((c: any) => c.section_hash === info.hash);
                if (cached?.widgets) {
                    reusedWidgets.push(...cached.widgets);
                    stats.level3Hits = (stats.level3Hits || 0) + 1;
                }
            } else {
                needsGeneration.sections.push(section);
            }
        }
    } catch (e) {
        // Erreur L3, marquer toutes les sections à générer
        needsGeneration.sections = sections;
    }

    // ========================================================================
    // RÉSULTAT
    // ========================================================================
    const isPartialHit = reusedWidgets.length > 0;
    if (isPartialHit) {
        stats.partialHits = 1;
    }

    stats.savedTimeMs = Date.now() - startTime;

    logger.info("[smart-cache] Résultat cache", {
        l1Hits: stats.level1Hits,
        l2Hits: stats.level2Hits,
        l3Hits: stats.level3Hits,
        reusedCount: reusedWidgets.length,
        needsExperiences: needsGeneration.experiences.length,
        needsSections: needsGeneration.sections.length,
    });

    return {
        widgets: reusedWidgets,
        fromCache: isPartialHit,
        cacheLevel: isPartialHit ? 2 : null,
        needsGeneration,
        reusedWidgets,
        stats,
    };
}

/**
 * Sauvegarde les widgets dans le cache multi-niveau
 */
export async function saveToSmartCache(
    userId: string,
    ragProfile: any,
    jobDescription: string,
    matchAnalysis: any,
    envelope: AIWidgetsEnvelope
): Promise<void> {
    const supabase = createSupabaseAdminClient();
    const now = new Date();

    // ========================================================================
    // NIVEAU 1: Cache complet
    // ========================================================================
    const fullHash = hashFullContext(ragProfile, jobDescription, matchAnalysis);
    const expiresL1 = new Date(now.getTime() + CACHE_TTL_L1_HOURS * 60 * 60 * 1000);

    try {
        await supabase.from(CACHE_TABLE_L1).upsert({
            cache_key: fullHash,
            widgets: envelope,
            metadata: {
                userId,
                generatedAt: now.toISOString(),
                widgetsCount: envelope.widgets.length,
            },
            created_at: now.toISOString(),
            expires_at: expiresL1.toISOString(),
        }, { onConflict: "cache_key" });
    } catch (e) {
        logger.warn("[smart-cache] Erreur sauvegarde L1", { error: e });
    }

    // ========================================================================
    // NIVEAU 2: Cache par expérience
    // ========================================================================
    const experiences = ragProfile?.experiences || [];
    const expiresL2 = new Date(now.getTime() + CACHE_TTL_L2_HOURS * 60 * 60 * 1000);

    for (let i = 0; i < experiences.length; i++) {
        const expId = `exp_${i}`;
        const expHash = hashExperience(experiences[i]);
        const expWidgets = envelope.widgets.filter(
            w => w.section === "experiences" && w.sources?.rag_experience_id === expId
        );

        if (expWidgets.length > 0) {
            try {
                await supabase.from(CACHE_TABLE_L2).upsert({
                    user_id: userId,
                    experience_hash: expHash,
                    rag_experience_id: expId,
                    widgets: expWidgets,
                    created_at: now.toISOString(),
                    expires_at: expiresL2.toISOString(),
                }, { onConflict: "user_id,experience_hash" });
            } catch (e) {
                // Continuer si erreur
            }
        }
    }

    // ========================================================================
    // NIVEAU 3: Cache sections génériques
    // ========================================================================
    const expiresL3 = new Date(now.getTime() + CACHE_TTL_L3_HOURS * 60 * 60 * 1000);

    const sectionConfigs = [
        { section: "skills", data: ragProfile?.competences },
        { section: "education", data: ragProfile?.formations },
        { section: "languages", data: ragProfile?.langues },
        { section: "certifications", data: ragProfile?.certifications },
    ];

    for (const config of sectionConfigs) {
        const sectionHash = hashSection(config.data, config.section);
        const sectionWidgets = envelope.widgets.filter(w => w.section === config.section);

        if (sectionWidgets.length > 0) {
            try {
                await supabase.from(CACHE_TABLE_L3).upsert({
                    user_id: userId,
                    section_hash: sectionHash,
                    section: config.section,
                    widgets: sectionWidgets,
                    created_at: now.toISOString(),
                    expires_at: expiresL3.toISOString(),
                }, { onConflict: "user_id,section_hash" });
            } catch (e) {
                // Continuer si erreur
            }
        }
    }

    logger.info("[smart-cache] Widgets sauvegardés dans cache multi-niveau", {
        l1Hash: fullHash,
        experiencesCount: experiences.length,
        sectionsCount: sectionConfigs.length,
    });
}

/**
 * Invalide le cache pour un utilisateur (après modification RAG)
 */
export async function invalidateUserCache(userId: string): Promise<void> {
    const supabase = createSupabaseAdminClient();

    try {
        await Promise.all([
            supabase.from(CACHE_TABLE_L2).delete().eq("user_id", userId),
            supabase.from(CACHE_TABLE_L3).delete().eq("user_id", userId),
        ]);
        logger.info("[smart-cache] Cache utilisateur invalidé", { userId });
    } catch (e) {
        logger.error("[smart-cache] Erreur invalidation cache", { error: e, userId });
    }
}

/**
 * Nettoie les entrées expirées du cache
 */
export async function cleanupExpiredCache(): Promise<{ deleted: number }> {
    const supabase = createSupabaseAdminClient();
    const now = new Date().toISOString();
    let totalDeleted = 0;

    try {
        const results = await Promise.all([
            supabase.from(CACHE_TABLE_L1).delete().lt("expires_at", now).select("count"),
            supabase.from(CACHE_TABLE_L2).delete().lt("expires_at", now).select("count"),
            supabase.from(CACHE_TABLE_L3).delete().lt("expires_at", now).select("count"),
        ]);

        totalDeleted = results.reduce((sum, r) => sum + ((r.data as any)?.length || 0), 0);
    } catch (e) {
        logger.error("[smart-cache] Erreur cleanup", { error: e });
    }

    return { deleted: totalDeleted };
}

/**
 * Obtient les statistiques du cache
 */
export async function getCacheStats(userId?: string): Promise<{
    l1Count: number;
    l2Count: number;
    l3Count: number;
    totalWidgets: number;
}> {
    const supabase = createSupabaseAdminClient();

    const queries = [
        supabase.from(CACHE_TABLE_L1).select("id", { count: "exact", head: true }),
        supabase.from(CACHE_TABLE_L2).select("id", { count: "exact", head: true }).eq("user_id", userId || ""),
        supabase.from(CACHE_TABLE_L3).select("id", { count: "exact", head: true }).eq("user_id", userId || ""),
    ];

    if (!userId) {
        queries[1] = supabase.from(CACHE_TABLE_L2).select("id", { count: "exact", head: true });
        queries[2] = supabase.from(CACHE_TABLE_L3).select("id", { count: "exact", head: true });
    }

    try {
        const [l1, l2, l3] = await Promise.all(queries);
        return {
            l1Count: l1.count || 0,
            l2Count: l2.count || 0,
            l3Count: l3.count || 0,
            totalWidgets: 0, // À calculer si nécessaire
        };
    } catch (e) {
        return { l1Count: 0, l2Count: 0, l3Count: 0, totalWidgets: 0 };
    }
}
