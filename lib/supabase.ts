
import { createClient } from "@supabase/supabase-js";

export const createSupabaseClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error(
            "❌ Supabase Configuration Missing:\n" +
            "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in environment variables.\n" +
            "Check your .env.local file or Vercel environment settings."
        );
    }

    return createClient(supabaseUrl, supabaseKey);
};
