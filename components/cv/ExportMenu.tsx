"use client";

/**
 * Export Menu - Dropdown pour exporter CV en différents formats
 * Formats supportés : PDF, Word, Markdown, JSON
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText, File, Code, FileJson, Download, Loader2 } from "lucide-react";
import ContextualLoader from "@/components/loading/ContextualLoader";
import { exportCVToWord } from "@/lib/cv/export-word";
import { exportCVToMarkdown } from "@/lib/cv/export-markdown";
import { exportCVToJSON } from "@/lib/cv/export-json";
import type { RendererResumeSchema } from "@/lib/cv/renderer-schema";
import type { AIWidgetsEnvelope } from "@/lib/cv/ai-widgets";
import { toast } from "sonner";
import { logger } from "@/lib/utils/logger";

interface ExportMenuProps {
    cvData: RendererResumeSchema;
    widgets?: AIWidgetsEnvelope;
    template?: string;
    filename?: string;
    jobAnalysisId?: string;
    onPDFDownload?: () => void | Promise<void>;
    onPDFExport?: () => void | Promise<void>;
    onWidgetsExport?: () => void | Promise<void>;
}

export function ExportMenu({
    cvData,
    widgets,
    template = "modern",
    filename = "CV",
    jobAnalysisId,
    onPDFDownload,
    onPDFExport,
    onWidgetsExport,
}: ExportMenuProps) {
    const [exporting, setExporting] = useState<string | null>(null);

    const downloadBlob = (blob: Blob | Buffer, filename: string, mimeType: string) => {
        let blobToUse: Blob;
        if (typeof Buffer !== 'undefined' && blob instanceof Buffer) {
            blobToUse = new Blob([new Uint8Array(blob)], { type: mimeType });
        } else {
            blobToUse = blob as Blob;
        }
        const url = URL.createObjectURL(blobToUse);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleExport = async (format: "pdf" | "word" | "markdown" | "json") => {
        setExporting(format);

        try {
            switch (format) {
                case "word": {
                    const wordBuffer = await exportCVToWord(cvData, template);
                    downloadBlob(
                        wordBuffer,
                        `${filename}.docx`,
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    );
                    toast.success("CV exporté en Word");
                    break;
                }

                case "markdown": {
                    const markdown = exportCVToMarkdown(cvData);
                    const blob = new Blob([markdown], { type: "text/markdown" });
                    downloadBlob(blob, `${filename}.md`, "text/markdown");
                    toast.success("CV exporté en Markdown");
                    break;
                }

                case "json": {
                    const json = exportCVToJSON(cvData, widgets, {
                        template,
                        job_analysis_id: jobAnalysisId,
                        generated_at: new Date().toISOString(),
                    });
                    const blob = new Blob([json], { type: "application/json" });
                    downloadBlob(blob, `${filename}.json`, "application/json");
                    toast.success("CV exporté en JSON");
                    break;
                }

                case "pdf": {
                    if (onPDFDownload) {
                        await onPDFDownload();
                        toast.success("CV exporté en PDF");
                    } else {
                        toast.error("Export PDF non disponible");
                    }
                    break;
                }
            }
        } catch (error: any) {
            logger.error(`Error exporting to ${format}`, { error, format });
            toast.error(`Erreur lors de l'export ${format}: ${error.message || "Erreur inconnue"}`);
        } finally {
            setExporting(null);
        }
    };

    const handlePrintDebug = async () => {
        if (!onPDFExport) {
            toast.error("Impression non disponible");
            return;
        }

        setExporting("pdf");
        try {
            await onPDFExport();
            toast.success("Impression lancée");
        } catch (error: any) {
            logger.error("Error printing PDF", { error });
            toast.error(`Erreur lors de l'impression: ${error.message || "Erreur inconnue"}`);
        } finally {
            setExporting(null);
        }
    };

    return (
        <>
            {exporting && (
                <ContextualLoader
                    context={exporting === "pdf" ? "exporting-pdf" : "exporting-data"}
                    isOverlay
                />
            )}
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="primary" size="sm" disabled={!!exporting}>
                    {exporting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin motion-reduce:animate-none" />
                            Export...
                        </>
                    ) : (
                        <>
                            <Download className="w-4 h-4 mr-2" />
                            Exporter
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {onPDFDownload && (
                    <DropdownMenuItem onClick={() => handleExport("pdf")} disabled={!!exporting}>
                        <FileText className="w-4 h-4 mr-2" />
                        PDF (serveur)
                    </DropdownMenuItem>
                )}
                {onPDFExport && (
                    <DropdownMenuItem onClick={handlePrintDebug} disabled={!!exporting}>
                        <FileText className="w-4 h-4 mr-2" />
                        PDF (navigateur)
                    </DropdownMenuItem>
                )}
                {!onPDFDownload && !onPDFExport && (
                    <DropdownMenuItem disabled>
                        <FileText className="w-4 h-4 mr-2" />
                        PDF
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => handleExport("word")} disabled={!!exporting}>
                    <File className="w-4 h-4 mr-2" />
                    Word (.docx)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("markdown")} disabled={!!exporting}>
                    <Code className="w-4 h-4 mr-2" />
                    Markdown (.md)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("json")} disabled={!!exporting}>
                    <FileJson className="w-4 h-4 mr-2" />
                    JSON (.json)
                </DropdownMenuItem>
                {onWidgetsExport && (
                    <DropdownMenuItem onClick={async () => {
                        setExporting("widgets");
                        try { await onWidgetsExport(); } catch (e: any) { toast.error(`Erreur: ${e.message}`); } finally { setExporting(null); }
                    }} disabled={!!exporting}>
                        <FileJson className="w-4 h-4 mr-2" />
                        Widgets bruts (.json)
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}
