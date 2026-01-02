"use client";

import { Building2, Calendar, ExternalLink, MapPin, Trash2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { StatusDropdown } from "./StatusDropdown";
import { JobAnalysis } from "@/types";

const STATUS_CONFIG: Record<string, { dot: string }> = {
    pending: { dot: "bg-slate-400" },
    applied: { dot: "bg-blue-500" },
    interviewing: { dot: "bg-purple-500" },
    rejected: { dot: "bg-red-500" },
    offer: { dot: "bg-green-500" },
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
    job: JobAnalysis;
    variant: "mobile" | "desktop";
    onDelete: (id: string) => void;
    onStatusChange: (id: string, status: string) => void;
}

export function JobCard({ job, variant, onDelete, onStatusChange }: JobCardProps) {
    const status = STATUS_CONFIG[job.application_status || "pending"];

    if (variant === "mobile") {
        return (
            <Card className="hover:shadow-lg transition-all group rounded-none border-0 shadow-none">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${status.dot}`} />
                            <div className="min-w-0 flex-1">
                                <h2 className="font-semibold text-sm text-slate-900 truncate">
                                    {job.job_title || "Poste"}
                                </h2>
                                <p className="text-xs text-slate-500 truncate">
                                    {job.company || "Entreprise"} {job.location && `• ${job.location}`}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span
                                        className={`text-xs font-bold px-2 py-0.5 rounded cursor-help ${job.match_score >= 80
                                                ? "bg-green-100 text-green-700"
                                                : job.match_score >= 60
                                                    ? "bg-yellow-100 text-yellow-700"
                                                    : "bg-red-100 text-red-700"
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
                </CardContent>
            </Card>
        );
    }

    // Desktop variant
    return (
        <Card className="hover:shadow-lg transition-all group">
            <CardContent className="p-4 md:p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Status Dot + Job Info */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${status.dot}`} />
                        <div className="min-w-0 flex-1">
                            <h2 className="font-bold text-lg text-slate-900 truncate">
                                {job.job_title || "Poste à définir"}
                            </h2>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 mt-1">
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
                                <span className="flex items-center gap-1 text-slate-400">
                                    <Calendar className="w-3 h-3" />
                                    {formatRelativeDate(job.submitted_at)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Score + Status + Actions */}
                    <div className="flex items-center gap-2 md:gap-3 shrink-0 flex-wrap md:flex-nowrap">
                        {/* Match Score with Tooltip */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div
                                    className={`px-3 py-1 rounded-full text-sm font-bold cursor-help ${job.match_score >= 80
                                            ? "bg-green-100 text-green-700"
                                            : job.match_score >= 60
                                                ? "bg-yellow-100 text-yellow-700"
                                                : "bg-red-100 text-red-700"
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
                                <Button variant="outline" size="sm">
                                    Voir
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
            </CardContent>
        </Card>
    );
}
