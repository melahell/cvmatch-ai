import type { Competences, CompetencesExplicit, CompetencesInferred } from "@/types/rag";

/**
 * Normalizes competences data to support both old and new format
 * Old format: { techniques: string[], soft_skills: string[] }
 * New format: { explicit: {...}, inferred: {...} }
 */
export function normalizeCompetences(competences: any): Competences {
    if (!competences) {
        return {
            explicit: { techniques: [], soft_skills: [] },
            inferred: { techniques: [], tools: [], soft_skills: [] }
        };
    }

    // If already in new format
    if (competences.explicit || competences.inferred) {
        return {
            explicit: competences.explicit || { techniques: [], soft_skills: [] },
            inferred: competences.inferred || { techniques: [], tools: [], soft_skills: [] }
        };
    }

    // If old format, convert to new format
    if (competences.techniques || competences.soft_skills) {
        return {
            explicit: {
                techniques: competences.techniques || [],
                soft_skills: competences.soft_skills || []
            },
            inferred: {
                techniques: [],
                tools: [],
                soft_skills: []
            }
        };
    }

    // Fallback
    return {
        explicit: { techniques: [], soft_skills: [] },
        inferred: { techniques: [], tools: [], soft_skills: [] }
    };
}
