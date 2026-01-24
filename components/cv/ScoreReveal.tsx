"use client";

/**
 * ScoreReveal - Animation de révélation de score
 * Utilise Framer Motion pour animation fluide
 */

import { motion } from "framer-motion";

interface ScoreRevealProps {
    score: number;
    max?: number;
    label?: string;
    className?: string;
}

export function ScoreReveal({
    score,
    max = 100,
    label,
    className = "",
}: ScoreRevealProps) {
    const percentage = Math.min((score / max) * 100, 100);

    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.2,
            }}
            className={className}
        >
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{
                    duration: 1,
                    ease: "easeOut",
                    delay: 0.3,
                }}
                className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            />
            {label && (
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-sm font-semibold text-slate-700 mt-1 block"
                >
                    {label}: {score}/{max}
                </motion.span>
            )}
        </motion.div>
    );
}
