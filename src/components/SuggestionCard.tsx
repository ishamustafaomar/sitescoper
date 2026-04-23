import { useState } from "react";
import { TrendingUp, TrendingDown, Minus, Quote, ArrowRight, ChevronDown, Wrench, AlertCircle } from "lucide-react";
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

interface SuggestionCardProps {
  suggestion: AnalysisSuggestion;
  categoryLabel?: string;
  categoryIcon?: string;
}

export function SuggestionCard({ suggestion, categoryLabel, categoryIcon }: SuggestionCardProps) {
  const config = priorityConfig[suggestion.priority] || priorityConfig.medium;
  const [open, setOpen] = useState(false);

  const hasDetails =
    !!suggestion.evidence ||
    !!(suggestion.rewrite?.before && suggestion.rewrite?.after) ||
    !!suggestion.tradeoff ||
    (!!suggestion.description && suggestion.description.length > 0);

  return (
    <div className="p-3 rounded-lg bg-card border border-border hover:border-border/80 transition-colors space-y-2">
      {/* Header: title + chips */}
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-heading font-medium text-sm leading-snug min-w-0">{suggestion.title}</h4>
        <div className="flex gap-1 shrink-0 flex-wrap justify-end">
          <Badge variant="outline" className={`text-[10px] px-1.5 ${config.class}`}>
            {suggestion.priority}
          </Badge>
          <Badge variant="outline" className="text-[10px] px-1.5">
            {typeLabels[suggestion.type] || suggestion.type}
          </Badge>
          {categoryLabel && (
            <Badge variant="secondary" className="text-[10px] px-1.5 font-body">
              {categoryIcon} {categoryLabel}
            </Badge>
          )}
        </div>
      </div>

      {/* One-glance: why + fix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="flex items-start gap-2 p-2 rounded-md bg-muted/40">
          <AlertCircle className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="min-w-0">
            <div className="text-[9px] font-body uppercase tracking-wider text-muted-foreground mb-0.5">Why it matters</div>
            <p className="text-[11px] font-body leading-snug">
              {suggestion.impact_reason || suggestion.description?.split(/[.!?]/)[0] || "—"}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2 p-2 rounded-md bg-accent/5 border border-accent/15">
          <Wrench className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
          <div className="min-w-0">
            <div className="text-[9px] font-body uppercase tracking-wider text-accent/80 mb-0.5">What to do</div>
            <p className="text-[11px] font-body leading-snug font-medium">
              {suggestion.fix || suggestion.rewrite?.after || "See details below"}
            </p>
          </div>
        </div>
      </div>

      {hasDetails && (
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-[11px] font-body text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
        >
          <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
          {open ? "Hide details" : "Show details"}
        </button>
      )}

      {open && (
        <div className="space-y-2 pt-1">
          {suggestion.description && (
            <p className="text-xs text-muted-foreground font-body leading-relaxed">
              {suggestion.description}
            </p>
          )}

          {suggestion.evidence && suggestion.evidence.trim().length > 0 && (
            <div className="flex gap-2 items-start p-2 rounded-md bg-background border border-border/60">
              <Quote className="h-3 w-3 text-muted-foreground/60 shrink-0 mt-0.5" />
              <p className="text-[11px] italic text-muted-foreground font-body leading-relaxed">
                "{suggestion.evidence}"
              </p>
            </div>
          )}

          {suggestion.rewrite?.before && suggestion.rewrite?.after && (
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-2 items-center">
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
      )}
    </div>
  );
}
