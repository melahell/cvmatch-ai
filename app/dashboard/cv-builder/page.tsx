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

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertCircle, Loader2, Sparkles, Zap, RefreshCw, Download, FileJson } from "lucide-react";
import { convertWidgetsToCV, convertWidgetsToCVWithValidation, convertWidgetsToCVWithAdvancedScoring, type ConvertOptions } from "@/lib/cv/client-bridge";
import type { JobOfferContext } from "@/lib/cv/relevance-scoring";
import { validateAIWidgetsEnvelope } from "@/lib/cv/ai-widgets";
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
import { PDFExportButton } from "@/components/cv/PDFExportButton";
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

// Lazy load CVRenderer (heavy component with templates)
const CVRenderer = dynamic(() => import("@/components/cv/CVRenderer"), {
    loading: () => <div className="flex items-center justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>,
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

    const [templateId, setTemplateId] = useState<string>("modern");
    const [cvData, setCvData] = useState<RendererResumeSchema | null>(null);
    const [validationResult, setValidationResult] = useState<any>(null);
    const [viewMode, setViewMode] = useState<"single" | "multi">("single");
    const [showEditor, setShowEditor] = useState<boolean>(false);
    const [showWidgetEditor, setShowWidgetEditor] = useState<boolean>(false);
    const [loadingStep, setLoadingStep] = useState<string | null>(null);
    const [errorAction, setErrorAction] = useState<{ action?: string; actionLabel?: string } | null>(null);
    // DEFAULTS: PAS DE FILTRAGE - l'utilisateur contrôle via sliders UI
    const [convertOptions, setConvertOptions] = useState<ConvertOptions>({
        minScore: 0,                  // Afficher tout par défaut
        maxExperiences: 10,           // 10 expériences par défaut (ajustable)
        maxBulletsPerExperience: 10,  // 10 bullets par expérience (ajustable)
    });

    // Récupérer RAG profile pour validation
    const userId = Cookies.get("userId") || null;
    const { data: ragData } = useRAGData(userId);

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

        try {
            // Récupérer headers d'authentification
            const authHeaders = await getSupabaseAuthHeader();
            
            setLoadingStep("Génération des widgets IA (cela peut prendre 10-20 secondes)...");
            const response = await fetch("/api/cv/generate-widgets", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    ...authHeaders,
                },
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
        }
    }, [analysisId, jobId, templateId, convertOptions]);

    // Convertir widgets → CVData (côté client, instantané) avec validation + scoring avancé
    const convertWidgetsToCVData = useCallback(
        (widgets: AIWidgetsEnvelope, template: string, options: ConvertOptions, jobContext?: JobOfferContext | null) => {
            if (!analysisId) return;

            // Normaliser options pour le cache (sans ragProfile)
            // DEFAULTS: PAS DE FILTRAGE - l'utilisateur contrôle via UI
            const cacheOptions = {
                minScore: options.minScore ?? 0,               // Pas de filtrage par score
                maxExperiences: options.maxExperiences ?? 99,  // Pas de limite
                maxBulletsPerExperience: options.maxBulletsPerExperience ?? 99, // Pas de limite
            };

            // Options complètes pour la conversion (avec ragProfile)
            const convertOptions: ConvertOptions = {
                ...cacheOptions,
                ragProfile: options.ragProfile ?? ragData,
            };

            // Vérifier cache CVData d'abord (sans validation pour performance)
            const cached = getCVDataFromCache(analysisId, template);
            if (cached && JSON.stringify(cached.options) === JSON.stringify(cacheOptions)) {
                setCvData(cached.cvData);
                // Toujours valider même si en cache (pour afficher warnings)
                if (ragData) {
                    try {
                        // Utiliser scoring avancé si jobContext disponible
                        if (jobContext) {
                            const { validation } = convertWidgetsToCVWithAdvancedScoring(
                                widgets,
                                ragData,
                                jobContext,
                                convertOptions,
                                true
                            );
                            setValidationResult(validation);
                        } else {
                            const { validation } = convertWidgetsToCVWithValidation(widgets, ragData, convertOptions);
                            setValidationResult(validation);
                        }
                    } catch (error) {
                        logger.error("Erreur validation", { error });
                    }
                }
                return;
            }

            // Convertir avec validation + scoring avancé si RAG disponible
            try {
                if (ragData) {
                    // Utiliser scoring avancé si jobContext disponible
                    if (jobContext) {
                        const { cvData: cv, validation } = convertWidgetsToCVWithAdvancedScoring(
                            widgets,
                            ragData,
                            jobContext,
                            convertOptions,
                            true
                        );
                        setCvData(cv);
                        setValidationResult(validation);
                        // Sauvegarder dans cache
                        saveCVDataToCache(analysisId, template, cv, cacheOptions);
                    } else {
                        // Fallback avec validation simple si pas de jobContext
                        const { cvData: cv, validation } = convertWidgetsToCVWithValidation(widgets, ragData, convertOptions);
                        setCvData(cv);
                        setValidationResult(validation);
                        saveCVDataToCache(analysisId, template, cv, cacheOptions);
                    }
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
        [analysisId, ragData]
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
    }, [templateId, convertOptions, state.widgets, state.jobOfferContext]);

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
                                        onPDFExport={() => {
                                            const element = document.getElementById("cv-preview-container");
                                            if (element) {
                                                window.print();
                                            }
                                        }}
                                    />
                                    <PDFExportButton
                                        elementId="cv-preview-container"
                                        filename={`CV_${cvData.profil.prenom}_${cvData.profil.nom}`}
                                        variant="primary"
                                        size="sm"
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
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center justify-center gap-3 py-8">
                                <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                                <div className="text-center">
                                    <span className="text-sm font-medium text-slate-900 block mb-1">
                                        {loadingStep || "Génération en cours..."}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        Veuillez patienter, cela peut prendre quelques instants
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
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
                                            {TEMPLATES.filter((t) => t.available).map((template) => (
                                                <Button
                                                    key={template.id}
                                                    variant={templateId === template.id ? "primary" : "outline"}
                                                    size="sm"
                                                    className="w-full justify-start"
                                                    onClick={() => handleTemplateChange(template.id)}
                                                >
                                                    {template.name}
                                                </Button>
                                            ))}
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

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-sm flex items-center gap-2">
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
                                                                    Ajustez ces paramètres pour contrôler quels éléments apparaissent dans votre CV et en quelle quantité.
                                                                </p>
                                                            </div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4 text-xs">
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <label className="block text-slate-600">
                                                        Score minimum: {convertOptions.minScore}
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
                                                    max="10"
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
                                                    {cvData && `Affichera ${Math.min(convertOptions.maxExperiences ?? 6, cvData.experiences.length)} expérience(s) sur ${cvData.experiences.length} disponible(s)`}
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
                                        </CardContent>
                                    </Card>
                                </aside>

                                {/* Main : Preview CV */}
                                <div className="lg:col-span-3">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">
                                                Prévisualisation CV - Template {templateId}
                                            </CardTitle>
                                        </CardHeader>
                                <CardContent className="bg-slate-100 flex items-center justify-center p-4 min-h-[800px]">
                                    {reorderedCV || cvData ? (
                                        <div id="cv-preview-container" className="w-full max-w-[900px] bg-white shadow-lg">
                                            <CVRenderer
                                                data={reorderedCV || cvData}
                                                templateId={templateId}
                                                includePhoto={true}
                                                dense={false}
                                            />
                                        </div>
                                    ) : (
                                        <div className="text-center text-slate-500 text-sm">
                                            <AlertCircle className="w-5 h-5 mx-auto mb-2" />
                                            <p>Chargement du CV...</p>
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
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-sm text-slate-600">Chargement...</p>
                </div>
            </div>
        }>
            <CVBuilderContent />
        </Suspense>
    );
}
