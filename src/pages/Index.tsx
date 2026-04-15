import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, AlertCircle, ExternalLink, Link2, FileText } from "lucide-react";
import { UrlInput } from "@/components/UrlInput";
import { WebsitePreview } from "@/components/WebsitePreview";
import { AnalysisPanel } from "@/components/AnalysisPanel";
import { scrapeWebsite, analyzeWebsite, ScrapeResult, AnalysisResult } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type Step = "idle" | "scraping" | "analyzing" | "done";

const stepsInfo = [
  { key: "scraping", label: "Crawling website", icon: Link2 },
  { key: "analyzing", label: "AI analyzing", icon: Sparkles },
];

const Index = () => {
  const [step, setStep] = useState<Step>("idle");
  const [scrapeData, setScrapeData] = useState<ScrapeResult | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [currentUrl, setCurrentUrl] = useState("");
  const { toast } = useToast();

  const handleAnalyze = async (url: string) => {
    setCurrentUrl(url);
    setScrapeData(null);
    setAnalysis(null);

    try {
      setStep("scraping");
      const data = await scrapeWebsite(url);
      setScrapeData(data);

      setStep("analyzing");
      const result = await analyzeWebsite(data.markdown || "", url);
      setAnalysis(result);
      setStep("done");
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

  const isLoading = step === "scraping" || step === "analyzing";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="gradient-primary p-2 rounded-xl shadow-glow">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-lg leading-none">SiteScoper</h1>
              <span className="text-[10px] text-muted-foreground font-body tracking-wider uppercase">AI Website Analyzer</span>
            </div>
          </button>
          {currentUrl && step === "done" && (
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
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Hero */}
        <AnimatePresence>
          {step === "idle" && !scrapeData && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-5 py-16"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-body mb-2">
                <Sparkles className="h-3 w-3" />
                Powered by AI
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-bold tracking-tight">
                Analyze any website
                <br />
                <span className="bg-gradient-to-r from-primary to-[hsl(280,70%,60%)] bg-clip-text text-transparent">in seconds</span>
              </h2>
              <p className="text-muted-foreground font-body text-lg max-w-lg mx-auto leading-relaxed">
                Crawl, preview, and get AI-powered suggestions to improve UX, SEO, accessibility, and more.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* URL Input */}
        <UrlInput onSubmit={handleAnalyze} isLoading={isLoading} />

        {/* Loading state */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-16 space-y-6"
            >
              {/* Animated dots */}
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="h-3 w-3 rounded-full gradient-primary"
                    animate={{ y: [0, -12, 0] }}
                    transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity, repeatDelay: 0.3 }}
                  />
                ))}
              </div>

              {/* Steps progress */}
              <div className="flex flex-col gap-3">
                {stepsInfo.map((s) => {
                  const isActive = step === s.key;
                  const isDone = (s.key === "scraping" && step === "analyzing");
                  const Icon = s.icon;
                  return (
                    <div
                      key={s.key}
                      className={`flex items-center gap-2.5 text-sm font-body transition-all duration-300 ${
                        isActive ? "text-primary font-medium" : isDone ? "text-accent" : "text-muted-foreground/50"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {s.label}
                      {isDone && <span className="text-accent">✓</span>}
                      {isActive && (
                        <motion.div
                          className="h-1.5 w-1.5 rounded-full bg-primary"
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {scrapeData && step !== "scraping" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
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
                  <AnalysisPanel analysis={analysis} />
                ) : (
                  step === "analyzing" ? null : (
                    <div className="flex items-center gap-2 text-muted-foreground text-sm font-body p-4">
                      <AlertCircle className="h-4 w-4" />
                      Analysis will appear here
                    </div>
                  )
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-xs text-muted-foreground font-body">
          SiteScoper — AI-powered website analysis
        </div>
      </footer>
    </div>
  );
};

export default Index;
