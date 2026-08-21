import { useEffect, useState } from "react";
import { useParams } from "@/lib/router-compat";
import { motion } from "framer-motion";
import { ExternalLink, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnalysisPanel } from "@/components/AnalysisPanel";
import { supabase } from "@/integrations/supabase/client";
import { AnalysisResult, ScrapeResult } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { useTranslation } from "react-i18next";


export default function SharedAnalysis() {
  const { t } = useTranslation();
  const text = (key: string, fallback: string, values?: Record<string, unknown>) => {
    const translated = t(key, { defaultValue: fallback, ...values });
    return translated === key || translated.includes("Analysis.") || translated.includes("Card.") || translated.includes("Panel.")
      ? fallback.replace("{{date}}", String(values?.date ?? ""))
      : translated;
  };
  const { token } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    (async () => {
      const { data } = await supabase
        .rpc("get_shared_analysis", { p_token: token })
        .maybeSingle();
      setRecord(data);
      setLoading(false);
    })();
  }, [token]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const homeHref = user ? "/" : `/auth?redirect=${encodeURIComponent("/")}`;



  if (!record) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-3 max-w-md">
          <h1 className="text-2xl font-heading font-bold">{text("sharedAnalysis.notFoundTitle", "Report not found")}</h1>
          <p className="text-muted-foreground font-body text-sm">
            {text("sharedAnalysis.notFoundBody", "This shared report link may have expired or been disabled by the owner.")}
          </p>
          <Button asChild variant="hero">
            <a href="/">{text("sharedAnalysis.analyzeOwnSite", "Analyze your own site →")}</a>
          </Button>
        </div>
      </div>
    );
  }

  const analysis: AnalysisResult = {
    overall_score: record.overall_score,
    summary: record.summary || "",
    categories: record.categories as any[],
    site_category: record.scrape_data?.site_category,
    category_rationale: record.scrape_data?.category_rationale,
    image_suggestions: record.scrape_data?.image_suggestions,
    benchmark_percentile: record.scrape_data?.benchmark_percentile,
    benchmark_label: record.scrape_data?.benchmark_label,
    peer_examples: record.scrape_data?.peer_examples,
    action_plan: record.scrape_data?.action_plan,
  };
  const scrapeData: ScrapeResult | undefined = record.scrape_data
    ? {
        screenshot: record.scrape_data.screenshot,
        metadata: record.scrape_data.metadata,
        links: record.scrape_data.links,
        images: record.scrape_data.images,
      }
    : undefined;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 font-heading font-bold">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-[hsl(280,70%,60%)]">
              <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            SiteScoper
          </a>
          <Button asChild size="sm" variant="hero">
            <a href={homeHref}>{text("sharedAnalysis.analyzeSite", "Analyze your site")}</a>
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="space-y-1">
          <div className="text-[10px] font-body uppercase tracking-widest text-muted-foreground">{text("sharedAnalysis.sharedReportLabel", "Shared Report")}</div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-heading font-bold text-xl truncate">{record.url}</h1>
            <a
              href={record.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-primary font-body inline-flex items-center gap-1"
            >
              {text("sharedAnalysis.visit", "Visit")} <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <p className="text-xs text-muted-foreground font-body">
            Analyzed {new Date(record.created_at).toLocaleString()}
          </p>

        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <AnalysisPanel
            analysis={analysis}
            scrapeData={scrapeData}
          />
        </motion.div>

        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-6 text-center space-y-3 mt-8">
          <h3 className="text-xl font-heading font-bold">{text("sharedAnalysis.ctaTitle", "Run this on your own site")}</h3>
          <p className="text-sm text-muted-foreground font-body max-w-md mx-auto">
            {text("sharedAnalysis.ctaBody", "Free, instant, AI-powered. Get a brutally honest report on your site in seconds.")}
          </p>
          <Button asChild variant="hero">
            <a href={homeHref}>{text("sharedAnalysis.ctaButton", "Analyze a website →")}</a>
          </Button>
        </div>
      </main>

      <footer className="border-t border-border mt-12 py-6 text-center text-xs text-muted-foreground font-body">
        {text("sharedAnalysis.poweredBy", "Powered by")} <a href="/" className="hover:text-foreground transition-colors">SiteScoper</a>
      </footer>

    </div>

  );
}
