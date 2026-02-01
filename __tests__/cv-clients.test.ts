import { describe, it, expect } from "vitest";

import { normalizeRAGToCV } from "../components/cv/normalizeData";
import { fitCVToTemplate } from "../lib/cv/validator";

describe("normalizeRAGToCV - clients_references", () => {
    it("ne doit pas ajouter de clients sur simple mention textuelle non structurée", () => {
        const ragLike = {
            profil: {
                prenom: "Gilles",
                nom: "Gozlan",
                titre_principal: "PMO",
                localisation: "France",
                elevator_pitch: "Pilotage total des activités (mot commun, pas la société).",
                contact: { email: "gilles@example.com" }
            },
            experiences: [
                {
                    poste: "PMO",
                    entreprise: "Entreprise X",
                    debut: "2023-04",
                    fin: null,
                    actuel: true,
                    realisations: [{ description: "Pilotage", impact: "" }]
                }
            ],
            references: { clients: [] }
        };

        const cv = normalizeRAGToCV(ragLike as any);
        expect(cv.clients_references).toBeUndefined();
    });

    it("doit inclure les clients explicitement présents dans references.clients", () => {
        const ragLike = {
            profil: {
                prenom: "Gilles",
                nom: "Gozlan",
                titre_principal: "PMO",
                localisation: "France",
                elevator_pitch: "PMO.",
                contact: { email: "gilles@example.com" }
            },
            experiences: [],
            references: { clients: [{ nom: "Chanel", secteur: "Luxe" }] }
        };

        const cv = normalizeRAGToCV(ragLike as any);
        expect(cv.clients_references?.clients).toContain("Chanel");
    });
});

describe("fitCVToTemplate - clients_references", () => {
    it("doit préserver des clients en template tech", () => {
        const cvData: any = {
            profil: { prenom: "Gilles", nom: "Gozlan", titre_principal: "PMO" },
            experiences: [
                { poste: "PMO", entreprise: "Entreprise X", date_debut: "2020", date_fin: "2021", realisations: ["A"] },
            ],
            competences: { techniques: ["A"], soft_skills: [] },
            langues: [],
            formations: [],
            certifications: [],
            clients_references: { clients: ["Société Générale", "BNP Paribas", "Volkswagen Financial Services"] },
        };

        const fitted = fitCVToTemplate({ cvData, templateName: "tech", includePhoto: true });
        expect(fitted.cvData.clients_references?.clients?.length || 0).toBeGreaterThan(0);
    });
});
