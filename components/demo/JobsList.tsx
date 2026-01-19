"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Briefcase, MapPin, Euro, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DemoJob } from "@/lib/data/demo/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface JobsListProps {
    jobs: DemoJob[];
    onViewLetter?: (jobRank: number) => void;
}

export function JobsList({ jobs, onViewLetter }: JobsListProps) {
    const [expandedJobs, setExpandedJobs] = useState<number[]>([1]); // First job expanded by default
    const [showAllJobs, setShowAllJobs] = useState(false);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setLoaded(true), 300);
        return () => clearTimeout(timer);
    }, []);

    const visibleJobs = showAllJobs ? jobs : jobs.slice(0, 3);

    const toggleJob = (rank: number) => {
        setExpandedJobs((prev) =>
            prev.includes(rank)
                ? prev.filter((r) => r !== rank)
                : [...prev, rank]
        );
    };

    const getMatchColor = (score: number): "success" | "warning" | "neutral" => {
        if (score >= 90) return "success";
        if (score >= 80) return "warning";
        return "neutral";
    };

    const getMatchGradient = (score: number) => {
        if (score >= 90) return "from-green-500 to-emerald-500";
        if (score >= 80) return "from-amber-500 to-orange-500";
        return "from-slate-400 to-slate-500";
    };

    const getRankStyle = (rank: number) => {
        if (rank === 1) return "bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-lg";
        if (rank === 2) return "bg-gradient-to-r from-slate-300 to-slate-400 text-slate-800";
        if (rank === 3) return "bg-gradient-to-r from-amber-600 to-amber-700 text-white";
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300";
    };

    return (
        <section className="py-12">
            <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🎯</span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Top 10 des Opportunités (Marché 2025)
                </h2>
            </div>

            <div className="flex items-center gap-2 mb-6">
                <Badge variant="info" className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Analyse IA
                </Badge>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    10,000+ offres analysées pour ce profil
                </p>
            </div>

            <div className="space-y-4">
                {visibleJobs.map((job, index) => {
                    const isExpanded = expandedJobs.includes(job.rank);

                    return (
                        <motion.div
                            key={job.rank}
                            initial={{ opacity: 0, x: -20 }}
                            animate={loaded ? { opacity: 1, x: 0 } : {}}
                            transition={{ delay: index * 0.1, duration: 0.3 }}
                            className={`rounded-xl border overflow-hidden transition-all duration-300 ${isExpanded
                                    ? "border-indigo-300 dark:border-indigo-600 shadow-lg bg-white dark:bg-slate-800"
                                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300"
                                }`}
                        >
                            {/* Header - always visible */}
                            <button
                                onClick={() => toggleJob(job.rank)}
                                className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <span className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${getRankStyle(job.rank)}`}>
                                        #{job.rank}
                                    </span>
                                    <div>
                                        <h3 className="font-semibold text-slate-900 dark:text-white">
                                            {job.title}
                                            {job.company && (
                                                <span className="text-slate-500 font-normal ml-2">
                                                    — {job.company}
                                                </span>
                                            )}
                                        </h3>
                                        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mt-1">
                                            <span className="flex items-center gap-1">
                                                <Euro className="h-3.5 w-3.5" />
                                                {job.salaryMin.toLocaleString()} - {job.salaryMax.toLocaleString()}€
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Briefcase className="h-3.5 w-3.5" />
                                                {job.contractType}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-3.5 w-3.5" />
                                                {job.location}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    {/* Match score with visual bar */}
                                    <div className="flex items-center gap-2">
                                        <div className="hidden sm:flex flex-col items-end">
                                            <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full bg-gradient-to-r ${getMatchGradient(job.matchScore)} rounded-full transition-all duration-500`}
                                                    style={{ width: `${job.matchScore}%` }}
                                                />
                                            </div>
                                        </div>
                                        <Badge variant={getMatchColor(job.matchScore)} className="min-w-[80px] justify-center">
                                            <TrendingUp className="h-3 w-3 mr-1" />
                                            {job.matchScore}%
                                        </Badge>
                                    </div>
                                    <motion.div
                                        animate={{ rotate: isExpanded ? 180 : 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <ChevronDown className="h-5 w-5 text-slate-400" />
                                    </motion.div>
                                </div>
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
                                            {/* Sectors */}
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {job.sectors.map((sector) => (
                                                    <Badge key={sector} variant="outline">
                                                        {sector}
                                                    </Badge>
                                                ))}
                                            </div>

                                            {/* Why match */}
                                            <div className="mb-4 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-100 dark:border-purple-800">
                                                <p className="text-sm text-purple-800 dark:text-purple-200">
                                                    <strong className="flex items-center gap-1 mb-1">
                                                        <Sparkles className="h-4 w-4" /> Pourquoi ce match :
                                                    </strong>
                                                    {job.whyMatch}
                                                </p>
                                            </div>

                                            {/* Key skills */}
                                            <div className="mb-4">
                                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    🔑 Compétences clés valorisées :
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {job.keySkills.map((skill) => (
                                                        <Badge key={skill} variant="neutral" className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Job description */}
                                            <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                                                    {job.jobDescription}
                                                </p>
                                            </div>

                                            {/* Action buttons */}
                                            {job.rank <= 3 && onViewLetter && (
                                                <Button
                                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                                                    size="sm"
                                                    onClick={() => onViewLetter(job.rank)}
                                                >
                                                    Voir la lettre de motivation
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>

            {/* Show more button */}
            {!showAllJobs && jobs.length > 3 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center mt-6"
                >
                    <Button
                        variant="outline"
                        onClick={() => setShowAllJobs(true)}
                        className="group"
                    >
                        Voir les {jobs.length - 3} autres postes
                        <ChevronDown className="ml-2 h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
                    </Button>
                </motion.div>
            )}

            {showAllJobs && jobs.length > 3 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center mt-6"
                >
                    <Button
                        variant="ghost"
                        onClick={() => setShowAllJobs(false)}
                        size="sm"
                    >
                        Réduire
                        <ChevronUp className="ml-2 h-4 w-4" />
                    </Button>
                </motion.div>
            )}
        </section>
    );
}
