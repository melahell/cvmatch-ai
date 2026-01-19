/**
 * Hook pour générer un PDF à partir d'un CV démo
 * Utilise html2pdf.js pour la génération côté client
 */

"use client";

import { useState, useCallback, useRef } from "react";

interface UseDemoPDFOptions {
    characterName: string;
    templateName: string;
}

export function useDemoPDF({ characterName, templateName }: UseDemoPDFOptions) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Ref to the CV container that will be rendered
    const cvContainerRef = useRef<HTMLDivElement | null>(null);

    const generatePDF = useCallback(async (cvElement?: HTMLElement) => {
        setIsGenerating(true);
        setError(null);

        try {
            // Dynamically import html2pdf.js (only on client)
            const html2pdf = (await import('html2pdf.js')).default;

            // Find the CV element
            const element = cvElement || document.querySelector('.cv-page') as HTMLElement;
            if (!element) {
                throw new Error('CV element not found');
            }

            // Build filename
            const sanitizedName = characterName.replace(/[^a-zA-Z0-9]/g, '_');
            const filename = `CV_${sanitizedName}_${templateName}.pdf`;

            const options = {
                margin: 0,
                filename,
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    letterRendering: true,
                    logging: false,
                    backgroundColor: '#ffffff'
                },
                jsPDF: {
                    unit: 'mm' as const,
                    format: 'a4' as const,
                    orientation: 'portrait' as const
                }
            };

            await html2pdf().set(options).from(element).save();

            return true;
        } catch (err) {
            console.error('PDF Generation Error:', err);
            setError(err instanceof Error ? err.message : 'Erreur de génération PDF');

            // Fallback: print dialog
            try {
                window.print();
            } catch {
                // Silent fallback failure
            }

            return false;
        } finally {
            setIsGenerating(false);
        }
    }, [characterName, templateName]);

    return {
        generatePDF,
        isGenerating,
        error,
        cvContainerRef
    };
}
