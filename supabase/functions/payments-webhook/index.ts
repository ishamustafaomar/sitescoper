import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, verifyWebhook, createStripeClient } from "../_shared/stripe.ts";

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
  }
  return _supabase;
}

function lookupKey(price: any): string | null {
  return price?.lookup_key || price?.metadata?.lovable_external_id || null;
}

function periodTimes(sub: any) {
  const item = sub.items?.data?.[0];
  const start = item?.current_period_start ?? sub.current_period_start;
  const end = item?.current_period_end ?? sub.current_period_end;
  return {
    start: start ? new Date(start * 1000).toISOString() : null,
    end: end ? new Date(end * 1000).toISOString() : null,
  };
}

async function upsertSubscription(sub: any, env: StripeEnv) {
  const userId = sub.metadata?.userId;
  if (!userId) {
    console.warn("No userId in subscription metadata", sub.id);
    return;
  }
  const item = sub.items?.data?.[0];
  const price = item?.price;
  const { start, end } = periodTimes(sub);

  await getSupabase().from("subscriptions").upsert(
    {
      user_id: userId,
      environment: env,
      stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer?.id,
      stripe_subscription_id: sub.id,
      price_id: lookupKey(price),
      product_id: typeof price?.product === "string" ? price.product : price?.product?.id,
      status: sub.status,
      current_period_start: start,
      current_period_end: end,
      cancel_at_period_end: !!sub.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" }
  );
}

async function handleEvent(event: { type: string; data: { object: any } }, env: StripeEnv) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.subscription) {
        const stripe = createStripeClient(env);
        const fullSub: any = await stripe.subscriptions.retrieve(session.subscription as string, {
          expand: ["items.data.price"],
        });
        if (!fullSub.metadata?.userId && session.metadata?.userId) {
          await stripe.subscriptions.update(fullSub.id, {
            metadata: { userId: session.metadata.userId },
          });
          fullSub.metadata = { userId: session.metadata.userId };
        }
        await upsertSubscription(fullSub, env);
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
      await upsertSubscription(event.data.object, env);
      break;
    case "customer.subscription.deleted": {
      const sub = event.data.object;
      const { start, end } = periodTimes(sub);
      await getSupabase().from("subscriptions").update({
        status: "canceled",
        current_period_start: start,
        current_period_end: end,
        cancel_at_period_end: !!sub.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      }).eq("stripe_subscription_id", sub.id).eq("environment", env);
      break;
    }
    default:
      console.log("Unhandled event:", event.type);
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const rawEnv = new URL(req.url).searchParams.get("env");
  if (rawEnv !== "sandbox" && rawEnv !== "live") {
    console.error("Webhook missing env param:", rawEnv);
    return new Response(JSON.stringify({ received: true, ignored: "invalid env" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  const env: StripeEnv = rawEnv;
  try {
    const event = await verifyWebhook(req, env);
    await handleEvent(event, env);
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Webhook error:", e);
    return new Response("Webhook error", { status: 400 });
  }
});