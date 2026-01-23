/**
 * API Endpoint: POST /api/cv/generate-widgets
 * 
 * Génère uniquement les widgets AI (AI_WIDGETS_SCHEMA) depuis RAG + match analysis.
 * Cette endpoint est optimisé pour l'architecture "Frankenstein" client-side :
 * - Génère widgets une fois côté serveur
 * - Client fait le reste (conversion, rendu, preview, export)
 * 
 * Différence avec /api/cv/generate-v2 :
 * - Ne fait PAS la conversion widgets → CVData
 * - Ne fait PAS le fitCVToTemplate
 * - Ne sauvegarde PAS dans cv_generations
 * - Retourne UNIQUEMENT les widgets JSON
 */

import { createSupabaseAdminClient, requireSupabaseUser } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { generateWidgetsFromRAGAndMatch } from "@/lib/cv/generate-widgets";
import type { AIWidgetsEnvelope } from "@/lib/cv/ai-widgets";
import { checkRateLimit, createRateLimitError, getRateLimitConfig } from "@/lib/utils/rate-limit";
import { normalizeRAGData } from "@/lib/utils/normalize-rag";
import { parseJobOfferFromText, type JobOfferContext } from "@/lib/cv/relevance-scoring";

export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        // 1. Authentication
        const authResult = await requireSupabaseUser(req);
        if (authResult.error || !authResult.user) {
            return NextResponse.json(
                { error: "Non authentifié", errorCode: "UNAUTHORIZED" },
                { status: 401 }
            );
        }
        const userId = authResult.user.id;

        // 2. Parse request body
        const body = await req.json();
        const { analysisId, jobId } = body;

        if (!analysisId) {
            return NextResponse.json(
                { error: "analysisId requis", errorCode: "MISSING_ANALYSIS_ID" },
                { status: 400 }
            );
        }

        // 3. Rate limiting
        const supabase = createSupabaseAdminClient();
        const { data: userRow } = await supabase
            .from("user_profiles")
            .select("subscription_tier, subscription_status, subscription_expires_at")
            .eq("user_id", userId)
            .single();

        const isExpired = userRow?.subscription_expires_at
            ? new Date(userRow.subscription_expires_at) < new Date()
            : false;
        const tier = (!userRow || userRow.subscription_status !== "active" || isExpired
            ? "free"
            : (userRow.subscription_tier || "free")) as "free" | "pro" | "team";
        const rateLimitConfig = getRateLimitConfig(tier, "CV_GENERATION");

        const rateLimitResult = await checkRateLimit(
            `cv_widgets:${userId}`,
            rateLimitConfig
        );

        if (!rateLimitResult.success) {
            return NextResponse.json(
                createRateLimitError(rateLimitResult),
                { status: 429 }
            );
        }

        // 4. Fetch job analysis
        const { data: analysisData, error: analysisError } = await supabase
            .from("job_analyses")
            .select("*")
            .eq("id", analysisId)
            .eq("user_id", userId)
            .single();

        if (analysisError || !analysisData) {
            return NextResponse.json(
                {
                    error: "Analyse d'emploi introuvable",
                    errorCode: "ANALYSIS_NOT_FOUND",
                    details: analysisError?.message,
                },
                { status: 404 }
            );
        }

        const jobDescription = analysisData.job_description || "";

        // 5. Fetch RAG profile
        const { data: ragData, error: ragError } = await supabase
            .from("rag_metadata")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        if (ragError || !ragData) {
            return NextResponse.json(
                {
                    error: "Profil RAG introuvable",
                    errorCode: "RAG_PROFILE_NOT_FOUND",
                    details: "Veuillez compléter votre profil RAG avant de générer un CV.",
                },
                { status: 404 }
            );
        }

        // Vérifier que completeness_details existe
        if (!ragData.completeness_details) {
            return NextResponse.json(
                {
                    error: "Profil RAG incomplet",
                    errorCode: "RAG_INCOMPLETE",
                    details: "Le champ completeness_details est manquant dans rag_metadata",
                },
                { status: 400 }
            );
        }

        const ragProfile = normalizeRAGData(ragData.completeness_details);
        
        if (!ragProfile) {
            return NextResponse.json(
                {
                    error: "Erreur normalisation RAG",
                    errorCode: "RAG_NORMALIZATION_FAILED",
                    details: "Impossible de normaliser les données RAG",
                },
                { status: 500 }
            );
        }

        // 6. Build match analysis context
        const analysisResult = analysisData.analysis_result || {};
        const matchReport = analysisResult.match_report || {};
        
        const matchAnalysis = {
            company: analysisData.company_name,
            match_score: analysisData.match_score,
            match_report: matchReport,
            strengths: matchReport.strengths || [],
            missing_keywords: matchReport.missing_keywords || [],
            coaching_tips: matchReport.coaching_tips || {},
        };

        // 7. Generate widgets from RAG + match analysis (CERVEAU IA)
        let widgetsEnvelope: AIWidgetsEnvelope | null = null;
        try {
            console.log("[generate-widgets] Début génération widgets pour analysisId:", analysisId);
            widgetsEnvelope = await generateWidgetsFromRAGAndMatch({
                ragProfile,
                matchAnalysis,
                jobDescription,
            });

            if (!widgetsEnvelope) {
                console.error("[generate-widgets] generateWidgetsFromRAGAndMatch a retourné null");
                return NextResponse.json(
                    {
                        error: "Erreur génération widgets IA",
                        errorCode: "WIDGETS_GENERATION_FAILED",
                        details: "L'IA n'a pas pu générer les widgets de contenu. Vérifiez que votre profil RAG est complet.",
                    },
                    { status: 500 }
                );
            }
            console.log("[generate-widgets] Widgets générés avec succès:", widgetsEnvelope.widgets.length, "widgets");
        } catch (widgetError: any) {
            console.error("[generate-widgets] Erreur lors de la génération des widgets:", widgetError);
            return NextResponse.json(
                {
                    error: "Erreur lors de la génération des widgets IA",
                    errorCode: "WIDGETS_GENERATION_ERROR",
                    details: widgetError.message || "Erreur inconnue lors de l'appel à l'IA",
                },
                { status: 500 }
            );
        }

        // 7.5. Build JobOfferContext for advanced scoring
        const jobOfferContext: JobOfferContext = parseJobOfferFromText(jobDescription);
        // Enrichir avec données de l'analyse
        if (analysisData.job_title) {
            jobOfferContext.title = analysisData.job_title;
        }
        if (analysisData.company_name) {
            jobOfferContext.company = analysisData.company_name;
        }
        // Ajouter missing_keywords depuis match_report (déjà défini plus haut)
        if (matchReport.missing_keywords && Array.isArray(matchReport.missing_keywords)) {
            (jobOfferContext as any).missing_keywords = matchReport.missing_keywords;
        }

        // 8. Return widgets ONLY (no conversion, no template fitting)
        return NextResponse.json({
            success: true,
            widgets: widgetsEnvelope,
            metadata: {
                analysisId,
                jobId: jobId || undefined,
                generatedAt: new Date().toISOString(),
                widgetsCount: widgetsEnvelope.widgets.length,
                model: widgetsEnvelope.meta?.model || "gemini-3-pro-preview",
            },
            jobOfferContext, // Ajouter contexte offre pour scoring avancé côté client
        });
    } catch (error: any) {
        console.error("Error in generate-widgets:", error);
        return NextResponse.json(
            {
                error: "Erreur inattendue lors de la génération des widgets",
                errorCode: "INTERNAL_ERROR",
                details: error.message || "Erreur inconnue",
            },
            { status: 500 }
        );
    }
}
