import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase", () => {
    return {
        requireSupabaseUser: vi.fn(),
        createSupabaseUserClient: vi.fn(),
    };
});

vi.mock("puppeteer-core", () => {
    return {
        default: {
            launch: vi.fn(),
        },
    };
});

vi.mock("@sparticuz/chromium", () => {
    return {
        default: {
            args: ["--no-sandbox"],
            executablePath: vi.fn(async () => "/tmp/chromium"),
        },
    };
});

describe("/api/cv/[id]/pdf", () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
        process.env.NEXT_PUBLIC_APP_URL = "https://example.local";
        process.env.NODE_ENV = "test";
    });

    it("retourne 400 si format invalide", async () => {
        const supabaseMod = await import("@/lib/supabase");
        (supabaseMod.requireSupabaseUser as any).mockResolvedValue({
            user: { id: "u1" },
            token: "t",
            error: null,
        });

        const { GET } = await import("@/app/api/cv/[id]/pdf/route");
        const req = new Request("https://example.local/api/cv/123/pdf?format=BAD") as any;
        const res = await GET(req, { params: { id: "123" } });
        expect(res.status).toBe(400);
    });

    it("retourne 401 si non autorisé", async () => {
        const supabaseMod = await import("@/lib/supabase");
        (supabaseMod.requireSupabaseUser as any).mockResolvedValue({
            user: null,
            token: null,
            error: "no",
        });

        const { GET } = await import("@/app/api/cv/[id]/pdf/route");
        const req = new Request("https://example.local/api/cv/123/pdf?format=A4") as any;
        const res = await GET(req, { params: { id: "123" } });
        expect(res.status).toBe(401);
    });

    it("génère un PDF et applique des headers privés", async () => {
        const supabaseMod = await import("@/lib/supabase");
        (supabaseMod.requireSupabaseUser as any).mockResolvedValue({
            user: { id: "u1" },
            token: "t",
            error: null,
        });

        const mockSingle = vi.fn().mockResolvedValue({
            data: {
                id: "123",
                template_name: "modern",
                cv_data: { profil: { prenom: "Ada", nom: "Lovelace" } },
            },
            error: null,
        });
        const mockEq = vi.fn().mockReturnThis();
        const mockSelect = vi.fn().mockReturnThis();
        const mockFrom = vi.fn().mockReturnValue({
            select: mockSelect,
            eq: mockEq,
            single: mockSingle,
        });
        (supabaseMod.createSupabaseUserClient as any).mockReturnValue({
            from: mockFrom,
        });

        const page = {
            setViewport: vi.fn(),
            setExtraHTTPHeaders: vi.fn(),
            goto: vi.fn(),
            waitForFunction: vi.fn(),
            evaluate: vi.fn(),
            emulateMediaType: vi.fn(),
            pdf: vi.fn(async () => Buffer.from("%PDF-1.4 mock")),
        };
        const browser = {
            newPage: vi.fn(async () => page),
            close: vi.fn(),
        };

        const puppeteerMod = await import("puppeteer-core");
        (puppeteerMod.default.launch as any).mockResolvedValue(browser);

        const { GET } = await import("@/app/api/cv/[id]/pdf/route");
        const req = new Request("https://example.local/api/cv/123/pdf?format=A4") as any;
        const res = await GET(req, { params: { id: "123" } });

        expect(res.status).toBe(200);
        expect(res.headers.get("content-type")).toContain("application/pdf");
        expect(res.headers.get("cache-control")).toContain("private");
        expect(res.headers.get("cache-control")).toContain("no-store");
        expect(res.headers.get("vary")).toContain("Authorization");
        expect(res.headers.get("x-content-type-options")).toBe("nosniff");
        expect(res.headers.get("content-disposition")).toContain("attachment");
        expect(page.emulateMediaType).toHaveBeenCalledWith("print");
    });
});

