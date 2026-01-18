"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle, Zap, Shield, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import { motion } from "framer-motion";
import packageJson from "@/package.json";

export default function LandingPageClient() {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "CV Crush",
        "applicationCategory": "BusinessApplication",
        "description": "Analysez vos chances de recrutement avec l'IA, générez des CVs sur-mesure optimisés pour chaque offre",
        "url": "https://cvcrush.fr",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "EUR"
        },
        "featureList": [
            "Analyse des offres d'emploi avec IA",
            "Génération de CV personnalisés",
            "Score de matching précis",
            "Suivi des candidatures"
        ]
    };

    return (
        <div className="min-h-screen bg-white">
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />

            {/* NAVBAR */}
            <nav className="border-b bg-white/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <Logo size="md" showText href="/" />
                    <div className="flex gap-4">
                        <Link href="/login">
                            <Button variant="ghost">Connexion</Button>
                        </Link>
                        <Link href="/login">
                            <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6">
                                Commencer
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* HERO SECTION */}
            <div className="relative overflow-hidden pt-20 pb-32">

                {/* Abstract Background Shapes */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-tr from-blue-100 to-purple-100 rounded-full blur-3xl opacity-50 -z-10 animate-pulse" />

                <div className="container mx-auto px-6 text-center max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-6 border border-blue-100">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            Nouvelle version v{packageJson.version} disponible
                        </div>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight"
                    >
                        Ne cherchez plus un job.<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                            Matchez avec.
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed"
                    >
                        Utilisez l'IA pour analyser vos chances de réussite, optimiser votre CV pour chaque offre et découvrir des opportunités cachées.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <Link href="/login">
                            <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl shadow-blue-200 bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-transform">
                                Analyser mon profil gratuitement <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                    </motion.div>

                    <div className="mt-16 flex justify-center gap-8 text-sm font-medium text-slate-400 grayscale opacity-70">
                        <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Pas de carte bancaire</div>
                        <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> 100% Sécurisé</div>
                        <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> RAG GitHub Privé</div>
                    </div>
                </div>
            </div>

            {/* FEATURES GRID */}
            <div className="bg-slate-50 py-24">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-8">

                        <CardFeature
                            icon={<Zap className="w-8 h-8 text-yellow-500" />}
                            title="CV Optimisé en 10s"
                            desc="Notre IA réécrit vos expériences pour coller parfaitement aux mots-clés de l'offre."
                        />
                        <CardFeature
                            icon={<Target className="w-8 h-8 text-red-500" />}
                            title="Score de Match Précis"
                            desc="Fini le hasard. Sachez exactement si vous avez vos chances (Score 0-100) avant de postuler."
                        />
                        <CardFeature
                            icon={<Shield className="w-8 h-8 text-green-500" />}
                            title="Données Privées"
                            desc="Vos données JSON sont stockées sur votre propre repo GitHub privé. Vous gardez le contrôle."
                        />

                    </div>
                </div>
            </div>

        </div>
    );
}

function CardFeature({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100"
        >
            <div className="mb-4 bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-slate-500 leading-relaxed">
                {desc}
            </p>
        </motion.div>
    )
}
