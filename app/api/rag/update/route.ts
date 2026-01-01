import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";

export async function POST(req: Request) {
    const supabase = createSupabaseClient();

    try {
        const { userId, ragData, customNotes } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: "Missing userId" }, { status: 400 });
        }

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
        console.error("Update RAG error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
