/**
 * RAG Versioning Service
 * 
 * [CDC Sprint 1.3] Versioning du profil RAG
 * 
 * Permet de :
 * - Sauvegarder automatiquement les versions avant modification
 * - Lister les versions disponibles
 * - Restaurer une version antérieure
 * - Calculer les différences entre versions
 */

import { SupabaseClient } from "@supabase/supabase-js";

// ============================================================================
// TYPES
// ============================================================================

export interface RAGVersion {
    id: string;
    user_id: string;
    version_number: number;
    rag_data: Record<string, unknown>;
    diff_from_previous: Record<string, unknown> | null;
    created_at: string;
    created_reason: RAGVersionReason;
}

export type RAGVersionReason = 
    | "manual"        // Sauvegarde manuelle par l'utilisateur
    | "merge"         // Après un merge de données
    | "regeneration"  // Après régénération complète
    | "import";       // Après import de fichier

export interface SaveVersionOptions {
    /** Raison de la sauvegarde */
    reason: RAGVersionReason;
    /** Calculer et stocker le diff avec la version précédente */
    includeDiff?: boolean;
}

export interface VersionListOptions {
    /** Nombre max de versions à retourner */
    limit?: number;
    /** Offset pour pagination */
    offset?: number;
}

// ============================================================================
// DIFF CALCULATION
// ============================================================================

/**
 * Calcule les différences entre deux versions RAG
 * Retourne un objet avec les champs ajoutés, modifiés et supprimés
 */
export function calculateRAGDiff(
    oldData: Record<string, unknown>,
    newData: Record<string, unknown>
): Record<string, unknown> {
    const diff: Record<string, unknown> = {
        added: {} as Record<string, unknown>,
        modified: {} as Record<string, unknown>,
        removed: {} as Record<string, unknown>,
        summary: {
            addedCount: 0,
            modifiedCount: 0,
            removedCount: 0,
        },
    };

    const added = diff.added as Record<string, unknown>;
    const modified = diff.modified as Record<string, unknown>;
    const removed = diff.removed as Record<string, unknown>;
    const summary = diff.summary as { addedCount: number; modifiedCount: number; removedCount: number };

    // Champs ajoutés ou modifiés
    for (const key of Object.keys(newData)) {
        if (!(key in oldData)) {
            added[key] = newData[key];
            summary.addedCount++;
        } else if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
            modified[key] = {
                old: oldData[key],
                new: newData[key],
            };
            summary.modifiedCount++;
        }
    }

    // Champs supprimés
    for (const key of Object.keys(oldData)) {
        if (!(key in newData)) {
            removed[key] = oldData[key];
            summary.removedCount++;
        }
    }

    return diff;
}

/**
 * Calcule un résumé des différences de manière lisible
 */
export function summarizeRAGDiff(diff: Record<string, unknown>): string {
    const summary = diff.summary as { addedCount: number; modifiedCount: number; removedCount: number };
    const parts: string[] = [];

    if (summary.addedCount > 0) {
        parts.push(`${summary.addedCount} champ(s) ajouté(s)`);
    }
    if (summary.modifiedCount > 0) {
        parts.push(`${summary.modifiedCount} champ(s) modifié(s)`);
    }
    if (summary.removedCount > 0) {
        parts.push(`${summary.removedCount} champ(s) supprimé(s)`);
    }

    return parts.length > 0 ? parts.join(", ") : "Aucune modification";
}

// ============================================================================
// VERSION MANAGEMENT
// ============================================================================

/**
 * Sauvegarde une nouvelle version du RAG
 * 
 * @example
 * ```typescript
 * const version = await saveRAGVersion(supabase, userId, ragData, {
 *     reason: 'regeneration',
 *     includeDiff: true
 * });
 * ```
 */
export async function saveRAGVersion(
    supabase: SupabaseClient,
    userId: string,
    ragData: Record<string, unknown>,
    options: SaveVersionOptions
): Promise<RAGVersion> {
    const { reason, includeDiff = true } = options;

    // Obtenir le prochain numéro de version
    const { data: versionData, error: versionError } = await supabase
        .rpc("get_next_rag_version", { p_user_id: userId });

    if (versionError) {
        // Fallback si la fonction RPC n'existe pas
        const { data: maxVersion } = await supabase
            .from("rag_versions")
            .select("version_number")
            .eq("user_id", userId)
            .order("version_number", { ascending: false })
            .limit(1)
            .single();

        const nextVersion = (maxVersion?.version_number ?? 0) + 1;
        return saveVersionWithNumber(supabase, userId, ragData, nextVersion, reason, includeDiff);
    }

    const nextVersion = versionData ?? 1;
    return saveVersionWithNumber(supabase, userId, ragData, nextVersion, reason, includeDiff);
}

/**
 * Sauvegarde interne avec numéro de version
 */
