import { motion } from "framer-motion";
import { AnalysisResult, ScrapeResult } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, LayoutList, Zap, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { ScoreRing } from "@/components/ScoreRing";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImpactMatrix } from "@/components/ImpactMatrix";
import { VisualOverlayView } from "@/components/VisualOverlayView";

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

const priorityConfig: Record<string, { class: string; icon: typeof TrendingUp }> = {
  high: { class: "bg-destructive/10 text-destructive border-destructive/20", icon: TrendingUp },
  medium: { class: "bg-primary/10 text-primary border-primary/20", icon: Minus },
  low: { class: "bg-accent/10 text-accent border-accent/20", icon: TrendingDown },
};

const typeLabels: Record<string, string> = {
  ux: "UX", content: "Content", seo: "SEO",
  performance: "Perf", accessibility: "A11y", design: "Design",
  product: "Product", strategy: "Strategy", business: "Business", growth: "Growth",
};

const categoryLabels: Record<string, string> = {
  saas: "SaaS product",
  marketing: "Marketing site",
  ecommerce: "E-commerce",
  blog: "Blog",
  docs: "Documentation",
  portfolio: "Portfolio",
  community: "Community/Directory",
  other: "Website",
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

  const totalSuggestions = analysis.categories.reduce((sum, c) => sum + c.suggestions.length, 0);
  const hasImageSuggestions = (analysis.image_suggestions?.length ?? 0) > 0 || (scrapeData?.images?.length ?? 0) > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="space-y-4"
    >
      {/* Score Header */}
      <div className="bg-card rounded-2xl border border-border p-6 shadow-[var(--shadow-md)]">
        <div className="flex items-center gap-6">
          <ScoreRing score={analysis.overall_score} />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-heading font-bold">Overall Score</h2>
              {analysis.site_category && (
                <Badge
                  variant="outline"
                  className={`text-[10px] font-body ${categoryColors[analysis.site_category] ?? categoryColors.other}`}
                  title={analysis.category_rationale}
                >
                  Analyzed as: {categoryLabels[analysis.site_category] ?? analysis.site_category}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground font-body text-sm leading-relaxed">{analysis.summary}</p>
            {analysis.category_rationale && (
              <p className="text-[11px] text-muted-foreground/70 font-body italic">
                Category rationale: {analysis.category_rationale}
              </p>
            )}
          </div>
        </div>

        {/* Category overview grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5 pt-5 border-t border-border">
          {analysis.categories.map((cat) => (
            <div key={cat.name} className="flex flex-col gap-1">
              <span className="text-xs font-body text-muted-foreground truncate">{cat.icon} {cat.name}</span>
              <MiniScoreBar score={cat.score} />
            </div>
          ))}
        </div>
      </div>

      {/* Tabs: Categories | Impact Matrix | Visual */}
      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="categories" className="gap-1.5 text-xs">
            <LayoutList className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Categories</span>
            <span className="sm:hidden">List</span>
          </TabsTrigger>
          <TabsTrigger value="matrix" className="gap-1.5 text-xs">
            <Zap className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Impact Matrix</span>
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
                <div className="flex items-center gap-3">
                  <span className="text-lg">{category.icon}</span>
                  <span className="font-heading font-semibold text-sm">{category.name}</span>
                  <Badge variant="secondary" className="text-[10px] font-body">
                    {category.score}/100
                  </Badge>
                  <Badge variant="outline" className="text-[10px] font-body">
                    {category.suggestions.length} tips
                  </Badge>
                </div>
                {expandedCategory === idx ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              {expandedCategory === idx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  className="border-t border-border"
                >
                  <div className="p-4 space-y-2.5">
                    {category.suggestions.map((suggestion, sIdx) => {
                      const config = priorityConfig[suggestion.priority] || priorityConfig.medium;
                      return (
                        <div key={sIdx} className="p-3 rounded-lg bg-muted/30 space-y-2 hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-heading font-medium text-sm leading-snug">{suggestion.title}</h4>
                            <div className="flex gap-1 shrink-0 flex-wrap justify-end">
                              <Badge variant="outline" className={`text-[10px] px-1.5 ${config.class}`}>
                                {suggestion.priority}
                              </Badge>
                              <Badge variant="outline" className="text-[10px] px-1.5">
                                {typeLabels[suggestion.type] || suggestion.type}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground font-body leading-relaxed">
                            {suggestion.description}
                          </p>
                        </div>
                      );
                    })}
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
