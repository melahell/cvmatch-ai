import { NextRequest, NextResponse } from "next/server";
import { requireSupabaseUser } from "@/lib/supabase";
import { getJobStatus } from "@/lib/queue/cv-generation-queue";
import { logger } from "@/lib/utils/logger";

export const runtime = "nodejs";

/**
 * GET /api/cv/generate/[jobId]/status
 * Récupère le statut d'un job de génération CV
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { jobId: string } }
) {
    try {
        const auth = await requireSupabaseUser(request);
        if (auth.error || !auth.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const jobId = params.jobId;
        if (!jobId) {
            return NextResponse.json({ error: "jobId requis" }, { status: 400 });
        }

        const status = await getJobStatus(jobId);

        return NextResponse.json({
            jobId,
            ...status,
        });
    } catch (error: any) {
        logger.error("Error getting job status", { error });
        return NextResponse.json(
            { error: error.message || "Erreur serveur" },
            { status: 500 }
        );
    }
}
