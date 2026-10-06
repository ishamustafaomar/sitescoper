// AI website copywriter: reads a page and rewrites its key copy.
// One free try without an account (per network, per day); signed-in users get more.
import { createServerFn } from "@tanstack/react-start";

export interface CopyResult {
  url: string;
  current: { title: string; description: string; h1: string; ctas: string[] };
  audience: string;
  headlines: { text: string; why: string }[];
  subheadline: string;
  ctas: string[];
  valueProps: string[];
  metaTitle: string;
  metaDescription: string;
  notes: string;
}

export type CopyResponse = { ok: true; result: CopyResult } | { ok: false; error: string; needsAccount?: boolean };

const MODEL = "openai/gpt-6-astra";

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["audience", "headlines", "subheadline", "ctas", "valueProps", "metaTitle", "metaDescription", "notes"],
  properties: {
    audience: { type: "string" },
    headlines: {
      type: "array",
      items: { type: "object", additionalProperties: false, required: ["text", "why"], properties: { text: { type: "string" }, why: { type: "string" } } },
    },
    subheadline: { type: "string" },
    ctas: { type: "array", items: { type: "string" } },
    valueProps: { type: "array", items: { type: "string" } },
    metaTitle: { type: "string" },
    metaDescription: { type: "string" },
    notes: { type: "string" },
  },
} as const;

async function streamJson(system: string, user: string): Promise<string> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("The copywriter is not configured yet.");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": key, Authorization: `Bearer ${key}`, "X-Lovable-AIG-SDK": "fetch" },
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      store: false,
      reasoning: { effort: "low" },
      instructions: system,
      input: [{ role: "user", content: user }],
      text: { format: { type: "json_schema", name: "copy", strict: true, schema: SCHEMA } },
    }),
  });
  if (!res.ok || !res.body) {
    if (res.status === 429) throw new Error("The copywriter is busy right now. Try again in a minute.");
    if (res.status === 402 || res.status === 403) throw new Error("The copywriter is temporarily unavailable.");
    throw new Error("The copywriter could not finish. Please try again.");
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  let out = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const ev = JSON.parse(payload) as { type?: string; delta?: string };
        if (ev.type === "response.output_text.delta" && ev.delta) out += ev.delta;
        if (ev.type === "response.refusal.delta" || ev.type === "response.failed") throw new Error("The copywriter could not write copy for this page.");
      } catch (e) {
        if (e instanceof Error && e.message.startsWith("The copywriter")) throw e;
      }
    }
  }
  if (!out) throw new Error("The copywriter returned nothing. Please try again.");
  return out;
}

const SYSTEM = `You are a senior conversion copywriter. You rewrite a website's key copy so a first-time visitor instantly understands what it is, who it's for and why to act.
Rules: be specific to THIS business using facts from the page; no hype words (revolutionary, unlock, supercharge, game-changer, seamless); no invented numbers, customers or awards; plain words; write in the same language as the page.
Return: audience (one sentence on who the page is for), 3 headline options (max 10 words each) each with a one-line "why", one subheadline (max 25 words), 3 CTA button labels (2-4 words), 3 short value props, a metaTitle (50-60 chars) and metaDescription (140-158 chars), and notes (one or two sentences on the biggest copy problem you fixed).`;

