"use client";

import { Briefcase, FileText, Upload, PlusCircle, TrendingUp, ExternalLink, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { CircularProgress } from "@/components/ui/CircularProgress";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useRAGData } from "@/hooks/useRAGData";
import { useDashboardData } from "@/hooks/useDashboardData";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { PhotoUpload } from "@/components/profile/PhotoUpload";
import Link from "next/link";
import { toast } from "sonner";

export default function DashboardPage() {
    const { userId, userName: authUserName, isLoading: authLoading } = useAuth();

    // Use centralized hooks - Wave 1 improvements
    const { data: ragData, loading: ragLoading, error: ragError, refetch: refetchRAG } = useRAGData(userId);
    const { stats, uploadedDocs, loading: dashboardLoading } = useDashboardData(userId);

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
            <div className="container mx-auto py-8 px-4">

                {/* WELCOME HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Bonjour, {ragData?.profil?.prenom || authUserName} 👋</h1>
                        <p className="text-slate-500 text-sm md:text-base">Prêt à décrocher le job de vos rêves ?</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
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
                        <Link href="/dashboard/analyze">
                            <Button className="bg-blue-600 hover:bg-blue-700" size="sm">
                                <Briefcase className="w-4 h-4 mr-2" /> Nouvelle Analyse
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* STATS ROW - Wave 1: Using StatsCard component */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <StatsCard
                        value={stats.analyses}
                        label="Offres Analysées"
                        color="blue"
                    />
                    <StatsCard
                        value={stats.cvs}
                        label="CVs Générés"
                        color="purple"
                        href="/dashboard/tracking"
                    />
                    <StatsCard href="/dashboard/profile">
                        <CircularProgress
                            value={ragData?.score || 0}
                            max={100}
                            size={80}
                            label="/ 100"
                        />
                        <div className="text-xs font-medium text-slate-500 mt-2">Score Profil</div>
                    </StatsCard>
                    <Link href="/dashboard/profile" className="block h-full">
                        <Card className="bg-slate-900 text-white cursor-pointer hover:bg-slate-800 transition-colors h-full">
                            <CardContent className="flex flex-col items-center justify-center p-6 text-center h-full">
                                <div className="flex items-center gap-2 mb-2">
                                    <Upload className="w-5 h-5" />
                                    <span className="font-bold">Gérer mon profil</span>
                                </div>
                                <div className="text-xs text-slate-300 text-center">Voir, éditer ou ajouter des documents</div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                {/* CTA BANNER FOR EMPTY PROFILE - Only show if no docs and score is 0 */}
                {(ragData?.score || 0) === 0 && uploadedDocs.length === 0 && (
                    <Link href="/onboarding" className="block mb-8">
                        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white cursor-pointer hover:from-blue-700 hover:to-purple-700 transition-all">
                            <CardContent className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white/20 rounded-full">
                                        <PlusCircle className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">Créez votre profil RAG</h3>
                                        <p className="text-blue-100">Uploadez votre CV pour débloquer l'analyse IA et les recommandations personnalisées</p>
                                    </div>
                                </div>
                                <Button variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
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

                <div className="grid md:grid-cols-3 gap-6">

                    {/* PROFILE SECTION - 2 columns */}
                    <div className="md:col-span-2 space-y-4">

                        {/* Profile Card - Wave 1: Using PhotoUpload component */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <PhotoUpload
                                        currentPhoto={ragData?.profil?.photo_url}
                                        onUploadSuccess={() => refetchRAG()}
                                    />
                                    <div>
                                        <div className="font-bold text-lg">{ragData?.profil?.prenom} {ragData?.profil?.nom}</div>
                                        <div className="text-sm text-slate-500">{ragData?.profil?.titre_principal}</div>
                                    </div>
                                </div>
                                {ragData?.profil?.localisation && (
                                    <div className="text-sm text-slate-500">📍 {ragData?.profil?.localisation}</div>
                                )}
                            </CardContent>
                        </Card>

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
                                        <div className="space-y-1">
                                            {uploadedDocs.slice(0, 3).map((doc) => (
                                                <div key={doc.id} className="flex justify-between text-sm py-1">
                                                    <span className="truncate text-slate-600">{doc.filename}</span>
                                                    <span className="text-xs text-slate-400">
                                                        {new Date(doc.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                                                    </span>
                                                </div>
                                            ))}
                                            {uploadedDocs.length > 3 && (
                                                <div className="text-xs text-blue-600">+{uploadedDocs.length - 3} autres...</div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-slate-400">Aucun document</div>
                                    )}
                                </CardContent>
                            </Card>
                        </Link>

                        {/* Skills */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Compétences clés</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-1">
                                    {(ragData?.competences?.techniques?.slice(0, 5) || []).length > 0 ? (
                                        (ragData?.competences?.techniques?.slice(0, 5) || []).map((skill: any, i: number) => (
                                            <Badge key={i} variant="secondary" className="text-xs">
                                                {typeof skill === "string" ? skill : skill.nom}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-sm text-slate-400">Aucune</span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Link to profile */}
                        <Link href="/dashboard/profile">
                            <Card className="hover:bg-slate-50 cursor-pointer transition-colors">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <span className="text-sm font-medium text-blue-600">📝 Mes informations</span>
                                    <ExternalLink className="w-4 h-4 text-slate-400" />
                                </CardContent>
                            </Card>
                        </Link>
                    </div>

                    {/* TOP JOBS - 1 column, compact */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-slate-500 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" /> Postes suggérés
                        </h3>
                        {ragData && ragData.topJobs.length > 0 ? (
                            <div className="space-y-2">
                                {ragData.topJobs.slice(0, 5).map((job: any, i: number) => (
                                    <div key={i} className="p-2 bg-slate-50 rounded text-xs">
                                        <div className="font-medium text-slate-600 truncate">{job.ligne || job.titre_poste || "Poste"}</div>
                                        <div className="text-slate-400 flex justify-between mt-1">
                                            <span className="truncate">{job.secteurs?.[0] || "Tech"}</span>
                                            <span className="font-medium">{job.match_score}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-xs text-slate-400 p-2">Uploadez un CV pour voir les suggestions</div>
                        )}
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}

