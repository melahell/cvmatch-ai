/**
 * Schema Zod pour suggestions de jobs
 * 
 * Aligné sur le prompt getTopJobsPrompt et l'UI dashboard (titre_poste, salaire_min/max, raison, secteurs).
 */

import { z } from "zod";

// ============================================================================
// JOB SUGGESTION SCHEMA (format prompt + UI)
// ============================================================================

export const jobSuggestionSchema = z.object({
    rang: z.number().optional(),
    titre_poste: z.string().optional(),
    titre: z.string().optional(),
    match_score: z.number().min(0).max(100).optional(),
    salaire_min: z.number().optional(),
    salaire_max: z.number().optional(),
    raison: z.string().optional(),
    secteurs: z.array(z.string()).optional(),
    // Champs alternatifs / legacy
    entreprise_type: z.string().optional(),
    secteur: z.string().optional(),
    niveau: z.string().optional(),
    salaire_estime: z.string().optional(),
    raisons: z.array(z.string()).optional(),
    competences_cles: z.array(z.string()).optional(),
    description: z.string().optional(),
    ligne: z.string().optional(),
}).passthrough().refine(
    (data) => !!(data.titre_poste ?? data.titre ?? data.ligne),
    { message: "Au moins un libellé de poste (titre_poste, titre ou ligne) requis" }
);

export const jobSuggestionsResponseSchema = z.object({
    suggestions: z.array(jobSuggestionSchema),
    metadata: z.object({
        total: z.number().optional(),
        generated_at: z.string().optional(),
        based_on: z.string().optional(),
    }).passthrough().optional(),
}).passthrough();

// Alternative: array format
export const jobSuggestionsArraySchema = z.array(jobSuggestionSchema);

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type JobSuggestion = z.infer<typeof jobSuggestionSchema>;
export type JobSuggestionsResponse = z.infer<typeof jobSuggestionsResponseSchema>;
