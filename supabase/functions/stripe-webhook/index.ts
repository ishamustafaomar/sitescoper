import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

function lookupKeyFromPrice(price: any): string | null {
  return price?.lookup_key || price?.metadata?.lovable_external_id || null;
}

async function upsertFromSubscription(sub: any, env: StripeEnv) {
  const userId = sub.metadata?.userId;
  if (!userId) {
    console.warn('No userId in subscription metadata', sub.id);
    return;
  }
  const item = sub.items?.data?.[0];
  const price = item?.price;
  const periodEnd = item?.current_period_end || sub.current_period_end;

  await supabase.from('subscriptions').upsert({
    user_id: userId,
    environment: env,
    stripe_customer_id: typeof sub.customer === 'string' ? sub.customer : sub.customer?.id,
    stripe_subscription_id: sub.id,
    price_id: lookupKeyFromPrice(price),
    product_id: typeof price?.product === 'string' ? price.product : price?.product?.id,
    status: sub.status,
    current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    cancel_at_period_end: !!sub.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'stripe_subscription_id' });
}

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const env: StripeEnv = url.searchParams.get('env') === 'live' ? 'live' : 'sandbox';
    const secret = env === 'live'
      ? Deno.env.get('PAYMENTS_LIVE_WEBHOOK_SECRET')
      : Deno.env.get('PAYMENTS_SANDBOX_WEBHOOK_SECRET');
    if (!secret) throw new Error('Missing webhook secret');

    const stripe = createStripeClient(env);
    const signature = req.headers.get('stripe-signature');
    if (!signature) throw new Error('Missing signature');
    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(body, signature, secret);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        if (session.subscription) {
          const fullSub = await stripe.subscriptions.retrieve(session.subscription as string, { expand: ['items.data.price'] });
          // Ensure userId metadata is present
          if (!fullSub.metadata?.userId && session.metadata?.userId) {
            await stripe.subscriptions.update(fullSub.id, { metadata: { userId: session.metadata.userId } });
            (fullSub as any).metadata = { userId: session.metadata.userId };
          }
          await upsertFromSubscription(fullSub, env);
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        await upsertFromSubscription(event.data.object, env);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    console.error('Webhook error:', msg);
    return new Response(JSON.stringify({ error: msg }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
});