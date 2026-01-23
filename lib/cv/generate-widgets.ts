/**
 * Helper pour générer AI_WIDGETS_SCHEMA depuis RAG + match analysis
 * Utilise le prompt Gemini pour produire des widgets scorés
 */

import { generateWithGemini, GEMINI_MODELS } from "@/lib/ai/gemini";
import { getAIWidgetsGenerationPrompt } from "@/lib/ai/prompts";
import { validateAIWidgetsEnvelope, AIWidgetsEnvelope } from "./ai-widgets";

export interface GenerateWidgetsParams {
    ragProfile: any;
    matchAnalysis: any;
    jobDescription: string;
}

/**
 * Génère des widgets scorés depuis RAG + match analysis
 * @returns AIWidgetsEnvelope validé ou null si erreur
 */
export async function generateWidgetsFromRAGAndMatch(
    params: GenerateWidgetsParams
): Promise<AIWidgetsEnvelope | null> {
    try {
        const prompt = getAIWidgetsGenerationPrompt(
            params.ragProfile,
            params.matchAnalysis,
            params.jobDescription
        );

        const response = await generateWithGemini({
            prompt,
            model: GEMINI_MODELS.principal, // gemini-3-pro-preview
        });

        // Parser la réponse JSON
        let parsed: unknown;
        try {
            // Nettoyer la réponse (enlever markdown si présent)
            const cleaned = response
                .replace(/```json\n?/g, "")
                .replace(/```\n?/g, "")
                .trim();
            parsed = JSON.parse(cleaned);
        } catch (parseError) {
            console.error("Erreur parsing JSON widgets:", parseError);
            console.error("Réponse brute:", response.substring(0, 500));
            return null;
        }

        // Valider avec Zod
        const validation = validateAIWidgetsEnvelope(parsed);
        if (!validation.success) {
            console.error("Erreur validation widgets:", validation.error);
            return null;
        }

        return validation.data;
    } catch (error) {
        console.error("Erreur génération widgets:", error);
        return null;
    }
}
