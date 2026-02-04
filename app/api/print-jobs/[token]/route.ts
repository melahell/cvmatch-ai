import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient, requireSupabaseUser } from "@/lib/supabase";
import { logger } from "@/lib/utils/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const tokenSchema = z.string().min(10).max(200);

export async function GET(_req: Request, { params }: { params: { token: string } }) {
    try {
        const auth = await requireSupabaseUser(_req);
        if (auth.error || !auth.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const tokenParsed = tokenSchema.safeParse(params.token);
        if (!tokenParsed.success) {
            return NextResponse.json({ error: "Token invalide" }, { status: 400 });
        }

        const supabase = createSupabaseAdminClient();
        const nowIso = new Date().toISOString();

        const { data, error } = await supabase
            .from("print_jobs")
            .select("payload, expires_at")
            .eq("token", tokenParsed.data)
            .eq("user_id", auth.user.id)
            .gt("expires_at", nowIso)
            .maybeSingle();

        if (error) {
            logger.error("Print job fetch failed", { error: error.message });
            return NextResponse.json({ error: "Erreur de lecture" }, { status: 500 });
        }

        if (!data) {
            return NextResponse.json({ error: "Print job introuvable ou expiré" }, { status: 404 });
        }

        return NextResponse.json({ payload: data.payload, expiresAt: data.expires_at }, { status: 200 });
    } catch (error: any) {
        logger.error("Print job fetch error", { error: error?.message });
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { token: string } }) {
    try {
        const auth = await requireSupabaseUser(req);
        if (auth.error || !auth.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const tokenParsed = tokenSchema.safeParse(params.token);
        if (!tokenParsed.success) {
            return NextResponse.json({ error: "Token invalide" }, { status: 400 });
        }

        const supabase = createSupabaseAdminClient();
        const { error } = await supabase
            .from("print_jobs")
            .delete()
            .eq("token", tokenParsed.data)
            .eq("user_id", auth.user.id);

        if (error) {
            logger.error("Print job delete failed", { error: error.message });
            return NextResponse.json({ error: "Erreur suppression" }, { status: 500 });
        }

        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (error: any) {
        logger.error("Print job delete error", { error: error?.message });
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

