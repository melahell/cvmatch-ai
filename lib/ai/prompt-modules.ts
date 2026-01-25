/**
 * Prompt Modules - Système de prompts modulaires réutilisables
 *
 * [AUDIT FIX MOYEN-10] : Refactoring des prompts en modules pour réduire la duplication
 * et faciliter la maintenance.
 *
 * Architecture:
 * - Modules atomiques (anti-hallucination, formatage, etc.)
 * - Combinables via compose()
 * - Paramétrisables
 */

// ============================================================================
// MODULE: Anti-Hallucination Rules
// ============================================================================

export const ANTI_HALLUCINATION_RULES = `
🚨 RÈGLE ANTI-HALLUCINATION (CRITIQUE)

INTERDICTIONS ABSOLUES :
⛔ NE JAMAIS inventer de formation (école, diplôme, année)
⛔ NE JAMAIS inventer d'entreprise ou d'employeur
⛔ NE JAMAIS inventer de réalisation ou projet
⛔ NE JAMAIS inventer de client/référence
⛔ NE JAMAIS inventer de certification
⛔ NE JAMAIS inventer de chiffres ou KPIs
⛔ NE JAMAIS modifier les dates des expériences

RÈGLE D'OR : Si une information n'est pas dans le profil source,
elle NE DOIT PAS apparaître dans la sortie générée.

En cas de doute, OMETS l'information plutôt que de l'inventer.
`;

export const ANTI_HALLUCINATION_RULES_EXTENDED = `
${ANTI_HALLUCINATION_RULES}

CAS PARTICULIER : Éléments inférés
- Tu peux utiliser les éléments "contexte_enrichi" ou "inferred" SI ils sont dans la source
- Reste prudent : évite les superlatifs, évite toute quantification non sourcée
- Marque les éléments inférés avec "is_inferred: true" et fournis une justification

VÉRIFICATION AVANT GÉNÉRATION :
✅ Chaque chiffre mentionné existe dans la source
✅ Chaque entreprise mentionnée existe dans la source
✅ Chaque réalisation est traçable dans une expérience source
✅ Aucune école/diplôme inventé
`;

// ============================================================================
// MODULE: Formatting Rules
// ============================================================================

export const FORMATTING_RULES = `
📝 FORMATAGE STRICT (OBLIGATOIRE)

ESPACES OBLIGATOIRES :
- "5 ans" (PAS "5ans")
- "150+ projets" (PAS "150+projets")
- "+ 40%" (PAS "+40%")
- "budget 2M€" (PAS "budget2M€")
- "équipe de 8 personnes" (PAS "équipede8personnes")

PONCTUATION :
- Espace APRÈS ponctuation : ". ", ", ", ": ", ") "
- PAS d'espace AVANT : "test." (PAS "test .")
- Espaces autour parenthèses : "test (exemple) suite"

LISIBILITÉ :
- Phrases courtes et factuelles
- Verbes d'action au passé composé ou infinitif
- Pas de superlatifs inutiles
`;

// ============================================================================
// MODULE: Quantification Rules
// ============================================================================

export const QUANTIFICATION_RULES = `
📊 QUANTIFICATION (≥60% des réalisations)

FORMATS ACCEPTÉS :
- Volume : "150+ projets", "équipe de 8 personnes"
- Budget : "budget 2M€", "réduction coûts de 30%"
- Impact : "amélioration de 45%", "réduction délais de 3 mois"
- Portée : "déploiement 500 utilisateurs", "12 pays"

RÈGLE : Seuls les chiffres PRÉSENTS dans la source peuvent être utilisés.
JAMAIS d'invention de chiffres.
`;

// ============================================================================
// MODULE: Grounding Requirements
// ============================================================================

export const GROUNDING_REQUIREMENTS = `
🔗 TRAÇABILITÉ (GROUNDING)

Pour CHAQUE élément généré, assure-toi qu'il est traçable dans la source :

WIDGETS :
- "sources.rag_experience_id" : ID de l'expérience source (exp_0, exp_1...)
- "sources.rag_path" : Chemin JSON vers la donnée source
- "quality.grounded" : true si 100% traçable

RÉALISATIONS :
- Chaque réalisation doit correspondre à une réalisation du RAG
- Les chiffres doivent exister dans le RAG source
- Les technologies doivent être listées dans l'expérience source

COMPÉTENCES :
- Doivent apparaître dans "competences" ou "skill_map" ou "experiences[].technologies"
`;

