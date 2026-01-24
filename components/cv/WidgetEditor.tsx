"use client";

/**
 * Composant pour éditer les widgets manuellement
 * Permet d'ajouter, modifier ou supprimer des widgets
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit2, Save, X } from "lucide-react";
import type { AIWidgetsEnvelope, AIWidget } from "@/lib/cv/ai-widgets";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface WidgetEditorProps {
    widgets: AIWidgetsEnvelope;
    onUpdate: (updatedWidgets: AIWidgetsEnvelope) => void;
}

export function WidgetEditor({ widgets, onUpdate }: WidgetEditorProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newWidget, setNewWidget] = useState<Partial<AIWidget>>({
        type: "experience_bullet",
        section: "experiences",
        text: "",
        relevance_score: 50,
    });

    const handleEdit = (widget: AIWidget) => {
        setEditingId(widget.id);
        setNewWidget(widget);
        setShowAddForm(true);
    };

    const handleSave = () => {
        if (!editingId && !newWidget.text) return;

        const updatedWidgets = { ...widgets };
        
        if (editingId) {
            // Modifier widget existant
            const index = updatedWidgets.widgets.findIndex(w => w.id === editingId);
            if (index !== -1) {
                updatedWidgets.widgets[index] = {
                    ...updatedWidgets.widgets[index],
                    ...newWidget,
                } as AIWidget;
            }
            setEditingId(null);
        } else {
            // Ajouter nouveau widget
            const widgetToAdd: AIWidget = {
                id: `custom_${Date.now()}`,
                type: (newWidget.type || "experience_bullet") as AIWidget["type"],
                section: (newWidget.section || "experiences") as AIWidget["section"],
                text: newWidget.text || "",
                relevance_score: newWidget.relevance_score || 50,
                sources: newWidget.sources,
                quality: newWidget.quality,
            };
            updatedWidgets.widgets.push(widgetToAdd);
        }

        onUpdate(updatedWidgets);
        setShowAddForm(false);
        setNewWidget({
            type: "experience_bullet",
            section: "experiences",
            text: "",
            relevance_score: 50,
        });
    };

    const handleDelete = (widgetId: string) => {
        const updatedWidgets = {
            ...widgets,
            widgets: widgets.widgets.filter(w => w.id !== widgetId),
        };
        onUpdate(updatedWidgets);
    };

    const handleCancel = () => {
        setEditingId(null);
        setShowAddForm(false);
        setNewWidget({
            type: "experience_bullet",
            section: "experiences",
            text: "",
            relevance_score: 50,
        });
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Éditeur de Widgets</CardTitle>
                    {!showAddForm && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setShowAddForm(true);
                                setEditingId(null);
                            }}
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Ajouter widget
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Formulaire ajout/édition */}
                {showAddForm && (
                    <Card className="bg-slate-50">
                        <CardContent className="pt-4 space-y-3">
                            <div>
                                <Label className="text-xs">Type</Label>
                                <Select
                                    value={newWidget.type}
                                    onValueChange={(value) => setNewWidget({ ...newWidget, type: value as AIWidget["type"] })}
                                >
                                    <SelectTrigger className="h-8 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="experience_bullet">Bullet d'expérience</SelectItem>
                                        <SelectItem value="experience_header">En-tête d'expérience</SelectItem>
                                        <SelectItem value="skill_item">Compétence</SelectItem>
                                        <SelectItem value="summary_block">Résumé</SelectItem>
                                        <SelectItem value="education_item">Formation</SelectItem>
                                        <SelectItem value="project_item">Projet</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-xs">Section</Label>
                                <Select
                                    value={newWidget.section}
                                    onValueChange={(value) => setNewWidget({ ...newWidget, section: value as AIWidget["section"] })}
                                >
                                    <SelectTrigger className="h-8 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="experiences">Expériences</SelectItem>
                                        <SelectItem value="skills">Compétences</SelectItem>
                                        <SelectItem value="summary">Résumé</SelectItem>
                                        <SelectItem value="education">Formations</SelectItem>
                                        <SelectItem value="projects">Projets</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-xs">Texte</Label>
                                <Textarea
                                    value={newWidget.text}
                                    onChange={(e) => setNewWidget({ ...newWidget, text: e.target.value })}
                                    className="text-xs min-h-[60px]"
                                    placeholder="Texte du widget..."
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Score de pertinence: {newWidget.relevance_score || 50}</Label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={newWidget.relevance_score || 50}
                                    onChange={(e) => setNewWidget({ ...newWidget, relevance_score: Number(e.target.value) })}
                                    className="w-full"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" onClick={handleSave} className="flex-1">
                                    <Save className="w-3 h-3 mr-1" />
                                    {editingId ? "Sauvegarder" : "Ajouter"}
                                </Button>
                                <Button size="sm" variant="outline" onClick={handleCancel} className="flex-1">
                                    <X className="w-3 h-3 mr-1" />
                                    Annuler
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Liste des widgets */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {widgets.widgets.map((widget) => (
                        <div
                            key={widget.id}
                            className="flex items-start gap-2 p-2 rounded-md bg-slate-50 border border-slate-200"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="text-xs">
                                        {widget.type}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                        {widget.section}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                        Score: {widget.relevance_score}
                                    </Badge>
                                </div>
                                <p className="text-xs text-slate-700 line-clamp-2">
                                    {widget.text}
                                </p>
                            </div>
                            <div className="flex gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(widget)}
                                    className="h-7 w-7 p-0"
                                    aria-label="Modifier le widget"
                                >
                                    <Edit2 className="w-3 h-3" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(widget.id)}
                                    className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                                    aria-label="Supprimer le widget"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
