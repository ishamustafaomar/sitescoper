import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AnalysisResult, AnalysisSuggestion } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Zap, ArrowUpDown, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImpactMatrixProps {
  analysis: AnalysisResult;
}

interface FlatSuggestion extends AnalysisSuggestion {
  category: string;
  categoryIcon: string;
}

const impactRank = { high: 3, medium: 2, low: 1 } as const;
const effortRank = { low: 3, medium: 2, high: 1 } as const;

function scoreSuggestion(s: FlatSuggestion): number {
  const i = impactRank[s.impact ?? "medium"];
  const e = effortRank[s.effort ?? "medium"];
  return i * 10 + e; // higher impact wins; ties broken by lower effort
}

function isQuickWin(s: FlatSuggestion): boolean {
  return s.impact === "high" && s.effort === "low";
}

const impactColor: Record<string, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-primary/10 text-primary border-primary/20",
  low: "bg-muted text-muted-foreground border-border",
};

const effortColor: Record<string, string> = {
  low: "bg-accent/10 text-accent border-accent/20",
  medium: "bg-primary/10 text-primary border-primary/20",
  high: "bg-destructive/10 text-destructive border-destructive/20",
};

type SortMode = "impact" | "effort" | "quickwins";

export function ImpactMatrix({ analysis }: ImpactMatrixProps) {
  const [sortMode, setSortMode] = useState<SortMode>("impact");

  const flat = useMemo<FlatSuggestion[]>(() => {
    return analysis.categories.flatMap((cat) =>
      cat.suggestions.map((s) => ({ ...s, category: cat.name, categoryIcon: cat.icon }))
    );
  }, [analysis]);

  const quickWins = useMemo(() => flat.filter(isQuickWin), [flat]);

  const sorted = useMemo(() => {
    const arr = [...flat];
    if (sortMode === "impact") {
      arr.sort((a, b) => scoreSuggestion(b) - scoreSuggestion(a));
    } else if (sortMode === "effort") {
      arr.sort(
        (a, b) =>
          effortRank[b.effort ?? "medium"] - effortRank[a.effort ?? "medium"] ||
          impactRank[b.impact ?? "medium"] - impactRank[a.impact ?? "medium"]
      );
    } else {
      arr.sort((a, b) => Number(isQuickWin(b)) - Number(isQuickWin(a)) || scoreSuggestion(b) - scoreSuggestion(a));
    }
    return arr;
  }, [flat, sortMode]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Quick wins callout */}
      {quickWins.length > 0 && (
        <div className="bg-gradient-to-br from-accent/10 via-accent/5 to-transparent border border-accent/30 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-accent" />
            <h4 className="font-heading font-semibold text-sm">
              {quickWins.length} quick win{quickWins.length > 1 ? "s" : ""} found
            </h4>
          </div>
          <p className="text-xs text-muted-foreground font-body">
            High impact, low effort — fix these first.
          </p>
        </div>
      )}

      {/* Sort controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-body text-muted-foreground flex items-center gap-1">
          <ArrowUpDown className="h-3 w-3" /> Sort by:
        </span>
        {(["impact", "effort", "quickwins"] as SortMode[]).map((mode) => (
          <Button
            key={mode}
            size="sm"
            variant={sortMode === mode ? "default" : "outline"}
            onClick={() => setSortMode(mode)}
            className="h-7 text-xs px-3"
          >
            {mode === "impact" ? "Impact" : mode === "effort" ? "Effort" : "Quick wins"}
          </Button>
        ))}
        <span className="text-xs font-body text-muted-foreground ml-auto">
          {sorted.length} suggestions
        </span>
      </div>

      {/* Matrix list */}
      <div className="space-y-2">
        {sorted.map((s, idx) => {
          const quick = isQuickWin(s);
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
              className={`rounded-xl border p-4 space-y-2.5 transition-colors ${
                quick
                  ? "bg-accent/5 border-accent/30 hover:bg-accent/10"
                  : "bg-card border-border hover:bg-muted/30"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs">{s.categoryIcon}</span>
                    <span className="text-[10px] font-body text-muted-foreground uppercase tracking-wide">
                      {s.category}
                    </span>
                    {quick && (
                      <Badge variant="outline" className="text-[10px] px-1.5 bg-accent/10 text-accent border-accent/30 gap-1">
                        <Zap className="h-2.5 w-2.5" />
                        Quick win
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-heading font-medium text-sm leading-snug">{s.title}</h4>
                </div>
                <div className="flex flex-col gap-1 shrink-0 items-end">
                  <Badge variant="outline" className={`text-[10px] px-1.5 ${impactColor[s.impact ?? "medium"]}`}>
                    {s.impact ?? "medium"} impact
                  </Badge>
                  <Badge variant="outline" className={`text-[10px] px-1.5 ${effortColor[s.effort ?? "medium"]}`}>
                    {s.effort ?? "medium"} effort
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground font-body leading-relaxed">{s.description}</p>
              {s.tradeoff && (
                <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground font-body bg-muted/40 rounded-md px-2 py-1.5 border border-border">
                  <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5 text-primary" />
                  <span><strong className="text-foreground/80">Tradeoff:</strong> {s.tradeoff}</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
