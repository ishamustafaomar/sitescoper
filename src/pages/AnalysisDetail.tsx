import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Download, Loader2, Share2, Check, Copy, Home, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/AppHeader";
import { AnalysisPanel } from "@/components/AnalysisPanel";
import { ChatPanel } from "@/components/ChatPanel";
import { ScoreTrendChart } from "@/components/ScoreTrendChart";
import { SeoAuditTab } from "@/components/seo-audit/SeoAuditTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { AnalysisResult, ScrapeResult } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { useTranslation } from "react-i18next";

function genToken() {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function AnalysisDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isPro } = useSubscription();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) loadAnalysis();
  }, [id]);

  const loadAnalysis = async () => {
    const { data } = await supabase
      .from("analysis_history")
      .select("*")
      .eq("id", id)
      .single();

    if (data) setRecord(data);
    setLoading(false);
  };

  const handleExportPDF = () => {
    if (!record) return;
    if (!isPro) {
      toast({ title: t("analysisDetail.proFeatureToast"), description: t("analysisDetail.upgradeToDownload") });
      navigate("/pricing");
      return;
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
    import("@/lib/pdf").then(({ generateAnalysisPDF }) => {
      generateAnalysisPDF(analysis, record.url, record.scrape_data);
    });
  };

  const handleShare = async () => {
    if (!record) return;
    setSharing(true);
    try {
      let token = (record as any).share_token as string | null;
      if (!token) {
        token = genToken();
        const { error } = await supabase
          .from("analysis_history")
          .update({ share_token: token } as any)
          .eq("id", record.id);
        if (error) throw error;
        setRecord({ ...record, share_token: token });
      }
      const url = `${window.location.origin}/share/${token}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: t("analysisDetail.shareLinkCopiedTitle"), description: t("analysisDetail.shareLinkCopiedDesc") });
    } catch (e: any) {
      toast({ title: t("analysisDetail.shareErrorTitle"), description: e.message, variant: "destructive" });
    } finally {
      setSharing(false);
    }
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

  if (!record) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground font-body">{t("analysisDetail.notFound")}</p>
          <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">
            {t("analysisDetail.goBack")}
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
        detectedSections: record.scrape_data.detectedSections,
      }
    : undefined;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{record?.url ? t("analysisDetail.title", { url: record.url }) : t("analysisDetail.titleFallback")}</title>
        <meta name="description" content={record?.summary ? String(record.summary).slice(0, 155) : t("analysisDetail.metaDescriptionFallback")} />
        <link rel="canonical" href={`https://sitescoper.com/analysis/${id}`} />
        <meta property="og:title" content={record?.url ? t("analysisDetail.title", { url: record.url }) : t("analysisDetail.titleFallback")} />
        <meta property="og:description" content={record?.summary ? String(record.summary).slice(0, 155) : t("analysisDetail.metaDescriptionFallback")} />
        <meta property="og:url" content={`https://sitescoper.com/analysis/${id}`} />
        <meta name="robots" content="noindex" />
      </Helmet>
      <AppHeader />
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-xs font-body">
              <Home className="h-3.5 w-3.5" />
              {t("analysisDetail.home")}
            </Button>
            <div className="min-w-0">
              <h2 className="font-heading font-bold text-lg truncate">{record.url}</h2>
              <p className="text-xs text-muted-foreground font-body">
                {t("analysisDetail.analyzedAt", { date: new Date(record.created_at).toLocaleString() })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleShare} disabled={sharing}>
              {copied ? <Check className="h-3.5 w-3.5" /> : sharing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Share2 className="h-3.5 w-3.5" />}
              {copied ? t("analysisDetail.copied") : t("analysisDetail.share")}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              {isPro ? <Download className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
              {isPro ? t("analysisDetail.exportPdf") : t("analysisDetail.exportPdfPro")}
            </Button>
          </div>
        </div>

        {(record as any).share_token && (
          <div className="bg-muted/40 border border-border rounded-lg px-3 py-2 flex items-center gap-2 text-xs font-body">
            <Share2 className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">{t("analysisDetail.publicLink")}</span>
            <code className="truncate flex-1 text-foreground">
              {window.location.origin}/share/{(record as any).share_token}
            </code>
            <button
              onClick={handleShare}
              className="text-primary hover:text-primary/80 transition-colors shrink-0"
              aria-label="Copy"
            >
              <Copy className="h-3 w-3" />
            </button>
          </div>
        )}

        {(record as any).custom_instructions && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 text-xs font-body text-foreground/90">
            <span className="uppercase tracking-wider text-[10px] text-primary font-semibold mr-2">{t("analysisDetail.focus")}</span>
            <span className="whitespace-pre-wrap">{(record as any).custom_instructions}</span>
          </div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Tabs defaultValue="analysis" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="analysis">{t("analysisDetail.tabAnalysis")}</TabsTrigger>
              <TabsTrigger value="seo-audit">{t("analysisDetail.tabSeoAudit")}</TabsTrigger>
            </TabsList>
            <TabsContent value="analysis">
              <AnalysisPanel analysis={analysis} scrapeData={scrapeData} />
            </TabsContent>
            <TabsContent value="seo-audit">
              <SeoAuditTab url={record.url} />
            </TabsContent>
          </Tabs>
        </motion.div>

        <ScoreTrendChart url={record.url} currentId={record.id} />
      </main>

      {isPro ? (
        <ChatPanel analysis={analysis} scrapeData={scrapeData} url={record.url} analysisId={record.id} />
      ) : (
        <button
          onClick={() => navigate("/pricing")}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-card border border-border shadow-lg hover:shadow-xl transition text-sm font-body"
        >
          <Lock className="h-4 w-4 text-primary" />
          <span>{t("analysisDetail.chatWithReport")}<span className="text-primary font-semibold">Pro</span></span>
        </button>
      )}
    </div>
  );
}
