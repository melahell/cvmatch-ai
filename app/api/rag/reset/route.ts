import { createSupabaseClient } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { logger } from "@/lib/utils/logger";

export const runtime = "nodejs";

export async function DELETE(req: Request) {
    const supabase = createSupabaseClient();

    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json(
                { error: "userId required" },
                { status: 400 }
            );
        }

        logger.info("RAG RESET: User requested RAG profile reset", { userId });

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
                    logger.warn("RAG RESET: Storage deletion warning", { userId, error: storageError });
                }
            }
        } catch (storageError) {
            logger.warn("RAG RESET: Storage deletion failed", { userId, error: storageError });
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
            logger.error("RAG RESET: Error deleting RAG metadata", { userId, error: ragError.message });
            return NextResponse.json(
                { error: "Failed to reset RAG profile", details: ragError.message },
                { status: 500 }
            );
        }

        // Note: On garde les job_analyses, cv_generations et le compte utilisateur
        // L'utilisateur peut refaire un onboarding avec de nouveaux documents

        logger.info("RAG RESET: User RAG profile successfully reset", { userId });

        return NextResponse.json({
            success: true,
            message: "RAG profile has been reset. You can now upload new documents."
        });

    } catch (error: any) {
        logger.error("RAG RESET: Error", { error: error.message, stack: error.stack });
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
