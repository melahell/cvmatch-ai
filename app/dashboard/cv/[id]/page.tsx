"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase";
import { Loader2, Printer, Download, ArrowLeft, RefreshCw } from "lucide-react";
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

    useEffect(() => {
        const supabase = createSupabaseClient();
        async function fetchCV() {
            if (!id) return;

            const { data, error } = await supabase
                .from("cv_generations")
                .select("id, cv_data, template_name, include_photo, job_analysis_id")
                .eq("id", id)
                .single();

            if (data) {
                setCvGeneration(data);
                setCurrentTemplate(data.template_name || "modern");
                setCurrentIncludePhoto(data.include_photo ?? true);
            }
            setLoading(false);
        }
        fetchCV();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    const handleTemplateChange = (templateId: string, includePhoto: boolean) => {
        setCurrentTemplate(templateId);
        setCurrentIncludePhoto(includePhoto);
        setTemplateSelectorOpen(false);
    };

    // Get current template info
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
                        <Button variant="outline" size="sm" onClick={handlePrint} className="dark:border-slate-700 dark:text-slate-300">
                            <Download className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline">PDF</span>
                        </Button>
                        <Button size="sm" onClick={handlePrint}>
                            <Printer className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline">Imprimer</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* CV Preview Area */}
            <div className="container mx-auto py-8 print:p-0">
                <div className="max-w-[210mm] mx-auto print:max-w-none print:mx-0">
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
                    @page { size: A4; margin: 0; }
                    body { background: white; margin: 0; padding: 0; }
                    .print\\:hidden { display: none !important; }
                    .cv-page { box-shadow: none !important; }
                }
            `}</style>
        </div>
    );
}
