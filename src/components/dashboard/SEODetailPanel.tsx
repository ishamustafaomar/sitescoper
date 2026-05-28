import { motion } from "framer-motion";
import { X, Search, Link2, Zap, Shield, Tag, AlertTriangle, CheckCircle, ExternalLink, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScoreRing } from "@/components/ScoreRing";
import { ScoreTrendChart } from "@/components/ScoreTrendChart";
import { SemrushOverviewPanel } from "./SemrushOverviewPanel";
import { ProGate } from "@/components/ProGate";
import { TechSeoPanel } from "./TechSeoPanel";
import { IssuesByImpactPanel } from "./IssuesByImpactPanel";
import { ActionPlanPanel } from "./ActionPlanPanel";
import { ImageAuditPanel } from "./ImageAuditPanel";
import type { AnalysisCategory, AnalysisSuggestion } from "@/lib/api";

interface SEODetailPanelProps {
  websiteName: string;
  url: string;
  overallScore: number;
  categories: AnalysisCategory[];
  scrapeData: any;
  onClose: () => void;
}

function MetaTagsAudit({ scrapeData }: { scrapeData: any }) {
  const metadata = scrapeData?.metadata || {};
  const title = metadata.title || "";
  const description = metadata.description || "";
  const checks = [
    { label: "Title Tag", value: title || "Missing", status: title ? (title.length <= 60 ? "good" : "warning") : "error", detail: title ? `${title.length} characters (recommended: ≤60)` : "No title tag found" },
    { label: "Meta Description", value: description ? description.slice(0, 80) + (description.length > 80 ? "…" : "") : "Missing", status: description ? (description.length <= 160 ? "good" : "warning") : "error", detail: description ? `${description.length} characters (recommended: ≤160)` : "No meta description found" },
    { label: "Language", value: metadata.language || "Not set", status: metadata.language ? "good" : "warning", detail: metadata.language ? `Language: ${metadata.language}` : "Consider setting lang attribute" },
    { label: "Canonical / Source URL", value: metadata.sourceURL ? "Present" : "Missing", status: metadata.sourceURL ? "good" : "info", detail: metadata.sourceURL || "Canonical URL not detected" },
  ];
  return (
    <div className="space-y-3">
      {checks.map((check) => (
        <div key={check.label} className="p-3 rounded-lg bg-muted/30 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {check.status === "good" && <CheckCircle className="h-4 w-4 text-accent" />}
              {check.status === "warning" && <AlertTriangle className="h-4 w-4 text-primary" />}
              {check.status === "error" && <AlertTriangle className="h-4 w-4 text-destructive" />}
              {check.status === "info" && <CheckCircle className="h-4 w-4 text-muted-foreground" />}
              <span className="font-heading font-medium text-sm">{check.label}</span>
            </div>
            <Badge variant={check.status === "good" ? "secondary" : check.status === "error" ? "destructive" : "outline"} className="text-[10px]">
              {check.status === "good" ? "Pass" : check.status === "warning" ? "Warning" : check.status === "error" ? "Fail" : "Info"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground font-body">{check.detail}</p>
          {!["Missing", "Not set", "Present"].includes(check.value) && (
            <p className="text-xs font-body text-foreground/80 truncate">{check.value}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function LinksAudit({ scrapeData }: { scrapeData: any }) {
  const links: string[] = scrapeData?.links || [];
  const broken: { url: string; reason: string }[] = scrapeData?.brokenLinks || [];
  let host = "";
  try { host = new URL(scrapeData?.metadata?.sourceURL || "").hostname; } catch { /* ignore */ }
  const internal = links.filter((l) => { try { return new URL(l).hostname === host; } catch { return false; } });
  const external = links.filter((l) => !internal.includes(l));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        <Kpi label="Total" value={links.length} />
        <Kpi label="Internal" value={internal.length} tone="primary" />
        <Kpi label="External" value={external.length} tone="accent" />
        <Kpi label="Broken" value={broken.length} tone={broken.length ? "destructive" : "muted"} />
      </div>
      {broken.length > 0 && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 space-y-1">
          <p className="text-xs font-heading font-semibold text-destructive">Broken links</p>
          {broken.slice(0, 5).map((b, i) => (
            <p key={i} className="text-[11px] font-body text-destructive/80 truncate">{b.url} — {b.reason}</p>
          ))}
        </div>
      )}
      {links.length === 0 && <p className="text-sm text-muted-foreground font-body text-center py-4">No link data available.</p>}
      {links.length > 0 && (
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {links.slice(0, 25).map((link, i) => (
            <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="block text-xs font-body text-muted-foreground hover:text-primary truncate p-1.5 rounded hover:bg-muted/50 transition-colors">
              {link}
            </a>
          ))}
          {links.length > 25 && <p className="text-xs text-muted-foreground font-body text-center pt-2">+{links.length - 25} more links</p>}
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value, tone = "muted" }: { label: string; value: number; tone?: "muted" | "primary" | "accent" | "destructive" }) {
  const toneCls = tone === "primary" ? "text-primary" : tone === "accent" ? "text-accent" : tone === "destructive" ? "text-destructive" : "";
  return (
    <div className="bg-muted/30 rounded-lg p-3 text-center">
      <p className={`text-2xl font-heading font-bold ${toneCls}`}>{value}</p>
      <p className="text-xs text-muted-foreground font-body">{label}</p>
    </div>
  );
}

function CategorySuggestions({ categories, filterType }: { categories: AnalysisCategory[]; filterType?: string }) {
  const filtered = filterType ? categories.flatMap((c) => c.suggestions.filter((s) => s.type === filterType)) : categories.flatMap((c) => c.suggestions);
  const sorted = [...filtered].sort((a, b) => { const order: any = { high: 0, medium: 1, low: 2 }; return (order[a.priority] ?? 1) - (order[b.priority] ?? 1); });
  if (sorted.length === 0) return <p className="text-sm text-muted-foreground font-body text-center py-6">No suggestions in this category.</p>;
  return (
    <div className="space-y-2">
      {sorted.map((s: AnalysisSuggestion, i) => (
        <div key={i} className="p-3 rounded-lg bg-muted/30 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-heading font-medium text-sm">{s.title}</h4>
            <Badge variant="outline" className={`text-[10px] shrink-0 ${s.priority === "high" ? "bg-destructive/10 text-destructive border-destructive/20" : s.priority === "medium" ? "bg-primary/10 text-primary border-primary/20" : "bg-accent/10 text-accent border-accent/20"}`}>{s.priority}</Badge>
          </div>
          <p className="text-xs text-muted-foreground font-body leading-relaxed">{s.description}</p>
        </div>
      ))}
    </div>
  );
}

export function SEODetailPanel({ websiteName, url, overallScore, categories, scrapeData, onClose }: SEODetailPanelProps) {
  const techSeo = scrapeData?.tech_seo || null;
  const actionPlan = scrapeData?.action_plan || null;
  const imageSuggestions = scrapeData?.image_suggestions || [];
  const images = scrapeData?.images || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="space-y-4"
    >
      {/* Hero card */}
      <div className="bg-card rounded-2xl border border-border p-6 shadow-[var(--shadow-md)] space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-4 min-w-0">
            <ScoreRing score={overallScore} size={64} />
            <div className="min-w-0">
              <h2 className="font-heading font-bold text-xl truncate">{websiteName}</h2>
              <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary font-body flex items-center gap-1">
                {url} <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close"><X className="h-4 w-4" /></Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {categories.map((cat) => (
            <div key={cat.name} className="bg-muted/30 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm">{cat.icon}</span>
                <span className="text-[10px] font-body text-muted-foreground truncate">{cat.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 rounded-full bg-border overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${cat.score >= 80 ? "bg-accent" : cat.score >= 50 ? "bg-primary" : "bg-destructive"}`} style={{ width: `${cat.score}%` }} />
                </div>
                <span className="text-xs font-heading font-bold">{cat.score}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Semrush + trend row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ProGate
            title="Semrush metrics are a Pro feature"
            description="Upgrade to unlock Authority Score, organic traffic, ranking keywords and backlink data."
          >
            <SemrushOverviewPanel url={url} />
          </ProGate>
        </div>
        <div>
          <ScoreTrendChart url={url} />
        </div>
      </div>

      {/* Tech SEO + Issues row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TechSeoPanel report={techSeo} />
        <IssuesByImpactPanel categories={categories} />
      </div>

      {/* Image audit + action plan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ImageAuditPanel images={images} suggestions={imageSuggestions} />
        <ActionPlanPanel plan={actionPlan} />
      </div>

      {/* Audit tabs */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <Tabs defaultValue="meta" className="w-full">
          <TabsList className="w-full grid grid-cols-5 h-9">
            <TabsTrigger value="meta" className="text-xs gap-1"><Tag className="h-3 w-3" />Meta</TabsTrigger>
            <TabsTrigger value="seo" className="text-xs gap-1"><Search className="h-3 w-3" />SEO</TabsTrigger>
            <TabsTrigger value="links" className="text-xs gap-1"><Link2 className="h-3 w-3" />Links</TabsTrigger>
            <TabsTrigger value="perf" className="text-xs gap-1"><Zap className="h-3 w-3" />Perf</TabsTrigger>
            <TabsTrigger value="a11y" className="text-xs gap-1"><Shield className="h-3 w-3" />A11y</TabsTrigger>
          </TabsList>
          <TabsContent value="meta" className="mt-4"><MetaTagsAudit scrapeData={scrapeData} /></TabsContent>
          <TabsContent value="seo" className="mt-4"><CategorySuggestions categories={categories} filterType="seo" /></TabsContent>
          <TabsContent value="links" className="mt-4"><LinksAudit scrapeData={scrapeData} /></TabsContent>
          <TabsContent value="perf" className="mt-4"><CategorySuggestions categories={categories} filterType="performance" /></TabsContent>
          <TabsContent value="a11y" className="mt-4"><CategorySuggestions categories={categories} filterType="accessibility" /></TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}