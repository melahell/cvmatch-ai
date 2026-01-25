/**
 * Helper pour générer AI_WIDGETS_SCHEMA depuis RAG + match analysis
 * Utilise le prompt Gemini pour produire des widgets scorés
 *
 * [AUDIT FIX CRITIQUE-1] : Utilise buildRAGForCVPrompt pour optimiser le contexte
 * envoyé à Gemini, réduisant les tokens et améliorant la qualité.
 */

import { generateWithGemini, GEMINI_MODELS } from "@/lib/ai/gemini";
import { getAIWidgetsGenerationPrompt } from "@/lib/ai/prompts";
import { validateAIWidgetsEnvelope, AIWidgetsEnvelope } from "./ai-widgets";
import { buildRAGForCVPrompt, calculateRAGCompletenessScore } from "./rag-transform";
import { logger } from "@/lib/utils/logger";

export interface GenerateWidgetsParams {
    ragProfile: any;
    matchAnalysis: any;
    jobDescription: string;
}

export interface GenerateWidgetsResult {
    envelope: AIWidgetsEnvelope;
    ragCompletenessScore: number;
    optimizedRAGUsed: boolean;
}

/**
 * Génère des widgets scorés depuis RAG + match analysis
 * @returns AIWidgetsEnvelope validé ou null si erreur
 *
 * [AUDIT FIX CRITIQUE-1] : Le RAG est maintenant optimisé avant d'être passé au prompt
 */
export async function generateWidgetsFromRAGAndMatch(
    params: GenerateWidgetsParams
): Promise<AIWidgetsEnvelope | null> {
    try {
        // [AUDIT FIX CRITIQUE-1] : Optimiser le RAG pour réduire les tokens
        const ragCompletenessScore = calculateRAGCompletenessScore(params.ragProfile);
        const optimizedRAG = buildRAGForCVPrompt(params.ragProfile);

        logger.debug("[generate-widgets] RAG optimisé pour prompt", {
            originalSize: JSON.stringify(params.ragProfile).length,
            optimizedSize: JSON.stringify(optimizedRAG).length,
            reduction: `${Math.round((1 - JSON.stringify(optimizedRAG).length / JSON.stringify(params.ragProfile).length) * 100)}%`,
            ragCompletenessScore,
        });

        const prompt = getAIWidgetsGenerationPrompt(
            optimizedRAG, // [AUDIT FIX] Utiliser le RAG optimisé au lieu du brut
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
