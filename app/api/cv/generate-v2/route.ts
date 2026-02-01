import { createSupabaseAdminClient, requireSupabaseUser, createSignedUrl } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { checkRateLimit, createRateLimitError, getRateLimitConfig } from "@/lib/utils/rate-limit";
import { normalizeRAGData } from "@/lib/utils/normalize-rag";
import { generateWidgetsFromRAGAndMatch } from "@/lib/cv/generate-widgets";
import { convertAndSort, ConvertOptions } from "@/lib/cv/ai-adapter";
import { fitCVToTemplate } from "@/lib/cv/validator";
import { parseJobOfferFromText, JobOfferContext } from "@/lib/cv/relevance-scoring";
import { calculateOptimalMinScore } from "@/lib/cv/widget-cache";
import { calculateRAGCompletenessScore } from "@/lib/cv/rag-transform";
import { rescoreWidgetsWithAdvanced } from "@/lib/cv/advanced-scoring";
import { checkNumbersGrounding } from "@/lib/cv/rag-grounding";
import { trackCVGeneration } from "@/lib/cv/observability";
import { detectSector } from "@/lib/cv/sector-customization";
import packageJson from "@/package.json";
import { logger } from "@/lib/utils/logger";

export const runtime = "nodejs";

/**
 * [AUDIT FIX CRITIQUE-2] : Validation grounding post-bridge
 * Vérifie que toutes les réalisations du CV final sont traçables dans le RAG
 */
function validateCVGrounding(cvData: any, ragProfile: any): {
    isValid: boolean;
    warnings: string[];
    groundedPercentage: number;
} {
    const warnings: string[] = [];
    const ragSourceText = JSON.stringify(ragProfile);
    let totalRealisations = 0;
    let groundedRealisations = 0;

    const experiences = cvData?.experiences || [];
    for (const exp of experiences) {
        const realisations = exp?.realisations || [];
        for (const realisation of realisations) {
            totalRealisations++;
            const text = typeof realisation === "string" ? realisation : realisation?.description || "";
            const grounding = checkNumbersGrounding(text, ragSourceText);

            if (grounding.isGrounded) {
                groundedRealisations++;
            } else {
                warnings.push(`⚠️ Chiffres non groundés dans: "${text.substring(0, 60)}..." - Manquants: ${grounding.missingNumbers.join(", ")}`);
            }
        }
    }

    const groundedPercentage = totalRealisations > 0
        ? Math.round((groundedRealisations / totalRealisations) * 100)
        : 100;

    return {
        isValid: groundedPercentage >= 80, // Au moins 80% de grounding
        warnings: warnings.slice(0, 5), // Max 5 warnings pour lisibilité
        groundedPercentage,
    };
}

/**
 * [AUDIT FIX CRITIQUE-3] : Récupération photo URL avec signed URL
 */
async function getPhotoUrl(
    ragProfile: any,
    includePhoto: boolean,
    req: Request
): Promise<string | undefined> {
    if (!includePhoto) return undefined;

    const ragProfil = ragProfile?.profil || {};
    const photoRef = ragProfil?.photo_url;

    if (!photoRef) {
        // Fallback vers API photo
        try {
            const photoResponse = await fetch(
                `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/profile/photo`,
                {
                    headers: {
                        'Cookie': req.headers.get('cookie') || '',
                    },
                }
            );
            if (photoResponse.ok) {
                const photoData = await photoResponse.json();
                if (photoData.photo_url) {
                    logger.debug("[generate-v2] Photo récupérée via API fallback", { hasPhoto: true });
                    return photoData.photo_url;
                }
            }
        } catch (error) {
            logger.warn("[generate-v2] Photo API fallback failed", { error });
        }
        return undefined;
    }

    // Si déjà une URL HTTP(S), utiliser directement
    if (photoRef.startsWith('http://') || photoRef.startsWith('https://')) {
        return photoRef;
    }

    // Convertir storage ref en signed URL
    try {
        let parsedRef = photoRef;
        if (!photoRef.startsWith('storage:')) {
            if (photoRef.includes('avatars/')) {
                parsedRef = `storage:profile-photos:${photoRef}`;
            } else if (photoRef.includes('photos/')) {
                parsedRef = `storage:documents:${photoRef}`;
            } else {
                parsedRef = `storage:profile-photos:${photoRef}`;
            }
        }

        const admin = createSupabaseAdminClient();
        const signedUrl = await createSignedUrl(admin, parsedRef, { expiresIn: 3600 });
        logger.debug("[generate-v2] Photo signed URL créée", { signedUrl: signedUrl?.substring(0, 50) });
        return signedUrl ?? undefined;
    } catch (error) {
        logger.error("[generate-v2] Photo conversion failed", { error, photoRef });
        return undefined;
    }
}

