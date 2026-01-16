/**
 * Top 10 Job Suggestions Endpoint
 *
 * Generates job recommendations based on RAG profile
 * Separated from main RAG generation to avoid timeouts
 */

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createSupabaseClient } from "@/lib/supabase";
import { getTopJobsPrompt } from "@/lib/ai/prompts";
import { checkRateLimit, RATE_LIMITS, createRateLimitError } from "@/lib/utils/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60; // 1 minute should be enough

// Retry wrapper with exponential backoff
async function callWithRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 2,
    baseDelay: number = 3000
): Promise<T> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            const isRateLimit = error.message?.includes("429") || error.message?.includes("quota");
            const isTimeout = error.message?.includes("timeout") || error.message?.includes("deadline");

            if ((isRateLimit || isTimeout) && attempt < maxRetries - 1) {
                const delay = baseDelay * Math.pow(2, attempt); // 3s, 6s
                console.log(`Job suggestions retry ${attempt + 1}/${maxRetries} after ${delay}ms...`);
                await new Promise(r => setTimeout(r, delay));
                continue;
            }
            throw error;
        }
    }
    throw new Error("Max retries exceeded");
}

export async function POST(req: Request) {
    const supabase = createSupabaseClient();

    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({
                error: "Missing userId",
                errorCode: "INVALID_REQUEST"
            }, { status: 400 });
        }

        // Rate limiting: 10 job suggestions per hour
        const rateLimitResult = checkRateLimit(`jobs:${userId}`, RATE_LIMITS.JOB_SUGGESTIONS);
        if (!rateLimitResult.success) {
            return NextResponse.json(createRateLimitError(rateLimitResult), { status: 429 });
        }

        // Check API key
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("GEMINI_API_KEY not found");
            return NextResponse.json({
                error: "Server configuration error",
                errorCode: "CONFIG_ERROR"
            }, { status: 500 });
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

        // Generate job suggestions with Gemini
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const prompt = getTopJobsPrompt(ragData.completeness_details);

        console.log("=== TOP 10 JOBS GENERATION START ===");

        const responseText = await callWithRetry(async () => {
            const result = await model.generateContent(prompt);
            return result.response.text();
        });

        console.log("Gemini response length:", responseText.length);

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
            console.error("Failed to parse job suggestions:", responseText.slice(0, 500));
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
            console.error("Failed to save job suggestions:", updateError);
            // Continue anyway, just log the error
        }

        return NextResponse.json({
            success: true,
            jobs: top10Jobs,
            count: top10Jobs.length,
            generatedAt: new Date().toISOString()
        });

    } catch (error: any) {
        console.error("Job suggestions error:", error);

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
