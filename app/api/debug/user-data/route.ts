import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";

export const runtime = "edge";

// Debug endpoint to check what data exists for a user
export async function GET(req: Request) {
    const supabase = createSupabaseClient();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
        return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    try {
        // Check uploaded_documents
        const { data: uploads, error: uploadError } = await supabase
            .from("uploaded_documents")
            .select("id, filename, extraction_status, created_at")
            .eq("user_id", userId);

        // Check rag_metadata
        const { data: ragData, error: ragError } = await supabase
            .from("rag_metadata")
            .select("id, completeness_score, last_updated, created_at")
            .eq("user_id", userId);

        // Check users table
        const { data: userData, error: userError } = await supabase
            .from("users")
            .select("id, email, onboarding_completed")
            .eq("id", userId);

        return NextResponse.json({
            userId,
            uploads: {
                count: uploads?.length || 0,
                data: uploads,
                error: uploadError?.message
            },
            ragMetadata: {
                count: ragData?.length || 0,
                data: ragData,
                error: ragError?.message
            },
            user: {
                data: userData,
                error: userError?.message
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
