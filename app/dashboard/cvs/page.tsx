"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCVGenerations } from "@/hooks/useCVGenerations";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScoreBadge, ScoreIndicator, ScoreLegend } from "@/components/ui/ScoreBadge";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { FileText, Download, Plus, Calendar, ExternalLink, Eye, Search } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export default function CVListPage() {
    const { userId, isLoading: authLoading } = useAuth();
    const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
    const [search, setSearch] = useState("");

    // Use centralized CV generations hook
    const { data: cvs, loading } = useCVGenerations(userId);

    // Sort and filter CVs
    const sortedCVs = [...cvs]
        .filter(cv => {
            if (!search) return true;
            const jobAnalysis = Array.isArray(cv.job_analyses) ? cv.job_analyses[0] : cv.job_analyses;
            const jobTitle = jobAnalysis?.job_title || cv.cv_data?.profil?.titre_principal || "";
            const company = jobAnalysis?.company || "";
            return jobTitle.toLowerCase().includes(search.toLowerCase()) ||
                company.toLowerCase().includes(search.toLowerCase());
        })
        .sort((a, b) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
        });

    const handleDownloadPDF = async (cvId: string) => {
        window.open(`/dashboard/cv/${cvId}?print=true`, "_blank");
    };

    const formatDate = (date: string) => {
        try {
            return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
        } catch {
            return new Date(date).toLocaleDateString("fr-FR");
        }
    };

    if (loading || authLoading) {
        return <DashboardLayout><LoadingSpinner fullScreen /></DashboardLayout>;
    }

    return (
        <DashboardLayout>
            <div className="container mx-auto py-6 px-4 max-w-4xl">
                {/* Breadcrumb */}
                <Breadcrumb items={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Mes CVs" }
                ]} />

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <FileText className="w-6 h-6" /> Mes CVs
                            <span className="text-lg font-normal text-slate-500">({cvs.length})</span>
                        </h1>
                    </div>
                    <Link href="/dashboard/analyze">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-2" /> Nouvelle Analyse
                        </Button>
                    </Link>
                </div>

                {/* Score Legend */}
                <Card className="mb-4 p-3">
                    <ScoreLegend />
                </Card>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Rechercher par poste, entreprise..."
                            className="pl-10"
                        />
                    </div>
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
                        className="px-3 py-2 text-sm border rounded-lg bg-white"
                    >
                        <option value="newest">↓ Date</option>
                        <option value="oldest">↑ Date</option>
                    </select>
                </div>

                {/* CV List */}
                {sortedCVs.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                            <h3 className="text-xl font-medium text-slate-600 mb-2">
                                {search ? "Aucun CV trouvé" : "Aucun CV généré"}
                            </h3>
                            <p className="text-slate-400 mb-6">
                                {search
                                    ? "Essayez avec d'autres termes"
                                    : "Analysez une offre d'emploi pour générer votre premier CV personnalisé"
                                }
                            </p>
                            {!search && (
                                <Link href="/dashboard/analyze">
                                    <Button>Analyser une offre</Button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {sortedCVs.map((cv) => {
                            const jobAnalysis = Array.isArray(cv.job_analyses)
                                ? cv.job_analyses[0]
                                : cv.job_analyses;
                            const jobTitle = jobAnalysis?.job_title ||
                                cv.cv_data?.profil?.titre_principal ||
                                jobAnalysis?.match_report?.job_title ||
                                "CV Personnalisé";
                            const company = jobAnalysis?.company ||
                                jobAnalysis?.match_report?.company || "";
                            const matchScore = jobAnalysis?.match_score || 0;
                            const jobUrl = jobAnalysis?.job_url;

                            return (
                                <Card
                                    key={cv.id}
                                    className="hover:shadow-md transition-shadow cursor-pointer group"
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-4">
                                            {/* Score Indicator */}
                                            <ScoreIndicator score={matchScore} />

                                            {/* Content */}
                                            <Link
                                                href={`/dashboard/cv/${cv.id}`}
                                                className="flex-1 min-w-0"
                                            >
                                                <div className="font-semibold text-slate-800 truncate">
                                                    {jobTitle}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                                    {company && (
                                                        <span className="truncate">🏢 {company}</span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {formatDate(cv.created_at)}
                                                    </span>
                                                </div>
                                            </Link>

                                            {/* Score Badge */}
                                            {matchScore > 0 && (
                                                <ScoreBadge score={matchScore} />
                                            )}

                                            {/* Actions */}
                                            <div className="flex items-center gap-1">
                                                <Link href={`/dashboard/cv/${cv.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="w-4 h-4 mr-1" /> Détails
                                                    </Button>
                                                </Link>
                                                {jobUrl && (
                                                    <a
                                                        href={jobUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <Button variant="ghost" size="sm">
                                                            <ExternalLink className="w-4 h-4" />
                                                        </Button>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
