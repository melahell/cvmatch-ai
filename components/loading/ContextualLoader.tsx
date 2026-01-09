"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Upload, FileText, Sparkles, Target, RefreshCw,
    Save, Camera, Download, LogIn, Mail
} from "lucide-react";

export type LoadingContext =
    | "login"
    | "importing-docs"
    | "generating-rag"
    | "analyzing-job"
    | "generating-cv"
    | "generating-lm"
    | "refreshing-profile"
    | "saving-changes"
    | "uploading-photo"
    | "exporting-data";

interface ContextualLoaderProps {
    context: LoadingContext;
    userName?: string;
    jobTitle?: string;
    progress?: number; // 0-100, optional for real progress
}

// Messages par contexte
const LOADING_MESSAGES: Record<LoadingContext, string[]> = {
    "login": [
        "Connexion en cours...",
        "Vérification de votre compte...",
        "Préparation de votre espace...",
    ],
    "importing-docs": [
        "Extraction de vos documents...",
        "Analyse de votre parcours professionnel...",
        "Identification de vos compétences clés...",
        "Structuration de votre profil...",
    ],
    "generating-rag": [
        "L'IA analyse vos documents...",
        "Construction de votre profil intelligent...",
        "Extraction de vos compétences...",
        "Analyse de vos expériences...",
        "Calcul de votre score de complétude...",
        "Génération de vos suggestions de postes...",
        "Finalisation de votre profil...",
    ],
    "analyzing-job": [
        "Lecture de l'offre d'emploi...",
        "Analyse des compétences requises...",
        "Comparaison avec votre profil...",
        "Calcul du score de match...",
        "Identification de vos points forts...",
        "Analyse des écarts...",
        "Génération des recommandations...",
    ],
    "generating-cv": [
        "Sélection de vos meilleures expériences...",
        "Optimisation pour les ATS...",
        "Adaptation du contenu à l'offre...",
        "Mise en avant des mots-clés...",
        "Mise en forme du document...",
        "Génération du CV personnalisé...",
    ],
    "generating-lm": [
        "Analyse du ton de l'entreprise...",
        "Rédaction de votre accroche...",
        "Mise en avant de vos atouts...",
        "Personnalisation du contenu...",
        "Finalisation de la lettre...",
    ],
    "refreshing-profile": [
        "Synchronisation de vos données...",
        "Recalcul de votre score...",
        "Mise à jour de vos opportunités...",
        "Actualisation de votre profil...",
    ],
    "saving-changes": [
        "Sauvegarde en cours...",
        "Mise à jour de votre profil...",
    ],
    "uploading-photo": [
        "Upload de votre photo...",
        "Traitement de l'image...",
    ],
    "exporting-data": [
        "Préparation de vos données...",
        "Génération du fichier...",
        "Finalisation de l'export...",
    ],
};

// Messages personnalisés avec prénom
const getPersonalizedMessage = (context: LoadingContext, name: string): string | null => {
    const messages: Partial<Record<LoadingContext, string[]>> = {
        "generating-rag": [
            `${name}, l'IA construit votre profil...`,
            `On extrait vos points forts, ${name}...`,
        ],
        "analyzing-job": [
            `${name}, on analyse cette opportunité pour vous...`,
            `Calcul de votre compatibilité, ${name}...`,
        ],
        "generating-cv": [
            `${name}, création de votre CV sur-mesure...`,
            `On optimise votre CV, ${name}...`,
        ],
    };

    const contextMessages = messages[context];
    if (!contextMessages) return null;
    return contextMessages[Math.floor(Math.random() * contextMessages.length)];
};

// Tips pendant le chargement
const LOADING_TIPS: Record<LoadingContext, string[]> = {
    "login": [
        "💡 Utilisez Google pour une connexion plus rapide",
    ],
    "importing-docs": [
        "💡 Plus vous fournissez de contexte, meilleur sera votre profil",
        "💡 N'oubliez pas vos certifications et projets personnels",
    ],
    "generating-rag": [
        "💡 Votre profil RAG est unique et basé sur vos documents",
        "💡 Ajoutez plus de documents pour améliorer votre score",
        "💡 Les chiffres et résultats concrets augmentent votre crédibilité",
    ],
    "analyzing-job": [
        "💡 Un bon match commence à partir de 70/100",
        "💡 Même un match à 60% peut mériter une candidature",
        "💡 L'IA identifie aussi les opportunités cachées",
    ],
    "generating-cv": [
        "💡 Votre CV est optimisé pour passer les ATS",
        "💡 Chaque CV est unique et adapté à l'offre",
        "💡 Les mots-clés sont placés stratégiquement",
    ],
    "generating-lm": [
        "💡 Une bonne lettre : 300-400 mots maximum",
        "💡 L'IA adapte le ton selon l'entreprise",
    ],
    "refreshing-profile": [
        "💡 Mettez à jour votre profil régulièrement",
    ],
    "saving-changes": [
        "💡 Vos modifications sont sauvegardées automatiquement",
    ],
    "uploading-photo": [
        "💡 Une photo pro augmente vos chances de 40%",
    ],
    "exporting-data": [
        "💡 Conforme RGPD : vos données vous appartiennent",
    ],
};

