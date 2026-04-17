import { TrendingUp, TrendingDown, Minus, Quote, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AnalysisSuggestion } from "@/lib/api";

const priorityConfig: Record<string, { class: string; icon: typeof TrendingUp }> = {
  high: { class: "bg-destructive/10 text-destructive border-destructive/20", icon: TrendingUp },
  medium: { class: "bg-primary/10 text-primary border-primary/20", icon: Minus },
  low: { class: "bg-accent/10 text-accent border-accent/20", icon: TrendingDown },
};

const typeLabels: Record<string, string> = {
  ux: "UX", content: "Content", seo: "SEO",
  performance: "Perf", accessibility: "A11y", design: "Design",
  product: "Product", strategy: "Strategy", business: "Business", growth: "Growth",
  brand: "Brand", legal: "Legal", analytics: "Analytics",
};

export function SuggestionCard({ suggestion }: { suggestion: AnalysisSuggestion }) {
  const config = priorityConfig[suggestion.priority] || priorityConfig.medium;

  return (
    <div className="p-3 rounded-lg bg-muted/30 space-y-2 hover:bg-muted/50 transition-colors">
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

      {suggestion.evidence && suggestion.evidence.trim().length > 0 && (
        <div className="flex gap-2 items-start p-2 rounded-md bg-background/80 border border-border/60">
          <Quote className="h-3 w-3 text-muted-foreground/60 shrink-0 mt-0.5" />
          <p className="text-[11px] italic text-muted-foreground font-body leading-relaxed">
            "{suggestion.evidence}"
          </p>
        </div>
      )}

      {suggestion.rewrite?.before && suggestion.rewrite?.after && (
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-2 items-center pt-1">
          <div className="p-2 rounded-md bg-destructive/5 border border-destructive/15">
            <div className="text-[9px] font-body uppercase tracking-wider text-destructive/70 mb-0.5">Before</div>
            <p className="text-[11px] font-body leading-snug line-through decoration-destructive/40">
              {suggestion.rewrite.before}
            </p>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/60 hidden sm:block justify-self-center" />
          <div className="p-2 rounded-md bg-accent/5 border border-accent/20">
            <div className="text-[9px] font-body uppercase tracking-wider text-accent/80 mb-0.5">After</div>
            <p className="text-[11px] font-body leading-snug font-medium">
              {suggestion.rewrite.after}
            </p>
          </div>
        </div>
      )}

      {suggestion.tradeoff && (
        <p className="text-[10px] text-muted-foreground/80 font-body italic pt-1 border-t border-border/40">
          ⚖️ Tradeoff: {suggestion.tradeoff}
        </p>
      )}
    </div>
  );
}
