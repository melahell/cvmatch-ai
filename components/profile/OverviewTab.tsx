"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Briefcase, Code, GraduationCap, Languages, ChevronDown, ChevronUp, Sparkles, Info } from "lucide-react";
import { useState } from "react";
import { InferredSkillCard } from "./InferredSkillCard";
import type { InferredSkill } from "@/types/rag";
import { normalizeCompetences } from "@/lib/utils/normalize-competences";

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

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
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
                headers: { "Content-Type": "application/json" },
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
                headers: { "Content-Type": "application/json" },
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
            <div className="text-center py-12 text-slate-500">
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

            {/* Profile */}
            {ragData?.profil && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" /> Profil
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {ragData.profil.prenom && (
                            <div>
                                <strong className="text-slate-700">Nom :</strong>{" "}
                                {ragData.profil.prenom} {ragData.profil.nom}
                            </div>
                        )}
                        {ragData.profil.titre_principal && (
                            <div>
                                <strong className="text-slate-700">Titre :</strong> {ragData.profil.titre_principal}
                            </div>
                        )}
                        {ragData.profil.localisation && (
                            <div>
                                <strong className="text-slate-700">Localisation :</strong> {ragData.profil.localisation}
                            </div>
                        )}
                        {ragData.profil.elevator_pitch && (
                            <div>
                                <strong className="text-slate-700">Pitch :</strong>
                                <p className="text-sm text-slate-600 mt-1">{ragData.profil.elevator_pitch}</p>
                            </div>
                        )}
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
                                            <div className="text-sm text-slate-500">
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
                                            <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                                                {exp.realisations.map((r: any, j: number) => (
                                                    <li key={j}>
                                                        {r.description}
                                                        {r.impact && <span className="text-blue-600"> — {r.impact}</span>}
                                                    </li>
                                                ))}
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
                                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
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
                    <CardHeader className="cursor-pointer" onClick={() => toggleSection("formations")}>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <GraduationCap className="w-5 h-5" /> Formations ({ragData.formations.length})
                            </div>
                            {expandedSections.formations ? (
                                <ChevronUp className="w-4 h-4" />
                            ) : (
                                <ChevronDown className="w-4 h-4" />
                            )}
                        </CardTitle>
                    </CardHeader>
                    {expandedSections.formations && (
                        <CardContent className="space-y-3">
                            {ragData.formations.map((f: any, i: number) => (
                                <div key={i} className="flex items-start justify-between border-b pb-3 last:border-0 last:pb-0">
                                    <div>
                                        <div className="font-semibold">{f.diplome}</div>
                                        <div className="text-sm text-slate-500">
                                            {f.ecole} • {f.annee}
                                        </div>
                                    </div>
                                    <WeightBadge
                                        weight={f.weight || "inclus"}
                                        onChange={(w) => onWeightChange("formations", i, w)}
                                    />
                                </div>
                            ))}
                        </CardContent>
                    )}
                </Card>
            )}

            {/* Langues */}
            {ragData?.langues && Object.keys(ragData.langues).length > 0 && (
                <Card>
                    <CardHeader className="cursor-pointer" onClick={() => toggleSection("langues")}>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Languages className="w-5 h-5" /> Langues ({Object.keys(ragData.langues).length})
                            </div>
                            {expandedSections.langues ? (
                                <ChevronUp className="w-4 h-4" />
                            ) : (
                                <ChevronDown className="w-4 h-4" />
                            )}
                        </CardTitle>
                    </CardHeader>
                    {expandedSections.langues && (
                        <CardContent>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(ragData.langues).map(([lang, niveau]) => (
                                    <div key={lang} className="flex justify-between">
                                        <span className="font-medium">{lang} :</span>
                                        <span className="text-slate-600">{niveau as string}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    )}
                </Card>
            )}

            {/* Certifications */}
            {ragData?.certifications && ragData.certifications.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Badge className="bg-yellow-100 text-yellow-700">🏆</Badge>
                            Certifications ({ragData.certifications.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {ragData.certifications.map((cert: any, i: number) => (
                                <Badge key={i} variant="outline" className="bg-yellow-50 border-yellow-200">
                                    {typeof cert === 'string' ? cert : (cert?.nom || JSON.stringify(cert))}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

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
        </div>
    );
}
