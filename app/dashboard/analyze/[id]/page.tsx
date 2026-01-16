"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createSupabaseClient, getSupabaseAuthHeader } from "@/lib/supabase";
import { Loader2, CheckCircle, XCircle, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TemplateSelector } from "@/components/cv/TemplateSelector";
import { useRAGData } from "@/hooks/useRAGData";
import { ContextualLoader } from "@/components/loading/ContextualLoader";
import Cookies from "js-cookie";

export default function MatchResultPage() {
    const { id } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [analysis, setAnalysis] = useState<any>(null);
    const [generatingCV, setGeneratingCV] = useState(false);
    const [templateSelectorOpen, setTemplateSelectorOpen] = useState(false);

    // Get user's photo for template selector
    const userId = Cookies.get("userId") || null;
    const { data: ragData } = useRAGData(userId);

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

    const handleGenerateCV = async (templateId: string, includePhoto: boolean) => {
        setTemplateSelectorOpen(false);
        setGeneratingCV(true);

        try {
            const authHeaders = await getSupabaseAuthHeader();
            const res = await fetch("/api/cv/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json", ...authHeaders },
                body: JSON.stringify({
                    analysisId: id,
                    template: templateId,
                    includePhoto: includePhoto
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

    // Show contextual loader during CV generation
    if (generatingCV) {
        return (
            <ContextualLoader
                context="generating-cv"
                jobTitle={analysis.job_title}
            />
        );
    }

    const score = analysis.match_score;
    const matchColor = score >= 70 ? "text-green-600" : score >= 50 ? "text-yellow-600" : "text-red-600";

    return (
        <DashboardLayout>
            <div className="container mx-auto max-w-4xl py-4 sm:py-6 md:py-10 px-3 sm:px-4">

                {/* HEADER SCORE */}
                <div className="text-center mb-6 sm:mb-8 md:mb-10">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 dark:text-white">
                        Résultat du Match 🎯
                    </h1>
                    <div className={`text-5xl sm:text-6xl font-black my-3 sm:my-4 ${matchColor}`}>
                        {score}%
                    </div>
                    <Badge variant={score >= 70 ? "default" : "outline"} className="text-sm sm:text-base md:text-lg px-3 sm:px-4 py-1">
                        {analysis.match_level}
                    </Badge>
                    {analysis.job_title && (
                        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                            {analysis.job_title} {analysis.company && `chez ${analysis.company}`}
                        </p>
                    )}
                </div>

                <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8 md:mb-10">

                    {/* STRENGTHS */}
                    <Card className="border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800">
                        <CardHeader className="pb-3 sm:pb-6">
                            <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-400 text-base sm:text-lg">
                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> Points Forts
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 sm:space-y-3">
                                {analysis.strengths?.map((s: any, i: number) => (
                                    <li key={i} className="flex justify-between items-start gap-2">
                                        <span className="text-xs sm:text-sm font-medium text-green-900 dark:text-green-300 flex-1">{s.point}</span>
                                        <Badge variant="secondary" className="bg-white dark:bg-green-900 text-green-700 dark:text-green-300 text-xs sm:text-sm flex-shrink-0">{s.match_percent}%</Badge>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* GAPS */}
                    <Card className="border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800">
                        <CardHeader className="pb-3 sm:pb-6">
                            <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-400 text-base sm:text-lg">
                                <XCircle className="w-4 h-4 sm:w-5 sm:h-5" /> Points Manquants
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 sm:space-y-3">
                                {analysis.gaps?.map((g: any, i: number) => (
                                    <li key={i} className="text-xs sm:text-sm text-red-900 dark:text-red-300">
                                        <div className="font-semibold">{g.point}</div>
                                        <div className="text-xs opacity-80 mt-1">💡 {g.suggestion}</div>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* ACTION AREA */}
                <div className="flex flex-col items-center gap-3 sm:gap-4 p-4 sm:p-6 md:p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-2xl border border-blue-100 dark:border-blue-800">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                        Prêt à créer votre CV parfait ?
                    </h3>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 text-center max-w-lg">
                        Choisissez un template et l'IA va optimiser votre CV en mettant en avant vos
                        <span className="text-green-600 font-medium"> points forts</span> et en comblant
                        intelligemment les <span className="text-amber-600 font-medium">écarts</span>.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto mt-2">
                        <Button
                            size="lg"
                            className="h-11 sm:h-12 md:h-14 px-5 sm:px-6 md:px-8 text-sm sm:text-base md:text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl shadow-blue-200 dark:shadow-blue-900/50 flex-1 sm:flex-initial"
                            onClick={() => setTemplateSelectorOpen(true)}
                            disabled={generatingCV}
                        >
                            {generatingCV ? (
                                <>
                                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" /> Génération...
                                </>
                            ) : (
                                <>
                                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Générer mon CV
                                </>
                            )}
                        </Button>
                    </div>
                </div>

            </div>

            {/* Template Selector Modal */}
            <TemplateSelector
                isOpen={templateSelectorOpen}
                onClose={() => setTemplateSelectorOpen(false)}
                onSelect={handleGenerateCV}
                currentPhoto={ragData?.photo_url}
            />
        </DashboardLayout>
    );
}
