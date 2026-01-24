import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient, requireSupabaseUser } from "@/lib/supabase";
import { getCVVersion } from "@/lib/cv/cv-history";
import { logger } from "@/lib/utils/logger";

export const runtime = "nodejs";

/**
 * GET /api/cv/[id]/versions/[version]
 * Récupère une version spécifique d'un CV
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string; version: string } }
) {
    try {
        const auth = await requireSupabaseUser(request);
        if (auth.error || !auth.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const cvId = params.id;
        const versionNumber = parseInt(params.version, 10);

        if (!cvId || isNaN(versionNumber)) {
            return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
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

        const version = await getCVVersion(cvId, versionNumber);

        if (!version) {
            return NextResponse.json(
                { error: `Version ${versionNumber} non trouvée` },
                { status: 404 }
            );
        }

        return NextResponse.json({ version });
    } catch (error: any) {
        logger.error("Error fetching CV version", { error });
        return NextResponse.json(
            { error: error.message || "Erreur serveur" },
            { status: 500 }
        );
    }
}
