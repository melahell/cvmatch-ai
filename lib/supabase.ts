
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient, User } from "@supabase/supabase-js";

// Singleton pattern pour éviter instanciations multiples
let supabaseInstance: SupabaseClient | null = null;

// Cache pour clients utilisateur par token (évite recréation pour même token)
const userClientsCache = new Map<string, SupabaseClient>();

const getSupabasePublicEnv = () => {
    const supabaseUrl =
        process.env.NEXT_PUBLIC_SUPABASE_URL ??
        process.env.SUPABASE_URL;
    const supabaseKey =
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
        process.env.SUPABASE_ANON_KEY ??
        process.env.SUPABASE_ANON_PUBLIC_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error(
            "Supabase Configuration Missing: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is undefined."
        );
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

/**
 * Crée un client Supabase pour un utilisateur authentifié
 * Utilise un cache pour réutiliser les clients avec le même token
 * @param accessToken - Token d'accès de l'utilisateur
 * @returns Client Supabase réutilisé ou nouvellement créé
 */
export const createSupabaseUserClient = (accessToken: string): SupabaseClient => {
    // Réutiliser client existant pour ce token
    if (userClientsCache.has(accessToken)) {
        return userClientsCache.get(accessToken)!;
    }

    const { supabaseUrl, supabaseKey } = getSupabasePublicEnv();

    const client = createClient(supabaseUrl, supabaseKey, {
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

    // Mettre en cache pour réutilisation
    userClientsCache.set(accessToken, client);
    return client;
};

type RequireSupabaseUserResult =
    | { user: User; token: string; error: null }
    | { user: null; token: null; error: "Non autorisé" };

export const requireSupabaseUser = async (request: Request): Promise<RequireSupabaseUserResult> => {
    const token = getBearerToken(request);
    if (!token) {
        return { user: null, token: null, error: "Non autorisé" };
    }

    try {
        const supabase = createSupabaseUserClient(token);
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser(token);
        if (error || !user) {
            return { user: null, token: null, error: "Non autorisé" };
        }

        return { user, token, error: null };
    } catch {
        return { user: null, token: null, error: "Non autorisé" };
    }
};

// Cache pour session (évite appels répétés getSession)
let sessionCache: { token: string; expiresAt: number } | null = null;
const SESSION_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Récupère le header d'authentification Supabase
 * Utilise un cache pour éviter appels répétés getSession
 * @returns Headers avec token d'authentification ou objet vide
 */
export const getSupabaseAuthHeader = async (): Promise<Record<string, string>> => {
    if (typeof window === "undefined") return {};

    // Vérifier cache session
    if (sessionCache && sessionCache.expiresAt > Date.now()) {
        return {
            Authorization: `Bearer ${sessionCache.token}`,
        };
    }

    const supabase = createSupabaseClient();
    const {
        data: { session },
    } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
        sessionCache = null;
        return {};
    }

    // Mettre en cache
    sessionCache = {
        token: session.access_token,
        expiresAt: Date.now() + SESSION_CACHE_TTL,
    };

    return {
        Authorization: `Bearer ${session.access_token}`,
    };
};

/**
 * Crée ou réutilise le client Supabase singleton pour le client
 * Pattern singleton pour éviter instanciations multiples
 * @returns Client Supabase réutilisé ou nouvellement créé
 */
export const createSupabaseClient = (): SupabaseClient => {
    if (supabaseInstance) {
        return supabaseInstance;
    }

    const { supabaseUrl, supabaseKey } = getSupabasePublicEnv();
    supabaseInstance = createClient(supabaseUrl, supabaseKey, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            flowType: "pkce",
        },
    });
    return supabaseInstance;
};

export const resetSupabaseInstance = () => {
    supabaseInstance = null;
};

const DEFAULT_SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 365;

const KNOWN_STORAGE_BUCKETS = ["documents", "cvs", "profile-photos"] as const;

const normalizeStoragePath = (path: string) => {
    const trimmed = path.trim();
    return trimmed.startsWith("/") ? trimmed.slice(1) : trimmed;
};

const inferBucketFromPath = (path: string): string | null => {
    const p = normalizeStoragePath(path);
    if (p.startsWith("avatars/")) return "profile-photos";
    if (p.startsWith("photos/")) return "documents";
    if (p.startsWith("profile-photos/")) return "profile-photos";
    if (p.startsWith("documents/")) return "documents";
    if (p.startsWith("cvs/")) return "cvs";
    return null;
};

const stripBucketPrefix = (bucket: string, path: string) => {
    const p = normalizeStoragePath(path);
    const prefix = `${bucket}/`;
    return p.startsWith(prefix) ? p.slice(prefix.length) : p;
};

export const parseStorageRef = (value: string): { bucket: string; path: string } | null => {
    if (!value) return null;
    const input = value.trim();
    if (!input) return null;

    if (input.startsWith("http://") || input.startsWith("https://")) {
        return null;
    }

    for (const bucket of KNOWN_STORAGE_BUCKETS) {
        const prefix = `${bucket}:`;
        if (input.startsWith(prefix)) {
            const path = input.slice(prefix.length);
            if (!path) return null;
            return { bucket, path: stripBucketPrefix(bucket, path) };
        }
    }

    if (!input.startsWith("storage:")) {
        const inferredBucket = inferBucketFromPath(input) ?? "documents";
        return { bucket: inferredBucket, path: stripBucketPrefix(inferredBucket, input) };
    }

    const raw = input.slice("storage:".length);
    const firstColon = raw.indexOf(":");

    if (firstColon === -1) {
        const inferredBucket = inferBucketFromPath(raw) ?? "documents";
        return { bucket: inferredBucket, path: stripBucketPrefix(inferredBucket, raw) };
    }

    const bucket = raw.slice(0, firstColon);
    const path = raw.slice(firstColon + 1);
    if (!bucket || !path) {
        return null;
    }

    return { bucket, path: stripBucketPrefix(bucket, path) };
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

    const supabaseUrl =
        process.env.NEXT_PUBLIC_SUPABASE_URL ??
        process.env.SUPABASE_URL;
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
