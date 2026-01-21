import { createSupabaseClient, requireSupabaseUser } from "@/lib/supabase";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
    const { user, error: authError } = await requireSupabaseUser(req);
    if (authError || !user) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from("users")
        .select("full_name, job_title, phone, location, website, linkedin, email")
        .eq("id", user.id)
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function PATCH(req: Request) {
    const { user, error: authError } = await requireSupabaseUser(req);
    if (authError || !user) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { full_name, job_title, phone, location, website, linkedin } = body;

    const supabase = createSupabaseClient();
    const { error } = await supabase
        .from("users")
        .update({
            full_name,
            job_title,
            phone,
            location,
            website,
            linkedin,
            updated_at: new Date().toISOString()
        })
        .eq("id", user.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
