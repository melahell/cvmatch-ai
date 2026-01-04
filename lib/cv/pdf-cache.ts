/**
 * PDF Cache utilities to avoid regenerating PDFs unnecessarily
 * Store PDFs in Supabase Storage for caching
 */

import { createClient } from "@supabase/supabase-js";

export interface PDFCacheConfig {
    ttl: number; // Time to live in seconds (default: 24h)
}

const DEFAULT_TTL = 24 * 60 * 60; // 24 hours

export class PDFCache {
    private supabase;

    constructor() {
        this.supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY! // Need service role for storage
        );
    }

    /**
     * Generate cache key for a CV PDF
     */
    private getCacheKey(cvId: string, format: "A4" | "Letter"): string {
        return `cv-pdfs/${cvId}_${format}.pdf`;
    }

    /**
     * Check if cached PDF exists and is still valid
     */
    async getCachedPDF(
        cvId: string,
        format: "A4" | "Letter",
        ttl: number = DEFAULT_TTL
    ): Promise<Uint8Array | null> {
        try {
            const cacheKey = this.getCacheKey(cvId, format);

            // Check if file exists
            const { data: fileData, error: listError } = await this.supabase.storage
                .from("cv-pdfs")
                .list(`cv-pdfs`, {
                    search: `${cvId}_${format}.pdf`,
                });

            if (listError || !fileData || fileData.length === 0) {
                return null;
            }

            const file = fileData[0];

            // Check if file is expired
            const fileAge = Date.now() - new Date(file.created_at).getTime();
            if (fileAge > ttl * 1000) {
                // File expired, delete it
                await this.supabase.storage.from("cv-pdfs").remove([cacheKey]);
                return null;
            }

            // Download file
            const { data, error } = await this.supabase.storage
                .from("cv-pdfs")
                .download(cacheKey);

            if (error || !data) {
                console.error("PDF Cache download error:", error);
                return null;
            }

            return new Uint8Array(await data.arrayBuffer());
        } catch (error) {
            console.error("PDF Cache get error:", error);
            return null;
        }
    }

    /**
     * Store generated PDF in cache
     */
    async storePDF(
        cvId: string,
        format: "A4" | "Letter",
        pdfBuffer: Uint8Array
    ): Promise<boolean> {
        try {
            const cacheKey = this.getCacheKey(cvId, format);

            const { error } = await this.supabase.storage
                .from("cv-pdfs")
                .upload(cacheKey, pdfBuffer, {
                    contentType: "application/pdf",
                    upsert: true, // Overwrite if exists
                });

            if (error) {
                console.error("PDF Cache store error:", error);
                return false;
            }

            return true;
        } catch (error) {
            console.error("PDF Cache store error:", error);
            return false;
        }
    }

    /**
     * Invalidate cached PDF (e.g., when CV is regenerated)
     */
    async invalidatePDF(cvId: string): Promise<boolean> {
        try {
            const keysToDelete = [
                this.getCacheKey(cvId, "A4"),
                this.getCacheKey(cvId, "Letter"),
            ];

            const { error } = await this.supabase.storage
                .from("cv-pdfs")
                .remove(keysToDelete);

            if (error) {
                console.error("PDF Cache invalidate error:", error);
                return false;
            }

            return true;
        } catch (error) {
            console.error("PDF Cache invalidate error:", error);
            return false;
        }
    }
}

/**
 * Helper to check if CV data has changed since last PDF generation
 */
export async function shouldRegeneratePDF(
    cvId: string,
    currentCVData: any
): Promise<boolean> {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data } = await supabase
        .from("cv_generations")
        .select("cv_data, updated_at")
        .eq("id", cvId)
        .single();

    if (!data) return true;

    // Compare JSON content
    const storedData = JSON.stringify(data.cv_data);
    const currentData = JSON.stringify(currentCVData);

    return storedData !== currentData;
}
