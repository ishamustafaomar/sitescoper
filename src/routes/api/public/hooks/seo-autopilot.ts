import { createFileRoute } from "@tanstack/react-router";
import type { TopicRow } from "@/lib/seo-autopilot.server";

/**
 * SEO content autopilot. Publishes one quality-gated article per run from the
 * researched topic queue, or refreshes the thinnest stale article when the
 * queue is empty, then pings IndexNow. Scheduled twice a week via pg_cron.
 *
 * Bounded, single-flight and pausable like the other background jobs:
 * one article per run, at most one run per 20 hours, and a paused_reason on
 * the lease row stops it entirely.
 */

const JOB = "seo-autopilot";
const LEASE_MINUTES = 6;
const COOLDOWN_HOURS = 20;

export const Route = createFileRoute("/api/public/hooks/seo-autopilot")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      POST: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const auto = await import("@/lib/seo-autopilot.server");
        const now = new Date();

        const { data: lease } = await supabaseAdmin
          .from("job_leases")
          .select("job_name,locked_until,paused_reason,last_run_at")
          .eq("job_name", JOB)
          .maybeSingle();
        if (lease?.paused_reason) return Response.json({ skipped: true, paused: lease.paused_reason });
        if (lease && new Date(lease.locked_until) > now) return Response.json({ skipped: true, reason: "already running" });
        if (lease?.last_run_at && now.getTime() - new Date(lease.last_run_at).getTime() < COOLDOWN_HOURS * 3600_000) {
          return Response.json({ skipped: true, reason: "cooldown" });
        }
        await supabaseAdmin.from("job_leases").upsert(
          { job_name: JOB, locked_until: new Date(now.getTime() + LEASE_MINUTES * 60_000).toISOString(), last_run_at: now.toISOString() },
          { onConflict: "job_name" },
        );

        let topic: auto.TopicRow | null = null;
        try {
          const { data } = await supabaseAdmin
            .from("seo_topics")
            .select("id,keyword,angle,intent,priority,status,attempts")
            .eq("status", "queued")
            .order("priority", { ascending: false })
            .order("created_at", { ascending: true })
            .limit(1)
            .maybeSingle();
          topic = (data as auto.TopicRow | null) ?? null;

          if (topic) {
            await supabaseAdmin.from("seo_topics").update({ status: "writing", attempts: topic.attempts + 1 }).eq("id", topic.id);
            const result = await auto.writeTopic(supabaseAdmin, topic);
            await supabaseAdmin.from("seo_topics").update({ status: "done", post_slug: result.slug, done_at: new Date().toISOString(), last_error: null }).eq("id", topic.id);
            const ping = await auto.notifyIndexers(result.slug);
            await auto.logRun(supabaseAdmin, { action: "publish", keyword: topic.keyword, post_slug: result.slug, words: result.words, ok: true, detail: `indexnow ${ping.status}` });
            return Response.json({ action: "publish", slug: result.slug, words: result.words, indexnow: ping.status });
          }

          const refreshed = await auto.refreshStalePost(supabaseAdmin);
          if (!refreshed) {
            await auto.logRun(supabaseAdmin, { action: "idle", ok: true, detail: "queue empty and no stale thin posts" });
            return Response.json({ action: "idle" });
          }
          const ping = await auto.notifyIndexers(refreshed.slug);
          await auto.logRun(supabaseAdmin, { action: "refresh", post_slug: refreshed.slug, words: refreshed.words, ok: true, detail: `indexnow ${ping.status}` });
          return Response.json({ action: "refresh", slug: refreshed.slug, words: refreshed.words, indexnow: ping.status });
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          if (err instanceof auto.PauseError) {
            // Circuit breaker: stop every future run until the owner clears paused_reason.
            await supabaseAdmin.from("job_leases").update({ paused_reason: message.slice(0, 300) }).eq("job_name", JOB);
          }
          if (topic) {
            const exhausted = topic.attempts + 1 >= 3;
            await supabaseAdmin
              .from("seo_topics")
              .update({ status: exhausted ? "failed" : "queued", last_error: message.slice(0, 500) })
              .eq("id", topic.id);
          }
          await auto.logRun(supabaseAdmin, { action: topic ? "publish" : "refresh", keyword: topic?.keyword ?? null, ok: false, detail: message.slice(0, 500) });
          return Response.json({ ok: false, error: message }, { status: 500 });
        } finally {
          await supabaseAdmin.from("job_leases").update({ locked_until: new Date().toISOString() }).eq("job_name", JOB);
        }
      },
    },
  },
});
