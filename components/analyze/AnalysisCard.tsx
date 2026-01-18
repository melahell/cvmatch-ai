"use client";

import { Card, CardContent } from "@/components/ui/card";
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

export function AnalysisCard({ analysis, onCompare, onDelete }: AnalysisCardProps) {
    const jobTitle = analysis.match_report?.poste_cible || "Analyse";
    const company = analysis.match_report?.entreprise || "";
    const date = new Date(analysis.created_at).toLocaleDateString("fr-FR");

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                        <Link href={`/dashboard/analyze/${analysis.id}`} className="hover:text-blue-600">
                            <h3 className="font-semibold text-lg">{jobTitle}</h3>
                        </Link>
                        {company && <p className="text-sm text-slate-600">{company}</p>}
                    </div>
                    <Badge variant={analysis.match_score >= 70 ? "default" : "secondary"}>
                        {analysis.match_score}% match
                    </Badge>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-600 mb-3">
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

                <div className="flex gap-2">
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
                </div>
            </CardContent>
        </Card>
    );
}