/**
 * Endpoint V2 : Génération CV avec architecture AI Widgets → Bridge → Renderer
 *
 * [AUDIT FIXES APPLIQUÉS]
 * - CRITIQUE-1 : RAG optimisé via buildRAGForCVPrompt (dans generate-widgets.ts)
 * - CRITIQUE-2 : Validation grounding post-bridge
 * - CRITIQUE-3 : Propagation photo_url avec signed URL
 * - CRITIQUE-4 : minScore dynamique via calculateOptimalMinScore
 * - IMPORTANT-5 : Scoring avancé via rescoreWidgetsWithAdvanced
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
        const { analysisId, template, includePhoto = true, matchContextSelection, debug = false } = body;

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
        const ragPhotoRef = ragProfile?.profil?.photo_url;
        const ragClientsCount = Array.isArray(ragProfile?.references?.clients) ? ragProfile.references.clients.length : 0;

        // [AUDIT FIX CRITIQUE-4] : Calculer le score de complétude RAG et minScore optimal
        const ragCompletenessScore = calculateRAGCompletenessScore(ragProfile);
        const optimalMinScore = calculateOptimalMinScore(ragCompletenessScore);

        logger.debug("[generate-v2] RAG completeness analysé", {
            ragCompletenessScore,
            optimalMinScore,
        });

        const matchReport = analysisData.match_report || analysisData.analysis_result?.match_report || {};
        const matchAnalysis = {
            job_title: analysisData.job_title,
            company: analysisData.company_name,
            match_score: analysisData.match_score,
            match_report: matchReport,
            strengths: matchReport?.strengths || [],
            missing_keywords: matchReport?.missing_keywords || [],
            coaching_tips: matchReport?.coaching_tips || {},
        };

        // [INTÉGRATION] Détecter le secteur pour les métriques
        const detectedSector = detectSector(jobDescription, analysisData.company_name);

        // 4. Generate widgets from RAG + match analysis (CERVEAU IA)
        let widgetsEnvelope;
        let fromCache = false;
        try {
            widgetsEnvelope = await generateWidgetsFromRAGAndMatch({
                ragProfile,
                matchAnalysis,
                jobDescription,
                userId, // [INTÉGRATION] Passer userId pour le cache
            });
            fromCache = widgetsEnvelope?.meta?.fromCache || false;

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
            logger.error("Widgets generation error", { error: widgetError });
            return NextResponse.json(
                {
                    error: "Erreur lors de la génération des widgets IA",
                    errorCode: "WIDGETS_GENERATION_ERROR",
                    details: widgetError.message || "Erreur inconnue lors de l'appel à l'IA"
                },
                { status: 500 }
            );
        }

        // [AUDIT FIX IMPORTANT-5] : Appliquer le scoring avancé aux widgets
        const jobOfferContext: JobOfferContext | null = jobDescription
            ? {
                ...parseJobOfferFromText(jobDescription),
                title: analysisData.job_title || parseJobOfferFromText(jobDescription).title,
                sector: analysisData.company_name || undefined,
                // Ajouter les missing_keywords pour le scoring ATS
                missing_keywords: matchAnalysis.missing_keywords,
            } as JobOfferContext & { missing_keywords?: string[] }
            : null;

        const rescoredWidgets = rescoreWidgetsWithAdvanced(widgetsEnvelope.widgets, {
            jobOffer: jobOfferContext,
            ragProfile,
        });

        // Remplacer les widgets par les rescorés
        widgetsEnvelope = {
            ...widgetsEnvelope,
            widgets: rescoredWidgets,
        };

        logger.debug("[generate-v2] Widgets rescorés avec scoring avancé", {
            originalCount: widgetsEnvelope.widgets.length,
            rescoredCount: rescoredWidgets.length,
        });

        // 5. Convert widgets to CVData via bridge (AIAdapter)
        // PAS DE FILTRAGE : on inclut tout, l'utilisateur contrôle via l'UI
        let cvData;
        try {
            const convertOptions: ConvertOptions = {
                // Pas de filtrage par défaut - tout est inclus
                // L'utilisateur peut ajuster minScore via l'UI
                minScore: 0,
                // Passer le RAG pour enrichir les données (dates, lieux, contact)
                ragProfile,
            };

            logger.debug("[generate-v2] Conversion sans filtrage", {
                nbWidgets: widgetsEnvelope.widgets.length,
                nbExperiencesRAG: ragProfile?.experiences?.length || 0,
            });

            cvData = convertAndSort(widgetsEnvelope, convertOptions);
        } catch (conversionError: any) {
            logger.error("Widgets conversion error", { error: conversionError });
            return NextResponse.json(
                {
                    error: "Erreur lors de la conversion des widgets en CV",
                    errorCode: "WIDGETS_CONVERSION_ERROR",
                    details: conversionError.message || "Erreur lors de la transformation des widgets en format CV"
                },
                { status: 500 }
            );
        }

        // [AUDIT FIX CRITIQUE-2] : Valider le grounding post-bridge
        const groundingValidation = validateCVGrounding(cvData, ragProfile);
        logger.debug("[generate-v2] Grounding validation", {
            isValid: groundingValidation.isValid,
            groundedPercentage: groundingValidation.groundedPercentage,
            warningsCount: groundingValidation.warnings.length,
        });

        // [AUDIT FIX CRITIQUE-3] : Récupérer la photo URL
        const photoUrl = await getPhotoUrl(ragProfile, includePhoto, req);

        // Propager la photo dans le CV
        if (photoUrl && cvData.profil) {
            cvData.profil.photo_url = photoUrl;
        }
        const bridgeClientsCount = Array.isArray(cvData?.clients_references?.clients) ? cvData.clients_references.clients.length : 0;
        const bridgePhotoValue = cvData?.profil?.photo_url;

        // Propager les infos de contact depuis le RAG
        const ragProfil = ragProfile?.profil || {};
        const ragContact = ragProfil?.contact || {};
        if (cvData.profil) {
            cvData.profil.email = cvData.profil.email || ragContact.email || ragProfil.email;
            cvData.profil.telephone = cvData.profil.telephone || ragContact.telephone || ragProfil.telephone;
            cvData.profil.linkedin = cvData.profil.linkedin || ragContact.linkedin || ragProfil.linkedin;
            cvData.profil.localisation = cvData.profil.localisation || ragProfil.localisation;
        }

        // 6. Fit CV to template (spatial adaptation)
        let finalCV, compressionLevelApplied, dense, unitStats, lossReport;
        try {
            const fitResult = fitCVToTemplate({
                cvData,
                templateName: template || "modern",
                includePhoto: includePhoto && !!photoUrl,
                jobOffer: jobOfferContext,
            });
            finalCV = fitResult.cvData;
            compressionLevelApplied = fitResult.compressionLevelApplied;
            dense = fitResult.dense;
            unitStats = fitResult.unitStats;
            lossReport = fitResult.lossReport;
        } catch (fitError: any) {
            logger.error("CV template fitting error", { error: fitError });
            return NextResponse.json(
                {
                    error: "Erreur lors de l'adaptation du CV au template",
                    errorCode: "TEMPLATE_FITTING_ERROR",
                    details: fitError.message || "Erreur lors de l'ajustement spatial du CV"
                },
                { status: 500 }
            );
        }

        // 7. Calculate metadata
        const generationTime = Date.now() - generationStartMs;

        // Count widgets used
        const widgetsTotal = widgetsEnvelope.widgets.length;
        const widgetsFiltered = widgetsEnvelope.widgets.filter((w) => w.relevance_score >= optimalMinScore).length;

        // [AUDIT FIX MOYEN-9] : Ajouter métriques qualité enrichies
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
            loss_summary: lossReport
                ? {
                      removed_experiences_total:
                          lossReport.removed.experiences.inputToPreselected.length +
                          lossReport.removed.experiences.preselectedToPrelimited.length +
                          lossReport.removed.experiences.prelimitedToAdapted.length,
                      removed_realisations: lossReport.removed.realisations,
                      template_omissions: lossReport.templateOmissions,
                  }
                : null,
            generation_duration_ms: generationTime,
            generator_type: "v2_widgets",
            widgets_total: widgetsTotal,
            widgets_filtered: widgetsFiltered,
            relevance_scoring_applied: !!jobOfferContext,
            advanced_scoring_applied: true, // [AUDIT FIX IMPORTANT-5]
            job_title: analysisData.job_title || null,
            // [AUDIT FIX CRITIQUE-2] : Métriques grounding
            grounding: {
                percentage: groundingValidation.groundedPercentage,
                is_valid: groundingValidation.isValid,
            },
            // [AUDIT FIX CRITIQUE-4] : Métriques RAG
            rag_completeness_score: ragCompletenessScore,
            min_score_used: optimalMinScore,
            // Warnings combinés
            warnings: [
                ...(unitStats?.warnings || []),
                ...groundingValidation.warnings,
            ],
        };

        // [INTÉGRATION] Tracking observabilité
        trackCVGeneration({
            userId,
            success: true,
            durationMs: generationTime,
            sector: detectedSector,
            templateName: template || "modern",
            widgetCount: widgetsTotal,
            fromCache,
            qualityScore: Math.round(
                (ragCompletenessScore * 0.3) +
                (groundingValidation.groundedPercentage * 0.4) +
                (analysisData.match_score || 50) * 0.3
            ),
        });

        // 8. Save Generated CV
        const { data: cvGen, error: cvError } = await supabase
            .from("cv_generations")
            .insert({
                user_id: userId,
                job_analysis_id: analysisId,
                template_name: template || "modern",
                cv_data: finalCV,
                optimizations_applied: ["advanced_scoring", "optimal_min_score", "grounding_validation", "sector_detection", "smart_cache"],
                generation_duration_ms: generationTime,
            })
            .select("id")
            .single();

        if (cvError) {
            logger.error("CV Save Error", { error: cvError });
            return NextResponse.json(
                {
                    error: "Erreur lors de la sauvegarde du CV",
                    errorCode: "CV_SAVE_ERROR",
                    details: cvError.message || "Impossible de sauvegarder le CV généré"
                },
                { status: 500 }
            );
        }

        const finalClientsCount = Array.isArray((finalCV as any)?.clients_references?.clients)
            ? (finalCV as any).clients_references.clients.length
            : 0;
        const finalPhotoValue = (finalCV as any)?.profil?.photo_url;

        const debugPayload = debug
            ? {
                  profile: {
                      hasPhotoRef: !!ragPhotoRef,
                      photoRefKind:
                          typeof ragPhotoRef === "string"
                              ? ragPhotoRef.startsWith("storage:")
                                  ? "storage"
                                  : (ragPhotoRef.startsWith("http://") || ragPhotoRef.startsWith("https://"))
                                        ? "http"
                                        : "other"
                              : null,
                      hasSignedPhotoUrl: !!photoUrl,
                      ragClientsCount,
                  },
                  bridge: {
                      clientsReferencesCount: bridgeClientsCount,
                      photoKind:
                          typeof bridgePhotoValue === "string"
                              ? (bridgePhotoValue.startsWith("http://") || bridgePhotoValue.startsWith("https://"))
                                    ? "http"
                                    : bridgePhotoValue.startsWith("storage:")
                                          ? "storage"
                                          : "other"
                              : null,
                  },
                  fit: {
                      templateName: template || "modern",
                      includePhotoEffective: includePhoto && !!photoUrl,
                      clientsReferencesCount: finalClientsCount,
                      photoKind:
                          typeof finalPhotoValue === "string"
                              ? (finalPhotoValue.startsWith("http://") || finalPhotoValue.startsWith("https://"))
                                    ? "http"
                                    : finalPhotoValue.startsWith("storage:")
                                          ? "storage"
                                          : "other"
                              : null,
                      lossReport,
                  },
              }
            : undefined;

        return NextResponse.json({
            success: true,
            cvId: cvGen?.id,
            cvData: finalCV,
            templateName: template || "modern",
            includePhoto: includePhoto && !!photoUrl,
            generatorVersion: "v2",
            widgetsTotal,
            widgetsFiltered,
            // [INTÉGRATION] Nouvelles métriques
            fromCache,
            sector: detectedSector,
            // [AUDIT FIX] : Métriques de qualité exposées
            qualityMetrics: {
                ragCompletenessScore,
                minScoreUsed: optimalMinScore,
                groundingPercentage: groundingValidation.groundedPercentage,
                advancedScoringApplied: true,
                sectorDetected: detectedSector,
                cachedWidgets: fromCache,
                lossReport,
            },
            debug: debugPayload,
        });

    } catch (error: any) {
        logger.error("CV Generation V2 Error", { error });

        // [INTÉGRATION] Tracking observabilité pour les erreurs
        trackCVGeneration({
            userId: "unknown",
            success: false,
            durationMs: Date.now(),
            sector: "other",
            templateName: "unknown",
            widgetCount: 0,
            fromCache: false,
            qualityScore: 0,
            errorType: error.name || "UnknownError",
        });

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
