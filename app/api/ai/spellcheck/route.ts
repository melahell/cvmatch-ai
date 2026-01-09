import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

/**
 * AI Spellcheck and Grammar Correction API
 * Uses Gemini to correct spelling and improve formulation
 * 
 * Body: {
 *   text: string,      // The text to check
 *   context?: string   // Optional context (e.g., "cv", "certification", "experience")
 * }
 */
export async function POST(req: Request) {
    try {
        const { text, context } = await req.json();

        if (!text || text.trim().length === 0) {
            return NextResponse.json({
                original: text,
                corrected: text,
                hasChanges: false
            });
        }

        // Skip very short texts
        if (text.length < 10) {
            return NextResponse.json({
                original: text,
                corrected: text,
                hasChanges: false
            });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("GEMINI_API_KEY not found");
            return NextResponse.json({
                original: text,
                corrected: text,
                hasChanges: false,
                error: "API non configurée"
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Fast model for quick corrections

        const prompt = `Tu es un correcteur orthographique et grammatical expert en français professionnel.

TEXTE À CORRIGER:
"${text}"

${context ? `CONTEXTE: Ce texte est pour un ${context}.` : ""}

INSTRUCTIONS:
1. Corrige UNIQUEMENT les fautes d'orthographe et de grammaire
2. Améliore légèrement la formulation si nécessaire (sans changer le sens)
3. Garde le même niveau de langage professionnel
4. Ne change pas les noms propres, acronymes, ou termes techniques
5. Si le texte est déjà correct, retourne-le tel quel

Réponds UNIQUEMENT avec le texte corrigé, sans explication ni guillemets.`;

        const result = await model.generateContent(prompt);
        const corrected = result.response.text().trim();

        // Remove any quotes that might have been added
        const cleanedCorrected = corrected.replace(/^["']|["']$/g, '').trim();

        const hasChanges = cleanedCorrected.toLowerCase() !== text.toLowerCase();

        return NextResponse.json({
            original: text,
            corrected: cleanedCorrected,
            hasChanges,
            changes: hasChanges ? findChanges(text, cleanedCorrected) : []
        });

    } catch (error: any) {
        console.error("Spellcheck error:", error);
        return NextResponse.json({
            original: "",
            corrected: "",
            hasChanges: false,
            error: error.message || "Erreur de correction"
        }, { status: 500 });
    }
}

/**
 * Simple diff function to find changed words
 */
function findChanges(original: string, corrected: string): Array<{ from: string; to: string }> {
    const changes: Array<{ from: string; to: string }> = [];
    const origWords = original.split(/\s+/);
    const corrWords = corrected.split(/\s+/);

    // Simple word-by-word comparison (not a full diff algorithm)
    for (let i = 0; i < Math.max(origWords.length, corrWords.length); i++) {
        const orig = origWords[i] || "";
        const corr = corrWords[i] || "";
        if (orig.toLowerCase() !== corr.toLowerCase()) {
            changes.push({ from: orig, to: corr });
        }
    }

    return changes.slice(0, 5); // Limit to 5 changes
}
