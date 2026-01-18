"use client";

import React, { useState } from "react";
import { ChevronDown, Sparkles, AlertTriangle, BarChart3, Target } from "lucide-react";

interface ExperienceSummary {
    total: number;
    detailed: number;
    standard: number;
    compact: number;
    minimal: number;
    excluded: number;
}

interface CVOptimizationExplainerProps {
    warnings: string[];
    experiencesSummary: ExperienceSummary;
    relevanceScoringApplied: boolean;
    jobTitle?: string;
    compressionLevel?: number;
    dense?: boolean;
}

export function CVOptimizationExplainer({
    warnings = [],
    experiencesSummary,
    relevanceScoringApplied,
    jobTitle,
    compressionLevel = 0,
    dense = false,
}: CVOptimizationExplainerProps) {
    const [open, setOpen] = useState(false);

    // Always show if there's a job title or any experiences
    const hasContent =
        experiencesSummary.total > 0 ||
        jobTitle ||
        relevanceScoringApplied;

    if (!hasContent) return null;

    return (
        <div className="mb-4 border border-indigo-200 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-indigo-100/50 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span className="font-semibold text-indigo-900">
                        {jobTitle
                            ? `CV optimisé pour "${jobTitle}"`
                            : "CV optimisé automatiquement"
                        }
                    </span>
                    {warnings.length > 0 && (
                        <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-medium">
                            {warnings.length} ajustement{warnings.length > 1 ? "s" : ""}
                        </span>
                    )}
                </div>
                <ChevronDown
                    className={`w-5 h-5 text-indigo-600 transition-transform ${open ? "rotate-180" : ""}`}
                />
            </button>

            {open && (
                <div className="px-4 pb-4 space-y-4 border-t border-indigo-200 pt-4">
                    {/* Structure des expériences */}
                    <div className="flex items-start gap-3">
                        <BarChart3 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <h4 className="font-semibold text-slate-800 text-sm mb-1">
                                Structure adaptée
                            </h4>
                            <div className="text-sm text-slate-600 space-y-1">
                                {experiencesSummary.detailed > 0 && (
                                    <p>• <strong>{experiencesSummary.detailed}</strong> expérience{experiencesSummary.detailed > 1 ? "s" : ""} en format <span className="text-purple-600 font-medium">détaillé</span> (5 réalisations max)</p>
                                )}
                                {experiencesSummary.standard > 0 && (
                                    <p>• <strong>{experiencesSummary.standard}</strong> expérience{experiencesSummary.standard > 1 ? "s" : ""} en format <span className="text-blue-600 font-medium">standard</span> (3 réalisations)</p>
                                )}
                                {experiencesSummary.compact > 0 && (
                                    <p>• <strong>{experiencesSummary.compact}</strong> expérience{experiencesSummary.compact > 1 ? "s" : ""} en format <span className="text-slate-600 font-medium">compact</span> (1 ligne)</p>
                                )}
                                {experiencesSummary.minimal > 0 && (
                                    <p>• <strong>{experiencesSummary.minimal}</strong> expérience{experiencesSummary.minimal > 1 ? "s" : ""} en format <span className="text-slate-600 font-medium">minimal</span></p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Scoring de pertinence */}
                    {relevanceScoringApplied && (
                        <div className="flex items-start gap-3">
                            <Target className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-slate-800 text-sm mb-1">
                                    Priorisation intelligente
                                </h4>
                                <p className="text-sm text-slate-600">
                                    Les expériences les plus pertinentes pour ce poste sont affichées en premier et en format détaillé.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Warnings */}
                    {warnings.length > 0 && (
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-slate-800 text-sm mb-1">
                                    Ajustements appliqués
                                </h4>
                                <ul className="text-sm text-slate-600 space-y-1">
                                    {warnings.map((warning, i) => (
                                        <li key={i} className="flex items-start gap-1">
                                            <span className="text-amber-500">•</span>
                                            <span>{warning.replace(/^⚠️\s*/, "")}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Dense mode info */}
                    {dense && (
                        <div className="bg-amber-50 border border-amber-200 rounded px-3 py-2 text-sm text-amber-800">
                            <strong>Mode dense activé</strong> : Le contenu a été légèrement compressé pour tenir sur une page.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

/**
 * Helper to compute experience summary from CV data
 */
export function computeExperienceSummary(experiences: any[]): ExperienceSummary {
    const summary: ExperienceSummary = {
        total: experiences?.length || 0,
        detailed: 0,
        standard: 0,
        compact: 0,
        minimal: 0,
        excluded: 0,
    };

    if (!experiences) return summary;

    for (const exp of experiences) {
        const format = exp._format || "standard";
        switch (format) {
            case "detailed":
                summary.detailed++;
                break;
            case "standard":
                summary.standard++;
                break;
            case "compact":
                summary.compact++;
                break;
            case "minimal":
                summary.minimal++;
                break;
        }
    }

    return summary;
}
