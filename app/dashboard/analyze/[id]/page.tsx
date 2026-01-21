"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createSupabaseClient, getSupabaseAuthHeader } from "@/lib/supabase";
import {
    Loader2, CheckCircle, XCircle, FileText, Sparkles,
    AlertCircle, ExternalLink, DollarSign, Target,
    Lightbulb, TrendingUp, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TemplateSelector } from "@/components/cv/TemplateSelector";
import { useRAGData } from "@/hooks/useRAGData";
import { ContextualLoader } from "@/components/loading/ContextualLoader";
import Cookies from "js-cookie";
import { JobAnalysis } from "@/types";

export default function MatchResultPage() {
    const { id } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);
    const [generatingCV, setGeneratingCV] = useState(false);
    const [templateSelectorOpen, setTemplateSelectorOpen] = useState(false);

    // Get user's photo for template selector
    const userId = Cookies.get("userId") || null;
    const { data: ragData } = useRAGData(userId);

    useEffect(() => {
        const supabase = createSupabaseClient();
        async function fetchAnalysis() {
            if (!id) {
                setError("ID d'analyse manquant");
                setLoading(false);
                return;
            }

            try {
                const { data, error: dbError } = await supabase
                    .from("job_analyses")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (dbError) {
                    console.error("Erreur Supabase:", dbError);
                    setError("Impossible de charger l'analyse");
                    setLoading(false);
                    return;
                }

                if (!data) {
                    setError("Analyse introuvable");
                    setLoading(false);
                    return;
                }

                setAnalysis(data as JobAnalysis);
            } catch (err) {
                console.error("Erreur inattendue:", err);
                setError("Une erreur est survenue");
            } finally {
                setLoading(false);
            }
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

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || "Erreur génération");
            }

            const data = await res.json();

            // Redirect to CV Preview
            router.push(`/dashboard/cv/${data.cvId}`);

        } catch (error: any) {
            console.error("Erreur génération CV:", error);
            setError(error.message || "Erreur lors de la génération du CV");
            setGeneratingCV(false);
        }
    };

    const handleRetry = () => {
        setError(null);
        setLoading(true);
        window.location.reload();
    };

    // Loading state
    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex h-[70vh] items-center justify-center">
                    <ContextualLoader context="analyzing-job" />
                </div>
            </DashboardLayout>
        );
    }

    // Error state
    if (error) {
        return (
            <DashboardLayout>
                <div className="container mx-auto max-w-2xl py-10 px-4">
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-5 w-5" />
                        <AlertDescription className="ml-2">
                            <p className="font-semibold mb-2">{error}</p>
                            <p className="text-sm opacity-90 mb-4">
                                Vérifiez votre connexion ou réessayez dans quelques instants.
                            </p>
                            <div className="flex gap-3">
                                <Button onClick={handleRetry} size="sm">
                                    <Loader2 className="w-4 h-4 mr-2" /> Réessayer
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.push('/dashboard/analyze')}
                                >
                                    Retour aux analyses
                                </Button>
                            </div>
                        </AlertDescription>
                    </Alert>
                </div>
            </DashboardLayout>
        );
    }

    if (!analysis) {
        return (
            <DashboardLayout>
                <div className="p-10 text-center">
                    <p className="text-slate-600 dark:text-slate-400">Analyse introuvable</p>
                    <Button
                        variant="outline"
                        onClick={() => router.push('/dashboard/analyze')}
                        className="mt-4"
                    >
                        Retour aux analyses
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

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
    const matchReport = analysis.match_report || {};
    const strengths = matchReport.strengths || [];
    const gaps = matchReport.gaps || [];
    const missingKeywords = matchReport.missing_keywords || [];
    const salaryEstimate = matchReport.salary_estimate;
    const coachingTips = matchReport.coaching_tips;
    const keyInsight = matchReport.key_insight;

    // Format date
    const analysisDate = analysis.created_at
        ? new Date(analysis.created_at).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
        : null;

    // Format salary
    const formatSalary = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <DashboardLayout>
            <div className="container mx-auto max-w-5xl py-4 sm:py-6 md:py-10 px-3 sm:px-4">

                {/* HEADER SCORE */}
                <div className="text-center mb-6 sm:mb-8 md:mb-10">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 dark:text-white">
                        Résultat du Match
                    </h1>

                    {/* Job Info */}
                    {analysis.job_title && (
                        <div className="mb-4">
                            <p className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-200">
                                {analysis.job_title}
                            </p>
                            {analysis.company && (
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    chez {analysis.company}
                                    {analysis.location && ` • ${analysis.location}`}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Score Display with ARIA */}
                    <div
                        className={`text-5xl sm:text-6xl font-black my-3 sm:my-4 ${matchColor}`}
                        role="status"
                        aria-live="polite"
                        aria-label={`Score de correspondance: ${score} pour cent`}
                    >
                        {score}%
                    </div>

                    {/* Badge + Metadata */}
                    <div className="flex flex-col items-center gap-2">
                        <Badge
                            variant={score >= 70 ? "success" : "outline"}
                            className="text-sm sm:text-base md:text-lg px-3 sm:px-4 py-1"
                        >
                            {analysis.match_level}
                        </Badge>

                        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-500">
                            {analysisDate && (
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {analysisDate}
                                </span>
                            )}
                            {analysis.job_url && (
                                <a
                                    href={analysis.job_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                    Voir l'offre
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* KEY INSIGHT */}
                {keyInsight && (
                    <Alert className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800">
                        <Lightbulb className="h-5 w-5 text-blue-600" />
                        <AlertDescription className="ml-2 text-blue-900 dark:text-blue-300">
                            <span className="font-semibold">Insight clé :</span> {keyInsight}
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-6">

                    {/* STRENGTHS */}
                    <Card className="border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800">
                        <CardHeader className="pb-3 sm:pb-6">
                            <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-400 text-base sm:text-lg">
                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> Points Forts
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {strengths.length > 0 ? (
                                <ul className="space-y-2 sm:space-y-3">
                                    {strengths.map((s, i) => (
                                        <li key={i} className="flex justify-between items-start gap-2">
                                            <span className="text-xs sm:text-sm font-medium text-green-900 dark:text-green-300 flex-1">
                                                {s.point}
                                            </span>
                                            <Badge variant="success" className="text-xs sm:text-sm flex-shrink-0">
                                                {s.match_percent}%
                                            </Badge>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                                    Aucun point fort identifié
                                </p>
                            )}
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
                            {gaps.length > 0 ? (
                                <ul className="space-y-3">
                                    {gaps.map((g, i) => (
                                        <li key={i} className="text-xs sm:text-sm text-red-900 dark:text-red-300">
                                            <div className="flex items-start gap-2">
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs flex-shrink-0"
                                                >
                                                    {g.severity}
                                                </Badge>
                                                <div className="flex-1">
                                                    <div className="font-semibold">{g.point}</div>
                                                    <div className="text-xs opacity-80 mt-1 flex items-start gap-1">
                                                        <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                                        <span>{g.suggestion}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                                    Aucun point manquant identifié
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* MISSING KEYWORDS ATS */}
                {missingKeywords.length > 0 && (
                    <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 mb-6">
                        <CardHeader className="pb-3 sm:pb-6">
                            <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-400 text-base sm:text-lg">
                                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" /> Mots-clés ATS à intégrer
                            </CardTitle>
                            <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">
                                Ces termes sont recherchés par les systèmes de recrutement automatisés
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {missingKeywords.map((keyword, i) => (
                                    <Badge
                                        key={i}
                                        variant="outline"
                                        className="bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-300 border-amber-300"
                                    >
                                        {keyword}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* SALARY ESTIMATE */}
                {salaryEstimate && (
                    <Card className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-800 mb-6">
                        <CardHeader className="pb-3 sm:pb-6">
                            <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 text-base sm:text-lg">
                                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" /> Estimation Salariale
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Market Range */}
                            <div className="p-4 bg-white dark:bg-slate-800/50 rounded-lg border border-emerald-200 dark:border-emerald-900">
                                <div className="flex items-start justify-between gap-4 mb-2">
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                            Fourchette marché
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-500">
                                            {salaryEstimate.market_range.context}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                                            {formatSalary(salaryEstimate.market_range.min)} - {formatSalary(salaryEstimate.market_range.max)}
                                        </p>
                                        <p className="text-xs text-slate-500">par an</p>
                                    </div>
                                </div>
                            </div>

                            {/* Personalized Range */}
                            <div className="p-4 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-lg border-2 border-emerald-300 dark:border-emerald-700">
                                <div className="flex items-start justify-between gap-4 mb-2">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Target className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                                            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-300">
                                                Pour votre profil
                                            </p>
                                        </div>
                                        <p className="text-xs text-emerald-800 dark:text-emerald-400">
                                            {salaryEstimate.personalized_range.justification}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-black text-emerald-800 dark:text-emerald-300">
                                            {formatSalary(salaryEstimate.personalized_range.min)} - {formatSalary(salaryEstimate.personalized_range.max)}
                                        </p>
                                        <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">par an</p>
                                    </div>
                                </div>
                            </div>

                            {/* Negotiation Tip */}
                            <div className="flex items-start gap-2 p-3 bg-white dark:bg-slate-800/50 rounded border border-emerald-200 dark:border-emerald-900">
                                <TrendingUp className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-300 mb-1">
                                        Conseil de négociation
                                    </p>
                                    <p className="text-xs text-slate-700 dark:text-slate-400">
                                        {salaryEstimate.negotiation_tip}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* COACHING TIPS */}
                {coachingTips && (
                    <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950/30 dark:border-purple-800 mb-6">
                        <CardHeader className="pb-3 sm:pb-6">
                            <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-400 text-base sm:text-lg">
                                <Target className="w-4 h-4 sm:w-5 sm:h-5" /> Conseils de Prospection
                            </CardTitle>
                            <p className="text-xs text-purple-700 dark:text-purple-500 mt-1">
                                Stratégies personnalisées pour maximiser vos chances
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Approach Strategy */}
                            <div>
                                <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-2 flex items-center gap-1">
                                    <span className="w-5 h-5 bg-purple-200 dark:bg-purple-900 rounded-full flex items-center justify-center text-xs font-bold text-purple-800 dark:text-purple-200">1</span>
                                    Comment aborder cette candidature
                                </h4>
                                <p className="text-sm text-slate-700 dark:text-slate-300 pl-6">
                                    {coachingTips.approach_strategy}
                                </p>
                            </div>

                            {/* Key Selling Points */}
                            <div>
                                <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-2 flex items-center gap-1">
                                    <span className="w-5 h-5 bg-purple-200 dark:bg-purple-900 rounded-full flex items-center justify-center text-xs font-bold text-purple-800 dark:text-purple-200">2</span>
                                    Vos arguments clés
                                </h4>
                                <ul className="space-y-1.5 pl-6">
                                    {coachingTips.key_selling_points.map((point, i) => (
                                        <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                                            <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Preparation Checklist */}
                            <div>
                                <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-2 flex items-center gap-1">
                                    <span className="w-5 h-5 bg-purple-200 dark:bg-purple-900 rounded-full flex items-center justify-center text-xs font-bold text-purple-800 dark:text-purple-200">3</span>
                                    Préparation avant candidature
                                </h4>
                                <ul className="space-y-1.5 pl-6">
                                    {coachingTips.preparation_checklist.map((item, i) => (
                                        <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                                            <span className="w-4 h-4 border-2 border-purple-400 rounded flex-shrink-0 mt-0.5" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Interview Focus */}
                            <div>
                                <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-2 flex items-center gap-1">
                                    <span className="w-5 h-5 bg-purple-200 dark:bg-purple-900 rounded-full flex items-center justify-center text-xs font-bold text-purple-800 dark:text-purple-200">4</span>
                                    Focus pour l'entretien
                                </h4>
                                <p className="text-sm text-slate-700 dark:text-slate-300 pl-6">
                                    {coachingTips.interview_focus}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ACTION AREA */}
                <div className="flex flex-col items-center gap-3 sm:gap-4 p-4 sm:p-6 md:p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-2xl border border-blue-100 dark:border-blue-800">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                        Prêt à créer votre CV optimisé ?
                    </h3>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 text-center max-w-lg">
                        L'IA va optimiser votre CV en mettant en avant vos
                        <span className="text-green-600 font-medium"> points forts</span>, en intégrant les
                        <span className="text-amber-600 font-medium"> mots-clés ATS</span>, et en comblant
                        intelligemment les écarts.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto mt-2">
                        <Button
                            size="lg"
                            className="h-11 sm:h-12 md:h-14 px-5 sm:px-6 md:px-8 text-sm sm:text-base md:text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl shadow-blue-200 dark:shadow-blue-900/50"
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
