import { NextResponse } from "next/server";
import { createSupabaseUserClient, requireSupabaseUser } from "@/lib/supabase";
import { logger } from "@/lib/utils/logger";

export const runtime = "nodejs";

/**
 * Update an item in the user's RAG profile
 * 
 * Body: {
 *   userId: string,
 *   type: "profil" | "certification" | "formation" | "langue" | "realisation" | "experience",
 *   index?: number,           // for array items
 *   experienceIndex?: number, // required for realisation
 *   key?: string,             // for langue (key name)
 *   data: object              // the new values to merge/replace
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

        const { type, index, experienceIndex, key, data } = await req.json();

        if (!type || !data) {
            return NextResponse.json({ error: "Missing type or data" }, { status: 400 });
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

        switch (type) {
            case "profil":
                // Merge new data into profil
                ragData.profil = { ...ragData.profil, ...data };
                break;

            case "certification":
                if (!ragData.certifications) ragData.certifications = [];
                if (index !== undefined && index < ragData.certifications.length) {
                    // Update existing
                    ragData.certifications[index] = typeof ragData.certifications[index] === 'string'
                        ? data.nom || data
                        : { ...ragData.certifications[index], ...data };
                } else {
                    // Add new
                    ragData.certifications.push(typeof data === 'string' ? data : data.nom || data);
                }
                break;

            case "formation":
                if (!ragData.formations) ragData.formations = [];
                if (index !== undefined && index < ragData.formations.length) {
                    ragData.formations[index] = { ...ragData.formations[index], ...data };
                } else {
                    ragData.formations.push(data);
                }
                break;

            case "langue":
                if (!ragData.langues) ragData.langues = {};
                if (key) {
                    // Update or add langue
                    ragData.langues[data.nom || key] = data.niveau || data;
                    // If renamed, delete old key
                    if (data.nom && data.nom !== key) {
                        delete ragData.langues[key];
                    }
                } else if (data.nom) {
                    ragData.langues[data.nom] = data.niveau;
                }
                break;

            case "realisation":
                if (experienceIndex === undefined || !ragData.experiences?.[experienceIndex]) {
                    return NextResponse.json({ error: "Experience not found" }, { status: 404 });
                }
                if (!ragData.experiences[experienceIndex].realisations) {
                    ragData.experiences[experienceIndex].realisations = [];
                }
                if (index !== undefined && index < ragData.experiences[experienceIndex].realisations.length) {
                    ragData.experiences[experienceIndex].realisations[index] = {
                        ...ragData.experiences[experienceIndex].realisations[index],
                        ...data
                    };
                } else {
                    ragData.experiences[experienceIndex].realisations.push(data);
                }
                break;

            case "experience":
                if (!ragData.experiences) ragData.experiences = [];
                if (index !== undefined && index < ragData.experiences.length) {
                    ragData.experiences[index] = { ...ragData.experiences[index], ...data };
                } else {
                    ragData.experiences.push(data);
                }
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
            type,
            message: `${type} mis à jour avec succès`
        });

    } catch (error: any) {
        logger.error("Update item error", { error: error?.message });
        return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
    }
}
