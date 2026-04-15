import { motion } from "framer-motion";
import { AnalysisResult } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface AnalysisPanelProps {
  analysis: AnalysisResult;
}

function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 80
      ? "hsl(var(--accent))"
      : score >= 50
        ? "hsl(250, 65%, 55%)"
        : "hsl(var(--destructive))";
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
        <motion.circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <span className="absolute text-2xl font-heading font-bold">{score}</span>
    </div>
  );
}

const priorityColors: Record<string, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-primary/10 text-primary border-primary/20",
  low: "bg-accent/10 text-accent border-accent/20",
};

const typeLabels: Record<string, string> = {
  ux: "UX",
  content: "Content",
  seo: "SEO",
  performance: "Performance",
  accessibility: "A11y",
  design: "Design",
};

export function AnalysisPanel({ analysis }: AnalysisPanelProps) {
  const [expandedCategory, setExpandedCategory] = useState<number | null>(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="space-y-6"
    >
      {/* Score Header */}
      <div className="bg-card rounded-2xl border border-border p-6 shadow-[var(--shadow-md)] flex items-center gap-6">
        <ScoreRing score={analysis.overall_score} />
        <div className="flex-1">
          <h2 className="text-xl font-heading font-bold">Overall Score</h2>
          <p className="text-muted-foreground font-body text-sm mt-1">{analysis.summary}</p>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        {analysis.categories.map((category, idx) => (
          <motion.div
            key={category.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * idx }}
            className="bg-card rounded-xl border border-border overflow-hidden shadow-[var(--shadow-sm)]"
          >
            <button
              onClick={() => setExpandedCategory(expandedCategory === idx ? null : idx)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{category.icon}</span>
                <span className="font-heading font-semibold">{category.name}</span>
                <Badge variant="secondary" className="text-xs font-body">
                  {category.score}/100
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
                className="border-t border-border"
              >
                <div className="p-4 space-y-3">
                  {category.suggestions.map((suggestion, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-3 rounded-lg bg-muted/30 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-heading font-medium text-sm">{suggestion.title}</h4>
                        <div className="flex gap-1.5 shrink-0">
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 ${priorityColors[suggestion.priority]}`}
                          >
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
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
