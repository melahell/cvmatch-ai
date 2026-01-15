/**
 * ENDPOINT: GET /api/cv/preview
 *
 * Génération instantanée d'un CV adapté en mode rapide (<500ms).
 * Parfait pour preview temps réel lors du switch de thème.
 *
 * Query params:
 * - user_id (required)
 * - theme_id (required): classic | modern_spacious | compact_ats
 * - job_id (optional): ID job analysis pour scoring
 * - include_photo (optional): true | false
 */

import { NextRequest, NextResponse } from "next/server";
import { generateAdaptiveCV } from "@/lib/cv/adaptive-algorithm";
import { ThemeId } from "@/lib/cv/types";
import { getAllRAGFiles } from "@/lib/github/rag-storage";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    // Extract params
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("user_id");
    const themeId = searchParams.get("theme_id") as ThemeId | null;
    const jobId = searchParams.get("job_id");
    const includePhoto = searchParams.get("include_photo") === "true";

    // Validation
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing user_id parameter",
          code: "INVALID_REQUEST"
        },
        { status: 400 }
      );
    }

    if (!themeId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing theme_id parameter",
          code: "INVALID_REQUEST"
        },
        { status: 400 }
      );
    }

    if (!["classic", "modern_spacious", "compact_ats"].includes(themeId)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid theme_id: ${themeId}. Must be one of: classic, modern_spacious, compact_ats`,
          code: "INVALID_THEME"
        },
        { status: 400 }
      );
    }

    // 1. Fetch RAG data
    const ragData = await getAllRAGFiles(userId);

    if (!ragData || !ragData.profil) {
      return NextResponse.json(
        {
          success: false,
          error: "RAG data not found. Please complete onboarding first.",
          code: "RAG_DATA_MISSING"
        },
        { status: 404 }
      );
    }

    // 2. Fetch job offer (optional, for relevance scoring)
    let jobOffer = null;
    if (jobId) {
      const { data: jobAnalysis, error: jobError } = await supabase
        .from("job_analyses")
        .select("*")
        .eq("id", jobId)
        .eq("user_id", userId)
        .single();

      if (!jobError && jobAnalysis) {
        jobOffer = {
          id: jobAnalysis.id,
          title: jobAnalysis.job_title || "Unknown",
          company: jobAnalysis.company_name,
          description: jobAnalysis.job_description || "",
          required_skills: jobAnalysis.required_skills || [],
          secteur: jobAnalysis.secteur,
          match_analysis: jobAnalysis.analysis_result
        };
      }
    }

    // 3. Run adaptive algorithm (FAST - no AI)
    const adaptedContent = generateAdaptiveCV(ragData, jobOffer, themeId, {
      include_photo: includePhoto
    });

    // 4. Calculate metadata
    const generationTime = Date.now() - startTime;

    const detailedCount = adaptedContent.sections.experiences.filter(
      (e) => e.format === "detailed"
    ).length;

    const totalAchievements = adaptedContent.sections.experiences.reduce(
      (sum, e) => sum + e.content.achievements.length,
      0
    );

    const avgRelevanceScore =
      adaptedContent.sections.experiences.length > 0
        ? adaptedContent.sections.experiences.reduce(
            (sum, e) => sum + e.relevance_score,
            0
          ) / adaptedContent.sections.experiences.length
        : 0;

    const utilizationRate =
      (adaptedContent.total_units_used /
        (adaptedContent.pages === 2 ? 400 : 200)) *
      100;

    // 5. Return adapted content (NO PDF generation for fast preview)
    return NextResponse.json({
      success: true,
      mode: "rapid",
      adapted_content: adaptedContent,
      metadata: {
        generation_time_ms: generationTime,
        utilization_rate: utilizationRate,
        quality_indicators: {
          detailed_experiences_count: detailedCount,
          total_experiences_count: adaptedContent.sections.experiences.length,
          total_achievements_count: totalAchievements,
          avg_relevance_score: avgRelevanceScore
        }
      }
    });
  } catch (error: any) {
    console.error("[Preview] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Algorithm error during preview generation",
        code: "ALGORITHM_ERROR",
        details: error.message
      },
      { status: 500 }
    );
  }
}
