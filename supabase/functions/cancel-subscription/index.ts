import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error('Unauthorized');

    const { environment, resume } = await req.json().catch(() => ({}));
    const env: StripeEnv = environment === 'live' ? 'live' : 'sandbox';

    // Find the most recent subscription row for this user in this env.
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id, stripe_customer_id, status, cancel_at_period_end, current_period_end')
      .eq('user_id', user.id)
      .eq('environment', env)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!sub?.stripe_subscription_id) throw new Error('No active subscription found');

    const stripe = createStripeClient(env);
    // resume=true → un-cancel (turn off cancel_at_period_end). Otherwise, cancel at period end.
    const updated = await stripe.subscriptions.update(sub.stripe_subscription_id, {
      cancel_at_period_end: !resume,
    });

    // Optimistically reflect the change locally; webhook will confirm.
    await supabase
      .from('subscriptions')
      .update({ cancel_at_period_end: !resume })
      .eq('user_id', user.id)
      .eq('environment', env)
      .eq('stripe_subscription_id', sub.stripe_subscription_id);

    const item = updated.items?.data?.[0] as any;
    const periodEnd = item?.current_period_end ?? (updated as any).current_period_end;
    return new Response(
      JSON.stringify({
        cancel_at_period_end: updated.cancel_at_period_end ?? !resume,
        current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : sub.current_period_end,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    console.error('cancel-subscription error', e);
    return new Response(
      JSON.stringify({ error: (e as Error).message || 'Could not update subscription' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});