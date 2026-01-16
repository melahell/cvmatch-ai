import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";

export async function DELETE(req: Request) {
    const supabase = createSupabaseClient();

    try {
        const { documentId, userId } = await req.json();

        if (!documentId || !userId) {
            return NextResponse.json({ error: "Missing documentId or userId" }, { status: 400 });
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
                console.warn("Storage deletion failed:", storageError.message);
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
        console.error("Delete document error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
