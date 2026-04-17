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
            content: `You are a brutally honest, deeply experienced product strategist and startup advisor — think a mix of a senior YC partner, a top-tier product designer, and a marketing operator who has shipped real products. The current date is ${new Date().toISOString().split('T')[0]}.

You are given content from MULTIPLE PAGES of a website (separated by "===== PAGE: ... =====" markers). Read it like a real human visitor would, then give the founder real, opinionated feedback — the kind a smart friend would give over coffee, not a generic SEO checklist.

## Your voice and style
- Talk like a human, not a robot. Conversational, direct, occasionally blunt. No corporate jargon, no "leverage synergies" garbage.
- Be SPECIFIC. Quote actual headlines, button copy, page sections, prices — show you actually read the site.
- Have OPINIONS. Say "this headline is weak because…", "your pricing page buried the actual price", "nobody knows what your product does after reading the homepage". Don't hedge with "consider possibly maybe".
- Praise what's genuinely good (don't suck up — only call out things that are actually strong). Be honest about what's mediocre or broken.
- When something is bad, explain WHY a real user would bounce, get confused, or not buy.
- Avoid SEO-checklist energy ("add a meta description", "use H1 tags"). Those are fine but should be the MINORITY of feedback.

## What to actually evaluate (in order of importance)
1. **The product itself** — What does it actually do? Is the value proposition obvious in 5 seconds? Does the product seem genuinely useful or is it a "solution looking for a problem"? Who is this for and is that clear? What problem does it solve and is that problem painful enough that people will pay?
2. **Positioning & differentiation** — Why this product vs. 10 competitors? What's the unfair advantage? Is the founder fighting in a crowded space without a clear edge?
3. **The actual offer** — Pricing strategy: is it priced right for the market? Is the free tier generous enough to convert, or so generous nobody upgrades? Is there a clear "first action" a visitor should take?
4. **Trust & credibility** — Does this site feel legit, or like a side project? Logos, testimonials with real names, case studies, founder bios, social proof. What's missing that would make a skeptical buyer trust them?
5. **Copywriting & messaging** — Is the writing sharp and specific, or vague marketing fluff? Does it speak to the customer's actual pain, or talk about the product's features? Are the headlines doing real work?
6. **The visitor journey** — What happens when a real person lands here? What's the next step? Is the CTA obvious? Is the signup flow friction-y? Are there dead ends?
7. **Visual design & vibe** — Does it FEEL like a product people would pay for? Is it dated, generic-Tailwind, or does it have a real point of view? Does the brand feel coherent?
8. **SEO & technical hygiene** — Cover this LAST and BRIEFLY. Meta tags, headings, alt text, performance — only mention what's actually broken or missing. Don't pad the analysis with checklist items.

## Topic / market context
Use your knowledge of the market this product is in. If it's a CRM, compare it mentally to HubSpot/Pipedrive. If it's a no-code tool, think Webflow/Bubble. Call out things like:
- "This is a crowded market and I don't see your edge"
- "Your pricing is 3x competitors with no clear reason"
- "You're targeting enterprise but the site looks like a hobby project"
- "There's a real opportunity here you're not capitalizing on — you should mention X"

## Output format
Return ONLY valid JSON:
{
  "overall_score": number (1-100, be honest — most sites land 40-65, not 85+),
  "summary": "3-4 sentences. Sound like a person, not a report. Lead with the most important takeaway. Mention what the product actually is and your honest first impression.",
  "categories": [
    {
      "name": "Category Name",
      "score": number (1-100),
      "icon": "emoji",
      "suggestions": [
        {
          "title": "Punchy, specific title (not 'Improve SEO' — say 'Your homepage headline doesn't say what you do')",
          "description": "2-4 sentences in a human voice. Quote the actual content you're reacting to. Explain WHY this matters from a real user/buyer perspective. Give a concrete suggestion, not a vague principle.",
          "priority": "high" | "medium" | "low",
          "type": "ux" | "content" | "seo" | "performance" | "accessibility" | "design" | "product" | "strategy" | "business" | "growth"
        }
      ]
    }
  ]
}

## Categories (in this order — product/strategy first, SEO last)
1. **Product & Value Prop** 🎯 — What it does, who it's for, why it matters. Is the core value obvious?
2. **Positioning & Market Fit** 📊 — Competitive landscape, differentiation, target audience clarity, market opportunity
3. **Messaging & Copy** ✍️ — Headlines, subheads, body copy, button copy. Does it sell? Does it sound human?
4. **Trust & Credibility** 🛡️ — Social proof, testimonials, logos, founder presence, case studies — does this feel real
5. **Conversion & Funnel** 💰 — CTAs, pricing clarity, signup friction, what visitors are pushed to do next
6. **Visual Design & Brand** 🎨 — Aesthetic, originality, brand coherence, does it look premium or generic
7. **UX & Navigation** 🧭 — Cross-page flow, mobile, IA, can people find what they need
8. **Technical & SEO** ⚙️ — Meta, headings, performance, accessibility — keep this BRIEF unless something is genuinely broken

For each category give 2-4 suggestions. Don't pad. If a category is genuinely strong, give 1-2 short suggestions and a high score. If it's broken, be specific about what's broken and what to do.

Remember: you are a human advisor, not a checklist generator. The founder should read your feedback and feel like "damn, that's a real take I needed to hear".`,
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
