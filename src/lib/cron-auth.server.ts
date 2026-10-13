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

/** Only allow redirects back to this app's own origins. */
export function safeReturnUrl(url: string | undefined, request?: Request | null): string | undefined {
  if (!url) return undefined;
  try {
    const u = new URL(url);
    const allowed = [
      "sitescoper.com",
      "www.sitescoper.com",
      "sitescoper.lovable.app",
      "localhost",
    ];
    const host = u.hostname;
    const ok =
      allowed.includes(host) ||
      host.endsWith(".lovable.app") ||
      host.endsWith(".lovableproject.com") ||
      (request && host === new URL(request.url).hostname);
    if (!ok) return undefined;
    if (u.protocol !== "https:" && host !== "localhost") return undefined;
    return u.toString();
  } catch {
    return undefined;
  }
}
