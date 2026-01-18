"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Briefcase, MapPin, Euro, Clock } from "lucide-react";
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

    return (
        <section className="py-12">
            <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">🎯</span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Top 10 des Opportunités (Marché 2025)
                </h2>
            </div>

            <p className="text-slate-600 dark:text-slate-400 mb-6">
                L'IA a analysé 10,000+ offres d'emploi pour identifier les postes les plus pertinents
            </p>

            <div className="space-y-4">
                {visibleJobs.map((job) => {
                    const isExpanded = expandedJobs.includes(job.rank);

                    return (
                        <div
                            key={job.rank}
                            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden"
                        >
                            {/* Header - always visible */}
                            <button
                                onClick={() => toggleJob(job.rank)}
                                className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-bold text-sm">
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
                                    <Badge variant={getMatchColor(job.matchScore)}>
                                        {job.matchScore}% Match
                                    </Badge>
                                    {isExpanded ? (
                                        <ChevronUp className="h-5 w-5 text-slate-400" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-slate-400" />
                                    )}
                                </div>
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
                                            {/* Sectors */}
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {job.sectors.map((sector) => (
                                                    <Badge key={sector} variant="outline">
                                                        {sector}
                                                    </Badge>
                                                ))}
                                            </div>

                                            {/* Why match */}
                                            <div className="mb-4 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                                                <p className="text-sm text-purple-800 dark:text-purple-200">
                                                    <strong>💡 Pourquoi ce match :</strong> {job.whyMatch}
                                                </p>
                                            </div>

                                            {/* Key skills */}
                                            <div className="mb-4">
                                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    🔑 Compétences clés valorisées :
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {job.keySkills.map((skill) => (
                                                        <Badge key={skill} variant="neutral">
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Job description */}
                                            <div className="mb-4">
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    {job.jobDescription}
                                                </p>
                                            </div>

                                            {/* Action buttons */}
                                            {job.rank <= 3 && onViewLetter && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => onViewLetter(job.rank)}
                                                >
                                                    Voir la lettre de motivation →
                                                </Button>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

            {/* Show more button */}
            {!showAllJobs && jobs.length > 3 && (
                <div className="text-center mt-6">
                    <Button variant="outline" onClick={() => setShowAllJobs(true)}>
                        Voir les {jobs.length - 3} autres postes
                        <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            )}
        </section>
    );
}
