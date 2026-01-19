"use client";

import { Download, Star, Eye } from "lucide-react";
import { DemoCV } from "@/lib/data/demo/types";
import { RAGComplete } from "@/types/rag-complete";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { CVPreviewModal } from "./CVPreviewModal";
import { ragToCVData } from "@/lib/utils/rag-to-cv-data";

// Import templates for thumbnail previews
import ModernTemplate from "@/components/cv/templates/ModernTemplate";
import ClassicTemplate from "@/components/cv/templates/ClassicTemplate";
import CreativeTemplate from "@/components/cv/templates/CreativeTemplate";
import TechTemplate from "@/components/cv/templates/TechTemplate";

interface CVGalleryProps {
    cvs: DemoCV[];
    characterName: string;
    ragData: RAGComplete;
}

export function CVGallery({ cvs, characterName, ragData }: CVGalleryProps) {
    const [previewCV, setPreviewCV] = useState<DemoCV | null>(null);

    // Convert RAG data for thumbnail previews
    const cvData = ragToCVData(ragData);

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
                    {cvs.map((cv) => {
                        const TemplateComponent = getTemplateComponent(cv.templateId);

                        return (
                            <div
                                key={cv.templateId}
                                className="group relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300"
                            >
                                {/* Mini CV Preview */}
                                <div
                                    className="aspect-[210/297] bg-slate-50 dark:bg-slate-700 relative overflow-hidden cursor-pointer"
                                    onClick={() => setPreviewCV(cv)}
                                >
                                    {/* Actual mini CV render */}
                                    <div
                                        className="absolute inset-0"
                                        style={{
                                            transform: 'scale(0.18)',
                                            transformOrigin: 'top left',
                                            width: '555%',
                                            height: '555%',
                                            pointerEvents: 'none'
                                        }}
                                    >
                                        <TemplateComponent data={cvData} includePhoto={true} />
                                    </div>

                                    {/* Recommended badge */}
                                    {cv.recommended && (
                                        <div className="absolute top-3 right-3 z-10">
                                            <Badge variant="primary" className="flex items-center gap-1 shadow-lg">
                                                <Star className="h-3 w-3" />
                                                Recommandé
                                            </Badge>
                                        </div>
                                    )}

                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-8">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPreviewCV(cv);
                                            }}
                                            className="shadow-lg"
                                        >
                                            <Eye className="mr-2 h-4 w-4" />
                                            Voir en grand
                                        </Button>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-4">
                                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                                        {cv.templateName}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
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
                        );
                    })}
                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400 mt-6 text-center">
                    💡 Cliquez sur un CV pour l'afficher en grand. Les templates <strong>Standard</strong> et <strong>Créatif</strong> sont
                    les plus adaptés à ce profil.
                </p>
            </section>

            {/* Modal */}
            {previewCV && (
                <CVPreviewModal
                    cv={previewCV}
                    characterName={characterName}
                    ragData={ragData}
                    onClose={() => setPreviewCV(null)}
                    allCVs={cvs}
                    onNavigate={(cv) => setPreviewCV(cv)}
                />
            )}
        </>
    );
}

/**
 * Get template component by ID
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
