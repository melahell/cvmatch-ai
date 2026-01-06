import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createSupabaseClient } from "@/lib/supabase";
import { getRAGExtractionPrompt, getTopJobsPrompt } from "@/lib/ai/prompts";
import { getDocumentProxy, extractText } from "unpdf";
// Merge engine temporarily disabled - format compatibility issue
// import { mergeRAGData, MergeResult } from "@/lib/rag/merge-engine";
// import { RAGComplete, createEmptyRAG, calculateRAGCompleteness } from "@/types/rag-complete";

// Use Node.js runtime for env vars and libraries
export const runtime = "nodejs";
export const maxDuration = 60; // Allow up to 60 seconds for processing

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

        // 3. Process with Gemini to structure the RAG
        const prompt = getRAGExtractionPrompt(allExtractedText);
        const result = await callWithRetry(() => generateWithFallback(prompt));
        const responseText = result.response.text();

        // DEBUG: Log what Gemini actually returns
        console.log('=== GEMINI RAG RESPONSE ===');
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

        // 4. Generate Top 10 Jobs
        let top10Jobs: any[] = [];
        try {
            const jobPrompt = getTopJobsPrompt(ragData);
            const jobResult = await callWithRetry(() => generateWithFallback(jobPrompt));
            const jobJsonString = jobResult.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
            top10Jobs = JSON.parse(jobJsonString);
        } catch (e) {
            console.warn("Failed to generate Top 10 Jobs, continuing without");
        }

        // 5. Calculate completeness score with breakdown
        const calculateCompletenessWithBreakdown = (data: any) => {
            const breakdown: { category: string; score: number; max: number; missing?: string }[] = [];
            let total = 0;

            // Profil (20 points)
            const hasProfile = data?.profil?.nom && data?.profil?.prenom && data?.profil?.titre_principal;
            const profileScore = hasProfile ? 20 : (data?.profil?.nom || data?.profil?.prenom) ? 10 : 0;
            breakdown.push({
                category: "Identité",
                score: profileScore,
                max: 20,
                missing: !hasProfile ? "Ajoutez nom, prénom et titre principal" : undefined
            });
            total += profileScore;

            // Expériences (30 points)
            const expCount = data?.experiences?.length || 0;
            const expScore = Math.min(30, expCount * 10);
            breakdown.push({
                category: "Expériences",
                score: expScore,
                max: 30,
                missing: expCount < 3 ? `${3 - expCount} expérience(s) recommandée(s) en plus` : undefined
            });
            total += expScore;

            // Compétences (25 points)
            const techCount = data?.competences?.techniques?.length || 0;
            const techScore = Math.min(25, techCount * 5);
            breakdown.push({
                category: "Compétences techniques",
                score: techScore,
                max: 25,
                missing: techCount < 5 ? `Ajoutez ${5 - techCount} compétence(s) technique(s)` : undefined
            });
            total += techScore;

            // Formations (15 points)
            const formCount = data?.formations?.length || 0;
            const formScore = Math.min(15, formCount * 7);
            breakdown.push({
                category: "Formations",
                score: formScore,
                max: 15,
                missing: formCount === 0 ? "Ajoutez au moins une formation" : undefined
            });
            total += formScore;

            // Projets/Langues (10 points)
            const hasLangOrProj = (data?.langues && Object.keys(data.langues).length > 0) || data?.projets?.length > 0;
            const extraScore = hasLangOrProj ? 10 : 0;
            breakdown.push({
                category: "Langues/Projets",
                score: extraScore,
                max: 10,
                missing: !hasLangOrProj ? "Ajoutez des langues ou projets personnels" : undefined
            });
            total += extraScore;

            return { score: Math.min(100, total), breakdown };
        };

        // Legacy calculation preserved for backup/debugging (not used)
        // const { score: _legacyScore, breakdown: completenessBreakdown } = calculateCompletenessWithBreakdown(ragData);

        // 6. Save RAG Metadata (simple update - merge disabled due to format compatibility)
        const { data: existingRag } = await supabase
            .from("rag_metadata")
            .select("id")
            .eq("user_id", userId)
            .single();

        // Use legacy completeness calculation (more reliable with current data format)
        const { score: completenessScore } = calculateCompletenessWithBreakdown(ragData);

        if (existingRag) {
            const { error: updateError } = await supabase
                .from("rag_metadata")
                .update({
                    completeness_score: completenessScore,
                    completeness_details: ragData,
                    top_10_jobs: top10Jobs,
                    last_updated: new Date().toISOString()
                })
                .eq("user_id", userId);

            if (updateError) {
                console.error('Error updating rag_metadata:', updateError);
                return NextResponse.json({ error: 'Failed to save RAG data: ' + updateError.message }, { status: 500 });
            }
        } else {
            const { error: insertError } = await supabase
                .from("rag_metadata")
                .insert({
                    user_id: userId,
                    completeness_score: completenessScore,
                    completeness_details: ragData,
                    top_10_jobs: top10Jobs
                });

            if (insertError) {
                console.error('Error inserting rag_metadata:', insertError);
                return NextResponse.json({ error: 'Failed to save RAG data: ' + insertError.message }, { status: 500 });
            }
        }

        await supabase.from("users").update({ onboarding_completed: true }).eq("id", userId);

        return NextResponse.json({
            success: true,
            processedDocuments: processedCount,
            completenessScore,
            processingResults,
            data: ragData
        });

    } catch (error: any) {
        console.error("RAG Generation error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
