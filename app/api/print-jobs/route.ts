import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { createSupabaseAdminClient, requireSupabaseUser } from "@/lib/supabase";
import { logger } from "@/lib/utils/logger";
import { createRequestId } from "@/lib/request-id";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const payloadSchema = z.object({
    data: z.any(),
    templateId: z.string().min(1),
    includePhoto: z.boolean().optional(),
    colorwayId: z.string().optional(),
    fontId: z.string().optional(),
    density: z.enum(["compact", "normal", "airy"]).optional(),
    format: z.enum(["A4", "Letter"]).optional(),
    customCSS: z.string().optional(),
});

const createPrintJobSchema = z.object({
    payload: payloadSchema,
});

function createToken(): string {
    return crypto.randomBytes(18).toString("base64url");
}

export async function POST(req: Request) {
    const requestId = createRequestId();
    try {
        const auth = await requireSupabaseUser(req);
        if (auth.error || !auth.user) {
            return NextResponse.json({ error: "Non autorisé", requestId }, { status: 401 });
        }

        const parsed = createPrintJobSchema.safeParse(await req.json());
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Payload invalide", details: parsed.error.flatten(), requestId },
                { status: 400 }
            );
        }

        const supabase = createSupabaseAdminClient();
        const token = createToken();
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

        const { error } = await supabase.from("print_jobs").insert({
            user_id: auth.user.id,
            token,
            payload: parsed.data.payload,
            expires_at: expiresAt,
        });

        if (error) {
            logger.error("Print job insert failed", { error: error.message, requestId });
            return NextResponse.json(
                { error: "Impossible de créer le print job", details: error.message, requestId },
                { status: 500 }
            );
        }

        return NextResponse.json({ token, expiresAt, requestId }, { status: 201 });
    } catch (error: any) {
        logger.error("Print job create error", { error: error?.message, requestId });
        return NextResponse.json({ error: "Erreur serveur", details: error?.message, requestId }, { status: 500 });
    }
}
