"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase";
import { ExternalLink, Briefcase, Plus, MapPin, Building2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { JobAnalysis } from "@/types";

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
    pending: { label: "À faire", bg: "bg-slate-100", text: "text-slate-700" },
    applied: { label: "Postulé", bg: "bg-blue-100", text: "text-blue-700" },
    interviewing: { label: "Entretien", bg: "bg-purple-100", text: "text-purple-700" },
    rejected: { label: "Refusé", bg: "bg-red-100", text: "text-red-700" },
    offer: { label: "Offre reçue", bg: "bg-green-100", text: "text-green-700" },
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

export default function TrackingPage() {
    const { userId, isLoading: authLoading } = useAuth();
    const [jobs, setJobs] = useState<JobAnalysis[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>("all");

    useEffect(() => {
        if (authLoading || !userId) return;

        const supabase = createSupabaseClient();
        async function fetchJobs() {
            const { data, error } = await supabase
                .from("job_analyses")
                .select("*")
                .eq("user_id", userId)
                .order("submitted_at", { ascending: false });

            if (data) setJobs(data);
            setLoading(false);
        }
        fetchJobs();
    }, [userId, authLoading]);

    const updateStatus = async (id: string, newStatus: JobAnalysis["application_status"]) => {
        const supabase = createSupabaseClient();
        setJobs(jobs.map(j => j.id === id ? { ...j, application_status: newStatus } : j));
        await supabase
            .from("job_analyses")
            .update({ application_status: newStatus })
            .eq("id", id);
    };

    // Stats
    const stats = {
        total: jobs.length,
        pending: jobs.filter(j => j.application_status === "pending").length,
        applied: jobs.filter(j => j.application_status === "applied").length,
        interviewing: jobs.filter(j => j.application_status === "interviewing").length,
        offer: jobs.filter(j => j.application_status === "offer").length,
    };

    // Filtered jobs
    const filteredJobs = filter === "all" ? jobs : jobs.filter(j => j.application_status === filter);

    if (loading || authLoading) {
        return (
            <DashboardLayout>
                <LoadingSpinner fullScreen />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="container mx-auto py-8 px-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <Briefcase className="w-6 h-6 text-blue-600" />
                            Mes Candidatures
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">
                            Suivez l'avancement de vos candidatures
                        </p>
                    </div>
                    <Link href="/dashboard/analyze">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-2" /> Nouvelle Analyse
                        </Button>
                    </Link>
                </div>

                {/* Stats Pills */}
                <div className="flex flex-wrap gap-2 mb-6">
                    <button
                        onClick={() => setFilter("all")}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === "all"
                                ? "bg-slate-900 text-white"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                    >
                        Toutes ({stats.total})
                    </button>
                    <button
                        onClick={() => setFilter("pending")}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === "pending"
                                ? "bg-slate-700 text-white"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                    >
                        À faire ({stats.pending})
                    </button>
                    <button
                        onClick={() => setFilter("applied")}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === "applied"
                                ? "bg-blue-600 text-white"
                                : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                            }`}
                    >
                        Postulé ({stats.applied})
                    </button>
                    <button
                        onClick={() => setFilter("interviewing")}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === "interviewing"
                                ? "bg-purple-600 text-white"
                                : "bg-purple-50 text-purple-700 hover:bg-purple-100"
                            }`}
                    >
                        Entretien ({stats.interviewing})
                    </button>
                    <button
                        onClick={() => setFilter("offer")}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === "offer"
                                ? "bg-green-600 text-white"
                                : "bg-green-50 text-green-700 hover:bg-green-100"
                            }`}
                    >
                        Offre ({stats.offer})
                    </button>
                </div>

                {/* Jobs List */}
                <div className="grid gap-4">
                    {filteredJobs.map((job) => {
                        const status = STATUS_CONFIG[job.application_status || "pending"];

                        return (
                            <Card key={job.id} className="hover:shadow-lg transition-all border-l-4 border-l-transparent hover:border-l-blue-500">
                                <CardContent className="p-5">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                        {/* Job Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-slate-100 rounded-lg shrink-0">
                                                    <Building2 className="w-5 h-5 text-slate-600" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h2 className="font-bold text-lg text-slate-900 truncate">
                                                        {job.job_title || "Poste à définir"}
                                                    </h2>
                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 mt-1">
                                                        <span className="font-medium text-slate-700">
                                                            {job.company || "Entreprise"}
                                                        </span>
                                                        {job.location && (
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="w-3 h-3" />
                                                                {job.location}
                                                            </span>
                                                        )}
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {formatRelativeDate(job.submitted_at)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Score & Status */}
                                        <div className="flex items-center gap-3 shrink-0">
                                            {/* Match Score */}
                                            <div className={`px-3 py-1.5 rounded-full text-sm font-bold ${job.match_score >= 80
                                                    ? "bg-green-100 text-green-700"
                                                    : job.match_score >= 60
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : "bg-red-100 text-red-700"
                                                }`}>
                                                {job.match_score}%
                                            </div>

                                            {/* Status Dropdown */}
                                            <select
                                                className={`text-sm font-medium border-0 rounded-lg px-3 py-2 cursor-pointer ${status.bg} ${status.text}`}
                                                value={job.application_status || "pending"}
                                                onChange={(e) => updateStatus(job.id, e.target.value as JobAnalysis["application_status"])}
                                            >
                                                <option value="pending">À faire</option>
                                                <option value="applied">Postulé</option>
                                                <option value="interviewing">Entretien</option>
                                                <option value="rejected">Refusé</option>
                                                <option value="offer">Offre reçue</option>
                                            </select>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Link href={`/dashboard/analyze/${job.id}`}>
                                                <Button variant="outline" size="sm">
                                                    Analyse
                                                </Button>
                                            </Link>
                                            {job.job_url && (
                                                <a href={job.job_url} target="_blank" rel="noopener noreferrer">
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

                    {/* Empty State */}
                    {filteredJobs.length === 0 && (
                        <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-slate-200">
                            <Briefcase className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                            <h3 className="text-lg font-medium text-slate-600 mb-2">
                                {filter === "all"
                                    ? "Aucune candidature"
                                    : `Aucune candidature "${STATUS_CONFIG[filter]?.label}"`
                                }
                            </h3>
                            <p className="text-slate-400 mb-4">
                                Analysez une offre d'emploi pour commencer
                            </p>
                            <Link href="/dashboard/analyze">
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" /> Analyser une offre
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
