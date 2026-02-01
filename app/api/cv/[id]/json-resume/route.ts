/**
 * API Endpoint: Export CV en format JSON Resume
 * 
 * [CDC Phase 4] Interopérabilité avec l'écosystème JSON Resume
 * 
 * GET /api/cv/[id]/json-resume
 * 
 * Query params:
 * - photo: boolean (default: true) - Inclure la photo
 * - references: boolean (default: true) - Inclure les références
 * - download: boolean (default: false) - Force téléchargement
 */

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseUserClient, requireSupabaseUser } from "@/lib/supabase";
import { convertToJSONResume, exportToJSONResumeString } from "@/lib/cv/json-resume-converter";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Authentification
        const auth = await requireSupabaseUser(request);
        if (auth.error || !auth.user || !auth.token) {
            return NextResponse.json(
                { error: "Non autorisé" },
                { status: 401 }
            );
        }

        const { id } = params;
        const { searchParams } = new URL(request.url);
        
        // Options depuis query params
        const includePhoto = searchParams.get("photo") !== "false";
        const includeReferences = searchParams.get("references") !== "false";
        const forceDownload = searchParams.get("download") === "true";

        // Récupérer le CV depuis la base
        const supabase = createSupabaseUserClient(auth.token);
        const { data: cvRecord, error: dbError } = await supabase
            .from("cv_generations")
            .select("cv_data, template_name, quality_score, job_offer_id, rag_id")
            .eq("id", id)
            .eq("user_id", auth.user.id)
            .single();

        if (dbError || !cvRecord?.cv_data) {
            logger.warn("CV not found for JSON Resume export", { 
                cvId: id, 
                userId: auth.user.id,
                error: dbError?.message 
            });
            return NextResponse.json(
                { error: "CV non trouvé" },
                { status: 404 }
            );
        }

        // Convertir en JSON Resume
        const jsonResumeString = exportToJSONResumeString(cvRecord.cv_data, {
            includePhoto,
            includeReferences,
            ragId: cvRecord.rag_id,
            jobOfferId: cvRecord.job_offer_id,
            qualityScore: cvRecord.quality_score,
            templateId: cvRecord.template_name,
        });

        logger.info("JSON Resume exported successfully", {
            cvId: id,
            userId: auth.user.id,
            includePhoto,
            includeReferences,
            sizeBytes: jsonResumeString.length,
        });

        // Nom du fichier
        const profil = cvRecord.cv_data?.profil || {};
        const fileName = profil.nom
            ? `resume_${profil.prenom || ""}_${profil.nom}.json`
            : `resume_${id}.json`;

        // Headers de réponse
        const headers: Record<string, string> = {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "private, max-age=0",
        };

        if (forceDownload) {
            headers["Content-Disposition"] = `attachment; filename="${fileName}"`;
        }

        return new NextResponse(jsonResumeString, { headers });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        logger.error("JSON Resume export error", { 
            error: message, 
            cvId: params?.id 
        });
        
        return NextResponse.json(
            { error: "Erreur lors de l'export JSON Resume", details: message },
            { status: 500 }
        );
    }
}
