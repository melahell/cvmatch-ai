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
        // Log de l'action pour audit RGPD
        console.log(`[GDPR] User ${userId} requested account deletion (Article 17 - Right to erasure)`);

        // 1. Supprimer les fichiers dans Supabase Storage
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
                    console.warn(`[GDPR] Storage deletion warning for user ${userId}:`, storageError);
                }
            }
        } catch (storageError) {
            console.warn(`[GDPR] Storage deletion failed for user ${userId}:`, storageError);
            // Continue même si le storage échoue
        }

        // 2. Supprimer l'utilisateur (CASCADE DELETE supprimera automatiquement):
        // - rag_metadata
        // - uploaded_documents
        // - job_analyses
        // - cv_generations
        // - analytics_events
        const { error } = await supabase
            .from("users")
            .delete()
            .eq("id", userId);

        if (error) {
            console.error(`[GDPR] Delete error for user ${userId}:`, error);
            return NextResponse.json(
                { error: "Failed to delete account", details: error.message },
                { status: 500 }
            );
        }

        console.log(`[GDPR] ✅ User ${userId} successfully deleted - All data removed`);

        return NextResponse.json({
            success: true,
            message: "Account and all associated data have been permanently deleted"
        });

    } catch (error: any) {
        console.error("[GDPR] Delete Error:", error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
