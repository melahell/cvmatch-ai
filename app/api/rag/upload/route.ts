import { createSupabaseUserClient, requireSupabaseUser } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { logger } from "@/lib/utils/logger";

export const runtime = "edge";

// [CDC-1] Types MIME autorisés pour les fichiers CV
const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword', // .doc
    'application/rtf',
    'text/rtf',
    'application/vnd.oasis.opendocument.text', // .odt
];

// [CDC-1] Extensions autorisées (fallback si MIME non fiable)
const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.rtf', '.odt'];

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
        const warnings: string[] = [];

        for (const file of files) {
            // [CDC-1] Validation du type MIME
            const fileExtension = '.' + (file.name.split('.').pop()?.toLowerCase() || '');
            const isMimeAllowed = ALLOWED_MIME_TYPES.includes(file.type);
            const isExtensionAllowed = ALLOWED_EXTENSIONS.includes(fileExtension);

            if (!isMimeAllowed && !isExtensionAllowed) {
                logger.warn("Rejected file: unsupported type", { 
                    filename: file.name, 
                    mimeType: file.type,
                    extension: fileExtension
                });
                uploads.push({
                    filename: file.name,
                    error: `Type de fichier non supporté (${file.type || fileExtension}). Formats acceptés: PDF, DOCX, DOC, RTF, ODT.`,
                    rejected: true
                });
                continue;
            }

            // [CDC-1] Warning si fichier très petit (potentiellement vide/corrompu)
            if (file.size < 1000) {
                warnings.push(`Le fichier "${file.name}" est très petit (${file.size} octets) et pourrait être vide ou corrompu.`);
            }

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

        return NextResponse.json({ 
            success: true, 
            successCount, 
            uploads,
            // [CDC-1] Ajouter warnings s'il y en a
            ...(warnings.length > 0 && { warnings })
        });
    } catch (error: any) {
        logger.error("Upload server error", { error: error?.message });
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
