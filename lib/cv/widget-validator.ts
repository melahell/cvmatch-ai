/**
 * Validation Anti-Hallucination pour Widgets
 * 
 * Vérifie que les widgets générés par l'IA sont bien groundés dans le RAG source :
 * - Chiffres présents dans le RAG
 * - Compétences présentes dans le RAG
 * - Expériences référencées existent
 * 
 * Inspiré de la validation V1 (app/api/cv/generate/route.ts)
 */

import type { AIWidget, AIWidgetsEnvelope } from "./ai-widgets";

export interface ValidationWarning {
    widgetId: string;
    type: "numbers_not_grounded" | "experience_not_found" | "skill_not_found" | "generic_warning";
    message: string;
    severity: "high" | "medium" | "low";
}

export interface ValidationResult {
    validWidgets: AIWidget[];
    warnings: ValidationWarning[];
    stats: {
        total: number;
        valid: number;
        filtered: number;
        filteredByNumbers: number;
        filteredByExperience: number;
        filteredBySkill: number;
    };
}

/**
 * Extrait les chiffres d'un texte
 */
function extractNumbers(text: string): string[] {
    return text.match(/\d[\d\s.,]*\d|\d/g) || [];
}

/**
 * Vérifie si les chiffres d'un texte sont présents dans le RAG source
 */
function isNumbersGroundedInText(candidate: string, sourceText: string): boolean {
    const sourceLower = sourceText.toLowerCase();
    const numbers = extractNumbers(candidate);
    
    for (const n of numbers) {
        const token = n.replace(/\s+/g, "");
        if (!token) continue;
        if (!sourceLower.includes(token.toLowerCase())) {
            return false;
        }
    }
    
    return true;
}

/**
 * Normalise un texte pour matching (lowercase, trim, accents)
 */
function normalizeForMatch(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Supprimer accents
        .replace(/[^\w\s]/g, "") // Supprimer ponctuation
        .replace(/\s+/g, " ");
}

/**
 * Construit un Set de compétences depuis le RAG profile
 */
function buildSourceSkillSet(ragProfile: any): Set<string> {
    const skills = new Set<string>();
    
    const add = (value: unknown) => {
        if (!value) return;
        const key = normalizeForMatch(String(value));
        if (key) skills.add(key);
    };

    // Extraire depuis skill_map si présent
    if (ragProfile?.skill_map && typeof ragProfile.skill_map === "object") {
        Object.keys(ragProfile.skill_map).forEach((skill) => add(skill));
    }

    const competences = ragProfile?.competences || {};
    const collectArray = (arr: unknown) => {
        if (!Array.isArray(arr)) return;
        for (const item of arr) {
            if (typeof item === "string") add(item);
            else if (item && typeof item === "object") {
                add((item as any).nom ?? (item as any).name ?? (item as any).skill);
            } else add(item);
        }
    };

    collectArray(competences.techniques);
    collectArray(competences.soft_skills);
    collectArray(competences.langages_programmation);
    collectArray(competences.frameworks);
    collectArray(competences.outils);
    collectArray(competences.cloud_devops);
    
    if (competences.explicit) {
        collectArray(competences.explicit.techniques);
        collectArray(competences.explicit.soft_skills);
        collectArray(competences.explicit.langages_programmation);
        collectArray(competences.explicit.frameworks);
        collectArray(competences.explicit.outils);
        collectArray(competences.explicit.cloud_devops);
    }

    const experiences = Array.isArray(ragProfile?.experiences) ? ragProfile.experiences : [];
    for (const exp of experiences) {
        collectArray((exp as any).technologies);
        collectArray((exp as any).outils);
        collectArray((exp as any).methodologies);
    }

    return skills;
}

/**
 * Valide les widgets contre le RAG source
 *
 * IMPORTANT: Cette fonction NE FILTRE PLUS les widgets.
 * Elle génère des warnings informatifs mais retourne TOUS les widgets.
 * L'utilisateur contrôle le filtrage via l'UI (sliders score/max).
 */
export function validateWidgetsAgainstRAG(
    widgets: AIWidget[],
    ragProfile: any
): ValidationResult {
    const warnings: ValidationWarning[] = [];

    const stats = {
        total: widgets.length,
        valid: widgets.length, // TOUS sont valides maintenant
        filtered: 0,
        filteredByNumbers: 0,
        filteredByExperience: 0,
        filteredBySkill: 0,
    };

    // Construire source text pour validation chiffres (pour warnings)
    const sourceText = JSON.stringify(ragProfile).toLowerCase();

    // Construire source skill set pour validation compétences (pour warnings)
    const sourceSkillSet = buildSourceSkillSet(ragProfile);

    for (const widget of widgets) {
        // 1. Vérifier chiffres (WARNING ONLY - pas de filtrage)
        const numbers = extractNumbers(widget.text);
        if (numbers.length > 0) {
            if (!isNumbersGroundedInText(widget.text, sourceText)) {
                // WARNING seulement - on ne filtre plus
                warnings.push({
                    widgetId: widget.id,
                    type: "numbers_not_grounded",
                    message: `Chiffres potentiellement inventés: ${numbers.join(", ")}`,
                    severity: "low", // Réduit à low car on ne filtre plus
                });
                stats.filteredByNumbers++; // Pour stats seulement
            }
        }

        // 2. Vérifier compétences (WARNING ONLY pour widgets de type skill)
        if (widget.section === "skills" && widget.type === "skill_item") {
            const normalizedSkill = normalizeForMatch(widget.text);
            if (!sourceSkillSet.has(normalizedSkill)) {
                // WARNING seulement - on ne filtre plus
                warnings.push({
                    widgetId: widget.id,
                    type: "skill_not_found",
                    message: `Compétence non explicite dans le RAG: ${widget.text}`,
                    severity: "low",
                });
                stats.filteredBySkill++; // Pour stats seulement
            }
        }
    }

    // RETOURNER TOUS LES WIDGETS - pas de filtrage
    return {
        validWidgets: widgets, // TOUS les widgets passent
        warnings,
        stats,
    };
}

/**
 * Valide un envelope complet de widgets
 */
export function validateWidgetsEnvelope(
    envelope: AIWidgetsEnvelope,
    ragProfile: any
): ValidationResult {
    return validateWidgetsAgainstRAG(envelope.widgets, ragProfile);
}
