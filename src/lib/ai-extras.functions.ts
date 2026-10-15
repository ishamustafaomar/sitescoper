// New AI features: competitor intel (Perplexity + Claude), instant preview (Jev), video roast (Gemini Omni).
import { createServerFn } from "@tanstack/react-start";

const GATEWAY = "https://ai.gateway.lovable.dev";

// ---------------- Competitor intel (Pro) ----------------

export interface CompetitorIntel {
  competitors: { name: string; url: string; doing_well: string; you_can_steal: string; source: string }[];
  takeaway: string;
  sources: { title: string; url: string; date?: string }[];
  generated_at: string;
}

export const competitorIntel = createServerFn({ method: "POST" })
  .inputValidator((input: { url: string; summary?: string; category?: string }) => {
    if (!input?.url || typeof input.url !== "string" || input.url.length > 500) throw new Error("A site address is required");
    return { url: input.url, summary: String(input.summary ?? "").slice(0, 1500), category: String(input.category ?? "").slice(0, 40) };
  })
  .handler(async ({ data }): Promise<{ ok: true; intel: CompetitorIntel } | { ok: false; error: string }> => {
    await (await import("@/lib/pro-access.server")).requireProUser("Competitor research is part of the Pro plan");
    const lovable = process.env.LOVABLE_API_KEY;
    const pplx = process.env.PERPLEXITY_API_KEY;
    if (!lovable || !pplx) return { ok: false, error: "Competitor research is not set up yet." };
    let host = data.url;
    try { host = new URL(/^https?:/i.test(data.url) ? data.url : `https://${data.url}`).hostname.replace(/^www\./, ""); } catch { /* keep */ }

    const res = await fetch("https://connector-gateway.lovable.dev/perplexity/search", {
      method: "POST",
      headers: { Authorization: `Bearer ${lovable}`, "X-Connection-Api-Key": pplx, "Content-Type": "application/json" },
      body: JSON.stringify({
        query: [`${host} competitors alternatives`, `sites like ${host}`, `${data.summary.slice(0, 120) || host} best tools`],
        max_results: 6,
      }),
    });
    if (!res.ok) {
      console.error("Perplexity search failed", res.status, (await res.text()).slice(0, 300));
      return { ok: false, error: res.status === 402 ? "Out of research credits right now." : "Couldn't research competitors right now. Try again later." };
    }
    const json = (await res.json()) as { results?: unknown };
    const flat: { title: string; url: string; snippet?: string; date?: string }[] = [];
    const walk = (v: unknown) => {
      if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === "object" && "url" in v) flat.push(v as never);
    };
    walk(json.results);
    const seen = new Set<string>();
    const results = flat.filter((r) => r.url && !r.url.includes(host) && !seen.has(r.url) && seen.add(r.url)).slice(0, 15);
    if (!results.length) return { ok: false, error: "We couldn't find public information about competitors for this site." };

    const { claudeText, extractJson } = await import("@/lib/claude.server");
    const system = `You analyse competitors for a website owner. Use ONLY the numbered search results given. Never invent companies, numbers or features. Every competitor must cite the exact URL of a search result as "source". If fewer than 3 real competitors appear, return fewer.
Reply with ONLY JSON: {"competitors":[{"name":"","url":"homepage url","doing_well":"one sentence, what they do well per the source","you_can_steal":"one concrete idea for the owner","source":"result url"}],"takeaway":"one sentence"}. Max 3 competitors. Write in plain English.`;
    const user = `Site being audited: ${host}\nCategory: ${data.category}\nWhat it does: ${data.summary}\n\nSearch results:\n${results
      .map((r, i) => `[${i + 1}] ${r.title}\n${r.url}${r.date ? ` (${r.date})` : ""}\n${(r.snippet ?? "").slice(0, 600)}`)
      .join("\n\n")}`;
    try {
      const parsed = extractJson(await claudeText({ system, user, maxTokens: 2000, label: "Competitor research" })) as Partial<CompetitorIntel>;
      const urls = new Set(results.map((r) => r.url));
      const competitors = (parsed.competitors ?? []).filter((c) => c && urls.has(c.source)).slice(0, 3);
      if (!competitors.length) return { ok: false, error: "We couldn't find well-sourced competitors for this site." };
      return {
        ok: true,
        intel: {
          competitors,
          takeaway: String(parsed.takeaway ?? ""),
          sources: results.filter((r) => competitors.some((c) => c.source === r.url)).map((r) => ({ title: r.title, url: r.url, date: r.date })),
          generated_at: new Date().toISOString(),
        },
      };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Competitor research failed." };
    }
  });

