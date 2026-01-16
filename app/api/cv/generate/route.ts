import { createSupabaseUserClient, requireSupabaseUser } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { generateWithCascade, callWithRetry } from "@/lib/ai/gemini";
import { getCVOptimizationPrompt } from "@/lib/ai/prompts";
import { checkRateLimit, RATE_LIMITS, createRateLimitError } from "@/lib/utils/rate-limit";
import { normalizeRAGData } from "@/lib/utils/normalize-rag";
import { normalizeRAGToCV } from "@/components/cv/normalizeData";
import { fitCVToTemplate } from "@/lib/cv/validator";
import { parseJobOfferFromText, JobOfferContext } from "@/lib/cv/relevance-scoring";

export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        const generationStartMs = Date.now();
        const auth = await requireSupabaseUser(req);
        if (auth.error || !auth.user || !auth.token) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { analysisId, template, includePhoto = true } = await req.json();
        const userId = auth.user.id;

        if (!analysisId) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const supabase = createSupabaseUserClient(auth.token);

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
                const cachedHasPhoto = !!(cachedCV as any)?.cv_data?.profil?.photo_url;
                if (!includePhoto) {
                    const cvWithoutPhoto = JSON.parse(JSON.stringify(cachedCV.cv_data));
                    if (cvWithoutPhoto?.profil) {
                        delete cvWithoutPhoto.profil.photo_url;
                    }
                    console.log(`[CV CACHE HIT] Returning cached CV (age: ${Math.round(cacheAge / 1000)}s)`);
                    return NextResponse.json({
                        success: true,
                        cvId: cachedCV.id,
                        cvData: cvWithoutPhoto,
                        templateName: cachedCV.template_name,
                        includePhoto,
                        cached: true,
                        cacheAge: Math.round(cacheAge / 1000)
                    });
                }

                if (cachedHasPhoto) {
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
                }
            } else {
                console.log(`[CV CACHE EXPIRED] Cache too old (${Math.round(cacheAge / 1000)}s), regenerating...`);
            }
        }

        // 1. Fetch Job Analysis & User Profile
        const { data: analysisData, error: analysisError } = await supabase
            .from("job_analyses")
            .select("*")
            .eq("id", analysisId)
            .eq("user_id", userId)
            .single();

        if (analysisError || !analysisData) {
            return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
        }

        const { data: ragData, error: ragError } = await supabase
            .from("rag_metadata")
            .select("completeness_details, custom_notes")
            .eq("user_id", userId)
            .single();

        if (ragError || !ragData) {
            return NextResponse.json({ error: "RAG Profile not found" }, { status: 404 });
        }

        const ragProfile = normalizeRAGData(ragData.completeness_details);
        const customNotes = ragData.custom_notes || "";
        const jobDescription = analysisData.job_description;

        const ragProfil = (ragProfile as any)?.profil || {};
        const ragContact = ragProfil?.contact || {};

        const photoRef = ragProfil?.photo_url as string | undefined;
        const photoValue = includePhoto && photoRef ? photoRef : null;

        // 2. Generate CV with AI (with retry logic)
        const prompt = getCVOptimizationPrompt(ragProfile, jobDescription, customNotes);

        console.log("=== CV GENERATION START ===");

        let responseText: string;
        try {
            const cascadeResult = await callWithRetry(() => generateWithCascade(prompt));
            responseText = cascadeResult.result.response.text();
            console.log("Using model:", cascadeResult.modelUsed);
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

        const identity = (aiOptimizedCV as any)?.identity || {};
        const identityContact = identity?.contact || {};
        const optimizedPitchText = typeof (aiOptimizedCV as any)?.elevator_pitch?.text === "string"
            ? (aiOptimizedCV as any).elevator_pitch.text
            : undefined;

        const mergedRaw = {
            ...aiOptimizedCV,
            profil: {
                prenom: ragProfil?.prenom || identity?.prenom || "",
                nom: ragProfil?.nom || identity?.nom || "",
                titre_principal: identity?.titre_vise || ragProfil?.titre_principal || "",
                email: identityContact?.email || ragContact?.email || "",
                telephone: identityContact?.telephone || ragContact?.telephone || "",
                localisation: identityContact?.ville || ragProfil?.localisation || "",
                linkedin: identityContact?.linkedin || ragContact?.linkedin || "",
                elevator_pitch: optimizedPitchText || ragProfil?.elevator_pitch || "",
                photo_url: includePhoto && photoValue ? photoValue : undefined,
            },
        };

        const normalizedCV = normalizeRAGToCV(mergedRaw);

        // Extract job offer context for relevance scoring
        const jobOfferContext: JobOfferContext | null = jobDescription
            ? {
                ...parseJobOfferFromText(jobDescription),
                title: analysisData.job_title || parseJobOfferFromText(jobDescription).title,
                sector: analysisData.company_name || undefined,
            }
            : null;

        const { cvData: finalCV, compressionLevelApplied, dense, unitStats } = fitCVToTemplate({
            cvData: normalizedCV,
            templateName: template || "modern",
            includePhoto,
            jobOffer: jobOfferContext,
        });

        // Count formats used
        const formatsUsed = {
            detailed: 0,
            standard: 0,
            compact: 0,
            minimal: 0,
        };
        for (const exp of (finalCV.experiences || [])) {
            const fmt = (exp as any)._format || "standard";
            if (fmt in formatsUsed) formatsUsed[fmt as keyof typeof formatsUsed]++;
        }

        const baseMeta = (aiOptimizedCV as any)?.cv_metadata && typeof (aiOptimizedCV as any).cv_metadata === "object"
            ? (aiOptimizedCV as any).cv_metadata
            : {};
        const generatedAt = typeof baseMeta.generated_at === "string" ? baseMeta.generated_at : new Date().toISOString();
        const optimizationsApplied = Array.isArray(baseMeta.optimizations_applied) ? baseMeta.optimizations_applied : [];

        (finalCV as any).cv_metadata = {
            ...baseMeta,
            template_used: template || "modern",
            generated_for_job_id: analysisId,
            match_score: typeof baseMeta.match_score === "number" ? baseMeta.match_score : analysisData.match_score,
            generated_at: generatedAt,
            compression_level_applied: compressionLevelApplied,
            page_count: 1,
            optimizations_applied: optimizationsApplied,
            dense: !!dense,
            unit_stats: unitStats,
            // New fields for UI accordion
            warnings: unitStats?.warnings || [],
            formats_used: formatsUsed,
            relevance_scoring_applied: !!jobOfferContext,
            job_title: analysisData.job_title || null,
        };

        // 4. Save Generated CV
        const { data: cvGen, error: cvError } = await supabase
            .from("cv_generations")
            .insert({
                user_id: userId,
                job_analysis_id: analysisId,
                template_name: template || "modern",
                cv_data: finalCV,
                optimizations_applied: (finalCV as any)?.cv_metadata?.optimizations_applied || [],
                ats_score: (finalCV as any)?.cv_metadata?.ats_score,
                generation_duration_ms: Date.now() - generationStartMs,
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
        });

    } catch (error: any) {
        console.error("CV Generation Error", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
