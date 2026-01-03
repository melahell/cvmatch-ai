"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ExternalLink, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { createSupabaseClient } from "@/lib/supabase";
import { EmptyState } from "@/components/ui/EmptyState";
import { toast } from "sonner";
import Link from "next/link";

interface SavedJob {
    id: string;
    job_url: string;
    job_title?: string;
    company?: string;
    saved_at: string;
    match_score?: number;
}

export default function SavedJobsPage() {
    const { userId } = useAuth();
    const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        const fetchSavedJobs = async () => {
            const supabase = createSupabaseClient();
            const { data, error } = await supabase
                .from("saved_jobs")
                .select("*")
                .eq("user_id", userId)
                .order("saved_at", { ascending: false });

            if (!error && data) {
                setSavedJobs(data);
            }
            setLoading(false);
        };

        fetchSavedJobs();
    }, [userId]);

    const handleUnsave = async (jobId: string) => {
        const supabase = createSupabaseClient();
        const { error } = await supabase
            .from("saved_jobs")
            .delete()
            .eq("id", jobId);

        if (!error) {
            setSavedJobs(prev => prev.filter(j => j.id !== jobId));
            toast.success("Offre retirée");
        }
    };

    if (loading) {
        return <DashboardLayout><div className="p-8">Chargement...</div></DashboardLayout>;
    }

    return (
        <DashboardLayout>
            <div className="container mx-auto py-8 px-4">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Offres sauvegardées</h1>
                        <p className="text-slate-500">Vos offres favorites pour analyse later</p>
                    </div>
                    <Link href="/dashboard/analyze">
                        <Button>Nouvelle Analyse</Button>
                    </Link>
                </div>

                {savedJobs.length === 0 ? (
                    <EmptyState
                        icon={<Star className="w-12 h-12" />}
                        message="Aucune offre sauvegardée"
                        action={
                            <Link href="/dashboard">
                                <Button>Découvrir des offres</Button>
                            </Link>
                        }
                    />
                ) : (
                    <div className="grid gap-4">
                        {savedJobs.map((job) => (
                            <Card key={job.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                <h3 className="font-semibold">{job.job_title || "Offre"}</h3>
                                            </div>
                                            {job.company && (
                                                <p className="text-sm text-slate-500">{job.company}</p>
                                            )}
                                            {job.match_score && (
                                                <p className="text-xs text-slate-400 mt-1">Match: {job.match_score}%</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Link href={`/dashboard/analyze?url=${encodeURIComponent(job.job_url)}`}>
                                                <Button variant="outline" size="sm">
                                                    <ExternalLink className="w-4 h-4 mr-1" />
                                                    Analyser
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleUnsave(job.id)}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