// ---------------- Instant preview (public, Jev) ----------------

export interface QuickPreview {
  score: number;
  flags: { key: "headline" | "cta" | "trust" | "speed_of_understanding"; ok: boolean }[];
}

export const quickPreview = createServerFn({ method: "POST" })
  .inputValidator((input: { url: string }) => {
    if (!input?.url || typeof input.url !== "string" || input.url.length > 500) throw new Error("Invalid URL");
    return { url: input.url };
  })
  .handler(async ({ data }): Promise<{ ok: true; preview: QuickPreview } | { ok: false }> => {
    const tools = await import("@/lib/seo-tools.server");
    const { getRequestHeader } = await import("@tanstack/react-start/server");
    const ip = getRequestHeader("cf-connecting-ip") ?? getRequestHeader("x-forwarded-for") ?? "anon";
    if (!tools.rateLimit(`qp:${ip}`, 10, 60 * 60_000)) return { ok: false };
    const key = process.env.LOVABLE_API_KEY;
    if (!key) return { ok: false };
    try {
      const url = tools.parsePublicUrl(data.url);
      const page = await tools.fetchText(url.toString(), 7000);
      if (!page.ok) return { ok: false };
      const head = tools.parseHead(page.text);
      const state = {
        title: head.title,
        description: tools.firstMeta(head.metas, "description", "og:description"),
        h1: tools.firstHeading(page.text),
        first_paragraph: tools.firstParagraph(page.text),
        visible_text_start: tools.bodyText(page.text).slice(0, 2500),
      };
      if (!state.title && !state.h1 && state.visible_text_start.length < 40) return { ok: false };
      const res = await fetch(`${GATEWAY}/v1/systemone`, {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "X-Lovable-AIG-SDK": "fetch" },
        body: JSON.stringify({
          model: "typesafe/jev-latest",
          state,
          questions: {
            overall: {
              type: "score",
              instructions: "How well would a first-time visitor understand what this site offers and why to act, judging only `title`, `h1`, `description` and `visible_text_start`?",
              criteria: [
                "Confusing: unclear what the site is or who it is for.",
                "Vague: the topic is guessable but the offer and audience are fuzzy.",
                "Decent: the offer is understandable but generic or missing a reason to act.",
                "Strong: specific offer, clear audience, and a clear reason to act.",
              ],
            },
            headline: { type: "noul", instructions: "Does `h1` (or `title` if h1 is empty) say specifically what the site offers, rather than a vague slogan?" },
            cta: { type: "noul", instructions: "Does `visible_text_start` contain a clear call to action such as sign up, buy, start, book or contact?" },
            trust: { type: "noul", instructions: "Does `visible_text_start` show any trust signal such as customer names, reviews, guarantees, numbers of users or press mentions?" },
            speed_of_understanding: { type: "noul", instructions: "Could a visitor understand what this is within 5 seconds from `h1` and `first_paragraph` alone?" },
          },
        }),
      });
      if (!res.ok) {
        console.error("Jev failed", res.status, (await res.text()).slice(0, 300));
        return { ok: false };
      }
      const out = (await res.json()) as { answers?: Record<string, { score?: number; noul?: number }> };
      const a = out.answers ?? {};
      if (typeof a.overall?.score !== "number") return { ok: false };
      const flags = (["headline", "cta", "trust", "speed_of_understanding"] as const).map((k) => ({ key: k, ok: (a[k]?.noul ?? 0) >= 0.5 }));
      return { ok: true, preview: { score: Math.round(15 + (a.overall.score / 3) * 80), flags } };
    } catch (e) {
      console.warn("quick preview failed", e);
      return { ok: false };
    }
  });

// ---------------- Video roast (Pro / Fix Pass) ----------------

const VIDEO_DAILY_CAP = 3;

