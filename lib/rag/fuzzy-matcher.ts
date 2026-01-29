/**
 * Fuzzy Matching pour RAG Fusion Intelligente
 * 
 * Améliore la déduplication et la fusion en utilisant :
 * - Normalisation avancée des noms d'entreprises
 * - Similarité de chaînes (Levenshtein + Jaccard)
 * - Déduplication par similarité pour compétences/expériences
 */

import { normalizeCompanyName } from "./normalize-company";

export { normalizeCompanyName };

/**
 * Calcule la similarité entre deux chaînes (0-1)
 * Combine Levenshtein et Jaccard pour robustesse
 */
export function calculateStringSimilarity(str1: string, str2: string): number {
    if (!str1 || !str2) return 0;
    if (str1.toLowerCase().trim() === str2.toLowerCase().trim()) return 1.0;

    // Levenshtein distance
    const levenshtein = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
    const maxLen = Math.max(str1.length, str2.length);
    const levenshteinScore = maxLen > 0 ? 1 - (levenshtein / maxLen) : 0;

    // Jaccard index (word-based)
    const words1 = new Set(str1.toLowerCase().split(/\s+/).filter(w => w.length > 2));
    const words2 = new Set(str2.toLowerCase().split(/\s+/).filter(w => w.length > 2));
    
    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);
    const jaccardScore = union.size > 0 ? intersection.size / union.size : 0;

    // Moyenne pondérée (60% Levenshtein, 40% Jaccard)
    return (levenshteinScore * 0.6) + (jaccardScore * 0.4);
}

/**
 * Distance de Levenshtein entre deux chaînes
 */
function levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }

    return matrix[str2.length][str1.length];
}

/**
 * Vérifie si deux compétences sont similaires (fuzzy matching)
 */
export function areSkillsSimilar(skill1: string, skill2: string, threshold: number = 0.8): boolean {
    const similarity = calculateStringSimilarity(skill1, skill2);
    return similarity >= threshold;
}

/**
 * Vérifie si deux expériences sont similaires (entreprise + dates + poste)
 */
export function areExperiencesSimilar(
    exp1: { entreprise?: string; poste?: string; debut?: string },
    exp2: { entreprise?: string; poste?: string; debut?: string },
    companyThreshold: number = 0.85,
    positionThreshold: number = 0.7
): boolean {
    // Normaliser entreprises
    const company1 = normalizeCompanyName(exp1.entreprise || "");
    const company2 = normalizeCompanyName(exp2.entreprise || "");
    const companySimilarity = calculateStringSimilarity(company1, company2);
    if (companySimilarity < companyThreshold) return false;

    // Comparer postes
    const positionSimilarity = calculateStringSimilarity(exp1.poste || "", exp2.poste || "");
    if (positionSimilarity < positionThreshold) return false;

    // Comparer dates (tolérance ±6 mois)
    if (exp1.debut && exp2.debut) {
        const date1 = new Date(exp1.debut);
        const date2 = new Date(exp2.debut);
        const monthsDiff = Math.abs(
            (date1.getFullYear() - date2.getFullYear()) * 12 +
            (date1.getMonth() - date2.getMonth())
        );
        if (monthsDiff > 6) return false;
    }

    return true;
}

export function fuzzyAreExperiencesSimilar(
    exp1: { entreprise?: string; poste?: string; debut?: string },
    exp2: { entreprise?: string; poste?: string; debut?: string },
    companyThreshold: number = 0.85,
    positionThreshold: number = 0.7
): boolean {
    return areExperiencesSimilar(exp1, exp2, companyThreshold, positionThreshold);
}

export function fuzzyMatchCompany(
    company1: string,
    company2: string,
    threshold: number = 0.85
): boolean {
    const c1 = normalizeCompanyName(company1 || "");
    const c2 = normalizeCompanyName(company2 || "");
    return calculateStringSimilarity(c1, c2) >= threshold;
}

/**
 * Déduplique un tableau d'éléments en utilisant fuzzy matching
 */
export function deduplicateBySimilarity<T>(
    items: T[],
    getKey: (item: T) => string,
    similarityFn: (a: T, b: T) => boolean,
    threshold: number = 0.8
): T[] {
    const result: T[] = [];
    const processed = new Set<string>();

    for (const item of items) {
        const key = getKey(item);
        if (processed.has(key)) continue;

        // Chercher items similaires
        const similarItems = items.filter(other => {
            if (getKey(other) === key) return false;
            return similarityFn(item, other);
        });

        // Garder le premier (ou le plus complet)
        result.push(item);
        similarItems.forEach(similar => processed.add(getKey(similar)));
        processed.add(key);
    }

    return result;
}

/**
 * Vérifie si une compétence est dans la liste rejected_inferred
 */
export function isSkillRejected(skill: string, rejectedInferred: any): boolean {
    if (!rejectedInferred) return false;
    
    const rejectedSkills = [
        ...(rejectedInferred.techniques || []),
        ...(rejectedInferred.tools || []),
        ...(rejectedInferred.soft_skills || []),
    ].map((s: any) => typeof s === 'string' ? s : s.name || s.nom || '').filter(Boolean);

    return rejectedSkills.some((rejected: string) => 
        areSkillsSimilar(skill, rejected, 0.9) // Seuil élevé pour éviter faux positifs
    );
}
