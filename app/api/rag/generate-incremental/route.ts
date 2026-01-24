import { NextResponse } from "next/server";
import { createSupabaseAdminClient, createSupabaseUserClient, requireSupabaseUser } from "@/lib/supabase";
import { getRAGExtractionPrompt } from "@/lib/ai/prompts";
import { formatRAGForPrompt } from "@/lib/rag/format-rag-for-prompt";
import { getDocumentProxy, extractText } from "unpdf";
import { consolidateClients } from "@/lib/rag/consolidate-clients";
import { calculateQualityScore } from "@/lib/rag/quality-scoring";
import { mergeRAGData } from "@/lib/rag/merge-simple";
import { validateRAGData } from "@/lib/rag/validation";
import { truncateForRAGExtraction } from "@/lib/utils/text-truncate";
import { logger } from "@/lib/utils/logger";
import { callWithRetry, generateWithCascade } from "@/lib/ai/gemini";
import { checkRateLimit, createRateLimitError, getRateLimitConfig } from "@/lib/utils/rate-limit";
import { generateContexteEnrichi } from "@/lib/rag/contexte-enrichi";

// Use Node.js runtime for env vars and libraries
export const runtime = "nodejs";
export const maxDuration = 60; // 60s for Vercel Pro/Team - reduce to 10 for free plan

// Timeout wrapper for Gemini API calls
async function callWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
        )
    ]);
}

/**
 * Incremental RAG generation endpoint
 * Processes ONE document at a time and merges with existing RAG
 * Compatible with Vercel Free plan (10s max)
 */
