/** Only allow redirects back to this app's own origins. */
export function safeReturnUrl(url: string | undefined): string | undefined {
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
      host.endsWith(".lovableproject.com");
    if (!ok) return undefined;
    if (u.protocol !== "https:" && host !== "localhost") return undefined;
    return url;
  } catch {
    return undefined;
  }
}
