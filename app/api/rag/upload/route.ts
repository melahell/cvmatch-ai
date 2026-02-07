import { createSupabaseUserClient, requireSupabaseUser } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { logger } from "@/lib/utils/logger";
import { normalizeDocumentType, normalizeDocumentTypeFromFilename, normalizeDocumentTypeFromMime } from "@/lib/rag/document-type";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// [CDC-1] Types MIME autorisés — alignés sur lib/rag/text-extraction (extraction réelle)
const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword', // .doc
    'text/plain',
    'text/markdown',      // .md
    'text/x-markdown',    // .md (fallback MIME)
    'image/png',
    'image/jpeg',
    'image/jpg',
];

// [CDC-1] Extensions autorisées (fallback si MIME non fiable)
const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.txt', '.md', '.png', '.jpg', '.jpeg'];

const CORS_HEADERS = {
    "Allow": "POST, OPTIONS",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
} as const;

/** Builds response headers with CORS for POST responses. */
function postResponseHeaders(req: Request): Record<string, string> {
    const h: Record<string, string> = { ...CORS_HEADERS };
    const origin = req.headers.get("Origin");
    if (origin) h["Access-Control-Allow-Origin"] = origin;
    return h;
}

/** Preflight CORS : permet au navigateur d’envoyer le POST après OPTIONS. */
export async function OPTIONS(req: Request) {
    logger.info("rag/upload request", { method: req.method, url: req.url });
    const origin = req.headers.get("Origin");
    const headers = new Headers(CORS_HEADERS);
    if (origin) headers.set("Access-Control-Allow-Origin", origin);
    return new NextResponse(null, { status: 200, headers });
}

/** Méthode non autorisée : seule POST est acceptée pour l'upload. */
export async function GET(req: Request) {
    logger.info("rag/upload request", { method: req.method, url: req.url });
    return NextResponse.json(
        { error: "Method Not Allowed", message: "Use POST to upload documents." },
        { status: 405, headers: { ...CORS_HEADERS } }
    );
}

export async function POST(req: Request) {
    logger.info("rag/upload request", { method: req.method, url: req.url });
    const headers = postResponseHeaders(req);
    try {
        const auth = await requireSupabaseUser(req);
        if (auth.error || !auth.user || !auth.token) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401, headers });
        }

        const formData = await req.formData();
        const files = formData.getAll("files") as File[];
        const userId = auth.user.id;

        if (!files.length || !userId) {
            return NextResponse.json({ error: "Missing files or userId" }, { status: 400, headers });
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
            const normalizedType =
                normalizeDocumentTypeFromFilename(file.name) !== "unknown"
                    ? normalizeDocumentTypeFromFilename(file.name)
                    : normalizeDocumentTypeFromMime(file.type);

            if (!isMimeAllowed && !isExtensionAllowed) {
                logger.warn("Rejected file: unsupported type", {
                    filename: file.name,
                    mimeType: file.type,
                    extension: fileExtension
                });
                uploads.push({
                    filename: file.name,
                    error: `Type de fichier non supporté (${file.type || fileExtension}). Formats acceptés: PDF, DOCX, DOC, TXT, MD, images (PNG, JPG).`,
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

            // Validate file size (Vercel payload limit is 4.5MB)
            const MAX_FILE_SIZE_BYTES = 4.5 * 1024 * 1024;
            if (file.size > MAX_FILE_SIZE_BYTES) {
                uploads.push({
                    filename: file.name,
                    error: `Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum autorisé : 4.5 MB.`,
                    rejected: true
                });
                continue;
            }

            // Upload to storage (no upsert — timestamp in path guarantees uniqueness)
            const { data, error } = await supabase.storage
                .from("documents")
                .upload(path, buffer, {
                    contentType: file.type,
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

            // [CDC-1] Extract text immediately (lazy-load to avoid cold-start 405 on Vercel)
            let extractedText = "";
            let extractionMethod = "pending";
            let extractionStatus = "pending";
            let extractionError: string | null = null;

            try {
                const { extractTextFromBuffer } = await import("@/lib/rag/text-extraction");
                const nodeBuffer = Buffer.from(buffer);
                const result = await extractTextFromBuffer(nodeBuffer, file.type);
                extractedText = result.text;
                extractionMethod = result.method;
                extractionStatus = "completed";

                if (!extractedText.trim()) {
                    warnings.push(`Le document "${file.name}" semble vide après extraction.`);
                }
            } catch (err: any) {
                logger.error("Extraction error", { filename: file.name, error: err.message });
                extractionStatus = "failed";
                extractionError = err.message;
                warnings.push(`Échec de l'extraction texte pour "${file.name}" (OCR).`);
            }

            // Record in database
            const { data: inserted, error: dbError } = await supabase.from("uploaded_documents").insert({
                user_id: userId,
                filename: file.name,
                file_type: normalizedType === "unknown" ? normalizeDocumentType({ filename: file.name, mimeType: file.type }) : normalizedType,
                file_size: file.size,
                storage_path: path,
                extraction_status: extractionStatus,
                extracted_text: extractedText, // Save text immediately
                // We could also save metadata if columns existed, for now we assume they might not
            }).select("id, filename, file_type, extraction_status").maybeSingle();

            if (dbError) {
                logger.error("DB Insert error", { error: dbError.message, filename: file.name });
                try {
                    await supabase.storage.from("documents").remove([path]);
                } catch { }
                uploads.push({ filename: file.name, error: "Database error: " + dbError.message });
            } else {
                successCount++;
                uploads.push({ filename: file.name, path, success: true, documentId: inserted?.id, file_type: inserted?.file_type });
            }
        }

        if (successCount === 0) {
            return NextResponse.json({
                success: false,
                error: "All uploads failed",
                uploads
            }, { status: 500, headers });
        }

        return NextResponse.json({
            success: true,
            successCount,
            uploads,
            // [CDC-1] Ajouter warnings s'il y en a
            ...(warnings.length > 0 && { warnings })
        }, { headers });
    } catch (error: any) {
        logger.error("Upload server error", { error: error?.message });
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500, headers });
    }
}
