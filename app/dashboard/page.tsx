
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Loader2, Briefcase, TrendingUp, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Mock User ID (Match with Onboarding)
const USER_ID = "user_123_mock";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [topJobs, setTopJobs] = useState<any[]>([]);

    useEffect(() => {
        async function fetchData() {
            const { data, error } = await supabase
                .from("rag_metadata")
                .select("*")
                .eq("user_id", USER_ID)
                .single();

            if (data) {
                setProfile(data.completeness_details?.profil);
                setTopJobs(data.top_10_jobs || []);
            }
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
        <div className="container mx-auto max-w-5xl py-10 px-4">

            {/* Header Profile */}
            <header className="mb-10 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        Bonjour {profile?.prenom || "Candidat"} 👋
                    </h1>
                    <p className="text-slate-500 text-lg mt-2">
                        {profile?.titre_principal || "Analyse de profil en cours..."}
                    </p>
                </div>
                <a href="/dashboard/analyze">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        + Nouvelle Analyse
                    </Button>
                </a>
            </header>

            {/* Top 10 Jobs Section */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-slate-800">Top 10 Opportunités pour toi</h2>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {topJobs.map((job: any) => (
                        <Card key={job.rang} className="hover:shadow-lg transition-shadow border-slate-200">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <Badge variant={job.match_score > 80 ? "default" : "secondary"} className="mb-2">
                                        {job.match_score}% Match
                                    </Badge>
                                    <span className="text-xs font-bold text-slate-300">#{job.rang}</span>
                                </div>
                                <CardTitle className="text-lg text-blue-900 leading-snug">
                                    {job.titre_poste}
                                </CardTitle>
                                <CardDescription className="line-clamp-2 mt-1">
                                    {job.raison}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col gap-3 text-sm text-slate-600">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-green-600" />
                                        <span className="font-medium">{job.salaire_min} - {job.salaire_max} k€</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {job.secteurs?.map((secteur: string) => (
                                            <span key={secteur} className="bg-slate-100 px-2 py-1 rounded text-xs">
                                                {secteur}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {topJobs.length === 0 && (
                    <div className="text-center p-10 bg-slate-50 rounded-xl">
                        <p>Aucune suggestion pour le moment. As-tu bien finalisé l'upload via /onboarding ?</p>
                    </div>
                )}
            </section>
        </div>
    );
}
