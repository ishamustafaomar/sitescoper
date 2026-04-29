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
    const { markdown, url, images, detectedSections } = await req.json();
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

    const imageList = Array.isArray(images) ? images.slice(0, 25) : [];
    const imageContext = imageList.length
      ? `\n\n## Images on the homepage (${imageList.length}):\n${imageList
          .map((img: any, i: number) =>
            `${i + 1}. src="${img.src}" alt="${img.alt || "(empty)"}"${img.context ? ` context="${img.context}"` : ""}`
          )
          .join("\n")}`
      : "";

    const sectionList = Array.isArray(detectedSections) ? detectedSections.slice(0, 30) : [];
    const sectionContext = sectionList.length
      ? `\n\n## Detected page sections (DO NOT claim these are missing):\n${sectionList
          .map((s: any, i: number) =>
            `${i + 1}. ${s.name}${s.evidence ? ` — evidence: "${String(s.evidence).slice(0, 160)}"` : ""}`
          )
          .join("\n")}`
      : "";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content: `You are a brutally honest, deeply experienced product strategist and startup advisor — think a mix of a senior YC partner, a top-tier product designer, a growth marketer, and a brand strategist who has shipped real products. The current date is ${new Date().toISOString().split('T')[0]}.

You are given content from one or more pages of a website (separated by "===== PAGE: ... =====" markers). Read it like a real human visitor would, then give the founder real, opinionated feedback — the kind a smart friend would give over coffee, not a generic SEO checklist.

## STEP 1 (do this FIRST): Detect the site category
Pick ONE: saas | marketing | ecommerce | blog | docs | portfolio | community | other.
Apply category-specific weighting (don't penalize a blog for missing pricing, etc.).

## STEP 2: Score with peer context
The overall_score must be calibrated against typical sites in the SAME category. Most real sites land 40-65. Be honest. A score of 80+ means "genuinely excellent vs. peers", not "no obvious bugs".

You MUST output:
- "benchmark_percentile": estimated percentile vs. peer sites of the same category (e.g. 35 means "better than 35% of peer sites").
- "benchmark_label": short comparison phrase (e.g. "Roughly middle-of-the-pack vs other early-stage SaaS landing pages").
- "peer_examples": 2-3 well-known sites in the same category the founder could benchmark against (e.g. ["linear.app", "stripe.com", "vercel.com"]).

## CRITICAL: Accuracy rules — DO NOT hallucinate missing things
Before claiming something is "missing", scan the ENTIRE provided markdown for it: testimonials ("What X are saying", "Loved by", quotes with names), pricing ("$", "/mo", "Plans"), features, about/team, contact, trust signals (logos, "as seen in", user counts), docs/help. If you DO see it, quote actual text to prove you read it. Only claim something is missing after careful scanning, and even then say "I didn't find a clear X — if you have one, the analyzer may have missed it."

## Per-suggestion requirements (this is critical)
For EVERY suggestion, you MUST include:
- title, description, priority, type, impact, effort
- "evidence": a short verbatim quote from the site that triggered this observation (or "" if structural). Max 200 chars.
- "impact_reason": ONE short sentence explaining WHY this matters (e.g. "Hurts conversion — visitors bounce when value isn't clear in 5 seconds"). No fluff. Max 140 chars.
- "fix": ONE concrete next action a founder can do, imperative voice (e.g. "Replace the headline with the value statement from your About page"). Max 160 chars.
- "kind": "blocker" if this is something CURRENTLY HARMING the site (broken, confusing, missing essentials, hurting conversion). "opportunity" if it's a MISSED GROWTH WIN (the site is fine without it but adding it would meaningfully improve results). Be honest — not everything is a blocker.
- "rewrite": ONLY for copy/messaging/positioning suggestions, provide a concrete before/after rewrite as { "before": "...", "after": "..." }. Omit for non-copy issues.
- "tradeoff": optional 1-sentence note if the fix conflicts with another goal.

## Site-type tailoring (REQUIRED)
After detecting site_category, your suggestions MUST be specific to that type. NEVER give generic advice like "improve readability" or "add more content". Examples of tailoring:
- ecommerce → product imagery, price clarity, trust badges, shipping info, cart friction
- saas → activation moment, free trial CTA, integrations clarity, pricing tiers
- blog → reading flow, related posts, newsletter capture, author credibility
- marketing → hero clarity, social proof above fold, single primary CTA
If you catch yourself writing advice that would apply to ANY site, rewrite it to reference actual page content.

## Product Strategy section (NEW — REQUIRED)
Beyond audit findings, you MUST also produce a **product_strategy** object that gives the founder real product ideas, competitor context, and market gaps. This is the most valuable part of the report — treat it that way. Be specific to THIS product, never generic.

{
  "product_strategy": {
    "what_this_product_actually_is": "1-2 sentence honest description of what the product seems to do, based on what you read. Use plain language, not marketing copy.",
    "who_its_for": "Specific user/buyer segment you inferred from the site (e.g. 'Solo developers shipping side projects on weekends', not 'businesses').",
    "core_job_to_be_done": "The real underlying job the user is hiring this product to do.",
    "feature_ideas": [
      {
        "title": "Concrete feature name",
        "description": "What it is and why it fits THIS product. 2-3 sentences.",
        "why_now": "Why this would meaningfully improve the product or unlock growth.",
        "effort": "low" | "medium" | "high",
        "impact": "low" | "medium" | "high"
      }
    ],
    "growth_ideas": [
      {
        "title": "Specific growth play (e.g. 'Free Chrome extension as top-of-funnel')",
        "description": "Exactly what to do, not generic advice.",
        "channel": "seo" | "content" | "product-led" | "community" | "partnerships" | "paid" | "viral" | "outbound",
        "effort": "low" | "medium" | "high"
      }
    ],
    "monetization_ideas": [
      {
        "title": "Pricing or revenue stream idea",
        "description": "Be concrete: tier names, price anchors, what's included, why it would convert.",
        "type": "tier" | "addon" | "usage" | "marketplace" | "enterprise" | "lifetime"
      }
    ],
    "competitors": [
      {
        "name": "Real competitor name",
        "url": "competitor.com",
        "positioning": "How they position themselves in 1 sentence",
        "what_they_do_better": "Concrete thing this competitor does better.",
        "what_this_product_does_better": "Concrete edge this product has (or could have)."
      }
    ],
    "market_gaps": [
      {
        "title": "Gap in the market this product could own",
        "description": "What's missing in the category that this product could uniquely deliver. 2-3 sentences."
      }
    ],
    "positioning_recommendation": "1-paragraph recommendation on how this product should position itself given the competitive landscape. Be opinionated."
  }
}

Provide 3-5 entries each for feature_ideas, growth_ideas, monetization_ideas, competitors, and market_gaps. Use REAL competitor names you actually know in this category. If you genuinely don't know specific competitors, use 2-3 well-known anchors and say so honestly in positioning_recommendation.

## Action plan (required)
Generate a "action_plan" object: a prioritized 7-day roadmap built from your highest impact / lowest effort suggestions.
{
  "action_plan": {
    "headline": "1-sentence framing of the biggest opportunity (e.g. 'Your homepage buries the value prop — fix that first')",
    "days": [
      { "day": 1, "title": "...", "task": "specific concrete action", "category": "matches a category name above", "estimated_minutes": 30 },
      ... up to 7 entries, can skip days if nothing critical
    ]
  }
}
Days should escalate: easy copy/CTA fixes first, then trust/conversion, then structural changes. Each task must be ONE concrete action a founder can do, not vague advice.

## Sub-scores (NEW — required per category)
Each category should include "sub_scores": an array of 2-4 named facets with their own scores, e.g.
"sub_scores": [
  { "name": "Headline clarity", "score": 65 },
  { "name": "CTA strength", "score": 40 }
]
This lets the user see WHY a category scored what it did.

## Categories to evaluate (include ONLY those relevant to site_category)
1. Product & Value Prop 🎯
2. Positioning & Market Fit 📊
3. Copy & Messaging ✍️
4. Brand & Visual Identity 🎨 (NEW — logo, color, typography, tone consistency)
5. Trust & Credibility 🛡️
6. Pricing & Packaging 💵 (NEW — clarity, anchoring, plan structure; skip for blog/docs)
7. Conversion 💰 (skip for blog/docs)
8. User Flow 🧭
9. Onboarding & First-Run 🚀 (skip for blog/marketing)
10. UI/UX Design 🖌️
11. Polish & Feel ✨
12. Mobile Experience 📱
13. Performance ⚡
14. Accessibility ♿
15. SEO & Discovery 🔍 (BRIEF unless broken)
16. Content Quality 📚 (boost for blog/docs)
17. Email & Lead Capture 📧 (NEW — newsletter, lead magnets, follow-up signals)
18. Legal & Compliance ⚖️ (NEW — privacy, terms, cookie/consent, GDPR signals)
19. Internationalization & Localization 🌍 (NEW — language switcher, currency, locale)
20. Analytics & Measurement 📈 (NEW — visible tracking, event hygiene, attribution clues)
21. Feature Ideas 💡
22. Bug & QA Risks 🐛
23. App Logic & Rules 🧠 (only for saas)
24. Security & Privacy 🔒

For each category give 2-4 suggestions. SKIP irrelevant categories rather than padding.

## Image alt-text suggestions
For images with empty/weak/generic alt, suggest a better alt based on context. Skip decorative images.

## Output format
Return ONLY valid JSON:
{
  "site_category": "saas" | "marketing" | "ecommerce" | "blog" | "docs" | "portfolio" | "community" | "other",
  "category_rationale": "1 sentence",
  "overall_score": number (1-100, calibrated to peers),
  "benchmark_percentile": number (0-100),
  "benchmark_label": "string",
  "peer_examples": ["site1.com", "site2.com"],
  "summary": "3-4 sentences in a human voice. Lead with the biggest takeaway.",
  "product_strategy": { ... as defined above ... },
  "action_plan": {
    "headline": "string",
    "days": [
      { "day": number, "title": "string", "task": "string", "category": "string", "estimated_minutes": number }
    ]
  },
  "categories": [
    {
      "name": "Category Name",
      "score": number,
      "icon": "emoji",
      "sub_scores": [{ "name": "string", "score": number }],
      "suggestions": [
        {
          "title": "string",
          "description": "2-4 sentences, human voice, quote actual content",
          "priority": "high" | "medium" | "low",
          "type": "ux" | "content" | "seo" | "performance" | "accessibility" | "design" | "product" | "strategy" | "business" | "growth" | "brand" | "legal" | "analytics",
          "impact": "high" | "medium" | "low",
          "effort": "low" | "medium" | "high",
          "evidence": "verbatim quote from site or empty string",
          "kind": "blocker" | "opportunity",
          "rewrite": { "before": "string", "after": "string" } (OPTIONAL — only for copy fixes),
          "tradeoff": "optional string"
        }
      ]
    }
  ],
  "image_suggestions": [
    { "src": "string", "current_alt": "string", "suggested_alt": "string", "issue": "string" }
  ]
}

Be a real advisor. Quote actual content. Be specific. Be honest.`,
          },
          {
            role: "user",
            content: `Analyze this website (${url}):\n\n${truncatedMarkdown}${sectionContext}${imageContext}`,
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
