"use client";

/**
 * MultiTemplatePreview - Preview côte à côte de plusieurs thèmes
 * 
 * Permet de comparer visuellement plusieurs templates simultanément
 * pour faciliter le choix du meilleur thème.
 */

import { useState } from "react";
import CVRenderer from "@/components/cv/CVRenderer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LayoutGrid, LayoutList, X } from "lucide-react";
import type { RendererResumeSchema } from "@/lib/cv/renderer-schema";
import { getAvailableTemplates, getTemplateById } from "@/components/cv/templates";

interface MultiTemplatePreviewProps {
    cvData: RendererResumeSchema;
    selectedTemplates?: string[]; // Templates à afficher (par défaut: tous disponibles)
    maxTemplates?: number; // Nombre max de templates à afficher (par défaut: 4)
    onTemplateSelect?: (templateId: string) => void; // Callback quand un template est sélectionné
    className?: string;
}

export function MultiTemplatePreview({
    cvData,
    selectedTemplates,
    maxTemplates = 4,
    onTemplateSelect,
    className,
}: MultiTemplatePreviewProps) {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

    // Filtrer templates disponibles
    const availableTemplates = getAvailableTemplates();
    const templatesToShow = selectedTemplates
        ? availableTemplates.filter((t) => selectedTemplates.includes(t.id))
        : availableTemplates.slice(0, maxTemplates);

    const handleTemplateClick = (templateId: string) => {
        setSelectedTemplate(templateId);
        onTemplateSelect?.(templateId);
    };

    const handleCloseSingle = () => {
        setSelectedTemplate(null);
    };

    // Mode single (un seul template en grand)
    if (selectedTemplate) {
        return (
            <div className={className}>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-base">
                                {getTemplateById(selectedTemplate)?.name || selectedTemplate}
                            </CardTitle>
                            <Badge variant="primary">Sélectionné</Badge>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleCloseSingle}>
                            <X className="w-4 h-4 mr-1" />
                            Voir tous
                        </Button>
                    </CardHeader>
                    <CardContent className="bg-slate-100 flex items-center justify-center p-4 min-h-[800px]">
                        <div className="w-full max-w-[900px] bg-white shadow-lg">
                            <CVRenderer
                                data={cvData}
                                templateId={selectedTemplate}
                                includePhoto={true}
                                dense={false}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Mode multi (plusieurs templates)
    return (
        <div className={className}>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">Comparaison Templates</CardTitle>
                    <div className="flex items-center gap-2">
                        <Button
                            variant={viewMode === "grid" ? "primary" : "outline"}
                            size="sm"
                            onClick={() => setViewMode("grid")}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </Button>
                        <Button
                            variant={viewMode === "list" ? "primary" : "outline"}
                            size="sm"
                            onClick={() => setViewMode("list")}
                        >
                            <LayoutList className="w-4 h-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {viewMode === "grid" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {templatesToShow.map((template) => (
                                <Card
                                    key={template.id}
                                    className="cursor-pointer hover:shadow-lg transition-shadow"
                                    onClick={() => handleTemplateClick(template.id)}
                                >
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-sm">{template.name}</CardTitle>
                                            <Badge variant="outline" className="text-xs">
                                                {template.category}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="bg-slate-50 p-3">
                                        <div className="bg-white shadow-sm rounded overflow-hidden">
                                            <div className="scale-75 origin-top-left w-[133%] h-[600px] overflow-hidden">
                                                <CVRenderer
                                                    data={cvData}
                                                    templateId={template.id}
                                                    includePhoto={true}
                                                    dense={false}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {templatesToShow.map((template) => (
                                <Card
                                    key={template.id}
                                    className="cursor-pointer hover:shadow-md transition-shadow"
                                    onClick={() => handleTemplateClick(template.id)}
                                >
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <div className="flex items-center gap-2">
                                            <CardTitle className="text-sm">{template.name}</CardTitle>
                                            <Badge variant="outline" className="text-xs">
                                                {template.category}
                                            </Badge>
                                        </div>
                                        <Button variant="outline" size="sm">
                                            Voir en grand
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="bg-slate-50 p-3">
                                        <div className="bg-white shadow-sm rounded overflow-hidden">
                                            <div className="scale-50 origin-top-left w-[200%] h-[400px] overflow-hidden">
                                                <CVRenderer
                                                    data={cvData}
                                                    templateId={template.id}
                                                    includePhoto={true}
                                                    dense={false}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
