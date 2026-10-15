// Streamed Claude call through the Lovable AI Gateway (native /v1/messages).
// Returns the accumulated text. Throws user-safe messages on failure.
export const CLAUDE_MODEL = "anthropic/claude-sonnet-5";

export async function claudeText(opts: {
  system: string;
  user: string;
  maxTokens?: number;
  label?: string;
}): Promise<string> {
  const label = opts.label ?? "The AI writer";
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error(`${label} is not configured yet.`);
  const res = await fetch("https://ai.gateway.lovable.dev/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: opts.maxTokens ?? 4000,
      stream: true,
      system: opts.system,
      messages: [{ role: "user", content: opts.user }],
    }),
  });
  if (!res.ok || !res.body) {
    const body = await res.text().catch(() => "");
    console.error("Claude error", res.status, body.slice(0, 500));
    if (res.status === 429) throw new Error(`${label} is busy right now. Try again in a minute.`);
    if (res.status === 402 || res.status === 403) throw new Error(`${label} is temporarily unavailable.`);
    throw new Error(`${label} could not finish. Please try again.`);
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  let out = "";
  let refused = false;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload) continue;
      try {
        const ev = JSON.parse(payload) as {
          type?: string;
          delta?: { type?: string; text?: string; stop_reason?: string };
          error?: { message?: string };
        };
        if (ev.type === "content_block_delta" && ev.delta?.type === "text_delta" && ev.delta.text) out += ev.delta.text;
        if (ev.type === "message_delta" && ev.delta?.stop_reason === "refusal") refused = true;
        if (ev.type === "error") throw new Error(`${label} could not finish. Please try again.`);
      } catch (e) {
        if (e instanceof Error && e.message.startsWith(label)) throw e;
      }
    }
  }
  if (refused) throw new Error(`${label} could not write for this page.`);
  if (!out.trim()) throw new Error(`${label} returned nothing. Please try again.`);
  return out;
}

/** Pulls the first JSON object out of a model reply (handles ```json fences). */
export function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1]! : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  return JSON.parse(start >= 0 && end > start ? raw.slice(start, end + 1) : raw);
}
