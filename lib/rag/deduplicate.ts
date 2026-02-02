/**
 * RAG Deduplication System
 * Removes semantic duplicates from RAG data
 * 
 * [CDC Phase 3.3] Refactored to use centralized string-similarity module
 */

import { normalizeCompanyName } from "./normalize-company";
import { combinedSimilarity } from "./string-similarity";

interface Experience {
    poste: string;
    entreprise: string;
    debut?: string;
    date_debut?: string;
    fin?: string;
    date_fin?: string;
    actuel?: boolean;
    realisations?: any[];
    [key: string]: any;
}

interface RealisationObject {
    description: string;
    impact?: string;
    sources?: string[];
    [key: string]: any;
}

/**
 * Calculate similarity between two strings (0-1)
 * [CDC Phase 3.3] Now uses centralized implementation from string-similarity.ts
 */
function calculateSimilarity(str1: string, str2: string): number {
    return combinedSimilarity(str1, str2);
}

/**
 * Check if two experiences are duplicates (same job, same company, overlapping dates)
 */
function areExperiencesDuplicates(exp1: Experience, exp2: Experience): boolean {
    const company1 = normalizeCompanyName(exp1.entreprise);
    const company2 = normalizeCompanyName(exp2.entreprise);
    if (!company1 || !company2) return false;

    if (company1 !== company2 && calculateSimilarity(company1, company2) < 0.85) return false;

    // Similar job title (>80% similarity)
    const titleSimilarity = calculateSimilarity(exp1.poste, exp2.poste);
    if (titleSimilarity < 0.8) return false;

    // Check date overlap
    const start1 = exp1.date_debut || exp1.debut;
    const start2 = exp2.date_debut || exp2.debut;

    // If both have dates, check if they overlap
    if (start1 && start2) {
        // Same start date = duplicate
        if (start1 === start2) return true;

        // If dates are within 3 months, likely duplicate
        const date1 = new Date(start1);
        const date2 = new Date(start2);
        const diffMonths = Math.abs((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24 * 30));
        return diffMonths < 3;
    }

    if (!start1 && !start2) {
        const isCurrent1 = !!exp1.actuel || !exp1.fin || !exp1.date_fin;
        const isCurrent2 = !!exp2.actuel || !exp2.fin || !exp2.date_fin;
        if (isCurrent1 && isCurrent2) return true;
        return true;
    }

    const isCurrent1 = !!exp1.actuel || !exp1.fin || !exp1.date_fin;
    const isCurrent2 = !!exp2.actuel || !exp2.fin || !exp2.date_fin;
    if (isCurrent1 && isCurrent2) return true;

    return false;
}

/**
 * Merge duplicate experiences by keeping the most complete one
 */
function mergeExperiences(exps: Experience[]): Experience {
    // Sort by number of realisations (most complete first)
    const sorted = [...exps].sort((a, b) => {
        const countA = a.realisations?.length || 0;
        const countB = b.realisations?.length || 0;
        return countB - countA;
    });

    const base = { ...sorted[0] };

    // Merge all unique realisations from all experiences
    const merged: RealisationObject[] = [];

    const normalizeReal = (real: any): RealisationObject | null => {
        if (!real) return null;
        if (typeof real === "string") {
            const description = real.trim();
            if (!description) return null;
            return { description };
        }
        if (typeof real === "object") {
            const description = (real.description || "").toString().trim();
            if (!description) return null;
            const impact = real.impact ? real.impact.toString().trim() : undefined;
            const sources = Array.isArray(real.sources) ? real.sources.filter(Boolean) : undefined;
            return { ...real, description, impact, sources };
        }
        const description = String(real).trim();
        if (!description) return null;
        return { description };
    };

    for (const exp of exps) {
        if (!exp.realisations) continue;

        for (const real of exp.realisations) {
            const normalizedReal = normalizeReal(real);
            if (!normalizedReal) continue;
            const normalized = normalizedReal.description.toLowerCase().replace(/[^\w\s]/g, "").trim();

            // Only add if not too similar to existing ones
            // Group similar realisations before merging (semantic deduplication)
            let mergedIntoExisting = false;
            for (const existing of merged) {
                const existingNorm = existing.description.toLowerCase().replace(/[^\w\s]/g, "").trim();
                const similarity = calculateSimilarity(normalized, existingNorm);
                if (similarity > 0.75) {
                    // Merge: keep the best version (longer description, with impact if available)
                    const keepDescription =
                        (normalizedReal.impact && !existing.impact) ? normalizedReal.description :
                            (!normalizedReal.impact && existing.impact) ? existing.description :
                                normalizedReal.description.length > existing.description.length ? normalizedReal.description : existing.description;

                    const keepImpact =
                        (normalizedReal.impact && !existing.impact) ? normalizedReal.impact :
                            (!normalizedReal.impact && existing.impact) ? existing.impact :
                                (normalizedReal.impact || "").length > (existing.impact || "").length
                                    ? normalizedReal.impact
                                    : existing.impact;

                    // Merge sources
                    const sources = Array.from(new Set([...(existing.sources || []), ...(normalizedReal.sources || [])]));

                    // Update existing with best version
                    existing.description = keepDescription;
                    if (keepImpact) existing.impact = keepImpact;
                    if (sources.length > 0) existing.sources = sources;

                    // Preserve all other properties from both
                    Object.keys(normalizedReal).forEach(key => {
                        if (!['description', 'impact', 'sources'].includes(key) && !existing[key]) {
                            existing[key] = normalizedReal[key];
                        }
                    });

                    mergedIntoExisting = true;
                    break;
                }
            }

            if (!mergedIntoExisting) merged.push(normalizedReal);
        }
    }

    base.realisations = merged;

    return base;
}

