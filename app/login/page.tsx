
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, Github, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Cookies from "js-cookie";
import { motion } from "framer-motion";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");

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
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 text-blue-600 mb-4">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900">Bienvenue</h2>
                        <p className="text-slate-500 mt-2">Connectez-vous pour accéder à votre dashboard</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Prénom</Label>
                            <Input
                                id="name"
                                placeholder="Gilles"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-12 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Professionnel</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="nom@entreprise.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-12 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-lg bg-slate-900 hover:bg-slate-800 transition-all hover:scale-[1.02]"
                            disabled={loading || !email || !name}
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Continuer"}
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
