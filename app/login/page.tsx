
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase";
import { Loader2, ArrowRight, Sparkles, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator"; // Assuming you have or will mock this
import Cookies from "js-cookie";
import { motion } from "framer-motion";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");

    const handleGoogleLogin = async () => {
        setLoading(true);

        try {
            const supabase = createSupabaseClient();
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    // Dynamic redirect based on current origin
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (err: any) {
            console.error("Login Error:", err);
            alert(`Erreur de configuration ou de connexion: ${err.message}. \n\nSi l'erreur persiste sur Vercel, vérifiez que NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont bien définis dans les Settings.`);
            setLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !name) return;
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, name }),
            });

            if (!res.ok) throw new Error("Login failed");

            const data = await res.json();
            Cookies.set("userId", data.userId, { expires: 7 });
            Cookies.set("userName", data.name, { expires: 7 });

            if (!data.onboarding_completed) {
                router.push("/onboarding");
            } else {
                router.push("/dashboard");
            }
        } catch (error) {
            console.error(error);
            alert("Erreur de connexion");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex w-full">

            {/* LEFT COLUMN: Visual */}
            <div className="hidden lg:flex w-1/2 bg-slate-900 relative items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-900 opacity-50" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

                <div className="relative z-10 max-w-lg">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
                            Transformez votre carrière avec l'IA.
                        </h1>
                        <p className="text-slate-300 text-lg leading-relaxed mb-8">
                            Rejoignez les candidats qui utilisent CVMatch AI pour décrocher plus d'entretiens en moins de temps.
                        </p>

                        <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="w-10 h-10 rounded-full bg-green-400 flex items-center justify-center font-bold text-slate-900">M</div>
                                <div>
                                    <div className="text-white font-medium">Marc Dupont</div>
                                    <div className="text-xs text-blue-200">Product Manager</div>
                                </div>
                            </div>
                            <p className="text-slate-200 italic text-sm">
                                "J'ai obtenu 3 entretiens en une semaine grâce à l'analyse de match précise. Incroyable."
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* RIGHT COLUMN: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md space-y-6">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 text-blue-600 mb-4">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900">Bienvenue</h2>
                        <p className="text-slate-500 mt-2">Connectez-vous pour accéder à votre dashboard</p>
                    </div>

                    <Button
                        onClick={handleGoogleLogin}
                        className="w-full h-12 text-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all hover:scale-[1.02] flex items-center justify-center gap-3"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continuer avec Google
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-slate-500">Ou par email</span>
                        </div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Prénom</Label>
                            <Input
                                id="name"
                                placeholder="Gilles"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-10 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="nom@entreprise.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-10 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-10 text-sm bg-slate-900 hover:bg-slate-800 transition-all hover:scale-[1.02]"
                            disabled={loading || !email || !name}
                        >
                            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Connexion classique"}
                        </Button>
                    </form>

                    <p className="text-center text-xs text-slate-400">
                        En continuant, vous acceptez nos CGU et notre politique de confidentialité.
                    </p>
                </div>
            </div>

        </div>
    );
}
