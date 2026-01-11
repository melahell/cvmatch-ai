import { createSupabaseUserClient, requireSupabaseUser } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { callWithRetry, generateWithCascade } from "@/lib/ai/gemini";
import { logger } from "@/lib/utils/logger";

export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        const auth = await requireSupabaseUser(req);
        if (auth.error || !auth.user || !auth.token) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const supabase = createSupabaseUserClient(auth.token);
        const userId = auth.user.id;

        const { analysisId, tone = "professional" } = await req.json();

        // 1. Fetch Data
        const { data: analysis } = await supabase
            .from("job_analyses")
            .select("job_description, company, job_title")
            .eq("id", analysisId)
            .eq("user_id", userId)
            .single();
        const { data: rag } = await supabase.from("rag_metadata").select("completeness_details").eq("user_id", userId).single();

        if (!analysis || !rag) return NextResponse.json({ error: "Data not found" }, { status: 404 });

        // 2. Prompt Gemini
        const prompt = `
            Tu es un expert en recrutement. Rédige une Lettre de Motivation (en Français) pour ce candidat.
            
            CANDIDAT:
            ${JSON.stringify(rag.completeness_details.profil)}
            Expériences clés: ${JSON.stringify(rag.completeness_details.experiences.slice(0, 2))}

            OFFRE:
            Poste: ${analysis.job_title}
            Entreprise: ${analysis.company}
            Description: ${analysis.job_description.substring(0, 1000)}...

            TON: ${tone} (Si "professional": formel, poli. Si "casual": moderne, direct).
            STRUCTURE: 
            - Accroche (Pourquoi cette entreprise ?)
            - Pourquoi moi (Match compétences)
            - Call to Action (Entretien)
            
            FORMAT: Retourne le texte de la lettre directement, avec des sauts de ligne, sans Markdown complexe (juste texte).
        `;

        const { result, modelUsed } = await callWithRetry(() => generateWithCascade(prompt));
        const letter = result.response.text();

        // 3. Save to Match Report (JSON Storage)
        // We store the cover letter inside the match_report JSONB to allow flexibility without schema migration.
        const { data: currentAnalysis } = await supabase
            .from("job_analyses")
            .select("match_report")
            .eq("id", analysisId)
            .eq("user_id", userId)
            .single();
        const updatedReport = { ...currentAnalysis?.match_report, cover_letter: letter };

        const { error: updateError } = await supabase
            .from("job_analyses")
            .update({
                lm_generated: true,
                match_report: updatedReport
            })
            .eq("id", analysisId)
            .eq("user_id", userId);

        if (updateError) {
            logger.error("LM update error", { error: updateError.message, analysisId });
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        logger.info("LM generated", { modelUsed });
        return NextResponse.json({ success: true, letter, model_used: modelUsed });

    } catch (error: any) {
        logger.error("LM generate error", { error: error?.message });
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
