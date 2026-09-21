/**
 * SEO content autopilot. Server-only.
 *
 * Twice a week it takes the highest-priority queued topic from `seo_topics`,
 * asks the AI gateway for a long-form article in our house format, runs it
 * through hard quality gates, publishes it to `blog_posts`, and pings IndexNow.
 * When the queue is empty it refreshes the stalest thin article instead.
 *
 * Everything is bounded (one article per run, one run per ~20h) and every
 * outcome is written to `seo_autopilot_runs` so the admin can see what it did.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { landingPages } from "@/content/landing-pages";
import { pingIndexNow } from "@/lib/indexnow";

const MODEL = "openai/gpt-6-astra";

/** Thrown when the gateway says the workspace may not spend: the job must pause, not retry. */
export class PauseError extends Error {
  pause = true as const;
}
const MIN_WORDS = 1000;
const MAX_WORDS = 2600;
const MIN_H2 = 4;
const MAX_ATTEMPTS = 3;

export interface TopicRow {
  id: string;
  keyword: string;
  angle: string;
  intent: string;
  priority: number;
  status: string;
  attempts: number;
}

export interface PostDraft {
  title: string;
  description: string;
  slug: string;
  category: string;
  body: string;
  faq: { q: string; a: string }[];
  reading_time: string;
  words: number;
}

interface LinkTarget {
  path: string;
  title: string;
}

const STATIC_TARGETS: LinkTarget[] = [
  { path: "/", title: "Free AI website audit (no account)" },
  { path: "/tools/open-graph-checker", title: "Open Graph & meta tag checker (free tool)" },
  { path: "/tools/llms-txt-generator", title: "llms.txt generator (free tool)" },
  { path: "/website-audit-statistics", title: "Website audit statistics" },
  { path: "/white-label-seo-reports", title: "White-label SEO reports for agencies" },
  { path: "/compare", title: "Compare two websites side by side" },
  { path: "/pricing", title: "SiteScoper pricing" },
  ...Object.values(landingPages).map((p) => ({ path: p.path, title: p.h1 })),
];

const CATEGORIES = ["guides", "seo", "ux", "performance", "ai-search", "agencies"] as const;

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
    .replace(/^-|-$/g, "");
}

export function countWords(md: string) {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#*_>|`[\]()-]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

function extractJson(text: string): unknown {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end <= start) throw new Error("Model did not return JSON");
    return JSON.parse(cleaned.slice(start, end + 1));
  }
}

const BANNED = [
  /as an ai/i,
  /language model/i,
  /in today's (fast-paced )?digital (world|landscape|age)/i,
  /in conclusion,/i,
  /unlock the (power|potential)/i,
  /delve into/i,
  /game[- ]changer/i,
  /it'?s important to note/i,
  /\bcrucial\b.*\bcrucial\b/i,
];

/** Hard quality gates. Throws with a reason when the draft is not good enough to publish. */
export function validateDraft(d: PostDraft, keyword: string, known: Set<string>, minWords = MIN_WORDS) {
  if (!d.title || d.title.length < 20 || d.title.length > 75) throw new Error(`title length ${d.title?.length ?? 0} out of range`);
  if (!d.description || d.description.length < 80 || d.description.length > 175) throw new Error(`description length ${d.description?.length ?? 0} out of range`);
  if (d.words < minWords) throw new Error(`only ${d.words} words (min ${minWords})`);
  if (d.words > MAX_WORDS) throw new Error(`${d.words} words is too long`);
  const h2 = (d.body.match(/^## /gm) ?? []).length;
  if (h2 < MIN_H2) throw new Error(`only ${h2} H2 sections`);
  if (/^# /m.test(d.body)) throw new Error("body contains an H1");
  if (!Array.isArray(d.faq) || d.faq.length < 3) throw new Error("fewer than 3 FAQ items");
  for (const f of d.faq) if (!f.q || !f.a || f.a.length < 40) throw new Error("FAQ answer too short");
  for (const re of BANNED) if (re.test(d.body)) throw new Error(`banned phrase: ${re}`);
  const kw = keyword.toLowerCase();
  const kwCount = d.body.toLowerCase().split(kw).length - 1;
  if (kwCount / Math.max(1, d.words / 100) > 3) throw new Error("keyword density too high");
  if (kwCount === 0 && !d.title.toLowerCase().includes(kw)) throw new Error("keyword does not appear in body or title");
  const internal = Array.from(d.body.matchAll(/\]\(((?:https?:\/\/(?:www\.)?sitescoper\.com)?\/[^)\s]*)\)/g)).map((m) => m[1]!.replace(/^https?:\/\/(?:www\.)?sitescoper\.com/, ""));
  if (internal.length < 2) throw new Error("fewer than 2 internal links");
  for (const p of internal) {
    const clean = p.split("#")[0]!.split("?")[0]!.replace(/\/$/, "") || "/";
    if (!known.has(clean)) throw new Error(`internal link to unknown path ${clean}`);
  }
  if (!CATEGORIES.includes(d.category as (typeof CATEGORIES)[number])) throw new Error(`unknown category ${d.category}`);
}

async function callModel(system: string, user: string): Promise<string> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY not configured");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      reasoning_effort: "medium",
      response_format: { type: "json_object" },
    }),
    signal: AbortSignal.timeout(170_000),
  });
  if (!res.ok) {
    const body = await res.text();
    // 402 (no credits) and 403 (workspace/provider block) must pause the whole job
    // until the owner acts; 429/5xx simply wait for the next scheduled run.
    if (res.status === 402 || res.status === 403) throw new PauseError(`AI gateway ${res.status}: ${body.slice(0, 200)}`);
    throw new Error(`AI gateway ${res.status}: ${body.slice(0, 200)}`);
  }
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI gateway returned no content");
  return content;
}

