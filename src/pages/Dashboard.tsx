import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Plus, Globe, TrendingUp, Clock, Trash2, RefreshCw, ExternalLink,
  BarChart3, Sparkles, Loader2, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AppHeader } from "@/components/AppHeader";
import { ScoreRing } from "@/components/ScoreRing";
import { scrapeWebsite, analyzeWebsite } from "@/lib/api";

interface Website {
  id: string;
  url: string;
  name: string | null;
  last_score: number | null;
  last_analyzed_at: string | null;
  created_at: string;
}

interface AnalysisRecord {
  id: string;
  url: string;
  overall_score: number;
  summary: string | null;
  created_at: string;
  website_id: string | null;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [history, setHistory] = useState<AnalysisRecord[]>([]);
  const [newUrl, setNewUrl] = useState("");
  const [addingWebsite, setAddingWebsite] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    const [websitesRes, historyRes] = await Promise.all([
      supabase.from("websites").select("*").order("created_at", { ascending: false }),
      supabase.from("analysis_history").select("*").order("created_at", { ascending: false }).limit(20),
    ]);
    if (websitesRes.data) setWebsites(websitesRes.data);
    if (historyRes.data) setHistory(historyRes.data);
    setLoading(false);
  };

  const addWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim() || !user) return;
    setAddingWebsite(true);

    let normalized = newUrl.trim();
    if (!normalized.startsWith("http")) normalized = "https://" + normalized;

    try {
      const name = new URL(normalized).hostname;
      const { data, error } = await supabase
        .from("websites")
        .insert({ user_id: user.id, url: normalized, name })
        .select()
        .single();

      if (error) throw error;
      setWebsites((prev) => [data, ...prev]);
      setNewUrl("");
      toast({ title: "Website added", description: `${name} has been added to your dashboard.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setAddingWebsite(false);
    }
  };

  const analyzeTrackedWebsite = async (website: Website) => {
    if (!user) return;
    setAnalyzingId(website.id);

    try {
      const scrapeData = await scrapeWebsite(website.url);
      const analysis = await analyzeWebsite(scrapeData.markdown || "", website.url);

      // Save to history
      await supabase.from("analysis_history").insert({
        user_id: user.id,
        website_id: website.id,
        url: website.url,
        overall_score: analysis.overall_score,
        summary: analysis.summary,
        categories: analysis.categories as any,
        scrape_data: { screenshot: scrapeData.screenshot, metadata: scrapeData.metadata, links: scrapeData.links } as any,
      } as any);

      // Update website
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
    toast({ title: "Website removed" });
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-muted-foreground";
    if (score >= 80) return "text-accent";
    if (score >= 50) return "text-primary";
    return "text-destructive";
  };

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
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-sm)]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Globe className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold">{websites.length}</p>
                <p className="text-xs text-muted-foreground font-body">Tracked Websites</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-sm)]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <BarChart3 className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold">{history.length}</p>
                <p className="text-xs text-muted-foreground font-body">Total Analyses</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-sm)]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold">
                  {websites.length > 0
                    ? Math.round(
                        websites.filter((w) => w.last_score).reduce((acc, w) => acc + (w.last_score || 0), 0) /
                          Math.max(1, websites.filter((w) => w.last_score).length)
                      )
                    : "—"}
                </p>
                <p className="text-xs text-muted-foreground font-body">Avg Score</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Website */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-[var(--shadow-sm)]">
          <h2 className="font-heading font-semibold text-lg mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Add Website
          </h2>
          <form onSubmit={addWebsite} className="flex gap-3">
            <Input
              type="text"
              placeholder="https://example.com"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="flex-1 font-body"
              disabled={addingWebsite}
            />
            <Button type="submit" variant="hero" disabled={addingWebsite || !newUrl.trim()}>
              {addingWebsite ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add
            </Button>
          </form>
        </div>

        {/* Websites Grid */}
        <div>
          <h2 className="font-heading font-semibold text-lg mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Your Websites
          </h2>

          {websites.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-12 text-center shadow-[var(--shadow-sm)]">
              <Globe className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-body">No websites tracked yet. Add one above!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {websites.map((website) => (
                  <motion.div
                    key={website.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-heading font-semibold text-sm truncate">{website.name || website.url}</h3>
                        <a
                          href={website.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:text-primary font-body truncate flex items-center gap-1 mt-0.5"
                        >
                          {website.url}
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      </div>
                      {website.last_score !== null && (
                        <ScoreRing score={website.last_score} size={48} />
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground font-body">
                        <Clock className="h-3 w-3" />
                        {website.last_analyzed_at
                          ? new Date(website.last_analyzed_at).toLocaleDateString()
                          : "Not analyzed yet"}
                      </div>
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs"
                          onClick={() => analyzeTrackedWebsite(website)}
                          disabled={analyzingId === website.id}
                        >
                          {analyzingId === website.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <RefreshCw className="h-3 w-3" />
                          )}
                          Analyze
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-xs text-destructive hover:text-destructive"
                          onClick={() => deleteWebsite(website.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
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
            <div className="bg-card rounded-xl border border-border p-12 text-center shadow-[var(--shadow-sm)]">
              <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-body">No analyses yet. Analyze a website to see history here.</p>
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-[var(--shadow-sm)]">
              <div className="divide-y divide-border">
                {history.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/analysis/${record.id}`)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`text-lg font-heading font-bold ${getScoreColor(record.overall_score)}`}>
                        {record.overall_score}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-heading font-medium truncate">{record.url}</p>
                        <p className="text-xs text-muted-foreground font-body">
                          {new Date(record.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[10px] shrink-0">
                      {record.overall_score >= 80 ? "Good" : record.overall_score >= 50 ? "Fair" : "Needs Work"}
                    </Badge>
                  </div>
                ))}
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
