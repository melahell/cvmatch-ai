import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";
import { logger } from "@/lib/utils/logger";

export async function POST(request: Request) {
    try {
        const { userId, skill, type } = await request.json();

        if (!userId || !skill || !type) {
            return NextResponse.json(
                { error: "Missing required fields: userId, skill, type" },
                { status: 400 }
            );
        }

        const supabase = createSupabaseClient();

        // 1. Fetch current RAG metadata
        const { data: current, error: fetchError } = await supabase
            .from("rag_metadata")
            .select("completeness_details")
            .eq("user_id", userId)
            .single();

        if (fetchError) {
            logger.error("Error fetching RAG metadata:", fetchError);
            return NextResponse.json(
                { error: "Failed to fetch profile" },
                { status: 500 }
            );
        }

        if (!current) {
            return NextResponse.json(
                { error: "Profile not found" },
                { status: 404 }
            );
        }

        // 2. Make a copy
        const updated = JSON.parse(JSON.stringify(current.completeness_details));

        // Ensure structure
        if (!updated.competences?.inferred) {
            return NextResponse.json({ success: true, message: "Nothing to reject" });
        }

        // 3. Remove from inferred based on type
        const category = type === "soft_skill" ? "soft_skills" : type === "tool" ? "tools" : "techniques";

        if (updated.competences.inferred[category]) {
            updated.competences.inferred[category] = updated.competences.inferred[category].filter(
                (s: any) => (typeof s === "string" ? s : s.name) !== skill
            );
        }

        // 4. Track rejected skills to avoid re-suggesting (optional feature)
        if (!updated.rejected_inferred) {
            updated.rejected_inferred = [];
        }

        if (!updated.rejected_inferred.includes(skill)) {
            updated.rejected_inferred.push(skill);
        }

        // 5. Update database
        const { error: updateError } = await supabase
            .from("rag_metadata")
            .update({ completeness_details: updated })
            .eq("user_id", userId);

        if (updateError) {
            logger.error("Error updating RAG metadata:", updateError);
            return NextResponse.json(
                { error: "Failed to update profile" },
                { status: 500 }
            );
        }

        logger.debug("Successfully rejected skill:", { userId, skill, type });

        return NextResponse.json({
            success: true,
            message: `"${skill}" rejeté`
        });

    } catch (error: any) {
        logger.error("Error in reject-skill endpoint:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
