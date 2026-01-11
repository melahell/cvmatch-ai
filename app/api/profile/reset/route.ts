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

        // 1. Delete all documents from storage
        const { data: docs } = await supabase
            .from("uploaded_documents")
            .select("storage_path")
            .eq("user_id", userId);

        if (docs && docs.length > 0) {
            const paths = docs.map(d => d.storage_path).filter(Boolean);
            if (paths.length > 0) {
                await supabase.storage.from("documents").remove(paths);
            }
        }

        // 2. Delete all uploaded_documents records
        await supabase
            .from("uploaded_documents")
            .delete()
            .eq("user_id", userId);

        // 3. Delete RAG metadata
        await supabase
            .from("rag_metadata")
            .delete()
            .eq("user_id", userId);

        // 4. Reset user onboarding status
        await supabase
            .from("users")
            .update({ onboarding_completed: false, completeness_score: 0 })
            .eq("id", userId);

        return NextResponse.json({
            success: true,
            message: "Profile reset complete"
        });

    } catch (error: any) {
        logger.error("Reset profile error", { error: error?.message });
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
