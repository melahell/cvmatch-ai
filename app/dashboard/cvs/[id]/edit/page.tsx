"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createSupabaseClient, getSupabaseAuthHeader } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Eye, Download, Check, Loader2, Plus, Trash2, ChevronDown, ChevronUp, Sparkles, History, GitCompare } from "lucide-react";
import Link from "next/link";
import { normalizeRAGToCV } from "@/components/cv/normalizeData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DiffViewer } from "@/components/cv/DiffViewer";
import { getCVVersions, type CVVersion } from "@/lib/cv/cv-history";
import { toast } from "sonner";
import { logger } from "@/lib/utils/logger";

export default function CVEditorPage() {
    const { id } = useParams();
    const router = useRouter();
    const { userId } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [cvData, setCvData] = useState<any>(null);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        profil: true,
        experiences: true,
        competences: true,
        formations: false,
        langues: false
    });
    const [consolidating, setConsolidating] = useState(false);
    const [activeTab, setActiveTab] = useState("edit");
    const [versions, setVersions] = useState<CVVersion[]>([]);
    const [loadingVersions, setLoadingVersions] = useState(false);
    const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
    const [modificationCount, setModificationCount] = useState(0);
    const [lastSavedVersion, setLastSavedVersion] = useState<any>(null);

    const supabase = createSupabaseClient();

    useEffect(() => {
        async function fetchCV() {
            if (!id) return;
            if (!userId) return;

            const { data, error } = await supabase
                .from("cv_generations")
                .select("cv_data")
                .eq("id", id)
                .eq("user_id", userId)
                .single();

            if (data) {
                // Normalize the data to ensure consistent structure
                const normalized = normalizeRAGToCV(data.cv_data);
                setCvData(normalized);
            }
            setLoading(false);
        }
        fetchCV();
    }, [id, supabase]);

    // Debounced auto-save with versioning
    const saveCV = useCallback(async (data: any, description?: string) => {
        if (!id) return;
        if (!userId) return;
        setSaving(true);
        setSaved(false);

        const { error } = await supabase
            .from("cv_generations")
            .update({ cv_data: data })
            .eq("id", id)
            .eq("user_id", userId);

        setSaving(false);
        if (!error) {
            setSaved(true);
            setLastSavedVersion(data);
            setModificationCount(0);
            setTimeout(() => setSaved(false), 2000);

            // Sauvegarder version (toutes les 30s ou après 5 modifications significatives)
            try {
                const authHeaders = await getSupabaseAuthHeader();
                await fetch(`/api/cv/${id}/versions`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", ...authHeaders },
                    body: JSON.stringify({
                        cv_data: data,
                        description: description || (modificationCount >= 5 ? "Modifications multiples" : "Auto-save"),
                    }),
                });
            } catch (versionError) {
                // Non-blocking, continue même si versioning échoue
                logger.error("Versioning error", { error: versionError, cvId: id });
            }
        }
    }, [id, supabase, userId, modificationCount]);

    // Auto-save on change with debounce and versioning
    useEffect(() => {
        if (!cvData || loading) return;
        
        // Incrémenter compteur modifications
        setModificationCount((prev) => prev + 1);
        
        const timer = setTimeout(() => {
            saveCV(cvData);
        }, 1500);
        return () => clearTimeout(timer);
    }, [cvData, loading, saveCV]);

    // Charger versions au montage
    useEffect(() => {
        async function loadVersions() {
            if (!id || !userId) return;
            setLoadingVersions(true);
            try {
                const authHeaders = await getSupabaseAuthHeader();
                const res = await fetch(`/api/cv/${id}/versions`, {
                    headers: authHeaders,
                });
                if (res.ok) {
                    const data = await res.json();
                    setVersions(data.versions || []);
                }
            } catch (error) {
                logger.error("Error loading versions", { error, cvId: id });
            } finally {
                setLoadingVersions(false);
            }
        }
        loadVersions();
    }, [id, userId]);

    // Rollback handler
    const handleRollback = async (versionNumber: number) => {
        if (!id || !userId) return;
        try {
            const authHeaders = await getSupabaseAuthHeader();
            const res = await fetch(`/api/cv/${id}/rollback`, {
                method: "POST",
                headers: { "Content-Type": "application/json", ...authHeaders },
                body: JSON.stringify({ version_number: versionNumber }),
            });
            if (res.ok) {
                toast.success(`CV restauré à la version ${versionNumber}`);
                // Recharger CV
                const { data } = await supabase
                    .from("cv_generations")
                    .select("cv_data")
                    .eq("id", id)
                    .eq("user_id", userId)
                    .single();
                if (data) {
                    const normalized = normalizeRAGToCV(data.cv_data);
                    setCvData(normalized);
                    setLastSavedVersion(normalized);
                }
                // Recharger versions
                const versionsRes = await fetch(`/api/cv/${id}/versions`, {
                    headers: authHeaders,
                });
                if (versionsRes.ok) {
                    const versionsData = await versionsRes.json();
                    setVersions(versionsData.versions || []);
                }
            } else {
                toast.error("Erreur lors du rollback");
            }
        } catch (error) {
            toast.error("Erreur lors du rollback");
        }
    };

    const updateField = (path: (string | number)[], value: any) => {
        setCvData((prev: any) => {
            const newData = JSON.parse(JSON.stringify(prev));
            let current = newData;
            for (let i = 0; i < path.length - 1; i++) {
                if (!current[path[i]]) current[path[i]] = {};
                current = current[path[i]];
            }
            current[path[path.length - 1]] = value;
            return newData;
        });
    };

    const addArrayItem = (path: string[], template: any) => {
        setCvData((prev: any) => {
            const newData = JSON.parse(JSON.stringify(prev));
            let current = newData;
            for (const key of path.slice(0, -1)) {
                current = current[key];
            }
            const arrKey = path[path.length - 1];
            if (!current[arrKey]) current[arrKey] = [];
            current[arrKey].push(template);
            return newData;
        });
    };

    const removeArrayItem = (path: string[], index: number) => {
        setCvData((prev: any) => {
            const newData = JSON.parse(JSON.stringify(prev));
            let current = newData;
            for (const key of path.slice(0, -1)) {
                current = current[key];
            }
            const arrKey = path[path.length - 1];
            current[arrKey].splice(index, 1);
            return newData;
        });
    };

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleExportPDF = () => {
        window.open(`/dashboard/cv/${id}`, "_blank");
    };

    const handleConsolidateAI = async () => {
        if (!cvData) return;
        setConsolidating(true);

        try {
            const authHeaders = await getSupabaseAuthHeader();
            // Call AI consolidation API
            const response = await fetch("/api/cv/consolidate", {
                method: "POST",
                headers: { "Content-Type": "application/json", ...authHeaders },
                body: JSON.stringify({ cvData })
            });

            if (response.ok) {
                const { consolidatedData } = await response.json();
                setCvData(consolidatedData);
                // Trigger save
                await saveCV(consolidatedData);
            } else {
                console.error("Consolidation failed");
                alert("Erreur lors de la consolidation IA. Réessayez.");
            }
        } catch (error) {
            logger.error("Consolidation error", { error, cvId: id });
            alert("Erreur lors de la consolidation IA.");
        } finally {
            setConsolidating(false);
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    if (!cvData) {
        return <div className="text-center p-20">CV introuvable</div>;
    }

    const { profil, experiences, competences, formations, langues } = cvData;

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard/tracking" className="text-slate-600 hover:text-slate-900">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="font-bold text-base sm:text-lg">Éditer le CV</h1>
                        <div className="flex items-center gap-2 text-sm hidden sm:flex">
                            {modificationCount > 0 && !saved && (
                                <Badge variant="warning" className="text-xs">
                                    {modificationCount} modification{modificationCount > 1 ? "s" : ""} non sauvegardée{modificationCount > 1 ? "s" : ""}
                                </Badge>
                            )}
                            {saving && (
                                <span className="text-slate-600 flex items-center gap-1">
                                    <Loader2 className="w-3 h-3 animate-spin" /> Sauvegarde...
                                </span>
                            )}
                            {saved && (
                                <span className="text-green-600 flex items-center gap-1">
                                    <Check className="w-3 h-3" /> OK
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/dashboard/cv/${id}`}>
                            <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 sm:mr-2" />
                                <span className="hidden sm:inline">Aperçu</span>
                            </Button>
                        </Link>
                        <Button
                            onClick={handleConsolidateAI}
                            disabled={consolidating}
                            variant="outline"
                            size="sm"
                            className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                        >
                            {consolidating ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin sm:mr-2" />
                                    <span className="hidden sm:inline">Correction...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 sm:mr-2" />
                                    <span className="hidden sm:inline">Consolidation IA</span>
                                </>
                            )}
                        </Button>
                        <Button onClick={handleExportPDF} size="sm">
                            <Download className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline">PDF</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="container mx-auto px-4 max-w-3xl">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="edit">Édition</TabsTrigger>
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                        <TabsTrigger value="history">
                            <History className="w-4 h-4 mr-2" />
                            Historique
                        </TabsTrigger>
                        <TabsTrigger value="diff">
                            <GitCompare className="w-4 h-4 mr-2" />
                            Diff
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="edit" className="space-y-4">
                        {renderEditorContent()}
                    </TabsContent>

                    <TabsContent value="preview">
                        <div className="bg-white p-6 rounded-lg border">
                            <Link href={`/dashboard/cv/${id}`} target="_blank">
                                <Button variant="outline" className="mb-4">
                                    <Eye className="w-4 h-4 mr-2" />
                                    Ouvrir en plein écran
                                </Button>
                            </Link>
                            <iframe
                                src={`/dashboard/cv/${id}`}
                                className="w-full h-[800px] border rounded"
                                title="CV Preview"
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="history">
                        {renderHistoryContent()}
                    </TabsContent>

                    <TabsContent value="diff">
                        {renderDiffContent()}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );

    function renderEditorContent() {
        const { profil, experiences, competences, formations, langues } = cvData;
        return (
            <>

                {/* PROFIL */}
                <Card>
                    <CardHeader
                        className="cursor-pointer flex flex-row items-center justify-between py-3"
                        onClick={() => toggleSection("profil")}
                    >
                        <CardTitle className="text-base">👤 Profil</CardTitle>
                        {expandedSections.profil ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </CardHeader>
                    {expandedSections.profil && (
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label>Prénom</Label>
                                    <Input
                                        value={profil?.prenom || ""}
                                        onChange={(e) => updateField(["profil", "prenom"], e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label>Nom</Label>
                                    <Input
                                        value={profil?.nom || ""}
                                        onChange={(e) => updateField(["profil", "nom"], e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Titre professionnel</Label>
                                <Input
                                    value={profil?.titre_principal || ""}
                                    onChange={(e) => updateField(["profil", "titre_principal"], e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>Pitch / Résumé</Label>
                                <Textarea
                                    value={profil?.elevator_pitch || ""}
                                    onChange={(e) => updateField(["profil", "elevator_pitch"], e.target.value)}
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Email</Label>
                                    <Input
                                        value={profil?.contact?.email || ""}
                                        onChange={(e) => updateField(["profil", "contact", "email"], e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label>Téléphone</Label>
                                    <Input
                                        value={profil?.contact?.telephone || ""}
                                        onChange={(e) => updateField(["profil", "contact", "telephone"], e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Localisation</Label>
                                <Input
                                    value={profil?.localisation || ""}
                                    onChange={(e) => updateField(["profil", "localisation"], e.target.value)}
                                />
                            </div>
                        </CardContent>
                    )}
                </Card>

                {/* EXPÉRIENCES */}
                <Card>
                    <CardHeader
                        className="cursor-pointer flex flex-row items-center justify-between py-3"
                        onClick={() => toggleSection("experiences")}
                    >
                        <CardTitle className="text-base">💼 Expériences</CardTitle>
                        {expandedSections.experiences ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </CardHeader>
                    {expandedSections.experiences && (
                        <CardContent className="space-y-4">
                            {experiences?.map((exp: any, i: number) => (
                                <div key={i} className="border rounded-lg p-4 space-y-3 relative">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                        onClick={() => removeArrayItem(["experiences"], i)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label className="text-xs">Poste</Label>
                                            <Input
                                                value={exp.poste || ""}
                                                onChange={(e) => updateField(["experiences", i, "poste"], e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Entreprise</Label>
                                            <Input
                                                value={exp.entreprise || ""}
                                                onChange={(e) => updateField(["experiences", i, "entreprise"], e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <Label className="text-xs">Début</Label>
                                            <Input
                                                value={exp.debut || ""}
                                                onChange={(e) => updateField(["experiences", i, "debut"], e.target.value)}
                                                placeholder="2020"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Fin</Label>
                                            <Input
                                                value={exp.fin || ""}
                                                onChange={(e) => updateField(["experiences", i, "fin"], e.target.value)}
                                                placeholder="2023"
                                                disabled={exp.actuel}
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <label className="flex items-center gap-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={exp.actuel || false}
                                                    onChange={(e) => updateField(["experiences", i, "actuel"], e.target.checked)}
                                                    className="rounded"
                                                />
                                                Actuel
                                            </label>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-xs">Réalisations</Label>
                                        {exp.realisations?.map((real: any, j: number) => (
                                            <div key={j} className="flex gap-2 mt-1">
                                                <Input
                                                    value={typeof real === "string" ? real : real.description || ""}
                                                    onChange={(e) => updateField(["experiences", i, "realisations", j], e.target.value)}
                                                    placeholder="Réalisation..."
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        const newReals = [...exp.realisations];
                                                        newReals.splice(j, 1);
                                                        updateField(["experiences", i, "realisations"], newReals);
                                                    }}
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        ))}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="mt-2 text-blue-600"
                                            onClick={() => {
                                                const newReals = [...(exp.realisations || []), ""];
                                                updateField(["experiences", i, "realisations"], newReals);
                                            }}
                                        >
                                            <Plus className="w-3 h-3 mr-1" /> Ajouter
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => addArrayItem(["experiences"], {
                                    poste: "",
                                    entreprise: "",
                                    debut: "",
                                    fin: "",
                                    actuel: false,
                                    realisations: []
                                })}
                            >
                                <Plus className="w-4 h-4 mr-2" /> Ajouter une expérience
                            </Button>
                        </CardContent>
                    )}
                </Card>

                {/* COMPÉTENCES */}
                <Card>
                    <CardHeader
                        className="cursor-pointer flex flex-row items-center justify-between py-3"
                        onClick={() => toggleSection("competences")}
                    >
                        <CardTitle className="text-base">🛠 Compétences</CardTitle>
                        {expandedSections.competences ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </CardHeader>
                    {expandedSections.competences && (
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Compétences techniques</Label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {competences?.techniques?.map((skill: any, i: number) => {
                                        const skillName = typeof skill === "string" ? skill : skill?.nom || skill;
                                        return (
                                            <Badge key={i} variant="neutral" className="gap-1">
                                                {skillName}
                                                <button
                                                    onClick={() => removeArrayItem(["competences", "techniques"], i)}
                                                    className="ml-1 hover:text-red-600"
                                                >
                                                    ×
                                                </button>
                                            </Badge>
                                        );
                                    })}
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <Input
                                        placeholder="Nouvelle compétence"
                                        id="new-tech-skill"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                const input = e.target as HTMLInputElement;
                                                if (input.value.trim()) {
                                                    addArrayItem(["competences", "techniques"], input.value.trim());
                                                    input.value = "";
                                                }
                                            }
                                        }}
                                    />
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            const input = document.getElementById("new-tech-skill") as HTMLInputElement;
                                            if (input.value.trim()) {
                                                addArrayItem(["competences", "techniques"], input.value.trim());
                                                input.value = "";
                                            }
                                        }}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                            <div>
                                <Label>Soft Skills</Label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {competences?.soft_skills?.map((skill: any, i: number) => {
                                        const skillName = typeof skill === "string" ? skill : skill?.nom || skill;
                                        return (
                                            <Badge key={i} variant="outline" className="gap-1">
                                                {skillName}
                                                <button
                                                    onClick={() => removeArrayItem(["competences", "soft_skills"], i)}
                                                    className="ml-1 hover:text-red-600"
                                                >
                                                    ×
                                                </button>
                                            </Badge>
                                        );
                                    })}
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <Input
                                        placeholder="Nouveau soft skill"
                                        id="new-soft-skill"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                const input = e.target as HTMLInputElement;
                                                if (input.value.trim()) {
                                                    addArrayItem(["competences", "soft_skills"], input.value.trim());
                                                    input.value = "";
                                                }
                                            }
                                        }}
                                    />
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            const input = document.getElementById("new-soft-skill") as HTMLInputElement;
                                            if (input.value.trim()) {
                                                addArrayItem(["competences", "soft_skills"], input.value.trim());
                                                input.value = "";
                                            }
                                        }}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    )}
                </Card>

                {/* FORMATIONS */}
                <Card>
                    <CardHeader
                        className="cursor-pointer flex flex-row items-center justify-between py-3"
                        onClick={() => toggleSection("formations")}
                    >
                        <CardTitle className="text-base">🎓 Formations</CardTitle>
                        {expandedSections.formations ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </CardHeader>
                    {expandedSections.formations && (
                        <CardContent className="space-y-4">
                            {formations?.map((edu: any, i: number) => (
                                <div key={i} className="border rounded-lg p-4 space-y-3 relative">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="absolute top-2 right-2 text-red-500"
                                        onClick={() => removeArrayItem(["formations"], i)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                    <div>
                                        <Label className="text-xs">Diplôme</Label>
                                        <Input
                                            value={edu.diplome || ""}
                                            onChange={(e) => updateField(["formations", i, "diplome"], e.target.value)}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label className="text-xs">École</Label>
                                            <Input
                                                value={edu.ecole || ""}
                                                onChange={(e) => updateField(["formations", i, "ecole"], e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Année</Label>
                                            <Input
                                                value={edu.annee || ""}
                                                onChange={(e) => updateField(["formations", i, "annee"], e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => addArrayItem(["formations"], { diplome: "", ecole: "", annee: "" })}
                            >
                                <Plus className="w-4 h-4 mr-2" /> Ajouter une formation
                            </Button>
                        </CardContent>
                    )}
                </Card>
            </>
        );
    }

    function renderHistoryContent() {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Historique des Versions</CardTitle>
                </CardHeader>
                <CardContent>
                    {loadingVersions ? (
                        <div className="flex items-center justify-center p-8">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    ) : versions.length === 0 ? (
                        <div className="text-center p-8 text-slate-500">
                            Aucune version sauvegardée
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {versions.map((version) => (
                                <div
                                    key={version.id}
                                    className="border rounded-lg p-4 hover:bg-slate-50 cursor-pointer"
                                    onClick={() => setSelectedVersion(version.version_number)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-semibold">
                                                Version {version.version_number}
                                            </div>
                                            <div className="text-sm text-slate-500">
                                                {new Date(version.metadata.created_at).toLocaleString("fr-FR")}
                                            </div>
                                            {version.metadata.change_description && (
                                                <div className="text-sm text-slate-600 mt-1">
                                                    {version.metadata.change_description}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            {version.version_number !== versions[0]?.version_number && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRollback(version.version_number);
                                                    }}
                                                >
                                                    Restaurer
                                                </Button>
                                            )}
                                            {version.metadata.is_current && (
                                                <Badge variant="success">Actuelle</Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    }

    function renderDiffContent() {
        if (!lastSavedVersion || !cvData) {
            return (
                <Card>
                    <CardContent className="p-8 text-center text-slate-500">
                        Aucune version précédente disponible pour comparaison
                    </CardContent>
                </Card>
            );
        }

        if (selectedVersion !== null) {
            // Comparer avec version sélectionnée
            const version = versions.find((v) => v.version_number === selectedVersion);
            if (version) {
                return (
                    <DiffViewer
                        oldVersion={version.cv_data}
                        newVersion={cvData}
                        viewMode="unified"
                    />
                );
            }
        }

        // Comparer avec dernière version sauvegardée
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Comparaison avec dernière version sauvegardée</h3>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            if (versions.length > 0) {
                                setSelectedVersion(versions[0].version_number);
                            }
                        }}
                    >
                        Comparer avec version précédente
                    </Button>
                </div>
                <DiffViewer oldVersion={lastSavedVersion} newVersion={cvData} viewMode="unified" />
            </div>
        );
    }
}
