"use client";

import React, { useState } from "react";
import { Building2, Calendar, ExternalLink, MapPin, Trash2, Check, FileText, Eye, Download, Plus, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataListCard, DataListContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { StatusDropdown } from "./StatusDropdown";
import { JobAnalysisWithCVs, CVGeneration } from "@/hooks/useJobAnalyses";
import { toast } from "sonner";

// Design System: Couleurs sémantiques pour les statuts
const STATUS_CONFIG: Record<string, { dot: string }> = {
    pending: { dot: "bg-cvText-tertiary" },
    applied: { dot: "bg-semantic-info" },
    interviewing: { dot: "bg-neon-purple" },
    rejected: { dot: "bg-semantic-error" },
    offer: { dot: "bg-semantic-success" },
};

function formatRelativeDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} sem.`;
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

interface JobCardProps {
    job: JobAnalysisWithCVs;
    variant: "mobile" | "desktop";
    onDelete: (id: string) => void;
    onStatusChange: (id: string, status: string) => void;
    isSelected?: boolean;
    onToggleSelect?: (id: string) => void;
    onCVGenerated?: () => void;
}

export const JobCard = React.memo(function JobCard({ job, variant, onDelete, onStatusChange, isSelected = false, onToggleSelect, onCVGenerated }: JobCardProps) {
    const status = STATUS_CONFIG[job.application_status || "pending"];
    const [showCVs, setShowCVs] = useState(false);
    const [generatingCV, setGeneratingCV] = useState(false);

    // Design System: Score-based background color (subtle)
    const scoreBgColor = job.match_score >= 80
        ? "bg-semantic-success/5"
        : job.match_score >= 60
            ? "bg-semantic-warning/5"
            : "bg-semantic-error/5";

    const cvs = job.cvs || [];
    const hasCVs = cvs.length > 0;

    const handleGenerateCV = async () => {
        setGeneratingCV(true);
        try {
            const response = await fetch('/api/cv/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    analysisId: job.id,
                    template: 'classic', // Default template
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erreur lors de la génération');
            }

            const result = await response.json();
            toast.success('CV généré avec succès !');
            if (onCVGenerated) {
                onCVGenerated();
            }
            // Open the CV page
            if (result.cvId) {
                window.open(`/dashboard/cv/${result.cvId}`, '_blank');
            }
        } catch (error: any) {
            toast.error(error.message || 'Erreur lors de la génération du CV');
        } finally {
            setGeneratingCV(false);
        }
    };

    const handleViewCV = (cvId: string) => {
        window.open(`/dashboard/cv/${cvId}`, '_blank');
    };

    const handleDownloadCV = async (cv: CVGeneration) => {
        if (cv.cv_url) {
            window.open(cv.cv_url, '_blank');
            return;
        }
        // If no URL, redirect to view page where download is available
        window.open(`/dashboard/cv/${cv.id}`, '_blank');
    };

    if (variant === "mobile") {
        return (
            <DataListCard className={`hover:shadow-none rounded-none border-0 shadow-none ${scoreBgColor}`}>
                <DataListContent className="p-4">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-start gap-3">
                            {onToggleSelect && (
                                <button
                                    onClick={() => onToggleSelect(job.id)}
                                    className={`w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${isSelected
                                        ? "bg-neon-purple border-neon-purple"
                                        : "border-cvBorder-medium hover:border-neon-purple"
                                        }`}
                                >
                                    {isSelected && <Check className="w-3 h-3 text-white" />}
                                </button>
                            )}

                            <div className="flex items-start gap-2 flex-1 min-w-0">
                                <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${status.dot}`} />
                                <div className="min-w-0 flex-1">
                                    <h2 className="font-semibold text-sm text-slate-900 line-clamp-2">
                                        {job.job_title || "Poste"}
                                    </h2>
                                    <p className="text-xs text-slate-600 line-clamp-1">
                                        {job.company || "Entreprise"} {job.location && `• ${job.location}`}
                                    </p>
                                    <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                                        <Calendar className="w-3 h-3" />
                                        {formatRelativeDate(job.submitted_at)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span
                                        className={`text-xs font-bold px-2.5 py-1 rounded cursor-help ${job.match_score >= 80
                                            ? "bg-semantic-success/10 text-semantic-success"
                                            : job.match_score >= 60
                                                ? "bg-semantic-warning/10 text-semantic-warning"
                                                : "bg-semantic-error/10 text-semantic-error"
                                            }`}
                                    >
                                        {job.match_score}%
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Match entre votre profil et cette offre</p>
                                </TooltipContent>
                            </Tooltip>
                            <StatusDropdown
                                currentStatus={job.application_status || "pending"}
                                onStatusChange={(status) => onStatusChange(job.id, status)}
                                size="sm"
                            />
                        </div>
                    </div>
                </DataListContent>
            </DataListCard>
        );
    }

    // Desktop variant
    return (
        <DataListCard className={`hover:shadow-lg ${scoreBgColor}`}>
            <DataListContent className="p-4 md:p-5">
                <div className="flex items-start md:items-center gap-4">
                    {/* Checkbox */}
                    {onToggleSelect && (
                        <button
                            onClick={() => onToggleSelect(job.id)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${isSelected
                                ? "bg-neon-purple border-neon-purple"
                                : "border-cvBorder-medium hover:border-neon-purple"
                                }`}
                        >
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                        </button>
                    )}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 flex-1 min-w-0">
                        {/* Status Dot + Job Info */}
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${status.dot}`} />
                            <div className="min-w-0 flex-1">
                                <h2 className="font-bold text-lg text-slate-900 truncate">
                                    {job.job_title || "Poste à définir"}
                                </h2>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600 mt-1">
                                    <span className="flex items-center gap-1 font-medium text-slate-700">
                                        <Building2 className="w-3 h-3" />
                                        {job.company || "Entreprise"}
                                    </span>
                                    {job.location && (
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {job.location}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1 text-slate-600">
                                        <Calendar className="w-3 h-3" />
                                        {formatRelativeDate(job.submitted_at)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Score + Status + Actions */}
                        <div className="flex items-center gap-2 md:gap-3 shrink-0 flex-wrap">
                            {/* Match Score with Tooltip */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div
                                        className={`px-3 py-1 rounded-full text-sm font-bold cursor-help ${job.match_score >= 80
                                            ? "bg-semantic-success/10 text-semantic-success"
                                            : job.match_score >= 60
                                                ? "bg-semantic-warning/10 text-semantic-warning"
                                                : "bg-semantic-error/10 text-semantic-error"
                                            }`}
                                    >
                                        {job.match_score}%
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Match entre votre profil et cette offre</p>
                                </TooltipContent>
                            </Tooltip>

                            {/* Status Dropdown with Confirmation */}
                            <StatusDropdown
                                currentStatus={job.application_status || "pending"}
                                onStatusChange={(status) => onStatusChange(job.id, status)}
                            />

                            {/* Actions */}
                            <div className="flex items-center gap-1">
                                <Link href={`/dashboard/analyze/${job.id}`}>
                                    <Button variant="outline" size="sm" className="gap-1.5">
                                        Détails
                                    </Button>
                                </Link>
                                {job.job_url && (
                                    <a href={job.job_url} target="_blank" rel="noopener noreferrer">
                                        <Button variant="ghost" size="sm" title="Voir l'offre">
                                            <ExternalLink className="w-4 h-4" />
                                        </Button>
                                    </a>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => onDelete(job.id)}
                                    title="Supprimer"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CVs Section - Expandable */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                    <button
                        onClick={() => setShowCVs(!showCVs)}
                        className="flex items-center justify-between w-full text-left hover:bg-slate-50 rounded-lg p-2 -m-2 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-600" />
                            <span className="text-sm font-medium text-slate-700">
                                {hasCVs ? `${cvs.length} CV${cvs.length > 1 ? 's' : ''} généré${cvs.length > 1 ? 's' : ''}` : 'Aucun CV généré'}
                            </span>
                        </div>
                        {hasCVs && (
                            showCVs ? <ChevronUp className="w-4 h-4 text-slate-600" /> : <ChevronDown className="w-4 h-4 text-slate-600" />
                        )}
                    </button>

                        {showCVs && hasCVs && (
                            <div className="mt-3 space-y-2">
                                {cvs.map((cv) => (
                                    <div
                                        key={cv.id}
                                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <FileText className="w-4 h-4 text-slate-600 shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-slate-900 truncate">
                                                    CV {cv.template_name || 'Classic'}
                                                </p>
                                                <p className="text-xs text-slate-600">
                                                    {formatRelativeDate(cv.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleViewCV(cv.id)}
                                                className="h-8"
                                            >
                                                <Eye className="w-4 h-4 mr-1" />
                                                Voir
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDownloadCV(cv)}
                                                className="h-8"
                                            >
                                                <Download className="w-4 h-4 mr-1" />
                                                Télécharger
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {showCVs && !hasCVs && (
                            <div className="mt-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleGenerateCV}
                                    disabled={generatingCV}
                                    className="w-full"
                                >
                                    {generatingCV ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Génération...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Générer un CV
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
            </DataListContent>
        </DataListCard>
    );
});
