"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, Award } from "lucide-react";
import { DemoCharacterMeta } from "@/lib/data/demo/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CharacterHeaderProps {
    meta: DemoCharacterMeta;
    completenessScore: number;
    generationTimeMs: number;
}

export function CharacterHeader({ meta, completenessScore, generationTimeMs }: CharacterHeaderProps) {
    const scoreColor = completenessScore >= 90
        ? "text-green-600 dark:text-green-400"
        : completenessScore >= 70
            ? "text-amber-600 dark:text-amber-400"
            : "text-slate-600 dark:text-slate-400";

    return (
        <header className="relative">
            {/* Navbar */}
            <div className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link
                        href="/demo"
                        className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Retour à la galerie
                    </Link>
                    <Button asChild size="sm">
                        <Link href="/login">
                            Créer mon profil
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Hero */}
            <div className="bg-gradient-to-b from-purple-50 to-white dark:from-slate-900 dark:to-slate-950 py-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                        {/* Icon */}
                        <div className="flex-shrink-0 w-24 h-24 rounded-2xl bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center text-5xl">
                            {meta.icon}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                                    {meta.name}
                                </h1>
                                <Badge variant="outline">{meta.nationality}</Badge>
                            </div>
                            <p className="text-lg text-slate-600 dark:text-slate-400 mb-2">
                                {meta.title}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-500">
                                {meta.period}
                            </p>
                            {meta.quote && (
                                <blockquote className="mt-4 text-sm italic text-slate-500 dark:text-slate-400 border-l-2 border-purple-300 dark:border-purple-700 pl-3">
                                    "{meta.quote}"
                                </blockquote>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="flex-shrink-0 flex flex-col gap-3 p-4 rounded-xl bg-white dark:bg-slate-800 shadow-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                    <Award className={`h-5 w-5 ${scoreColor}`} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Score profil</p>
                                    <p className={`font-bold ${scoreColor}`}>{completenessScore}/100</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Généré en</p>
                                    <p className="font-bold text-purple-600 dark:text-purple-400">
                                        {(generationTimeMs / 1000).toFixed(1)}s
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile summary */}
            <div className="container mx-auto px-4 -mt-4">
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">📊</span>
                        <h2 className="font-semibold text-slate-900 dark:text-white">
                            Profil Intelligent Généré
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <CheckCircle2 className="h-4 w-4" />
                            Profil complet
                        </div>
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <CheckCircle2 className="h-4 w-4" />
                            3+ expériences
                        </div>
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <CheckCircle2 className="h-4 w-4" />
                            8+ compétences
                        </div>
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <CheckCircle2 className="h-4 w-4" />
                            Soft skills détectés
                        </div>
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <CheckCircle2 className="h-4 w-4" />
                            Prêt pour génération
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
