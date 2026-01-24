import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient, requireSupabaseUser } from "@/lib/supabase";
import { enqueueCVGeneration } from "@/lib/queue/cv-generation-queue";
import { logger } from "@/lib/utils/logger";

export const runtime = "nodejs";

/**
 * POST /api/cv/generate-async
 * Enqueue une génération CV asynchrone
 * Retourne immédiatement avec jobId pour tracking
 */
export async function POST(request: NextRequest) {
    try {
        const auth = await requireSupabaseUser(request);
        if (auth.error || !auth.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const body = await request.json();
        const { analysisId, jobId, template, options } = body;

        if (!analysisId) {
            return NextResponse.json(
                { error: "analysisId requis" },
                { status: 400 }
            );
        }

        // Enqueue le job
        const { jobId: enqueuedJobId } = await enqueueCVGeneration({
            userId: auth.user.id,
            analysisId,
            jobId,
            template,
            options,
        });

        logger.info("CV generation enqueued", {
            userId: auth.user.id,
            analysisId,
            jobId: enqueuedJobId,
        });

        return NextResponse.json({
            success: true,
            jobId: enqueuedJobId,
            message: "Génération CV en cours de traitement",
        });
    } catch (error: any) {
        logger.error("Error enqueueing CV generation", { error });
        return NextResponse.json(
            { error: error.message || "Erreur serveur" },
            { status: 500 }
        );
    }
}
