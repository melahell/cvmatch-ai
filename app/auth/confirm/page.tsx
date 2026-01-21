
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
    const router = useRouter();
    const [status, setStatus] = useState("Authentification en cours...");
    // Force Vercel Redeploy to clear stale route handler

    useEffect(() => {
        const handleAuth = async () => {
            const supabase = createSupabaseClient();

            try {
                // 1. Try Manual Hash Parsing (Brute Force)
                // This bypasses issues where the SDK might fail to auto-detect the hash
                const hash = window.location.hash;
                if (hash && hash.includes("access_token")) {
                    const params = new URLSearchParams(hash.replace("#", "?")); // treat hash as query params for parsing
                    const access_token = params.get("access_token");
                    const refresh_token = params.get("refresh_token");

                    if (access_token && refresh_token) {
                        const { data, error } = await supabase.auth.setSession({
                            access_token,
                            refresh_token,
                        });

                        if (error) throw error;
                        if (data.session) {
                            finalizeLogin(data.session);
                            return;
                        }
                    }
                }

                // 2. Fallback to standard SDK detection (PKCE code or existing session)
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) throw error;

                if (session) {
                    finalizeLogin(session);
                } else {
                    // 3. Listener for late-arriving events
                    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
                        if (event === "SIGNED_IN" && session) {
                            finalizeLogin(session);
                        }
                    });

                    // Cleanup usage
                    return () => subscription.unsubscribe();
                }

            } catch (error: any) {
                console.error("Auth Fail:", error);
                // In Debug/Dev mode, we might want to show this, but for the user let's try to be helpful
                setStatus(`Erreur d'authentification: ${error.message}`);
                // Optional: redirect to login after delay
                setTimeout(() => router.replace("/login"), 5000);
            }
        };

        const finalizeLogin = (session: any) => {
            setStatus("Succès ! Connexion en cours...");
            router.replace("/dashboard");
        };

        handleAuth();
    }, [router]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-slate-600 font-medium">{status}</p>
        </div>
    );
}
