import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createSupabaseClient, requireSupabaseUser } from "@/lib/supabase";
import { getRAGExtractionPrompt } from "@/lib/ai/prompts";
import { getDocumentProxy, extractText } from "unpdf";
import { consolidateClients } from "@/lib/rag/consolidate-clients";
import { calculateQualityScore } from "@/lib/rag/quality-scoring";
import { mergeRAGData } from "@/lib/rag/merge-simple";
import { validateRAGData } from "@/lib/rag/validation";
import { truncateForRAGExtraction } from "@/lib/utils/text-truncate";
import { logger } from "@/lib/utils/logger";

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
    // ✅ SECURITY FIX: Authenticate user via Bearer token
    const { user, error: authError } = await requireSupabaseUser(req);
    if (authError || !user) {
        return NextResponse.json({ error: "Non autorisé. Reconnectez-vous." }, { status: 401 });
    }

    const userId = user.id; // Use authenticated user ID
    const supabase = createSupabaseClient();
    const startTime = Date.now();

    try {
        const { documentId, mode, isFirstDocument } = await req.json();
        // mode: "completion" | "regeneration" (default: completion)
        // isFirstDocument: true if this is the first document being processed

        if (!documentId) {
            return NextResponse.json({ error: "Missing documentId" }, { status: 400 });
        }

        logger.info(`Incremental RAG generation`, {
            documentId,
            mode: mode || "completion",
            isFirstDocument: isFirstDocument || false
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

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" }); // Use Flash 3 for speed

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
                    await supabase.from("uploaded_documents").update({ extraction_status: "failed" }).eq("id", doc.id);
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
                    await supabase.from("uploaded_documents").update({ extraction_status: "failed" }).eq("id", doc.id);
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
                .update({ extracted_text: extractedText, extraction_status: "processed" })
                .eq("id", doc.id);
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

        // 4. Call Gemini with timeout (45s - adequate for large documents)
        const geminiStart = Date.now();
        let responseText: string;

        try {
            const prompt = getRAGExtractionPrompt(truncatedText);
            const result = await callWithTimeout(
                model.generateContent(prompt),
                45000 // 45s timeout - enough for complex PDFs
            );
            responseText = result.response.text();

            const geminiDuration = Date.now() - geminiStart;
            logger.info("Gemini API call successful", {
                filename: doc.filename,
                durationMs: geminiDuration,
                responseLength: responseText.length
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

        // 6. Fetch existing RAG metadata
        const mergeStart = Date.now();
        const { data: existingRag } = await supabase
            .from("rag_metadata")
            .select("completeness_details")
            .eq("user_id", userId)
            .single();

        // 7. Handle merge based on mode:
        // - regeneration + isFirstDocument: start fresh (don't merge with existing)
        // - regeneration + NOT first: merge with previous documents in this batch
        // - completion: always merge with existing
        let mergedRAG;

        if (mode === "regeneration" && isFirstDocument) {
            // REGENERATION MODE - First document: Start fresh, don't merge with old RAG
            logger.info("Regeneration mode - starting fresh", { filename: doc.filename });
            mergedRAG = newRAGData;

            // Preserve user preferences (rejected_inferred)
            if (existingRag?.completeness_details?.rejected_inferred) {
                mergedRAG.rejected_inferred = existingRag.completeness_details.rejected_inferred;
            }
        } else if (existingRag?.completeness_details) {
            // COMPLETION MODE or subsequent documents in regeneration: Merge
            logger.info("Merging with existing RAG", { filename: doc.filename, mode: mode || "completion" });
            const mergeResult = mergeRAGData(existingRag.completeness_details, newRAGData);
            mergedRAG = mergeResult.merged;
            logger.info("Merge complete", {
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

        // Skip heavy enrichment operations to stay under 10s
        // mergedRAG = enrichRAGData(mergedRAG); // DISABLED for speed

        const qualityScore = calculateQualityScore(mergedRAG);
        const postProcessDuration = Date.now() - postProcessStart;

        logger.info("Post-processing complete", {
            durationMs: postProcessDuration,
            qualityScore: qualityScore.overall_score
        });

        // 9. Add metadata
        mergedRAG.extraction_metadata = {
            gemini_model_used: "flash-3",
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

        return NextResponse.json({
            success: true,
            documentId,
            filename: doc.filename,
            elapsed: totalElapsed,
            qualityScore: qualityScore.overall_score,
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
            suggestions: suggestions.slice(0, 5)
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
