"use client";

/**
 * Composant pour visualiser les scores de pertinence des widgets
 * Affiche les widgets avec leurs scores dans un tooltip ou badge
 */

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import type { AIWidgetsEnvelope, AIWidget } from "@/lib/cv/ai-widgets";

interface WidgetScoreVisualizerProps {
    widgets: AIWidgetsEnvelope;
    showDetails?: boolean;
}

export function WidgetScoreVisualizer({ widgets, showDetails = false }: WidgetScoreVisualizerProps) {
    const widgetsList = widgets.widgets || [];
    
    // Grouper par section
    const widgetsBySection = widgetsList.reduce((acc, widget) => {
        const section = widget.section || "other";
        if (!acc[section]) {
            acc[section] = [];
        }
        acc[section].push(widget);
        return acc;
    }, {} as Record<string, AIWidget[]>);

    // Calculer stats
    const stats = {
        total: widgetsList.length,
        average: widgetsList.length > 0 
            ? Math.round(widgetsList.reduce((sum, w) => sum + (w.relevance_score || 0), 0) / widgetsList.length)
            : 0,
        min: widgetsList.length > 0 
            ? Math.min(...widgetsList.map(w => w.relevance_score || 0))
            : 0,
        max: widgetsList.length > 0 
            ? Math.max(...widgetsList.map(w => w.relevance_score || 0))
            : 0,
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "bg-green-100 text-green-700 border-green-200";
        if (score >= 60) return "bg-blue-100 text-blue-700 border-blue-200";
        if (score >= 40) return "bg-amber-100 text-amber-700 border-amber-200";
        return "bg-red-100 text-red-700 border-red-200";
    };

    if (!showDetails) {
        // Vue compacte : juste les stats
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 cursor-help">
                            <Badge variant="outline" className="text-xs">
                                Score moyen: {stats.average}/100
                            </Badge>
                            <Info className="w-3 h-3 text-slate-400" />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-sm">
                        <div className="space-y-2 text-xs">
                            <p className="font-semibold">Scores de pertinence des widgets</p>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <span className="text-slate-600">Total:</span>
                                    <span className="ml-2 font-semibold">{stats.total}</span>
                                </div>
                                <div>
                                    <span className="text-slate-600">Moyenne:</span>
                                    <span className="ml-2 font-semibold">{stats.average}/100</span>
                                </div>
                                <div>
                                    <span className="text-slate-600">Min:</span>
                                    <span className="ml-2 font-semibold">{stats.min}/100</span>
                                </div>
                                <div>
                                    <span className="text-slate-600">Max:</span>
                                    <span className="ml-2 font-semibold">{stats.max}/100</span>
                                </div>
                            </div>
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    // Vue détaillée : liste complète par section
    return (
        <div className="space-y-4">
            {/* Stats globales */}
            <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="flex flex-col">
                    <span className="text-slate-500">Total</span>
                    <span className="font-semibold text-slate-900">{stats.total}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-slate-500">Moyenne</span>
                    <span className="font-semibold text-blue-600">{stats.average}/100</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-slate-500">Min</span>
                    <span className="font-semibold text-red-600">{stats.min}/100</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-slate-500">Max</span>
                    <span className="font-semibold text-green-600">{stats.max}/100</span>
                </div>
            </div>

            {/* Widgets par section */}
            {Object.entries(widgetsBySection).map(([section, sectionWidgets]) => (
                <div key={section} className="space-y-2">
                    <h4 className="text-xs font-semibold text-slate-700 capitalize">
                        {section} ({sectionWidgets.length})
                    </h4>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                        {sectionWidgets.map((widget) => (
                            <TooltipProvider key={widget.id}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center justify-between p-2 rounded-md bg-slate-50 hover:bg-slate-100 cursor-help">
                                            <span className="text-xs text-slate-700 truncate flex-1">
                                                {widget.text.substring(0, 60)}
                                                {widget.text.length > 60 ? "..." : ""}
                                            </span>
                                            <Badge 
                                                variant="outline" 
                                                className={`text-xs ml-2 ${getScoreColor(widget.relevance_score || 0)}`}
                                            >
                                                {widget.relevance_score || 0}
                                            </Badge>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="max-w-xs">
                                        <div className="space-y-1 text-xs">
                                            <p className="font-semibold">Widget {widget.id}</p>
                                            <p className="text-slate-600">{widget.text}</p>
                                            <p className="text-slate-500">
                                                Score: <span className="font-semibold">{widget.relevance_score || 0}/100</span>
                                            </p>
                                            {widget.sources && (
                                                <p className="text-slate-500 text-[10px]">
                                                    Source: {widget.sources.rag_experience_id || widget.sources.rag_path || "N/A"}
                                                </p>
                                            )}
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
