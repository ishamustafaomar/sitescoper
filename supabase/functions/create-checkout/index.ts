import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const token = authHeader.replace('Bearer ', '');
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!);
    const { data: userData, error: authErr } = await sb.auth.getUser(token);
    if (authErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const userId = userData.user.id;
    const customerEmail = userData.user.email;
    const { priceId, returnUrl, environment } = await req.json();
    if (!priceId || !/^[a-zA-Z0-9_-]+$/.test(priceId)) throw new Error('Invalid priceId');
    if (!returnUrl) throw new Error('Missing returnUrl');
    const env: StripeEnv = environment === 'live' ? 'live' : 'sandbox';
    const stripe = createStripeClient(env);

    const prices = await stripe.prices.list({ lookup_keys: [priceId] });
    if (!prices.data.length) throw new Error('Price not found');
    const stripePrice = prices.data[0];
    const isRecurring = stripePrice.type === 'recurring';

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: stripePrice.id, quantity: 1 }],
      mode: isRecurring ? 'subscription' : 'payment',
      ui_mode: 'embedded_page',
      return_url: returnUrl,
      ...(customerEmail && { customer_email: customerEmail }),
      metadata: { userId },
      ...(isRecurring && { subscription_data: { metadata: { userId } } }),
    });

    return new Response(JSON.stringify({ clientSecret: session.client_secret }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});