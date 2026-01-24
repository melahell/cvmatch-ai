"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { getSupabaseAuthHeader } from "@/lib/supabase";
import { logger } from "@/lib/utils/logger";

const CVRenderer = dynamic(() => import("@/components/cv/CVRenderer"), {
    loading: () => <div className="flex items-center justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>,
    ssr: false
});

export default function CVPrintPage() {
    const { id } = useParams();
    const searchParams = useSearchParams();
    const format = searchParams.get("format") || "A4"; // A4 or Letter
    const templateParam = searchParams.get("template");
    const includePhoto = searchParams.get("photo") !== "false";
    const [loading, setLoading] = useState(true);
    const [cvData, setCvData] = useState<any>(null);
    const [templateId, setTemplateId] = useState<string>("modern");
    const [rendered, setRendered] = useState(false);

    useEffect(() => {
        async function fetchCV() {
            if (!id) return;

            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
            if (!supabaseUrl || !anonKey) {
                setLoading(false);
                return;
            }

            const authHeaders = await getSupabaseAuthHeader();
            const headers: Record<string, string> = {
                apikey: anonKey,
            };
            if (authHeaders.Authorization) {
                headers.Authorization = authHeaders.Authorization;
            }

            const url = `${supabaseUrl}/rest/v1/cv_generations?id=eq.${id}&select=cv_data,template_name&limit=1`;
            const res = await fetch(url, { method: "GET", headers });
            if (res.ok) {
                const rows = (await res.json()) as Array<{ cv_data: any; template_name: string | null }>;
                const row = rows?.[0];
                if (row?.cv_data) {
                    setCvData(row.cv_data);
                    setTemplateId(templateParam || row.template_name || "modern");
                }
            }
            setLoading(false);
        }
        fetchCV();
    }, [id, templateParam]);

    useEffect(() => {
        if (!includePhoto) return;
        if (!cvData) return;

        const currentPhoto = cvData?.profil?.photo_url as string | undefined;
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
                setCvData((prev: any) => {
                    if (!prev) return prev;

                    const prevPhoto = prev?.profil?.photo_url as string | undefined;
                    const prevHasHttp =
                        typeof prevPhoto === "string" &&
                        (prevPhoto.startsWith("http://") || prevPhoto.startsWith("https://"));
                    if (prevHasHttp) return prev;

                    return { ...prev, profil: { ...(prev.profil || {}), photo_url: photoUrl } };
                });
            } catch {
                return;
            }
        };

        loadPhoto();

        return () => {
            cancelled = true;
        };
    }, [cvData?.profil?.photo_url, includePhoto, cvData]);

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
                        // Log only in development
                        logger.debug('CV Render Complete');
                    }, 500);
                });
            } else {
                // Fallback if Font Loading API not available
                setTimeout(() => {
                    setRendered(true);
                    (window as any).__CV_RENDER_COMPLETE__ = true;
                    // Log only in development
                    logger.debug('CV Render Complete (fallback)');
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
                templateId={templateId}
                includePhoto={includePhoto}
                dense={!!(cvData as any)?.cv_metadata?.dense}
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
