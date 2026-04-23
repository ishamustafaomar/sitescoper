import { motion } from "framer-motion";
import { AnalysisResult, ScrapeResult } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, LayoutList, Zap, Image as ImageIcon, Calendar, Flame } from "lucide-react";
import { useState } from "react";
import { ScoreRing } from "@/components/ScoreRing";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImpactMatrix } from "@/components/ImpactMatrix";
import { VisualOverlayView } from "@/components/VisualOverlayView";
import { SuggestionCard } from "@/components/SuggestionCard";
import { ActionPlanView } from "@/components/ActionPlanView";
import { BenchmarkCard } from "@/components/BenchmarkCard";
import { VerdictCard } from "@/components/VerdictCard";
import { ImpactGroupedView } from "@/components/ImpactGroupedView";

interface AnalysisPanelProps {
  analysis: AnalysisResult;
  scrapeData?: ScrapeResult;
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

const categoryLabels: Record<string, string> = {
  saas: "SaaS product", marketing: "Marketing site", ecommerce: "E-commerce",
  blog: "Blog", docs: "Documentation", portfolio: "Portfolio",
  community: "Community/Directory", other: "Website",
};

const categoryColors: Record<string, string> = {
  saas: "bg-primary/10 text-primary border-primary/20",
  marketing: "bg-primary/10 text-primary border-primary/20",
  ecommerce: "bg-accent/10 text-accent border-accent/20",
  blog: "bg-[hsl(280,70%,60%)]/10 text-[hsl(280,70%,60%)] border-[hsl(280,70%,60%)]/20",
  docs: "bg-muted text-foreground border-border",
  portfolio: "bg-accent/10 text-accent border-accent/20",
  community: "bg-primary/10 text-primary border-primary/20",
  other: "bg-muted text-muted-foreground border-border",
};

export function AnalysisPanel({ analysis, scrapeData }: AnalysisPanelProps) {
  const [expandedCategory, setExpandedCategory] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<string>("impact");

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
      {/* Verdict: overall + top 3 issues */}
      <VerdictCard analysis={analysis} onJumpToImpact={() => setActiveTab("impact")} />

      {/* Category overview grid */}
      <div className="bg-card rounded-2xl border border-border p-5 shadow-[var(--shadow-sm)]">
        <div className="text-[10px] font-body uppercase tracking-wider text-muted-foreground mb-3">Category scores</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {analysis.categories.map((cat) => (
            <div key={cat.name} className="flex flex-col gap-1">
              <span className="text-xs font-body text-muted-foreground truncate">{cat.icon} {cat.name}</span>
              <MiniScoreBar score={cat.score} />
            </div>
          ))}
        </div>
      </div>

      {/* Benchmark card */}
      <BenchmarkCard analysis={analysis} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="impact" className="gap-1.5 text-xs">
            <Flame className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">By Impact</span>
            <span className="sm:hidden">Impact</span>
          </TabsTrigger>
          <TabsTrigger value="plan" className="gap-1.5 text-xs" disabled={!hasActionPlan}>
            <Calendar className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Plan</span>
            <span className="sm:hidden">Plan</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-1.5 text-xs">
            <LayoutList className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">By Category</span>
            <span className="sm:hidden">Cat</span>
          </TabsTrigger>
          <TabsTrigger value="matrix" className="gap-1.5 text-xs">
            <Zap className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Matrix</span>
            <span className="sm:hidden">Matrix</span>
            {totalSuggestions > 0 && (
              <Badge variant="secondary" className="ml-0.5 px-1.5 text-[9px] h-4">{totalSuggestions}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="visual" className="gap-1.5 text-xs" disabled={!hasImageSuggestions}>
            <ImageIcon className="h-3.5 w-3.5" />
            Visual
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
              No action plan generated for this analysis.
            </div>
          )}
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
                  <span className="text-lg">{category.icon}</span>
                  <span className="font-heading font-semibold text-sm truncate">{category.name}</span>
                  <Badge variant="secondary" className="text-[10px] font-body shrink-0">
                    {category.score}/100
                  </Badge>
                  <Badge variant="outline" className="text-[10px] font-body shrink-0 hidden sm:inline-flex">
                    {category.suggestions.length} tips
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
                      <div className="text-[10px] font-body uppercase tracking-wider text-muted-foreground">Sub-scores</div>
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
              Visual analysis unavailable for this report.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
