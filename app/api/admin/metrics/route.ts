import { NextResponse } from "next/server";
import { createSupabaseAdminClient, requireSupabaseUser } from "@/lib/supabase";

const asSupabaseSafeError = (error: unknown) => {
    const message = typeof (error as any)?.message === "string" ? (error as any).message : "";
    const code = typeof (error as any)?.code === "string" ? (error as any).code : "";
    return { message, code };
};

const isMissingTableError = (error: unknown, tableName: string) => {
    const { message, code } = asSupabaseSafeError(error);
    if (code === "42P01") return true;
    if (!message) return false;
    return message.toLowerCase().includes(`relation "${tableName}" does not exist`);
};

export async function GET(req: Request) {
    try {
        const auth = await requireSupabaseUser(req);
        if (auth.error || !auth.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const admin = createSupabaseAdminClient();
        const { data: adminRow } = await admin
            .from("users")
            .select("role")
            .eq("id", auth.user.id)
            .maybeSingle();

        if (adminRow?.role !== "admin") {
            return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
        }

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { count: totalUsers, error: totalUsersError } = await admin
            .from("users")
            .select("*", { count: "exact", head: true });
        if (totalUsersError) {
            if (isMissingTableError(totalUsersError, "users")) {
                return NextResponse.json({ metrics: null });
            }
            throw new Error(totalUsersError.message);
        }

        const { count: active7d, error: active7dError } = await admin
            .from("users")
            .select("*", { count: "exact", head: true })
            .gte("created_at", sevenDaysAgo.toISOString());
        if (active7dError && !isMissingTableError(active7dError, "users")) throw new Error(active7dError.message);

        const { count: active30d, error: active30dError } = await admin
            .from("users")
            .select("*", { count: "exact", head: true })
            .gte("created_at", thirtyDaysAgo.toISOString());
        if (active30dError && !isMissingTableError(active30dError, "users")) throw new Error(active30dError.message);

        const { count: newToday, error: newTodayError } = await admin
            .from("users")
            .select("*", { count: "exact", head: true })
            .gte("created_at", today.toISOString());
        if (newTodayError && !isMissingTableError(newTodayError, "users")) throw new Error(newTodayError.message);

        const { count: totalCVs, error: totalCVsError } = await admin
            .from("cv_generations")
            .select("*", { count: "exact", head: true });
        if (totalCVsError && !isMissingTableError(totalCVsError, "cv_generations")) throw new Error(totalCVsError.message);

        const { count: cvsToday, error: cvsTodayError } = await admin
            .from("cv_generations")
            .select("*", { count: "exact", head: true })
            .gte("created_at", today.toISOString());
        if (cvsTodayError && !isMissingTableError(cvsTodayError, "cv_generations")) throw new Error(cvsTodayError.message);

        const { count: cvs7d, error: cvs7dError } = await admin
            .from("cv_generations")
            .select("*", { count: "exact", head: true })
            .gte("created_at", sevenDaysAgo.toISOString());
        if (cvs7dError && !isMissingTableError(cvs7dError, "cv_generations")) throw new Error(cvs7dError.message);

        const { data: cvData, error: cvDataError } = await admin
            .from("cv_generations")
            .select("cv_data")
            .order("created_at", { ascending: false })
            .limit(200);
        if (cvDataError && !isMissingTableError(cvDataError, "cv_generations")) throw new Error(cvDataError.message);

        const scores = {
            match: [] as number[],
            ats: [] as number[],
            quality: [] as number[],
        };

        (cvData || []).forEach((cv: any) => {
            const metadata = cv?.cv_data?.cv_metadata;
            if (typeof metadata?.match_score === "number") scores.match.push(metadata.match_score);
            if (typeof metadata?.ats_score === "number") scores.ats.push(metadata.ats_score);
            if (typeof metadata?.quality_score === "number") scores.quality.push(metadata.quality_score);
        });

        const avgMatch = scores.match.length > 0
            ? Math.round(scores.match.reduce((a, b) => a + b, 0) / scores.match.length)
            : 0;
        const avgATS = scores.ats.length > 0
            ? Math.round(scores.ats.reduce((a, b) => a + b, 0) / scores.ats.length)
            : 0;
        const avgQuality = scores.quality.length > 0
            ? Math.round(scores.quality.reduce((a, b) => a + b, 0) / scores.quality.length)
            : 0;

        return NextResponse.json({
            metrics: {
                users: {
                    total: totalUsers || 0,
                    active_7d: active7d || 0,
                    active_30d: active30d || 0,
                    new_today: newToday || 0,
                },
                cvs: {
                    total: totalCVs || 0,
                    generated_today: cvsToday || 0,
                    generated_7d: cvs7d || 0,
                    avg_generation_time: 0,
                },
                exports: {
                    pdf: 0,
                    word: 0,
                    markdown: 0,
                    json: 0,
                },
                quality: {
                    avg_match_score: avgMatch,
                    avg_ats_score: avgATS,
                    avg_quality_score: avgQuality,
                },
                performance: {
                    avg_api_latency: 0,
                    error_rate: 0,
                },
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
    }
}

