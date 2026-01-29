import { describe, it, expect } from "vitest";

import { normalizeRAGData } from "../lib/utils/normalize-rag";
import { normalizeRAGToCV } from "../components/cv/normalizeData";
import { fitCVToTemplate } from "../lib/cv/validator";

describe("CV quality guardrails", () => {
    it("merge les expériences doublonnées même si les dates sont date_debut/date_fin", () => {
        const rag = {
            profil: { prenom: "Gilles", nom: "Gozlan" },
            experiences: [
                { poste: "PMO", entreprise: "Volkswagen", date_debut: "2023-04", actuel: true, realisations: ["A"] },
                { poste: "PMO", entreprise: "Volkswagen", date_debut: "2023-04", actuel: true, realisations: ["B"] },
            ],
        };

        const normalized = normalizeRAGData(rag);
        expect(Array.isArray(normalized.experiences)).toBe(true);
        expect(normalized.experiences.length).toBe(1);
        expect(normalized.experiences[0].realisations.length).toBeGreaterThanOrEqual(2);
    });

    it("ne propage pas les placeholders contact et récupère les valeurs réelles", () => {
        const raw: any = {
            profil: {
                prenom: "Gilles",
                nom: "Gozlan",
                email: "non renseigné",
                contact: { email: "gilles@example.com", telephone: "0600000000", linkedin: "linkedin.com/in/gilles" },
            },
            experiences: [],
            competences: { techniques: [], soft_skills: [] },
            formations: [],
            langues: [],
        };
        const cv = normalizeRAGToCV(raw);
        expect(cv.profil.email).toBe("gilles@example.com");
        expect(cv.profil.telephone).toBe("0600000000");
        expect(cv.profil.linkedin).toBe("linkedin.com/in/gilles");
    });

    it("consolide les langues (une seule ligne pour l'anglais)", () => {
        const raw: any = {
            profil: { prenom: "Gilles", nom: "Gozlan" },
            experiences: [],
            competences: { techniques: [], soft_skills: [] },
            formations: [],
            langues: [
                { langue: "Anglais", niveau: "B1" },
                { langue: "Anglais (Global)", niveau: "B1" },
                { langue: "Anglais (Reading)", niveau: "A2" },
                { langue: "Français", niveau: "Natif" },
            ],
        };
        const cv = normalizeRAGToCV(raw);
        const english = (cv.langues || []).filter((l) => l.langue.toLowerCase().includes("anglais"));
        expect(english.length).toBe(1);
    });

    it("récupère les formations depuis profil.formations si formations[] est vide", () => {
        const raw: any = {
            profil: {
                prenom: "Gilles",
                nom: "Gozlan",
                formations: [{ diplome: "Master", etablissement: "Université X", annee: "2012" }],
            },
            experiences: [],
            competences: { techniques: [], soft_skills: [] },
            formations: [],
            langues: [],
        };
        const cv = normalizeRAGToCV(raw);
        expect(cv.formations.length).toBeGreaterThan(0);
    });

    it("applique les budgets template (expériences/langues/clients) et filtre les side-projects en contexte PM", () => {
        const cvData: any = {
            profil: { prenom: "Gilles", nom: "Gozlan", elevator_pitch: "Pitch" },
            experiences: [
                { poste: "Chef de projet", entreprise: "A", date_debut: "2023-01", date_fin: "2024-01", realisations: ["R1", "R2", "R3", "R4", "R5"] },
                { poste: "PMO", entreprise: "B", date_debut: "2021-01", date_fin: "2022-01", realisations: ["R1", "R2", "R3"] },
                { poste: "Chef de projet", entreprise: "C", date_debut: "2019-01", date_fin: "2020-01", realisations: ["R1", "R2", "R3"] },
                { poste: "Fondateur & Développeur", entreprise: "Side Project", date_debut: "2025-01", actuel: true, realisations: ["R1"] },
            ],
            competences: { techniques: Array.from({ length: 50 }, (_, i) => `Skill ${i}`), soft_skills: Array.from({ length: 20 }, (_, i) => `Soft ${i}`) },
            formations: Array.from({ length: 10 }, (_, i) => ({ diplome: `Diplôme ${i}`, etablissement: "X", annee: "2010" })),
            langues: [
                { langue: "Français", niveau: "Natif" },
                { langue: "Anglais", niveau: "B1" },
                { langue: "Espagnol", niveau: "A2" },
                { langue: "Allemand", niveau: "A1" },
            ],
            certifications: Array.from({ length: 10 }, (_, i) => `Cert ${i}`),
            clients_references: {
                clients: Array.from({ length: 30 }, (_, i) => `Client ${i}`),
                secteurs: [
                    { secteur: "Luxe", clients: Array.from({ length: 20 }, (_, i) => `Luxe ${i}`) },
                    { secteur: "Retail", clients: Array.from({ length: 20 }, (_, i) => `Retail ${i}`) },
                ],
            },
        };

        const result = fitCVToTemplate({
            cvData,
            templateName: "modern",
            includePhoto: true,
            jobOffer: { title: "Chef de projets IT" },
        });

        expect(result.cvData.experiences.length).toBeLessThanOrEqual(4);
        expect((result.cvData.langues || []).length).toBeLessThanOrEqual(4);
        expect((result.cvData.certifications || []).length).toBeLessThanOrEqual(4);
        expect((result.cvData.clients_references?.clients || []).length).toBeLessThanOrEqual(8);
        expect((result.cvData.clients_references?.secteurs || []).length).toBeLessThanOrEqual(4);

        const hasSideProject = (result.cvData.experiences || []).some((e: any) => String(e.poste).toLowerCase().includes("développeur"));
        expect(hasSideProject).toBe(false);
    });
});
