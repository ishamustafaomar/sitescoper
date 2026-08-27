import { motion } from "framer-motion";
import { AnalysisResult, ScrapeResult } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, LayoutList, Zap, Image as ImageIcon, Calendar, Flame, AlertCircle, ArrowDown, Wand2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImpactMatrix } from "@/components/ImpactMatrix";
import { VisualOverlayView } from "@/components/VisualOverlayView";
import { SuggestionCard } from "@/components/SuggestionCard";
import { ActionPlanView } from "@/components/ActionPlanView";
import { BenchmarkCard } from "@/components/BenchmarkCard";
import { VerdictCard } from "@/components/VerdictCard";
import { ImpactGroupedView } from "@/components/ImpactGroupedView";
import { HeadlineRewrites } from "@/components/HeadlineRewrites";
import { Button } from "@/components/ui/button";

interface AnalysisPanelProps {
  analysis: AnalysisResult;
  scrapeData?: ScrapeResult;
  /** Return true to block expanding the full report (e.g. require sign-in). */
  onRequestFullReport?: () => boolean | void;
}

function MiniScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? "bg-accent" : score >= 50 ? "bg-primary" : "bg-destructive";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-border overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <span className="text-xs font-heading font-semibold text-muted-foreground">{score}</span>
    </div>
  );
}

