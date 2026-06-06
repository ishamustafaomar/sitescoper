// Daily blog post generator. Picks an SEO topic, asks Lovable AI to write
// a 600-900 word post in our format, then inserts it into public.blog_posts.
// Triggered by pg_cron once per day; can also be invoked manually with an
// optional { topic } body to override the rotation.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Long-tail SEO topics. The generator picks one we haven't published yet,
// or the oldest one to refresh if every topic has been covered.
const TOPIC_POOL = [
  { keyword: "seo audit checklist for ecommerce", angle: "actionable checklist for Shopify/WooCommerce owners" },
  { keyword: "how to improve website page speed", angle: "the 5 fixes that move LCP the most" },
  { keyword: "local seo for small business", angle: "Google Business Profile + citations playbook" },
  { keyword: "schema markup for seo", angle: "which schema types matter and how to add them" },
  { keyword: "broken links checker", angle: "find and fix broken links without paid tools" },
  { keyword: "seo for saas startups", angle: "programmatic content + product-led growth angle" },
  { keyword: "ai content and seo", angle: "where AI content helps and where Google penalises it" },
  { keyword: "internal linking strategy", angle: "hub-and-spoke structure for indie founders" },
  { keyword: "meta description best practices", angle: "the 4 rules that lift CTR" },
  { keyword: "google search console for beginners", angle: "the 3 reports you actually read" },
  { keyword: "website redesign without losing seo", angle: "the pre-launch SEO migration checklist" },
  { keyword: "competitor seo analysis", angle: "how to reverse-engineer a competitor's strategy" },
  { keyword: "long tail keywords for seo", angle: "finding 50 long-tails in an afternoon" },
  { keyword: "content audit for seo", angle: "deciding what to keep, rewrite, or kill" },
  { keyword: "mobile seo best practices", angle: "mobile-first indexing fixes that ship in a day" },
  { keyword: "image seo optimization", angle: "alt text, naming, compression, lazy-loading" },
  { keyword: "seo for landing pages", angle: "how to rank a landing page without diluting the homepage" },
  { keyword: "google ranking factors 2026", angle: "what actually matters this year" },
  { keyword: "indie hacker seo playbook", angle: "the SEO loop for solo founders shipping weekly" },
  { keyword: "seo for blogs vs landing pages", angle: "when each format wins" },
];

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Manual override: caller can pass { topic, keyword } to force a topic.
    let overrideTopic: { keyword: string; angle: string } | null = null;
    if (req.method === "POST") {
      try {
        const body = await req.json();
        if (body?.keyword) {
          overrideTopic = {
            keyword: String(body.keyword).slice(0, 120),
            angle: String(body.angle || "fresh perspective for founders"),
          };
        }
      } catch { /* no body */ }
    }

    // Find an unused topic, else rotate to oldest.
    const { data: existing } = await sb
      .from("blog_posts")
      .select("keyword");
    const usedKeywords = new Set((existing ?? []).map((r: any) => r.keyword.toLowerCase()));
    const candidates = TOPIC_POOL.filter((t) => !usedKeywords.has(t.keyword.toLowerCase()));
    const topic =
      overrideTopic ??
      (candidates.length > 0
        ? candidates[Math.floor(Math.random() * candidates.length)]
        : TOPIC_POOL[Math.floor(Math.random() * TOPIC_POOL.length)]);

    const systemPrompt = `You are a senior SEO writer for SiteScoper, an AI website audit tool for founders and small businesses. Voice: direct, practical, plain-English, no jargon. Always include 1-2 internal links to /, /ai-website-audit-tool, /white-label-seo-reports, or /blog as natural prose links.

Output ONLY valid JSON with this exact shape:
{
  "title": "SEO title under 60 characters",
  "description": "Meta description under 160 characters",
  "reading_time": "e.g. '7 min'",
  "body": "Full article in markdown subset: '## H2', '### H3', '- bullet', blank-line paragraphs, **bold**, [text](url). 600-900 words. No top-level H1 (the page renders the title). Start with a strong 1-2 sentence hook. End with a CTA paragraph linking to /."
}`;

    const userPrompt = `Write a blog post targeting the SEO keyword: "${topic.keyword}".
Angle: ${topic.angle}.
Audience: founders, indie hackers, small business owners doing their own SEO.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        temperature: 0.8,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      throw new Error(`AI gateway error ${aiRes.status}: ${errText}`);
    }

    const aiJson = await aiRes.json();
    const content = aiJson.choices?.[0]?.message?.content;
    if (!content) throw new Error("AI returned empty content");

    const parsed = JSON.parse(content);
    if (!parsed.title || !parsed.description || !parsed.body) {
      throw new Error("AI output missing required fields");
    }

    // Build a unique slug from the title; suffix with a timestamp if it clashes.
    let slug = slugify(parsed.title);
    const { data: clash } = await sb
      .from("blog_posts")
      .select("slug")
      .eq("slug", slug)
      .maybeSingle();
    if (clash) slug = `${slug}-${Date.now().toString(36)}`;

    const insert = {
      slug,
      title: String(parsed.title).slice(0, 200),
      description: String(parsed.description).slice(0, 300),
      keyword: topic.keyword,
      body: String(parsed.body),
      reading_time: String(parsed.reading_time || "7 min").slice(0, 16),
    };

    const { error: insErr, data: inserted } = await sb
      .from("blog_posts")
      .insert(insert)
      .select("id, slug, title")
      .single();
    if (insErr) throw insErr;

    return new Response(JSON.stringify({ ok: true, post: inserted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
