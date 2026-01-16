"use client";

import { useState, useEffect, useCallback } from "react";
import { createSupabaseClient } from "@/lib/supabase";
import { logger } from "@/lib/utils/logger";
import { z } from "zod";
import { personalInfoSchema, experienceSchema, formationSchema, skillSchema } from "@/lib/validations/profile";

export interface RAGData {
    profil?: any;
    experiences?: any[];
    formations?: any[];
    competences?: {
        techniques?: any[];
        linguistiques?: any[];
        soft_skills?: any[];
    };
    score?: number;
    breakdown?: any[];
}

export function useProfileForm(userId: string | null) {
    const [data, setData] = useState<RAGData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Fetch profile data
    const fetchProfile = useCallback(async () => {
        if (!userId) return;

        setLoading(true);
        const supabase = createSupabaseClient();

        try {
            // Use rag_metadata table (same as useRAGData) instead of rag_synthese
            const { data: ragData, error } = await supabase
                .from("rag_metadata")
                .select("completeness_details, completeness_score")
                .eq("user_id", userId)
                .single();

            if (error) {
                // Not found is not an error for new users
                if (error.code === 'PGRST116') {
                    logger.debug('No RAG data found for user');
                    setData(null);
                    setLoading(false);
                    return;
                }
                throw error;
            }

            // Data is in completeness_details field
            const profileData = ragData?.completeness_details || null;
            setData(profileData ? { ...profileData, score: ragData.completeness_score || 0 } : null);
        } catch (error: any) {
            logger.error("Profile fetch error:", error);
            setErrors({ fetch: error.message });
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    // Validate a single field
    const validateField = (schema: z.ZodSchema, value: any): string | null => {
        try {
            schema.parse(value);
            return null;
        } catch (error) {
            if (error instanceof z.ZodError) {
                return error.errors[0]?.message || "Erreur de validation";
            }
            return "Erreur inconnue";
        }
    };

    // Update profile field with optimistic UI
    const updateField = useCallback(async (path: string, value: any) => {
        setSaving(true);

        // Optimistic update
        setData(prev => {
            if (!prev) return prev;
            const updated = { ...prev };
            const keys = path.split('.');
            let current: any = updated;

            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }

            current[keys[keys.length - 1]] = value;
            return updated;
        });

        try {
            const supabase = createSupabaseClient();
            const { error } = await supabase
                .from("rag_metadata")
                .update({ completeness_details: data })
                .eq("user_id", userId);

            if (error) throw error;

            setErrors(prev => ({ ...prev, [path]: '' }));
        } catch (error: any) {
            logger.error("Profile update error:", error);
            setErrors(prev => ({ ...prev, [path]: error.message }));
            // Revert optimistic update
            await fetchProfile();
        } finally {
            setSaving(false);
        }
    }, [userId, fetchProfile]);

    // Save entire profile
    const saveProfile = useCallback(async (updates: Partial<RAGData>) => {
        if (!userId) return;

        setSaving(true);
        try {
            const supabase = createSupabaseClient();
            const { error } = await supabase
                .from("rag_metadata")
                .update({ completeness_details: { ...data, ...updates } })
                .eq("user_id", userId);

            if (error) throw error;

            await fetchProfile();
            return true;
        } catch (error: any) {
            logger.error("Profile save error:", error);
            setErrors({ save: error.message });
            return false;
        } finally {
            setSaving(false);
        }
    }, [userId, fetchProfile]);

    return {
        data,
        loading,
        saving,
        errors,
        validateField,
        updateField,
        saveProfile,
        refetch: fetchProfile,
    };
}
