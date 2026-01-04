import { createSupabaseClient } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { models } from "@/lib/ai/gemini";
import { getCVOptimizationPrompt } from "@/lib/ai/prompts";

// Helper for tokens (stub)
export const runtime = "nodejs";

export async function POST(req: Request) {
    const supabase = createSupabaseClient();
    try {
        const { userId, analysisId, template, includePhoto = true } = await req.json();

        if (!userId || !analysisId) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
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
            .select("completeness_details, custom_notes, photo_url")
            .eq("user_id", userId)
            .single();

        if (ragError || !ragData) {
            return NextResponse.json({ error: "RAG Profile not found" }, { status: 404 });
        }

        const profile = ragData.completeness_details;
        const customNotes = ragData.custom_notes || "";
        const jobDescription = analysisData.job_description;

        // Get photo URL if needed
        let photoUrl = null;
        if (includePhoto && ragData.photo_url) {
            if (ragData.photo_url.startsWith('storage:')) {
                const storagePath = ragData.photo_url.replace('storage:', '');
                const { data: signedUrlData } = await supabase.storage
                    .from('documents')
                    .createSignedUrl(storagePath, 3600);
                photoUrl = signedUrlData?.signedUrl || null;
            } else {
                photoUrl = ragData.photo_url;
            }
        }

        // 2. Optimization Prompt
        // We ask Gemini to rewrite the profile summary and experience bullets.
        const prompt = getCVOptimizationPrompt(profile, jobDescription, customNotes);

        const result = await models.flash.generateContent(prompt);
        const responseText = result.response.text();
        const jsonString = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

        let optimizedCV;
        try {
            optimizedCV = JSON.parse(jsonString);
        } catch (e) {
            console.error("CV Parse Error", responseText);
            return NextResponse.json({ error: "AI Parse Error" }, { status: 500 });
        }

        // Add photo_url to the CV data if included
        if (includePhoto && photoUrl) {
            optimizedCV.profil = optimizedCV.profil || {};
            optimizedCV.profil.photo_url = photoUrl;
        }

        // 3. Save Generated CV
        const { data: cvGen, error: cvError } = await supabase
            .from("cv_generations")
            .insert({
                user_id: userId,
                job_analysis_id: analysisId,
                template_name: template || "modern",
                include_photo: includePhoto,
                cv_data: optimizedCV,
                optimizations_applied: optimizedCV.optimizations_applied || []
            })
            .select("id")
            .single();

        return NextResponse.json({
            success: true,
            cvId: cvGen?.id,
            cvData: optimizedCV,
            templateName: template || "modern",
            includePhoto
        });

    } catch (error: any) {
        console.error("CV Generation Error", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
