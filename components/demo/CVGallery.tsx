"use client";

import { Download, Star, Eye, Zap, FileText, Sparkles, Target, Info } from "lucide-react";
import { DemoCV } from "@/lib/data/demo/types";
import { RAGComplete } from "@/types/rag-complete";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useCallback } from "react";
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

// Template descriptions for tooltip
const TEMPLATE_DETAILS: Record<string, { pros: string[], ideal: string }> = {
    'modern': {
        pros: ["Design épuré", "Bonne lisibilité", "ATS compatible"],
        ideal: "Postes corporate, consulting, management"
    },
    'classic': {
        pros: ["Format traditionnel", "Sobre et formel", "Universel"],
        ideal: "Finance, droit, administration publique"
    },
    'creative': {
        pros: ["Design original", "Mise en page unique", "Mémorable"],
        ideal: "Design, marketing, communication, arts"
    },
    'tech': {
        pros: ["Focus compétences", "Score ATS max", "Sections techniques"],
        ideal: "Développeur, data scientist, DevOps"
    },
};

export function CVGallery({ cvs, characterName, ragData }: CVGalleryProps) {
    const [previewCV, setPreviewCV] = useState<DemoCV | null>(null);
    const [loaded, setLoaded] = useState(false);
    const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

    // Convert RAG data for thumbnail previews
    const cvData = ragToCVData(ragData);

    // Animation delay
    useEffect(() => {
        const timer = setTimeout(() => setLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Helper to get recommended template based on character
    const getRecommendedTemplates = useCallback(() => {
        const templates = cvs.filter(cv => cv.recommended);
        return templates.length > 0 ? templates.map(t => t.templateName).join(' et ') : 'Standard';
    }, [cvs]);

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
                        const templateDetails = TEMPLATE_DETAILS[cv.templateId];
                        const isHovered = hoveredTemplate === cv.templateId;

                        return (
                            <div
                                key={cv.templateId}
                                className={`group relative rounded-2xl border bg-white dark:bg-slate-800 overflow-hidden transition-all duration-500 transform ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                                    } ${isHovered
                                        ? 'shadow-2xl border-indigo-400 dark:border-indigo-500 scale-[1.02] z-10'
                                        : 'shadow-md border-slate-200 dark:border-slate-700 hover:shadow-xl'
                                    }`}
                                style={{ transitionDelay: `${index * 100}ms` }}
                                onMouseEnter={() => setHoveredTemplate(cv.templateId)}
                                onMouseLeave={() => setHoveredTemplate(null)}
                            >
                                {/* Mini CV Preview - Container with fixed aspect ratio */}
                                <div
                                    className="aspect-[210/297] bg-white relative overflow-hidden cursor-pointer"
                                    onClick={() => setPreviewCV(cv)}
                                >
                                    {/* CV render at scaled size */}
                                    <div
                                        className="absolute top-0 left-0 z-10 origin-top-left"
                                        style={{
                                            width: '210mm',
                                            minHeight: '297mm',
                                            transform: 'scale(0.35)', // Scaled up for better visibility
                                        }}
                                    >
                                        <TemplateComponent data={cvData} includePhoto={true} />
                                    </div>

                                    {/* ATS Score badge */}
                                    <div className="absolute top-2 left-2 z-20">
                                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold shadow-lg ${getATSColor(atsScore)}`}>
                                            <Zap className="h-2.5 w-2.5" />
                                            ATS {atsScore}%
                                        </div>
                                    </div>

                                    {/* Recommended badge */}
                                    {cv.recommended && (
                                        <div className="absolute top-2 right-2 z-20">
                                            <Badge variant="primary" className="flex items-center gap-1 shadow-lg text-[10px] px-2 py-0.5">
                                                <Star className="h-2.5 w-2.5" />
                                                Top
                                            </Badge>
                                        </div>
                                    )}

                                    {/* Hover overlay with quick info */}
                                    <div className={`absolute inset-0 z-30 bg-gradient-to-t from-black/90 via-black/50 to-black/20 transition-opacity duration-300 flex flex-col justify-end p-3 ${isHovered ? 'opacity-100' : 'opacity-0'
                                        }`}>
                                        {/* Quick template info */}
                                        {templateDetails && (
                                            <div className="mb-3 text-white">
                                                <div className="flex flex-wrap gap-1 mb-2">
                                                    {templateDetails.pros.slice(0, 2).map((pro, i) => (
                                                        <span key={i} className="text-[9px] bg-white/20 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
                                                            ✓ {pro}
                                                        </span>
                                                    ))}
                                                </div>
                                                <p className="text-[10px] text-white/80 line-clamp-2">
                                                    <span className="font-semibold">Idéal :</span> {templateDetails.ideal}
                                                </p>
                                            </div>
                                        )}

                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPreviewCV(cv);
                                            }}
                                            className="shadow-lg w-full text-xs h-8"
                                        >
                                            <Eye className="mr-1.5 h-3.5 w-3.5" />
                                            Voir en grand
                                        </Button>
                                    </div>
                                </div>

                                {/* Info section */}
                                <div className="p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-indigo-500">{TemplateIcon}</span>
                                        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                                            {cv.templateName}
                                        </h3>
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
                                        {cv.templateDescription}
                                    </p>

                                    {/* Opens modal for PDF generation */}
                                    <Button
                                        size="sm"
                                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white h-8 text-xs"
                                        onClick={() => setPreviewCV(cv)}
                                    >
                                        <Download className="mr-1.5 h-3.5 w-3.5" />
                                        Télécharger PDF
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ATS Explanation */}
                <div className="mt-8 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-800/50 rounded-xl border border-indigo-100 dark:border-slate-700">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex-shrink-0">
                            <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
                                Comprendre les scores ATS
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                                Le score ATS mesure la compatibilité avec les logiciels de recrutement.
                                Un score élevé augmente vos chances de passer le filtre automatique.
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Templates recommandés pour {characterName} : <strong>{getRecommendedTemplates()}</strong>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Keyboard hint */}
                <p className="text-xs text-slate-400 text-center mt-4">
                    💡 Dans la prévisualisation : <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px]">←</kbd> <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px]">→</kbd> naviguer • <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px]">F</kbd> plein écran
                </p>
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
