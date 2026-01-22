import { describe, it, expect } from "vitest";

import { normalizeRAGToCV } from "../components/cv/normalizeData";

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

