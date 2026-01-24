/**
 * Email Alerts System
 * Envoie des alertes email pour erreurs critiques, performance, qualité
 * Utilise Resend ou SendGrid (configurable)
 */

import { logger } from "@/lib/utils/logger";

export type AlertSeverity = "error" | "warning" | "info";

export interface AlertContext {
    userId?: string;
    endpoint?: string;
    error?: string;
    metadata?: Record<string, any>;
}

/**
 * Envoie une alerte email critique
 * TODO: Implémenter avec Resend ou SendGrid
 */
export async function sendCriticalAlert(
    severity: AlertSeverity,
    message: string,
    context: AlertContext = {}
): Promise<void> {
    try {
        // Pour l'instant, on log seulement
        // TODO: Implémenter envoi email réel avec Resend
        logger.error("Critical Alert", {
            severity,
            message,
            context,
        });

        // TODO: Implémenter envoi email
        // const emailService = getEmailService(); // Resend ou SendGrid
        // await emailService.send({
        //     to: process.env.ADMIN_EMAIL,
        //     subject: `[${severity.toUpperCase()}] CV-Crush Alert`,
        //     body: `${message}\n\nContext: ${JSON.stringify(context, null, 2)}`,
        // });
    } catch (error) {
        logger.error("Error sending critical alert", { error, severity, message });
    }
}

/**
 * Alerte performance (latence > seuil)
 */
export async function sendPerformanceAlert(
    endpoint: string,
    latency: number,
    threshold: number = 5000
): Promise<void> {
    if (latency > threshold) {
        await sendCriticalAlert("warning", `High latency detected: ${endpoint}`, {
            endpoint,
            latency,
            threshold,
        });
    }
}

/**
 * Alerte qualité (score < seuil)
 */
export async function sendQualityAlert(
    score: number,
    threshold: number = 60,
    context?: AlertContext
): Promise<void> {
    if (score < threshold) {
        await sendCriticalAlert("warning", `Low quality score detected`, {
            score,
            threshold,
            ...context,
        });
    }
}

/**
 * Alerte erreur critique
 */
export async function sendErrorAlert(
    error: Error,
    context?: AlertContext
): Promise<void> {
    await sendCriticalAlert("error", error.message, {
        error: error.stack,
        ...context,
    });
}