export const writeCopy = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const d = (input ?? {}) as { url?: unknown; goal?: unknown };
    if (typeof d.url !== "string" || d.url.length > 2048) throw new Error("A URL is required");
    return { url: d.url, goal: typeof d.goal === "string" ? d.goal.slice(0, 300) : "" };
  })
  .handler(async ({ data }): Promise<CopyResponse> => {
    const tools = await import("@/lib/seo-tools.server");
    const { getRequestHeader } = await import("@tanstack/react-start/server");
    const { adminClient, requireSupabaseAuth } = await import("@/lib/supabase.server");
    const ip = getRequestHeader("cf-connecting-ip") ?? getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
    if (!tools.rateLimit(`copy:${ip}`, 10, 10 * 60_000)) return { ok: false, error: "Too many requests from this network. Try again in a few minutes." };

    let userId: string | null = null;
    try {
      userId = (await requireSupabaseAuth()).user.id;
    } catch {
      userId = null;
    }

    const admin = adminClient();
    const since = new Date(Date.now() - 24 * 3600_000).toISOString();
    const ipHash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`copy:${ip}`))))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const session = userId ? `copy-user:${userId}` : `copy-anon:${ipHash}`;
    const { count } = await admin
      .from("anon_scan_usage")
      .select("id", { count: "exact", head: true })
      .eq("session_id", session)
      .gt("created_at", since);
    const limit = userId ? 25 : 1;
    if ((count ?? 0) >= limit) {
      return userId
        ? { ok: false, error: "You've hit today's copywriter limit. It resets in 24 hours." }
        : { ok: false, error: "You've used your free try. Create a free account to keep writing copy.", needsAccount: true };
    }

    let target: URL;
    try {
      target = tools.parsePublicUrl(data.url);
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "That doesn't look like a website address." };
    }
    // Read the page directly; if the site blocks simple fetches, use the same
    // browser-grade reader the full audit uses.
    let html = "";
    try {
      const page = await tools.fetchText(target.toString(), 10_000);
      if (page.ok) html = page.text;
    } catch {
      html = "";
    }
    if (!html && process.env.FIRECRAWL_API_KEY) {
      try {
        const fc = await fetch("https://api.firecrawl.dev/v2/scrape", {
          method: "POST",
          headers: { Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ url: target.toString(), formats: ["html"], onlyMainContent: false, waitFor: 1500 }),
        });
        const j = (await fc.json().catch(() => null)) as { data?: { html?: string } } | null;
        html = j?.data?.html ?? "";
      } catch {
        html = "";
      }
    }
    if (!html) return { ok: false, error: "We couldn't load that page. Check the address and try again." };
    const page = { text: html };

    const head = tools.parseHead(page.text);
    const current = {
      title: head.title ?? "",
      description: tools.firstMeta(head.metas, "description", "og:description"),
      h1: tools.firstHeading(page.text),
      ctas: Array.from(page.text.matchAll(/<(?:button|a)\b[^>]*>([\s\S]{1,80}?)<\/(?:button|a)>/gi))
        .map((m) => tools.decodeEntities(m[1]!.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim())
        .filter((t) => t.length >= 3 && t.length <= 30 && !/skip to|privacy|terms|cookie|community|blog|careers|about|log ?in|sign ?in|menu/i.test(t))
        .slice(0, 40)
        .filter((t, i, a) => a.indexOf(t) === i)
        .slice(0, 8),
    };
    const text = tools.bodyText(page.text).slice(0, 6000);

    const user = `Page URL: ${target.toString()}
Current title: ${current.title}
Current meta description: ${current.description}
Current H1: ${current.h1}
Current buttons/links: ${current.ctas.join(" | ")}
${data.goal ? `What the owner wants visitors to do: ${data.goal}\n` : ""}
Visible page text:
${text}

Rewrite the copy now as JSON.`;

    let parsed: Omit<CopyResult, "url" | "current">;
    try {
      parsed = JSON.parse(await streamJson(SYSTEM, user));
    } catch (e) {
      return { ok: false, error: e instanceof Error && e.message.startsWith("The copywriter") ? e.message : "The copywriter could not finish. Please try again." };
    }

    await admin.from("anon_scan_usage").insert({ session_id: session, ip_hash: ipHash, url: `copy:${target.hostname}` });

    return {
      ok: true,
      result: {
        url: target.toString(),
        current,
        audience: parsed.audience,
        headlines: (parsed.headlines ?? []).slice(0, 3),
        subheadline: parsed.subheadline,
        ctas: (parsed.ctas ?? []).slice(0, 3),
        valueProps: (parsed.valueProps ?? []).slice(0, 3),
        metaTitle: parsed.metaTitle,
        metaDescription: parsed.metaDescription,
        notes: parsed.notes,
      },
    };
  });
