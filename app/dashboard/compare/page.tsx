"use client";

import { useState, useEffect } from "react";
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

export default function ComparePage() {
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
            <div className="container mx-auto py-6 px-4 max-w-7xl">
                {/* Header */}
                <div className="mb-6">
                    <Link href="/dashboard/analyze" className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-4">
                        <ChevronLeft className="w-4 h-4" />
                        Retour aux analyses
                    </Link>
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Comparaison d'Analyses</h1>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleSwap}>
                                <ArrowLeftRight className="w-4 h-4 mr-2" />
                                Inverser
                            </Button>
                            <Button variant="outline">
                                <Download className="w-4 h-4 mr-2" />
                                Exporter PDF
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Score Comparison */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Scores de Matching</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Analysis A */}
                    <Card>
                        <CardHeader className="bg-blue-50">
                            <CardTitle className="text-blue-900">Analyse A</CardTitle>
                            <p className="text-sm text-slate-600">{new Date(analysisA.created_at).toLocaleDateString('fr-FR')}</p>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold mb-2">URL/Source</h3>
                                    <p className="text-sm text-slate-600 truncate">{analysisA.job_url || 'Texte collé'}</p>
                                </div>
                                {analysisA.match_report?.poste_cible && (
                                    <div>
                                        <h3 className="font-semibold mb-2">Poste</h3>
                                        <p className="text-sm">{analysisA.match_report.poste_cible}</p>
                                    </div>
                                )}
                                {analysisA.match_report?.entreprise && (
                                    <div>
                                        <h3 className="font-semibold mb-2">Entreprise</h3>
                                        <p className="text-sm">{analysisA.match_report.entreprise}</p>
                                    </div>
                                )}
                                {analysisA.match_report?.points_forts && (
                                    <div>
                                        <h3 className="font-semibold mb-2 text-green-600">Points Forts</h3>
                                        <ul className="text-sm space-y-1">
                                            {analysisA.match_report.points_forts.slice(0, 3).map((point: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <span className="text-green-500 mt-0.5">✓</span>
                                                    <span>{point}</span>
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
                        <CardHeader className="bg-green-50">
                            <CardTitle className="text-green-900">Analyse B</CardTitle>
                            <p className="text-sm text-slate-600">{new Date(analysisB.created_at).toLocaleDateString('fr-FR')}</p>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold mb-2">URL/Source</h3>
                                    <p className="text-sm text-slate-600 truncate">{analysisB.job_url || 'Texte collé'}</p>
                                </div>
                                {analysisB.match_report?.poste_cible && (
                                    <div>
                                        <h3 className="font-semibold mb-2">Poste</h3>
                                        <p className="text-sm">{analysisB.match_report.poste_cible}</p>
                                    </div>
                                )}
                                {analysisB.match_report?.entreprise && (
                                    <div>
                                        <h3 className="font-semibold mb-2">Entreprise</h3>
                                        <p className="text-sm">{analysisB.match_report.entreprise}</p>
                                    </div>
                                )}
                                {analysisB.match_report?.points_forts && (
                                    <div>
                                        <h3 className="font-semibold mb-2 text-green-600">Points Forts</h3>
                                        <ul className="text-sm space-y-1">
                                            {analysisB.match_report.points_forts.slice(0, 3).map((point: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <span className="text-green-500 mt-0.5">✓</span>
                                                    <span>{point}</span>
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
