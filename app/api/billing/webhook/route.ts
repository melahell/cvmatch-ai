import crypto from "crypto";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { logger } from "@/lib/utils/logger";

export const runtime = "nodejs";

const getWebhookSecret = () => {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
        throw new Error("STRIPE_WEBHOOK_SECRET manquant");
    }
    return secret;
};

const parseSignature = (header: string) => {
    const parts = header.split(",");
    const timestampPart = parts.find((part) => part.startsWith("t="));
    const signatureParts = parts.filter((part) => part.startsWith("v1="));
    const timestamp = timestampPart ? Number(timestampPart.split("=")[1]) : null;
    const signatures = signatureParts.map((part) => part.split("=")[1]);
    return { timestamp, signatures };
};

const verifyStripeSignature = (payload: string, header: string) => {
    const { timestamp, signatures } = parseSignature(header);
    if (!timestamp || signatures.length === 0) return false;

    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestamp) > 300) return false;

    const secret = getWebhookSecret();
    const signedPayload = `${timestamp}.${payload}`;
    const expected = crypto.createHmac("sha256", secret).update(signedPayload, "utf8").digest("hex");

    return signatures.includes(expected);
};

const normalizeStripeStatus = (status?: string) => {
    if (!status) return "inactive";
    if (status === "active" || status === "trialing") return "active";
    if (status === "past_due" || status === "unpaid") return "past_due";
    if (status === "canceled" || status === "incomplete_expired") return "canceled";
    return "inactive";
};

const resolveTier = (priceId?: string, fallback?: string) => {
    const pro = process.env.STRIPE_PRICE_PRO;
    const team = process.env.STRIPE_PRICE_TEAM;
    if (priceId && pro && priceId === pro) return "pro";
    if (priceId && team && priceId === team) return "team";
    if (fallback === "pro" || fallback === "team") return fallback;
    return "free";
};

const toIso = (timestamp?: number | null) => {
    if (!timestamp) return null;
    return new Date(timestamp * 1000).toISOString();
};

const updateByUserId = async (admin: ReturnType<typeof createSupabaseAdminClient>, userId: string, updates: Record<string, any>) => {
    const { error } = await admin.from("users").update(updates).eq("id", userId);
    if (error) {
        logger.error("Stripe webhook update error", { error: error.message, userId });
    }
};

const updateByCustomerId = async (admin: ReturnType<typeof createSupabaseAdminClient>, customerId: string, updates: Record<string, any>) => {
    const { data, error } = await admin.from("users").select("id").eq("stripe_customer_id", customerId).maybeSingle();
    if (error) {
        logger.error("Stripe webhook lookup error", { error: error.message, customerId });
        return;
    }
    if (!data?.id) {
        logger.error("Stripe webhook user not found", { customerId });
        return;
    }
    await updateByUserId(admin, data.id, updates);
};

export async function POST(request: Request) {
    try {
        const payload = await request.text();
        const signature = request.headers.get("stripe-signature");
        if (!signature || !verifyStripeSignature(payload, signature)) {
            return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
        }

        const event = JSON.parse(payload);
        const admin = createSupabaseAdminClient();

        if (event.type === "checkout.session.completed") {
            const session = event.data?.object;
            if (session?.mode === "subscription") {
                const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
                const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
                const userId = session.metadata?.user_id;
                const plan = session.metadata?.plan;

                const updates = {
                    subscription_status: "active",
                    subscription_tier: resolveTier(undefined, plan),
                    subscription_provider: "stripe",
                    stripe_customer_id: customerId,
                    stripe_subscription_id: subscriptionId,
                    subscription_started_at: new Date().toISOString(),
                };

                if (userId) {
                    await updateByUserId(admin, userId, updates);
                } else if (customerId) {
                    await updateByCustomerId(admin, customerId, updates);
                }
            }
        }

        if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
            const subscription = event.data?.object;
            const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;
            const subscriptionId = subscription.id;
            const priceId = subscription.items?.data?.[0]?.price?.id;
            const tier = resolveTier(priceId, subscription.metadata?.plan);
            const status = normalizeStripeStatus(subscription.status);
            const currentPeriodEnd = toIso(subscription.current_period_end);
            const currentPeriodStart = toIso(subscription.current_period_start);

            const updates = {
                subscription_status: status,
                subscription_tier: tier,
                subscription_provider: "stripe",
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
                subscription_current_period_end: currentPeriodEnd,
                subscription_started_at: currentPeriodStart,
                subscription_expires_at: currentPeriodEnd,
            };

            if (subscription.metadata?.user_id) {
                await updateByUserId(admin, subscription.metadata.user_id, updates);
            } else if (customerId) {
                await updateByCustomerId(admin, customerId, updates);
            }
        }

        if (event.type === "invoice.payment_failed") {
            const invoice = event.data?.object;
            const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
            if (customerId) {
                await updateByCustomerId(admin, customerId, {
                    subscription_status: "past_due",
                });
            }
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        logger.error("Stripe webhook error", { error: error?.message });
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
