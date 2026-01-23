/**
 * PDF Export Natif Navigateur - Export via CSS Print
 * 
 * Utilise window.print() du navigateur pour générer un PDF instantané
 * sans serveur. Les templates CV ont déjà les styles @media print optimisés.
 * 
 * Avantage : Export instantané (<500ms), pas de serveur, pas de Puppeteer
 * 
 * Inspiré de recup.md : "Export : Bouton 'Imprimer en PDF' (natif navigateur)"
 */

/**
 * Exporte le CV en PDF via window.print()
 * 
 * @param elementId - ID de l'élément à exporter (doit contenir le CV)
 * @param filename - Nom du fichier PDF (sans extension)
 */
export function exportCVToPDF(elementId: string, filename: string = "CV"): void {
    if (typeof window === "undefined") {
        console.error("exportCVToPDF: window is not available (SSR)");
        return;
    }

    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`exportCVToPDF: Element #${elementId} not found`);
        return;
    }

    // Créer une nouvelle fenêtre pour l'impression
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
        // Fallback si popup bloquée : utiliser print direct
        window.print();
        return;
    }

    // Cloner le contenu avec styles
    const clonedContent = element.cloneNode(true) as HTMLElement;
    
    // Créer HTML complet avec styles
    const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${filename}</title>
    <style>
        @page {
            size: A4;
            margin: 0;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            background: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        @media print {
            body {
                width: 210mm;
                height: 297mm;
            }
            
            @page {
                size: A4;
                margin: 0;
            }
        }
        
        /* Copier tous les styles inline de l'élément */
        ${Array.from(document.styleSheets)
            .map((sheet) => {
                try {
                    return Array.from(sheet.cssRules)
                        .map((rule) => rule.cssText)
                        .join("\n");
                } catch {
                    return "";
                }
            })
            .join("\n")}
    </style>
</head>
<body>
    ${clonedContent.innerHTML}
</body>
</html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Attendre chargement puis imprimer
    printWindow.onload = () => {
        setTimeout(() => {
            printWindow.print();
            // Fermer après impression (ou laisser ouvert si user annule)
            // printWindow.close();
        }, 250);
    };
}

/**
 * Exporte le CV en PDF via window.print() (méthode simplifiée)
 * 
 * Cette méthode est plus simple : elle déclenche juste window.print()
 * et laisse le navigateur gérer le reste. Les styles @media print
 * des templates sont automatiquement appliqués.
 * 
 * @param elementId - ID de l'élément à exporter (optionnel, si omis, imprime toute la page)
 */
export function printCVToPDF(elementId?: string): void {
    if (typeof window === "undefined") {
        console.error("printCVToPDF: window is not available (SSR)");
        return;
    }

    // Si elementId fourni, créer une iframe temporaire avec juste cet élément
    if (elementId) {
        const element = document.getElementById(elementId);
        if (!element) {
            console.error(`printCVToPDF: Element #${elementId} not found`);
            return;
        }

        // Créer iframe cachée
        const iframe = document.createElement("iframe");
        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "none";
        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) {
            console.error("printCVToPDF: Cannot access iframe document");
            return;
        }

        // Copier styles
        Array.from(document.styleSheets).forEach((sheet) => {
            try {
                const link = iframeDoc.createElement("link");
                link.rel = "stylesheet";
                link.href = (sheet as any).href || "";
                iframeDoc.head.appendChild(link);
            } catch {
                // Ignorer styles cross-origin
            }
        });

        // Copier contenu
        iframeDoc.body.innerHTML = element.innerHTML;
        iframeDoc.body.style.margin = "0";
        iframeDoc.body.style.padding = "0";

        // Imprimer
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();

        // Nettoyer après impression
        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 1000);
    } else {
        // Imprimer toute la page
        window.print();
    }
}

/**
 * Exporte le CV en PDF via html2pdf.js (alternative si window.print() ne suffit pas)
 * 
 * Utilise la librairie html2pdf.js déjà installée pour plus de contrôle.
 * 
 * @param elementId - ID de l'élément à exporter
 * @param filename - Nom du fichier PDF
 */
export async function exportCVToPDFWithHtml2Pdf(
    elementId: string,
    filename: string = "CV"
): Promise<void> {
    if (typeof window === "undefined") {
        console.error("exportCVToPDFWithHtml2Pdf: window is not available (SSR)");
        return;
    }

    // Import dynamique de html2pdf.js
    const html2pdfModule = await import("html2pdf.js");
    const html2pdf = html2pdfModule.default;
    
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`exportCVToPDFWithHtml2Pdf: Element #${elementId} not found`);
        return;
    }

    const opt: any = {
        margin: 0,
        filename: `${filename}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    try {
        // @ts-ignore - html2pdf.js types are incomplete
        await html2pdf().set(opt).from(element).save();
    } catch (error) {
        console.error("Erreur export PDF:", error);
        throw error;
    }
}
