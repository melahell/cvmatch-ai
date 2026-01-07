import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";
import { deduplicateRAG } from "@/lib/rag/deduplicate";
import { calculateQualityScore } from "@/lib/rag/quality-scoring";
import { logger } from "@/lib/utils/logger";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Cleanup endpoint to purge duplicates from existing RAG data
 *
 * This MUST be called BEFORE regenerating RAG to clean polluted data.
 *
 * Usage: POST /api/rag/cleanup { userId: "..." }
 */
export async function POST(req: Request) {
    const supabase = createSupabaseClient();
    const startTime = Date.now();

    try {
        const { userId: providedUserId, email } = await req.json();

        if (!providedUserId && !email) {
            return NextResponse.json({
                error: "Missing userId or email",
                usage: "Provide either { userId: '...' } or { email: '...' }"
            }, { status: 400 });
        }

        let userId = providedUserId;

        // If email provided, find userId
        if (!userId && email) {
            const { data: user, error: userError } = await supabase
                .from("users")
                .select("id")
                .eq("email", email)
                .single();

            if (userError || !user) {
                return NextResponse.json({
                    error: "User not found with this email",
                    email
                }, { status: 404 });
            }

            userId = user.id;
            logger.info("Found userId from email", { email, userId });
        }

        logger.info("Starting RAG cleanup for user", { userId });

        // 1. Fetch existing RAG data
        const { data: existingRag, error: fetchError } = await supabase
            .from("rag_metadata")
            .select("completeness_details, completeness_score")
            .eq("user_id", userId)
            .single();

        if (fetchError || !existingRag) {
            return NextResponse.json({
                error: "No RAG data found for this user",
                errorCode: "RAG_NOT_FOUND"
            }, { status: 404 });
        }

        const originalRAG = existingRag.completeness_details;

        // 2. Count items BEFORE deduplication
        const beforeStats = {
            experiences: originalRAG?.experiences?.length || 0,
            realisations: 0,
            techniques: originalRAG?.competences?.explicit?.techniques?.length || 0,
            soft_skills: originalRAG?.competences?.explicit?.soft_skills?.length || 0,
            formations: originalRAG?.formations?.length || 0,
            certifications: originalRAG?.certifications?.length || 0
        };

        // Count realisations per experience
        if (originalRAG?.experiences) {
            for (const exp of originalRAG.experiences) {
                beforeStats.realisations += exp.realisations?.length || 0;
            }
        }

        logger.info("RAG stats before cleanup", beforeStats);

        // 3. Deduplicate
        const deduplicationStart = Date.now();
        const cleanedRAG = deduplicateRAG(originalRAG);
        const deduplicationDuration = Date.now() - deduplicationStart;

        // 4. Count items AFTER deduplication
        const afterStats = {
            experiences: cleanedRAG?.experiences?.length || 0,
            realisations: 0,
            techniques: cleanedRAG?.competences?.explicit?.techniques?.length || 0,
            soft_skills: cleanedRAG?.competences?.explicit?.soft_skills?.length || 0,
            formations: cleanedRAG?.formations?.length || 0,
            certifications: cleanedRAG?.certifications?.length || 0
        };

        if (cleanedRAG?.experiences) {
            for (const exp of cleanedRAG.experiences) {
                afterStats.realisations += exp.realisations?.length || 0;
            }
        }

        logger.info("RAG stats after cleanup", afterStats);

        // 5. Calculate reduction
        const reduction = {
            experiences: beforeStats.experiences - afterStats.experiences,
            realisations: beforeStats.realisations - afterStats.realisations,
            techniques: beforeStats.techniques - afterStats.techniques,
            soft_skills: beforeStats.soft_skills - afterStats.soft_skills,
            formations: beforeStats.formations - afterStats.formations,
            certifications: beforeStats.certifications - afterStats.certifications
        };

        const totalReduction = Object.values(reduction).reduce((a, b) => a + b, 0);

        logger.info("Duplicates removed", { reduction, totalReduction });

        // 6. Recalculate quality score
        const qualityScore = calculateQualityScore(cleanedRAG);
        logger.info("Quality score recalculated", { score: qualityScore.overall_score });

        // 7. Save cleaned RAG to database
        const { error: updateError } = await supabase
            .from("rag_metadata")
            .update({
                completeness_details: cleanedRAG,
                completeness_score: qualityScore.overall_score,
                last_updated: new Date().toISOString()
            })
            .eq("user_id", userId);

        if (updateError) {
            logger.error("Failed to save cleaned RAG", { error: updateError.message });
            return NextResponse.json({
                error: "Failed to save cleaned data",
                errorCode: "DB_UPDATE_FAILED",
                details: updateError.message
            }, { status: 500 });
        }

        const totalDuration = Date.now() - startTime;

        logger.info("RAG cleanup complete", {
            userId,
            totalDuration,
            duplicatesRemoved: totalReduction
        });

        return NextResponse.json({
            success: true,
            message: `Successfully removed ${totalReduction} duplicates`,
            before: beforeStats,
            after: afterStats,
            reduction,
            qualityScore: qualityScore.overall_score,
            timings: {
                deduplicationMs: deduplicationDuration,
                totalMs: totalDuration
            }
        });

    } catch (error: any) {
        const elapsed = Date.now() - startTime;
        logger.error("RAG cleanup failed", {
            error: error.message,
            durationMs: elapsed,
            stack: error.stack
        });

        return NextResponse.json({
            error: "Failed to clean RAG data",
            errorCode: "CLEANUP_ERROR",
            details: error.message,
            elapsed
        }, { status: 500 });
    }
}
