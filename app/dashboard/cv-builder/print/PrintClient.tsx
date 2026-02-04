"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Loader2, AlertTriangle, RotateCcw } from "lucide-react";
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
/** Keep payload in localStorage for 5 minutes so refresh / re-print works */
const PAYLOAD_TTL_MS = 5 * 60 * 1000;

export default function CVBuilderPrintClient() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const autoPrint = searchParams.get("autoprint") === "1";
    const [payload, setPayload] = useState<PrintPayload | null>(null);
    const [expired, setExpired] = useState(false);
    const [rendered, setRendered] = useState(false);
    const [overflow, setOverflow] = useState(false);
    const cleanupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const storageKey = useMemo(() => {
        if (!token) return null;
        return `${STORAGE_PREFIX}${token}`;
    }, [token]);

    // Read payload from localStorage — defer cleanup to TTL instead of immediate delete
    useEffect(() => {
        if (!storageKey) return;
        try {
            const raw = window.localStorage.getItem(storageKey);
            if (!raw) {
                // Token exists in URL but payload is gone → expired
                setExpired(true);
                return;
            }
            const parsed = JSON.parse(raw) as PrintPayload;
            setPayload(parsed);

            // Schedule cleanup after TTL instead of deleting immediately
            cleanupTimerRef.current = setTimeout(() => {
                try { window.localStorage.removeItem(storageKey); } catch {}
            }, PAYLOAD_TTL_MS);
        } catch (e) {
            logger.error("Erreur lecture payload print", { error: e });
            setExpired(true);
        }

        return () => {
            if (cleanupTimerRef.current) clearTimeout(cleanupTimerRef.current);
        };
    }, [storageKey]);

    useEffect(() => {
        if (!payload) return;
        const markReady = () => {
            try {
                const pageHeight = window.innerHeight;
                const bodyHeight = document.body.scrollHeight;
                setOverflow(bodyHeight > pageHeight + 40);
            } catch {}
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
            // Clean up localStorage after successful print
            if (storageKey) {
                try { window.localStorage.removeItem(storageKey); } catch {}
            }
            if (cleanupTimerRef.current) {
                clearTimeout(cleanupTimerRef.current);
                cleanupTimerRef.current = null;
            }
            try {
                window.close();
            } catch {
                return;
            }
        };
        window.addEventListener("afterprint", onAfterPrint);
        setTimeout(() => window.print(), 50);
        return () => window.removeEventListener("afterprint", onAfterPrint);
    }, [autoPrint, rendered, storageKey]);

    if (!token) {
        return <div className="p-12 text-center">Token manquant</div>;
    }

    if (expired || (!payload && token)) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center space-y-4 max-w-md px-6">
                    <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
                    <h2 className="text-lg font-semibold text-slate-800">Lien d&apos;impression expiré</h2>
                    <p className="text-sm text-slate-600">
                        Ce lien d&apos;export a expiré ou a déjà été utilisé. Relance l&apos;export PDF depuis la page du CV.
                    </p>
                    <button
                        onClick={() => window.close()}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Fermer cet onglet
                    </button>
                </div>
            </div>
        );
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
            {overflow && (
                <div className="print-hidden fixed top-0 left-0 right-0 z-50 bg-amber-50 text-amber-900 border-b border-amber-200 px-3 py-2 text-xs">
                    Attention: le contenu dépasse probablement 1 page. Réduis la densité ou coupe du contenu.
                </div>
            )}
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
