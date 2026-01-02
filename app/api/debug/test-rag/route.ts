import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createSupabaseClient } from "@/lib/supabase";
import { getRAGExtractionPrompt } from "@/lib/ai/prompts";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
    const supabase = createSupabaseClient();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return NextResponse.json({ error: "Missing API key" }, { status: 500 });
    }

    try {
        const { userId } = await req.json();

        // Get user's documents
        const { data: docs } = await supabase
            .from("uploaded_documents")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (!docs || docs.length === 0) {
            return NextResponse.json({ error: "No documents found" }, { status: 404 });
        }

        // Simple concatenation of extracted text
        let allText = "";
        for (const doc of docs) {
            if (doc.extracted_text) {
                allText += `\n--- ${doc.filename} ---\n${doc.extracted_text}\n`;
            }
        }

        if (!allText) {
            return NextResponse.json({ error: "No extracted text found in documents" }, { status: 400 });
        }

        // Call Gemini
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = getRAGExtractionPrompt(allText);

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Try to parse
        const jsonString = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        let ragData;

        try {
            ragData = JSON.parse(jsonString);
        } catch (e) {
            return NextResponse.json({
                error: "Failed to parse Gemini response",
                raw: responseText.slice(0, 5000),
                jsonAttempt: jsonString.slice(0, 2000)
            }, { status: 500 });
        }

        // Return full diagnostic
        return NextResponse.json({
            success: true,
            documentsProcessed: docs.length,
            textLength: allText.length,
            geminiResponseLength: responseText.length,
            parsedKeys: Object.keys(ragData),
            hasExperiences: !!ragData.experiences,
            experiencesCount: ragData.experiences?.length || 0,
            hasCompetences: !!ragData.competences,
            competencesTechniquesCount: ragData.competences?.techniques?.length || 0,
            hasFormations: !!ragData.formations,
            formationsCount: ragData.formations?.length || 0,
            fullData: ragData
        });

    } catch (error: any) {
        return NextResponse.json({
            error: error.message,
            stack: error.stack?.slice(0, 500)
        }, { status: 500 });
    }
}
