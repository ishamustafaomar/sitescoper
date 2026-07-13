import { motion } from "framer-motion";
import { useSubscription } from "@/hooks/useSubscription";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Eye,
  MousePointerClick,
  ShieldCheck,
  Type,
  Layout,
  Smartphone,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * A full, realistic sample report shown on the landing page so visitors
 * see exactly what they'll get before pasting their URL. This is the
 * single biggest conversion lever per user feedback.
 */

const categories = [
  { icon: Type, name: "Copy & Messaging", score: 42, level: "bad", note: "Hero doesn't say what you do in 3s" },
  { icon: Layout, name: "Visual Hierarchy", score: 71, level: "warn", note: "CTA competes with 4 other buttons" },
  { icon: ShieldCheck, name: "Trust & Credibility", score: 58, level: "warn", note: "No logos, testimonials below fold" },
  { icon: MousePointerClick, name: "Conversion Path", score: 49, level: "bad", note: "Pricing takes 3 clicks to reach" },
  { icon: Smartphone, name: "Mobile UX", score: 84, level: "good", note: "Tap targets and spacing feel native" },
  { icon: Eye, name: "Accessibility", score: 76, level: "good", note: "Contrast passes, alt text mostly present" },
];

const findings = [
  {
    severity: "critical",
    title: "Your hero headline is generic — visitors bounce in 4s",
    where: "Above the fold, line 1",
    why: "“Build better, faster” could describe 10,000 SaaS sites. A first-time visitor can't tell what you actually do, who it's for, or why they should care. Eye-tracking studies show 79% of users scan rather than read — if the H1 doesn't land, they leave.",
    fix: "Rewrite as outcome + audience: e.g. “Ship customer-ready landing pages in a weekend — for solo founders without a designer.” Test against the current copy with a 50/50 split.",
  },
  {
    severity: "critical",
    title: "No social proof appears before the first CTA",
    where: "Hero section, right column",
    why: "Your testimonials live at the bottom of the page, but the buy decision happens in the hero. Without logos, ratings, or user counts, the CTA asks for trust you haven't earned yet.",
    fix: "Add a 1-line proof strip directly under the CTA: “Trusted by 2,400+ teams” + 4 customer logos in greyscale. Keep it small — it's a confidence cue, not a feature.",
  },
  {
    severity: "warning",
    title: "Pricing is hidden behind a dropdown menu",
    where: "Top nav → Resources → Pricing",
    why: "Visitors who want to evaluate cost have to hunt. Hidden pricing signals “you can't afford us” to SMBs and adds friction for everyone else. Your bounce rate on the homepage is likely inflated by people who left looking for a price.",
    fix: "Promote Pricing to a top-level nav item. If you can't show numbers, at least show a “Starts at $X” line on the homepage so visitors can self-qualify.",
  },
  {
    severity: "warning",
    title: "5 competing CTAs in the hero create choice paralysis",
    where: "Hero + sticky header",
    why: "I count: “Start free”, “Book a demo”, “Watch video”, “See features”, and a chat bubble. When everything is primary, nothing is. Hick's Law: more options = slower decisions = lower conversion.",
    fix: "Pick one primary action (“Start free — no card”) as a solid filled button. Demote everything else to ghost links or move below the fold.",
  },
];

const verdict = {
  score: 64,
  oneLiner: "Beautiful design, unclear pitch — you're losing buyers in the first 5 seconds.",
  summary:
    "The visual craft here is genuinely good — typography, spacing, and motion all feel premium. But the page is selling itself like a portfolio piece, not a product. A first-time visitor can't answer “what is this and is it for me?” before the first scroll, and that's where conversions die.",
  topWins: [
    "Visual design and motion feel premium and intentional",
    "Mobile experience is clean and tap-friendly",
    "Page weight is reasonable — no obvious performance debt",
  ],
  topRisks: [
    "Generic hero copy fails the 5-second test",
    "Trust signals are absent at the decision moment",
    "Conversion path has too many competing exits",
  ],
};

function levelColor(level: string) {
  if (level === "good") return "hsl(var(--score-good))";
  if (level === "warn") return "hsl(var(--score-warn))";
  return "hsl(var(--score-bad))";
}

