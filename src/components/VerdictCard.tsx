import { motion } from "framer-motion";
import { AlertTriangle, Sparkles, ArrowRight } from "lucide-react";
import { ScoreRing } from "@/components/ScoreRing";
import { Badge } from "@/components/ui/badge";
import { AnalysisResult, AnalysisSuggestion } from "@/lib/api";
import { useTranslation } from "react-i18next";

function useCategoryLabels(): Record<string, string> {
  const { t } = useTranslation();
  return {
    saas: t("verdictCard.categorySaas"), marketing: t("verdictCard.categoryMarketing"), ecommerce: t("verdictCard.categoryEcommerce"),
    blog: t("verdictCard.categoryBlog"), docs: t("verdictCard.categoryDocs"), portfolio: t("verdictCard.categoryPortfolio"),
    community: t("verdictCard.categoryCommunity"), other: t("verdictCard.categoryOther"),
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
    score >= 80 ? t("verdictCard.verdictStrong") :
    score >= 65 ? t("verdictCard.verdictSolid") :
    score >= 50 ? t("verdictCard.verdictMixed") :
    score >= 35 ? t("verdictCard.verdictNeedsWork") :
    t("verdictCard.verdictCritical");

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
            <span className="text-[10px] font-body uppercase tracking-wider text-muted-foreground">{t("verdictCard.verdict")}</span>
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
          title={t("verdictCard.criticalBlockers")}
          items={blockers}
          icon={AlertTriangle}
          iconClass="text-destructive"
          chipClass="bg-destructive/10 text-destructive"
          emptyText={t("verdictCard.noBlockers")}
        />
        <TopList
          title={t("verdictCard.topOpportunities")}
          items={opportunities}
          icon={Sparkles}
          iconClass="text-primary"
          chipClass="bg-primary/10 text-primary"
          emptyText={t("verdictCard.noOpportunities")}
        />
      </div>

      {onJumpToImpact && (
        <div className="pt-2 flex justify-end">
          <button
            onClick={onJumpToImpact}
            className="text-xs font-body text-primary hover:underline inline-flex items-center gap-1"
          >
            {t("verdictCard.seeFullReport")} <ArrowRight className="h-3 w-3" />
          </button>
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
              className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/40 border border-border/60"
            >
              <span className={`shrink-0 inline-flex items-center justify-center h-5 w-5 rounded-full ${chipClass} text-[10px] font-heading font-semibold`}>
                {i + 1}
              </span>
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-[13px] font-heading font-medium leading-snug">{s.title}</p>
                <p className="text-[11px] text-muted-foreground font-body leading-snug line-clamp-2">
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