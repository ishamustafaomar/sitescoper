import { motion } from "framer-motion";
import { Sparkles, AlertTriangle, TrendingUp, Globe } from "lucide-react";

/**
 * Visually-rich mock report preview shown in the hero. Designed to convey
 * "this is a real polished product" without being an actual screenshot.
 */
export function HeroPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateX: -5 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.7, delay: 0.3 }}
      className="relative"
      style={{ perspective: 1200 }}
    >
      {/* Floating accent badges */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-4 -left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-[hsl(var(--score-good))]/30 shadow-[var(--shadow-md)]"
      >
        <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--score-good))] animate-pulse" />
        <span className="text-[10px] font-heading font-semibold text-[hsl(var(--score-good-text))]">+12 this week</span>
      </motion.div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -bottom-3 -right-2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-primary/30 shadow-[var(--shadow-md)]"
      >
        <Sparkles className="h-3 w-3 text-primary" />
        <span className="text-[10px] font-heading font-semibold text-primary">AI verdict ready</span>
      </motion.div>

      {/* Main report card */}
      <div className="relative bg-card border border-border rounded-2xl shadow-[var(--shadow-lg)] overflow-hidden">
        {/* Browser chrome */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border bg-muted/40">
          <div className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--score-bad))]/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--score-warn))]/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--score-good))]/60" />
          <div className="ml-3 flex-1 h-5 rounded-md bg-background/60 flex items-center px-2 gap-1.5">
            <Globe className="h-2.5 w-2.5 text-muted-foreground" />
            <span className="text-[9px] font-body text-muted-foreground">sitescoper.com/report/acme</span>
          </div>
        </div>

        {/* Score header */}
        <div className="p-5 space-y-4">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <svg width="64" height="64" viewBox="0 0 64 64" className="rotate-[-90deg]">
                <circle cx="32" cy="32" r="28" stroke="hsl(var(--muted))" strokeWidth="6" fill="none" />
                <motion.circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="hsl(var(--primary))"
                  strokeWidth="6"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 28}
                  initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 28 * (1 - 0.72) }}
                  transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-heading font-bold text-lg">72</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[9px] font-body uppercase tracking-wider text-muted-foreground mb-1">
                Verdict
              </div>
              <p className="font-heading font-bold text-sm leading-tight mb-1">
                Solid foundation, weak hero copy.
              </p>
              <p className="text-[10px] text-muted-foreground font-body leading-relaxed line-clamp-2">
                Your value prop is buried below the fold. Move it up and you'll convert noticeably better.
              </p>
            </div>
          </div>

          {/* Top blockers */}
          <div className="space-y-1.5 pt-3 border-t border-border">
            <div className="flex items-center gap-1.5 mb-1.5">
              <AlertTriangle className="h-3 w-3 text-[hsl(var(--score-bad))]" />
              <span className="text-[9px] font-body uppercase tracking-wider text-muted-foreground">Critical blockers</span>
            </div>
            {[
              { text: "Hero headline doesn't say what you do", level: "bad" },
              { text: "No social proof above the fold", level: "warn" },
              { text: "Pricing requires 3 clicks to find", level: "warn" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="flex items-start gap-2 px-2 py-1.5 rounded-md bg-muted/40 border border-border/60"
              >
                <span
                  className={`shrink-0 mt-0.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-[8px] font-heading font-bold ${
                    item.level === "bad"
                      ? "bg-[hsl(var(--score-bad))]/15 text-[hsl(var(--score-bad))]"
                      : "bg-[hsl(var(--score-warn))]/15 text-[hsl(var(--score-warn))]"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="text-[10px] font-body leading-tight flex-1">{item.text}</span>
              </motion.div>
            ))}
          </div>

          {/* Mini category bars */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
            {[
              { name: "Copy", score: 45, level: "bad" },
              { name: "Trust", score: 62, level: "warn" },
              { name: "Design", score: 88, level: "good" },
            ].map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 + i * 0.1 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-body text-muted-foreground">{c.name}</span>
                  <span className={`text-[9px] font-heading font-bold ${
                    c.level === "good" ? "text-[hsl(var(--score-good-text))]" :
                    c.level === "warn" ? "text-[hsl(var(--score-warn-text))]" :
                    "text-[hsl(var(--score-bad-text))]"
                  }`}>{c.score}</span>
                </div>
                <div className="h-1 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${c.score}%` }}
                    transition={{ duration: 1, delay: 1.3 + i * 0.1 }}
                    className={`h-full rounded-full ${
                      c.level === "good" ? "bg-[hsl(var(--score-good))]" :
                      c.level === "warn" ? "bg-[hsl(var(--score-warn))]" :
                      "bg-[hsl(var(--score-bad))]"
                    }`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
