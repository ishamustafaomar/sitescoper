import { useEffect, useState } from "react";
import { TrendingUp, Search, Link2, Shield, ExternalLink, Loader2, Sparkles, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

interface Props { url: string }

interface SemrushData {
  connected: boolean;
  quotaExceeded?: boolean;
  domain?: string;
  ranks?: any;
  organic?: any[];
  backlinks?: any;
  refdomains?: any[];
}

function fmt(n: number | string | undefined): string {
  if (n === undefined || n === null || n === "") return "—";
  const num = typeof n === "string" ? Number(n) : n;
  if (!isFinite(num)) return String(n);
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return String(Math.round(num));
}

export function SemrushOverviewPanel({ url }: Props) {
  const { t } = useTranslation();
  const [data, setData] = useState<SemrushData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: res, error } = await supabase.functions.invoke("semrush-overview", { body: { url } });
        if (cancelled) return;
        if (error) throw new Error(error.message);
        setData(res as SemrushData);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load Semrush data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [url]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 flex items-center gap-3">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground font-body">{t("semrush.loading")}</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm font-body text-destructive">
        {t("semrush.errorPrefix")} {error || t("semrush.errorNoData")}
      </div>
    );
  }

  if (!data.connected) {
    return (
      <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 to-transparent p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="font-heading font-semibold text-sm">{t("semrush.unlockTitle")}</h3>
        </div>
        <p className="text-xs text-muted-foreground font-body">
          {t("semrush.unlockDesc")}
        </p>
        <Button size="sm" variant="outline" asChild>
          <a href="/account">{t("semrush.connectButton")}</a>
        </Button>
      </div>
    );
  }

  if (data.quotaExceeded) {
    return (
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 text-primary mt-0.5" />
        <div className="text-sm font-body">
          <p className="font-heading font-semibold">{t("semrush.quotaReachedTitle")}</p>
          <p className="text-muted-foreground text-xs mt-1">{t("semrush.quotaReachedDesc")}</p>
        </div>
      </div>
    );
  }

  const r = data.ranks || {};
  const bl = data.backlinks || {};

  const kpis = [
    { icon: Shield, label: t("semrush.kpiAuthorityScore"), value: fmt(bl.ascore), color: "text-primary", sub: t("semrush.kpiAuthorityScoreSub") },
    { icon: TrendingUp, label: t("semrush.kpiOrganicTraffic"), value: fmt(r.Ot), color: "text-accent", sub: t("semrush.kpiOrganicTrafficSub") },
    { icon: Search, label: t("semrush.kpiOrganicKeywords"), value: fmt(r.Or), color: "text-primary", sub: t("semrush.kpiOrganicKeywordsSub") },
    { icon: Link2, label: t("semrush.kpiBacklinks"), value: fmt(bl.total), color: "text-accent", sub: `${fmt(bl.domains_num)} ${t("semrush.refDomainsSuffix")}` },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          {t("semrush.overviewTitle")}
        </h3>
        <Badge variant="outline" className="text-[10px]">{t("semrush.sourceLabel")} {data.domain}</Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-card p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <k.icon className={`h-3.5 w-3.5 ${k.color}`} />
              <span className="text-[10px] font-body uppercase tracking-wider">{k.label}</span>
            </div>
            <p className="font-heading font-bold text-2xl leading-none">{k.value}</p>
            <p className="text-[10px] text-muted-foreground/70 font-body">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h4 className="font-heading font-semibold text-xs">{t("semrush.topOrganicKeywords")}</h4>
            <span className="text-[10px] text-muted-foreground font-body">{t("semrush.posVolLabel")}</span>
          </div>
          {data.organic && data.organic.length > 0 ? (
            <div className="divide-y divide-border max-h-64 overflow-y-auto">
              {data.organic.map((k: any, i: number) => (
                <div key={i} className="px-4 py-2 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0 flex-1">
                    <p className="font-body truncate">{k.Ph}</p>
                    {k.Ur && (
                      <a href={k.Ur} target="_blank" rel="noopener noreferrer" className="text-[10px] text-muted-foreground hover:text-primary truncate flex items-center gap-1">
                        {k.Ur} <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 font-heading">
                    <Badge variant="secondary" className="text-[10px]">#{k.Po}</Badge>
                    <span className="text-muted-foreground font-body">{fmt(k.Nq)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="p-6 text-xs text-muted-foreground font-body text-center">{t("semrush.noKeywordData")}</p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h4 className="font-heading font-semibold text-xs">{t("semrush.topReferringDomains")}</h4>
            <span className="text-[10px] text-muted-foreground font-body">{t("semrush.asLinksLabel")}</span>
          </div>
          {data.refdomains && data.refdomains.length > 0 ? (
            <div className="divide-y divide-border max-h-64 overflow-y-auto">
              {data.refdomains.map((d: any, i: number) => (
                <div key={i} className="px-4 py-2 flex items-center justify-between gap-3 text-xs">
                  <a
                    href={`https://${d.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-body truncate hover:text-primary flex items-center gap-1 min-w-0"
                  >
                    {d.domain} <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                  </a>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="text-[10px]">AS {d.domain_ascore ?? "—"}</Badge>
                    <span className="text-muted-foreground font-body">{fmt(d.backlinks_num)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="p-6 text-xs text-muted-foreground font-body text-center">{t("semrush.noBacklinkData")}</p>
          )}
        </div>
      </div>
    </div>
  );
}