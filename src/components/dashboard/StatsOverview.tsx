import { Globe, BarChart3, TrendingUp } from "lucide-react";
import { TrafficDot, getTrafficLevel, getTrafficStyles, getTrafficLabel } from "@/components/TrafficLight";
import { cn } from "@/lib/utils";

interface StatsOverviewProps {
  websiteCount: number;
  historyCount: number;
  avgScore: number | null;
}

export function StatsOverview({ websiteCount, historyCount, avgScore }: StatsOverviewProps) {
  const level = getTrafficLevel(avgScore);
  const styles = getTrafficStyles(level);
  const stats = [
    { icon: Globe, color: "bg-primary/10 text-primary", value: websiteCount, label: "Tracked sites" },
    { icon: BarChart3, color: "bg-accent/10 text-accent", value: historyCount, label: "Total scans" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {/* Avg score gets the traffic-light treatment */}
      <div className={cn(
        "col-span-2 sm:col-span-1 rounded-2xl border p-5 shadow-[var(--shadow-sm)] flex items-center gap-4",
        avgScore != null ? styles.chip : "bg-card border-border"
      )}>
        <div className={cn(
          "h-12 w-12 rounded-xl flex items-center justify-center font-heading font-bold text-lg shrink-0",
          avgScore != null ? "bg-background/40" : "bg-muted text-muted-foreground"
        )}>
          {avgScore ?? "—"}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <TrafficDot score={avgScore} size="sm" />
            <p className={cn("text-[10px] font-body uppercase tracking-wider font-semibold", avgScore != null ? styles.text : "text-muted-foreground")}>
              {avgScore != null ? getTrafficLabel(level) : "No data yet"}
            </p>
          </div>
          <p className="text-xs text-muted-foreground font-body mt-0.5">Avg health score</p>
        </div>
      </div>

      {stats.map((s) => (
        <div key={s.label} className="bg-card rounded-2xl border border-border p-5 shadow-[var(--shadow-sm)] flex items-center gap-3">
          <div className={`p-2 rounded-lg ${s.color}`}>
            <s.icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xl font-heading font-bold leading-none">{s.value}</p>
            <p className="text-[11px] text-muted-foreground font-body mt-1">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
