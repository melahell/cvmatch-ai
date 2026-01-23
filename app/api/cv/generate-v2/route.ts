import { createSupabaseAdminClient, requireSupabaseUser } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { checkRateLimit, createRateLimitError, getRateLimitConfig } from "@/lib/utils/rate-limit";
import { normalizeRAGData } from "@/lib/utils/normalize-rag";
import { generateWidgetsFromRAGAndMatch } from "@/lib/cv/generate-widgets";
import { convertAndSort } from "@/lib/cv/ai-adapter";
import { fitCVToTemplate } from "@/lib/cv/validator";
import { parseJobOfferFromText, JobOfferContext } from "@/lib/cv/relevance-scoring";
import packageJson from "@/package.json";

export const runtime = "nodejs";

/**
 * Endpoint V2 : Génération CV avec architecture AI Widgets → Bridge → Renderer
 * 
 * Différence avec V1 :
 * - V1 : RAG → Prompt monolithique → CV optimisé directement
 * - V2 : RAG → Widgets scorés → Bridge (convertAndSort) → CV normalisé
 */
export async function POST(req: Request) {
    try {
        const generationStartMs = Date.now();
        const auth = await requireSupabaseUser(req);
        if (auth.error || !auth.user || !auth.token) {
            return NextResponse.json({ error: auth.error || "Non autorisé" }, { status: 401 });
        }

        const userId = auth.user.id;
        const supabase = createSupabaseAdminClient();

        // Rate limiting (même logique que V1)
        const { data: userRow } = await supabase
            .from("users")
            .select("subscription_tier, subscription_status, subscription_expires_at")
            .eq("id", userId)
            .single();

    const isExpired = userRow?.subscription_expires_at
        ? new Date(userRow.subscription_expires_at) < new Date()
        : false;
    const tier = !userRow || userRow.subscription_status !== "active" || isExpired
        ? "free"
        : (userRow.subscription_tier || "free");

    const rateLimitResult = checkRateLimit(`cv:${userId}`, getRateLimitConfig(tier, "CV_GENERATION"));
    if (!rateLimitResult.success) {
        return NextResponse.json(createRateLimitError(rateLimitResult), { status: 429 });
    }

        const body = await req.json();
        const { analysisId, template, includePhoto, matchContextSelection } = body;

        if (!analysisId) {
            return NextResponse.json({ error: "analysisId requis" }, { status: 400 });
        }

        // 1. Fetch job analysis
        const { data: analysisData, error: analysisError } = await supabase
            .from("job_analyses")
            .select("*")
            .eq("id", analysisId)
            .eq("user_id", userId)
            .single();

        if (analysisError || !analysisData) {
            return NextResponse.json({ error: "Analyse introuvable" }, { status: 404 });
        }

        const jobDescription = analysisData.job_description || analysisData.job_text || "";

        // 2. Fetch RAG profile
        const { data: ragMetadata, error: ragError } = await supabase
            .from("rag_metadata")
            .select("completeness_details")
            .eq("user_id", userId)
            .single();

        if (ragError || !ragMetadata) {
            return NextResponse.json({ error: "Profil RAG introuvable" }, { status: 404 });
        }

        const ragProfile = normalizeRAGData(ragMetadata.completeness_details);
        if (!ragProfile || !ragProfile.profil) {
            return NextResponse.json({ error: "Profil RAG incomplet" }, { status: 400 });
        }

        // 3. Build match analysis object for widgets generation
        const matchAnalysis = {
            job_title: analysisData.job_title,
            company: analysisData.company_name,
            match_score: analysisData.match_score,
            match_report: analysisData.analysis_result?.match_report || {},
            strengths: analysisData.analysis_result?.match_report?.strengths || [],
            missing_keywords: analysisData.analysis_result?.match_report?.missing_keywords || [],
            coaching_tips: analysisData.analysis_result?.match_report?.coaching_tips || {},
        };

        // 4. Generate widgets from RAG + match analysis (CERVEAU IA)
        let widgetsEnvelope;
        try {
            widgetsEnvelope = await generateWidgetsFromRAGAndMatch({
                ragProfile,
                matchAnalysis,
                jobDescription,
            });

            if (!widgetsEnvelope) {
                return NextResponse.json(
                    { 
                        error: "Erreur génération widgets IA",
                        errorCode: "WIDGETS_GENERATION_FAILED",
                        details: "L'IA n'a pas pu générer les widgets de contenu. Vérifiez que votre profil RAG est complet."
                    },
                    { status: 500 }
                );
            }
        } catch (widgetError: any) {
            console.error("Widgets generation error:", widgetError);
            return NextResponse.json(
                {
                    error: "Erreur lors de la génération des widgets IA",
                    errorCode: "WIDGETS_GENERATION_ERROR",
                    details: widgetError.message || "Erreur inconnue lors de l'appel à l'IA"
                },
                { status: 500 }
            );
        }

        // 5. Convert widgets to CVData via bridge (AIAdapter)
        let cvData;
        try {
            cvData = convertAndSort(widgetsEnvelope, {
                minScore: 50,
                maxExperiences: 6,
                maxBulletsPerExperience: 6,
            });
        } catch (conversionError: any) {
            console.error("Widgets conversion error:", conversionError);
            return NextResponse.json(
                {
                    error: "Erreur lors de la conversion des widgets en CV",
                    errorCode: "WIDGETS_CONVERSION_ERROR",
                    details: conversionError.message || "Erreur lors de la transformation des widgets en format CV"
                },
                { status: 500 }
            );
        }

        // 6. Extract job offer context for relevance scoring
        const jobOfferContext: JobOfferContext | null = jobDescription
            ? {
                ...parseJobOfferFromText(jobDescription),
                title: analysisData.job_title || parseJobOfferFromText(jobDescription).title,
                sector: analysisData.company_name || undefined,
            }
            : null;

        // 7. Fit CV to template (spatial adaptation)
        let finalCV, compressionLevelApplied, dense, unitStats;
        try {
            const fitResult = fitCVToTemplate({
                cvData,
                templateName: template || "modern",
                includePhoto: includePhoto ?? true,
                jobOffer: jobOfferContext,
            });
            finalCV = fitResult.cvData;
            compressionLevelApplied = fitResult.compressionLevelApplied;
            dense = fitResult.dense;
            unitStats = fitResult.unitStats;
        } catch (fitError: any) {
            console.error("CV template fitting error:", fitError);
            return NextResponse.json(
                {
                    error: "Erreur lors de l'adaptation du CV au template",
                    errorCode: "TEMPLATE_FITTING_ERROR",
                    details: fitError.message || "Erreur lors de l'ajustement spatial du CV"
                },
                { status: 500 }
            );
        }

        // 8. Calculate metadata
        const generationTime = Date.now() - generationStartMs;

        // Count widgets used
        const widgetsUsed = widgetsEnvelope.widgets.length;
        const widgetsFiltered = widgetsEnvelope.widgets.filter((w) => w.relevance_score >= 50).length;

        // Add metadata
        (finalCV as any).cv_metadata = {
            template_used: template || "modern",
            generated_for_job_id: analysisId,
            match_score: analysisData.match_score,
            generated_at: new Date().toISOString(),
            generator_version: packageJson.version,
            generator_model: widgetsEnvelope.meta?.model || "gemini-3-pro-preview",
            compression_level_applied: compressionLevelApplied,
            page_count: 1,
            dense: !!dense,
            unit_stats: unitStats,
            generation_duration_ms: generationTime,
            generator_type: "v2_widgets",
            widgets_total: widgetsUsed,
            widgets_filtered: widgetsFiltered,
            relevance_scoring_applied: !!jobOfferContext,
            job_title: analysisData.job_title || null,
        };

        // 9. Save Generated CV
        const { data: cvGen, error: cvError } = await supabase
            .from("cv_generations")
            .insert({
                user_id: userId,
                job_analysis_id: analysisId,
                template_name: template || "modern",
                cv_data: finalCV,
                optimizations_applied: [],
                generation_duration_ms: generationTime,
            })
            .select("id")
            .single();

        if (cvError) {
            console.error("CV Save Error", cvError);
            return NextResponse.json(
                {
                    error: "Erreur lors de la sauvegarde du CV",
                    errorCode: "CV_SAVE_ERROR",
                    details: cvError.message || "Impossible de sauvegarder le CV généré"
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            cvId: cvGen?.id,
            cvData: finalCV,
            templateName: template || "modern",
            includePhoto,
            generatorVersion: "v2",
            widgetsUsed,
            widgetsFiltered,
        });

    } catch (error: any) {
        console.error("CV Generation V2 Error", error);
        return NextResponse.json(
            {
                error: "Erreur inattendue lors de la génération du CV V2",
                errorCode: "UNEXPECTED_ERROR",
                details: error.message || "Une erreur inconnue s'est produite"
            },
            { status: 500 }
        );
    }
}
