import { createSupabaseClient } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { GEMINI_MODELS, generateWithGemini } from "@/lib/ai/gemini";
import { getCVOptimizationPrompt } from "@/lib/ai/prompts";
import { checkGeminiConsent, logGeminiUsage } from "@/lib/gemini-consent";

// Helper for tokens (stub)
export const runtime = "nodejs";

export async function POST(req: Request) {
    const supabase = createSupabaseClient();
    try {
        const { userId, analysisId, template } = await req.json();

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

        // 1. Fetch Job Analysis & User Profile
        const { data: analysisData, error: analysisError } = await supabase
            .from("job_analyses")
            .select("*")
            .eq("id", analysisId)
            .single();

        if (analysisError || !analysisData) {
            return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
        }

        const { data: ragData, error: ragError } = await supabase
            .from("rag_metadata")
            .select("completeness_details")
            .eq("user_id", userId)
            .single();

        if (ragError || !ragData) {
            return NextResponse.json({ error: "RAG Profile not found" }, { status: 404 });
        }

        const profile = ragData.completeness_details;
        const jobDescription = analysisData.job_description;

        // 2. Optimization Prompt
        // We ask Gemini to rewrite the profile summary and experience bullets.
        const prompt = getCVOptimizationPrompt(profile, jobDescription);

        const responseText = await generateWithGemini({
            prompt,
            model: GEMINI_MODELS.fallback,
        });

        // Log Gemini usage for transparency (RGPD Article 15)
        await logGeminiUsage(userId, "cv_generation", {
            analysis_id: analysisId,
            template: template || "standard"
        });

        const jsonString = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

        let optimizedCV;
        try {
            optimizedCV = JSON.parse(jsonString);
        } catch (e) {
            console.error("CV Parse Error", responseText);
            return NextResponse.json({ error: "AI Parse Error" }, { status: 500 });
        }

        // 3. Save Generated CV
        const { data: cvGen, error: cvError } = await supabase
            .from("cv_generations")
            .insert({
                user_id: userId,
                job_analysis_id: analysisId,
                template_name: template || "standard",
                cv_data: optimizedCV,
                optimizations_applied: optimizedCV.optimizations_applied || []
            })
            .select("id")
            .single();

        return NextResponse.json({ success: true, cvId: cvGen?.id, cvData: optimizedCV });

    } catch (error: any) {
        console.error("CV Generation Error", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
