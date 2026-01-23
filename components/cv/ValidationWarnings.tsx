"use client";

/**
 * Composant d'affichage des warnings de validation anti-hallucination
 * 
 * Affiche les widgets filtrés et les raisons de leur filtrage.
 */

import { AlertCircle, XCircle, AlertTriangle, Info, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ValidationResult } from "@/lib/cv/widget-validator";
import { useState } from "react";

interface ValidationWarningsProps {
    validation: ValidationResult;
    className?: string;
}

export function ValidationWarnings({ validation, className }: ValidationWarningsProps) {
    const [isOpen, setIsOpen] = useState(false);

    if (validation.warnings.length === 0 && validation.stats.filtered === 0) {
        return null;
    }

    const highSeverityWarnings = validation.warnings.filter((w) => w.severity === "high");
    const mediumSeverityWarnings = validation.warnings.filter((w) => w.severity === "medium");
    const lowSeverityWarnings = validation.warnings.filter((w) => w.severity === "low");

    return (
        <Card className={className}>
            <CardHeader 
                className="cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {validation.stats.filtered > 0 ? (
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                        ) : (
                            <Info className="w-5 h-5 text-blue-500" />
                        )}
                        <CardTitle className="text-sm">
                            Validation Anti-Hallucination
                        </CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge
                            variant={
                                validation.stats.filtered === 0
                                    ? "success"
                                    : highSeverityWarnings.length > 0
                                    ? "error"
                                    : "warning"
                            }
                        >
                            {validation.stats.valid}/{validation.stats.total} widgets validés
                        </Badge>
                        {isOpen ? (
                            <ChevronUp className="w-4 h-4 text-slate-500" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-slate-500" />
                        )}
                    </div>
                </div>
            </CardHeader>
            {isOpen && (
                <CardContent className="space-y-4">
                        {/* Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div className="flex flex-col">
                                <span className="text-slate-500">Total</span>
                                <span className="font-semibold text-slate-900">
                                    {validation.stats.total}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-slate-500">Validés</span>
                                <span className="font-semibold text-green-600">
                                    {validation.stats.valid}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-slate-500">Filtrés</span>
                                <span className="font-semibold text-amber-600">
                                    {validation.stats.filtered}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-slate-500">Taux</span>
                                <span className="font-semibold text-slate-900">
                                    {validation.stats.total > 0
                                        ? Math.round(
                                              (validation.stats.valid / validation.stats.total) * 100
                                          )
                                        : 0}
                                    %
                                </span>
                            </div>
                        </div>

                        {/* Détails filtrage */}
                        {validation.stats.filtered > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-xs font-semibold text-slate-700">
                                    Raisons de filtrage :
                                </h4>
                                <div className="flex flex-wrap gap-2 text-xs">
                                    {validation.stats.filteredByNumbers > 0 && (
                                        <Badge variant="error" className="text-xs">
                                            {validation.stats.filteredByNumbers} chiffres non groundés
                                        </Badge>
                                    )}
                                    {validation.stats.filteredByExperience > 0 && (
                                        <Badge variant="error" className="text-xs">
                                            {validation.stats.filteredByExperience} expériences introuvables
                                        </Badge>
                                    )}
                                    {validation.stats.filteredBySkill > 0 && (
                                        <Badge variant="warning" className="text-xs">
                                            {validation.stats.filteredBySkill} compétences non présentes
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Liste warnings */}
                        {validation.warnings.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-xs font-semibold text-slate-700">
                                    Warnings détaillés :
                                </h4>
                                <div className="space-y-1 max-h-60 overflow-y-auto">
                                    {highSeverityWarnings.map((warning) => (
                                        <div
                                            key={warning.widgetId}
                                            className="flex items-start gap-2 p-2 rounded-md bg-red-50 border border-red-100 text-xs"
                                        >
                                            <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-red-900">
                                                    Widget {warning.widgetId}
                                                </div>
                                                <div className="text-red-700 mt-0.5">
                                                    {warning.message}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {mediumSeverityWarnings.map((warning) => (
                                        <div
                                            key={warning.widgetId}
                                            className="flex items-start gap-2 p-2 rounded-md bg-amber-50 border border-amber-100 text-xs"
                                        >
                                            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-amber-900">
                                                    Widget {warning.widgetId}
                                                </div>
                                                <div className="text-amber-700 mt-0.5">
                                                    {warning.message}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {lowSeverityWarnings.map((warning) => (
                                        <div
                                            key={warning.widgetId}
                                            className="flex items-start gap-2 p-2 rounded-md bg-blue-50 border border-blue-100 text-xs"
                                        >
                                            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-blue-900">
                                                    Widget {warning.widgetId}
                                                </div>
                                                <div className="text-blue-700 mt-0.5">
                                                    {warning.message}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Message si tout est OK */}
                        {validation.stats.filtered === 0 && (
                            <div className="flex items-center gap-2 p-3 rounded-md bg-green-50 border border-green-100 text-xs">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-green-700 font-medium">
                                    Tous les widgets sont validés et groundés dans le RAG source.
                                </span>
                            </div>
                        )}
                </CardContent>
            )}
        </Card>
    );
}
