import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: claims, error: authErr } = await sb.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (authErr || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { markdown, url, summary, site_category } = await req.json();
    if (!markdown || typeof markdown !== "string") {
      return new Response(JSON.stringify({ error: "Markdown required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: `You are a senior conversion copywriter (think Harry Dry meets a YC partner). Given a website's content and current positioning, generate stronger headline alternatives.

Output ONLY valid JSON:
{
  "current_headline": "the headline you found on the site (verbatim) or empty string",
  "diagnosis": "1 sentence on what's weak about the current headline",
  "rewrites": [
    {
      "headline": "new headline (max 12 words, specific, value-driven, no buzzwords)",
      "subheadline": "1 supporting line (max 20 words)",
      "angle": "short label like 'Outcome-led' / 'Pain-first' / 'Specific proof' / 'Curiosity hook'",
      "why": "1 short sentence on why this would convert better"
    }
  ],
  "cta_suggestions": ["3 short CTA button labels (max 4 words each)"]
}

Rules:
- Provide exactly 4 distinct rewrites with different angles.
- Reference the actual product. No generic phrases like "transform your business".
- Avoid em dashes, exclamation marks, and "powered by AI" cliches.
- If the site is a game/portfolio/blog, adapt the framing accordingly.`,
          },
          {
            role: "user",
            content: `Site: ${url}\nCategory: ${site_category || "unknown"}\nWhat we know: ${summary || ""}\n\nPage content (truncated):\n${markdown.slice(0, 12000)}`,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limited. Try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Settings > Workspace > Usage." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      console.error("AI error", response.status, await response.text());
      throw new Error("AI rewrite failed");
    }
    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content;
    let result;
    try { result = JSON.parse(content); } catch { result = { rewrites: [], current_headline: "", diagnosis: content }; }
    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("rewrite error:", e);
    return new Response(JSON.stringify({ error: e?.message || "Rewrite failed" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});