import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, AlertCircle, ExternalLink, Link2, FileText, Download, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { UrlInput } from "@/components/UrlInput";
import { WebsitePreview } from "@/components/WebsitePreview";
import { AnalysisPanel } from "@/components/AnalysisPanel";
import { AnalysisSkeleton } from "@/components/AnalysisSkeleton";
import { ChatPanel } from "@/components/ChatPanel";
import { AppHeader } from "@/components/AppHeader";
import { SignInBenefits } from "@/components/SignInBenefits";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { CategoriesSection } from "@/components/landing/CategoriesSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { UseCasesSection } from "@/components/landing/UseCasesSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { CTASection } from "@/components/landing/CTASection";
import { scrapeWebsite, analyzeWebsite, ScrapeResult, AnalysisResult } from "@/lib/api";
import { generateAnalysisPDF } from "@/lib/pdf";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const FREE_ANALYSIS_KEY = "sitescoper_free_analysis_used";

type Step = "idle" | "scraping" | "analyzing" | "done";

const Index = () => {
  const [step, setStep] = useState<Step>("idle");
  const [scrapeData, setScrapeData] = useState<ScrapeResult | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [currentUrl, setCurrentUrl] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
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
    // Free-tier gate: anon users get 1 free analysis, then must sign up
    if (!user && hasUsedFreeAnalysis) {
      toast({
        title: "Free analysis used",
        description: "Sign up free to keep analyzing websites and save your history.",
      });
      navigate("/auth");
      return;
    }

    setCurrentUrl(url);
    setScrapeData(null);
    setAnalysis(null);

    try {
      setStep("scraping");
      const data = await scrapeWebsite(url);
      setScrapeData(data);

      setStep("analyzing");
      const result = await analyzeWebsite(data.markdown || "", url, data.images, data.detectedSections);
      setAnalysis(result);
      setStep("done");

      // Save to history if logged in, otherwise mark free analysis as used
      if (user) {
        await supabase.from("analysis_history").insert({
          user_id: user.id,
          url,
          overall_score: result.overall_score,
          summary: result.summary,
          categories: result.categories as any,
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
      } else {
        localStorage.setItem(FREE_ANALYSIS_KEY, "true");
        setHasUsedFreeAnalysis(true);
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message || "Something went wrong",
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
      generateAnalysisPDF(analysis, currentUrl, scrapeData ? { metadata: scrapeData.metadata } : undefined);
    }
  };

  const isLoading = step === "scraping" || step === "analyzing";

  return (
    <div className="min-h-screen bg-background">
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
              className="relative text-center space-y-6 py-16 md:py-20"
            >
              <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl opacity-60" />
                <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-[hsl(280,70%,60%)]/20 rounded-full blur-3xl opacity-60" />
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-body border border-primary/20">
                <Sparkles className="h-3 w-3" />
                {t("hero.badge")}
              </div>
              <h2 className="text-4xl md:text-6xl font-heading font-bold tracking-tight leading-[1.05]">
                {t("hero.title1")}
                <br />
                <span className="bg-gradient-to-r from-primary via-[hsl(265,70%,58%)] to-[hsl(280,70%,60%)] bg-clip-text text-transparent">
                  {t("hero.title2")}
                </span>
                <br />
                <span className="text-2xl md:text-3xl font-heading font-medium text-muted-foreground">
                  {t("hero.title3")}
                </span>
              </h2>
              <p className="text-muted-foreground font-body text-base md:text-lg max-w-xl mx-auto leading-relaxed">
                {t("hero.subtitle")}
              </p>
              <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground font-body flex-wrap">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  {t("hero.noSignup")}
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {t("hero.free")}
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[hsl(280,70%,60%)]" />
                  {t("hero.export")}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* URL Input */}
        <div ref={inputRef}>
          <UrlInput onSubmit={handleAnalyze} isLoading={isLoading} />
        </div>

        {/* Loading state — skeleton matches final layout */}
        <AnimatePresence>
          {isLoading && (
            <AnalysisSkeleton step={step as "scraping" | "analyzing"} />
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
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
                  <Button variant="outline" size="sm" onClick={handleExportPDF}>
                    <Download className="h-3.5 w-3.5" />
                    Export PDF
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-heading font-semibold text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Link2 className="h-3.5 w-3.5" />
                    Website Preview
                  </h3>
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
                  <h3 className="font-heading font-semibold text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    AI Analysis
                  </h3>
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
        <>
          <StatsSection />
          <FeaturesSection />
          <HowItWorksSection />
          <CategoriesSection />
          <UseCasesSection />
          {!user && <SignInBenefits />}
          <FAQSection />
          <CTASection onGetStarted={scrollToInput} />
        </>
      )}

      <footer className="border-t border-border mt-8 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground font-body">
          <div>SiteScoper — {t("footer.tagline")}</div>
          <nav className="flex items-center gap-5">
            <Link to="/privacy" className="hover:text-foreground transition-colors">{t("footer.privacy")}</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">{t("footer.terms")}</Link>
          </nav>
        </div>
      </footer>

      {analysis && user && (
        <ChatPanel analysis={analysis} scrapeData={scrapeData ?? undefined} url={currentUrl} />
      )}
    </div>
  );
};

export default Index;
