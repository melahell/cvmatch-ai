"use client";

/**
 * Contexte Enrichi Viewer
 * Affiche les déductions IA (responsabilités implicites, compétences tacites, environnement travail)
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, CheckCircle, XCircle, Clock } from "lucide-react";
import type { ContexteEnrichi } from "@/types/rag-contexte-enrichi";

interface ContexteEnrichiViewerProps {
    contexteEnrichi: ContexteEnrichi | undefined;
    onValidate?: (item: any, type: "responsabilite" | "competence" | "environnement") => void;
    onReject?: (item: any, type: "responsabilite" | "competence" | "environnement") => void;
}

export function ContexteEnrichiViewer({
    contexteEnrichi,
    onValidate,
    onReject,
}: ContexteEnrichiViewerProps) {
    if (!contexteEnrichi) {
        return (
            <Card>
                <CardContent className="p-8 text-center text-slate-500">
                    <Sparkles className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                    <p>Aucun contexte enrichi disponible</p>
                    <p className="text-sm mt-2">Le contexte enrichi sera généré lors de la prochaine mise à jour du RAG</p>
                </CardContent>
            </Card>
        );
    }

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 95) return "bg-blue-100 text-blue-700 border-blue-200";
        if (confidence >= 80) return "bg-green-100 text-green-700 border-green-200";
        if (confidence >= 60) return "bg-yellow-100 text-yellow-700 border-yellow-200";
        return "bg-orange-100 text-orange-700 border-orange-200";
    };

    const getConfidenceLabel = (confidence: number) => {
        if (confidence >= 95) return "Très fiable";
        if (confidence >= 80) return "Fiable";
        if (confidence >= 60) return "Probable";
        return "Incertain";
    };

    const stats = {
        total: (contexteEnrichi.responsabilites_implicites?.length || 0) +
               (contexteEnrichi.competences_tacites?.length || 0) +
               (contexteEnrichi.environnement_travail ? 1 : 0),
        validated: 0, // À calculer depuis rag_metadata
        rejected: 0, // À calculer depuis rag_metadata
        pending: 0,
    };

    return (
        <div className="space-y-6">
            {/* Stats globales */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Déductions IA
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
                            <div className="text-sm text-slate-600">Total déductions</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{stats.validated}</div>
                            <div className="text-sm text-slate-600">Validées</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                            <div className="text-sm text-slate-600">Rejetées</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                            <div className="text-sm text-slate-600">En attente</div>
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-3 text-center">
                        Les scores de confiance reflètent la certitude de l'IA dans ses déductions, pas la pertinence par rapport à une offre d'emploi.
                    </p>
                </CardContent>
            </Card>

            {/* Responsabilités Implicites */}
            {contexteEnrichi.responsabilites_implicites && contexteEnrichi.responsabilites_implicites.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Responsabilités Implicites</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {contexteEnrichi.responsabilites_implicites.map((resp, idx) => (
                            <div
                                key={idx}
                                className="border rounded-lg p-4 hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-900">{resp.description}</p>
                                        {resp.justification && (
                                            <p className="text-sm text-slate-600 mt-1 italic">
                                                "{resp.justification}"
                                            </p>
                                        )}
                                    </div>
                                    <Badge className={getConfidenceColor(resp.confidence)}>
                                        Confiance IA : {resp.confidence}% ({getConfidenceLabel(resp.confidence)})
                                    </Badge>
                                </div>
                                {(resp as any).impact_match_score && (
                                    <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                                        <TrendingUp className="w-4 h-4" />
                                        <span>Impact: +{(resp as any).impact_match_score}% sur match scores</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Compétences Tacites */}
            {contexteEnrichi.competences_tacites && contexteEnrichi.competences_tacites.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Compétences Tacites</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {contexteEnrichi.competences_tacites.map((comp, idx) => (
                            <div
                                key={idx}
                                className="border rounded-lg p-4 hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-900">{comp.nom}</p>
                                        {comp.justification && (
                                            <p className="text-sm text-slate-600 mt-1 italic">
                                                "{comp.justification}"
                                            </p>
                                        )}
                                    </div>
                                    <Badge className={getConfidenceColor(comp.confidence)}>
                                        Confiance IA : {comp.confidence}% ({getConfidenceLabel(comp.confidence)})
                                    </Badge>
                                </div>
                                {(comp as any).impact_match_score && (
                                    <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                                        <TrendingUp className="w-4 h-4" />
                                        <span>Impact: +{(comp as any).impact_match_score}% sur match scores</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Environnement Travail */}
            {contexteEnrichi.environnement_travail && (
                <Card>
                    <CardHeader>
                        <CardTitle>Environnement de Travail</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <p className="font-medium text-slate-900">
                                        {(contexteEnrichi.environnement_travail as any).description || 
                                         `Équipe: ${contexteEnrichi.environnement_travail.taille_equipe || 'N/A'}, Contexte: ${contexteEnrichi.environnement_travail.contexte_projet || 'N/A'}`}
                                    </p>
                                    {(contexteEnrichi.environnement_travail as any).justification && (
                                        <p className="text-sm text-slate-600 mt-1 italic">
                                            "{(contexteEnrichi.environnement_travail as any).justification}"
                                        </p>
                                    )}
                                </div>
                                {(contexteEnrichi.environnement_travail as any).confidence && (
                                    <Badge className={getConfidenceColor((contexteEnrichi.environnement_travail as any).confidence)}>
                                        Confiance IA : {(contexteEnrichi.environnement_travail as any).confidence}% ({getConfidenceLabel((contexteEnrichi.environnement_travail as any).confidence)})
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
