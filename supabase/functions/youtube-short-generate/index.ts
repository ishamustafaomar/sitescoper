import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FORMATS = [
  "i-scanned-famous-site",
  "three-seo-issues",
  "five-second-test",
  "before-after",
  "what-lighthouse-wont-tell-you",
];

const PALETTES = [
  { bg: "#0F172A", accent: "#3B82F6" },
  { bg: "#0B0B0F", accent: "#F59E0B" },
  { bg: "#1E1B4B", accent: "#22D3EE" },
  { bg: "#111827", accent: "#10B981" },
  { bg: "#1F1147", accent: "#F472B6" },
];

async function pickFormat(supabase: any): Promise<string> {
  const { data } = await supabase
    .from("youtube_shorts")
    .select("format")
    .order("generated_at", { ascending: false })
    .limit(5);
  const recent = new Set((data || []).map((r: any) => r.format));
  const fresh = FORMATS.filter((f) => !recent.has(f));
  const pool = fresh.length ? fresh : FORMATS;
  return pool[Math.floor(Math.random() * pool.length)];
}

async function pickInsight(supabase: any, format: string): Promise<string> {
  // Try to ground in a real recent finding.
  const { data } = await supabase
    .from("analysis_history")
    .select("url, results")
    .order("created_at", { ascending: false })
    .limit(20);
  const candidates: string[] = [];
  for (const row of data || []) {
    const r = row.results;
    if (!r || typeof r !== "object") continue;
    const findings = (r as any).findings || (r as any).issues || [];
    if (Array.isArray(findings)) {
      for (const f of findings.slice(0, 3)) {
        const t = f?.title || f?.message || f?.description;
        if (t && typeof t === "string") candidates.push(`${row.url}: ${t}`);
      }
    }
  }
  if (candidates.length) return candidates[Math.floor(Math.random() * candidates.length)];
  // Fallback hooks
  const fallback = [
    "Most landing pages ship a 4MB hero image and call it a day.",
    "Your H1 is 'Welcome' — nobody is searching for 'Welcome'.",
    "Lighthouse says 95 but your title tag is still 'Untitled'.",
    "Three SiteScoper users had no canonical tag on their homepage this week.",
    "Your meta description is your free ad. Most sites leave it blank.",
  ];
  return fallback[Math.floor(Math.random() * fallback.length)];
}

async function draftBrief(format: string, insight: string) {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY missing");

  const prompt = `You are scripting a 20-second vertical YouTube Short promoting SiteScoper (a free AI website audit tool at sitescoper.com).

FORMAT: ${format}
INSIGHT TO ANCHOR ON: ${insight}

RULES:
- Talk like a developer showing a friend a bug. No marketing voice. No "Hey guys".
- Hook lands in frame 0. The first caption is the hook.
- 4 to 6 captions total, each 2.5-4 seconds. Last caption is the CTA.
- Captions must be SHORT: max 7 words each. Big-text-on-screen energy.
- One concrete insight. Not "SiteScoper is great" — show the specific thing.
- CTA caption must include "sitescoper.com" and "free".
- Title: max 55 chars, no emojis, includes "SEO" or "audit" or "site".
- Description: 2-3 short lines, ends with a line containing the UTM link.
- 8-12 lowercase tags, no #.

Return ONLY JSON matching:
{
  "title": "...",
  "description": "...",
  "tags": ["...","..."],
  "captions": [
    {"text": "hook line", "start_ms": 0, "end_ms": 2800},
    {"text": "...", "start_ms": 2800, "end_ms": 6000}
  ]
}`;

  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "You return only valid JSON. No prose." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`lovable-ai ${r.status}: ${txt.slice(0, 300)}`);
  }
  const j = await r.json();
  const content = j.choices?.[0]?.message?.content || "{}";
  return JSON.parse(content);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const format = await pickFormat(supabase);
    const insight = await pickInsight(supabase, format);
    const brief = await draftBrief(format, insight);

    const id = crypto.randomUUID();
    const utm = `yt-short-${id.slice(0, 8)}`;
    const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];

    // Inject UTM link into description if not present
    const utmLink = `https://sitescoper.com/?utm_source=youtube&utm_medium=shorts&utm_campaign=${utm}`;
    let description: string = String(brief.description || "");
    if (!description.includes("sitescoper.com")) description += `\n\n${utmLink}`;
    else description = description.replace(/https?:\/\/(www\.)?sitescoper\.com\S*/g, utmLink);

    const { data, error } = await supabase
      .from("youtube_shorts")
      .insert({
        id,
        format,
        insight,
        title: String(brief.title || "").slice(0, 80),
        description,
        tags: Array.isArray(brief.tags) ? brief.tags.slice(0, 15) : [],
        captions: Array.isArray(brief.captions) ? brief.captions : [],
        bg_color: palette.bg,
        accent_color: palette.accent,
        utm_campaign: utm,
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, short: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("youtube-short-generate error", e);
    return new Response(JSON.stringify({ ok: false, error: "generation_failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});