export function AnalysisPanel({ analysis, scrapeData, onRequestFullReport }: AnalysisPanelProps) {
  const { t } = useTranslation();
  const text = (key: string, fallback: string) => {
    const translated = t(key, { defaultValue: fallback });
    return translated === key || translated.includes("Panel.") ? fallback : translated;
  };
  const [expandedCategory, setExpandedCategory] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<string>("impact");
  const [showFull, setShowFull] = useState(false);

  const openFull = () => {
    if (onRequestFullReport?.() === true) return;
    setShowFull(true);
  };

  const totalSuggestions = analysis.categories.reduce((sum, c) => sum + c.suggestions.length, 0);
  const hasImageSuggestions = (analysis.image_suggestions?.length ?? 0) > 0 || (scrapeData?.images?.length ?? 0) > 0;
  const hasActionPlan = (analysis.action_plan?.days?.length ?? 0) > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="space-y-4"
    >
      {/* Partial-data banner */}
      {scrapeData?.partial && (
        <div className="rounded-xl border border-primary/30 bg-primary/10 p-3 flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p className="text-xs font-body text-foreground/90 leading-relaxed">
            {scrapeData.partialReason ||
              text("analysisPanel.partialResultsDefault", "Partial results — we couldn't load all of this site's content.")}
          </p>
        </div>
      )}

      {/* Layer 1: Verdict only — overall + 3 blockers + 3 opportunities */}
      <VerdictCard
        analysis={analysis}
        onJumpToImpact={() => openFull()}
      />

      {!showFull && (
        <div className="flex flex-col items-center gap-2 pt-2 pb-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => openFull()}
            className="gap-2"
          >
            {text("analysisPanel.seeFullReport", "See full report")}
            <ArrowDown className="h-4 w-4" />
          </Button>
          <p className="text-[11px] text-muted-foreground font-body">
            {text("analysisPanel.seeFullReportSub", "Category scores, action plan, and deep diagnostics")}
          </p>
        </div>
      )}

      {!showFull && null}
      {showFull && (
        <>

      {/* Category overview grid */}
      <div className="bg-card rounded-2xl border border-border p-5 shadow-[var(--shadow-sm)]">
        <div className="text-[10px] font-body uppercase tracking-wider text-muted-foreground mb-3">{t("analysisPanel.categoryScoresLabel")}</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {analysis.categories.map((cat) => (
            <div key={cat.name} className="flex flex-col gap-1">
              <span className="text-xs font-body text-muted-foreground truncate">{cat.name}</span>
              <MiniScoreBar score={cat.score} />
            </div>
          ))}
        </div>
      </div>

      {/* Benchmark card */}
      <BenchmarkCard analysis={analysis} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="impact" className="gap-1.5 text-xs">
            <Flame className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t("analysisPanel.tabs.byImpact")}</span>
            <span className="sm:hidden">{t("analysisPanel.tabs.impactShort")}</span>
          </TabsTrigger>
          <TabsTrigger value="plan" className="gap-1.5 text-xs" disabled={!hasActionPlan}>
            <Calendar className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t("analysisPanel.tabs.plan")}</span>
            <span className="sm:hidden">{t("analysisPanel.tabs.plan")}</span>
          </TabsTrigger>
          <TabsTrigger value="rewrite" className="gap-1.5 text-xs">
            <Wand2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t("analysisPanel.tabs.rewrite")}</span>
            <span className="sm:hidden">{t("analysisPanel.tabs.rewriteShort")}</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-1.5 text-xs">
            <LayoutList className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t("analysisPanel.tabs.byCategory")}</span>
            <span className="sm:hidden">{t("analysisPanel.tabs.byCategoryShort")}</span>
          </TabsTrigger>
          <TabsTrigger value="matrix" className="gap-1.5 text-xs">
            <Zap className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t("analysisPanel.tabs.matrix")}</span>
            <span className="sm:hidden">{t("analysisPanel.tabs.matrix")}</span>
            {totalSuggestions > 0 && (
              <Badge variant="secondary" className="ml-0.5 px-1.5 text-[9px] h-4">{totalSuggestions}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="visual" className="gap-1.5 text-xs" disabled={!hasImageSuggestions}>
            <ImageIcon className="h-3.5 w-3.5" />
            {t("analysisPanel.tabs.visual")}
          </TabsTrigger>
        </TabsList>

        {/* By Impact (NEW default) */}
        <TabsContent value="impact" className="mt-4">
          <ImpactGroupedView analysis={analysis} />
        </TabsContent>

        {/* Action Plan tab */}
        <TabsContent value="plan" className="mt-4">
          {hasActionPlan && analysis.action_plan ? (
            <ActionPlanView plan={analysis.action_plan} />
          ) : (
            <div className="bg-card rounded-xl border border-border p-6 text-center text-sm text-muted-foreground font-body">
              {t("analysisPanel.noActionPlan")}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rewrite" className="mt-4">
          <HeadlineRewrites
            url={scrapeData?.metadata?.sourceURL || ""}
            markdown={scrapeData?.markdown || ""}
            summary={analysis.summary}
            site_category={analysis.site_category}
          />
        </TabsContent>

        {/* Categories tab */}
        <TabsContent value="categories" className="space-y-2 mt-4">
          {analysis.categories.map((category, idx) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * idx }}
              className="bg-card rounded-xl border border-border overflow-hidden shadow-[var(--shadow-sm)]"
            >
              <button
                onClick={() => setExpandedCategory(expandedCategory === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-heading font-semibold text-sm truncate">{category.name}</span>
                  <Badge variant="secondary" className="text-[10px] font-body shrink-0">
                    {category.score}/100
                  </Badge>
                  <Badge variant="outline" className="text-[10px] font-body shrink-0 hidden sm:inline-flex">
                    {category.suggestions.length} {t("analysisPanel.tipsBadgeSuffix")}
                  </Badge>
                </div>
                {expandedCategory === idx ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
              </button>

              {expandedCategory === idx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  className="border-t border-border"
                >
                  {/* Sub-scores */}
                  {category.sub_scores && category.sub_scores.length > 0 && (
                    <div className="p-4 bg-muted/20 border-b border-border space-y-2">
                      <div className="text-[10px] font-body uppercase tracking-wider text-muted-foreground">{t("analysisPanel.subScoresLabel")}</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                        {category.sub_scores.map((s) => (
                          <div key={s.name} className="flex items-center justify-between gap-2 text-xs font-body">
                            <span className="text-muted-foreground truncate">{s.name}</span>
                            <MiniScoreBar score={s.score} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-4 space-y-2.5">
                    {category.suggestions.map((suggestion, sIdx) => (
                      <SuggestionCard key={sIdx} suggestion={suggestion} />
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </TabsContent>

        {/* Impact Matrix tab */}
        <TabsContent value="matrix" className="mt-4">
          <ImpactMatrix analysis={analysis} />
        </TabsContent>

        {/* Visual tab */}
        <TabsContent value="visual" className="mt-4">
          {scrapeData ? (
            <VisualOverlayView scrapeData={scrapeData} analysis={analysis} />
          ) : (
            <div className="bg-card rounded-xl border border-border p-6 text-center text-sm text-muted-foreground font-body">
              {t("analysisPanel.visualUnavailable")}
            </div>
          )}
        </TabsContent>
      </Tabs>
        </>
      )}
    </motion.div>
  );
}
