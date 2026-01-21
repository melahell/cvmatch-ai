import { NextResponse } from "next/server";
import { createSupabaseAdminClient, requireSupabaseUser } from "@/lib/supabase";

export const runtime = "nodejs";

const getOrigin = (request: Request) => {
    const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL;
    if (!origin) {
        throw new Error("Origine manquante pour la redirection");
    }
    return origin;
};

const getStripeSecret = () => {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
        throw new Error("STRIPE_SECRET_KEY manquant");
    }
    return secret;
};

const stripeRequest = async (path: string, params: Record<string, string | undefined>) => {
    const secret = getStripeSecret();
    const body = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) body.append(key, value);
    });

    const response = await fetch(`https://api.stripe.com/v1/${path}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${secret}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data?.error?.message || "Erreur Stripe");
    }

    return data;
};

export async function POST(request: Request) {
    try {
        const auth = await requireSupabaseUser(request);
        if (auth.error || !auth.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const origin = getOrigin(request);
        const admin = createSupabaseAdminClient();

        const { data: userRow, error } = await admin
            .from("users")
            .select("stripe_customer_id")
            .eq("id", auth.user.id)
            .maybeSingle();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!userRow?.stripe_customer_id) {
            return NextResponse.json({ error: "Aucun client Stripe" }, { status: 400 });
        }

        const session = await stripeRequest("billing_portal/sessions", {
            customer: userRow.stripe_customer_id,
            return_url: `${origin}/dashboard/settings`,
        });

        if (!session?.url) {
            return NextResponse.json({ error: "Portail indisponible" }, { status: 500 });
        }

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
