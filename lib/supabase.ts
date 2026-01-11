
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient, User } from "@supabase/supabase-js";

// Singleton instance to prevent multiple GoTrueClient warnings
let supabaseInstance: SupabaseClient | null = null;

const getSupabasePublicEnv = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error("Supabase Configuration Missing: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is undefined.");
    }

    return { supabaseUrl, supabaseKey };
};

export const getBearerToken = (request: Request): string | null => {
    const header = request.headers.get("authorization") ?? request.headers.get("Authorization");
    if (!header) return null;

    const [scheme, token] = header.split(" ");
    if (scheme?.toLowerCase() !== "bearer" || !token) return null;
    return token;
};

export const createSupabaseUserClient = (accessToken: string): SupabaseClient => {
    const { supabaseUrl, supabaseKey } = getSupabasePublicEnv();

    return createClient(supabaseUrl, supabaseKey, {
        global: {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
        auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false,
        },
    });
};

type RequireSupabaseUserResult =
    | { user: User; token: string; error: null }
    | { user: null; token: null; error: "Non autorisé" };

export const requireSupabaseUser = async (request: Request): Promise<RequireSupabaseUserResult> => {
    const token = getBearerToken(request);
    if (!token) {
        return { user: null, token: null, error: "Non autorisé" };
    }

    const supabase = createSupabaseUserClient(token);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
        return { user: null, token: null, error: "Non autorisé" };
    }

    return { user, token, error: null };
};

export const getSupabaseAuthHeader = async (): Promise<Record<string, string>> => {
    if (typeof window === "undefined") return {};

    const supabase = createSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return {};

    return {
        Authorization: `Bearer ${session.access_token}`,
    };
};

/**
 * Returns a singleton Supabase client instance
 * This prevents "Multiple GoTrueClient instances" warnings in browser console
 */
export const createSupabaseClient = (): SupabaseClient => {
    // Return existing instance if already created
    if (supabaseInstance) {
        return supabaseInstance;
    }

    const { supabaseUrl, supabaseKey } = getSupabasePublicEnv();

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

const DEFAULT_SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 365;

export const parseStorageRef = (value: string): { bucket: string; path: string } | null => {
    if (!value) return null;
    if (value.startsWith("http://") || value.startsWith("https://")) {
        return null;
    }

    if (!value.startsWith("storage:")) {
        return { bucket: "documents", path: value };
    }

    const raw = value.slice("storage:".length);
    const firstColon = raw.indexOf(":");

    if (firstColon === -1) {
        return { bucket: "documents", path: raw };
    }

    const bucket = raw.slice(0, firstColon);
    const path = raw.slice(firstColon + 1);
    if (!bucket || !path) {
        return null;
    }

    return { bucket, path };
};

export const createSignedUrl = async (
    supabase: SupabaseClient,
    value: string | null | undefined,
    options?: { bucket?: string; expiresIn?: number }
): Promise<string | null> => {
    if (!value) return null;
    if (value.startsWith("http://") || value.startsWith("https://")) return value;

    const parsed = parseStorageRef(value);
    const bucket = options?.bucket ?? parsed?.bucket ?? "documents";
    const path = parsed?.path ?? value;

    const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, options?.expiresIn ?? DEFAULT_SIGNED_URL_TTL_SECONDS);

    if (error) return null;
    return data?.signedUrl ?? null;
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
