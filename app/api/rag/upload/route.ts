import { createSupabaseClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const files = formData.getAll("files") as File[];
        const userId = formData.get("userId") as string;

        if (!files.length || !userId) {
            return NextResponse.json({ error: "Missing files or userId" }, { status: 400 });
        }

        const supabase = createSupabaseClient();
        const uploads = [];
        let successCount = 0;

        for (const file of files) {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = new Uint8Array(arrayBuffer);
            const timestamp = Date.now();
            const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
            const path = `${userId}/${timestamp}_${safeName}`;

            const { data, error } = await supabase.storage
                .from("documents")
                .upload(path, buffer, {
                    contentType: file.type,
                    upsert: true,
                });

            if (error) {
                console.error("Storage upload error:", error);
                uploads.push({
                    filename: file.name,
                    error: error.message,
                    hint: error.message.includes("not found") ? "Bucket 'documents' does not exist in Supabase Storage" : undefined
                });
                continue; // Skip to next file
            }

            // Record in database
            const { error: dbError } = await supabase.from("uploaded_documents").insert({
                user_id: userId,
                filename: file.name,
                file_type: file.type.split("/").pop(),
                file_size: file.size,
                storage_path: path,
                extraction_status: "pending",
            });

            if (dbError) {
                console.error("DB Insert error:", dbError);
                uploads.push({ filename: file.name, error: "Database error: " + dbError.message });
            } else {
                successCount++;
                uploads.push({ filename: file.name, path, success: true });
            }
        }

        // If NO files were uploaded successfully, return error
        if (successCount === 0) {
            return NextResponse.json({
                success: false,
                error: "All uploads failed",
                uploads,
                hint: "Make sure the 'documents' bucket exists in Supabase Storage"
            }, { status: 500 });
        }

        return NextResponse.json({ success: true, successCount, uploads });
    } catch (error: any) {
        console.error("Server error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
