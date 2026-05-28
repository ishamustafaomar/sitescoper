import { useMemo } from "react";
import { AlertTriangle, Flame, Info, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AnalysisCategory, AnalysisSuggestion } from "@/lib/api";

interface Props { categories: AnalysisCategory[] }

export function IssuesByImpactPanel({ categories }: Props) {
  const all = useMemo(
    () => categories.flatMap((c) => c.suggestions.map((s) => ({ ...s, _cat: c.name }))),
    [categories]
  );
  const high = all.filter((s) => s.priority === "high");
  const med = all.filter((s) => s.priority === "medium");
  const low = all.filter((s) => s.priority === "low");

  const buckets = [
    { key: "high", label: "Critical", count: high.length, items: high, icon: Flame, cls: "border-destructive/30 bg-destructive/5 text-destructive" },
    { key: "med", label: "Moderate", count: med.length, items: med, icon: AlertTriangle, cls: "border-primary/30 bg-primary/5 text-primary" },
    { key: "low", label: "Minor", count: low.length, items: low, icon: Info, cls: "border-accent/30 bg-accent/5 text-accent" },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-sm flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" /> Issues by impact
        </h3>
        <span className="text-[11px] text-muted-foreground font-body">{all.length} total</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {buckets.map((b) => (
          <div key={b.key} className={`rounded-xl border p-3 ${b.cls}`}>
            <div className="flex items-center gap-1.5">
              <b.icon className="h-3.5 w-3.5" />
              <span className="text-[10px] font-body uppercase tracking-wider">{b.label}</span>
            </div>
            <p className="font-heading font-bold text-2xl mt-1 leading-none">{b.count}</p>
          </div>
        ))}
      </div>
      <div className="space-y-1.5 max-h-72 overflow-y-auto">
        {[...high, ...med].slice(0, 12).map((s: AnalysisSuggestion & { _cat: string }, i) => (
          <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/30">
            <Badge
              variant="outline"
              className={`text-[9px] shrink-0 mt-0.5 ${
                s.priority === "high" ? "bg-destructive/10 text-destructive border-destructive/30" : "bg-primary/10 text-primary border-primary/30"
              }`}
            >
              {s.priority}
            </Badge>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-heading font-medium">{s.title}</p>
              <p className="text-[11px] text-muted-foreground font-body line-clamp-2">{s.description}</p>
              <span className="text-[9px] text-muted-foreground/70 font-body uppercase tracking-wider">{s._cat}</span>
            </div>
          </div>
        ))}
        {high.length + med.length === 0 && (
          <p className="text-xs text-muted-foreground font-body text-center py-4">No critical or moderate issues — nice work.</p>
        )}
      </div>
    </div>
  );
}