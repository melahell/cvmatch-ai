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
        .select("id, email, role, subscription_tier, subscription_status")
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
        .select("id, email, role, subscription_tier, subscription_status")
        .maybeSingle();

    if (!upsertError && upserted) {
        return upserted;
    }

    const { data: created, error: createdError } = await admin
        .from("users")
        .select("id, email, role, subscription_tier, subscription_status")
        .eq("id", userId)
        .maybeSingle();

    if (createdError) {
        throw new Error(upsertError?.message || createdError.message);
    }

    if (created) return created;

    throw new Error(upsertError?.message || "Impossible de créer l'utilisateur");
};

export async function GET(req: Request) {
    try {
        const auth = await requireSupabaseUser(req);
        if (auth.error || !auth.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        let admin: ReturnType<typeof createSupabaseAdminClient>;
        try {
            admin = createSupabaseAdminClient();
        } catch {
            return NextResponse.json({
                isAdmin: false,
                role: "user",
                subscriptionTier: "free",
                subscriptionStatus: "inactive"
            });
        }
        const email = auth.user.email?.toLowerCase();
        const allowList = getAllowList();

        let userRow: {
            id?: string;
            email?: string;
            role?: string;
            subscription_tier?: string;
            subscription_status?: string;
        } | null = email
            ? await ensureUserRow(admin, auth.user.id, email)
            : null;

        if (!userRow) {
            const { data, error } = await admin
                .from("users")
                .select("role, subscription_tier, subscription_status")
                .eq("id", auth.user.id)
                .maybeSingle();

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            userRow = data;
        }

        if (email && allowList.includes(email) && userRow?.role !== "admin") {
            const { error } = await admin
                .from("users")
                .update({ role: "admin" })
                .eq("id", auth.user.id);

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            userRow = {
                ...userRow,
                role: "admin",
            };
        }

        return NextResponse.json({
            isAdmin: userRow?.role === "admin",
            role: userRow?.role || "user",
            subscriptionTier: userRow?.subscription_tier || "free",
            subscriptionStatus: userRow?.subscription_status || "inactive"
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
