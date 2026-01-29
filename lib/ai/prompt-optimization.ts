/**
 * Prompt Optimization - Optimisation avancée des prompts avec Gemini
 *
 * [AMÉLIORATION P2-8] : Système d'optimisation des prompts pour maximiser
 * la qualité et réduire les coûts (tokens, latence)
 *
 * Features:
 * - Structured output avec JSON schema pour Gemini
 * - Compression intelligente du contexte
 * - Token counting et budget management
 * - Prompt templates optimisés par use case
 * - A/B testing des prompts
 */

import { logger } from "@/lib/utils/logger";

// ============================================================================
// TYPES
// ============================================================================

export interface PromptOptimizationConfig {
    maxTokens: number;
    targetTokenReduction: number; // % de réduction visé
    preserveKeys: string[]; // Clés à ne jamais compresser
    compressionLevel: "light" | "medium" | "aggressive";
}

export interface TokenBudget {
    total: number;
    system: number;
    context: number;
    output: number;
    buffer: number;
}

export interface PromptMetrics {
    originalTokens: number;
    optimizedTokens: number;
    reductionPercent: number;
    compressionApplied: string[];
    estimatedCost: number;
}

export interface StructuredOutputSchema {
    type: "object";
    properties: Record<string, SchemaProperty>;
    required: string[];
}

export interface SchemaProperty {
    type: "string" | "number" | "boolean" | "array" | "object";
    description?: string;
    enum?: string[];
    items?: SchemaProperty;
    properties?: Record<string, SchemaProperty>;
    minimum?: number;
    maximum?: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: PromptOptimizationConfig = {
    maxTokens: 100000, // Gemini 1.5 Pro limite
    targetTokenReduction: 30,
    preserveKeys: ["nom", "prenom", "poste", "entreprise", "diplome", "date_debut", "date_fin"],
    compressionLevel: "medium",
};

// Prix Gemini 1.5 Pro (approximatif)
const PRICE_PER_1K_INPUT_TOKENS = 0.00125;
const PRICE_PER_1K_OUTPUT_TOKENS = 0.005;

// ============================================================================
// TOKEN COUNTING (Approximation)
// ============================================================================

/**
 * Estime le nombre de tokens (approximation pour Gemini)
 * Règle empirique: ~4 caractères = 1 token pour le français
 */
export function estimateTokens(text: string): number {
    if (!text) return 0;
    // Plus précis pour le français
    const words = text.split(/\s+/).length;
    const chars = text.length;
    // Moyenne pondérée: mots * 1.3 + chars / 4
    return Math.ceil((words * 1.3 + chars / 4) / 2);
}

/**
 * Compte les tokens d'un objet JSON
 */
export function countObjectTokens(obj: any): number {
    return estimateTokens(JSON.stringify(obj));
}

/**
 * Calcule le budget de tokens optimal
 */
export function calculateTokenBudget(
    contextSize: number,
    expectedOutputSize: number = 5000
): TokenBudget {
    const total = DEFAULT_CONFIG.maxTokens;
    const system = 2000; // Instructions système
    const buffer = 5000; // Marge de sécurité
    const output = expectedOutputSize;
    const context = total - system - output - buffer;

    return {
        total,
        system,
        context: Math.min(context, contextSize),
        output,
        buffer,
    };
}

// ============================================================================
// COMPRESSION INTELLIGENTE
// ============================================================================

/**
 * Compresse un profil RAG en préservant les informations critiques
 */
export function compressRAGProfile(
    ragProfile: any,
    config: Partial<PromptOptimizationConfig> = {}
): { compressed: any; metrics: PromptMetrics } {
    const cfg = { ...DEFAULT_CONFIG, ...config };
    const originalTokens = countObjectTokens(ragProfile);
    const compressionApplied: string[] = [];

    let compressed = JSON.parse(JSON.stringify(ragProfile));

    // 1. Supprimer les champs vides ou null
    compressed = removeEmptyFields(compressed);
    compressionApplied.push("remove_empty");

    // 2. Tronquer les descriptions trop longues
    if (cfg.compressionLevel !== "light") {
        compressed = truncateLongStrings(compressed, 500);
        compressionApplied.push("truncate_long_strings");
    }

    // 3. Dédupliquer les compétences
    if (compressed.competences) {
        compressed.competences = deduplicateSkills(compressed.competences);
        compressionApplied.push("deduplicate_skills");
    }

    // 4. Limiter le nombre de réalisations par expérience
    if (cfg.compressionLevel === "aggressive" && compressed.experiences) {
        compressed.experiences = compressed.experiences.map((exp: any) => ({
            ...exp,
            realisations: (exp.realisations || []).slice(0, 5),
        }));
        compressionApplied.push("limit_realisations");
    }

    // 5. Supprimer les métadonnées non essentielles
    if (cfg.compressionLevel !== "light") {
        compressed = removeNonEssentialMetadata(compressed);
        compressionApplied.push("remove_metadata");
    }

    const optimizedTokens = countObjectTokens(compressed);
    const reductionPercent = Math.round((1 - optimizedTokens / originalTokens) * 100);

    return {
        compressed,
        metrics: {
            originalTokens,
            optimizedTokens,
            reductionPercent,
            compressionApplied,
            estimatedCost: (optimizedTokens / 1000) * PRICE_PER_1K_INPUT_TOKENS,
        },
    };
}

/**
 * Supprime les champs vides ou null récursivement
 */
function removeEmptyFields(obj: any): any {
    if (Array.isArray(obj)) {
        return obj
            .map(removeEmptyFields)
            .filter(item => item !== null && item !== undefined && item !== "");
    }

    if (obj && typeof obj === "object") {
        const cleaned: any = {};
        for (const [key, value] of Object.entries(obj)) {
            const cleanedValue = removeEmptyFields(value);
            if (
                cleanedValue !== null &&
                cleanedValue !== undefined &&
                cleanedValue !== "" &&
                !(Array.isArray(cleanedValue) && cleanedValue.length === 0) &&
                !(typeof cleanedValue === "object" && Object.keys(cleanedValue).length === 0)
            ) {
                cleaned[key] = cleanedValue;
            }
        }
        return cleaned;
    }

    return obj;
}

/**
 * Tronque les chaînes trop longues
 */
function truncateLongStrings(obj: any, maxLength: number): any {
    if (typeof obj === "string") {
        if (obj.length > maxLength) {
            return obj.substring(0, maxLength) + "...";
        }
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => truncateLongStrings(item, maxLength));
    }

