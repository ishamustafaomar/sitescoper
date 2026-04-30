import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Loader2, ArrowRight, Trophy, Minus } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScanningAnimation } from "@/components/ScanningAnimation";
import { TrafficDot, TrafficChip, getTrafficLevel, getTrafficStyles, getTrafficLabel } from "@/components/TrafficLight";
import { scrapeWebsite, analyzeWebsite, AnalysisResult } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useCanonical } from "@/hooks/useCanonical";
import { cn } from "@/lib/utils";

interface Side {
  url: string;
  analysis: AnalysisResult | null;
  loading: boolean;
}

const empty: Side = { url: "", analysis: null, loading: false };

export default function Compare() {
  useCanonical();
  const { toast } = useToast();
  const [a, setA] = useState<Side>({ ...empty });
  const [b, setB] = useState<Side>({ ...empty });
  const [step, setStep] = useState<"idle" | "scanning" | "done">("idle");

  const normalize = (u: string) => (u.startsWith("http") ? u : "https://" + u);

  const runOne = async (url: string, setter: (s: Side) => void) => {
    setter({ url, analysis: null, loading: true });
    const data = await scrapeWebsite(url);
    const analysis = await analyzeWebsite(data.markdown || "", url, data.images, data.detectedSections);
    setter({ url, analysis, loading: false });
    return analysis;
  };

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!a.url.trim() || !b.url.trim()) return;
    const ua = normalize(a.url.trim());
    const ub = normalize(b.url.trim());
    setStep("scanning");
    try {
      await Promise.all([
        runOne(ua, setA),
        runOne(ub, setB),
      ]);
      setStep("done");
    } catch (err: any) {
      toast({ title: "Compare failed", description: err.message, variant: "destructive" });
      setStep("idle");
    }
  };

  const reset = () => {
    setA({ ...empty });
    setB({ ...empty });
    setStep("idle");
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-body border border-primary/20">
            <Swords className="h-3 w-3" />
            Compare mode
          </div>
          <h1 className="text-3xl md:text-5xl font-heading font-bold tracking-tight">
            Battle two sites,
            <br />
            <span className="bg-gradient-to-r from-primary via-[hsl(265,70%,58%)] to-[hsl(280,70%,60%)] bg-clip-text text-transparent">
              see who wins.
            </span>
          </h1>
          <p className="text-muted-foreground font-body max-w-md mx-auto">
            Scan your site and a competitor head-to-head. Get a direct verdict on who's winning where.
          </p>
        </div>

        {step !== "scanning" && (
          <form onSubmit={handleCompare} className="grid md:grid-cols-[1fr_auto_1fr] gap-3 items-stretch max-w-4xl mx-auto">
            <Input
              type="text"
              placeholder="Your site (e.g. yoursite.com)"
              value={a.url}
              onChange={(e) => setA((s) => ({ ...s, url: e.target.value }))}
              className="h-12 rounded-xl"
            />
            <div className="hidden md:flex items-center justify-center">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-heading font-bold">
                VS
              </div>
            </div>
            <Input
              type="text"
              placeholder="Competitor (e.g. competitor.com)"
              value={b.url}
              onChange={(e) => setB((s) => ({ ...s, url: e.target.value }))}
              className="h-12 rounded-xl"
            />
            <Button type="submit" variant="hero" size="lg" className="md:col-span-3 rounded-xl">
              Start the battle
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        )}

        <AnimatePresence>
          {step === "scanning" && (
            <div className="grid md:grid-cols-2 gap-6">
              <ScanningAnimation step={a.loading ? "scraping" : "analyzing"} url={a.url} />
              <ScanningAnimation step={b.loading ? "scraping" : "analyzing"} url={b.url} />
            </div>
          )}
        </AnimatePresence>

        {step === "done" && a.analysis && b.analysis && (
          <BattleResults a={a} b={b} onReset={reset} />
        )}
      </main>
    </div>
  );
}

