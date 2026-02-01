import { describe, it, expect } from "vitest";
import { buildCVLossReport } from "@/lib/cv/loss-report";

describe("buildCVLossReport", () => {
    it("should report removed experiences and realisations across stages", () => {
        const input = {
            profil: { elevator_pitch: "x".repeat(200) },
            competences: { techniques: ["A", "B"], soft_skills: ["Leadership"] },
            formations: [{ diplome: "X", etablissement: "Y", annee: "2020" }],
            langues: [{ langue: "Anglais", niveau: "C1" }],
            certifications: ["Cert 1"],
            clients_references: { clients: ["Total"] },
            experiences: [
                {
                    poste: "PM",
                    entreprise: "Entreprise A",
                    date_debut: "2020",
                    date_fin: "2021",
                    lieu: "Paris",
                    clients: ["Client 1"],
                    realisations: ["Bullet 1", "Bullet 2"],
                },
                {
                    poste: "Dev",
                    entreprise: "Entreprise B",
                    date_debut: "2018",
                    date_fin: "2020",
                    lieu: "Lyon",
                    clients: ["Client 2"],
                    realisations: ["Bullet 3", "Bullet 4"],
                },
            ],
        };

        const preselected = { ...input };
        const prelimited = { ...input };
        const adapted = {
            ...input,
            profil: { elevator_pitch: "x".repeat(120) },
            experiences: [
                {
                    poste: "PM",
                    entreprise: "Entreprise A",
                    date_debut: "2020",
                    date_fin: "2021",
                    lieu: "Paris",
                    clients: ["Client 1"],
                    realisations: ["Bullet 1"],
                },
            ],
        };

        const report = buildCVLossReport({
            input,
            preselected,
            prelimited,
            adapted,
            templateName: "modern",
        });

        expect(report.counts.input.experiences).toBe(2);
        expect(report.counts.adapted.experiences).toBe(1);
        expect(report.removed.experiences.prelimitedToAdapted).toEqual(["Dev - Entreprise B"]);
        expect(report.removed.realisations).toBe(1);
        expect(report.removed.elevatorPitchChars.before).toBe(200);
        expect(report.removed.elevatorPitchChars.after).toBe(120);
    });

    it("should flag template omissions deterministically", () => {
        const input = {
            profil: { linkedin: "https://linkedin.com/in/x" },
            competences: { techniques: ["A"], soft_skills: ["Leadership"] },
            experiences: [{ poste: "PM", entreprise: "Entreprise A", date_debut: "2020", realisations: [] }],
        };

        const report = buildCVLossReport({
            input,
            preselected: input,
            prelimited: input,
            adapted: input,
            templateName: "classic",
        });

        expect(report.templateOmissions).toEqual(expect.arrayContaining(["profil.linkedin/github/portfolio", "competences.soft_skills"]));
    });
});

