import { describe, it, expect } from "vitest";

import { fitCVToTemplate } from "../lib/cv/validator";
import { getThemeConfig } from "../lib/cv/theme-configs";

function makeCV(overrides?: Partial<any>) {
    return {
        profil: {
            prenom: "Gilles",
            nom: "Gozlan",
            titre_principal: "Chef de Projet",
            email: "gilles@example.com",
            elevator_pitch: "x".repeat(600),
        },
        experiences: Array.from({ length: 6 }).map((_, i) => ({
            poste: `Poste ${i + 1}`,
            entreprise: `Entreprise ${i + 1}`,
            date_debut: "2020-01",
            date_fin: "2021-01",
            realisations: Array.from({ length: 6 }).map((__, j) => `Réalisation ${j + 1}`),
        })),
        competences: {
            techniques: Array.from({ length: 20 }).map((_, i) => `Skill ${i + 1}`),
            soft_skills: Array.from({ length: 12 }).map((_, i) => `Soft ${i + 1}`),
        },
        formations: Array.from({ length: 5 }).map((_, i) => ({
            diplome: `Diplôme ${i + 1}`,
            etablissement: "École",
            annee: "2015",
        })),
        ...overrides,
    };
}

describe("fitCVToTemplate", () => {
    it("compresse pour modern avec photo", () => {
        const input = makeCV();
        const result = fitCVToTemplate({ cvData: input, templateName: "modern", includePhoto: true });

        const theme = getThemeConfig("modern");
        const allowed = theme.page_config.total_height_units - theme.zones.margins.capacity_units;

        expect(result.unitStats.zoneUnitsUsed.experiences).toBeLessThanOrEqual(theme.zones.experiences.capacity_units);
        expect(result.unitStats.totalUnitsUsed).toBeLessThanOrEqual(allowed);
        expect(Math.max(...result.cvData.experiences.map((e: any) => e.realisations.length))).toBeLessThanOrEqual(6);
        expect(result.compressionLevelApplied).toBeGreaterThanOrEqual(0);
    });

    it("autorise plus d'expériences en classic sans photo", () => {
        const input = makeCV({ profil: { prenom: "A", nom: "B", titre_principal: "C", elevator_pitch: "OK" } });
        const result = fitCVToTemplate({ cvData: input, templateName: "classic", includePhoto: false });

        const theme = getThemeConfig("classic");
        const allowed = theme.page_config.total_height_units - theme.zones.margins.capacity_units;

        expect(result.unitStats.totalUnitsUsed).toBeLessThanOrEqual(allowed);
        expect(result.cvData.experiences.length).toBeGreaterThanOrEqual(4);
    });
});
