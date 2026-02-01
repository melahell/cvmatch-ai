/**
 * API Route: GET /api/rag/versions
 * 
 * [CDC Sprint 1.3] Liste les versions RAG de l'utilisateur
 * 
 * Query params:
 * - limit: number (default 10)
 * - offset: number (default 0)
 */

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseUserClient, requireSupabaseUser } from "@/lib/supabase";
import { listRAGVersions, countRAGVersions, summarizeRAGDiff } from "@/lib/rag/versioning";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        // Auth
        const auth = await requireSupabaseUser(request);
        if (auth.error || !auth.user || !auth.token) {
            return NextResponse.json(
                { error: "Non autorisé" },
                { status: 401 }
            );
        }

        // Query params
        const { searchParams } = new URL(request.url);
        const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 50);
        const offset = parseInt(searchParams.get("offset") || "0", 10);

        const supabase = createSupabaseUserClient(auth.token);

        // Get versions
        const [versions, totalCount] = await Promise.all([
            listRAGVersions(supabase, auth.user.id, { limit, offset }),
            countRAGVersions(supabase, auth.user.id),
        ]);

        // Format response with diff summaries
        const formattedVersions = versions.map((v) => ({
            id: v.id,
            version_number: v.version_number,
            created_at: v.created_at,
            created_reason: v.created_reason,
            diff_summary: v.diff_from_previous 
                ? summarizeRAGDiff(v.diff_from_previous)
                : null,
        }));

        logger.info("RAG versions listed", {
            userId: auth.user.id,
            count: versions.length,
            total: totalCount,
        });

        return NextResponse.json({
            success: true,
            versions: formattedVersions,
            pagination: {
                total: totalCount,
                limit,
                offset,
                hasMore: offset + versions.length < totalCount,
            },
        });

    } catch (error) {
        logger.error("Error listing RAG versions", { error });
        return NextResponse.json(
            { 
                error: "Erreur lors de la récupération des versions",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
