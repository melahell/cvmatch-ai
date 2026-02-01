/**
 * API Route: POST /api/rag/versions/restore
 * 
 * [CDC Sprint 1.3] Restaure une version antérieure du RAG
 * 
 * Body:
 * - versionId: string (UUID de la version à restaurer)
 */

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseUserClient, requireSupabaseUser } from "@/lib/supabase";
import { restoreRAGVersion, getRAGVersion } from "@/lib/rag/versioning";
import { logger } from "@/lib/utils/logger";
import { z } from "zod";

export const dynamic = "force-dynamic";

const restoreSchema = z.object({
    versionId: z.string().uuid("versionId doit être un UUID valide"),
});

export async function POST(request: NextRequest) {
    try {
        // Auth
        const auth = await requireSupabaseUser(request);
        if (auth.error || !auth.user || !auth.token) {
            return NextResponse.json(
                { error: "Non autorisé" },
                { status: 401 }
            );
        }

        // Parse body
        const body = await request.json();
        const validation = restoreSchema.safeParse(body);
        
        if (!validation.success) {
            return NextResponse.json(
                { 
                    error: "Données invalides",
                    details: validation.error.issues,
                },
                { status: 400 }
            );
        }

        const { versionId } = validation.data;
        const supabase = createSupabaseUserClient(auth.token);

        // Vérifier que la version existe et appartient à l'utilisateur
        const version = await getRAGVersion(supabase, auth.user.id, versionId);
        
        if (!version) {
            return NextResponse.json(
                { error: "Version non trouvée" },
                { status: 404 }
            );
        }

        // Restaurer la version
        const result = await restoreRAGVersion(supabase, auth.user.id, versionId);

        logger.info("RAG version restored", {
            userId: auth.user.id,
            restoredVersion: result.restoredVersion,
            newVersion: result.newVersion,
        });

        return NextResponse.json({
            success: true,
            message: `Version ${result.restoredVersion} restaurée avec succès`,
            restoredVersion: result.restoredVersion,
            newVersionCreated: result.newVersion !== result.restoredVersion,
            newVersion: result.newVersion,
        });

    } catch (error) {
        logger.error("Error restoring RAG version", { error });
        return NextResponse.json(
            { 
                error: "Erreur lors de la restauration",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
