import { describe, it, expect } from "vitest";
import {
    stringSimilarity,
    wordSimilarity,
    combinedSimilarity,
    calculateStringSimilarity,
    areStringsSimilar,
} from "../../lib/rag/string-similarity";

describe("string-similarity", () => {
    describe("stringSimilarity", () => {
        it("retourne 1.0 pour chaînes identiques", () => {
            expect(stringSimilarity("test", "test")).toBe(1.0);
            expect(stringSimilarity("Chef de Projet", "Chef de Projet")).toBe(1.0);
        });

        it("retourne 0 pour valeurs nulles/undefined", () => {
            expect(stringSimilarity(null as any, "test")).toBe(0);
            expect(stringSimilarity("test", undefined as any)).toBe(0);
        });

        it("calcule similarité Levenshtein correctement", () => {
            const sim = stringSimilarity("Project Manager", "Project management");
            expect(sim).toBeGreaterThan(0.7);
            expect(sim).toBeLessThanOrEqual(1.0);
        });
    });

    describe("wordSimilarity", () => {
        it("détecte similarité indépendamment de l'ordre des mots", () => {
            expect(wordSimilarity("Quality Manager & PMO", "PMO & Quality Manager")).toBe(1.0);
        });

        it("ignore les stop words", () => {
            const sim = wordSimilarity("Chef de Projet", "Chef du Projet");
            expect(sim).toBeGreaterThan(0.8);
        });

        it("retourne 0 pour chaînes sans mots communs", () => {
            expect(wordSimilarity("Developer", "Manager")).toBe(0);
        });
    });

    describe("combinedSimilarity", () => {
        it("combine Levenshtein et Jaccard avec poids adaptatifs", () => {
            const sim = combinedSimilarity("Senior Developer", "Lead Developer");
            expect(sim).toBeGreaterThan(0.5);
            expect(sim).toBeLessThanOrEqual(1.0);
        });

        it("utilise poids adaptatifs selon longueur", () => {
            const shortSim = combinedSimilarity("PMO", "PMO Manager");
            const longSim = combinedSimilarity(
                "Project Management Office Manager",
                "PMO Manager"
            );
            // Long strings should favor Jaccard more
            expect(longSim).toBeGreaterThan(shortSim * 0.5);
        });
    });

    describe("calculateStringSimilarity", () => {
        it("normalise accents et casse", () => {
            const sim = calculateStringSimilarity("Café", "cafe");
            expect(sim).toBeGreaterThan(0.9);
        });

        it("ignore la ponctuation", () => {
            const sim = calculateStringSimilarity("PMO & Quality", "PMO Quality");
            expect(sim).toBeGreaterThan(0.8);
        });

        it("gère les chaînes avec caractères spéciaux", () => {
            const sim = calculateStringSimilarity("C++ Developer", "C Developer");
            expect(sim).toBeGreaterThan(0.5);
        });
    });

    describe("areStringsSimilar", () => {
        it("détecte similarité au-dessus du threshold", () => {
            expect(areStringsSimilar("Project Manager", "Project management", 0.75)).toBe(true);
        });

        it("détecte non-similarité en-dessous du threshold", () => {
            expect(areStringsSimilar("Developer", "Manager", 0.75)).toBe(false);
        });

        it("utilise threshold par défaut 0.75", () => {
            expect(areStringsSimilar("PMO", "PMO Manager")).toBe(false); // Below 0.75
            expect(areStringsSimilar("Project Manager", "Project management")).toBe(true); // Above 0.75
        });
    });
});
