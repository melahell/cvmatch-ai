"use client";

/**
 * CV Builder - SPA Client-Side Architecture "Frankenstein"
 * 
 * Architecture :
 * 1. Génère widgets une fois côté serveur (API /api/cv/generate-widgets)
 * 2. Cache widgets dans localStorage
 * 3. Convertit widgets → CVData côté client (instantané)
 * 4. Switch thème instantané (<100ms) sans re-génération
 * 5. Preview temps réel
 */

import { useState, useEffect, useCallback, useMemo, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertCircle, Loader2, Sparkles, Zap, RefreshCw, Download, FileJson, ChevronDown, ChevronUp, SlidersHorizontal, Info } from "lucide-react";
import { convertWidgetsToCV, convertWidgetsToCVWithValidation, convertWidgetsToCVWithAdvancedScoring, type ConvertOptions } from "@/lib/cv/client-bridge";
import type { JobOfferContext } from "@/lib/cv/relevance-scoring";
import { validateAIWidgetsEnvelope } from "@/lib/cv/ai-widgets";
import ContextualLoader from "@/components/loading/ContextualLoader";
import { CVSkeleton } from "@/components/loading/CVSkeleton";
import {
    saveWidgetsToCache,
    getWidgetsFromCache,
    saveCVDataToCache,
    getCVDataFromCache,
    clearCacheForAnalysis,
} from "@/lib/cv/client-cache";
import type { AIWidgetsEnvelope } from "@/lib/cv/ai-widgets";
import type { RendererResumeSchema } from "@/lib/cv/renderer-schema";
import { TEMPLATES } from "@/components/cv/templates";
import { ValidationWarnings } from "@/components/cv/ValidationWarnings";
import { MultiTemplatePreview } from "@/components/cv/MultiTemplatePreview";
import { ExportMenu } from "@/components/cv/ExportMenu";
import { DraggableCV } from "@/components/cv/DraggableCV";
import { ExperienceEditor } from "@/components/cv/ExperienceEditor";
import { WidgetScoreVisualizer } from "@/components/cv/WidgetScoreVisualizer";
import { WidgetEditor } from "@/components/cv/WidgetEditor";
import { useRAGData } from "@/hooks/useRAGData";
import { useCVPreview } from "@/hooks/useCVPreview";
import { useCVReorder } from "@/hooks/useCVReorder";
import { getSupabaseAuthHeader } from "@/lib/supabase";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { logger } from "@/lib/utils/logger";
import { Switch } from "@/components/ui/switch";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Input } from "@/components/ui/input";
import { CV_COLORWAYS } from "@/lib/cv/style/colorways";
import { CV_DENSITIES, type CVDensity } from "@/lib/cv/style/density";
import { CV_FONTS } from "@/lib/cv/style/fonts";
import { preloadCVTemplate } from "@/components/cv/CVRenderer";

// Lazy load CVRenderer (heavy component with templates)
const CVRenderer = dynamic(() => import("@/components/cv/CVRenderer"), {
    loading: () => <div className="flex items-center justify-center p-12"><LoadingSpinner /></div>,
    ssr: false
});

interface GenerationState {
    isLoading: boolean;
    error: string | null;
    widgets: AIWidgetsEnvelope | null;
    metadata: {
        analysisId: string;
        jobId?: string;
        generatedAt: string;
        widgetsCount: number;
        model: string;
    } | null;
    jobOfferContext: JobOfferContext | null;
}

function CVBuilderContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const analysisId = searchParams.get("analysisId") || "";
    const jobId = searchParams.get("jobId") || "";

    const [state, setState] = useState<GenerationState>({
        isLoading: false,
        error: null,
        widgets: null,
        metadata: null,
        jobOfferContext: null,
    });
    const generationAbortRef = useRef<AbortController | null>(null);

    const [templateId, setTemplateId] = useState<string>("modern");
    const [cvData, setCvData] = useState<RendererResumeSchema | null>(null);
    const [validationResult, setValidationResult] = useState<any>(null);
    const [viewMode, setViewMode] = useState<"single" | "multi">("single");
    const [showEditor, setShowEditor] = useState<boolean>(false);
    const [showWidgetEditor, setShowWidgetEditor] = useState<boolean>(false);
    const [loadingStep, setLoadingStep] = useState<string | null>(null);
    const [errorAction, setErrorAction] = useState<{ action?: string; actionLabel?: string } | null>(null);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
    const [advancedFiltersEnabled, setAdvancedFiltersEnabled] = useState<boolean>(false);
    const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);
    const [cvCacheHit, setCvCacheHit] = useState<boolean>(false);
    // [CDC-23] Toggles pour photo et mode dense
    const [includePhoto, setIncludePhoto] = useState<boolean>(true);
    const [density, setDensity] = useState<CVDensity>("normal");
    const [colorwayId, setColorwayId] = useState<string>("indigo");
    const [fontId, setFontId] = useState<string>("sans");
    const [templateQuery, setTemplateQuery] = useState<string>("");
    const [favoriteStyles, setFavoriteStyles] = useState<Array<{ templateId: string; colorwayId: string; fontId: string; density: CVDensity }>>([]);
    const [buildInfo, setBuildInfo] = useState<{
        version: string | null;
        env: string | null;
        ref: string | null;
        sha: string | null;
        deploymentId: string | null;
    } | null>(null);
    const [advancedMinScoreBySection, setAdvancedMinScoreBySection] = useState<Record<string, number>>({
        header: 0,
        summary: 0,
        experiences: 0,
        skills: 0,
        education: 0,
        languages: 0,
        references: 0,
        projects: 0,
    });
    // DEFAULTS: PAS DE FILTRAGE - l'utilisateur contrôle via sliders UI
    const [convertOptions, setConvertOptions] = useState<ConvertOptions>({
        minScore: 0,                  // Afficher tout par défaut
        maxExperiences: 20,           // 20 expériences par défaut (slider max=20)
        maxBulletsPerExperience: 10,  // 10 bullets par expérience (ajustable)
        limitsBySection: {
            maxClientsPerExperience: 6,
            maxClientsReferences: 25,
        },
    });

    const filteredTemplates = useMemo(() => {
        const q = templateQuery.trim().toLowerCase();
        return TEMPLATES
            .filter((t) => t.available)
            .filter((t) => (q ? `${t.name} ${t.category}`.toLowerCase().includes(q) : true));
    }, [templateQuery]);

    const presets = useMemo(() => {
        const base = [
            { templateId: "modern", colorwayId: "indigo", fontId: "sans", density: "normal" as CVDensity },
            { templateId: "modern", colorwayId: "navy", fontId: "sans", density: "normal" as CVDensity },
            { templateId: "tech", colorwayId: "emerald", fontId: "mono", density: "normal" as CVDensity },
            { templateId: "tech", colorwayId: "cyan", fontId: "mono", density: "compact" as CVDensity },
            { templateId: "classic", colorwayId: "slate", fontId: "serif", density: "normal" as CVDensity },
            { templateId: "classic", colorwayId: "charcoal", fontId: "serif", density: "airy" as CVDensity },
            { templateId: "creative", colorwayId: "amber", fontId: "display", density: "normal" as CVDensity },
            { templateId: "creative", colorwayId: "rose", fontId: "display", density: "compact" as CVDensity },
        ];
        return base.filter((p) => TEMPLATES.some((t) => t.id === p.templateId && t.available));
    }, []);

    // Récupérer RAG profile pour validation
    const userId = Cookies.get("userId") || null;
    const { data: ragData } = useRAGData(userId);

    useEffect(() => {
        const run = async () => {
            try {
                const res = await fetch("/api/version", { cache: "no-store" });
                if (!res.ok) return;
                const data = await res.json();
                setBuildInfo({
                    version: data?.version ?? null,
                    env: data?.vercel?.env ?? null,
                    ref: data?.vercel?.git?.commit_ref ?? null,
                    sha: data?.vercel?.git?.commit_sha ?? null,
                    deploymentId: data?.vercel?.deployment_id ?? null,
                });
            } catch { }
        };
        run();
    }, []);

    useEffect(() => {
        try {
            const raw = localStorage.getItem("cvcrush:styleFavorites");
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return;
            setFavoriteStyles(
                parsed
                    .map((x: any) => ({
                        templateId: String(x?.templateId || ""),
                        colorwayId: String(x?.colorwayId || ""),
                        fontId: String(x?.fontId || "sans"),
                        density: (x?.density === "compact" || x?.density === "normal" || x?.density === "airy") ? x.density : "normal",
                    }))
                    .filter((x: any) => x.templateId && x.colorwayId)
            );
        } catch { }
    }, []);

    useEffect(() => {
        try {
            const raw = localStorage.getItem("cvcrush:styleSelection");
            if (!raw) return;
            const parsed = JSON.parse(raw);
            const nextTemplateId = String(parsed?.templateId || "");
            const nextColorwayId = String(parsed?.colorwayId || "");
            const nextFontId = String(parsed?.fontId || "sans");
            const nextDensity = (parsed?.density === "compact" || parsed?.density === "normal" || parsed?.density === "airy") ? parsed.density : "normal";

            if (nextTemplateId && TEMPLATES.some((t) => t.id === nextTemplateId)) setTemplateId(nextTemplateId);
            if (nextColorwayId) setColorwayId(nextColorwayId);
            if (nextFontId) setFontId(nextFontId);
            setDensity(nextDensity);
        } catch { }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem("cvcrush:styleSelection", JSON.stringify({ templateId, colorwayId, fontId, density }));
        } catch { }
    }, [templateId, colorwayId, fontId, density]);

    // Fonction pour traduire erreurs techniques en messages utilisateur-friendly
    const getUserFriendlyError = useCallback((error: any): { message: string; action?: string; actionLabel?: string } => {
        const errorMessage = error?.message || error?.error || String(error || "");
        const errorCode = error?.errorCode || "";

        // Erreur authentification
        if (errorMessage.includes("Non authentifié") || errorMessage.includes("401") || errorCode === "UNAUTHORIZED") {
            return {
                message: "Votre session a expiré. Veuillez vous reconnecter pour continuer.",
                action: "/login",
                actionLabel: "Se reconnecter"
            };
        }

        // Erreur profil RAG manquant
        if (errorMessage.includes("RAG_PROFILE_NOT_FOUND") || errorMessage.includes("Profil RAG introuvable") || errorCode === "RAG_PROFILE_NOT_FOUND") {
            return {
                message: "Votre profil professionnel n'est pas complet. Veuillez compléter votre profil avant de générer un CV.",
                action: "/dashboard/profile",
                actionLabel: "Compléter mon profil"
            };
        }

        // Erreur profil RAG incomplet
        if (errorMessage.includes("RAG_INCOMPLETE") || errorCode === "RAG_INCOMPLETE") {
            return {
                message: "Votre profil professionnel est incomplet. Certaines informations sont manquantes.",
                action: "/dashboard/profile",
                actionLabel: "Compléter mon profil"
            };
        }

        // Erreur analyse introuvable
        if (errorMessage.includes("ANALYSIS_NOT_FOUND") || errorMessage.includes("Analyse d'emploi introuvable") || errorCode === "ANALYSIS_NOT_FOUND") {
            return {
                message: "L'analyse d'emploi est introuvable. Veuillez créer une nouvelle analyse.",
                action: "/dashboard/analyze",
                actionLabel: "Créer une analyse"
            };
        }

        // Erreur réseau
        if (error instanceof TypeError || errorMessage.includes("fetch") || errorMessage.includes("network") || errorMessage.includes("Failed to fetch")) {
            return {
                message: "Problème de connexion internet. Vérifiez votre connexion et réessayez.",
                action: undefined,
                actionLabel: "Réessayer"
            };
        }

        // Erreur timeout
        if (errorMessage.includes("timeout") || errorMessage.includes("Timeout")) {
            return {
                message: "La requête a pris trop de temps. Le serveur peut être surchargé. Réessayez dans quelques instants.",
                action: undefined,
                actionLabel: "Réessayer"
            };
        }

        // Erreur rate limit
        if (errorCode === "RATE_LIMIT_EXCEEDED" || errorMessage.includes("429") || errorMessage.includes("trop de requêtes")) {
            return {
                message: "Vous avez effectué trop de requêtes. Veuillez patienter quelques instants avant de réessayer.",
                action: undefined,
                actionLabel: undefined
            };
        }

        // Erreur générique avec détails si disponibles
        if (error?.details) {
            return {
                message: error.details,
                action: undefined,
                actionLabel: undefined
            };
        }

        // Fallback : message générique
        return {
            message: "Une erreur est survenue lors de la génération de votre CV. Veuillez réessayer.",
            action: undefined,
            actionLabel: "Réessayer"
        };
    }, []);

    // Hook preview multi-thèmes
    const { getCVForTemplate } = useCVPreview({
        widgets: state.widgets,
        analysisId,
        convertOptions,
    });

    // Hook drag & drop pour réorganisation
    const {
        reorderedCV,
        reorderExperiences,
        reorderTechniques,
        reorderSoftSkills,
        reorderExperienceBullets,
        resetOrder,
    } = useCVReorder(cvData, analysisId);

    // Charger widgets depuis cache ou API
    const loadWidgets = useCallback(async (forceRefresh = false) => {
        if (!analysisId) {
            setState((prev) => ({
                ...prev,
                error: "analysisId requis dans l'URL",
                jobOfferContext: null,
            }));
            return;
        }

        // Vérifier cache d'abord (sauf si force refresh)
        if (!forceRefresh) {
            const cached = getWidgetsFromCache(analysisId);
            if (cached) {
                // Récupérer jobOfferContext depuis metadata si présent
                const jobContext = (cached.metadata as any)?.jobOfferContext || null;
                // Utiliser optimalMinScore depuis cache si disponible
                const optimalMinScore = (cached.metadata as any)?.optimalMinScore;
                if (optimalMinScore !== undefined) {
                    setConvertOptions(prev => ({
                        ...prev,
                        minScore: optimalMinScore,
                    }));
                }
                setState({
                    isLoading: false,
                    error: null,
                    widgets: cached.widgets,
                    metadata: cached.metadata,
                    jobOfferContext: jobContext,
                });
                setLoadingStep(null);
                setErrorAction(null);
                toast.success("Chargement depuis le cache (instantané)", { duration: 2000 });
                // Convertir immédiatement avec le template actuel et optimalMinScore
                const finalConvertOptions = optimalMinScore !== undefined
                    ? { ...convertOptions, minScore: optimalMinScore }
                    : convertOptions;
                convertWidgetsToCVData(cached.widgets, templateId, finalConvertOptions, jobContext);
                return;
            }
        }

        // Générer widgets depuis API
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        setLoadingStep("Récupération de votre profil professionnel...");
        setErrorAction(null);

        let slowTimer: number | undefined;
        try {
            slowTimer = window.setTimeout(() => {
                setLoadingStep("Toujours en cours… (vous pouvez annuler et réessayer)");
            }, 20000);
            generationAbortRef.current?.abort();
            const controller = new AbortController();
            generationAbortRef.current = controller;
            try { performance.mark("cv_builder_generate_start"); } catch { }

            // Récupérer headers d'authentification
            const authHeaders = await getSupabaseAuthHeader();

            setLoadingStep("Génération des widgets IA (cela peut prendre 10-20 secondes)...");
            const response = await fetch("/api/cv/generate-widgets", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...authHeaders,
                },
                signal: controller.signal,
                body: JSON.stringify({ analysisId, jobId }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                // Utiliser userMessage si disponible, sinon utiliser getUserFriendlyError
                const errorMessage = errorData.userMessage || getUserFriendlyError(errorData).message;
                const friendlyError = getUserFriendlyError(errorData);
                setState({
                    isLoading: false,
                    error: errorMessage,
                    widgets: null,
                    metadata: null,
                    jobOfferContext: null,
                });
                setLoadingStep(null);
                setErrorAction(friendlyError);
                return;
            }

            setLoadingStep("Validation anti-hallucination...");
            const data = await response.json();
            const widgets = data.widgets as AIWidgetsEnvelope;
            const metadata = data.metadata;
            const jobOfferContext = (data.jobOfferContext as JobOfferContext) || null;

            // Sauvegarder dans cache (inclure jobOfferContext dans metadata pour cache)
            const metadataWithContext = {
                ...metadata,
                jobOfferContext, // Inclure dans metadata pour cache
            };
            saveWidgetsToCache(analysisId, widgets, metadataWithContext);

            setLoadingStep("Conversion en CV...");
            setState({
                isLoading: false,
                error: null,
                widgets,
                metadata,
                jobOfferContext,
            });
            setLoadingStep(null);
            setErrorAction(null);

            // Convertir immédiatement avec scoring avancé
            convertWidgetsToCVData(widgets, templateId, convertOptions, jobOfferContext);
            toast.success("CV généré avec succès !", { duration: 3000 });
        } catch (error: any) {
            if (error?.name === "AbortError") {
                setState((prev) => ({
                    ...prev,
                    isLoading: false,
                }));
                setLoadingStep(null);
                setErrorAction(null);
                return;
            }
            const friendlyError = getUserFriendlyError(error);
            setState({
                isLoading: false,
                error: friendlyError.message,
                widgets: null,
                metadata: null,
                jobOfferContext: null,
            });
            setLoadingStep(null);
            setErrorAction(friendlyError);
        } finally {
            try { performance.mark("cv_builder_generate_end"); performance.measure("cv_builder_generate", "cv_builder_generate_start", "cv_builder_generate_end"); } catch { }
            try { if (slowTimer) window.clearTimeout(slowTimer); } catch { }
            generationAbortRef.current = null;
        }
    }, [analysisId, jobId, templateId, convertOptions]);

    const generationProgress = useMemo(() => {
        if (!state.isLoading) return 0;
        const step = (loadingStep || "").toLowerCase();
        if (step.includes("profil")) return 15;
        if (step.includes("widgets")) return 55;
        if (step.includes("hallucination")) return 75;
        if (step.includes("conversion")) return 90;
        return 30;
    }, [state.isLoading, loadingStep]);

    const generationCurrentStep = useMemo(() => {
        if (!state.isLoading) return 0;
        const step = (loadingStep || "").toLowerCase();
        if (step.includes("profil")) return 0;
        if (step.includes("widgets")) return 1;
        if (step.includes("hallucination")) return 2;
        if (step.includes("conversion")) return 3;
        return 0;
    }, [state.isLoading, loadingStep]);

    // Convertir widgets → CVData (côté client, instantané) avec validation + scoring avancé
    const convertWidgetsToCVData = useCallback(
        (widgets: AIWidgetsEnvelope, template: string, options: ConvertOptions, jobContext?: JobOfferContext | null) => {
            if (!analysisId) return;
            // Normaliser options pour le cache (sans ragProfile)
            // DEFAULTS: PAS DE FILTRAGE - l'utilisateur contrôle via UI
            const cacheOptions = {
                minScore: options.minScore ?? 0,
                maxExperiences: options.maxExperiences ?? 99,
                maxBulletsPerExperience: options.maxBulletsPerExperience ?? 99,
                advancedFilteringEnabled: advancedFiltersEnabled,
                minScoreBySection: advancedFiltersEnabled ? advancedMinScoreBySection : undefined,
                limitsBySection: {
                    maxSkills: options.limitsBySection?.maxSkills,
                    maxFormations: options.limitsBySection?.maxFormations,
                    maxLanguages: options.limitsBySection?.maxLanguages,
                    maxProjects: options.limitsBySection?.maxProjects,
                    maxReferences: options.limitsBySection?.maxReferences,
                    maxCertifications: options.limitsBySection?.maxCertifications,
                    maxClientsPerExperience: options.limitsBySection?.maxClientsPerExperience ?? 6,
                    maxClientsReferences: options.limitsBySection?.maxClientsReferences ?? 25,
                },
            };

            // Options complètes pour la conversion (avec ragProfile)
            const convertOptions: ConvertOptions = {
                ...cacheOptions,
                ragProfile: options.ragProfile ?? ragData,
            };

            // Vérifier cache CVData d'abord (sans validation pour performance)
            const cached = getCVDataFromCache(analysisId, template);
            if (cached && JSON.stringify(cached.options) === JSON.stringify(cacheOptions)) {
                setCvCacheHit(true);
                setCvData(cached.cvData);
                // Toujours valider même si en cache (pour afficher warnings)
                if (ragData) {
                    try {
                        // [AUDIT-FIX 100%] Calculer warnings de troncation (données masquées) (copie logique)
                        // Pour le cache hit, on recalcule aussi car ça dépend des options actuelles
                        const generateTruncationWarnings = (cv: RendererResumeSchema, rag: any): ValidationWarning[] => {
                            const warnings: ValidationWarning[] = [];

                            // 1. Clients globaux références
                            const ragClientsCount = (Array.isArray(rag?.references?.clients) ? rag.references.clients.length : 0);
                            const cvClientsCount = (Array.isArray(cv?.clients_references?.clients) ? cv.clients_references.clients.length : 0);
                            const limitClients = convertOptions.limitsBySection?.maxClientsReferences ?? 25;

                            if (ragClientsCount > cvClientsCount && ragClientsCount > limitClients) {
                                warnings.push({
                                    widgetId: "global_clients",
                                    type: "generic_warning",
                                    severity: "medium",
                                    message: `${ragClientsCount - cvClientsCount} clients masqués (limite de ${limitClients})`
                                });
                            }

                            // 2. Expériences (comparaison nombre d'expériences)
                            const ragExpsCount = (Array.isArray(rag?.experiences) ? rag.experiences.length : 0);
                            const cvExpsCount = (Array.isArray(cv?.experiences) ? cv.experiences.length : 0);
                            const limitExps = convertOptions.maxExperiences ?? 99;

                            if (ragExpsCount > cvExpsCount && ragExpsCount > limitExps) {
                                warnings.push({
                                    widgetId: "experiences_count",
                                    type: "generic_warning",
                                    severity: "medium",
                                    message: `${ragExpsCount - cvExpsCount} expériences masquées (limite de ${limitExps})`
                                });
                            }

                            return warnings;
                        };

                        // Utiliser scoring avancé si jobContext disponible
                        let valRes;
                        if (jobContext) {
                            valRes = convertWidgetsToCVWithAdvancedScoring(
                                widgets,
                                ragData,
                                jobContext,
                                convertOptions,
                                true
                            );
                        } else {
                            valRes = convertWidgetsToCVWithValidation(widgets, ragData, convertOptions);
                        }

                        const truncationWarnings = generateTruncationWarnings(cached.cvData, ragData);
                        const finalValidation = valRes.validation ? {
                            ...valRes.validation,
                            warnings: [...valRes.validation.warnings, ...truncationWarnings]
                        } : valRes.validation;

                        setValidationResult(finalValidation);
                    } catch (error) {
                        logger.error("Erreur validation", { error });
                    }
                }
                return;
            }
            setCvCacheHit(false);

            // Convertir avec validation + scoring avancé si RAG disponible
            try {
                if (ragData) {
                    // [AUDIT-FIX 100%] Calculer warnings de troncation (données masquées)
                    const generateTruncationWarnings = (cv: RendererResumeSchema, rag: any): ValidationWarning[] => {
                        const warnings: ValidationWarning[] = [];

                        // 1. Clients globaux références
                        const ragClientsCount = (Array.isArray(rag?.references?.clients) ? rag.references.clients.length : 0);
                        const cvClientsCount = (Array.isArray(cv?.clients_references?.clients) ? cv.clients_references.clients.length : 0);
                        const limitClients = convertOptions.limitsBySection?.maxClientsReferences ?? 25;

                        if (ragClientsCount > cvClientsCount && ragClientsCount > limitClients) {
                            warnings.push({
                                widgetId: "global_clients",
                                type: "generic_warning",
                                severity: "medium",
                                message: `${ragClientsCount - cvClientsCount} clients masqués (limite de ${limitClients})`
                            });
                        }

                        // 2. Expériences (comparaison nombre d'expériences)
                        const ragExpsCount = (Array.isArray(rag?.experiences) ? rag.experiences.length : 0);
                        const cvExpsCount = (Array.isArray(cv?.experiences) ? cv.experiences.length : 0);
                        const limitExps = convertOptions.maxExperiences ?? 99;

                        if (ragExpsCount > cvExpsCount && ragExpsCount > limitExps) {
                            warnings.push({
                                widgetId: "experiences_count",
                                type: "generic_warning",
                                severity: "medium",
                                message: `${ragExpsCount - cvExpsCount} expériences masquées (limite de ${limitExps})`
                            });
                        }

                        return warnings;
                    };

                    let res;
                    // Utiliser scoring avancé si jobContext disponible
                    if (jobContext) {
                        res = convertWidgetsToCVWithAdvancedScoring(
                            widgets,
                            ragData,
                            jobContext,
                            convertOptions,
                            true
                        );
                    } else {
                        // Fallback avec validation simple si pas de jobContext
                        res = convertWidgetsToCVWithValidation(widgets, ragData, convertOptions);
                    }

                    const { cvData: cv, validation: rawValidation } = res;

                    // Injecter warnings
                    const truncationWarnings = generateTruncationWarnings(cv, ragData);
                    const finalValidation = rawValidation ? {
                        ...rawValidation,
                        warnings: [...rawValidation.warnings, ...truncationWarnings]
                    } : null;

                    setCvData(cv);
                    setValidationResult(finalValidation);
                    // Sauvegarder dans cache
                    saveCVDataToCache(analysisId, template, cv, cacheOptions);
                } else {
                    // Fallback sans validation si RAG non disponible
                    const cv = convertWidgetsToCV(widgets, convertOptions);
                    setCvData(cv);
                    setValidationResult(null);
                    saveCVDataToCache(analysisId, template, cv, cacheOptions);
                }
            } catch (error: any) {
                logger.error("Erreur conversion widgets", { error });
                setState((prev) => ({
                    ...prev,
                    error: `Erreur conversion: ${error.message}`,
                }));
            }
        },
        [analysisId, ragData, advancedFiltersEnabled, advancedMinScoreBySection]
    );

    // Charger au montage
    useEffect(() => {
        if (analysisId) {
            loadWidgets();
        }
    }, [analysisId]); // eslint-disable-line react-hooks/exhaustive-deps

    // Reconvertir quand template ou options changent
    useEffect(() => {
        if (state.widgets) {
            convertWidgetsToCVData(state.widgets, templateId, convertOptions, state.jobOfferContext);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [templateId, convertOptions, state.widgets, state.jobOfferContext, advancedFiltersEnabled, advancedMinScoreBySection]);

    useEffect(() => {
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

                setCvData((prev) => {
                    if (!prev) return prev;
                    const prevPhoto = prev?.profil?.photo_url as string | undefined;
                    const prevHasHttp =
                        typeof prevPhoto === "string" &&
                        (prevPhoto.startsWith("http://") || prevPhoto.startsWith("https://"));
                    if (prevHasHttp && !isLikelySignedUrl(prevPhoto)) return prev;
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
    }, [cvData?.profil?.photo_url, cvData]);

    const handleTemplateChange = (newTemplate: string) => {
        setTemplateId(newTemplate);
        setViewMode("single"); // Basculer en vue single quand on sélectionne un template
        // Conversion automatique via useEffect
    };

    const isFavoriteCurrent = useMemo(() => {
        return favoriteStyles.some((f) =>
            f.templateId === templateId &&
            f.colorwayId === colorwayId &&
            f.fontId === fontId &&
            f.density === density
        );
    }, [favoriteStyles, templateId, colorwayId, fontId, density]);

    useEffect(() => {
        try {
            localStorage.setItem("cvcrush:styleFavorites", JSON.stringify(favoriteStyles));
        } catch { }
    }, [favoriteStyles]);

    const toggleFavoriteCurrent = () => {
        setFavoriteStyles((prev) => {
            const exists = prev.some((f) =>
                f.templateId === templateId &&
                f.colorwayId === colorwayId &&
                f.fontId === fontId &&
                f.density === density
            );
            if (exists) {
                return prev.filter((f) => !(
                    f.templateId === templateId &&
                    f.colorwayId === colorwayId &&
                    f.fontId === fontId &&
                    f.density === density
                ));
            }
            const next = [...prev, { templateId, colorwayId, fontId, density }];
            return next.slice(-10);
        });
    };

    const applyStyle = (style: { templateId: string; colorwayId: string; fontId: string; density: CVDensity }) => {
        setTemplateId(style.templateId);
        setColorwayId(style.colorwayId);
        setFontId(style.fontId);
        setDensity(style.density);
        setViewMode("single");
    };

    const applyRandomPreset = () => {
        if (presets.length === 0) return;
        const picked = presets[Math.floor(Math.random() * presets.length)];
        applyStyle(picked);
    };

    const handleMultiPreviewSelect = (selectedTemplateId: string) => {
        setTemplateId(selectedTemplateId);
        setViewMode("single");
    };

    const handleRefresh = () => {
        clearCacheForAnalysis(analysisId);
        loadWidgets(true);
    };

    if (!analysisId) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center gap-4 text-center">
                            <AlertCircle className="w-12 h-12 text-amber-500" />
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 mb-2">
                                    Analysis ID requis
                                </h2>
                                <p className="text-sm text-slate-600">
                                    Veuillez accéder à cette page depuis une analyse d'emploi.
                                </p>
                            </div>
                            <Button onClick={() => router.push("/dashboard/analyze")}>
                                Voir mes analyses
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            <header className="border-b bg-white sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-indigo-600" />
                            <div>
                                <h1 className="text-base sm:text-lg font-semibold text-slate-900">
                                    CV Builder V2 - Architecture Client-Side
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-600">
                                    Génération widgets une fois, tout le reste côté client (switch thème instantané)
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {buildInfo?.sha && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 border border-slate-200 cursor-help">
                                                <Info className="w-3 h-3" />
                                                {buildInfo.env ?? "vercel"} {buildInfo.sha.slice(0, 7)}
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom" className="max-w-xs">
                                            <div className="space-y-1 text-xs">
                                                <p className="font-semibold">Build</p>
                                                <p className="text-slate-600">Env: {buildInfo.env ?? "—"}</p>
                                                <p className="text-slate-600">Branche: {buildInfo.ref ?? "—"}</p>
                                                <p className="text-slate-600">Commit: {buildInfo.sha ?? "—"}</p>
                                                <p className="text-slate-600">Deployment: {buildInfo.deploymentId ?? "—"}</p>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                            {state.metadata && state.widgets && (
                                <>
                                    <WidgetScoreVisualizer widgets={state.widgets} showDetails={false} />
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 border border-indigo-100 cursor-help">
                                                    <Zap className="w-3 h-3" />
                                                    {state.metadata.widgetsCount} widgets
                                                    {getWidgetsFromCache(analysisId) && (
                                                        <span className="ml-1 text-[10px] opacity-70">(cache)</span>
                                                    )}
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom" className="max-w-xs">
                                                <div className="space-y-2 text-xs">
                                                    <p className="font-semibold">Widgets IA</p>
                                                    <p className="text-slate-600">
                                                        Les widgets sont des éléments de contenu générés par l'IA (expériences, compétences, réalisations) avec scores de pertinence.
                                                    </p>
                                                    <p className="text-slate-600">
                                                        Ils sont convertis en CV selon le template choisi. Plus le score est élevé, plus l'élément est pertinent pour l'offre d'emploi.
                                                    </p>
                                                    {getWidgetsFromCache(analysisId) && (
                                                        <p className="text-green-600 font-medium">
                                                            ✓ Chargé depuis le cache (instantané)
                                                        </p>
                                                    )}
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    {cvCacheHit && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 border border-emerald-100">
                                            <Zap className="w-3 h-3" />
                                            Préview instantanée
                                        </span>
                                    )}
                                </>
                            )}
                            <Button
                                variant={viewMode === "multi" ? "primary" : "outline"}
                                size="sm"
                                onClick={() => setViewMode(viewMode === "single" ? "multi" : "single")}
                                disabled={!cvData}
                            >
                                {viewMode === "single" ? "Comparer templates" : "Vue single"}
                            </Button>
                            <Button
                                variant={showEditor ? "primary" : "outline"}
                                size="sm"
                                onClick={() => setShowEditor(!showEditor)}
                                disabled={!cvData}
                            >
                                {showEditor ? "Masquer éditeur" : "Éditer ordre"}
                            </Button>
                            {cvData && (
                                <>
                                    <ExportMenu
                                        cvData={reorderedCV || cvData || {} as RendererResumeSchema}
                                        template={templateId}
                                        filename="CV"
                                        onPDFDownload={async () => {
                                            const authHeaders = await getSupabaseAuthHeader();
                                            const headers: Record<string, string> = {
                                                "Content-Type": "application/json",
                                                ...authHeaders,
                                            };

                                            const payload = {
                                                data: reorderedCV || cvData || {},
                                                templateId,
                                                colorwayId,
                                                fontId,
                                                density,
                                                includePhoto,
                                                format: "A4" as const,
                                            };

                                            const res = await fetch("/api/print-jobs", {
                                                method: "POST",
                                                headers,
                                                credentials: "include",
                                                body: JSON.stringify({ payload }),
                                            });

                                            if (!res.ok) {
                                                throw new Error(`Erreur génération PDF (${res.status})`);
                                            }

                                            const json = await res.json();
                                            const token = json?.token as string | undefined;
                                            if (!token) throw new Error("Token manquant");

                                            const pdfRes = await fetch(`/api/print-jobs/${encodeURIComponent(token)}/pdf`, {
                                                method: "GET",
                                                headers: { ...authHeaders },
                                                credentials: "include",
                                            });
                                            if (!pdfRes.ok) {
                                                let details = "";
                                                let requestId = "";
                                                try {
                                                    const json = await pdfRes.json();
                                                    details = typeof json?.details === "string" ? `: ${json.details}` : "";
                                                    requestId = typeof json?.requestId === "string" ? json.requestId : "";
                                                } catch {
                                                    details = "";
                                                    requestId = "";
                                                }
                                                const rid = requestId ? ` (requestId: ${requestId})` : "";
                                                throw new Error(`Export PDF serveur indisponible (${pdfRes.status})${details}${rid}`);
                                            }
                                            const blob = await pdfRes.blob();
                                            const url = URL.createObjectURL(blob);
                                            const link = document.createElement("a");
                                            link.href = url;
                                            link.download = `CV.pdf`;
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                            URL.revokeObjectURL(url);
                                        }}
                                        onPDFExport={async () => {
                                            const authHeaders = await getSupabaseAuthHeader();
                                            const headers: Record<string, string> = {
                                                "Content-Type": "application/json",
                                                ...authHeaders,
                                            };

                                            const payload = {
                                                data: reorderedCV || cvData || {},
                                                templateId,
                                                colorwayId,
                                                fontId,
                                                density,
                                                includePhoto,
                                                format: "A4" as const,
                                            };

                                            const res = await fetch("/api/print-jobs", {
                                                method: "POST",
                                                headers,
                                                credentials: "include",
                                                body: JSON.stringify({ payload }),
                                            });

                                            if (!res.ok) {
                                                throw new Error(`Erreur création lien impression (${res.status})`);
                                            }
                                            const json = await res.json();
                                            const token = json?.token as string | undefined;
                                            if (!token) throw new Error("Token manquant");

                                            const url = `/dashboard/cv-builder/print?token=${encodeURIComponent(token)}&autoprint=1&format=A4`;
                                            const win = window.open(url, "_blank", "noopener,noreferrer");
                                            if (!win) {
                                                window.location.href = url;
                                            }
                                        }}
                                    />
                                </>
                            )}
                            {state.widgets && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    if (!state.widgets) {
                                                        toast.error("Aucun widget à exporter");
                                                        return;
                                                    }

                                                    try {
                                                        // Valider le format avant export
                                                        const validation = validateAIWidgetsEnvelope(state.widgets);
                                                        if (!validation.success) {
                                                            logger.error("Export JSON: widgets invalides", {
                                                                errors: validation.error.errors
                                                            });
                                                            toast.error("Format widgets invalide, impossible d'exporter");
                                                            return;
                                                        }

                                                        const dataStr = JSON.stringify(state.widgets, null, 2);
                                                        const dataBlob = new Blob([dataStr], { type: 'application/json' });
                                                        const url = URL.createObjectURL(dataBlob);
                                                        const link = document.createElement('a');
                                                        link.href = url;
                                                        link.download = `widgets_${analysisId}_${new Date().toISOString().split('T')[0]}.json`;
                                                        document.body.appendChild(link);
                                                        link.click();
                                                        document.body.removeChild(link);
                                                        URL.revokeObjectURL(url);
                                                        toast.success("Widgets JSON exportés", { duration: 2000 });
                                                    } catch (error: any) {
                                                        logger.error("Erreur export JSON", { error });
                                                        toast.error("Erreur lors de l'export JSON");
                                                    }
                                                }}
                                                aria-label="Exporter les widgets JSON bruts"
                                            >
                                                <FileJson className="w-4 h-4 mr-1" />
                                                Export JSON
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="text-xs">Télécharger les widgets JSON bruts pour analyse</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRefresh}
                                disabled={state.isLoading}
                            >
                                <RefreshCw className={`w-4 h-4 mr-1 ${state.isLoading ? "animate-spin" : ""}`} />
                                Régénérer
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 pt-6">
                {state.isLoading && (
                    <ContextualLoader
                        context="generating-cv"
                        progress={generationProgress}
                        currentStep={generationCurrentStep}
                        onCancel={() => generationAbortRef.current?.abort()}
                        isOverlay
                    />
                )}

                {state.error && (
                    <Card className="mb-6 border-red-200 bg-red-50">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-semibold text-red-900 mb-2">
                                        Erreur
                                    </h3>
                                    <p className="text-sm text-red-700 mb-3">{state.error}</p>
                                    {errorAction && (
                                        <div className="flex gap-2 flex-wrap">
                                            {errorAction.action && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => router.push(errorAction.action!)}
                                                    className="text-xs"
                                                >
                                                    {errorAction.actionLabel || "Aller à la page"}
                                                </Button>
                                            )}
                                            {errorAction.actionLabel === "Réessayer" && (
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={() => loadWidgets(true)}
                                                    className="text-xs"
                                                >
                                                    Réessayer
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Validation warnings */}
                {validationResult && (
                    <div className="mb-6">
                        <ValidationWarnings validation={validationResult} />
                    </div>
                )}

                {/* Widget Editor */}
                {showWidgetEditor && state.widgets && (
                    <div className="mb-6">
                        <WidgetEditor
                            widgets={state.widgets}
                            onUpdate={(updatedWidgets) => {
                                setState(prev => ({ ...prev, widgets: updatedWidgets }));
                                // Sauvegarder dans cache
                                if (state.metadata) {
                                    saveWidgetsToCache(analysisId, updatedWidgets, state.metadata);
                                }
                                // Reconvertir avec nouveaux widgets
                                convertWidgetsToCVData(updatedWidgets, templateId, convertOptions, state.jobOfferContext);
                                toast.success("Widgets mis à jour", { duration: 2000 });
                            }}
                        />
                    </div>
                )}

                {state.widgets && cvData && (
                    <DraggableCV
                        cvData={reorderedCV || cvData}
                        onReorderExperiences={reorderExperiences}
                        onReorderTechniques={reorderTechniques}
                        onReorderSoftSkills={reorderSoftSkills}
                        onReorderBullets={reorderExperienceBullets}
                    >
                        <>
                            {showEditor && (
                                <div className="mb-6">
                                    <ExperienceEditor
                                        experiences={(reorderedCV || cvData).experiences}
                                        onReorder={(newOrder) => {
                                            reorderExperiences(newOrder);
                                            toast.success("Ordre sauvegardé", { duration: 2000 });
                                        }}
                                        onReorderBullets={reorderExperienceBullets}
                                    />
                                </div>
                            )}
                            {viewMode === "multi" ? (
                                <MultiTemplatePreview
                                    cvData={reorderedCV || cvData}
                                    onTemplateSelect={handleMultiPreviewSelect}
                                />
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                    {/* Sidebar : Contrôles */}
                                    <aside className="space-y-4">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-sm">Template</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-2">
                                                <Input
                                                    value={templateQuery}
                                                    onChange={(e) => setTemplateQuery(e.target.value)}
                                                    placeholder="Rechercher un template…"
                                                />
                                                {filteredTemplates.map((template) => (
                                                    <Button
                                                        key={template.id}
                                                        variant={templateId === template.id ? "primary" : "outline"}
                                                        size="sm"
                                                        className="w-full justify-start"
                                                        onClick={() => handleTemplateChange(template.id)}
                                                        onMouseEnter={() => preloadCVTemplate(template.id)}
                                                    >
                                                        {template.name}
                                                    </Button>
                                                ))}
                                                <div className="pt-2 space-y-3">
                                                    <Button
                                                        variant={isFavoriteCurrent ? "primary" : "outline"}
                                                        size="sm"
                                                        className="w-full"
                                                        onClick={toggleFavoriteCurrent}
                                                    >
                                                        {isFavoriteCurrent ? "Retirer des favoris" : "Ajouter aux favoris"}
                                                    </Button>
                                                    {favoriteStyles.length > 0 && (
                                                        <div className="space-y-1">
                                                            {favoriteStyles.slice().reverse().map((f) => (
                                                                <Button
                                                                    key={`${f.templateId}:${f.colorwayId}:${f.fontId}:${f.density}`}
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="w-full justify-start"
                                                                    onClick={() => applyStyle(f)}
                                                                >
                                                                    {f.templateId} · {f.colorwayId} · {f.fontId} · {f.density}
                                                                </Button>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <div className="space-y-2">
                                                        <div className="text-xs text-slate-600">Presets</div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {presets.map((p) => (
                                                                <Button
                                                                    key={`${p.templateId}:${p.colorwayId}:${p.fontId}:${p.density}`}
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="justify-start"
                                                                    onClick={() => applyStyle(p)}
                                                                >
                                                                    {p.templateId} · {p.colorwayId}
                                                                </Button>
                                                            ))}
                                                        </div>
                                                        <Button variant="outline" size="sm" className="w-full" onClick={applyRandomPreset}>
                                                            Proposer un style
                                                        </Button>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="text-xs text-slate-600">Couleurs</div>
                                                        <div className="grid grid-cols-10 gap-1">
                                                            <button
                                                                key="default"
                                                                type="button"
                                                                onClick={() => setColorwayId("default")}
                                                                title="Défaut"
                                                                className={`h-6 w-6 rounded-full border bg-white text-[9px] font-semibold ${colorwayId === "default" ? "ring-2 ring-blue-500 border-transparent" : "border-slate-300"}`}
                                                            >
                                                                D
                                                            </button>
                                                            {CV_COLORWAYS.map((c) => (
                                                                <button
                                                                    key={c.id}
                                                                    type="button"
                                                                    onClick={() => setColorwayId(c.id)}
                                                                    title={c.name}
                                                                    className={`h-6 w-6 rounded-full border bg-[var(--swatch)] ${colorwayId === c.id ? "ring-2 ring-blue-500 border-transparent" : "border-slate-300"}`}
                                                                    style={{ ["--swatch" as any]: c.primary } as any}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="text-xs text-slate-600">Densité</div>
                                                        <div className="flex gap-2">
                                                            {CV_DENSITIES.map((d) => (
                                                                <Button
                                                                    key={d.id}
                                                                    variant={density === d.id ? "primary" : "outline"}
                                                                    size="sm"
                                                                    className="flex-1"
                                                                    onClick={() => setDensity(d.id)}
                                                                >
                                                                    {d.name}
                                                                </Button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="text-xs text-slate-600">Police</div>
                                                        <div className="flex gap-2">
                                                            {CV_FONTS.map((f) => (
                                                                <Button
                                                                    key={f.id}
                                                                    variant={fontId === f.id ? "primary" : "outline"}
                                                                    size="sm"
                                                                    className="flex-1"
                                                                    onClick={() => setFontId(f.id)}
                                                                >
                                                                    {f.name}
                                                                </Button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Widget Scores Visualization */}
                                        {state.widgets && (
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="text-sm">Scores de Pertinence</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <WidgetScoreVisualizer widgets={state.widgets} showDetails={true} />
                                                </CardContent>
                                            </Card>
                                        )}

                                        {ragData?.contexte_enrichi && (
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="text-sm flex items-center gap-2">
                                                        <Info className="w-4 h-4 text-slate-500" />
                                                        <span>Contexte enrichi</span>
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="text-xs space-y-2">
                                                    <div className="text-slate-600">
                                                        Présent: <span className="font-medium text-slate-900">Oui</span>
                                                    </div>
                                                    <div className="text-slate-600">
                                                        Compétences tacites: <span className="font-medium text-slate-900">{Array.isArray((ragData as any)?.contexte_enrichi?.competences_tacites) ? (ragData as any).contexte_enrichi.competences_tacites.length : 0}</span>
                                                    </div>
                                                    <div className="text-slate-600">
                                                        Soft skills déduites: <span className="font-medium text-slate-900">{Array.isArray((ragData as any)?.contexte_enrichi?.soft_skills_deduites) ? (ragData as any).contexte_enrichi.soft_skills_deduites.length : 0}</span>
                                                    </div>
                                                    <div className="text-slate-600">
                                                        Injectées dans le CV (skills):{" "}
                                                        <span className="font-medium text-slate-900">
                                                            {(() => {
                                                                const cvSkills = new Set<string>([
                                                                    ...((cvData as any)?.competences?.techniques || []),
                                                                    ...((cvData as any)?.competences?.soft_skills || []),
                                                                ].map((s: any) => String(s || "").toLowerCase().trim()).filter(Boolean));
                                                                const tac = Array.isArray((ragData as any)?.contexte_enrichi?.competences_tacites) ? (ragData as any).contexte_enrichi.competences_tacites : [];
                                                                const soft = Array.isArray((ragData as any)?.contexte_enrichi?.soft_skills_deduites) ? (ragData as any).contexte_enrichi.soft_skills_deduites : [];
                                                                const all = [...tac, ...soft].map((x: any) => String(typeof x === "string" ? x : x?.nom || x?.name || "").toLowerCase().trim()).filter(Boolean);
                                                                let matched = 0;
                                                                for (const item of all) {
                                                                    if (cvSkills.has(item)) matched++;
                                                                }
                                                                return matched;
                                                            })()}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-500">
                                                        Preuve: le compteur compare les items du contexte enrichi et les compétences réellement présentes dans le CV rendu.
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        )}

                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-sm flex items-center justify-between gap-2">
                                                    <span className="flex items-center gap-2">
                                                        <span>Options de Filtrage</span>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <HelpCircle className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-help" />
                                                                </TooltipTrigger>
                                                                <TooltipContent side="right" className="max-w-xs">
                                                                    <div className="space-y-2 text-xs">
                                                                        <p className="font-semibold">Options de filtrage</p>
                                                                        <p className="text-slate-600">
                                                                            Le score global s'applique à toutes les sections. Les filtres avancés permettent de définir des seuils distincts par section (expériences, compétences, etc.).
                                                                        </p>
                                                                    </div>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </span>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-7 px-2"
                                                        onClick={() => setShowAdvancedFilters((v) => !v)}
                                                    >
                                                        <SlidersHorizontal className="w-3 h-3 mr-1" />
                                                        {showAdvancedFilters ? "Masquer" : "Avancé"}
                                                        {showAdvancedFilters ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                                                    </Button>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4 text-xs">
                                                <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                                                    <div className="space-y-0.5">
                                                        <p className="text-slate-800 font-medium">Diagnostics</p>
                                                        <p className="text-slate-500">Vérifier build, cache et clients détectés.</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-slate-600">{showDiagnostics ? "Affichés" : "Masqués"}</span>
                                                        <Switch checked={showDiagnostics} onCheckedChange={setShowDiagnostics} />
                                                    </div>
                                                </div>
                                                {showDiagnostics && (
                                                    <div className="space-y-2 rounded-md border border-slate-200 bg-white px-3 py-3">
                                                        <div className="grid grid-cols-1 gap-1">
                                                            <p className="text-slate-700">
                                                                Build: {(buildInfo?.env ?? "local")} {(buildInfo?.sha ? buildInfo.sha.slice(0, 12) : "—")} {(buildInfo?.ref ? `(${buildInfo.ref})` : "")}
                                                            </p>
                                                            <p className="text-slate-700">
                                                                Cache CV: {cvCacheHit ? "hit" : "miss"} • Cache widgets: {getWidgetsFromCache(analysisId) ? "hit" : "miss"}
                                                            </p>
                                                            <p className="text-slate-700">
                                                                Clients RAG (references.clients): {Array.isArray((ragData as any)?.references?.clients) ? (ragData as any).references.clients.length : 0}
                                                            </p>
                                                            <p className="text-slate-700">
                                                                Clients CV (clients_references.clients): {Array.isArray((cvData as any)?.clients_references?.clients) ? (cvData as any).clients_references.clients.length : 0}
                                                            </p>
                                                            <p className="text-slate-700">
                                                                Expériences avec clients: {Array.isArray((cvData as any)?.experiences) ? (cvData as any).experiences.filter((e: any) => Array.isArray(e?.clients) && e.clients.length > 0).length : 0}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                                {showAdvancedFilters && (
                                                    <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                                                        <div className="space-y-0.5">
                                                            <p className="text-slate-800 font-medium">Filtres avancés</p>
                                                            <p className="text-slate-500">Seuils distincts par section (au lieu d'un seul filtre global).</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-slate-600">{advancedFiltersEnabled ? "Activés" : "Désactivés"}</span>
                                                            <Switch checked={advancedFiltersEnabled} onCheckedChange={setAdvancedFiltersEnabled} />
                                                        </div>
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <label className="block text-slate-600">
                                                            Score global minimum: {convertOptions.minScore}
                                                        </label>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <HelpCircle className="w-3 h-3 text-slate-400 hover:text-slate-600 cursor-help" />
                                                                </TooltipTrigger>
                                                                <TooltipContent side="right" className="max-w-xs">
                                                                    <div className="space-y-1 text-xs">
                                                                        <p className="font-semibold">Score de pertinence</p>
                                                                        <p className="text-slate-600">
                                                                            Filtre les éléments par pertinence par rapport à l'offre d'emploi.
                                                                        </p>
                                                                        <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                                                                            <li>0-30 : Faible pertinence</li>
                                                                            <li>50 : Pertinence moyenne (recommandé)</li>
                                                                            <li>80+ : Très pertinent</li>
                                                                        </ul>
                                                                    </div>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="100"
                                                        value={convertOptions.minScore}
                                                        onChange={(e) =>
                                                            setConvertOptions((prev) => ({
                                                                ...prev,
                                                                minScore: Number(e.target.value),
                                                            }))
                                                        }
                                                        className="w-full"
                                                    />
                                                    <p className="text-slate-500 mt-1">
                                                        {(convertOptions.minScore ?? 50) < 30 ? "Affiche tous les éléments (peu sélectif)" :
                                                            (convertOptions.minScore ?? 50) < 70 ? "Affiche les éléments pertinents (recommandé)" :
                                                                "Affiche uniquement les éléments très pertinents"}
                                                    </p>
                                                </div>
                                                {showAdvancedFilters && (
                                                    <div className={`space-y-3 rounded-md border px-3 py-3 ${advancedFiltersEnabled ? "border-indigo-200 bg-indigo-50" : "border-slate-200 bg-slate-50"}`}>
                                                        <div className="grid grid-cols-1 gap-3">
                                                            {[
                                                                { key: "experiences", label: "Expériences" },
                                                                { key: "skills", label: "Compétences" },
                                                                { key: "education", label: "Formations" },
                                                                { key: "languages", label: "Langues" },
                                                                { key: "references", label: "Clients / Références" },
                                                                { key: "projects", label: "Projets" },
                                                            ].map((row) => (
                                                                <div key={row.key}>
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <label className="block text-slate-700">
                                                                            Seuil {row.label}: {advancedMinScoreBySection[row.key] ?? 0}
                                                                        </label>
                                                                    </div>
                                                                    <input
                                                                        type="range"
                                                                        min="0"
                                                                        max="100"
                                                                        value={advancedMinScoreBySection[row.key] ?? 0}
                                                                        onChange={(e) => {
                                                                            const value = Number(e.target.value);
                                                                            setAdvancedMinScoreBySection((prev) => ({ ...prev, [row.key]: value }));
                                                                        }}
                                                                        className="w-full"
                                                                        disabled={!advancedFiltersEnabled}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <label className="block text-slate-600">
                                                            Max expériences: {convertOptions.maxExperiences}
                                                        </label>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <HelpCircle className="w-3 h-3 text-slate-400 hover:text-slate-600 cursor-help" />
                                                                </TooltipTrigger>
                                                                <TooltipContent side="right" className="max-w-xs">
                                                                    <div className="space-y-1 text-xs">
                                                                        <p className="font-semibold">Nombre d'expériences</p>
                                                                        <p className="text-slate-600">
                                                                            Limite le nombre d'expériences professionnelles affichées dans le CV.
                                                                        </p>
                                                                        <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                                                                            <li>4-6 : Recommandé pour CV 1 page</li>
                                                                            <li>6-8 : Pour CV 2 pages</li>
                                                                            <li>8+ : Pour CV détaillé</li>
                                                                        </ul>
                                                                    </div>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="1"
                                                        max="20"
                                                        value={convertOptions.maxExperiences}
                                                        onChange={(e) =>
                                                            setConvertOptions((prev) => ({
                                                                ...prev,
                                                                maxExperiences: Number(e.target.value),
                                                            }))
                                                        }
                                                        className="w-full"
                                                    />
                                                    <p className="text-slate-500 mt-1">
                                                        {cvData && `Affichera ${Math.min(convertOptions.maxExperiences ?? 10, cvData.experiences.length)} expérience(s) sur ${cvData.experiences.length} disponible(s)`}
                                                    </p>
                                                </div>
                                                <div>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <label className="block text-slate-600">
                                                            Max bullets/exp: {convertOptions.maxBulletsPerExperience}
                                                        </label>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <HelpCircle className="w-3 h-3 text-slate-400 hover:text-slate-600 cursor-help" />
                                                                </TooltipTrigger>
                                                                <TooltipContent side="right" className="max-w-xs">
                                                                    <div className="space-y-1 text-xs">
                                                                        <p className="font-semibold">Réalisations par expérience</p>
                                                                        <p className="text-slate-600">
                                                                            Nombre maximum de réalisations (bullets) affichées pour chaque expérience.
                                                                        </p>
                                                                        <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                                                                            <li>3-4 : CV concis (recommandé)</li>
                                                                            <li>5-6 : CV détaillé</li>
                                                                            <li>6+ : CV très détaillé</li>
                                                                        </ul>
                                                                    </div>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="1"
                                                        max="10"
                                                        value={convertOptions.maxBulletsPerExperience}
                                                        onChange={(e) =>
                                                            setConvertOptions((prev) => ({
                                                                ...prev,
                                                                maxBulletsPerExperience: Number(e.target.value),
                                                            }))
                                                        }
                                                        className="w-full"
                                                    />
                                                    <p className="text-slate-500 mt-1">
                                                        {(convertOptions.maxBulletsPerExperience ?? 6) <= 4 ? "CV concis et impactant" :
                                                            (convertOptions.maxBulletsPerExperience ?? 6) <= 6 ? "CV détaillé avec contexte" :
                                                                "CV très détaillé"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <label className="block text-slate-600">
                                                            Max clients/exp: {convertOptions.limitsBySection?.maxClientsPerExperience ?? 6}
                                                        </label>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <HelpCircle className="w-3 h-3 text-slate-400 hover:text-slate-600 cursor-help" />
                                                                </TooltipTrigger>
                                                                <TooltipContent side="right" className="max-w-xs">
                                                                    <div className="space-y-1 text-xs">
                                                                        <p className="font-semibold">Clients par expérience</p>
                                                                        <p className="text-slate-600">
                                                                            Limite le nombre de clients affichés sous chaque expérience.
                                                                        </p>
                                                                        <p className="text-slate-600">
                                                                            Mets 0 pour masquer complètement les clients dans les expériences.
                                                                        </p>
                                                                    </div>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="10"
                                                        value={convertOptions.limitsBySection?.maxClientsPerExperience ?? 6}
                                                        onChange={(e) =>
                                                            setConvertOptions((prev) => ({
                                                                ...prev,
                                                                limitsBySection: {
                                                                    ...(prev.limitsBySection || {}),
                                                                    maxClientsPerExperience: Number(e.target.value),
                                                                },
                                                            }))
                                                        }
                                                        className="w-full"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <label className="block text-slate-600">
                                                            Max clients (références): {convertOptions.limitsBySection?.maxClientsReferences ?? 25}
                                                        </label>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <HelpCircle className="w-3 h-3 text-slate-400 hover:text-slate-600 cursor-help" />
                                                                </TooltipTrigger>
                                                                <TooltipContent side="right" className="max-w-xs">
                                                                    <div className="space-y-1 text-xs">
                                                                        <p className="font-semibold">Clients & Références</p>
                                                                        <p className="text-slate-600">
                                                                            Limite le nombre de clients affichés dans la zone globale “Clients & Références”.
                                                                        </p>
                                                                        <p className="text-slate-600">
                                                                            Mets 0 pour masquer complètement la zone clients (références).
                                                                        </p>
                                                                    </div>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="30"
                                                        value={convertOptions.limitsBySection?.maxClientsReferences ?? 25}
                                                        onChange={(e) =>
                                                            setConvertOptions((prev) => ({
                                                                ...prev,
                                                                limitsBySection: {
                                                                    ...(prev.limitsBySection || {}),
                                                                    maxClientsReferences: Number(e.target.value),
                                                                },
                                                            }))
                                                        }
                                                        className="w-full"
                                                    />
                                                </div>
                                                {/* [CDC-23] Toggles photo et mode dense */}
                                                <div className="flex items-center justify-between">
                                                    <label className="text-slate-600">Inclure photo</label>
                                                    <Switch
                                                        checked={includePhoto}
                                                        onCheckedChange={setIncludePhoto}
                                                    />
                                                </div>
                                                {/* [CDC-23] Sliders manquants ajoutés */}
                                                <div>
                                                    <label className="block text-slate-600 mb-1">
                                                        Max compétences: {convertOptions.limitsBySection?.maxSkills ?? 20}
                                                    </label>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="30"
                                                        value={convertOptions.limitsBySection?.maxSkills ?? 20}
                                                        onChange={(e) =>
                                                            setConvertOptions((prev) => ({
                                                                ...prev,
                                                                limitsBySection: {
                                                                    ...(prev.limitsBySection || {}),
                                                                    maxSkills: Number(e.target.value),
                                                                },
                                                            }))
                                                        }
                                                        className="w-full"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-slate-600 mb-1">
                                                        Max formations: {convertOptions.limitsBySection?.maxFormations ?? 5}
                                                    </label>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="10"
                                                        value={convertOptions.limitsBySection?.maxFormations ?? 5}
                                                        onChange={(e) =>
                                                            setConvertOptions((prev) => ({
                                                                ...prev,
                                                                limitsBySection: {
                                                                    ...(prev.limitsBySection || {}),
                                                                    maxFormations: Number(e.target.value),
                                                                },
                                                            }))
                                                        }
                                                        className="w-full"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-slate-600 mb-1">
                                                        Max langues: {convertOptions.limitsBySection?.maxLanguages ?? 5}
                                                    </label>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="10"
                                                        value={convertOptions.limitsBySection?.maxLanguages ?? 5}
                                                        onChange={(e) =>
                                                            setConvertOptions((prev) => ({
                                                                ...prev,
                                                                limitsBySection: {
                                                                    ...(prev.limitsBySection || {}),
                                                                    maxLanguages: Number(e.target.value),
                                                                },
                                                            }))
                                                        }
                                                        className="w-full"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-slate-600 mb-1">
                                                        Max certifications: {convertOptions.limitsBySection?.maxCertifications ?? 10}
                                                    </label>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="15"
                                                        value={convertOptions.limitsBySection?.maxCertifications ?? 10}
                                                        onChange={(e) =>
                                                            setConvertOptions((prev) => ({
                                                                ...prev,
                                                                limitsBySection: {
                                                                    ...(prev.limitsBySection || {}),
                                                                    maxCertifications: Number(e.target.value),
                                                                },
                                                            }))
                                                        }
                                                        className="w-full"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-slate-600 mb-1">
                                                        Max projets: {convertOptions.limitsBySection?.maxProjects ?? 5}
                                                    </label>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="10"
                                                        value={convertOptions.limitsBySection?.maxProjects ?? 5}
                                                        onChange={(e) =>
                                                            setConvertOptions((prev) => ({
                                                                ...prev,
                                                                limitsBySection: {
                                                                    ...(prev.limitsBySection || {}),
                                                                    maxProjects: Number(e.target.value),
                                                                },
                                                            }))
                                                        }
                                                        className="w-full"
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </aside>

                                    {/* Main : Preview CV */}
                                    <div className="lg:col-span-3">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-base">
                                                    Prévisualisation CV - {templateId} · {colorwayId} · {fontId} · {density}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="bg-slate-100 flex items-center justify-center p-4 min-h-[800px]">
                                                {reorderedCV || cvData ? (
                                                    <div id="cv-preview-container" className="w-full max-w-[900px] bg-white shadow-lg">
                                                        <CVRenderer
                                                            data={reorderedCV || cvData}
                                                            templateId={templateId}
                                                            colorwayId={colorwayId}
                                                            fontId={fontId}
                                                            density={density}
                                                            includePhoto={includePhoto}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-full">
                                                        <CVSkeleton />
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            )}
                        </>
                    </DraggableCV>
                )}
            </main>
        </div>
    );
}

export default function CVBuilderPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <LoadingSpinner text="Chargement du CV Builder..." fullScreen={false} />
            </div>
        }>
            <CVBuilderContent />
        </Suspense>
    );
}
