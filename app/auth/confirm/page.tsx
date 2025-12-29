
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase";
import Cookies from "js-cookie";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
    const router = useRouter();
    const [status, setStatus] = useState("Authentification en cours...");
    // Force Vercel Redeploy to clear stale route handler

    useEffect(() => {
        const supabase = createSupabaseClient();

        // 1. Handle OAuth Callback
        // Supabase.js automatically parses the URL hash (#access_token) or query (?code)
        // when we subscribe to onAuthStateChange or getSession.
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === "SIGNED_IN" && session) {
                setStatus("Connexion réussie ! Redirection...");

                // 2. Persist User Info in Cookies (matching our app's logic)
                const userId = session.user.id;
                const userName = session.user.user_metadata.full_name || session.user.user_metadata.name || "User";

                Cookies.set("userId", userId, { expires: 7 });
                Cookies.set("userName", userName, { expires: 7 });

                // 3. Redirect to Dashboard
                router.replace("/dashboard");
            } else if (event === "osignout") {
                // Handle odd edge cases
            }
        });

        // Fallback: Check if we already have a session
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (error) {
                console.error("Auth Error:", error);
                // DEBUG MODE: Display error instead of redirecting
                setStatus(`ERREUR: ${error.message || JSON.stringify(error)}`);
            } else if (session) {
                // Handled by onAuthStateChange
            } else {
                // No session found?
                setTimeout(() => {
                    const hash = window.location.hash;
                    if (!Cookies.get("userId")) {
                        if (hash && hash.includes("access_token")) {
                            setStatus(`Token détecté mais session non établie. Hash: ${hash.substring(0, 50)}...`);
                        } else {
                            setStatus("Aucune session trouvée. Veuillez réessayer.");
                        }
                    }
                }, 4000);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [router]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-slate-500 font-medium">{status}</p>
        </div>
    );
}
