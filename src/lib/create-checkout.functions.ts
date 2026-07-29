// Migrated from supabase/functions/create-checkout (Deno edge function).
import { createServerFn } from "@tanstack/react-start";
import type Stripe from "stripe";
import type { StripeEnv } from "@/lib/stripe-gateway.server";

type Input = { priceId: string; returnUrl: string; environment?: string };

async function resolveOrCreateCustomer(
  stripe: Stripe,
  options: { email?: string; userId: string },
): Promise<string> {
  if (!/^[a-zA-Z0-9_-]+$/.test(options.userId)) throw new Error("Invalid userId");
  const found = await stripe.customers.search({
    query: `metadata['userId']:'${options.userId}'`,
    limit: 1,
  });
  if (found.data.length) return found.data[0].id;
  if (options.email) {
    const existing = await stripe.customers.list({ email: options.email, limit: 1 });
    if (existing.data.length) {
      const customer = existing.data[0];
      if (customer.metadata?.userId !== options.userId) {
        await stripe.customers.update(customer.id, {
          metadata: { ...customer.metadata, userId: options.userId },
        });
      }
      return customer.id;
    }
  }
  const created = await stripe.customers.create({
    ...(options.email && { email: options.email }),
    metadata: { userId: options.userId },
  });
  return created.id;
}

export const createCheckout = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const data = (input ?? {}) as Partial<Input>;
    if (!data.priceId || typeof data.priceId !== "string" || !/^[a-zA-Z0-9_-]+$/.test(data.priceId)) {
      throw new Error("Invalid priceId");
    }
    if (!data.returnUrl || typeof data.returnUrl !== "string") {
      throw new Error("Missing returnUrl");
    }
    return data as Input;
  })
  .handler(async ({ data }): Promise<{ clientSecret?: string | null; error?: string }> => {
    const { requireSupabaseAuth } = await import("@/lib/supabase.server");
    const { createStripeClient } = await import("@/lib/stripe-gateway.server");

    const { user } = await requireSupabaseAuth();
    const env: StripeEnv = data.environment === "live" ? "live" : "sandbox";
    const stripe = createStripeClient(env);

    const prices = await stripe.prices.list({ lookup_keys: [data.priceId] });
    if (!prices.data.length) throw new Error("PRICE_NOT_FOUND");
    const stripePrice = prices.data[0];
    const isRecurring = stripePrice.type === "recurring";

    const customerId = await resolveOrCreateCustomer(stripe, {
      email: user.email ?? undefined,
      userId: user.id,
    });

    if (isRecurring) {
      const existingSubs = await stripe.subscriptions.list({
        customer: customerId,
        status: "all",
        limit: 20,
      });
      const blocking = existingSubs.data.find(
        (s) =>
          ["active", "trialing", "past_due"].includes(s.status) &&
          s.items.data.some((it) => it.price.lookup_key === data.priceId),
      );
      if (blocking) return { error: "already_subscribed" };
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: stripePrice.id, quantity: 1 }],
      mode: isRecurring ? "subscription" : "payment",
      ui_mode: "embedded_page" as Stripe.Checkout.SessionCreateParams.UiMode,
      return_url: data.returnUrl,
      customer: customerId,
      metadata: { userId: user.id },
      allow_promotion_codes: true,
      ...(isRecurring && { subscription_data: { metadata: { userId: user.id } } }),
    });

    return { clientSecret: session.client_secret };
  });