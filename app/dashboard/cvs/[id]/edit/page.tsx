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
import { ArrowLeft, Eye, Download, Check, Loader2, Plus, Trash2, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import Link from "next/link";
import { normalizeRAGToCV } from "@/components/cv/normalizeData";

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

    // Debounced auto-save
    const saveCV = useCallback(async (data: any) => {
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
            setTimeout(() => setSaved(false), 2000);
        }
    }, [id, supabase, userId]);

    // Auto-save on change with debounce
    useEffect(() => {
        if (!cvData || loading) return;
        const timer = setTimeout(() => saveCV(cvData), 1500);
        return () => clearTimeout(timer);
    }, [cvData, loading, saveCV]);

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
            console.error("Consolidation error:", error);
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

            {/* Editor */}
            <div className="container mx-auto py-6 px-4 max-w-3xl space-y-4">

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

            </div>
        </div>
    );
}