export const startVideoRoast = createServerFn({ method: "POST" })
  .inputValidator((input: { url: string; score: number; issues: string[] }) => {
    if (!input?.url || typeof input.url !== "string") throw new Error("Invalid input");
    return {
      url: input.url.slice(0, 300),
      score: Math.max(0, Math.min(100, Math.round(Number(input.score) || 0))),
      issues: (Array.isArray(input.issues) ? input.issues : []).slice(0, 3).map((s) => String(s).replace(/["\n]/g, " ").slice(0, 70)),
    };
  })
  .handler(async ({ data }): Promise<{ ok: true; id: string } | { ok: false; error: string }> => {
    const { user, admin } = await (await import("@/lib/pro-access.server")).requireProUser("Video roasts are part of Pro and the Fix Pass");
    const since = new Date(Date.now() - 24 * 3600_000).toISOString();
    const { count } = await admin.from("video_roasts").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", since);
    if ((count ?? 0) >= VIDEO_DAILY_CAP) return { ok: false, error: `You can make ${VIDEO_DAILY_CAP} video roasts a day. Try again tomorrow.` };
    const key = process.env.LOVABLE_API_KEY;
    if (!key) return { ok: false, error: "Video roasts are not set up yet." };
    let host = data.url;
    try { host = new URL(/^https?:/i.test(data.url) ? data.url : `https://${data.url}`).hostname.replace(/^www\./, ""); } catch { /* keep */ }
    const issues = data.issues.length ? data.issues : ["Unclear headline", "Weak call to action", "Missing trust signals"];
    const prompt = `Vertical social-media video roast of a website audit, bold flat graphic style, cream paper background with black ink typography and one red accent, in a single continuous shot, no people, no dialogue.
[0-2s] Large text "Roasting ${host}" slams onto the screen.
[2-4s] A big circular gauge fills up and lands on the number "${data.score}" with the words "out of 100".
[4-7s] Three cards stamp in one at a time with the exact text: "${issues[0]}", "${issues[1] ?? ""}", "${issues[2] ?? ""}".
[7-8s] Final card: "Fix it free at sitescoper.com".
Audio: upbeat punchy electronic beat with a record-scratch at the start and a stamp sound on each card. No voiceover. Quote all on-screen text exactly; consider timing and micro-detail.`;
    const res = await fetch(`${GATEWAY}/v1/videos`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({
        model: "google/gemini-omni-1.1-flash",
        input: prompt,
        response_format: { type: "video", resolution: "720p", duration: "8s", aspect_ratio: "9:16" },
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error("Video create failed", res.status, body.slice(0, 300));
      return { ok: false, error: res.status === 402 ? "Video credits are used up right now." : "Couldn't start the video. Try again later." };
    }
    const job = (await res.json()) as { id: string };
    const { data: row, error } = await admin
      .from("video_roasts")
      .insert({ user_id: user.id, site_url: host, job_id: job.id, status: "in_progress" })
      .select("id")
      .single();
    if (error || !row) return { ok: false, error: "Couldn't save the video job." };
    return { ok: true, id: row.id };
  });

export const checkVideoRoast = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => {
    if (!input?.id || typeof input.id !== "string") throw new Error("Invalid input");
    return { id: input.id };
  })
  .handler(async ({ data }): Promise<{ status: "in_progress" | "completed" | "failed"; progress?: number; url?: string; error?: string }> => {
    const { requireSupabaseAuth, adminClient } = await import("@/lib/supabase.server");
    const { user } = await requireSupabaseAuth();
    const admin = adminClient();
    const { data: row } = await admin.from("video_roasts").select("*").eq("id", data.id).eq("user_id", user.id).maybeSingle();
    if (!row) return { status: "failed", error: "Video not found." };
    const sign = async (path: string) => (await admin.storage.from("video-roasts").createSignedUrl(path, 3600)).data?.signedUrl;
    if (row.status === "completed" && row.storage_path) return { status: "completed", url: await sign(row.storage_path) };
    if (row.status === "failed") return { status: "failed", error: row.error ?? "The video failed." };
    const key = process.env.LOVABLE_API_KEY!;
    const res = await fetch(`${GATEWAY}/v1/videos/${encodeURIComponent(row.job_id!)}`, { headers: { Authorization: `Bearer ${key}` } });
    if (!res.ok) return { status: "in_progress" };
    const job = (await res.json()) as { status: string; progress?: number; error?: { message?: string } };
    if (job.status === "failed") {
      await admin.from("video_roasts").update({ status: "failed", error: job.error?.message ?? "Failed" }).eq("id", row.id);
      return { status: "failed", error: job.error?.message ?? "The video failed." };
    }
    if (job.status !== "completed") return { status: "in_progress", progress: job.progress };
    const file = await fetch(`${GATEWAY}/v1/videos/${encodeURIComponent(row.job_id!)}/content`, { headers: { Authorization: `Bearer ${key}` } });
    if (!file.ok) return { status: "in_progress" };
    const path = `${user.id}/${row.id}.mp4`;
    const up = await admin.storage.from("video-roasts").upload(path, new Uint8Array(await file.arrayBuffer()), { contentType: "video/mp4", upsert: true });
    if (up.error) return { status: "in_progress" };
    await admin.from("video_roasts").update({ status: "completed", storage_path: path }).eq("id", row.id);
    return { status: "completed", url: await sign(path) };
  });
