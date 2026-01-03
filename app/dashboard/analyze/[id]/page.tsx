
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase";
import { Loader2, CheckCircle, XCircle, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

import Cookies from "js-cookie";

export default function MatchResultPage() {
    const { id } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [analysis, setAnalysis] = useState<any>(null);
    const [generatingCV, setGeneratingCV] = useState(false);

    useEffect(() => {
        const supabase = createSupabaseClient();
        async function fetchAnalysis() {
            if (!id) return;

            const { data, error } = await supabase
                .from("job_analyses")
                .select("*")
                .eq("id", id)
                .single();

            if (data) {
                setAnalysis(data);
            }
            setLoading(false);
        }
        fetchAnalysis();
    }, [id]);

    const handleGenerateCV = async () => {
        setGeneratingCV(true);
        try {
            const res = await fetch("/api/cv/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: Cookies.get("userId"),
                    analysisId: id,
                    template: "standard"
                }),
            });

            if (!res.ok) throw new Error("Erreur génération");

            const data = await res.json();

            // Redirect to CV Preview
            router.push(`/dashboard/cv/${data.cvId}`);

        } catch (error) {
            console.error(error);
            alert("Erreur lors de la génération du CV");
            setGeneratingCV(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!analysis) return <div className="p-10 text-center">Analyse introuvable</div>;

    const score = analysis.match_score;
    const matchColor = score >= 70 ? "text-green-600" : score >= 50 ? "text-yellow-600" : "text-red-600";
    const report = analysis.match_report;

    return (
        <DashboardLayout>
            <div className="container mx-auto max-w-4xl py-4 sm:py-6 md:py-10 px-3 sm:px-4">

                {/* HEADER SCORE */}
                <div className="text-center mb-6 sm:mb-8 md:mb-10">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Résultat du Match 🎯</h1>
                    <div className={`text-5xl sm:text-6xl font-black my-3 sm:my-4 ${matchColor}`}>
                        {score}%
                    </div>
                    <Badge variant={score >= 70 ? "default" : "outline"} className="text-sm sm:text-base md:text-lg px-3 sm:px-4 py-1">
                        {analysis.match_level}
                    </Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8 md:mb-10">

                    {/* STRENGTHS */}
                    <Card className="border-green-200 bg-green-50">
                        <CardHeader className="pb-3 sm:pb-6">
                            <CardTitle className="flex items-center gap-2 text-green-800 text-base sm:text-lg">
                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> Points Forts
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 sm:space-y-3">
                                {analysis.strengths?.map((s: any, i: number) => (
                                    <li key={i} className="flex justify-between items-start gap-2">
                                        <span className="text-xs sm:text-sm font-medium text-green-900 flex-1">{s.point}</span>
                                        <Badge variant="secondary" className="bg-white text-green-700 text-xs sm:text-sm flex-shrink-0">{s.match_percent}%</Badge>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* GAPS */}
                    <Card className="border-red-200 bg-red-50">
                        <CardHeader className="pb-3 sm:pb-6">
                            <CardTitle className="flex items-center gap-2 text-red-800 text-base sm:text-lg">
                                <XCircle className="w-4 h-4 sm:w-5 sm:h-5" /> Points Manquants
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 sm:space-y-3">
                                {analysis.gaps?.map((g: any, i: number) => (
                                    <li key={i} className="text-xs sm:text-sm text-red-900">
                                        <div className="font-semibold">{g.point}</div>
                                        <div className="text-xs opacity-80 mt-1">💡 {g.suggestion}</div>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* ACTION AREA */}
                <div className="flex flex-col items-center gap-3 sm:gap-4 p-4 sm:p-6 md:p-8 bg-blue-50 rounded-2xl border border-blue-100">
                    <h3 className="text-lg sm:text-xl font-bold text-blue-900">
                        Prêt à postuler ?
                    </h3>
                    <p className="text-sm sm:text-base text-blue-700 text-center max-w-lg">
                        L'IA peut maintenant réécrire ton CV pour qu'il mette en avant tes Points Forts et comble (intelligemment) les écarts.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                        <Button
                            size="lg"
                            className="h-11 sm:h-12 md:h-14 px-5 sm:px-6 md:px-8 text-sm sm:text-base md:text-lg bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 flex-1 sm:flex-initial"
                            onClick={handleGenerateCV}
                            disabled={generatingCV}
                        >
                            {generatingCV ? (
                                <>
                                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" /> CV...
                                </>
                            ) : (
                                <>
                                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Générer CV
                                </>
                            )}
                        </Button>
                        <Button
                            size="lg"
                            className="h-11 sm:h-12 md:h-14 px-5 sm:px-6 md:px-8 text-sm sm:text-base md:text-lg bg-purple-600 hover:bg-purple-700 shadow-xl shadow-purple-200 flex-1 sm:flex-initial"
                            onClick={() => alert("Fonctionnalité Lettre de Motivation ajoutée via API (Voir Tracking pour le résultat)")}
                        >
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Générer LM
                        </Button>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
