/** Verifies a scheduled-job request carries the shared secret stored in the database. */
export async function verifyCronRequest(request: Request): Promise<boolean> {
  const provided = request.headers.get("x-cron-secret");
  if (!provided) return false;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await (supabaseAdmin as any)
    .from("internal_cron_secret")
    .select("secret")
    .eq("id", 1)
    .maybeSingle();
  return !!data?.secret && data.secret === provided;
}

