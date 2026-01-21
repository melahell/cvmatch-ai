import { createSupabaseClient } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { generateWithCascade, callWithRetry } from "@/lib/ai/gemini";
import { getMatchAnalysisPrompt } from "@/lib/ai/prompts";
import { validateMatchAnalysis } from "@/lib/validations/match-analysis";
import {
    logMatchAnalysisStart,
    logMatchAnalysisSuccess,
    logMatchAnalysisValidationFailed,
    logMatchAnalysisError,
    logEnrichmentMissing
} from "@/lib/logging/match-analysis-logger";
import {
    startMatchAnalysisTrace,
    recordMatchAnalysisSuccess,
    recordMatchAnalysisError,
    recordValidationFailure,
    traceAIModelCall,
    calculateAnalysisCost
} from "@/lib/telemetry/safe-telemetry";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
    const supabase = createSupabaseClient();
    const startTime = Date.now(); // Pour tracking performance

    // 🔭 Start OpenTelemetry trace
    let span: any = null;
    let body: any = null;
    let userId: string | undefined;
    let jobUrl: string | undefined;
    let jobText: string | undefined;
    let fileData: string | undefined;

    try {
        body = await req.json();
        ({ userId, jobUrl, jobText, fileData } = body);
        const { fileName, fileType } = body;

        if (!userId) {
            return NextResponse.json({ error: "Utilisateur non identifié." }, { status: 400 });
        }

        if (!jobUrl && !jobText && !fileData) {
            return NextResponse.json({ error: "Fournissez une URL, un texte ou un fichier." }, { status: 400 });
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
                const mimeType = fileType || "image/png";

                const extractionPrompt = [
                    { inlineData: { mimeType, data: base64Data } },
                    "Extrais le texte complet de cette offre d'emploi. Retourne uniquement le texte brut."
                ];

                const { result, modelUsed } = await callWithRetry(() =>
                    generateWithCascade(extractionPrompt)
                );
                console.log(`File extraction with: ${modelUsed}`);
                fullJobText = result.response.text();

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
                const cheerio = await import("cheerio");
                const response = await fetch(jobUrl, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
                        "Accept": "text/html",
                        "Accept-Language": "fr-FR"
                    },
                    redirect: "follow"
                });

                if (!response.ok) {
                    return NextResponse.json({ error: "Site inaccessible. Utilisez 'Texte' ou 'Fichier'." }, { status: 400 });
                }

                const html = await response.text();
                const $ = cheerio.load(html);
                $('script, style, nav, header, footer, aside').remove();

                let content = "";
                for (const sel of ['[class*="description"]', 'article', 'main', '.content', 'body']) {
                    const found = $(sel).text().replace(/\s+/g, ' ').trim();
                    if (found && found.length > content.length) content = found;
                }
                fullJobText = content;

                if (fullJobText.length < 100) {
                    return NextResponse.json({ error: "Contenu insuffisant. Utilisez 'Texte' ou 'Fichier'." }, { status: 400 });
                }
            } catch {
                return NextResponse.json({ error: "URL illisible. Utilisez 'Texte' ou 'Fichier'." }, { status: 400 });
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
            console.log(`Match analysis with: ${modelUsed}`);
        } catch (err: any) {
            logMatchAnalysisError(userId, err, 'analysis', { modelUsed });

            // 🔭 Record telemetry error
            if (span) {
                recordMatchAnalysisError(span, err, 'analysis', { userId, source, modelUsed });
            }

            console.error("All models failed:", err.message);
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
            console.error("❌ JSON parsing failed:", parseError);
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

            console.warn("⚠️ Continuing with partial data (enrichment may be missing)");
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

        console.log(`📊 Match Analysis - job_title: "${extractedJobTitle}", company: "${extractedCompany}", score: ${validatedData.match_score}, enrichment: ${hasEnrichment}`);

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
                match_report: validatedData, // ← Utilise données validées
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
            duration_ms: durationMs
        });

    } catch (error: any) {
        console.error("Analyze Error:", error);

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
