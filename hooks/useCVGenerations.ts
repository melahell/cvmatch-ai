import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase";
import { logger } from "@/lib/utils/logger";

interface CVGeneration {
    id: string;
    created_at: string;
    cv_data: any;
    job_analysis_id: string;
    job_analyses?: {
        job_title: string;
        company: string;
        job_url: string;
        match_score: number;
        match_report: any;
    }[] | null;
}

interface UseCVGenerationsReturn {
    data: CVGeneration[];
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage CV generations
 * Centralizes the CV generations fetching logic used across CV pages
 * 
 * @param userId - The authenticated user's ID
 * @returns CV generations with loading/error states and refetch capability
 * 
 * @example
 * ```tsx
 * const { data: cvs, loading, error, refetch } = useCVGenerations(userId);
 * 
 * if (loading) return <LoadingSpinner />;
 * if (error) return <ErrorDisplay error={error} />;
 * 
 * return <CVList cvs={cvs} />;
 * ```
 */
export function useCVGenerations(userId: string | null): UseCVGenerationsReturn {
    const [data, setData] = useState<CVGeneration[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchCVs = async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const supabase = createSupabaseClient();
            const { data: cvs, error: fetchError } = await supabase
                .from("cv_generations")
                .select(`
          id,
          created_at,
          cv_data,
          job_analysis_id,
          job_analyses (
            job_title,
            company,
            job_url,
            match_score,
            match_report
          )
        `)
                .eq("user_id", userId)
                .order("created_at", { ascending: false });

            if (fetchError) {
                throw fetchError;
            }

            setData((cvs as CVGeneration[]) || []);
            logger.debug('CV generations fetched successfully', { count: cvs?.length || 0 });
        } catch (e) {
            const errorObj = e as Error;
            logger.error('Error fetching CV generations:', errorObj);
            setError(errorObj);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCVs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    return {
        data,
        loading,
        error,
        refetch: fetchCVs,
    };
}
