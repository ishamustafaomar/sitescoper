import { createServerFn } from "@tanstack/react-start";

const MAX_SELF = 3;
const MAX_COMPETITORS = 3;

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const parsed = new URL(withScheme);
  if (!/^https?:$/.test(parsed.protocol)) throw new Error("Only http(s) addresses can be watched");
  if (!parsed.hostname.includes(".")) throw new Error("That does not look like a website address");
  return `${parsed.protocol}//${parsed.hostname}${parsed.pathname.replace(/\/$/, "")}`;
}

async function requirePro() {
  const { requireSupabaseAuth, adminClient } = await import("@/lib/supabase.server");
  const { user } = await requireSupabaseAuth();
  const admin = adminClient();

  // A paid Audit & Fix Pass includes 30 days of watching, so it unlocks this too.
  const { data: passes } = await admin
    .from("fix_passes")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString())
    .limit(1);
  if ((passes ?? []).length > 0) return { user, admin };

  const { data: subs } = await admin
    .from("subscriptions")
    .select("status,current_period_end")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);
  const isPro = (subs ?? []).some((s) => {
    const end = s.current_period_end ? new Date(s.current_period_end).getTime() : null;
    const future = end === null || end > Date.now();
    if (["active", "trialing", "past_due"].includes(s.status) && future) return true;
    return s.status === "canceled" && !!end && end > Date.now();
  });
  if (!isPro) throw new Error("Watching sites is part of the Pro plan");
  return { user, admin };
}

export const addMonitor = createServerFn({ method: "POST" })
  .inputValidator((input: { url: string; label?: string; kind: "self" | "competitor" }) => input)
  .handler(async ({ data }) => {
    const { user, admin } = await requirePro();
    const url = normalizeUrl(data.url);
    const kind = data.kind === "competitor" ? "competitor" : "self";

    const { count } = await admin
      .from("monitors")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("kind", kind);
    const cap = kind === "self" ? MAX_SELF : MAX_COMPETITORS;
    if ((count ?? 0) >= cap) {
      throw new Error(
        kind === "self"
          ? `You can watch up to ${cap} of your own sites`
          : `You can track up to ${cap} competitors`,
      );
    }

    const { data: row, error } = await admin
      .from("monitors")
      .insert({
        user_id: user.id,
        url,
        kind,
        label: (data.label || new URL(url).hostname).slice(0, 80),
        next_run_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) {
      throw new Error(
        error.code === "23505" ? "You are already watching that address" : error.message,
      );
    }

    await admin
      .from("monitor_settings")
      .upsert({ user_id: user.id }, { onConflict: "user_id", ignoreDuplicates: true });

    return row;
  });

export const removeMonitor = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const { requireSupabaseAuth, adminClient } = await import("@/lib/supabase.server");
    const { user } = await requireSupabaseAuth();
    await adminClient().from("monitors").delete().eq("id", data.id).eq("user_id", user.id);
    return { ok: true };
  });

export const updateMonitorSettings = createServerFn({ method: "POST" })
  .inputValidator((input: { frequency: "daily" | "weekly"; emailEnabled: boolean }) => input)
  .handler(async ({ data }) => {
    const { user, admin } = await requirePro();
    const frequency = data.frequency === "daily" ? "daily" : "weekly";
    await admin
      .from("monitor_settings")
      .upsert(
        { user_id: user.id, frequency, email_enabled: !!data.emailEnabled },
        { onConflict: "user_id" },
      );
    // Re-space the existing schedule so a change takes effect on the next tick.
    await admin
      .from("monitors")
      .update({ next_run_at: new Date().toISOString() })
      .eq("user_id", user.id);
    return { ok: true };
  });

/** Runs one watched page immediately so the user sees something right away. */
export const checkMonitorNow = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const { user, admin } = await requirePro();
    const { takeSnapshot, diffSnapshots, worstSeverity } = await import(
      "@/lib/site-snapshot.server"
    );

    const { data: monitor } = await admin
      .from("monitors")
      .select("id,url,user_id")
      .eq("id", data.id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!monitor) throw new Error("Not found");

    const snapshot = await takeSnapshot(monitor.url);
    const { data: previous } = await admin
      .from("monitor_snapshots")
      .select("status_code,signals,content_hash")
      .eq("monitor_id", monitor.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    await admin.from("monitor_snapshots").insert({
      monitor_id: monitor.id,
      user_id: user.id,
      status_code: snapshot.statusCode,
      response_ms: snapshot.responseMs,
      content_hash: snapshot.contentHash,
      signals: snapshot.signals as unknown as Record<string, unknown>,
    });

    let recorded = 0;
    if (previous && previous.content_hash !== snapshot.contentHash) {
      const changes = diffSnapshots(
        { statusCode: previous.status_code, signals: previous.signals as never },
        snapshot,
      );
      if (changes.length) {
        recorded = changes.length;
        await admin.from("monitor_changes").insert({
          monitor_id: monitor.id,
          user_id: user.id,
          severity: worstSeverity(changes),
          summary: changes[0]!.label,
          changes: changes as unknown as Record<string, unknown>[],
        });
      }
    }

    await admin
      .from("monitors")
      .update({ last_checked_at: new Date().toISOString() })
      .eq("id", monitor.id);

    return { ok: snapshot.ok, changes: recorded, first: !previous };
  });
