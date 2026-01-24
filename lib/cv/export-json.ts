/**
 * Export CV to JSON format
 * Exports complete CV data with widgets and metadata
 */

import type { RendererResumeSchema } from "./renderer-schema";
import type { AIWidgetsEnvelope } from "./ai-widgets";

export interface CVExportMetadata {
    version: string;
    exported_at: string;
    template?: string;
    job_analysis_id?: string;
    generated_at?: string;
}

export interface CVExportJSON {
    version: string;
    exported_at: string;
    cv_data: RendererResumeSchema;
    widgets?: AIWidgetsEnvelope;
    metadata?: CVExportMetadata;
}

/**
 * Export CV data to JSON string
 */
export function exportCVToJSON(
    cvData: RendererResumeSchema,
    widgets?: AIWidgetsEnvelope,
    metadata?: {
        template?: string;
        job_analysis_id?: string;
        generated_at?: string;
    }
): string {
    const exportData: CVExportJSON = {
        version: "1.0",
        exported_at: new Date().toISOString(),
        cv_data: cvData,
        ...(widgets && { widgets }),
        ...(metadata && {
            metadata: {
                version: "1.0",
                exported_at: new Date().toISOString(),
                ...metadata,
            },
        }),
    };

    return JSON.stringify(exportData, null, 2);
}
