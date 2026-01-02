
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

// Fallback keys for Vercel environments where variables might be missing temporarily
const FALLBACK_URL = "https://tyaoacdfxigxffdbhqja.supabase.co";
const FALLBACK_KEY = "sb_publishable_jfSZuKZ5ZzCwdJvNV7nGJQ_t3f79x70";

// Singleton instance to prevent multiple GoTrueClient warnings
let supabaseInstance: SupabaseClient | null = null;

/**
 * Returns a singleton Supabase client instance
 * This prevents "Multiple GoTrueClient instances" warnings in browser console
 */
export const createSupabaseClient = (): SupabaseClient => {
    // Return existing instance if already created
    if (supabaseInstance) {
        return supabaseInstance;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error("Supabase Configuration Missing: URL or Key is undefined.");
    }

    // Create and cache the instance
    supabaseInstance = createClient(supabaseUrl, supabaseKey);

    return supabaseInstance;
};

/**
 * Reset the singleton instance (useful for testing or edge cases)
 * Should rarely be needed in production
 */
export const resetSupabaseInstance = () => {
    supabaseInstance = null;
};
