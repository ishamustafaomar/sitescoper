import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { markdown, url } = await req.json();
    if (!markdown || typeof markdown !== "string") {
      return new Response(JSON.stringify({ error: "Markdown content is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const truncatedMarkdown = markdown.slice(0, 40000);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          {
            role: "system",
            content: `You are an elite website analyst, UX researcher, product strategist, and digital consultant. The current date is ${new Date().toISOString().split('T')[0]}.

You are given content from MULTIPLE PAGES of a website, separated by "===== PAGE: ... =====" markers. Use ALL pages to form a comprehensive picture of the product, not just the homepage.

Analyze the provided website content thoroughly and provide expert-level, highly specific, actionable recommendations. Do NOT give generic advice — reference actual elements, text, sections, and patterns you observe across the pages.

When multiple pages are available, evaluate how they work TOGETHER as a product experience:
- Does the navigation make sense across pages?
- Is the messaging consistent?
- Are there missing pages that should exist (e.g., no pricing page, no docs, no about page)?
- How does the signup/onboarding flow look based on available signup/login pages?
- Is the pricing strategy clear and competitive from the pricing page?
- Is the feature communication effective across feature pages?
- Is the documentation helpful and well-structured if docs exist?

Structure your response as JSON:
{
  "overall_score": number (1-100),
  "summary": "2-3 sentence executive summary of the website's strengths and key areas for improvement, referencing specific pages analyzed",
  "categories": [
    {
      "name": "Category Name",
      "score": number (1-100),
      "icon": "emoji",
      "suggestions": [
        {
          "title": "Concise actionable title",
          "description": "Detailed explanation referencing specific content/elements on specific pages. Include what to change and why it matters.",
          "priority": "high" | "medium" | "low",
          "type": "ux" | "content" | "seo" | "performance" | "accessibility" | "design" | "product" | "strategy" | "business" | "growth"
        }
      ]
    }
  ]
}

Categories to evaluate:
1. **UX & Navigation** — Information architecture across pages, user flows between pages, CTAs, mobile usability, interaction patterns, cross-page consistency
2. **Content Quality** — Clarity, tone, value proposition, copywriting effectiveness, content hierarchy, messaging consistency across pages
3. **SEO** — Title tags, meta descriptions, heading structure, keyword usage, internal linking between pages, schema markup
4. **Accessibility** — WCAG compliance indicators, color contrast, alt text, semantic HTML, keyboard navigation
5. **Visual Design** — Layout, typography, whitespace, color consistency, visual hierarchy, brand coherence across pages
6. **Performance** — Page weight indicators, resource optimization, loading strategy, third-party scripts
7. **Product Experience** — Signup/onboarding friction (based on signup page if found), feature discoverability, page flow logic, information architecture, missing critical pages, documentation quality, pricing page effectiveness, demo/trial accessibility
8. **Business & Growth** — Value proposition clarity, competitive positioning, lead capture mechanisms, trust signals (testimonials, social proof, certifications), conversion funnel effectiveness, monetization strategy, retention hooks, market positioning gaps

For each category provide 2-4 suggestions. Be specific: mention exact text, sections, page names, or patterns you found. Prioritize high-impact changes. When referencing content, note which page it came from.`,
          },
          {
            role: "user",
            content: `Analyze this website (${url}):\n\n${truncatedMarkdown}`,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings > Workspace > Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI analysis failed");
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content;

    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch {
      analysis = { summary: content, categories: [], overall_score: 0 };
    }

    return new Response(JSON.stringify({ success: true, analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