function BattleResults({ a, b, onReset }: { a: Side; b: Side; onReset: () => void }) {
  if (!a.analysis || !b.analysis) return null;

  const winnerOverall =
    a.analysis.overall_score === b.analysis.overall_score
      ? "tie"
      : a.analysis.overall_score > b.analysis.overall_score
        ? "a"
        : "b";

  // Build category comparison map
  const categoryMap = new Map<string, { a?: number; b?: number; icon?: string }>();
  a.analysis.categories.forEach((c) => {
    categoryMap.set(c.name, { ...categoryMap.get(c.name), a: c.score, icon: c.icon });
  });
  b.analysis.categories.forEach((c) => {
    categoryMap.set(c.name, { ...categoryMap.get(c.name), b: c.score, icon: c.icon });
  });

  const categories = Array.from(categoryMap.entries()).map(([name, vals]) => ({ name, ...vals }));

  // Wins per side
  const wins = { a: 0, b: 0, tie: 0 };
  categories.forEach((c) => {
    if (c.a == null || c.b == null) return;
    if (c.a === c.b) wins.tie++;
    else if (c.a > c.b) wins.a++;
    else wins.b++;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Verdict */}
      <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-[var(--shadow-md)] text-center space-y-4">
        <div className="inline-flex items-center gap-2 text-xs font-body uppercase tracking-[0.2em] text-muted-foreground">
          <Trophy className="h-3.5 w-3.5" />
          Battle verdict
        </div>
        <h2 className="text-2xl md:text-3xl font-heading font-bold">
          {winnerOverall === "tie" ? (
            <>It's a draw.</>
          ) : (
            <>
              <span className="bg-gradient-to-r from-primary to-[hsl(280,70%,60%)] bg-clip-text text-transparent">
                {hostnameOf((winnerOverall === "a" ? a : b).url)}
              </span>{" "}
              wins overall
            </>
          )}
        </h2>
        <p className="text-sm text-muted-foreground font-body">
          {wins.a} categories vs {wins.b} (with {wins.tie} tied)
        </p>
        <div className="pt-2">
          <Button variant="outline" onClick={onReset}>New battle</Button>
        </div>
      </div>

      {/* Score showdown */}
      <div className="grid md:grid-cols-2 gap-4">
        <ScoreCard side={a} highlight={winnerOverall === "a"} label="Site A" />
        <ScoreCard side={b} highlight={winnerOverall === "b"} label="Site B" />
      </div>

      {/* Category-by-category */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-[var(--shadow-sm)]">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-heading font-semibold text-sm">Category-by-category</h3>
          <span className="text-[10px] font-body uppercase tracking-wider text-muted-foreground">
            Higher = better
          </span>
        </div>
        <div className="divide-y divide-border">
          {categories.map((c) => {
            const winner = c.a == null || c.b == null ? null : c.a === c.b ? "tie" : c.a > c.b ? "a" : "b";
            return (
              <div key={c.name} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-5 py-3">
                <CategoryBar score={c.a} winner={winner === "a"} align="right" />
                <div className="text-center min-w-0 px-2">
                  <p className="text-xs font-heading font-semibold truncate">
                    {c.icon && <span className="mr-1">{c.icon}</span>}
                    {c.name}
                  </p>
                  {winner === "tie" && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-body text-muted-foreground mt-0.5">
                      <Minus className="h-2.5 w-2.5" /> Tied
                    </span>
                  )}
                </div>
                <CategoryBar score={c.b} winner={winner === "b"} align="left" />
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function ScoreCard({ side, highlight, label }: { side: Side; highlight: boolean; label: string }) {
  if (!side.analysis) return null;
  const lvl = getTrafficLevel(side.analysis.overall_score);
  const sty = getTrafficStyles(lvl);
  return (
    <div className={cn(
      "rounded-2xl border p-5 transition-all",
      highlight ? "border-primary shadow-[var(--shadow-glow)] bg-gradient-to-br from-primary/5 to-transparent" : "border-border bg-card"
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {highlight && <Trophy className="h-4 w-4 text-primary shrink-0" />}
          <span className="text-[10px] font-body uppercase tracking-wider text-muted-foreground">{label}</span>
        </div>
        <TrafficChip score={side.analysis.overall_score} showScore={false} />
      </div>
      <p className="font-heading font-bold text-base truncate mb-3">{hostnameOf(side.url)}</p>
      <div className="flex items-baseline gap-2">
        <span className={cn("font-heading font-bold text-5xl", sty.text)}>
          {side.analysis.overall_score}
        </span>
        <span className="text-sm text-muted-foreground font-body">/ 100</span>
      </div>
      <p className="text-xs text-muted-foreground font-body mt-2 line-clamp-2">
        {side.analysis.summary}
      </p>
    </div>
  );
}

function CategoryBar({ score, winner, align }: { score?: number; winner: boolean; align: "left" | "right" }) {
  const lvl = getTrafficLevel(score ?? null);
  const sty = getTrafficStyles(lvl);
  if (score == null) {
    return <div className="text-[10px] text-muted-foreground font-body italic text-center">—</div>;
  }
  return (
    <div className={cn("flex items-center gap-2", align === "right" ? "flex-row-reverse" : "flex-row")}>
      <span className={cn(
        "font-heading font-bold text-sm tabular-nums",
        winner ? sty.text : "text-muted-foreground"
      )}>
        {score}
      </span>
      <div className={cn("h-2 rounded-full bg-muted overflow-hidden flex-1", align === "right" && "flex justify-end")}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={cn("h-full rounded-full", sty.dot, winner && "shadow-[0_0_8px_currentColor]")}
        />
      </div>
    </div>
  );
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
