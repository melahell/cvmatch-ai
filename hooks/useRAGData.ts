import { useEffect, useState, useMemo, useCallback } from "react";
import { createSupabaseClient, getSupabaseAuthHeader } from "@/lib/supabase";
import { normalizeRAGData } from "@/lib/utils/normalize-rag";
import { calculateCompletenessWithBreakdown } from "@/lib/utils/completeness";
import { logger } from "@/lib/utils/logger";
import type { RAGMetadata, Competences } from "@/types/rag";

// useRAGData return type includes all RAG fields
interface RAGData extends RAGMetadata {
    score: number;
    breakdown: any[];
    topJobs: any[];
    photo_url: string | null;
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

    const fetchRAGData = useCallback(async () => {
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

            let photoUrl = (normalized?.profil?.photo_url as string | undefined) || null;
            if (photoUrl) {
                const authHeaders = await getSupabaseAuthHeader();
                const res = await fetch('/api/profile/photo', {
                    method: 'GET',
                    headers: authHeaders,
                    credentials: 'include',
                });
                if (res.ok) {
                    const payload = await res.json();
                    photoUrl = payload?.photo_url ?? null;
                } else {
                    photoUrl = null;
                }
            }

            // Return COMPLETE normalized data, not just a subset
            setData({
                ...(normalized as any),  // Spread all fields: profil, experiences, competences, formations, langues
                score: ragData.completeness_score || 0,
                breakdown,
                topJobs: ragData.top_10_jobs || [],
                photo_url: photoUrl,
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
    }, [userId]);

    useEffect(() => {
        fetchRAGData();
    }, [fetchRAGData]);

    return {
        data,
        loading,
        error,
        refetch: fetchRAGData,
    };
}
