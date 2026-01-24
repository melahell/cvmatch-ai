/**
 * CV Generation Queue System
 * Utilise BullMQ pour traitement asynchrone des générations CV
 * Alternative: Inngest si pas de Redis disponible
 * 
 * NOTE: BullMQ nécessite Redis. Pour l'instant, structure préparée mais non activée.
 * Pour activer: npm install bullmq ioredis
 */

// import { Queue, Worker, QueueEvents } from "bullmq";
import { logger } from "@/lib/utils/logger";

// Configuration Redis (optionnel - peut utiliser Inngest à la place)
const REDIS_CONFIG = {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD,
};

// Mock Queue pour génération CV (BullMQ non installé)
export const cvGenerationQueue = {
    add: async (name: string, data: any, options?: any) => {
        logger.warn("Queue not active - install bullmq to enable", { name, data, options });
        return { id: options?.jobId || `mock-${Date.now()}` };
    },
    getJob: async (jobId: string) => {
        logger.warn("Queue not active - install bullmq to enable", { jobId });
        return null;
    },
} as any;

// Mock Queue Events pour tracking progress
export const cvGenerationQueueEvents = {
    on: () => {},
    off: () => {},
} as any;

export interface CVGenerationJobData {
    userId: string;
    analysisId: string;
    jobId?: string;
    template?: string;
    options?: {
        minScore?: number;
        maxExperiences?: number;
        maxBulletsPerExperience?: number;
    };
}

/**
 * Enqueue une génération CV
 */
export async function enqueueCVGeneration(
    params: CVGenerationJobData
): Promise<{ jobId: string }> {
    try {
        const job = await cvGenerationQueue.add("generate-cv", params, {
            jobId: params.jobId || `cv-${params.userId}-${Date.now()}`,
        });

        logger.info("CV generation job enqueued", {
            jobId: job.id,
            userId: params.userId,
            analysisId: params.analysisId,
        });

        return { jobId: job.id! };
    } catch (error) {
        logger.error("Error enqueueing CV generation", { error, params });
        throw error;
    }
}

/**
 * Get job status
 */
export async function getJobStatus(jobId: string) {
    try {
        const job = await cvGenerationQueue.getJob(jobId);
        if (!job) {
            return { status: "not_found" };
        }

        const state = await job.getState();
        const progress = job.progress || 0;

        return {
            status: state,
            progress,
            result: job.returnvalue,
            error: job.failedReason,
        };
    } catch (error) {
        logger.error("Error getting job status", { error, jobId });
        return { status: "error", error: String(error) };
    }
}

/**
 * Worker pour traiter les jobs (à démarrer dans un processus séparé)
 * Usage: node workers/cv-generation-worker.ts
 * TODO: Activer quand BullMQ installé
 */
export function createCVGenerationWorker() {
    logger.warn("Worker not active - install bullmq to enable");
    return null;
}
