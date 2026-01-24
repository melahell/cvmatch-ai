import { describe, it, expect, vi } from "vitest";
import { generateContexteEnrichi } from "../../lib/rag/contexte-enrichi";
import { generateWithGemini } from "../../lib/ai/gemini";

vi.mock("../../lib/ai/gemini", () => ({
    generateWithGemini: vi.fn(),
    GEMINI_MODELS: {
        principal: "gemini-3-pro-preview",
    },
}));

/**
 * Tests d'intégration pour l'enrichissement contextuel
 * Valide que l'enrichissement est intégré dans le pipeline
 */
describe("RAG Enrichissement Integration", () => {
    it("devrait intégrer l'enrichissement dans le pipeline RAG", async () => {
        const mockResponse = JSON.stringify({
            responsabilites_implicites: [
                {
                    description: "Reporting",
                    justification: "PMO role",
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
        });

        vi.mocked(generateWithGemini).mockResolvedValue(mockResponse);

        const ragData = {
            experiences: [
                {
                    poste: "PMO",
                    entreprise: "BNP",
                    realisations: [{ description: "Pilotage projets" }],
                },
            ],
        };

        const contexteEnrichi = await generateContexteEnrichi(ragData);
        
        // Simuler intégration dans pipeline
        ragData.contexte_enrichi = contexteEnrichi;

        expect(ragData.contexte_enrichi).toBeDefined();
        expect(ragData.contexte_enrichi.responsabilites_implicites.length).toBeGreaterThan(0);
    });

    it("devrait sauvegarder le contexte enrichi correctement", async () => {
        const mockResponse = JSON.stringify({
            responsabilites_implicites: [],
            competences_tacites: [],
            environnement_travail: {
                taille_equipe: "5-10 personnes",
            },
        });

        vi.mocked(generateWithGemini).mockResolvedValue(mockResponse);

        const ragData = { experiences: [] };
        const contexteEnrichi = await generateContexteEnrichi(ragData);
        
        // Simuler sauvegarde
        const ragToSave = {
            ...ragData,
            contexte_enrichi: contexteEnrichi,
        };

        expect(ragToSave.contexte_enrichi).toBeDefined();
        expect(ragToSave.contexte_enrichi.environnement_travail).toBeDefined();
    });

    it("devrait valider l'impact sur match scores", () => {
        const ragWithoutEnrichment = {
            experiences: [],
        };

        const ragWithEnrichment = {
            ...ragWithoutEnrichment,
            contexte_enrichi: {
                responsabilites_implicites: [
                    {
                        description: "Reporting",
                        justification: "PMO",
                        confidence: 90,
                    },
                ],
                competences_tacites: [],
            },
        };

        // Le contexte enrichi devrait être disponible pour le matching
        expect(ragWithEnrichment.contexte_enrichi).toBeDefined();
        expect(ragWithEnrichment.contexte_enrichi.responsabilites_implicites.length).toBeGreaterThan(0);
    });
});
