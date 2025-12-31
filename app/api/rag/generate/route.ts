import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createSupabaseClient } from "@/lib/supabase";
import { getRAGExtractionPrompt, getTopJobsPrompt } from "@/lib/ai/prompts";

// Use Edge runtime for better compatibility on Vercel
export const runtime = "edge";

// Initialize Gemini directly here to ensure it works
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    const supabase = createSupabaseClient();

    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: "Missing userId" }, { status: 400 });
        }

        // 1. Fetch pending documents for this user
        const { data: docs, error: dbError } = await supabase
            .from("uploaded_documents")
            .select("*")
            .eq("user_id", userId)
            .eq("extraction_status", "pending");

        if (dbError) {
            console.error("DB Error:", dbError);
            return NextResponse.json({ error: "Database error" }, { status: 500 });
        }

        if (!docs || docs.length === 0) {
            return NextResponse.json({ message: "No pending documents found" });
        }

        let allExtractedText = "";
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        // 2. Extract text from each document using Gemini
        for (const doc of docs) {
            try {
                // Download file from Storage
                const { data: fileData, error: downloadError } = await supabase.storage
                    .from("documents")
                    .download(doc.storage_path);

                if (downloadError) {
                    console.error(`Error downloading ${doc.filename}:`, downloadError);
                    continue;
                }

                let text = "";
                const arrayBuffer = await fileData.arrayBuffer();

                if (doc.file_type === "pdf") {
                    // Use Gemini Vision to extract text from PDF
                    const base64Data = btoa(
                        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
                    );

                    const result = await model.generateContent([
                        {
                            inlineData: {
                                mimeType: "application/pdf",
                                data: base64Data
                            }
                        },
                        "Extrais tout le texte de ce document PDF. Retourne uniquement le contenu texte brut, sans formatage markdown ni commentaires."
                    ]);
                    text = result.response.text();
                } else if (doc.file_type === "docx") {
                    // For DOCX, we'll use Gemini as well since mammoth may not work on Edge
                    const base64Data = btoa(
                        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
                    );

                    const result = await model.generateContent([
                        {
                            inlineData: {
                                mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                                data: base64Data
                            }
                        },
                        "Extrais tout le texte de ce document Word. Retourne uniquement le contenu texte brut."
                    ]);
                    text = result.response.text();
                } else {
                    // Plain text, JSON, MD, TXT
                    const decoder = new TextDecoder("utf-8");
                    text = decoder.decode(arrayBuffer);
                }

                allExtractedText += `\n--- DOCUMENT: ${doc.filename} ---\n${text}\n`;

                // Update status to processed
                await supabase
                    .from("uploaded_documents")
                    .update({ extraction_status: "processed", extracted_text: text.slice(0, 10000) })
                    .eq("id", doc.id);

            } catch (extractError: any) {
                console.error(`Error extracting ${doc.filename}:`, extractError.message);
                // Mark as failed but continue
                await supabase
                    .from("uploaded_documents")
                    .update({ extraction_status: "failed" })
                    .eq("id", doc.id);
            }
        }

        if (!allExtractedText.trim()) {
            return NextResponse.json({ error: "No text could be extracted from documents" }, { status: 400 });
        }

        // 3. Process with Gemini to structure the RAG
        const prompt = getRAGExtractionPrompt(allExtractedText);
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Clean markdown if present
        const jsonString = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        let ragData;

        try {
            ragData = JSON.parse(jsonString);
        } catch (e) {
            console.error("Failed to parse Gemini JSON:", responseText.slice(0, 500));
            return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
        }

        // 4. Generate Top 10 Jobs
        const jobPrompt = getTopJobsPrompt(ragData);
        const jobResult = await model.generateContent(jobPrompt);
        const jobResponseText = jobResult.response.text();
        const jobJsonString = jobResponseText.replace(/```json/g, "").replace(/```/g, "").trim();
        let top10Jobs = [];
        try {
            top10Jobs = JSON.parse(jobJsonString);
        } catch (e) {
            console.warn("Failed to parse Top 10 Jobs");
        }

        // 5. Calculate completeness score
        const calculateCompletenessScore = (data: any): number => {
            let score = 0;
            const weights = {
                profil: 20,
                experiences: 30,
                competences: 25,
                formations: 15,
                projets: 10
            };

            if (data?.profil?.nom || data?.profil?.prenom) score += weights.profil;
            if (data?.experiences?.length > 0) score += Math.min(weights.experiences, data.experiences.length * 10);
            if (data?.competences?.techniques?.length > 0) score += Math.min(weights.competences, data.competences.techniques.length * 5);
            if (data?.formations?.length > 0) score += Math.min(weights.formations, data.formations.length * 7);
            if (data?.projets?.length > 0) score += Math.min(weights.projets, data.projets.length * 5);

            return Math.min(100, score);
        };

        const completenessScore = calculateCompletenessScore(ragData);

        // 6. Save RAG Metadata to Supabase
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

        // Update user profile completion
        await supabase.from("users").update({ onboarding_completed: true }).eq("id", userId);

        return NextResponse.json({ success: true, data: ragData });

    } catch (error: any) {
        console.error("RAG Generation error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
