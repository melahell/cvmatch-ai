"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import CVRenderer from "@/components/cv/CVRenderer";
import { createSupabaseClient } from "@/lib/supabase";

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
        const supabase = createSupabaseClient();
        async function fetchCV() {
            if (!id) return;

            const { data: authData } = await supabase.auth.getUser();
            const user = authData.user;
            if (!user) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from("cv_generations")
                .select("cv_data")
                .eq("id", id)
                .eq("user_id", user.id)
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
                    text-rendering: optimizeLegibility;
                }

                /* Ensure all elements have explicit colors for PDF */
                * {
                    -webkit-box-decoration-break: clone;
                    box-decoration-break: clone;
                }

                /* Fix gradient backgrounds in PDF */
                .bg-gradient-to-r,
                .bg-gradient-to-l,
                .bg-gradient-to-t,
                .bg-gradient-to-b,
                .bg-gradient-to-br,
                .bg-gradient-to-bl,
                .bg-gradient-to-tr,
                .bg-gradient-to-tl {
                    -webkit-print-color-adjust: exact !important;
                }
            `}</style>
        </>
    );
}
