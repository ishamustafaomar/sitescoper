/**
 * Server-only page fingerprinting used by the monitoring / competitor-radar
 * background job. It fetches a page once, extracts a small set of stable
 * signals, and diffs them against the previous snapshot.
 *
 * Deliberately regex based: the worker runtime has no DOM and a full headless
 * browser would make weekly checks far too expensive.
 */

export interface SiteSignals {
  title: string;
  description: string;
  h1: string;
  h2s: string[];
  ogTitle: string;
  ogImage: string;
  canonical: string;
  robots: string;
  ctas: string[];
  prices: string[];
  wordCount: number;
  linkCount: number;
  imageCount: number;
  imagesMissingAlt: number;
  hasStructuredData: boolean;
}

export interface SiteSnapshot {
  ok: boolean;
  statusCode: number;
  responseMs: number;
  contentHash: string;
  signals: SiteSignals;
  error?: string;
}

export interface SnapshotChange {
  field: string;
  label: string;
  before: string;
  after: string;
  severity: "info" | "warning" | "critical";
}

const EMPTY_SIGNALS: SiteSignals = {
  title: "",
  description: "",
  h1: "",
  h2s: [],
  ogTitle: "",
  ogImage: "",
  canonical: "",
  robots: "",
  ctas: [],
  prices: [],
  wordCount: 0,
  linkCount: 0,
  imageCount: 0,
  imagesMissingAlt: 0,
  hasStructuredData: false,
};

function decodeEntities(input: string): string {
  return input
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'");
}

function clean(input: string | undefined): string {
  if (!input) return "";
  return decodeEntities(input.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 300);
}

function meta(html: string, attr: "name" | "property", key: string): string {
  const re = new RegExp(
    `<meta[^>]+${attr}=["']${key}["'][^>]*content=["']([^"']*)["']`,
    "i",
  );
  const alt = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]*${attr}=["']${key}["']`,
    "i",
  );
  return clean(html.match(re)?.[1] ?? html.match(alt)?.[1] ?? "");
}

function allMatches(html: string, re: RegExp, limit: number): string[] {
  const out: string[] = [];
  for (const m of html.matchAll(re)) {
    const v = clean(m[1]);
    if (v && v.length > 1 && !out.includes(v)) out.push(v);
    if (out.length >= limit) break;
  }
  return out;
}

async function sha256(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}

export function extractSignals(html: string): SiteSignals {
  const body = html.replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, " ");
  const text = decodeEntities(body.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();

  const imgTags = body.match(/<img\b[^>]*>/gi) ?? [];

  return {
    title: clean(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]),
    description: meta(html, "name", "description"),
    h1: clean(body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]),
    h2s: allMatches(body, /<h2[^>]*>([\s\S]*?)<\/h2>/gi, 10),
    ogTitle: meta(html, "property", "og:title"),
    ogImage: meta(html, "property", "og:image"),
    canonical: clean(html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']*)["']/i)?.[1]),
    robots: meta(html, "name", "robots"),
    ctas: allMatches(
      body,
      /<(?:button|a)\b[^>]*>([\s\S]{2,60}?)<\/(?:button|a)>/gi,
      18,
    ),
    prices: Array.from(
      new Set(
        (text.match(/(?:[$€£]\s?\d[\d,.]*(?:\s?\/\s?(?:mo|month|yr|year|week))?)/gi) ?? [])
          .map((p) => p.replace(/\s+/g, "").toLowerCase()),
      ),
    ).slice(0, 12),
    wordCount: text ? text.split(" ").length : 0,
    linkCount: (body.match(/<a\b[^>]*href=/gi) ?? []).length,
    imageCount: imgTags.length,
    imagesMissingAlt: imgTags.filter((t) => !/\balt\s*=\s*["'][^"']+["']/i.test(t)).length,
    hasStructuredData: /application\/ld\+json/i.test(html),
  };
}

export async function takeSnapshot(url: string): Promise<SiteSnapshot> {
  const startedAt = Date.now();
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: {
        "User-Agent": "SiteScoperMonitor/1.0 (+https://sitescoper.com)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    const responseMs = Date.now() - startedAt;
    const html = (await res.text()).slice(0, 600_000);
    const signals = res.ok ? extractSignals(html) : EMPTY_SIGNALS;
    return {
      ok: res.ok,
      statusCode: res.status,
      responseMs,
      contentHash: await sha256(JSON.stringify(signals)),
      signals,
      error: res.ok ? undefined : `HTTP ${res.status}`,
    };
  } catch (err) {
    return {
      ok: false,
      statusCode: 0,
      responseMs: Date.now() - startedAt,
      contentHash: "unreachable",
      signals: EMPTY_SIGNALS,
      error: err instanceof Error ? err.message : "Unreachable",
    };
  }
}

