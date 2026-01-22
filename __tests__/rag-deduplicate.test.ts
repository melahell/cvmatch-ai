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
});