const SYSTEM_PROMPT = `You are the editor of the SiteScoper blog. SiteScoper is an AI website audit tool: paste a URL, get a scored report on UX, SEO, copy, conversion and speed in about 60 seconds, with ranked fixes. The first audit is free with no account. There is a $19/mo Pro plan with monitoring and competitor tracking and a $9 one-time Audit & Fix Pass.

Write for founders, marketers and indie developers who run their own site. House style:
- Direct, specific, practical. Short paragraphs. Concrete numbers and examples over adjectives.
- Every H2 answers a question the reader actually has. No throat-clearing intros, no "in conclusion".
- Never invent statistics or studies. If you cite a number, name its source (e.g. "Google's own CrUX data", "Baymard's checkout research") and only cite well-known, real sources. When unsure, describe the effect qualitatively instead.
- Use tables for comparisons and checklists where they help. Use bullet lists sparingly; prefer prose that explains why.
- Include 2 to 4 internal links, chosen from the provided list only, written as normal markdown links with the exact path given. Do not link to paths that are not in the list.
- Mention SiteScoper at most twice, naturally, where it genuinely helps (e.g. "run a free audit to see which of these apply"). This is not an ad.
- Markdown subset only: "## H2", "### H3", paragraphs, "- bullets", "1. numbered", **bold**, [links](/path), tables with | pipes |, > blockquotes. No H1, no HTML, no images.

Return ONLY a JSON object with these fields:
{
  "title": "SEO title, 40-65 characters, contains the target keyword naturally, no brand suffix",
  "description": "Meta description, 120-160 characters, specific, contains the keyword once",
  "category": one of "guides" | "seo" | "ux" | "performance" | "ai-search" | "agencies",
  "body": "The full article in markdown, 1200-2000 words, at least 5 H2 sections",
  "faq": [ { "q": "question people actually search", "a": "2-4 sentence answer" } ]  // 4 to 6 items, do not repeat the body verbatim
}`;

function linkList(targets: LinkTarget[]) {
  return targets.map((t) => `- ${t.path} — ${t.title}`).join("\n");
}

export async function knownPaths(sb: SupabaseClient, extra: LinkTarget[]): Promise<{ set: Set<string>; targets: LinkTarget[] }> {
  const { data } = await sb.from("blog_posts").select("slug,title").eq("status", "published").order("published_at", { ascending: false }).limit(60);
  const posts: LinkTarget[] = (data ?? []).map((p) => ({ path: `/blog/${p.slug}`, title: p.title }));
  const targets = [...STATIC_TARGETS, ...extra, ...posts];
  return { set: new Set(targets.map((t) => t.path.replace(/\/$/, "") || "/").concat(["/blog", "/"])), targets };
}

function toDraft(raw: unknown, fallbackSlug: string): PostDraft {
  const r = (raw ?? {}) as Record<string, unknown>;
  const body = String(r.body ?? "").trim();
  const words = countWords(body);
  const faq = Array.isArray(r.faq) ? (r.faq as { q?: unknown; a?: unknown }[]).map((f) => ({ q: String(f.q ?? "").trim(), a: String(f.a ?? "").trim() })).filter((f) => f.q && f.a) : [];
  return {
    title: String(r.title ?? "").trim(),
    description: String(r.description ?? "").trim(),
    slug: fallbackSlug,
    category: String(r.category ?? "guides").trim(),
    body,
    faq,
    reading_time: `${Math.max(1, Math.round(words / 220))} min`,
    words,
  };
}

