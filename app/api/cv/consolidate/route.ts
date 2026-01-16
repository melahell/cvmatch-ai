"use server";

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
    try {
        const { cvData } = await request.json();

        if (!cvData) {
            return NextResponse.json({ error: "CV data required" }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `Tu es un correcteur orthographique et rédactionnel expert en français.
        
Voici les données d'un CV au format JSON. Ta mission :
1. Corriger TOUTES les fautes d'orthographe et de grammaire
2. Améliorer la formulation des phrases pour qu'elles soient plus professionnelles et percutantes
3. Transformer les phrases en puces de CV impactantes (commencer par des verbes d'action au passé)
4. Quantifier quand possible (ajouter des %, des chiffres)
5. Garder le sens exact, ne pas inventer de nouvelles informations
6. NE PAS modifier les noms propres, les noms d'entreprises, les dates, emails, téléphones

IMPORTANT: Retourne UNIQUEMENT le JSON corrigé, sans markdown, sans explication, juste le JSON.

JSON à corriger :
${JSON.stringify(cvData, null, 2)}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Clean up the response - remove markdown code blocks if present
        let cleanedJson = responseText
            .replace(/```json\s*/gi, "")
            .replace(/```\s*/gi, "")
            .trim();

        // Parse the consolidated data
        let consolidatedData;
        try {
            consolidatedData = JSON.parse(cleanedJson);
        } catch (parseError) {
            console.error("JSON parse error:", parseError);
            console.error("Raw response:", responseText);
            return NextResponse.json(
                { error: "Erreur de parsing AI. Le CV n'a pas été modifié." },
                { status: 500 }
            );
        }

        return NextResponse.json({
            consolidatedData,
            success: true
        });

    } catch (error: any) {
        console.error("Consolidation error:", error);
        return NextResponse.json(
            { error: error.message || "Consolidation failed" },
            { status: 500 }
        );
    }
}
