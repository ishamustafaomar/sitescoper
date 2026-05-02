import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FREE_SCANS_PER_MONTH = 1;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ allowed: false, reason: "unauthenticated" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: claims, error: claimsErr } = await supabase.auth.getClaims(authHeader.replace("Bearer ", ""));
  if (claimsErr || !claims?.claims?.sub) {
    return new Response(JSON.stringify({ allowed: false, reason: "unauthenticated" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const userId = claims.claims.sub as string;
  const { environment } = await req.json().catch(() => ({ environment: "sandbox" }));
  const env = environment === "live" ? "live" : "sandbox";

  // Pro = unlimited
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const { data: subRow } = await admin
    .from("subscriptions")
    .select("status, current_period_end, cancel_at_period_end")
    .eq("user_id", userId)
    .eq("environment", env)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const isPro = (() => {
    if (!subRow) return false;
    const end = subRow.current_period_end ? new Date(subRow.current_period_end).getTime() : null;
    const future = end === null || end > Date.now();
    if (["active", "trialing", "past_due"].includes(subRow.status as string) && future) return true;
    if (subRow.status === "canceled" && end && end > Date.now()) return true;
    return false;
  })();

  if (isPro) {
    return new Response(JSON.stringify({ allowed: true, isPro: true, used: 0, limit: null }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Count this calendar month's scans
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  const { count } = await admin
    .from("analysis_history")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", monthStart.toISOString());

  const used = count ?? 0;
  const allowed = used < FREE_SCANS_PER_MONTH;

  return new Response(
    JSON.stringify({ allowed, isPro: false, used, limit: FREE_SCANS_PER_MONTH }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
});