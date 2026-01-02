"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Briefcase, Code, GraduationCap, Languages, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface OverviewTabProps {
    ragData: any;
}

export function OverviewTab({ ragData }: OverviewTabProps) {
    const [expandedSections, setExpandedSections] = useState({
        experiences: true,
        competences: true,
        formations: false,
        langues: false
    });

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    if (!ragData) {
        return (
            <div className="text-center py-12 text-slate-500">
                Aucune donnée disponible. Uploadez des documents et régénérez votre profil.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Profile */}
            {ragData?.profile && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" /> Profil
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {ragData.profile.prenom && (
                            <div>
                                <strong className="text-slate-700">Nom :</strong>{" "}
                                {ragData.profile.prenom} {ragData.profile.nom}
                            </div>
                        )}
                        {ragData.profile.titre_principal && (
                            <div>
                                <strong className="text-slate-700">Titre :</strong> {ragData.profile.titre_principal}
                            </div>
                        )}
                        {ragData.profile.localisation && (
                            <div>
                                <strong className="text-slate-700">Localisation :</strong> {ragData.profile.localisation}
                            </div>
                        )}
                        {ragData.profile.elevator_pitch && (
                            <div>
                                <strong className="text-slate-700">Pitch :</strong>
                                <p className="text-sm text-slate-600 mt-1">{ragData.profile.elevator_pitch}</p>
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
                                        <div>
                                            <div className="font-semibold text-lg">{exp.poste}</div>
                                            <div className="text-sm text-slate-500">
                                                {exp.entreprise} • {exp.debut} - {exp.fin || "Présent"}
                                            </div>
                                        </div>
                                        {exp.weight && exp.weight === "important" && (
                                            <Badge className="bg-green-100 text-green-700">🔥 Important</Badge>
                                        )}
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

            {/* Compétences */}
            {ragData?.competences && (
                <Card>
                    <CardHeader className="cursor-pointer" onClick={() => toggleSection("competences")}>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Code className="w-5 h-5" /> Compétences
                            </div>
                            {expandedSections.competences ? (
                                <ChevronUp className="w-4 h-4" />
                            ) : (
                                <ChevronDown className="w-4 h-4" />
                            )}
                        </CardTitle>
                    </CardHeader>
                    {expandedSections.competences && (
                        <CardContent className="space-y-3">
                            {ragData.competences.techniques && ragData.competences.techniques.length > 0 && (
                                <div>
                                    <div className="text-sm font-medium mb-2">Techniques :</div>
                                    <div className="flex flex-wrap gap-1">
                                        {ragData.competences.techniques.map((skill: any, i: number) => (
                                            <Badge key={i} variant="secondary">
                                                {typeof skill === "string" ? skill : skill.nom}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {ragData.competences.soft_skills && ragData.competences.soft_skills.length > 0 && (
                                <div>
                                    <div className="text-sm font-medium mb-2">Soft Skills :</div>
                                    <div className="flex flex-wrap gap-1">
                                        {ragData.competences.soft_skills.map((skill: string, i: number) => (
                                            <Badge key={i} variant="outline">
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    )}
                </Card>
            )}

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
                                <div key={i} className="border-b pb-3 last:border-0 last:pb-0">
                                    <div className="font-semibold">{f.diplome}</div>
                                    <div className="text-sm text-slate-500">
                                        {f.ecole} • {f.annee}
                                    </div>
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
        </div>
    );
}
