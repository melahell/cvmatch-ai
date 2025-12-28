
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Loader2, Briefcase, FileText, CheckCircle, TrendingUp, Github } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Cookies from "js-cookie";



export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [topJobs, setTopJobs] = useState<any[]>([]);
    const [stats, setStats] = useState({ analyses: 0, cvs: 0, applied: 0 });
    const [userName, setUserName] = useState("Candidat");

    useEffect(() => {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        async function fetchData() {
            setUserName(Cookies.get("userName") || "Candidat");
            const userId = Cookies.get("userId");

            if (!userId) {
                // No user ? Redirect to login (Real Auth)
                window.location.href = "/login";
                return;
            }

            // 1. Fetch RAG Profile
            const { data: ragData } = await supabase
                .from("rag_metadata")
                .select("*")
                .eq("user_id", userId)
                .single();

            if (ragData) {
                setProfile(ragData.completeness_details?.profil);
                setTopJobs(ragData.top_10_jobs || []);
            }

            // 2. Fetch Stats
            const { count: analysesCount } = await supabase.from("job_analyses").select("*", { count: 'exact' }).eq("user_id", userId);
            const { count: cvsCount } = await supabase.from("cv_generations").select("*", { count: 'exact' }).eq("user_id", userId);

            setStats({
                analyses: analysesCount || 0,
                cvs: cvsCount || 0,
                applied: 0 // Placeholder as we don't track 'applied' click event yet deeply
            });

            setLoading(false);
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">

            {/* WELCOME HEADER */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Bonjour, {profile?.prenom || userName} 👋</h1>
                    <p className="text-slate-500">Prêt à décrocher le job de vos rêves ?</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/dashboard/tracking">
                        <Button variant="outline">
                            <Briefcase className="w-4 h-4 mr-2" /> Suivi Candidatures
                        </Button>
                    </Link>
                    <Link href="/dashboard/analyze">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Briefcase className="w-4 h-4 mr-2" /> Nouvelle Analyse
                        </Button>
                    </Link>
                </div>
            </div>

            {/* STATS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card>
                    <CardContent className="flex flex-col items-center justify-center p-6">
                        <div className="text-4xl font-bold text-blue-600 mb-1">{stats.analyses}</div>
                        <div className="text-sm font-medium text-slate-500">Offres Analysées</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex flex-col items-center justify-center p-6">
                        <div className="text-4xl font-bold text-purple-600 mb-1">{stats.cvs}</div>
                        <div className="text-sm font-medium text-slate-500">CVs Générés</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex flex-col items-center justify-center p-6">
                        <div className="text-4xl font-bold text-green-600 mb-1">87/100</div>
                        <div className="text-sm font-medium text-slate-500">Score Profil Moy.</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 text-white">
                    <CardContent className="flex flex-col items-center justify-center p-6 h-full">
                        <div className="flex items-center gap-2 mb-2">
                            <Github className="w-5 h-5" />
                            <span className="font-bold">RAG Storage</span>
                        </div>
                        <div className="text-xs text-slate-300 text-center">Données synchronisées sur GitHub Privé</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid md:grid-cols-3 gap-8">

                {/* TOP JOBS SUGGESTIONS */}
                <div className="md:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" /> Top Opportunités pour vous
                    </h2>

                    <div className="grid gap-4">
                        {topJobs.slice(0, 5).map((job: any, i) => (
                            <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500">
                                <CardContent className="p-4 flex justify-between items-center">
                                    <div>
                                        <div className="font-bold text-lg text-slate-800">{job.titre}</div>
                                        <div className="text-sm text-slate-500">{job.secteur} • {job.salaire_estime}</div>
                                    </div>
                                    <Badge variant="secondary" className="text-blue-700 bg-blue-50">
                                        Match {job.match_score}%
                                    </Badge>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* PROFILE SUMMARY SIDEBAR */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Mon Profil RAG</CardTitle>
                            <CardDescription>Généré par IA</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="text-xs font-bold text-slate-400 uppercase mb-1">Titre Principal</div>
                                <div className="font-medium">{profile?.titre_principal}</div>
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-400 uppercase mb-1">Localisation</div>
                                <div className="font-medium">{profile?.localisation}</div>
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-400 uppercase mb-1">Compétences Clés</div>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    <Badge variant="outline">Gestion de projet</Badge>
                                    <Badge variant="outline">Agile</Badge>
                                    <Badge variant="outline">Leadership</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
