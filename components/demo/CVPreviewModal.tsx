"use client";

import { X, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DemoCV } from "@/lib/data/demo/types";
import { Button } from "@/components/ui/button";

interface CVPreviewModalProps {
    cv: DemoCV;
    characterName: string;
    onClose: () => void;
}

export function CVPreviewModal({ cv, characterName, onClose }: CVPreviewModalProps) {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                CV {cv.templateName} - {characterName}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {cv.templateDescription}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            <X className="h-5 w-5 text-slate-500" />
                        </button>
                    </div>

                    {/* Preview */}
                    <div className="p-4 overflow-auto max-h-[60vh] bg-slate-100 dark:bg-slate-900">
                        <div className="aspect-[210/297] bg-white rounded-lg shadow-lg mx-auto max-w-md flex items-center justify-center">
                            <div className="text-center text-slate-400">
                                <span className="text-6xl block mb-4">📄</span>
                                <p className="text-sm">Preview du CV {cv.templateName}</p>
                                <p className="text-xs mt-2">(Image à générer)</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
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
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
