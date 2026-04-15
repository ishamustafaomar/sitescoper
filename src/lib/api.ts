import { supabase } from "@/integrations/supabase/client";

export interface CrawledPage {
  url: string;
  title?: string;
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
}

export interface AnalysisSuggestion {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  type: "ux" | "content" | "seo" | "performance" | "accessibility" | "design" | "product" | "strategy" | "business" | "growth";
}

export interface AnalysisCategory {
  name: string;
  score: number;
  icon: string;
  suggestions: AnalysisSuggestion[];
}

export interface AnalysisResult {
  overall_score: number;
  summary: string;
  categories: AnalysisCategory[];
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
  url: string
): Promise<AnalysisResult> {
  const { data, error } = await supabase.functions.invoke("analyze-website", {
    body: { markdown, url },
  });

  if (error) throw new Error(error.message || "Failed to analyze website");
  if (!data?.success) throw new Error(data?.error || "Analysis failed");

  return data.analysis;
}
