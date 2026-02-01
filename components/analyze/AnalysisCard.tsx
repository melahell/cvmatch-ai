"use client";

import React, { useCallback } from "react";
import { DataListCard, DataListContent, DataListRow, DataListMain, DataListActions } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Calendar, Briefcase } from "lucide-react";
import Link from "next/link";

interface AnalysisCardProps {
    analysis: {
        id: string;
        created_at: string;
        job_url?: string;
        match_score: number;
        match_report?: any;
    };
    onCompare?: (id: string) => void;
    onDelete?: (id: string) => void;
}

export const AnalysisCard = React.memo(function AnalysisCard({ analysis, onCompare, onDelete }: AnalysisCardProps) {
    const jobTitle = analysis.match_report?.job_title || analysis.match_report?.poste_cible || "Analyse";
    const company = analysis.match_report?.company || analysis.match_report?.entreprise || "";
    const date = new Date(analysis.created_at).toLocaleDateString("fr-FR");

    const handleCompare = useCallback(() => {
        onCompare?.(analysis.id);
    }, [analysis.id, onCompare]);

    const handleDelete = useCallback(() => {
        onDelete?.(analysis.id);
    }, [analysis.id, onDelete]);

    return (
        <DataListCard>
            <DataListContent>
                <DataListRow>
                    <DataListMain>
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <Link href={`/dashboard/analyze/${analysis.id}`} className="hover:text-blue-600">
                                    <h3 className="font-semibold text-lg line-clamp-2">{jobTitle}</h3>
                                </Link>
                                {company && <p className="text-sm text-slate-600 line-clamp-1">{company}</p>}
                                <div className="flex items-center gap-4 text-xs text-slate-600 mt-2">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {date}
                                    </span>
                                    {analysis.job_url && (
                                        <a href={analysis.job_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-600">
                                            <ExternalLink className="w-3 h-3" />
                                            Voir l'offre
                                        </a>
                                    )}
                                </div>
                            </div>
                            <Badge variant={analysis.match_score >= 70 ? "success" : "neutral"}>
                                {analysis.match_score}% match
                            </Badge>
                        </div>
                    </DataListMain>
                    <DataListActions>
                        {onCompare && (
                            <Button variant="outline" size="sm" onClick={() => onCompare(analysis.id)}>
                                Comparer
                            </Button>
                        )}
                        {onDelete && (
                            <Button variant="outline" size="sm" onClick={() => onDelete(analysis.id)} className="text-red-600">
                                Supprimer
                            </Button>
                        )}
                    </DataListActions>
                </DataListRow>
            </DataListContent>
        </DataListCard>
    );
});