async function saveVersionWithNumber(
    supabase: SupabaseClient,
    userId: string,
    ragData: Record<string, unknown>,
    versionNumber: number,
    reason: RAGVersionReason,
    includeDiff: boolean
): Promise<RAGVersion> {
    let diffFromPrevious: Record<string, unknown> | null = null;

    // Calculer le diff si demandé et si version précédente existe
    if (includeDiff && versionNumber > 1) {
        const { data: previousVersion } = await supabase
            .from("rag_versions")
            .select("rag_data")
            .eq("user_id", userId)
            .eq("version_number", versionNumber - 1)
            .single();

        if (previousVersion?.rag_data) {
            diffFromPrevious = calculateRAGDiff(
                previousVersion.rag_data as Record<string, unknown>,
                ragData
            );
        }
    }

    // Insérer la nouvelle version
    const { data, error } = await supabase
        .from("rag_versions")
        .insert({
            user_id: userId,
            version_number: versionNumber,
            rag_data: ragData,
            diff_from_previous: diffFromPrevious,
            created_reason: reason,
        })
        .select()
        .single();

    if (error) {
        throw new Error(`Erreur sauvegarde version RAG: ${error.message}`);
    }

    return data as RAGVersion;
}

/**
 * Liste les versions RAG d'un utilisateur
 * 
 * @example
 * ```typescript
 * const versions = await listRAGVersions(supabase, userId, { limit: 10 });
 * ```
 */
export async function listRAGVersions(
    supabase: SupabaseClient,
    userId: string,
    options: VersionListOptions = {}
): Promise<RAGVersion[]> {
    const { limit = 10, offset = 0 } = options;

    const { data, error } = await supabase
        .from("rag_versions")
        .select("id, user_id, version_number, created_at, created_reason, diff_from_previous")
        .eq("user_id", userId)
        .order("version_number", { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        throw new Error(`Erreur liste versions RAG: ${error.message}`);
    }

    return (data || []) as RAGVersion[];
}

/**
 * Récupère une version spécifique avec ses données complètes
 */
export async function getRAGVersion(
    supabase: SupabaseClient,
    userId: string,
    versionId: string
): Promise<RAGVersion | null> {
    const { data, error } = await supabase
        .from("rag_versions")
        .select("*")
        .eq("id", versionId)
        .eq("user_id", userId)
        .single();

    if (error) {
        if (error.code === "PGRST116") {
            return null; // Not found
        }
        throw new Error(`Erreur récupération version RAG: ${error.message}`);
    }

    return data as RAGVersion;
}

/**
 * Récupère la version la plus récente
 */
export async function getLatestRAGVersion(
    supabase: SupabaseClient,
    userId: string
): Promise<RAGVersion | null> {
    const { data, error } = await supabase
        .from("rag_versions")
        .select("*")
        .eq("user_id", userId)
        .order("version_number", { ascending: false })
        .limit(1)
        .single();

    if (error) {
        if (error.code === "PGRST116") {
            return null; // No versions yet
        }
        throw new Error(`Erreur récupération dernière version RAG: ${error.message}`);
    }

    return data as RAGVersion;
}

/**
 * Restaure une version antérieure du RAG
 * 
 * Cette fonction :
 * 1. Sauvegarde l'état actuel comme nouvelle version
 * 2. Remplace les données RAG par la version demandée
 * 
 * @example
 * ```typescript
 * await restoreRAGVersion(supabase, userId, versionId);
 * ```
 */
export async function restoreRAGVersion(
    supabase: SupabaseClient,
    userId: string,
    versionId: string
): Promise<{ success: boolean; restoredVersion: number; newVersion: number }> {
    // 1. Récupérer la version à restaurer
    const versionToRestore = await getRAGVersion(supabase, userId, versionId);
    
    if (!versionToRestore) {
        throw new Error("Version non trouvée");
    }

    // 2. Récupérer le RAG actuel pour le sauvegarder
    const { data: currentProfile, error: profileError } = await supabase
        .from("profiles")
        .select("rag_data")
        .eq("id", userId)
        .single();

    if (profileError) {
        throw new Error(`Erreur récupération profil: ${profileError.message}`);
    }

    // 3. Sauvegarder l'état actuel comme nouvelle version (si différent)
    const currentRAG = currentProfile?.rag_data as Record<string, unknown> | null;
    let newVersionNumber = versionToRestore.version_number;

    if (currentRAG && JSON.stringify(currentRAG) !== JSON.stringify(versionToRestore.rag_data)) {
        const savedVersion = await saveRAGVersion(supabase, userId, currentRAG, {
            reason: "manual",
            includeDiff: true,
        });
        newVersionNumber = savedVersion.version_number;
    }

    // 4. Restaurer les données RAG
    const { error: updateError } = await supabase
        .from("profiles")
        .update({ rag_data: versionToRestore.rag_data })
        .eq("id", userId);

    if (updateError) {
        throw new Error(`Erreur restauration RAG: ${updateError.message}`);
    }

    return {
        success: true,
        restoredVersion: versionToRestore.version_number,
        newVersion: newVersionNumber,
    };
}

/**
 * Compte le nombre de versions d'un utilisateur
 */
export async function countRAGVersions(
    supabase: SupabaseClient,
    userId: string
): Promise<number> {
    const { count, error } = await supabase
        .from("rag_versions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

    if (error) {
        throw new Error(`Erreur comptage versions RAG: ${error.message}`);
    }

    return count ?? 0;
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
    calculateRAGDiff as diffRAGVersions,
};
