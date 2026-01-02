"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useRAGData } from "@/hooks/useRAGData";
import { useDocuments } from "@/hooks/useDocuments";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Target, FileText, Settings, Save, RefreshCw, Loader2 } from "lucide-react";
import { OverviewTab } from "@/components/profile/OverviewTab";
import { WeightTab } from "@/components/profile/WeightTab";
import { DocumentsTab } from "@/components/profile/DocumentsTab";
import { AdvancedTab } from "@/components/profile/AdvancedTab";
import { createSupabaseClient } from "@/lib/supabase";
import { logger } from "@/lib/utils/logger";

function ProfileContent() {
    const searchParams = useSearchParams();
    const activeTab = searchParams.get("tab") || "vue";
    const { userId, isLoading: authLoading } = useAuth();

    // Use centralized hooks
    const { data: ragData, loading: ragLoading, error: ragError, refetch: refetchRAG } = useRAGData(userId);
    const { data: documents, loading: docsLoading, deleteDocument, refetch: refetchDocs } = useDocuments(userId);

    // Local state for tab-specific functions
    const [saving, setSaving] = useState(false);
    const [regenerating, setRegenerating] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [customNotes, setCustomNotes] = useState("");
    const [localRAGData, setLocalRAGData] = useState(ragData);

    // Sync ragData to local state when it changes
    useState(() => {
        if (ragData) {
            setLocalRAGData(addDefaultWeights(ragData));
            // Load custom notes from DB if available
            if (userId) {
                loadCustomNotes(userId);
            }
        }
    });

    const loadCustomNotes = async (uid: string) => {
        const supabase = createSupabaseClient();
        const { data } = await supabase
            .from("rag_metadata")
            .select("custom_notes")
            .eq("user_id", uid)
            .single();

        if (data?.custom_notes) {
            setCustomNotes(data.custom_notes);
        }
    };

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

    const handleWeightChange = (section: string, index: number, newWeight: "important" | "inclus" | "exclu") => {
        setLocalRAGData((prev: any) => {
            if (!prev) return prev;
            const updated = { ...prev };

            if (section === "experiences") {
                updated.experiences[index].weight = newWeight;
            } else if (section === "competences.techniques") {
                updated.competences.techniques[index].weight = newWeight;
            } else if (section === "formations") {
                updated.formations[index].weight = newWeight;
            }

            return updated;
        });
    };

    const saveWeights = async () => {
        if (!userId || !localRAGData) return;

        setSaving(true);
        try {
            const supabase = createSupabaseClient();
            const { error } = await supabase
                .from("rag_metadata")
                .update({
                    completeness_details: localRAGData,
                    custom_notes: customNotes
                })
                .eq("user_id", userId);

            if (error) throw error;

            logger.success("Profil sauvegardé !");
            alert("✅ Profil sauvegardé avec succès !");
            await refetchRAG();
        } catch (e) {
            logger.error("Error saving profile:", e);
            alert("❌ Erreur lors de la sauvegarde");
        } finally {
            setSaving(false);
        }
    };

    const regenerateProfile = async () => {
        if (!userId) return;

        setRegenerating(true);
        try {
            const res = await fetch("/api/rag/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId })
            });

            if (res.ok) {
                await refetchRAG();
                alert("✅ Profil régénéré avec succès !");
            } else {
                const error = await res.json();
                alert("⚠️ Erreur: " + (error.error || "Échec de la régénération"));
            }
        } catch (e) {
            logger.error("Error regenerating profile:", e);
            alert("❌ Erreur réseau");
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
                setLocalRAGData(null);
                setCustomNotes("");
                await refetchRAG();
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
                            ragData={localRAGData || ragData}
                            onWeightChange={handleWeightChange}
                        />
                    </TabsContent>

                    <TabsContent value="docs">
                        <DocumentsTab
                            documents={documents}
                            onDelete={async (id) => { await deleteDocument(id); }}
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
