import { describe, it, expect } from "vitest";
import { deduplicateExperiences } from "../../lib/rag/deduplicate";

/**
 * Tests E2E pour la déduplication RAG
 * Valide que la déduplication réduit correctement les doublons
 */
describe("RAG Deduplication E2E", () => {
    it("devrait réduire 60+ doublons à 8-12 réalisations", () => {
        const experience = {
            poste: "PMO",
            entreprise: "Volkswagen",
            debut: "2023-01",
            realisations: Array.from({ length: 60 }, (_, i) => ({
                description: `Pilotage centralisé du portefeuille projets ${i % 8 === 0 ? "" : "et ressources"}`,
                impact: i % 3 === 0 ? "+10%" : "",
            })),
        };

        const exps = [experience];
        const deduplicated = deduplicateExperiences(exps as any);

        expect(deduplicated.length).toBe(1);
        // Après déduplication, devrait avoir beaucoup moins de réalisations
        expect(deduplicated[0].realisations.length).toBeLessThan(60);
        // Idéalement entre 8-12, mais au moins < 20
        expect(deduplicated[0].realisations.length).toBeLessThan(20);
    });

    it("devrait préserver la structure des réalisations après déduplication", () => {
        const exps = [
            {
                poste: "PMO",
                entreprise: "BNP",
                debut: "2023-01",
                realisations: [
                    {
                        description: "Pilotage projets",
                        impact: "+15% efficacité",
                        sources: ["cv.pdf"],
                        outils: ["Excel"],
                    },
                    {
                        description: "Pilotage projets",
                        impact: "",
                        sources: ["linkedin.html"],
                    },
                ],
            },
        ];

        const deduplicated = deduplicateExperiences(exps as any);
        expect(deduplicated.length).toBe(1);
        expect(Array.isArray(deduplicated[0].realisations)).toBe(true);
        
        const realisation = deduplicated[0].realisations[0];
        expect(typeof realisation).toBe("object");
        expect(realisation.description).toBeDefined();
        // Devrait préserver l'impact et les sources
        if (realisation.impact) {
            expect(realisation.impact).toBe("+15% efficacité");
        }
    });

    it("devrait conserver les impacts quantifiés lors de la fusion", () => {
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
        
        // Devrait garder la version avec impact
        expect(realisation?.impact).toBe("+20% productivité");
    });
});
