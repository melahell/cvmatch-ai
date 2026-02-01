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

const toISODate = (date: Date) => {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, "0");
    const d = String(date.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
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

        const url = new URL(req.url);
        const daysRaw = url.searchParams.get("days");
        const days = Math.min(Math.max(Number(daysRaw || 30) || 30, 1), 90);

        const since = new Date();
        since.setUTCDate(since.getUTCDate() - days + 1);
        since.setUTCHours(0, 0, 0, 0);

        const { data: rows, error } = await admin
            .from("gemini_api_logs")
            .select("user_id, action, created_at")
            .gte("created_at", since.toISOString())
            .order("created_at", { ascending: false })
            .limit(5000);

        if (error) {
            if (isMissingTableError(error, "gemini_api_logs")) {
                return NextResponse.json({
                    summary: { total: 0, today: 0, last7d: 0, last30d: 0 },
                    byAction: [],
                    daily: [],
                    topUsers: [],
                    days,
                });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const now = new Date();
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const last7d = new Date();
        last7d.setUTCDate(last7d.getUTCDate() - 7);
        const last30d = new Date();
        last30d.setUTCDate(last30d.getUTCDate() - 30);

        const byActionMap = new Map<string, number>();
        const dailyMap = new Map<string, number>();
        const byUserMap = new Map<string, number>();

        for (const row of rows || []) {
            const action = String((row as any).action || "unknown");
            byActionMap.set(action, (byActionMap.get(action) || 0) + 1);

            const createdAt = new Date((row as any).created_at);
            const dayKey = toISODate(createdAt);
            dailyMap.set(dayKey, (dailyMap.get(dayKey) || 0) + 1);

            const userId = String((row as any).user_id || "");
            if (userId) byUserMap.set(userId, (byUserMap.get(userId) || 0) + 1);
        }

        const summaryTotal = rows?.length || 0;
        const summaryToday = (rows || []).filter((r: any) => new Date(r.created_at) >= today).length;
        const summary7d = (rows || []).filter((r: any) => new Date(r.created_at) >= last7d).length;
        const summary30d = (rows || []).filter((r: any) => new Date(r.created_at) >= last30d).length;

        const byAction = Array.from(byActionMap.entries())
            .map(([action, count]) => ({ action, count }))
            .sort((a, b) => b.count - a.count);

        const daily = Array.from(dailyMap.entries())
            .map(([day, count]) => ({ day, count }))
            .sort((a, b) => a.day.localeCompare(b.day));

        const topUsersRaw = Array.from(byUserMap.entries())
            .map(([userId, count]) => ({ userId, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 20);

        const userIds = topUsersRaw.map((u) => u.userId);
        const { data: usersData } = userIds.length
            ? await admin.from("users").select("id, email").in("id", userIds)
            : { data: [] as any[] };

        const emailById = new Map<string, string>();
        (usersData || []).forEach((u: any) => {
            if (u?.id && u?.email) emailById.set(String(u.id), String(u.email));
        });

        const topUsers = topUsersRaw.map((u) => ({
            user_id: u.userId,
            email: emailById.get(u.userId) || null,
            count: u.count,
        }));

        return NextResponse.json({
            summary: { total: summaryTotal, today: summaryToday, last7d: summary7d, last30d: summary30d },
            byAction,
            daily,
            topUsers,
            days,
            generated_at: now.toISOString(),
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
    }
}

