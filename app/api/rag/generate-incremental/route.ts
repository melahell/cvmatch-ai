import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createSupabaseClient } from "@/lib/supabase";
import { getRAGExtractionPrompt } from "@/lib/ai/prompts";
import { getDocumentProxy, extractText } from "unpdf";
import { validateRAGData } from "@/lib/rag/validation";
import { consolidateClients } from "@/lib/rag/consolidate-clients";
import { calculateQualityScore } from "@/lib/rag/quality-scoring";
import { enrichRAGData, generateImprovementSuggestions } from "@/lib/rag/enrichment";
import { mergeRAGData } from "@/lib/rag/merge-simple";

// Use Node.js runtime for env vars and libraries
export const runtime = "nodejs";
export const maxDuration = 10; // Keep under 10s for Vercel Free plan

/**
 * Incremental RAG generation endpoint
 * Processes ONE document at a time and merges with existing RAG
 * Compatible with Vercel Free plan (10s max)
 */
export async function POST(req: Request) {
    const supabase = createSupabaseClient();
    const startTime = Date.now();

    try {
        const { userId, documentId } = await req.json();

        if (!userId || !documentId) {
            return NextResponse.json({ error: "Missing userId or documentId" }, { status: 400 });
        }

        // Check API key
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("GEMINI_API_KEY not found");
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Use Flash for speed

        // 1. Fetch the specific document
        const { data: doc, error: dbError } = await supabase
            .from("uploaded_documents")
            .select("*")
            .eq("id", documentId)
            .eq("user_id", userId)
            .single();

        if (dbError || !doc) {
            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }

        console.log(`[INCREMENTAL] Processing: ${doc.filename}`);

        // 2. Extract text from this document (if not already cached)
        let extractedText = doc.extracted_text;

        if (!extractedText || extractedText.trim().length === 0) {
            console.log(`[INCREMENTAL] Extracting text from ${doc.filename}...`);

            const { data: fileData, error: downloadError } = await supabase.storage
                .from("documents")
                .download(doc.storage_path);

            if (downloadError) {
                return NextResponse.json({ error: "Failed to download document" }, { status: 500 });
            }

            const arrayBuffer = await fileData.arrayBuffer();

            // Extract based on file type
            if (doc.file_type === "pdf") {
                try {
                    const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer));
                    const { text: pdfText } = await extractText(pdf, { mergePages: true });
                    extractedText = pdfText;
                } catch (pdfError: any) {
                    console.error(`PDF extraction failed:`, pdfError.message);
                    await supabase.from("uploaded_documents").update({ extraction_status: "failed" }).eq("id", doc.id);
                    return NextResponse.json({ error: "PDF extraction failed" }, { status: 500 });
                }
            } else if (doc.file_type === "docx") {
                try {
                    const mammoth = await import("mammoth");
                    const buffer = Buffer.from(arrayBuffer);
                    const result = await mammoth.extractRawText({ buffer });
                    extractedText = result.value;
                } catch (docxError: any) {
                    console.error(`DOCX extraction failed:`, docxError.message);
                    await supabase.from("uploaded_documents").update({ extraction_status: "failed" }).eq("id", doc.id);
                    return NextResponse.json({ error: "DOCX extraction failed" }, { status: 500 });
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

        console.log(`[INCREMENTAL] Text extracted: ${extractedText.length} chars`);

        // 3. Call Gemini with simplified prompt for this document
        const prompt = getRAGExtractionPrompt(extractedText);
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        const jsonString = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        let newRAGData;

        try {
            newRAGData = JSON.parse(jsonString);
            console.log(`[INCREMENTAL] Gemini response parsed successfully`);
        } catch (e) {
            console.error("Failed to parse RAG JSON");
            return NextResponse.json({ error: "AI returned invalid format" }, { status: 500 });
        }

        // 4. Fetch existing RAG metadata
        const { data: existingRag } = await supabase
            .from("rag_metadata")
            .select("completeness_details")
            .eq("user_id", userId)
            .single();

        // 5. Merge with existing RAG (or use new data if first document)
        let mergedRAG;
        if (existingRag?.completeness_details) {
            console.log(`[INCREMENTAL] Merging with existing RAG...`);
            const mergeResult = mergeRAGData(existingRag.completeness_details, newRAGData);
            mergedRAG = mergeResult.merged;
            console.log(`[INCREMENTAL] Merge stats:`, {
                added: mergeResult.stats.itemsAdded,
                updated: mergeResult.stats.itemsUpdated,
                conflicts: mergeResult.conflicts.length
            });
        } else {
            console.log(`[INCREMENTAL] First document - using as base`);
            mergedRAG = newRAGData;
        }

        // 6. Post-process: consolidate clients + enrich + score
        mergedRAG = consolidateClients(mergedRAG);
        mergedRAG = enrichRAGData(mergedRAG);
        const qualityScore = calculateQualityScore(mergedRAG);

        // Add metadata
        mergedRAG.extraction_metadata = {
            gemini_model_used: "flash",
            extraction_date: new Date().toISOString(),
            documents_processed: [doc.filename],
            warnings: []
        };
        mergedRAG.quality_metrics = qualityScore.quality_metrics;

        // 7. Save merged RAG to database
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

        const elapsed = Date.now() - startTime;
        console.log(`[INCREMENTAL] Completed in ${elapsed}ms`);

        return NextResponse.json({
            success: true,
            documentId,
            filename: doc.filename,
            elapsed,
            qualityScore: qualityScore.overall_score,
            stats: {
                clientsCount: mergedRAG?.references?.clients?.length || 0,
                experiencesCount: mergedRAG?.experiences?.length || 0,
                skillsCount: mergedRAG?.competences?.explicit?.techniques?.length || 0
            }
        });

    } catch (error: any) {
        const elapsed = Date.now() - startTime;
        console.error(`[INCREMENTAL] Error after ${elapsed}ms:`, error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
