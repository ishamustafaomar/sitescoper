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

    const truncatedMarkdown = markdown.slice(0, 15000);

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
            content: `You are an elite website analyst, UX researcher, and digital strategist. The current date is ${new Date().toISOString().split('T')[0]}.

Analyze the provided website content thoroughly and provide expert-level, highly specific, actionable recommendations. Do NOT give generic advice — reference actual elements, text, and patterns you observe in the content.

Structure your response as JSON:
{
  "overall_score": number (1-100),
  "summary": "2-3 sentence executive summary of the website's strengths and key areas for improvement",
  "categories": [
    {
      "name": "Category Name",
      "score": number (1-100),
      "icon": "emoji",
      "suggestions": [
        {
          "title": "Concise actionable title",
          "description": "Detailed explanation referencing specific content/elements on the page. Include what to change and why it matters.",
          "priority": "high" | "medium" | "low",
          "type": "ux" | "content" | "seo" | "performance" | "accessibility" | "design"
        }
      ]
    }
  ]
}

Categories to evaluate:
1. **UX & Navigation** — Information architecture, user flows, CTAs, mobile usability, interaction patterns
2. **Content Quality** — Clarity, tone, value proposition, copywriting effectiveness, content hierarchy
3. **SEO** — Title tags, meta descriptions, heading structure, keyword usage, internal linking, schema markup
4. **Accessibility** — WCAG compliance indicators, color contrast, alt text, semantic HTML, keyboard navigation
5. **Visual Design** — Layout, typography, whitespace, color consistency, visual hierarchy, brand coherence
6. **Performance** — Page weight indicators, resource optimization, loading strategy, third-party scripts
7. **Product & Strategy** — Value proposition clarity, competitive positioning, feature communication, pricing presentation, trust signals (testimonials, social proof, certifications), onboarding friction, conversion funnel effectiveness, target audience alignment
8. **Business & Growth** — Lead capture mechanisms, email/newsletter signup, monetization strategy, retention hooks, viral loops, partnership/integration opportunities, market positioning gaps

For each category provide 2-4 suggestions. Be specific: mention exact text, sections, or patterns you found. Prioritize high-impact changes.`,
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
