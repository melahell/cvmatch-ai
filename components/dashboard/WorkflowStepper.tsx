"use client";

import { useState } from "react";
import { Upload, FileSearch, FileText, ChevronDown, ChevronUp, CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface WorkflowStepperProps {
    ragScore: number | null;
    hasDocuments: boolean;
    hasAnalyses: boolean;
    hasCVs: boolean;
}

interface Step {
    id: number;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
    completed: boolean;
    current: boolean;
}

export function WorkflowStepper({ ragScore, hasDocuments, hasAnalyses, hasCVs }: WorkflowStepperProps) {
    const [isExpanded, setIsExpanded] = useState(() => {
        // Open by default if RAG is empty (score = 0 or null)
        return ragScore === null || ragScore === 0;
    });

    // Determine step states
    const step1Completed = hasDocuments && (ragScore !== null && ragScore > 0);
    const step2Completed = hasAnalyses;
    const step3Completed = hasCVs;

    // Determine current step
    let currentStep = 1;
    if (step1Completed) currentStep = 2;
    if (step1Completed && step2Completed) currentStep = 3;
    if (step1Completed && step2Completed && step3Completed) currentStep = 4; // All done

    const steps: Step[] = [
        {
            id: 1,
            title: "Importer vos documents",
            description: "Uploadez votre CV, export LinkedIn, GitHub, etc.",
            icon: Upload,
            href: "/onboarding",
            completed: step1Completed,
            current: currentStep === 1,
        },
        {
            id: 2,
            title: "Comparer une offre d'emploi",
            description: "Analysez le match entre votre profil et une offre",
            icon: FileSearch,
            href: "/dashboard/analyze",
            completed: step2Completed,
            current: currentStep === 2,
        },
        {
            id: 3,
            title: "Générer le CV parfait",
            description: "Créez un CV optimisé pour chaque candidature",
            icon: FileText,
            href: "/dashboard/tracking",
            completed: step3Completed,
            current: currentStep === 3,
        },
    ];

    // Hide if all steps are completed
    if (currentStep === 4) {
        return null;
    }

    return (
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
            <CardContent className="p-0">
                {/* Header - Always visible */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center justify-between p-4 hover:bg-blue-100/50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                                {currentStep}
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-slate-900">
                                    {steps.find(s => s.current)?.title || "Commencer"}
                                </h3>
                                <p className="text-xs text-slate-600">
                                    {steps.find(s => s.current)?.description || "Suivez les étapes pour commencer"}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-slate-600" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-slate-600" />
                        )}
                    </div>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                    <div className="px-4 pb-4 space-y-4 border-t border-blue-200">
                        {/* Progress bar */}
                        <div className="pt-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-slate-700">Progression</span>
                                <span className="text-xs font-bold text-blue-600">
                                    {steps.filter(s => s.completed).length} / {steps.length}
                                </span>
                            </div>
                            <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                                    style={{ width: `${(steps.filter(s => s.completed).length / steps.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Steps list */}
                        <div className="space-y-3">
                            {steps.map((step, index) => {
                                const Icon = step.icon;
                                const isLast = index === steps.length - 1;

                                return (
                                    <div key={step.id} className="relative">
                                        {/* Connector line */}
                                        {!isLast && (
                                            <div
                                                className={cn(
                                                    "absolute left-5 top-10 w-0.5 h-full",
                                                    step.completed ? "bg-blue-500" : "bg-slate-200"
                                                )}
                                                style={{ height: "calc(100% + 0.75rem)" }}
                                            />
                                        )}

                                        <div className="flex items-start gap-4">
                                            {/* Icon/Status */}
                                            <div className="relative z-10 flex-shrink-0">
                                                {step.completed ? (
                                                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                                                        <CheckCircle2 className="w-6 h-6" />
                                                    </div>
                                                ) : step.current ? (
                                                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white animate-pulse">
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0 pt-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <h4
                                                            className={cn(
                                                                "font-semibold text-sm mb-1",
                                                                step.current
                                                                    ? "text-blue-600"
                                                                    : step.completed
                                                                    ? "text-green-700"
                                                                    : "text-slate-600"
                                                            )}
                                                        >
                                                            {step.title}
                                                        </h4>
                                                        <p className="text-xs text-slate-600 mb-2">
                                                            {step.description}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Action button */}
                                                <Link href={step.href}>
                                                    <Button
                                                        size="sm"
                                                        variant={step.current ? "primary" : "outline"}
                                                        className={cn(
                                                            "w-full sm:w-auto",
                                                            step.current && "bg-blue-600 hover:bg-blue-700"
                                                        )}
                                                    >
                                                        {step.completed ? (
                                                            <>
                                                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                                                Complété
                                                            </>
                                                        ) : step.current ? (
                                                            <>
                                                                Commencer <ArrowRight className="w-4 h-4 ml-2" />
                                                            </>
                                                        ) : (
                                                            <>
                                                                Voir <ArrowRight className="w-4 h-4 ml-2" />
                                                            </>
                                                        )}
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Quick tip */}
                        {currentStep < 4 && (
                            <div className="mt-4 p-3 bg-blue-100 rounded-lg border border-blue-200">
                                <p className="text-xs text-blue-900">
                                    <strong>💡 Astuce :</strong>{" "}
                                    {currentStep === 1
                                        ? "Commencez par importer votre CV pour créer votre profil RAG"
                                        : currentStep === 2
                                        ? "Analysez une offre d'emploi pour voir votre score de match"
                                        : "Générez votre premier CV personnalisé pour cette candidature"}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
