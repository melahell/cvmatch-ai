"use client";

import { X, Download, ChevronLeft, ChevronRight, Loader2, Maximize2, Minimize2, Printer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState, useCallback, useEffect } from "react";
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
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Convert RAG data to CV template format
    const cvData = ragToCVData(ragData);

    // Get template component based on template ID
    const TemplateComponent = getTemplateComponent(cv.templateId);

    // Navigation
    const currentIndex = allCVs?.findIndex(c => c.templateId === cv.templateId) ?? -1;
    const canGoPrev = currentIndex > 0;
    const canGoNext = allCVs && currentIndex < allCVs.length - 1;

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (isFullscreen) {
                    setIsFullscreen(false);
                } else {
                    onClose();
                }
            }
            if (e.key === 'ArrowLeft' && canGoPrev && allCVs && onNavigate) {
                onNavigate(allCVs[currentIndex - 1]);
            }
            if (e.key === 'ArrowRight' && canGoNext && allCVs && onNavigate) {
                onNavigate(allCVs[currentIndex + 1]);
            }
            if (e.key === 'f' || e.key === 'F') {
                setIsFullscreen(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [canGoPrev, canGoNext, allCVs, onNavigate, currentIndex, isFullscreen, onClose]);

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

    // Print handler
    const handlePrint = useCallback(() => {
        window.print();
    }, []);

    // Calculate scale based on fullscreen mode
    const getScale = () => {
        if (isFullscreen) return 0.9;
        return 0.65;
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`fixed inset-0 z-50 flex items-center justify-center bg-black/85 ${isFullscreen ? 'p-0' : 'p-4'}`}
                onClick={() => !isFullscreen && onClose()}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className={`relative bg-white dark:bg-slate-800 shadow-2xl overflow-hidden flex flex-col ${isFullscreen
                            ? 'w-full h-full rounded-none'
                            : 'w-full max-w-6xl max-h-[95vh] rounded-2xl'
                        }`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0 print:hidden">
                        <div className="flex items-center gap-4">
                            {/* Navigation arrows */}
                            {allCVs && allCVs.length > 1 && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handlePrev}
                                        disabled={!canGoPrev}
                                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                        title="Template précédent (←)"
                                    >
                                        <ChevronLeft className="h-5 w-5 text-slate-500" />
                                    </button>
                                    <span className="text-sm text-slate-400 font-medium">
                                        {currentIndex + 1} / {allCVs.length}
                                    </span>
                                    <button
                                        onClick={handleNext}
                                        disabled={!canGoNext}
                                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                        title="Template suivant (→)"
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
                        <div className="flex items-center gap-2">
                            {/* Fullscreen toggle */}
                            <button
                                onClick={() => setIsFullscreen(prev => !prev)}
                                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                title={isFullscreen ? "Quitter le plein écran (F)" : "Plein écran (F)"}
                            >
                                {isFullscreen ? (
                                    <Minimize2 className="h-5 w-5 text-slate-500" />
                                ) : (
                                    <Maximize2 className="h-5 w-5 text-slate-500" />
                                )}
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                title="Fermer (Échap)"
                            >
                                <X className="h-5 w-5 text-slate-500" />
                            </button>
                        </div>
                    </div>

                    {/* Preview - CV Rendu en temps réel */}
                    <div className={`flex-1 overflow-auto bg-slate-100 dark:bg-slate-900 print:bg-white ${isFullscreen ? 'p-4' : 'p-6'}`}>
                        <div
                            ref={cvRef}
                            className="mx-auto shadow-2xl transition-transform duration-300"
                            style={{
                                transform: `scale(${getScale()})`,
                                transformOrigin: 'top center',
                                width: '210mm',
                                marginBottom: isFullscreen ? '-50px' : '-180px'
                            }}
                        >
                            <TemplateComponent data={cvData} includePhoto={true} />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0 print:hidden">
                        <div className="flex items-center gap-4">
                            <p className="text-xs text-slate-400">
                                💡 Utilisez les flèches ← → pour naviguer, F pour plein écran
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePrint}
                                className="hidden sm:flex"
                            >
                                <Printer className="mr-2 h-4 w-4" />
                                Imprimer
                            </Button>
                            <Button variant="outline" size="sm" onClick={onClose}>
                                Fermer
                            </Button>
                            <Button
                                size="sm"
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
