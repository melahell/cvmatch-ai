import { createSupabaseClient, requireSupabaseUser } from "@/lib/supabase";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Admin Stats Endpoint
 * Returns platform statistics for admin dashboard
 *
 * Authentication: Requires admin role
 */
export async function GET(req: Request) {
    // ✅ Authenticate user
    const { user, error: authError } = await requireSupabaseUser(req);
    if (authError || !user) {
        return NextResponse.json({ error: "Non autorisé. Reconnectez-vous." }, { status: 401 });
    }

    const supabase = createSupabaseClient();

    try {
        // Check if user is admin
        const { data: userData, error: userError } = await supabase
            .from("users")
            .select("is_admin")
            .eq("id", user.id)
            .single();

        if (userError || !userData?.is_admin) {
            console.warn(`[ADMIN] Non-admin user ${user.id} attempted to access admin stats`);
            return NextResponse.json(
                { error: "Accès refusé. Vous n'êtes pas administrateur." },
                { status: 403 }
            );
        }

        console.log(`[ADMIN] Admin ${user.id} accessing stats dashboard`);

        // Get statistics
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Total users
        const { count: totalUsers } = await supabase
            .from("users")
            .select("*", { count: "exact", head: true });

        // Users created today
        const { count: usersToday } = await supabase
            .from("users")
            .select("*", { count: "exact", head: true })
            .gte("created_at", today.toISOString());

        // Total analyses
        const { count: totalAnalyses } = await supabase
            .from("job_analyses")
            .select("*", { count: "exact", head: true });

        // Analyses created today
        const { count: analysesToday } = await supabase
            .from("job_analyses")
            .select("*", { count: "exact", head: true })
            .gte("created_at", today.toISOString());

        // Total CVs generated
        const { count: totalCVs } = await supabase
            .from("generated_cvs")
            .select("*", { count: "exact", head: true });

        // Total documents uploaded
        const { count: totalDocuments } = await supabase
            .from("uploaded_documents")
            .select("*", { count: "exact", head: true });

        return NextResponse.json({
            totalUsers: totalUsers || 0,
            usersToday: usersToday || 0,
            totalAnalyses: totalAnalyses || 0,
            analysesToday: analysesToday || 0,
            totalCVs: totalCVs || 0,
            totalDocuments: totalDocuments || 0,
        });

    } catch (error: any) {
        console.error("[ADMIN] Error fetching stats:", error);
        return NextResponse.json(
            { error: "Erreur lors de la récupération des statistiques" },
            { status: 500 }
        );
    }
}
