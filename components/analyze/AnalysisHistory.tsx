"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScoreBadge, ScoreIndicator, ScoreLegend } from "@/components/ui/ScoreBadge";
import { createSupabaseClient } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { ExternalLink, Eye, Search, Calendar } from "lucide-react";

interface Analysis {
    id: string;
    job_title: string;
    company: string;
    job_url?: string;
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

    const fetchAnalyses = useCallback(async () => {
        try {
            const supabase = createSupabaseClient();
            const { data, error } = await supabase
                .from('job_analyses')
                .select('id, job_title, company, job_url, match_score, submitted_at, application_status')
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
    }, [userId]);

    useEffect(() => {
        fetchAnalyses();
    }, [fetchAnalyses]);

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

    if (loading) {
        return <div className="text-center py-8 text-slate-600">Chargement...</div>;
    }

    return (
        <div className="space-y-4">
            {/* Score Legend */}
            <Card className="p-3">
                <ScoreLegend />
            </Card>

            {/* Search and Filter */}
            <div className="flex gap-2 flex-col sm:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher par poste ou entreprise..."
                        className="pl-10"
                    />
                </div>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full sm:w-[180px] px-3 py-2 border border-slate-300 rounded-md bg-white text-sm"
                >
                    <option value="all">↕ Score</option>
                    <option value="high">🟢 ≥80%</option>
                    <option value="medium">🟡 60-79%</option>
                    <option value="low">🔴 &lt;60%</option>
                </select>
            </div>

            {/* Analysis List */}
            {filteredAnalyses.length === 0 ? (
                <Card>
                    <CardContent className="p-8 text-center text-slate-600">
                        {search || filter !== 'all'
                            ? "Aucune analyse ne correspond aux filtres"
                            : "Aucune analyse pour le moment"}
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-2">
                    {filteredAnalyses.map(analysis => (
                        <Card key={analysis.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-3 sm:p-4">
                                <div className="flex items-center gap-3 sm:gap-4">
                                    {/* Score Indicator */}
                                    <ScoreIndicator score={analysis.match_score} />

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-sm sm:text-base text-slate-800 truncate">
                                            {analysis.job_title}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-slate-600 flex items-center gap-2 mt-0.5">
                                            {analysis.company && (
                                                <span className="truncate">🏢 {analysis.company}</span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(analysis.submitted_at)}
                                            </span>
                                        </p>
                                    </div>

                                    {/* Score Badge */}
                                    <ScoreBadge score={analysis.match_score} />

                                    {/* Actions */}
                                    <div className="flex items-center gap-1">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => router.push(`/dashboard/analyze/${analysis.id}`)}
                                        >
                                            <Eye className="w-4 h-4 mr-1" /> Détails
                                        </Button>
                                        {analysis.job_url && (
                                            <a
                                                href={analysis.job_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Button variant="ghost" size="sm">
                                                    <ExternalLink className="w-4 h-4" />
                                                </Button>
                                            </a>
                                        )}
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
