/**
 * Top 10 Job Suggestions Endpoint
 *
 * Generates job recommendations based on RAG profile
 * Separated from main RAG generation to avoid timeouts
 */

import { NextResponse } from "next/server";
import { createSupabaseAdminClient, createSupabaseUserClient, requireSupabaseUser } from "@/lib/supabase";
import { callWithRetry, generateWithCascade } from "@/lib/ai/gemini";
import { getTopJobsPrompt } from "@/lib/ai/prompts";
import { checkRateLimit, createRateLimitError, getRateLimitConfig } from "@/lib/utils/rate-limit";
import { logger } from "@/lib/utils/logger";
import { safeParseJSON } from "@/lib/ai/safe-json-parser";

export const runtime = "nodejs";
export const maxDuration = 60; // 1 minute should be enough

/** Extrait le texte de la réponse Gemini (gère réponses bloquées / structure variable). */
function getTextFromGeminiResponse(result: { response?: { text?: () => string; candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> } }): string {
    try {
        if (result?.response?.text) {
            return result.response.text();
        }
    } catch {
        // response.text() peut throw si contenu bloqué ou vide
    }
    const candidates = result?.response?.candidates;
    if (Array.isArray(candidates) && candidates.length > 0) {
        const parts = candidates[0]?.content?.parts;
        if (Array.isArray(parts)) {
            return parts.map((p) => p?.text ?? "").join("");
        }
    }
    return "";
}

/** Normalise un objet brut IA vers le format attendu par l’UI (tolérant aux clés et types). */
function normalizeJobSuggestion(item: Record<string, unknown>): Record<string, unknown> {
    const str = (v: unknown) => (v != null && typeof v === "string" ? v : typeof v === "number" ? String(v) : Array.isArray(v) ? v.map(String).join(", ") : "");
    const num = (v: unknown) => (typeof v === "number" && !Number.isNaN(v) ? v : typeof v === "string" ? parseInt(v, 10) : undefined);
    const arr = (v: unknown): string[] => (Array.isArray(v) ? v.map((x) => (typeof x === "string" ? x : String(x))) : typeof v === "string" ? [v] : []);

    const raisons0 = Array.isArray(item.raisons) ? item.raisons[0] : undefined;
    const titre =
        str(item.titre_poste || item.titre || item.ligne || item.title || item.job_title || item.poste || item.name) ||
        str(item.titre_poste) || str(item.titre) || str(item.ligne);
    const secteurs = arr(item.secteurs ?? item.secteur).length ? arr(item.secteurs ?? item.secteur) : (item.secteur ? [str(item.secteur)] : []);

    return {
        ...item,
        rang: num(item.rang) ?? undefined,
        titre_poste: titre || undefined,
        titre: titre || undefined,
        match_score: num(item.match_score) ?? num(item.score) ?? undefined,
        salaire_min: num(item.salaire_min) ?? num(item.salary_min) ?? undefined,
        salaire_max: num(item.salaire_max) ?? num(item.salary_max) ?? undefined,
        raison: str(item.raison ?? raisons0) || str(item.description) || undefined,
        secteurs: secteurs.length ? secteurs : undefined,
        secteur: str(item.secteur) || secteurs[0] || undefined,
    };
}

