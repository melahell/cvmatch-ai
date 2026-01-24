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
import { exportCVToWord } from "@/lib/cv/export-word";
import { exportCVToMarkdown } from "@/lib/cv/export-markdown";
import { exportCVToJSON } from "@/lib/cv/export-json";
import type { RendererResumeSchema } from "@/lib/cv/renderer-schema";
import type { AIWidgetsEnvelope } from "@/lib/cv/ai-widgets";
import { toast } from "sonner";

interface ExportMenuProps {
    cvData: RendererResumeSchema;
    widgets?: AIWidgetsEnvelope;
    template?: string;
    filename?: string;
    jobAnalysisId?: string;
    onPDFExport?: () => void; // Callback pour export PDF existant
}

export function ExportMenu({
    cvData,
    widgets,
    template = "modern",
    filename = "CV",
    jobAnalysisId,
    onPDFExport,
}: ExportMenuProps) {
    const [exporting, setExporting] = useState<string | null>(null);

    const downloadBlob = (blob: Blob | Buffer, filename: string, mimeType: string) => {
        const url = URL.createObjectURL(
            blob instanceof Buffer ? new Blob([blob], { type: mimeType }) : blob
        );
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
                    if (onPDFExport) {
                        onPDFExport();
                        toast.success("CV exporté en PDF");
                    } else {
                        toast.error("Export PDF non disponible");
                    }
                    break;
                }
            }
        } catch (error: any) {
            console.error(`Error exporting to ${format}:`, error);
            toast.error(`Erreur lors de l'export ${format}: ${error.message || "Erreur inconnue"}`);
        } finally {
            setExporting(null);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="primary" size="sm" disabled={!!exporting}>
                    {exporting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
                <DropdownMenuItem onClick={() => handleExport("pdf")} disabled={!!exporting}>
                    <FileText className="w-4 h-4 mr-2" />
                    PDF
                </DropdownMenuItem>
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
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
