"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { DemoCharacterMeta } from "@/lib/data/demo/types";

interface CharacterCardProps {
    character: DemoCharacterMeta;
}

export function CharacterCard({ character }: CharacterCardProps) {
    return (
        <Link href={`/demo/${character.id}`}>
            <motion.div
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="group relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 text-center h-[280px] flex flex-col cursor-pointer transition-shadow hover:shadow-lg hover:shadow-purple-500/10"
            >
                {/* Icon */}
                <div className="text-5xl mb-3">{character.icon}</div>

                {/* Name */}
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">
                    {character.shortName}
                </h3>

                {/* Period */}
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    {character.period}
                </p>

                {/* Title */}
                <p className="text-sm text-slate-600 dark:text-slate-300 flex-1">
                    {character.title}
                </p>

                {/* Nationality badge */}
                <span className="inline-block text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-full mb-4">
                    {character.nationality}
                </span>

                {/* CTA */}
                <div className="flex items-center justify-center gap-1 text-sm font-medium text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                    <span>Voir le profil</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>

                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl ring-1 ring-transparent group-hover:ring-purple-500/20 transition-all pointer-events-none" />
            </motion.div>
        </Link>
    );
}
