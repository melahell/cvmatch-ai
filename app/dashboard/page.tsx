"use client";

import { useState } from "react";
import { Briefcase, FileText, Upload, PlusCircle, TrendingUp, ExternalLink, Target, Eye, Download, RefreshCw, Loader2, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { CircularProgress } from "@/components/ui/CircularProgress";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useRAGData } from "@/hooks/useRAGData";
import { useDashboardData } from "@/hooks/useDashboardData";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { PhotoUpload } from "@/components/profile/PhotoUpload";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Recommendations } from "@/components/dashboard/Recommendations";
import { ClickableCard } from "@/components/ui/ClickableCard";
import { BadgeList } from "@/components/ui/BadgeList";
import { getWelcomeMessage, shouldShowOnboardingCTA, shouldShowCompletionTips, getScoreDescription } from "@/lib/dashboardHelpers";
import Link from "next/link";
import { createSupabaseClient, getSupabaseAuthHeader } from "@/lib/supabase";
import { toast } from "sonner";

export default function DashboardPage() {
    const { userId, userName: authUserName, isLoading: authLoading } = useAuth();

    // Use centralized hooks - Wave 1 improvements
    const { data: ragData, loading: ragLoading, error: ragError, refetch: refetchRAG } = useRAGData(userId);
    const { stats, uploadedDocs, loading: dashboardLoading } = useDashboardData(userId);

    // State for job suggestions generation
    const [generatingJobs, setGeneratingJobs] = useState(false);

    // State for job detail modal
    const [selectedJob, setSelectedJob] = useState<any>(null);

    // Generate job suggestions
    const generateJobSuggestions = async () => {
        if (!userId || generatingJobs) return;

        setGeneratingJobs(true);
        try {
            const authHeaders = await getSupabaseAuthHeader();
            const response = await fetch('/api/rag/suggest-jobs', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...authHeaders
                },
                credentials: 'include',
                body: JSON.stringify({})
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Échec de la génération');
            }

            toast.success('Suggestions de postes générées !');
            refetchRAG(); // Refresh to show new jobs
        } catch (error: any) {
            console.error('Job suggestions error:', error);
            toast.error(error.message || 'Erreur lors de la génération');
        } finally {
            setGeneratingJobs(false);
        }
    };

    // Combined loading state
    const loading = ragLoading || dashboardLoading || authLoading;

    if (loading) {
        return (
            <DashboardLayout>
                <LoadingSpinner fullScreen />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="container mx-auto py-4 sm:py-6 lg:py-8 px-3 sm:px-4 max-w-7xl">

                {/* WELCOME HEADER - Wave 2: Personalized message */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">Bonjour, {ragData?.profil?.prenom || authUserName} 👋</h1>
                        <p className="text-slate-600 text-xs sm:text-sm md:text-base mt-1">
                            {getWelcomeMessage(ragData?.score || 0)}
                        </p>
                    </div>
                    <div className="flex gap-2 flex-wrap items-center">
                        <Link href="/dashboard/tracking" className="hidden md:block">
                            <Button variant="outline" size="sm">
                                <FileText className="w-4 h-4 mr-2" /> Mes CVs
                            </Button>
                        </Link>
                        <Link href="/dashboard/tracking" className="hidden lg:block">
                            <Button variant="outline" size="sm">
                                <Briefcase className="w-4 h-4 mr-2" /> Suivi
                            </Button>
                        </Link>
                        <Link href="/dashboard/analyze" className="flex-1 sm:flex-initial">
                            <Button className="bg-gradient-neon hover:opacity-90 text-white shadow-lg hover:shadow-xl w-full transition-all" size="sm">
                                <Briefcase className="w-4 h-4 mr-2" /> Nouvelle Analyse
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* STATS ROW - Optimized responsive grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <StatsCard
                        value={stats.analyses}
                        label="Offres Analysées"
                        color="primary"
                        href="/dashboard/analyze"
                    />
                    <StatsCard
                        value={stats.cvs}
                        label="CVs Générés"
                        color="primary"
                        href="/dashboard/tracking"
                    />
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div>
                                    <StatsCard href="/dashboard/profile">
                                        <CircularProgress
                                            value={ragData?.score || 0}
                                            max={100}
                                            size={80}
                                            label="/ 100"
                                        />
                                        <div className="text-xs font-medium text-slate-600 mt-2">Score Profil</div>
                                    </StatsCard>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-sm">{getScoreDescription(ragData?.score || 0)}</p>
                                <p className="text-xs text-slate-600 mt-1">Basé sur: complétude profil, compétences, documents</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <ClickableCard href="/dashboard/profile" className="bg-slate-900 text-white hover:bg-slate-800 transition-colors h-full">
                        <CardContent className="flex flex-col items-center justify-center p-4 sm:p-6 text-center h-full">
                            <div className="flex items-center gap-2 mb-1 sm:mb-2">
                                <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="text-sm sm:text-base font-bold">Gérer mon profil</span>
                            </div>
                            <div className="text-xs text-slate-300 text-center">Voir, éditer ou ajouter des documents</div>
                        </CardContent>
                    </ClickableCard>
                </div>

                {/* CTA BANNER FOR EMPTY PROFILE - ORANGE #6: With shimmer animation */}
                {shouldShowOnboardingCTA(ragData?.score || 0, uploadedDocs.length) && (
                    <Link href="/onboarding" className="block mb-6 sm:mb-8">
                        <Card className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white cursor-pointer hover:from-blue-700 hover:to-purple-700 transition-all">
                            {/* Shimmer effect */}
                            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                            <CardContent className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white/20 rounded-full">
                                        <PlusCircle className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-bold">Créez votre profil RAG</h3>
                                        <p className="text-sm sm:text-base text-blue-100 line-clamp-2 sm:line-clamp-none">Uploadez votre CV pour débloquer l'analyse IA et les recommandations personnalisées</p>
                                    </div>
                                </div>
                                <Button variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50 w-full sm:w-auto flex-shrink-0">
                                    Commencer <Upload className="w-4 h-4 ml-2" />
                                </Button>
                            </CardContent>
                        </Card>
                    </Link>
                )}

                {/* What's missing to reach 100% */}
                {(ragData?.score || 0) > 0 && (ragData?.score || 0) < 100 && ragData && ragData.breakdown.length > 0 && (
                    <Link href="/dashboard/profile" className="block mb-6">
                        <Card className="border-amber-200 bg-amber-50 cursor-pointer hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-amber-100 rounded-full">
                                        <Target className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-amber-900 mb-2">Pour atteindre 100% de complétion :</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {ragData.breakdown
                                                .filter((item: any) => item.missing)
                                                .map((item: any, i: number) => (
                                                    <Badge key={i} variant="outline" className="bg-white border-amber-300 text-amber-800 text-xs">
                                                        {item.missing}
                                                    </Badge>
                                                ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                )}

                {/* VERTE Item 3: Recommendations */}
                {(ragData?.score || 0) < 100 && (
                    <div className="mb-6">
                        <Recommendations
                            score={ragData?.score || 0}
                            breakdown={ragData?.breakdown || []}
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">

                    {/* PROFILE SECTION - 2 columns */}
                    <div className="md:col-span-2 space-y-4">

                        {/* Profile Card - Combined Photo + Name */}
                        <PhotoUpload
                            currentPhoto={ragData?.photo_url}
                            userId={userId || ''}
                            onUploadSuccess={() => { window.location.reload(); }}
                            profileName={ragData?.profil ? `${ragData.profil.prenom || ''} ${ragData.profil.nom || ''}`.trim() : undefined}
                            profileTitle={ragData?.profil?.titre_principal}
                            profileLocation={ragData?.profil?.localisation}
                        />

                        {/* Documents */}
                        <Link href="/dashboard/profile?tab=docs" className="block">
                            <Card className="cursor-pointer hover:shadow-md transition-shadow">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <FileText className="w-4 h-4" /> Documents ({uploadedDocs.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {uploadedDocs.length > 0 ? (
                                        <div className="space-y-1 max-h-64 overflow-y-auto">
                                            {uploadedDocs.slice(0, 6).map((doc) => (
                                                <div key={doc.id} className="flex items-center justify-between text-sm py-1.5 sm:py-1 group">
                                                    <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                                                        {doc.file_type?.includes('pdf') ? (
                                                            <FileText className="w-4 h-4 text-red-500 flex-shrink-0" />
                                                        ) : doc.file_type?.includes('doc') ? (
                                                            <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                                        ) : (
                                                            <FileText className="w-4 h-4 text-slate-600 flex-shrink-0" />
                                                        )}
                                                        <span className="truncate text-slate-600 text-xs sm:text-sm">{doc.filename}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                                                        <span className="text-xs text-slate-600 mr-1 hidden sm:inline">
                                                            {new Date(doc.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                                                        </span>
                                                        <button onClick={async (e) => {
                                                            e.preventDefault();
                                                            const supabase = createSupabaseClient();
                                                            const { data } = await supabase.storage.from('documents').createSignedUrl(doc.storage_path, 60);
                                                            if (data?.signedUrl) window.open(data.signedUrl, '_blank');
                                                        }} className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 sm:p-1 hover:bg-slate-100 rounded transition-opacity" title="Voir" aria-label={`Voir le document ${doc.filename}`}>
                                                            <Eye className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                                                        </button>
                                                        <button onClick={async (e) => {
                                                            e.preventDefault();
                                                            const supabase = createSupabaseClient();
                                                            const { data } = await supabase.storage.from('documents').createSignedUrl(doc.storage_path, 60);
                                                            if (data?.signedUrl) {
                                                                const a = document.createElement('a');
                                                                a.href = data.signedUrl;
                                                                a.download = doc.filename;
                                                                a.click();
                                                            }
                                                        }} className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 sm:p-1 hover:bg-slate-100 rounded transition-opacity" title="Télécharger" aria-label={`Télécharger le document ${doc.filename}`}>
                                                            <Download className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            {uploadedDocs.length > 6 && (
                                                <div className="text-xs text-blue-600">+{uploadedDocs.length - 6} autres...</div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-slate-600">Aucun document</div>
                                    )}
                                </CardContent>
                            </Card>
                        </Link>

                        {/* Skills - extracted from RAG competences.explicit + competences.inferred */}
                        {(() => {
                            // Extract skills from RAG structure: competences.explicit.techniques + inferred
                            const explicitTech = ragData?.competences?.explicit?.techniques || [];
                            const inferredTech = (ragData?.competences?.inferred?.techniques || [])
                                .map((t: any) => typeof t === 'string' ? t : t.name)
                                .filter(Boolean);
                            const inferredTools = (ragData?.competences?.inferred?.tools || [])
                                .map((t: any) => typeof t === 'string' ? t : t.name)
                                .filter(Boolean);

                            // Merge all and dedupe
                            const allSkills = [...new Set([...explicitTech, ...inferredTech, ...inferredTools])];

                            return allSkills.length > 0 ? (
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">Compétences clés</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <BadgeList
                                            items={allSkills}
                                            maxItems={10}
                                        />
                                    </CardContent>
                                </Card>
                            ) : null;
                        })()}

                    </div>

                    {/* TOP JOBS - 1 column, compact */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-slate-600 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" /> Postes suggérés
                            </h3>
                            {ragData && ragData.score > 0 && (
                                <button
                                    onClick={generateJobSuggestions}
                                    disabled={generatingJobs}
                                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 disabled:opacity-50"
                                    title="Générer les suggestions de postes"
                                    aria-label="Actualiser les suggestions de postes"
                                >
                                    {generatingJobs ? (
                                        <><Loader2 className="w-3 h-3 animate-spin" /> Génération...</>
                                    ) : (
                                        <><RefreshCw className="w-3 h-3" /> Actualiser</>
                                    )}
                                </button>
                            )}
                        </div>
                        {ragData && ragData.topJobs.length > 0 ? (
                            <div className="space-y-2">
                                {ragData.topJobs.slice(0, 10).map((job: any, i: number) => {
                                    const score = job.match_score || job.score || 0;
                                    const salaryMin = job.salaire_min || job.salary_min;
                                    const salaryMax = job.salaire_max || job.salary_max;
                                    const sector = job.secteurs?.[0] || job.secteur || "Tech";
                                    const jobTitle = job.titre_poste || job.ligne || "Poste";

                                    // Medal for top 3
                                    const getMedal = (rank: number) => {
                                        if (rank === 0) return "🥇";
                                        if (rank === 1) return "🥈";
                                        if (rank === 2) return "🥉";
                                        return <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">{rank + 1}</span>;
                                    };

                                    // Progress bar color based on score
                                    const getBarColor = (s: number) => {
                                        if (s >= 90) return "bg-gradient-to-r from-green-400 to-emerald-500";
                                        if (s >= 80) return "bg-gradient-to-r from-lime-400 to-green-500";
                                        if (s >= 70) return "bg-gradient-to-r from-yellow-400 to-lime-500";
                                        if (s >= 60) return "bg-gradient-to-r from-orange-400 to-yellow-500";
                                        return "bg-gradient-to-r from-red-400 to-orange-500";
                                    };

                                    return (
                                        <div
                                            key={i}
                                            onClick={() => setSelectedJob({ ...job, rank: i + 1, jobTitle, sector, score, salaryMin, salaryMax })}
                                            className={`p-3 rounded-lg border transition-all hover:shadow-md cursor-pointer ${i < 3 ? 'bg-gradient-to-r from-slate-50 to-white border-slate-200' : 'bg-white border-slate-100'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {/* Medal/Rank */}
                                                <div className="flex-shrink-0 text-lg">
                                                    {getMedal(i)}
                                                </div>

                                                {/* Job Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className="font-semibold text-slate-800 text-sm truncate"
                                                            title={jobTitle}
                                                        >
                                                            {jobTitle}
                                                        </span>
                                                        {score >= 90 && <span title="Excellent match!">🔥</span>}
                                                    </div>

                                                    {/* Sector tag + Salary */}
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                                            {sector}
                                                        </span>
                                                        {(salaryMin || salaryMax) && (
                                                            <span className="text-xs text-slate-600 font-medium">
                                                                💰 {salaryMin && salaryMax ? `${salaryMin}-${salaryMax}k€` : `${salaryMin || salaryMax}k€`}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Progress bar */}
                                                    <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full ${getBarColor(score)} transition-all duration-500`}
                                                            style={{ width: `${score}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Score */}
                                                <div className={`flex-shrink-0 font-bold text-lg ${score >= 90 ? 'text-green-600' : score >= 70 ? 'text-lime-600' : 'text-orange-500'}`}>
                                                    {score}%
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : ragData && ragData.score > 0 ? (
                            <div className="text-center py-4">
                                <p className="text-xs text-slate-600 mb-2">Pas encore de suggestions</p>
                                <button
                                    onClick={generateJobSuggestions}
                                    disabled={generatingJobs}
                                    className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1 mx-auto"
                                >
                                    {generatingJobs ? (
                                        <><Loader2 className="w-3 h-3 animate-spin" /> Génération...</>
                                    ) : (
                                        <><TrendingUp className="w-3 h-3" /> Générer</>)}
                                </button>
                            </div>
                        ) : (
                            <div className="text-xs text-slate-600 p-2">Uploadez un CV pour voir les suggestions</div>
                        )}
                    </div>

                </div>
            </div>

            {/* Job Detail Modal */}
            {selectedJob && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedJob(null)}
                >
                    <div
                        className="bg-white rounded-xl max-w-md w-full p-6 relative shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedJob(null)}
                            className="absolute top-4 right-4 text-slate-600 hover:text-slate-600"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Rank badge */}
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-3xl">
                                {selectedJob.rank === 1 ? "🥇" : selectedJob.rank === 2 ? "🥈" : selectedJob.rank === 3 ? "🥉" : `#${selectedJob.rank}`}
                            </span>
                            <div className={`text-2xl font-bold ${selectedJob.score >= 90 ? 'text-green-600' : selectedJob.score >= 70 ? 'text-lime-600' : 'text-orange-500'}`}>
                                {selectedJob.score}%
                                {selectedJob.score >= 90 && <span className="ml-1">🔥</span>}
                            </div>
                        </div>

                        {/* Full job title */}
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                            {selectedJob.jobTitle}
                        </h3>

                        {/* Sector */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                {selectedJob.sector}
                            </span>
                            {selectedJob.secteurs?.slice(1).map((s: string, i: number) => (
                                <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm">
                                    {s}
                                </span>
                            ))}
                        </div>

                        {/* Salary */}
                        {(selectedJob.salaryMin || selectedJob.salaryMax) && (
                            <div className="bg-green-50 rounded-lg p-4 mb-4">
                                <div className="text-sm text-green-700 font-medium">💰 Fourchette salariale estimée</div>
                                <div className="text-2xl font-bold text-green-800 mt-1">
                                    {selectedJob.salaryMin && selectedJob.salaryMax
                                        ? `${selectedJob.salaryMin}k€ - ${selectedJob.salaryMax}k€`
                                        : `${selectedJob.salaryMin || selectedJob.salaryMax}k€`}
                                    <span className="text-sm font-normal text-green-600"> / an</span>
                                </div>
                            </div>
                        )}

                        {/* Reason */}
                        {selectedJob.raison && (
                            <div className="bg-slate-50 rounded-lg p-4">
                                <div className="text-sm text-slate-600 font-medium mb-1">💡 Pourquoi ce poste ?</div>
                                <p className="text-slate-700">{selectedJob.raison}</p>
                            </div>
                        )}

                        {/* Close button */}
                        <button
                            onClick={() => setSelectedJob(null)}
                            className="w-full mt-4 bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

