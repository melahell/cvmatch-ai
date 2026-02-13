"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
    Upload, FileText, Sparkles, Target, RefreshCw,
    Save, Camera, Download, LogIn, Mail, X, CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

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
    | "exporting-pdf"
    | "exporting-data";

interface ContextualLoaderProps {
    context: LoadingContext;
    userName?: string;
    jobTitle?: string;
    progress?: number;
    currentStep?: number;
    totalSteps?: number;
    currentItem?: string;
    currentItemIndex?: number;
    totalItems?: number;
    timelineStep?: number;
    statusLabel?: string;
    statusHint?: string;
    showTimeEstimate?: boolean;
    estimatedSeconds?: number;
    onCancel?: () => void;
    isOverlay?: boolean; // New: show as overlay instead of full screen
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
    ],
    "generating-rag": [
        "L'IA analyse vos documents...",
        "Construction de votre profil intelligent...",
        "Extraction de vos compétences...",
        "Analyse de vos expériences...",
        "Calcul de votre score de complétude...",
        "Génération de vos suggestions de postes...",
    ],
    "analyzing-job": [
        "Lecture de l'offre d'emploi...",
        "Analyse des compétences requises...",
        "Comparaison avec votre profil...",
        "Calcul du score de match...",
        "Génération des recommandations...",
    ],
    "generating-cv": [
        "Sélection de vos meilleures expériences...",
        "Optimisation pour les ATS...",
        "Adaptation à l'offre...",
        "Génération du CV personnalisé...",
    ],
    "generating-lm": [
        "Analyse du ton de l'entreprise...",
        "Rédaction de votre accroche...",
        "Personnalisation du contenu...",
    ],
    "refreshing-profile": [
        "Synchronisation de vos données...",
        "Recalcul de votre score...",
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
    ],
    "exporting-pdf": [
        "Préparation de la mise en page...",
        "Chargement des polices et images...",
        "Génération du PDF...",
    ],
};

// Fun facts pendant le chargement
const FUN_FACTS = [
    "💡 Les recruteurs passent en moyenne 7 secondes sur un CV",
    "💡 75% des CV sont rejetés par les ATS avant d'être lus",
    "💡 Un CV optimisé augmente vos chances de 40%",
    "💡 Les mots-clés comptent plus que le design pour les ATS",
    "💡 Une photo pro augmente les réponses de 30%",
    "💡 Les chiffres et résultats attirent l'attention des recruteurs",
    "💡 Personnaliser chaque CV triple vos chances d'entretien",
    "💡 La lettre de motivation reste importante pour 60% des recruteurs",
];

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
    "exporting-pdf": "Export PDF",
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
    "exporting-pdf": <Download className="w-8 h-8 text-white" />,
    "exporting-data": <Download className="w-8 h-8 text-white" />,
};

// Temps estimés par contexte (en secondes)
const ESTIMATED_TIMES: Record<LoadingContext, number> = {
    "login": 3,
    "importing-docs": 15,
    "generating-rag": 45,
    "analyzing-job": 20,
    "generating-cv": 15,
    "generating-lm": 15,
    "refreshing-profile": 30,
    "saving-changes": 3,
    "uploading-photo": 5,
    "exporting-data": 5,
    "exporting-pdf": 15,
};

// Étapes par contexte
const CONTEXT_STEPS: Record<LoadingContext, string[]> = {
    "login": ["Authentification", "Chargement"],
    "importing-docs": ["Upload", "Extraction", "Validation"],
    "generating-rag": ["Lecture", "Analyse IA", "Structuration", "Finalisation"],
    "analyzing-job": ["Extraction", "Comparaison", "Score", "Recommandations"],
    "generating-cv": ["Sélection", "Optimisation", "Génération", "PDF"],
    "generating-lm": ["Analyse", "Rédaction", "Finalisation"],
    "refreshing-profile": ["Sync", "Calcul", "Update"],
    "saving-changes": ["Sauvegarde"],
    "uploading-photo": ["Upload", "Traitement"],
    "exporting-data": ["Préparation", "Export"],
    "exporting-pdf": ["Mise en page", "Assets", "PDF"],
};

