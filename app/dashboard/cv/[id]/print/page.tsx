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
    const format = (searchParams.get("format") || "A4") as "A4" | "Letter";
    const templateParam = searchParams.get("template");
    const includePhoto = searchParams.get("photo") !== "false";
    const customCSS = searchParams.get("css") || undefined;
    const autoPrint = searchParams.get("autoprint") === "1";
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
            const markReady = () => {
                setRendered(true);
                (window as any).__CV_RENDER_COMPLETE__ = true;
                logger.debug('CV Render Complete');
            };

            // Wait for fonts and images to load
            if (document.fonts) {
                document.fonts.ready.then(() => {
                    // Wait for all images in the CV to load too
                    const images = document.querySelectorAll('#cv-container img');
                    if (images.length === 0) {
                        setTimeout(markReady, 300);
                    } else {
                        Promise.all(
                            Array.from(images).map(img =>
                                (img as HTMLImageElement).complete
                                    ? Promise.resolve()
                                    : new Promise(resolve => {
                                        (img as HTMLImageElement).onload = resolve;
                                        (img as HTMLImageElement).onerror = resolve;
                                    })
                            )
                        ).then(() => setTimeout(markReady, 300));
                    }
                });
            } else {
                setTimeout(markReady, 1500);
            }
        }
    }, [loading, cvData]);

    useEffect(() => {
        if (!autoPrint || !rendered) return;
        const onAfterPrint = () => {
            try {
                window.close();
            } catch {
                return;
            }
        };
        window.addEventListener("afterprint", onAfterPrint);
        setTimeout(() => window.print(), 50);
        return () => window.removeEventListener("afterprint", onAfterPrint);
    }, [autoPrint, rendered]);

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
                format={format}
                customCSS={customCSS}
            />

            <style jsx global>{`
                /* ===== CSS RESET for PDF Print ===== */
                *, *::before, *::after {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                @page {
                    margin: 0;
                    size: ${format === "Letter" ? "Letter" : "A4"};
                }

                /* Force color preservation in PDF */
                * {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    color-adjust: exact !important;
                }

                html, body {
                    background: white;
                    margin: 0;
                    padding: 0;
                    overflow: visible !important;
                    height: auto !important;
                    min-height: 100%;
                    /* Font rendering */
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                    text-rendering: optimizeLegibility;
                }

                /* Allow multi-page overflow */
                #cv-container, .cv-page {
                    width: var(--cv-page-width, 210mm) !important;
                    min-height: var(--cv-page-height, 297mm) !important;
                    margin: 0 auto;
                    overflow: visible !important;
                    height: auto !important;
                }

                /* ===== Page Break Rules ===== */
                .cv-avoid-break,
                .break-inside-avoid,
                .cv-item,
                li {
                    break-inside: avoid !important;
                    page-break-inside: avoid !important;
                }

                .page-break-before {
                    break-before: page !important;
                    page-break-before: always !important;
                }

                /* ===== Orphan/Widow Control ===== */
                p, li, div {
                    orphans: 3;
                    widows: 3;
                }

                h1, h2, h3, h4, h5, h6 {
                    break-after: avoid !important;
                    page-break-after: avoid !important;
                }

                /* ===== Gradient/Color Preservation ===== */
                [class*="bg-gradient"],
                [class*="text-"],
                [class*="bg-"],
                [class*="border-"],
                [style*="background"],
                [style*="color"] {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }

                * {
                    -webkit-box-decoration-break: clone;
                    box-decoration-break: clone;
                }

                /* ===== Link Cleanup for Print ===== */
                @media print {
                    a {
                        text-decoration: none !important;
                        color: inherit !important;
                    }
                    a[href]::after {
                        content: none !important;
                    }
                }

                .no-print {
                    display: none !important;
                }
            `}</style>
        </>
    );
}
