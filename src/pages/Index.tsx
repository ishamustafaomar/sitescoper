import { useState, useRef, lazy, Suspense } from "react";
import { Link, useNavigate } from "@/lib/router-compat";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, AlertCircle, ExternalLink, Link2, FileText, Download, Lock, ArrowDown, Swords } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import { UrlInput } from "@/components/UrlInput";
import { CustomInstructions } from "@/components/CustomInstructions";
import { HeroPreview } from "@/components/landing/HeroPreview";
import { WebsitePreview } from "@/components/WebsitePreview";
import { AnalysisPanel } from "@/components/AnalysisPanel";
import { ScanningAnimation } from "@/components/ScanningAnimation";
import { ChatPanel } from "@/components/ChatPanel";
import { AppHeader } from "@/components/AppHeader";
import { EarlyAccessBanner } from "@/components/EarlyAccessBanner";
const WhyPaySection = lazy(() => import("@/components/landing/WhyPaySection").then(m => ({ default: m.WhyPaySection })));
const FeaturesSection = lazy(() => import("@/components/landing/FeaturesSection").then(m => ({ default: m.FeaturesSection })));
const HowItWorksSection = lazy(() => import("@/components/landing/HowItWorksSection").then(m => ({ default: m.HowItWorksSection })));
const CategoriesSection = lazy(() => import("@/components/landing/CategoriesSection").then(m => ({ default: m.CategoriesSection })));
const StatsSection = lazy(() => import("@/components/landing/StatsSection").then(m => ({ default: m.StatsSection })));
const UseCasesSection = lazy(() => import("@/components/landing/UseCasesSection").then(m => ({ default: m.UseCasesSection })));
const FAQSection = lazy(() => import("@/components/landing/FAQSection").then(m => ({ default: m.FAQSection })));
const CTASection = lazy(() => import("@/components/landing/CTASection").then(m => ({ default: m.CTASection })));
const SampleReportSection = lazy(() => import("@/components/landing/SampleReportSection").then(m => ({ default: m.SampleReportSection })));
const SocialProofBar = lazy(() => import("@/components/landing/SocialProofBar").then(m => ({ default: m.SocialProofBar })));
const ManifestoSection = lazy(() => import("@/components/landing/ManifestoSection").then(m => ({ default: m.ManifestoSection })));
import { scrapeWebsiteStream, analyzeWebsite, ScrapeResult, AnalysisResult, TechSeoReport } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { StreamingProgress } from "@/components/StreamingProgress";

const FREE_ANALYSIS_KEY = "sitescoper_free_analysis_used";

type Step = "idle" | "scraping" | "analyzing" | "done";

