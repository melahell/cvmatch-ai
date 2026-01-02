
import { createSupabaseClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
    const supabase = createSupabaseClient();

    try {
        const { email, name } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email required" }, { status: 400 });
        }

        // Check if user exists
        const { data: existingUser } = await supabase
            .from("users")
            .select("*")
            .eq("email", email)
            .single();

        if (existingUser) {
            return NextResponse.json({
                success: true,
                userId: existingUser.id,
                name: existingUser.user_id, // simplistic mapping
                onboarding_completed: existingUser.onboarding_completed
            });
        }

        // Create user
        const userIdSlug = name.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Math.floor(Math.random() * 1000);

        const { data: newUser, error: createError } = await supabase
            .from("users")
            .insert({
                email,
                user_id: userIdSlug,
                onboarding_completed: false
            })
            .select()
            .single();

        if (createError) {
            throw createError;
        }

        return NextResponse.json({
            success: true,
            userId: newUser.id,
            name: newUser.user_id,
            onboarding_completed: false
        });

    } catch (error: any) {
        console.error("Login Error", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
