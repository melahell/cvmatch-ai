
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Loader2, ExternalLink, Calendar, Briefcase, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Cookies from "js-cookie";

const STATUS_COLORS: any = {
    pending: "bg-slate-100 text-slate-700",
    applied: "bg-blue-100 text-blue-700",
    interviewing: "bg-purple-100 text-purple-700",
    rejected: "bg-red-100 text-red-700",
    offer: "bg-green-100 text-green-700",
};

export default function TrackingPage() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        async function fetchJobs() {
            const userId = Cookies.get("userId");
            if (!userId) return;

            const { data, error } = await supabase
                .from("job_analyses")
                .select("*")
                .eq("user_id", userId)
                .order("submitted_at", { ascending: false });

            if (data) setJobs(data);
            setLoading(false);
        }
        fetchJobs();
    }, []);

    const updateStatus = async (id: string, newStatus: string) => {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Optimistic update
        setJobs(jobs.map(j => j.id === id ? { ...j, application_status: newStatus } : j));

        await supabase
            .from("job_analyses")
            .update({ application_status: newStatus })
            .eq("id", id);
    };

    if (loading) return <div className="flex h-screen justify-center items-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Briefcase className="w-6 h-6" /> Suivi des Candidatures
            </h1>

            <div className="grid gap-4">
                {jobs.map((job) => (
                    <Card key={job.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h2 className="font-bold text-lg">{job.job_title || "Poste Sans Titre"}</h2>
                                    <Badge variant="outline" className={job.match_score >= 70 ? "text-green-600 border-green-200" : "text-yellow-600 border-yellow-200"}>
                                        Match {job.match_score}%
                                    </Badge>
                                </div>
                                <div className="text-sm text-slate-500 mb-2">
                                    {job.company || "Entreprise inconnue"} • {job.location || "Non spécifié"}
                                </div>
                                <div className="text-xs text-slate-400">
                                    Ajouté le {new Date(job.submitted_at).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 items-center">
                                {/* Actions */}
                                <Link href={`/dashboard/analyze/${job.id}`}>
                                    <Button variant="outline" size="sm">Voir Analyse</Button>
                                </Link>

                                {job.cv_generated && (
                                    <Link href={job.cv_url || `/dashboard/cv/${job.id}`}> {/* Fallback if url not saved logic needs fix but id works */}
                                        <Button variant="secondary" size="sm">Voir CV</Button>
                                    </Link>
                                )}

                                {/* Status Dropdown (Simplified as Select) */}
                                <select
                                    className={`text-sm border rounded px-2 py-1 ${STATUS_COLORS[job.application_status || 'pending']}`}
                                    value={job.application_status || 'pending'}
                                    onChange={(e) => updateStatus(job.id, e.target.value)}
                                >
                                    <option value="pending">À faire</option>
                                    <option value="applied">Postulé</option>
                                    <option value="interviewing">Entretien</option>
                                    <option value="rejected">Refusé</option>
                                    <option value="offer">Offre reçue</option>
                                </select>
                            </div>

                        </CardContent>
                    </Card>
                ))}

                {jobs.length === 0 && (
                    <div className="text-center py-20 bg-slate-50 rounded-lg dashed border-2 border-slate-200">
                        <p className="text-slate-500">Aucune candidature suivie pour l'instant.</p>
                        <Link href="/dashboard/analyze">
                            <Button className="mt-4">Analyser une offre</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
