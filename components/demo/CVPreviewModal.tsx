"use client";

import { X, Download, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState, useCallback } from "react";
import { DemoCV } from "@/lib/data/demo/types";
import { RAGComplete } from "@/types/rag-complete";
import { Button } from "@/components/ui/button";
import { ragToCVData } from "@/lib/utils/rag-to-cv-data";

// Import templates
import ModernTemplate from "@/components/cv/templates/ModernTemplate";
import ClassicTemplate from "@/components/cv/templates/ClassicTemplate";
import CreativeTemplate from "@/components/cv/templates/CreativeTemplate";
import TechTemplate from "@/components/cv/templates/TechTemplate";

interface CVPreviewModalProps {
    cv: DemoCV;
    characterName: string;
    ragData: RAGComplete;
    onClose: () => void;
    allCVs?: DemoCV[];
    onNavigate?: (cv: DemoCV) => void;
}

export function CVPreviewModal({
    cv,
    characterName,
    ragData,
    onClose,
    allCVs,
    onNavigate
}: CVPreviewModalProps) {
    const cvRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Convert RAG data to CV template format
    const cvData = ragToCVData(ragData);

    // Get template component based on template ID
    const TemplateComponent = getTemplateComponent(cv.templateId);

    // Navigation
    const currentIndex = allCVs?.findIndex(c => c.templateId === cv.templateId) ?? -1;
    const canGoPrev = currentIndex > 0;
    const canGoNext = allCVs && currentIndex < allCVs.length - 1;

    const handlePrev = () => {
        if (canGoPrev && allCVs && onNavigate) {
            onNavigate(allCVs[currentIndex - 1]);
        }
    };

    const handleNext = () => {
        if (canGoNext && allCVs && onNavigate) {
            onNavigate(allCVs[currentIndex + 1]);
        }
    };

    // PDF Generation
    const handleDownloadPDF = useCallback(async () => {
        if (isGenerating) return;

        setIsGenerating(true);

        try {
            const html2pdf = (await import('html2pdf.js')).default;

            // Find the CV element inside our ref
            const element = cvRef.current?.querySelector('.cv-page') as HTMLElement;
            if (!element) {
                throw new Error('CV element not found');
            }

            // Clone element to avoid scaling issues
            const clone = element.cloneNode(true) as HTMLElement;
            clone.style.transform = 'none';
            clone.style.width = '210mm';
            clone.style.height = '297mm';

            // Create temporary container
            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.left = '-9999px';
            container.style.top = '0';
            container.appendChild(clone);
            document.body.appendChild(container);

            const sanitizedName = characterName.replace(/[^a-zA-Z0-9]/g, '_');
            const filename = `CV_${sanitizedName}_${cv.templateName}.pdf`;

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

            await html2pdf().set(options).from(clone).save();

            // Cleanup
            document.body.removeChild(container);

        } catch (err) {
            console.error('PDF Generation Error:', err);
            // Fallback to print
            window.print();
        } finally {
            setIsGenerating(false);
        }
    }, [characterName, cv.templateName, isGenerating]);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                        <div className="flex items-center gap-4">
                            {/* Navigation arrows */}
                            {allCVs && allCVs.length > 1 && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handlePrev}
                                        disabled={!canGoPrev}
                                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="h-5 w-5 text-slate-500" />
                                    </button>
                                    <span className="text-sm text-slate-400">
                                        {currentIndex + 1} / {allCVs.length}
                                    </span>
                                    <button
                                        onClick={handleNext}
                                        disabled={!canGoNext}
                                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight className="h-5 w-5 text-slate-500" />
                                    </button>
                                </div>
                            )}
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">
                                    CV {cv.templateName} - {characterName}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {cv.templateDescription}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            <X className="h-5 w-5 text-slate-500" />
                        </button>
                    </div>

                    {/* Preview - CV Rendu en temps réel */}
                    <div className="flex-1 overflow-auto p-6 bg-slate-100 dark:bg-slate-900">
                        <div
                            ref={cvRef}
                            className="mx-auto shadow-2xl"
                            style={{
                                transform: 'scale(0.7)',
                                transformOrigin: 'top center',
                                width: '210mm',
                                marginBottom: '-200px' // Compensate for scale
                            }}
                        >
                            <TemplateComponent data={cvData} includePhoto={true} />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0">
                        <p className="text-xs text-slate-400">
                            💡 CV généré en temps réel depuis le profil de {characterName}
                        </p>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={onClose}>
                                Fermer
                            </Button>
                            <Button
                                onClick={handleDownloadPDF}
                                disabled={isGenerating}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Génération...
                                    </>
                                ) : (
                                    <>
                                        <Download className="mr-2 h-4 w-4" />
                                        Télécharger PDF
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

/**
 * Get the template component based on template ID
 */
function getTemplateComponent(templateId: string) {
    switch (templateId) {
        case 'modern':
            return ModernTemplate;
        case 'classic':
            return ClassicTemplate;
        case 'creative':
            return CreativeTemplate;
        case 'tech':
            return TechTemplate;
        default:
            return ModernTemplate;
    }
}
