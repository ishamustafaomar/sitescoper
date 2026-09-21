// Temporary one-off: expand the thin legacy articles through the autopilot's
// refresh path (same prompt, same quality gates). Deleted after use.
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { refreshStalePost, logRun, notifyIndexers } from "@/lib/seo-autopilot.server";

const rounds = Number(process.argv[2] ?? 6);
for (let i = 0; i < rounds; i += 1) {
  const started = Date.now();
  try {
    const r = await refreshStalePost(supabaseAdmin);
    if (!r) {
      console.log(`[${i + 1}] nothing left to refresh`);
      break;
    }
    const ping = await notifyIndexers(r.slug);
    await logRun(supabaseAdmin, { action: "refresh", post_slug: r.slug, words: r.words, ok: true, detail: `manual backfill; indexnow ${ping.status}` });
    console.log(`[${i + 1}] refreshed ${r.slug} -> ${r.words} words in ${Math.round((Date.now() - started) / 1000)}s`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await logRun(supabaseAdmin, { action: "refresh", ok: false, detail: `manual backfill: ${msg.slice(0, 400)}` });
    console.log(`[${i + 1}] FAILED: ${msg}`);
    if (/gateway 40[23]/.test(msg)) break;
  }
}
process.exit(0);