export async function POST(req: Request) {
    try {
        const auth = await requireSupabaseUser(req);
        if (auth.error || !auth.user || !auth.token) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const supabase = createSupabaseUserClient(auth.token);
        const admin = createSupabaseAdminClient();
        const userId = auth.user.id;

        const { data: userRow } = await admin
            .from("users")
            .select("subscription_tier, subscription_expires_at, subscription_status")
            .eq("id", userId)
            .maybeSingle();

        const isExpired = userRow?.subscription_expires_at
            ? new Date(userRow.subscription_expires_at) < new Date()
            : false;
        const tier = !userRow || userRow.subscription_status !== "active" || isExpired
            ? "free"
            : (userRow.subscription_tier || "free");

        const rateLimitResult = await checkRateLimit(`jobs:${userId}`, getRateLimitConfig(tier, "JOB_SUGGESTIONS"));
        if (!rateLimitResult.success) {
            return NextResponse.json(createRateLimitError(rateLimitResult), { status: 429 });
        }

        // Fetch RAG data
        const { data: ragData, error: ragError } = await supabase
            .from("rag_metadata")
            .select("completeness_details")
            .eq("user_id", userId)
            .single();

        if (ragError || !ragData?.completeness_details) {
            return NextResponse.json({
                error: "Profile not found. Please generate your profile first.",
                errorCode: "PROFILE_NOT_FOUND"
            }, { status: 404 });
        }

        const prompt = getTopJobsPrompt(ragData.completeness_details);
        logger.info("Top jobs génération démarrée", { userId });

        let modelUsed: string | null = null;
        let responseText: string;
        try {
            responseText = await callWithRetry(async () => {
                const cascade = await generateWithCascade(prompt);
                modelUsed = cascade.modelUsed;
                const result = cascade.result;
                const text = getTextFromGeminiResponse(result);
                if (!text || !text.trim()) {
                    throw new Error("Gemini response empty or blocked (no text)");
                }
                logger.info("Top jobs IA OK", { modelUsed, responseLength: text.length });
                return text;
            }, 3);
        } catch (geminiError: unknown) {
            const msg = geminiError instanceof Error ? geminiError.message : String(geminiError);
            logger.error("Top jobs Gemini error", { error: msg });
            return NextResponse.json({
                error: "AI service error: Unable to generate job suggestions",
                errorCode: "GEMINI_ERROR",
                details: msg,
                retry: true
            }, { status: 503 });
        }

        // Parse JSON sans schéma strict (l’IA peut renvoyer nombres en string, clés variées)
        const parsed = safeParseJSON<unknown>(responseText);
        if (!parsed.success) {
            logger.error("Top jobs JSON parse error", { error: parsed.error, preview: responseText.slice(0, 300) });
            return NextResponse.json({
                error: "AI returned invalid JSON for job suggestions",
                errorCode: "PARSE_ERROR",
                details: parsed.error
            }, { status: 500 });
        }

        const raw = parsed.data;
        let rawList: unknown[] = [];
        if (Array.isArray(raw)) {
            rawList = raw;
        } else if (raw && typeof raw === "object" && "suggestions" in raw && Array.isArray((raw as { suggestions: unknown[] }).suggestions)) {
            rawList = (raw as { suggestions: unknown[] }).suggestions;
        } else if (raw && typeof raw === "object" && "jobs" in raw && Array.isArray((raw as { jobs: unknown[] }).jobs)) {
            rawList = (raw as { jobs: unknown[] }).jobs;
        }

        const top10Jobs = rawList
            .filter((item): item is Record<string, unknown> => item != null && typeof item === "object" && !Array.isArray(item))
            .map(normalizeJobSuggestion)
            .filter((j) => j.titre_poste || j.titre || j.ligne);

        if (top10Jobs.length === 0) {
            logger.error("Top jobs: no valid items after normalize", { rawListLength: rawList.length, preview: responseText.slice(0, 400) });
            return NextResponse.json({
                error: "AI returned no valid job suggestions",
                errorCode: "EMPTY_RESPONSE"
            }, { status: 500 });
        }

        // Save to database
        const { error: updateError } = await supabase
            .from("rag_metadata")
            .update({
                top_10_jobs: top10Jobs,
                last_updated: new Date().toISOString()
            })
            .eq("user_id", userId);

        if (updateError) {
            logger.error("Top jobs save error", { error: updateError.message });
            // Continue anyway, just log the error
        }

        return NextResponse.json({
            success: true,
            jobs: top10Jobs,
            count: top10Jobs.length,
            model_used: modelUsed,
            generatedAt: new Date().toISOString()
        });

    } catch (error: any) {
        logger.error("Job suggestions error", { error: error?.message });

        // Granular error handling
        if (error.message?.includes("GEMINI") || error.message?.includes("API")) {
            return NextResponse.json({
                error: "AI service error: Unable to generate job suggestions",
                errorCode: "GEMINI_ERROR",
                details: error.message,
                retry: true
            }, { status: 503 });
        }

        return NextResponse.json({
            error: "Unexpected error during job suggestions generation",
            errorCode: "UNKNOWN_ERROR",
            details: error.message || "Internal server error",
            retry: true
        }, { status: 500 });
    }
}