// Floating particles component
function FloatingParticles() {
    const particles = useMemo(() =>
        Array.from({ length: 20 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 4 + 2,
            duration: Math.random() * 3 + 2,
            delay: Math.random() * 2,
        })), []
    );

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full bg-white/20"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: p.size,
                        height: p.size,
                    }}
                    animate={{
                        y: [0, -30, 0],
                        opacity: [0.2, 0.6, 0.2],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
}

// Circular progress component
function CircularProgress({ progress, size = 120 }: { progress: number; size?: number }) {
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            {/* Background circle */}
            <svg className="absolute" width={size} height={size}>
                <circle
                    className="text-white/20"
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
            </svg>
            {/* Progress circle */}
            <svg className="absolute -rotate-90" width={size} height={size}>
                <motion.circle
                    className="text-white"
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    style={{ strokeDasharray: circumference }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                />
            </svg>
            {/* Percentage text */}
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{Math.round(progress)}%</span>
            </div>
        </div>
    );
}

// Step timeline component
function StepTimeline({ steps, currentStep }: { steps: string[]; currentStep: number }) {
    return (
        <div className="flex items-center justify-center gap-2 mt-4">
            {steps.map((step, i) => (
                <div key={step} className="flex items-center">
                    <div className="flex flex-col items-center">
                        <motion.div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i < currentStep
                                    ? "bg-green-500 text-white"
                                    : i === currentStep
                                        ? "bg-white text-blue-600"
                                        : "bg-white/30 text-white/60"
                                }`}
                            animate={i === currentStep ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ duration: 1, repeat: Infinity }}
                        >
                            {i < currentStep ? <CheckCircle className="w-4 h-4" /> : i + 1}
                        </motion.div>
                        <span className="text-xs text-white/80 mt-1 max-w-[60px] text-center truncate">
                            {step}
                        </span>
                    </div>
                    {i < steps.length - 1 && (
                        <div className={`w-8 h-0.5 mx-1 ${i < currentStep ? "bg-green-500" : "bg-white/30"}`} />
                    )}
                </div>
            ))}
        </div>
    );
}

export function ContextualLoader({
    context,
    userName,
    jobTitle,
    progress: externalProgress,
    currentStep = 0,
    totalSteps,
    currentItem,
    currentItemIndex,
    totalItems,
    timelineStep,
    statusLabel,
    statusHint,
    showTimeEstimate = true,
    estimatedSeconds,
    onCancel,
    isOverlay = true, // Default to overlay mode
}: ContextualLoaderProps) {
    const reduceMotion = useReducedMotion();
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const [currentFactIndex, setCurrentFactIndex] = useState(0);
    const [internalProgress, setInternalProgress] = useState(0);
    const [timeLeft, setTimeLeft] = useState(estimatedSeconds ?? ESTIMATED_TIMES[context]);
    const [isComplete, setIsComplete] = useState(false);

    const messages = LOADING_MESSAGES[context];
    const title = jobTitle || CONTEXT_TITLES[context];
    const icon = CONTEXT_ICONS[context];
    const steps = CONTEXT_STEPS[context];
    const progress = externalProgress ?? internalProgress;

    const calculatedStep =
        typeof timelineStep === "number"
            ? Math.max(0, Math.min(timelineStep, steps.length - 1))
            : Math.min(Math.floor((progress / 100) * steps.length), steps.length - 1);

    // Rotate messages every 3 seconds
    useEffect(() => {
        if (statusLabel) return;
        const interval = setInterval(() => {
            setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [messages.length, statusLabel]);

    // Rotate fun facts every 6 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentFactIndex((prev) => (prev + 1) % FUN_FACTS.length);
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!showTimeEstimate) return;
        if (estimatedSeconds !== undefined) {
            const remaining = Math.max(0, Math.round(estimatedSeconds * (1 - progress / 100)));
            setTimeLeft(remaining);
            return;
        }
        if (externalProgress !== undefined) return;
        if (timeLeft <= 0) return;
        const interval = setInterval(() => {
            setTimeLeft((prev) => Math.max(0, prev - 1));
        }, 1000);
        return () => clearInterval(interval);
    }, [showTimeEstimate, estimatedSeconds, externalProgress, progress, timeLeft]);

    // Simulate progress if not provided externally
    useEffect(() => {
        if (externalProgress !== undefined) return;

        const interval = setInterval(() => {
            setInternalProgress((prev) => {
                if (prev >= 95) return prev;
                return prev + Math.random() * 5;
            });
        }, 800);
        return () => clearInterval(interval);
    }, [externalProgress]);

    // Confetti when complete
    useEffect(() => {
        if (progress >= 100 && !isComplete) {
            setIsComplete(true);
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }, [progress, isComplete]);

    // Personalized message
    const personalizedMessage = statusLabel
        ? (userName ? `${userName}, ${statusLabel.toLowerCase()}` : statusLabel)
        : (userName ? `${userName}, ${messages[currentMessageIndex].toLowerCase()}` : messages[currentMessageIndex]);

    const itemIndex = currentItemIndex ?? (totalSteps ? currentStep : undefined);
    const itemsCount = totalItems ?? totalSteps;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`fixed inset-0 z-50 flex items-center justify-center ${isOverlay ? "backdrop-blur-md bg-black/40" : "bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500"
                    }`}
                role="dialog"
                aria-modal="true"
                aria-label={title}
            >
                {/* Floating particles */}
                {!reduceMotion && <FloatingParticles />}

                {/* Animated gradient background (only in full mode) */}
                {!isOverlay && (
                    <motion.div
                        className="absolute inset-0 opacity-30"
                        animate={{
                            background: [
                                "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)",
                                "radial-gradient(circle at 80% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)",
                                "radial-gradient(circle at 50% 80%, rgba(255,255,255,0.3) 0%, transparent 50%)",
                                "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)",
                            ],
                        }}
                        transition={reduceMotion ? { duration: 0 } : { duration: 8, repeat: Infinity, ease: "linear" }}
                    />
                )}

                {/* Glassmorphism card */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative bg-gradient-to-br from-blue-600/90 via-purple-600/90 to-pink-500/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-lg w-full mx-4 border border-white/20"
                >
                    {/* Cancel button */}
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    )}

                    <div className="text-center">
                        {/* Animated icon with pulse glow */}
                        <div className="relative mx-auto mb-6 w-fit">
                            <motion.div
                                className="absolute inset-0 bg-white/30 rounded-2xl blur-xl"
                                animate={{
                                    scale: [1, 1.3, 1],
                                    opacity: [0.3, 0.6, 0.3],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: reduceMotion ? 0 : Infinity,
                                    ease: "easeInOut",
                                }}
                            />
                            <motion.div
                                className="relative w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30"
                                animate={{
                                    rotate: [0, 5, -5, 0],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: reduceMotion ? 0 : Infinity,
                                    ease: "easeInOut",
                                }}
                            >
                                {icon}
                            </motion.div>
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>

                        {/* Current item being processed */}
                        {currentItem && (
                            <p className="text-white/80 text-sm mb-2">
                                📄 {currentItem}
                            </p>
                        )}

                        {/* Step counter */}
                        {itemsCount !== undefined && itemIndex !== undefined && (
                            <p className="text-white/80 text-sm mb-4">
                                Document {itemIndex + 1}/{itemsCount}
                            </p>
                        )}

                        {/* Rotating message */}
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={currentMessageIndex}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="text-white/90 mb-6 h-6"
                            >
                                {personalizedMessage}
                            </motion.p>
                        </AnimatePresence>

                        {/* Circular progress */}
                        <div className="flex justify-center mb-6">
                            <CircularProgress progress={progress} />
                        </div>

                        {/* Step timeline */}
                        <StepTimeline steps={steps} currentStep={calculatedStep} />

                        {/* Time estimate */}
                        {showTimeEstimate && timeLeft > 0 && (
                            <p className="text-white/60 text-xs mt-4">
                                ⏱ Environ {timeLeft}s restantes
                            </p>
                        )}
                        {showTimeEstimate && timeLeft === 0 && progress < 100 && (
                            <p className="text-white/70 text-xs mt-4">
                                Ça prend un peu plus longtemps que prévu…
                            </p>
                        )}

                        {statusHint && (
                            <p className="text-white/70 text-xs mt-4">
                                {statusHint}
                            </p>
                        )}

                        {/* Fun fact */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentFactIndex}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.5 }}
                                className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10"
                            >
                                <p className="text-sm text-white/80">
                                    {FUN_FACTS[currentFactIndex]}
                                </p>
                            </motion.div>
                        </AnimatePresence>

                        {/* Cancel button */}
                        {onCancel && (
                            <Button
                                variant="ghost"
                                onClick={onCancel}
                                className="mt-6 text-white/60 hover:text-white hover:bg-white/10"
                            >
                                Annuler
                            </Button>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default ContextualLoader;