async function uniqueSlug(sb: SupabaseClient, base: string, allowSelf?: string) {
  let slug = base || `post-${Date.now().toString(36)}`;
  for (let i = 0; i < 5; i += 1) {
    const { data } = await sb.from("blog_posts").select("slug").eq("slug", slug).maybeSingle();
    if (!data || data.slug === allowSelf) return slug;
    slug = `${base}-${i + 2}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

/** Writes and publishes one new article for a queued topic. */
export async function writeTopic(sb: SupabaseClient, topic: TopicRow): Promise<{ slug: string; words: number }> {
  const { set, targets } = await knownPaths(sb, []);
  const user = `Target keyword: "${topic.keyword}"
Search intent: ${topic.intent}
Angle / brief: ${topic.angle}

Internal links you may use (path — title):
${linkList(targets)}

Write the article now.`;

  const raw = extractJson(await callModel(SYSTEM_PROMPT, user));
  const draft = toDraft(raw, slugify(topic.keyword));
  validateDraft(draft, topic.keyword, set);
  draft.slug = await uniqueSlug(sb, slugify(draft.title) || draft.slug);

  const now = new Date().toISOString();
  const { error } = await sb.from("blog_posts").insert({
    slug: draft.slug,
    title: draft.title,
    description: draft.description,
    keyword: topic.keyword,
    body: draft.body,
    reading_time: draft.reading_time,
    published_at: now,
    updated_at: now,
    status: "published",
    category: draft.category,
    faq: draft.faq,
    source: "autopilot",
  });
  if (error) throw new Error(`insert failed: ${error.message}`);
  return { slug: draft.slug, words: draft.words };
}

/** Rewrites the thinnest stale article in place, keeping its slug. */
export async function refreshStalePost(sb: SupabaseClient): Promise<{ slug: string; words: number } | null> {
  const cutoff = new Date(Date.now() - 60 * 24 * 3600_000).toISOString();
  const { data: post } = await sb
    .from("blog_posts")
    .select("id,slug,title,description,keyword,body,category")
    .eq("status", "published")
    .lt("updated_at", cutoff)
    .order("updated_at", { ascending: true })
    .limit(20);
  const candidate = (post ?? []).map((p) => ({ ...p, words: countWords(p.body) })).sort((a, b) => a.words - b.words)[0];
  if (!candidate || candidate.words >= 1400) return null;

  const { set, targets } = await knownPaths(sb, []);
  const user = `Rewrite and substantially expand this existing article. Keep the same topic, keyword and slug intent; you may improve the title. Preserve any accurate claims, cut fluff, add the missing depth (steps, examples, tables, edge cases).

Target keyword: "${candidate.keyword}"
Current title: ${candidate.title}
Current description: ${candidate.description}

Current body (for reference):
${candidate.body.slice(0, 6000)}

Internal links you may use (path — title):
${linkList(targets.filter((t) => t.path !== `/blog/${candidate.slug}`))}

Return the improved article now.`;

  const raw = extractJson(await callModel(SYSTEM_PROMPT, user));
  const draft = toDraft(raw, candidate.slug);
  validateDraft(draft, candidate.keyword, set, Math.max(MIN_WORDS, candidate.words + 300));

  const { error } = await sb
    .from("blog_posts")
    .update({
      title: draft.title,
      description: draft.description,
      body: draft.body,
      reading_time: draft.reading_time,
      category: CATEGORIES.includes(candidate.category as (typeof CATEGORIES)[number]) ? candidate.category : draft.category,
      faq: draft.faq,
      updated_at: new Date().toISOString(),
      source: "autopilot-refresh",
    })
    .eq("id", candidate.id);
  if (error) throw new Error(`update failed: ${error.message}`);
  return { slug: candidate.slug, words: draft.words };
}

export async function logRun(sb: SupabaseClient, row: { action: string; keyword?: string | null; post_slug?: string | null; words?: number | null; ok: boolean; detail?: string | null }) {
  await sb.from("seo_autopilot_runs").insert(row);
}

export async function notifyIndexers(slug: string) {
  return pingIndexNow([`/blog/${slug}`, "/blog", "/sitemap.xml"]);
}
