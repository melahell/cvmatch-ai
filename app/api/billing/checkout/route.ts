import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient, requireSupabaseUser } from "@/lib/supabase";

export const runtime = "nodejs";

const planSchema = z.object({
    plan: z.enum(["pro", "team"]).optional()
});

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

const getPriceId = (plan: "pro" | "team") => {
    const priceId = plan === "pro" ? process.env.STRIPE_PRICE_PRO : process.env.STRIPE_PRICE_TEAM;
    if (!priceId) {
        throw new Error("Stripe price manquant");
    }
    return priceId;
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

const ensureUserRow = async (admin: ReturnType<typeof createSupabaseAdminClient>, userId: string, email: string) => {
    const { data: existing } = await admin
        .from("users")
        .select("id, email, stripe_customer_id")
        .eq("id", userId)
        .maybeSingle();

    if (existing) return existing;

    const usernameSource = email.split("@")[0] || userId.slice(0, 8);
    const userIdSlug = usernameSource.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 100);

    const { error } = await admin
        .from("users")
        .insert({
            id: userId,
            email,
            user_id: userIdSlug,
            onboarding_completed: false,
        });

    if (error) {
        throw new Error(error.message);
    }

    return { id: userId, email, stripe_customer_id: null };
};

export async function POST(request: Request) {
    try {
        const auth = await requireSupabaseUser(request);
        if (auth.error || !auth.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { plan } = planSchema.parse(await request.json());
        const selectedPlan = plan ?? "pro";
        const priceId = getPriceId(selectedPlan);
        const origin = getOrigin(request);

        const admin = createSupabaseAdminClient();
        const email = auth.user.email ?? `user-${auth.user.id.slice(0, 8)}@temp.com`;
        const userRow = await ensureUserRow(admin, auth.user.id, email);

        let stripeCustomerId = userRow.stripe_customer_id ?? null;
        if (!stripeCustomerId) {
            const customer = await stripeRequest("customers", {
                email,
                "metadata[user_id]": auth.user.id,
            });

            stripeCustomerId = customer.id;
            const { error } = await admin
                .from("users")
                .update({ stripe_customer_id: stripeCustomerId })
                .eq("id", auth.user.id);

            if (error) {
                throw new Error(error.message);
            }
        }

        const successUrl = `${origin}/dashboard/settings?checkout=success`;
        const cancelUrl = `${origin}/dashboard/settings?checkout=cancel`;

        const session = await stripeRequest("checkout/sessions", {
            mode: "subscription",
            customer: stripeCustomerId,
            "line_items[0][price]": priceId,
            "line_items[0][quantity]": "1",
            success_url: successUrl,
            cancel_url: cancelUrl,
            "metadata[user_id]": auth.user.id,
            "metadata[plan]": selectedPlan,
            "subscription_data[metadata][user_id]": auth.user.id,
            "subscription_data[metadata][plan]": selectedPlan,
        });

        if (!session?.url) {
            return NextResponse.json({ error: "Checkout indisponible" }, { status: 500 });
        }

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
