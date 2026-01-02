import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase";
import { normalizeRAGData } from "@/lib/utils/normalize-rag";
import { calculateCompletenessWithBreakdown } from "@/lib/utils/completeness";
import { logger } from "@/lib/utils/logger";

interface RAGData {
    // Complete normalized RAG data
    profil?: any;
    experiences?: any[];
    competences?: any;
    formations?: any[];
    langues?: any;
    projets?: any[];

    // Computed fields
    score: number;
    breakdown: any[];
    topJobs: any[];
}

interface UseRAGDataReturn {
    data: RAGData | null;
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage RAG profile data
 * Centralizes the RAG data fetching logic used across multiple pages
 * 
 * @param userId - The authenticated user's ID
 * @returns RAG data with loading/error states and refetch capability
 * 
 * @example
 * ```tsx
 * const { data, loading, error, refetch } = useRAGData(userId);
 * 
 * if (loading) return <LoadingSpinner />;
 * if (error) return <ErrorDisplay error={error} retry={refetch} />;
 * if (!data) return <EmptyState />;
 * 
 * return <div>Score: {data.score}/100</div>;
 * ```
 */
export function useRAGData(userId: string | null): UseRAGDataReturn {
    const [data, setData] = useState<RAGData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchRAGData = async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const supabase = createSupabaseClient();

            const { data: ragData, error: ragError } = await supabase
                .from("rag_metadata")
                .select("completeness_details,top_10_jobs,completeness_score,custom_notes")
                .eq("user_id", userId)
                .single();

            if (ragError) {
                // Not found is not an error for new users
                if (ragError.code === 'PGRST116') {
                    logger.debug('No RAG data found for user (expected for new users)');
                    setData(null);
                    setLoading(false);
                    return;
                }
                throw ragError;
            }

            if (!ragData) {
                setData(null);
                setLoading(false);
                return;
            }

            // Normalize data to handle both flat and nested structures
            const normalized = normalizeRAGData(ragData.completeness_details);

            // Calculate breakdown from normalized data
            const { breakdown } = calculateCompletenessWithBreakdown(normalized);

            // Return COMPLETE normalized data, not just a subset
            setData({
                ...normalized,  // Spread all fields: profil, experiences, competences, formations, langues
                score: ragData.completeness_score || 0,
                breakdown,
                topJobs: ragData.top_10_jobs || [],
            });

            logger.debug('RAG data fetched successfully', {
                score: ragData.completeness_score,
                hasProfile: !!normalized?.profil,
                experiencesCount: normalized?.experiences?.length || 0,
                skillsCount: normalized?.competences?.techniques?.length || 0,
                formationsCount: normalized?.formations?.length || 0,
            });

        } catch (e) {
            const errorObj = e as Error;
            logger.error('Error fetching RAG data:', errorObj);
            setError(errorObj);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRAGData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    return {
        data,
        loading,
        error,
        refetch: fetchRAGData,
    };
}
