import { NextResponse } from "next/server";
import { createSupabaseAdminClient, requireSupabaseUser } from "@/lib/supabase";

export async function GET(req: Request) {
    try {
        const auth = await requireSupabaseUser(req);
        if (auth.error || !auth.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const admin = createSupabaseAdminClient();
        const { data: userRow, error } = await admin
            .from("users")
            .select("role, subscription_tier, subscription_status")
            .eq("id", auth.user.id)
            .maybeSingle();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
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
