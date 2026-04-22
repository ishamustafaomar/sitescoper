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

# RULES
- Be concise (2-5 short paragraphs max unless asked for detail). Use markdown. Real opinions, not generic platitudes.
- If the user says you got something wrong (e.g. "we DO have testimonials"), believe them and call the rescan_section tool to re-fetch the homepage and look again. Don't be defensive — just verify.
- If asked "what should I do first?", point to highest-impact / lowest-effort items already in the report.
- If the user asks for a copy rewrite or new headline, give 2-3 concrete options.
- Never invent data not in the report unless you're explicitly speculating ("My guess: ...").
- If you used the rescan_section tool, summarize what you actually saw in the new content vs. the original report.`;
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
];

async function rescanSection(url: string, keyword: string): Promise<string> {
  const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
  if (!FIRECRAWL_API_KEY) return "Rescan unavailable (no Firecrawl key).";
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
    return `Rescan error: ${e.message}`;
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
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
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
          if (call.function?.name === "rescan_section") {
            let args: any = {};
            try { args = JSON.parse(call.function.arguments || "{}"); } catch { /* ignore */ }
            const result = await rescanSection(url, args.section_keyword || "");
            fullMessages.push({
              role: "tool",
              tool_call_id: call.id,
              content: result,
            });
          }
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
    return new Response(JSON.stringify({ error: e?.message ?? "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});