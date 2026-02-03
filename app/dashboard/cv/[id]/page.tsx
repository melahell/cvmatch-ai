"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { createSupabaseClient, getSupabaseAuthHeader } from "@/lib/supabase";
import { Loader2, Download, ArrowLeft, RefreshCw, FileText, AlertTriangle, Info, Sparkles, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { ALL_TEMPLATES } from "@/components/cv/templates";
import { CVOptimizationExplainer, computeExperienceSummary } from "@/components/cv/CVOptimizationExplainer";
import Link from "next/link";
import { logger } from "@/lib/utils/logger";
import ContextualLoader from "@/components/loading/ContextualLoader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const CVRenderer = dynamic(() => import("@/components/cv/CVRenderer"), {
    loading: () => <div className="flex items-center justify-center p-12"><LoadingSpinner /></div>,
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
    const [showTemplateMenu, setShowTemplateMenu] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState<string>("modern");
    const [currentIncludePhoto, setCurrentIncludePhoto] = useState<boolean>(true);
    const [format, setFormat] = useState<"A4" | "Letter">("A4");
    const [showFormatMenu, setShowFormatMenu] = useState(false);
    const cvRef = useRef<HTMLDivElement>(null);
    const [generatingPDF, setGeneratingPDF] = useState(false);
    const pdfAbortRef = useRef<AbortController | null>(null);

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
                logger.error("CV fetch error", { error });
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
        const isLikelySignedUrl = (value: string) => {
            try {
                const url = new URL(value);
                return url.searchParams.has("token") || url.searchParams.has("X-Amz-Signature");
            } catch {
                return false;
            }
        };
        const hasHttpPhoto =
            typeof currentPhoto === "string" &&
            (currentPhoto.startsWith("http://") || currentPhoto.startsWith("https://"));
        if (hasHttpPhoto && !isLikelySignedUrl(currentPhoto)) return;

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

    // PDF generation via server-side Puppeteer (high quality)
    const handleDownloadPDF = useCallback(async () => {
        if (!cvGeneration || generatingPDF) return;

        setGeneratingPDF(true);
        try {
            pdfAbortRef.current?.abort();
            const controller = new AbortController();
            pdfAbortRef.current = controller;
            performance.mark("cv_pdf_start");
            const authHeaders = await getSupabaseAuthHeader();
            const params = new URLSearchParams({
                format,
                template: currentTemplate,
                photo: currentIncludePhoto ? "true" : "false",
            });

            const res = await fetch(`/api/cv/${id}/pdf?${params.toString()}`, {
                method: "GET",
                headers: authHeaders,
                signal: controller.signal,
            });

            if (!res.ok) {
                throw new Error(`PDF generation failed: ${res.status}`);
            }

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `CV_${cvGeneration.cv_data?.profil?.prenom || ""}_${cvGeneration.cv_data?.profil?.nom || "Document"}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error: any) {
            if (error?.name === "AbortError") {
                return;
            }
            logger.error("PDF Error", { error });
            // Fallback: open print page in new tab
            window.open(`/dashboard/cv/${id}/print?format=${format}&template=${currentTemplate}`, "_blank");
        } finally {
            try { performance.mark("cv_pdf_end"); performance.measure("cv_pdf", "cv_pdf_start", "cv_pdf_end"); } catch {}
            pdfAbortRef.current = null;
            setGeneratingPDF(false);
        }
    }, [cvGeneration, generatingPDF, id, format, currentTemplate, currentIncludePhoto]);

    const handleTemplateChange = (templateId: string) => {
        setCurrentTemplate(templateId);
        setShowTemplateMenu(false);
    };

    const templateInfo = ALL_TEMPLATES.find(t => t.id === currentTemplate);

    // Extract CDC metadata if available
    const cvMetadata = cvGeneration?.cv_data?.cv_metadata;
    const qualityScore = cvMetadata?.ats_score;
    const compressionLevel = cvMetadata?.compression_level_applied || 0;
    const pageCount = cvMetadata?.page_count || 1;
    const seniorityLevel = cvMetadata?.seniority_level;

    // V2 Widgets metadata
    const isV2 = cvMetadata?.generator_type === "v2_widgets";
    const widgetsTotal = cvMetadata?.widgets_total;
    const widgetsFiltered = cvMetadata?.widgets_filtered;

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <LoadingSpinner text="Chargement du CV..." fullScreen={false} />
            </div>
        );
    }

    if (!cvGeneration) {
        return <div className="text-center p-20">CV Introuvable</div>;
    }

    const pageWidth = format === "Letter" ? "215.9mm" : "210mm";

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 pb-20">
            {generatingPDF && (
                <ContextualLoader
                    context="exporting-pdf"
                    isOverlay
                    onCancel={() => pdfAbortRef.current?.abort()}
                />
            )}

            {/* Navbar (Hidden in Print) */}
            <div className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 sticky top-0 z-10 print:hidden">
                <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard/tracking" className="text-slate-600 hover:text-slate-900 dark:hover:text-white">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="font-bold text-base sm:text-lg dark:text-white">Apercu du CV</h1>
                            <p className="text-xs text-slate-600 dark:text-slate-600">
                                Template: {templateInfo?.name || currentTemplate} | {format}
                            </p>
                        </div>
                    </div>

                    {/* Quality & Page Indicators */}
                    <div className="hidden md:flex items-center gap-3">
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

                        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${pageCount === 1 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                            <FileText className="w-3 h-3" />
                            {pageCount} page{pageCount > 1 ? 's' : ''}
                        </div>

                        {compressionLevel > 0 && (
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                                <AlertTriangle className="w-3 h-3" />
                                Compression {compressionLevel}
                            </div>
                        )}

                        {seniorityLevel && (
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                <Info className="w-3 h-3" />
                                {seniorityLevel.charAt(0).toUpperCase() + seniorityLevel.slice(1)}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        {/* Format selector */}
                        <div className="relative">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setShowFormatMenu(!showFormatMenu); setShowTemplateMenu(false); }}
                                className="dark:border-slate-700 dark:text-slate-300"
                            >
                                <Printer className="w-4 h-4 sm:mr-2" />
                                <span className="hidden sm:inline">{format}</span>
                            </Button>
                            {showFormatMenu && (
                                <div className="absolute top-full right-0 mt-1 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg shadow-lg p-2 z-20 min-w-[120px]">
                                    {(["A4", "Letter"] as const).map((f) => (
                                        <button
                                            key={f}
                                            onClick={() => { setFormat(f); setShowFormatMenu(false); }}
                                            className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                                                format === f
                                                    ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium"
                                                    : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                                            }`}
                                        >
                                            {f} {f === "A4" ? "(210x297mm)" : "(8.5x11in)"}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Template selector */}
                        <div className="relative">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setShowTemplateMenu(!showTemplateMenu); setShowFormatMenu(false); }}
                                className="dark:border-slate-700 dark:text-slate-300"
                            >
                                <RefreshCw className="w-4 h-4 sm:mr-2" />
                                <span className="hidden sm:inline">Template</span>
                            </Button>
                            {showTemplateMenu && (
                                <div className="absolute top-full right-0 mt-1 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg shadow-lg p-2 z-20 min-w-[200px] max-h-[400px] overflow-y-auto">
                                    {ALL_TEMPLATES.filter(t => t.available).map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => handleTemplateChange(t.id)}
                                            className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                                                currentTemplate === t.id
                                                    ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium"
                                                    : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                                            }`}
                                        >
                                            <span>{t.name}</span>
                                            <span className="ml-2 text-xs text-slate-400">{t.category}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <Link href={`/dashboard/cvs/${id}/edit`}>
                            <Button
                                variant="outline"
                                size="sm"
                                className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-300"
                            >
                                <FileText className="w-4 h-4 sm:mr-2" />
                                <span className="hidden sm:inline">Editer</span>
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
                                    <Loader2 className="w-4 h-4 sm:mr-2 animate-spin motion-reduce:animate-none" />
                                    <span className="hidden sm:inline">Generation...</span>
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
                <div className="container mx-auto px-4 pt-6 print:hidden" style={{ maxWidth: pageWidth }}>
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

            {/* CV Preview Area — Live preview with instant template switching */}
            <div className="container mx-auto py-8 print:p-0" ref={cvRef}>
                <div
                    className="mx-auto print:max-w-none print:mx-0"
                    style={{
                        width: pageWidth,
                        maxWidth: '100%'
                    }}
                >
                    <CVRenderer
                        data={cvGeneration.cv_data}
                        templateId={currentTemplate}
                        includePhoto={currentIncludePhoto}
                        format={format}
                    />
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        size: ${format === "Letter" ? "Letter" : "A4"};
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
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                }
            `}</style>
        </div>
    );
}
