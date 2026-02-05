import { NextResponse } from "next/server";
import { requireSupabaseUser } from "@/lib/supabase";
import { checkPrinterConnectivity } from "@/lib/printer";
import { createRequestId } from "@/lib/request-id";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    const requestId = createRequestId();

    const auth = await requireSupabaseUser(req);
    if (auth.error || !auth.user) {
        return NextResponse.json({ ok: false, error: "Non autorisé", requestId }, { status: 401 });
    }

    try {
        const connectivity = await checkPrinterConnectivity();
        return NextResponse.json({ ok: true, ...connectivity, requestId }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { ok: false, error: "Printer indisponible", details: error?.message, requestId },
            { status: 503 }
        );
    }
}
