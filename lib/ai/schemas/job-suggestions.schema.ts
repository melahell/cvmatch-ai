/**
 * Schema Zod pour suggestions de jobs
 * 
 * [CDC Sprint 2.3] Validation stricte des sorties IA
 */

import { z } from "zod";

// ============================================================================
// JOB SUGGESTION SCHEMA
// ============================================================================

export const jobSuggestionSchema = z.object({
    titre: z.string(),
    entreprise_type: z.string().optional(),
    secteur: z.string().optional(),
    niveau: z.string().optional(),
    salaire_estime: z.string().optional(),
    match_score: z.number().min(0).max(100).optional(),
    raisons: z.array(z.string()).optional(),
    competences_cles: z.array(z.string()).optional(),
    description: z.string().optional(),
}).passthrough();

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
