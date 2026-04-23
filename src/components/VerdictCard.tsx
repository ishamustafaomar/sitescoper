import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { ScoreRing } from "@/components/ScoreRing";
import { Badge } from "@/components/ui/badge";
import { AnalysisResult, AnalysisSuggestion } from "@/lib/api";

const categoryLabels: Record<string, string> = {
  saas: "SaaS product", marketing: "Marketing site", ecommerce: "E-commerce",
  blog: "Blog", docs: "Documentation", portfolio: "Portfolio",
  community: "Community/Directory", other: "Website",
};

function priorityRank(p?: string) {
  return p === "high" ? 0 : p === "medium" ? 1 : 2;
}
function impactRank(i?: string) {
  return i === "high" ? 0 : i === "medium" ? 1 : 2;
}
function effortRank(e?: string) {
  return e === "low" ? 0 : e === "medium" ? 1 : 2;
}

export function flattenSuggestions(analysis: AnalysisResult): (AnalysisSuggestion & { _category: string; _icon: string })[] {
  return analysis.categories.flatMap((c) =>
    c.suggestions.map((s) => ({ ...s, _category: c.name, _icon: c.icon }))
  );
}

export function rankSuggestions(suggestions: (AnalysisSuggestion & { _category?: string })[]) {
  return [...suggestions].sort((a, b) => {
    const pa = priorityRank(a.priority);
    const pb = priorityRank(b.priority);
    if (pa !== pb) return pa - pb;
    const ia = impactRank(a.impact);
    const ib = impactRank(b.impact);
    if (ia !== ib) return ia - ib;
    return effortRank(a.effort) - effortRank(b.effort);
  });
}

interface Props {
  analysis: AnalysisResult;
  onJumpToImpact?: () => void;
}

export function VerdictCard({ analysis, onJumpToImpact }: Props) {
  const all = flattenSuggestions(analysis);
  const top3 = rankSuggestions(all).slice(0, 3);

  const score = analysis.overall_score;
  const verdict =
    score >= 80 ? "Strong" :
    score >= 65 ? "Solid, with room to grow" :
    score >= 50 ? "Mixed — some clear wins to ship" :
    score >= 35 ? "Needs work — focus on fundamentals" :
    "Critical issues — start at the top";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-[var(--shadow-md)] space-y-5"
    >
      <div className="flex items-start gap-5">
        <ScoreRing score={score} />
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-body uppercase tracking-wider text-muted-foreground">Verdict</span>
            {analysis.site_category && (
              <Badge variant="outline" className="text-[10px] font-body">
                {categoryLabels[analysis.site_category] ?? analysis.site_category}
              </Badge>
            )}
          </div>
          <h2 className="font-heading font-bold text-xl leading-tight">{verdict}</h2>
          <p className="text-sm text-muted-foreground font-body leading-relaxed">
            {analysis.summary}
          </p>
        </div>
      </div>

      {top3.length > 0 && (
        <div className="space-y-2.5 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
              <span className="text-[11px] font-body uppercase tracking-wider text-muted-foreground">
                Top {top3.length} {top3.length === 1 ? "issue" : "issues"} to fix first
              </span>
            </div>
            {onJumpToImpact && (
              <button
                onClick={onJumpToImpact}
                className="text-[11px] font-body text-primary hover:underline inline-flex items-center gap-0.5"
              >
                See all by impact <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
          <ol className="space-y-2">
            {top3.map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/60"
              >
                <span className="shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full bg-destructive/10 text-destructive text-xs font-heading font-semibold">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="text-sm font-heading font-medium leading-snug truncate">{s.title}</p>
                  <p className="text-xs text-muted-foreground font-body leading-relaxed line-clamp-2">
                    {s.impact_reason || s.description}
                  </p>
                </div>
                <Badge variant="outline" className="text-[9px] shrink-0 font-body">
                  {s._category}
                </Badge>
              </li>
            ))}
          </ol>
        </div>
      )}
    </motion.div>
  );
}