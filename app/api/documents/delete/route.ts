import { NextResponse } from "next/server";
import { createSupabaseUserClient, requireSupabaseUser } from "@/lib/supabase";
import { logger } from "@/lib/utils/logger";

export async function DELETE(req: Request) {
    try {
        const auth = await requireSupabaseUser(req);
        if (auth.error || !auth.user || !auth.token) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const supabase = createSupabaseUserClient(auth.token);
        const userId = auth.user.id;

        const { documentId } = await req.json();

        if (!documentId) {
            return NextResponse.json({ error: "Missing documentId" }, { status: 400 });
        }

        // 1. Get document info first
        const { data: doc, error: fetchError } = await supabase
            .from("uploaded_documents")
            .select("storage_path, filename")
            .eq("id", documentId)
            .eq("user_id", userId)
            .single();

        if (fetchError || !doc) {
            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }

        // 2. Delete from Storage (if path exists)
        if (doc.storage_path) {
            const { error: storageError } = await supabase.storage
                .from("documents")
                .remove([doc.storage_path]);

            if (storageError) {
                logger.warn("Storage deletion failed", { error: storageError.message, documentId });
                // Continue anyway - the file might not exist
            }
        }

        // 3. Delete from database
        const { error: dbError } = await supabase
            .from("uploaded_documents")
            .delete()
            .eq("id", documentId)
            .eq("user_id", userId);

        if (dbError) {
            return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
        }

        // 4. Count remaining documents
        const { count } = await supabase
            .from("uploaded_documents")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId);

        return NextResponse.json({
            success: true,
            deletedFilename: doc.filename,
            remainingDocuments: count || 0
        });

    } catch (error: any) {
        logger.error("Delete document error", { error: error?.message });
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
