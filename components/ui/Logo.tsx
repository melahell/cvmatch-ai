"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export interface LogoProps {
    /** Taille du logo en pixels */
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
    /** Afficher le texte "CV Crush" à côté du logo */
    showText?: boolean;
    /** Activer les animations */
    animated?: boolean;
    /** Classes CSS additionnelles */
    className?: string;
    /** Lien de destination (défaut: /dashboard) */
    href?: string;
    /** Désactiver le lien */
    asStatic?: boolean;
}

const SIZE_MAP: Record<string, number> = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
};

/**
 * Logo CV Crush - Composant centralisé
 * Design: Squircle néon avec effet glow rose/violet/indigo
 */
export function Logo({
    size = 'md',
    showText = false,
    animated = false,
    className = '',
    href = '/dashboard',
    asStatic = false,
}: LogoProps) {
    const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size] || 40;

    // Calcul de la taille du texte basée sur la taille du logo
    const textSizeClass = pixelSize >= 56 ? 'text-xl' : pixelSize >= 40 ? 'text-lg' : 'text-base';

    // --- VARIANTS D'ANIMATION ---
    const phoneOutlineVariants = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: {
            pathLength: 1,
            opacity: 1,
            transition: { duration: 1, ease: "easeInOut" as const }
        },
        hover: {
            strokeWidth: 12,
            scale: 1.02,
            filter: "url(#glow-hover)",
            transition: { duration: 0.3 }
        },
        tap: {
            scale: 0.98,
            strokeWidth: 10,
            transition: { duration: 0.1 }
        }
    };

    const phoneFillVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { delay: 0.5, duration: 0.5 }
        },
        hover: {
            fillOpacity: 0.3,
            transition: { duration: 0.3 }
        },
        tap: {
            scale: 0.98,
            transition: { duration: 0.1 }
        }
    };

    const reflectionVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 0.4,
            x: 0,
            transition: { delay: 0.8, duration: 0.6 }
        },
        hover: {
            opacity: 0.6,
            x: 5,
            transition: { duration: 0.3 }
        }
    };

    const textVariants = {
        hidden: { y: 20, opacity: 0, filter: "blur(10px)" },
        visible: (i: number) => ({
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            transition: {
                delay: 0.7 + (i * 0.2),
                duration: 0.6,
                type: "spring" as const,
                stiffness: 100
            }
        }),
        hover: (i: number) => ({
            y: i === 0 ? -4 : 4,
            scale: 1.05,
            textShadow: "0px 0px 8px rgba(236, 72, 153, 0.5)",
            transition: { duration: 0.3 }
        }),
        tap: { scale: 0.95, transition: { duration: 0.1 } }
    };

    const svgVariants = {
        hover: { scale: 1.05, transition: { duration: 0.3 } },
        tap: { scale: 0.95, transition: { duration: 0.1 } }
    };

    const logoContent = (
        <div className={`flex items-center gap-2 ${className}`}>
            <div style={{ width: pixelSize, height: pixelSize }}>
                <motion.svg
                    viewBox="0 0 200 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full drop-shadow-lg cursor-pointer"
                    initial={animated ? "hidden" : "visible"}
                    animate={animated ? "visible" : "visible"}
                    whileHover="hover"
                    whileTap="tap"
                    variants={svgVariants}
                >
                    <defs>
                        {/* Gradient Principal Vibrant */}
                        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="hsl(var(--cv-neon-pink))" />
                            <stop offset="50%" stopColor="hsl(var(--cv-neon-purple))" />
                            <stop offset="100%" stopColor="hsl(var(--cv-neon-indigo))" />
                        </linearGradient>

                        {/* Filtre Glow (Néon) */}
                        <filter id="glow-base" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>

                        {/* Filtre Glow plus intense pour le hover */}
                        <filter id="glow-hover" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* 1. Fond du téléphone (Format Squircle) */}
                    <motion.rect
                        x="30"
                        y="30"
                        width="140"
                        height="140"
                        rx="35"
                        fill="hsl(var(--cv-logo-bg))"
                        fillOpacity="0.8"
                        stroke="none"
                        variants={phoneFillVariants}
                    />

                    {/* 2. Contour Néon */}
                    <motion.rect
                        x="30"
                        y="30"
                        width="140"
                        height="140"
                        rx="35"
                        stroke="url(#logoGradient)"
                        strokeWidth="8"
                        fill="none"
                        variants={phoneOutlineVariants}
                        strokeLinecap="round"
                        filter="url(#glow-base)"
                        style={{ transformOrigin: "center" }}
                    />

                    {/* 3. Reflet "Glass" */}
                    <motion.path
                        d="M35 45 Q 100 65 165 45 L 165 100 Q 100 120 35 100 Z"
                        fill="url(#logoGradient)"
                        fillOpacity="0.1"
                        variants={reflectionVariants}
                        style={{ mixBlendMode: 'overlay' }}
                    />

                    {/* Ligne de reflet intérieur fine */}
                    <motion.rect
                        x="40"
                        y="40"
                        width="120"
                        height="120"
                        rx="28"
                        stroke="white"
                        strokeWidth="2"
                        strokeOpacity="0.1"
                        fill="none"
                    />

                    {/* 4. Barre Speaker */}
                    <motion.rect
                        x="85"
                        y="42"
                        width="30"
                        height="4"
                        rx="2"
                        fill="hsl(var(--cv-text-inverse))"
                        fillOpacity="0.5"
                        variants={phoneFillVariants}
                    />

                    {/* 5. Typographie */}
                    <g style={{ fontFamily: '"Outfit", "Inter", sans-serif' }}>
                        <motion.text
                            x="100"
                            y="110"
                            textAnchor="middle"
                            fill="white"
                            fontSize="58"
                            fontWeight="900"
                            letterSpacing="-3"
                            custom={0}
                            variants={textVariants}
                            style={{ transformOrigin: "center" }}
                        >
                            CV
                        </motion.text>

                        <motion.text
                            x="100"
                            y="140"
                            textAnchor="middle"
                            fill="hsl(var(--cv-logo-text-sub))"
                            fontSize="18"
                            fontWeight="700"
                            letterSpacing="2"
                            custom={1}
                            variants={textVariants}
                            style={{ transformOrigin: "center" }}
                        >
                            CRUSH
                        </motion.text>
                    </g>
                </motion.svg>
            </div>

            {showText && (
                <span className={`font-bold ${textSizeClass} text-slate-900 dark:text-white`}>
                    CV Crush
                </span>
            )}
        </div>
    );

    if (asStatic) {
        return logoContent;
    }

    return (
        <Link href={href} className="flex items-center">
            {logoContent}
        </Link>
    );
}

