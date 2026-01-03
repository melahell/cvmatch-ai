"use client";

import { useState, useEffect } from "react";
import { createSupabaseClient } from "@/lib/supabase";

export function useCVManagement(userId: string | null) {
    const [cvs, setCvs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCVs = async () => {
        if (!userId) return;

        setLoading(true);
        try {
            const supabase = createSupabaseClient();
            const { data, error } = await supabase
                .from("cv_generations")
                .select("*, job_analyses(*)")
                .eq("user_id", userId)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setCvs(data || []);
        } catch (error) {
            console.error("Error fetching CVs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCVs();
    }, [userId]);

    const deleteCV = async (cvId: string) => {
        const supabase = createSupabaseClient();
        const { error } = await supabase
            .from("cv_generations")
            .delete()
            .eq("id", cvId);

        if (!error) {
            setCvs(prev => prev.filter(cv => cv.id !== cvId));
        }
        return !error;
    };

    const renameCV = async (cvId: string, newName: string) => {
        const supabase = createSupabaseClient();
        const { error } = await supabase
            .from("cv_generations")
            .update({ custom_name: newName })
            .eq("id", cvId);

        if (!error) {
            fetchCVs();
        }
        return !error;
    };

    return {
        cvs,
        loading,
        refetch: fetchCVs,
        deleteCV,
        renameCV
    };
}
