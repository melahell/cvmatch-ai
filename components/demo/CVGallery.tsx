"use client";

import { Download, Star, Eye, Zap, FileText, Sparkles, Target } from "lucide-react";
import { DemoCV } from "@/lib/data/demo/types";
import { RAGComplete } from "@/types/rag-complete";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
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

// ATS scores for each template type
const TEMPLATE_ATS_SCORES: Record<string, number> = {
    'modern': 92,
    'classic': 88,
    'creative': 75,
    'tech': 95,
};

// Template icons
const TEMPLATE_ICONS: Record<string, React.ReactNode> = {
    'modern': <Sparkles className="h-4 w-4" />,
    'classic': <FileText className="h-4 w-4" />,
    'creative': <Star className="h-4 w-4" />,
    'tech': <Target className="h-4 w-4" />,
};

export function CVGallery({ cvs, characterName, ragData }: CVGalleryProps) {
    const [previewCV, setPreviewCV] = useState<DemoCV | null>(null);
    const [loaded, setLoaded] = useState(false);

    // Convert RAG data for thumbnail previews
    const cvData = ragToCVData(ragData);

    // Animation delay
    useEffect(() => {
        const timer = setTimeout(() => setLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Helper to get recommended template based on character
    const getRecommendedTemplates = () => {
        const templates = cvs.filter(cv => cv.recommended);
        return templates.length > 0 ? templates.map(t => t.templateName).join(' et ') : 'Standard';
    };

    // Get ATS badge color
    const getATSColor = (score: number) => {
        if (score >= 90) return 'bg-green-500 text-white';
        if (score >= 80) return 'bg-emerald-500 text-white';
        return 'bg-amber-500 text-white';
    };

    return (
        <>
            <section className="py-12">
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl">📄</span>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        4 CVs Professionnels
                    </h2>
                    <Badge variant="success" className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        Téléchargement instantané
                    </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {cvs.map((cv, index) => {
                        const TemplateComponent = getTemplateComponent(cv.templateId);
                        const atsScore = TEMPLATE_ATS_SCORES[cv.templateId] || 85;
                        const TemplateIcon = TEMPLATE_ICONS[cv.templateId];

                        return (
                            <div
                                key={cv.templateId}
                                className={`group relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-500 transform ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                                    }`}
                                style={{ transitionDelay: `${index * 100}ms` }}
                            >
                                {/* Mini CV Preview */}
                                <div
                                    className="aspect-[210/297] bg-slate-50 dark:bg-slate-700 relative overflow-hidden cursor-pointer"
                                    onClick={() => setPreviewCV(cv)}
                                >
                                    {/* Skeleton while rendering */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 animate-pulse" />

                                    {/* Actual mini CV render */}
                                    <div
                                        className="absolute inset-0 z-10"
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

                                    {/* ATS Score badge */}
                                    <div className="absolute top-3 left-3 z-20">
                                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold shadow-lg ${getATSColor(atsScore)}`}>
                                            <Zap className="h-3 w-3" />
                                            ATS {atsScore}%
                                        </div>
                                    </div>

                                    {/* Recommended badge */}
                                    {cv.recommended && (
                                        <div className="absolute top-3 right-3 z-20">
                                            <Badge variant="primary" className="flex items-center gap-1 shadow-lg">
                                                <Star className="h-3 w-3" />
                                                Recommandé
                                            </Badge>
                                        </div>
                                    )}

                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 z-30 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end pb-8">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPreviewCV(cv);
                                            }}
                                            className="shadow-lg transform group-hover:scale-105 transition-transform"
                                        >
                                            <Eye className="mr-2 h-4 w-4" />
                                            Voir en grand
                                        </Button>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-indigo-500">{TemplateIcon}</span>
                                        <h3 className="font-semibold text-slate-900 dark:text-white">
                                            {cv.templateName}
                                        </h3>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                                        {cv.templateDescription}
                                    </p>

                                    {/* Opens modal for PDF generation */}
                                    <Button
                                        size="sm"
                                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                                        onClick={() => setPreviewCV(cv)}
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        Télécharger PDF
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-800/50 rounded-xl border border-indigo-100 dark:border-slate-700">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                            <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
                                Score ATS (Applicant Tracking System)
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                                Le score ATS indique la compatibilité du template avec les logiciels de recrutement.
                                Le template <strong>Tech</strong> (95%) est optimisé pour les ATS, tandis que le <strong>Créatif</strong> (75%)
                                privilégie le design. Les templates <strong>{getRecommendedTemplates()}</strong> sont recommandés pour ce profil.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modal with real PDF generation */}
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
