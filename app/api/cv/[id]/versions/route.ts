import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient, requireSupabaseUser } from "@/lib/supabase";
import {
    saveCVVersion,
    getCVVersions,
    getCVVersion,
    rollbackToVersion,
} from "@/lib/cv/cv-history";
import { logger } from "@/lib/utils/logger";

export const runtime = "nodejs";

/**
 * GET /api/cv/[id]/versions
 * Liste toutes les versions d'un CV
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const auth = await requireSupabaseUser(request);
        if (auth.error || !auth.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const cvId = params.id;
        if (!cvId) {
            return NextResponse.json({ error: "CV ID requis" }, { status: 400 });
        }

        // Vérifier que l'utilisateur possède ce CV
        const supabase = createSupabaseAdminClient();
        const { data: cv, error: cvError } = await supabase
            .from("cv_generations")
            .select("id, user_id")
            .eq("id", cvId)
            .eq("user_id", auth.user.id)
            .single();

        if (cvError || !cv) {
            return NextResponse.json({ error: "CV non trouvé" }, { status: 404 });
        }

        const versions = await getCVVersions(cvId);

        return NextResponse.json({ versions });
    } catch (error: any) {
        logger.error("Error fetching CV versions", { error });
        return NextResponse.json(
            { error: error.message || "Erreur serveur" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/cv/[id]/versions
 * Crée une nouvelle version du CV
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const auth = await requireSupabaseUser(request);
        if (auth.error || !auth.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const cvId = params.id;
        if (!cvId) {
            return NextResponse.json({ error: "CV ID requis" }, { status: 400 });
        }

        const body = await request.json();
        const { cv_data, description } = body;

        if (!cv_data) {
            return NextResponse.json({ error: "cv_data requis" }, { status: 400 });
        }

        // Vérifier que l'utilisateur possède ce CV
        const supabase = createSupabaseAdminClient();
        const { data: cv, error: cvError } = await supabase
            .from("cv_generations")
            .select("id, user_id")
            .eq("id", cvId)
            .eq("user_id", auth.user.id)
            .single();

        if (cvError || !cv) {
            return NextResponse.json({ error: "CV non trouvé" }, { status: 404 });
        }

        const version = await saveCVVersion(cvId, cv_data, auth.user.id, description);

        return NextResponse.json({ version });
    } catch (error: any) {
        logger.error("Error creating CV version", { error });
        return NextResponse.json(
            { error: error.message || "Erreur serveur" },
            { status: 500 }
        );
    }
}
