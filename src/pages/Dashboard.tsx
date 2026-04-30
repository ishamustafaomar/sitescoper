import { useState, useEffect, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Globe, Clock, Search, Sparkles, Loader2, Plus, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrafficDot, TrafficChip, getTrafficLevel, getTrafficStyles, getTrafficLabel } from "@/components/TrafficLight";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AppHeader } from "@/components/AppHeader";
import { scrapeWebsite, analyzeWebsite, AnalysisCategory } from "@/lib/api";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { AddWebsiteForm } from "@/components/dashboard/AddWebsiteForm";
import { WebsiteCard, Website } from "@/components/dashboard/WebsiteCard";
import { SEODetailPanel } from "@/components/dashboard/SEODetailPanel";

interface AnalysisRecord {
  id: string;
  url: string;
  overall_score: number;
  summary: string | null;
  categories: any;
  scrape_data: any;
  created_at: string;
  website_id: string | null;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [history, setHistory] = useState<AnalysisRecord[]>([]);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [seoWebsiteId, setSeoWebsiteId] = useState<string | null>(null);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    const [websitesRes, historyRes] = await Promise.all([
      supabase.from("websites").select("*").order("created_at", { ascending: false }),
      supabase.from("analysis_history").select("*").order("created_at", { ascending: false }).limit(100),
    ]);
    if (websitesRes.data) setWebsites(websitesRes.data);
    if (historyRes.data) setHistory(historyRes.data);
    setLoading(false);
  };

  const addWebsite = async (rawUrl: string) => {
    if (!user) return;
    let normalized = rawUrl;
    if (!normalized.startsWith("http")) normalized = "https://" + normalized;

    const name = new URL(normalized).hostname;
    const { data, error } = await supabase
      .from("websites")
      .insert({ user_id: user.id, url: normalized, name })
      .select()
      .single();

    if (error) throw error;
    setWebsites((prev) => [data, ...prev]);
    toast({ title: "Website added", description: `${name} has been added to your dashboard.` });
  };

  const analyzeTrackedWebsite = async (website: Website) => {
    if (!user) return;
    setAnalyzingId(website.id);
    try {
      const scrapeData = await scrapeWebsite(website.url);
      const analysis = await analyzeWebsite(scrapeData.markdown || "", website.url, scrapeData.images);

      await supabase.from("analysis_history").insert({
        user_id: user.id,
        website_id: website.id,
        url: website.url,
        overall_score: analysis.overall_score,
        summary: analysis.summary,
        categories: analysis.categories as any,
        scrape_data: {
          screenshot: scrapeData.screenshot,
          metadata: scrapeData.metadata,
          links: scrapeData.links,
          images: scrapeData.images,
          image_suggestions: analysis.image_suggestions,
          site_category: analysis.site_category,
          category_rationale: analysis.category_rationale,
          benchmark_percentile: analysis.benchmark_percentile,
          benchmark_label: analysis.benchmark_label,
          peer_examples: analysis.peer_examples,
          action_plan: analysis.action_plan,
        } as any,
      } as any);

      await supabase
        .from("websites")
        .update({ last_score: analysis.overall_score, last_analyzed_at: new Date().toISOString() })
        .eq("id", website.id);

      setWebsites((prev) =>
        prev.map((w) =>
          w.id === website.id
            ? { ...w, last_score: analysis.overall_score, last_analyzed_at: new Date().toISOString() }
            : w
        )
      );
      await loadData();
      toast({ title: "Analysis complete", description: `Score: ${analysis.overall_score}/100` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setAnalyzingId(null);
    }
  };

  const deleteWebsite = async (id: string) => {
    await supabase.from("websites").delete().eq("id", id);
    setWebsites((prev) => prev.filter((w) => w.id !== id));
    if (seoWebsiteId === id) setSeoWebsiteId(null);
    toast({ title: "Website removed" });
  };

  // Get latest analysis for the selected website
  const seoAnalysis = seoWebsiteId
    ? history.find((h) => h.website_id === seoWebsiteId)
    : null;
  const seoWebsite = seoWebsiteId
    ? websites.find((w) => w.id === seoWebsiteId)
    : null;

  const avgScore =
    websites.length > 0
      ? Math.round(
          websites.filter((w) => w.last_score).reduce((acc, w) => acc + (w.last_score || 0), 0) /
            Math.max(1, websites.filter((w) => w.last_score).length)
        )
      : null;

  // Build score history per website (oldest -> newest) for sparklines
  const historyByWebsite = useMemo(() => {
    const map = new Map<string, number[]>();
    // history is sorted newest -> oldest from the query; reverse for oldest -> newest
    [...history].reverse().forEach((h) => {
      if (!h.website_id) return;
      const arr = map.get(h.website_id) ?? [];
      arr.push(h.overall_score);
      map.set(h.website_id, arr);
    });
    return map;
  }, [history]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <StatsOverview websiteCount={websites.length} historyCount={history.length} avgScore={avgScore} />

        <AddWebsiteForm onAdd={addWebsite} />

        {/* Compare CTA */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
              <Swords className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-heading font-semibold">Battle a competitor</p>
              <p className="text-[11px] text-muted-foreground font-body truncate">Side-by-side scoring vs. any other site</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => navigate("/compare")} className="shrink-0">
            Compare
          </Button>
        </div>

        {/* SEO Detail Panel */}
        <AnimatePresence>
          {seoAnalysis && seoWebsite && (
            <SEODetailPanel
              websiteName={seoWebsite.name || seoWebsite.url}
              url={seoWebsite.url}
              overallScore={seoAnalysis.overall_score}
              categories={(seoAnalysis.categories as AnalysisCategory[]) || []}
              scrapeData={seoAnalysis.scrape_data}
              onClose={() => setSeoWebsiteId(null)}
            />
          )}
        </AnimatePresence>

        {/* Websites Grid */}
        <div>
          <h2 className="font-heading font-semibold text-lg mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Your Websites
          </h2>

          {websites.length === 0 ? (
            <div className="bg-gradient-to-br from-card to-muted/30 rounded-2xl border border-dashed border-border p-12 text-center shadow-[var(--shadow-sm)]">
              <div className="inline-flex p-3 rounded-2xl bg-primary/10 mb-4">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-base mb-1">No websites tracked yet</h3>
              <p className="text-muted-foreground font-body text-sm mb-4 max-w-xs mx-auto">
                Add your first website above to track score trends over time and get re-analysis with one click.
              </p>
              <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/80 font-body">
                <Plus className="h-3 w-3" />
                Use the form above to start
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {websites.map((website) => (
                  <WebsiteCard
                    key={website.id}
                    website={website}
                    analyzing={analyzingId === website.id}
                    onAnalyze={() => analyzeTrackedWebsite(website)}
                    onDelete={() => deleteWebsite(website.id)}
                    onViewSEO={() => setSeoWebsiteId(seoWebsiteId === website.id ? null : website.id)}
                    scoreHistory={historyByWebsite.get(website.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Recent History */}
        <div>
          <h2 className="font-heading font-semibold text-lg mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Analysis History
          </h2>

          {history.length === 0 ? (
            <div className="bg-gradient-to-br from-card to-muted/30 rounded-2xl border border-dashed border-border p-12 text-center shadow-[var(--shadow-sm)]">
              <div className="inline-flex p-3 rounded-2xl bg-accent/10 mb-4">
                <Search className="h-8 w-8 text-accent" />
              </div>
              <h3 className="font-heading font-semibold text-base mb-1">No analyses yet</h3>
              <p className="text-muted-foreground font-body text-sm max-w-xs mx-auto">
                Run your first scan from the analyzer or click "Analyze" on a tracked website.
              </p>
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-[var(--shadow-sm)]">
              <div className="divide-y divide-border">
                {history.map((record) => {
                  const lvl = getTrafficLevel(record.overall_score);
                  const sty = getTrafficStyles(lvl);
                  return (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/analysis/${record.id}`)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn(
                          "h-10 w-10 rounded-xl flex items-center justify-center font-heading font-bold text-sm shrink-0",
                          sty.chip
                        )}>
                          {record.overall_score}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-heading font-medium truncate">{record.url}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <TrafficDot score={record.overall_score} size="sm" />
                            <span className={cn("text-[10px] font-body font-medium", sty.text)}>
                              {getTrafficLabel(lvl)}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-body">
                              · {new Date(record.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Quick Analyze CTA */}
        <div className="bg-card rounded-xl border border-border p-8 text-center shadow-[var(--shadow-sm)]">
          <Sparkles className="h-8 w-8 text-primary mx-auto mb-3" />
          <h3 className="font-heading font-semibold text-lg mb-2">Quick Analysis</h3>
          <p className="text-muted-foreground font-body text-sm mb-4">
            Analyze any website without adding it to your dashboard
          </p>
          <Button variant="hero" onClick={() => navigate("/")} className="rounded-xl">
            <Sparkles className="h-4 w-4" />
            Go to Analyzer
          </Button>
        </div>
      </main>
    </div>
  );
}