export function SampleReportSection({ onTryYours }: { onTryYours: () => void }) {
  const { isPro } = useSubscription();
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-body font-semibold text-primary uppercase tracking-wider">
              Sample report
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-3">
            See exactly what you'll get
          </h2>
          <p className="text-muted-foreground font-body max-w-2xl mx-auto">
            This isn't a Lighthouse score or generic ChatGPT advice. It's a structured,
            opinionated UX audit — the same format you'll get for your site in under 60 seconds.
          </p>
        </div>

        {/* Report card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="bg-card border border-border rounded-2xl shadow-[var(--shadow-lg)] overflow-hidden"
        >
          {/* Browser chrome */}
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-muted/40">
            <div className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--score-bad))]/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--score-warn))]/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--score-good))]/60" />
            <div className="ml-3 flex-1 max-w-md h-6 rounded-md bg-background/60 flex items-center px-2 gap-1.5">
              <span className="text-[10px] font-body text-muted-foreground truncate">
                sitescoper.com/report/sample-saas-landing
              </span>
            </div>
            <span className="text-[10px] font-body text-muted-foreground hidden sm:inline">
              Generated in 47s
            </span>
          </div>

          {/* Verdict */}
          <div className="p-6 md:p-8 border-b border-border">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="relative shrink-0">
                <svg width="120" height="120" viewBox="0 0 120 120" className="rotate-[-90deg]" aria-hidden="true" focusable="false">
                  <circle cx="60" cy="60" r="52" stroke="hsl(var(--muted))" strokeWidth="10" fill="none" />
                  <motion.circle
                    cx="60"
                    cy="60"
                    r="52"
                    stroke="hsl(var(--score-warn))"
                    strokeWidth="10"
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 52}
                    initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                    whileInView={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - verdict.score / 100) }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-heading font-bold text-3xl">{verdict.score}</span>
                  <span className="text-[9px] font-body uppercase tracking-wider text-muted-foreground">
                    /100
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-body uppercase tracking-wider text-muted-foreground mb-2">
                  Overall verdict
                </div>
                <h3 className="font-heading font-bold text-xl md:text-2xl leading-tight mb-3">
                  {verdict.oneLiner}
                </h3>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">
                  {verdict.summary}
                </p>
              </div>
            </div>

            {/* Wins / Risks */}
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="rounded-lg border border-[hsl(var(--score-good))]/30 bg-[hsl(var(--score-good))]/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-4 w-4 text-[hsl(var(--score-good))]" />
                  <span className="text-xs font-heading font-bold uppercase tracking-wider text-[hsl(var(--score-good))]">
                    What's working
                  </span>
                </div>
                <ul className="space-y-2">
                  {verdict.topWins.map((w) => (
                    <li key={w} className="text-xs font-body leading-relaxed flex gap-2">
                      <span className="text-[hsl(var(--score-good))] mt-0.5">✓</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-[hsl(var(--score-bad))]/30 bg-[hsl(var(--score-bad))]/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="h-4 w-4 text-[hsl(var(--score-bad))]" />
                  <span className="text-xs font-heading font-bold uppercase tracking-wider text-[hsl(var(--score-bad))]">
                    What's costing you conversions
                  </span>
                </div>
                <ul className="space-y-2">
                  {verdict.topRisks.map((r) => (
                    <li key={r} className="text-xs font-body leading-relaxed flex gap-2">
                      <span className="text-[hsl(var(--score-bad))] mt-0.5">✗</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Category scores */}
          <div className="p-6 md:p-8 border-b border-border">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h4 className="font-heading font-bold text-sm uppercase tracking-wider">
                Scored across 6 dimensions
              </h4>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categories.map((c, i) => {
                const Icon = c.icon;
                const color = levelColor(c.level);
                return (
                  <motion.div
                    key={c.name}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-lg border border-border bg-muted/20 p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon className="h-3.5 w-3.5 shrink-0" style={{ color }} />
                        <span className="text-xs font-body font-semibold truncate">{c.name}</span>
                      </div>
                      <span
                        className="text-sm font-heading font-bold shrink-0"
                        style={{ color }}
                      >
                        {c.score}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-2">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${c.score}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, delay: i * 0.05 }}
                        className="h-full rounded-full"
                        style={{ background: color }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground font-body leading-snug">
                      {c.note}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Detailed findings */}
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-2 mb-5">
              <AlertTriangle className="h-4 w-4 text-[hsl(var(--score-warn))]" />
              <h4 className="font-heading font-bold text-sm uppercase tracking-wider">
                4 specific findings (with fixes)
              </h4>
            </div>
            <div className="space-y-4">
              {findings.map((f, i) => {
                const isCritical = f.severity === "critical";
                return (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="rounded-lg border border-border bg-muted/10 overflow-hidden"
                  >
                    <div
                      className={`px-4 py-2 flex items-center gap-2 border-b border-border ${
                        isCritical
                          ? "bg-[hsl(var(--score-bad))]/10"
                          : "bg-[hsl(var(--score-warn))]/10"
                      }`}
                    >
                      <span
                        className={`text-[9px] font-heading font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          isCritical
                            ? "bg-[hsl(var(--score-bad))]/20 text-[hsl(var(--score-bad))]"
                            : "bg-[hsl(var(--score-warn))]/20 text-[hsl(var(--score-warn))]"
                        }`}
                      >
                        {f.severity}
                      </span>
                      <span className="text-[10px] font-body text-muted-foreground truncate">
                        {f.where}
                      </span>
                    </div>
                    <div className="p-4 space-y-3">
                      <h5 className="font-heading font-bold text-sm leading-snug">{f.title}</h5>
                      <div>
                        <div className="text-[9px] font-body uppercase tracking-wider text-muted-foreground mb-1">
                          Why it matters
                        </div>
                        <p className="text-xs font-body text-foreground/80 leading-relaxed">
                          {f.why}
                        </p>
                      </div>
                      <div className="rounded-md bg-primary/5 border border-primary/20 p-3">
                        <div className="text-[9px] font-body uppercase tracking-wider text-primary mb-1 font-bold">
                          Recommended fix
                        </div>
                        <p className="text-xs font-body text-foreground/90 leading-relaxed">
                          {f.fix}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* CTA below sample */}
        <div className="text-center mt-10 space-y-4">
          <p className="text-sm text-muted-foreground font-body">
            Every report is structured the same way — verdict, scored dimensions, specific
            findings with fixes. No generic “improve your SEO” fluff.
          </p>
          <Button
            size="lg"
            onClick={onTryYours}
            className="shadow-glow bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-body"
          >
            Get this report for your site
            <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="text-[11px] text-muted-foreground font-body">
            {isPro
              ? "You're on Pro — unlimited scans included"
              : "Free plan includes 3 scans / month · Upgrade to Pro for unlimited"}
          </p>
        </div>
      </div>
    </section>
  );
}