import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  Bell,
  Eye,
  Loader2,
  Plus,
  RefreshCw,
  Swords,
  Trash2,
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { ProGate } from "@/components/ProGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  addMonitor,
  checkMonitorNow,
  removeMonitor,
  updateMonitorSettings,
} from "@/lib/monitors.functions";

interface MonitorRow {
  id: string;
  url: string;
  label: string | null;
  kind: "self" | "competitor";
  last_checked_at: string | null;
  next_run_at: string;
}

interface ChangeRow {
  id: string;
  monitor_id: string;
  severity: "info" | "warning" | "critical";
  summary: string | null;
  changes: { label: string; before: string; after: string; severity: string }[];
  created_at: string;
}

interface SnapshotRow {
  monitor_id: string;
  created_at: string;
  signals: Record<string, unknown>;
}

const severityStyle: Record<string, string> = {
  critical: "border-destructive/40 bg-destructive/5 text-destructive",
  warning: "border-accent/40 bg-accent/5 text-accent",
  info: "border-border bg-muted/40 text-muted-foreground",
};

function MonitoringInner() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();

  const [monitors, setMonitors] = useState<MonitorRow[]>([]);
  const [changes, setChanges] = useState<ChangeRow[]>([]);
  const [snapshots, setSnapshots] = useState<SnapshotRow[]>([]);
  const [frequency, setFrequency] = useState<"daily" | "weekly">("weekly");
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [selfUrl, setSelfUrl] = useState("");
  const [competitorUrl, setCompetitorUrl] = useState("");

  const load = useCallback(async () => {
    const [m, c, s, settings] = await Promise.all([
      supabase.from("monitors").select("*").order("created_at", { ascending: true }),
      supabase.from("monitor_changes").select("*").order("created_at", { ascending: false }).limit(40),
      supabase
        .from("monitor_snapshots")
        .select("monitor_id,created_at,signals")
        .order("created_at", { ascending: false })
        .limit(60),
      supabase.from("monitor_settings").select("frequency,email_enabled").maybeSingle(),
    ]);
    setMonitors((m.data ?? []) as MonitorRow[]);
    setChanges((c.data ?? []) as unknown as ChangeRow[]);
    setSnapshots((s.data ?? []) as unknown as SnapshotRow[]);
    if (settings.data) {
      setFrequency((settings.data.frequency as "daily" | "weekly") ?? "weekly");
      setEmailEnabled(settings.data.email_enabled ?? true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) void load();
  }, [user, load]);

  const latestByMonitor = useMemo(() => {
    const map = new Map<string, Record<string, unknown>>();
    for (const snap of snapshots) {
      if (!map.has(snap.monitor_id)) map.set(snap.monitor_id, snap.signals ?? {});
    }
    return map;
  }, [snapshots]);

  const own = monitors.filter((m) => m.kind === "self");
  const competitors = monitors.filter((m) => m.kind === "competitor");

  const add = async (kind: "self" | "competitor") => {
    const url = kind === "self" ? selfUrl : competitorUrl;
    if (!url.trim()) return;
    setBusy(`add-${kind}`);
    try {
      await addMonitor({ data: { url, kind } });
      if (kind === "self") setSelfUrl("");
      else setCompetitorUrl("");
      await load();
      toast({ title: t("monitoring.added") });
    } catch (err) {
      toast({
        title: t("monitoring.addFailed"),
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };

  const remove = async (id: string) => {
    setBusy(id);
    try {
      await removeMonitor({ data: { id } });
      await load();
    } finally {
      setBusy(null);
    }
  };

  const checkNow = async (id: string) => {
    setBusy(id);
    try {
      const res = await checkMonitorNow({ data: { id } });
      await load();
      toast({
        title: res.first
          ? t("monitoring.baselineSaved")
          : res.changes
            ? t("monitoring.foundChanges", { count: res.changes })
            : t("monitoring.noChanges"),
      });
    } catch (err) {
      toast({
        title: t("monitoring.checkFailed"),
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };

  const saveSettings = async (next: { frequency?: "daily" | "weekly"; emailEnabled?: boolean }) => {
    const f = next.frequency ?? frequency;
    const e = next.emailEnabled ?? emailEnabled;
    setFrequency(f);
    setEmailEnabled(e);
    try {
      await updateMonitorSettings({ data: { frequency: f, emailEnabled: e } });
    } catch {
      toast({ title: t("monitoring.settingsFailed"), variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const list = (kind: "self" | "competitor", rows: MonitorRow[]) => (
    <div className="space-y-2">
      {rows.length === 0 && (
        <p className="text-sm text-muted-foreground font-body">
          {kind === "self" ? t("monitoring.emptySelf") : t("monitoring.emptyCompetitors")}
        </p>
      )}
      {rows.map((m) => (
        <div
          key={m.id}
          className="flex items-center justify-between gap-3 border border-border bg-card px-4 py-3"
        >
          <div className="min-w-0">
            <p className="text-sm font-heading font-semibold truncate">{m.label || m.url}</p>
            <p className="text-[11px] text-muted-foreground font-body truncate">
              {m.last_checked_at
                ? t("monitoring.lastChecked", {
                    when: new Date(m.last_checked_at).toLocaleString(),
                  })
                : t("monitoring.notCheckedYet")}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => checkNow(m.id)}
              disabled={busy === m.id}
              aria-label={t("monitoring.checkNow")}
            >
              {busy === m.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => remove(m.id)}
              disabled={busy === m.id}
              aria-label={t("monitoring.remove")}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  const benchmarkRows = [...own, ...competitors].filter((m) => latestByMonitor.has(m.id));

  return (
    <div className="space-y-10">
      {/* Cadence + email */}
      <section className="border border-border bg-card p-5">
        <h2 className="font-heading font-semibold text-base flex items-center gap-2 mb-1">
          <Bell className="h-4 w-4 text-primary" /> {t("monitoring.cadenceTitle")}
        </h2>
        <p className="text-sm text-muted-foreground font-body mb-4">{t("monitoring.cadenceDesc")}</p>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {(["weekly", "daily"] as const).map((f) => (
            <button
              key={f}
              onClick={() => saveSettings({ frequency: f })}
              className={cn(
                "px-3 py-1.5 text-[13px] font-body border",
                frequency === f
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {t(`monitoring.${f}`)}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-3 text-sm font-body">
          <Switch
            checked={emailEnabled}
            onCheckedChange={(v) => saveSettings({ emailEnabled: v })}
          />
          {t("monitoring.emailToggle")}
        </label>
      </section>

      {/* Own sites */}
      <section>
        <h2 className="font-heading font-semibold text-lg flex items-center gap-2 mb-1">
          <Eye className="h-5 w-5 text-primary" /> {t("monitoring.yourSites")}
        </h2>
        <p className="text-sm text-muted-foreground font-body mb-4">{t("monitoring.yourSitesDesc")}</p>
        <div className="flex gap-2 mb-4">
          <Input
            value={selfUrl}
            onChange={(e) => setSelfUrl(e.target.value)}
            placeholder={t("monitoring.yourSitePlaceholder")}
            aria-label={t("monitoring.yourSitePlaceholder")}
            className="font-body"
          />
          <Button onClick={() => add("self")} disabled={busy === "add-self" || !selfUrl.trim()}>
            {busy === "add-self" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {t("monitoring.watch")}
          </Button>
        </div>
        {list("self", own)}
      </section>

      {/* Competitors */}
      <section>
        <h2 className="font-heading font-semibold text-lg flex items-center gap-2 mb-1">
          <Swords className="h-5 w-5 text-primary" /> {t("monitoring.competitors")}
        </h2>
        <p className="text-sm text-muted-foreground font-body mb-4">
          {t("monitoring.competitorsDesc")}
        </p>
        <div className="flex gap-2 mb-4">
          <Input
            value={competitorUrl}
            onChange={(e) => setCompetitorUrl(e.target.value)}
            placeholder={t("monitoring.competitorPlaceholder")}
            aria-label={t("monitoring.competitorPlaceholder")}
            className="font-body"
          />
          <Button
            onClick={() => add("competitor")}
            disabled={busy === "add-competitor" || !competitorUrl.trim()}
          >
            {busy === "add-competitor" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {t("monitoring.track")}
          </Button>
        </div>
        {list("competitor", competitors)}
      </section>

      {/* Side-by-side */}
      {benchmarkRows.length > 1 && (
        <section>
          <h2 className="font-heading font-semibold text-lg mb-4">{t("monitoring.sideBySide")}</h2>
          <div className="overflow-x-auto border border-border bg-card">
            <table className="w-full text-sm font-body">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-3 py-2 font-heading font-semibold">{t("monitoring.colSite")}</th>
                  <th className="px-3 py-2 font-heading font-semibold">{t("monitoring.colHeadline")}</th>
                  <th className="px-3 py-2 font-heading font-semibold">{t("monitoring.colPrices")}</th>
                  <th className="px-3 py-2 font-heading font-semibold">{t("monitoring.colWords")}</th>
                  <th className="px-3 py-2 font-heading font-semibold">{t("monitoring.colAlt")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {benchmarkRows.map((m) => {
                  const s = latestByMonitor.get(m.id) as Record<string, unknown>;
                  const prices = (s?.["prices"] as string[] | undefined) ?? [];
                  return (
                    <tr key={m.id}>
                      <td className="px-3 py-2">
                        <span className="font-semibold">{m.label || m.url}</span>
                        {m.kind === "competitor" && (
                          <span className="ml-2 border border-border px-1.5 py-[1px] text-[9px] uppercase tracking-wider">
                            {t("monitoring.competitorTag")}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 max-w-[260px] truncate">
                        {(s?.["h1"] as string) || (s?.["title"] as string) || "—"}
                      </td>
                      <td className="px-3 py-2">{prices.length ? prices.join(", ") : "—"}</td>
                      <td className="px-3 py-2">{(s?.["wordCount"] as number) ?? "—"}</td>
                      <td className="px-3 py-2">{(s?.["imagesMissingAlt"] as number) ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Timeline */}
      <section>
        <h2 className="font-heading font-semibold text-lg mb-4">{t("monitoring.timeline")}</h2>
        {changes.length === 0 ? (
          <p className="text-sm text-muted-foreground font-body">{t("monitoring.timelineEmpty")}</p>
        ) : (
          <div className="space-y-3">
            {changes.map((c) => {
              const monitor = monitors.find((m) => m.id === c.monitor_id);
              return (
                <div key={c.id} className={cn("border p-4", severityStyle[c.severity])}>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="text-sm font-heading font-semibold text-foreground truncate">
                      {monitor?.label || monitor?.url || t("monitoring.unknownSite")}
                    </p>
                    <span className="text-[11px] font-body shrink-0">
                      {new Date(c.created_at).toLocaleString()}
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {(c.changes ?? []).slice(0, 6).map((item, i) => (
                      <li key={i} className="text-[13px] font-body text-foreground/90">
                        {c.severity === "critical" && (
                          <AlertTriangle className="inline h-3 w-3 mr-1 -mt-[2px]" />
                        )}
                        <span className="font-semibold">{item.label}</span>
                        {item.before && item.before !== "(none)" && item.after && (
                          <span className="text-muted-foreground">
                            {" "}
                            — “{item.before}” → “{item.after}”
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default function Monitoring() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <header className="mb-8">
          <h1 className="font-heading text-3xl md:text-4xl mb-2">{t("monitoring.title")}</h1>
          <p className="text-muted-foreground font-body max-w-2xl">{t("monitoring.subtitle")}</p>
        </header>
        <ProGate title={t("monitoring.gateTitle")} description={t("monitoring.gateDesc")}>
          <MonitoringInner />
        </ProGate>
      </main>
    </div>
  );
}
