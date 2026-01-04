
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Loader2, Printer, Download, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StandardTemplate } from "@/components/cv/StandardTemplate";
import Link from "next/link";

export default function CVViewPage() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [cvData, setCvData] = useState<any>(null);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [format, setFormat] = useState<"A4" | "Letter">("A4");

    useEffect(() => {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        async function fetchCV() {
            if (!id) return;

            const { data, error } = await supabase
                .from("cv_generations")
                .select("*")
                .eq("id", id)
                .single();

            if (data) {
                setCvData(data.cv_data);
            }
            setLoading(false);
        }
        fetchCV();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = async () => {
        try {
            setPdfLoading(true);
            const response = await fetch(`/api/cv/${id}/pdf?format=${format}`);

            if (!response.ok) {
                throw new Error("Failed to generate PDF");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `CV_${cvData?.profil?.nom || id}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Error downloading PDF:", error);
            alert("Erreur lors de la génération du PDF. Veuillez réessayer.");
        } finally {
            setPdfLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!cvData) {
        return <div className="text-center p-20">CV Introuvable</div>;
    }

    return (
        <div className="min-h-screen bg-slate-100 pb-20">

            {/* Navbar (Hidden in Print) */}
            <div className="bg-white border-b sticky top-0 z-10 print:hidden">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-slate-500 hover:text-slate-900">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="font-bold text-lg">Aperçu du CV</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={format}
                            onChange={(e) => setFormat(e.target.value as "A4" | "Letter")}
                            className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="A4">A4 (Europe)</option>
                            <option value="Letter">Letter (US)</option>
                        </select>
                        <Button
                            variant="outline"
                            onClick={handleDownloadPDF}
                            disabled={pdfLoading}
                        >
                            {pdfLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Génération...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4 mr-2" /> Télécharger PDF
                                </>
                            )}
                        </Button>
                        <Button onClick={handlePrint}>
                            <Printer className="w-4 h-4 mr-2" /> Imprimer
                        </Button>
                    </div>
                </div>
            </div>

            {/* CV Preview Area */}
            <div className="container mx-auto py-8 print:p-0">
                <div className="max-w-[210mm] mx-auto print:max-w-none print:mx-0">
                    <StandardTemplate data={cvData} />
                </div>
            </div>

            <style jsx global>{`
        @media print {
          @page {
            margin: 0;
            size: A4;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          body {
            background: white;
            margin: 0;
            padding: 0;
          }

          /* Hide non-printable elements */
          .print\\:hidden {
            display: none !important;
          }

          /* Remove shadows and adjust spacing for print */
          .print\\:shadow-none {
            box-shadow: none !important;
          }

          .print\\:m-0 {
            margin: 0 !important;
          }

          /* Prevent page breaks inside elements */
          .break-inside-avoid {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          /* Control orphans and widows */
          p, li, div {
            orphans: 3;
            widows: 3;
          }

          /* Prevent headings from being orphaned */
          h1, h2, h3, h4, h5, h6 {
            break-after: avoid !important;
            page-break-after: avoid !important;
          }

          /* Optimize font rendering for print */
          body {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
        }
      `}</style>
        </div>
    );
}
