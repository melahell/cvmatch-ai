import { NextResponse } from "next/server";
import { createSupabaseAdminClient, requireSupabaseUser } from "@/lib/supabase";

const getAllowList = () => {
    const raw = process.env.ADMIN_ALLOWLIST_EMAILS;
    if (!raw) return [] as string[];
    return raw
        .split(",")
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean);
};

const ensureUserRow = async (admin: ReturnType<typeof createSupabaseAdminClient>, userId: string, email: string) => {
    const { data: existing, error: selectError } = await admin
        .from("users")
        .select("id, email, role")
        .eq("id", userId)
        .maybeSingle();

    if (selectError) {
        throw new Error(selectError.message);
    }

    if (existing) return existing;

    const usernameSource = email.split("@")[0] || userId.slice(0, 8);
    const userIdSlug = usernameSource.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 100);

    const { data: upserted, error: upsertError } = await admin
        .from("users")
        .upsert({
            id: userId,
            email,
            user_id: userIdSlug,
            onboarding_completed: false,
        }, { onConflict: "id" })
        .select("id, email, role")
        .maybeSingle();

    if (!upsertError && upserted) {
        return upserted;
    }

    const { data: created, error: createdError } = await admin
        .from("users")
        .select("id, email, role")
        .eq("id", userId)
        .maybeSingle();

    if (createdError) {
        throw new Error(upsertError?.message || createdError.message);
    }

    if (created) return created;

    throw new Error(upsertError?.message || "Impossible de créer l'utilisateur");
};

export async function POST(req: Request) {
    try {
        const auth = await requireSupabaseUser(req);
        if (auth.error || !auth.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const allowList = getAllowList();
        const email = auth.user.email?.toLowerCase();
        if (!email || !allowList.includes(email)) {
            return NextResponse.json({ isAdmin: false });
        }

        let admin: ReturnType<typeof createSupabaseAdminClient>;
        try {
            admin = createSupabaseAdminClient();
        } catch {
            return NextResponse.json({ isAdmin: false });
        }
        const userRow = await ensureUserRow(admin, auth.user.id, email);

        if (userRow.role === "admin") {
            return NextResponse.json({ isAdmin: true });
        }

        const { error } = await admin
            .from("users")
            .update({ role: "admin" })
            .eq("id", auth.user.id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ isAdmin: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
