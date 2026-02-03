"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useRAGData } from "@/hooks/useRAGData";
import { useDocuments } from "@/hooks/useDocuments";
import { useProfileForm } from "@/hooks/useProfileForm";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Eye, Target, FileText, Settings, Save, RefreshCw, Loader2, Upload, ExternalLink, AlertTriangle, PlusCircle, Trash2, Sparkles } from "lucide-react";
import { ValidationWarnings } from "@/components/profile/ValidationWarnings";
import { OverviewTab } from "@/components/profile/OverviewTab";
import { WeightTab } from "@/components/profile/WeightTab";
import { AdvancedTab } from "@/components/profile/AdvancedTab";
import { DocumentsTab } from "@/components/profile/DocumentsTab";
import { ContexteEnrichiTab } from "@/components/profile/ContexteEnrichiTab";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { createSupabaseClient } from "@/lib/supabase";
import { getSupabaseAuthHeader } from "@/lib/supabase";
import { logger } from "@/lib/utils/logger";
import { ContextualLoader } from "@/components/loading/ContextualLoader";
import { toast } from "sonner";

function ProfileContent() {
    const searchParams = useSearchParams();
    const activeTab = searchParams.get("tab") || "vue";
    const { userId, isLoading: authLoading } = useAuth();

    // ROUGE #1: Single source of truth with useProfileForm hook
    const {
        data: ragData,
        loading: ragLoading,
        saving,
        errors,
        updateField,
        saveProfile,
        refetch
    } = useProfileForm(userId);

    const { data: documents, loading: docsLoading, deleteDocument, refetch: refetchDocs } = useDocuments(userId);

    // Local state only for UI-specific functionality
    const [regenerating, setRegenerating] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [customNotes, setCustomNotes] = useState("");
    const [showModeDialog, setShowModeDialog] = useState(false);

    // Progress tracking for ContextualLoader
    const [currentDocName, setCurrentDocName] = useState("");
    const [currentDocIndex, setCurrentDocIndex] = useState(0);
    const [totalDocsCount, setTotalDocsCount] = useState(0);
    const [regenProgress, setRegenProgress] = useState(0);

    const [validationData, setValidationData] = useState<{
        warnings?: any[];
        suggestions?: string[];
        quality_breakdown?: { overall: number; completeness: number; quality: number; impact: number };
    } | null>(null);

    // Load custom notes
    useEffect(() => {
        if (ragData && userId) {
            const loadNotes = async () => {
                const supabase = createSupabaseClient();
                const { data } = await supabase
                    .from("rag_metadata")
                    .select("custom_notes")
                    .eq("user_id", userId)
                    .single();
                if (data?.custom_notes) setCustomNotes(data.custom_notes);
            };
            loadNotes();
        }
    }, [ragData, userId]);

    const addDefaultWeights = (data: any) => {
        if (!data) return data;

        const enriched = { ...data };

        // Add weight to experiences
        if (enriched.experiences) {
            enriched.experiences = enriched.experiences.map((exp: any) => ({
                ...exp,
                weight: exp.weight || "inclus"
            }));
        }

        // Add weight to skills
        if (enriched.competences?.techniques) {
            enriched.competences.techniques = enriched.competences.techniques.map((skill: string | any) =>
                typeof skill === "string" ? { nom: skill, weight: "inclus" } : { ...skill, weight: skill.weight || "inclus" }
            );
        }

        // Add weight to formations
        if (enriched.formations) {
            enriched.formations = enriched.formations.map((f: any) => ({
                ...f,
                weight: f.weight || "inclus"
            }));
        }

        return enriched;
    };

    const handleWeightChange = async (section: string, index: number, newWeight: "important" | "inclus" | "exclu") => {
        if (!ragData) return;

        const updated = { ...ragData };
        if (section === "experiences") {
            if (updated.experiences && updated.experiences[index]) {
                updated.experiences[index].weight = newWeight;
            }
        } else if (section === "competences.techniques") {
            if (updated.competences?.techniques && updated.competences.techniques[index]) {
                updated.competences.techniques[index].weight = newWeight;
            }
        } else if (section === "formations") {
            if (updated.formations && updated.formations[index]) {
                updated.formations[index].weight = newWeight;
            }
        }

        await saveProfile(updated);
    };

    const saveWeights = async () => {
        if (!userId || !ragData) return;
        try {
            const authHeaders = await getSupabaseAuthHeader();
            const res = await fetch("/api/rag/update", {
                method: "POST",
                headers: { "Content-Type": "application/json", ...authHeaders },
                credentials: "include",
                body: JSON.stringify({ ragData, customNotes }),
            });
            if (!res.ok) {
                const payload = await res.json().catch(() => null);
                throw new Error(payload?.error || "Erreur lors de la sauvegarde");
            }

            logger.success("Profil sauvegardé !");
            toast.success("Profil sauvegardé avec succès !");
            await refetch();
        } catch (e) {
            logger.error("Error saving profile:", e);
            toast.error("Erreur lors de la sauvegarde");
        }
    };

    // Open mode dialog instead of regenerating directly
    const handleRegenerateClick = () => {
        if (!userId || !documents || documents.length === 0) {
            toast.warning("Aucun document à traiter");
            return;
        }
        setShowModeDialog(true);
    };

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const regenerateProfile = async (mode: "completion" | "regeneration") => {
        if (!userId || !documents || documents.length === 0) {
            toast.warning("Aucun document à traiter");
            return;
        }

        setShowModeDialog(false);

        setRegenerating(true);
        const totalDocs = documents.length;
        setTotalDocsCount(totalDocs);
        let processed = 0;
        let successCount = 0;
        let failureCount = 0;

        try {
            logger.info(`[INCREMENTAL CONTEXT-AWARE] Starting regeneration for ${totalDocs} document(s)`, { mode });

            // Process each document sequentially WITH CONTEXT ACCUMULATION
            // Each document sees the accumulated RAG from previous documents
            // This allows Gemini to enrich intelligently: A → A+B → A+B+C
            for (let i = 0; i < documents.length; i++) {
                const doc = documents[i];
                const isFirstDocument = i === 0;
                processed++;
                setCurrentDocIndex(processed);
                setCurrentDocName(doc.filename);
                setRegenProgress(Math.round((processed / totalDocs) * 100));
                logger.info(`[INCREMENTAL] Processing ${processed}/${totalDocs}: ${doc.filename}`, { mode, isFirstDocument });

                const authHeaders = await getSupabaseAuthHeader();
                let res: Response | null = null;
                let lastError: any = null;

                for (let attempt = 0; attempt < 3; attempt++) {
                    res = await fetch("/api/rag/generate-incremental", {
                        method: "POST",
                        headers: { "Content-Type": "application/json", ...authHeaders },
                        credentials: "include",
                        body: JSON.stringify({
                            documentId: doc.id,
                            mode,
                            isFirstDocument,
                            isLastDocument: i === documents.length - 1,
                        }),
                    });

                    if (res.ok) break;

                    const error = await res.json().catch(() => null);
                    lastError = error;

                    if (res.status === 429) {
                        const retryAfterSec =
                            Number(error?.retryAfter) ||
                            Number(res.headers.get("Retry-After")) ||
                            0;
                        if (retryAfterSec > 0) {
                            await sleep((retryAfterSec + 1) * 1000);
                            continue;
                        }
                    }

                    const errorCode = error?.errorCode || error?.code || null;
                    if (res.status === 503 && errorCode === "GEMINI_TIMEOUT") {
                        await sleep((attempt + 1) * 2000);
                        continue;
                    }

                    break;
                }

                if (!res || !res.ok) {
                    failureCount++;
                    logger.error(`[INCREMENTAL] Failed for ${doc.filename}:`, {
                        status: res?.status,
                        error: lastError,
                    });

                    const errorCode = lastError?.errorCode || lastError?.code || null;
                    const baseMessage = lastError?.error || "Échec";
                    const details = typeof lastError?.details === "string" ? lastError.details : null;
                    const hint =
                        errorCode === "GEMINI_TIMEOUT"
                            ? "IA indisponible/timeout (réessaie dans 1-2 min)."
                            : errorCode === "RATE_LIMIT_EXCEEDED"
                                ? "Limite atteinte (attends un peu puis relance)."
                            : null;

                    toast.error(
                        `Erreur sur ${doc.filename}: ${baseMessage}${hint ? ` — ${hint}` : ""}${details ? ` (${details})` : ""}`
                    );
                    continue; // Continue with next document
                }

                const result = await res.json();
                logger.success(`[INCREMENTAL] ${doc.filename} processed - Score: ${result.qualityScore}`);
                successCount++;

                // Store validation data from last document (will have merged all previous)
                if (processed === totalDocs && result.validation) {
                    setValidationData({
                        warnings: result.validation?.warnings,
                        suggestions: result.suggestions,
                        quality_breakdown: result.quality_breakdown
                    });
                }

                // Afficher stats de merge si disponibles (mode completion)
                if (mode === "completion" && result.mergeStats) {
                    const stats = result.mergeStats;
                    toast.success(
                        `Fusion réussie: ${stats.itemsAdded || 0} ajoutés, ${stats.itemsUpdated || 0} mis à jour, ${stats.itemsKept || 0} conservés`,
                        { duration: 5000 }
                    );
                }
            }

            // Refetch the final merged RAG
            await refetch();
            await refetchDocs();

            if (successCount === 0) {
                toast.error(`Régénération échouée: 0/${totalDocs} document(s) traité(s)`);
                return;
            }

            if (failureCount > 0) {
                toast.warning(`Régénération partielle: ${successCount}/${totalDocs} document(s) traités`);
                return;
            }

            toast.success(`Profil régénéré avec succès! ${successCount}/${totalDocs} document(s) traité(s)`);

        } catch (e) {
            logger.error("Error in incremental regeneration:", e);
            toast.error(`Erreur après traitement de ${successCount}/${totalDocs} documents`);
        } finally {
            setRegenerating(false);
        }

    };

    const handleUpload = async (file: File) => {
        if (!userId) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("files", file);
            const authHeaders = await getSupabaseAuthHeader();

            const res = await fetch("/api/rag/upload", {
                method: "POST",
                headers: authHeaders,
                credentials: "include",
                body: formData,
            });

            if (res.ok) {
                const payload = await res.json().catch(() => null);
                await refetchDocs();
                const uploaded = Array.isArray(payload?.uploads) ? payload.uploads : [];
                const docId = uploaded.find((u: any) => u?.success && u?.documentId)?.documentId as string | undefined;

                if (docId) {
                    toast.success("Document uploadé. Mise à jour du profil en cours…", { duration: 4000 });
                    void (async () => {
                        try {
                            const authHeaders2 = await getSupabaseAuthHeader();
                            let genRes: Response | null = null;
                            let genErr: any = null;

                            for (let attempt = 0; attempt < 3; attempt++) {
                                genRes = await fetch("/api/rag/generate-incremental", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json", ...authHeaders2 },
                                    credentials: "include",
                                    body: JSON.stringify({ documentId: docId, mode: "completion", isFirstDocument: true, isLastDocument: true }),
                                });
                                if (genRes.ok) break;
                                genErr = await genRes.json().catch(() => null);

                                if (genRes.status === 429) {
                                    const retryAfterSec =
                                        Number(genErr?.retryAfter) ||
                                        Number(genRes.headers.get("Retry-After")) ||
                                        0;
                                    if (retryAfterSec > 0) {
                                        await sleep((retryAfterSec + 1) * 1000);
                                        continue;
                                    }
                                }

                                const errorCode = genErr?.errorCode || genErr?.code || null;
                                if (genRes.status === 503 && errorCode === "GEMINI_TIMEOUT") {
                                    await sleep((attempt + 1) * 2000);
                                    continue;
                                }

                                break;
                            }

                            if (!genRes || !genRes.ok) {
                                toast.warning(`Génération du profil échouée: ${genErr?.error || "réessayez"}`);
                                return;
                            }

                            await refetch();
                            await refetchDocs();
                            toast.success("Profil mis à jour !");
                        } catch (e) {
                            logger.error("Post-upload RAG generation failed", e);
                            toast.warning("Document uploadé, génération RAG à relancer.");
                        }
                    })();
                } else {
                    toast.success("Document uploadé avec succès ! Régénérez le profil pour l'inclure.");
                }
            } else {
                const error = await res.json();
                toast.error("Erreur: " + (error.error || "Échec de l'upload"));
            }
        } catch (e) {
            logger.error("Error uploading document:", e);
            toast.error("Erreur réseau");
        } finally {
            setUploading(false);
        }
    };

    const handleReset = async () => {
        if (!userId) return;

        try {
            const authHeaders = await getSupabaseAuthHeader();
            const res = await fetch("/api/profile/reset", {
                method: "POST",
                headers: { "Content-Type": "application/json", ...authHeaders },
                credentials: "include",
            });

            if (res.ok) {
                setCustomNotes("");
                await refetch();
                await refetchDocs();
                toast.success("Profil réinitialisé avec succès");
            } else {
                toast.error("Erreur lors de la réinitialisation");
            }
        } catch (e) {
            logger.error("Error resetting profile:", e);
            toast.error("Erreur réseau");
        }
    };

    if (ragLoading || docsLoading || authLoading) {
        return (
            <DashboardLayout>
                <LoadingSpinner fullScreen />
            </DashboardLayout>
        );
    }

    return (
        <>
            {/* Overlay loader - renders ON TOP of page content */}
            {regenerating && (
                <ContextualLoader
                    context="refreshing-profile"
                    userName={(ragData as any)?.prenom || (ragData as any)?.nom || undefined}
                    currentStep={currentDocIndex - 1}
                    totalSteps={totalDocsCount}
                    currentItem={currentDocName}
                    progress={regenProgress}
                    onCancel={() => setRegenerating(false)}
                />
            )}

            {uploading && (
                <ContextualLoader
                    context="importing-docs"
                    onCancel={() => setUploading(false)}
                />
            )}

            {/* Mode Selection Dialog */}
            <Dialog open={showModeDialog} onOpenChange={setShowModeDialog}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <RefreshCw className="w-5 h-5 text-blue-600" />
                            Régénération du profil
                        </DialogTitle>
                        <DialogDescription>
                            Choisissez comment traiter vos documents et mettre à jour votre profil.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Option 1: Completion */}
                        <button
                            onClick={() => regenerateProfile("completion")}
                            className="w-full p-4 rounded-lg border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                        >
                            <div className="flex items-start gap-3">
                                <PlusCircle className="w-6 h-6 text-blue-600 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-slate-900">Compléter mon profil</h4>
                                    <p className="text-sm text-slate-600 mt-1">
                                        Ajoute les nouvelles informations sans supprimer les données existantes.
                                        Fusion intelligente avec déduplication.
                                    </p>
                                    <span className="inline-block mt-2 text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                        Recommandé
                                    </span>
                                </div>
                            </div>
                        </button>

                        {/* Option 2: Regeneration */}
                        <button
                            onClick={() => regenerateProfile("regeneration")}
                            className="w-full p-4 rounded-lg border-2 border-orange-200 hover:border-orange-500 hover:bg-orange-50 transition-all text-left"
                        >
                            <div className="flex items-start gap-3">
                                <Trash2 className="w-6 h-6 text-orange-600 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-slate-900">Régénérer depuis zéro</h4>
                                    <p className="text-sm text-slate-600 mt-1">
                                        Efface le profil existant et recrée tout à partir des documents.
                                        Les préférences utilisateur sont conservées.
                                    </p>
                                    <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded">
                                        <AlertTriangle className="w-3 h-3" />
                                        Écrase les données
                                    </span>
                                </div>
                            </div>
                        </button>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowModeDialog(false)}>
                            Annuler
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <DashboardLayout>
                <div className="container mx-auto py-6 px-4 max-w-5xl">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Mon Profil RAG</h1>
                            <p className="text-slate-600 text-sm">
                                Score de complétude : {ragData?.score || 0}/100
                            </p>
                        </div>

                        {/* Tab-specific actions */}
                        <div className="flex gap-2">
                            {(activeTab === "vue") && (
                                <>
                                    <Button onClick={handleRegenerateClick} disabled={regenerating} variant="outline">
                                        {regenerating ? (
                                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Régénération...</>
                                        ) : (
                                            <><RefreshCw className="w-4 h-4 mr-2" /> Régénérer</>
                                        )}
                                    </Button>
                                    <Button onClick={saveWeights} disabled={saving}>
                                        {saving ? (
                                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sauvegarde...</>
                                        ) : (
                                            <><Save className="w-4 h-4 mr-2" /> Enregistrer</>
                                        )}
                                    </Button>
                                </>
                            )}
                            {activeTab === "avance" && (
                                <Button onClick={saveWeights} disabled={saving} variant="outline">
                                    {saving ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sauvegarde...</>
                                    ) : (
                                        <><Save className="w-4 h-4 mr-2" /> Sauvegarder notes</>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Validation Warnings & Quality Feedback */}
                    {validationData && (
                        <ValidationWarnings
                            warnings={validationData.warnings}
                            suggestions={validationData.suggestions}
                            qualityBreakdown={validationData.quality_breakdown}
                        />
                    )}

                    {/* Tabs */}
                    <Tabs defaultValue={activeTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-4 mb-6">
                            <TabsTrigger value="vue" className="flex items-center gap-2">
                                <Eye className="w-4 h-4" />
                                <span className="hidden sm:inline">Vue & Pondération</span>
                                <span className="sm:hidden">Vue</span>
                            </TabsTrigger>
                            <TabsTrigger value="docs" className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                <span className="hidden sm:inline">Documents</span>
                                <span className="sm:hidden">Docs</span>
                            </TabsTrigger>
                            <TabsTrigger value="avance" className="flex items-center gap-2">
                                <Settings className="w-4 h-4" />
                                <span className="hidden sm:inline">Avancé</span>
                            </TabsTrigger>
                            <TabsTrigger value="context-enrichi" className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                <span className="hidden sm:inline">Contexte Enrichi</span>
                                <span className="sm:hidden">Contexte</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="vue">
                            <OverviewTab
                                ragData={ragData || ragData}
                                userId={userId || ""}
                                onWeightChange={handleWeightChange}
                                onRefetch={refetch}
                            />
                        </TabsContent>

                        <TabsContent value="docs">
                            <DocumentsTab
                                documents={documents || []}
                                onDelete={deleteDocument}
                                onUpload={handleUpload}
                                uploading={uploading}
                            />
                        </TabsContent>

                        <TabsContent value="avance">
                            <AdvancedTab
                                customNotes={customNotes}
                                onNotesChange={setCustomNotes}
                                onReset={handleReset}
                            />
                        </TabsContent>

                        <TabsContent value="context-enrichi">
                            <ContexteEnrichiTab
                                ragData={ragData}
                                userId={userId || ""}
                                onRefetch={refetch}
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </DashboardLayout>
        </>
    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={<DashboardLayout><LoadingSpinner fullScreen /></DashboardLayout>}>
            <ProfileContent />
        </Suspense>
    );
}
