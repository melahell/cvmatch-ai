"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase";
import { Briefcase, FileText, Upload, Camera, PlusCircle, TrendingUp, ExternalLink, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { CircularProgress } from "@/components/ui/CircularProgress";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { UserProfile } from "@/types";
import { calculateCompletenessWithBreakdown } from "@/lib/utils/completeness";
import { useState as useStateHook } from "react";

export default function DashboardPage() {
    const { userId, userName: authUserName, isLoading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<UserProfile["profil"] | null>(null);
    const [topJobs, setTopJobs] = useState<any[]>([]);
    const [stats, setStats] = useState({ analyses: 0, cvs: 0, applied: 0 });
    const [completenessScore, setCompletenessScore] = useState(0);
    const [completenessBreakdown, setCompletenessBreakdown] = useState<any[]>([]);
    const [skills, setSkills] = useState<string[]>([]);
    const [uploadedDocs, setUploadedDocs] = useState<any[]>([]);

    useEffect(() => {
        if (authLoading || !userId) return;

        const supabase = createSupabaseClient();
        async function fetchData() {

            // 1. Fetch RAG Data
            const { data: ragData, error: ragError } = await supabase
                .from("rag_metadata")
                // ONLY select columns that exist in DB (confirmed via inspection)
                // completeness_breakdown does NOT exist (42703 error)
                .select("completeness_details,top_10_jobs,completeness_score,custom_notes")
                .eq("user_id", userId)
                .single();

            if (ragError) {
                console.error("Error fetching RAG data:", ragError);
            }

            if (ragData) {
                // FIXED: completeness_details IS the profile directly (not nested under 'profil')
                setProfile(ragData.completeness_details);
                setCompletenessScore(ragData.completeness_score || 0);

                // Calculate breakdown from details (since not stored in DB)
                if (ragData.completeness_details) {
                    const { breakdown } = calculateCompletenessWithBreakdown(ragData.completeness_details);
                    setCompletenessBreakdown(breakdown);
                }

                if (ragData.top_10_jobs) {
                    setTopJobs(ragData.top_10_jobs);
                }

                // Extract skills from profile
                const profileSkills = ragData.completeness_details?.competences?.techniques?.slice(0, 5) || [];
                setSkills(profileSkills);
            }

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
    }, [userId, authLoading]);

    if (loading || authLoading) {
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
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Bonjour, {profile?.prenom || authUserName} 👋</h1>
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

                {/* STATS ROW */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center p-6 text-center h-full">
                            <div className="text-4xl font-bold text-blue-600 mb-1">{stats.analyses}</div>
                            <div className="text-sm font-medium text-slate-500">Offres Analysées</div>
                        </CardContent>
                    </Card>
                    <Link href="/dashboard/tracking" className="block h-full">
                        <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                            <CardContent className="flex flex-col items-center justify-center p-6 text-center h-full">
                                <div className="text-4xl font-bold text-purple-600 mb-1">{stats.cvs}</div>
                                <div className="text-sm font-medium text-slate-500">CVs Générés</div>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link href="/dashboard/profile/rag" className="block h-full">
                        <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                            <CardContent className="flex flex-col items-center justify-center p-4 text-center h-full">
                                <CircularProgress
                                    value={completenessScore}
                                    max={100}
                                    size={80}
                                    label="/ 100"
                                />
                                <div className="text-xs font-medium text-slate-500 mt-2">Score Profil</div>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link href="/dashboard/profile/rag" className="block h-full">
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

                {/* CTA BANNER FOR EMPTY PROFILE */}
                {/* CTA BANNER FOR EMPTY PROFILE - Only show if no docs and score is 0 */}
                {completenessScore === 0 && uploadedDocs.length === 0 && (
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
                {/* What's missing to reach 100% */}
                {completenessScore > 0 && completenessScore < 100 && completenessBreakdown.length > 0 && (
                    <Link href="/dashboard/profile/rag" className="block mb-6">
                        <Card className="border-amber-200 bg-amber-50 cursor-pointer hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-amber-100 rounded-full">
                                        <Target className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-amber-900 mb-2">Pour atteindre 100% de complétion :</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {completenessBreakdown
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

                        {/* Profile Card with Direct Photo Upload */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    {/* Avatar with direct upload */}
                                    <label className="relative group cursor-pointer">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                                            {profile?.photo_url ? (
                                                <img src={profile.photo_url} alt="Photo de profil" className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{profile?.prenom?.[0]}{profile?.nom?.[0]}</span>
                                            )}
                                        </div>
                                        <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera className="w-5 h-5 text-white" />
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file || !userId) return;

                                                try {
                                                    const supabase = createSupabaseClient();

                                                    // Upload to Supabase Storage
                                                    const fileExt = file.name.split('.').pop();
                                                    const fileName = `${userId}-${Date.now()}.${fileExt}`;
                                                    const filePath = `avatars/${fileName}`;

                                                    const { error: uploadError } = await supabase.storage
                                                        .from('profile-photos')
                                                        .upload(filePath, file, {
                                                            cacheControl: '3600',
                                                            upsert: true
                                                        });

                                                    if (uploadError) {
                                                        console.error('Upload error:', uploadError);
                                                        alert('Erreur lors de l\'upload de la photo');
                                                        return;
                                                    }

                                                    // Get SIGNED URL (private, expires in 1 year)
                                                    // Only accessible by authenticated user
                                                    const { data: signedData, error: signedError } = await supabase.storage
                                                        .from('profile-photos')
                                                        .createSignedUrl(filePath, 31536000); // 1 year in seconds

                                                    if (signedError || !signedData) {
                                                        console.error('Signed URL error:', signedError);
                                                        alert('Erreur lors de la génération de l\'URL sécurisée');
                                                        return;
                                                    }

                                                    // Update RAG metadata with SIGNED photo URL
                                                    if (!profile) return;
                                                    const updatedProfile = { ...profile, photo_url: signedData.signedUrl };
                                                    const { error: updateError } = await supabase
                                                        .from('rag_metadata')
                                                        .update({
                                                            completeness_details: updatedProfile
                                                        })
                                                        .eq('user_id', userId);

                                                    if (updateError) {
                                                        console.error('Update error:', updateError);
                                                        alert('Erreur lors de la mise à jour du profil');
                                                        return;
                                                    }

                                                    // Update local state
                                                    setProfile(updatedProfile);
                                                    alert('Photo de profil mise à jour !');
                                                } catch (error) {
                                                    console.error('Photo upload error:', error);
                                                    alert('Erreur lors de l\'upload de la photo');
                                                }
                                            }}
                                        />
                                    </label>
                                    <div>
                                        <div className="font-bold text-lg">{profile?.prenom} {profile?.nom}</div>
                                        <div className="text-sm text-slate-500">{profile?.titre_principal}</div>
                                    </div>
                                </div>
                                {profile?.localisation && (
                                    <div className="text-sm text-slate-500">📍 {profile?.localisation}</div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Documents */}
                        <Link href="/dashboard/profile/rag?tab=docs" className="block">
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
                                <div className="flex flex-wrap gap-2">
                                    {skills.length > 0 ? skills.map((skill: any, i) => (
                                        <Badge key={i} variant="outline" className="text-xs">
                                            {typeof skill === "string" ? skill : skill.nom}
                                        </Badge>
                                    )) : (
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
                        {topJobs.length > 0 ? (
                            <div className="space-y-2">
                                {topJobs.slice(0, 5).map((job: any, i) => (
                                    <div key={i} className="p-2 bg-slate-50 rounded text-xs">
                                        <div className="font-medium text-slate-600 truncate">{job.titre_poste || "Poste"}</div>
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

