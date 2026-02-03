"use client";

import { X, Download, ChevronLeft, ChevronRight, Loader2, Maximize2, Minimize2, Printer, ScanLine, CheckCircle, Wand2, LayoutList } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState, useCallback, useEffect } from "react";
import { DemoCV } from "@/lib/data/demo/types";
import { RAGComplete } from "@/types/rag-complete";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ragToCVData } from "@/lib/utils/rag-to-cv-data";
import { logger } from "@/lib/utils/logger";
import { openPrintPreview } from "@/lib/cv/pdf-export";

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
    const [isCompact, setIsCompact] = useState(false);

    // Scan ATS states
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [showScanResult, setShowScanResult] = useState(false);

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
                } else if (!isScanning) {
                    onClose();
                }
            }
            if (e.key === 'ArrowLeft' && canGoPrev && allCVs && onNavigate && !isScanning) {
                onNavigate(allCVs[currentIndex - 1]);
            }
            if (e.key === 'ArrowRight' && canGoNext && allCVs && onNavigate && !isScanning) {
                onNavigate(allCVs[currentIndex + 1]);
            }
            if (e.key === 'f' || e.key === 'F') {
                setIsFullscreen(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [canGoPrev, canGoNext, allCVs, onNavigate, currentIndex, isFullscreen, onClose, isScanning]);

    // ATS Scan logic
    useEffect(() => {
        if (isScanning) {
            const interval = setInterval(() => {
                setScanProgress(p => {
                    if (p >= 100) {
                        clearInterval(interval);
                        setIsScanning(false);
                        setShowScanResult(true);
                        setTimeout(() => setShowScanResult(false), 5000); // Hide after 5s
                        return 100;
                    }
                    return p + 2;
                });
            }, 40); // 2 seconds total duration
            return () => clearInterval(interval);
        }
    }, [isScanning]);

    const handleStartScan = () => {
        setIsScanning(true);
        setScanProgress(0);
        setShowScanResult(false);
    };

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
            openPrintPreview("/demo/print", {
                data: cvData,
                templateId: cv.templateId,
                includePhoto: true,
                dense: isCompact,
                format: "A4",
            });
        } catch (err) {
            logger.error('PDF Generation Error', { error: err });
            openPrintPreview("/demo/print", {
                data: cvData,
                templateId: cv.templateId,
                includePhoto: true,
                dense: isCompact,
                format: "A4",
            });
        } finally {
            setTimeout(() => setIsGenerating(false), 500);
        }
    }, [isGenerating, cvData, cv.templateId, isCompact]);

    const handlePrint = useCallback(() => {
        openPrintPreview("/demo/print", {
            data: cvData,
            templateId: cv.templateId,
            includePhoto: true,
            dense: isCompact,
            format: "A4",
        });
    }, [cvData, cv.templateId, isCompact]);

    const getScale = () => {
        if (isFullscreen) return 0.9;
        return 0.65;
    };

    // Calculate simulated scores
    const scoreStructure = 95 + Math.floor(Math.random() * 5);
    const scoreKeywords = 92 + Math.floor(Math.random() * 8);

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
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0 print:hidden bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm z-30">
                        <div className="flex items-center gap-4">
                            {allCVs && allCVs.length > 1 && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handlePrev}
                                        disabled={!canGoPrev || isScanning}
                                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-30"
                                    >
                                        <ChevronLeft className="h-5 w-5 text-slate-500" />
                                    </button>
                                    <span className="text-sm text-slate-400 font-medium">
                                        {currentIndex + 1} / {allCVs.length}
                                    </span>
                                    <button
                                        onClick={handleNext}
                                        disabled={!canGoNext || isScanning}
                                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-30"
                                    >
                                        <ChevronRight className="h-5 w-5 text-slate-500" />
                                    </button>
                                </div>
                            )}
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                    CV {cv.templateName}
                                    {isCompact && <Badge variant="neutral" className="text-[10px] h-5">Compact</Badge>}
                                </h3>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Actions Toolbar */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsCompact(!isCompact)}
                                title={isCompact ? "Passer en mode aéré" : "Passer en mode compact"}
                                className="hidden sm:flex text-slate-600 dark:text-slate-400"
                            >
                                <LayoutList className="h-4 w-4 mr-2" />
                                {isCompact ? "Aéré" : "Compact"}
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleStartScan}
                                disabled={isScanning || showScanResult}
                                className="hidden sm:flex border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 dark:border-green-900 dark:text-green-400 dark:hover:bg-green-900/20"
                            >
                                <ScanLine className="h-4 w-4 mr-2" />
                                Analyser ATS
                            </Button>

                            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden sm:block"></div>

                            <button
                                onClick={() => setIsFullscreen(prev => !prev)}
                                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                {isFullscreen ? <Minimize2 className="h-5 w-5 text-slate-500" /> : <Maximize2 className="h-5 w-5 text-slate-500" />}
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                <X className="h-5 w-5 text-slate-500" />
                            </button>
                        </div>
                    </div>

                    {/* Preview Area */}
                    <div className={`flex-1 overflow-auto bg-slate-100 dark:bg-slate-900 print:bg-white relative ${isFullscreen ? 'p-4' : 'p-6'}`}>
                        <div className="mx-auto relative" style={{ width: '210mm' }}>
                            {/* Scanning Effect Overlay */}
                            <AnimatePresence>
                                {isScanning && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 z-40 pointer-events-none rounded sm:scale-[0.65] lg:scale-[0.65] origin-top-center overflow-hidden" // Approximation of scale
                                        style={{ height: '297mm' }}
                                    >
                                        <div className="absolute inset-0 bg-green-500/10 mix-blend-multiply"></div>
                                        <motion.div
                                            initial={{ top: 0 }}
                                            animate={{ top: "100%" }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            className="absolute left-0 right-0 h-1 bg-green-500 shadow-level-3 z-50"
                                        />
                                        <div className="absolute center top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-6 py-3 rounded-full font-bold backdrop-blur-md shadow-2xl flex items-center gap-3">
                                            <Loader2 className="h-5 w-5 animate-spin text-green-400" />
                                            Analyse en cours... {scanProgress}%
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Scan Result Overlay */}
                            <AnimatePresence>
                                {showScanResult && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="absolute top-10 left-1/2 transform -translate-x-1/2 z-50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-green-200 dark:border-green-900 min-w-[300px]"
                                    >
                                        <div className="text-center">
                                            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
                                                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                                                Excellent !
                                            </h3>
                                            <p className="text-slate-500 text-sm mb-4">Ce CV est optimisé pour les ATS</p>

                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-600 dark:text-slate-300">Structure</span>
                                                    <span className="font-bold text-green-600">{scoreStructure}%</span>
                                                </div>
                                                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                                    <motion.div initial={{ width: 0 }} animate={{ width: `${scoreStructure}%` }} className="h-full bg-green-500 rounded-full" />
                                                </div>

                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-600 dark:text-slate-300">Mots-clés</span>
                                                    <span className="font-bold text-green-600">{scoreKeywords}%</span>
                                                </div>
                                                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                                    <motion.div initial={{ width: 0 }} animate={{ width: `${scoreKeywords}%` }} className="h-full bg-green-500 rounded-full" />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* The CV */}
                            <div
                                ref={cvRef}
                                className="shadow-2xl transition-all duration-300 origin-top-center bg-white"
                                style={{
                                    transform: `scale(${getScale()})`,
                                    marginBottom: isFullscreen ? '-50px' : '-180px'
                                }}
                            >
                                <TemplateComponent data={cvData} includePhoto={true} dense={isCompact} />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0 print:hidden bg-white dark:bg-slate-800 z-30">
                        <div className="flex items-center gap-4">
                            <p className="text-xs text-slate-400 hidden sm:block">
                                💡 Touches fléchées pour naviguer • F pour plein écran
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
                                disabled={isGenerating || isScanning}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Génération...
                                    </>
                                ) : (
                                    <>
                                        <Download className="mr-2 h-4 w-4" />
                                        Export PDF HD
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
