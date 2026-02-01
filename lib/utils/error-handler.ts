/**
 * [CDC-18] Utilitaire centralisé pour la gestion des erreurs
 * Évite d'exposer les messages d'erreur bruts aux utilisateurs
 */

export interface SafeError {
    error: string;
    errorCode: string;
    details?: string;
    retry?: boolean;
}

/**
 * Sanitize une erreur pour éviter d'exposer des détails techniques
 * @param error - L'erreur originale
 * @param context - Contexte optionnel (ex: "génération CV", "upload document")
 * @returns Erreur sécurisée pour l'API
 */
export function sanitizeError(error: any, context?: string): SafeError {
    const errorMessage = error?.message || String(error) || "Erreur inconnue";
    
    // Erreurs Gemini/AI
    if (errorMessage.includes("GEMINI") || errorMessage.includes("API") || errorMessage.includes("rate limit")) {
        return {
            error: "Service IA temporairement indisponible",
            errorCode: "AI_SERVICE_ERROR",
            details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
            retry: true
        };
    }
    
    // Erreurs base de données
    if (errorMessage.includes("Database") || errorMessage.includes("Supabase") || errorMessage.includes("duplicate key")) {
        return {
            error: "Erreur de sauvegarde des données",
            errorCode: "DATABASE_ERROR",
            details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
            retry: true
        };
    }
    
    // Erreurs d'extraction PDF
    if (errorMessage.includes("PDF") || errorMessage.includes("extraction") || errorMessage.includes("document")) {
        return {
            error: "Impossible de lire le document",
            errorCode: "DOCUMENT_ERROR",
            details: "Vérifiez que le fichier n'est pas protégé ou corrompu",
            retry: false
        };
    }
    
    // Erreurs réseau
    if (errorMessage.includes("fetch") || errorMessage.includes("network") || errorMessage.includes("timeout")) {
        return {
            error: "Erreur de connexion",
            errorCode: "NETWORK_ERROR",
            retry: true
        };
    }
    
    // Erreurs de validation
    if (errorMessage.includes("validation") || errorMessage.includes("invalid") || errorMessage.includes("required")) {
        return {
            error: "Données invalides",
            errorCode: "VALIDATION_ERROR",
            details: errorMessage,
            retry: false
        };
    }
    
    // Erreur générique
    return {
        error: context ? `Erreur lors de ${context}` : "Une erreur est survenue",
        errorCode: "UNKNOWN_ERROR",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
        retry: true
    };
}

/**
 * Log une erreur de façon sécurisée (sans exposer les secrets)
 */
export function logError(error: any, context?: string): void {
    const safeMessage = error?.message?.replace(/sk-[a-zA-Z0-9]+/g, "***API_KEY***") || String(error);
    console.error(`[ERROR] ${context || "Unknown context"}:`, safeMessage);
}