// ============================================================================
// MODULE: Scoring Criteria
// ============================================================================

export function getScoringCriteria(context: { jobTitle?: string; sector?: string }): string {
    return `
📈 SCORING DE PERTINENCE (0-100)

CRITÈRES :
- 90-100 : Directement aligné avec "${context.jobTitle || 'l\'offre'}" (mots-clés match, expérience exacte)
- 70-89 : Très pertinent (compétences alignées, secteur ${context.sector || 'similaire'})
- 50-69 : Pertinent mais générique (compétences transférables)
- < 50 : Peu pertinent (ne pas inclure dans le CV final)

BOOST DE SCORE :
- +20 si contient un "missing_keyword" identifié dans le match analysis
- +15 si contient des chiffres quantifiés
- +10 si expérience < 2 ans
- +5 si secteur identique à l'offre
`;
}

// ============================================================================
// MODULE: Seniority Rules
// ============================================================================

export interface SeniorityConfig {
    level: "junior" | "confirmed" | "senior" | "expert";
    yearsExperience: number;
}

export function getSeniorityRules(config: SeniorityConfig): string {
    const rules: Record<string, { maxExp: number; maxBullets: number; showClients: boolean; elevatorPitch: boolean }> = {
        junior: { maxExp: 5, maxBullets: 4, showClients: false, elevatorPitch: false },
        confirmed: { maxExp: 4, maxBullets: 5, showClients: false, elevatorPitch: true },
        senior: { maxExp: 4, maxBullets: 5, showClients: true, elevatorPitch: true },
        expert: { maxExp: 4, maxBullets: 4, showClients: true, elevatorPitch: true },
    };

    const r = rules[config.level];

    return `
👤 RÈGLES POUR NIVEAU "${config.level.toUpperCase()}" (${config.yearsExperience} ans)

STRUCTURE :
- Maximum ${r.maxExp} expériences affichées
- Maximum ${r.maxBullets} bullets par expérience
- Références clients : ${r.showClients ? "OUI - OBLIGATOIRE" : "NON"}
- Elevator pitch : ${r.elevatorPitch ? "OBLIGATOIRE (max 250 chars)" : "OPTIONNEL"}

PRIORITÉ CONTENU :
${config.level === "junior" ? "- Formations en premier\n- Stages et alternances valorisés" : ""}
${config.level === "senior" || config.level === "expert" ? "- Impact business mis en avant\n- Leadership et management" : ""}
- Expériences les plus pertinentes pour l'offre
`;
}

// ============================================================================
// MODULE: Sector Keywords
// ============================================================================

export interface SectorConfig {
    sector: "finance" | "tech" | "pharma" | "conseil" | "industrie" | "other";
}

export function getSectorKeywords(config: SectorConfig): string {
    const keywords: Record<string, string[]> = {
        finance: ["conformité", "réglementation", "risque", "audit", "KYC", "AML", "Bâle", "ROI", "P&L"],
        tech: ["agile", "scrum", "CI/CD", "cloud", "API", "microservices", "SaaS", "scalabilité"],
        pharma: ["GxP", "FDA", "EMA", "validation", "qualification", "CSV", "pharmacovigilance"],
        conseil: ["due diligence", "transformation", "stratégie", "roadmap", "benchmark"],
        industrie: ["lean", "six sigma", "supply chain", "qualité", "production", "maintenance"],
        other: ["gestion de projet", "coordination", "reporting", "optimisation", "amélioration continue"],
    };

    return `
🎯 MOTS-CLÉS ATS SECTEUR "${config.sector.toUpperCase()}"

Keywords critiques à intégrer naturellement :
${keywords[config.sector].map(k => `- ${k}`).join("\n")}

Ces termes augmentent le score ATS et doivent apparaître dans le CV si présents dans le RAG.
`;
}

// ============================================================================
// MODULE: Output Format
// ============================================================================

