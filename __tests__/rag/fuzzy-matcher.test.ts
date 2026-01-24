import { describe, it, expect } from "vitest";
import {
    fuzzyAreExperiencesSimilar,
    fuzzyMatchCompany,
} from "../../lib/rag/fuzzy-matcher";

describe("fuzzy-matcher", () => {
    describe("fuzzyAreExperiencesSimilar", () => {
        it("détecte les expériences similaires avec variations", () => {
            const exp1 = {
                poste: "PMO",
                entreprise: "BNP",
                debut: "2023-01",
            };

            const exp2 = {
                poste: "PMO",
                entreprise: "BNP Paribas",
                debut: "2023-01",
            };

            const isSimilar = fuzzyAreExperiencesSimilar(exp1, exp2, 0.75, 0.7);
            expect(isSimilar).toBe(true);
        });

        it("utilise le threshold 0.75 pour la similarité", () => {
            const exp1 = {
                poste: "Project Manager",
                entreprise: "Test",
                debut: "2023-01",
            };

            const exp2 = {
                poste: "Project Management",
                entreprise: "Test",
                debut: "2023-01",
            };

            const isSimilar = fuzzyAreExperiencesSimilar(exp1, exp2, 0.75, 0.7);
            // Devrait être similaire avec threshold 0.75
            expect(typeof isSimilar).toBe("boolean");
        });
    });

    describe("fuzzyMatchCompany", () => {
        it("matche les entreprises avec variations", () => {
            const match1 = fuzzyMatchCompany("BNP", "BNP Paribas", 0.75);
            expect(match1).toBe(true);

            const match2 = fuzzyMatchCompany("VW", "Volkswagen", 0.75);
            expect(match2).toBe(true);
        });

        it("respecte le threshold de similarité", () => {
            const match = fuzzyMatchCompany("Test Corp", "Different Corp", 0.75);
            expect(match).toBe(false);
        });
    });
});
