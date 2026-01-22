import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase";
import { JobAnalysis } from "@/types";
import { logger } from "@/lib/utils/logger";

export interface CVGeneration {
    id: string;
    created_at: string;
    template_name: string;
    cv_data?: any;
    cv_url?: string;
}

export interface JobAnalysisWithCVs extends JobAnalysis {
    cvs?: CVGeneration[];
    cv_count?: number;
    has_cv?: boolean;
}

interface UseJobAnalysesReturn {
    data: JobAnalysisWithCVs[];
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
    updateStatus: (id: string, status: JobAnalysis["application_status"]) => Promise<void>;
    deleteJob: (id: string) => Promise<void>;
}

/**
 * Custom hook to fetch and manage job analyses
 * Centralizes the job analyses fetching logic used across tracking and analysis pages
 * 
 * @param userId - The authenticated user's ID
 * @returns Job analyses with loading/error states and management functions
 * 
 * @example
 * ```tsx
 * const { data: jobs, loading, error, updateStatus, deleteJob } = useJobAnalyses(userId);
 * 
 * // Update status
 * await updateStatus(jobId, 'applied');
 * 
 * // Delete job
 * await deleteJob(jobId);
 * ```
 */
export function useJobAnalyses(userId: string | null): UseJobAnalysesReturn {
    const [data, setData] = useState<JobAnalysisWithCVs[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchJobAnalyses = async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const supabase = createSupabaseClient();
            
            // Fetch job analyses with associated CVs (LEFT JOIN)
            const { data: jobs, error: fetchError } = await supabase
                .from("job_analyses")
                .select(`
                    *,
                    cv_generations (
                        id,
                        created_at,
                        template_name,
                        cv_data,
                        cv_url
                    )
                `)
                .eq("user_id", userId)
                .order("submitted_at", { ascending: false });

            if (fetchError) {
                throw fetchError;
            }

            // Transform data to include CVs array and metadata
            const enrichedJobs: JobAnalysisWithCVs[] = (jobs || []).map((job: any) => {
                const cvs: CVGeneration[] = (job.cv_generations || []).map((cv: any) => ({
                    id: cv.id,
                    created_at: cv.created_at,
                    template_name: cv.template_name || 'unknown',
                    cv_data: cv.cv_data,
                    cv_url: cv.cv_url,
                })).sort((a: CVGeneration, b: CVGeneration) => 
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );

                return {
                    ...job,
                    cvs,
                    cv_count: cvs.length,
                    has_cv: cvs.length > 0,
                };
            });

            setData(enrichedJobs);
            logger.debug('Job analyses with CVs fetched successfully', { 
                count: enrichedJobs.length,
                totalCVs: enrichedJobs.reduce((sum, j) => sum + (j.cv_count || 0), 0)
            });
        } catch (e) {
            const errorObj = e as Error;
            logger.error('Error fetching job analyses:', errorObj);
            setError(errorObj);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobAnalyses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const updateStatus = async (id: string, newStatus: JobAnalysis["application_status"]) => {
        try {
            if (!userId) {
                throw new Error("User not authenticated");
            }

            // Optimistic update (preserve CVs data)
            setData(prev => prev.map(j => j.id === id ? { ...j, application_status: newStatus } : j));

            const supabase = createSupabaseClient();
            const { error } = await supabase
                .from("job_analyses")
                .update({ application_status: newStatus })
                .eq("id", id)
                .eq("user_id", userId);

            if (error) {
                // Revert on error
                await fetchJobAnalyses();
                throw error;
            }

            logger.debug('Job status updated', { id, newStatus });
        } catch (e) {
            logger.error('Error updating job status:', e);
            throw e;
        }
    };

    const deleteJob = async (id: string) => {
        try {
            if (!userId) {
                throw new Error("User not authenticated");
            }

            // Optimistic update
            setData(prev => prev.filter(j => j.id !== id));

            const supabase = createSupabaseClient();
            const { error } = await supabase
                .from("job_analyses")
                .delete()
                .eq("id", id)
                .eq("user_id", userId);

            if (error) {
                // Revert on error
                await fetchJobAnalyses();
                throw error;
            }

            logger.debug('Job deleted', { id });
        } catch (e) {
            logger.error('Error deleting job:', e);
            throw e;
        }
    };

    return {
        data,
        loading,
        error,
        refetch: fetchJobAnalyses,
        updateStatus,
        deleteJob,
    };
}
