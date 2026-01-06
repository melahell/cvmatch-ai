"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import CVRenderer from "@/components/cv/CVRenderer";

export default function CVPrintPage() {
    const { id } = useParams();
    const searchParams = useSearchParams();
    const format = searchParams.get("format") || "A4"; // A4 or Letter
    const template = searchParams.get("template") || "modern";
    const includePhoto = searchParams.get("photo") !== "false";
    const [loading, setLoading] = useState(true);
    const [cvData, setCvData] = useState<any>(null);
    const [rendered, setRendered] = useState(false);

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

    // Signal when CV is fully rendered (for Puppeteer detection)
    useEffect(() => {
        if (!loading && cvData) {
            // Wait for fonts and images to load
            if (document.fonts) {
                document.fonts.ready.then(() => {
                    // Add small delay for final layout calculations
                    setTimeout(() => {
                        setRendered(true);
                        // Set a global flag that Puppeteer can detect
                        (window as any).__CV_RENDER_COMPLETE__ = true;
                        console.log('✅ CV Render Complete');
                    }, 500);
                });
            } else {
                // Fallback if Font Loading API not available
                setTimeout(() => {
                    setRendered(true);
                    (window as any).__CV_RENDER_COMPLETE__ = true;
                    console.log('✅ CV Render Complete (fallback)');
                }, 1500);
            }
        }
    }, [loading, cvData]);

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
            {/* Hidden indicator for Puppeteer */}
            <div
                id="cv-render-status"
                data-ready={rendered ? 'true' : 'false'}
                style={{ display: 'none' }}
            />

            <CVRenderer
                data={cvData}
                templateId={template}
                includePhoto={includePhoto}
            />

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

                html, body {
                    margin: 0;
                    padding: 0;
                    background: white;
                }

                /* CV container - force exact A4 size */
                .cv-page {
                    width: 210mm !important;
                    height: 297mm !important;
                    max-height: 297mm !important;
                    overflow: hidden !important;
                    page-break-after: avoid !important;
                    page-break-inside: avoid !important;
                }

                /* Prevent ANY element from breaking across pages */
                section, div, aside, main, ul, li, p, h1, h2, h3, h4, span {
                    break-inside: avoid !important;
                    page-break-inside: avoid !important;
                }

                /* Force everything to stay on page 1 */
                @media print {
                    html, body {
                        height: 297mm;
                        overflow: hidden;
                    }
                    
                    .cv-page {
                        height: 297mm !important;
                        page-break-after: always;
                    }
                }

                /* Optimize font rendering for PDF */
                body {
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                    text-rendering: geometricPrecision;
                    font-family: Arial, Helvetica, sans-serif;
                }

                /* Ensure text doesn't get cut */
                .truncate {
                    text-overflow: clip !important;
                    overflow: visible !important;
                }
            `}</style>
        </>
    );
}
