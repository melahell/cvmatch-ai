import { z } from "zod";

/**
 * Schéma standard pour la sortie IA dédiée au rendu de CV.
 *
 * Idée clé :
 * - Le BACK / IA produit des « widgets » scorés (contenu pur + métadonnées de grounding).
 * - Le FRONT / renderer consomme ensuite un schéma de CV normalisé (voir `components/cv/templates`).
 * - Le bridge (AIAdapter) fera la conversion AI_WIDGETS_SCHEMA → CVData.
 */

export const aiWidgetTypeSchema = z.enum([
    "summary_block",       // bloc de résumé / pitch
    "experience_bullet",   // bullet d'expérience professionnelle
    "experience_header",   // en‑tête d'expérience (poste + entreprise)
    "skill_item",          // compétence individuelle
    "skill_group",         // groupe de compétences
    "education_item",      // formation / diplôme
    "project_item",        // projet marquant
    "language_item",       // langue
    "meta_note"            // note de contexte / recommandation non rendue telle quelle
]);

export type AIWidgetType = z.infer<typeof aiWidgetTypeSchema>;

export const aiWidgetSectionSchema = z.enum([
    "header",
    "summary",
    "experiences",
    "skills",
    "education",
    "projects",
    "languages",
    "references",
    "meta"
]);

export type AIWidgetSection = z.infer<typeof aiWidgetSectionSchema>;

/**
 * Références de grounding vers le RAG source.
 * Permet de tracer chaque widget jusqu'à ses sources brutes.
 */
export const aiWidgetSourceRefSchema = z.object({
    rag_experience_id: z.string().optional(),
    rag_realisation_id: z.string().optional(),
    rag_path: z.string().optional(), // ex: "experiences[2].realisations[1]"
    source_ids: z.array(z.string()).optional(), // IDs de documents / chunks, si disponibles
});

export type AIWidgetSourceRef = z.infer<typeof aiWidgetSourceRefSchema>;

/**
 * Signaux de qualité calculés côté IA ou côté bridge.
 * L'objectif est de pouvoir scorer et filtrer les widgets de manière déterministe.
 */
export const aiWidgetQualitySchema = z.object({
    has_numbers: z.boolean().optional(),           // présence de chiffres / quantification
    length: z.number().int().nonnegative().optional(), // longueur en caractères
    grounded: z.boolean().optional(),              // tout le contenu est traçable dans le RAG
    issues: z.array(z.string()).optional(),        // ex: ["too_generic", "possible_hallucination"]
});

export type AIWidgetQuality = z.infer<typeof aiWidgetQualitySchema>;

/**
 * Widget de base produit par le pipeline IA.
 */
export const aiWidgetSchema = z.object({
    id: z.string(),                          // identifiant stable
    type: aiWidgetTypeSchema,                // type de widget (bullet, résumé, etc.)
    section: aiWidgetSectionSchema,          // section cible du CV
    text: z.string().min(1),                 // texte brut à afficher (avant éventuel retravail)
    relevance_score: z.number().min(0).max(100), // score 0–100 de pertinence pour l'offre cible

    // Métadonnées optionnelles
    sub_type: z.string().optional(),         // ex: "lead_bullet", "secondary_bullet"
    tags: z.array(z.string()).optional(),    // ex: ["management", "cloud", "kpi"]
    offer_keywords: z.array(z.string()).optional(), // mots‑clés job qui ont motivé la sélection

    // Grounding & qualité
    sources: aiWidgetSourceRefSchema.optional(),
    quality: aiWidgetQualitySchema.optional(),
});

export type AIWidget = z.infer<typeof aiWidgetSchema>;

/**
 * Enveloppe complète renvoyée par le cerveau IA.
 * Elle contient :
 * - un résumé du profil,
 * - le contexte offre,
 * - la liste des widgets scorés,
 * - des métadonnées de génération.
 */
export const aiWidgetsEnvelopeSchema = z.object({
    profil_summary: z.object({
        nom: z.string().optional(),
        prenom: z.string().optional(),
        titre_principal: z.string().optional(),
        localisation: z.string().optional(),
        elevator_pitch: z.string().optional(),
    }).optional(),

    job_context: z.object({
        company: z.string().optional(),
        job_title: z.string().optional(),
        match_score: z.number().min(0).max(100).optional(),
        keywords: z.array(z.string()).optional(),
    }).optional(),

    widgets: z.array(aiWidgetSchema).min(1),

    meta: z.object({
        model: z.string().optional(),          // modèle IA utilisé
        created_at: z.string().optional(),     // ISO date
        locale: z.string().optional(),         // ex: "fr-FR"
        version: z.string().optional(),        // version interne du schema / prompt
        // [AUDIT] Champs ajoutés pour tracking
        fromCache: z.boolean().optional(),     // widgets provenant du cache
        cacheLevel: z.number().optional(),     // niveau de cache (1, 2, 3)
        sector: z.string().optional(),         // secteur détecté (tech, finance, etc.)
        language: z.string().optional(),       // langue détectée de l'offre
        generationTimeMs: z.number().optional(), // temps de génération en ms
    }).optional(),
});

export type AIWidgetsEnvelope = z.infer<typeof aiWidgetsEnvelopeSchema>;

/**
 * Helper runtime pour valider un payload supposé être AI_WIDGETS_SCHEMA.
 * En cas d'erreur, on renvoie un objet ZodError détaillé.
 */
export function validateAIWidgetsEnvelope(payload: unknown) {
    return aiWidgetsEnvelopeSchema.safeParse(payload);
}