// Titres par contexte
const CONTEXT_TITLES: Record<LoadingContext, string> = {
    "login": "Connexion",
    "importing-docs": "Import de vos documents",
    "generating-rag": "Génération de votre profil IA",
    "analyzing-job": "Analyse du match",
    "generating-cv": "Génération de votre CV",
    "generating-lm": "Génération de votre lettre",
    "refreshing-profile": "Mise à jour du profil",
    "saving-changes": "Sauvegarde",
    "uploading-photo": "Upload photo",
    "exporting-data": "Export de vos données",
};

// Icônes par contexte
const CONTEXT_ICONS: Record<LoadingContext, React.ReactNode> = {
    "login": <LogIn className="w-8 h-8 text-white" />,
    "importing-docs": <Upload className="w-8 h-8 text-white" />,
    "generating-rag": <Sparkles className="w-8 h-8 text-white" />,
    "analyzing-job": <Target className="w-8 h-8 text-white" />,
    "generating-cv": <FileText className="w-8 h-8 text-white" />,
    "generating-lm": <Mail className="w-8 h-8 text-white" />,
    "refreshing-profile": <RefreshCw className="w-8 h-8 text-white" />,
    "saving-changes": <Save className="w-8 h-8 text-white" />,
    "uploading-photo": <Camera className="w-8 h-8 text-white" />,
    "exporting-data": <Download className="w-8 h-8 text-white" />,
};

export function ContextualLoader({
    context,
    userName,
    jobTitle,
    progress: externalProgress,
}: ContextualLoaderProps) {
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const [currentTipIndex, setCurrentTipIndex] = useState(0);
    const [internalProgress, setInternalProgress] = useState(0);

    const messages = LOADING_MESSAGES[context];
    const tips = LOADING_TIPS[context];
    const title = jobTitle || CONTEXT_TITLES[context];
    const icon = CONTEXT_ICONS[context];

    // Use external progress if provided, otherwise simulate
    const progress = externalProgress ?? internalProgress;

    // Rotate messages every 3 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [messages.length]);

    // Rotate tips every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTipIndex((prev) => (prev + 1) % tips.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [tips.length]);

    // Simulate progress if not provided externally
    useEffect(() => {
        if (externalProgress !== undefined) return;

        const interval = setInterval(() => {
            setInternalProgress((prev) => {
                if (prev >= 95) return prev;
                return prev + Math.random() * 8;
            });
        }, 600);
        return () => clearInterval(interval);
    }, [externalProgress]);

    // Get current message (personalized if userName provided)
    const currentMessage = userName
        ? (getPersonalizedMessage(context, userName) || messages[currentMessageIndex])
        : messages[currentMessageIndex];

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center z-50">
            <div className="max-w-md w-full px-6 text-center">

                {/* Animated Icon */}
                <motion.div
                    className="mb-8"
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                        {icon}
                    </div>
                </motion.div>

                {/* Title */}
                <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {title}
                </h2>

                {/* Rotating message */}
                <AnimatePresence mode="wait">
                    <motion.p
                        key={currentMessageIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="text-gray-600 mb-8 h-6"
                    >
                        {currentMessage}
                    </motion.p>
                </AnimatePresence>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(progress, 100)}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
                <p className="text-xs text-gray-400 mb-8">{Math.round(progress)}%</p>

                {/* Animated dots */}
                <div className="flex justify-center gap-2 mb-8">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-3 h-3 bg-blue-500 rounded-full"
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.3, 1, 0.3],
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2,
                            }}
                        />
                    ))}
                </div>

                {/* Rotating tips */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentTipIndex}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.5 }}
                        className="bg-blue-50 border border-blue-100 rounded-lg p-4"
                    >
                        <p className="text-sm text-blue-800">
                            {tips[currentTipIndex]}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

export default ContextualLoader;