export async function POST(req: Request) {
    const startTime = Date.now();

    try {
        const auth = await requireSupabaseUser(req);
        if (auth.error || !auth.user || !auth.token) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const supabase = createSupabaseUserClient(auth.token);
        const admin = createSupabaseAdminClient();
        const userId = auth.user.id;

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

        const rateLimitResult = checkRateLimit(`rag:${userId}`, getRateLimitConfig(tier, "RAG_GENERATION"));
        if (!rateLimitResult.success) {
            return NextResponse.json(createRateLimitError(rateLimitResult), { status: 429 });
        }

        const { documentId, mode, isFirstDocument, isLastDocument } = await req.json();
        // mode: "completion" | "regeneration" (default: completion)
        // isFirstDocument: true if this is the first document being processed

        if (!documentId) {
            return NextResponse.json({ error: "Missing documentId" }, { status: 400 });
        }

        logger.info(`Incremental RAG generation`, {
            documentId,
            mode: mode || "completion",
            isFirstDocument: isFirstDocument || false,
            isLastDocument: isLastDocument || false,
        });

        // Check API key
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            logger.error("GEMINI_API_KEY not found");
            return NextResponse.json({
                error: "Server configuration error",
                errorCode: "CONFIG_ERROR"
            }, { status: 500 });
        }

        // 1. Fetch the specific document
        const { data: doc, error: dbError } = await supabase
            .from("uploaded_documents")
            .select("*")
            .eq("id", documentId)
            .eq("user_id", userId)
            .single();

        if (dbError || !doc) {
            return NextResponse.json({
                error: "Document not found",
                errorCode: "DOC_NOT_FOUND"
            }, { status: 404 });
        }

        logger.info(`Processing document incrementally`, { filename: doc.filename, documentId });

        // 2. Extract text from this document (if not already cached)
        let extractedText = doc.extracted_text;
        const extractStart = Date.now();

        if (!extractedText || extractedText.trim().length === 0) {
            logger.info(`Extracting text from document`, { filename: doc.filename, type: doc.file_type });

            const { data: fileData, error: downloadError } = await supabase.storage
                .from("documents")
                .download(doc.storage_path);

            if (downloadError) {
                logger.error("Failed to download document", { error: downloadError.message });
                return NextResponse.json({
                    error: "Failed to download document",
                    errorCode: "DOWNLOAD_ERROR"
                }, { status: 500 });
            }

            const arrayBuffer = await fileData.arrayBuffer();

            // Extract based on file type
            if (doc.file_type === "pdf") {
                try {
                    const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer));
                    const { text: pdfText } = await extractText(pdf, { mergePages: true });
                    extractedText = pdfText;
                } catch (pdfError: any) {
                    logger.error("PDF extraction failed", { error: pdfError.message, filename: doc.filename });
                    await supabase
                        .from("uploaded_documents")
                        .update({ extraction_status: "failed" })
                        .eq("id", doc.id)
                        .eq("user_id", userId);
                    return NextResponse.json({
                        error: "PDF extraction failed",
                        errorCode: "PDF_ERROR"
                    }, { status: 500 });
                }
            } else if (doc.file_type === "docx") {
                try {
                    const mammoth = await import("mammoth");
                    const buffer = Buffer.from(arrayBuffer);
                    const result = await mammoth.extractRawText({ buffer });
                    extractedText = result.value;
                } catch (docxError: any) {
                    logger.error("DOCX extraction failed", { error: docxError.message, filename: doc.filename });
                    await supabase
                        .from("uploaded_documents")
                        .update({ extraction_status: "failed" })
                        .eq("id", doc.id)
                        .eq("user_id", userId);
                    return NextResponse.json({
                        error: "DOCX extraction failed",
                        errorCode: "DOCX_ERROR"
                    }, { status: 500 });
                }
            } else {
                // Plain text
                const decoder = new TextDecoder("utf-8");
                extractedText = decoder.decode(arrayBuffer);
            }

            // Cache the extracted text
            await supabase
                .from("uploaded_documents")
                .update({ extracted_text: extractedText, extraction_status: "completed" })
                .eq("id", doc.id)
                .eq("user_id", userId);
        }

        const extractDuration = Date.now() - extractStart;
        logger.info("Text extraction complete", {
            filename: doc.filename,
            extractionTimeMs: extractDuration,
            textLength: extractedText.length
        });

        // 3. Truncate text before sending to Gemini (prevent timeout)
        const { text: truncatedText, stats: truncationStats } = truncateForRAGExtraction(extractedText);

        if (truncationStats.wasTruncated) {
            logger.warn("Text truncated for Gemini", {
                filename: doc.filename,
                originalTokens: truncationStats.originalTokens,
                finalTokens: truncationStats.finalTokens,
                truncatedPercentage: truncationStats.truncatedPercentage
            });
        }

        // 4. Fetch existing RAG to provide context to Gemini (CRITICAL: Gemini sees accumulated context)
        const { data: existingRag } = await supabase
            .from("rag_metadata")
            .select("completeness_details")
            .eq("user_id", userId)
            .maybeSingle();

        let existingRAGContext: string | undefined = undefined;
        
        // Only include existing RAG context if:
        // - NOT in regeneration mode with first document (start fresh)
        // - OR in completion mode (always enrich)
        // - OR in regeneration mode but NOT first document (enrich with previous documents)
        if (!(mode === "regeneration" && isFirstDocument) && existingRag?.completeness_details) {
            existingRAGContext = formatRAGForPrompt(existingRag.completeness_details);
            logger.info("Including existing RAG context in prompt", {
                filename: doc.filename,
                existingExperiences: existingRag.completeness_details.experiences?.length || 0,
                contextLength: existingRAGContext.length
            });
        } else {
            logger.info("Starting fresh - no existing RAG context", {
                filename: doc.filename,
                mode,
                isFirstDocument
            });
        }

        // 5. Call Gemini with timeout (45s - adequate for large documents)
        const geminiStart = Date.now();
        let responseText: string;
        let modelUsed: string | null = null;

        try {
            const prompt = getRAGExtractionPrompt(truncatedText, existingRAGContext);
            const cascade = await callWithRetry(
                () => callWithTimeout(generateWithCascade(prompt), 45000),
                3
            );
            modelUsed = cascade.modelUsed;
            responseText = cascade.result.response.text();

            const geminiDuration = Date.now() - geminiStart;
            logger.info("Gemini API call successful", {
                filename: doc.filename,
                durationMs: geminiDuration,
                responseLength: responseText.length,
                modelUsed
            });
        } catch (geminiError: any) {
            const geminiDuration = Date.now() - geminiStart;
            logger.error("Gemini API call failed", {
                error: geminiError.message,
                durationMs: geminiDuration
            });
            return NextResponse.json({
                error: "AI service timeout or error",
                errorCode: "GEMINI_TIMEOUT",
                details: geminiError.message
            }, { status: 503 });
        }

        // 5. Parse JSON response
        const jsonString = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        let newRAGData;

        try {
            newRAGData = JSON.parse(jsonString);
            logger.info("Gemini response parsed successfully", { filename: doc.filename });
        } catch (e) {
            logger.error("Failed to parse RAG JSON", {
                filename: doc.filename,
                responsePreview: responseText.slice(0, 200)
            });
            return NextResponse.json({
                error: "AI returned invalid format",
                errorCode: "PARSE_ERROR"
            }, { status: 500 });
        }

        // 6. Fetch existing RAG metadata (for merge logic)
        const mergeStart = Date.now();
        // Note: existingRag was already fetched above for context, but we need it again for merge
        // If we already have it, reuse it; otherwise fetch again
        let existingRagForMerge = existingRag;
        if (!existingRagForMerge) {
            const { data: fetched } = await supabase
                .from("rag_metadata")
                .select("completeness_details")
                .eq("user_id", userId)
                .maybeSingle();
            existingRagForMerge = fetched;
        }

        // 7. Handle merge based on mode:
        // IMPORTANT: Since Gemini already saw the existing RAG context, newRAGData should already be enriched
        // But we still do a light merge to handle edge cases and conflicts
        let mergedRAG;

        if (mode === "regeneration" && isFirstDocument) {
            // REGENERATION MODE - First document: Start fresh, don't merge with old RAG
            logger.info("Regeneration mode - starting fresh", { filename: doc.filename });
            mergedRAG = newRAGData;

            // Preserve user preferences (rejected_inferred)
            if (existingRagForMerge?.completeness_details?.rejected_inferred) {
                mergedRAG.rejected_inferred = existingRagForMerge.completeness_details.rejected_inferred;
            }
        } else if (existingRAGContext && existingRagForMerge?.completeness_details) {
            // Gemini already saw the context, so newRAGData should be enriched
            // But do a light merge to handle any edge cases
            logger.info("Light merge after context-aware extraction", { filename: doc.filename, mode: mode || "completion" });
            const mergeResult = mergeRAGData(existingRagForMerge.completeness_details, newRAGData);
            mergedRAG = mergeResult.merged;
            logger.info("Light merge complete", {
                itemsAdded: mergeResult.stats.itemsAdded,
                itemsUpdated: mergeResult.stats.itemsUpdated,
                conflictsCount: mergeResult.conflicts.length
            });
        } else {
            // No existing RAG - creating base
            logger.info("First document - creating base RAG", { filename: doc.filename });
            mergedRAG = newRAGData;
        }

        // 8. Post-process: consolidate clients + lightweight enrichment + score
        const postProcessStart = Date.now();
        mergedRAG = consolidateClients(mergedRAG);

        // Enrichissement contextuel: amélioré pour être plus systématique
        // Tentative d'enrichissement même si ce n'est pas le dernier document (budget limité)
        // Priorité au dernier document pour enrichissement complet
        if (isLastDocument) {
            const elapsedBefore = Date.now() - startTime;
            const remainingBudgetMs = 52000 - elapsedBefore;
            if (remainingBudgetMs > 8000) {
                try {
                    logger.info("Starting contextual enrichment", { remainingBudgetMs });
                    const contexteEnrichi = await generateContexteEnrichi(mergedRAG, async (prompt: string) => {
                        const cascade = await callWithTimeout(
                            callWithRetry(() => generateWithCascade(prompt)),
                            Math.min(15000, Math.max(9000, remainingBudgetMs - 1000))
                        );
                        return cascade.result;
                    });
                    if (contexteEnrichi) {
                        mergedRAG.contexte_enrichi = contexteEnrichi;
                        logger.info("Contextual enrichment completed", {
                            responsabilites: contexteEnrichi.responsabilites_implicites?.length || 0,
                            competences: contexteEnrichi.competences_tacites?.length || 0
                        });
                    }
                } catch (e: any) {
                    logger.warn("Incremental enrichment failed (non-blocking)", { error: e?.message });
                }
            } else {
                logger.warn("Skipping enrichment - insufficient time budget", { remainingBudgetMs });
            }
        } else {
            // Pour les documents intermédiaires, on peut faire un enrichissement léger si budget disponible
            // Mais on priorise le dernier document pour l'enrichissement complet
            const elapsedBefore = Date.now() - startTime;
            const remainingBudgetMs = 52000 - elapsedBefore;
            if (remainingBudgetMs > 12000) {
                // Seulement si on a beaucoup de temps disponible
                try {
                    logger.info("Light contextual enrichment for intermediate document", { remainingBudgetMs });
                    const contexteEnrichi = await generateContexteEnrichi(mergedRAG, async (prompt: string) => {
                        const cascade = await callWithTimeout(
                            callWithRetry(() => generateWithCascade(prompt)),
                            Math.min(8000, Math.max(5000, remainingBudgetMs - 2000))
                        );
                        return cascade.result;
                    });
                    if (contexteEnrichi) {
                        // Merge avec enrichissement existant si présent
                        if (mergedRAG.contexte_enrichi) {
                            mergedRAG.contexte_enrichi = {
                                responsabilites_implicites: [
                                    ...(mergedRAG.contexte_enrichi.responsabilites_implicites || []),
                                    ...(contexteEnrichi.responsabilites_implicites || [])
                                ],
                                competences_tacites: [
                                    ...(mergedRAG.contexte_enrichi.competences_tacites || []),
                                    ...(contexteEnrichi.competences_tacites || [])
                                ],
                                soft_skills_deduites: [
                                    ...(mergedRAG.contexte_enrichi.soft_skills_deduites || []),
                                    ...(contexteEnrichi.soft_skills_deduites || [])
                                ],
                                environnement_travail: contexteEnrichi.environnement_travail || mergedRAG.contexte_enrichi.environnement_travail
                            };
                        } else {
                            mergedRAG.contexte_enrichi = contexteEnrichi;
                        }
                    }
                } catch (e: any) {
                    // Silently fail for intermediate documents
                    logger.debug("Light enrichment skipped for intermediate document", { error: e?.message });
                }
            }
        }

        const qualityScore = calculateQualityScore(mergedRAG);
        const postProcessDuration = Date.now() - postProcessStart;

        logger.info("Post-processing complete", {
            durationMs: postProcessDuration,
            qualityScore: qualityScore.overall_score
        });

        // 9. Add metadata
        mergedRAG.extraction_metadata = {
            gemini_model_used: modelUsed,
            extraction_date: new Date().toISOString(),
            documents_processed: [doc.filename],
            warnings: []
        };
        mergedRAG.quality_metrics = qualityScore.quality_metrics;

        // 10. Save merged RAG to database
        const dbStart = Date.now();
        if (existingRag) {
            await supabase
                .from("rag_metadata")
                .update({
                    completeness_score: qualityScore.overall_score,
                    completeness_details: mergedRAG,
                    last_updated: new Date().toISOString()
                })
                .eq("user_id", userId);
        } else {
            await supabase
                .from("rag_metadata")
                .insert({
                    user_id: userId,
                    completeness_score: qualityScore.overall_score,
                    completeness_details: mergedRAG,
                    top_10_jobs: []
                });
        }

        await supabase.from("users").update({ onboarding_completed: true }).eq("id", userId);

        const dbDuration = Date.now() - dbStart;
        logger.info("Database update complete", { durationMs: dbDuration });

        const totalElapsed = Date.now() - startTime;

        logger.info("Incremental RAG generation complete", {
            filename: doc.filename,
            totalDurationMs: totalElapsed,
            qualityScore: qualityScore.overall_score,
            underBudget: totalElapsed < 10000
        });

        // 11. Run validation for user feedback
        const validationResult = validateRAGData(mergedRAG);

        // 12. Generate improvement suggestions based on validation
        const suggestions: string[] = [];
        
        // NEW: Validate minimum realisations per experience
        const experiencesWithFewRealisations = (mergedRAG.experiences || []).filter((exp: any) => {
            const realCount = (exp.realisations || []).length;
            return realCount > 0 && realCount < 6;
        });
        
        if (experiencesWithFewRealisations.length > 0) {
            const avgRealisations = Math.round(
                experiencesWithFewRealisations.reduce((sum: number, exp: any) => 
                    sum + (exp.realisations || []).length, 0) / experiencesWithFewRealisations.length
            );
            suggestions.push(
                `⚠️ ${experiencesWithFewRealisations.length} expérience(s) avec moins de 6 réalisations ` +
                `(moyenne: ${avgRealisations}). Le document source semble contenir plus d'informations. ` +
                `Considérez une re-génération avec mode "regeneration" pour extraire tous les détails.`
            );
        }
        
        if (validationResult.metrics.quantification_percentage < 60) {
            suggestions.push(`Ajouter des impacts quantifiés (actuellement ${validationResult.metrics.quantification_percentage}%, objectif 60%+)`);
        }
        if (validationResult.metrics.elevator_pitch_length < 200) {
            suggestions.push(`Enrichir l'elevator pitch (actuellement ${validationResult.metrics.elevator_pitch_length} caractères, recommandé 200-400)`);
        }
        if (validationResult.metrics.clients_count < 3) {
            suggestions.push(`Ajouter des références clients (actuellement: ${validationResult.metrics.clients_count})`);
        }
        if (validationResult.metrics.elevator_pitch_numbers_count < 3) {
            suggestions.push(`Ajouter des chiffres clés dans l'elevator pitch (actuellement: ${validationResult.metrics.elevator_pitch_numbers_count})`);
        }
        
        // Add validation warning for insufficient realisations
        if (experiencesWithFewRealisations.length > 0) {
            validationResult.warnings.push({
                severity: 'warning' as const,
                category: 'completeness',
                message: `${experiencesWithFewRealisations.length} expérience(s) avec moins de 6 réalisations. Le RAG pourrait être plus riche.`
            });
        }

        return NextResponse.json({
            success: true,
            documentId,
            filename: doc.filename,
            elapsed: totalElapsed,
            qualityScore: qualityScore.overall_score,
            model_used: modelUsed,
            stats: {
                clientsCount: mergedRAG?.references?.clients?.length || 0,
                experiencesCount: mergedRAG?.experiences?.length || 0,
                skillsCount: mergedRAG?.competences?.explicit?.techniques?.length || 0
            },
            timings: {
                extractionMs: extractDuration,
                geminiMs: geminiStart > 0 ? Date.now() - geminiStart : 0,
                postProcessMs: postProcessDuration,
                dbMs: dbDuration,
                totalMs: totalElapsed
            },
            // NEW: Validation data for ValidationWarnings component
            validation: {
                isValid: validationResult.isValid,
                warnings: validationResult.warnings.filter(w => w.severity !== 'info').slice(0, 10).map(w => ({
                    severity: w.severity,
                    category: w.category,
                    message: w.message
                })),
                metrics: validationResult.metrics
            },
            quality_breakdown: {
                overall: qualityScore.overall_score,
                completeness: qualityScore.completeness_score || Math.round(qualityScore.overall_score * 0.9),
                quality: qualityScore.quality_metrics?.elevator_pitch_quality_score || Math.round(qualityScore.overall_score * 0.85),
                impact: validationResult.metrics.quantification_percentage || Math.round(qualityScore.overall_score * 0.8)
            },
            suggestions: suggestions.slice(0, 5),
            // Merge stats (si mode completion)
            mergeStats: mergeResult ? {
                itemsAdded: mergeResult.stats.itemsAdded,
                itemsUpdated: mergeResult.stats.itemsUpdated,
                itemsKept: mergeResult.stats.itemsKept
            } : undefined
        });

    } catch (error: any) {
        const elapsed = Date.now() - startTime;
        logger.error("Incremental RAG generation failed", {
            error: error.message,
            durationMs: elapsed,
            stack: error.stack
        });

        return NextResponse.json({
            error: error.message || "Internal server error",
            errorCode: "UNKNOWN_ERROR",
            elapsed
        }, { status: 500 });
    }
}
