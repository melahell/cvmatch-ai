import { createSupabaseClient } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { cookies } from "next/headers"; // Next.js cookies (server-side)

export const runtime = "edge";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    // "next" parameter is often used to redirect after auth
    const next = searchParams.get("next") ?? "/dashboard";

    if (code) {
        const supabase = createSupabaseClient();

        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && data.session) {
            // Success! 
            // For compatibility with our existing cookie-based logic:
            const userId = data.session.user.id;
            const userName = data.session.user.user_metadata.full_name || data.session.user.user_metadata.name || "User";

            // Set cookies manually for now (though supabase auth helper usually does this)
            const cookieStore = cookies();
            cookieStore.set("userId", userId);
            cookieStore.set("userName", userName);

            return NextResponse.redirect(`${origin}/dashboard`);
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`);
}
