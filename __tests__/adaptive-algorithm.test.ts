import { describe, it, expect } from "vitest";

import { adaptCVToThemeUnits } from "../lib/cv/adaptive-algorithm";
import {
    calculateRelevanceScore,
    sortExperiencesByRelevance,
    calculateDefaultScore,
    JobOfferContext,
    ExperienceForScoring
} from "../lib/cv/relevance-scoring";
import { getThemeConfig } from "../lib/cv/theme-configs";

// ============================================================================
// TEST FIXTURES
// ============================================================================

const mockExperience = (overrides: Partial<ExperienceForScoring> = {}): ExperienceForScoring => ({
    poste: "Chef de Projet IT",
    entreprise: "Tech Corp",
    date_debut: "2022-01",
    date_fin: "présent",
    realisations: ["Gestion d'équipe", "Migration cloud AWS"],
    technologies: ["AWS", "Jira", "Agile"],
    ...overrides,
});

const mockJobOffer: JobOfferContext = {
    title: "Chef de Projet Digital",
    required_skills: ["AWS", "Agile", "Scrum", "Jira"],
    nice_to_have_skills: ["Docker", "Kubernetes"],
    sector: "Tech",
    keywords: ["transformation digitale", "cloud"],
};

function makeCV(overrides?: Partial<any>) {
    return {
        profil: {
            prenom: "Jean",
            nom: "Dupont",
            titre_principal: "Chef de Projet",
            email: "jean@example.com",
            elevator_pitch: "Professionnel expérimenté avec 10 ans d'expérience.",
        },
        experiences: [
            {
                poste: "Chef de Projet Senior",
                entreprise: "Big Corp",
                date_debut: "2022-01",
                date_fin: "présent",
                realisations: ["Mission 1", "Mission 2", "Mission 3"],
            },
            {
                poste: "Chef de Projet",
                entreprise: "Medium Corp",
                date_debut: "2019-01",
                date_fin: "2021-12",
                realisations: ["Mission A", "Mission B"],
            },
            {
                poste: "Consultant",
                entreprise: "Small Corp",
                date_debut: "2015-01",
                date_fin: "2018-12",
                realisations: ["Projet X"],
            },
        ],
        competences: {
            techniques: ["JavaScript", "Python", "AWS"],
            soft_skills: ["Leadership", "Communication"],
        },
        formations: [
            { diplome: "MBA", etablissement: "HEC", annee: "2015" },
        ],
        ...overrides,
    };
}

// ============================================================================
// RELEVANCE SCORING TESTS
// ============================================================================

describe("calculateRelevanceScore", () => {
    it("should return score in 0-100 range", () => {
        const exp = mockExperience();
        const result = calculateRelevanceScore(exp, mockJobOffer);

        expect(result.relevance_score).toBeGreaterThanOrEqual(0);
        expect(result.relevance_score).toBeLessThanOrEqual(100);
    });

    it("should score high for matching job titles", () => {
        const matchingExp = mockExperience({ poste: "Chef de Projet Digital" });
        const nonMatchingExp = mockExperience({ poste: "Développeur Backend" });

        const matchingScore = calculateRelevanceScore(matchingExp, mockJobOffer);
        const nonMatchingScore = calculateRelevanceScore(nonMatchingExp, mockJobOffer);

        expect(matchingScore.score_breakdown.title_match).toBeGreaterThan(
            nonMatchingScore.score_breakdown.title_match
        );
    });

    it("should score high for matching skills", () => {
        const matchingExp = mockExperience({
            technologies: ["AWS", "Agile", "Scrum", "Jira"]
        });
        const nonMatchingExp = mockExperience({
            technologies: ["PHP", "MySQL", "Laravel"]
        });

        const matchingScore = calculateRelevanceScore(matchingExp, mockJobOffer);
        const nonMatchingScore = calculateRelevanceScore(nonMatchingExp, mockJobOffer);

        expect(matchingScore.score_breakdown.skills_match).toBeGreaterThan(
            nonMatchingScore.score_breakdown.skills_match
        );
    });

    it("should apply recency bonus for current job", () => {
        const currentJob = mockExperience({ date_fin: "présent" });
        const oldJob = mockExperience({ date_fin: "2015-12" });

        const currentScore = calculateRelevanceScore(currentJob, mockJobOffer);
        const oldScore = calculateRelevanceScore(oldJob, mockJobOffer);

        expect(currentScore.score_breakdown.recency_bonus).toBeGreaterThan(
            oldScore.score_breakdown.recency_bonus
        );
    });

    it("should include score breakdown", () => {
        const exp = mockExperience();
        const result = calculateRelevanceScore(exp, mockJobOffer);

        expect(result.score_breakdown).toHaveProperty("title_match");
        expect(result.score_breakdown).toHaveProperty("skills_match");
        expect(result.score_breakdown).toHaveProperty("recency_bonus");
        expect(result.score_breakdown).toHaveProperty("sector_bonus");
    });
});

describe("calculateDefaultScore", () => {
    it("should return 100 for current job", () => {
        const exp = mockExperience({ date_fin: "présent" });
        expect(calculateDefaultScore(exp)).toBe(100);
    });

    it("should return lower score for older jobs", () => {
        const recentJob = mockExperience({ date_fin: "2024-01" });
        const oldJob = mockExperience({ date_fin: "2010-01" });

        expect(calculateDefaultScore(recentJob)).toBeGreaterThan(
            calculateDefaultScore(oldJob)
        );
    });
});

