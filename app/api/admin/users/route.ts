import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient, requireSupabaseUser } from "@/lib/supabase";

const createUserSchema = z.object({
    email: z.string().email(),
    fullName: z.string().min(2).max(100),
    role: z.enum(["user", "admin"]).optional()
});

export async function GET(req: Request) {
    try {
        const auth = await requireSupabaseUser(req);
        if (auth.error || !auth.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const admin = createSupabaseAdminClient();
        const { data: adminRow } = await admin
            .from("users")
            .select("role")
            .eq("id", auth.user.id)
            .maybeSingle();

        if (adminRow?.role !== "admin") {
            return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
        }

        const { data, error } = await admin
            .from("users")
            .select("id, email, user_id, role, subscription_tier, subscription_status, created_at")
            .order("created_at", { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ users: data || [] });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const auth = await requireSupabaseUser(req);
        if (auth.error || !auth.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const admin = createSupabaseAdminClient();
        const { data: adminRow } = await admin
            .from("users")
            .select("role")
            .eq("id", auth.user.id)
            .maybeSingle();

        if (adminRow?.role !== "admin") {
            return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
        }

        const payload = createUserSchema.parse(await req.json());
        const email = payload.email.toLowerCase();
        const fullName = payload.fullName.trim();
        const role = payload.role || "user";

        const { data: created, error: createError } = await admin.auth.admin.createUser({
            email,
            email_confirm: true,
            user_metadata: { full_name: fullName }
        });

        if (createError || !created?.user) {
            return NextResponse.json({ error: createError?.message || "Erreur création" }, { status: 500 });
        }

        const usernameSource = email.split("@")[0] || created.user.id.slice(0, 8);
        const userIdSlug = usernameSource.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 100);

        const { error: insertError } = await admin
            .from("users")
            .insert({
                id: created.user.id,
                email,
                user_id: userIdSlug,
                onboarding_completed: false,
                role
            });

        if (insertError) {
            return NextResponse.json({ error: insertError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, userId: created.user.id });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
