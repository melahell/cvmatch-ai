import { describe, it, expect } from "vitest";
import { convertAndSort } from "@/lib/cv/ai-adapter";
import { AIWidgetsEnvelope, AIWidget } from "@/lib/cv/ai-widgets";

describe("convertAndSort", () => {
    const createMockWidget = (overrides: Partial<AIWidget>): AIWidget => ({
        id: `widget-${Math.random()}`,
        type: "experience_bullet",
        section: "experiences",
        text: "Réalisation test",
        relevance_score: 75,
        sources: { rag_experience_id: "exp-default" },
        ...overrides,
    });

    const createMockEnvelope = (widgets: AIWidget[]): AIWidgetsEnvelope => ({
        widgets,
        profil_summary: {
            prenom: "Jean",
            nom: "Dupont",
            titre_principal: "Développeur",
        },
    });

    it("should convert widgets to CVData", () => {
        const widgets = [
            createMockWidget({
                type: "summary_block",
                section: "summary",
                text: "Développeur expérimenté",
                relevance_score: 90,
            }),
            createMockWidget({
                type: "experience_bullet",
                section: "experiences",
                text: "Développement d'une app React",
                relevance_score: 85,
                sources: { rag_experience_id: "exp-1" },
            }),
        ];

        const envelope = createMockEnvelope(widgets);
        const result = convertAndSort(envelope);

        expect(result).toHaveProperty("profil");
        expect(result).toHaveProperty("experiences");
        expect(result.profil.prenom).toBe("Jean");
        expect(result.profil.nom).toBe("Dupont");
        expect(result.experiences.length).toBeGreaterThan(0);
    });

    it("should filter by minScore", () => {
        const widgets = [
            createMockWidget({ type: "experience_header", text: "Dev - Company", relevance_score: 80, sources: { rag_experience_id: "exp-default" } }),
            createMockWidget({ relevance_score: 80, text: "High score", sources: { rag_experience_id: "exp-default" } }),
            createMockWidget({ relevance_score: 30, text: "Low score", sources: { rag_experience_id: "exp-default" } }),
            createMockWidget({ relevance_score: 50, text: "Border score", sources: { rag_experience_id: "exp-default" } }),
        ];

        const envelope = createMockEnvelope(widgets);
        const result = convertAndSort(envelope, { minScore: 50 });

        // Seuls les widgets avec score >= 50 doivent être inclus
        const allBullets = result.experiences.flatMap((e) => e.realisations);
        expect(allBullets).toContain("High score");
        expect(allBullets).toContain("Border score");
        expect(allBullets).not.toContain("Low score");
    });

    it("should limit experiences", () => {
        const widgets = Array.from({ length: 10 }, (_, i) =>
            createMockWidget({
                text: `Expérience ${i}`,
                relevance_score: 80 - i,
                sources: { rag_experience_id: `exp-${i}` },
            })
        );

        const envelope = createMockEnvelope(widgets);
        const result = convertAndSort(envelope, { maxExperiences: 3 });

        expect(result.experiences.length).toBeLessThanOrEqual(3);
    });

    it("should limit bullets per experience", () => {
        const widgets = Array.from({ length: 10 }, (_, i) =>
            createMockWidget({
                text: `Bullet ${i}`,
                relevance_score: 80 - i,
                sources: { rag_experience_id: "exp-1" },
            })
        );

        const envelope = createMockEnvelope(widgets);
        const result = convertAndSort(envelope, { maxBulletsPerExperience: 3 });

        const firstExp = result.experiences[0];
        expect(firstExp.realisations.length).toBeLessThanOrEqual(3);
    });

    it("should sort by relevance_score descending", () => {
        const widgets = [
            createMockWidget({ type: "experience_header", text: "Exp1 - C1", relevance_score: 0, sources: { rag_experience_id: "exp-1" } }),
            createMockWidget({ text: "Score 60", relevance_score: 60, sources: { rag_experience_id: "exp-1" } }),
            createMockWidget({ type: "experience_header", text: "Exp2 - C2", relevance_score: 0, sources: { rag_experience_id: "exp-2" } }),
            createMockWidget({ text: "Score 90", relevance_score: 90, sources: { rag_experience_id: "exp-2" } }),
            createMockWidget({ type: "experience_header", text: "Exp3 - C3", relevance_score: 0, sources: { rag_experience_id: "exp-3" } }),
            createMockWidget({ text: "Score 70", relevance_score: 70, sources: { rag_experience_id: "exp-3" } }),
        ];

        const envelope = createMockEnvelope(widgets);
        const result = convertAndSort(envelope);

        // Les expériences doivent être triées par score décroissant
        expect(result.experiences[0].realisations).toContain("Score 90");
        expect(result.experiences[1].realisations).toContain("Score 70");
        expect(result.experiences[2].realisations).toContain("Score 60");
    });

    it("should group experience bullets by rag_experience_id", () => {
        const widgets = [
            createMockWidget({
                type: "experience_header",
                text: "Dev - A",
                sources: { rag_experience_id: "exp-1" },
            }),
            createMockWidget({
                text: "Bullet 1 exp-1",
                sources: { rag_experience_id: "exp-1" },
            }),
            createMockWidget({
                text: "Bullet 2 exp-1",
                sources: { rag_experience_id: "exp-1" },
            }),
            createMockWidget({
                type: "experience_header",
                text: "Dev - B",
                sources: { rag_experience_id: "exp-2" },
            }),
            createMockWidget({
                text: "Bullet 1 exp-2",
                sources: { rag_experience_id: "exp-2" },
            }),
        ];

        const envelope = createMockEnvelope(widgets);
        const result = convertAndSort(envelope);

        // Doit créer 2 expériences distinctes
        expect(result.experiences.length).toBe(2);
        
        // Vérifier que les bullets sont groupés
        const exp1 = result.experiences.find((e) => e.entreprise === "A");
        expect(exp1?.realisations).toContain("Bullet 1 exp-1");
        expect(exp1?.realisations).toContain("Bullet 2 exp-1");
    });

    it("should build profil from headerWidgets", () => {
        const widgets = [
            createMockWidget({
                type: "summary_block",
                section: "summary",
                text: "Développeur Full Stack avec 5 ans d'expérience",
                relevance_score: 90,
            }),
        ];

        const envelope = createMockEnvelope(widgets);
        envelope.profil_summary = {
            prenom: "Marie",
            nom: "Martin",
            titre_principal: "Développeuse",
        };

        const result = convertAndSort(envelope);

        expect(result.profil.prenom).toBe("Marie");
        expect(result.profil.nom).toBe("Martin");
        expect(result.profil.elevator_pitch).toBe("Développeur Full Stack avec 5 ans d'expérience");
    });

    it("should build competences from skillsWidgets", () => {
        const widgets = [
            createMockWidget({
                type: "skill_item",
                section: "skills",
                text: "React",
                relevance_score: 85,
            }),
            createMockWidget({
                type: "skill_item",
                section: "skills",
                text: "TypeScript",
                relevance_score: 80,
            }),
            createMockWidget({
                type: "skill_item",
                section: "skills",
                text: "Communication",
                relevance_score: 75,
            }),
        ];

        const envelope = createMockEnvelope(widgets);
        const result = convertAndSort(envelope);

        expect(result.competences).toBeDefined();
        // Les compétences techniques doivent être présentes
        const allSkills = [
            ...(result.competences.techniques || []),
            ...(result.competences.soft_skills || []),
        ];
        expect(allSkills.length).toBeGreaterThan(0);
    });

    it("should propagate clients per experience from RAG", () => {
        const widgets = [
            createMockWidget({
                type: "experience_header",
                text: "Chef de projet - Entreprise X",
                relevance_score: 0,
                sources: { rag_experience_id: "exp-1" },
            }),
            createMockWidget({
                text: "Pilotage de projet",
                relevance_score: 80,
                sources: { rag_experience_id: "exp-1" },
            }),
        ];

        const envelope = createMockEnvelope(widgets);
        const ragProfile = {
            profil: { prenom: "Jean", nom: "Dupont" },
            experiences: [
                {
                    id: "exp-1",
                    poste: "Chef de projet",
                    entreprise: "Entreprise X",
                    debut: "2020-01",
                    fin: "2021-01",
                    clients_references: ["BNP Paribas", "Société Générale"],
                    realisations: [{ description: "Pilotage de projet" }],
                },
            ],
        };

        const result = convertAndSort(envelope, { ragProfile });
        expect(result.experiences[0].clients).toEqual(["BNP Paribas", "Société Générale"]);
    });

    it("should build global clients_references from experience clients when references are missing", () => {
        const widgets = [
            createMockWidget({
                type: "experience_header",
                text: "PMO - Entreprise Y",
                relevance_score: 0,
                sources: { rag_experience_id: "exp-2" },
            }),
            createMockWidget({
                text: "PMO sur un portefeuille",
                relevance_score: 80,
                sources: { rag_experience_id: "exp-2" },
            }),
        ];

        const envelope = createMockEnvelope(widgets);
        const ragProfile = {
            profil: { prenom: "Jean", nom: "Dupont" },
            experiences: [
                {
                    id: "exp-2",
                    poste: "PMO",
                    entreprise: "Entreprise Y",
                    debut: "2021-01",
                    fin: "2022-01",
                    clients_references: ["Total", "Carrefour"],
                    realisations: [{ description: "PMO sur un portefeuille" }],
                },
            ],
            references: { clients: [] },
        };

        const result = convertAndSort(envelope, { ragProfile });
        expect(result.clients_references?.clients).toEqual(["Total", "Carrefour"]);
    });

    it("should inject contexte_enrichi into competences when skills widgets are missing", () => {
        const envelope = createMockEnvelope([
            createMockWidget({
                type: "experience_header",
                text: "Dev - Entreprise Z",
                relevance_score: 0,
                sources: { rag_experience_id: "exp-3" },
            }),
            createMockWidget({
                text: "Livraison",
                relevance_score: 60,
                sources: { rag_experience_id: "exp-3" },
            }),
        ]);

        const ragProfile = {
            profil: { prenom: "Jean", nom: "Dupont" },
            experiences: [
                {
                    id: "exp-3",
                    poste: "Dev",
                    entreprise: "Entreprise Z",
                    debut: "2022-01",
                    fin: null,
                    actuel: true,
                    realisations: [{ description: "Livraison" }],
                },
            ],
            contexte_enrichi: {
                competences_tacites: [{ nom: "Jira" }, { nom: "Agile" }],
                soft_skills_deduites: ["Leadership"],
            },
        };

        const result = convertAndSort(envelope, { ragProfile });
        expect(result.competences.techniques).toEqual(expect.arrayContaining(["Jira", "Agile"]));
        expect(result.competences.soft_skills).toEqual(expect.arrayContaining(["Leadership"]));
    });

    it("should handle empty widgets", () => {
        const envelope = createMockEnvelope([]);
        
        expect(() => {
            convertAndSort(envelope);
        }).toThrow(); // Le schéma Zod exige min(1) widget
    });

    it("should handle widgets with negative scores", () => {
        const widgets = [
            createMockWidget({ relevance_score: -10, text: "Negative score" }),
            createMockWidget({ relevance_score: 50, text: "Valid score" }),
        ];

        const envelope = createMockEnvelope(widgets);
        
        expect(() => convertAndSort(envelope)).toThrow();
    });

    it("should handle missing sections gracefully", () => {
        const widgets = [
            createMockWidget({
                type: "experience_bullet",
                section: "experiences",
                text: "Expérience seule",
                relevance_score: 80,
            }),
        ];

        const envelope = createMockEnvelope(widgets);
        const result = convertAndSort(envelope);

        // Doit retourner un CV valide même avec sections manquantes
        expect(result).toHaveProperty("profil");
        expect(result).toHaveProperty("experiences");
        expect(result).toHaveProperty("competences");
        expect(result).toHaveProperty("formations");
        expect(result).toHaveProperty("langues");
    });

    it("should use default options when not provided", () => {
        const widgets = Array.from({ length: 10 }, (_, i) =>
            createMockWidget({
                text: `Exp ${i}`,
                relevance_score: 80 - i,
                sources: { rag_experience_id: `exp-${i}` },
            })
        );

        const envelope = createMockEnvelope(widgets);
        const result = convertAndSort(envelope);

        expect(result.experiences.length).toBe(10);
    });
});
