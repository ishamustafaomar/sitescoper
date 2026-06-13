import { supabase } from "@/integrations/supabase/client";

export type CheckStatus = "pass" | "warn" | "fail";
export type CheckGroup = "meta" | "social" | "structure" | "indexing";

export interface SeoCheck {
  id: string;
  name: string;
  status: CheckStatus;
  detail: string;
  fix?: string;
  group: CheckGroup;
}

export interface SeoAuditResult {
  url: string;
  score: number;
  checks: SeoCheck[];
  head: {
    title: string;
    description: string;
    canonical: string;
    lang: string;
    robots: string;
    viewport: string;
    og: { title: string[]; description: string[]; image: string[]; url: string[]; type: string[] };
    twitter: { card: string[]; title: string[]; description: string[] };
    jsonLdTypes: string[];
  };
  headings: { level: number; text: string }[];
  statusCode?: number;
}

export async function runSeoAudit(url: string): Promise<SeoAuditResult> {
  const { data, error } = await supabase.functions.invoke("seo-audit", { body: { url } });
  if (error) throw new Error(error.message || "SEO audit failed");
  if (!data?.success) throw new Error(data?.error || "SEO audit failed");
  return data as SeoAuditResult;
}