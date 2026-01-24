import { describe, it, expect } from "vitest";
import { deduplicateExperiences } from "../../lib/rag/deduplicate";

describe("deduplicate", () => {
    describe("deduplicateExperiences", () => {
        it("fusionne les expériences avec variations noms entreprises", () => {
            const exps = [
                {
                    poste: "PMO",
                    entreprise: "BNP",
                    debut: "2023-01",
                    realisations: [{ description: "Test" }],
                },
                {
                    poste: "PMO",
                    entreprise: "BNP Paribas",
                    debut: "2023-01",
                    realisations: [{ description: "Test" }],
                },
            ];

            const deduplicated = deduplicateExperiences(exps as any);
            expect(deduplicated.length).toBe(1);
        });

        it("préserve les réalisations avec impacts quantifiés", () => {
            const exps = [
                {
                    poste: "Dev Lead",
                    entreprise: "Tech Corp",
                    debut: "2022-01",
                    realisations: [
                        { description: "Gestion équipe", impact: "+20% productivité" },
                        { description: "Gestion équipe", impact: "" },
                    ],
                },
            ];

            const deduplicated = deduplicateExperiences(exps as any);
            const realisation = deduplicated[0].realisations.find(
                (r: any) => r.description.includes("Gestion")
            );
            expect(realisation?.impact).toBe("+20% productivité");
        });

        it("gère les chaînes longues vs courtes", () => {
            const exps = [
                {
                    poste: "PMO",
                    entreprise: "Test",
                    debut: "2023-01",
                    realisations: [
                        {
                            description: "Pilotage centralisé du portefeuille projets et ressources de la DSI via Orchestra avec suivi budgétaire et reporting",
                        },
                        {
                            description: "Pilotage projets",
                        },
                    ],
                },
            ];

            const deduplicated = deduplicateExperiences(exps as any);
            // Devrait garder la version la plus détaillée
            const longDescription = deduplicated[0].realisations.find(
                (r: any) => r.description.length > 50
            );
            expect(longDescription).toBeDefined();
        });
    });
});
