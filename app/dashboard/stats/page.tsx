"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, FileText, Target, Calendar, Award } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { createSupabaseClient } from "@/lib/supabase";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface StatsData {
    totalAnalyses: number;
    totalCVsGenerated: number;
    averageScore: number;
    bestScore: number;
    recentAnalyses: Array<{
        id: string;
        job_title: string;
        company: string;
        match_score: number;
        created_at: string;
    }>;
    topSkills: Array<{ skill: string; count: number }>;
    scoreHistory: Array<{ date: string; score: number }>;
}

export default function StatsPage() {
    const { userId } = useAuth();
    const [stats, setStats] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        const fetchStats = async () => {
            const supabase = createSupabaseClient();

            // Fetch analyses
            const { data: analyses } = await supabase
                .from("job_analyses")
                .select("id, job_title, company, match_score, created_at")
                .eq("user_id", userId)
                .order("created_at", { ascending: false });

            // Fetch generated CVs
            const { data: cvs } = await supabase
                .from("generated_cvs")
                .select("id")
                .eq("user_id", userId);

            // Calculate stats
            const scores = (analyses || []).map(a => a.match_score).filter(s => s > 0);
            const avgScore = scores.length > 0
                ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
                : 0;
            const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

            // Extract top skills from analyses (mock for now)
            const topSkills = [
                { skill: "React", count: 8 },
                { skill: "TypeScript", count: 6 },
                { skill: "Node.js", count: 5 },
                { skill: "Python", count: 4 },
                { skill: "SQL", count: 3 },
            ];

            // Score history (last 7 analyses)
            const scoreHistory = (analyses || [])
                .slice(0, 7)
                .reverse()
                .map(a => ({
                    date: new Date(a.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
                    score: a.match_score
                }));

            setStats({
                totalAnalyses: analyses?.length || 0,
                totalCVsGenerated: cvs?.length || 0,
                averageScore: avgScore,
                bestScore: bestScore,
                recentAnalyses: (analyses || []).slice(0, 5),
                topSkills,
                scoreHistory
            });
            setLoading(false);
        };

        fetchStats();
    }, [userId]);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="container mx-auto py-8 px-4">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48"></div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="container mx-auto py-6 px-4 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <BarChart3 className="w-6 h-6" />
                        Mes Statistiques
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Vue d'ensemble de votre activité sur CVMatch
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="dark:bg-slate-900 dark:border-slate-800">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {stats?.totalAnalyses || 0}
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Analyses</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="dark:bg-slate-900 dark:border-slate-800">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                    <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {stats?.totalCVsGenerated || 0}
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">CV générés</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="dark:bg-slate-900 dark:border-slate-800">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {stats?.averageScore || 0}%
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Score moyen</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="dark:bg-slate-900 dark:border-slate-800">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                                    <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {stats?.bestScore || 0}%
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Meilleur score</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Score History */}
                    <Card className="dark:bg-slate-900 dark:border-slate-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                                <TrendingUp className="w-5 h-5" />
                                Évolution des scores
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {stats?.scoreHistory && stats.scoreHistory.length > 0 ? (
                                <div className="h-48 flex items-end justify-around gap-2">
                                    {stats.scoreHistory.map((item, i) => (
                                        <div key={i} className="flex flex-col items-center gap-2 flex-1">
                                            <div
                                                className="w-full bg-gradient-to-t from-blue-600 to-purple-600 rounded-t-md transition-all"
                                                style={{ height: `${(item.score / 100) * 160}px` }}
                                            />
                                            <span className="text-xs text-slate-500 dark:text-slate-400">{item.date}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-48 flex items-center justify-center text-slate-400">
                                    <p>Pas encore de données</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Top Skills */}
                    <Card className="dark:bg-slate-900 dark:border-slate-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                                🏷️ Compétences les + demandées
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {stats?.topSkills.map((skill, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-24 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            {skill.skill}
                                        </div>
                                        <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                                style={{ width: `${(skill.count / 10) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-sm text-slate-500 dark:text-slate-400 w-8 text-right">
                                            {skill.count}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Analyses */}
                <Card className="dark:bg-slate-900 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                            <Calendar className="w-5 h-5" />
                            Analyses récentes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats?.recentAnalyses && stats.recentAnalyses.length > 0 ? (
                            <div className="space-y-3">
                                {stats.recentAnalyses.map((analysis) => (
                                    <div
                                        key={analysis.id}
                                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                                    >
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">
                                                {analysis.job_title || "Poste non spécifié"}
                                            </p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {analysis.company || "Entreprise"} · {new Date(analysis.created_at).toLocaleDateString('fr-FR')}
                                            </p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${analysis.match_score >= 80
                                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                                : analysis.match_score >= 60
                                                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                                                    : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                                            }`}>
                                            {analysis.match_score}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-400">
                                <p>Aucune analyse récente</p>
                                <a href="/dashboard/analyze" className="text-blue-600 hover:underline">
                                    Faire une analyse →
                                </a>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
