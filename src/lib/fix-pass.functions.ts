// One-time "Audit & Fix Pass" ($9): unlocks ready-to-paste code fixes, the
// full branded PDF export, and 30 days of Site Watch for one address.
import { createServerFn } from "@tanstack/react-start";
import type Stripe from "stripe";
import type { StripeEnv } from "@/lib/stripe-gateway.server";

export const FIX_PASS_PRICE_ID = "fix_pass_onetime";

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const parsed = new URL(withScheme);
  return `${parsed.protocol}//${parsed.hostname}${parsed.pathname.replace(/\/$/, "")}`;
}

async function stripeFor(environment?: string) {
  const { createStripeClient } = await import("@/lib/stripe-gateway.server");
  const env: StripeEnv = environment === "live" ? "live" : "sandbox";
  return { stripe: createStripeClient(env), env };
}

/** Opens checkout for the one-time pass and returns the embedded client secret. */
export const startFixPass = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const data = (input ?? {}) as { url?: string; analysisId?: string; returnUrl?: string; environment?: string };
    if (!data.url || typeof data.url !== "string") throw new Error("Missing url");
    if (!data.returnUrl || typeof data.returnUrl !== "string") throw new Error("Missing returnUrl");
    return data as { url: string; analysisId?: string; returnUrl: string; environment?: string };
  })
  .handler(async ({ data }): Promise<{ clientSecret?: string | null; error?: string }> => {
    const { requireSupabaseAuth, adminClient } = await import("@/lib/supabase.server");
    const { user } = await requireSupabaseAuth();
    const { stripe } = await stripeFor(data.environment);
    const url = normalizeUrl(data.url);

    // Already covered for this address? Don't charge twice.
    const { data: existing } = await adminClient()
      .from("fix_passes")
      .select("id")
      .eq("user_id", user.id)
      .eq("url", url)
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();
    if (existing) return { error: "already_unlocked" };

    const prices = await stripe.prices.list({ lookup_keys: [FIX_PASS_PRICE_ID] });
    if (!prices.data.length) return { error: "price_not_found" };
    const price = prices.data[0];

    const customers = await stripe.customers.search({
      query: `metadata['userId']:'${user.id}'`,
      limit: 1,
    });
    const customerId =
      customers.data[0]?.id ??
      (
        await stripe.customers.create({
          ...(user.email ? { email: user.email } : {}),
          metadata: { userId: user.id },
        })
      ).id;

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: price.id, quantity: 1 }],
      mode: "payment",
      ui_mode: "embedded_page" as Stripe.Checkout.SessionCreateParams.UiMode,
      return_url: data.returnUrl,
      customer: customerId,
      payment_intent_data: { description: "SiteScoper Audit & Fix Pass" },
      metadata: {
        userId: user.id,
        kind: "fix_pass",
        url,
        ...(data.analysisId ? { analysisId: data.analysisId } : {}),
      },
      allow_promotion_codes: true,
    });

    return { clientSecret: session.client_secret };
  });

/** Records a completed pass after Stripe returns the visitor to the app. */
export const confirmFixPass = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const data = (input ?? {}) as { sessionId?: string; environment?: string };
    if (!data.sessionId || typeof data.sessionId !== "string") throw new Error("Missing sessionId");
    return data as { sessionId: string; environment?: string };
  })
  .handler(async ({ data }): Promise<{ ok: boolean; url?: string }> => {
    const { requireSupabaseAuth, adminClient } = await import("@/lib/supabase.server");
    const { user } = await requireSupabaseAuth();
    const { stripe, env } = await stripeFor(data.environment);

    const session = await stripe.checkout.sessions.retrieve(data.sessionId);
    if (session.metadata?.kind !== "fix_pass") return { ok: false };
    if (session.metadata?.userId !== user.id) return { ok: false };
    if (session.payment_status !== "paid") return { ok: false };

    const url = session.metadata?.url ?? "";
    const admin = adminClient();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    await admin.from("fix_passes").upsert(
      {
        user_id: user.id,
        url,
        analysis_id: session.metadata?.analysisId ?? null,
        stripe_session_id: session.id,
        price_id: FIX_PASS_PRICE_ID,
        environment: env,
        amount_cents: session.amount_total ?? null,
        status: "active",
        expires_at: expiresAt,
      },
      { onConflict: "stripe_session_id" },
    );

    // 30 days of Site Watch on the address they just paid to fix.
    if (url) {
      await admin
        .from("monitor_settings")
        .upsert({ user_id: user.id }, { onConflict: "user_id", ignoreDuplicates: true });
      await admin
        .from("monitors")
        .upsert(
          {
            user_id: user.id,
            url,
            kind: "self",
            label: new URL(url).hostname,
            next_run_at: new Date().toISOString(),
          },
          { onConflict: "user_id,url", ignoreDuplicates: true },
        );
    }

    return { ok: true, url };
  });

/** Active passes for the signed-in user. */
export const listFixPasses = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ url: string; expires_at: string }[]> => {
    const { requireSupabaseAuth, adminClient } = await import("@/lib/supabase.server");
    const { user } = await requireSupabaseAuth();
    const { data } = await adminClient()
      .from("fix_passes")
      .select("url,expires_at")
      .eq("user_id", user.id)
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString());
    return (data ?? []) as { url: string; expires_at: string }[];
  },
);
