import { NextResponse } from "next/server";
import { createSupabaseUserClient, requireSupabaseUser } from "@/lib/supabase";
import { logger } from "@/lib/utils/logger";

export const runtime = "nodejs";

/**
 * Delete an item from the user's RAG profile
 * 
 * Body: {
 *   userId: string,
 *   type: "certification" | "formation" | "langue" | "realisation" | "experience",
 *   index: number,           // for certifications, formations, experiences
 *   experienceIndex?: number // required for realisation (which experience)
 *   key?: string             // for langue (key name)
 * }
 */
export async function POST(req: Request) {
    try {
        const auth = await requireSupabaseUser(req);
        if (auth.error || !auth.user || !auth.token) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const supabase = createSupabaseUserClient(auth.token);
        const userId = auth.user.id;

        const { type, index, experienceIndex, key } = await req.json();

        if (!type) {
            return NextResponse.json({ error: "Missing type" }, { status: 400 });
        }

        // Fetch current RAG data
        const { data: ragRow, error: fetchError } = await supabase
            .from("rag_metadata")
            .select("completeness_details")
            .eq("user_id", userId)
            .single();

        if (fetchError || !ragRow?.completeness_details) {
            return NextResponse.json({ error: "RAG profile not found" }, { status: 404 });
        }

        const ragData = { ...ragRow.completeness_details };
        let deletedItem: any = null;

        switch (type) {
            case "certification":
                if (!ragData.certifications || index >= ragData.certifications.length) {
                    return NextResponse.json({ error: "Certification not found" }, { status: 404 });
                }
                deletedItem = ragData.certifications[index];
                ragData.certifications = ragData.certifications.filter((_: any, i: number) => i !== index);
                break;

            case "formation":
                if (!ragData.formations || index >= ragData.formations.length) {
                    return NextResponse.json({ error: "Formation not found" }, { status: 404 });
                }
                deletedItem = ragData.formations[index];
                ragData.formations = ragData.formations.filter((_: any, i: number) => i !== index);
                break;

            case "langue":
                if (!ragData.langues || !key || !(key in ragData.langues)) {
                    return NextResponse.json({ error: "Langue not found" }, { status: 404 });
                }
                deletedItem = { [key]: ragData.langues[key] };
                delete ragData.langues[key];
                break;

            case "realisation":
                if (
                    experienceIndex === undefined ||
                    !ragData.experiences ||
                    experienceIndex >= ragData.experiences.length ||
                    !ragData.experiences[experienceIndex].realisations ||
                    index >= ragData.experiences[experienceIndex].realisations.length
                ) {
                    return NextResponse.json({ error: "Realisation not found" }, { status: 404 });
                }
                deletedItem = ragData.experiences[experienceIndex].realisations[index];
                ragData.experiences[experienceIndex].realisations =
                    ragData.experiences[experienceIndex].realisations.filter((_: any, i: number) => i !== index);
                break;

            case "experience":
                if (!ragData.experiences || index >= ragData.experiences.length) {
                    return NextResponse.json({ error: "Experience not found" }, { status: 404 });
                }
                deletedItem = ragData.experiences[index];
                ragData.experiences = ragData.experiences.filter((_: any, i: number) => i !== index);
                break;

            default:
                return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 });
        }

        // Update RAG in database
        const { error: updateError } = await supabase
            .from("rag_metadata")
            .update({
                completeness_details: ragData,
                last_updated: new Date().toISOString()
            })
            .eq("user_id", userId);

        if (updateError) {
            logger.error("Failed to update RAG", { error: updateError.message, type });
            return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            deleted: deletedItem,
            type,
            message: `${type} supprimé avec succès`
        });

    } catch (error: any) {
        logger.error("Delete item error", { error: error?.message });
        return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
    }
}
