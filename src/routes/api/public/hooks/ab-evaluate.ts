import { createFileRoute } from "@tanstack/react-router";

/**
 * Reads the results of every running A/B test, ends the ones that have a
 * statistically clear winner, applies that winner as the new default, and
 * starts the next queued test on the same surface. Runs daily via pg_cron.
 *
 * Bounded, single-flight and pausable like every other background job here.
 */

const JOB = "ab-evaluate";
const LEASE_MINUTES = 5;
/** Two-sided 95% confidence. */
const Z_THRESHOLD = 1.96;
/** Give a test at most this multiple of its sample target before calling it flat. */
const PATIENCE = 3;

interface Tally {
  variant: string;
  exposures: number;
  conversions: number;
}

function rate(t: Tally): number {
  return t.exposures > 0 ? t.conversions / t.exposures : 0;
}

/** Two-proportion z score for variant vs control. */
function zScore(a: Tally, b: Tally): number {
  const n1 = a.exposures;
  const n2 = b.exposures;
  if (n1 < 1 || n2 < 1) return 0;
  const p1 = rate(a);
  const p2 = rate(b);
  const pooled = (a.conversions + b.conversions) / (n1 + n2);
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2));
  if (!se) return 0;
  return (p2 - p1) / se;
}

export const Route = createFileRoute("/api/public/hooks/ab-evaluate")({
  server: {
    handlers: {
      POST: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const now = new Date();

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
        await supabaseAdmin.from("job_leases").upsert(
          {
            job_name: JOB,
            locked_until: new Date(now.getTime() + LEASE_MINUTES * 60_000).toISOString(),
            last_run_at: now.toISOString(),
          },
          { onConflict: "job_name" },
        );

        const decided: { key: string; winner: string; note: string }[] = [];
        const started: string[] = [];

        try {
          const { data: running } = await supabaseAdmin
            .from("ab_experiments")
            .select("id,key,name,surface,goal,variants,min_sample,auto_promote,started_at")
            .eq("status", "running")
            .limit(20);

          const { data: results } = await supabaseAdmin.rpc("ab_results");
          const tallies = new Map<string, Tally[]>();
          for (const row of (results ?? []) as {
            experiment_key: string;
            variant: string;
            exposures: number;
            conversions: number;
          }[]) {
            const list = tallies.get(row.experiment_key) ?? [];
            list.push({
              variant: row.variant,
              exposures: Number(row.exposures),
              conversions: Number(row.conversions),
            });
            tallies.set(row.experiment_key, list);
          }

          for (const exp of running ?? []) {
            const list = tallies.get(exp.key) ?? [];
            const control = list.find((t) => t.variant === "control");
            if (!control) continue;

            const ready = list.length > 1 && list.every((t) => t.exposures >= exp.min_sample);
            const impatient = list.every((t) => t.exposures >= exp.min_sample * PATIENCE);
            if (!ready && !impatient) continue;

            const challengers = list.filter((t) => t.variant !== "control");
            let best = control;
            let bestZ = 0;
            for (const c of challengers) {
              const z = zScore(control, c);
              if (rate(c) > rate(best) && z > bestZ) {
                best = c;
                bestZ = z;
              }
            }

            const significant = best.variant !== "control" && bestZ >= Z_THRESHOLD;
            const winner = significant ? best.variant : "control";
            const lift = control.conversions
              ? ((rate(best) - rate(control)) / rate(control)) * 100
              : 0;
            const note = significant
              ? `“${winner}” won with ${(rate(best) * 100).toFixed(1)}% vs ${(rate(control) * 100).toFixed(1)}% (${lift > 0 ? "+" : ""}${lift.toFixed(0)}%, z=${bestZ.toFixed(2)}) over ${list.reduce((n, t) => n + t.exposures, 0)} visitors.`
              : `No clear winner after ${list.reduce((n, t) => n + t.exposures, 0)} visitors — keeping the original.`;

            if (!exp.auto_promote) continue;

            await supabaseAdmin
              .from("ab_experiments")
              .update({
                status: "completed",
                winner,
                result_note: note,
                ended_at: now.toISOString(),
              })
              .eq("id", exp.id);
            decided.push({ key: exp.key, winner, note });

            // Start the next queued test on the same surface.
            const { data: next } = await supabaseAdmin
              .from("ab_experiments")
              .select("id,key")
              .eq("status", "queued")
              .eq("surface", exp.surface)
              .order("priority", { ascending: true })
              .limit(1)
              .maybeSingle();
            if (next) {
              await supabaseAdmin
                .from("ab_experiments")
                .update({ status: "running", started_at: now.toISOString() })
                .eq("id", next.id);
              started.push(next.key);
            }
          }

          // Make sure every surface with queued work has something running, so
          // the programme never goes idle.
          const { data: queued } = await supabaseAdmin
            .from("ab_experiments")
            .select("id,key,surface,priority")
            .eq("status", "queued")
            .order("priority", { ascending: true })
            .limit(20);
          const { data: liveNow } = await supabaseAdmin
            .from("ab_experiments")
            .select("surface")
            .eq("status", "running");
          const busy = new Set((liveNow ?? []).map((r) => r.surface));
          for (const q of queued ?? []) {
            if (busy.has(q.surface)) continue;
            await supabaseAdmin
              .from("ab_experiments")
              .update({ status: "running", started_at: now.toISOString() })
              .eq("id", q.id);
            busy.add(q.surface);
            started.push(q.key);
          }
        } catch (err) {
          await supabaseAdmin
            .from("job_leases")
            .update({
              locked_until: new Date().toISOString(),
              paused_reason: `run failed: ${err instanceof Error ? err.message : String(err)}`.slice(0, 300),
            })
            .eq("job_name", JOB);
          return Response.json({ error: "job failed" }, { status: 500 });
        }

        await supabaseAdmin
          .from("job_leases")
          .update({ locked_until: new Date().toISOString() })
          .eq("job_name", JOB);

        return Response.json({ ok: true, decided, started });
      },
    },
  },
});