/**
 * Deduplicate experiences
 */
export function deduplicateExperiences(experiences: Experience[]): Experience[] {
    if (!experiences || experiences.length === 0) return [];

    const groups: Experience[][] = [];
    const processed = new Set<number>();

    // Group duplicates together
    for (let i = 0; i < experiences.length; i++) {
        if (processed.has(i)) continue;

        const group: Experience[] = [experiences[i]];
        processed.add(i);

        for (let j = i + 1; j < experiences.length; j++) {
            if (processed.has(j)) continue;

            if (areExperiencesDuplicates(experiences[i], experiences[j])) {
                group.push(experiences[j]);
                processed.add(j);
            }
        }

        groups.push(group);
    }

    // Merge each group
    return groups.map(group => mergeExperiences(group));
}

/**
 * Deduplicate competences (skills)
 */
export function deduplicateCompetences(competences: string[]): string[] {
    if (!competences || competences.length === 0) return [];

    const unique = new Map<string, string>();

    for (const comp of competences) {
        const normalized = comp.toLowerCase().replace(/[^\w\s]/g, '').trim();

        // Check if we already have a similar one
        let found = false;
        for (const [key, value] of unique.entries()) {
            const similarity = calculateSimilarity(normalized, key);
            if (similarity > 0.9) {
                // Keep the longer/more detailed version
                if (comp.length > value.length) {
                    unique.set(key, comp);
                }
                found = true;
                break;
            }
        }

        if (!found) {
            unique.set(normalized, comp);
        }
    }

    return Array.from(unique.values());
}

/**
 * Deduplicate formations
 */
export function deduplicateFormations(formations: any[]): any[] {
    if (!formations || formations.length === 0) return [];

    const unique: any[] = [];

    for (const form of formations) {
        const diplome = form.diplome || form.titre || '';
        const etablissement = form.etablissement || form.ecole || '';
        const annee = form.annee || form.date || '';

        // Check if duplicate
        const isDuplicate = unique.some(existing => {
            const diplSim = calculateSimilarity(diplome, existing.diplome || existing.titre || '');
            const etabSim = calculateSimilarity(etablissement, existing.etablissement || existing.ecole || '');

            return diplSim > 0.9 && etabSim > 0.8;
        });

        if (!isDuplicate) {
            unique.push(form);
        }
    }

    return unique;
}

/**
 * Deduplicate certifications
 */
export function deduplicateCertifications(certifications: any[]): string[] {
    if (!certifications || certifications.length === 0) return [];

    const certStrings = certifications.map(c =>
        typeof c === 'string' ? c : c.nom || c.name || ''
    ).filter(Boolean);

    return deduplicateCompetences(certStrings);
}

/**
 * Main deduplication function - cleans entire RAG data
 */
export function deduplicateRAG(ragData: any): any {
    console.log('🧹 Starting RAG deduplication...');

    const result = { ...ragData };

    // Deduplicate experiences
    if (result.experiences && Array.isArray(result.experiences)) {
        const before = result.experiences.length;
        result.experiences = deduplicateExperiences(result.experiences);
        const after = result.experiences.length;
        console.log(`  ✓ Experiences: ${before} → ${after} (removed ${before - after} duplicates)`);
    }

    // Deduplicate competences
    if (result.competences) {
        if (result.competences.techniques && Array.isArray(result.competences.techniques)) {
            const before = result.competences.techniques.length;
            result.competences.techniques = deduplicateCompetences(
                result.competences.techniques.map((c: any) => typeof c === 'string' ? c : c.nom || c.name || '')
            );
            const after = result.competences.techniques.length;
            console.log(`  ✓ Compétences techniques: ${before} → ${after} (removed ${before - after} duplicates)`);
        }

        if (result.competences.soft_skills && Array.isArray(result.competences.soft_skills)) {
            const before = result.competences.soft_skills.length;
            result.competences.soft_skills = deduplicateCompetences(
                result.competences.soft_skills.map((c: any) => typeof c === 'string' ? c : c.nom || c.name || '')
            );
            const after = result.competences.soft_skills.length;
            console.log(`  ✓ Soft skills: ${before} → ${after} (removed ${before - after} duplicates)`);
        }

        // Also check explicit competences
        if (result.competences.explicit) {
            if (result.competences.explicit.techniques) {
                result.competences.explicit.techniques = deduplicateCompetences(
                    result.competences.explicit.techniques.map((c: any) => typeof c === 'string' ? c : c.nom || c.name || '')
                );
            }
            if (result.competences.explicit.soft_skills) {
                result.competences.explicit.soft_skills = deduplicateCompetences(
                    result.competences.explicit.soft_skills.map((c: any) => typeof c === 'string' ? c : c.nom || c.name || '')
                );
            }
        }
    }

    // Deduplicate formations
    if (result.formations && Array.isArray(result.formations)) {
        const before = result.formations.length;
        result.formations = deduplicateFormations(result.formations);
        const after = result.formations.length;
        console.log(`  ✓ Formations: ${before} → ${after} (removed ${before - after} duplicates)`);
    }

    // Deduplicate certifications
    if (result.certifications && Array.isArray(result.certifications)) {
        const before = result.certifications.length;
        result.certifications = deduplicateCertifications(result.certifications);
        const after = result.certifications.length;
        console.log(`  ✓ Certifications: ${before} → ${after} (removed ${before - after} duplicates)`);
    }

    console.log('✅ Deduplication complete');

    return result;
}
