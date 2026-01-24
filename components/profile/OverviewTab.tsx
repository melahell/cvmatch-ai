"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Briefcase, Code, GraduationCap, Languages, ChevronDown, ChevronUp, Sparkles, Info, X, Trash2, Plus, Pencil, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { InferredSkillCard } from "./InferredSkillCard";
import { EditableField } from "@/components/ui/EditableField";
import type { InferredSkill } from "@/types/rag";
import { normalizeCompetences } from "@/lib/utils/normalize-competences";
import { getSupabaseAuthHeader } from "@/lib/supabase";

type WeightValue = "important" | "inclus" | "exclu";

interface WeightBadgeProps {
    weight: WeightValue;
    onChange: (w: WeightValue) => void;
}

const WeightBadge = ({ weight, onChange }: WeightBadgeProps) => {
    const weights: WeightValue[] = ["important", "inclus", "exclu"];
    const idx = weights.indexOf(weight);

    const cycle = () => {
        const nextIdx = (idx + 1) % weights.length;
        onChange(weights[nextIdx]);
    };

    const styles = {
        important: "bg-green-100 text-green-700 border-green-300 hover:bg-green-200",
        inclus: "bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200",
        exclu: "bg-red-100 text-red-700 border-red-300 hover:bg-red-200"
    };

    const labels = {
        important: "🔥 Important",
        inclus: "✅ Inclus",
        exclu: "❌ Exclu"
    };

    return (
        <button
            onClick={cycle}
            className={`px-2 py-1 text-xs font-medium rounded border transition-colors cursor-pointer ${styles[weight]}`}
            title="Cliquer pour changer"
        >
            {labels[weight]}
        </button>
    );
};

interface OverviewTabProps {
    ragData: any;
    userId: string;
    onWeightChange: (section: string, index: number, weight: WeightValue) => void;
    onRefetch?: () => void;
}