export const JSON_OUTPUT_RULES = `
📄 OUTPUT (JSON uniquement)

RÈGLES :
- Génère UNIQUEMENT du JSON valide
- PAS de markdown (pas de \`\`\`json)
- PAS de commentaires dans le JSON
- PAS d'explications avant ou après

VALIDATION AVANT ENVOI :
✅ JSON parsable sans erreur
✅ Tous les champs requis présents
✅ Pas de valeurs null pour les champs obligatoires
✅ Pas de placeholders ("à renseigner", "N/A")
`;

// ============================================================================
// COMPOSER: Combine modules
// ============================================================================

export interface PromptComposition {
    modules: string[];
    context?: Record<string, any>;
    data?: string;
}

/**
 * Compose plusieurs modules de prompt en un prompt complet
 */
export function composePrompt(composition: PromptComposition): string {
    const parts: string[] = [];

    // Ajouter les modules
    composition.modules.forEach((module, idx) => {
        parts.push(`═══════════════════════════════════════════════════════════════`);
        parts.push(`BLOC ${idx + 1}`);
        parts.push(`═══════════════════════════════════════════════════════════════`);
        parts.push(module);
        parts.push("");
    });

    // Ajouter les données si fournies
    if (composition.data) {
        parts.push(`═══════════════════════════════════════════════════════════════`);
        parts.push(`DONNÉES SOURCE`);
        parts.push(`═══════════════════════════════════════════════════════════════`);
        parts.push(composition.data);
    }

    return parts.join("\n");
}

/**
 * Crée un prompt de génération CV optimisé à partir des modules
 */
export function createCVGenerationPrompt(
    ragProfile: any,
    jobDescription: string,
    options: {
        seniority: SeniorityConfig;
        sector: SectorConfig;
        matchAnalysis?: any;
    }
): string {
    const modules = [
        // Contexte
        `Tu es un expert RH, CV Designer et ATS Optimizer avec 15 ans d'expérience.
Mission : Générer un CV optimisé pour ATS et recruteurs.`,

        // Règles anti-hallucination
        ANTI_HALLUCINATION_RULES_EXTENDED,

        // Règles de formatage
        FORMATTING_RULES,

        // Quantification
        QUANTIFICATION_RULES,

        // Séniorité
        getSeniorityRules(options.seniority),

        // Secteur
        getSectorKeywords(options.sector),

        // Scoring
        getScoringCriteria({
            jobTitle: options.matchAnalysis?.job_title,
            sector: options.sector.sector,
        }),

        // Grounding
        GROUNDING_REQUIREMENTS,

        // Output
        JSON_OUTPUT_RULES,
    ];

    // Données
    const data = `
PROFIL RAG COMPLET :
${JSON.stringify(ragProfile, null, 2)}

${options.matchAnalysis ? `ANALYSE DE MATCH :
${JSON.stringify(options.matchAnalysis, null, 2)}
` : ""}
OFFRE D'EMPLOI :
${jobDescription}
`;

    return composePrompt({
        modules,
        data,
    });
}

/**
 * Crée un prompt de génération widgets optimisé
 */
export function createWidgetsGenerationPrompt(
    ragProfile: any,
    matchAnalysis: any,
    jobDescription: string
): string {
    const modules = [
        // Contexte
        `Tu es un expert en génération de contenu CV optimisé pour ATS et recruteurs.
Mission : Générer des widgets scorés (AI_WIDGETS_SCHEMA) prêts pour le bridge.`,

        // Règles anti-hallucination
        ANTI_HALLUCINATION_RULES,

        // Scoring
        getScoringCriteria({
            jobTitle: matchAnalysis?.job_title,
            sector: matchAnalysis?.company,
        }),

        // Grounding
        GROUNDING_REQUIREMENTS,

        // Output
        JSON_OUTPUT_RULES,
    ];

    const data = `
PROFIL RAG (OPTIMISÉ) :
${JSON.stringify(ragProfile, null, 2)}

ANALYSE DE MATCH :
${JSON.stringify(matchAnalysis, null, 2)}

OFFRE D'EMPLOI :
${jobDescription}
`;

    return composePrompt({
        modules,
        data,
    });
}
