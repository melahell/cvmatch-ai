"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Copy, Check, Mail, FileText, Sparkles, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DemoCoverLetter, CoverLetterTone } from "@/lib/data/demo/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CoverLettersListProps {
    letters: DemoCoverLetter[];
}

const TONE_LABELS: Record<CoverLetterTone, { label: string; color: "neutral" | "primary" | "success"; icon: React.ReactNode; description: string }> = {
    formal: {
        label: "Formel",
        color: "neutral",
        icon: <FileText className="h-3 w-3" />,
        description: "Ton professionnel et respectueux des codes traditionnels"
    },
    professional_warm: {
        label: "Pro Chaleureux",
        color: "primary",
        icon: <Mail className="h-3 w-3" />,
        description: "Équilibre entre professionnalisme et personnalité"
    },
    creative: {
        label: "Créatif",
        color: "success",
        icon: <Sparkles className="h-3 w-3" />,
        description: "Ton original et mémorable pour se démarquer"
    },
};

export function CoverLettersList({ letters }: CoverLettersListProps) {
    const [expandedLetter, setExpandedLetter] = useState<number | null>(1);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setLoaded(true), 500);
        return () => clearTimeout(timer);
    }, []);

    const copyToClipboard = async (content: string, rank: number) => {
        await navigator.clipboard.writeText(content);
        setCopiedId(rank);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const downloadTxt = (content: string, jobTitle: string) => {
        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Lettre_${jobTitle.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <section className="py-12">
            <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">📧</span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    3 Lettres de Motivation
                </h2>
                <Badge variant="info" className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Personnalisées par IA
                </Badge>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                Chaque lettre est adaptée au poste et au ton approprié pour maximiser vos chances
            </p>

            <div className="space-y-4">
                {letters.map((letter, index) => {
                    const isExpanded = expandedLetter === letter.jobRank;
                    const toneInfo = TONE_LABELS[letter.tone];

                    return (
                        <motion.div
                            key={letter.jobRank}
                            initial={{ opacity: 0, y: 20 }}
                            animate={loaded ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: index * 0.15, duration: 0.3 }}
                            className={`rounded-xl border overflow-hidden transition-all duration-300 ${isExpanded
                                    ? "border-indigo-300 dark:border-indigo-600 shadow-lg"
                                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                                } bg-white dark:bg-slate-800`}
                        >
                            {/* Header */}
                            <button
                                onClick={() => setExpandedLetter(isExpanded ? null : letter.jobRank)}
                                className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <span className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${letter.jobRank === 1
                                            ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-white"
                                            : letter.jobRank === 2
                                                ? "bg-gradient-to-r from-slate-300 to-slate-400 text-slate-800"
                                                : "bg-gradient-to-r from-amber-600 to-amber-700 text-white"
                                        }`}>
                                        #{letter.jobRank}
                                    </span>
                                    <div>
                                        <h3 className="font-semibold text-slate-900 dark:text-white">
                                            {letter.jobTitle}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <Badge variant={toneInfo.color} className="flex items-center gap-1">
                                                {toneInfo.icon}
                                                {toneInfo.label}
                                            </Badge>
                                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                                {letter.wordCount} mots
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <motion.div
                                    animate={{ rotate: isExpanded ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <ChevronDown className="h-5 w-5 text-slate-400" />
                                </motion.div>
                            </button>

                            {/* Expanded content */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-700">
                                            {/* Tone explanation */}
                                            <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800">
                                                <p className="text-sm text-indigo-800 dark:text-indigo-200 flex items-center gap-2">
                                                    {toneInfo.icon}
                                                    <span><strong>Ton {toneInfo.label} :</strong> {toneInfo.description}</span>
                                                </p>
                                            </div>

                                            {/* Letter content */}
                                            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 mb-4 max-h-96 overflow-y-auto border border-slate-200 dark:border-slate-700">
                                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                                    {letter.content.split('\n\n').map((paragraph, i) => (
                                                        <p key={i} className="mb-3 text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                                                            {paragraph}
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-wrap gap-3">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => copyToClipboard(letter.content, letter.jobRank)}
                                                    className={copiedId === letter.jobRank ? "border-green-500 text-green-600" : ""}
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
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => downloadTxt(letter.content, letter.jobTitle)}
                                                >
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Télécharger .txt
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>

            {/* Tips */}
            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>💡 Conseil :</strong> Personnalisez toujours la lettre avec des détails spécifiques
                    sur l'entreprise et le poste avant de l'envoyer. Ces modèles sont un excellent point de départ !
                </p>
            </div>
        </section>
    );
}