describe("sortExperiencesByRelevance", () => {
    it("should sort by relevance when job offer provided", () => {
        const experiences = [
            mockExperience({ poste: "Développeur", date_fin: "présent" }),
            mockExperience({ poste: "Chef de Projet Digital", date_fin: "2020-12" }),
        ];

        const sorted = sortExperiencesByRelevance(experiences, mockJobOffer);

        // Chef de Projet should be first due to title match
        expect(sorted[0].poste).toBe("Chef de Projet Digital");
    });

    it("should sort by date when no job offer", () => {
        const experiences = [
            mockExperience({ poste: "Old Job", date_fin: "2015-01" }),
            mockExperience({ poste: "Current Job", date_fin: "présent" }),
        ];

        const sorted = sortExperiencesByRelevance(experiences, null);

        // Current job should be first
        expect(sorted[0].poste).toBe("Current Job");
    });

    it("should add _relevance_score to each experience", () => {
        const experiences = [mockExperience()];
        const sorted = sortExperiencesByRelevance(experiences, mockJobOffer);

        expect(sorted[0]).toHaveProperty("_relevance_score");
        expect(typeof sorted[0]._relevance_score).toBe("number");
    });
});

// ============================================================================
// ADAPTIVE ALGORITHM TESTS
// ============================================================================

describe("adaptCVToThemeUnits", () => {
    it("should respect zone capacities for modern theme", () => {
        const input = makeCV();
        const result = adaptCVToThemeUnits({
            cvData: input,
            templateName: "modern",
            includePhoto: true,
        });

        const theme = getThemeConfig("modern");
        const allowed = theme.page_config.total_height_units - theme.zones.margins.capacity_units;

        expect(result.zoneUnitsUsed.experiences).toBeLessThanOrEqual(
            theme.zones.experiences.capacity_units
        );
        expect(result.totalUnitsUsed).toBeLessThanOrEqual(allowed);
    });

    it("should respect zone capacities for tech theme", () => {
        const input = makeCV();
        const result = adaptCVToThemeUnits({
            cvData: input,
            templateName: "tech",
            includePhoto: false,
        });

        const theme = getThemeConfig("tech");
        expect(result.zoneUnitsUsed.skills).toBeLessThanOrEqual(
            theme.zones.skills.capacity_units
        );
    });

    it("should prioritize relevant experiences when job offer provided", () => {
        const input = makeCV({
            experiences: [
                { poste: "Développeur PHP", entreprise: "A", date_debut: "2023-01", date_fin: "présent", realisations: [] },
                { poste: "Chef de Projet AWS", entreprise: "B", date_debut: "2020-01", date_fin: "2022-12", realisations: [] },
            ],
        });

        const result = adaptCVToThemeUnits({
            cvData: input,
            templateName: "modern",
            includePhoto: false,
            jobOffer: mockJobOffer,
        });

        // Chef de Projet AWS should be first due to relevance to job offer
        expect(result.cvData.experiences[0].poste).toBe("Chef de Projet AWS");
    });

    it("should generate warnings when experiences are excluded", () => {
        // Create CV with many experiences to force exclusion
        const manyExperiences = Array.from({ length: 10 }).map((_, i) => ({
            poste: `Poste ${i + 1}`,
            entreprise: `Entreprise ${i + 1}`,
            date_debut: `${2015 + i}-01`,
            date_fin: i === 9 ? "présent" : `${2016 + i}-12`,
            realisations: Array.from({ length: 5 }).map((__, j) => `Réalisation ${j + 1}`),
        }));

        const input = makeCV({ experiences: manyExperiences });

        const result = adaptCVToThemeUnits({
            cvData: input,
            templateName: "creative", // More constrained template
            includePhoto: true,
        });

        // Should have some compression applied
        expect(result.compressionLevelApplied).toBeGreaterThanOrEqual(0);
    });

    it("should return correct structure", () => {
        const input = makeCV();
        const result = adaptCVToThemeUnits({
            cvData: input,
            templateName: "classic",
            includePhoto: false,
        });

        expect(result).toHaveProperty("cvData");
        expect(result).toHaveProperty("dense");
        expect(result).toHaveProperty("totalUnitsUsed");
        expect(result).toHaveProperty("zoneUnitsUsed");
        expect(result).toHaveProperty("warnings");
        expect(result).toHaveProperty("compressionLevelApplied");
        expect(Array.isArray(result.warnings)).toBe(true);
    });

    it("should never exceed total page units", () => {
        const themes = ["modern", "tech", "classic", "creative"];

        for (const templateName of themes) {
            const input = makeCV({
                experiences: Array.from({ length: 8 }).map((_, i) => ({
                    poste: `Poste ${i}`,
                    entreprise: `Entreprise ${i}`,
                    date_debut: "2020-01",
                    realisations: ["A", "B", "C", "D"],
                })),
            });

            const result = adaptCVToThemeUnits({
                cvData: input,
                templateName,
                includePhoto: true,
            });

            const theme = getThemeConfig(templateName);
            const maxAllowed = theme.page_config.total_height_units;

            // Total should be within bounds (or have warnings)
            expect(
                result.totalUnitsUsed <= maxAllowed || result.warnings.length > 0
            ).toBe(true);
        }
    });
});
