"use client";

import React, { useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Calendar, MapPin } from "lucide-react";
import { WeightSelector, Weight } from "./WeightSelector";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ExperienceItemProps {
    experience: {
        id?: string;
        titre: string;
        entreprise: string;
        date_debut: string;
        date_fin?: string;
        description?: string;
        lieu?: string;
        weight?: Weight;
    };
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
    onWeightChange?: (id: string, weight: Weight) => void;
    showActions?: boolean;
}

export const ExperienceItem = React.memo(function ExperienceItem({
    experience,
    onEdit,
    onDelete,
    onWeightChange,
    showActions = true
}: ExperienceItemProps) {
    const formatDate = useCallback((dateStr: string) => {
        if (!dateStr) return '';
        try {
            return format(new Date(dateStr), 'MMM yyyy', { locale: fr });
        } catch {
            return dateStr;
        }
    }, []);

    const isCurrentPosition = useMemo(() => {
        return !experience.date_fin || experience.date_fin === '';
    }, [experience.date_fin]);

    const formattedStartDate = useMemo(() => formatDate(experience.date_debut), [experience.date_debut, formatDate]);
    const formattedEndDate = useMemo(() => {
        if (isCurrentPosition) return "Aujourd'hui";
        return formatDate(experience.date_fin || '');
    }, [experience.date_fin, isCurrentPosition, formatDate]);

    const handleEdit = useCallback(() => {
        if (experience.id) onEdit?.(experience.id);
    }, [experience.id, onEdit]);

    const handleDelete = useCallback(() => {
        if (experience.id) onDelete?.(experience.id);
    }, [experience.id, onDelete]);

    const handleWeightChange = useCallback((weight: Weight) => {
        if (experience.id) onWeightChange?.(experience.id, weight);
    }, [experience.id, onWeightChange]);

    return (
        <Card className="p-4">
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <h4 className="font-semibold text-lg">{experience.titre}</h4>
                            <p className="text-slate-600">{experience.entreprise}</p>
                        </div>
                        {isCurrentPosition && (
                            <Badge variant="neutral" className="text-xs">
                                En cours
                            </Badge>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm text-slate-600 mb-2">
                        <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                                {formattedStartDate}
                                {' - '}
                                {formattedEndDate}
                            </span>
                        </div>
                        {experience.lieu && (
                            <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{experience.lieu}</span>
                            </div>
                        )}
                    </div>

                    {experience.description && (
                        <p className="text-sm text-slate-600 line-clamp-2">
                            {experience.description}
                        </p>
                    )}
                </div>

                {showActions && (
                    <div className="flex flex-col gap-2">
                        {onWeightChange && experience.id && (
                            <WeightSelector
                                value={experience.weight || 'inclus'}
                                onChange={handleWeightChange}
                            />
                        )}
                        <div className="flex gap-1">
                            {onEdit && experience.id && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleEdit}
                                >
                                    <Edit className="w-4 h-4" />
                                </Button>
                            )}
                            {onDelete && experience.id && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDelete}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
});
