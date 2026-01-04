"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Image as ImageIcon } from "lucide-react";
import { TEMPLATES, TemplateInfo } from "./templates";

interface TemplateSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (templateId: string, includePhoto: boolean) => void;
    currentPhoto?: string | null;
}

export function TemplateSelector({
    isOpen,
    onClose,
    onSelect,
    currentPhoto
}: TemplateSelectorProps) {
    const [selectedTemplate, setSelectedTemplate] = useState<string>("modern");
    const [includePhoto, setIncludePhoto] = useState<boolean>(!!currentPhoto);

    if (!isOpen) return null;

    const availableTemplates = TEMPLATES.filter(t => t.available);

    const handleGenerate = () => {
        onSelect(selectedTemplate, includePhoto);
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                Choisir un template
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Sélectionnez le design de votre CV
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Template Grid */}
                    <div className="p-6">
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {availableTemplates.map((template) => (
                                <TemplateCard
                                    key={template.id}
                                    template={template}
                                    selected={selectedTemplate === template.id}
                                    onSelect={() => setSelectedTemplate(template.id)}
                                />
                            ))}

                            {/* Coming Soon cards */}
                            {TEMPLATES.filter(t => !t.available).map((template) => (
                                <div
                                    key={template.id}
                                    className="relative rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-4 opacity-50"
                                >
                                    <div className="aspect-[210/297] bg-slate-100 dark:bg-slate-800 rounded-lg mb-3 flex items-center justify-center">
                                        <span className="text-sm text-slate-400">Bientôt</span>
                                    </div>
                                    <h3 className="font-medium text-slate-600 dark:text-slate-400">
                                        {template.name}
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                        {template.description}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Photo Toggle */}
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-6">
                            <label className="flex items-center justify-between cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <ImageIcon className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <span className="font-medium text-slate-900 dark:text-white">
                                            Inclure ma photo
                                        </span>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {currentPhoto
                                                ? "Votre photo de profil sera ajoutée au CV"
                                                : "Aucune photo de profil uploadée"
                                            }
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIncludePhoto(!includePhoto)}
                                    disabled={!currentPhoto}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${includePhoto && currentPhoto
                                            ? "bg-blue-600"
                                            : "bg-slate-300 dark:bg-slate-600"
                                        } ${!currentPhoto ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    <span
                                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${includePhoto && currentPhoto ? "left-7" : "left-1"
                                            }`}
                                    />
                                </button>
                            </label>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                className="flex-1 dark:border-slate-700 dark:text-slate-300"
                            >
                                Annuler
                            </Button>
                            <Button
                                onClick={handleGenerate}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                                Générer mon CV
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// Template Card Component
function TemplateCard({
    template,
    selected,
    onSelect
}: {
    template: TemplateInfo;
    selected: boolean;
    onSelect: () => void;
}) {
    return (
        <button
            onClick={onSelect}
            className={`relative rounded-xl border-2 p-4 text-left transition-all ${selected
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
        >
            {/* Selection indicator */}
            {selected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                </div>
            )}

            {/* Preview */}
            <div className={`aspect-[210/297] rounded-lg mb-3 overflow-hidden ${template.id === 'modern'
                    ? 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50'
                    : 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50'
                }`}>
                {/* Mini preview mockup */}
                <div className="p-3 h-full flex flex-col">
                    <div className="flex gap-2 mb-2">
                        <div className="flex-1">
                            <div className={`h-2 w-16 rounded ${template.id === 'modern' ? 'bg-blue-200' : 'bg-green-200'}`} />
                            <div className="h-1.5 w-12 bg-slate-200 rounded mt-1" />
                        </div>
                        {template.id === 'modern' && (
                            <div className="w-6 h-6 bg-slate-200 rounded-full" />
                        )}
                    </div>
                    <div className="flex-1 flex gap-2">
                        {template.id === 'tech' && (
                            <div className="w-1/3 space-y-1">
                                <div className="h-1 bg-slate-200 rounded" />
                                <div className="h-1 bg-slate-200 rounded w-3/4" />
                                <div className="h-1 bg-slate-200 rounded" />
                            </div>
                        )}
                        <div className="flex-1 space-y-1">
                            <div className="h-1 bg-slate-200 rounded" />
                            <div className="h-1 bg-slate-200 rounded w-4/5" />
                            <div className="h-1 bg-slate-200 rounded w-3/4" />
                        </div>
                        {template.id === 'modern' && (
                            <div className="w-1/4 space-y-1">
                                <div className="h-1 bg-slate-200 rounded" />
                                <div className="h-1 bg-slate-200 rounded w-3/4" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Info */}
            <h3 className={`font-semibold ${selected ? 'text-blue-700 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                {template.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {template.description}
            </p>
            {template.recommended && (
                <div className="flex flex-wrap gap-1 mt-2">
                    {template.recommended.slice(0, 2).map((rec, i) => (
                        <span
                            key={i}
                            className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500"
                        >
                            {rec}
                        </span>
                    ))}
                </div>
            )}
        </button>
    );
}
