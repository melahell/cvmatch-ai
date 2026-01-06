import { createSupabaseClient } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { models } from "@/lib/ai/gemini";
import { getCVOptimizationPrompt } from "@/lib/ai/prompts";
import { generateOptimizedCV, convertToLegacyFormat, getTemplateProps } from "@/lib/cv/pipeline";
import { calculateQualityScore, validateCVQuality } from "@/lib/cv/quality-metrics";
import { transformRAGToOptimized } from "@/lib/cv/schema-transformer";
import { autoCompressCV } from "@/lib/cv/compressor";
import { validatePreGeneration, formatWarnings } from "@/lib/cv/pre-generation-validation";
import { checkRateLimit, RATE_LIMITS, createRateLimitError } from "@/lib/utils/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
    const supabase = createSupabaseClient();
    try {
        const { userId, analysisId, template, includePhoto = true, useCDCPipeline = true } = await req.json();

        if (!userId || !analysisId) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // Rate limiting: 20 CV generations per hour
        const rateLimitResult = checkRateLimit(`cv:${userId}`, RATE_LIMITS.CV_GENERATION);
        if (!rateLimitResult.success) {
            return NextResponse.json(createRateLimitError(rateLimitResult), { status: 429 });
        }

        // Check cache: if CV already generated for this analysis + template, return it
        const { data: cachedCV, error: cacheError } = await supabase
            .from("cv_generations")
            .select("id, cv_data, template_name, created_at")
            .eq("user_id", userId)
            .eq("job_analysis_id", analysisId)
            .eq("template_name", template || "modern")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (cachedCV && !cacheError) {
            const cacheAge = Date.now() - new Date(cachedCV.created_at).getTime();
            const CACHE_TTL = 60 * 60 * 1000; // 1 hour

            if (cacheAge < CACHE_TTL) {
                console.log(`[CV CACHE HIT] Returning cached CV (age: ${Math.round(cacheAge / 1000)}s)`);
                return NextResponse.json({
                    success: true,
                    cvId: cachedCV.id,
                    cvData: cachedCV.cv_data,
                    templateName: cachedCV.template_name,
                    includePhoto,
                    cached: true,
                    cacheAge: Math.round(cacheAge / 1000)
                });
            } else {
                console.log(`[CV CACHE EXPIRED] Cache too old (${Math.round(cacheAge / 1000)}s), regenerating...`);
            }
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
        let photoWarning = null;
        if (includePhoto && ragData.photo_url) {
            if (ragData.photo_url.startsWith('storage:')) {
                const storagePath = ragData.photo_url.replace('storage:', '');
                const { data: signedUrlData, error: photoError } = await supabase.storage
                    .from('documents')
                    .createSignedUrl(storagePath, 3600);

                if (photoError) {
                    console.error('Photo URL generation failed:', photoError.message);
                    photoWarning = `Unable to load profile photo: ${photoError.message}`;
                } else {
                    photoUrl = signedUrlData?.signedUrl || null;
                }
            } else {
                photoUrl = ragData.photo_url;
            }
        }

        // 2. Generate CV with AI (with retry logic)
        const prompt = getCVOptimizationPrompt(profile, jobDescription, customNotes);

        console.log("=== CV GENERATION START ===");
        console.log("Using CDC Pipeline:", useCDCPipeline);
        console.log("Using model: gemini-3-flash-preview");

        // Retry wrapper
        const callWithRetry = async (maxRetries = 2): Promise<string> => {
            for (let attempt = 0; attempt < maxRetries; attempt++) {
                try {
                    const result = await models.flash.generateContent(prompt);
                    return result.response.text();
                } catch (error: any) {
                    const isRateLimit = error.message?.includes("429") || error.message?.includes("quota");
                    const isTimeout = error.message?.includes("timeout") || error.message?.includes("deadline");

                    if ((isRateLimit || isTimeout) && attempt < maxRetries - 1) {
                        const delay = 3000 * Math.pow(2, attempt); // 3s, 6s
                        console.log(`CV Generation retry ${attempt + 1}/${maxRetries} after ${delay}ms...`);
                        await new Promise(r => setTimeout(r, delay));
                        continue;
                    }
                    throw error;
                }
            }
            throw new Error("Max retries exceeded");
        };

        let responseText: string;
        try {
            responseText = await callWithRetry();
            console.log("Gemini response length:", responseText.length);
        } catch (geminiError: any) {
            console.error("Gemini API Error:", geminiError.message);
            return NextResponse.json({
                error: "AI service error: Unable to generate CV at this time",
                errorCode: "GEMINI_ERROR",
                details: geminiError.message,
                retry: true
            }, { status: 503 });
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
                // CRITICAL FIX: Merge original RAG profile with Gemini output
                // to preserve identity data (nom, prenom, email, etc.)
                const mergedData = {
                    ...aiOptimizedCV,
                    profil: {
                        ...aiOptimizedCV.profil,       // Gemini optimizations
                        // Force original identity data from RAG profile
                        nom: profile.nom || aiOptimizedCV.profil?.nom,
                        prenom: profile.prenom || aiOptimizedCV.profil?.prenom,
                        email: profile.email || aiOptimizedCV.profil?.email,
                        telephone: profile.telephone || aiOptimizedCV.profil?.telephone,
                        localisation: profile.localisation || aiOptimizedCV.profil?.localisation,
                        linkedin: profile.linkedin || aiOptimizedCV.profil?.linkedin,
                        titre_principal: profile.titre_principal || aiOptimizedCV.profil?.titre_principal,
                        elevator_pitch: profile.elevator_pitch || aiOptimizedCV.profil?.elevator_pitch,
                    },
                    // Also preserve experiences, competences, formations from RAG if missing
                    experiences: aiOptimizedCV.experiences || profile.experiences,
                    competences: aiOptimizedCV.competences || profile.competences,
                    formations: aiOptimizedCV.formations || profile.formations,
                    langues: aiOptimizedCV.langues || profile.langues,
                };

                // Transform to CVOptimized format
                const cvOptimized = transformRAGToOptimized(
                    mergedData,
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

        // Compile all warnings
        const allWarnings: string[] = [];
        if (photoWarning) allWarnings.push(photoWarning);
        if (validationResult.warnings.length > 0) {
            allWarnings.push(...validationResult.warnings.map(w => `${w.category}: ${w.message}`));
        }

        return NextResponse.json({
            success: true,
            cvId: cvGen?.id,
            cvData: finalCV,
            templateName: template || "modern",
            includePhoto,
            // Warnings for user visibility
            warnings: allWarnings.length > 0 ? allWarnings : undefined,
            // Pre-generation validation
            preValidation: validationResult.warnings.length > 0 ? {
                qualityIndicators: validationResult.qualityIndicators,
                warnings: validationResult.warnings.map(w => ({
                    severity: w.severity,
                    category: w.category,
                    message: w.message,
                    recommendation: w.recommendation
                }))
            } : undefined,
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

