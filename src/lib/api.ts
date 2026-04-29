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
  partial?: boolean;
  partialReason?: string;
}

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

export interface FeatureIdea {
  title: string;
  description: string;
  why_now?: string;
  effort?: "low" | "medium" | "high";
  impact?: "low" | "medium" | "high";
}

export interface GrowthIdea {
  title: string;
  description: string;
  channel?: string;
  effort?: "low" | "medium" | "high";
}

export interface MonetizationIdea {
  title: string;
  description: string;
  type?: string;
}

export interface CompetitorInfo {
  name: string;
  url?: string;
  positioning?: string;
  what_they_do_better?: string;
  what_this_product_does_better?: string;
}

export interface MarketGap {
  title: string;
  description: string;
}

export interface ProductStrategy {
  what_this_product_actually_is?: string;
  who_its_for?: string;
  core_job_to_be_done?: string;
  feature_ideas?: FeatureIdea[];
  growth_ideas?: GrowthIdea[];
  monetization_ideas?: MonetizationIdea[];
  competitors?: CompetitorInfo[];
  market_gaps?: MarketGap[];
  positioning_recommendation?: string;
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
  product_strategy?: ProductStrategy;
}

export async function scrapeWebsite(url: string): Promise<ScrapeResult> {
  const { data, error } = await supabase.functions.invoke("scrape-website", {
    body: { url },
  });

  if (error) throw new Error(error.message || "Failed to scrape website");
  if (!data?.success) throw new Error(data?.error || "Scrape failed");

  return data.data?.data || data.data;
}

export async function analyzeWebsite(
  markdown: string,
  url: string,
  images?: ScrapedImage[],
  detectedSections?: { name: string; evidence: string }[]
): Promise<AnalysisResult> {
  const { data, error } = await supabase.functions.invoke("analyze-website", {
    body: { markdown, url, images, detectedSections },
  });

  if (error) throw new Error(error.message || "Failed to analyze website");
  if (!data?.success) throw new Error(data?.error || "Analysis failed");

  return data.analysis;
}
