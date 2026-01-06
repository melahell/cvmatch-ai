import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createSupabaseClient } from "@/lib/supabase";
import { getRAGExtractionPrompt, getTopJobsPrompt } from "@/lib/ai/prompts";
import { getDocumentProxy, extractText } from "unpdf";
import { validateRAGData, formatValidationReport } from "@/lib/rag/validation";
import { consolidateClients } from "@/lib/rag/consolidate-clients";
import { calculateQualityScore, formatQualityScoreReport } from "@/lib/rag/quality-scoring";
import { enrichRAGData, generateImprovementSuggestions } from "@/lib/rag/enrichment";
import { mergeRAGData, MergeResult } from "@/lib/rag/merge-simple";
import { checkRateLimit, RATE_LIMITS, createRateLimitError } from "@/lib/utils/rate-limit";
import { truncateForRAGExtraction } from "@/lib/utils/text-truncate";
import { logger } from "@/lib/utils/logger";

// Use Node.js runtime for env vars and libraries
export const runtime = "nodejs";
export const maxDuration = 300; // Allow up to 5 minutes for processing (Vercel Pro+)

// Retry wrapper with exponential backoff for rate limits
async function callWithRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 2,
    baseDelay: number = 5000
): Promise<T> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            const isRateLimit = error.message?.includes("429") || error.message?.includes("quota");
            if (isRateLimit && attempt < maxRetries - 1) {
                const delay = baseDelay * Math.pow(2, attempt); // 30s, 60s, 120s
                console.log(`Rate limited, waiting ${delay / 1000}s before retry ${attempt + 2}/${maxRetries}`);
                await new Promise(r => setTimeout(r, delay));
                continue;
            }
            throw error;
        }
    }
    throw new Error("Max retries exceeded");
}

