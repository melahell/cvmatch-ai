"use client";

import { useState, useEffect } from "react";
import { createSupabaseClient } from "@/lib/supabase";

export function useAnalysisHistory(userId: string | null, limit: number = 50) {
    const [analyses, setAnalyses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const fetchAnalyses = async () => {
            setLoading(true);
            try {
                const supabase = createSupabaseClient();

                // Get total count
                const { count } = await supabase
                    .from("job_analyses")
                    .select("*", { count: 'exact', head: true })
                    .eq("user_id", userId);

                setTotalCount(count || 0);

                // Get paginated data
                const offset = (page - 1) * limit;
                const { data, error } = await supabase
                    .from("job_analyses")
                    .select("*")
                    .eq("user_id", userId)
                    .order("created_at", { ascending: false })
                    .range(offset, offset + limit - 1);

                if (error) throw error;
                setAnalyses(data || []);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalyses();
    }, [userId, page, limit]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
        analyses,
        loading,
        error,
        page,
        setPage,
        totalPages,
        totalCount,
        refetch: () => setPage(page) // Force refetch
    };
}
