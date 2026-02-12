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
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Loader2, Sparkles, RefreshCw, ChevronDown, ChevronUp, SlidersHorizontal, Info } from "lucide-react";
import { convertWidgetsToCV, convertWidgetsToCVWithValidation, convertWidgetsToCVWithAdvancedScoring, type ConvertOptions, type ValidationWarning } from "@/lib/cv/client-bridge";
import type { JobOfferContext } from "@/lib/cv/relevance-scoring";
import { validateAIWidgetsEnvelope } from "@/lib/cv/ai-widgets";
import { adaptCVToThemeUnits } from "@/lib/cv/adaptive-algorithm";
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
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ExperienceEditor } from "@/components/cv/ExperienceEditor";
// WidgetScoreVisualizer removed from UI (dev-only)
// WidgetEditor removed from UI (dev-only)
import { useRAGData } from "@/hooks/useRAGData";
import { useCVPreview } from "@/hooks/useCVPreview";
import { useCVReorder } from "@/hooks/useCVReorder";
import { getSupabaseAuthHeader } from "@/lib/supabase";

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
    // [FIX #1] Compteurs non-filtrés — calculés une seule fois, jamais verrouillés par les sliders
    const [unfilteredCounts, setUnfilteredCounts] = useState<{
        experiences: number;
        skills: number;
        formations: number;
        langues: number;
        certifications: number;
        projects: number;
        clientsReferences: number;
        maxRealisationsPerExp: number;
        maxClientsPerExp: number;
    } | null>(null);
    const [cssVariables, setCssVariables] = useState<Record<string, string>>({});
    const [qualityMetrics, setQualityMetrics] = useState<any>(null);
    const [validationResult, setValidationResult] = useState<any>(null);
    const [viewMode, setViewMode] = useState<"single" | "multi">("single");
    const [showEditor, setShowEditor] = useState<boolean>(false);
    const [loadingStep, setLoadingStep] = useState<string | null>(null);
    const [errorAction, setErrorAction] = useState<{ action?: string; actionLabel?: string } | null>(null);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
    const [advancedFiltersEnabled, setAdvancedFiltersEnabled] = useState<boolean>(false);
    const [cvCacheHit, setCvCacheHit] = useState<boolean>(false);
    // [CDC-23] Toggles pour photo et mode dense
    const [includePhoto, setIncludePhoto] = useState<boolean>(true);
    const [density, setDensity] = useState<CVDensity>("normal");
    const [colorwayId, setColorwayId] = useState<string>("indigo");
    const [fontId, setFontId] = useState<string>("sans");

    const [estimatedPages, setEstimatedPages] = useState<number>(1);
    const cvPreviewRef = useRef<HTMLDivElement>(null);

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

    // Diagnostique automatique si qualité faible
    useEffect(() => {
        if (qualityMetrics?.globalScore < 50) {
            // Optional: Auto-open diagnostics or show toast
        }
    }, [qualityMetrics]);

    const filteredTemplates = useMemo(() => {
        return TEMPLATES.filter((t) => t.available);
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

    // Estimer le nombre de pages à partir de la hauteur du CV rendu
    useEffect(() => {
        if (!cvPreviewRef.current) return;
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const height = entry.contentRect.height;
                // A4 page ≈ 1123px at 96dpi (297mm). Avec marges ~1050px de contenu utile.
                const pages = Math.max(1, Math.ceil(height / 1050));
                setEstimatedPages(pages);
            }
        });
        observer.observe(cvPreviewRef.current);
        return () => observer.disconnect();
    }, [cvData, reorderedCV, templateId]);

    // Compteurs réels pour capper les sliders aux données disponibles
    // [FIX #1] dataCounts = compteurs de la donnée FILTRÉE (pour affichage X/total)
    const dataCounts = useMemo(() => {
        const d = reorderedCV || cvData;
        if (!d) return null;
        const maxRealisations = Math.max(0, ...(d.experiences || []).map(e => (e.realisations || []).length));
        const maxClientsPerExp = Math.max(0, ...(d.experiences || []).map(e => (e.clients || []).length));
        return {
            experiences: (d.experiences || []).length,
            skills: (d.competences?.techniques || []).length + (d.competences?.soft_skills || []).length,
            formations: (d.formations || []).length,
            langues: (d.langues || []).length,
            certifications: (d.certifications || []).length,
            projects: (d.projects || []).length,
            clientsReferences: (d.clients_references?.clients || []).length,
            maxRealisationsPerExp: maxRealisations,
            maxClientsPerExp: maxClientsPerExp,
        };
    }, [cvData, reorderedCV]);

    // [FIX #1] maxCounts = le MAXIMUM possible pour les sliders (jamais verrouillé)
    // Utilise unfilteredCounts (calculé une seule fois) sinon dataCounts en fallback
    const maxCounts = unfilteredCounts || dataCounts;

    // Charger widgets depuis cache ou API
    const loadWidgets = useCallback(async (forceRefresh = false) => {
        // [FIX #1] Toujours reset les compteurs au début du chargement
        setUnfilteredCounts(null);

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

            // [FIX #1] Initialiser les compteurs non-filtrés
            // On fait une conversion "dry run" sans limites pour avoir les vrais max
            // [ROBUSTESSE] Recalcul systématique pour gérer le chargement asynchrone de RAG
            setUnfilteredCounts(prev => {
                // Pas de check prev !

                // Options pour tout compter sans limites
                const unlimitedOptions: ConvertOptions = {
                    minScore: 0,
                    maxExperiences: 999,
                    maxBulletsPerExperience: 999,
                    limitsBySection: {
                        maxSkills: 999,
                        maxFormations: 999,
                        maxLanguages: 999,
                        maxProjects: 999,
                        maxReferences: 999,
                        maxCertifications: 999,
                        maxClientsPerExperience: 999,
                        maxClientsReferences: 999
                    },
                    ragProfile: options.ragProfile ?? (ragData || undefined),
                    advancedFilteringEnabled: false
                };

                try {
                    // Conversion synchrone rapide
                    const fullCv = convertWidgetsToCV(widgets, unlimitedOptions);
                    const maxR = Math.max(0, ...(fullCv.experiences || []).map((e: any) => (e.realisations || []).length));
                    const maxC = Math.max(0, ...(fullCv.experiences || []).map((e: any) => (e.clients || []).length));

                    return {
                        experiences: (fullCv.experiences || []).length,
                        skills: (fullCv.competences?.techniques || []).length + (fullCv.competences?.soft_skills || []).length,
                        formations: (fullCv.formations || []).length,
                        langues: (fullCv.langues || []).length,
                        certifications: (fullCv.certifications || []).length,
                        projects: (fullCv.projects || []).length,
                        clientsReferences: (fullCv.clients_references?.clients || []).length,
                        maxRealisationsPerExp: maxR,
                        maxClientsPerExp: maxC,
                    };
                } catch (e) {
                    console.error("Erreur calcul unfilteredCounts", e);
                    return null;
                }
            });

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
                    saveCVDataToCache(analysisId, template, cv, cacheOptions);

                    // [Sprint 1.2] Apply Layout Engine (Client Side)
                    try {
                        const adapted = adaptCVToThemeUnits({
                            cvData: cv,
                            templateName: template,
                            includePhoto: includePhoto,
                            jobOffer: jobContext
                        });
                        setCvData(adapted.cvData);
                        if (adapted.cssVariables) {
                            setCssVariables(adapted.cssVariables);
                        }
                        if (adapted.quality) {
                            setQualityMetrics(adapted.quality);
                        }
                    } catch (e) {
                        // Fallback if adaptation fails
                        logger.warn("Layout engine adaptation failed", e);
                        setCvData(cv);
                    }

                } else {
                    // Fallback sans validation si RAG non disponible
                    const cv = convertWidgetsToCV(widgets, convertOptions);

                    // [Sprint 1.2] Apply Layout Engine (Client Side)
                    try {
                        const adapted = adaptCVToThemeUnits({
                            cvData: cv,
                            templateName: template,
                            includePhoto: includePhoto,
                            jobOffer: jobContext
                        });
                        setCvData(adapted.cvData);
                        if (adapted.cssVariables) {
                            setCssVariables(adapted.cssVariables);
                        }
                        if (adapted.quality) {
                            setQualityMetrics(adapted.quality);
                        }
                    } catch (e) {
                        setCvData(cv);
                    }

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

    // [FIX #8] Reconvertir avec debounce 300ms (évite cascade de re-renders quand on glisse un slider)
    const reconvertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => {
        if (!state.widgets) return;
        if (reconvertTimerRef.current) clearTimeout(reconvertTimerRef.current);
        reconvertTimerRef.current = setTimeout(() => {
            convertWidgetsToCVData(state.widgets!, templateId, convertOptions, state.jobOfferContext);
        }, 300);
        return () => { if (reconvertTimerRef.current) clearTimeout(reconvertTimerRef.current); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [templateId, convertOptions, state.widgets, state.jobOfferContext, advancedFiltersEnabled, advancedMinScoreBySection, ragData]);

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
                                    Analyse requise
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
        <DashboardLayout>
            <div className="pb-12">
                <header className="border-b bg-white z-30 sticky top-16">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-indigo-600" />
                                <div>
                                    <h1 className="text-base sm:text-lg font-semibold text-slate-900">
                                        CV Builder
                                    </h1>
                                    <p className="text-xs sm:text-sm text-slate-600">
                                        Personnalisez et exportez votre CV
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap justify-end">
                                <Button
                                    variant={viewMode === "multi" ? "primary" : "outline"}
                                    size="sm"
                                    onClick={() => setViewMode(viewMode === "single" ? "multi" : "single")}
                                    disabled={!cvData}
                                    className="hidden sm:inline-flex"
                                >
                                    {viewMode === "single" ? "Comparer" : "Vue unique"}
                                </Button>
                                <Button
                                    variant={showEditor ? "primary" : "outline"}
                                    size="sm"
                                    onClick={() => setShowEditor(!showEditor)}
                                    disabled={!cvData}
                                >
                                    {showEditor ? "Masquer" : "Réorganiser"}
                                </Button>
                                {cvData && (
                                    <>
                                        <ExportMenu
                                            cvData={reorderedCV || cvData || {} as RendererResumeSchema}
                                            widgets={state.widgets ?? undefined}
                                            template={templateId}
                                            filename="CV"
                                            jobAnalysisId={analysisId}
                                            onWidgetsExport={state.widgets ? async () => {
                                                const validation = validateAIWidgetsEnvelope(state.widgets!);
                                                if (!validation.success) { toast.error("Format widgets invalide"); return; }
                                                const dataStr = JSON.stringify(state.widgets, null, 2);
                                                const dataBlob = new Blob([dataStr], { type: "application/json" });
                                                const url = URL.createObjectURL(dataBlob);
                                                const link = document.createElement("a");
                                                link.href = url;
                                                link.download = `widgets_${analysisId}_${new Date().toISOString().split("T")[0]}.json`;
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                                URL.revokeObjectURL(url);
                                                toast.success("Widgets JSON exportés", { duration: 2000 });
                                            } : undefined}
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
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRefresh}
                                    disabled={state.isLoading}
                                    title="Relancer la génération IA et vider le cache"
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

                    {/* Avertissement quand pas de contexte d'offre d'emploi */}
                    {state.widgets && !state.jobOfferContext && (
                        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <p>Aucune offre d'emploi associée — le CV affiche tout votre profil. Les filtres par pertinence n'auront pas d'effet.</p>
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
                                            onReset={resetOrder}
                                        />
                                    </div>
                                )}
                                {viewMode === "multi" ? (
                                    <MultiTemplatePreview
                                        cvData={reorderedCV || cvData}
                                        onTemplateSelect={handleMultiPreviewSelect}
                                    />
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                                        {/* Sidebar : Contrôles (scrollable) — ordre inversé sur mobile pour voir le CV d'abord */}
                                        <aside className="space-y-3 lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto lg:pr-1 order-2 lg:order-1">
                                            {/* ── Section 1 : Modèle (dropdown groupé) ── */}
                                            <Card>
                                                <CardContent className="pt-4 pb-3 space-y-3">
                                                    <label className="text-xs font-medium text-slate-700">Modèle</label>
                                                    <select
                                                        value={templateId}
                                                        onChange={(e) => handleTemplateChange(e.target.value)}
                                                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                                                    >
                                                        {filteredTemplates.filter((t) => t.source === "reactive-resume").length > 0 && (
                                                            <optgroup label="Reactive Resume">
                                                                {filteredTemplates.filter((t) => t.source === "reactive-resume").map((t) => (
                                                                    <option key={t.id} value={t.id}>{t.name}</option>
                                                                ))}
                                                            </optgroup>
                                                        )}
                                                        {filteredTemplates.filter((t) => t.source === "cv-crush").length > 0 && (
                                                            <optgroup label="CV-Crush Premium">
                                                                {filteredTemplates.filter((t) => t.source === "cv-crush").map((t) => (
                                                                    <option key={t.id} value={t.id}>{t.name}</option>
                                                                ))}
                                                            </optgroup>
                                                        )}
                                                    </select>
                                                </CardContent>
                                            </Card>

                                            {/* ── Section 2 : Style (compact) ── */}
                                            <Card>
                                                <CardContent className="pt-4 pb-3 space-y-3">
                                                    {/* Couleurs */}
                                                    <div>
                                                        <label className="text-xs font-medium text-slate-700 mb-1.5 block">Couleur</label>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => setColorwayId("default")}
                                                                title="Défaut"
                                                                className={`h-6 w-6 rounded-full border bg-white text-[8px] font-bold ${colorwayId === "default" ? "ring-2 ring-indigo-500 ring-offset-1" : "border-slate-300"}`}
                                                            >
                                                                D
                                                            </button>
                                                            {CV_COLORWAYS.map((c) => (
                                                                <button
                                                                    key={c.id}
                                                                    type="button"
                                                                    onClick={() => setColorwayId(c.id)}
                                                                    title={c.name}
                                                                    className={`h-6 w-6 rounded-full border ${colorwayId === c.id ? "ring-2 ring-indigo-500 ring-offset-1" : "border-slate-300"}`}
                                                                    style={{ backgroundColor: c.primary }}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Espacement + Police côte à côte */}
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="text-xs font-medium text-slate-700 mb-1.5 block">Espacement</label>
                                                            <div className="flex gap-1">
                                                                {CV_DENSITIES.map((d) => (
                                                                    <button
                                                                        key={d.id}
                                                                        onClick={() => setDensity(d.id)}
                                                                        className={`flex-1 px-1.5 py-1 text-[10px] font-medium rounded border transition-colors ${density === d.id ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"}`}
                                                                    >
                                                                        {d.name}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-medium text-slate-700 mb-1.5 block">Police</label>
                                                            <div className="flex gap-1">
                                                                {CV_FONTS.map((f) => (
                                                                    <button
                                                                        key={f.id}
                                                                        onClick={() => setFontId(f.id)}
                                                                        className={`flex-1 px-1.5 py-1 text-[10px] font-medium rounded border transition-colors ${fontId === f.id ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"}`}
                                                                    >
                                                                        {f.name}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Toggle photo */}
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-xs text-slate-600">Inclure photo</label>
                                                        <Switch checked={includePhoto} onCheckedChange={setIncludePhoto} />
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* ── Section 3 : Contenu (collapsible, fermée par défaut) ── */}
                                            <Card>
                                                <button
                                                    type="button"
                                                    className="w-full flex items-center justify-between px-4 py-3 text-left"
                                                    onClick={() => setShowAdvancedFilters((v) => !v)}
                                                >
                                                    <span className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                                                        <SlidersHorizontal className="w-3.5 h-3.5" />
                                                        Contenu du CV
                                                    </span>
                                                    {showAdvancedFilters ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                                </button>
                                                {showAdvancedFilters && (
                                                    <CardContent className="pt-0 pb-3 space-y-3 text-xs">
                                                        {/* Pertinence minimum */}
                                                        <div>
                                                            <label className="text-slate-600 mb-1 block">
                                                                Pertinence : {convertOptions.minScore}%
                                                            </label>
                                                            <input
                                                                type="range"
                                                                min="0"
                                                                max="100"
                                                                value={convertOptions.minScore}
                                                                onChange={(e) => setConvertOptions((prev) => ({ ...prev, minScore: Number(e.target.value) }))}
                                                                className="w-full accent-indigo-600"
                                                            />
                                                        </div>

                                                        {/* Expériences */}
                                                        <div>
                                                            <label className="text-slate-600 mb-1 block">
                                                                Expériences : {Math.min(convertOptions.maxExperiences ?? 20, maxCounts?.experiences || 20)} / {maxCounts?.experiences || 20}
                                                            </label>
                                                            <input
                                                                type="range"
                                                                min="1"
                                                                max={maxCounts?.experiences || 20}
                                                                value={convertOptions.maxExperiences ?? (maxCounts?.experiences || 20)}
                                                                onChange={(e) => setConvertOptions((prev) => ({ ...prev, maxExperiences: Number(e.target.value) }))}
                                                                className="w-full accent-indigo-600"
                                                            />
                                                        </div>

                                                        {/* Réalisations */}
                                                        <div>
                                                            <label className="text-slate-600 mb-1 block">
                                                                Réalisations/exp : {Math.min(convertOptions.maxBulletsPerExperience ?? 10, maxCounts?.maxRealisationsPerExp || 10)} / {maxCounts?.maxRealisationsPerExp || 10}
                                                            </label>
                                                            <input
                                                                type="range"
                                                                min="1"
                                                                max={maxCounts?.maxRealisationsPerExp || 10}
                                                                value={convertOptions.maxBulletsPerExperience ?? (maxCounts?.maxRealisationsPerExp || 10)}
                                                                onChange={(e) => setConvertOptions((prev) => ({ ...prev, maxBulletsPerExperience: Number(e.target.value) }))}
                                                                className="w-full accent-indigo-600"
                                                            />
                                                        </div>

                                                        {/* Sliders secondaires — cachés derrière "Plus d'options" */}
                                                        {(
                                                            (maxCounts?.maxClientsPerExp ?? 0) > 0 ||
                                                            (maxCounts?.clientsReferences ?? 0) > 0 ||
                                                            (maxCounts?.skills ?? 0) > 1 ||
                                                            (maxCounts?.formations ?? 0) > 1 ||
                                                            (maxCounts?.langues ?? 0) > 1 ||
                                                            (maxCounts?.certifications ?? 0) > 1 ||
                                                            (maxCounts?.projects ?? 0) > 1
                                                        ) && (
                                                                <details className="group">
                                                                    <summary className="text-[11px] text-indigo-600 cursor-pointer hover:text-indigo-700 select-none py-1">
                                                                        Plus d'options…
                                                                    </summary>
                                                                    <div className="mt-2 space-y-3 pl-1">
                                                                        {(maxCounts?.maxClientsPerExp ?? 0) > 0 && (
                                                                            <div>
                                                                                <label className="text-slate-600 mb-1 block">
                                                                                    Clients/exp : {convertOptions.limitsBySection?.maxClientsPerExperience ?? (maxCounts?.maxClientsPerExp || 6)} / {maxCounts?.maxClientsPerExp || 6}
                                                                                </label>
                                                                                <input type="range" min="0" max={maxCounts?.maxClientsPerExp || 6} value={convertOptions.limitsBySection?.maxClientsPerExperience ?? (maxCounts?.maxClientsPerExp || 6)} onChange={(e) => setConvertOptions((prev) => ({ ...prev, limitsBySection: { ...(prev.limitsBySection || {}), maxClientsPerExperience: Number(e.target.value) } }))} className="w-full accent-indigo-600" />
                                                                            </div>
                                                                        )}
                                                                        {(maxCounts?.clientsReferences ?? 0) > 0 && (
                                                                            <div>
                                                                                <label className="text-slate-600 mb-1 block">
                                                                                    Clients références : {convertOptions.limitsBySection?.maxClientsReferences ?? (maxCounts?.clientsReferences || 25)} / {maxCounts?.clientsReferences || 25}
                                                                                </label>
                                                                                <input type="range" min="0" max={maxCounts?.clientsReferences || 25} value={convertOptions.limitsBySection?.maxClientsReferences ?? (maxCounts?.clientsReferences || 25)} onChange={(e) => setConvertOptions((prev) => ({ ...prev, limitsBySection: { ...(prev.limitsBySection || {}), maxClientsReferences: Number(e.target.value) } }))} className="w-full accent-indigo-600" />
                                                                            </div>
                                                                        )}
                                                                        {(maxCounts?.skills ?? 0) > 1 && (
                                                                            <div>
                                                                                <label className="text-slate-600 mb-1 block">Compétences : {convertOptions.limitsBySection?.maxSkills ?? (maxCounts?.skills || 20)} / {maxCounts?.skills || 20}</label>
                                                                                <input type="range" min="0" max={maxCounts?.skills || 20} value={convertOptions.limitsBySection?.maxSkills ?? (maxCounts?.skills || 20)} onChange={(e) => setConvertOptions((prev) => ({ ...prev, limitsBySection: { ...(prev.limitsBySection || {}), maxSkills: Number(e.target.value) } }))} className="w-full accent-indigo-600" />
                                                                            </div>
                                                                        )}
                                                                        {(maxCounts?.formations ?? 0) > 1 && (
                                                                            <div>
                                                                                <label className="text-slate-600 mb-1 block">Formations : {convertOptions.limitsBySection?.maxFormations ?? (maxCounts?.formations || 5)} / {maxCounts?.formations || 5}</label>
                                                                                <input type="range" min="0" max={maxCounts?.formations || 5} value={convertOptions.limitsBySection?.maxFormations ?? (maxCounts?.formations || 5)} onChange={(e) => setConvertOptions((prev) => ({ ...prev, limitsBySection: { ...(prev.limitsBySection || {}), maxFormations: Number(e.target.value) } }))} className="w-full accent-indigo-600" />
                                                                            </div>
                                                                        )}
                                                                        {(maxCounts?.langues ?? 0) > 1 && (
                                                                            <div>
                                                                                <label className="text-slate-600 mb-1 block">Langues : {convertOptions.limitsBySection?.maxLanguages ?? (maxCounts?.langues || 10)} / {maxCounts?.langues || 10}</label>
                                                                                <input type="range" min="0" max={maxCounts?.langues || 10} value={convertOptions.limitsBySection?.maxLanguages ?? (maxCounts?.langues || 10)} onChange={(e) => setConvertOptions((prev) => ({ ...prev, limitsBySection: { ...(prev.limitsBySection || {}), maxLanguages: Number(e.target.value) } }))} className="w-full accent-indigo-600" />
                                                                            </div>
                                                                        )}
                                                                        {(maxCounts?.certifications ?? 0) > 1 && (
                                                                            <div>
                                                                                <label className="text-slate-600 mb-1 block">Certifications : {convertOptions.limitsBySection?.maxCertifications ?? (maxCounts?.certifications || 10)} / {maxCounts?.certifications || 10}</label>
                                                                                <input type="range" min="0" max={maxCounts?.certifications || 10} value={convertOptions.limitsBySection?.maxCertifications ?? (maxCounts?.certifications || 10)} onChange={(e) => setConvertOptions((prev) => ({ ...prev, limitsBySection: { ...(prev.limitsBySection || {}), maxCertifications: Number(e.target.value) } }))} className="w-full accent-indigo-600" />
                                                                            </div>
                                                                        )}
                                                                        {(maxCounts?.projects ?? 0) > 1 && (
                                                                            <div>
                                                                                <label className="text-slate-600 mb-1 block">Projets : {convertOptions.limitsBySection?.maxProjects ?? (maxCounts?.projects || 5)} / {maxCounts?.projects || 5}</label>
                                                                                <input type="range" min="0" max={maxCounts?.projects || 5} value={convertOptions.limitsBySection?.maxProjects ?? (maxCounts?.projects || 5)} onChange={(e) => setConvertOptions((prev) => ({ ...prev, limitsBySection: { ...(prev.limitsBySection || {}), maxProjects: Number(e.target.value) } }))} className="w-full accent-indigo-600" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </details>
                                                            )}

                                                        {/* Reset */}
                                                        <button
                                                            type="button"
                                                            className="w-full text-[11px] text-slate-500 hover:text-slate-700 py-1"
                                                            onClick={() => {
                                                                // [FIX #2] Reset utilise les vrais max au lieu de valeurs hardcodées
                                                                setConvertOptions({
                                                                    minScore: 0,
                                                                    maxExperiences: maxCounts?.experiences || 20,
                                                                    maxBulletsPerExperience: maxCounts?.maxRealisationsPerExp || 10,
                                                                    limitsBySection: {},
                                                                });
                                                                setIncludePhoto(true);
                                                                setAdvancedFiltersEnabled(false);
                                                                setAdvancedMinScoreBySection({ header: 0, summary: 0, experiences: 0, skills: 0, education: 0, languages: 0, references: 0, projects: 0 });
                                                                toast.success("Filtres réinitialisés");
                                                            }}
                                                        >
                                                            Réinitialiser
                                                        </button>
                                                    </CardContent>
                                                )}
                                            </Card>
                                        </aside>

                                        {/* Main : Preview CV (sticky - toujours visible) */}
                                        <div className="lg:col-span-3 lg:sticky lg:top-[8.5rem] self-start order-1 lg:order-2">
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="text-base flex items-center justify-between">
                                                        <span>Prévisualisation</span>
                                                        {(reorderedCV || cvData) && (
                                                            <Badge variant="outline" className="text-xs font-normal">
                                                                ~{estimatedPages} page{estimatedPages > 1 ? "s" : ""}
                                                            </Badge>
                                                        )}
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="bg-slate-100 flex items-center justify-center p-2 sm:p-4 min-h-[400px] sm:min-h-[800px] overflow-x-auto">
                                                    {reorderedCV || cvData ? (
                                                        <div ref={cvPreviewRef} id="cv-preview-container" className="w-full max-w-[900px] bg-white shadow-lg">
                                                            <CVRenderer
                                                                data={reorderedCV || cvData}
                                                                templateId={templateId}
                                                                dynamicCssVariables={cssVariables}
                                                                colorwayId={colorwayId}
                                                                fontId={fontId}
                                                                density={density}
                                                                includePhoto={includePhoto}
                                                                displayLimits={{
                                                                    maxSkills: convertOptions.limitsBySection?.maxSkills,
                                                                    maxRealisationsPerExp: convertOptions.maxBulletsPerExperience,
                                                                    maxClientsPerExp: convertOptions.limitsBySection?.maxClientsPerExperience,
                                                                    maxClientsReferences: convertOptions.limitsBySection?.maxClientsReferences,
                                                                    maxCertifications: convertOptions.limitsBySection?.maxCertifications,
                                                                    maxProjects: convertOptions.limitsBySection?.maxProjects,
                                                                    maxFormations: convertOptions.limitsBySection?.maxFormations,
                                                                    maxLangues: convertOptions.limitsBySection?.maxLanguages,
                                                                }}
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
        </DashboardLayout>
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
