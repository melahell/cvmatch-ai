import { describe, it, expect } from "vitest";

import { normalizeRAGData } from "../lib/utils/normalize-rag";

describe("normalizeRAGData", () => {
    it("génère des IDs déterministes", () => {
        const input = {
            profil: { prenom: "Gilles", nom: "Gozlan" },
            experiences: [
                {
                    poste: "PMO",
                    entreprise: "Volkswagen Financial Services",
                    debut: "2023-04",
                    fin: null,
                    actuel: true,
                    realisations: [{ description: "Pilotage PPM", impact: "" }]
                }
            ]
        };

        const a = normalizeRAGData(input);
        const b = normalizeRAGData(input);

        expect(a.experiences[0].id).toBe(b.experiences[0].id);
        expect(a.experiences[0].realisations[0].id).toBe(b.experiences[0].realisations[0].id);
    });

    it("déduplique les expériences identiques et fusionne les réalisations", () => {
        const input = {
            profil: { prenom: "Gilles", nom: "Gozlan" },
            experiences: [
                {
                    poste: "PMO & Quality Manager",
                    entreprise: "Volkswagen Financial Services",
                    debut: "2023-04",
                    fin: null,
                    actuel: true,
                    technologies: ["Orchestra"],
                    clients_references: ["Volkswagen Financial Services"],
                    realisations: [{ description: "Pilotage 150 projets/an", impact: "" }]
                },
                {
                    poste: "PMO & Quality Manager",
                    entreprise: "Volkswagen Financial Services",
                    debut: "2023-04",
                    fin: null,
                    actuel: true,
                    technologies: ["Planisware"],
                    clients_references: ["Volkswagen Financial Services"],
                    realisations: [{ description: "Mise en place audits qualité", impact: "" }]
                }
            ]
        };

        const out = normalizeRAGData(input);
        expect(out.experiences.length).toBe(1);
        expect(out.experiences[0].technologies.sort()).toEqual(["Orchestra", "Planisware"].sort());
        expect(out.experiences[0].realisations.length).toBe(2);
    });
});

