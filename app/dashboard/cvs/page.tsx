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
import { FileText, Plus, Calendar, ExternalLink, Eye, Search, Trash2, X, CheckSquare, Square } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { createSupabaseClient } from "@/lib/supabase";
import { toast } from "sonner";

export const dynamic = "force-dynamic";

export default function CVListPage() {
    const { userId, isLoading: authLoading } = useAuth();
    const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
    const [search, setSearch] = useState("");

    // Selection state
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Use centralized CV generations hook
    const { data: cvs, loading, refetch } = useCVGenerations(userId);

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

    const formatDate = (date: string) => {
        try {
            return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
        } catch {
            return new Date(date).toLocaleDateString("fr-FR");
        }
    };

    // Toggle selection
    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    // Select all / deselect all
    const toggleSelectAll = () => {
        if (selectedIds.size === sortedCVs.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(sortedCVs.map(cv => cv.id)));
        }
    };

    // Delete selected CVs
    const handleDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!userId) return;

        setDeleting(true);
        try {
            const supabase = createSupabaseClient();
            const idsToDelete = Array.from(selectedIds);

            const { error } = await supabase
                .from('cv_generations')
                .delete()
                .in('id', idsToDelete)
                .eq('user_id', userId);

            if (error) throw error;

            toast.success(`${idsToDelete.length} CV${idsToDelete.length > 1 ? 's' : ''} supprimé${idsToDelete.length > 1 ? 's' : ''}`);
            setSelectedIds(new Set());
            setShowDeleteConfirm(false);
            refetch(); // Refresh the list
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Erreur lors de la suppression');
        } finally {
            setDeleting(false);
        }
    };

    if (loading || authLoading) {
        return <DashboardLayout><LoadingSpinner fullScreen /></DashboardLayout>;
    }

    const hasSelection = selectedIds.size > 0;

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
                            <span className="text-lg font-normal text-slate-600">({cvs.length})</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        {hasSelection ? (
                            <>
                                <span className="text-sm text-slate-600">
                                    {selectedIds.size} sélectionné{selectedIds.size > 1 ? 's' : ''}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedIds(new Set())}
                                >
                                    <X className="w-4 h-4 mr-1" /> Annuler
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setShowDeleteConfirm(true)}
                                >
                                    <Trash2 className="w-4 h-4 mr-1" /> Supprimer
                                </Button>
                            </>
                        ) : (
                            <Link href="/dashboard/analyze">
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="w-4 h-4 mr-2" /> Nouvelle Analyse
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Score Legend */}
                <Card className="mb-4 p-3">
                    <ScoreLegend />
                </Card>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Rechercher par poste, entreprise..."
                            className="pl-10"
                        />
                    </div>
                    <div className="flex gap-2">
                        {sortedCVs.length > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={toggleSelectAll}
                                className="whitespace-nowrap"
                            >
                                {selectedIds.size === sortedCVs.length ? (
                                    <><CheckSquare className="w-4 h-4 mr-1" /> Tout désélect.</>
                                ) : (
                                    <><Square className="w-4 h-4 mr-1" /> Tout sélect.</>
                                )}
                            </Button>
                        )}
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
                            className="px-3 py-2 text-sm border rounded-lg bg-white"
                        >
                            <option value="newest">↓ Date</option>
                            <option value="oldest">↑ Date</option>
                        </select>
                    </div>
                </div>

                {/* CV List */}
                {sortedCVs.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                            <h3 className="text-xl font-medium text-slate-600 mb-2">
                                {search ? "Aucun CV trouvé" : "Aucun CV généré"}
                            </h3>
                            <p className="text-slate-600 mb-6">
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
                            const isSelected = selectedIds.has(cv.id);

                            return (
                                <Card
                                    key={cv.id}
                                    className={`hover:shadow-md transition-all cursor-pointer group ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                                        }`}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-4">
                                            {/* Checkbox */}
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    toggleSelect(cv.id);
                                                }}
                                                className="flex-shrink-0"
                                            >
                                                {isSelected ? (
                                                    <CheckSquare className="w-5 h-5 text-blue-600" />
                                                ) : (
                                                    <Square className="w-5 h-5 text-slate-300 group-hover:text-slate-600" />
                                                )}
                                            </button>

                                            {/* Score Indicator */}
                                            <ScoreIndicator score={matchScore} />

                                            {/* Content */}
                                            <Link
                                                href={`/dashboard/cv/${cv.id}`}
                                                className="flex-1 min-w-0"
                                                onClick={(e) => {
                                                    if (hasSelection) {
                                                        e.preventDefault();
                                                        toggleSelect(cv.id);
                                                    }
                                                }}
                                            >
                                                <div className="font-semibold text-slate-800 truncate">
                                                    {jobTitle}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
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

                                            {/* Actions (hidden when selecting) */}
                                            {!hasSelection && (
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
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">
                            Confirmer la suppression
                        </h3>
                        <p className="text-slate-600 mb-6">
                            Êtes-vous sûr de vouloir supprimer {selectedIds.size} CV{selectedIds.size > 1 ? 's' : ''} ?
                            Cette action est irréversible.
                        </p>
                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={deleting}
                            >
                                Annuler
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                {deleting ? 'Suppression...' : 'Supprimer'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
