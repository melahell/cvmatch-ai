"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Wrench, GraduationCap } from "lucide-react";

type WeightValue = "important" | "inclus" | "exclu";

interface WeightBadgeProps {
    weight: WeightValue;
    onChange: (w: WeightValue) => void;
}

const WeightBadge = ({ weight, onChange }: WeightBadgeProps) => {
    const weights: WeightValue[] = ["important", "inclus", "exclu"];
    const idx = weights.indexOf(weight);
    const [justChanged, setJustChanged] = useState(false);

    const cycle = () => {
        const nextIdx = (idx + 1) % weights.length;
        onChange(weights[nextIdx]);
        setJustChanged(true);
        setTimeout(() => setJustChanged(false), 500);
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

    const tooltips = {
        important: "Cliquez pour changer → Sera mis en avant dans vos CVs",
        inclus: "Cliquez pour changer → Inclus par défaut dans vos CVs",
        exclu: "Cliquez pour changer → Ne sera jamais inclus dans vos CVs"
    };

    return (
        <button
            onClick={cycle}
            title={tooltips[weight]}
            className={`px-2 py-1 text-xs font-medium rounded border transition-all duration-200 ${styles[weight]} ${justChanged ? "scale-110 ring-2 ring-offset-1" : ""}`}
        >
            {labels[weight]}
        </button>
    );
};

interface WeightTabProps {
    ragData: any;
    onWeightChange: (section: string, index: number, weight: WeightValue) => void;
}

export function WeightTab({ ragData, onWeightChange }: WeightTabProps) {
    if (!ragData) {
        return (
            <div className="text-center py-12 text-slate-600">
                Aucune donnée disponible. Uploadez des documents et régénérez votre profil.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Legend */}
            <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-sm font-medium mb-2">Pondération :</div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs">
                    <span className="flex items-center gap-1">
                        <Badge className="bg-green-100 text-green-700 shrink-0">🔥 Important</Badge>
                        <span className="text-slate-600">= Mis en avant dans les CVs</span>
                    </span>
                    <span className="flex items-center gap-1">
                        <Badge className="bg-blue-100 text-blue-700 shrink-0">✅ Inclus</Badge>
                        <span className="text-slate-600">= Inclus par défaut</span>
                    </span>
                    <span className="flex items-center gap-1">
                        <Badge className="bg-red-100 text-red-700 shrink-0">❌ Exclu</Badge>
                        <span className="text-slate-600">= Jamais inclus</span>
                    </span>
                </div>
            </div>

            {/* Experiences */}
            {ragData?.experiences && ragData.experiences.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase className="w-5 h-5" /> Expériences ({ragData.experiences.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {ragData.experiences.map((exp: any, i: number) => (
                            <div key={i} className="flex items-start justify-between border-b pb-3 last:border-0">
                                <div>
                                    <div className="font-medium">{exp.poste}</div>
                                    <div className="text-sm text-slate-600">
                                        {exp.entreprise} • {exp.debut} - {exp.fin || "Présent"}
                                    </div>
                                </div>
                                <WeightBadge
                                    weight={exp.weight || "inclus"}
                                    onChange={(w) => onWeightChange("experiences", i, w)}
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Compétences */}
            {ragData?.competences?.techniques && ragData.competences.techniques.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wrench className="w-5 h-5" /> Compétences Techniques ({ragData.competences.techniques.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {ragData.competences.techniques.map((skill: any, i: number) => (
                                <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                                    <span className="text-sm">{typeof skill === "string" ? skill : skill.nom}</span>
                                    <WeightBadge
                                        weight={skill.weight || "inclus"}
                                        onChange={(w) => onWeightChange("competences.techniques", i, w)}
                                    />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Formations */}
            {ragData?.formations && ragData.formations.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <GraduationCap className="w-5 h-5" /> Formations ({ragData.formations.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {ragData.formations.map((f: any, i: number) => (
                            <div key={i} className="flex items-start justify-between border-b pb-3 last:border-0">
                                <div>
                                    <div className="font-medium">{f.diplome}</div>
                                    <div className="text-sm text-slate-600">{f.ecole} • {f.annee}</div>
                                </div>
                                <WeightBadge
                                    weight={f.weight || "inclus"}
                                    onChange={(w) => onWeightChange("formations", i, w)}
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
