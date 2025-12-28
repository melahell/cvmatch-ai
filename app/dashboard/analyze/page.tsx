
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

import Cookies from "js-cookie";

export default function AnalyzePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<"url" | "text">("url");
    const [url, setUrl] = useState("");
    const [text, setText] = useState("");

    const handleAnalyze = async () => {
        if ((mode === "url" && !url) || (mode === "text" && !text)) return;

        setLoading(true);
        try {
            const res = await fetch("/api/match/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: Cookies.get("userId"),
                    jobUrl: mode === "url" ? url : undefined,
                    jobText: mode === "text" ? text : undefined,
                }),
            });

            if (!res.ok) throw new Error("Analysis failed");

            const data = await res.json();
            console.log("Analysis Result:", data);

            router.push(`/dashboard/analyze/${data.analysis_id}`);

        } catch (error) {
            console.error(error);
            alert("Erreur lors de l'analyse");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto max-w-2xl py-10 px-4">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold mb-2">Nouvelle Analyse 🎯</h1>
                <p className="text-slate-500">
                    Colle l'URL d'une offre ou sa description pour voir si tu matches.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-center mb-6 bg-slate-100 p-1 rounded-lg inline-flex self-center">
                        <button
                            onClick={() => setMode("url")}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === "url" ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-900"
                                }`}
                        >
                            Via URL
                        </button>
                        <button
                            onClick={() => setMode("text")}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === "text" ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-900"
                                }`}
                        >
                            Via Texte
                        </button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">

                    {mode === "url" ? (
                        <div className="space-y-2">
                            <Label htmlFor="url">URL de l'offre (LinkedIn, WelcomeToTheJungle...)</Label>
                            <Input
                                id="url"
                                placeholder="https://..."
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                            />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label htmlFor="text">Description du poste</Label>
                            <Textarea
                                id="text"
                                placeholder="Colle ici tout le texte de l'annonce..."
                                className="min-h-[200px]"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                            />
                        </div>
                    )}

                    <Button
                        className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
                        onClick={handleAnalyze}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyse en cours...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5 mr-2" /> Lancer le Match
                            </>
                        )}
                    </Button>

                </CardContent>
            </Card>

            <div className="mt-8 text-center text-sm text-slate-400">
                <p>L'IA va comparer ton Profil RAG avec les critères de cette offre.</p>
            </div>
        </div>
    );
}
