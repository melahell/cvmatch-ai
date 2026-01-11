import { NextResponse } from "next/server";
import { createSupabaseUserClient, requireSupabaseUser } from "@/lib/supabase";
import { logger } from "@/lib/utils/logger";

export async function POST(req: Request) {
    try {
        const auth = await requireSupabaseUser(req);
        if (auth.error || !auth.user || !auth.token) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const supabase = createSupabaseUserClient(auth.token);
        const userId = auth.user.id;

        const { ragData, customNotes } = await req.json();

        // Update RAG metadata with edited data
        const { error } = await supabase
            .from("rag_metadata")
            .update({
                completeness_details: ragData,
                custom_notes: customNotes,
                last_updated: new Date().toISOString()
            })
            .eq("user_id", userId);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        logger.error("Update RAG error", { error: error?.message });
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
