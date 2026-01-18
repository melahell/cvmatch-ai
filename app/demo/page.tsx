"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Download, Clock, ChevronDown } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/button";
import { CharacterCard } from "@/components/demo/CharacterCard";
import { getAllCharacterMetas } from "@/lib/data/demo";
import { Footer } from "@/components/layout/Footer";

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

// Catégories disponibles
const CATEGORIES = [
    { id: "all", label: "Tous", icon: "🌍" },
    { id: "science", label: "Sciences", icon: "🔬" },
    { id: "art", label: "Arts", icon: "🎨" },
    { id: "tech", label: "Tech", icon: "💻" },
    { id: "politics", label: "Politique", icon: "👑" },
] as const;

type CategoryFilter = typeof CATEGORIES[number]['id'];

export default function DemoGalleryPage() {
    const characters = getAllCharacterMetas();
    const [activeFilter, setActiveFilter] = useState<CategoryFilter>("all");

    // Filtrage des personnages
    const filteredCharacters = useMemo(() => {
        if (activeFilter === "all") return characters;
        return characters.filter(c => c.categories.includes(activeFilter as any));
    }, [characters, activeFilter]);

    return (
        <>
            {/* Navbar */}
            <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Logo size="sm" href="/" />
                    <nav className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                        >
                            Accueil
                        </Link>
                        <Button asChild size="sm">
                            <Link href="/login">
                                Essayer gratuitement
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative py-24 overflow-hidden">
                {/* Background decorations */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
                </div>

                <div className="container mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 mb-6">
                            <Sparkles className="h-4 w-4" />
                            Démonstration gratuite
                        </span>

                        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
                            🏛️ Le Musée des CVs Impossibles
                        </h1>

                        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
                            Découvrez comment l'IA transforme <strong>10 parcours extraordinaires</strong> en
                            CVs et lettres de motivation prêts pour 2025
                        </p>

                        {/* Stats */}
                        <div className="flex flex-wrap justify-center gap-6 mb-8">
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <Download className="h-5 w-5 text-purple-500" />
                                <span>40 CVs à télécharger</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <Clock className="h-5 w-5 text-cyan-500" />
                                <span>0 inscription requise</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <Sparkles className="h-5 w-5 text-amber-500" />
                                <span>100% gratuit</span>
                            </div>
                        </div>

                        {/* Scroll indicator */}
                        <motion.div
                            animate={{ y: [0, 8, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="inline-flex flex-col items-center gap-1 text-slate-500"
                        >
                            <span className="text-sm">Découvrir les personnages</span>
                            <ChevronDown className="h-5 w-5" />
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Characters Gallery */}
            <section className="py-16 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                            Sélectionnez un personnage
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            Cliquez sur un personnage pour voir son profil complet
                        </p>

                        {/* Category Filters */}
                        <div className="flex flex-wrap justify-center gap-2 mb-8">
                            {CATEGORIES.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setActiveFilter(category.id)}
                                    className={`
                                        inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                                        transition-all duration-200
                                        ${activeFilter === category.id
                                            ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25"
                                            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                                        }
                                    `}
                                >
                                    <span>{category.icon}</span>
                                    <span>{category.label}</span>
                                    {category.id !== "all" && activeFilter === "all" && (
                                        <span className="text-xs opacity-60">
                                            ({characters.filter(c => c.categories.includes(category.id as any)).length})
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Results count */}
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {filteredCharacters.length} personnage{filteredCharacters.length > 1 ? "s" : ""}
                            {activeFilter !== "all" && ` dans "${CATEGORIES.find(c => c.id === activeFilter)?.label}"`}
                        </p>
                    </div>

                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        key={activeFilter} // Re-animate on filter change
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
                    >
                        {filteredCharacters.map((character) => (
                            <motion.div key={character.id} variants={item}>
                                <CharacterCard character={character} />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* How it works */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
                        Comment ça fonctionne ?
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">📊</span>
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Étape 1</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                                L'IA analyse le profil et extrait les compétences
                            </p>
                            <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 font-medium">
                                ⏱️ ~0.8 seconde
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-center"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">📄</span>
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Étape 2</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                                Génère 4 CVs + 3 lettres de motivation
                            </p>
                            <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-2 font-medium">
                                ⏱️ ~2.3 secondes
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-center"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">🎯</span>
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Étape 3</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                                Propose 10 jobs adaptés au marché 2025
                            </p>
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-medium">
                                ⏱️ ~1.5 secondes
                            </p>
                        </motion.div>
                    </div>

                    <p className="text-center text-slate-500 dark:text-slate-400 mt-8">
                        <strong>Total :</strong> moins de 5 secondes pour un profil complet
                    </p>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-purple-600 to-cyan-600">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                        Impressionné par les capacités de l'IA ?
                    </h2>
                    <p className="text-lg text-white/80 mb-8">
                        Créez <strong>VOTRE</strong> profil intelligent en 5 minutes
                    </p>
                    <Button
                        asChild
                        size="lg"
                        variant="secondary"
                        className="bg-white text-purple-700 hover:bg-slate-100"
                    >
                        <Link href="/login">
                            Essayer gratuitement
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                    <p className="text-white/60 text-sm mt-4">
                        💡 Aucune carte bancaire • Accès immédiat
                    </p>
                </div>
            </section>

            <Footer />
        </>
    );
}
