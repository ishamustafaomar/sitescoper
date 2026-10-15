import { Globe, BarChart3, AlertTriangle, ShieldAlert } from "lucide-react";
import { TrafficDot, getTrafficLevel, getTrafficStyles, getTrafficLabel } from "@/components/TrafficLight";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface StatsOverviewProps {
  websiteCount: number;
  historyCount: number;
  avgScore: number | null;
  criticalIssues?: number;
  sitesAtRisk?: number;
}

export function StatsOverview({ websiteCount, historyCount, avgScore, criticalIssues = 0, sitesAtRisk = 0 }: StatsOverviewProps) {
  const { t } = useTranslation();
  const level = getTrafficLevel(avgScore);
  const styles = getTrafficStyles(level);
  const stats = [
    { icon: AlertTriangle, color: "bg-destructive/10 text-destructive", value: criticalIssues, label: t("dashboard.stats.criticalIssues") },
    { icon: ShieldAlert, color: "bg-destructive/10 text-destructive", value: sitesAtRisk, label: t("dashboard.stats.sitesAtRisk") },
    { icon: Globe, color: "bg-muted text-muted-foreground", value: websiteCount, label: t("dashboard.stats.trackedSites") },
    { icon: BarChart3, color: "bg-muted text-muted-foreground", value: historyCount, label: t("dashboard.stats.totalScans") },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {/* Avg score gets the traffic-light treatment */}
      <div className={cn(
        "col-span-2 sm:col-span-1 min-w-0 rounded-md border p-4 flex items-center gap-3",
        avgScore != null ? styles.chip : "bg-card border-border"
      )}>
        <div className={cn(
          "h-12 w-12 rounded-md flex items-center justify-center font-body font-semibold tabular-nums text-xl shrink-0",
          avgScore != null ? "bg-background/40" : "bg-muted text-muted-foreground"
        )}>
          {avgScore ?? "—"}
        </div>
        <div className="min-w-0">
          <div className="flex items-start gap-1.5">
            <TrafficDot score={avgScore} size="sm" />
            <p className={cn("text-[10px] font-body uppercase tracking-wider font-semibold", avgScore != null ? styles.text : "text-muted-foreground")}>
              {avgScore != null ? getTrafficLabel(level) : t("dashboard.stats.noDataYet")}
            </p>
          </div>
          <p className="text-xs text-muted-foreground font-body mt-0.5">{t("dashboard.stats.avgHealthScore")}</p>
        </div>
      </div>

      {stats.map((s) => (
        <div key={s.label} className="min-w-0 bg-card rounded-md border border-border p-4 flex items-start gap-2.5">
          <div className={`p-2 rounded-md shrink-0 ${s.color}`}>
            <s.icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-body font-semibold tabular-nums leading-none">{s.value}</p>
            <p className="text-xs leading-relaxed text-muted-foreground font-body mt-1">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