export async function POST(req: Request) {
    const supabase = createSupabaseClient();

    // Check API key first
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("GEMINI_API_KEY not found in environment");
        return NextResponse.json({ error: "Server configuration error: Missing AI API key" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: "Missing userId" }, { status: 400 });
        }

        // Rate limiting: 5 RAG generations per hour
        const rateLimitResult = checkRateLimit(`rag:${userId}`, RATE_LIMITS.RAG_GENERATION);
        if (!rateLimitResult.success) {
            return NextResponse.json(createRateLimitError(rateLimitResult), { status: 429 });
        }

        // 1. Fetch ALL documents for this user
        const { data: docs, error: dbError } = await supabase
            .from("uploaded_documents")
            .select("*")
            .eq("user_id", userId)
            .in("extraction_status", ["pending", "processed", "failed"]);

        if (dbError) {
            console.error("DB Error:", dbError);
            return NextResponse.json({ error: "Database error: " + dbError.message }, { status: 500 });
        }

        if (!docs || docs.length === 0) {
            return NextResponse.json({ message: "No documents found for this user" });
        }

        let allExtractedText = "";

        // Tiered model strategy: Pro for critical tasks, Flash as fallback
        const proModel = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });
        const flashModel = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        let useProModel = true; // Start with Pro, fallback to Flash if quota exceeded

        // Smart generation with automatic fallback
        const generateWithFallback = async (prompt: string | any[]): Promise<any> => {
            try {
                if (useProModel) {
                    return await proModel.generateContent(prompt);
                }
            } catch (error: any) {
                if (error.message?.includes("429") || error.message?.includes("quota")) {
                    console.log("Pro model quota exceeded, switching to Flash");
                    useProModel = false;
                }
            }
            return await flashModel.generateContent(prompt);
        };

        let processedCount = 0;
        const processingResults: any[] = [];

        // 2. Extract text from each document
        for (const doc of docs) {
            try {
                // If already processed with text, use it
                if (doc.extracted_text && doc.extracted_text.trim().length > 0) {
                    allExtractedText += `\n--- DOCUMENT: ${doc.filename} ---\n${doc.extracted_text}\n`;
                    processedCount++;
                    processingResults.push({ filename: doc.filename, status: "used_cached" });
                    continue;
                }

                // Download file from Storage
                const { data: fileData, error: downloadError } = await supabase.storage
                    .from("documents")
                    .download(doc.storage_path);

                if (downloadError) {
                    console.error(`Error downloading ${doc.filename}:`, downloadError);
                    processingResults.push({ filename: doc.filename, status: "download_failed", error: downloadError.message });
                    continue;
                }

                let text = "";
                const arrayBuffer = await fileData.arrayBuffer();

                // Extract based on file type
                if (doc.file_type === "pdf") {
                    // Use unpdf for PDF extraction
                    try {
                        const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer));
                        const { text: pdfText } = await extractText(pdf, { mergePages: true });
                        text = pdfText;
                    } catch (pdfError: any) {
                        console.error(`PDF extraction failed for ${doc.filename}:`, pdfError.message);
                        processingResults.push({ filename: doc.filename, status: "extraction_failed", error: pdfError.message });
                        await supabase.from("uploaded_documents").update({ extraction_status: "failed" }).eq("id", doc.id);
                        continue;
                    }
                } else if (doc.file_type === "docx") {
                    // For DOCX, use mammoth (dynamic import to avoid Edge issues)
                    try {
                        const mammoth = await import("mammoth");
                        const buffer = Buffer.from(arrayBuffer);
                        const result = await mammoth.extractRawText({ buffer });
                        text = result.value;
                    } catch (docxError: any) {
                        console.error(`DOCX extraction failed for ${doc.filename}:`, docxError.message);
                        processingResults.push({ filename: doc.filename, status: "extraction_failed", error: docxError.message });
                        await supabase.from("uploaded_documents").update({ extraction_status: "failed" }).eq("id", doc.id);
                        continue;
                    }
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
                        .update({ extraction_status: "processed", extracted_text: text })
                        .eq("id", doc.id);
                } else {
                    processingResults.push({ filename: doc.filename, status: "empty_content" });
                }

            } catch (docError: any) {
                console.error(`Error processing ${doc.filename}:`, docError.message);
                processingResults.push({ filename: doc.filename, status: "error", error: docError.message });
            }
        }

        if (!allExtractedText.trim()) {
            return NextResponse.json({
                error: "No text could be extracted from any document",
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
        const result = await callWithRetry(() => generateWithFallback(prompt));
        const responseText = result.response.text();

        // Track which model was used
        const modelUsed = useProModel ? "pro" : "flash";

        // DEBUG: Log what Gemini actually returns
        console.log('=== GEMINI RAG RESPONSE ===');
        console.log('Model used:', modelUsed);
        console.log('Response length:', responseText.length);
        console.log('First 2000 chars:', responseText.slice(0, 2000));

        const jsonString = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        let ragData;

        try {
            ragData = JSON.parse(jsonString);

            // DEBUG: Log the parsed structure
            console.log('=== PARSED RAG DATA ===');
            console.log('Keys:', Object.keys(ragData));
            console.log('Has profil?', !!ragData.profil);
            console.log('Has experiences?', !!ragData.experiences, 'Count:', ragData.experiences?.length || 0);
            console.log('Has competences?', !!ragData.competences);
            console.log('Has formations?', !!ragData.formations, 'Count:', ragData.formations?.length || 0);
            console.log('Full structure sample:', JSON.stringify(ragData, null, 2).slice(0, 1000));
        } catch (e) {
            console.error("Failed to parse RAG JSON:", responseText.slice(0, 1000));
            return NextResponse.json({ error: "AI returned invalid format, please try again" }, { status: 500 });
        }

        // ═══════════════════════════════════════════════════════════════
        // NEW: POST-EXTRACTION PROCESSING PIPELINE
        // ═══════════════════════════════════════════════════════════════

        // Step 1: Validate extracted data (lightweight logging)
        const validationResult = validateRAGData(ragData);
        console.log('[VALIDATION] Warnings:', validationResult.warnings.length);

        // Step 2: Consolidate client references
        ragData = consolidateClients(ragData);
        console.log('[CONSOLIDATION] Clients:', ragData?.references?.clients?.length || 0);

        // Step 3: Enrich data (normalize, compute fields, detect anomalies)
        ragData = enrichRAGData(ragData);
        console.log('[ENRICHMENT] Operations:', ragData.enrichment_metadata?.enrichment_log?.length || 0);

        // Step 4: Calculate quality score (multi-dimensional)
        const qualityScoreResult = calculateQualityScore(ragData);
        console.log('[SCORING] Overall:', qualityScoreResult.overall_score);

        // Step 5: Add extraction metadata
        ragData.extraction_metadata = {
            gemini_model_used: modelUsed,
            extraction_date: new Date().toISOString(),
            documents_processed: docs.map(d => d.filename),
            warnings: validationResult.warnings.map(w => `[${w.severity}] ${w.category}: ${w.message}`)
        };

        // Step 6: Add quality metrics
        ragData.quality_metrics = qualityScoreResult.quality_metrics;

        // Step 7: Generate improvement suggestions
        const suggestions = generateImprovementSuggestions(ragData);
        console.log('[SUGGESTIONS]:', suggestions.length);

        // 4. Generate Top 10 Jobs - DISABLED to prevent timeout
        // TODO: Move to separate endpoint for async generation
        let top10Jobs: any[] = [];
        // try {
        //     const jobPrompt = getTopJobsPrompt(ragData);
        //     const jobResult = await callWithRetry(() => generateWithFallback(jobPrompt));
        //     const jobJsonString = jobResult.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
        //     top10Jobs = JSON.parse(jobJsonString);
        // } catch (e) {
        //     console.warn("Failed to generate Top 10 Jobs, continuing without");
        // }

        // 6. Merge with existing RAG data (if any) to avoid data loss
        const { data: existingRag } = await supabase
            .from("rag_metadata")
            .select("id, completeness_details")
            .eq("user_id", userId)
            .single();

        let finalRAGData = ragData;
        let mergeStats: any = null;

        if (existingRag?.completeness_details) {
            console.log('[MERGE] Merging with existing RAG data...');
            const mergeResult = mergeRAGData(existingRag.completeness_details, ragData);
            finalRAGData = mergeResult.merged;
            mergeStats = mergeResult.stats;
            console.log('[MERGE] Stats:', mergeStats);
        }

        // Use new multi-dimensional quality score (overall_score is the main score)
        // But we keep completeness_score for backward compatibility
        const completenessScore = qualityScoreResult.overall_score;
        const breakdown = qualityScoreResult.breakdown;

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
                console.error('Error updating rag_metadata:', updateError);
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
                console.error('Error inserting rag_metadata:', insertError);
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
        console.error("RAG Generation error:", error);

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
