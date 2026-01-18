"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Edit } from "lucide-react";

interface CVCardProps {
    cv: {
        id: string;
        created_at: string;
        custom_name?: string;
        cv_data?: any;
        job_analyses?: any[];
    };
    onRename?: (id: string) => void;
    onDownload?: (id: string) => void;
}

export const CVCard = React.memo(function CVCard({ cv, onRename, onDownload }: CVCardProps) {
    const jobAnalysis = cv.job_analyses?.[0];
    const title = cv.custom_name || cv.cv_data?.profil?.titre_principal || "CV Personnalisé";
    const company = jobAnalysis?.match_report?.entreprise;
    const score = jobAnalysis?.match_score;
    const date = new Date(cv.created_at).toLocaleDateString("fr-FR");

    return (
        <Card className="hover:shadow-md transition-shadow group">
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3 flex-1">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{title}</h3>
                            {company && <p className="text-sm text-slate-600">{company}</p>}
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-slate-600">{date}</span>
                                {score && (
                                    <Badge variant="neutral" className="text-xs">
                                        {score}% match
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onRename && (
                            <Button variant="ghost" size="sm" onClick={() => onRename(cv.id)}>
                                <Edit className="w-4 h-4" />
                            </Button>
                        )}
                        {onDownload && (
                            <Button variant="ghost" size="sm" onClick={() => onDownload(cv.id)}>
                                <Download className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
});
