/**
 * RAG Deduplication System
 * Removes semantic duplicates from RAG data
 */

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

/**
 * Calculate similarity between two strings (0-1)
 * Uses Jaccard similarity on word sets
 */
function calculateSimilarity(str1: string, str2: string): number {
    if (!str1 || !str2) return 0;

    const normalize = (s: string) => s.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 2); // Ignore short words

    const words1 = new Set(normalize(str1));
    const words2 = new Set(normalize(str2));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
}

/**
 * Check if two experiences are duplicates (same job, same company, overlapping dates)
 */
function areExperiencesDuplicates(exp1: Experience, exp2: Experience): boolean {
    // Same company
    if (exp1.entreprise !== exp2.entreprise) return false;

    // Similar job title (>80% similarity)
    const titleSimilarity = calculateSimilarity(exp1.poste, exp2.poste);
    if (titleSimilarity < 0.8) return false;

    // Check date overlap
    const start1 = exp1.date_debut || exp1.debut;
    const start2 = exp2.date_debut || exp2.debut;
    const end1 = exp1.date_fin || exp1.fin;
    const end2 = exp2.date_fin || exp2.fin;

    // If both have dates, check if they overlap
    if (start1 && start2) {
        // Same start date = duplicate
        if (start1 === start2) return true;

        // If dates are within 3 months, likely duplicate
        const date1 = new Date(start1);
        const date2 = new Date(start2);
        const diffMonths = Math.abs((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24 * 30));
        if (diffMonths < 3) return true;
    }

    return true; // If all checks pass, it's a duplicate
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
    const allRealisations = new Set<string>();

    for (const exp of exps) {
        if (!exp.realisations) continue;

        for (const real of exp.realisations) {
            const text = typeof real === 'string' ? real : real.description || JSON.stringify(real);
            const normalized = text.toLowerCase().replace(/[^\w\s]/g, '').trim();

            // Only add if not too similar to existing ones
            let isDuplicate = false;
            for (const existing of allRealisations) {
                const similarity = calculateSimilarity(normalized, existing.toLowerCase().replace(/[^\w\s]/g, '').trim());
                if (similarity > 0.85) {
                    isDuplicate = true;
                    break;
                }
            }

            if (!isDuplicate) {
                allRealisations.add(text);
            }
        }
    }

    base.realisations = Array.from(allRealisations);

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
    return groups.map(group => {
        if (group.length === 1) return group[0];
        return mergeExperiences(group);
    });
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
