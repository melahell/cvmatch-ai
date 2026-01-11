/**
 * Top 10 Job Suggestions Endpoint
 *
 * Generates job recommendations based on RAG profile
 * Separated from main RAG generation to avoid timeouts
 */

import { NextResponse } from "next/server";
import { createSupabaseUserClient, requireSupabaseUser } from "@/lib/supabase";
import { callWithRetry, generateWithCascade } from "@/lib/ai/gemini";
import { getTopJobsPrompt } from "@/lib/ai/prompts";
import { checkRateLimit, RATE_LIMITS, createRateLimitError } from "@/lib/utils/rate-limit";
import { logger } from "@/lib/utils/logger";

export const runtime = "nodejs";
export const maxDuration = 60; // 1 minute should be enough

export async function POST(req: Request) {
    try {
        const auth = await requireSupabaseUser(req);
        if (auth.error || !auth.user || !auth.token) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const supabase = createSupabaseUserClient(auth.token);
        const userId = auth.user.id;

        // Rate limiting: 10 job suggestions per hour
        const rateLimitResult = checkRateLimit(`jobs:${userId}`, RATE_LIMITS.JOB_SUGGESTIONS);
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
        const responseText = await callWithRetry(async () => {
            const cascade = await generateWithCascade(prompt);
            modelUsed = cascade.modelUsed;
            const result = cascade.result;
            const text = result.response.text();
            logger.info("Top jobs IA OK", { modelUsed, responseLength: text.length });
            return text;
        }, 3);

        // Parse JSON
        const jsonString = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        let top10Jobs;

        try {
            top10Jobs = JSON.parse(jsonString);

            // Validate structure
            if (!Array.isArray(top10Jobs) || top10Jobs.length === 0) {
                throw new Error("Invalid response structure");
            }
        } catch (parseError: any) {
            logger.error("Top jobs parse error", { responseLength: responseText.length });
            return NextResponse.json({
                error: "AI returned invalid format for job suggestions",
                errorCode: "PARSE_ERROR",
                details: parseError.message
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
