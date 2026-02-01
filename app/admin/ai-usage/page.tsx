"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSupabaseAuthHeader } from "@/lib/supabase";
import { toast } from "sonner";

type GeminiUsageResponse = {
    summary: { total: number; today: number; last7d: number; last30d: number };
    byAction: { action: string; count: number }[];
    daily: { day: string; count: number }[];
    topUsers: { user_id: string; email: string | null; count: number }[];
    days: number;
    generated_at?: string;
};

export default function AdminAIUsagePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState("30");
    const [data, setData] = useState<GeminiUsageResponse | null>(null);

    useEffect(() => {
        const run = async () => {
            setLoading(true);
            try {
                const authHeader = await getSupabaseAuthHeader();
                const me = await fetch("/api/admin/me", { headers: authHeader });
                if (!me.ok) {
                    router.replace("/dashboard");
                    return;
                }
                const meData = await me.json();
                if (!meData.isAdmin) {
                    router.replace("/dashboard");
                    return;
                }

                const res = await fetch(`/api/admin/gemini-usage?days=${encodeURIComponent(days)}`, { headers: authHeader });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    toast.error(err.error || "Impossible de charger l'usage Gemini");
                    setData(null);
                    return;
                }
                const payload = await res.json();
                setData(payload);
            } finally {
                setLoading(false);
            }
        };
        run();
    }, [days, router]);

    const actionRows = useMemo(() => (data?.byAction || []).slice(0, 20), [data]);
    const topUsers = useMemo(() => (data?.topUsers || []).slice(0, 20), [data]);
    const dailyRows = useMemo(() => (data?.daily || []).slice(-30), [data]);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="container mx-auto py-6 px-4">Chargement...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="container mx-auto py-6 px-4 space-y-6 max-w-7xl">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Usage IA (Gemini)</h1>
                        <p className="text-slate-600 dark:text-slate-600">Journal d'usage et métriques agrégées</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Select value={days} onValueChange={setDays}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Période" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7">7 jours</SelectItem>
                                <SelectItem value="30">30 jours</SelectItem>
                                <SelectItem value="90">90 jours</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="dark:bg-slate-900 dark:border-slate-800">
                        <CardHeader>
                            <CardTitle>Total</CardTitle>
                            <CardDescription>Période sélectionnée</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{data?.summary.total ?? 0}</div>
                        </CardContent>
                    </Card>
                    <Card className="dark:bg-slate-900 dark:border-slate-800">
                        <CardHeader>
                            <CardTitle>Aujourd'hui</CardTitle>
                            <CardDescription>UTC</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{data?.summary.today ?? 0}</div>
                        </CardContent>
                    </Card>
                    <Card className="dark:bg-slate-900 dark:border-slate-800">
                        <CardHeader>
                            <CardTitle>7 jours</CardTitle>
                            <CardDescription>Rolling</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{data?.summary.last7d ?? 0}</div>
                        </CardContent>
                    </Card>
                    <Card className="dark:bg-slate-900 dark:border-slate-800">
                        <CardHeader>
                            <CardTitle>30 jours</CardTitle>
                            <CardDescription>Rolling</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{data?.summary.last30d ?? 0}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="dark:bg-slate-900 dark:border-slate-800">
                        <CardHeader>
                            <CardTitle>Par action</CardTitle>
                            <CardDescription>Top 20</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {actionRows.length === 0 ? (
                                    <div className="text-sm text-slate-500">Aucune donnée</div>
                                ) : (
                                    actionRows.map((row) => (
                                        <div key={row.action} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 py-2">
                                            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{row.action}</div>
                                            <div className="text-sm text-slate-600 dark:text-slate-600">{row.count}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="dark:bg-slate-900 dark:border-slate-800">
                        <CardHeader>
                            <CardTitle>Top utilisateurs</CardTitle>
                            <CardDescription>Top 20 sur la période</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {topUsers.length === 0 ? (
                                    <div className="text-sm text-slate-500">Aucune donnée</div>
                                ) : (
                                    topUsers.map((row) => (
                                        <div key={row.user_id} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 py-2">
                                            <div className="min-w-0">
                                                <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                                                    {row.email || row.user_id}
                                                </div>
                                                {row.email ? (
                                                    <div className="text-xs text-slate-500 truncate">{row.user_id}</div>
                                                ) : null}
                                            </div>
                                            <div className="text-sm text-slate-600 dark:text-slate-600">{row.count}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="dark:bg-slate-900 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle>Volume par jour</CardTitle>
                        <CardDescription>Derniers 30 jours affichés</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {dailyRows.length === 0 ? (
                                <div className="text-sm text-slate-500">Aucune donnée</div>
                            ) : (
                                dailyRows.map((row) => (
                                    <div key={row.day} className="border border-slate-200 dark:border-slate-800 rounded-md p-3">
                                        <div className="text-xs text-slate-500">{row.day}</div>
                                        <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">{row.count}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}

