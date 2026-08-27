import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ChatMessage {
  role: "user" | "assistant" | "tool";
  content: string;
  tool_call_id?: string;
  tool_calls?: any[];
}

function buildSystemPrompt(analysis: any, url: string, scrapeMeta: any, detectedSections: any[]) {
  const sectionList = (detectedSections || []).map((s: any) => `- ${s.name}: "${(s.evidence || "").slice(0, 100)}"`).join("\n") || "(none detected)";
  const summary = analysis?.summary || "";
  const score = analysis?.overall_score ?? "?";
  const cat = analysis?.site_category || "unknown";
  const categories = (analysis?.categories || [])
    .map((c: any) => {
      const tips = (c.suggestions || []).slice(0, 4)
        .map((s: any) => `   • [${s.priority}] ${s.title} — ${s.description}${s.evidence ? ` (evidence: "${s.evidence.slice(0, 80)}")` : ""}`)
        .join("\n");
      return `## ${c.name} (${c.score}/100)\n${tips}`;
    })
    .join("\n\n");

  return `You are a helpful, brutally honest product strategist who has just delivered an audit of the website ${url}.

You have FULL CONTEXT of the existing report. Help the founder discuss findings, clarify recommendations, debate priorities, and decide what to ship next.

# THE REPORT
- Site: ${url}
- Detected category: ${cat}
- Overall score: ${score}/100
- One-line summary: ${summary}

## Sections detected on the homepage (treat as PRESENT)
${sectionList}

## Page metadata
- Title: ${scrapeMeta?.title || "(unknown)"}
- Meta description: ${scrapeMeta?.description || "(unknown)"}

## Category findings
${categories}

# WHAT YOU CAN DO
You are not limited to repeating the report. You can reason about anything on the site: brand, logo, colour, typography, copy, pricing, funnel, onboarding, technical SEO, competitors, positioning, growth experiments. When a question needs evidence you don't already have (e.g. "what about my logo?", "is my pricing page confusing?", "what's on /about?"), CALL A TOOL and look before answering.

Tools available:
- rescan_section: re-fetch the homepage and look for a specific section the user says you missed.
- fetch_page: fetch any page of the site (or a path like "/pricing") and read its real content, headings, title and meta.
- inspect_visuals: list the site's images with alt text, dimensions and filenames — use this for logo, imagery, and alt-text questions.

# RULES
- Be concise (2-5 short paragraphs max unless asked for detail). Use markdown. Real opinions, not generic platitudes. No emojis.
- If the user says you got something wrong (e.g. "we DO have testimonials"), believe them, verify with a tool, and correct yourself without being defensive.
- For questions about a specific asset or page, fetch it first, then give specific, evidence-backed advice (quote what you saw).
- If asked "what should I do first?", point to highest-impact / lowest-effort items.
- If the user asks for a copy rewrite or new headline, give 2-3 concrete options.
- Never invent data. If a tool returns nothing useful, say what you checked and then clearly label any speculation ("My guess: ...").`;
}

