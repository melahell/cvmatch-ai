"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Loader2, AlertTriangle, RotateCcw } from "lucide-react";
import { logger } from "@/lib/utils/logger";
import type { PrintPayload } from "@/lib/cv/pdf-export";
import { getSupabaseAuthHeader } from "@/lib/supabase";
import { getCVPrintCSS } from "@/lib/cv/print-css";

const CVRenderer = dynamic(() => import("@/components/cv/CVRenderer"), {
    loading: () => (
        <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
    ),
    ssr: false,
});

export default function CVBuilderPrintClient() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const autoPrint = searchParams.get("autoprint") === "1";
    const formatParam = searchParams.get("format");
    const [payload, setPayload] = useState<PrintPayload | null>(null);
    const [expired, setExpired] = useState(false);
    const [rendered, setRendered] = useState(false);
    const [overflow, setOverflow] = useState(false);
    const cleanupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const tokenKey = useMemo(() => token || null, [token]);

    useEffect(() => {
        if (!tokenKey) return;
        let cancelled = false;

        const fetchPayload = async () => {
            try {
                const authHeaders = await getSupabaseAuthHeader();
                const init: RequestInit = { method: "GET", credentials: "include" };
                if (Object.keys(authHeaders).length > 0) {
                    init.headers = authHeaders;
                }

                const res = await fetch(`/api/print-jobs/${encodeURIComponent(tokenKey)}`, init);
                if (!res.ok) {
                    if (res.status === 404) {
                        setExpired(true);
                        return;
                    }
                    throw new Error(`Erreur de chargement (${res.status})`);
                }
                const json = await res.json();
                if (cancelled) return;
                setPayload(json.payload as PrintPayload);

                cleanupTimerRef.current = setTimeout(() => {
                    const deleteJob = async () => {
                        try {
                            const headers = await getSupabaseAuthHeader();
                            const delInit: RequestInit = { method: "DELETE", credentials: "include" };
                            if (Object.keys(headers).length > 0) delInit.headers = headers;
                            await fetch(`/api/print-jobs/${encodeURIComponent(tokenKey)}`, delInit);
                        } catch {
                            return;
                        }
                    };
                    void deleteJob();
                }, 5 * 60 * 1000);
            } catch (e) {
                logger.error("Erreur chargement print job", { error: e });
                setExpired(true);
            }
        };

        void fetchPayload();

        return () => {
            cancelled = true;
            if (cleanupTimerRef.current) clearTimeout(cleanupTimerRef.current);
        };
    }, [tokenKey]);

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
            if (cleanupTimerRef.current) {
                clearTimeout(cleanupTimerRef.current);
                cleanupTimerRef.current = null;
            }
            if (tokenKey) {
                const deleteJob = async () => {
                    try {
                        const headers = await getSupabaseAuthHeader();
                        const init: RequestInit = { method: "DELETE", credentials: "include" };
                        if (Object.keys(headers).length > 0) init.headers = headers;
                        await fetch(`/api/print-jobs/${encodeURIComponent(tokenKey)}`, init);
                    } catch {
                        return;
                    }
                };
                void deleteJob();
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
    }, [autoPrint, rendered, tokenKey]);

    if (!token) {
        return <div className="p-12 text-center">Token manquant</div>;
    }

    if (expired) {
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

    const format = (formatParam === "Letter" || formatParam === "A4" ? formatParam : payload.format) || "A4";
    const printCss = getCVPrintCSS(format);

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

            <style jsx global>{printCss}</style>
        </>
    );
}
