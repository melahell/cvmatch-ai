import { NextResponse } from "next/server";
import { createSupabaseAdminClient, createSupabaseUserClient, requireSupabaseUser } from "@/lib/supabase";
import { getRAGExtractionPrompt } from "@/lib/ai/prompts";
import { getDocumentProxy, extractText } from "unpdf";
import { validateRAGData, formatValidationReport } from "@/lib/rag/validation";
import { consolidateClients } from "@/lib/rag/consolidate-clients";
import { calculateQualityScore, formatQualityScoreReport } from "@/lib/rag/quality-scoring";
import { generateContexteEnrichi } from "@/lib/rag/contexte-enrichi";

import { mergeRAGData, MergeResult } from "@/lib/rag/merge-simple";
import { deduplicateRAG } from "@/lib/rag/deduplicate";
import { saveRAGVersion } from "@/lib/rag/versioning";
import { checkRateLimit, createRateLimitError, getRateLimitConfig } from "@/lib/utils/rate-limit";
import { truncateForRAGExtraction } from "@/lib/utils/text-truncate";
import { logger } from "@/lib/utils/logger";
import { callWithRetry, generateWithCascade } from "@/lib/ai/gemini";
import { normalizeRAGData } from "@/lib/utils/normalize-rag";
import { safeParseJSON } from "@/lib/ai/safe-json-parser";
import { ragExtractionSchema } from "@/lib/ai/schemas";
import { normalizeDocumentType } from "@/lib/rag/document-type";

// Use Node.js runtime for env vars and libraries
export const runtime = "nodejs";
export const maxDuration = 300; // Allow up to 5 minutes for processing (Vercel Pro+)

