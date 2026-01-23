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
import CVRenderer from "@/components/cv/CVRenderer";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertCircle, Loader2, Sparkles, Zap, RefreshCw } from "lucide-react";
import { convertWidgetsToCV, convertWidgetsToCVWithValidation, convertWidgetsToCVWithAdvancedScoring, type ConvertOptions } from "@/lib/cv/client-bridge";
import type { JobOfferContext } from "@/lib/cv/relevance-scoring";
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
import { DraggableCV } from "@/components/cv/DraggableCV";
import { ExperienceEditor } from "@/components/cv/ExperienceEditor";
import { useRAGData } from "@/hooks/useRAGData";
import { useCVPreview } from "@/hooks/useCVPreview";
import { useCVReorder } from "@/hooks/useCVReorder";
import { getSupabaseAuthHeader } from "@/lib/supabase";
import Cookies from "js-cookie";

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
    const [convertOptions, setConvertOptions] = useState<ConvertOptions>({
        minScore: 50,
        maxExperiences: 6,
        maxBulletsPerExperience: 6,
    });

    // Récupérer RAG profile pour validation
    const userId = Cookies.get("userId") || null;
    const { data: ragData } = useRAGData(userId);

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
                setState({
                    isLoading: false,
                    error: null,
                    widgets: cached.widgets,
                    metadata: cached.metadata,
                    jobOfferContext: jobContext,
                });
                // Convertir immédiatement avec le template actuel
                convertWidgetsToCVData(cached.widgets, templateId, convertOptions, jobContext);
                return;
            }
        }

        // Générer widgets depuis API
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            // Récupérer headers d'authentification
            const authHeaders = await getSupabaseAuthHeader();
            
            const response = await fetch("/api/cv/generate-widgets", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    ...authHeaders,
                },
                body: JSON.stringify({ analysisId, jobId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Erreur génération widgets");
            }

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

            setState({
                isLoading: false,
                error: null,
                widgets,
                metadata,
                jobOfferContext,
            });

            // Convertir immédiatement avec scoring avancé
            convertWidgetsToCVData(widgets, templateId, convertOptions, jobOfferContext);
        } catch (error: any) {
            setState({
                isLoading: false,
                error: error.message || "Erreur lors de la génération des widgets",
                widgets: null,
                metadata: null,
                jobOfferContext: null,
            });
        }
    }, [analysisId, jobId, templateId, convertOptions]);

    // Convertir widgets → CVData (côté client, instantané) avec validation + scoring avancé
    const convertWidgetsToCVData = useCallback(
        (widgets: AIWidgetsEnvelope, template: string, options: ConvertOptions, jobContext?: JobOfferContext | null) => {
            if (!analysisId) return;

            // Normaliser options
            const normalizedOptions: Required<ConvertOptions> = {
                minScore: options.minScore ?? 50,
                maxExperiences: options.maxExperiences ?? 6,
                maxBulletsPerExperience: options.maxBulletsPerExperience ?? 6,
            };

            // Vérifier cache CVData d'abord (sans validation pour performance)
            const cached = getCVDataFromCache(analysisId, template);
            if (cached && JSON.stringify(cached.options) === JSON.stringify(normalizedOptions)) {
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
                                normalizedOptions,
                                true
                            );
                            setValidationResult(validation);
                        } else {
                            const { validation } = convertWidgetsToCVWithValidation(widgets, ragData, normalizedOptions);
                            setValidationResult(validation);
                        }
                    } catch (error) {
                        console.error("Erreur validation:", error);
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
                            normalizedOptions,
                            true
                        );
                        setCvData(cv);
                        setValidationResult(validation);
                        // Sauvegarder dans cache
                        saveCVDataToCache(analysisId, template, cv, normalizedOptions);
                    } else {
                        // Fallback avec validation simple si pas de jobContext
                        const { cvData: cv, validation } = convertWidgetsToCVWithValidation(widgets, ragData, normalizedOptions);
                        setCvData(cv);
                        setValidationResult(validation);
                        saveCVDataToCache(analysisId, template, cv, normalizedOptions);
                    }
                } else {
                    // Fallback sans validation si RAG non disponible
                    const cv = convertWidgetsToCV(widgets, normalizedOptions);
                    setCvData(cv);
                    setValidationResult(null);
                    saveCVDataToCache(analysisId, template, cv, normalizedOptions);
                }
            } catch (error: any) {
                console.error("Erreur conversion widgets:", error);
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
                            {state.metadata && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 border border-indigo-100">
                                    <Zap className="w-3 h-3" />
                                    {state.metadata.widgetsCount} widgets
                                </span>
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
                                <PDFExportButton
                                    elementId="cv-preview-container"
                                    filename={`CV_${cvData.profil.prenom}_${cvData.profil.nom}`}
                                    variant="primary"
                                    size="sm"
                                />
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
                            <div className="flex items-center justify-center gap-3 py-8">
                                <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                                <span className="text-sm text-slate-600">
                                    Génération des widgets en cours...
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {state.error && (
                    <Card className="mb-6 border-red-200 bg-red-50">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="text-sm font-semibold text-red-900 mb-1">
                                        Erreur
                                    </h3>
                                    <p className="text-sm text-red-700">{state.error}</p>
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
                                        onReorder={reorderExperiences}
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

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-sm">Options</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4 text-xs">
                                            <div>
                                                <label className="block text-slate-600 mb-1">
                                                    Score minimum: {convertOptions.minScore}
                                                </label>
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
                                            </div>
                                            <div>
                                                <label className="block text-slate-600 mb-1">
                                                    Max expériences: {convertOptions.maxExperiences}
                                                </label>
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
                                            </div>
                                            <div>
                                                <label className="block text-slate-600 mb-1">
                                                    Max bullets/exp: {convertOptions.maxBulletsPerExperience}
                                                </label>
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
