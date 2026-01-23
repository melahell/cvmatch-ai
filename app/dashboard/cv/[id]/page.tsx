"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { createSupabaseClient, getSupabaseAuthHeader } from "@/lib/supabase";
import { Loader2, Download, ArrowLeft, RefreshCw, FileText, CheckCircle, AlertTriangle, Info, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { TemplateSelector } from "@/components/cv/TemplateSelector";
import { TEMPLATES } from "@/components/cv/templates";
import { CVOptimizationExplainer, computeExperienceSummary } from "@/components/cv/CVOptimizationExplainer";
import Link from "next/link";

const CVRenderer = dynamic(() => import("@/components/cv/CVRenderer"), {
    loading: () => <div className="flex items-center justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>,
    ssr: false
});

interface CVGeneration {
    id: string;
    cv_data: any;
    template_name: string;
    include_photo: boolean;
    job_analysis_id?: string;
}

export default function CVViewPage() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [cvGeneration, setCvGeneration] = useState<CVGeneration | null>(null);
    const [templateSelectorOpen, setTemplateSelectorOpen] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState<string>("modern");
    const [currentIncludePhoto, setCurrentIncludePhoto] = useState<boolean>(true);
    const cvRef = useRef<HTMLDivElement>(null);
    const [generatingPDF, setGeneratingPDF] = useState(false);

    useEffect(() => {
        const supabase = createSupabaseClient();
        async function fetchCV() {
            if (!id) return;

            const { data, error } = await supabase
                .from("cv_generations")
                .select("id, cv_data, template_name, job_analysis_id")
                .eq("id", id)
                .single();

            if (error) {
                console.error("CV fetch error:", error);
            }

            if (data) {
                setCvGeneration({
                    ...data,
                    include_photo: true
                });
                setCurrentTemplate(data.template_name || "modern");
                setCurrentIncludePhoto(true);
            }
            setLoading(false);
        }
        fetchCV();
    }, [id]);

    const cvPhoto = cvGeneration?.cv_data?.profil?.photo_url as string | undefined;

    useEffect(() => {
        if (!currentIncludePhoto) return;
        if (!cvGeneration) return;

        const currentPhoto = cvPhoto;
        const hasHttpPhoto =
            typeof currentPhoto === "string" &&
            (currentPhoto.startsWith("http://") || currentPhoto.startsWith("https://"));
        if (hasHttpPhoto) return;

        let cancelled = false;

        const loadPhoto = async () => {
            try {
                const authHeaders = await getSupabaseAuthHeader();

                const init: RequestInit = {
                    method: "GET",
                    credentials: "include",
                };
                if (Object.keys(authHeaders).length > 0) {
                    init.headers = authHeaders;
                }

                const res = await fetch("/api/profile/photo", init);
                if (!res.ok) return;
                const payload = await res.json();
                const photoUrl = payload?.photo_url as string | null | undefined;
                if (!photoUrl) return;
                if (cancelled) return;

                setCvGeneration((prev) => {
                    if (!prev) return prev;

                    const prevPhoto = (prev as any)?.cv_data?.profil?.photo_url as string | undefined;
                    const prevHasHttp =
                        typeof prevPhoto === "string" &&
                        (prevPhoto.startsWith("http://") || prevPhoto.startsWith("https://"));
                    if (prevHasHttp) return prev;

                    const next = { ...prev } as any;
                    next.cv_data = { ...(prev as any).cv_data };
                    next.cv_data.profil = { ...((prev as any).cv_data?.profil || {}) };
                    next.cv_data.profil.photo_url = photoUrl;
                    return next;
                });
            } catch {
                return;
            }
        };

        loadPhoto();

        return () => {
            cancelled = true;
        };
    }, [cvGeneration, cvGeneration?.id, currentIncludePhoto, cvPhoto]);

    // PDF generation with html2pdf.js and fallback to window.print()
    const handleDownloadPDF = async () => {
        if (!cvGeneration || generatingPDF) return;

        setGeneratingPDF(true);
        try {
            const html2pdf = (await import('html2pdf.js')).default;

            const element = document.querySelector('.cv-page') as HTMLElement;
            if (!element) {
                throw new Error('CV element not found');
            }

            const options = {
                margin: 0,
                filename: `CV_${cvGeneration.cv_data?.profil?.nom || 'Document'}.pdf`,
                image: { type: 'jpeg' as const, quality: 1 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    letterRendering: true,
                    logging: false
                },
                jsPDF: {
                    unit: 'mm' as const,
                    format: 'a4' as const,
                    orientation: 'portrait' as const
                }
            };

            await html2pdf().set(options).from(element).save();
        } catch (error) {
            console.error('PDF Error:', error);
            // Fallback silencieux vers l'impression du navigateur
            console.warn('Fallback vers impression navigateur');
            window.print();
        } finally {
            setGeneratingPDF(false);
        }
    };

    const handleTemplateChange = (templateId: string, includePhoto: boolean) => {
        setCurrentTemplate(templateId);
        setCurrentIncludePhoto(includePhoto);
        setTemplateSelectorOpen(false);
    };

    const templateInfo = TEMPLATES.find(t => t.id === currentTemplate);

    // Extract CDC metadata if available
    const cvMetadata = cvGeneration?.cv_data?.cv_metadata;

    // DEBUG: Log metadata to see what's available
    console.log("[CV DEBUG] cv_metadata:", JSON.stringify(cvMetadata, null, 2));
    console.log("[CV DEBUG] formats_used:", cvMetadata?.formats_used);
    console.log("[CV DEBUG] job_title:", cvMetadata?.job_title);
    console.log("[CV DEBUG] relevance_scoring_applied:", cvMetadata?.relevance_scoring_applied);

    const qualityScore = cvMetadata?.ats_score;
    const compressionLevel = cvMetadata?.compression_level_applied || 0;
    const pageCount = cvMetadata?.page_count || 1;
    const seniorityLevel = cvMetadata?.seniority_level;
    
    // V2 Widgets metadata
    const isV2 = cvMetadata?.generator_type === "v2_widgets";
    const widgetsTotal = cvMetadata?.widgets_total;
    const widgetsFiltered = cvMetadata?.widgets_filtered;

    // Quality score badge color
    const getScoreColor = (score: number | undefined) => {
        if (!score) return 'bg-gray-100 text-gray-600';
        if (score >= 80) return 'bg-green-100 text-green-700';
        if (score >= 60) return 'bg-yellow-100 text-yellow-700';
        return 'bg-red-100 text-red-700';
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!cvGeneration) {
        return <div className="text-center p-20">CV Introuvable</div>;
    }

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 pb-20">

            {/* Navbar (Hidden in Print) */}
            <div className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 sticky top-0 z-10 print:hidden">
                <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard/tracking" className="text-slate-600 hover:text-slate-900 dark:hover:text-white">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="font-bold text-base sm:text-lg dark:text-white">Aperçu du CV</h1>
                            <p className="text-xs text-slate-600 dark:text-slate-600">
                                Template: {templateInfo?.name || currentTemplate}
                            </p>
                        </div>
                    </div>

                    {/* Quality & Page Indicators */}
                    <div className="hidden md:flex items-center gap-3">
                        {/* V2 Widgets Badge */}
                        {isV2 && (
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 border border-indigo-200">
                                <Sparkles className="w-3 h-3" />
                                V2 Widgets
                                {widgetsTotal !== undefined && widgetsFiltered !== undefined && (
                                    <span className="ml-1 text-indigo-600">
                                        ({widgetsFiltered}/{widgetsTotal})
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Page Count Badge */}
                        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${pageCount === 1 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                            <FileText className="w-3 h-3" />
                            {pageCount} page{pageCount > 1 ? 's' : ''}
                        </div>

                        {/* Compression Indicator */}
                        {compressionLevel > 0 && (
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                                <AlertTriangle className="w-3 h-3" />
                                Compression {compressionLevel}
                            </div>
                        )}

                        {/* Seniority Badge */}
                        {seniorityLevel && (
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                <Info className="w-3 h-3" />
                                {seniorityLevel.charAt(0).toUpperCase() + seniorityLevel.slice(1)}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setTemplateSelectorOpen(true)}
                            className="dark:border-slate-700 dark:text-slate-300"
                        >
                            <RefreshCw className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline">Template</span>
                        </Button>
                        <Link href={`/dashboard/cvs/${id}/edit`}>
                            <Button
                                variant="outline"
                                size="sm"
                                className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-300"
                            >
                                <FileText className="w-4 h-4 sm:mr-2" />
                                <span className="hidden sm:inline">Éditer</span>
                            </Button>
                        </Link>
                        <Button
                            size="sm"
                            onClick={handleDownloadPDF}
                            disabled={generatingPDF}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                        >
                            {generatingPDF ? (
                                <>
                                    <Loader2 className="w-4 h-4 sm:mr-2 animate-spin" />
                                    <span className="hidden sm:inline">Génération...</span>
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4 sm:mr-2" />
                                    <span className="hidden sm:inline">PDF</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Mobile Indicators */}
                <div className="md:hidden flex items-center justify-center gap-2 pb-2 px-4">
                    {isV2 && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 border border-indigo-200">
                            <Sparkles className="w-3 h-3" />
                            V2
                        </div>
                    )}
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${pageCount === 1 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                        <FileText className="w-3 h-3" />
                        {pageCount}p
                    </div>
                    {compressionLevel > 0 && (
                        <div className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                            C{compressionLevel}
                        </div>
                    )}
                    {seniorityLevel && (
                        <div className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                            {seniorityLevel.slice(0, 3).toUpperCase()}
                        </div>
                    )}
                </div>
            </div>

            {/* CV Optimization Explainer Accordion */}
            {cvMetadata && (
                <div className="container mx-auto px-4 pt-6 print:hidden" style={{ maxWidth: '210mm' }}>
                    <CVOptimizationExplainer
                        warnings={cvMetadata.warnings || []}
                        experiencesSummary={cvMetadata.formats_used ? {
                            total: (cvMetadata.formats_used.detailed || 0) + (cvMetadata.formats_used.standard || 0) +
                                (cvMetadata.formats_used.compact || 0) + (cvMetadata.formats_used.minimal || 0),
                            detailed: cvMetadata.formats_used.detailed || 0,
                            standard: cvMetadata.formats_used.standard || 0,
                            compact: cvMetadata.formats_used.compact || 0,
                            minimal: cvMetadata.formats_used.minimal || 0,
                            excluded: 0,
                        } : computeExperienceSummary(cvGeneration.cv_data?.experiences || [])}
                        relevanceScoringApplied={cvMetadata.relevance_scoring_applied || false}
                        jobTitle={cvMetadata.job_title}
                        compressionLevel={compressionLevel}
                        dense={cvMetadata.dense || false}
                        isV2={isV2}
                        widgetsTotal={widgetsTotal}
                        widgetsFiltered={widgetsFiltered}
                    />
                </div>
            )}

            {/* CV Preview Area */}
            <div className="container mx-auto py-8 print:p-0" ref={cvRef}>
                <div
                    className="mx-auto print:max-w-none print:mx-0"
                    style={{
                        width: '210mm',
                        maxWidth: '100%'
                    }}
                >
                    <CVRenderer
                        data={cvGeneration.cv_data}
                        templateId={currentTemplate}
                        includePhoto={currentIncludePhoto}
                    />
                </div>
            </div>

            {/* Template Selector Modal */}
            <TemplateSelector
                isOpen={templateSelectorOpen}
                onClose={() => setTemplateSelectorOpen(false)}
                onSelect={handleTemplateChange}
                currentPhoto={cvGeneration.cv_data?.profil?.photo_url}
            />

            <style jsx global>{`
                @media print {
                    @page { 
                        size: A4; 
                        margin: 0; 
                    }
                    body { 
                        background: white; 
                        margin: 0; 
                        padding: 0; 
                    }
                    .print\\:hidden { 
                        display: none !important; 
                    }
                    .cv-page { 
                        box-shadow: none !important;
                        border-radius: 0 !important;
                        width: 210mm !important;
                        min-height: 297mm !important;
                        max-height: 297mm !important;
                        overflow: hidden !important;
                    }
                }
                
                /* Force A4 dimensions */
                .cv-page {
                    width: 210mm !important;
                    min-height: 297mm !important;
                    max-height: 297mm !important;
                    overflow: hidden !important;
                    box-sizing: border-box;
                }
            `}</style>
        </div>
    );
}
