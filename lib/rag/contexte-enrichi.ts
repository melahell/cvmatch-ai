/**
 * Génération du contexte enrichi RAG
 * Déduit les responsabilités implicites, compétences tacites et environnement de travail
 */

import { getContexteEnrichiPrompt } from "@/lib/ai/prompts";
import { generateWithGemini, GEMINI_MODELS } from "@/lib/ai/gemini";
import { ContexteEnrichi } from "@/types/rag-contexte-enrichi";
import { logger } from "@/lib/utils/logger";
import { z } from "zod";

// Schema de validation Zod pour le contexte enrichi
const ResponsabiliteImpliciteSchema = z.object({
    description: z.string(),
    justification: z.string(),
    confidence: z.number().min(60).max(100),
});

const CompetenceTaciteSchema = z.object({
    nom: z.string(),
    type: z.enum(["technique", "soft_skill", "methodologie"]),
    justification: z.string(),
    confidence: z.number().min(60).max(100),
});

const EnvironnementTravailSchema = z.object({
    taille_equipe: z.string().optional(),
    contexte_projet: z.string().optional(),
    outils_standards: z.array(z.string()).optional(),
});

const ContexteEnrichiSchema = z.object({
    responsabilites_implicites: z.array(ResponsabiliteImpliciteSchema),
    competences_tacites: z.array(CompetenceTaciteSchema),
    environnement_travail: EnvironnementTravailSchema.optional(),
});

/**
 * Parse et valide la réponse Gemini pour le contexte enrichi
 */
function parseContexteEnrichi(response: string): ContexteEnrichi {
    try {
        // Extraire le JSON de la réponse (peut contenir du texte avant/après)
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("Aucun JSON trouvé dans la réponse");
        }

        const parsed = JSON.parse(jsonMatch[0]);
        const validated = ContexteEnrichiSchema.parse(parsed);

        return validated;
    } catch (error) {
        logger.error("Erreur parsing contexte enrichi", { error, response });
        // Retourner un contexte enrichi vide en cas d'erreur
        return {
            responsabilites_implicites: [],
            competences_tacites: [],
        };
    }
}

/**
 * Génère le contexte enrichi à partir du RAG
 * @param ragData Données RAG à enrichir
 * @returns Contexte enrichi avec responsabilités implicites, compétences tacites, etc.
 */
export async function generateContexteEnrichi(
    ragData: any
): Promise<ContexteEnrichi> {
    try {
        logger.info("Génération contexte enrichi", {
            hasExperiences: !!ragData?.experiences?.length,
            experiencesCount: ragData?.experiences?.length || 0,
        });

        // Générer le prompt
        const prompt = getContexteEnrichiPrompt(ragData);

        // Appeler Gemini
        const response = await generateWithGemini({
            prompt,
            model: GEMINI_MODELS.principal,
        });

        // Parser et valider la réponse
        const contexteEnrichi = parseContexteEnrichi(response);

        logger.info("Contexte enrichi généré", {
            responsabilitesCount: contexteEnrichi.responsabilites_implicites.length,
            competencesCount: contexteEnrichi.competences_tacites.length,
            hasEnvironnement: !!contexteEnrichi.environnement_travail,
        });

        return contexteEnrichi;
    } catch (error) {
        logger.error("Erreur génération contexte enrichi", { error });
        // Retourner un contexte enrichi vide en cas d'erreur
        return {
            responsabilites_implicites: [],
            competences_tacites: [],
        };
    }
}
