"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Download, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DemoCoverLetter, CoverLetterTone } from "@/lib/data/demo/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CoverLettersListProps {
    letters: DemoCoverLetter[];
}

const TONE_LABELS: Record<CoverLetterTone, { label: string; color: "neutral" | "primary" | "success" }> = {
    formal: { label: "Formel", color: "neutral" },
    professional_warm: { label: "Pro Chaleureux", color: "primary" },
    creative: { label: "Créatif", color: "success" },
};

export function CoverLettersList({ letters }: CoverLettersListProps) {
    const [expandedLetter, setExpandedLetter] = useState<number | null>(1);
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const copyToClipboard = async (content: string, rank: number) => {
        await navigator.clipboard.writeText(content);
        setCopiedId(rank);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <section className="py-12">
            <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">📧</span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    3 Lettres de Motivation
                </h2>
                <Badge variant="info">Top 3 des postes</Badge>
            </div>

            <div className="space-y-4">
                {letters.map((letter) => {
                    const isExpanded = expandedLetter === letter.jobRank;
                    const toneInfo = TONE_LABELS[letter.tone];

                    return (
                        <div
                            key={letter.jobRank}
                            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden"
                        >
                            {/* Header */}
                            <button
                                onClick={() => setExpandedLetter(isExpanded ? null : letter.jobRank)}
                                className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
                            >
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white">
                                        Lettre #{letter.jobRank} : {letter.jobTitle}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <Badge variant={toneInfo.color}>{toneInfo.label}</Badge>
                                        <span className="text-sm text-slate-500 dark:text-slate-400">
                                            {letter.wordCount} mots
                                        </span>
                                    </div>
                                </div>
                                {isExpanded ? (
                                    <ChevronUp className="h-5 w-5 text-slate-400" />
                                ) : (
                                    <ChevronDown className="h-5 w-5 text-slate-400" />
                                )}
                            </button>

                            {/* Expanded content */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-700">
                                            {/* Letter content */}
                                            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 mb-4 max-h-96 overflow-y-auto">
                                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                                    {letter.content.split('\n\n').map((paragraph, i) => (
                                                        <p key={i} className="mb-3 text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                                            {paragraph}
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Tip */}
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                                💡 Cette lettre utilise un ton <strong>{toneInfo.label.toLowerCase()}</strong> adapté
                                                au contexte du poste
                                            </p>

                                            {/* Actions */}
                                            <div className="flex gap-3">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => copyToClipboard(letter.content, letter.jobRank)}
                                                >
                                                    {copiedId === letter.jobRank ? (
                                                        <>
                                                            <Check className="mr-2 h-4 w-4 text-green-500" />
                                                            Copié !
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="mr-2 h-4 w-4" />
                                                            Copier le texte
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
