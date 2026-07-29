// Migrated from supabase/functions/cancel-subscription (Deno edge function).
import { createServerFn } from "@tanstack/react-start";
import type { StripeEnv } from "@/lib/stripe-gateway.server";

type Input = { environment?: string; resume?: boolean };

export const cancelSubscription = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => (input ?? {}) as Input)
  .handler(async ({ data }) => {
    const { requireSupabaseAuth, adminClient } = await import("@/lib/supabase.server");
    const { createStripeClient } = await import("@/lib/stripe-gateway.server");

    const { user } = await requireSupabaseAuth();
    const env: StripeEnv = data.environment === "live" ? "live" : "sandbox";
    const resume = !!data.resume;
    const supabase = adminClient();

    const { data: sub } = await supabase
      .from("subscriptions")
      .select("stripe_subscription_id, stripe_customer_id, status, cancel_at_period_end, current_period_end")
      .eq("user_id", user.id)
      .eq("environment", env)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!sub?.stripe_subscription_id) throw new Error("No active subscription found");

    const stripe = createStripeClient(env);
    // resume=true → un-cancel (turn off cancel_at_period_end). Otherwise, cancel at period end.
    const updated = await stripe.subscriptions.update(sub.stripe_subscription_id, {
      cancel_at_period_end: !resume,
    });

    // Optimistically reflect the change locally; webhook will confirm.
    await supabase
      .from("subscriptions")
      .update({ cancel_at_period_end: !resume })
      .eq("user_id", user.id)
      .eq("environment", env)
      .eq("stripe_subscription_id", sub.stripe_subscription_id);

    const item = updated.items?.data?.[0] as { current_period_end?: number } | undefined;
    const periodEnd = item?.current_period_end ?? (updated as unknown as { current_period_end?: number }).current_period_end;
    return {
      cancel_at_period_end: updated.cancel_at_period_end ?? !resume,
      current_period_end: periodEnd
        ? new Date(periodEnd * 1000).toISOString()
        : (sub.current_period_end as string | null),
    };
  });