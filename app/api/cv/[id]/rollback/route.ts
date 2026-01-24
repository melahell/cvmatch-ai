import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient, requireSupabaseUser } from "@/lib/supabase";
import { rollbackToVersion } from "@/lib/cv/cv-history";
import { logger } from "@/lib/utils/logger";

export const runtime = "nodejs";

/**
 * POST /api/cv/[id]/rollback
 * Rollback à une version précédente du CV
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
        const { version_number } = body;

        if (!version_number || typeof version_number !== "number") {
            return NextResponse.json(
                { error: "version_number requis (nombre)" },
                { status: 400 }
            );
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

        await rollbackToVersion(cvId, version_number, auth.user.id);

        return NextResponse.json({
            success: true,
            message: `CV restauré à la version ${version_number}`,
        });
    } catch (error: any) {
        logger.error("Error rolling back CV", { error });
        return NextResponse.json(
            { error: error.message || "Erreur serveur" },
            { status: 500 }
        );
    }
}
