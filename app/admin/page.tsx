"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Users, FileText, Briefcase, TrendingUp, Activity } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getSupabaseAuthHeader } from "@/lib/supabase";
import { Logo } from "@/components/ui/Logo";

interface AdminStats {
    totalUsers: number;
    totalAnalyses: number;
    totalCVs: number;
    totalDocuments: number;
    usersToday: number;
    analysesToday: number;
}

export default function AdminPage() {
    const router = useRouter();
    const { userId, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadAdminData = async () => {
            if (!userId) {
                router.push("/login");
                return;
            }

            try {
                const authHeader = await getSupabaseAuthHeader();
                const res = await fetch("/api/admin/stats", {
                    headers: authHeader
                });

                if (res.status === 403) {
                    setError("Accès refusé. Vous n'êtes pas administrateur.");
                    return;
                }

                if (!res.ok) {
                    throw new Error("Erreur lors du chargement des statistiques");
                }

                const data = await res.json();
                setStats(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadAdminData();
    }, [userId, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle className="text-red-600">Erreur</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-600 mb-4">{error}</p>
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="text-blue-600 hover:underline"
                        >
                            Retour au dashboard
                        </button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Logo size="md" showText />
                        <span className="text-sm font-semibold text-slate-600 bg-purple-100 px-3 py-1 rounded-full">
                            ADMIN
                        </span>
                    </div>
                    <button
                        onClick={logout}
                        className="text-sm text-slate-600 hover:text-slate-900"
                    >
                        Déconnexion
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        Backoffice Administration
                    </h1>
                    <p className="text-slate-600">
                        Vue d'ensemble des statistiques de la plateforme CV Crush
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">
                                Total Utilisateurs
                            </CardTitle>
                            <Users className="w-4 h-4 text-slate-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">
                                {stats?.totalUsers || 0}
                            </div>
                            <p className="text-xs text-slate-600 mt-1">
                                +{stats?.usersToday || 0} aujourd'hui
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">
                                Analyses de Jobs
                            </CardTitle>
                            <FileText className="w-4 h-4 text-slate-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">
                                {stats?.totalAnalyses || 0}
                            </div>
                            <p className="text-xs text-slate-600 mt-1">
                                +{stats?.analysesToday || 0} aujourd'hui
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">
                                CVs Générés
                            </CardTitle>
                            <Briefcase className="w-4 h-4 text-slate-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">
                                {stats?.totalCVs || 0}
                            </div>
                            <p className="text-xs text-slate-600 mt-1">
                                Total généré
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">
                                Documents Uploadés
                            </CardTitle>
                            <TrendingUp className="w-4 h-4 text-slate-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">
                                {stats?.totalDocuments || 0}
                            </div>
                            <p className="text-xs text-slate-600 mt-1">
                                CVs, lettres, etc.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">
                                Taux de Conversion
                            </CardTitle>
                            <Activity className="w-4 h-4 text-slate-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">
                                {stats?.totalUsers && stats?.totalAnalyses
                                    ? ((stats.totalAnalyses / stats.totalUsers) * 100).toFixed(1)
                                    : 0}%
                            </div>
                            <p className="text-xs text-slate-600 mt-1">
                                Analyses / User
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Actions Rapides</CardTitle>
                            <CardDescription>Gérer la plateforme</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <button
                                onClick={() => alert("Fonctionnalité à implémenter")}
                                className="w-full text-left px-4 py-2 rounded hover:bg-slate-100 text-sm"
                            >
                                📊 Voir tous les utilisateurs
                            </button>
                            <button
                                onClick={() => alert("Fonctionnalité à implémenter")}
                                className="w-full text-left px-4 py-2 rounded hover:bg-slate-100 text-sm"
                            >
                                📈 Analytics détaillés
                            </button>
                            <button
                                onClick={() => alert("Fonctionnalité à implémenter")}
                                className="w-full text-left px-4 py-2 rounded hover:bg-slate-100 text-sm"
                            >
                                🔧 Configuration système
                            </button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>État du Système</CardTitle>
                            <CardDescription>Monitoring en temps réel</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-600">Base de données</span>
                                <span className="text-sm font-medium text-green-600">✓ Opérationnel</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-600">API Gemini</span>
                                <span className="text-sm font-medium text-green-600">✓ Opérationnel</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-600">Storage Supabase</span>
                                <span className="text-sm font-medium text-green-600">✓ Opérationnel</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Footer Note */}
                <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                        <strong>Note:</strong> Ce backoffice est une version de base. Pour ajouter des fonctionnalités avancées
                        (gestion des utilisateurs, modération, analytics détaillés), contactez l'équipe technique.
                    </p>
                </div>
            </main>
        </div>
    );
}
