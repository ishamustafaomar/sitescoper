import { Globe, BarChart3, TrendingUp } from "lucide-react";

interface StatsOverviewProps {
  websiteCount: number;
  historyCount: number;
  avgScore: number | null;
}

export function StatsOverview({ websiteCount, historyCount, avgScore }: StatsOverviewProps) {
  const stats = [
    { icon: Globe, color: "bg-primary/10 text-primary", value: websiteCount, label: "Tracked Websites" },
    { icon: BarChart3, color: "bg-accent/10 text-accent", value: historyCount, label: "Total Analyses" },
    { icon: TrendingUp, color: "bg-primary/10 text-primary", value: avgScore ?? "—", label: "Avg Score" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${s.color}`}>
              <s.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground font-body">{s.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
