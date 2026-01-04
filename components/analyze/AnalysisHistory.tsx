"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createSupabaseClient } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface Analysis {
    id: string;
    job_title: string;
    company: string;
    match_score: number;
    submitted_at: string;
    application_status: string;
}

interface AnalysisHistoryProps {
    userId: string;
}

export function AnalysisHistory({ userId }: AnalysisHistoryProps) {
    const router = useRouter();
    const [analyses, setAnalyses] = useState<Analysis[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchAnalyses();
    }, [userId]);

    const fetchAnalyses = async () => {
        try {
            const supabase = createSupabaseClient();
            const { data, error } = await supabase
                .from('job_analyses')
                .select('id, job_title, company, match_score, submitted_at, application_status')
                .eq('user_id', userId)
                .order('submitted_at', { ascending: false })
                .limit(20);

            if (error) throw error;
            setAnalyses(data || []);
        } catch (error) {
            console.error('Error fetching analyses:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAnalyses = analyses
        .filter(a => {
            if (filter === 'high') return a.match_score >= 80;
            if (filter === 'medium') return a.match_score >= 60 && a.match_score < 80;
            if (filter === 'low') return a.match_score < 60;
            return true;
        })
        .filter(a => {
            if (!search) return true;
            return a.job_title?.toLowerCase().includes(search.toLowerCase()) ||
                a.company?.toLowerCase().includes(search.toLowerCase());
        });

    const formatDate = (date: string) => {
        try {
            return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
        } catch {
            return date;
        }
    };

    const getScoreBadgeVariant = (score: number) => {
        if (score >= 80) return 'default';
        if (score >= 60) return 'secondary';
        return 'outline';
    };

    if (loading) {
        return <div className="text-center py-8 text-slate-500">Chargement...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex gap-2 flex-col sm:flex-row">
                <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher par poste ou entreprise..."
                    className="flex-1"
                />
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full sm:w-[200px] px-3 py-2 border border-slate-300 rounded-md bg-white"
                >
                    <option value="all">Tous les scores</option>
                    <option value="high">Excellents (≥80%)</option>
                    <option value="medium">Bons (60-79%)</option>
                    <option value="low">Faibles (&lt;60%)</option>
                </select>
            </div>

            {filteredAnalyses.length === 0 ? (
                <Card>
                    <CardContent className="p-8 text-center text-slate-500">
                        {search || filter !== 'all'
                            ? "Aucune analyse ne correspond aux filtres"
                            : "Aucune analyse pour le moment"}
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-2">
                    {filteredAnalyses.map(analysis => (
                        <Card key={analysis.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-3">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-sm truncate">{analysis.job_title}</h3>
                                        <p className="text-xs text-slate-500">{analysis.company} · {formatDate(analysis.submitted_at)}</p>
                                    </div>
                                    <Badge variant={getScoreBadgeVariant(analysis.match_score)} className="text-sm font-bold">
                                        {analysis.match_score}%
                                    </Badge>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 px-3"
                                        onClick={() => router.push(`/dashboard/analyze/${analysis.id}`)}
                                    >
                                        Voir
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
