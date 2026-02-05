"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Loader2, AlertTriangle, RotateCcw } from "lucide-react";
import dynamic from "next/dynamic";
import { getSupabaseAuthHeader } from "@/lib/supabase";
import { logger } from "@/lib/utils/logger";
import type { CVDensity } from "@/lib/cv/style/density";
import { getCVPrintCSS } from "@/lib/cv/print-css";

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
    const colorwayId = searchParams.get("colorway") || undefined;
    const fontId = searchParams.get("font") || undefined;
    const densityParam = searchParams.get("density") || undefined;
    const density = (densityParam === "compact" || densityParam === "normal" || densityParam === "airy") ? (densityParam as CVDensity) : undefined;
    const customCSS = searchParams.get("css") || undefined;
    const autoPrint = searchParams.get("autoprint") === "1";
    const printCss = getCVPrintCSS(format);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [cvData, setCvData] = useState<any>(null);
    const [templateId, setTemplateId] = useState<string>("modern");
    const [rendered, setRendered] = useState(false);
    const [overflow, setOverflow] = useState(false);
    const [estimatedPages, setEstimatedPages] = useState(1);

    useEffect(() => {
        async function fetchCV() {
            if (!id) return;

            setFetchError(null);
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
            if (!supabaseUrl || !anonKey) {
                setFetchError("Configuration Supabase manquante");
                setLoading(false);
                return;
            }

            try {
                const authHeaders = await getSupabaseAuthHeader();
                const headers: Record<string, string> = {
                    apikey: anonKey,
                };
                if (authHeaders.Authorization) {
                    headers.Authorization = authHeaders.Authorization;
                }

                const url = `${supabaseUrl}/rest/v1/cv_generations?id=eq.${id}&select=cv_data,template_name&limit=1`;
                const res = await fetch(url, { method: "GET", headers });
                if (!res.ok) {
                    setFetchError(`Erreur de chargement (${res.status})`);
                    setLoading(false);
                    return;
                }
                const rows = (await res.json()) as Array<{ cv_data: any; template_name: string | null }>;
                const row = rows?.[0];
                if (row?.cv_data) {
                    setCvData(row.cv_data);
                    setTemplateId(templateParam || row.template_name || "modern");
                } else {
                    setFetchError("CV introuvable");
                }
            } catch (err: any) {
                logger.error("CV print fetch error", { error: err });
                setFetchError(err?.message || "Erreur réseau");
            }
            setLoading(false);
        }
        fetchCV();
    }, [id, templateParam]);

    // Toujours régénérer une signed URL fraîche pour la photo
    // Les signed URLs expirent, donc on doit toujours en demander une nouvelle
    useEffect(() => {
        if (!includePhoto) return;
        if (!cvData) return;

        (window as any).__CV_PHOTO_READY__ = false;

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
                if (!res.ok) {
                    // Pas de photo disponible, on continue quand même
                    logger.debug("No photo available from API");
                    return;
                }
                const payload = await res.json();
                const photoUrl = payload?.photo_url as string | null | undefined;
                if (!photoUrl) return;
                if (cancelled) return;

                logger.debug("Fresh signed photo URL obtained", { photoUrl: photoUrl.substring(0, 50) + "..." });

                // Toujours mettre à jour avec l'URL fraîche
                setCvData((prev: any) => {
                    if (!prev) return prev;
                    return { ...prev, profil: { ...(prev.profil || {}), photo_url: photoUrl } };
                });
            } catch (err) {
                logger.error("Error loading photo", { error: err });
                return;
            } finally {
                if (!cancelled) (window as any).__CV_PHOTO_READY__ = true;
            }
        };

        loadPhoto();

        return () => {
            cancelled = true;
        };
    }, [includePhoto, cvData]);

    // Signal when CV is fully rendered (for Puppeteer detection)
    useEffect(() => {
        if (!loading && cvData) {
            const markReady = () => {
                try {
                    // Calculer le nombre de pages estimé
                    // A4 = 297mm (~1123px à 96dpi), Letter = 279.4mm (~1056px)
                    const pageHeightPx = format === "Letter" ? 1056 : 1123;
                    const bodyHeight = document.body.scrollHeight;
                    const pages = Math.max(1, Math.ceil(bodyHeight / pageHeightPx));
                    setEstimatedPages(pages);
                    setOverflow(pages > 1);
                } catch { }
                setRendered(true);
                (window as any).__CV_RENDER_COMPLETE__ = true;
                logger.debug('CV Render Complete');
            };

            // Wait for fonts and images to load
            if (document.fonts) {
                document.fonts.ready.then(() => {
                    (async () => {
                        if (includePhoto) {
                            const start = Date.now();
                            while (!(window as any).__CV_PHOTO_READY__) {
                                if (Date.now() - start > 8000) break;
                                await new Promise(resolve => setTimeout(resolve, 50));
                            }
                        }

                        const images = document.querySelectorAll('#cv-container img');
                        if (images.length === 0) {
                            setTimeout(markReady, 300);
                            return;
                        }

                        await Promise.all(
                            Array.from(images).map(img =>
                                (img as HTMLImageElement).complete
                                    ? Promise.resolve()
                                    : new Promise(resolve => {
                                        (img as HTMLImageElement).onload = resolve;
                                        (img as HTMLImageElement).onerror = resolve;
                                    })
                            )
                        );
                        setTimeout(markReady, 300);
                    })();
                });
            } else {
                setTimeout(markReady, 1500);
            }
        }
    }, [loading, cvData, includePhoto, format]);

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

    if (fetchError || !cvData) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center space-y-4 max-w-md px-6">
                    <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
                    <h2 className="text-lg font-semibold text-slate-800">
                        {fetchError || "CV introuvable"}
                    </h2>
                    <p className="text-sm text-slate-600">
                        Le CV n&apos;a pas pu être chargé. Vérifie que tu es connecté et réessaye.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Hidden indicator for Puppeteer */}
            <div
                id="cv-render-status"
                data-ready={rendered ? 'true' : 'false'}
                style={{ display: 'none' }}
            />
            {/* Badge indicateur de pages en haut à droite */}
            <div className="print-hidden fixed top-3 right-3 z-50 flex flex-col items-end gap-2">
                <div className={`px-3 py-1.5 rounded-full text-xs font-medium shadow-lg backdrop-blur-sm ${estimatedPages > 1
                    ? 'bg-amber-500/90 text-white'
                    : 'bg-emerald-500/90 text-white'
                    }`}>
                    📄 {estimatedPages} page{estimatedPages > 1 ? 's' : ''}
                </div>
                {overflow && (
                    <div className="bg-amber-50/95 text-amber-800 border border-amber-200 rounded-lg px-3 py-2 text-xs max-w-xs shadow-lg">
                        ⚠️ Le CV dépasse 1 page. Ajuste la densité ou réduis le contenu.
                    </div>
                )}
            </div>

            <CVRenderer
                data={cvData}
                templateId={templateId}
                colorwayId={colorwayId}
                fontId={fontId}
                density={density}
                printSafe={true}
                includePhoto={includePhoto}
                format={format}
                customCSS={customCSS}
            />

            <style jsx global>{printCss}</style>
        </>
    );
}
