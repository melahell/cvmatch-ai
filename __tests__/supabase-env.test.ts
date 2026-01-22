import { describe, it, expect } from "vitest";

describe("Supabase env fallback", () => {
    it("ne doit pas jeter si SUPABASE_URL + SUPABASE_ANON_KEY sont définies", async () => {
        const prev = { ...process.env };
        try {
            delete process.env.NEXT_PUBLIC_SUPABASE_URL;
            delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
            process.env.SUPABASE_URL = "https://example.supabase.co";
            process.env.SUPABASE_ANON_KEY = "anon";

            const mod = await import("../lib/supabase");
            const req = new Request("https://example.local/api/admin/me", {
                headers: { Authorization: "Bearer token" }
            });
            const result = await mod.requireSupabaseUser(req);
            expect(result).toHaveProperty("error");
        } finally {
            process.env = prev;
        }
    });
});

