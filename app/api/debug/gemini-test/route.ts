import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

export async function GET() {
    const diagnostics: any = {
        timestamp: new Date().toISOString(),
        checks: {}
    };

    // 1. Check API Key
    const apiKey = process.env.GEMINI_API_KEY;
    diagnostics.checks.apiKeyPresent = !!apiKey;
    diagnostics.checks.apiKeyLength = apiKey?.length || 0;

    if (!apiKey) {
        return NextResponse.json({
            ...diagnostics,
            error: "GEMINI_API_KEY missing"
        });
    }

    // 2. Test Gemini API
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        diagnostics.checks.modelCreated = true;

        const result = await model.generateContent("Réponds juste 'OK' si tu fonctionnes.");
        const text = result.response.text();

        diagnostics.checks.geminiResponse = text.substring(0, 100);
        diagnostics.checks.geminiWorking = true;
    } catch (geminiError: any) {
        diagnostics.checks.geminiWorking = false;
        diagnostics.checks.geminiError = geminiError.message;
        diagnostics.checks.geminiErrorFull = JSON.stringify(geminiError, null, 2).substring(0, 500);
    }

    return NextResponse.json(diagnostics);
}
