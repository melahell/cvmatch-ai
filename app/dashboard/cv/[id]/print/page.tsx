"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import { StandardTemplate } from "@/components/cv/StandardTemplate";

export default function CVPrintPage() {
    const { id } = useParams();
    const searchParams = useSearchParams();
    const format = searchParams.get("format") || "A4"; // A4 or Letter
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
        <>
            <StandardTemplate data={cvData} />

            <style jsx global>{`
                @page {
                    margin: 0;
                    size: ${format === "Letter" ? "Letter" : "A4"};
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
                    overflow: hidden;
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

                /* Optimize font rendering */
                body {
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                }
            `}</style>
        </>
    );
}