function listDiff(before: string[], after: string[]): { added: string[]; removed: string[] } {
  return {
    added: after.filter((x) => !before.includes(x)),
    removed: before.filter((x) => !after.includes(x)),
  };
}

export function diffSnapshots(
  previous: { statusCode: number | null; signals: SiteSignals },
  current: SiteSnapshot,
): SnapshotChange[] {
  const changes: SnapshotChange[] = [];
  const a = previous.signals ?? EMPTY_SIGNALS;
  const b = current.signals;

  if (!current.ok) {
    changes.push({
      field: "availability",
      label: "The page could not be loaded",
      before: previous.statusCode ? `HTTP ${previous.statusCode}` : "reachable",
      after: current.error ?? `HTTP ${current.statusCode}`,
      severity: "critical",
    });
    return changes;
  }

  const simple: { key: keyof SiteSignals; label: string; severity: SnapshotChange["severity"] }[] = [
    { key: "title", label: "Page title", severity: "warning" },
    { key: "description", label: "Search description", severity: "warning" },
    { key: "h1", label: "Main headline", severity: "warning" },
    { key: "ogTitle", label: "Social share title", severity: "info" },
    { key: "ogImage", label: "Social share image", severity: "info" },
    { key: "canonical", label: "Canonical link", severity: "info" },
    { key: "robots", label: "Search engine instructions", severity: "critical" },
  ];

  for (const f of simple) {
    const before = String(a[f.key] ?? "");
    const after = String(b[f.key] ?? "");
    if (before === after) continue;
    const disappeared = before && !after;
    changes.push({
      field: f.key,
      label: disappeared ? `${f.label} was removed` : `${f.label} changed`,
      before: before || "(none)",
      after: after || "(none)",
      severity: disappeared && f.severity !== "info" ? "critical" : f.severity,
    });
  }

  const priceDiff = listDiff(a.prices ?? [], b.prices);
  if (priceDiff.added.length || priceDiff.removed.length) {
    changes.push({
      field: "prices",
      label: "Prices on the page changed",
      before: (a.prices ?? []).join(", ") || "(none)",
      after: b.prices.join(", ") || "(none)",
      severity: "warning",
    });
  }

  const headingDiff = listDiff(a.h2s ?? [], b.h2s);
  if (headingDiff.added.length || headingDiff.removed.length) {
    changes.push({
      field: "h2s",
      label: "Section headings changed",
      before: headingDiff.removed.join(" | ") || "(nothing removed)",
      after: headingDiff.added.join(" | ") || "(nothing added)",
      severity: "info",
    });
  }

  const ctaDiff = listDiff(a.ctas ?? [], b.ctas);
  if (ctaDiff.added.length || ctaDiff.removed.length) {
    changes.push({
      field: "ctas",
      label: "Buttons and links changed",
      before: ctaDiff.removed.slice(0, 6).join(" | ") || "(nothing removed)",
      after: ctaDiff.added.slice(0, 6).join(" | ") || "(nothing added)",
      severity: "info",
    });
  }

  const prevWords = a.wordCount ?? 0;
  if (prevWords > 50 && Math.abs(b.wordCount - prevWords) / prevWords > 0.25) {
    changes.push({
      field: "wordCount",
      label: b.wordCount > prevWords ? "A lot of content was added" : "A lot of content was removed",
      before: `${prevWords} words`,
      after: `${b.wordCount} words`,
      severity: "info",
    });
  }

  if (b.imagesMissingAlt > (a.imagesMissingAlt ?? 0)) {
    changes.push({
      field: "imagesMissingAlt",
      label: "More images are missing alt text",
      before: String(a.imagesMissingAlt ?? 0),
      after: String(b.imagesMissingAlt),
      severity: "warning",
    });
  }

  if ((a.hasStructuredData ?? false) && !b.hasStructuredData) {
    changes.push({
      field: "structuredData",
      label: "Rich-result data was removed",
      before: "present",
      after: "missing",
      severity: "critical",
    });
  }

  return changes;
}

export function worstSeverity(changes: SnapshotChange[]): "info" | "warning" | "critical" {
  if (changes.some((c) => c.severity === "critical")) return "critical";
  if (changes.some((c) => c.severity === "warning")) return "warning";
  return "info";
}
