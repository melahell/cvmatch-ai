/**
 * CV Relevance Scoring - Score experiences by relevance to job offer
 * 
 * Used to prioritize which experiences to show in detailed format
 * when generating a CV for a specific job offer.
 */

export interface JobOfferContext {
    title: string;
    required_skills: string[];
    nice_to_have_skills?: string[];
    sector?: string;
    keywords?: string[];
    company?: string;
}

export interface ExperienceForScoring {
    poste: string;
    entreprise: string;
    date_debut: string;
    date_fin?: string;
    realisations?: string[];
    technologies?: string[];
    secteur?: string;
}

export interface ScoredExperience extends ExperienceForScoring {
    relevance_score: number;
    score_breakdown: {
        title_match: number;
        skills_match: number;
        recency_bonus: number;
        sector_bonus: number;
    };
}

/**
 * Calculate text similarity using word overlap (simple but effective)
 */
function calculateTextSimilarity(text1: string, text2: string): number {
    if (!text1 || !text2) return 0;

    const normalize = (s: string) =>
        s
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Remove accents
            .replace(/[^a-z0-9\s]/g, " ")
            .split(/\s+/)
            .filter((w) => w.length > 2);

    const words1 = new Set(normalize(text1));
    const words2 = new Set(normalize(text2));

    if (words1.size === 0 || words2.size === 0) return 0;

    let matchCount = 0;
    for (const word of words1) {
        if (words2.has(word)) matchCount++;
    }

    // Jaccard-like similarity
    const union = new Set([...words1, ...words2]);
    return (matchCount / union.size) * 100;
}

/**
 * Calculate array overlap percentage
 */
function calculateArrayOverlap(arr1: string[], arr2: string[]): number {
    if (!arr1?.length || !arr2?.length) return 0;

    const normalize = (s: string) =>
        s
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();

    const set1 = new Set(arr1.map(normalize));
    const set2 = new Set(arr2.map(normalize));

    let matchCount = 0;
    for (const item of set1) {
        if (set2.has(item)) matchCount++;
    }

    // Percentage of job requirements matched
    return (matchCount / set2.size) * 100;
}

/**
 * Calculate years since end of experience
 */
function calculateYearsAgo(dateEnd: string | undefined): number {
    if (!dateEnd || dateEnd.toLowerCase() === "present" || dateEnd.toLowerCase() === "présent") {
        return 0; // Current job
    }

    const match = dateEnd.match(/(\d{4})/);
    if (!match) return 0;

    const year = parseInt(match[1], 10);
    const currentYear = new Date().getFullYear();
    return Math.max(0, currentYear - year);
}

/**
 * Calculate relevance score for an experience vs a job offer
 * 
 * @returns Score 0-100
 */
export function calculateRelevanceScore(
    experience: ExperienceForScoring,
    jobOffer: JobOfferContext
): ScoredExperience {
    const breakdown = {
        title_match: 0,
        skills_match: 0,
        recency_bonus: 0,
        sector_bonus: 0,
    };

    // 1. Title Match (40% weight)
    const titleSimilarity = calculateTextSimilarity(
        experience.poste,
        jobOffer.title
    );
    breakdown.title_match = Math.min(40, titleSimilarity * 0.4);

    // 2. Skills Match (30% weight)
    const expTechnologies = experience.technologies || [];
    const expRealisations = experience.realisations || [];
    const expText = [...expTechnologies, ...expRealisations].join(" ");

    const allJobSkills = [
        ...(jobOffer.required_skills || []),
        ...(jobOffer.nice_to_have_skills || []),
        ...(jobOffer.keywords || []),
    ];

    if (allJobSkills.length > 0) {
        // Check both direct array match and text mention
        const directMatch = calculateArrayOverlap(expTechnologies, allJobSkills);
        const textMatch = calculateTextSimilarity(expText, allJobSkills.join(" "));
        breakdown.skills_match = Math.min(30, (directMatch * 0.2 + textMatch * 0.1));
    }

    // 3. Recency Bonus (20% weight)
    const yearsAgo = calculateYearsAgo(experience.date_fin);
    if (yearsAgo === 0) {
        breakdown.recency_bonus = 20; // Current job
    } else if (yearsAgo <= 2) {
        breakdown.recency_bonus = 15;
    } else if (yearsAgo <= 5) {
        breakdown.recency_bonus = 10;
    } else if (yearsAgo <= 10) {
        breakdown.recency_bonus = 5;
    } else {
        breakdown.recency_bonus = 0;
    }

    // 4. Sector Match (10% weight)
    if (jobOffer.sector && experience.secteur) {
        const sectorMatch = calculateTextSimilarity(
            experience.secteur,
            jobOffer.sector
        );
        breakdown.sector_bonus = Math.min(10, sectorMatch * 0.1);
    }

    const totalScore = Math.min(
        100,
        breakdown.title_match +
        breakdown.skills_match +
        breakdown.recency_bonus +
        breakdown.sector_bonus
    );

    return {
        ...experience,
        relevance_score: Math.round(totalScore),
        score_breakdown: breakdown,
    };
}

/**
 * Calculate default score based on recency only (when no job offer)
 */
export function calculateDefaultScore(experience: ExperienceForScoring): number {
    const yearsAgo = calculateYearsAgo(experience.date_fin);

    // Score 0-100 based on recency
    if (yearsAgo === 0) return 100; // Current
    if (yearsAgo <= 1) return 90;
    if (yearsAgo <= 2) return 80;
    if (yearsAgo <= 3) return 70;
    if (yearsAgo <= 5) return 60;
    if (yearsAgo <= 8) return 50;
    if (yearsAgo <= 10) return 40;
    if (yearsAgo <= 15) return 30;
    return 20; // Very old
}

/**
 * Sort experiences by relevance to job offer, or by recency if no offer
 */
export function sortExperiencesByRelevance<T extends ExperienceForScoring>(
    experiences: T[],
    jobOffer: JobOfferContext | null
): (T & { _relevance_score: number })[] {
    if (!experiences || experiences.length === 0) {
        return [];
    }

    return experiences
        .map((exp) => {
            const score = jobOffer
                ? calculateRelevanceScore(exp, jobOffer).relevance_score
                : calculateDefaultScore(exp);

            return {
                ...exp,
                _relevance_score: score,
            };
        })
        .sort((a, b) => b._relevance_score - a._relevance_score);
}

/**
 * Extract job offer context from job description text
 * (Simple extraction - can be improved with AI)
 */
export function parseJobOfferFromText(jobDescription: string): JobOfferContext {
    const lines = jobDescription.split("\n").filter(Boolean);

    // Try to extract title from first non-empty line
    const title = lines[0]?.trim() || "Position";

    // Extract potential skills from text
    const skillPatterns = [
        /\b(javascript|typescript|react|vue|angular|node|python|java|sql|aws|docker|kubernetes|git)\b/gi,
        /\b(excel|powerpoint|word|office|sap|salesforce|jira|confluence)\b/gi,
        /\b(gestion de projet|management|leadership|communication|agile|scrum)\b/gi,
    ];

    const skills: string[] = [];
    for (const pattern of skillPatterns) {
        const matches = jobDescription.match(pattern);
        if (matches) {
            skills.push(...matches.map((m) => m.toLowerCase()));
        }
    }

    // Deduplicate
    const uniqueSkills = [...new Set(skills)];

    return {
        title,
        required_skills: uniqueSkills,
        keywords: [],
    };
}
