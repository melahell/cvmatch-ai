/**
 * Schema Zod pour extraction RAG depuis Gemini
 * 
 * [CDC Sprint 2.3] Validation stricte des sorties IA
 */

import { z } from "zod";

// ============================================================================
// SUB-SCHEMAS
// ============================================================================

export const profilSchema = z.object({
    prenom: z.string().optional(),
    nom: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    telephone: z.string().optional(),
    localisation: z.string().optional(),
    titre_professionnel: z.string().optional(),
    annees_experience: z.number().optional(),
    elevator_pitch: z.string().optional(),
    linkedin: z.string().url().optional().or(z.literal("")),
    github: z.string().url().optional().or(z.literal("")),
    site_web: z.string().url().optional().or(z.literal("")),
}).passthrough();

export const experienceSchema = z.object({
    poste: z.string(),
    entreprise: z.string(),
    client: z.string().optional(),
    date_debut: z.string().optional(),
    date_fin: z.string().optional(),
    actuel: z.boolean().optional(),
    lieu: z.string().optional(),
    description: z.string().optional(),
    realisations: z.array(z.string()).optional(),
    technologies: z.array(z.string()).optional(),
    clients: z.array(z.string()).optional(),
}).passthrough();

export const formationSchema = z.object({
    diplome: z.string(),
    etablissement: z.string(),
    annee: z.string().optional(),
    domaine: z.string().optional(),
    mention: z.string().optional(),
}).passthrough();

export const langueSchema = z.object({
    langue: z.string(),
    niveau: z.string(),
}).passthrough();

export const competencesSchema = z.object({
    techniques: z.array(z.string()).optional(),
    soft_skills: z.array(z.string()).optional(),
    outils: z.array(z.string()).optional(),
    methodologies: z.array(z.string()).optional(),
    // [CDC Sprint 3.1] Soft skills déduites automatiquement
    soft_skills_deduites: z.array(z.string()).optional(),
    // [CDC Sprint 3.1] Compétences tacites rejetées par l'utilisateur
    rejected_tacit_skills: z.array(z.string()).optional(),
}).passthrough();

// ============================================================================
// MAIN SCHEMA
// ============================================================================

export const ragExtractionSchema = z.object({
    profil: profilSchema.optional(),
    experiences: z.array(experienceSchema).optional(),
    formations: z.array(formationSchema).optional(),
    competences: competencesSchema.optional(),
    langues: z.array(langueSchema).optional(),
    certifications: z.array(z.string()).optional(),
    projets: z.array(z.object({
        nom: z.string(),
        description: z.string().optional(),
        technologies: z.array(z.string()).optional(),
        url: z.string().optional(),
    }).passthrough()).optional(),
    clients_references: z.object({
        clients: z.array(z.string()).optional(),
        secteurs: z.array(z.string()).optional(),
    }).passthrough().optional(),
}).passthrough();

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type RAGExtraction = z.infer<typeof ragExtractionSchema>;
export type RAGProfil = z.infer<typeof profilSchema>;
export type RAGExperience = z.infer<typeof experienceSchema>;
export type RAGFormation = z.infer<typeof formationSchema>;
export type RAGLangue = z.infer<typeof langueSchema>;
export type RAGCompetences = z.infer<typeof competencesSchema>;
