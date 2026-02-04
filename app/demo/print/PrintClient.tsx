"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { logger } from "@/lib/utils/logger";
import type { PrintPayload } from "@/lib/cv/pdf-export";

const CVRenderer = dynamic(() => import("@/components/cv/CVRenderer"), {
    loading: () => (
        <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
    ),
    ssr: false,
});

const STORAGE_PREFIX = "cvcrush:print:";

export default function DemoPrintClient() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const autoPrint = searchParams.get("autoprint") === "1";
    const [payload, setPayload] = useState<PrintPayload | null>(null);
    const [rendered, setRendered] = useState(false);

    const storageKey = useMemo(() => {
        if (!token) return null;
        return `${STORAGE_PREFIX}${token}`;
    }, [token]);

    useEffect(() => {
        if (!storageKey) return;
        try {
            const raw = window.localStorage.getItem(storageKey);
            if (!raw) return;
            const parsed = JSON.parse(raw) as PrintPayload;
            setPayload(parsed);
            window.localStorage.removeItem(storageKey);
        } catch (e) {
            logger.error("Erreur lecture payload print (demo)", { error: e });
        }
    }, [storageKey]);

    useEffect(() => {
        if (!payload) return;
        const markReady = () => {
            setRendered(true);
            (window as any).__CV_RENDER_COMPLETE__ = true;
        };

        if (document.fonts) {
            document.fonts.ready.then(() => {
                const images = document.querySelectorAll("#cv-container img");
                if (images.length === 0) {
                    setTimeout(markReady, 200);
                    return;
                }
                Promise.all(
                    Array.from(images).map((img) =>
                        (img as HTMLImageElement).complete
                            ? Promise.resolve()
                            : new Promise((resolve) => {
                                (img as HTMLImageElement).onload = resolve;
                                (img as HTMLImageElement).onerror = resolve;
                            })
                    )
                ).then(() => setTimeout(markReady, 200));
            });
        } else {
            setTimeout(markReady, 1200);
        }
    }, [payload]);

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

    if (!token) {
        return <div className="p-12 text-center">Token manquant</div>;
    }

    if (!payload) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const format = payload.format || "A4";

    return (
        <>
            <div id="cv-render-status" data-ready={rendered ? "true" : "false"} style={{ display: "none" }} />
            <CVRenderer
                data={payload.data}
                templateId={payload.templateId}
                colorwayId={payload.colorwayId}
                fontId={payload.fontId}
                density={payload.density}
                printSafe={true}
                includePhoto={payload.includePhoto ?? true}
                format={format}
                customCSS={payload.customCSS}
            />

            <style jsx global>{`
                *, *::before, *::after {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

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
                    background: white;
                    margin: 0;
                    padding: 0;
                    overflow: visible !important;
                    height: auto !important;
                    min-height: 100%;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                }

                #cv-container {
                    width: var(--cv-page-width, 210mm) !important;
                    height: auto !important;
                    min-height: var(--cv-page-height, 297mm) !important;
                    margin: 0 auto;
                    overflow: visible !important;
                }

                .cv-avoid-break,
                .break-inside-avoid,
                .cv-item,
                li {
                    break-inside: avoid !important;
                    page-break-inside: avoid !important;
                }

                h1, h2, h3, h4, h5, h6 {
                    break-after: avoid !important;
                    page-break-after: avoid !important;
                }

                .print-hidden, .no-print, .print\\:hidden, [data-no-print="true"] {
                    display: none !important;
                }

                @media print {
                    html, body {
                        width: 100%;
                        height: auto;
                        overflow: visible !important;
                    }

                    #cv-container {
                        page-break-inside: avoid;
                        break-inside: avoid;
                    }
                }
            `}</style>
        </>
    );
}
