"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useCVGenerations } from "@/hooks/useCVGenerations";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Pencil, Download, Plus, Briefcase, Calendar } from "lucide-react";
import Link from "next/link";

interface CVGeneration {
    id: string;
    created_at: string;
    cv_data: any;
    analysis_id: string;
    job_analyses?: {
        job_url: string;
        match_score: number;
        match_report: any;
    }[] | null;
}

export default function CVListPage() {
    const { userId, isLoading: authLoading } = useAuth();

    // Use centralized CV generations hook
    const { data: cvs, loading } = useCVGenerations(userId);

    const handleDownloadPDF = async (cvId: string) => {
        window.open(`/dashboard/cv/${cvId}?print=true`, "_blank");
    };

    if (loading || authLoading) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Mes CVs 📄</h1>
                    <p className="text-slate-500">Historique des CVs générés pour vos candidatures</p>
                </div>
                <Link href="/dashboard/analyze">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" /> Nouvelle Analyse
                    </Button>
                </Link>
            </div>

            {cvs.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                        <h3 className="text-xl font-medium text-slate-600 mb-2">Aucun CV généré</h3>
                        <p className="text-slate-400 mb-6">
                            Analysez une offre d'emploi pour générer votre premier CV personnalisé
                        </p>
                        <Link href="/dashboard/analyze">
                            <Button>Analyser une offre</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {cvs.map((cv) => {
                        const jobAnalysis = cv.job_analyses?.[0];
                        const jobTitle = cv.cv_data?.profil?.titre_principal ||
                            jobAnalysis?.match_report?.poste_cible ||
                            "CV Personnalisé";
                        const company = jobAnalysis?.match_report?.entreprise || "";
                        const matchScore = jobAnalysis?.match_score;
                        const date = new Date(cv.created_at).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                        });
                        const source = jobAnalysis?.job_url ? "URL" : "Texte";

                        return (
                            <Card
                                key={cv.id}
                                className="hover:shadow-md transition-shadow cursor-pointer group"
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <Link
                                            href={`/dashboard/cv/${cv.id}`}
                                            className="flex-1 flex items-center gap-4"
                                        >
                                            <div className="p-2 bg-blue-50 rounded-lg">
                                                <Briefcase className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-slate-800 truncate">
                                                    {jobTitle}
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-slate-500">
                                                    {company && <span>{company}</span>}
                                                    {matchScore && (
                                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                                                            Match {matchScore}%
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-slate-400">Via {source}</span>
                                                </div>
                                            </div>
                                        </Link>

                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1 text-xs text-slate-400 mr-4">
                                                <Calendar className="w-3 h-3" />
                                                {date}
                                            </div>
                                            <Link href={`/dashboard/cvs/${cv.id}/edit`}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleDownloadPDF(cv.id);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
