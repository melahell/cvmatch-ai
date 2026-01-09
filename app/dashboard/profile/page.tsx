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
import { Eye, Target, FileText, Settings, Save, RefreshCw, Loader2, Upload, ExternalLink } from "lucide-react";
import { ValidationWarnings } from "@/components/profile/ValidationWarnings";
import { OverviewTab } from "@/components/profile/OverviewTab";
import { WeightTab } from "@/components/profile/WeightTab";
import { AdvancedTab } from "@/components/profile/AdvancedTab";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { createSupabaseClient } from "@/lib/supabase";
import { logger } from "@/lib/utils/logger";
import { ContextualLoader } from "@/components/loading/ContextualLoader";

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
            const supabase = createSupabaseClient();
            const { error } = await supabase
                .from("rag_metadata")
                .update({
                    completeness_details: ragData,
                    custom_notes: customNotes
                })
                .eq("user_id", userId);

            if (error) throw error;

            logger.success("Profil sauvegardé !");
            alert("✅ Profil sauvegardé avec succès !");
            await refetch();
        } catch (e) {
            logger.error("Error saving profile:", e);
            alert("❌ Erreur lors de la sauvegarde");
        }
    };

    const regenerateProfile = async () => {
        if (!userId || !documents || documents.length === 0) {
            alert("⚠️ Aucun document à traiter");
            return;
        }

        setRegenerating(true);
        const totalDocs = documents.length;
        setTotalDocsCount(totalDocs);
        let processed = 0;

        try {
            logger.info(`[INCREMENTAL] Starting regeneration for ${totalDocs} document(s)`);

            // Process each document sequentially
            for (const doc of documents) {
                processed++;
                setCurrentDocIndex(processed);
                setCurrentDocName(doc.filename);
                setRegenProgress(Math.round((processed / totalDocs) * 100));
                logger.info(`[INCREMENTAL] Processing ${processed}/${totalDocs}: ${doc.filename}`);

                const res = await fetch("/api/rag/generate-incremental", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId,
                        documentId: doc.id
                    })
                });

                if (!res.ok) {
                    const error = await res.json();
                    logger.error(`[INCREMENTAL] Failed for ${doc.filename}:`, error);
                    alert(`⚠️ Erreur sur ${doc.filename}: ${error.error || "Échec"}\n\nContinuation avec les documents restants...`);
                    continue; // Continue with next document
                }

                const result = await res.json();
                logger.success(`[INCREMENTAL] ${doc.filename} processed - Score: ${result.qualityScore}`);

                // Store validation data from last document (will have merged all previous)
                if (processed === totalDocs && result.validation) {
                    setValidationData({
                        warnings: result.validation?.warnings,
                        suggestions: result.suggestions,
                        quality_breakdown: result.quality_breakdown
                    });
                }
            }

            // Refetch the final merged RAG
            await refetch();
            await refetchDocs();

            alert(`✅ Profil régénéré avec succès!\n\n📊 ${processed}/${totalDocs} document(s) traité(s)`);

        } catch (e) {
            logger.error("Error in incremental regeneration:", e);
            alert(`❌ Erreur après traitement de ${processed}/${totalDocs} documents`);
        } finally {
            setRegenerating(false);
        }

    };

    const handleUpload = async (file: File) => {
        if (!userId) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("userId", userId);

            const res = await fetch("/api/rag/upload", {
                method: "POST",
                body: formData
            });

            if (res.ok) {
                await refetchDocs();
                alert("✅ Document uploadé avec succès ! Régénérez le profil pour l'inclure.");
            } else {
                const error = await res.json();
                alert("⚠️ Erreur: " + (error.error || "Échec de l'upload"));
            }
        } catch (e) {
            logger.error("Error uploading document:", e);
            alert("❌ Erreur réseau");
        } finally {
            setUploading(false);
        }
    };

    const handleReset = async () => {
        if (!userId) return;

        try {
            const res = await fetch("/api/profile/reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId })
            });

            if (res.ok) {
                setCustomNotes("");
                await refetch();
                await refetchDocs();
                alert("✅ Profil réinitialisé avec succès");
            } else {
                alert("❌ Erreur lors de la réinitialisation");
            }
        } catch (e) {
            logger.error("Error resetting profile:", e);
            alert("❌ Erreur réseau");
        }
    };

    if (ragLoading || docsLoading || authLoading) {
        return (
            <DashboardLayout>
                <LoadingSpinner fullScreen />
            </DashboardLayout>
        );
    }

    // Show contextual loader during regeneration
    if (regenerating) {
        return (
            <ContextualLoader
                context="refreshing-profile"
                userName={(ragData as any)?.prenom || (ragData as any)?.nom || undefined}
                currentStep={currentDocIndex - 1}
                totalSteps={totalDocsCount}
                currentItem={currentDocName}
                progress={regenProgress}
                onCancel={() => setRegenerating(false)}
            />
        );
    }

    // Show contextual loader during upload
    if (uploading) {
        return (
            <ContextualLoader
                context="uploading-photo"
            />
        );
    }

    return (
        <DashboardLayout>
            <div className="container mx-auto py-6 px-4 max-w-5xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Mon Profil RAG</h1>
                        <p className="text-slate-500 text-sm">
                            Score de complétude : {ragData?.score || 0}/100
                        </p>
                    </div>

                    {/* Tab-specific actions */}
                    <div className="flex gap-2">
                        {(activeTab === "vue") && (
                            <>
                                <Button onClick={regenerateProfile} disabled={regenerating} variant="outline">
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
                    <TabsList className="grid w-full grid-cols-3 mb-6">
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
                        <Card className="border-dashed border-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Upload className="w-5 h-5" />
                                    Ajouter des documents
                                </CardTitle>
                                <CardDescription>
                                    Pour importer de nouveaux documents (CV, LinkedIn PDF, etc.), utilisez la page d'onboarding.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/onboarding">
                                    <Button className="gap-2">
                                        <ExternalLink className="w-4 h-4" />
                                        Aller à l'import de documents
                                    </Button>
                                </Link>
                                <p className="text-sm text-slate-500 mt-4">
                                    Documents actuels: {documents?.length || 0} fichier(s)
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="avance">
                        <AdvancedTab
                            customNotes={customNotes}
                            onNotesChange={setCustomNotes}
                            onReset={handleReset}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={<DashboardLayout><LoadingSpinner fullScreen /></DashboardLayout>}>
            <ProfileContent />
        </Suspense>
    );
}
