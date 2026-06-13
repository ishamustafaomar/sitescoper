import { supabase } from "@/integrations/supabase/client";

export interface CrawledPage {
  url: string;
  title?: string;
}

export interface ScrapedImage {
  src: string;
  alt: string;
  context?: string;
}

export interface ScrapeResult {
  markdown?: string;
  html?: string;
  screenshot?: string;
  links?: string[];
  metadata?: {
    title?: string;
    description?: string;
    language?: string;
    sourceURL?: string;
  };
  pages?: CrawledPage[];
  pagesCount?: number;
  siteUrlsDiscovered?: number;
  images?: ScrapedImage[];
  detectedSections?: { name: string; evidence: string }[];
  brokenLinks?: { url: string; reason: string }[];
  loginWall?: boolean;
  partial?: boolean;
  partialReason?: string;
  tech_seo?: TechSeoReport;
}

export interface TechSeoCheck { name: string; passed: boolean; detail: string; }
export interface TechSeoReport { score: number; checks: TechSeoCheck[]; }

export interface ScrapeProgressEvent { type: "progress"; step: string; label: string; percent: number; }
export interface ScrapeTechSeoEvent { type: "tech_seo"; data: TechSeoReport; }
export interface ScrapeResultEvent { type: "result"; data: ScrapeResult; }
export interface ScrapeErrorEvent { type: "error"; message: string; status?: number; }
export type ScrapeStreamEvent =
  | ScrapeProgressEvent | ScrapeTechSeoEvent | ScrapeResultEvent | ScrapeErrorEvent;

export type SiteCategory =
  | "saas" | "marketing" | "ecommerce" | "blog"
  | "docs" | "portfolio" | "community" | "other";

export interface SuggestionRewrite {
  before: string;
  after: string;
}

export interface AnalysisSuggestion {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  type: "ux" | "content" | "seo" | "performance" | "accessibility" | "design" | "product" | "strategy" | "business" | "growth" | "brand" | "legal" | "analytics";
  impact?: "high" | "medium" | "low";
  effort?: "low" | "medium" | "high";
  evidence?: string;
  rewrite?: SuggestionRewrite;
  tradeoff?: string;
  impact_reason?: string;
  fix?: string;
  category?: string;
  category_icon?: string;
  kind?: "blocker" | "opportunity";
}

export interface CategorySubScore {
  name: string;
  score: number;
}

export interface AnalysisCategory {
  name: string;
  score: number;
  icon: string;
  suggestions: AnalysisSuggestion[];
  sub_scores?: CategorySubScore[];
}

export interface ImageSuggestion {
  src: string;
  current_alt: string;
  suggested_alt: string;
  issue: string;
}

export interface ActionPlanDay {
  day: number;
  title: string;
  task: string;
  category: string;
  estimated_minutes: number;
}

export interface ActionPlan {
  headline: string;
  days: ActionPlanDay[];
}

export interface AnalysisResult {
  overall_score: number;
  summary: string;
  categories: AnalysisCategory[];
  site_category?: SiteCategory;
  category_rationale?: string;
  image_suggestions?: ImageSuggestion[];
  benchmark_percentile?: number;
  benchmark_label?: string;
  peer_examples?: string[];
  action_plan?: ActionPlan;
}

export async function scrapeWebsite(url: string): Promise<ScrapeResult> {
  let result: ScrapeResult | null = null;
  await scrapeWebsiteStream(url, (ev) => {
    if (ev.type === "result") result = ev.data;
  });
  if (!result) throw new Error("No result from scrape");
  return result;
}

export async function scrapeWebsiteStream(
  url: string,
  onEvent: (ev: ScrapeStreamEvent) => void,
): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const projectId = (import.meta as { env: Record<string, string> }).env.VITE_SUPABASE_PROJECT_ID;
  const apikey = (import.meta as { env: Record<string, string> }).env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const fnUrl = `https://${projectId}.supabase.co/functions/v1/scrape-website`;
  const res = await fetch(fnUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      apikey,
    },
    body: JSON.stringify({ url }),
  });
  if (!res.ok || !res.body) {
    let msg = "Scrape failed";
    try { const j = await res.json(); msg = j.error || msg; } catch { /* ignore */ }
    throw new Error(msg);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() || "";
    for (const line of lines) {
      const t = line.trim();
      if (!t) continue;
      const ev = JSON.parse(t) as ScrapeStreamEvent;
      if (ev.type === "error") throw new Error(ev.message);
      onEvent(ev);
    }
  }
}

export async function analyzeWebsite(
  markdown: string,
  url: string,
  images?: ScrapedImage[],
  detectedSections?: { name: string; evidence: string }[],
  customInstructions?: string
): Promise<AnalysisResult> {
  const { data, error } = await supabase.functions.invoke("analyze-website", {
    body: { markdown, url, images, detectedSections, customInstructions },
  });

  if (error) throw new Error(error.message || "Failed to analyze website");
  if (!data?.success) throw new Error(data?.error || "Analysis failed");

  return data.analysis;
}
