/**
 * Streaming CV Generator - Génération avec Server-Sent Events
 *
 * [AMÉLIORATION P1-3] : Affiche la progression en temps réel
 * au lieu d'une attente bloquante de 15-30s.
 *
 * Étapes streamées:
 * 1. Validation RAG
 * 2. Récupération cache
 * 3. Génération widgets
 * 4. Scoring avancé
 * 5. Conversion bridge
 * 6. Validation grounding
 * 7. Adaptation template
 * 8. Sauvegarde
 */

import { logger } from "@/lib/utils/logger";

// ============================================================================
// TYPES
// ============================================================================

export type StreamEventType =
    | "start"
    | "step_start"
    | "step_progress"
    | "step_complete"
    | "warning"
    | "error"
    | "complete";

export interface StreamEvent {
    type: StreamEventType;
    step?: GenerationStep;
    progress?: number; // 0-100
    message: string;
    data?: any;
    timestamp: string;
}

export type GenerationStep =
    | "init"
    | "validate_rag"
    | "check_cache"
    | "generate_widgets"
    | "advanced_scoring"
    | "bridge_conversion"
    | "grounding_validation"
    | "template_adaptation"
    | "save_cv"
    | "finalize";

export interface StepConfig {
    name: string;
    weight: number; // Poids pour le calcul de progression globale
    description: string;
}

// ============================================================================
// CONFIGURATION DES ÉTAPES
// ============================================================================

export const GENERATION_STEPS: Record<GenerationStep, StepConfig> = {
    init: {
        name: "Initialisation",
        weight: 5,
        description: "Préparation de la génération...",
    },
    validate_rag: {
        name: "Validation profil",
        weight: 5,
        description: "Vérification de votre profil RAG...",
    },
    check_cache: {
        name: "Vérification cache",
        weight: 5,
        description: "Recherche de données en cache...",
    },
    generate_widgets: {
        name: "Génération IA",
        weight: 40,
        description: "L'IA analyse votre profil et génère le contenu optimisé...",
    },
    advanced_scoring: {
        name: "Scoring avancé",
        weight: 10,
        description: "Calcul des scores de pertinence multi-critères...",
    },
    bridge_conversion: {
        name: "Construction CV",
        weight: 10,
        description: "Conversion des widgets en structure CV...",
    },
    grounding_validation: {
        name: "Vérification qualité",
        weight: 10,
        description: "Validation anti-hallucination...",
    },
    template_adaptation: {
        name: "Adaptation template",
        weight: 10,
        description: "Ajustement au format A4...",
    },
    save_cv: {
        name: "Sauvegarde",
        weight: 3,
        description: "Enregistrement du CV...",
    },
    finalize: {
        name: "Finalisation",
        weight: 2,
        description: "Préparation de la réponse...",
    },
};

// ============================================================================
// STREAM CONTROLLER
// ============================================================================

export class CVGenerationStream {
    private encoder: TextEncoder;
    private controller: ReadableStreamDefaultController<Uint8Array> | null = null;
    private stream: ReadableStream<Uint8Array>;
    private currentStep: GenerationStep = "init";
    private stepProgress: Record<GenerationStep, number> = {} as any;
    private startTime: number;
    private isClosed: boolean = false;

    constructor() {
        this.encoder = new TextEncoder();
        this.startTime = Date.now();

        // Initialiser la progression
        for (const step of Object.keys(GENERATION_STEPS) as GenerationStep[]) {
            this.stepProgress[step] = 0;
        }

        // Créer le stream
        this.stream = new ReadableStream<Uint8Array>({
            start: (controller) => {
                this.controller = controller;
            },
            cancel: () => {
                this.isClosed = true;
            },
        });
    }

    getStream(): ReadableStream<Uint8Array> {
        return this.stream;
    }

    private calculateGlobalProgress(): number {
        let totalWeight = 0;
        let weightedProgress = 0;

        for (const step of Object.keys(GENERATION_STEPS) as GenerationStep[]) {
            const config = GENERATION_STEPS[step];
            totalWeight += config.weight;
            weightedProgress += (this.stepProgress[step] / 100) * config.weight;
        }

        return Math.round((weightedProgress / totalWeight) * 100);
    }

    private sendEvent(event: StreamEvent): void {
        if (this.isClosed || !this.controller) return;

        try {
            const data = `data: ${JSON.stringify(event)}\n\n`;
            this.controller.enqueue(this.encoder.encode(data));
        } catch (e) {
            logger.warn("[streaming] Erreur envoi événement", { error: e });
        }
    }

    // ========================================================================
    // API PUBLIQUE
    // ========================================================================

    /**
     * Démarre le stream
     */
    start(): void {
        this.sendEvent({
            type: "start",
            message: "Génération du CV démarrée",
            timestamp: new Date().toISOString(),
            data: {
                steps: Object.entries(GENERATION_STEPS).map(([key, config]) => ({
                    id: key,
                    name: config.name,
                    description: config.description,
                })),
            },
        });
    }

