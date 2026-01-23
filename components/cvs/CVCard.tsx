"use client";

import React from "react";
import { DataListCard, DataListContent, DataListRow, DataListMain, DataListActions } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Edit, Sparkles } from "lucide-react";

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
    const isV2 = cv.cv_data?.cv_metadata?.generator_type === "v2_widgets";

    return (
        <DataListCard>
            <DataListContent>
                <DataListRow>
                    <DataListMain className="flex gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                            <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm sm:text-base line-clamp-2">{title}</h3>
                            {company && <p className="text-sm text-slate-600 line-clamp-1">{company}</p>}
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="text-xs text-slate-600">{date}</span>
                                {isV2 && (
                                    <Badge variant="secondary" className="text-xs bg-indigo-100 text-indigo-700 border-indigo-200">
                                        <Sparkles className="w-3 h-3 mr-1" />
                                        V2
                                    </Badge>
                                )}
                                {score && (
                                    <Badge variant="neutral" className="text-xs">
                                        {score}% match
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </DataListMain>

                    <DataListActions className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
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
                    </DataListActions>
                </DataListRow>
            </DataListContent>
        </DataListCard>
    );
});