export async function POST(req: Request) {
    // Check API key first
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        logger.error("GEMINI_API_KEY not found in environment");
        return NextResponse.json({ error: "Server configuration error: Missing AI API key" }, { status: 500 });
    }

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

        const { mode } = await req.json();
        // mode: "creation" | "completion" | "regeneration" | undefined
        // - creation: First time RAG generation (no existing RAG)
        // - completion: Add to existing RAG (smart merge - default)
        // - regeneration: Overwrite existing RAG completely

        logger.info("RAG generation start", { mode: mode || "auto" });

        // Rate limiting: 5 RAG generations per hour
        const rateLimitResult = await checkRateLimit(`rag:${userId}`, getRateLimitConfig(tier, "RAG_GENERATION"));
        if (!rateLimitResult.success) {
            return NextResponse.json(createRateLimitError(rateLimitResult), { status: 429 });
        }

        // 1. Fetch ALL documents for this user
        const { data: docs, error: dbError } = await supabase
            .from("uploaded_documents")
            .select("*")
            .eq("user_id", userId)
            ;

        if (dbError) {
            logger.error("DB Error", { error: dbError.message });
            return NextResponse.json({ error: "Database error: " + dbError.message }, { status: 500 });
        }

        if (!docs || docs.length === 0) {
            return NextResponse.json({ message: "No documents found for this user" });
        }

        let allExtractedText = "";

        const generateGemini = (prompt: string | any[]) => callWithRetry(() => generateWithCascade(prompt), 4);

        let processedCount = 0;
        const processingResults: any[] = [];

        // 2. Extract text from each document
        for (const doc of docs) {
            try {
                const normalizedType = normalizeDocumentType({ filename: doc.filename, storedFileType: doc.file_type });

                // If already processed with text, use it
                if (doc.extracted_text && doc.extracted_text.trim().length > 0) {
                    allExtractedText += `\n--- DOCUMENT: ${doc.filename} ---\n${doc.extracted_text}\n`;
                    processedCount++;
                    processingResults.push({ filename: doc.filename, status: "used_cached" });
                    continue;
                }

                await supabase
                    .from("uploaded_documents")
                    .update({ extraction_status: "processing", extraction_error: null })
                    .eq("id", doc.id)
                    .eq("user_id", userId);

                // Download file from Storage
                const { data: fileData, error: downloadError } = await supabase.storage
                    .from("documents")
                    .download(doc.storage_path);

                if (downloadError) {
                    logger.error("Error downloading document", { filename: doc.filename, error: downloadError.message });
                    processingResults.push({ filename: doc.filename, status: "download_failed", error: downloadError.message });
                    await supabase
                        .from("uploaded_documents")
                        .update({ extraction_status: "failed", extraction_error: downloadError.message })
                        .eq("id", doc.id)
                        .eq("user_id", userId);
                    continue;
                }

                let text = "";
                const arrayBuffer = await fileData.arrayBuffer();

                // Extract based on file type
                if (normalizedType === "pdf") {
                    // Use unpdf for PDF extraction
                    try {
                        const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer));
                        const { text: pdfText } = await extractText(pdf, { mergePages: true });
                        text = pdfText;
                    } catch (pdfError: any) {
                        logger.error("PDF extraction failed", { filename: doc.filename, error: pdfError.message });
                        processingResults.push({ filename: doc.filename, status: "extraction_failed", error: pdfError.message });
                        await supabase
                            .from("uploaded_documents")
                            .update({ extraction_status: "failed", extraction_error: pdfError.message })
                            .eq("id", doc.id)
                            .eq("user_id", userId);
                        continue;
                    }
                } else if (normalizedType === "docx") {
                    // For DOCX, use mammoth (dynamic import to avoid Edge issues)
                    try {
                        const mammoth = await import("mammoth");
                        const buffer = Buffer.from(arrayBuffer);
                        const result = await mammoth.extractRawText({ buffer });
                        text = result.value;
                    } catch (docxError: any) {
                        logger.error("DOCX extraction failed", { filename: doc.filename, error: docxError.message });
                        processingResults.push({ filename: doc.filename, status: "extraction_failed", error: docxError.message });
                        await supabase
                            .from("uploaded_documents")
                            .update({ extraction_status: "failed", extraction_error: docxError.message })
                            .eq("id", doc.id)
                            .eq("user_id", userId);
                        continue;
                    }
                } else if (normalizedType === "doc" || normalizedType === "odt") {
                    const message = `Format non supporté pour l'extraction (${normalizedType}). Convertissez en PDF ou DOCX.`;
                    processingResults.push({ filename: doc.filename, status: "unsupported_type", error: message });
                    await supabase
                        .from("uploaded_documents")
                        .update({ extraction_status: "failed", extraction_error: message })
                        .eq("id", doc.id)
                        .eq("user_id", userId);
                    continue;
                } else {
                    // Plain text files (txt, md, json, csv, etc.)
                    const decoder = new TextDecoder("utf-8");
                    text = decoder.decode(arrayBuffer);
                }

                if (text.trim()) {
                    allExtractedText += `\n--- DOCUMENT: ${doc.filename} ---\n${text}\n`;
                    processedCount++;
                    processingResults.push({ filename: doc.filename, status: "extracted" });

                    await supabase
                        .from("uploaded_documents")
                        .update({ extraction_status: "completed", extracted_text: text })
                        .eq("id", doc.id)
                        .eq("user_id", userId);
                } else {
                    const message = "Texte extrait vide";
                    processingResults.push({ filename: doc.filename, status: "empty_content" });
                    await supabase
                        .from("uploaded_documents")
                        .update({ extraction_status: "failed", extraction_error: message })
                        .eq("id", doc.id)
                        .eq("user_id", userId);
                }

            } catch (docError: any) {
                logger.error("Error processing document", { filename: doc.filename, error: docError.message });
                processingResults.push({ filename: doc.filename, status: "error", error: docError.message });
                try {
                    await supabase
                        .from("uploaded_documents")
                        .update({ extraction_status: "failed", extraction_error: docError.message })
                        .eq("id", doc.id)
                        .eq("user_id", userId);
                } catch {}
            }
        }

        if (!allExtractedText.trim()) {
            return NextResponse.json({
                error: "No text could be extracted from any document",
                processingResults
            }, { status: 400 });
        }

        // [CDC-1] Alerte si extraction très courte (CV potentiellement vide/image)
        const extractedLength = allExtractedText.trim().length;
        if (extractedLength < 100) {
            logger.warn("Extraction warning: very short content", { length: extractedLength });
            return NextResponse.json({
                error: "Extraction insuffisante",
                warning: `Le contenu extrait est très court (${extractedLength} caractères). Le document pourrait être une image scannée, protégé ou vide.`,
                suggestion: "Essayez d'importer un document texte éditable (DOCX, PDF textuel) ou vérifiez que le fichier n'est pas corrompu.",
                processingResults
            }, { status: 400 });
        }

        // Truncate text if too large (prevents Gemini token limit issues)
        const { text: finalExtractedText, stats: truncationStats } = truncateForRAGExtraction(allExtractedText);

        if (truncationStats.wasTruncated) {
            logger.warn('Extracted text truncated', {
                originalTokens: truncationStats.originalTokens,
                finalTokens: truncationStats.finalTokens,
                truncatedPercentage: truncationStats.truncatedPercentage
            });
        }

        logger.info('Text extraction complete', {
            documentsProcessed: processedCount,
            finalTokens: truncationStats.finalTokens,
            wasTruncated: truncationStats.wasTruncated
        });

        // 3. Process with Gemini to structure the RAG
        const prompt = getRAGExtractionPrompt(finalExtractedText);
        const { result, modelUsed } = await generateGemini(prompt);
        const responseText = result.response.text();

        // [CDC Sprint 2.3] Parse avec validation Zod
        const parseResult = safeParseJSON(responseText, ragExtractionSchema);

        if (!parseResult.success) {
            logger.error("Failed to parse RAG JSON", {
                responseLength: responseText.length,
                error: parseResult.error
            });
            return NextResponse.json({ error: "AI returned invalid format, please try again" }, { status: 500 });
        }

        let ragData = normalizeRAGData(parseResult.data);

        // [CDC Phase 2.1] Dédupliquer automatiquement après parsing
        ragData = deduplicateRAG(ragData);
        logger.info("RAG deduplication applied");

        // ═══════════════════════════════════════════════════════════════
        // NEW: POST-EXTRACTION PROCESSING PIPELINE
        // ═══════════════════════════════════════════════════════════════

        // Step 1: Validate extracted data (lightweight logging)
        const validationResult = validateRAGData(ragData);
        logger.info("RAG validation", { warnings: validationResult.warnings.length });

        // Step 2: Consolidate client references
        ragData = consolidateClients(ragData);
        logger.info("RAG consolidation", { clients: ragData?.references?.clients?.length || 0 });

        // Step 3: Contextual Enrichment - Deduce implicit responsibilities & tacit skills
        try {
            logger.info("RAG enrichment start");
            const contexteEnrichi = await generateContexteEnrichi(ragData);
            if (contexteEnrichi && (contexteEnrichi.responsabilites_implicites.length > 0 || contexteEnrichi.competences_tacites.length > 0)) {
                ragData.contexte_enrichi = contexteEnrichi;
                logger.info("RAG enrichment success", {
                    responsabilites: contexteEnrichi.responsabilites_implicites?.length || 0,
                    competences: contexteEnrichi.competences_tacites?.length || 0,
                });
            }
        } catch (e: any) {
            logger.warn("RAG enrichment failed (non-blocking)", { error: e?.message });
            // Non-blocking - continue without enrichment
        }

        // Step 4: Calculate quality score (multi-dimensional)
        const qualityScoreResult = calculateQualityScore(ragData);
        logger.info("RAG scoring", { overall: qualityScoreResult.overall_score });

        // Step 5: Add extraction metadata
        ragData.extraction_metadata = {
            gemini_model_used: modelUsed,
            extraction_date: new Date().toISOString(),
            documents_processed: docs.map(d => d.filename),
            warnings: validationResult.warnings.map(w => `[${w.severity}] ${w.category}: ${w.message}`)
        };

        // Step 6: Add quality metrics
        ragData.quality_metrics = qualityScoreResult.quality_metrics;

        // Step 7: Generate improvement suggestions (inline replacement)
        const suggestions: string[] = [];
        if (validationResult.metrics.quantification_percentage < 60) {
            suggestions.push(`Ajouter des impacts quantifiés (actuellement ${validationResult.metrics.quantification_percentage}%)`);
        }
        if (validationResult.metrics.elevator_pitch_length < 200) {
            suggestions.push(`Enrichir l'elevator pitch (${validationResult.metrics.elevator_pitch_length} caractères)`);
        }
        if (validationResult.metrics.clients_count < 3) {
            suggestions.push(`Ajouter des références clients (${validationResult.metrics.clients_count} trouvés)`);
        }
        logger.info("RAG suggestions", { count: suggestions.length });
        // 4. Generate Top 10 Jobs - DISABLED to prevent timeout
        // TODO: Move to separate endpoint for async generation
        let top10Jobs: any[] = [];
        // try {
        //     const jobPrompt = getTopJobsPrompt(ragData);
        //     const jobResult = await callWithRetry(() => generateWithFallback(jobPrompt));
        //     const jobJsonString = jobResult.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
        //     top10Jobs = JSON.parse(jobJsonString);
        // } catch (e) {
        //     logger.warn("Failed to generate Top 10 Jobs, continuing without");
        // }

        // 6. Handle merge based on mode:
        // - regeneration: Overwrite completely
        // - completion/undefined: Smart merge
        const { data: existingRag } = await supabase
            .from("rag_metadata")
            .select("id, completeness_details")
            .eq("user_id", userId)
            .single();

        const existingNormalized = existingRag?.completeness_details
            ? normalizeRAGData(existingRag.completeness_details)
            : null;

        let finalRAGData = ragData;
        let mergeStats: any = null;
        let actualMode = mode || "auto";

        if (mode === "regeneration") {
            // REGENERATION: Overwrite completely, but preserve user rejections
            logger.info("RAG mode", { mode: "regeneration" });
            finalRAGData = ragData;

            // Preserve rejected_inferred from existing (user preference must be respected)
            if (existingNormalized?.rejected_inferred) {
                finalRAGData.rejected_inferred = existingNormalized.rejected_inferred;
            }

            actualMode = "regeneration";
        } else if (existingNormalized) {
            // COMPLETION: Smart merge with existing
            logger.info("RAG mode", { mode: "completion" });
            const mergeResult = mergeRAGData(existingNormalized, ragData);
            finalRAGData = mergeResult.merged;
            mergeStats = mergeResult.stats;
            logger.info("RAG merge", { stats: mergeStats });

            actualMode = "completion";
        } else {
            // CREATION: First time
            logger.info("RAG mode", { mode: "creation" });
            actualMode = "creation";
        }

        // Add metadata about how RAG was generated/updated
        finalRAGData.metadata = {
            ...finalRAGData.metadata,
            update_mode: actualMode,
            last_update: new Date().toISOString(),
            gemini_model_used: modelUsed
        };

        // Use new multi-dimensional quality score (overall_score is the main score)
        // But we keep completeness_score for backward compatibility
        const completenessScore = qualityScoreResult.overall_score;
        const breakdown = qualityScoreResult.breakdown;

        // [CDC Sprint 1.3] Auto-save version before updating RAG
        if (existingNormalized) {
            try {
                const versionReason = actualMode === "regeneration" ? "regeneration" : "merge";
                await saveRAGVersion(supabase, userId, existingNormalized, {
                    reason: versionReason as "regeneration" | "merge",
                    includeDiff: true,
                });
                logger.info("RAG version saved before update", { userId, reason: versionReason });
            } catch (versionError) {
                // Non-blocking: log error but continue with update
                logger.warn("Failed to save RAG version (non-blocking)", {
                    userId,
                    error: versionError instanceof Error ? versionError.message : "Unknown"
                });
            }
        }

        if (existingRag) {
            const { error: updateError } = await supabase
                .from("rag_metadata")
                .update({
                    completeness_score: completenessScore,
                    completeness_details: finalRAGData,
                    top_10_jobs: top10Jobs,
                    last_updated: new Date().toISOString()
                })
                .eq("user_id", userId);

            if (updateError) {
                logger.error("Error updating rag_metadata", { error: updateError.message });
                return NextResponse.json({
                    error: 'Database error: Failed to save profile data',
                    errorCode: 'DB_UPDATE_FAILED',
                    details: updateError.message
                }, { status: 500 });
            }
        } else {
            const { error: insertError } = await supabase
                .from("rag_metadata")
                .insert({
                    user_id: userId,
                    completeness_score: completenessScore,
                    completeness_details: finalRAGData,
                    top_10_jobs: top10Jobs
                });

            if (insertError) {
                logger.error("Error inserting rag_metadata", { error: insertError.message });
                return NextResponse.json({
                    error: 'Database error: Failed to create profile data',
                    errorCode: 'DB_INSERT_FAILED',
                    details: insertError.message
                }, { status: 500 });
            }
        }

        await supabase.from("users").update({ onboarding_completed: true }).eq("id", userId);

        return NextResponse.json({
            success: true,
            processedDocuments: processedCount,
            completenessScore,
            model_used: modelUsed,
            processingResults,
            data: finalRAGData,
            // Merge stats (if merged)
            merge: mergeStats ? {
                merged: true,
                itemsAdded: mergeStats.itemsAdded,
                itemsUpdated: mergeStats.itemsUpdated,
                itemsKept: mergeStats.itemsKept
            } : { merged: false },
            // Quality metrics
            quality_breakdown: {
                overall: qualityScoreResult.overall_score,
                completeness: qualityScoreResult.completeness_score,
                quality: qualityScoreResult.quality_score,
                impact: qualityScoreResult.impact_score
            },
            // Validation warnings (ALL levels for user visibility)
            validation: {
                isValid: validationResult.isValid,
                warnings: validationResult.warnings.map(w => ({
                    severity: w.severity,
                    category: w.category,
                    message: w.message
                })),
                metrics: validationResult.metrics
            },
            // Improvement suggestions
            suggestions: suggestions.length > 0 ? suggestions.slice(0, 5) : []
        });

    } catch (error: any) {
        logger.error("RAG Generation error", { error: error?.message });

        // Granular error handling
        if (error.message?.includes("GEMINI") || error.message?.includes("API")) {
            return NextResponse.json({
                error: 'AI service error: Unable to process your documents at this time',
                errorCode: 'GEMINI_ERROR',
                details: error.message,
                retry: true
            }, { status: 503 });
        }

        if (error.message?.includes("PDF") || error.message?.includes("extraction")) {
            return NextResponse.json({
                error: 'Document extraction error: Unable to read your documents',
                errorCode: 'EXTRACTION_ERROR',
                details: error.message,
                retry: false
            }, { status: 400 });
        }

        if (error.message?.includes("Database") || error.message?.includes("Supabase")) {
            return NextResponse.json({
                error: 'Database error: Unable to save your profile',
                errorCode: 'DATABASE_ERROR',
                details: error.message,
                retry: true
            }, { status: 500 });
        }

        // Generic error
        return NextResponse.json({
            error: 'Unexpected error during profile generation',
            errorCode: 'UNKNOWN_ERROR',
            details: error.message || "Internal server error",
            retry: true
        }, { status: 500 });
    }
}
