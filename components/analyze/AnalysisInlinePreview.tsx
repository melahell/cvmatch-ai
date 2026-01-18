"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

interface AnalysisInlinePreviewProps {
    analysis: any;
}

export function AnalysisInlinePreview({ analysis }: AnalysisInlinePreviewProps) {
    const [expanded, setExpanded] = useState(false);

    if (!analysis) return null;

    const report = analysis.match_report || {};

    return (
        <Card className="mt-2">
            <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h4 className="font-semibold">{report.poste_cible || "Analyse"}</h4>
                        <p className="text-sm text-slate-600">{report.entreprise}</p>
                    </div>
                    <Badge variant={analysis.match_score >= 70 ? "success" : "neutral"}>
                        {analysis.match_score}%
                    </Badge>
                </div>

                {expanded && (
                    <div className="mt-4 space-y-3">
                        {report.points_forts && report.points_forts.length > 0 && (
                            <div>
                                <h5 className="text-sm font-medium text-green-600 mb-1">Points forts</h5>
                                <ul className="text-sm space-y-1">
                                    {report.points_forts.slice(0, 3).map((point: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <span className="text-green-500">✓</span>
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {report.points_amelioration && report.points_amelioration.length > 0 && (
                            <div>
                                <h5 className="text-sm font-medium text-orange-600 mb-1">À améliorer</h5>
                                <ul className="text-sm space-y-1">
                                    {report.points_amelioration.slice(0, 2).map((point: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <span className="text-orange-500">→</span>
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {analysis.job_url && (
                            <a
                                href={analysis.job_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                            >
                                Voir l'offre <ExternalLink className="w-3 h-3" />
                            </a>
                        )}
                    </div>
                )}

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpanded(!expanded)}
                    className="w-full mt-2"
                >
                    {expanded ? <ChevronUp className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
                    {expanded ? "Réduire" : "Voir plus"}
                </Button>
            </CardContent>
        </Card>
    );
}
