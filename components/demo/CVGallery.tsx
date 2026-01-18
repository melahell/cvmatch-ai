"use client";

import Link from "next/link";
import { ArrowLeft, Download, Star } from "lucide-react";
import { DemoCV } from "@/lib/data/demo/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { CVPreviewModal } from "./CVPreviewModal";

interface CVGalleryProps {
    cvs: DemoCV[];
    characterName: string;
}

export function CVGallery({ cvs, characterName }: CVGalleryProps) {
    const [previewCV, setPreviewCV] = useState<DemoCV | null>(null);

    return (
        <>
            <section className="py-12">
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl">📄</span>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        4 CVs Professionnels
                    </h2>
                    <Badge variant="success">Téléchargement instantané</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {cvs.map((cv) => (
                        <div
                            key={cv.templateId}
                            className="group relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden hover:shadow-lg transition-shadow"
                        >
                            {/* Preview image placeholder */}
                            <div className="aspect-[210/297] bg-slate-100 dark:bg-slate-700 relative">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center text-slate-400 dark:text-slate-500">
                                        <span className="text-4xl block mb-2">📄</span>
                                        <span className="text-xs">Preview CV</span>
                                    </div>
                                </div>

                                {/* Recommended badge */}
                                {cv.recommended && (
                                    <div className="absolute top-3 right-3">
                                        <Badge variant="primary" className="flex items-center gap-1">
                                            <Star className="h-3 w-3" />
                                            Recommandé
                                        </Badge>
                                    </div>
                                )}

                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setPreviewCV(cv)}
                                    >
                                        👁️ Aperçu
                                    </Button>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-4">
                                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                                    {cv.templateName}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                                    {cv.templateDescription}
                                </p>

                                <Button
                                    asChild
                                    size="sm"
                                    variant="outline"
                                    className="w-full"
                                >
                                    <a href={cv.pdfUrl} download>
                                        <Download className="mr-2 h-4 w-4" />
                                        Télécharger PDF
                                    </a>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400 mt-6 text-center">
                    💡 Les templates <strong>Standard</strong> et <strong>Créatif</strong> sont
                    les plus adaptés à ce profil artistique
                </p>
            </section>

            {/* Modal */}
            {previewCV && (
                <CVPreviewModal
                    cv={previewCV}
                    characterName={characterName}
                    onClose={() => setPreviewCV(null)}
                />
            )}
        </>
    );
}
