
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

export const createSupabaseAdminClient = () => {
    if (typeof window !== "undefined") {
        throw new Error("createSupabaseAdminClient ne doit pas être appelé côté client");
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
        throw new Error(
            "❌ Supabase Admin Configuration Missing:\n" +
            "NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_KEY (ou SUPABASE_SERVICE_ROLE_KEY) doivent être définies."
        );
    }

    return createClient(supabaseUrl, serviceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false,
        },
    });
};
