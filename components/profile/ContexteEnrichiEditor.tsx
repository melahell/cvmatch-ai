"use client";

/**
 * Contexte Enrichi Editor
 * Permet de valider, rejeter, ajuster confidence score des déductions IA
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { CheckCircle, XCircle, Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { ContexteEnrichi } from "@/types/rag-contexte-enrichi";

interface ContexteEnrichiEditorProps {
    contexteEnrichi: ContexteEnrichi | undefined;
    userId: string;
    onUpdate?: () => void;
}

export function ContexteEnrichiEditor({
    contexteEnrichi,
    userId,
    onUpdate,
}: ContexteEnrichiEditorProps) {
    const [editing, setEditing] = useState<{
        type: "responsabilite" | "competence" | "environnement";
        index: number;
        confidence: number;
    } | null>(null);
    const [processing, setProcessing] = useState<string | null>(null);

    const handleValidate = async (
        item: any,
        type: "responsabilite" | "competence" | "environnement"
    ) => {
        setProcessing(`${type}-${item.id || Math.random()}`);
        try {
            const response = await fetch("/api/rag/validate-contexte", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type,
                    item_id: item.id || item.nom || item.description,
                    action: "validate",
                }),
            });

            if (response.ok) {
                toast.success("Déduction validée");
                onUpdate?.();
            } else {
                toast.error("Erreur lors de la validation");
            }
        } catch (error) {
            toast.error("Erreur lors de la validation");
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (
        item: any,
        type: "responsabilite" | "competence" | "environnement"
    ) => {
        setProcessing(`${type}-${item.id || Math.random()}`);
        try {
            const response = await fetch("/api/rag/validate-contexte", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type,
                    item_id: item.id || item.nom || item.description,
                    action: "reject",
                }),
            });

            if (response.ok) {
                toast.success("Déduction rejetée");
                onUpdate?.();
            } else {
                toast.error("Erreur lors du rejet");
            }
        } catch (error) {
            toast.error("Erreur lors du rejet");
        } finally {
            setProcessing(null);
        }
    };

    const handleAdjustConfidence = async (
        item: any,
        type: "responsabilite" | "competence" | "environnement",
        newConfidence: number
    ) => {
        try {
            const response = await fetch("/api/rag/validate-contexte", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type,
                    item_id: item.id || item.nom || item.description,
                    confidence: newConfidence,
                }),
            });

            if (response.ok) {
                toast.success("Confidence score ajusté");
                setEditing(null);
                onUpdate?.();
            } else {
                toast.error("Erreur lors de l'ajustement");
            }
        } catch (error) {
            toast.error("Erreur lors de l'ajustement");
        }
    };

    const handleDelete = async (
        item: any,
        type: "responsabilite" | "competence" | "environnement"
    ) => {
        if (!confirm("Supprimer cette déduction ?")) return;

        setProcessing(`delete-${type}-${item.id || Math.random()}`);
        try {
            const response = await fetch("/api/rag/validate-contexte", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type,
                    item_id: item.id || item.nom || item.description,
                }),
            });

            if (response.ok) {
                toast.success("Déduction supprimée");
                onUpdate?.();
            } else {
                toast.error("Erreur lors de la suppression");
            }
        } catch (error) {
            toast.error("Erreur lors de la suppression");
        } finally {
            setProcessing(null);
        }
    };

    if (!contexteEnrichi) {
        return null;
    }

    const renderItemEditor = (
        item: any,
        type: "responsabilite" | "competence" | "environnement",
        index: number
    ) => {
        const itemId = `${type}-${index}`;
        const isProcessing = processing === itemId || processing?.startsWith(`${type}-`);
        const isEditing = editing?.type === type && editing.index === index;

        return (
            <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="font-medium text-slate-900">
                            {item.description || item.nom}
                        </p>
                        {item.justification && (
                            <p className="text-sm text-slate-600 mt-1 italic">
                                "{item.justification}"
                            </p>
                        )}
                    </div>
                                    <Badge variant="outline">
                                        {isEditing ? editing.confidence : (item.confidence || item.confidence_score)}%
                                    </Badge>
                </div>

                {isEditing ? (
                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                Confidence Score: {editing.confidence}%
                            </label>
                            <Slider
                                value={[editing.confidence]}
                                onValueChange={([value]) =>
                                    setEditing({ ...editing, confidence: value })
                                }
                                min={60}
                                max={100}
                                step={5}
                                className="mt-2"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                onClick={() =>
                                    handleAdjustConfidence(item, type, editing.confidence)
                                }
                            >
                                Sauvegarder
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditing(null)}
                            >
                                Annuler
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleValidate(item, type)}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Valider
                                </>
                            )}
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(item, type)}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Rejeter
                                </>
                            )}
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                                setEditing({
                                    type,
                                    index,
                                    confidence: item.confidence || item.confidence_score,
                                })
                            }
                            disabled={isProcessing}
                        >
                            <Edit className="w-4 h-4 mr-1" />
                            Ajuster
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(item, type)}
                            disabled={isProcessing}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Responsabilités Implicites */}
            {contexteEnrichi.responsabilites_implicites &&
                contexteEnrichi.responsabilites_implicites.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Éditer Responsabilités Implicites</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {contexteEnrichi.responsabilites_implicites.map((resp, idx) =>
                                renderItemEditor(resp, "responsabilite", idx)
                            )}
                        </CardContent>
                    </Card>
                )}

            {/* Compétences Tacites */}
            {contexteEnrichi.competences_tacites &&
                contexteEnrichi.competences_tacites.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Éditer Compétences Tacites</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {contexteEnrichi.competences_tacites.map((comp, idx) =>
                                renderItemEditor(comp, "competence", idx)
                            )}
                        </CardContent>
                    </Card>
                )}

            {/* Environnement Travail */}
            {contexteEnrichi.environnement_travail && (
                <Card>
                    <CardHeader>
                        <CardTitle>Éditer Environnement de Travail</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {renderItemEditor(
                            contexteEnrichi.environnement_travail,
                            "environnement",
                            0
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
