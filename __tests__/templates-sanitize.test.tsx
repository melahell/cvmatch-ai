import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import ModernTemplate from "../components/cv/templates/ModernTemplate";

describe("Templates sanitizeText", () => {
    it("ne doit pas crasher si des champs sont non-string", () => {
        const data: any = {
            profil: {
                prenom: "Gilles",
                nom: "Gozlan",
                titre_principal: { weird: true },
                email: "gilles@example.com",
                elevator_pitch: 42,
            },
            experiences: [
                {
                    poste: 123,
                    entreprise: { name: "Entreprise X" },
                    date_debut: "2023-01",
                    realisations: [{ description: "Test", impact: "Impact" }],
                },
            ],
            competences: { techniques: [{ name: "React" }], soft_skills: [null] },
            formations: [],
            langues: [],
            certifications: [],
        };

        expect(() => {
            render(<ModernTemplate data={data} includePhoto={false} dense={false} />);
        }).not.toThrow();
    });
});

