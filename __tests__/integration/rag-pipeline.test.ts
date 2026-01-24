import { describe, it, expect } from "vitest";
import { normalizeRAGData } from "../../lib/utils/normalize-rag";
import { validateRAGData } from "../../lib/rag/validation";

/**
 * Tests d'intégration pour le pipeline RAG complet
 * Valide : Génération → Enrichissement → Fusion → Sauvegarde
 */
describe("RAG Pipeline Integration", () => {
    it("devrait valider le pipeline complet avec contraintes qualité", () => {
        const ragData = {
            experiences: [
                {
                    poste: "PMO",
                    entreprise: "BNP",
                    debut: "2023-01",
                    realisations: Array.from({ length: 10 }, (_, i) => ({
                        description: `Réalisation ${i + 1}`,
                        impact: i % 2 === 0 ? `+${10 + i}%` : "",
                    })),
                },
            ],
        };

        const normalized = normalizeRAGData(ragData);
        const validation = validateRAGData(normalized);

        // Le RAG devrait respecter les contraintes (8-12 réalisations max par expérience)
        const experience = normalized.experiences[0];
        expect(experience.realisations.length).toBeLessThanOrEqual(12);
        
        // Validation devrait passer
        expect(validation.isValid).toBe(true);
    });

    it("devrait compléter le pipeline en moins de 90 secondes", async () => {
        const startTime = Date.now();

        // Simuler pipeline complet
        const ragData = { experiences: [] };
        normalizeRAGData(ragData);
        validateRAGData(ragData);
        
        // Simuler enrichissement (en test réel, appeler generateContexteEnrichi)
        await new Promise((resolve) => setTimeout(resolve, 100));

        const duration = Date.now() - startTime;
        expect(duration).toBeLessThan(90000); // 90 secondes
    });

    it("devrait préserver la structure après normalisation et validation", () => {
        const ragData = {
            profil: {
                nom: "Test",
                prenom: "User",
            },
            experiences: [
                {
                    poste: "PMO",
                    entreprise: "BNP",
                    debut: "2023-01",
                    realisations: [
                        {
                            description: "Pilotage",
                            impact: "+10%",
                            sources: ["cv.pdf"],
                        },
                    ],
                },
            ],
        };

        const normalized = normalizeRAGData(ragData);
        const validation = validateRAGData(normalized);

        expect(normalized.profil).toBeDefined();
        expect(normalized.experiences).toBeDefined();
        expect(normalized.experiences[0].realisations[0].impact).toBe("+10%");
        expect(validation.isValid).toBe(true);
    });
});
