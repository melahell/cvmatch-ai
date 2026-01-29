import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateWidgetsFromRAGAndMatch } from "@/lib/cv/generate-widgets";
import { AIWidgetsEnvelope } from "@/lib/cv/ai-widgets";
import * as geminiModule from "@/lib/ai/gemini";
import * as promptsModule from "@/lib/ai/prompts";

// Mock des modules
vi.mock("@/lib/ai/gemini");
vi.mock("@/lib/ai/prompts");

describe("generateWidgetsFromRAGAndMatch", () => {
    const mockRAGProfile = {
        profil: {
            prenom: "Jean",
            nom: "Dupont",
            titre_principal: "Développeur Full Stack",
            localisation: "Paris",
        },
        experiences: [
            {
                poste: "Développeur Senior",
                entreprise: "Tech Corp",
                date_debut: "2020-01",
                date_fin: "2023-12",
                realisations: [
                    "Développement d'une application React avec 50k utilisateurs",
                    "Migration vers microservices réduisant la latence de 40%",
                ],
            },
        ],
        competences: {
            techniques: ["React", "Node.js", "TypeScript"],
            soft_skills: ["Leadership", "Communication"],
        },
    };

    const mockMatchAnalysis = {
        job_title: "Développeur Full Stack Senior",
        company: "StartupXYZ",
        match_score: 85,
        strengths: ["React", "TypeScript"],
        missing_keywords: ["GraphQL"],
    };

    const mockJobDescription = "Nous recherchons un développeur Full Stack expérimenté avec React et Node.js.";

    const mockValidWidgetsEnvelope: AIWidgetsEnvelope = {
        profil_summary: {
            prenom: "Jean",
            nom: "Dupont",
            titre_principal: "Développeur Full Stack",
            localisation: "Paris",
        },
        job_context: {
            company: "StartupXYZ",
            job_title: "Développeur Full Stack Senior",
            match_score: 85,
        },
        widgets: [
            {
                id: "widget-1",
                type: "summary_block",
                section: "summary",
                text: "Développeur Full Stack avec 5 ans d'expérience en React et Node.js",
                relevance_score: 90,
                sources: {
                    rag_path: "profil.titre_principal",
                },
            },
            {
                id: "widget-2",
                type: "experience_bullet",
                section: "experiences",
                text: "Développement d'une application React avec 50k utilisateurs",
                relevance_score: 85,
                sources: {
                    rag_experience_id: "exp-1",
                    rag_realisation_id: "real-1",
                },
            },
        ],
        meta: {
            model: "gemini-3-pro-preview",
            created_at: new Date().toISOString(),
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should generate valid widgets envelope from RAG", async () => {
        const mockResponse = JSON.stringify(mockValidWidgetsEnvelope);

        vi.spyOn(promptsModule, "getAIWidgetsGenerationPrompt").mockReturnValue("Mock prompt");
        vi.spyOn(geminiModule, "generateWithGemini").mockResolvedValue(mockResponse);

        const result = await generateWidgetsFromRAGAndMatch({
            ragProfile: mockRAGProfile,
            matchAnalysis: mockMatchAnalysis,
            jobDescription: mockJobDescription,
        });

        expect(result).not.toBeNull();
        expect(result?.widgets).toHaveLength(2);
        expect(result?.widgets[0].relevance_score).toBe(90);
        expect(result?.profil_summary?.prenom).toBe("Jean");
        expect(geminiModule.generateWithGemini).toHaveBeenCalledWith({
            prompt: expect.stringContaining("Mock prompt"),
            model: "gemini-3-pro-preview",
        });
    });

    it("should parse JSON with markdown fences", async () => {
        const mockResponseWithFences = `\`\`\`json\n${JSON.stringify(mockValidWidgetsEnvelope)}\n\`\`\``;

        vi.spyOn(promptsModule, "getAIWidgetsGenerationPrompt").mockReturnValue("Mock prompt");
        vi.spyOn(geminiModule, "generateWithGemini").mockResolvedValue(mockResponseWithFences);

        const result = await generateWidgetsFromRAGAndMatch({
            ragProfile: mockRAGProfile,
            matchAnalysis: mockMatchAnalysis,
            jobDescription: mockJobDescription,
        });

        expect(result).not.toBeNull();
        expect(result?.widgets).toHaveLength(2);
    });

    it("should handle invalid JSON response", async () => {
        const mockInvalidResponse = "This is not valid JSON";

        vi.spyOn(promptsModule, "getAIWidgetsGenerationPrompt").mockReturnValue("Mock prompt");
        vi.spyOn(geminiModule, "generateWithGemini").mockResolvedValue(mockInvalidResponse);

        const result = await generateWidgetsFromRAGAndMatch({
            ragProfile: mockRAGProfile,
            matchAnalysis: mockMatchAnalysis,
            jobDescription: mockJobDescription,
        });

        expect(result).toBeNull();
    });

    it("should handle invalid widgets envelope schema", async () => {
        const mockInvalidEnvelope = {
            widgets: [], // widgets vide (violation min(1))
        };

        vi.spyOn(promptsModule, "getAIWidgetsGenerationPrompt").mockReturnValue("Mock prompt");
        vi.spyOn(geminiModule, "generateWithGemini").mockResolvedValue(JSON.stringify(mockInvalidEnvelope));

        const result = await generateWidgetsFromRAGAndMatch({
            ragProfile: mockRAGProfile,
            matchAnalysis: mockMatchAnalysis,
            jobDescription: mockJobDescription,
        });

        expect(result).toBeNull();
    });

    it("should handle Gemini API error", async () => {
        vi.spyOn(promptsModule, "getAIWidgetsGenerationPrompt").mockReturnValue("Mock prompt");
        vi.spyOn(geminiModule, "generateWithGemini").mockRejectedValue(new Error("API Error"));

        const result = await generateWidgetsFromRAGAndMatch({
            ragProfile: mockRAGProfile,
            matchAnalysis: mockMatchAnalysis,
            jobDescription: mockJobDescription,
        });

        expect(result).toBeNull();
    });

    it("should validate output against AIWidgetsEnvelope schema", async () => {
        const mockResponse = JSON.stringify(mockValidWidgetsEnvelope);

        vi.spyOn(promptsModule, "getAIWidgetsGenerationPrompt").mockReturnValue("Mock prompt");
        vi.spyOn(geminiModule, "generateWithGemini").mockResolvedValue(mockResponse);

        const result = await generateWidgetsFromRAGAndMatch({
            ragProfile: mockRAGProfile,
            matchAnalysis: mockMatchAnalysis,
            jobDescription: mockJobDescription,
        });

        expect(result).not.toBeNull();
        // Vérifier structure complète
        expect(result).toHaveProperty("widgets");
        expect(result?.widgets).toBeInstanceOf(Array);
        expect(result?.widgets.length).toBeGreaterThan(0);
        expect(result?.widgets[0]).toHaveProperty("id");
        expect(result?.widgets[0]).toHaveProperty("type");
        expect(result?.widgets[0]).toHaveProperty("section");
        expect(result?.widgets[0]).toHaveProperty("text");
        expect(result?.widgets[0]).toHaveProperty("relevance_score");
    });
});
