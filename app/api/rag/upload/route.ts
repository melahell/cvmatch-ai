
import { createClient } from "@supabase/supabase-js";
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

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const uploads = [];

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
                console.error("Upload error:", error);
                uploads.push({ filename: file.name, error: error.message });
            } else {
                // Record in database
                const { error: dbError } = await supabase.from("uploaded_documents").insert({
                    user_id: userId,
                    filename: file.name,
                    file_type: file.type.split("/").pop(), // "pdf", "docx"
                    file_size: file.size,
                    storage_path: path,
                    extraction_status: "pending",
                });

                if (dbError) {
                    console.error("DB Insert error:", dbError);
                    uploads.push({ filename: file.name, error: "Database error" });
                } else {
                    uploads.push({ filename: file.name, path, success: true });
                }
            }
        }

        return NextResponse.json({ success: true, uploads });
    } catch (error) {
        console.error("Server error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
