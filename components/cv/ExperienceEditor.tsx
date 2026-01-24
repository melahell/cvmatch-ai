"use client";

/**
 * ExperienceEditor - Éditeur d'expériences avec drag & drop
 * 
 * Affiche les expériences dans une liste draggable pour réorganisation
 * avant rendu dans le CV. Plus simple que de modifier les templates.
 */

import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { RendererResumeSchema } from "@/lib/cv/renderer-schema";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useState, useEffect, useCallback } from "react";

interface ExperienceEditorProps {
    experiences: RendererResumeSchema["experiences"];
    onReorder: (newOrder: number[]) => void;
    onReorderBullets: (expIndex: number, newOrder: number[]) => void;
    className?: string;
}

function DraggableExperienceItem({
    exp,
    index,
    onReorderBullets,
}: {
    exp: RendererResumeSchema["experiences"][0];
    index: number;
    onReorderBullets: (expIndex: number, newOrder: number[]) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: `exp-${index}` });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "p-3 rounded-lg border bg-white hover:shadow-md transition-all group",
                isDragging && "shadow-lg border-indigo-300"
            )}
        >
            <div className="flex items-start gap-2">
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-indigo-600 transition-colors mt-1"
                    aria-label={`Réorganiser expérience ${index + 1}`}
                    title="Glisser pour réorganiser"
                >
                    <GripVertical className="w-4 h-4" />
                </button>
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-slate-900 text-sm">{exp.poste}</h4>
                        <Badge variant="outline" className="text-xs">
                            #{index + 1}
                        </Badge>
                    </div>
                    <p className="text-xs text-slate-600 mb-2">{exp.entreprise}</p>
                    {exp.realisations && exp.realisations.length > 0 && (
                        <div className="space-y-1 mt-2">
                            <p className="text-xs font-medium text-slate-500 mb-1">Réalisations ({exp.realisations.length})</p>
                            {exp.realisations.map((bullet, bulletIndex) => (
                                <div
                                    key={bulletIndex}
                                    className="text-xs text-slate-700 pl-4 border-l-2 border-slate-200"
                                >
                                    {bullet}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export function ExperienceEditor({
    experiences,
    onReorder,
    onReorderBullets,
    className,
}: ExperienceEditorProps) {
    const experienceIds = experiences.map((_, i) => `exp-${i}`);
    const [hasShownHelp, setHasShownHelp] = useState(false);
    const [lastReorderTime, setLastReorderTime] = useState<number>(0);

    // Afficher message d'aide au premier affichage
    useEffect(() => {
        if (!hasShownHelp && experiences.length > 0) {
            const helpShown = localStorage.getItem("cv-editor-help-shown");
            if (!helpShown) {
                setTimeout(() => {
                    toast.info("💡 Glissez les expériences pour réorganiser l'ordre dans votre CV", {
                        duration: 5000,
                    });
                    localStorage.setItem("cv-editor-help-shown", "true");
                    setHasShownHelp(true);
                }, 1000);
            }
        }
    }, [hasShownHelp, experiences.length]);

    // Wrapper pour onReorder avec feedback
    const handleReorder = useCallback((newOrder: number[]) => {
        onReorder(newOrder);
        const now = Date.now();
        // Éviter les toasts trop fréquents (max 1 toutes les 2 secondes)
        if (now - lastReorderTime > 2000) {
            toast.success("Ordre sauvegardé", { duration: 2000 });
            setLastReorderTime(now);
        }
    }, [onReorder, lastReorderTime]);

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="text-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span>Éditeur d'Expériences</span>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="right" className="max-w-xs">
                                    <p className="text-xs">
                                        Réorganisez l'ordre d'affichage des expériences dans votre CV en glissant-déposant.
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <Badge variant="info" className="text-xs">
                        {experiences.length} expériences
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <SortableContext items={experienceIds} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                        {experiences.map((exp, index) => (
                            <DraggableExperienceItem
                                key={index}
                                exp={exp}
                                index={index}
                                onReorderBullets={onReorderBullets}
                            />
                        ))}
                    </div>
                </SortableContext>
                <div className="mt-3 p-2 rounded-md bg-blue-50 border border-blue-100">
                    <p className="text-xs text-blue-700 flex items-start gap-2">
                        <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span>
                            <strong>Glissez-déposez</strong> les expériences pour réorganiser. L'ordre sera sauvegardé automatiquement et appliqué à votre CV.
                        </span>
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
