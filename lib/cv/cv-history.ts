/**
 * CV Versioning System
 * Gestion de l'historique des versions de CV avec rollback
 */

import { createSupabaseAdminClient, createSupabaseUserClient } from "@/lib/supabase";
import { logger } from "@/lib/utils/logger";

export interface CVVersion {
    id: string;
    cv_id: string;
    version_number: number;
    cv_data: any;
    metadata: {
        created_at: string;
        created_by: string;
        change_description?: string;
        is_current?: boolean;
    };
}

/**
 * Sauvegarde une nouvelle version du CV
 */
export async function saveCVVersion(
    cvId: string,
    cvData: any,
    userId: string,
    description?: string
): Promise<CVVersion> {
    try {
        const supabase = createSupabaseAdminClient();

        // Récupérer le dernier numéro de version
        const { data: lastVersion } = await supabase
            .from("cv_versions")
            .select("version_number")
            .eq("cv_id", cvId)
            .order("version_number", { ascending: false })
            .limit(1)
            .single();

        const nextVersionNumber = lastVersion?.version_number ? lastVersion.version_number + 1 : 1;

        // Nettoyer anciennes versions (garder max 10)
        await deleteOldVersions(cvId, 10);

        // Créer nouvelle version
        const { data: version, error } = await supabase
            .from("cv_versions")
            .insert({
                cv_id: cvId,
                version_number: nextVersionNumber,
                cv_data: cvData,
                metadata: {
                    created_at: new Date().toISOString(),
                    created_by: userId,
                    change_description: description || "Auto-save",
                    is_current: true,
                },
                created_by: userId,
            })
            .select()
            .single();

        if (error) {
            logger.error("Error saving CV version", { error, cvId });
            throw error;
        }

        // Marquer toutes les autres versions comme non-courantes
        await supabase
            .from("cv_versions")
            .update({ metadata: { is_current: false } })
            .eq("cv_id", cvId)
            .neq("version_number", nextVersionNumber);

        logger.info("CV version saved", {
            cvId,
            versionNumber: nextVersionNumber,
            description,
        });

        return {
            id: version.id,
            cv_id: version.cv_id,
            version_number: version.version_number,
            cv_data: version.cv_data,
            metadata: version.metadata || {},
        };
    } catch (error) {
        logger.error("Failed to save CV version", { error, cvId });
        throw error;
    }
}

/**
 * Récupère toutes les versions d'un CV
 */
export async function getCVVersions(cvId: string): Promise<CVVersion[]> {
    try {
        const supabase = createSupabaseAdminClient();

        const { data: versions, error } = await supabase
            .from("cv_versions")
            .select("*")
            .eq("cv_id", cvId)
            .order("version_number", { ascending: false });

        if (error) {
            logger.error("Error fetching CV versions", { error, cvId });
            throw error;
        }

        return (
            versions?.map((v) => ({
                id: v.id,
                cv_id: v.cv_id,
                version_number: v.version_number,
                cv_data: v.cv_data,
                metadata: v.metadata || {},
            })) || []
        );
    } catch (error) {
        logger.error("Failed to get CV versions", { error, cvId });
        return [];
    }
}

/**
 * Récupère une version spécifique
 */
export async function getCVVersion(
    cvId: string,
    versionNumber: number
): Promise<CVVersion | null> {
    try {
        const supabase = createSupabaseAdminClient();

        const { data: version, error } = await supabase
            .from("cv_versions")
            .select("*")
            .eq("cv_id", cvId)
            .eq("version_number", versionNumber)
            .single();

        if (error || !version) {
            logger.error("Error fetching CV version", { error, cvId, versionNumber });
            return null;
        }

        return {
            id: version.id,
            cv_id: version.cv_id,
            version_number: version.version_number,
            cv_data: version.cv_data,
            metadata: version.metadata || {},
        };
    } catch (error) {
        logger.error("Failed to get CV version", { error, cvId, versionNumber });
        return null;
    }
}

/**
 * Rollback à une version précédente
 */
export async function rollbackToVersion(
    cvId: string,
    versionNumber: number,
    userId: string
): Promise<void> {
    try {
        const supabase = createSupabaseAdminClient();

        // Récupérer la version cible
        const version = await getCVVersion(cvId, versionNumber);
        if (!version) {
            throw new Error(`Version ${versionNumber} not found for CV ${cvId}`);
        }

        // Restaurer dans cv_generations
        const { error: updateError } = await supabase
            .from("cv_generations")
            .update({ cv_data: version.cv_data })
            .eq("id", cvId);

        if (updateError) {
            logger.error("Error rolling back CV", { error: updateError, cvId });
            throw updateError;
        }

        // Créer nouvelle version avec le rollback (pour traçabilité)
        await saveCVVersion(
            cvId,
            version.cv_data,
            userId,
            `Rollback to version ${versionNumber}`
        );

        logger.info("CV rolled back", { cvId, versionNumber });
    } catch (error) {
        logger.error("Failed to rollback CV", { error, cvId, versionNumber });
        throw error;
    }
}

/**
 * Supprime les anciennes versions (garde les N plus récentes)
 */
export async function deleteOldVersions(
    cvId: string,
    keepLast: number = 10
): Promise<void> {
    try {
        const supabase = createSupabaseAdminClient();

        // Récupérer toutes les versions
        const versions = await getCVVersions(cvId);

        if (versions.length <= keepLast) {
            return; // Pas besoin de supprimer
        }

        // Garder les N plus récentes, supprimer les autres
        const versionsToDelete = versions.slice(keepLast);

        const versionNumbersToDelete = versionsToDelete.map((v) => v.version_number);

        const { error } = await supabase
            .from("cv_versions")
            .delete()
            .eq("cv_id", cvId)
            .in("version_number", versionNumbersToDelete);

        if (error) {
            logger.error("Error deleting old CV versions", { error, cvId });
            throw error;
        }

        logger.info("Old CV versions deleted", {
            cvId,
            deleted: versionsToDelete.length,
            kept: keepLast,
        });
    } catch (error) {
        logger.error("Failed to delete old CV versions", { error, cvId });
        // Non-blocking, continue même en cas d'erreur
    }
}
