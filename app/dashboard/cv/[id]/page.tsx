
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
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handlePrint}>
                            <Download className="w-4 h-4 mr-2" /> PDF
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
          @page { margin: 0; }
          body { background: white; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:m-0 { margin: 0 !important; }
        }
      `}</style>
        </div>
    );
}
