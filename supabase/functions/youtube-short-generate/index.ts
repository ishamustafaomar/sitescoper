import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { encode as b64encode, decode as b64decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FORMATS = [
  "i-scanned-famous-site",
  "three-things-wrong",
  "before-after",
  "what-lighthouse-wont-tell-you",
  "sixty-second-audit",
];

const PALETTES = [
  { bg: "#0F172A", accent: "#3B82F6" },
  { bg: "#0B0B0F", accent: "#F59E0B" },
  { bg: "#1E1B4B", accent: "#22D3EE" },
  { bg: "#111827", accent: "#10B981" },
  { bg: "#1F1147", accent: "#F472B6" },
];

// Famous sites people recognize and would click on to see roasted.
const TARGET_SITES = [
  "https://www.apple.com",
  "https://stripe.com",
  "https://notion.so",
  "https://vercel.com",
  "https://openai.com",
  "https://linear.app",
  "https://airbnb.com",
  "https://spotify.com",
  "https://figma.com",
  "https://cursor.sh",
];

// ElevenLabs voices — dev-showing-a-friend-a-bug energy
const VOICES = [
  "TX3LPaxmHKxFdv7VOQHJ", // Liam
  "nPczCjzI2devNBz1zQrb", // Brian
  "bIHbv24MWmeRgasZH58o", // Will
];

function pickRandom<T>(a: T[]): T {
  return a[Math.floor(Math.random() * a.length)];
}

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

// ---------- Real audit of the target site ----------
// We refuse to invent facts. If we can't verify something, we don't say it.
type RealFact = { label: string; detail: string };

async function auditTargetSite(url: string): Promise<{ facts: RealFact[]; title: string; description: string }> {
  const key = Deno.env.get("FIRECRAWL_API_KEY");
  if (!key) return { facts: [], title: "", description: "" };
  const r = await fetch("https://api.firecrawl.dev/v2/scrape", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ url, formats: ["html"], onlyMainContent: false }),
  });
  if (!r.ok) return { facts: [], title: "", description: "" };
  const j = await r.json();
  const doc = j.data ?? j;
  const html: string = doc.html ?? doc.rawHtml ?? "";
  if (!html) return { facts: [], title: "", description: "" };

  const headMatch = html.match(/<head[\s\S]*?<\/head>/i);
  const head = headMatch ? headMatch[0] : html;
  const titleMatch = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].replace(/\s+/g, " ").trim() : "";
  const descMatch = head.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
  const description = descMatch ? descMatch[1].trim() : "";
  const canonicalMatches = Array.from(head.matchAll(/<link[^>]*rel=["']canonical["'][^>]*>/gi));
  const h1s = Array.from(html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi))
    .map((m) => m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const ogImage = /<meta[^>]*property=["']og:image["']/i.test(head);
  const ogTitle = /<meta[^>]*property=["']og:title["']/i.test(head);
  const twitterCard = /<meta[^>]*name=["']twitter:card["']/i.test(head);
  const viewport = /<meta[^>]*name=["']viewport["']/i.test(head);
  const lang = /<html[^>]*\blang=["'][^"']+["']/i.test(html);
  const jsonLd = (html.match(/<script[^>]*type=["']application\/ld\+json["']/gi) || []).length;
  const imgs = Array.from(html.matchAll(/<img\b[^>]*>/gi)).map((m) => m[0]);
  const imgsNoAlt = imgs.filter((t) => !/\balt=/i.test(t)).length;
  const imgsNoLazy = imgs.filter((t) => !/\bloading=["']lazy["']/i.test(t)).length;

  const facts: RealFact[] = [];
  if (!title) facts.push({ label: "missing_title", detail: "The <title> tag is missing." });
  else if (title.length < 30) facts.push({ label: "short_title", detail: `Title is only ${title.length} characters: "${title}".` });
  else if (title.length > 60) facts.push({ label: "long_title", detail: `Title is ${title.length} characters — Google will truncate it: "${title}".` });

  if (!description) facts.push({ label: "missing_description", detail: "The meta description is empty." });
  else if (description.length < 70) facts.push({ label: "short_description", detail: `Meta description is only ${description.length} characters.` });
  else if (description.length > 160) facts.push({ label: "long_description", detail: `Meta description is ${description.length} characters — it will get cut off in search results.` });

  if (canonicalMatches.length === 0) facts.push({ label: "no_canonical", detail: "There is no <link rel=\"canonical\"> on the page." });
  else if (canonicalMatches.length > 1) facts.push({ label: "multiple_canonicals", detail: `${canonicalMatches.length} canonical tags — only one is allowed.` });

  if (h1s.length === 0) facts.push({ label: "no_h1", detail: "There is no <h1> on the page." });
  else if (h1s.length > 1) facts.push({ label: "multiple_h1", detail: `${h1s.length} <h1> tags on one page.` });
  else facts.push({ label: "h1", detail: `The H1 is "${h1s[0].slice(0, 100)}".` });

  if (!ogImage) facts.push({ label: "no_og_image", detail: "No og:image, so link previews are blank." });
  if (!ogTitle) facts.push({ label: "no_og_title", detail: "No og:title tag." });
  if (!twitterCard) facts.push({ label: "no_twitter_card", detail: "No twitter:card tag." });
  if (!viewport) facts.push({ label: "no_viewport", detail: "No viewport meta tag — the page isn't mobile-optimized." });
  if (!lang) facts.push({ label: "no_lang", detail: "The <html> tag is missing a lang attribute." });
  if (jsonLd === 0) facts.push({ label: "no_jsonld", detail: "There is no JSON-LD structured data on the page." });
  if (imgs.length > 0 && imgsNoAlt > 0) facts.push({ label: "images_no_alt", detail: `${imgsNoAlt} of ${imgs.length} <img> tags are missing alt text.` });
  if (imgs.length > 5 && imgsNoLazy > imgs.length / 2) facts.push({ label: "images_no_lazy", detail: `${imgsNoLazy} of ${imgs.length} images don't use loading="lazy".` });

  return { facts, title, description };
}

// ---------- Firecrawl screenshot ----------
async function firecrawlScreenshot(url: string): Promise<string | null> {
  const key = Deno.env.get("FIRECRAWL_API_KEY");
  if (!key) return null;
  try {
    const r = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        formats: ["screenshot"],
        onlyMainContent: false,
        waitFor: 2500,
      }),
    });
    if (!r.ok) {
      console.warn("firecrawl", r.status, (await r.text()).slice(0, 200));
      return null;
    }
    const j = await r.json();
    return j?.data?.screenshot || null;
  } catch (e) {
    console.warn("firecrawl fetch failed", e);
    return null;
  }
}

// ---------- Storage upload from a remote URL or bytes ----------
async function uploadBytes(
  supabase: any,
  path: string,
  bytes: Uint8Array,
  contentType: string,
): Promise<string> {
  const { error } = await supabase.storage.from("youtube-shorts").upload(path, bytes, {
    contentType,
    upsert: true,
  });
  if (error) throw new Error(`storage upload ${path}: ${error.message}`);
  return path;
}

async function uploadFromUrl(
  supabase: any,
  path: string,
  remoteUrl: string,
  contentType: string,
): Promise<string | null> {
  try {
    const r = await fetch(remoteUrl);
    if (!r.ok) return null;
    const buf = new Uint8Array(await r.arrayBuffer());
    return await uploadBytes(supabase, path, buf, contentType);
  } catch (e) {
    console.warn("uploadFromUrl failed", e);
    return null;
  }
}

// ---------- Script generation ----------
type Beat = {
  text: string; // full sentence for the voiceover
  screenshot_index: number; // which screenshot to show (0..N-1); 0 = target site, 1 = sitescoper report
  visual_note: string; // short description of what should visually happen (kenburns / highlight / cut)
};
type Brief = {
  title: string;
  description: string;
  tags: string[];
  hook: string; // 3-5 word on-screen caption at frame 0
  beats: Beat[]; // 3-5 beats
  end_card: string; // final line, e.g. "sitescoper.com — free"
};

async function draftBrief(format: string, targetSite: string, facts: RealFact[], pageTitle: string): Promise<Brief> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY missing");

  const factList = facts.map((f, i) => `${i + 1}. [${f.label}] ${f.detail}`).join("\n");

  const prompt = `You are scripting a 22-second vertical YouTube Short promoting SiteScoper (a free AI website audit tool at sitescoper.com).

FORMAT: ${format}
TARGET SITE (real screenshot of this site is the background): ${targetSite}
PAGE <title> (verbatim, use only if quoted exactly): ${pageTitle || "(none)"}

VERIFIED FACTS ABOUT ${targetSite} (freshly scraped a moment ago — these are the ONLY facts you may state as true about the site):
${factList}

HARD RULES ON FACTS:
- You may ONLY reference facts from the list above. Do not invent load times, image sizes, Lighthouse scores, traffic numbers, revenue impact, or any statistic that isn't in the list.
- Do not claim "the hero image is 4MB" or "the site loads in X seconds" or "they're losing Y customers" — none of that is verified.
- If you quote the page title, quote it verbatim from PAGE <title> above.
- Pick 1–2 of the strongest facts and build the whole script around them. Be specific — say the actual number, actual tag name, actual title text.
- If the fact list is empty, just say the site looks clean and pivot to "run your own site through sitescoper.com".

VOICE (spoken by ElevenLabs, calm dev showing a friend a bug):
- 3 to 5 beats of continuous speech, 4-6 seconds each.
- Total speech ~18 seconds. Natural sentences (NOT captions — this is what a person actually says).
- Talk like a developer, not a marketer. Short concrete sentences.
- Never say "Hey guys", "Today I", "In this video", "make sure to subscribe".
- Reference the target site by name in beat 1.
- Final beat is the CTA: mentions "sitescoper.com" and "free". Nothing else.

ON-SCREEN HOOK (frame 0, before voice starts):
- 3-5 words, all caps energy. Must stop the scroll in half a second.
- Examples: "APPLE.COM IS BROKEN.", "I SCANNED STRIPE.", "YOUR HOMEPAGE IS LEAKING MONEY."

BEATS reference screenshots. Available screenshot indices:
- 0 = the target site (${targetSite})
- 1 = SiteScoper's report on that site

YOUTUBE METADATA:
- Title: max 55 chars, no emojis, includes "SEO" or "audit" or "broken" or "roast".
- Description: 2-3 lines. Last line has a placeholder LINK_HERE — the server will replace with the UTM link.
- 8-12 lowercase tags, no # symbol.

Return ONLY JSON matching:
{
  "title": "...",
  "description": "line one\\nline two\\nLINK_HERE",
  "tags": ["...","..."],
  "hook": "3-5 WORD HOOK",
  "beats": [
    {"text": "spoken sentence", "screenshot_index": 0, "visual_note": "slow zoom into header"}
  ],
  "end_card": "sitescoper.com — free"
}`;

  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-pro",
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
  return JSON.parse(content) as Brief;
}

// ---------- ElevenLabs TTS with word-level timestamps ----------
type WordTiming = { word: string; start_ms: number; end_ms: number };

async function synthesizeVoice(
  text: string,
  voiceId: string,
): Promise<{ mp3: Uint8Array; words: WordTiming[]; duration_ms: number }> {
  const key = Deno.env.get("ELEVENLABS_API_KEY");
  if (!key) throw new Error("ELEVENLABS_API_KEY missing");

  const r = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        model_id: "eleven_turbo_v2_5",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.35,
          use_speaker_boost: true,
          speed: 1.05,
        },
      }),
    },
  );
  if (!r.ok) {
    const txt = await r.text();
    // Detect quota exhaustion so the caller can return a clear message instead of a generic 500.
    let code = "";
    try { code = JSON.parse(txt)?.code || ""; } catch { /* non-JSON body */ }
    if (code === "quota_exceeded" || /quota_exceeded/i.test(txt)) {
      const err: any = new Error("elevenlabs_quota_exceeded");
      err.code = "elevenlabs_quota_exceeded";
      err.status = r.status;
      err.detail = txt.slice(0, 300);
      throw err;
    }
    throw new Error(`elevenlabs ${r.status}: ${txt.slice(0, 300)}`);
  }
  const j = await r.json();
  const mp3 = b64decode(j.audio_base64);
  // Alignment: { characters, character_start_times_seconds, character_end_times_seconds }
  const align = j.alignment || j.normalized_alignment;
  const words: WordTiming[] = [];
  if (align?.characters?.length) {
    let cur = "";
    let startS: number | null = null;
    let endS = 0;
    for (let i = 0; i < align.characters.length; i++) {
      const ch: string = align.characters[i];
      const s: number = align.character_start_times_seconds[i];
      const e: number = align.character_end_times_seconds[i];
      if (/\s/.test(ch) || i === align.characters.length - 1) {
        if (!/\s/.test(ch)) {
          cur += ch;
          endS = e;
        }
        if (cur.trim()) {
          words.push({
            word: cur.trim(),
            start_ms: Math.round((startS ?? 0) * 1000),
            end_ms: Math.round(endS * 1000),
          });
        }
        cur = "";
        startS = null;
      } else {
        if (startS === null) startS = s;
        cur += ch;
        endS = e;
      }
    }
  }
  const duration_ms = words.length ? words[words.length - 1].end_ms : 20000;
  return { mp3, words, duration_ms };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const id = crypto.randomUUID();
    const format = await pickFormat(supabase);
    const targetSite = pickRandom(TARGET_SITES);
    const voiceId = pickRandom(VOICES);
    const palette = pickRandom(PALETTES);
    const utm = `yt-short-${id.slice(0, 8)}`;

    // 0. Real audit of the target site — this drives the script's facts.
    const audit = await auditTargetSite(targetSite);
    const insight = audit.facts.length
      ? `${targetSite}: ${audit.facts[0].detail}`
      : `${targetSite}: no obvious surface-level SEO issues.`;

    // 1. Screenshot the target site + sitescoper.com in parallel
    const [targetShot, sitescoperShot] = await Promise.all([
      firecrawlScreenshot(targetSite),
      firecrawlScreenshot("https://sitescoper.com"),
    ]);

    const screenshotUrls: string[] = [];
    for (const [i, url] of [targetShot, sitescoperShot].entries()) {
      if (!url) { screenshotUrls.push(""); continue; }
      const path = `${id}/shot-${i}.jpg`;
      const uploaded = await uploadFromUrl(supabase, path, url, "image/jpeg");
      screenshotUrls.push(uploaded ? path : url); // fallback to remote if upload fails
    }

    // 2. Script — grounded in the real audit facts, never invented
    const brief = await draftBrief(format, targetSite, audit.facts, audit.title);

    // 3. Voice — synthesize the concatenated beats as ONE clip so pauses feel natural
    const spokenText = (brief.beats || [])
      .map((b) => b.text.trim())
      .filter(Boolean)
      .join(" ... ");
    const voice = await synthesizeVoice(spokenText, voiceId);
    const voicePath = `${id}/voice.mp3`;
    await uploadBytes(supabase, voicePath, voice.mp3, "audio/mpeg");

    // 4. Description with UTM link
    const utmLink = `https://sitescoper.com/?utm_source=youtube&utm_medium=shorts&utm_campaign=${utm}`;
    let description = String(brief.description || "");
    if (description.includes("LINK_HERE")) description = description.replace("LINK_HERE", utmLink);
    else if (!description.includes("sitescoper.com")) description += `\n\n${utmLink}`;

    // 5. Persist
    const { data, error } = await supabase
      .from("youtube_shorts")
      .insert({
        id,
        format,
        insight,
        target_site: targetSite,
        title: String(brief.title || "").slice(0, 80),
        description,
        tags: Array.isArray(brief.tags) ? brief.tags.slice(0, 15) : [],
        captions: brief.beats || [],
        caption_timings: voice.words,
        screenshot_urls: screenshotUrls,
        script: spokenText,
        voice_url: voicePath,
        voice_id: voiceId,
        duration_ms: voice.duration_ms + 2000, // +2s end card
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
    return new Response(JSON.stringify({ ok: false, error: "generation_failed", detail: String((e as Error).message || e).slice(0, 500) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});