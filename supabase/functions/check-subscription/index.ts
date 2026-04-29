import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient, corsHeaders } from "../_shared/stripe.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user?.email) {
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const user = userData.user;

    const url = new URL(req.url);
    const envParam = url.searchParams.get("env");
    const env: StripeEnv = envParam === "live" ? "live" : "sandbox";
    const stripe = createStripeClient(env);

    // Find Stripe customer by email
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (!customers.data.length) {
      await upsertSubscriber(user.id, user.email, null, false, null, null);
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const customerId = customers.data[0].id;

    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    let subscribed = false;
    let tier: string | null = null;
    let endDate: string | null = null;

    if (subs.data.length) {
      const sub = subs.data[0];
      subscribed = true;
      const item = sub.items.data[0];
      const price = item.price;
      const lookupKey = price.lookup_key;
      tier = lookupKey?.includes("yearly") ? "yearly" : "monthly";
      const periodEnd = (item as any).current_period_end ?? (sub as any).current_period_end;
      if (periodEnd) endDate = new Date(periodEnd * 1000).toISOString();
    }

    await upsertSubscriber(user.id, user.email, customerId, subscribed, tier, endDate);

    return new Response(
      JSON.stringify({ subscribed, subscription_tier: tier, subscription_end: endDate }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("check-subscription error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error", subscribed: false }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

async function upsertSubscriber(
  userId: string,
  email: string,
  customerId: string | null,
  subscribed: boolean,
  tier: string | null,
  endDate: string | null,
) {
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  await admin.from("subscribers").upsert(
    {
      user_id: userId,
      email,
      stripe_customer_id: customerId,
      subscribed,
      subscription_tier: tier,
      subscription_end: endDate,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email" },
  );
}