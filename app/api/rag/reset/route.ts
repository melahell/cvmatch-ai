import { createSupabaseClient, requireSupabaseUser } from "@/lib/supabase";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function DELETE(req: Request) {
    // ✅ SECURITY FIX: Authenticate user via Bearer token
    const { user, error: authError } = await requireSupabaseUser(req);
    if (authError || !user) {
        return NextResponse.json({ error: "Non autorisé. Reconnectez-vous." }, { status: 401 });
    }

    const userId = user.id; // Use authenticated user ID
    const supabase = createSupabaseClient();

    try {
        console.log(`[RAG RESET] User ${userId} requested RAG profile reset`);

        // 1. Supprimer les fichiers uploadés dans Storage
        try {
            const { data: files } = await supabase
                .storage
                .from("documents")
                .list(userId);

            if (files && files.length > 0) {
                const filePaths = files.map(f => `${userId}/${f.name}`);
                const { error: storageError } = await supabase
                    .storage
                    .from("documents")
                    .remove(filePaths);

                if (storageError) {
                    console.warn(`[RAG RESET] Storage deletion warning:`, storageError);
                }
            }
        } catch (storageError) {
            console.warn(`[RAG RESET] Storage deletion failed:`, storageError);
        }

        // 2. Supprimer les documents uploadés dans la table
        await supabase
            .from("uploaded_documents")
            .delete()
            .eq("user_id", userId);

        // 3. Supprimer les métadonnées RAG
        const { error: ragError } = await supabase
            .from("rag_metadata")
            .delete()
            .eq("user_id", userId);

        if (ragError) {
            console.error(`[RAG RESET] Error deleting RAG metadata:`, ragError);
            return NextResponse.json(
                { error: "Failed to reset RAG profile", details: ragError.message },
                { status: 500 }
            );
        }

        // Note: On garde les job_analyses, cv_generations et le compte utilisateur
        // L'utilisateur peut refaire un onboarding avec de nouveaux documents

        console.log(`[RAG RESET] ✅ User ${userId} RAG profile successfully reset`);

        return NextResponse.json({
            success: true,
            message: "RAG profile has been reset. You can now upload new documents."
        });

    } catch (error: any) {
        console.error("[RAG RESET] Error:", error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
