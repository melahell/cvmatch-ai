"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase";

interface UseAuthOptions {
    redirectTo?: string;
    required?: boolean;
}

export function useAuth(options: UseAuthOptions = {}) {
    const { redirectTo = "/login", required = true } = options;
    const router = useRouter();
    const [userId, setUserId] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>("Candidat");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const run = async () => {
            try {
                const supabase = createSupabaseClient();
                const { data: { session } } = await supabase.auth.getSession();
                const sessionUser = session?.user;

                if (sessionUser) {
                    const nameFromMetadata =
                        (sessionUser.user_metadata?.full_name as string | undefined) ??
                        (sessionUser.user_metadata?.name as string | undefined);

                    setUserId(sessionUser.id);
                    setUserName(nameFromMetadata || "Candidat");
                    setIsLoading(false);
                    return;
                }

                if (required) {
                    router.push(redirectTo);
                    return;
                }

                setUserId(null);
                setUserName("Candidat");
                setIsLoading(false);
            } catch {
                if (required) {
                    router.push(redirectTo);
                    return;
                }
                setUserId(null);
                setUserName("Candidat");
                setIsLoading(false);
            }
        };

        void run();
    }, [router, redirectTo, required]);

    const logout = () => {
        const supabase = createSupabaseClient();
        void supabase.auth.signOut();
        router.push("/login");
    };

    return {
        userId,
        userName,
        isAuthenticated: !!userId,
        isLoading,
        logout
    };
}

export default useAuth;
