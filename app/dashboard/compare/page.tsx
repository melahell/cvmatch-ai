"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createSupabaseClient } from "@/lib/supabase";
import { ArrowLeftRight, Download, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

function CompareContent() {
    const { userId, isLoading: authLoading } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();

    // ROUGE #2: Selection from URL
    const [analysisA, setAnalysisA] = useState<any>(null);
    const [analysisB, setAnalysisB] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const idA = searchParams.get('a');
    const idB = searchParams.get('b');

    useEffect(() => {
        if (!userId || !idA || !idB) {
            setLoading(false);
            return;
        }

        const fetchAnalyses = async () => {
            const supabase = createSupabaseClient();

            const [resA, resB] = await Promise.all([
                supabase.from('job_analyses').select('*').eq('id', idA).single(),
                supabase.from('job_analyses').select('*').eq('id', idB).single()
            ]);

            if (resA.data) setAnalysisA(resA.data);
            if (resB.data) setAnalysisB(resB.data);
            setLoading(false);
        };

        fetchAnalyses();
    }, [userId, idA, idB]);

    // ORANGE #5: Quick swap
    const handleSwap = () => {
        router.push(`/dashboard/compare?a=${idB}&b=${idA}`);
    };

    if (authLoading || loading) {
        return <DashboardLayout><LoadingSpinner fullScreen /></DashboardLayout>;
    }

    if (!idA || !idB) {
        return (
            <DashboardLayout>
                <div className="container mx-auto py-8 px-4 max-w-6xl">
                    <Card>
                        <CardContent className="p-12 text-center">
                            <h2 className="text-xl font-semibold mb-2">Aucune analyse sélectionnée</h2>
                            <p className="text-slate-500 mb-4">Sélectionnez deux analyses à comparer</p>
                            <Link href="/dashboard/analyze">
                                <Button>Retour aux analyses</Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

    if (!analysisA || !analysisB) {
        return (
            <DashboardLayout>
                <div className="container mx-auto py-8 px-4 max-w-6xl">
                    <Card>
                        <CardContent className="p-12 text-center">
                            <h2 className="text-xl font-semibold mb-2 text-red-600">Erreur</h2>
                            <p className="text-slate-500">Impossible de charger les analyses</p>
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

    const scoreA = analysisA.match_score || 0;
    const scoreB = analysisB.match_score || 0;
    const scoreDiff = Math.abs(scoreA - scoreB);

    return (
        <DashboardLayout>
            <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-7xl">
                {/* Header */}
                <div className="mb-4 sm:mb-6">
                    <Link href="/dashboard/analyze" className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-500 hover:text-blue-600 mb-3 sm:mb-4">
                        <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                        Retour aux analyses
                    </Link>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                        <h1 className="text-xl sm:text-2xl font-bold">Comparaison d'Analyses</h1>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button variant="outline" onClick={handleSwap} className="flex-1 sm:flex-initial" size="sm">
                                <ArrowLeftRight className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                                <span className="hidden sm:inline">Inverser</span>
                                <span className="sm:hidden">Swap</span>
                            </Button>
                            <Button variant="outline" className="flex-1 sm:flex-initial" size="sm">
                                <Download className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                                <span className="hidden sm:inline">Exporter PDF</span>
                                <span className="sm:hidden">PDF</span>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Score Comparison */}
                <Card className="mb-4 sm:mb-6">
                    <CardHeader className="pb-3 sm:pb-6">
                        <CardTitle className="text-base sm:text-lg">Scores de Matching</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Mobile: Compact horizontal layout */}
                        <div className="flex md:hidden items-center justify-around gap-2 py-2">
                            <div className="text-center flex-1">
                                <div className="text-2xl font-bold text-blue-600">{scoreA}%</div>
                                <div className="text-xs text-slate-600 mt-0.5">Analyse A</div>
                            </div>
                            <div className="flex-shrink-0 px-2">
                                <Badge variant="secondary" className="text-xs px-2 py-1">
                                    ±{scoreDiff}%
                                </Badge>
                            </div>
                            <div className="text-center flex-1">
                                <div className="text-2xl font-bold text-green-600">{scoreB}%</div>
                                <div className="text-xs text-slate-600 mt-0.5">Analyse B</div>
                            </div>
                        </div>

                        {/* Desktop: Original grid layout */}
                        <div className="hidden md:grid grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-3xl font-bold text-blue-600">{scoreA}%</div>
                                <div className="text-sm text-slate-600 mt-1">Analyse A</div>
                            </div>
                            <div className="flex items-center justify-center">
                                <Badge variant="secondary" className="text-lg px-4 py-2">
                                    Différence: {scoreDiff}%
                                </Badge>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-3xl font-bold text-green-600">{scoreB}%</div>
                                <div className="text-sm text-slate-600 mt-1">Analyse B</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Side-by-Side Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Analysis A */}
                    <Card>
                        <CardHeader className="bg-blue-50 pb-3 sm:pb-6">
                            <CardTitle className="text-base sm:text-lg text-blue-900">Analyse A</CardTitle>
                            <p className="text-xs sm:text-sm text-slate-600">{new Date(analysisA.created_at).toLocaleDateString('fr-FR')}</p>
                        </CardHeader>
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="space-y-3 sm:space-y-4">
                                <div>
                                    <h3 className="text-sm font-semibold mb-1 sm:mb-2">URL/Source</h3>
                                    <p className="text-xs sm:text-sm text-slate-600 truncate">{analysisA.job_url || 'Texte collé'}</p>
                                </div>
                                {analysisA.match_report?.poste_cible && (
                                    <div>
                                        <h3 className="text-sm font-semibold mb-1 sm:mb-2">Poste</h3>
                                        <p className="text-xs sm:text-sm">{analysisA.match_report.poste_cible}</p>
                                    </div>
                                )}
                                {analysisA.match_report?.entreprise && (
                                    <div>
                                        <h3 className="text-sm font-semibold mb-1 sm:mb-2">Entreprise</h3>
                                        <p className="text-xs sm:text-sm">{analysisA.match_report.entreprise}</p>
                                    </div>
                                )}
                                {analysisA.match_report?.points_forts && (
                                    <div>
                                        <h3 className="text-sm font-semibold mb-1 sm:mb-2 text-green-600">Points Forts</h3>
                                        <ul className="text-xs sm:text-sm space-y-1">
                                            {analysisA.match_report.points_forts.slice(0, 3).map((point: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                                                    <span className="flex-1">{point}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Analysis B */}
                    <Card>
                        <CardHeader className="bg-green-50 pb-3 sm:pb-6">
                            <CardTitle className="text-base sm:text-lg text-green-900">Analyse B</CardTitle>
                            <p className="text-xs sm:text-sm text-slate-600">{new Date(analysisB.created_at).toLocaleDateString('fr-FR')}</p>
                        </CardHeader>
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="space-y-3 sm:space-y-4">
                                <div>
                                    <h3 className="text-sm font-semibold mb-1 sm:mb-2">URL/Source</h3>
                                    <p className="text-xs sm:text-sm text-slate-600 truncate">{analysisB.job_url || 'Texte collé'}</p>
                                </div>
                                {analysisB.match_report?.poste_cible && (
                                    <div>
                                        <h3 className="text-sm font-semibold mb-1 sm:mb-2">Poste</h3>
                                        <p className="text-xs sm:text-sm">{analysisB.match_report.poste_cible}</p>
                                    </div>
                                )}
                                {analysisB.match_report?.entreprise && (
                                    <div>
                                        <h3 className="text-sm font-semibold mb-1 sm:mb-2">Entreprise</h3>
                                        <p className="text-xs sm:text-sm">{analysisB.match_report.entreprise}</p>
                                    </div>
                                )}
                                {analysisB.match_report?.points_forts && (
                                    <div>
                                        <h3 className="text-sm font-semibold mb-1 sm:mb-2 text-green-600">Points Forts</h3>
                                        <ul className="text-xs sm:text-sm space-y-1">
                                            {analysisB.match_report.points_forts.slice(0, 3).map((point: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                                                    <span className="flex-1">{point}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default function ComparePage() {
    return (
        <Suspense fallback={<DashboardLayout><LoadingSpinner fullScreen /></DashboardLayout>}>
            <CompareContent />
        </Suspense>
    );
}