export function OverviewTab({ ragData, userId, onWeightChange, onRefetch }: OverviewTabProps) {
    const [expandedSections, setExpandedSections] = useState({
        experiences: true,
        competences: true,
        formations: false,
        langues: false
    });

    const [addingSkill, setAddingSkill] = useState<string | null>(null);
    const [rejectingSkill, setRejectingSkill] = useState<string | null>(null);
    const [deletingItem, setDeletingItem] = useState<string | null>(null);

    // Add modal states
    const [showAddModal, setShowAddModal] = useState<"certification" | "formation" | "langue" | null>(null);
    const [newItemValue, setNewItemValue] = useState("");
    const [newItemValue2, setNewItemValue2] = useState(""); // For second field (ecole, niveau)
    const [addingItem, setAddingItem] = useState(false);

    // Delete confirmation state
    const [pendingDelete, setPendingDelete] = useState<{
        type: "certification" | "formation" | "langue" | "realisation" | "experience";
        index: number;
        label: string;
        options?: { experienceIndex?: number; key?: string };
    } | null>(null);

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Handler for deleting items (certifications, formations, langues, realisations)
    const handleDeleteItem = async (
        type: "certification" | "formation" | "langue" | "realisation" | "experience",
        index: number,
        options?: { experienceIndex?: number; key?: string }
    ) => {
        const itemKey = `${type}-${index}-${options?.experienceIndex ?? ""}`;
        setDeletingItem(itemKey);

        try {
            const authHeaders = await getSupabaseAuthHeader();
            const response = await fetch("/api/profile/delete-item", {
                method: "POST",
                headers: { "Content-Type": "application/json", ...authHeaders },
                credentials: "include",
                body: JSON.stringify({
                    userId,
                    type,
                    index,
                    experienceIndex: options?.experienceIndex,
                    key: options?.key
                })
            });

            if (response.ok) {
                onRefetch?.();
            } else {
                const error = await response.json();
                console.error("Failed to delete:", error);
                alert(`Erreur: ${error.error || "Suppression échouée"}`);
            }
        } catch (error) {
            console.error("Delete error:", error);
        } finally {
            setDeletingItem(null);
        }
    };

    // Handler to confirm and execute delete
    const confirmDelete = async () => {
        if (!pendingDelete) return;
        await handleDeleteItem(pendingDelete.type, pendingDelete.index, pendingDelete.options);
        setPendingDelete(null);
    };

    // Handler to request delete with confirmation
    const requestDelete = (
        type: "certification" | "formation" | "langue" | "realisation" | "experience",
        index: number,
        label: string,
        options?: { experienceIndex?: number; key?: string }
    ) => {
        setPendingDelete({ type, index, label, options });
    };

    // Handler for updating profile fields inline
    const handleUpdateProfile = async (field: string, value: string) => {
        try {
            const response = await fetch("/api/profile/update-item", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(await getSupabaseAuthHeader()),
                },
                body: JSON.stringify({
                    userId,
                    type: "profil",
                    data: { [field]: value }
                })
            });

            if (response.ok) {
                onRefetch?.();
            } else {
                const error = await response.json();
                throw new Error(error.error || "Échec de la mise à jour");
            }
        } catch (error: any) {
            console.error("Update profile error:", error);
            throw error;
        }
    };

    // Handler for adding new items
    const handleAddItem = async () => {
        if (!newItemValue.trim()) return;

        setAddingItem(true);

        try {
            let data: any;

            switch (showAddModal) {
                case "certification":
                    data = newItemValue.trim();
                    break;
                case "formation":
                    data = {
                        diplome: newItemValue.trim(),
                        ecole: newItemValue2.trim() || "Non spécifié",
                        annee: new Date().getFullYear().toString()
                    };
                    break;
                case "langue":
                    data = {
                        nom: newItemValue.trim(),
                        niveau: newItemValue2.trim() || "Courant"
                    };
                    break;
            }

            const response = await fetch("/api/profile/update-item", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(await getSupabaseAuthHeader()),
                },
                body: JSON.stringify({
                    userId,
                    type: showAddModal,
                    data
                })
            });

            if (response.ok) {
                setShowAddModal(null);
                setNewItemValue("");
                setNewItemValue2("");
                onRefetch?.();
            } else {
                const error = await response.json();
                alert(`Erreur: ${error.error || "Ajout échoué"}`);
            }
        } catch (error) {
            console.error("Add item error:", error);
        } finally {
            setAddingItem(false);
        }
    };

    // Normalize competences to handle old/new format
    const competences = ragData?.competences ? normalizeCompetences(ragData.competences) : null;

    // Handlers for inferred skills
    const handleRejectAllInferred = async () => {
        if (!competences?.inferred) return;

        const allInferred = [
            ...(competences.inferred.techniques || []).map((s: InferredSkill) => ({ skill: s, type: "technique" as const })),
            ...(competences.inferred.tools || []).map((s: InferredSkill) => ({ skill: s, type: "tool" as const })),
            ...(competences.inferred.soft_skills || []).map((s: InferredSkill) => ({ skill: s, type: "soft_skill" as const }))
        ];

        for (const { skill, type } of allInferred) {
            await handleRejectSkill(skill, type);
        }
    };

    const handleAddSkill = async (skill: InferredSkill, type: "technique" | "tool" | "soft_skill") => {
        setAddingSkill(skill.name);

        try {
            const response = await fetch("/api/profile/add-skill", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(await getSupabaseAuthHeader()),
                },
                body: JSON.stringify({
                    userId,
                    skill: skill.name,
                    type,
                    source: "inferred"
                })
            });

            if (response.ok) {
                // Trigger refetch to update UI
                onRefetch?.();
            } else {
                console.error("Failed to add skill");
            }
        } catch (error) {
            console.error("Error adding skill:", error);
        } finally {
            setAddingSkill(null);
        }
    };

    const handleRejectSkill = async (skill: InferredSkill, type: "technique" | "tool" | "soft_skill") => {
        setRejectingSkill(skill.name);

        try {
            const response = await fetch("/api/profile/reject-skill", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(await getSupabaseAuthHeader()),
                },
                body: JSON.stringify({
                    userId,
                    skill: skill.name,
                    type
                })
            });

            if (response.ok) {
                onRefetch?.();
            } else {
                console.error("Failed to reject skill");
            }
        } catch (error) {
            console.error("Error rejecting skill:", error);
        } finally {
            setRejectingSkill(null);
        }
    };

    const handleAddAllInferred = async () => {
        if (!competences?.inferred) return;

        const allInferred = [
            ...(competences.inferred.techniques || []).map(s => ({ skill: s, type: "technique" as const })),
            ...(competences.inferred.tools || []).map(s => ({ skill: s, type: "tool" as const })),
            ...(competences.inferred.soft_skills || []).map(s => ({ skill: s, type: "soft_skill" as const }))
        ];

        for (const { skill, type } of allInferred) {
            await handleAddSkill(skill, type);
        }
    };

    if (!ragData) {
        return (
            <div className="text-center py-12 text-slate-600">
                Aucune donnée disponible. Uploadez des documents et régénérez votre profil.
            </div>
        );
    }

    // Count inferred skills
    const inferredCount =
        (competences?.inferred?.techniques?.length || 0) +
        (competences?.inferred?.tools?.length || 0) +
        (competences?.inferred?.soft_skills?.length || 0);

    return (
        <div className="space-y-6">
            {/* Weighting Explanation */}
            <Alert className="bg-blue-50 border-blue-200">
                <Info className="w-4 h-4 text-blue-600" />
                <AlertDescription className="text-sm text-blue-900">
                    <strong>Pondération :</strong> Utilisée <strong>uniquement lors de la génération manuelle d'un CV</strong>.
                    Elle n'affecte pas vos données de profil permanentes.
                </AlertDescription>
            </Alert>

            {/* Legend */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-sm font-medium mb-2">💡 Pondération :</div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs">
                    <span className="flex items-center gap-1">
                        <Badge className="bg-green-100 text-green-700 shrink-0">🔥 Important</Badge>
                        <span className="text-slate-600">= Mis en avant</span>
                    </span>
                    <span className="flex items-center gap-1">
                        <Badge className="bg-blue-100 text-blue-700 shrink-0">✅ Inclus</Badge>
                        <span className="text-slate-600">= Par défaut</span>
                    </span>
                    <span className="flex items-center gap-1">
                        <Badge className="bg-red-100 text-red-700 shrink-0">❌ Exclu</Badge>
                        <span className="text-slate-600">= Jamais inclus</span>
                    </span>
                </div>
            </div>
            {/* Profile - Editable */}
            {ragData?.profil && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" /> Profil
                            <span className="text-xs font-normal text-slate-600 ml-2">
                                (Cliquez sur un champ pour modifier)
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Prénom</label>
                                <EditableField
                                    value={ragData.profil.prenom || ""}
                                    onSave={(v) => handleUpdateProfile("prenom", v)}
                                    placeholder="Votre prénom"
                                    context="profil"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Nom</label>
                                <EditableField
                                    value={ragData.profil.nom || ""}
                                    onSave={(v) => handleUpdateProfile("nom", v)}
                                    placeholder="Votre nom"
                                    context="profil"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Titre professionnel</label>
                            <EditableField
                                value={ragData.profil.titre_principal || ""}
                                onSave={(v) => handleUpdateProfile("titre_principal", v)}
                                placeholder="Ex: Chef de Projet Digital"
                                context="titre"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Localisation</label>
                            <EditableField
                                value={ragData.profil.localisation || ""}
                                onSave={(v) => handleUpdateProfile("localisation", v)}
                                placeholder="Ex: Paris, France"
                                context="localisation"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Elevator Pitch</label>
                            <EditableField
                                value={ragData.profil.elevator_pitch || ""}
                                onSave={(v) => handleUpdateProfile("elevator_pitch", v)}
                                placeholder="Décrivez-vous en quelques phrases..."
                                multiline
                                context="pitch"
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Experiences */}
            {ragData?.experiences && ragData.experiences.length > 0 && (
                <Card>
                    <CardHeader className="cursor-pointer" onClick={() => toggleSection("experiences")}>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Briefcase className="w-5 h-5" /> Expériences ({ragData.experiences.length})
                            </div>
                            {expandedSections.experiences ? (
                                <ChevronUp className="w-4 h-4" />
                            ) : (
                                <ChevronDown className="w-4 h-4" />
                            )}
                        </CardTitle>
                    </CardHeader>
                    {expandedSections.experiences && (
                        <CardContent className="space-y-4">
                            {ragData.experiences.map((exp: any, i: number) => (
                                <div key={i} className="border-b pb-4 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                            <div className="font-semibold text-lg">{exp.poste}</div>
                                            <div className="text-sm text-slate-600">
                                                {exp.entreprise} • {exp.debut} - {exp.fin || "Présent"}
                                            </div>
                                        </div>
                                        <WeightBadge
                                            weight={exp.weight || "inclus"}
                                            onChange={(w) => onWeightChange("experiences", i, w)}
                                        />
                                    </div>
                                    {exp.realisations && exp.realisations.length > 0 && (
                                        <div className="mt-2">
                                            <div className="text-sm font-medium mb-1">Réalisations :</div>
                                            <ul className="text-sm text-slate-600 space-y-1">
                                                {exp.realisations.map((r: any, j: number) => {
                                                    const itemKey = `realisation-${j}-${i}`;
                                                    const isDeleting = deletingItem === itemKey;
                                                    return (
                                                        <li key={j} className="flex items-start gap-2 group py-1 px-2 -mx-2 rounded hover:bg-slate-50">
                                                            <span className="text-slate-600 mt-0.5">•</span>
                                                            <span className="flex-1">
                                                                {r.description}
                                                                {r.impact && <span className="text-blue-600"> — {r.impact}</span>}
                                                            </span>
                                                            <button
                                                                onClick={() => requestDelete("realisation", j, r.description?.substring(0, 50) + (r.description?.length > 50 ? '...' : '') || 'Réalisation', { experienceIndex: i })}
                                                                disabled={isDeleting}
                                                                className="p-1 rounded hover:bg-red-100 text-slate-600 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                                                                title="Supprimer cette réalisation"
                                                            >
                                                                {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                                                            </button>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    )}
                                    {exp.technologies && exp.technologies.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {exp.technologies.map((tech: string, j: number) => (
                                                <Badge key={j} variant="outline" className="text-xs">
                                                    {tech}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    )}
                </Card>
            )}

            {/* Explicit Skills */}
            {competences && (
                <Card>
                    <CardHeader className="cursor-pointer" onClick={() => toggleSection("competences")}>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Code className="w-5 h-5" /> Vos Compétences
                            </div>
                            {expandedSections.competences ? (
                                <ChevronUp className="w-4 h-4" />
                            ) : (
                                <ChevronDown className="w-4 h-4" />
                            )}
                        </CardTitle>
                    </CardHeader>
                    {expandedSections.competences && (
                        <CardContent className="space-y-4">
                            {competences.explicit?.techniques && competences.explicit.techniques.length > 0 && (
                                <div>
                                    <h4 className="font-medium mb-2">Techniques :</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {competences.explicit.techniques.map((skill: string | any, i: number) => (
                                            <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                                                <span className="text-sm">{typeof skill === "string" ? skill : skill.nom}</span>
                                                <WeightBadge
                                                    weight={typeof skill === "string" ? "inclus" : (skill.weight || "inclus")}
                                                    onChange={(w) => onWeightChange("competences.techniques", i, w)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {competences.explicit?.soft_skills && competences.explicit.soft_skills.length > 0 && (
                                <div>
                                    <h4 className="font-medium mb-2">Soft Skills :</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {competences.explicit.soft_skills.map((skill: string, i: number) => (
                                            <Badge key={i} variant="outline">{skill}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    )}
                </Card>
            )}

            {/* Inferred Skills - Max 15 suggestions, filtered by rejected */}
            {competences?.inferred && inferredCount > 0 && (() => {
                const rejectedSkills = ragData?.rejected_inferred || [];
                const maxSuggestions = 15;

                // Filter and limit techniques
                const filteredTechniques = (competences.inferred.techniques || [])
                    .filter((s: InferredSkill) => !rejectedSkills.includes(s.name))
                    .slice(0, maxSuggestions);

                // Filter and limit tools
                const filteredTools = (competences.inferred.tools || [])
                    .filter((s: InferredSkill) => !rejectedSkills.includes(s.name))
                    .slice(0, Math.max(0, maxSuggestions - filteredTechniques.length));

                // Filter and limit soft skills
                const filteredSoftSkills = (competences.inferred.soft_skills || [])
                    .filter((s: InferredSkill) => !rejectedSkills.includes(s.name))
                    .slice(0, Math.max(0, maxSuggestions - filteredTechniques.length - filteredTools.length));

                const totalFiltered = filteredTechniques.length + filteredTools.length + filteredSoftSkills.length;

                return totalFiltered > 0 ? (
                    <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-purple-600" />
                                Compétences Suggérées par l'IA
                                <Badge variant="primary" className="bg-purple-100 text-purple-700">
                                    {totalFiltered}
                                </Badge>
                            </CardTitle>
                            <p className="text-sm text-slate-600 mt-1">
                                L'IA a identifié ces compétences à partir de l'analyse de vos expériences
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {/* Techniques inferred */}
                            {filteredTechniques.length > 0 &&
                                filteredTechniques.map((skill: InferredSkill, i: number) => (
                                    <InferredSkillCard
                                        key={`tech-${i}`}
                                        skill={skill}
                                        onAdd={() => handleAddSkill(skill, "technique")}
                                        onReject={() => handleRejectSkill(skill, "technique")}
                                        adding={addingSkill === skill.name}
                                        rejecting={rejectingSkill === skill.name}
                                    />
                                ))
                            }

                            {/* Tools inferred */}
                            {filteredTools.length > 0 &&
                                filteredTools.map((skill: InferredSkill, i: number) => (
                                    <InferredSkillCard
                                        key={`tool-${i}`}
                                        skill={skill}
                                        onAdd={() => handleAddSkill(skill, "tool")}
                                        onReject={() => handleRejectSkill(skill, "tool")}
                                        adding={addingSkill === skill.name}
                                        rejecting={rejectingSkill === skill.name}
                                    />
                                ))
                            }

                            {/* Soft skills inferred */}
                            {filteredSoftSkills.length > 0 &&
                                filteredSoftSkills.map((skill: InferredSkill, i: number) => (
                                    <InferredSkillCard
                                        key={`soft-${i}`}
                                        skill={skill}
                                        onAdd={() => handleAddSkill(skill, "soft_skill")}
                                        onReject={() => handleRejectSkill(skill, "soft_skill")}
                                        adding={addingSkill === skill.name}
                                        rejecting={rejectingSkill === skill.name}
                                    />
                                ))
                            }

                            {/* Bulk actions */}
                            <div className="flex gap-2 pt-2 border-t">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRejectAllInferred}
                                    disabled={!!rejectingSkill || !!addingSkill}
                                >
                                    Tout rejeter
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleAddAllInferred}
                                    disabled={!!addingSkill || !!rejectingSkill}
                                >
                                    Tout ajouter
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : null;
            })()}

            {/* Formations */}
            {ragData?.formations && ragData.formations.length > 0 && (
                <Card>
                    <CardHeader className="cursor-pointer">
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2" onClick={() => toggleSection("formations")}>
                                <GraduationCap className="w-5 h-5" /> Formations ({ragData.formations.length})
                                {expandedSections.formations ? (
                                    <ChevronUp className="w-4 h-4" />
                                ) : (
                                    <ChevronDown className="w-4 h-4" />
                                )}
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowAddModal("formation"); }}
                                className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                                title="Ajouter une formation"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </CardTitle>
                    </CardHeader>
                    {expandedSections.formations && (
                        <CardContent className="space-y-3">
                            {ragData.formations.map((f: any, i: number) => {
                                const itemKey = `formation-${i}-`;
                                const isDeleting = deletingItem === itemKey;
                                return (
                                    <div key={i} className="flex items-start justify-between border-b pb-3 last:border-0 last:pb-0 group">
                                        <div className="flex-1">
                                            <div className="font-semibold">{f.diplome}</div>
                                            <div className="text-sm text-slate-600">
                                                {f.ecole} • {f.annee}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <WeightBadge
                                                weight={f.weight || "inclus"}
                                                onChange={(w) => onWeightChange("formations", i, w)}
                                            />
                                            <button
                                                onClick={() => requestDelete("formation", i, f.diplome || 'Formation')}
                                                disabled={isDeleting}
                                                className="p-1 rounded hover:bg-red-100 text-slate-600 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                                title="Supprimer cette formation"
                                            >
                                                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    )}
                </Card>
            )}

            {/* Langues */}
            {ragData?.langues && Object.keys(ragData.langues).length > 0 && (
                <Card>
                    <CardHeader className="cursor-pointer">
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2" onClick={() => toggleSection("langues")}>
                                <Languages className="w-5 h-5" /> Langues ({Object.keys(ragData.langues).length})
                                {expandedSections.langues ? (
                                    <ChevronUp className="w-4 h-4" />
                                ) : (
                                    <ChevronDown className="w-4 h-4" />
                                )}
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowAddModal("langue"); }}
                                className="p-1.5 rounded-lg hover:bg-green-100 text-green-600 transition-colors"
                                title="Ajouter une langue"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </CardTitle>
                    </CardHeader>
                    {expandedSections.langues && (
                        <CardContent>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(ragData.langues).map(([lang, niveau], i) => {
                                    const itemKey = `langue-${i}-`;
                                    const isDeleting = deletingItem === itemKey;
                                    return (
                                        <div key={lang} className="flex justify-between items-center group">
                                            <span className="font-medium">{lang} :</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-600">{niveau as string}</span>
                                                <button
                                                    onClick={() => requestDelete("langue", i, lang, { key: lang })}
                                                    disabled={isDeleting}
                                                    className="p-1 rounded hover:bg-red-100 text-slate-600 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Supprimer cette langue"
                                                >
                                                    {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    )}
                </Card>
            )}

            {/* Certifications */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Badge className="bg-yellow-100 text-yellow-700">🏆</Badge>
                            Certifications ({ragData?.certifications?.length || 0})
                        </div>
                        <button
                            onClick={() => setShowAddModal("certification")}
                            className="p-1.5 rounded-lg hover:bg-yellow-100 text-yellow-600 transition-colors"
                            title="Ajouter une certification"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {ragData?.certifications?.map((cert: any, i: number) => {
                            const itemKey = `certification-${i}-`;
                            const isDeleting = deletingItem === itemKey;
                            return (
                                <div key={i} className="group relative inline-flex items-center">
                                    <Badge variant="outline" className="bg-yellow-50 border-yellow-200 pr-7">
                                        {typeof cert === 'string' ? cert : (cert?.nom || JSON.stringify(cert))}
                                    </Badge>
                                    <button
                                        onClick={() => requestDelete("certification", i, typeof cert === 'string' ? cert : (cert?.nom || 'Certification'))}
                                        disabled={isDeleting}
                                        className="absolute right-1 p-0.5 rounded-full hover:bg-red-100 text-slate-600 hover:text-red-600 transition-colors"
                                        title="Supprimer cette certification"
                                    >
                                        {isDeleting ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <X className="w-3 h-3" />
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                        {(!ragData?.certifications || ragData.certifications.length === 0) && (
                            <p className="text-sm text-slate-600 italic">Aucune certification. Cliquez sur + pour en ajouter.</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Clients & Références */}
            {(ragData?.references?.clients?.length > 0 ||
                ragData?.experiences?.some((exp: any) => exp.clients_references?.length > 0)) && (
                    <Card className="border-green-200 bg-gradient-to-br from-green-50/50 to-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Badge className="bg-green-100 text-green-700">🤝</Badge>
                                Clients & Références
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Clients from references.clients */}
                            {ragData?.references?.clients?.length > 0 && (
                                <div>
                                    <h4 className="font-medium mb-2 text-green-800">Clients (par secteur) :</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {ragData.references.clients.map((client: any, i: number) => (
                                            <Badge key={i} className="bg-green-100 text-green-800 border-green-300">
                                                {client.nom || client}
                                                {client.secteur && (
                                                    <span className="ml-1 text-green-600 text-xs">({client.secteur})</span>
                                                )}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Clients from experiences */}
                            {ragData?.experiences?.some((exp: any) => exp.clients_references?.length > 0) && (
                                <div>
                                    <h4 className="font-medium mb-2 text-green-800">Clients par expérience :</h4>
                                    <div className="space-y-2">
                                        {ragData.experiences
                                            .filter((exp: any) => exp.clients_references?.length > 0)
                                            .map((exp: any, i: number) => (
                                                <div key={i} className="text-sm">
                                                    <span className="font-medium">{exp.entreprise}:</span>{" "}
                                                    {exp.clients_references.map((c: string, j: number) => (
                                                        <Badge key={j} variant="outline" className="ml-1 text-xs">
                                                            {c}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

            {/* Contexte enrichi */}
            {ragData?.contexte_enrichi && (
                <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50/50 to-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Info className="w-5 h-5 text-indigo-600" />
                            Contexte enrichi (déductions)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Array.isArray(ragData.contexte_enrichi.responsabilites_implicites) &&
                            ragData.contexte_enrichi.responsabilites_implicites.length > 0 && (
                                <div>
                                    <h4 className="font-medium mb-2 text-indigo-800">Responsabilités implicites :</h4>
                                    <div className="space-y-2">
                                        {ragData.contexte_enrichi.responsabilites_implicites.map((r: any, i: number) => (
                                            <div key={i} className="p-3 rounded-lg border bg-white">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="font-semibold text-sm">{r.categorie}</div>
                                                    <Badge variant="outline" className="text-xs">
                                                        {r.niveau_certitude}
                                                    </Badge>
                                                </div>
                                                {Array.isArray(r.actions) && r.actions.length > 0 && (
                                                    <ul className="text-sm text-slate-700 mt-2 space-y-1">
                                                        {r.actions.map((a: string, j: number) => (
                                                            <li key={j} className="flex gap-2">
                                                                <span className="text-slate-500">•</span>
                                                                <span className="flex-1">{a}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                                {r.justification && (
                                                    <p className="text-xs text-slate-500 mt-2">
                                                        Justification : {r.justification}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        {Array.isArray(ragData.contexte_enrichi.competences_tacites) &&
                            ragData.contexte_enrichi.competences_tacites.length > 0 && (
                                <div>
                                    <h4 className="font-medium mb-2 text-indigo-800">Compétences tacites :</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {ragData.contexte_enrichi.competences_tacites.map((c: any, i: number) => (
                                            <div key={i} className="p-3 rounded-lg border bg-white">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="font-semibold text-sm">{c.competence}</div>
                                                    <Badge variant="outline" className="text-xs">
                                                        {c.niveau_deduit}
                                                    </Badge>
                                                </div>
                                                {c.contexte && <p className="text-xs text-slate-500 mt-2">{c.contexte}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        {Array.isArray(ragData.contexte_enrichi.soft_skills_deduites) &&
                            ragData.contexte_enrichi.soft_skills_deduites.length > 0 && (
                                <div>
                                    <h4 className="font-medium mb-2 text-indigo-800">Soft skills déduites :</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {ragData.contexte_enrichi.soft_skills_deduites.map((s: string, i: number) => (
                                            <Badge key={i} variant="outline" className="bg-indigo-50 border-indigo-200">
                                                {s}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                        {ragData.contexte_enrichi.environnement_travail && (
                            <div>
                                <h4 className="font-medium mb-2 text-indigo-800">Environnement de travail :</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                    <div className="p-3 rounded-lg border bg-white">
                                        <div className="text-xs text-slate-500">Complexité organisationnelle</div>
                                        <div className="font-semibold">{ragData.contexte_enrichi.environnement_travail.complexite_organisationnelle}</div>
                                    </div>
                                    <div className="p-3 rounded-lg border bg-white">
                                        <div className="text-xs text-slate-500">Niveau d’autonomie</div>
                                        <div className="font-semibold">{ragData.contexte_enrichi.environnement_travail.niveau_autonomie}</div>
                                    </div>
                                    <div className="p-3 rounded-lg border bg-white">
                                        <div className="text-xs text-slate-500">Exposition direction</div>
                                        <div className="font-semibold">{ragData.contexte_enrichi.environnement_travail.exposition_direction}</div>
                                    </div>
                                    <div className="p-3 rounded-lg border bg-white">
                                        <div className="text-xs text-slate-500">Criticité missions</div>
                                        <div className="font-semibold">{ragData.contexte_enrichi.environnement_travail.criticite_missions}</div>
                                    </div>
                                </div>
                                {Array.isArray(ragData.contexte_enrichi.environnement_travail.langues_travail) &&
                                    ragData.contexte_enrichi.environnement_travail.langues_travail.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {ragData.contexte_enrichi.environnement_travail.langues_travail.map((l: string, i: number) => (
                                                <Badge key={i} variant="outline">
                                                    {l}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Add Item Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-blue-600" />
                            Ajouter {showAddModal === "certification" ? "une certification" :
                                showAddModal === "formation" ? "une formation" : "une langue"}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-1">
                                    {showAddModal === "certification" ? "Nom de la certification" :
                                        showAddModal === "formation" ? "Diplôme / Formation" : "Langue"}
                                </label>
                                <input
                                    type="text"
                                    value={newItemValue}
                                    onChange={(e) => setNewItemValue(e.target.value)}
                                    placeholder={
                                        showAddModal === "certification" ? "Ex: PMP, AWS Certified..." :
                                            showAddModal === "formation" ? "Ex: Master en Management..." : "Ex: Anglais"
                                    }
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    autoFocus
                                />
                            </div>

                            {(showAddModal === "formation" || showAddModal === "langue") && (
                                <div>
                                    <label className="text-sm font-medium text-slate-700 block mb-1">
                                        {showAddModal === "formation" ? "École / Organisme" : "Niveau"}
                                    </label>
                                    <input
                                        type="text"
                                        value={newItemValue2}
                                        onChange={(e) => setNewItemValue2(e.target.value)}
                                        placeholder={
                                            showAddModal === "formation" ? "Ex: HEC Paris" : "Ex: Courant, Natif, B2..."
                                        }
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                onClick={() => {
                                    setShowAddModal(null);
                                    setNewItemValue("");
                                    setNewItemValue2("");
                                }}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleAddItem}
                                disabled={!newItemValue.trim() || addingItem}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {addingItem ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Ajout...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4" />
                                        Ajouter
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Contexte Enrichi Section */}
            {ragData?.contexte_enrichi && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-indigo-600" />
                            <CardTitle className="text-base">Contexte Enrichi</CardTitle>
                            <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200">
                                Déductions IA
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Responsabilités Implicites */}
                        {ragData.contexte_enrichi.responsabilites_implicites && ragData.contexte_enrichi.responsabilites_implicites.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-slate-700 mb-2">Responsabilités Implicites</h4>
                                <div className="space-y-2">
                                    {ragData.contexte_enrichi.responsabilites_implicites.map((resp: any, i: number) => (
                                        <div key={i} className="p-3 rounded-md bg-blue-50 border border-blue-100 text-xs">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="outline" className="text-xs">
                                                    {resp.categorie}
                                                </Badge>
                                                <Badge variant="outline" className="text-xs">
                                                    {resp.niveau_certitude}
                                                </Badge>
                                            </div>
                                            <p className="text-slate-700 font-medium mb-1">{resp.actions?.join(", ") || "N/A"}</p>
                                            <p className="text-slate-600 text-[11px]">{resp.justification}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Compétences Tacites */}
                        {ragData.contexte_enrichi.competences_tacites && ragData.contexte_enrichi.competences_tacites.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-slate-700 mb-2">Compétences Tacites</h4>
                                <div className="flex flex-wrap gap-2">
                                    {ragData.contexte_enrichi.competences_tacites.map((comp: any, i: number) => (
                                        <Badge key={i} variant="outline" className="text-xs">
                                            {comp.competence} ({comp.niveau_deduit})
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Soft Skills Déduites */}
                        {ragData.contexte_enrichi.soft_skills_deduites && ragData.contexte_enrichi.soft_skills_deduites.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-slate-700 mb-2">Soft Skills Déduites</h4>
                                <div className="flex flex-wrap gap-2">
                                    {ragData.contexte_enrichi.soft_skills_deduites.map((skill: string, i: number) => (
                                        <Badge key={i} variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Delete Confirmation Modal */}
            {pendingDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl">
                        <h3 className="text-lg font-bold mb-2 text-red-600 flex items-center gap-2">
                            <Trash2 className="w-5 h-5" />
                            Confirmer la suppression
                        </h3>
                        <p className="text-slate-600 mb-4">
                            Êtes-vous sûr de vouloir supprimer <strong>"{pendingDelete.label}"</strong> ?
                        </p>
                        <p className="text-sm text-slate-600 mb-4">
                            Cette action est irréversible.
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setPendingDelete(null)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={!!deletingItem}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {deletingItem ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Suppression...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4" />
                                        Supprimer
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
