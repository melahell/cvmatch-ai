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
                <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Filtrer par score" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous les scores</SelectItem>
                        <SelectItem value="high">Excellents (≥80%)</SelectItem>
                        <SelectItem value="medium">Bons (60-79%)</SelectItem>
                        <SelectItem value="low">Faibles (<60%)</SelectItem>
                    </SelectContent>
                </Select>
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
                <div className="grid gap-3">
                    {filteredAnalyses.map(analysis => (
                        <Card key={analysis.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-lg truncate">{analysis.job_title}</h3>
                                        <p className="text-sm text-slate-500 truncate">{analysis.company}</p>
                                        <p className="text-xs text-slate-400 mt-1">{formatDate(analysis.submitted_at)}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <Badge variant={getScoreBadgeVariant(analysis.match_score)} className="mb-2">
                                            {analysis.match_score}%
                                        </Badge>
                                        <div className="flex gap-2 mt-2">
                                            <Button
                                                size="sm"
                                                onClick={() => router.push(`/dashboard/analyze/${analysis.id}`)}
                                            >
                                                Voir
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
