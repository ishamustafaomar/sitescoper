import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, AlertCircle } from "lucide-react";
import { UrlInput } from "@/components/UrlInput";
import { WebsitePreview } from "@/components/WebsitePreview";
import { AnalysisPanel } from "@/components/AnalysisPanel";
import { scrapeWebsite, analyzeWebsite, ScrapeResult, AnalysisResult } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type Step = "idle" | "scraping" | "analyzing" | "done";

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

  const isLoading = step === "scraping" || step === "analyzing";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="gradient-primary p-2 rounded-xl">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="font-heading font-bold text-lg">SiteScope</h1>
          <span className="text-xs text-muted-foreground font-body">AI Website Analyzer</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Hero */}
        {step === "idle" && !scrapeData && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4 py-16"
          >
            <h2 className="text-4xl md:text-5xl font-heading font-bold tracking-tight">
              Analyze any website
              <br />
              <span className="bg-clip-text text-transparent gradient-primary bg-primary-foreground">in seconds</span>
            </h2>
            <p className="text-muted-foreground font-body text-lg max-w-lg mx-auto">
              Crawl, preview, and get AI-powered suggestions to improve UX, SEO, accessibility, and more.
            </p>
          </motion.div>
        )}

        {/* URL Input */}
        <UrlInput onSubmit={handleAnalyze} isLoading={isLoading} />

        {/* Loading state */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 space-y-3"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-body text-sm">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              {step === "scraping" ? "Crawling website..." : "Analyzing with AI..."}
            </div>
          </motion.div>
        )}

        {/* Results */}
        {scrapeData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-heading font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                Website Preview
              </h3>
              <WebsitePreview data={scrapeData} url={currentUrl} />

              {scrapeData.metadata && (
                <div className="bg-card rounded-xl border border-border p-4 shadow-[var(--shadow-sm)] space-y-2">
                  <h4 className="font-heading font-semibold text-sm">Page Info</h4>
                  {scrapeData.metadata.title && (
                    <p className="text-sm font-body">
                      <span className="text-muted-foreground">Title:</span> {scrapeData.metadata.title}
                    </p>
                  )}
                  {scrapeData.metadata.description && (
                    <p className="text-sm font-body">
                      <span className="text-muted-foreground">Description:</span> {scrapeData.metadata.description}
                    </p>
                  )}
                  {scrapeData.links && (
                    <p className="text-sm font-body">
                      <span className="text-muted-foreground">Links found:</span> {scrapeData.links.length}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="font-heading font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                AI Analysis
              </h3>
              {analysis ? (
                <AnalysisPanel analysis={analysis} />
              ) : (
                step !== "analyzing" && (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm font-body p-4">
                    <AlertCircle className="h-4 w-4" />
                    Analysis will appear here
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
