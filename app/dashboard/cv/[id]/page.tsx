"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase";
import { Loader2, Download, ArrowLeft, RefreshCw, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import CVRenderer from "@/components/cv/CVRenderer";
import { TemplateSelector } from "@/components/cv/TemplateSelector";
import { TEMPLATES } from "@/components/cv/templates";
import Link from "next/link";

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

    // PDF generation using html2pdf.js (produces real text PDFs, not images)
    const [generatingPDF, setGeneratingPDF] = useState(false);

    const handleDownloadPDF = async () => {
        if (!cvGeneration) return;

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
            alert('Erreur lors de la génération du PDF');
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
                        <Link href="/dashboard/tracking" className="text-slate-500 hover:text-slate-900 dark:hover:text-white">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="font-bold text-base sm:text-lg dark:text-white">Aperçu du CV</h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Template: {templateInfo?.name || currentTemplate}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setTemplateSelectorOpen(true)}
                            className="dark:border-slate-700 dark:text-slate-300"
                        >
                            <RefreshCw className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline">Changer</span>
                        </Button>
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
                                    <span className="hidden sm:inline">Télécharger PDF</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

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
