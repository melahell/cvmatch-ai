"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase";
import { Loader2, Briefcase, FileText, CheckCircle, TrendingUp, Github, Upload, PlusCircle, User, Calendar, ExternalLink, Camera } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Cookies from "js-cookie";
import { JobAnalysis, UserProfile } from "@/types";

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<UserProfile["profil"] | null>(null);
    const [topJobs, setTopJobs] = useState<any[]>([]); // Keeping any for topJobs as structure varies
    const [stats, setStats] = useState({ analyses: 0, cvs: 0, applied: 0 });
    const [completenessScore, setCompletenessScore] = useState(0);
    const [skills, setSkills] = useState<string[]>([]);
    const [userName, setUserName] = useState("Candidat");
    const [uploadedDocs, setUploadedDocs] = useState<any[]>([]);
    const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);

    useEffect(() => {
        const supabase = createSupabaseClient();
        async function fetchData() {
            setUserName(Cookies.get("userName") || "Candidat");
            const userId = Cookies.get("userId");
            const userName = Cookies.get("userName");

            if (!userId) {
                // No user ? Redirect to login (Real Auth)
                window.location.href = "/login";
                return;
            }

            // 1. Fetch RAG Data
            const { data: ragData } = await supabase
                .from("rag_metadata")
                .select("completeness_details, top_10_jobs, completeness_score")
                .eq("user_id", userId)
                .single();

            if (ragData) {
                setProfile(ragData.completeness_details?.profil); // Type is now compatible
                setCompletenessScore(ragData.completeness_score || 0);
                if (ragData.top_10_jobs) {
                    setTopJobs(ragData.top_10_jobs);
                }
                // Extract skills from profile
                const profileSkills = ragData.completeness_details?.competences?.techniques?.slice(0, 5) || [];
                setSkills(profileSkills);

                // 2. Fetch Stats
                const { count: appliedCount } = await supabase
                    .from("job_analyses")
                    .select("*", { count: "exact", head: true })
                    .eq("user_id", userId)
                    .neq("application_status", "pending");

                const { count: analysesCount } = await supabase
                    .from("job_analyses")
                    .select("*", { count: "exact", head: true })
                    .eq("user_id", userId);

                const { count: cvCount } = await supabase
                    .from("cv_generations")
                    .select("*", { count: "exact", head: true })
                    .eq("user_id", userId);

                setStats({
                    analyses: analysesCount || 0,
                    cvs: cvCount || 0,
                    applied: appliedCount || 0
                });
            }

            // 3. Fetch Uploaded Documents
            const { data: docs } = await supabase
                .from("uploaded_documents")
                .select("id, filename, created_at, file_type")
                .eq("user_id", userId)
                .order("created_at", { ascending: false })
                .limit(5);

            if (docs) {
                setUploadedDocs(docs);
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
                        <div className="text-4xl font-bold text-green-600 mb-1">{completenessScore}/100</div>
                        <div className="text-sm font-medium text-slate-500">Score Profil Moy.</div>
                    </CardContent>
                </Card>
                <Link href="/onboarding">
                    <Card className="bg-slate-900 text-white cursor-pointer hover:bg-slate-800 transition-colors h-full">
                        <CardContent className="flex flex-col items-center justify-center p-6 h-full">
                            <div className="flex items-center gap-2 mb-2">
                                <Upload className="w-5 h-5" />
                                <span className="font-bold">Gérer mon profil</span>
                            </div>
                            <div className="text-xs text-slate-300 text-center">Ajouter des documents ou mettre à jour</div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* CTA BANNER FOR EMPTY PROFILE */}
            {completenessScore === 0 && (
                <Link href="/onboarding">
                    <Card className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white cursor-pointer hover:from-blue-700 hover:to-purple-700 transition-all">
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

            <div className="grid md:grid-cols-3 gap-8">

                {/* TOP JOBS SUGGESTIONS */}
                <div className="md:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" /> Top Opportunités pour vous
                    </h2>

                    <div className="grid gap-4">
                        {topJobs.slice(0, 5).map((job: any, i) => (
                            <Card key={i} className="border-l-4 border-l-blue-500">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="font-bold text-lg text-slate-800">{job.titre_poste || "Poste non défini"}</div>
                                            <div className="text-sm text-slate-500">
                                                {job.secteurs?.join(", ") || "Secteur varié"} • {job.salaire_min}k€ - {job.salaire_max}k€
                                            </div>
                                        </div>
                                        <Badge variant="secondary" className="text-slate-600 bg-slate-100">
                                            Match {job.match_score}%
                                        </Badge>
                                    </div>
                                    <div className="flex justify-end">
                                        <Link href="/dashboard/analyze">
                                            <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                                                🔍 Analyser une offre similaire
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* PROFILE SUMMARY SIDEBAR */}
                <div className="space-y-6">
                    {/* Profile Card with Photo */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                {/* Photo or Placeholder with Upload */}
                                <div className="relative group">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                                        {profile?.prenom?.[0]}{profile?.nom?.[0]}
                                    </div>
                                    <Link href="/onboarding">
                                        <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                            <Camera className="w-5 h-5 text-white" />
                                        </div>
                                    </Link>
                                </div>
                                <div>
                                    <div className="font-bold text-lg">{profile?.prenom} {profile?.nom}</div>
                                    <div className="text-sm text-slate-500">{profile?.titre_principal}</div>
                                </div>
                            </div>
                            <div className="text-sm text-slate-500 mb-2">📍 {profile?.localisation}</div>
                        </CardContent>
                    </Card>

                    {/* Documents List */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Documents uploadés ({uploadedDocs.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {uploadedDocs.length > 0 ? uploadedDocs.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                                    <span className="truncate max-w-[150px]">{doc.filename}</span>
                                    <span className="text-xs text-slate-400">
                                        {new Date(doc.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                                    </span>
                                </div>
                            )) : (
                                <div className="text-sm text-slate-400">Aucun document</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Link to Mes Informations */}
                    <Link href="/dashboard/profile">
                        <Card className="hover:bg-slate-50 cursor-pointer transition-colors">
                            <CardContent className="p-4 flex items-center justify-between">
                                <span className="font-medium text-blue-600">📝 Mes informations</span>
                                <ExternalLink className="w-4 h-4 text-blue-600" />
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Skills Card */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Compétences Clés</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {skills.length > 0 ? skills.map((skill: any, i) => (
                                    <Badge key={i} variant="outline">{typeof skill === "string" ? skill : skill.nom || skill}</Badge>
                                )) : (
                                    <span className="text-sm text-slate-400">Aucune compétence</span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div >
    );
}
