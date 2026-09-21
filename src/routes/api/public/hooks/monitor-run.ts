import { createFileRoute } from "@tanstack/react-router";

/**
 * Background watch job for Pro monitoring + competitor radar.
 *
 * Bounded (MAX_CHECKS per run), single-flight (job_leases row), idempotent
 * (next_run_at is advanced in the same step a monitor is processed) and
 * pausable (job_leases.paused_reason stops every entry point).
 *
 * Scheduled hourly by pg_cron; each monitor is only due once per its owner's
 * chosen cadence, so the hourly tick mostly finds nothing to do.
 */

const JOB = "monitor-run";
const MAX_CHECKS = 20;
const MAX_DIGESTS = 25;
const LEASE_MINUTES = 10;

export const Route = createFileRoute("/api/public/hooks/monitor-run")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      POST: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { takeSnapshot, diffSnapshots, worstSeverity } = await import(
          "@/lib/site-snapshot.server"
        );

        const now = new Date();

        // ---- paused-state guard + single-flight lease -------------------
        const { data: lease } = await supabaseAdmin
          .from("job_leases")
          .select("job_name,locked_until,paused_reason")
          .eq("job_name", JOB)
          .maybeSingle();

        if (lease?.paused_reason) {
          return Response.json({ skipped: true, paused: lease.paused_reason });
        }
        if (lease && new Date(lease.locked_until) > now) {
          return Response.json({ skipped: true, reason: "already running" });
        }

        const lockedUntil = new Date(now.getTime() + LEASE_MINUTES * 60_000).toISOString();
        await supabaseAdmin
          .from("job_leases")
          .upsert(
            { job_name: JOB, locked_until: lockedUntil, last_run_at: now.toISOString() },
            { onConflict: "job_name" },
          );

        let checked = 0;
        let changed = 0;
        let digests = 0;

        try {
          // ---- 1. check the monitors that are due -----------------------
          const { data: due } = await supabaseAdmin
            .from("monitors")
            .select("id,user_id,url,label,kind")
            .eq("active", true)
            .lte("next_run_at", now.toISOString())
            .order("next_run_at", { ascending: true })
            .limit(MAX_CHECKS);

          const cadenceCache = new Map<string, "daily" | "weekly">();

          for (const monitor of due ?? []) {
            let cadence = cadenceCache.get(monitor.user_id);
            if (!cadence) {
              const { data: settings } = await supabaseAdmin
                .from("monitor_settings")
                .select("frequency")
                .eq("user_id", monitor.user_id)
                .maybeSingle();
              cadence = (settings?.frequency as "daily" | "weekly") ?? "weekly";
              cadenceCache.set(monitor.user_id, cadence);
            }

            const snapshot = await takeSnapshot(monitor.url);

            const { data: previous } = await supabaseAdmin
              .from("monitor_snapshots")
              .select("status_code,signals,content_hash")
              .eq("monitor_id", monitor.id)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();

            await supabaseAdmin.from("monitor_snapshots").insert({
              monitor_id: monitor.id,
              user_id: monitor.user_id,
              status_code: snapshot.statusCode,
              response_ms: snapshot.responseMs,
              content_hash: snapshot.contentHash,
              signals: snapshot.signals as never,
            });

            if (previous && previous.content_hash !== snapshot.contentHash) {
              const changes = diffSnapshots(
                {
                  statusCode: previous.status_code,
                  signals: previous.signals as never,
                },
                snapshot,
              );
              if (changes.length) {
                changed += 1;
                await supabaseAdmin.from("monitor_changes").insert({
                  monitor_id: monitor.id,
                  user_id: monitor.user_id,
                  severity: worstSeverity(changes),
                  summary: changes[0]!.label,
                  changes: changes as never,
                });
              }
            }

            // Advance the schedule in the same step so a crash never
            // re-processes this monitor in a tight loop.
            const nextRun = new Date(
              now.getTime() + (cadence === "daily" ? 24 : 24 * 7) * 3_600_000,
            ).toISOString();
            await supabaseAdmin
              .from("monitors")
              .update({
                last_checked_at: now.toISOString(),
                next_run_at: nextRun,
                consecutive_failures: snapshot.ok ? 0 : undefined,
              })
              .eq("id", monitor.id);

            checked += 1;
          }

          // ---- 2. send the digests that are due -------------------------
          const { data: settingsRows } = await supabaseAdmin
            .from("monitor_settings")
            .select("user_id,frequency,email_enabled,last_digest_at")
            .eq("email_enabled", true)
            .limit(200);

          const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");

          for (const s of settingsRows ?? []) {
            if (digests >= MAX_DIGESTS) break;

            const intervalMs = (s.frequency === "daily" ? 24 : 24 * 7) * 3_600_000;
            if (s.last_digest_at && now.getTime() - new Date(s.last_digest_at).getTime() < intervalMs) {
              continue;
            }

            const { data: pending } = await supabaseAdmin
              .from("monitor_changes")
              .select("id,monitor_id,severity,changes")
              .eq("user_id", s.user_id)
              .is("notified_at", null)
              .order("created_at", { ascending: false })
              .limit(40);

            if (!pending?.length && !s.last_digest_at) continue;

            const { data: monitors } = await supabaseAdmin
              .from("monitors")
              .select("id,url,label,kind")
              .eq("user_id", s.user_id);
            if (!monitors?.length) continue;

            const byMonitor = new Map<string, { items: string[]; severity: string }>();
            for (const change of pending ?? []) {
              const entry = byMonitor.get(change.monitor_id) ?? { items: [], severity: "info" };
              for (const c of (change.changes as { label: string; before: string; after: string }[]) ?? []) {
                if (entry.items.length >= 6) break;
                entry.items.push(
                  c.before && c.after && c.before !== "(none)"
                    ? `${c.label}: “${c.before}” → “${c.after}”`
                    : c.label,
                );
              }
              const rank = { info: 0, warning: 1, critical: 2 } as Record<string, number>;
              if ((rank[change.severity] ?? 0) > (rank[entry.severity] ?? 0)) {
                entry.severity = change.severity;
              }
              byMonitor.set(change.monitor_id, entry);
            }

            const sites = monitors
              .filter((m) => byMonitor.has(m.id))
              .map((m) => ({
                label: m.label || m.url.replace(/^https?:\/\//, ""),
                url: m.url,
                kind: m.kind,
                severity: byMonitor.get(m.id)!.severity,
                items: byMonitor.get(m.id)!.items,
              }));

            const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(s.user_id);
            const email = authUser?.user?.email;
            if (!email) continue;

            try {
              await sendTemplateEmail("monitor-digest", email, {
                templateData: {
                  period: s.frequency === "daily" ? "in the last 24 hours" : "this week",
                  quiet: sites.length === 0,
                  sites,
                },
                idempotencyKey: `monitor-digest-${s.user_id}-${now.toISOString().slice(0, 13)}`,
              });
              digests += 1;
            } catch (err) {
              // A delivery problem must not stall the whole job or silently
              // vanish — record it and keep going with the next user.
              console.error("monitor digest failed", s.user_id, err);
              continue;
            }

            const ids = (pending ?? []).map((p) => p.id);
            if (ids.length) {
              await supabaseAdmin
                .from("monitor_changes")
                .update({ notified_at: now.toISOString() })
                .in("id", ids);
            }
            await supabaseAdmin
              .from("monitor_settings")
              .update({ last_digest_at: now.toISOString() })
              .eq("user_id", s.user_id);
          }
        } catch (err) {
          await supabaseAdmin
            .from("job_leases")
            .update({
              locked_until: new Date().toISOString(),
              paused_reason: `run failed: ${err instanceof Error ? err.message : String(err)}`.slice(0, 300),
            })
            .eq("job_name", JOB);
          return Response.json({ error: "job failed", checked, changed }, { status: 500 });
        }

        // Release the lease so the next tick can run.
        await supabaseAdmin
          .from("job_leases")
          .update({ locked_until: new Date().toISOString() })
          .eq("job_name", JOB);

        return Response.json({ ok: true, checked, changed, digests });
      },
    },
  },
});