    /**
     * Démarre une étape
     */
    startStep(step: GenerationStep): void {
        this.currentStep = step;
        const config = GENERATION_STEPS[step];

        this.sendEvent({
            type: "step_start",
            step,
            progress: this.calculateGlobalProgress(),
            message: config.description,
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * Met à jour la progression d'une étape
     */
    updateProgress(step: GenerationStep, progress: number, message?: string): void {
        this.stepProgress[step] = Math.min(100, Math.max(0, progress));

        this.sendEvent({
            type: "step_progress",
            step,
            progress: this.calculateGlobalProgress(),
            message: message || GENERATION_STEPS[step].description,
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * Termine une étape
     */
    completeStep(step: GenerationStep, data?: any): void {
        this.stepProgress[step] = 100;

        this.sendEvent({
            type: "step_complete",
            step,
            progress: this.calculateGlobalProgress(),
            message: `${GENERATION_STEPS[step].name} terminé`,
            data,
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * Envoie un warning
     */
    sendWarning(message: string, data?: any): void {
        this.sendEvent({
            type: "warning",
            step: this.currentStep,
            progress: this.calculateGlobalProgress(),
            message,
            data,
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * Envoie une erreur
     */
    sendError(message: string, data?: any): void {
        this.sendEvent({
            type: "error",
            step: this.currentStep,
            progress: this.calculateGlobalProgress(),
            message,
            data,
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * Termine le stream avec succès
     */
    complete(cvData: any, metadata?: any): void {
        const duration = Date.now() - this.startTime;

        this.sendEvent({
            type: "complete",
            progress: 100,
            message: "CV généré avec succès",
            data: {
                cvData,
                metadata,
                duration,
            },
            timestamp: new Date().toISOString(),
        });

        this.close();
    }

    /**
     * Ferme le stream
     */
    close(): void {
        if (this.isClosed || !this.controller) return;

        try {
            this.isClosed = true;
            this.controller.close();
        } catch (e) {
            // Stream peut être déjà fermé
        }
    }
}

// ============================================================================
// RESPONSE HELPER
// ============================================================================

/**
 * Crée une Response SSE pour Next.js
 */
export function createSSEResponse(stream: ReadableStream<Uint8Array>): Response {
    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no", // Désactive le buffering nginx
        },
    });
}

// ============================================================================
// CLIENT-SIDE HOOK
// ============================================================================

/**
 * Hook React pour consommer le stream de génération
 *
 * Usage:
 * ```tsx
 * const { progress, currentStep, events, isComplete, cvData, error } = useCVGenerationStream(url);
 * ```
 */
export const useCVGenerationStreamCode = `
import { useState, useEffect, useCallback } from 'react';

export interface UseStreamResult {
    progress: number;
    currentStep: string | null;
    stepDescription: string;
    events: StreamEvent[];
    isComplete: boolean;
    cvData: any | null;
    error: string | null;
    start: () => void;
    abort: () => void;
}

export function useCVGenerationStream(url: string, options?: RequestInit): UseStreamResult {
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState<string | null>(null);
    const [stepDescription, setStepDescription] = useState('');
    const [events, setEvents] = useState<StreamEvent[]>([]);
    const [isComplete, setIsComplete] = useState(false);
    const [cvData, setCvData] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [abortController, setAbortController] = useState<AbortController | null>(null);

    const start = useCallback(async () => {
        const controller = new AbortController();
        setAbortController(controller);
        setProgress(0);
        setEvents([]);
        setIsComplete(false);
        setCvData(null);
        setError(null);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
            });

            if (!response.ok) {
                throw new Error(\`HTTP \${response.status}\`);
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error('No reader');

            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\\n\\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const json = line.slice(6);
                        try {
                            const event = JSON.parse(json);
                            setEvents(prev => [...prev, event]);
                            setProgress(event.progress || 0);

                            if (event.step) {
                                setCurrentStep(event.step);
                                setStepDescription(event.message || '');
                            }

                            if (event.type === 'complete') {
                                setIsComplete(true);
                                setCvData(event.data?.cvData);
                            }

                            if (event.type === 'error') {
                                setError(event.message);
                            }
                        } catch (e) {
                            console.error('Parse error:', e);
                        }
                    }
                }
            }
        } catch (e: any) {
            if (e.name !== 'AbortError') {
                setError(e.message);
            }
        }
    }, [url, options]);

    const abort = useCallback(() => {
        abortController?.abort();
    }, [abortController]);

    return {
        progress,
        currentStep,
        stepDescription,
        events,
        isComplete,
        cvData,
        error,
        start,
        abort,
    };
}
`;

// ============================================================================
// PROGRESS UI COMPONENT
// ============================================================================

export const CVGenerationProgressComponentCode = `
import React from 'react';
import { useCVGenerationStream } from './useCVGenerationStream';

interface Props {
    url: string;
    onComplete: (cvData: any) => void;
    onError: (error: string) => void;
}

export function CVGenerationProgress({ url, onComplete, onError }: Props) {
    const {
        progress,
        currentStep,
        stepDescription,
        events,
        isComplete,
        cvData,
        error,
        start,
    } = useCVGenerationStream(url);

    React.useEffect(() => {
        start();
    }, []);

    React.useEffect(() => {
        if (isComplete && cvData) {
            onComplete(cvData);
        }
    }, [isComplete, cvData]);

    React.useEffect(() => {
        if (error) {
            onError(error);
        }
    }, [error]);

    return (
        <div className="cv-generation-progress">
            <div className="progress-bar-container">
                <div
                    className="progress-bar"
                    style={{ width: \`\${progress}%\` }}
                />
                <span className="progress-text">{progress}%</span>
            </div>

            <div className="current-step">
                <span className="step-icon">⚡</span>
                <span className="step-description">{stepDescription}</span>
            </div>

            <div className="step-list">
                {events
                    .filter(e => e.type === 'step_complete')
                    .map((e, i) => (
                        <div key={i} className="step-completed">
                            ✓ {e.message}
                        </div>
                    ))
                }
            </div>

            {events
                .filter(e => e.type === 'warning')
                .map((e, i) => (
                    <div key={i} className="warning">
                        ⚠️ {e.message}
                    </div>
                ))
            }
        </div>
    );
}
`;
