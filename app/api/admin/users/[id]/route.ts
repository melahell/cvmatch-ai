import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient, requireSupabaseUser } from "@/lib/supabase";

const updateSchema = z.object({
    role: z.enum(["user", "admin"]).optional(),
    subscription_tier: z.enum(["free", "pro", "team"]).optional(),
    subscription_status: z.enum(["active", "inactive", "canceled", "past_due"]).optional(),
    subscription_expires_at: z.string().datetime().optional()
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
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

        const payload = updateSchema.parse(await req.json());
        const updateData: Record<string, any> = { ...payload };

        if (updateData.subscription_expires_at) {
            updateData.subscription_expires_at = new Date(updateData.subscription_expires_at).toISOString();
        }

        const { error } = await admin
            .from("users")
            .update(updateData)
            .eq("id", params.id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
