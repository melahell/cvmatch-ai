import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/cv/generate-v2/route";
import * as supabaseModule from "@/lib/supabase";
import * as generateWidgetsModule from "@/lib/cv/generate-widgets";
import * as aiAdapterModule from "@/lib/cv/ai-adapter";
import * as validatorModule from "@/lib/cv/validator";
import * as rateLimitModule from "@/lib/utils/rate-limit";

// Mock des modules
vi.mock("@/lib/supabase");
vi.mock("@/lib/cv/generate-widgets");
vi.mock("@/lib/cv/ai-adapter");
vi.mock("@/lib/cv/validator");
vi.mock("@/lib/utils/rate-limit");

describe("POST /api/cv/generate-v2", () => {
    const mockUserId = "user-123";
    const mockAnalysisId = "analysis-456";
    const mockRequest = new Request("http://localhost/api/cv/generate-v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            analysisId: mockAnalysisId,
            template: "modern",
            includePhoto: true,
        }),
    });

    const mockAuth = {
        user: { id: mockUserId },
        token: "mock-token",
        error: null,
    };

    const mockAnalysisData = {
        id: mockAnalysisId,
        user_id: mockUserId,
        job_title: "Développeur Full Stack",
        company_name: "Tech Corp",
        match_score: 85,
        job_description: "Nous recherchons un développeur Full Stack expérimenté.",
        analysis_result: {
            match_report: {
                strengths: ["React", "TypeScript"],
                missing_keywords: ["GraphQL"],
            },
        },
    };

    const mockRAGMetadata = {
        user_id: mockUserId,
        completeness_details: {
            profil: {
                prenom: "Jean",
                nom: "Dupont",
                titre_principal: "Développeur",
            },
            experiences: [],
            competences: {},
        },
    };

    const mockWidgetsEnvelope = {
        widgets: [
            {
                id: "widget-1",
                type: "experience_bullet",
                section: "experiences",
                text: "Développement d'une app React",
                relevance_score: 85,
            },
        ],
        meta: { model: "gemini-3-pro-preview" },
    };

    const mockCVData = {
        profil: {
            prenom: "Jean",
            nom: "Dupont",
            titre_principal: "Développeur",
        },
        experiences: [],
        competences: {},
    };

    const mockFittedCV = {
        cvData: mockCVData,
        compressionLevelApplied: 0,
        dense: false,
        unitStats: { total: 100, remaining: 50, percentage: 50 },
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should generate CV successfully end-to-end", async () => {
        // Mock authentification
        vi.spyOn(supabaseModule, "requireSupabaseUser").mockResolvedValue(mockAuth as any);
        vi.spyOn(supabaseModule, "createSupabaseAdminClient").mockReturnValue({
            from: vi.fn(() => ({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        single: vi.fn().mockResolvedValue({ data: { subscription_tier: "pro", subscription_status: "active" } }),
                    })),
                })),
            })),
        }) as any);

        // Mock rate limiting
        vi.spyOn(rateLimitModule, "checkRateLimit").mockReturnValue({ success: true });
        vi.spyOn(rateLimitModule, "getRateLimitConfig").mockReturnValue({ maxRequests: 10, windowMs: 60000 });

        // Mock Supabase queries
        const mockSupabaseClient = {
            from: vi.fn((table: string) => {
                if (table === "job_analyses") {
                    return {
                        select: vi.fn(() => ({
                            eq: vi.fn(() => ({
                                single: vi.fn().mockResolvedValue({ data: mockAnalysisData, error: null }),
                            })),
                        })),
                    };
                }
                if (table === "rag_metadata") {
                    return {
                        select: vi.fn(() => ({
                            eq: vi.fn(() => ({
                                single: vi.fn().mockResolvedValue({ data: mockRAGMetadata, error: null }),
                            })),
                        })),
                    };
                }
                if (table === "cv_generations") {
                    return {
                        insert: vi.fn(() => ({
                            select: vi.fn(() => ({
                                single: vi.fn().mockResolvedValue({ data: { id: "cv-789" }, error: null }),
                            })),
                        })),
                    };
                }
                return {
                    select: vi.fn(() => ({
                        eq: vi.fn(() => ({
                            single: vi.fn().mockResolvedValue({ data: null, error: null }),
                        })),
                    })),
                };
            }),
        };

        vi.spyOn(supabaseModule, "createSupabaseAdminClient").mockReturnValue(mockSupabaseClient as any);

        // Mock génération widgets
        vi.spyOn(generateWidgetsModule, "generateWidgetsFromRAGAndMatch").mockResolvedValue(mockWidgetsEnvelope as any);

        // Mock conversion
        vi.spyOn(aiAdapterModule, "convertAndSort").mockReturnValue(mockCVData as any);

        // Mock template fitting
        vi.spyOn(validatorModule, "fitCVToTemplate").mockReturnValue(mockFittedCV as any);

        const response = await POST(mockRequest);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.cvId).toBe("cv-789");
        expect(data.generatorVersion).toBe("v2");
        expect(data.widgetsUsed).toBe(1);
    });

    it("should return 401 if not authenticated", async () => {
        vi.spyOn(supabaseModule, "requireSupabaseUser").mockResolvedValue({
            user: null,
            token: null,
            error: "Non autorisé",
        } as any);

        const response = await POST(mockRequest);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe("Non autorisé");
    });

    it("should return 429 if rate limit exceeded", async () => {
        vi.spyOn(supabaseModule, "requireSupabaseUser").mockResolvedValue(mockAuth as any);
        vi.spyOn(supabaseModule, "createSupabaseAdminClient").mockReturnValue({
            from: vi.fn(() => ({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        single: vi.fn().mockResolvedValue({ data: { subscription_tier: "free" } }),
                    })),
                })),
            })),
        }) as any);

        vi.spyOn(rateLimitModule, "checkRateLimit").mockReturnValue({
            success: false,
            remaining: 0,
            resetAt: new Date().toISOString(),
        });
        vi.spyOn(rateLimitModule, "getRateLimitConfig").mockReturnValue({ maxRequests: 5, windowMs: 60000 });
        vi.spyOn(rateLimitModule, "createRateLimitError").mockReturnValue({
            error: "Rate limit exceeded",
            errorCode: "RATE_LIMIT_EXCEEDED",
            retryAfter: 60,
        } as any);

        const response = await POST(mockRequest);
        const data = await response.json();

        expect(response.status).toBe(429);
        expect(data.errorCode).toBe("RATE_LIMIT_EXCEEDED");
    });

    it("should return 404 if analysis not found", async () => {
        vi.spyOn(supabaseModule, "requireSupabaseUser").mockResolvedValue(mockAuth as any);
        const mockSupabaseClient = {
            from: vi.fn((table: string) => {
                if (table === "job_analyses") {
                    return {
                        select: vi.fn(() => ({
                            eq: vi.fn(() => ({
                                single: vi.fn().mockResolvedValue({ data: null, error: { message: "Not found" } }),
                            })),
                        })),
                    };
                }
                if (table === "users") {
                    return {
                        select: vi.fn(() => ({
                            eq: vi.fn(() => ({
                                single: vi.fn().mockResolvedValue({ data: { subscription_tier: "pro" } }),
                            })),
                        })),
                    };
                }
                return { select: vi.fn() };
            }),
        };

        vi.spyOn(supabaseModule, "createSupabaseAdminClient").mockReturnValue(mockSupabaseClient as any);
        vi.spyOn(rateLimitModule, "checkRateLimit").mockReturnValue({ success: true });
        vi.spyOn(rateLimitModule, "getRateLimitConfig").mockReturnValue({ maxRequests: 10, windowMs: 60000 });

        const response = await POST(mockRequest);
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.error).toBe("Analyse introuvable");
    });

    it("should return 404 if RAG profile not found", async () => {
        vi.spyOn(supabaseModule, "requireSupabaseUser").mockResolvedValue(mockAuth as any);
        const mockSupabaseClient = {
            from: vi.fn((table: string) => {
                if (table === "job_analyses") {
                    return {
                        select: vi.fn(() => ({
                            eq: vi.fn(() => ({
                                single: vi.fn().mockResolvedValue({ data: mockAnalysisData, error: null }),
                            })),
                        })),
                    };
                }
                if (table === "rag_metadata") {
                    return {
                        select: vi.fn(() => ({
                            eq: vi.fn(() => ({
                                single: vi.fn().mockResolvedValue({ data: null, error: { message: "Not found" } }),
                            })),
                        })),
                    };
                }
                if (table === "users") {
                    return {
                        select: vi.fn(() => ({
                            eq: vi.fn(() => ({
                                single: vi.fn().mockResolvedValue({ data: { subscription_tier: "pro" } }),
                            })),
                        })),
                    };
                }
                return { select: vi.fn() };
            }),
        };

        vi.spyOn(supabaseModule, "createSupabaseAdminClient").mockReturnValue(mockSupabaseClient as any);
        vi.spyOn(rateLimitModule, "checkRateLimit").mockReturnValue({ success: true });
        vi.spyOn(rateLimitModule, "getRateLimitConfig").mockReturnValue({ maxRequests: 10, windowMs: 60000 });

        const response = await POST(mockRequest);
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.error).toBe("Profil RAG introuvable");
    });

    it("should include V2 metadata in cv_metadata", async () => {
        vi.spyOn(supabaseModule, "requireSupabaseUser").mockResolvedValue(mockAuth as any);
        const mockSupabaseClient = {
            from: vi.fn((table: string) => {
                if (table === "job_analyses") {
                    return {
                        select: vi.fn(() => ({
                            eq: vi.fn(() => ({
                                single: vi.fn().mockResolvedValue({ data: mockAnalysisData, error: null }),
                            })),
                        })),
                    };
                }
                if (table === "rag_metadata") {
                    return {
                        select: vi.fn(() => ({
                            eq: vi.fn(() => ({
                                single: vi.fn().mockResolvedValue({ data: mockRAGMetadata, error: null }),
                            })),
                        })),
                    };
                }
                if (table === "cv_generations") {
                    return {
                        insert: vi.fn(() => ({
                            select: vi.fn(() => ({
                                single: vi.fn().mockResolvedValue({ data: { id: "cv-789" }, error: null }),
                            })),
                        })),
                    };
                }
                if (table === "users") {
                    return {
                        select: vi.fn(() => ({
                            eq: vi.fn(() => ({
                                single: vi.fn().mockResolvedValue({ data: { subscription_tier: "pro" } }),
                            })),
                        })),
                    };
                }
                return { select: vi.fn() };
            }),
        };

        vi.spyOn(supabaseModule, "createSupabaseAdminClient").mockReturnValue(mockSupabaseClient as any);
        vi.spyOn(rateLimitModule, "checkRateLimit").mockReturnValue({ success: true });
        vi.spyOn(rateLimitModule, "getRateLimitConfig").mockReturnValue({ maxRequests: 10, windowMs: 60000 });
        vi.spyOn(generateWidgetsModule, "generateWidgetsFromRAGAndMatch").mockResolvedValue(mockWidgetsEnvelope as any);
        vi.spyOn(aiAdapterModule, "convertAndSort").mockReturnValue(mockCVData as any);
        vi.spyOn(validatorModule, "fitCVToTemplate").mockReturnValue(mockFittedCV as any);

        const response = await POST(mockRequest);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.cvData.cv_metadata).toBeDefined();
        expect(data.cvData.cv_metadata.generator_type).toBe("v2_widgets");
        expect(data.cvData.cv_metadata.widgets_total).toBe(1);
        expect(data.cvData.cv_metadata.widgets_filtered).toBeDefined();
    });
});
