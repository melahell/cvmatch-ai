import { createSupabaseAdminClient, createSupabaseUserClient, requireSupabaseUser } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { generateWithCascade, callWithRetry } from "@/lib/ai/gemini";
import { getMatchAnalysisPrompt } from "@/lib/ai/prompts";
import { validateMatchAnalysis } from "@/lib/validations/match-analysis";
import { checkRateLimit, createRateLimitError, getRateLimitConfig } from "@/lib/utils/rate-limit";
import {
    logMatchAnalysisStart,
    logMatchAnalysisSuccess,
    logMatchAnalysisValidationFailed,
    logMatchAnalysisError,
    logEnrichmentMissing
} from "@/lib/logging/match-analysis-logger";
import { logger } from "@/lib/utils/logger";
import {
    startMatchAnalysisTrace,
    recordMatchAnalysisSuccess,
    recordMatchAnalysisError,
    recordValidationFailure,
    traceAIModelCall,
    calculateAnalysisCost
} from "@/lib/telemetry/safe-telemetry";
import { truncateToTokens } from "@/lib/utils/text-truncate";
import { getDocumentProxy, extractText } from "unpdf";
import { extractJobTextFromHtml } from "@/lib/job/extract-job-text";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
    const startTime = Date.now(); // Pour tracking performance

    // 🔭 Start OpenTelemetry trace
    let span: any = null;
    let body: any = null;
    let userId: string | undefined;
    let jobUrl: string | undefined;
    let jobText: string | undefined;
    let fileData: string | undefined;
    let extractionDebug: any = null;

    try {
        const auth = await requireSupabaseUser(req);
        if (auth.error || !auth.user || !auth.token) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const supabase = createSupabaseUserClient(auth.token);
        const admin = createSupabaseAdminClient();

        body = await req.json();
        ({ jobUrl, jobText, fileData } = body);
        const { fileName, fileType } = body;
        userId = auth.user.id;

        if (!jobUrl && !jobText && !fileData) {
            return NextResponse.json({ error: "Fournissez une URL, un texte ou un fichier." }, { status: 400 });
        }

        const { data: userRow } = await admin
            .from("users")
            .select("subscription_tier, subscription_expires_at, subscription_status")
            .eq("id", userId)
            .maybeSingle();

        const isExpired = userRow?.subscription_expires_at
            ? new Date(userRow.subscription_expires_at) < new Date()
            : false;
        const tier = !userRow || userRow.subscription_status !== "active" || isExpired
            ? "free"
            : (userRow.subscription_tier || "free");

        const rateLimitResult = await checkRateLimit(userId, getRateLimitConfig(tier, "MATCH_ANALYSIS"));
        if (!rateLimitResult.success) {
            return NextResponse.json(createRateLimitError(rateLimitResult), { status: 429 });
        }

        // 1. Get User RAG Profile
        const { data: ragData, error: dbError } = await supabase
            .from("rag_metadata")
            .select("completeness_details")
            .eq("user_id", userId)
            .single();

        if (dbError || !ragData?.completeness_details) {
            return NextResponse.json({
                error: "Profil introuvable. Uploadez vos documents dans 'Gérer mon profil'."
            }, { status: 404 });
        }

        let fullJobText = jobText || "";

        // 2A. Extract text from file using Gemini Vision with cascade
        if (fileData && !fullJobText) {
            try {
                const base64Data = fileData.split(",")[1];
                const mimeType = (fileType || "image/png").toLowerCase();
                const fileNameStr = typeof fileName === "string" ? fileName : undefined;
                const rawBytes = Buffer.from(base64Data, "base64");

                let method: string | null = null;
                if (mimeType.includes("pdf")) {
                    method = "unpdf";
                    const pdf = await getDocumentProxy(new Uint8Array(rawBytes));
                    const { text: pdfText } = await extractText(pdf, { mergePages: true });
                    fullJobText = pdfText;
                } else if (mimeType.includes("wordprocessingml") || (fileNameStr || "").toLowerCase().endsWith(".docx")) {
                    method = "mammoth";
                    const mammoth = await import("mammoth");
                    const result = await mammoth.extractRawText({ buffer: rawBytes });
                    fullJobText = result.value;
                } else if (mimeType.startsWith("image/")) {
                    method = "gemini_inline";
                    const extractionPrompt = [
                        { inlineData: { mimeType, data: base64Data } },
                        "Extrais le texte complet de cette offre d'emploi. Retourne uniquement le texte brut."
                    ];

                    const { result, modelUsed } = await callWithRetry(() =>
                        generateWithCascade(extractionPrompt)
                    );
                    logger.debug("File extraction completed", { modelUsed });
                    fullJobText = result.response.text();
                } else {
                    method = "text_decoder";
                    const decoder = new TextDecoder("utf-8");
                    fullJobText = decoder.decode(rawBytes);
                }

                extractionDebug = {
                    source: "file",
                    file: {
                        fileName: fileNameStr,
                        mimeType,
                        method,
                        extractedLength: fullJobText?.length || 0,
                    }
                };

                if (fullJobText.length < 50) {
                    return NextResponse.json({ error: "Fichier illisible. Essayez un texte copié-collé." }, { status: 400 });
                }
            } catch (err: any) {
                console.error("File extraction error:", err.message);
                return NextResponse.json({
                    error: "Tous les modèles IA sont surchargés. Réessayez dans quelques minutes."
                }, { status: 503 });
            }
        }

        // 2B. Scrape URL if provided
        if (jobUrl && !fullJobText) {
            try {
                const response = await fetch(jobUrl, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
                        "Accept": "text/html",
                        "Accept-Language": "fr-FR"
                    },
                    redirect: "follow"
                });

                if (!response.ok) {
                    return NextResponse.json({
                        error: "Site inaccessible. Utilisez 'Texte' ou 'Fichier'.",
                        errorCode: "URL_FETCH_FAILED",
                        extraction_debug: { source: "url", url: jobUrl, status: response.status }
                    }, { status: 400 });
                }

                const finalUrl = response.url;
                const html = await response.text();
                const extracted = extractJobTextFromHtml(html, finalUrl);
                fullJobText = extracted.text;
                extractionDebug = { source: "url", ...extracted.debug, httpStatus: response.status, finalUrl };

                if (fullJobText.length < 120) {
                    const readerUrl = `https://r.jina.ai/${finalUrl}`;
                    const readerRes = await fetch(readerUrl, {
                        headers: {
                            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
                            "Accept": "text/plain",
                            "Accept-Language": "fr-FR"
                        },
                        redirect: "follow"
                    }).catch(() => null);

                    if (readerRes?.ok) {
                        const readerText = await readerRes.text();
                        const extractedReader = extractJobTextFromHtml(readerText, finalUrl);
                        if (extractedReader.text.length > fullJobText.length) {
                            fullJobText = extractedReader.text;
                            extractionDebug = {
                                ...extractionDebug,
                                reader: { used: true, url: readerUrl, status: readerRes.status },
                                readerExtraction: extractedReader.debug
                            };
                        }
                    }
                }

                if (fullJobText.length < 120) {
                    const truncated = truncateToTokens(html, 8000).truncated;
                    const htmlExtractionPrompt = `Tu es un extracteur. À partir du HTML ci-dessous, extrais uniquement le texte de l'offre d'emploi (titre, entreprise, lieu, description, responsabilités, compétences). Retourne uniquement le texte brut.\n\nHTML:\n${truncated}`;
                    const { result: extractResult, modelUsed: extractModelUsed } = await callWithRetry(() =>
                        generateWithCascade(htmlExtractionPrompt)
                    );
                    const fromHtml = extractResult.response.text();
                    if (fromHtml && fromHtml.length > fullJobText.length) {
                        fullJobText = fromHtml;
                        extractionDebug = { ...extractionDebug, geminiHtmlFallback: { used: true, modelUsed: extractModelUsed, extractedLength: fromHtml.length } };
                    }
                }

                if (fullJobText.length < 120) {
                    const hint = extractionDebug?.likelyBlocked
                        ? "Page probablement bloquée (LinkedIn/login). Copiez-collez la description ou uploadez un PDF export LinkedIn."
                        : "Contenu insuffisant. Utilisez 'Texte' ou 'Fichier'.";
                    return NextResponse.json({
                        error: hint,
                        errorCode: extractionDebug?.likelyBlocked ? "URL_BLOCKED" : "URL_INSUFFICIENT_CONTENT",
                        extraction_debug: extractionDebug
                    }, { status: 400 });
                }
            } catch {
                return NextResponse.json({
                    error: "URL illisible. Utilisez 'Texte' ou 'Fichier'.",
                    errorCode: "URL_PARSE_FAILED",
                    extraction_debug: extractionDebug
                }, { status: 400 });
            }
        }

        // 📊 Log start of analysis
        const source = jobUrl ? 'url' : fileData ? 'file' : 'text';
        const jobTitleHint = fullJobText.substring(0, 100); // First 100 chars as hint
        logMatchAnalysisStart(userId, jobTitleHint, source);

        // 🔭 Initialize OpenTelemetry span
        span = startMatchAnalysisTrace({
            userId,
            source,
            jobTitle: jobTitleHint
        });

        // 3. Analyze Match with Gemini cascade
        const prompt = getMatchAnalysisPrompt(ragData.completeness_details, fullJobText);

        let result;
        let modelUsed;
        try {
            // 🔭 Trace AI model call with OpenTelemetry
            const cascadeResult = await traceAIModelCall(
                'gemini-cascade',
                'analysis',
                () => callWithRetry(() => generateWithCascade(prompt))
            );
            result = cascadeResult.result;
            modelUsed = cascadeResult.modelUsed;
            logger.debug("Match analysis completed", { modelUsed, userId });
        } catch (err: any) {
            logMatchAnalysisError(userId, err, 'analysis', { modelUsed });

            // 🔭 Record telemetry error
            if (span) {
                recordMatchAnalysisError(span, err, 'analysis', { userId, source, modelUsed });
            }

            logger.error("All models failed", { error: err.message, userId });
            return NextResponse.json({
                error: "Tous les modèles IA sont surchargés. Réessayez dans quelques minutes."
            }, { status: 503 });
        }

        const responseText = result.response.text();
        const jsonString = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

        let matchData;
        try {
            matchData = JSON.parse(jsonString);
        } catch (parseError) {
            logger.error("JSON parsing failed", { error: parseError, userId, responseText: responseText.substring(0, 200) });
            return NextResponse.json({
                error: "Erreur d'analyse. Réessayez avec moins de texte."
            }, { status: 500 });
        }

        // 🛡️ VALIDATION ZOD - CRITIQUE
        const validation = validateMatchAnalysis(matchData);

        if (!validation.success) {
            // 📊 Log validation failure avec détails structurés
            const validationError = validation.error || 'Unknown validation error';
            logMatchAnalysisValidationFailed(
                userId,
                validationError,
                JSON.stringify(matchData).substring(0, 500),
                modelUsed
            );

            // 🔭 Record validation failure in telemetry
            const missingFieldsForTelemetry: string[] = [];
            if (!matchData.salary_estimate) missingFieldsForTelemetry.push('salary_estimate');
            if (!matchData.coaching_tips) missingFieldsForTelemetry.push('coaching_tips');
            if (missingFieldsForTelemetry.length > 0) {
                recordValidationFailure(modelUsed, missingFieldsForTelemetry);
            }

            // Si validation échoue mais données basiques présentes, continuer quand même
            // L'enrichissement (salary/coaching) est optionnel
            if (!matchData.match_score || !matchData.strengths || !matchData.job_title) {
                logMatchAnalysisError(
                    userId,
                    new Error(validationError),
                    'validation',
                    { modelUsed }
                );

                // 🔭 Record telemetry error
                if (span) {
                    recordMatchAnalysisError(
                        span,
                        new Error(validationError),
                        'validation',
                        { userId, source, modelUsed }
                    );
                }

                return NextResponse.json({
                    error: "L'IA n'a pas pu analyser correctement cette offre. Réessayez.",
                    debug: process.env.NODE_ENV === 'development' ? validationError : undefined
                }, { status: 500 });
            }

            // 📊 Log enrichment missing
            const missingFields: string[] = [];
            if (!matchData.salary_estimate) missingFields.push('salary_estimate');
            if (!matchData.coaching_tips) missingFields.push('coaching_tips');

            logger.warn("Continuing with partial data", { missingFields, userId, modelUsed });
        }

        // Utiliser données validées si disponibles, sinon fallback sur données brutes
        const validatedData = validation.success ? validation.data : matchData;

        // Extract job_title and company with fallbacks
        const extractedJobTitle =
            validatedData.job_title ||
            matchData.jobTitle ||
            matchData.poste ||
            matchData.titre ||
            null;

        const extractedCompany =
            validatedData.company ||
            matchData.company ||
            matchData.entreprise ||
            matchData.societe ||
            null;

        const hasEnrichment = !!(validatedData.salary_estimate || validatedData.coaching_tips);
        const matchReportForDb = extractionDebug ? { ...validatedData, extraction_debug: extractionDebug } : validatedData;

        logger.info("Match analysis completed", {
            jobTitle: extractedJobTitle,
            company: extractedCompany,
            score: validatedData.match_score,
            hasEnrichment,
            userId,
            modelUsed
        });

        // 4. Save to DB
        const { data: insertData, error: insertError } = await supabase
            .from("job_analyses")
            .insert({
                user_id: userId,
                job_url: jobUrl,
                job_title: extractedJobTitle,
                company: extractedCompany,
                location: validatedData.location || null,
                job_description: fullJobText.substring(0, 10000),
                match_score: validatedData.match_score,
                match_level: validatedData.match_level,
                match_report: matchReportForDb,
                strengths: validatedData.strengths,
                gaps: validatedData.gaps,
                missing_keywords: validatedData.missing_keywords || [],
                decision: "pending"
            })
            .select("id")
            .single();

        if (insertError || !insertData) {
            logMatchAnalysisError(userId, insertError || new Error("No data returned"), 'save');
            throw new Error("Failed to save analysis");
        }

        // 📊 Log success avec métriques
        const durationMs = Date.now() - startTime;

        // 💰 Calculate estimated cost (approximate token counts)
        const estimatedInputTokens = Math.ceil(
            (JSON.stringify(ragData.completeness_details).length + fullJobText.length) / 4
        );
        const estimatedOutputTokens = Math.ceil(
            JSON.stringify(validatedData).length / 4
        );
        const costUsd = calculateAnalysisCost(
            estimatedInputTokens,
            estimatedOutputTokens,
            modelUsed
        );

        logMatchAnalysisSuccess(userId, insertData.id, {
            score: validatedData.match_score,
            jobTitle: extractedJobTitle || 'Unknown',
            hasEnrichment,
            validationPassed: validation.success,
            durationMs,
            modelUsed
        });

        // 🔭 Record telemetry success with complete metrics
        if (span) {
            recordMatchAnalysisSuccess(span, {
                userId,
                source,
                score: validatedData.match_score,
                modelUsed,
                hasEnrichment,
                validationPassed: validation.success,
                durationMs,
                costUsd
            });
        }

        // Track missing enrichment if validation succeeded but fields absent
        if (validation.success && !hasEnrichment) {
            const missingFields: string[] = [];
            if (!validatedData.salary_estimate) missingFields.push('salary_estimate');
            if (!validatedData.coaching_tips) missingFields.push('coaching_tips');
            if (missingFields.length > 0) {
                logEnrichmentMissing(userId, insertData.id, missingFields);
            }
        }

        return NextResponse.json({
            success: true,
            analysis_id: insertData.id,
            match: validatedData, // ← Retourne données validées
            model_used: modelUsed,
            validation_passed: validation.success,
            has_enrichment: hasEnrichment,
            duration_ms: durationMs,
            extraction_debug: extractionDebug
        });

    } catch (error: any) {
        logger.error("Analyze error", { error: error.message, stack: error.stack, userId, jobUrl, source: jobUrl ? 'url' : fileData ? 'file' : 'text' });

        // 🔭 Record telemetry error if span exists
        if (span) {
            recordMatchAnalysisError(
                span,
                error,
                'save',
                {
                    userId: body?.userId || 'unknown',
                    source: (jobUrl ? 'url' : fileData ? 'file' : 'text') as 'url' | 'text' | 'file',
                    modelUsed: undefined
                }
            );
        }

        return NextResponse.json({ error: "Erreur inattendue. Réessayez." }, { status: 500 });
    }
}
