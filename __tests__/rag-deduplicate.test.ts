import { describe, it, expect } from "vitest";

import { deduplicateExperiences } from "../lib/rag/deduplicate";

describe("RAG deduplicate", () => {
    it("ne fusionne pas deux expériences éloignées dans le temps", () => {
        const exps: any[] = [
            { poste: "Chef de projet", entreprise: "ACME", debut: "2018-01", fin: "2019-01", realisations: [{ description: "A" }] },
            { poste: "Chef de projet", entreprise: "ACME", debut: "2022-01", fin: "2023-01", realisations: [{ description: "B" }] },
        ];
        const out = deduplicateExperiences(exps as any);
        expect(out.length).toBe(2);
    });

    it("préserve les réalisations en objets et fusionne les sources", () => {
        const exps: any[] = [
            {
                poste: "PMO",
                entreprise: "Volkswagen",
                debut: "2023-04",
                actuel: true,
                realisations: [{ description: "Suivi budget", impact: "+10%", sources: ["cv.pdf"] }],
            },
            {
                poste: "PMO",
                entreprise: "Volkswagen",
                debut: "2023-04",
                actuel: true,
                realisations: [{ description: "Suivi budget", impact: "+10%", sources: ["linkedin.html"] }],
            },
        ];
        const out = deduplicateExperiences(exps as any);
        expect(out.length).toBe(1);
        expect(Array.isArray(out[0].realisations)).toBe(true);
        expect(typeof out[0].realisations[0]).toBe("object");
        expect(out[0].realisations[0].description).toContain("Suivi budget");
        expect(out[0].realisations[0].sources).toEqual(expect.arrayContaining(["cv.pdf", "linkedin.html"]));
    });

    it("préserve la meilleure version avec impact quantifié", () => {
        const exps: any[] = [
            {
                poste: "PMO",
                entreprise: "BNP",
                debut: "2023-01",
                realisations: [
                    { description: "Pilotage projets", impact: "" },
                    { description: "Reporting", impact: "+15% efficacité" },
                ],
            },
            {
                poste: "PMO",
                entreprise: "BNP Paribas",
                debut: "2023-01",
                realisations: [
                    { description: "Pilotage projets", impact: "" },
                    { description: "Reporting", impact: "" },
                ],
            },
        ];
        const out = deduplicateExperiences(exps as any);
        expect(out.length).toBe(1);
        // Should keep the version with impact
        const reporting = out[0].realisations.find((r: any) => r.description.includes("Reporting"));
        expect(reporting?.impact).toBe("+15% efficacité");
    });

    it("gère les réalisations similaires mais formulées différemment", () => {
        const exps: any[] = [
            {
                poste: "Dev Lead",
                entreprise: "Tech Corp",
                debut: "2022-01",
                realisations: [
                    { description: "Gestion de l'équipe de développement" },
                ],
            },
            {
                poste: "Dev Lead",
                entreprise: "Tech Corp",
                debut: "2022-01",
                realisations: [
                    { description: "Gestion équipe développement" },
                ],
            },
        ];
        const out = deduplicateExperiences(exps as any);
        expect(out.length).toBe(1);
        // Should merge similar realisations
        expect(out[0].realisations.length).toBeLessThanOrEqual(2);
    });

    it("préserve toutes les propriétés lors de la fusion", () => {
        const exps: any[] = [
            {
                poste: "PMO",
                entreprise: "VW",
                debut: "2023-01",
                realisations: [
                    {
                        description: "Pilotage",
                        impact: "+10%",
                        sources: ["cv.pdf"],
                        outils: ["Excel"],
                    },
                ],
            },
            {
                poste: "PMO",
                entreprise: "Volkswagen",
                debut: "2023-01",
                realisations: [
                    {
                        description: "Pilotage",
                        impact: "",
                        sources: ["linkedin.html"],
                        methodes: ["Agile"],
                    },
                ],
            },
        ];
        const out = deduplicateExperiences(exps as any);
        expect(out.length).toBe(1);
        const realisation = out[0].realisations[0];
        expect(realisation.impact).toBe("+10%"); // Keep version with impact
        expect(realisation.sources).toContain("cv.pdf");
        expect(realisation.sources).toContain("linkedin.html");
        expect(realisation.outils).toEqual(["Excel"]);
        expect(realisation.methodes).toEqual(["Agile"]);
    });
});

