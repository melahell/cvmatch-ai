
import { createSupabaseClient } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { GEMINI_MODELS, generateWithGemini } from "@/lib/ai/gemini";
import { checkGeminiConsent, logGeminiUsage } from "@/lib/gemini-consent";

export const runtime = "nodejs";

export async function POST(req: Request) {
    const supabase = createSupabaseClient();
    try {
        const { userId, analysisId, tone = "professional" } = await req.json();

        if (!userId || !analysisId) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // Check GDPR consent for Gemini usage
        const consentCheck = await checkGeminiConsent(userId);
        if (!consentCheck.hasConsent) {
            return NextResponse.json(
                { error: "gemini_consent_required", message: consentCheck.message },
                { status: 403 }
            );
        }

        // 1. Fetch Data
        const { data: analysis } = await supabase.from("job_analyses").select("job_description, company, job_title").eq("id", analysisId).single();
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

        const letter = await generateWithGemini({
            prompt,
            model: GEMINI_MODELS.fallback,
        });

        // Log Gemini usage for transparency (RGPD Article 15)
        await logGeminiUsage(userId, "lm_generation", {
            analysis_id: analysisId,
            tone: tone
        });

        // 3. Save to Match Report (JSON Storage)
        // We store the cover letter inside the match_report JSONB to allow flexibility without schema migration.
        const { data: currentAnalysis } = await supabase.from("job_analyses").select("match_report").eq("id", analysisId).single();
        const updatedReport = { ...currentAnalysis?.match_report, cover_letter: letter };

        await supabase.from("job_analyses").update({
            lm_generated: true,
            match_report: updatedReport
        }).eq("id", analysisId);

        return NextResponse.json({ success: true, letter });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
