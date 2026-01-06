import { createSupabaseClient } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { models } from "@/lib/ai/gemini";
import { getCVOptimizationPrompt } from "@/lib/ai/prompts";
import { generateOptimizedCV, convertToLegacyFormat, getTemplateProps } from "@/lib/cv/pipeline";
import { calculateQualityScore, validateCVQuality } from "@/lib/cv/quality-metrics";
import { transformRAGToOptimized } from "@/lib/cv/schema-transformer";
import { autoCompressCV } from "@/lib/cv/compressor";
import { validatePreGeneration, formatWarnings } from "@/lib/cv/pre-generation-validation";

export const runtime = "nodejs";

export async function POST(req: Request) {
    const supabase = createSupabaseClient();
    try {
        const { userId, analysisId, template, includePhoto = true, useCDCPipeline = true } = await req.json();

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

        // Pre-generation validation (non-blocking)
        const validationResult = validatePreGeneration(ragData);
        if (validationResult.warnings.length > 0) {
            console.warn("=== CV PRE-GENERATION WARNINGS ===");
            formatWarnings(validationResult).forEach(w => console.warn(w));
            console.warn("Quality indicators:", validationResult.qualityIndicators);
        }

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

        // 2. Generate CV with AI
        const prompt = getCVOptimizationPrompt(profile, jobDescription, customNotes);

        console.log("=== CV GENERATION START ===");
        console.log("Using CDC Pipeline:", useCDCPipeline);
        console.log("Using model: gemini-3-flash-preview");

        let result;
        let responseText;
        try {
            result = await models.flash.generateContent(prompt);
            responseText = result.response.text();
            console.log("Gemini response length:", responseText.length);
        } catch (geminiError: any) {
            console.error("Gemini API Error:", geminiError.message);
            return NextResponse.json({
                error: "Gemini API Error: " + geminiError.message
            }, { status: 500 });
        }

        const jsonString = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

        let aiOptimizedCV;
        try {
            aiOptimizedCV = JSON.parse(jsonString);
        } catch (e) {
            console.error("CV Parse Error - Response was:", responseText.substring(0, 500));
            return NextResponse.json({ error: "AI Parse Error" }, { status: 500 });
        }

        // 3. Apply CDC Pipeline if enabled
        let finalCV = aiOptimizedCV;
        let qualityScore = null;
        let compressionInfo = null;

        if (useCDCPipeline) {
            try {
                // Transform to CVOptimized format
                const cvOptimized = transformRAGToOptimized(
                    aiOptimizedCV,
                    analysisData.match_report,
                    template || "modern"
                );

                // Apply auto-compression
                const compressionResult = autoCompressCV(cvOptimized, includePhoto);

                // Calculate quality score
                qualityScore = calculateQualityScore(compressionResult.cv, jobDescription);

                // Validate CV
                const validation = validateCVQuality(compressionResult.cv);
                if (!validation.valid) {
                    console.warn("CV validation warnings:", validation.blocking_issues);
                }

                // Convert to legacy format for template compatibility
                finalCV = convertToLegacyFormat(compressionResult.cv);

                compressionInfo = {
                    level: compressionResult.compression_applied,
                    actions: compressionResult.actions_taken,
                    pages: compressionResult.final_page_count,
                    warnings: compressionResult.warnings
                };

                console.log("CDC Pipeline applied:");
                console.log("- Seniority:", compressionResult.cv.cv_metadata.seniority_level);
                console.log("- Compression level:", compressionResult.compression_applied);
                console.log("- Quality score:", qualityScore.overall);
                console.log("- Pages:", compressionResult.final_page_count);
            } catch (pipelineError: any) {
                console.error("CDC Pipeline error, using raw AI output:", pipelineError.message);
                // Fallback to raw AI output
            }
        }

        // Add photo_url to the CV data if included
        if (includePhoto && photoUrl) {
            finalCV.profil = finalCV.profil || {};
            finalCV.profil.photo_url = photoUrl;
        }

        // 4. Get template props based on compression
        const templateProps = useCDCPipeline && finalCV.cv_metadata
            ? getTemplateProps(finalCV.cv_metadata)
            : { dense: false, ultraCompact: false, showTechnologies: true, maxBullets: 4, fontSize: 'normal' };

        // 5. Save Generated CV
        const { data: cvGen, error: cvError } = await supabase
            .from("cv_generations")
            .insert({
                user_id: userId,
                job_analysis_id: analysisId,
                template_name: template || "modern",
                cv_data: finalCV,
                optimizations_applied: finalCV.optimizations_applied || finalCV.cv_metadata?.optimizations_applied || []
            })
            .select("id")
            .single();

        if (cvError) {
            console.error("CV Save Error", cvError);
            return NextResponse.json({ error: "Failed to save CV: " + cvError.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            cvId: cvGen?.id,
            cvData: finalCV,
            templateName: template || "modern",
            includePhoto,
            // CDC Pipeline extras
            cdcPipeline: useCDCPipeline,
            qualityScore: qualityScore ? {
                overall: qualityScore.overall,
                ats: qualityScore.ats.score,
                density: qualityScore.density.score,
                coherence: qualityScore.coherence.score,
                warnings: qualityScore.warnings,
                suggestions: qualityScore.suggestions
            } : null,
            compression: compressionInfo,
            templateProps
        });

    } catch (error: any) {
        console.error("CV Generation Error", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

