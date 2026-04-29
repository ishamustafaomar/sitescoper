import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  type StripeEnv,
  createStripeClient,
  getWebhookSecret,
  corsHeaders,
} from "../_shared/stripe.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const url = new URL(req.url);
  const envParam = url.searchParams.get("env");
  const env: StripeEnv = envParam === "live" ? "live" : "sandbox";

  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("No signature", { status: 400 });

  const body = await req.text();
  const stripe = createStripeClient(env);
  const webhookSecret = getWebhookSecret(env);

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response(`Webhook error: ${err instanceof Error ? err.message : "unknown"}`, {
      status: 400,
    });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated"
    ) {
      const sub: any = event.data.object;
      const customerId = sub.customer as string;
      const customer: any = await stripe.customers.retrieve(customerId);
      const email = customer?.email;
      if (!email) return new Response("ok");

      const subscribed = ["active", "trialing"].includes(sub.status);
      const item = sub.items.data[0];
      const price = item.price;
      const lookupKey = price.lookup_key;
      const tier = lookupKey?.includes("yearly") ? "yearly" : "monthly";
      const periodEnd = item.current_period_end ?? sub.current_period_end;
      const endDate = periodEnd ? new Date(periodEnd * 1000).toISOString() : null;
      const userId = sub.metadata?.userId || null;

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
    } else if (event.type === "customer.subscription.deleted") {
      const sub: any = event.data.object;
      const customerId = sub.customer as string;
      const customer: any = await stripe.customers.retrieve(customerId);
      const email = customer?.email;
      if (email) {
        await admin
          .from("subscribers")
          .update({
            subscribed: false,
            subscription_tier: null,
            updated_at: new Date().toISOString(),
          })
          .eq("email", email);
      }
    }
    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("webhook handler error:", e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});