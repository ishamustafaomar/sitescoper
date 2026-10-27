import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, Sparkles, ArrowRight } from "lucide-react";
import { ScoreRing } from "@/components/ScoreRing";
import { Badge } from "@/components/ui/badge";
import { AnalysisResult, AnalysisSuggestion } from "@/lib/api";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

function useCategoryLabels(): Record<string, string> {
  const { t } = useTranslation();
  const text = (key: string, fallback: string) => {
    const translated = t(key, { defaultValue: fallback });
    return translated === key || translated.includes("Card.") ? fallback : translated;
  };
  return {
    saas: text("verdictCard.categorySaas", "SaaS product"), marketing: text("verdictCard.categoryMarketing", "Marketing site"), ecommerce: text("verdictCard.categoryEcommerce", "E-commerce"),
    blog: text("verdictCard.categoryBlog", "Blog"), docs: text("verdictCard.categoryDocs", "Documentation"), portfolio: text("verdictCard.categoryPortfolio", "Portfolio"),
    community: text("verdictCard.categoryCommunity", "Community/Directory"), other: text("verdictCard.categoryOther", "Website"),
  };
}

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
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const text = (key: string, fallback: string) => {
    const translated = t(key, { defaultValue: fallback });
    return translated === key || translated.includes("Card.") ? fallback : translated;
  };
  const categoryLabels = useCategoryLabels();
  const all = flattenSuggestions(analysis);
  const ranked = rankSuggestions(all);

  // Heuristic fallback if AI didn't tag kind: priority:high === blocker
  const isBlocker = (s: AnalysisSuggestion) =>
    s.kind === "blocker" || (!s.kind && s.priority === "high");
  const isOpportunity = (s: AnalysisSuggestion) =>
    s.kind === "opportunity" || (!s.kind && s.priority !== "high");

  const blockers = ranked.filter(isBlocker).slice(0, 3);
  const opportunities = ranked.filter(isOpportunity).slice(0, 3);

  const score = analysis.overall_score;
  const verdict =
    score >= 80 ? text("verdictCard.verdictStrong", "Strong") :
    score >= 65 ? text("verdictCard.verdictSolid", "Solid, with room to grow") :
    score >= 50 ? text("verdictCard.verdictMixed", "Mixed — some clear wins to ship") :
    score >= 35 ? text("verdictCard.verdictNeedsWork", "Needs work — focus on fundamentals") :
    text("verdictCard.verdictCritical", "Critical issues — start at the top");

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-md border border-border bg-card p-4 sm:p-6 space-y-5"
    >
      <div className="grid grid-cols-1 sm:grid-cols-[auto_minmax(0,1fr)] items-start gap-4">
        <div className="shrink-0"><ScoreRing score={score} /></div>
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-body uppercase tracking-wider text-muted-foreground">{text("verdictCard.verdict", "Verdict")}</span>
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

      <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-border">
        <TopList
          title={text("verdictCard.criticalBlockers", "Critical blockers")}
          items={blockers}
          icon={AlertTriangle}
          iconClass="text-destructive"
          chipClass="bg-destructive/10 text-destructive"
          emptyText={text("verdictCard.noBlockers", "No critical blockers — nice.")}
        />
        <TopList
          title={text("verdictCard.topOpportunities", "Top opportunities")}
          items={opportunities}
          icon={Sparkles}
          iconClass="text-primary"
          chipClass="bg-primary/10 text-primary"
          emptyText={text("verdictCard.noOpportunities", "No clear growth opportunities surfaced.")}
        />
      </div>

      {onJumpToImpact && (
        <div className="pt-2 flex justify-end">
          <Button
            variant="link"
            onClick={onJumpToImpact}
            className="text-xs px-0"
          >
            {text("verdictCard.seeFullReport", "See full report")} <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      )}
    </motion.div>
  );
}

function TopList({
  title,
  items,
  icon: Icon,
  iconClass,
  chipClass,
  emptyText,
}: {
  title: string;
  items: (AnalysisSuggestion & { _category?: string })[];
  icon: typeof AlertTriangle;
  iconClass: string;
  chipClass: string;
  emptyText: string;
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-1.5">
        <Icon className={`h-3.5 w-3.5 ${iconClass}`} />
        <span className="text-[11px] font-body uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground font-body italic px-1">{emptyText}</p>
      ) : (
        <ol className="space-y-2">
          {items.map((s, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 py-3 border-t border-border/60"
            >
              <span className={`shrink-0 inline-flex items-center justify-center h-5 w-5 rounded-full ${chipClass} text-xs font-body font-medium`}>
                {i + 1}
              </span>
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-sm font-body font-medium leading-relaxed">
                  {s.title}{" "}
                  <span className="ml-1 align-middle text-[10px] font-normal uppercase tracking-wider text-muted-foreground">
                    {findingBasis(s) === "verified" ? t("suggestionCard.verified") : t("suggestionCard.hypothesis")}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground font-body leading-relaxed">
                  {s.impact_reason || s.fix || s.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}