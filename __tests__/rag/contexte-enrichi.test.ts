import { describe, it, expect, vi } from "vitest";
import { generateContexteEnrichi } from "../../lib/rag/contexte-enrichi";
import { generateWithGemini } from "../../lib/ai/gemini";

// Mock Gemini
vi.mock("../../lib/ai/gemini", () => ({
    generateWithGemini: vi.fn(),
    GEMINI_MODELS: {
        principal: "gemini-3-pro-preview",
    },
}));

describe("contexte-enrichi", () => {
    describe("generateContexteEnrichi", () => {
        it("génère le contexte enrichi avec structure valide", async () => {
            const mockResponse = JSON.stringify({
                responsabilites_implicites: [
                    {
                        description: "Reporting",
                        justification: "PMO role implies reporting",
                        confidence: 85,
                    },
                ],
                competences_tacites: [
                    {
                        nom: "Leadership",
                        type: "soft_skill",
                        justification: "Gestion équipe",
                        confidence: 80,
                    },
                ],
                environnement_travail: {
                    taille_equipe: "5-10 personnes",
                },
            });

            vi.mocked(generateWithGemini).mockResolvedValue(mockResponse);

            const ragData = {
                experiences: [
                    {
                        poste: "PMO",
                        entreprise: "Test",
                        realisations: [{ description: "Pilotage projets" }],
                    },
                ],
            };

            const result = await generateContexteEnrichi(ragData);

            expect(result.responsabilites_implicites).toBeDefined();
            expect(result.competences_tacites).toBeDefined();
            expect(result.responsabilites_implicites.length).toBeGreaterThan(0);
        });

        it("valide les confidence scores (60-100)", async () => {
            const mockResponse = JSON.stringify({
                responsabilites_implicites: [
                    {
                        description: "Test",
                        justification: "Test",
                        confidence: 85,
                    },
                ],
                competences_tacites: [],
            });

            vi.mocked(generateWithGemini).mockResolvedValue(mockResponse);

            const ragData = { experiences: [] };
            const result = await generateContexteEnrichi(ragData);

            result.responsabilites_implicites.forEach((r) => {
                expect(r.confidence).toBeGreaterThanOrEqual(60);
                expect(r.confidence).toBeLessThanOrEqual(100);
            });
        });

        it("retourne structure vide en cas d'erreur", async () => {
            vi.mocked(generateWithGemini).mockRejectedValue(new Error("API Error"));

            const ragData = { experiences: [] };
            const result = await generateContexteEnrichi(ragData);

            expect(result.responsabilites_implicites).toEqual([]);
            expect(result.competences_tacites).toEqual([]);
        });

        it("valide les types de compétences tacites", async () => {
            const mockResponse = JSON.stringify({
                responsabilites_implicites: [],
                competences_tacites: [
                    {
                        nom: "Agile",
                        type: "methodologie",
                        justification: "Gestion projets",
                        confidence: 75,
                    },
                    {
                        nom: "Communication",
                        type: "soft_skill",
                        justification: "Coordination",
                        confidence: 80,
                    },
                ],
            });

            vi.mocked(generateWithGemini).mockResolvedValue(mockResponse);

            const ragData = { experiences: [] };
            const result = await generateContexteEnrichi(ragData);

            result.competences_tacites.forEach((c) => {
                expect(["technique", "soft_skill", "methodologie"]).toContain(c.type);
            });
        });
    });
});
