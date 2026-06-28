import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Early-access: scanning is free and unlimited for everyone.
const FREE_SCANS_PER_MONTH = Number.POSITIVE_INFINITY;

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

  // Early-access: skip claim validation entirely and unlock scanning for every caller.
  return new Response(
    JSON.stringify({ allowed: true, isPro: true, used: 0, limit: null }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});