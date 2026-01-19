"use client";

import { X, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
                            <Button asChild>
                                <a href={cv.pdfUrl} download>
                                    <Download className="mr-2 h-4 w-4" />
                                    Télécharger PDF
                                </a>
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
