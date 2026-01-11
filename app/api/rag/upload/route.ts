import { createSupabaseUserClient, requireSupabaseUser } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { logger } from "@/lib/utils/logger";

export const runtime = "edge";

export async function POST(req: Request) {
    try {
        const auth = await requireSupabaseUser(req);
        if (auth.error || !auth.user || !auth.token) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const formData = await req.formData();
        const files = formData.getAll("files") as File[];
        const userId = auth.user.id;

        if (!files.length || !userId) {
            return NextResponse.json({ error: "Missing files or userId" }, { status: 400 });
        }

        const supabase = createSupabaseUserClient(auth.token);

        const { data: existingUser } = await supabase
            .from("users")
            .select("id")
            .eq("id", userId)
            .maybeSingle();

        if (!existingUser) {
            const email = auth.user.email ?? `user-${userId.slice(0, 8)}@temp.com`;
            const usernameSource = email.split("@")[0] || userId.slice(0, 8);
            const userIdSlug = usernameSource.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 100);

            const { error: createUserError } = await supabase
                .from("users")
                .insert({
                    id: userId,
                    email,
                    user_id: userIdSlug,
                    onboarding_completed: false
                });

            if (createUserError) {
                logger.error("Failed to create user", { error: createUserError.message });
                // Continue anyway, maybe user exists but RLS blocked the select
            }
        }

        const uploads = [];
        let successCount = 0;

        for (const file of files) {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = new Uint8Array(arrayBuffer);
            const timestamp = Date.now();
            const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
            const path = `${userId}/${timestamp}_${safeName}`;

            // Upload to storage
            const { data, error } = await supabase.storage
                .from("documents")
                .upload(path, buffer, {
                    contentType: file.type,
                    upsert: true,
                });

            if (error) {
                logger.error("Storage upload error", { error: error.message, filename: file.name });
                uploads.push({
                    filename: file.name,
                    error: error.message,
                    hint: error.message.includes("not found") ? "Bucket 'documents' does not exist" : undefined
                });
                continue;
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
                logger.error("DB Insert error", { error: dbError.message, filename: file.name });
                uploads.push({ filename: file.name, error: "Database error: " + dbError.message });
            } else {
                successCount++;
                uploads.push({ filename: file.name, path, success: true });
            }
        }

        if (successCount === 0) {
            return NextResponse.json({
                success: false,
                error: "All uploads failed",
                uploads
            }, { status: 500 });
        }

        return NextResponse.json({ success: true, successCount, uploads });
    } catch (error: any) {
        logger.error("Upload server error", { error: error?.message });
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
