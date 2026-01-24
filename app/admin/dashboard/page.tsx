"use client";

/**
 * Dashboard Admin - Métriques et statistiques système
 * Affiche métriques utilisateurs, performance, qualité
 */

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { Users, FileText, TrendingUp, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { logger } from "@/lib/utils/logger";

interface AdminMetrics {
    users: {
        total: number;
        active_7d: number;
        active_30d: number;
        new_today: number;
    };
    cvs: {
        total: number;
        generated_today: number;
        generated_7d: number;
        avg_generation_time: number;
    };
    exports: {
        pdf: number;
        word: number;
        markdown: number;
        json: number;
    };
    quality: {
        avg_match_score: number;
        avg_ats_score: number;
        avg_quality_score: number;
    };
    performance: {
        avg_api_latency: number;
        error_rate: number;
    };
}

export default function AdminDashboardPage() {
    const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMetrics() {
            try {
                const supabase = createSupabaseAdminClient();

                // Métriques utilisateurs
                const { count: totalUsers } = await supabase
                    .from("users")
                    .select("*", { count: "exact", head: true });

                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                const { count: active7d } = await supabase
                    .from("users")
                    .select("*", { count: "exact", head: true })
                    .gte("created_at", sevenDaysAgo.toISOString());

                const { count: active30d } = await supabase
                    .from("users")
                    .select("*", { count: "exact", head: true })
                    .gte("created_at", thirtyDaysAgo.toISOString());

                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const { count: newToday } = await supabase
                    .from("users")
                    .select("*", { count: "exact", head: true })
                    .gte("created_at", today.toISOString());

                // Métriques CVs
                const { count: totalCVs } = await supabase
                    .from("cv_generations")
                    .select("*", { count: "exact", head: true });

                const { count: cvsToday } = await supabase
                    .from("cv_generations")
                    .select("*", { count: "exact", head: true })
                    .gte("created_at", today.toISOString());

                const { count: cvs7d } = await supabase
                    .from("cv_generations")
                    .select("*", { count: "exact", head: true })
                    .gte("created_at", sevenDaysAgo.toISOString());

                // Métriques qualité (depuis cv_generations metadata)
                const { data: cvData } = await supabase
                    .from("cv_generations")
                    .select("cv_data")
                    .limit(100);

                const scores = {
                    match: [] as number[],
                    ats: [] as number[],
                    quality: [] as number[],
                };

                cvData?.forEach((cv: any) => {
                    const metadata = cv.cv_data?.cv_metadata;
                    if (metadata?.match_score) scores.match.push(metadata.match_score);
                    if (metadata?.ats_score) scores.ats.push(metadata.ats_score);
                    if (metadata?.quality_score) scores.quality.push(metadata.quality_score);
                });

                const avgMatch = scores.match.length > 0
                    ? Math.round(scores.match.reduce((a, b) => a + b, 0) / scores.match.length)
                    : 0;
                const avgATS = scores.ats.length > 0
                    ? Math.round(scores.ats.reduce((a, b) => a + b, 0) / scores.ats.length)
                    : 0;
                const avgQuality = scores.quality.length > 0
                    ? Math.round(scores.quality.reduce((a, b) => a + b, 0) / scores.quality.length)
                    : 0;

                setMetrics({
                    users: {
                        total: totalUsers || 0,
                        active_7d: active7d || 0,
                        active_30d: active30d || 0,
                        new_today: newToday || 0,
                    },
                    cvs: {
                        total: totalCVs || 0,
                        generated_today: cvsToday || 0,
                        generated_7d: cvs7d || 0,
                        avg_generation_time: 0, // TODO: Calculer depuis logs
                    },
                    exports: {
                        pdf: 0, // TODO: Tracker exports
                        word: 0,
                        markdown: 0,
                        json: 0,
                    },
                    quality: {
                        avg_match_score: avgMatch,
                        avg_ats_score: avgATS,
                        avg_quality_score: avgQuality,
                    },
                    performance: {
                        avg_api_latency: 0, // TODO: Depuis Vercel Analytics
                        error_rate: 0, // TODO: Depuis logs
                    },
                });
            } catch (error) {
                logger.error("Error fetching admin metrics", { error });
            } finally {
                setLoading(false);
            }
        }

        fetchMetrics();
    }, []);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="container mx-auto py-8 px-4">
                    <div className="text-center">Chargement des métriques...</div>
                </div>
            </DashboardLayout>
        );
    }

    if (!metrics) {
        return (
            <DashboardLayout>
                <div className="container mx-auto py-8 px-4">
                    <div className="text-center text-red-600">Erreur lors du chargement des métriques</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="container mx-auto py-8 px-4 max-w-7xl">
                <h1 className="text-3xl font-bold mb-8">Dashboard Admin</h1>

                {/* Métriques Utilisateurs */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Utilisateurs
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{metrics.users.total}</div>
                            <div className="text-sm text-slate-600 mt-2">
                                {metrics.users.new_today} nouveaux aujourd'hui
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Actifs 7j</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{metrics.users.active_7d}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Actifs 30j</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{metrics.users.active_30d}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                CVs Générés
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{metrics.cvs.total}</div>
                            <div className="text-sm text-slate-600 mt-2">
                                {metrics.cvs.generated_today} aujourd'hui
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Métriques Qualité */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                Score Match Moyen
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600">
                                {metrics.quality.avg_match_score}%
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Score ATS Moyen</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-600">
                                {metrics.quality.avg_ats_score}%
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Score Qualité Moyen</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-purple-600">
                                {metrics.quality.avg_quality_score}/10
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Métriques Performance */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                Performance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Latence API moyenne:</span>
                                    <span className="font-semibold">
                                        {metrics.performance.avg_api_latency || "N/A"}ms
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Taux d'erreur:</span>
                                    <span className="font-semibold">
                                        {metrics.performance.error_rate || "0"}%
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5" />
                                Exports
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>PDF:</span>
                                    <span className="font-semibold">{metrics.exports.pdf}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Word:</span>
                                    <span className="font-semibold">{metrics.exports.word}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Markdown:</span>
                                    <span className="font-semibold">{metrics.exports.markdown}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>JSON:</span>
                                    <span className="font-semibold">{metrics.exports.json}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
