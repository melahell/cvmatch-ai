
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import Cookies from "js-cookie";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");

    const handleLogin = async () => {
        if (!email || !name) return;
        setLoading(true);

        try {
            // Call API to create/get user
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, name }),
            });

            if (!res.ok) throw new Error("Login failed");

            const data = await res.json();

            // Set Cookie
            Cookies.set("userId", data.userId, { expires: 7 });
            Cookies.set("userName", data.name, { expires: 7 });

            // Check if onboarding needed
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
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Bienvenue sur CVMatch AI</CardTitle>
                    <CardDescription>Entrez vos infos pour accéder à votre espace candidat</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Prénom</Label>
                        <Input
                            id="name"
                            placeholder="Ex: Gilles"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="gilles@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <Button
                        className="w-full mt-4"
                        onClick={handleLogin}
                        disabled={loading || !email || !name}
                    >
                        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Continuer"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
