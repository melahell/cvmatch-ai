"use client";

/**
 * PDFExportButton - Bouton d'export PDF natif navigateur
 * 
 * Utilise window.print() pour export instantané via CSS print.
 * Les templates CV ont déjà les styles @media print optimisés.
 */

import { Button } from "@/components/ui/button";
import { Download, FileDown } from "lucide-react";
import { printCVToPDF, exportCVToPDF } from "@/lib/cv/pdf-export";
import { useState } from "react";

interface PDFExportButtonProps {
    elementId: string;
    filename?: string;
    variant?: "primary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
    className?: string;
}

export function PDFExportButton({
    elementId,
    filename = "CV",
    variant = "primary",
    size = "md",
    className,
}: PDFExportButtonProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = () => {
        setIsExporting(true);
        
        try {
            // Utiliser méthode simplifiée (window.print)
            printCVToPDF(elementId);
        } catch (error) {
            console.error("Erreur export PDF:", error);
        } finally {
            // Reset après un délai (l'impression peut prendre du temps)
            setTimeout(() => {
                setIsExporting(false);
            }, 1000);
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleExport}
            disabled={isExporting}
            className={className}
        >
            <Download className={`w-4 h-4 mr-2 ${isExporting ? "animate-pulse" : ""}`} />
            {isExporting ? "Export en cours..." : "Exporter en PDF"}
        </Button>
    );
}
