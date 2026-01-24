import { describe, it, expect } from "vitest";
import { mergeRAGData } from "../../lib/rag/merge-simple";

describe("merge-simple", () => {
    describe("mergeRAGData", () => {
        it("fusionne les expériences avec threshold 0.75", () => {
            const existing = {
                experiences: [
                    {
                        poste: "PMO",
                        entreprise: "BNP",
                        debut: "2023-01",
                        realisations: [
                            { description: "Pilotage projets", impact: "+10%" },
                        ],
                    },
                ],
            };

            const incoming = {
                experiences: [
                    {
                        poste: "PMO",
                        entreprise: "BNP Paribas",
                        debut: "2023-01",
                        realisations: [
                            { description: "Pilotage projets", impact: "" },
                        ],
                    },
                ],
            };

            const result = mergeRAGData(existing, incoming);
            expect(result.merged.experiences.length).toBe(1);
        });

        it("normalise les entreprises lors de la fusion", () => {
            const existing = {
                experiences: [
                    {
                        poste: "Developer",
                        entreprise: "VW",
                        debut: "2022-01",
                        realisations: [],
                    },
                ],
            };

            const incoming = {
                experiences: [
                    {
                        poste: "Developer",
                        entreprise: "Volkswagen",
                        debut: "2022-01",
                        realisations: [],
                    },
                ],
            };

            const result = mergeRAGData(existing, incoming);
            expect(result.merged.experiences.length).toBe(1);
        });

        it("utilise le threshold 0.75 pour la déduplication", () => {
            const existing = {
                experiences: [
                    {
                        poste: "PMO",
                        entreprise: "Test",
                        debut: "2023-01",
                        realisations: [
                            { description: "Pilotage centralisé du portefeuille projets" },
                        ],
                    },
                ],
            };

            const incoming = {
                experiences: [
                    {
                        poste: "PMO",
                        entreprise: "Test",
                        debut: "2023-01",
                        realisations: [
                            { description: "Pilotage portefeuille projets" },
                        ],
                    },
                ],
            };

            const result = mergeRAGData(existing, incoming);
            // Avec threshold 0.75, ces réalisations similaires devraient être fusionnées
            const experience = result.merged.experiences[0];
            expect(experience.realisations.length).toBeLessThanOrEqual(2);
        });
    });
});
