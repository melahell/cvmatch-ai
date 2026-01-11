
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
    void req;
    return NextResponse.json(
        { error: "Endpoint obsolète. Utilisez Supabase Auth." },
        { status: 410 }
    );
}