const tools = [
  {
    type: "function",
    function: {
      name: "rescan_section",
      description: "Re-fetch the homepage and look for a specific section the user thinks the original scan missed (e.g. testimonials, pricing). Use when the user disputes a finding.",
      parameters: {
        type: "object",
        properties: {
          section_keyword: {
            type: "string",
            description: "What to look for, e.g. 'testimonials', 'pricing', 'team', 'case studies'. A short keyword.",
          },
        },
        required: ["section_keyword"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "fetch_page",
      description: "Fetch and read any page on the audited site. Use for questions about a specific page (pricing, about, docs, a blog post) or to double-check the homepage content.",
      parameters: {
        type: "object",
        properties: {
          page: {
            type: "string",
            description: "A path like '/pricing' or a full URL on the same site. Use '/' for the homepage.",
          },
        },
        required: ["page"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "inspect_visuals",
      description: "List the images on a page with their alt text and filenames, including likely logo assets. Use for logo, branding, imagery or alt-text questions.",
      parameters: {
        type: "object",
        properties: {
          page: {
            type: "string",
            description: "Path or full URL to inspect. Use '/' for the homepage.",
          },
        },
        required: ["page"],
        additionalProperties: false,
      },
    },
  },
];

function resolveTarget(baseUrl: string, page: string): string | null {
  try {
    const base = new URL(baseUrl);
    const target = new URL(page || "/", base);
    if (!["http:", "https:"].includes(target.protocol)) return null;
    if (target.hostname.replace(/^www\./, "") !== base.hostname.replace(/^www\./, "")) return null;
    return target.toString();
  } catch {
    return null;
  }
}

async function scrapeRaw(url: string): Promise<{ markdown: string; html: string } | string> {
  const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
  if (!FIRECRAWL_API_KEY) return "Unavailable (no Firecrawl key).";
  try {
    const res = await fetch("https://api.firecrawl.dev/v2/scrape", {
      method: "POST",
      headers: { Authorization: `Bearer ${FIRECRAWL_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url, formats: ["markdown", "html"], onlyMainContent: false }),
    });
    const data = await res.json();
    if (!res.ok) return `Fetch failed: ${data.error || res.status}`;
    const result = data.data || data;
    return { markdown: (result.markdown || "").slice(0, 30000), html: (result.html || "").slice(0, 60000) };
  } catch (e) {
    console.error("scrapeRaw error", e);
    return "Fetch error: request failed";
  }
}

async function fetchPageTool(baseUrl: string, page: string): Promise<string> {
  const target = resolveTarget(baseUrl, page);
  if (!target) return "Fetch failed: only pages on the audited site can be fetched.";
  const r = await scrapeRaw(target);
  if (typeof r === "string") return r;
  const title = (r.html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "").trim();
  const desc = (r.html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1] || "").trim();
  const headings: string[] = [];
  const hre = /<h([1-3])[^>]*>([\s\S]*?)<\/h\1>/gi;
  let m;
  while ((m = hre.exec(r.html)) !== null && headings.length < 25) {
    const t = m[2].replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    if (t) headings.push(`H${m[1]}: ${t}`);
  }
  return `PAGE ${target}\nTitle: ${title || "(none)"}\nMeta description: ${desc || "(none)"}\nHeadings:\n${headings.join("\n") || "(none)"}\n\nContent (truncated):\n${r.markdown.slice(0, 8000)}`;
}

async function inspectVisualsTool(baseUrl: string, page: string): Promise<string> {
  const target = resolveTarget(baseUrl, page);
  if (!target) return "Fetch failed: only pages on the audited site can be inspected.";
  const r = await scrapeRaw(target);
  if (typeof r === "string") return r;
  const imgs: string[] = [];
  const ire = /<img\b[^>]*>/gi;
  let m;
  while ((m = ire.exec(r.html)) !== null && imgs.length < 40) {
    const tag = m[0];
    const src = tag.match(/src=["']([^"']+)["']/i)?.[1] || "";
    const alt = tag.match(/alt=["']([^"']*)["']/i)?.[1];
    const w = tag.match(/width=["']?(\d+)/i)?.[1];
    const h = tag.match(/height=["']?(\d+)/i)?.[1];
    const looksLogo = /logo|brand|mark|icon/i.test(src) ? " [likely logo/brand asset]" : "";
    imgs.push(`- ${src}${looksLogo} | alt: ${alt === undefined ? "(MISSING alt attribute)" : alt === "" ? "(empty)" : alt}${w && h ? ` | ${w}x${h}` : ""}`);
  }
  const favicon = r.html.match(/<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]+href=["']([^"']+)["']/i)?.[1];
  const ogImage = r.html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1];
  return `VISUAL ASSETS on ${target}\nFavicon: ${favicon || "(none found)"}\nOG image: ${ogImage || "(none found)"}\nImages (${imgs.length}):\n${imgs.join("\n") || "(none)"}`;
}


async function rescanSection(url: string, keyword: string): Promise<string> {
  const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
  if (!FIRECRAWL_API_KEY) return "Rescan unavailable (no Firecrawl key).";
  // Validate URL: only http(s), block private/loopback/link-local
  let parsedUrl: URL;
  try { parsedUrl = new URL(url); } catch { return "Rescan failed: invalid URL"; }
  if (!["http:", "https:"].includes(parsedUrl.protocol)) return "Rescan failed: only HTTP(S) URLs allowed";
  const host = parsedUrl.hostname.toLowerCase();
  if (
    host === "localhost" ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host) ||
    /^169\.254\./.test(host) ||
    host === "::1" ||
    host.endsWith(".local")
  ) return "Rescan failed: private URLs not allowed";
  try {
    const res = await fetch("https://api.firecrawl.dev/v2/scrape", {
      method: "POST",
      headers: { Authorization: `Bearer ${FIRECRAWL_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url, formats: ["markdown", "html"], onlyMainContent: false }),
    });
    const data = await res.json();
    if (!res.ok) return `Rescan failed: ${data.error || res.status}`;
    const result = data.data || data;
    const md: string = (result.markdown || "").slice(0, 30000);
    const html: string = (result.html || "").slice(0, 30000);

    // Find candidate paragraphs / headings matching the keyword
    const kw = keyword.toLowerCase().split(/\s+/)[0];
    const re = new RegExp(`[^\\n]{0,80}${kw}[^\\n]{0,300}`, "ig");
    const mdHits = (md.match(re) || []).slice(0, 6);

    const headingRe = /<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/gi;
    const headings: string[] = [];
    let m;
    while ((m = headingRe.exec(html)) !== null) {
      const t = m[1].replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      if (t && new RegExp(kw, "i").test(t)) headings.push(t);
    }

    if (mdHits.length === 0 && headings.length === 0) {
      return `RESCAN RESULT for "${keyword}": After re-fetching the homepage, I could NOT find any clear matches for "${keyword}". The original report's finding likely stands. Quote from page (first 400 chars): ${md.slice(0, 400)}`;
    }
    return `RESCAN RESULT for "${keyword}":\nMatching headings: ${headings.slice(0, 5).join(" | ") || "(none)"}\n\nMatching content snippets:\n${mdHits.map((h, i) => `${i + 1}. ${h.replace(/\s+/g, " ").trim()}`).join("\n")}`;
  } catch (e: any) {
    console.error("rescan error", e);
    return "Rescan error: request failed";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, analysis, url, scrapeMeta, detectedSections, analysisId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Auth: require a logged-in user (analysisId can be optional for live scans)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = buildSystemPrompt(analysis, url, scrapeMeta, detectedSections || []);

    // Tool-call loop (non-streaming so we can handle the rescan tool, then stream final answer)
    const conversation: ChatMessage[] = [
      { role: "user" as any, content: systemPrompt }, // prepend as system below
    ];
    // Actually convert: send system separately
    const fullMessages: any[] = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    // Loop up to 3 times to allow tool calls
    for (let iter = 0; iter < 3; iter++) {
      const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: fullMessages,
          tools,
          tool_choice: "auto",
        }),
      });

      if (!aiResp.ok) {
        if (aiResp.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit. Please try again in a moment." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        if (aiResp.status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Lovable Cloud workspace." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        const t = await aiResp.text();
        console.error("AI error", aiResp.status, t);
        return new Response(JSON.stringify({ error: "AI error" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const aiData = await aiResp.json();
      const choice = aiData.choices?.[0];
      const msg = choice?.message;

      if (msg?.tool_calls?.length) {
        // Append assistant's tool-call message
        fullMessages.push(msg);
        // Execute each tool call
        for (const call of msg.tool_calls) {
          const name = call.function?.name;
          let args: any = {};
          try { args = JSON.parse(call.function?.arguments || "{}"); } catch { /* ignore */ }
          let result = `Unknown tool: ${name}`;
          if (name === "rescan_section") result = await rescanSection(url, args.section_keyword || "");
          else if (name === "fetch_page") result = await fetchPageTool(url, args.page || "/");
          else if (name === "inspect_visuals") result = await inspectVisualsTool(url, args.page || "/");
          fullMessages.push({ role: "tool", tool_call_id: call.id, content: result });
        }

        continue; // loop again with tool results
      }

      // Final answer
      return new Response(JSON.stringify({
        content: msg?.content ?? "",
        used_tools: fullMessages.some((m) => m.role === "tool"),
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ content: "(Stopped after 3 iterations)" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("chat-with-report error:", e);
    return new Response(JSON.stringify({ error: "Request failed. Please try again." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});