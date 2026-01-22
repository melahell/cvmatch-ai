"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase";
import { ExternalLink, Briefcase, Plus, MapPin, Building2, Calendar, Search, ArrowUp, ArrowDown, Trash2, ChevronRight, LayoutGrid, LayoutList, Download, Clock, Send, Users, Trophy, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { SwipeableCard } from "@/components/ui/SwipeableCard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { BulkToolbar } from "@/components/tracking/BulkToolbar";
import { JobCard } from "@/components/tracking/JobCard";
import { useAuth } from "@/hooks/useAuth";
import { useJobAnalyses, JobAnalysisWithCVs } from "@/hooks/useJobAnalyses";
import Link from "next/link";
import { JobAnalysis } from "@/types";
import React from "react";
import { exportJobsToCSV } from "@/lib/utils/export-csv";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast, Toaster } from "sonner";

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    pending: { label: "À faire", bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-400" },
    applied: { label: "Postulé", bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
    interviewing: { label: "Entretien", bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500" },
    rejected: { label: "Refusé", bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
    offer: { label: "Offre reçue", bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
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

type SortOption = "date" | "score" | "status";

function TrackingPageContent() {
    const { userId, isLoading: authLoading } = useAuth();
    const searchParams = useSearchParams();

    // Use centralized job analyses hook
    const {
        data: jobs,
        loading,
        error,
        updateStatus,
        deleteJob: deleteJobFn,
        refetch
    } = useJobAnalyses(userId);

    // Initialize filters from URL params (for migration from /dashboard/cvs)
    const initialCvFilter = searchParams?.get('cvFilter') as "all" | "with_cv" | "without_cv" | null;

    const [filter, setFilter] = useState<string>("all");
    const [cvFilter, setCvFilter] = useState<"all" | "with_cv" | "without_cv">(
        initialCvFilter && ["all", "with_cv", "without_cv"].includes(initialCvFilter) 
            ? initialCvFilter 
            : "all"
    );
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Debounce search (300ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);
    // Load sort preferences from localStorage
    const [sortBy, setSortBy] = useState<"date" | "score" | "status">(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('tracking_sort_by');
            return (saved as any) || 'date';
        }
        return 'date';
    });
    const [sortAsc, setSortAsc] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('tracking_sort_asc');
            return saved === 'true';
        }
        return false;
    });

    // Persist sort preferences
    useEffect(() => {
        localStorage.setItem('tracking_sort_by', sortBy);
        localStorage.setItem('tracking_sort_asc', String(sortAsc));
    }, [sortBy, sortAsc]);
    const [compactView, setCompactView] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string, title: string } | null>(null);

    // Bulk selection state
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const clearSelection = () => setSelectedIds([]);

    const handleBulkDelete = async () => {
        if (!confirm(`Supprimer ${selectedIds.length} candidature(s) ?`)) return;

        for (const id of selectedIds) {
            await deleteJobFn(id);
        }
        clearSelection();
        toast.success(`${selectedIds.length} candidature(s) supprimée(s)`);
    };

    const handleBulkStatusChange = async (status: string) => {
        for (const id of selectedIds) {
            await updateStatus(id, status as any);
        }
        clearSelection();
        toast.success(`Statut changé pour ${selectedIds.length} candidature(s)`);
    };

    const handleBulkArchive = async () => {
        // Pour l'instant, on va juste changer le statut vers un état "archived"
        // Plus tard on pourra ajouter une vraie colonne archived
        toast.info("Fonctionnalité archivage en développement");
        clearSelection();
    };

    const handleDeleteJob = async (id: string) => {
        const jobToDelete = jobs.find(j => j.id === id);
        if (!jobToDelete) return;

        // Open confirmation dialog instead of browser confirm
        setDeleteConfirm({
            id,
            title: jobToDelete.job_title || "cette candidature"
        });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm) return;

        await deleteJobFn(deleteConfirm.id);
        setDeleteConfirm(null);
        toast.success(`Candidature supprimée`, {
            duration: 5000,
        });
    };

    // Stats
    const stats = {
        total: jobs.length,
        pending: jobs.filter(j => j.application_status === "pending").length,
        applied: jobs.filter(j => j.application_status === "applied").length,
        interviewing: jobs.filter(j => j.application_status === "interviewing").length,
        offer: jobs.filter(j => j.application_status === "offer").length,
        withCV: jobs.filter(j => j.has_cv).length,
        withoutCV: jobs.filter(j => !j.has_cv).length,
    };

    // Progress calculation
    const progressPercent = jobs.length > 0
        ? Math.round(((stats.applied + stats.interviewing + stats.offer) / stats.total) * 100)
        : 0;

    // Filtered & sorted jobs
    const processedJobs = useMemo(() => {
        let result = [...jobs];

        // Filter by status
        if (filter !== "all") {
            result = result.filter(j => j.application_status === filter);
        }

        // Filter by CV presence
        if (cvFilter === "with_cv") {
            result = result.filter(j => j.has_cv);
        } else if (cvFilter === "without_cv") {
            result = result.filter(j => !j.has_cv);
        }

        // Filter by search (debounced)
        if (debouncedSearch) {
            const searchLower = debouncedSearch.toLowerCase();
            result = result.filter(job =>
                (job.job_title?.toLowerCase().includes(searchLower)) ||
                (job.company?.toLowerCase().includes(searchLower)) ||
                (job.location?.toLowerCase().includes(searchLower))
            );
        }

        // Sort
        result.sort((a, b) => {
            let comparison = 0;
            if (sortBy === "date") {
                comparison = new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
            } else if (sortBy === "score") {
                comparison = (b.match_score || 0) - (a.match_score || 0);
            } else if (sortBy === "status") {
                const order = ["offer", "interviewing", "applied", "pending", "rejected"];
                comparison = order.indexOf(a.application_status || "pending") - order.indexOf(b.application_status || "pending");
            }
            return sortAsc ? -comparison : comparison;
        });

        return result;
    }, [jobs, filter, cvFilter, debouncedSearch, sortBy, sortAsc]);

    const toggleSort = (option: SortOption) => {
        if (sortBy === option) {
            setSortAsc(!sortAsc);
        } else {
            setSortBy(option);
            setSortAsc(false);
        }
    };

    if (loading || authLoading) {
        return (
            <DashboardLayout>
                <LoadingSpinner fullScreen />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <TooltipProvider>
                <Toaster richColors position="top-center" />
                <div className="container mx-auto py-6 px-4">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                        <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-slate-900 font-medium">Candidatures</span>
                    </div>

                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                <Briefcase className="w-6 h-6 text-blue-600" />
                                Mes Candidatures
                            </h1>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-600">
                                    <span className="font-bold text-lg text-blue-600">{stats.total}</span> candidature{stats.total > 1 ? 's' : ''}
                                </span>
                                <span className="text-sm text-slate-600">
                                    <span className="font-bold text-lg text-green-600">{progressPercent}%</span> en cours
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => exportJobsToCSV(processedJobs)}
                                disabled={jobs.length === 0}
                                className="gap-2"
                            >
                                <Download className="w-4 h-4" />
                                <span className="hidden sm:inline">Exporter CSV</span>
                            </Button>
                            <Link href="/dashboard/analyze">
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="w-4 h-4 mr-2" /> Nouvelle Analyse
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Score Legend - Item 23 */}
                    {jobs.length > 0 && (
                        <div className="mb-4 p-3 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg border border-slate-200">
                            <p className="text-xs font-semibold text-slate-700 mb-2">Légende Score de Match :</p>
                            <div className="flex flex-wrap gap-3 text-xs">
                                <span className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span className="font-medium text-slate-700">≥80% Excellent</span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <span className="font-medium text-slate-700">60-79% Bon</span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <span className="font-medium text-slate-700">&lt;60% Faible</span>
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Progress Bar */}
                    {jobs.length > 0 && (
                        <div className="mb-6">
                            <div className="flex justify-between text-xs text-slate-600 mb-1">
                                <span>Progression des candidatures</span>
                                <span>{progressPercent}%</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-slate-600 mt-1">
                                <span>{stats.pending} à faire</span>
                                <span>{stats.applied} postulé</span>
                                <span>{stats.interviewing} entretien</span>
                                <span>{stats.offer} offre</span>
                            </div>
                        </div>
                    )}

                    {/* Search & Filters Row */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                            <Input
                                placeholder="Rechercher par poste, entreprise..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Sort Buttons */}
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant={sortBy === "date" ? "secondary" : "outline"}
                                size="sm"
                                onClick={() => toggleSort("date")}
                                className="gap-1"
                            >
                                {sortBy === "date" ? (sortAsc ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <Calendar className="w-3 h-3" />}
                                <span className="hidden sm:inline">Date</span>
                            </Button>
                            <Button
                                variant={sortBy === "score" ? "secondary" : "outline"}
                                size="sm"
                                onClick={() => toggleSort("score")}
                                className="gap-1"
                            >
                                {sortBy === "score" ? (sortAsc ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <Briefcase className="w-3 h-3" />}
                                <span className="hidden sm:inline">Score</span>
                            </Button>
                            <Button
                                variant={sortBy === "status" ? "secondary" : "outline"}
                                size="sm"
                                onClick={() => toggleSort("status")}
                                className="gap-1"
                            >
                                {sortBy === "status" ? (sortAsc ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <Users className="w-3 h-3" />}
                                <span className="hidden sm:inline">Statut</span>
                            </Button>
                            <div className="border-l border-slate-200 mx-1" />
                            <Button
                                variant={compactView ? "secondary" : "outline"}
                                size="sm"
                                onClick={() => setCompactView(!compactView)}
                                title={compactView ? "Vue détaillée" : "Vue compacte"}
                            >
                                {compactView ? <LayoutGrid className="w-4 h-4" /> : <LayoutList className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex flex-col gap-3 mb-6">
                        {/* Status Filters */}
                        <div className="flex gap-2 overflow-x-auto pb-1 -mx-2 px-2">
                            <button
                                onClick={() => setFilter("all")}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filter === "all"
                                    ? "bg-slate-900 text-white"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                            >
                                Toutes ({stats.total})
                            </button>
                        <button
                            onClick={() => setFilter("pending")}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${filter === "pending"
                                ? "bg-slate-700 text-white"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                        >
                            <Clock className="w-3.5 h-3.5" />
                            À faire ({stats.pending})
                        </button>
                        <button
                            onClick={() => setFilter("applied")}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${filter === "applied"
                                ? "bg-blue-600 text-white"
                                : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                                }`}
                        >
                            <Send className="w-3.5 h-3.5" />
                            Postulé ({stats.applied})
                        </button>
                        <button
                            onClick={() => setFilter("interviewing")}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${filter === "interviewing"
                                ? "bg-purple-600 text-white"
                                : "bg-purple-50 text-purple-700 hover:bg-purple-100"
                                }`}
                        >
                            <Users className="w-3.5 h-3.5" />
                            Entretien ({stats.interviewing})
                        </button>
                        <button
                            onClick={() => setFilter("offer")}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${filter === "offer"
                                ? "bg-green-600 text-white"
                                : "bg-green-50 text-green-700 hover:bg-green-100"
                                }`}
                        >
                            <Trophy className="w-3.5 h-3.5" />
                            Offre ({stats.offer})
                        </button>
                        </div>

                        {/* CV Filters */}
                        <div className="flex gap-2 overflow-x-auto pb-1 -mx-2 px-2">
                            <button
                                onClick={() => setCvFilter("all")}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${cvFilter === "all"
                                    ? "bg-blue-600 text-white"
                                    : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                                    }`}
                            >
                                <FileText className="w-3.5 h-3.5" />
                                Tous les CVs
                            </button>
                            <button
                                onClick={() => setCvFilter("with_cv")}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${cvFilter === "with_cv"
                                    ? "bg-green-600 text-white"
                                    : "bg-green-50 text-green-700 hover:bg-green-100"
                                    }`}
                            >
                                <FileText className="w-3.5 h-3.5" />
                                Avec CV ({stats.withCV})
                            </button>
                            <button
                                onClick={() => setCvFilter("without_cv")}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${cvFilter === "without_cv"
                                    ? "bg-orange-600 text-white"
                                    : "bg-orange-50 text-orange-700 hover:bg-orange-100"
                                    }`}
                            >
                                <FileText className="w-3.5 h-3.5" />
                                Sans CV ({stats.withoutCV})
                            </button>
                        </div>
                    </div>

                    {/* Jobs List */}
                    <div className={`grid ${compactView ? "gap-3" : "gap-4"}`}>
                        {processedJobs.map((job) => (
                            <React.Fragment key={job.id}>
                                {/* Mobile Card */}
                                <SwipeableCard
                                    onDelete={() => handleDeleteJob(job.id)}
                                    className="md:hidden"
                                >
                                    <JobCard
                                        job={job}
                                        variant="mobile"
                                        onDelete={handleDeleteJob}
                                        onStatusChange={(id, status) => updateStatus(id, status as JobAnalysis["application_status"])}
                                        isSelected={selectedIds.includes(job.id)}
                                        onToggleSelect={toggleSelect}
                                        onCVGenerated={refetch}
                                    />
                                </SwipeableCard>

                                {/* Desktop Card */}
                                <div className="hidden md:block">
                                    <JobCard
                                        job={job}
                                        variant="desktop"
                                        onDelete={handleDeleteJob}
                                        onStatusChange={(id, status) => updateStatus(id, status as JobAnalysis["application_status"])}
                                        isSelected={selectedIds.includes(job.id)}
                                        onToggleSelect={toggleSelect}
                                        onCVGenerated={refetch}
                                    />
                                </div>
                            </React.Fragment>
                        ))}

                        {/* Empty State */}
                        {processedJobs.length === 0 && (
                            <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-slate-200">
                                <Briefcase className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                                <h3 className="text-lg font-medium text-slate-600 mb-2">
                                    {/* Item 24: Context-aware empty state */}
                                    {search && filter !== "all"
                                        ? `Aucun résultat pour "${search}" dans "${STATUS_CONFIG[filter]?.label}"`
                                        : search
                                            ? `Aucun résultat pour "${search}"`
                                            : filter === "all"
                                                ? "Aucune candidature"
                                                : `Aucune candidature "${STATUS_CONFIG[filter]?.label}"`
                                    }
                                </h3>
                                <p className="text-slate-600 mb-4">
                                    {search
                                        ? "Essayez une autre recherche ou modifiez les filtres"
                                        : "Analysez une offre d'emploi pour commencer"
                                    }
                                </p>
                                {!search && (
                                    <Link href="/dashboard/analyze">
                                        <Button>
                                            <Plus className="w-4 h-4 mr-2" /> Analyser une offre
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Bulk Toolbar */}
                <BulkToolbar
                    selectedCount={selectedIds.length}
                    onClearSelection={clearSelection}
                    onDeleteAll={handleBulkDelete}
                    onArchiveAll={handleBulkArchive}
                    onChangeStatusAll={handleBulkStatusChange}
                />

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                            <AlertDialogDescription>
                                Voulez-vous vraiment supprimer "{deleteConfirm?.title}" ?
                                Cette action est irréversible.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                                Supprimer
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </TooltipProvider >
        </DashboardLayout >
    );
}

export default function TrackingPage() {
    return (
        <Suspense fallback={
            <DashboardLayout>
                <LoadingSpinner fullScreen />
            </DashboardLayout>
        }>
            <TrackingPageContent />
        </Suspense>
    );
}
