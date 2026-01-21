import { NextResponse } from "next/server";
import { createSupabaseUserClient, requireSupabaseUser } from "@/lib/supabase";
import { logger } from "@/lib/utils/logger";

export const runtime = "nodejs";

export async function POST(request: Request) {
    try {
        const auth = await requireSupabaseUser(request);
        if (auth.error || !auth.user || !auth.token) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { jobId, notes } = await request.json();

        if (!jobId) {
            return NextResponse.json({ error: "Job ID required" }, { status: 400 });
        }

        const supabase = createSupabaseUserClient(auth.token);

        // Update notes in job_analyses table
        const { error } = await supabase
            .from("job_analyses")
            .update({ notes: notes || null })
            .eq("id", jobId)
            .eq("user_id", auth.user.id);

        if (error) {
            logger.error("Error updating notes", { error: error.message, jobId });
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        logger.error("Notes API error", { error: error?.message });
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
