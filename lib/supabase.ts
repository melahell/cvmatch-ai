
import { createClient } from "@supabase/supabase-js";

// Fallback keys for Vercel environments where variables might be missing temporarily
const FALLBACK_URL = "https://tyaoacdfxigxffdbhqja.supabase.co";
const FALLBACK_KEY = "sb_publishable_jfSZuKZ5ZzCwdJvNV7nGJQ_t3f79x70";

export const createSupabaseClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error("Supabase Configuration Missing: URL or Key is undefined.");
    }

    return createClient(supabaseUrl, supabaseKey);
};