    if (obj && typeof obj === "object") {
        const result: any = {};
        for (const [key, value] of Object.entries(obj)) {
            result[key] = truncateLongStrings(value, maxLength);
        }
        return result;
    }

    return obj;
}

/**
 * Déduplique et nettoie les compétences
 */
function deduplicateSkills(competences: any): any {
    if (!competences) return competences;

    const seen = new Set<string>();
    const dedupe = (skills: any[]) => {
        if (!Array.isArray(skills)) return skills;
        return skills.filter(skill => {
            const key = typeof skill === "string"
                ? skill.toLowerCase().trim()
                : (skill.nom || skill.name || "").toLowerCase().trim();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    };

    return {
        ...competences,
        techniques: dedupe(competences.techniques || []),
        soft_skills: dedupe(competences.soft_skills || []),
        outils: dedupe(competences.outils || []),
    };
}

/**
 * Supprime les métadonnées non essentielles
 */
function removeNonEssentialMetadata(obj: any): any {
    const nonEssentialKeys = [
        "created_at", "updated_at", "metadata", "_id", "id",
        "extraction_date", "source_file", "confidence_score",
        "processing_time", "version", "schema_version",
    ];

    if (Array.isArray(obj)) {
        return obj.map(item => removeNonEssentialMetadata(item));
    }

    if (obj && typeof obj === "object") {
        const cleaned: any = {};
        for (const [key, value] of Object.entries(obj)) {
            if (!nonEssentialKeys.includes(key)) {
                cleaned[key] = removeNonEssentialMetadata(value);
            }
        }
        return cleaned;
    }

    return obj;
}

// ============================================================================
// STRUCTURED OUTPUT SCHEMAS
// ============================================================================

/**
 * Schéma pour la génération de widgets CV
 */
export const CV_WIDGETS_SCHEMA: StructuredOutputSchema = {
    type: "object",
    properties: {
        widgets: {
            type: "array",
            description: "Liste des widgets générés pour le CV",
            items: {
                type: "object",
                properties: {
                    id: { type: "string", description: "Identifiant unique du widget" },
                    section: {
                        type: "string",
                        enum: ["experiences", "formations", "competences", "langues", "certifications", "projets"],
                        description: "Section du CV",
                    },
                    content: {
                        type: "object",
                        description: "Contenu du widget",
                        properties: {
                            titre: { type: "string" },
                            sous_titre: { type: "string" },
                            description: { type: "string" },
                            bullets: {
                                type: "array",
                                items: { type: "string" },
                            },
                            date_debut: { type: "string" },
                            date_fin: { type: "string" },
                            lieu: { type: "string" },
                        },
                    },
                    score: {
                        type: "number",
                        minimum: 0,
                        maximum: 100,
                        description: "Score de pertinence 0-100",
                    },
                    quality: {
                        type: "object",
                        properties: {
                            grounded: { type: "boolean" },
                            has_metrics: { type: "boolean" },
                            ats_optimized: { type: "boolean" },
                        },
                    },
                    sources: {
                        type: "object",
                        properties: {
                            rag_experience_id: { type: "string" },
                            rag_path: { type: "string" },
                        },
                    },
                },
            },
        },
        metadata: {
            type: "object",
            properties: {
                total_widgets: { type: "number" },
                average_score: { type: "number" },
                generation_notes: { type: "string" },
            },
        },
    },
    required: ["widgets", "metadata"],
};

/**
 * Schéma pour l'analyse de match
 */
export const MATCH_ANALYSIS_SCHEMA: StructuredOutputSchema = {
    type: "object",
    properties: {
        overall_score: {
            type: "number",
            minimum: 0,
            maximum: 100,
            description: "Score global de correspondance",
        },
        job_title: { type: "string" },
        company: { type: "string" },
        sector: {
            type: "string",
            enum: ["finance", "tech", "pharma", "conseil", "industrie", "retail", "rh", "marketing", "public", "other"],
        },
        matching_skills: {
            type: "array",
            items: { type: "string" },
        },
        missing_keywords: {
            type: "array",
            items: { type: "string" },
        },
        recommendations: {
            type: "array",
            items: { type: "string" },
        },
    },
    required: ["overall_score", "job_title", "matching_skills", "missing_keywords"],
};

/**
 * Génère les instructions Gemini pour le structured output
 */
export function getStructuredOutputInstructions(schema: StructuredOutputSchema): string {
    return `
IMPORTANT: Tu DOIS retourner ta réponse en JSON valide respectant EXACTEMENT ce schéma:

${JSON.stringify(schema, null, 2)}

RÈGLES STRICTES:
1. Retourne UNIQUEMENT du JSON valide, sans aucun texte avant ou après
2. Respecte les types définis (string, number, boolean, array, object)
3. Inclus TOUS les champs "required"
4. Respecte les contraintes "minimum" et "maximum" pour les nombres
5. Utilise UNIQUEMENT les valeurs "enum" si spécifiées
6. PAS de valeurs null pour les champs obligatoires
7. PAS de commentaires dans le JSON
`;
}

// ============================================================================
// PROMPT TEMPLATES OPTIMISÉS
// ============================================================================

export interface PromptTemplate {
    id: string;
    name: string;
    version: string;
    systemPrompt: string;
    userPromptTemplate: string;
    outputSchema?: StructuredOutputSchema;
    tokenEstimate: number;
}

/**
 * Template optimisé pour la génération de widgets
 */
export const WIDGET_GENERATION_TEMPLATE: PromptTemplate = {
    id: "widget_gen_v2",
    name: "Widget Generation Optimized",
    version: "2.0.0",
    tokenEstimate: 3000,
    systemPrompt: `Tu es un expert CV et ATS avec 15 ans d'expérience.

MISSION: Générer des widgets CV scorés et optimisés ATS.

RÈGLES CRITIQUES:
1. ANTI-HALLUCINATION: N'invente JAMAIS de données. Utilise UNIQUEMENT les infos du profil source.
2. QUANTIFICATION: Inclus des chiffres quand présents (budget, équipe, %).
3. GROUNDING: Chaque widget doit référencer sa source RAG.
4. FORMATAGE: Phrases courtes, verbes d'action, espaces après chiffres.

SCORING (0-100):
- 90-100: Match direct avec l'offre
- 70-89: Très pertinent
- 50-69: Pertinent mais générique
- <50: À exclure`,
    userPromptTemplate: `PROFIL CANDIDAT:
{{ragProfile}}

OFFRE D'EMPLOI:
{{jobDescription}}

ANALYSE MATCH:
{{matchAnalysis}}

Génère les widgets CV optimisés.`,
    outputSchema: CV_WIDGETS_SCHEMA,
};

/**
 * Compile un template avec les variables
 */
export function compilePromptTemplate(
    template: PromptTemplate,
    variables: Record<string, any>
): { system: string; user: string; estimatedTokens: number } {
    let user = template.userPromptTemplate;

    for (const [key, value] of Object.entries(variables)) {
        const placeholder = `{{${key}}}`;
        const stringValue = typeof value === "string" ? value : JSON.stringify(value, null, 2);
        user = user.replace(new RegExp(placeholder, "g"), stringValue);
    }

    // Ajouter les instructions de structured output si schéma présent
    let system = template.systemPrompt;
    if (template.outputSchema) {
        system += "\n\n" + getStructuredOutputInstructions(template.outputSchema);
    }

    const estimatedTokens = estimateTokens(system) + estimateTokens(user);

    return { system, user, estimatedTokens };
}

// ============================================================================
// PROMPT A/B TESTING
// ============================================================================

export interface PromptVariant {
    id: string;
    template: PromptTemplate;
    weight: number;
    metrics: {
        uses: number;
        avgScore: number;
        avgTokens: number;
        avgLatencyMs: number;
    };
}

const promptVariants: Map<string, PromptVariant[]> = new Map();

/**
 * Enregistre des variantes de prompt pour A/B testing
 */
export function registerPromptVariants(experimentId: string, variants: PromptVariant[]): void {
    promptVariants.set(experimentId, variants);
}

/**
 * Sélectionne une variante de prompt selon les poids
 */
export function selectPromptVariant(experimentId: string): PromptVariant | null {
    const variants = promptVariants.get(experimentId);
    if (!variants || variants.length === 0) return null;

    const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
    let random = Math.random() * totalWeight;

    for (const variant of variants) {
        random -= variant.weight;
        if (random <= 0) return variant;
    }

    return variants[0];
}

/**
 * Met à jour les métriques d'une variante
 */
export function updatePromptMetrics(
    experimentId: string,
    variantId: string,
    metrics: { score: number; tokens: number; latencyMs: number }
): void {
    const variants = promptVariants.get(experimentId);
    if (!variants) return;

    const variant = variants.find(v => v.id === variantId);
    if (!variant) return;

    const { uses, avgScore, avgTokens, avgLatencyMs } = variant.metrics;
    const newUses = uses + 1;

    variant.metrics = {
        uses: newUses,
        avgScore: (avgScore * uses + metrics.score) / newUses,
        avgTokens: (avgTokens * uses + metrics.tokens) / newUses,
        avgLatencyMs: (avgLatencyMs * uses + metrics.latencyMs) / newUses,
    };
}

// ============================================================================
// OPTIMISATION DYNAMIQUE
// ============================================================================

/**
 * Optimise un prompt en fonction du budget de tokens
 */
export function optimizePromptForBudget(
    prompt: string,
    context: any,
    budget: TokenBudget
): { prompt: string; context: any; withinBudget: boolean } {
    let currentPromptTokens = estimateTokens(prompt);
    let currentContextTokens = countObjectTokens(context);
    let optimizedContext = context;

    // Si déjà dans le budget, retourner tel quel
    if (currentPromptTokens + currentContextTokens <= budget.context) {
        return { prompt, context, withinBudget: true };
    }

    // Compression progressive
    const compressionLevels: Array<PromptOptimizationConfig["compressionLevel"]> = ["light", "medium", "aggressive"];

    for (const level of compressionLevels) {
        const { compressed, metrics } = compressRAGProfile(context, { compressionLevel: level });
        optimizedContext = compressed;
        currentContextTokens = metrics.optimizedTokens;

        logger.debug("[prompt-optimization] Compression appliquée", {
            level,
            reduction: metrics.reductionPercent,
            newTokens: currentContextTokens,
        });

        if (currentPromptTokens + currentContextTokens <= budget.context) {
            return { prompt, context: optimizedContext, withinBudget: true };
        }
    }

    // Si toujours hors budget après compression agressive
    logger.warn("[prompt-optimization] Hors budget même après compression agressive", {
        promptTokens: currentPromptTokens,
        contextTokens: currentContextTokens,
        budget: budget.context,
    });

    return { prompt, context: optimizedContext, withinBudget: false };
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Estime le coût d'une génération
 */
export function estimateGenerationCost(inputTokens: number, outputTokens: number): number {
    return (inputTokens / 1000) * PRICE_PER_1K_INPUT_TOKENS +
           (outputTokens / 1000) * PRICE_PER_1K_OUTPUT_TOKENS;
}

/**
 * Génère un rapport d'optimisation
 */
export function generateOptimizationReport(
    original: any,
    optimized: any,
    metrics: PromptMetrics
): string {
    return `
═══════════════════════════════════════════════════════════════
RAPPORT D'OPTIMISATION PROMPT
═══════════════════════════════════════════════════════════════

📊 TOKENS:
- Original: ${metrics.originalTokens.toLocaleString()}
- Optimisé: ${metrics.optimizedTokens.toLocaleString()}
- Réduction: ${metrics.reductionPercent}%

💰 COÛT ESTIMÉ: $${metrics.estimatedCost.toFixed(4)}

🔧 COMPRESSIONS APPLIQUÉES:
${metrics.compressionApplied.map(c => `  - ${c}`).join("\n")}

═══════════════════════════════════════════════════════════════
`;
}
