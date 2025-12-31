import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createSupabaseClient } from "@/lib/supabase";
import { getRAGExtractionPrompt, getTopJobsPrompt } from "@/lib/ai/prompts";

export const runtime = "edge";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    const supabase = createSupabaseClient();

    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: "Missing userId" }, { status: 400 });
        }

        // 1. Fetch ALL documents for this user (pending OR processed)
        // We want to use the extracted_text from processed ones too
        const { data: docs, error: dbError } = await supabase
            .from("uploaded_documents")
            .select("*")
            .eq("user_id", userId)
            .in("extraction_status", ["pending", "processed"]);

        if (dbError) {
            console.error("DB Error:", dbError);
            return NextResponse.json({ error: "Database error: " + dbError.message }, { status: 500 });
        }

        if (!docs || docs.length === 0) {
            return NextResponse.json({ message: "No documents found" });
        }

        let allExtractedText = "";
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        let processedCount = 0;

        // 2. Extract text from each document
        for (const doc of docs) {
            try {
                // If already processed, use stored text
                if (doc.extraction_status === "processed" && doc.extracted_text) {
                    allExtractedText += `\n--- DOCUMENT: ${doc.filename} ---\n${doc.extracted_text}\n`;
                    processedCount++;
                    continue;
                }

                // Skip if already failed
                if (doc.extraction_status === "failed") {
                    continue;
                }

                // Download file from Storage
                const { data: fileData, error: downloadError } = await supabase.storage
                    .from("documents")
                    .download(doc.storage_path);

                if (downloadError) {
                    console.error(`Error downloading ${doc.filename}:`, downloadError);
                    await supabase.from("uploaded_documents").update({ extraction_status: "failed" }).eq("id", doc.id);
                    continue;
                }

                let text = "";
                const arrayBuffer = await fileData.arrayBuffer();

                // For text files, decode directly
                if (doc.file_type === "txt" || doc.file_type === "md" || doc.file_type === "json") {
                    const decoder = new TextDecoder("utf-8");
                    text = decoder.decode(arrayBuffer);
                } else if (doc.file_type === "pdf" || doc.file_type === "docx") {
                    // For PDFs/DOCX, try Gemini Vision but handle failure gracefully
                    try {
                        const base64Data = btoa(
                            new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
                        );

                        const mimeType = doc.file_type === "pdf"
                            ? "application/pdf"
                            : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

                        const result = await model.generateContent([
                            {
                                inlineData: {
                                    mimeType,
                                    data: base64Data
                                }
                            },
                            "Extrais tout le texte de ce document. Retourne uniquement le contenu texte brut."
                        ]);
                        text = result.response.text();
                    } catch (extractError: any) {
                        console.error(`Gemini extraction failed for ${doc.filename}:`, extractError.message);
                        await supabase.from("uploaded_documents").update({ extraction_status: "failed" }).eq("id", doc.id);
                        continue;
                    }
                }

                if (text.trim()) {
                    allExtractedText += `\n--- DOCUMENT: ${doc.filename} ---\n${text}\n`;
                    processedCount++;

                    await supabase
                        .from("uploaded_documents")
                        .update({ extraction_status: "processed", extracted_text: text.slice(0, 10000) })
                        .eq("id", doc.id);
                }

            } catch (docError: any) {
                console.error(`Error processing ${doc.filename}:`, docError.message);
                await supabase.from("uploaded_documents").update({ extraction_status: "failed" }).eq("id", doc.id);
            }
        }

        if (!allExtractedText.trim()) {
            return NextResponse.json({ error: "No text could be extracted from any document" }, { status: 400 });
        }

        // 3. Process with Gemini to structure the RAG
        const prompt = getRAGExtractionPrompt(allExtractedText);
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        const jsonString = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        let ragData;

        try {
            ragData = JSON.parse(jsonString);
        } catch (e) {
            console.error("Failed to parse RAG JSON:", responseText.slice(0, 500));
            return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
        }

        // 4. Generate Top 10 Jobs
        let top10Jobs: any[] = [];
        try {
            const jobPrompt = getTopJobsPrompt(ragData);
            const jobResult = await model.generateContent(jobPrompt);
            const jobJsonString = jobResult.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
            top10Jobs = JSON.parse(jobJsonString);
        } catch (e) {
            console.warn("Failed to generate Top 10 Jobs");
        }

        // 5. Calculate completeness score
        const calculateCompletenessScore = (data: any): number => {
            let score = 0;
            if (data?.profil?.nom || data?.profil?.prenom) score += 20;
            if (data?.experiences?.length > 0) score += Math.min(30, data.experiences.length * 10);
            if (data?.competences?.techniques?.length > 0) score += Math.min(25, data.competences.techniques.length * 5);
            if (data?.formations?.length > 0) score += Math.min(15, data.formations.length * 7);
            if (data?.projets?.length > 0) score += Math.min(10, data.projets.length * 5);
            return Math.min(100, score);
        };

        const completenessScore = calculateCompletenessScore(ragData);

        // 6. Save RAG Metadata
        const { data: existingRag } = await supabase
            .from("rag_metadata")
            .select("id")
            .eq("user_id", userId)
            .single();

        if (existingRag) {
            await supabase
                .from("rag_metadata")
                .update({
                    completeness_score: completenessScore,
                    completeness_details: ragData,
                    top_10_jobs: top10Jobs,
                    last_updated: new Date().toISOString()
                })
                .eq("user_id", userId);
        } else {
            await supabase
                .from("rag_metadata")
                .insert({
                    user_id: userId,
                    completeness_score: completenessScore,
                    completeness_details: ragData,
                    top_10_jobs: top10Jobs
                });
        }

        await supabase.from("users").update({ onboarding_completed: true }).eq("id", userId);

        return NextResponse.json({
            success: true,
            processedDocuments: processedCount,
            completenessScore,
            data: ragData
        });

    } catch (error: any) {
        console.error("RAG Generation error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
