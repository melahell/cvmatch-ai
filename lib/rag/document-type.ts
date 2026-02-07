export type NormalizedDocumentType = "pdf" | "docx" | "txt" | "doc" | "rtf" | "odt" | "unknown";

const SUPPORTED_EXTENSIONS = new Set(["pdf", "docx", "txt", "doc", "rtf", "odt"]);

// Extensions that map to a different normalized type
const EXTENSION_ALIASES: Record<string, NormalizedDocumentType> = {
    "md": "txt",
    "markdown": "txt",
};

const MIME_TO_TYPE: Record<string, NormalizedDocumentType> = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/msword": "doc",
    "application/rtf": "rtf",
    "text/rtf": "rtf",
    "application/vnd.oasis.opendocument.text": "odt",
    "text/plain": "txt",
    "text/markdown": "txt",
    "text/x-markdown": "txt",
};

export function normalizeDocumentTypeFromFilename(filename: string | null | undefined): NormalizedDocumentType {
    const name = (filename ?? "").trim().toLowerCase();
    const idx = name.lastIndexOf(".");
    if (idx <= 0 || idx === name.length - 1) return "unknown";
    const ext = name.slice(idx + 1);
    if (SUPPORTED_EXTENSIONS.has(ext)) return ext as NormalizedDocumentType;
    if (ext in EXTENSION_ALIASES) return EXTENSION_ALIASES[ext];
    return "unknown";
}

export function normalizeDocumentTypeFromMime(mimeType: string | null | undefined): NormalizedDocumentType {
    const key = (mimeType ?? "").trim().toLowerCase();
    return MIME_TO_TYPE[key] ?? "unknown";
}

export function normalizeDocumentTypeFromStoredFileType(stored: string | null | undefined): NormalizedDocumentType {
    const ft = (stored ?? "").trim().toLowerCase();
    if (!ft) return "unknown";
    if (ft === "pdf" || ft.includes("pdf")) return "pdf";
    if (ft === "docx" || ft.includes("wordprocessingml")) return "docx";
    if (ft === "doc" || ft === "msword" || ft.includes("msword")) return "doc";
    if (ft === "txt" || ft === "plain" || ft === "text") return "txt";
    if (ft === "rtf") return "rtf";
    if (ft === "odt") return "odt";
    return "unknown";
}

export function normalizeDocumentType(input: {
    filename?: string | null;
    mimeType?: string | null;
    storedFileType?: string | null;
}): NormalizedDocumentType {
    const byFilename = normalizeDocumentTypeFromFilename(input.filename);
    if (byFilename !== "unknown") return byFilename;

    const byMime = normalizeDocumentTypeFromMime(input.mimeType);
    if (byMime !== "unknown") return byMime;

    const byStored = normalizeDocumentTypeFromStoredFileType(input.storedFileType);
    if (byStored !== "unknown") return byStored;

    return "unknown";
}

