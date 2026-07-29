// Migrated from supabase/functions/create-portal-session (Deno edge function).
import { createServerFn } from "@tanstack/react-start";
import type { StripeEnv } from "@/lib/stripe-gateway.server";

type Input = { returnUrl?: string; environment?: string };

export const createPortalSession = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => (input ?? {}) as Input)
  .handler(async ({ data }) => {
    const { requireSupabaseAuth, adminClient } = await import("@/lib/supabase.server");
    const { createStripeClient } = await import("@/lib/stripe-gateway.server");

    const { user } = await requireSupabaseAuth();
    const env: StripeEnv = data.environment === "live" ? "live" : "sandbox";
    const supabase = adminClient();

    const { data: sub } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .eq("environment", env)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!sub?.stripe_customer_id) throw new Error("No subscription found");

    const stripe = createStripeClient(env);
    const portal = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      ...(data.returnUrl && { return_url: data.returnUrl }),
    });
    return { url: portal.url };
  });