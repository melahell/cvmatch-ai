import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(request: Request) {
    try {
        const { jobId, notes } = await request.json();

        if (!jobId) {
            return NextResponse.json({ error: "Job ID required" }, { status: 400 });
        }

        const supabase = createSupabaseClient();

        // Update notes in job_analyses table
        const { error } = await supabase
            .from("job_analyses")
            .update({ notes: notes || null })
            .eq("id", jobId);

        if (error) {
            console.error("Error updating notes:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Notes API error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
