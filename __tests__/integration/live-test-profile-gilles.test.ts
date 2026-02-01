import { describe, it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";

const shouldRun = process.env.RUN_LIVE_SUPABASE_TESTS === "1";
const email = process.env.TEST_PROFILE_EMAIL || "gozlan.gilles@gmail.com";

describe.skipIf(!shouldRun)("live: profil de test présent (Supabase)", () => {
    it("doit trouver user, rag_metadata et au moins une analyse", async () => {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
        expect(!!supabaseUrl).toBe(true);
        expect(!!serviceKey).toBe(true);

        const supabase = createClient(supabaseUrl!, serviceKey!, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
                detectSessionInUrl: false,
            },
        });

        let userId: string | null = null;

        const { data: usersData, error: listError } = await supabase.auth.admin.listUsers({
            page: 1,
            perPage: 1000,
        });

        expect(listError).toBeNull();

        const match = (usersData?.users || []).find((u) => u.email?.toLowerCase() === email.toLowerCase());
        if (match?.id) {
            userId = match.id;
        } else {
            const { data: userRow, error: userError } = await supabase
                .from("users")
                .select("id,email")
                .eq("email", email)
                .maybeSingle();

            expect(userError).toBeNull();
            userId = userRow?.id ?? null;
        }

        expect(userId).toBeTruthy();

        const { data: ragRow, error: ragError } = await supabase
            .from("rag_metadata")
            .select("id,completeness_score,created_at")
            .eq("user_id", userId!)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        expect(ragError).toBeNull();
        expect(ragRow?.id).toBeTruthy();

        const { data: analysisRow, error: analysisError } = await supabase
            .from("job_analyses")
            .select("id")
            .eq("user_id", userId!)
            .limit(1)
            .maybeSingle();

        expect(analysisError).toBeNull();
        expect(analysisRow?.id).toBeTruthy();
    });
});
