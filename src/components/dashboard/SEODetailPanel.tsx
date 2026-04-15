import { motion } from "framer-motion";
import { X, Search, FileText, Link2, Image, Zap, Shield, Tag, Heading, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScoreRing } from "@/components/ScoreRing";
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
    {
      label: "Title Tag",
      value: title || "Missing",
      status: title ? (title.length <= 60 ? "good" : "warning") : "error",
      detail: title ? `${title.length} characters (recommended: ≤60)` : "No title tag found",
    },
    {
      label: "Meta Description",
      value: description ? description.slice(0, 80) + (description.length > 80 ? "…" : "") : "Missing",
      status: description ? (description.length <= 160 ? "good" : "warning") : "error",
      detail: description ? `${description.length} characters (recommended: ≤160)` : "No meta description found",
    },
    {
      label: "Language",
      value: metadata.language || "Not set",
      status: metadata.language ? "good" : "warning",
      detail: metadata.language ? `Language: ${metadata.language}` : "Consider setting lang attribute",
    },
    {
      label: "Source URL",
      value: metadata.sourceURL ? "Present" : "Missing",
      status: metadata.sourceURL ? "good" : "info",
      detail: metadata.sourceURL || "Canonical URL not detected",
    },
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
          {check.value !== "Missing" && check.value !== "Not set" && check.value !== "Present" && (
            <p className="text-xs font-body text-foreground/80 truncate">{check.value}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function LinksAudit({ scrapeData }: { scrapeData: any }) {
  const links: string[] = scrapeData?.links || [];
  const internal = links.filter((l) => {
    try { return new URL(l).hostname === new URL(scrapeData?.metadata?.sourceURL || "").hostname; } catch { return false; }
  });
  const external = links.filter((l) => !internal.includes(l));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-muted/30 rounded-lg p-3 text-center">
          <p className="text-2xl font-heading font-bold">{links.length}</p>
          <p className="text-xs text-muted-foreground font-body">Total Links</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-3 text-center">
          <p className="text-2xl font-heading font-bold text-primary">{internal.length}</p>
          <p className="text-xs text-muted-foreground font-body">Internal</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-3 text-center">
          <p className="text-2xl font-heading font-bold text-accent">{external.length}</p>
          <p className="text-xs text-muted-foreground font-body">External</p>
        </div>
      </div>

      {links.length === 0 && (
        <p className="text-sm text-muted-foreground font-body text-center py-4">No link data available. Run a new analysis to collect links.</p>
      )}

      {links.length > 0 && (
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {links.slice(0, 20).map((link, i) => (
            <a
              key={i}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-xs font-body text-muted-foreground hover:text-primary truncate p-1.5 rounded hover:bg-muted/50 transition-colors"
            >
              {link}
            </a>
          ))}
          {links.length > 20 && (
            <p className="text-xs text-muted-foreground font-body text-center pt-2">
              +{links.length - 20} more links
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function CategorySuggestions({ categories, filterType }: { categories: AnalysisCategory[]; filterType?: string }) {
  const filtered = filterType
    ? categories.flatMap((c) => c.suggestions.filter((s) => s.type === filterType))
    : categories.flatMap((c) => c.suggestions);

  const sorted = [...filtered].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return (order[a.priority] ?? 1) - (order[b.priority] ?? 1);
  });

  if (sorted.length === 0) {
    return <p className="text-sm text-muted-foreground font-body text-center py-6">No suggestions in this category.</p>;
  }

  return (
    <div className="space-y-2">
      {sorted.map((s, i) => (
        <div key={i} className="p-3 rounded-lg bg-muted/30 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-heading font-medium text-sm">{s.title}</h4>
            <Badge
              variant="outline"
              className={`text-[10px] shrink-0 ${
                s.priority === "high"
                  ? "bg-destructive/10 text-destructive border-destructive/20"
                  : s.priority === "medium"
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "bg-accent/10 text-accent border-accent/20"
              }`}
            >
              {s.priority}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground font-body leading-relaxed">{s.description}</p>
        </div>
      ))}
    </div>
  );
}

export function SEODetailPanel({ websiteName, url, overallScore, categories, scrapeData, onClose }: SEODetailPanelProps) {
  const seoCategory = categories.find((c) => c.name.toLowerCase().includes("seo"));
  const perfCategory = categories.find((c) => c.name.toLowerCase().includes("performance") || c.name.toLowerCase().includes("perf"));
  const a11yCategory = categories.find((c) => c.name.toLowerCase().includes("accessibility") || c.name.toLowerCase().includes("a11y"));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-card rounded-2xl border border-border p-6 shadow-[var(--shadow-md)] space-y-5"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <ScoreRing score={overallScore} size={56} />
          <div>
            <h2 className="font-heading font-bold text-lg">{websiteName}</h2>
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary font-body">
              {url}
            </a>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Category score bars */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {categories.map((cat) => (
          <div key={cat.name} className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-sm">{cat.icon}</span>
              <span className="text-xs font-body text-muted-foreground truncate">{cat.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 rounded-full bg-border overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    cat.score >= 80 ? "bg-accent" : cat.score >= 50 ? "bg-primary" : "bg-destructive"
                  }`}
                  style={{ width: `${cat.score}%` }}
                />
              </div>
              <span className="text-xs font-heading font-bold">{cat.score}</span>
            </div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="meta" className="w-full">
        <TabsList className="w-full grid grid-cols-5 h-9">
          <TabsTrigger value="meta" className="text-xs gap-1"><Tag className="h-3 w-3" />Meta</TabsTrigger>
          <TabsTrigger value="seo" className="text-xs gap-1"><Search className="h-3 w-3" />SEO</TabsTrigger>
          <TabsTrigger value="links" className="text-xs gap-1"><Link2 className="h-3 w-3" />Links</TabsTrigger>
          <TabsTrigger value="perf" className="text-xs gap-1"><Zap className="h-3 w-3" />Perf</TabsTrigger>
          <TabsTrigger value="a11y" className="text-xs gap-1"><Shield className="h-3 w-3" />A11y</TabsTrigger>
        </TabsList>

        <TabsContent value="meta" className="mt-4">
          <MetaTagsAudit scrapeData={scrapeData} />
        </TabsContent>

        <TabsContent value="seo" className="mt-4">
          <CategorySuggestions categories={categories} filterType="seo" />
        </TabsContent>

        <TabsContent value="links" className="mt-4">
          <LinksAudit scrapeData={scrapeData} />
        </TabsContent>

        <TabsContent value="perf" className="mt-4">
          <CategorySuggestions categories={categories} filterType="performance" />
        </TabsContent>

        <TabsContent value="a11y" className="mt-4">
          <CategorySuggestions categories={categories} filterType="accessibility" />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