const Index = () => {
  const [step, setStep] = useState<Step>("idle");
  const [scrapeData, setScrapeData] = useState<ScrapeResult | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [currentUrl, setCurrentUrl] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");
  const [progress, setProgress] = useState<{ percent: number; label: string }>({ percent: 0, label: "" });
  const [liveTechSeo, setLiveTechSeo] = useState<TechSeoReport | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { isPro } = useSubscription();
  const { t } = useTranslation();
  const inputRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [hasUsedFreeAnalysis, setHasUsedFreeAnalysis] = useState(
    () => typeof window !== "undefined" && localStorage.getItem(FREE_ANALYSIS_KEY) === "true"
  );

  const scrollToInput = () => {
    inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleAnalyze = async (url: string) => {
    // Require sign-in for all scans (prevents API credit abuse)
    if (!user) {
      toast({
        title: t("index.toastSignInTitle"),
        description: t("index.toastSignInDesc"),
      });
      navigate("/auth");
      return;
    }

    // Early-access: scanning is free and unlimited. No quota check needed.

    setCurrentUrl(url);
    setScrapeData(null);
    setAnalysis(null);
    setProgress({ percent: 0, label: t("index.progressStarting") });
    setLiveTechSeo(null);

    try {
      setStep("scraping");
      let scraped: ScrapeResult | null = null;
      await scrapeWebsiteStream(url, (ev) => {
        if (ev.type === "progress") setProgress({ percent: ev.percent, label: ev.label });
        else if (ev.type === "tech_seo") setLiveTechSeo(ev.data);
        else if (ev.type === "result") scraped = ev.data;
      });
      // Re-bind through a cast: TS can't see the closure assignment above,
      // so `scraped` would otherwise narrow to `never` after the null check.
      const data = scraped as ScrapeResult | null;
      if (!data) throw new Error("No scrape result");
      setScrapeData(data);

      setStep("analyzing");
      setProgress({ percent: 80, label: t("index.progressReadingLikeVisitor") });
      const result = await analyzeWebsite(data.markdown || "", url, data.images, data.detectedSections, customInstructions);
      setAnalysis(result);
      setStep("done");

      // Link to a tracked website if one matches this URL, so the dashboard
      // shows the latest score instead of "Not analyzed yet".
      let linkedWebsiteId: string | null = null;
      try {
        const { data: existing } = await supabase
          .from("websites")
          .select("id")
          .eq("user_id", user.id)
          .eq("url", url)
          .maybeSingle();
        if (existing?.id) {
          linkedWebsiteId = existing.id;
          await supabase
            .from("websites")
            .update({
              last_score: result.overall_score,
              last_analyzed_at: new Date().toISOString(),
            })
            .eq("id", existing.id);
        }
      } catch (_e) { /* non-fatal */ }

      // Save to history (user is always signed in here)
      await supabase.from("analysis_history").insert({
          user_id: user.id,
          website_id: linkedWebsiteId,
          url,
          overall_score: result.overall_score,
          summary: result.summary,
          categories: result.categories as any,
          custom_instructions: customInstructions.trim() || null,
          scrape_data: {
            screenshot: data.screenshot,
            metadata: data.metadata,
            links: data.links,
            images: data.images,
            image_suggestions: result.image_suggestions,
            site_category: result.site_category,
            category_rationale: result.category_rationale,
            benchmark_percentile: result.benchmark_percentile,
            benchmark_label: result.benchmark_label,
            peer_examples: result.peer_examples,
            action_plan: result.action_plan,
          } as any,
        } as any);
    } catch (err: any) {
      console.error(err);
      toast({
        title: t("index.toastErrorTitle"),
        description: err.message || t("index.toastErrorDefault"),
        variant: "destructive",
      });
      setStep("idle");
    }
  };

  const handleReset = () => {
    setStep("idle");
    setScrapeData(null);
    setAnalysis(null);
    setCurrentUrl("");
  };

  const handleExportPDF = () => {
    if (analysis && currentUrl) {
      import("@/lib/pdf").then(({ generateAnalysisPDF }) => {
        generateAnalysisPDF(analysis, currentUrl, scrapeData ? { metadata: scrapeData.metadata } : undefined);
      });
    }
  };

  const isLoading = step === "scraping" || step === "analyzing";

  return (
    <div className="min-h-screen bg-background">
      <EarlyAccessBanner />
      <AppHeader />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Hero */}
        <AnimatePresence>
          {step === "idle" && !scrapeData && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="relative border border-border"
            >
              <div className="grid lg:grid-cols-[7fr_5fr]">
                {/* Left column — the argument */}
                <div className="p-6 sm:p-10 lg:p-14 border-b lg:border-b-0 lg:border-r border-border flex flex-col justify-between">
                  <div>
                    <div className="inline-block border border-foreground px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] font-body font-semibold mb-8 sm:mb-12">
                      {t("hero.badgeFoundersLine")}
                    </div>

                    <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl leading-[0.92] mb-6">
                      {t("hero.stopGuessingLine1")}
                      <br />
                      {t("hero.stopGuessingLine2")}{" "}
                      <em className="italic">{t("hero.actionableFixes")}</em>
                    </h1>

                    <p className="text-muted-foreground font-body text-base sm:text-lg max-w-xl leading-relaxed mb-8">
                      <Trans i18nKey="hero.description" components={[<strong className="text-foreground font-semibold" />]} />
                    </p>

                    {/* URL Input — the page's primary object */}
                    <div ref={inputRef}>
                      <UrlInput onSubmit={handleAnalyze} isLoading={isLoading} />
                      <div className="mt-3">
                        <CustomInstructions
                          value={customInstructions}
                          onChange={setCustomInstructions}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <p className="mt-4 text-[12px] text-muted-foreground font-body">
                      {t("hero.freePlanBadge")} · {t("hero.freeScansFootnote")}
                    </p>
                  </div>

                  <div className="mt-12 sm:mt-16 pt-6 border-t border-border flex flex-wrap gap-x-8 gap-y-2 text-[11px] uppercase tracking-[0.12em] font-body font-medium text-muted-foreground">
                    <span>{t("hero.signUpForThree")}</span>
                    <span>{t("hero.multiPageCrawl")}</span>
                    <span>{t("hero.export")}</span>
                  </div>
                </div>

                {/* Right column — the evidence */}
                <div className="bg-secondary p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
                  <HeroPreview />
                  <p className="mt-8 font-heading italic text-[13px] leading-snug text-muted-foreground">
                    {t("hero.evidenceCaption", "A real verdict, not a checklist. Every scan is scored the same way.")}
                  </p>
                </div>
              </div>
            </motion.div>

          )}
        </AnimatePresence>

        {/* URL Input — shown when not on idle hero (e.g., during/after scan) */}
        {(step !== "idle" || scrapeData) && (
          <div>
            <UrlInput onSubmit={handleAnalyze} isLoading={isLoading} />
          </div>
        )}

        {/* Loading state — skeleton matches final layout */}
        <AnimatePresence>
          {isLoading && (
            <StreamingProgress
              step={step as "scraping" | "analyzing"}
              url={currentUrl}
              percent={progress.percent}
              label={progress.label || (step === "analyzing" ? t("index.progressAiReading") : t("index.progressWorking"))}
              techSeo={liveTechSeo}
            />
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {scrapeData && step !== "scraping" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Export bar */}
              {analysis && (
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    {currentUrl && (
                      <a
                        href={currentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-body"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Visit site
                      </a>
                    )}
                  </div>
                  <Button variant="hero" size="default" onClick={handleExportPDF} className="rounded-xl">
                    {isPro ? <Download className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    {isPro ? "Download PDF Report" : "Download PDF · Pro"}
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h2 className="font-heading font-semibold text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Link2 className="h-3.5 w-3.5" />
                    Website Preview
                  </h2>
                  <WebsitePreview data={scrapeData} url={currentUrl} />

                  {scrapeData.metadata && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-card rounded-xl border border-border p-4 shadow-[var(--shadow-sm)] space-y-2.5"
                    >
                      <h4 className="font-heading font-semibold text-sm flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        Page Info
                      </h4>
                      {scrapeData.metadata.title && (
                        <p className="text-sm font-body">
                          <span className="text-muted-foreground">Title:</span>{" "}
                          <span className="font-medium">{scrapeData.metadata.title}</span>
                        </p>
                      )}
                      {scrapeData.metadata.description && (
                        <p className="text-sm font-body text-muted-foreground leading-relaxed">
                          {scrapeData.metadata.description}
                        </p>
                      )}
                      {scrapeData.links && (
                        <p className="text-sm font-body">
                          <span className="text-muted-foreground">Links found:</span>{" "}
                          <span className="font-medium">{scrapeData.links.length}</span>
                        </p>
                      )}
                    </motion.div>
                  )}
                </div>

                <div className="space-y-4">
                  <h2 className="font-heading font-semibold text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    AI Analysis
                  </h2>
                  {analysis ? (
                    <AnalysisPanel analysis={analysis} scrapeData={scrapeData ?? undefined} />
                  ) : step === "analyzing" ? null : (
                    <div className="flex items-center gap-2 text-muted-foreground text-sm font-body p-4">
                      <AlertCircle className="h-4 w-4" />
                      Analysis will appear here
                    </div>
                  )}
                </div>
              </div>

              {/* Free-analysis upsell — only when anon user just completed their free analysis */}
              {!user && hasUsedFreeAnalysis && analysis && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-6 text-center space-y-3"
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-body">
                    <Lock className="h-3 w-3" />
                    That was your free analysis
                  </div>
                  <h3 className="text-xl font-heading font-bold">Sign up free to keep going</h3>
                  <p className="text-sm text-muted-foreground font-body max-w-md mx-auto">
                    Save your history, track scores over time, and analyze unlimited websites — no credit card required.
                  </p>
                  <Button variant="hero" onClick={() => navigate("/auth")} className="mt-2">
                    Create free account
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Landing page sections — only visible when idle */}
      {step === "idle" && !scrapeData && (
        <Suspense fallback={null}>
          <SocialProofBar />
          <StatsSection />
          <FeaturesSection />
          <HowItWorksSection />
          <SampleReportSection onTryYours={scrollToInput} />
          <ManifestoSection />
          <CategoriesSection />
          <UseCasesSection />
          <WhyPaySection />
          <FAQSection />
          <CTASection onGetStarted={scrollToInput} />
        </Suspense>
      )}

      <footer className="border-t border-border mt-8 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground font-body">
          <div>SiteScoper — AI website audits that tell you the truth.</div>
          <nav className="flex items-center gap-5" aria-label="Footer">
            <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            <Link to="/ai-website-audit-tool" className="hover:text-foreground transition-colors">AI Audit Tool</Link>
            <Link to="/white-label-seo-reports" className="hover:text-foreground transition-colors">White Label</Link>
            <Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">{t("footer.privacy")}</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">{t("footer.terms")}</Link>
          </nav>
        </div>
      </footer>

      {analysis && user && isPro && (
        <ChatPanel analysis={analysis} scrapeData={scrapeData ?? undefined} url={currentUrl} />
      )}
      {analysis && user && !isPro && (
        <button
          onClick={() => navigate("/pricing")}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-card border border-border shadow-lg hover:shadow-xl transition text-sm font-body"
        >
          <Lock className="h-4 w-4 text-primary" />
          <span>Chat with this report — <span className="text-primary font-semibold">Pro</span></span>
        </button>
      )}
    </div>
  );
};

export default Index;
