import { describe, it, expect } from "vitest";
import { normalizeDocumentType } from "@/lib/rag/document-type";

describe("normalizeDocumentType", () => {
    it("déduit correctement le type à partir du nom de fichier", () => {
        expect(normalizeDocumentType({ filename: "cv.pdf" })).toBe("pdf");
        expect(normalizeDocumentType({ filename: "cv.DOCX" })).toBe("docx");
        expect(normalizeDocumentType({ filename: "notes.txt" })).toBe("txt");
    });

    it("déduit correctement le type à partir du MIME", () => {
        expect(normalizeDocumentType({ mimeType: "application/pdf" })).toBe("pdf");
        expect(normalizeDocumentType({ mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" })).toBe("docx");
        expect(normalizeDocumentType({ mimeType: "text/plain" })).toBe("txt");
    });

    it("gère les anciennes valeurs stockées qui contiennent le MIME (legacy)", () => {
        expect(normalizeDocumentType({ storedFileType: "vnd.openxmlformats-officedocument.wordprocessingml.document" })).toBe("docx");
        expect(normalizeDocumentType({ storedFileType: "msword" })).toBe("doc");
    });
});

