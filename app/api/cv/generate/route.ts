import { createSignedUrl, createSupabaseUserClient, requireSupabaseUser } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { generateWithCascade, callWithRetry } from "@/lib/ai/gemini";
import { getCVOptimizationPrompt } from "@/lib/ai/prompts";
import { checkRateLimit, RATE_LIMITS, createRateLimitError } from "@/lib/utils/rate-limit";
import { normalizeRAGData } from "@/lib/utils/normalize-rag";
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

        const { analysisId, template, includePhoto = true } = await req.json();

        if (!analysisId) {
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
                logger.info("CV cache hit", { analysisId, template: template || "modern", cacheAgeSeconds: Math.round(cacheAge / 1000) });
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
                logger.info("CV cache expired", { analysisId, template: template || "modern", cacheAgeSeconds: Math.round(cacheAge / 1000) });
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

        const profile = normalizeRAGData(ragData.completeness_details);
        const customNotes = ragData.custom_notes || "";
        const jobDescription = analysisData.job_description;

        logger.info("CV génération démarrée", { userId, analysisId, template: template || "modern", includePhoto });

        // Get photo URL if needed
        let photoUrl = null;
        let photoWarning = null;
        const photoRef = profile?.profil?.photo_url;
        if (includePhoto && photoRef) {
            photoUrl = await createSignedUrl(supabase, photoRef);
            if (!photoUrl) {
                photoWarning = "Unable to load profile photo";
            }
        }

        // 2. Generate CV with AI (with retry logic)
        const prompt = getCVOptimizationPrompt(profile, jobDescription, customNotes);

        let responseText: string;
        let modelUsed: string | null = null;
        try {
            const cascadeResult = await callWithRetry(() => generateWithCascade(prompt));
            responseText = cascadeResult.result.response.text();
            modelUsed = cascadeResult.modelUsed;
            logger.info("CV génération IA OK", { modelUsed, responseLength: responseText.length });
        } catch (geminiError: any) {
            logger.error("CV génération IA KO", { error: geminiError?.message });
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
            logger.error("CV parse error", { responseLength: responseText.length });
            return NextResponse.json({ error: "AI Parse Error" }, { status: 500 });
        }

        // 3. Merge original RAG profile with Gemini output to preserve identity data
        // Note: RAG schema stores email/telephone in profil.contact.{email|telephone}
        const profileContact = profile?.profil?.contact || (profile as any)?.contact || {};
        const finalCV = {
            ...aiOptimizedCV,
            profil: {
                ...aiOptimizedCV.profil,
                nom: profile?.profil?.nom || aiOptimizedCV.profil?.nom,
                prenom: profile?.profil?.prenom || aiOptimizedCV.profil?.prenom,
                email: profileContact.email || profile?.profil?.email || (profile as any)?.email || aiOptimizedCV.profil?.email,
                telephone: profileContact.telephone || profile?.profil?.telephone || (profile as any)?.telephone || aiOptimizedCV.profil?.telephone,
                localisation: profile?.profil?.localisation || profileContact.ville || aiOptimizedCV.profil?.localisation,
                linkedin: profileContact.linkedin || profile?.profil?.linkedin || (profile as any)?.linkedin || aiOptimizedCV.profil?.linkedin,
                titre_principal: profile?.profil?.titre_principal || aiOptimizedCV.profil?.titre_principal,
                elevator_pitch: aiOptimizedCV.profil?.elevator_pitch || profile?.profil?.elevator_pitch,
                photo_url: includePhoto && photoUrl ? photoUrl : undefined
            },
            experiences: aiOptimizedCV.experiences || profile.experiences,
            competences: aiOptimizedCV.competences || profile.competences,
            formations: aiOptimizedCV.formations || profile.formations,
            langues: aiOptimizedCV.langues || profile.langues,
            certifications: aiOptimizedCV.certifications || profile.certifications,
        };

        // 4. Save Generated CV
        const { data: cvGen, error: cvError } = await supabase
            .from("cv_generations")
            .insert({
                user_id: userId,
                job_analysis_id: analysisId,
                template_name: template || "modern",
                cv_data: finalCV,
                optimizations_applied: finalCV.optimizations_applied || []
            })
            .select("id")
            .single();

        if (cvError) {
            logger.error("CV save error", { error: cvError.message });
            return NextResponse.json({ error: "Failed to save CV: " + cvError.message }, { status: 500 });
        }

        // Compile warnings
        const allWarnings: string[] = [];
        if (photoWarning) allWarnings.push(photoWarning);

        return NextResponse.json({
            success: true,
            cvId: cvGen?.id,
            cvData: finalCV,
            templateName: template || "modern",
            includePhoto,
            model_used: modelUsed,
            warnings: allWarnings.length > 0 ? allWarnings : undefined
        });

    } catch (error: any) {
        logger.error("CV Generation Error", { error: error?.message });
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
