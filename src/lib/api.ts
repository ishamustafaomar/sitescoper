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
}

export type SiteCategory =
  | "saas" | "marketing" | "ecommerce" | "blog"
  | "docs" | "portfolio" | "community" | "other";

export interface AnalysisSuggestion {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  type: "ux" | "content" | "seo" | "performance" | "accessibility" | "design" | "product" | "strategy" | "business" | "growth";
  impact?: "high" | "medium" | "low";
  effort?: "low" | "medium" | "high";
  tradeoff?: string;
}

export interface AnalysisCategory {
  name: string;
  score: number;
  icon: string;
  suggestions: AnalysisSuggestion[];
}

export interface ImageSuggestion {
  src: string;
  current_alt: string;
  suggested_alt: string;
  issue: string;
}

export interface AnalysisResult {
  overall_score: number;
  summary: string;
  categories: AnalysisCategory[];
  site_category?: SiteCategory;
  category_rationale?: string;
  image_suggestions?: ImageSuggestion[];
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
  images?: ScrapedImage[]
): Promise<AnalysisResult> {
  const { data, error } = await supabase.functions.invoke("analyze-website", {
    body: { markdown, url, images },
  });

  if (error) throw new Error(error.message || "Failed to analyze website");
  if (!data?.success) throw new Error(data?.error || "Analysis failed");

  return data.analysis;
}