/**
 * Version simplifiée sans animations pour les cas où framer-motion n'est pas souhaité
 * (ex: favicon, og:image, etc.)
 */
export function LogoStatic({ size = 40, className = '' }: { size?: number; className?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="logoGradientStatic" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--cv-neon-pink))" />
                    <stop offset="50%" stopColor="hsl(var(--cv-neon-purple))" />
                    <stop offset="100%" stopColor="hsl(var(--cv-neon-indigo))" />
                </linearGradient>
                <filter id="glow-static" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            <rect x="30" y="30" width="140" height="140" rx="35" fill="hsl(var(--cv-logo-bg))" fillOpacity="0.8" />
            <rect
                x="30" y="30" width="140" height="140" rx="35"
                stroke="url(#logoGradientStatic)" strokeWidth="8" fill="none"
                filter="url(#glow-static)"
            />
            <rect x="85" y="42" width="30" height="4" rx="2" fill="hsl(var(--cv-text-inverse))" fillOpacity="0.5" />

            <text x="100" y="110" textAnchor="middle" fill="white" fontSize="58" fontWeight="900" letterSpacing="-3">
                CV
            </text>
            <text x="100" y="140" textAnchor="middle" fill="hsl(var(--cv-logo-text-sub))" fontSize="18" fontWeight="700" letterSpacing="2">
                CRUSH
            </text>
        </svg>
    );
}
