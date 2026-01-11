import { NextResponse } from "next/server";
import { createSupabaseUserClient, requireSupabaseUser } from "@/lib/supabase";
import { logger } from "@/lib/utils/logger";

export async function POST(request: Request) {
    try {
        const auth = await requireSupabaseUser(request);
        if (auth.error || !auth.user || !auth.token) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { skill, type } = await request.json();

        if (!skill || !type) {
            return NextResponse.json(
                { error: "Missing required fields: skill, type" },
                { status: 400 }
            );
        }

        const supabase = createSupabaseUserClient(auth.token);
        const userId = auth.user.id;

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

        // 2. Make a copy of completeness_details
        const updated = JSON.parse(JSON.stringify(current.completeness_details));

        // Ensure structure exists
        if (!updated.competences) {
            updated.competences = { explicit: { techniques: [], soft_skills: [] }, inferred: { techniques: [], tools: [], soft_skills: [] } };
        }

        if (!updated.competences.explicit) {
            updated.competences.explicit = { techniques: [], soft_skills: [] };
        }

        if (!updated.competences.inferred) {
            updated.competences.inferred = { techniques: [], tools: [], soft_skills: [] };
        }

        // 3. Add skill to explicit based on type
        if (type === "technique") {
            if (!updated.competences.explicit.techniques.includes(skill)) {
                updated.competences.explicit.techniques.push(skill);
            }
        } else if (type === "soft_skill") {
            if (!updated.competences.explicit.soft_skills.includes(skill)) {
                updated.competences.explicit.soft_skills.push(skill);
            }
        } else if (type === "tool") {
            // Tools go to techniques
            if (!updated.competences.explicit.techniques.includes(skill)) {
                updated.competences.explicit.techniques.push(skill);
            }
        }

        // 4. Remove from inferred (all categories)
        if (updated.competences.inferred.techniques) {
            updated.competences.inferred.techniques = updated.competences.inferred.techniques.filter(
                (s: any) => (typeof s === "string" ? s : s.name) !== skill
            );
        }

        if (updated.competences.inferred.tools) {
            updated.competences.inferred.tools = updated.competences.inferred.tools.filter(
                (s: any) => (typeof s === "string" ? s : s.name) !== skill
            );
        }

        if (updated.competences.inferred.soft_skills) {
            updated.competences.inferred.soft_skills = updated.competences.inferred.soft_skills.filter(
                (s: any) => (typeof s === "string" ? s : s.name) !== skill
            );
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

        logger.debug("Successfully added skill to profile:", { userId, skill, type });

        return NextResponse.json({
            success: true,
            message: `"${skill}" ajouté à vos compétences`
        });

    } catch (error: any) {
        logger.error("Error in add-skill endpoint:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
