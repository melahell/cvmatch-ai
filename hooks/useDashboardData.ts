"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { createSupabaseClient } from "@/lib/supabase";
import { logger } from "@/lib/utils/logger";

interface DashboardStats {
    analyses: number;
    cvs: number;
    applied: number;
}

interface UploadedDoc {
    id: string;
    filename: string;
    created_at: string;
    file_type: string;
    storage_path: string;
}

export function useDashboardData(userId: string | null) {
    const [stats, setStats] = useState<DashboardStats>({
        analyses: 0,
        cvs: 0,
        applied: 0
    });
    const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Mémoïser les stats calculées pour éviter recalculs
    const computedStats = useMemo(() => stats, [stats]);

    const fetchDashboardData = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const supabase = createSupabaseClient();

        try {
            // Fetch Stats with error handling
            const { count: appliedCount, error: appliedError } = await supabase
                .from("job_analyses")
                .select("*", { count: "exact", head: true })
                .eq("user_id", userId)
                .neq("application_status", "pending");

            if (appliedError) {
                logger.error('Failed to fetch applied count:', appliedError);
            }

            const { count: analysesCount, error: analysesError } = await supabase
                .from("job_analyses")
                .select("*", { count: "exact", head: true })
                .eq("user_id", userId);

            if (analysesError) {
                logger.error('Failed to fetch analyses count:', analysesError);
            }

            const { count: cvCount, error: cvError } = await supabase
                .from("cv_generations")
                .select("*", { count: "exact", head: true })
                .eq("user_id", userId);

            if (cvError) {
                logger.error('Failed to fetch CV count:', cvError);
            }

            setStats({
                analyses: analysesCount || 0,
                cvs: cvCount || 0,
                applied: appliedCount || 0
            });

            // Fetch Uploaded Documents with error handling
            const { data: docs, error: docsError } = await supabase
                .from("uploaded_documents")
                .select("id, filename, created_at, file_type, storage_path")
                .eq("user_id", userId)
                .order("created_at", { ascending: false })
                .limit(5);

            if (docsError) {
                logger.error('Failed to fetch documents:', docsError);
            } else {
                setUploadedDocs(docs || []);
            }

        } catch (err) {
            logger.error('Dashboard data fetch error:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // Mémoïser les stats pour éviter recalculs
    const memoizedStats = useMemo(() => stats, [stats]);
    const memoizedDocs = useMemo(() => uploadedDocs, [uploadedDocs]);

    return { stats: memoizedStats, uploadedDocs: memoizedDocs, loading, error };
}
