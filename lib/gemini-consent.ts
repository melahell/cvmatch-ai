import { createSupabaseClient } from "@/lib/supabase";

/**
 * Vérifie que l'utilisateur a donné son consentement pour l'utilisation de Google Gemini
 * Conforme RGPD - Consentement explicite requis
 */
export async function checkGeminiConsent(userId: string): Promise<{
    hasConsent: boolean;
    message?: string;
}> {
    const supabase = createSupabaseClient();

    const { data: user, error } = await supabase
        .from("users")
        .select("gemini_consent")
        .eq("id", userId)
        .single();

    if (error || !user) {
        return {
            hasConsent: false,
            message: "User not found"
        };
    }

    if (!user.gemini_consent) {
        return {
            hasConsent: false,
            message: "Gemini consent required. Please accept the AI analysis terms in your profile settings."
        };
    }

    return { hasConsent: true };
}

/**
 * Enregistre un log d'utilisation de l'API Gemini (transparence RGPD)
 */
export async function logGeminiUsage(
    userId: string,
    action: "rag_extraction" | "job_analysis" | "cv_generation" | "lm_generation",
    dataSummary?: Record<string, any>
): Promise<void> {
    const supabase = createSupabaseClient();

    try {
        await supabase.from("gemini_api_logs").insert({
            user_id: userId,
            action: action,
            data_sent_summary: dataSummary || {}
        });

        console.log(`[GEMINI] Logged ${action} for user ${userId}`);
    } catch (error) {
        console.warn("[GEMINI] Failed to log usage:", error);
        // Ne pas bloquer la requête si le log échoue
    }
}

/**
 * Enregistre le consentement de l'utilisateur
 */
export async function saveGeminiConsent(userId: string, consent: boolean): Promise<void> {
    const supabase = createSupabaseClient();

    const updateData: any = {
        gemini_consent: consent,
    };

    if (consent) {
        updateData.gemini_consent_date = new Date().toISOString();
    } else {
        updateData.gemini_consent_revoked_date = new Date().toISOString();
    }

    const { error } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", userId);

    if (error) {
        throw new Error(`Failed to save consent: ${error.message}`);
    }

    console.log(`[GDPR] User ${userId} ${consent ? "granted" : "revoked"} Gemini consent`);
}
