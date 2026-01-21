import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";
import { deduplicateRAG } from "@/lib/rag/deduplicate";
import { calculateQualityScore } from "@/lib/rag/quality-scoring";
import { logger } from "@/lib/utils/logger";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Cleanup endpoint to deduplicate existing RAG data
 *
 * This fixes the massive duplication issue where experiences, skills,
 * certifications, and formations are repeated 3-10x in the RAG data.
 *
 * Usage: POST /api/rag/deduplicate { userId: "..." }
 */
export async function POST(req: Request) {
    const supabase = createSupabaseClient();
    const startTime = Date.now();

    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: "Missing userId" }, { status: 400 });
        }

        logger.info("Starting RAG deduplication", { userId });

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

        // 2. Count items before deduplication
        const beforeStats = {
            experiences: originalRAG?.experiences?.length || 0,
            techniques: originalRAG?.competences?.explicit?.techniques?.length || 0,
            soft_skills: originalRAG?.competences?.explicit?.soft_skills?.length || 0,
            formations: originalRAG?.formations?.length || 0,
            certifications: originalRAG?.certifications?.length || 0
        };

        logger.info("RAG stats before deduplication", beforeStats);

        // 3. Deduplicate
        const deduplicationStart = Date.now();
        const deduplicatedRAG = deduplicateRAG(originalRAG);
        const deduplicationDuration = Date.now() - deduplicationStart;

        // 4. Count items after deduplication
        const afterStats = {
            experiences: deduplicatedRAG?.experiences?.length || 0,
            techniques: deduplicatedRAG?.competences?.explicit?.techniques?.length || 0,
            soft_skills: deduplicatedRAG?.competences?.explicit?.soft_skills?.length || 0,
            formations: deduplicatedRAG?.formations?.length || 0,
            certifications: deduplicatedRAG?.certifications?.length || 0
        };

        logger.info("RAG stats after deduplication", afterStats);

        // 5. Calculate reduction
        const reduction = {
            experiences: beforeStats.experiences - afterStats.experiences,
            techniques: beforeStats.techniques - afterStats.techniques,
            soft_skills: beforeStats.soft_skills - afterStats.soft_skills,
            formations: beforeStats.formations - afterStats.formations,
            certifications: beforeStats.certifications - afterStats.certifications
        };

        const totalReduction = Object.values(reduction).reduce((a, b) => a + b, 0);

        logger.info("Duplicates removed", { reduction, totalReduction });

        // 6. Recalculate quality score
        const qualityScore = calculateQualityScore(deduplicatedRAG);
        logger.info("Quality score recalculated", { score: qualityScore.overall_score });

        // 7. Save deduplicated RAG to database
        const { error: updateError } = await supabase
            .from("rag_metadata")
            .update({
                completeness_details: deduplicatedRAG,
                completeness_score: qualityScore.overall_score,
                last_updated: new Date().toISOString()
            })
            .eq("user_id", userId);

        if (updateError) {
            logger.error("Failed to save deduplicated RAG", { error: updateError.message });
            return NextResponse.json({
                error: "Failed to save deduplicated data",
                errorCode: "DB_UPDATE_FAILED",
                details: updateError.message
            }, { status: 500 });
        }

        const totalDuration = Date.now() - startTime;

        logger.info("RAG deduplication complete", {
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
        logger.error("RAG deduplication failed", {
            error: error.message,
            durationMs: elapsed,
            stack: error.stack
        });

        return NextResponse.json({
            error: "Failed to deduplicate RAG data",
            errorCode: "DEDUPLICATION_ERROR",
            details: error.message,
            elapsed
        }, { status: 500 });
    }
}
