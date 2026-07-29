// Migrated from supabase/functions/rewrite-headlines (Deno edge function).
import { createServerFn } from "@tanstack/react-start";

type Input = { markdown: string; url?: string; summary?: string; site_category?: string };

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

const SYSTEM_PROMPT = `You are a senior conversion copywriter (think Harry Dry meets a YC partner). Given a website's content and current positioning, generate stronger headline alternatives.

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
- If the site is a game/portfolio/blog, adapt the framing accordingly.`;

export const rewriteHeadlines = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const data = (input ?? {}) as Partial<Input>;
    if (!data.markdown || typeof data.markdown !== "string") throw new Error("Markdown required");
    return data as Input;
  })
  .handler(async ({ data }) => {
    const { requireSupabaseAuth } = await import("@/lib/supabase.server");
    await requireSupabaseAuth();

    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        temperature: 0.7,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Site: ${data.url}\nCategory: ${data.site_category || "unknown"}\nWhat we know: ${data.summary || ""}\n\nPage content (truncated):\n${data.markdown.slice(0, 12000)}`,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) throw new Error("Rate limited. Try again shortly.");
      if (response.status === 402) throw new Error("AI credits exhausted. Add funds in Settings > Workspace > Usage.");
      console.error("AI error", response.status, await response.text());
      throw new Error("AI rewrite failed");
    }
    const aiData = (await response.json()) as { choices?: { message?: { content?: string } }[] };
    const content = aiData.choices?.[0]?.message?.content ?? "";
    let result: JsonValue;
    try {
      result = JSON.parse(content) as JsonValue;
    } catch {
      result = { rewrites: [], current_headline: "", diagnosis: content };
    }
    return { success: true as const, result };
  });