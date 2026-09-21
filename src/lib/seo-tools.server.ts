/**
 * Server-only helpers for the free SEO tools (Open Graph checker, llms.txt
 * generator). Pure fetch + regex parsing: no native modules, safe on Workers.
 */

const UA = "SiteScoperTools/1.0 (+https://sitescoper.com/tools)";
const MAX_HTML = 400_000;

export class ToolError extends Error {
  constructor(message: string, public readonly code: string = "invalid") {
    super(message);
  }
}

// ---------- URL safety -------------------------------------------------------

function isPrivateIpv4(host: string): boolean {
  const m = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return false;
  const [a, b] = [Number(m[1]), Number(m[2])];
  return (
    a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a >= 224
  );
}

/** Normalises user input into an absolute http(s) URL and rejects internal targets. */
export function parsePublicUrl(input: string): URL {
  let raw = (input ?? "").trim();
  if (!raw) throw new ToolError("Enter a website address.");
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new ToolError("That does not look like a valid URL.");
  }
  if (!/^https?:$/.test(url.protocol)) throw new ToolError("Only http and https URLs are supported.");
  const host = url.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host.endsWith(".arpa") ||
    host.startsWith("[") ||
    host.includes(":") ||
    isPrivateIpv4(host) ||
    !host.includes(".")
  ) {
    throw new ToolError("That address is not publicly reachable.", "unreachable");
  }
  url.hash = "";
  return url;
}

// ---------- fetching ---------------------------------------------------------

export async function fetchText(url: string, timeoutMs = 8000, maxBytes = MAX_HTML, accept = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8") {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: ctrl.signal,
      headers: { "User-Agent": UA, Accept: accept, "Accept-Language": "en" },
    });
    const reader = res.body?.getReader();
    let received = 0;
    const chunks: Uint8Array[] = [];
    if (reader) {
      while (received < maxBytes) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.byteLength;
      }
      try {
        await reader.cancel();
      } catch {
        /* ignore */
      }
    }
    const merged = new Uint8Array(received);
    let offset = 0;
    for (const c of chunks) {
      merged.set(c.subarray(0, Math.min(c.byteLength, received - offset)), offset);
      offset += c.byteLength;
      if (offset >= received) break;
    }
    const text = new TextDecoder("utf-8", { fatal: false }).decode(merged);
    return { ok: res.ok, status: res.status, finalUrl: res.url || url, contentType: res.headers.get("content-type") ?? "", text };
  } finally {
    clearTimeout(timer);
  }
}

// ---------- HTML parsing -----------------------------------------------------

export function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}

const clean = (s?: string | null) => (s ? decodeEntities(s).replace(/\s+/g, " ").trim() : "");

function attr(tag: string, name: string): string {
  const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return clean(m?.[2] ?? m?.[3] ?? m?.[4] ?? "");
}

export interface MetaTag {
  key: string; // e.g. "og:title" or "description"
  value: string;
  kind: "name" | "property" | "http-equiv" | "itemprop";
}

export function parseHead(html: string) {
  const headEnd = html.search(/<body\b/i);
  const head = headEnd > 0 ? html.slice(0, headEnd) : html.slice(0, 200_000);
  const metas: MetaTag[] = [];
  for (const tag of head.match(/<meta\b[^>]*>/gi) ?? []) {
    const content = attr(tag, "content");
    const property = attr(tag, "property");
    const name = attr(tag, "name");
    const itemprop = attr(tag, "itemprop");
    const httpEquiv = attr(tag, "http-equiv");
    if (property) metas.push({ key: property.toLowerCase(), value: content, kind: "property" });
    else if (name) metas.push({ key: name.toLowerCase(), value: content, kind: "name" });
    else if (itemprop) metas.push({ key: itemprop.toLowerCase(), value: content, kind: "itemprop" });
    else if (httpEquiv) metas.push({ key: httpEquiv.toLowerCase(), value: content, kind: "http-equiv" });
  }
  const links: Array<{ rel: string; href: string; sizes?: string }> = [];
  for (const tag of head.match(/<link\b[^>]*>/gi) ?? []) {
    const rel = attr(tag, "rel").toLowerCase();
    const href = attr(tag, "href");
    if (rel && href) links.push({ rel, href, sizes: attr(tag, "sizes") || undefined });
  }
  const title = clean(head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]);
  const lang = attr(html.match(/<html\b[^>]*>/i)?.[0] ?? "", "lang");
  const jsonLdTypes: string[] = [];
  for (const m of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed = JSON.parse(m[1]!.trim());
      const nodes = Array.isArray(parsed) ? parsed : parsed?.["@graph"] ? parsed["@graph"] : [parsed];
      for (const n of nodes) if (n && typeof n === "object" && n["@type"]) jsonLdTypes.push(String(n["@type"]));
    } catch {
      jsonLdTypes.push("(invalid JSON-LD)");
    }
  }
  return { title, lang, metas, links, jsonLdTypes };
}

export function firstMeta(metas: MetaTag[], ...keys: string[]): string {
  for (const k of keys) {
    const hit = metas.find((m) => m.key === k && m.value);
    if (hit) return hit.value;
  }
  return "";
}

export function bodyText(html: string): string {
  const body = html.replace(/<(script|style|noscript|svg|template)[\s\S]*?<\/\1>/gi, " ");
  return decodeEntities(body.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

export function firstHeading(html: string): string {
  return clean(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]*>/g, " "));
}

export function firstParagraph(html: string, minLen = 60): string {
  for (const m of html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)) {
    const t = clean(m[1]!.replace(/<[^>]*>/g, " "));
    if (t.length >= minLen) return t;
  }
  return "";
}

export function resolveUrl(href: string, base: string): string {
  try {
    return new URL(href, base).toString();
  } catch {
    return "";
  }
}

// ---------- image probing ----------------------------------------------------

export interface ImageProbe {
  ok: boolean;
  status?: number;
  contentType?: string;
  bytes?: number;
  width?: number;
  height?: number;
  error?: string;
}

function readUInt16BE(b: Uint8Array, o: number) {
  return (b[o]! << 8) | b[o + 1]!;
}
function readUInt32BE(b: Uint8Array, o: number) {
  return ((b[o]! << 24) >>> 0) + (b[o + 1]! << 16) + (b[o + 2]! << 8) + b[o + 3]!;
}
function readUInt16LE(b: Uint8Array, o: number) {
  return b[o]! | (b[o + 1]! << 8);
}
function readUInt24LE(b: Uint8Array, o: number) {
  return b[o]! | (b[o + 1]! << 8) | (b[o + 2]! << 16);
}

export function imageDimensions(b: Uint8Array): { width: number; height: number } | null {
  if (b.length < 24) return null;
  // PNG
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) {
    return { width: readUInt32BE(b, 16), height: readUInt32BE(b, 20) };
  }
  // GIF
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) {
    return { width: readUInt16LE(b, 6), height: readUInt16LE(b, 8) };
  }
  // WebP
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) {
    const chunk = String.fromCharCode(b[12]!, b[13]!, b[14]!, b[15]!);
    if (chunk === "VP8X" && b.length >= 30) return { width: readUInt24LE(b, 24) + 1, height: readUInt24LE(b, 27) + 1 };
    if (chunk === "VP8 " && b.length >= 30) return { width: readUInt16LE(b, 26) & 0x3fff, height: readUInt16LE(b, 28) & 0x3fff };
    if (chunk === "VP8L" && b.length >= 25) {
      const bits = b[21]! | (b[22]! << 8) | (b[23]! << 16) | (b[24]! << 24);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
    return null;
  }
  // JPEG
  if (b[0] === 0xff && b[1] === 0xd8) {
    let o = 2;
    while (o + 9 < b.length) {
      if (b[o] !== 0xff) {
        o++;
        continue;
      }
      const marker = b[o + 1]!;
      if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
        o += 2;
        continue;
      }
      const len = readUInt16BE(b, o + 2);
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { height: readUInt16BE(b, o + 5), width: readUInt16BE(b, o + 7) };
      }
      o += 2 + len;
    }
  }
  // AVIF / other: unknown without a full parser.
  return null;
}

export async function probeImage(url: string, timeoutMs = 6000): Promise<ImageProbe> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: ctrl.signal,
      headers: { "User-Agent": UA, Accept: "image/*", Range: "bytes=0-131071" },
    });
    const contentType = res.headers.get("content-type") ?? "";
    const rangeTotal = res.headers.get("content-range")?.match(/\/(\d+)$/)?.[1];
    const len = rangeTotal ? Number(rangeTotal) : Number(res.headers.get("content-length") ?? 0) || undefined;
    if (!res.ok) return { ok: false, status: res.status, contentType, error: `HTTP ${res.status}` };
    const reader = res.body?.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;
    if (reader) {
      while (received < 131_072) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.byteLength;
      }
      try {
        await reader.cancel();
      } catch {
        /* ignore */
      }
    }
    const buf = new Uint8Array(received);
    let o = 0;
    for (const c of chunks) {
      buf.set(c, o);
      o += c.byteLength;
    }
    const dims = imageDimensions(buf);
    // When the server ignored the Range header and the whole file fit, size is what we received.
    const bytes = len ?? (res.status === 200 && received < 131_072 ? received : undefined);
    return { ok: true, status: res.status, contentType, bytes, width: dims?.width, height: dims?.height };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not fetch image" };
  } finally {
    clearTimeout(timer);
  }
}

// ---------- rate limiting (per isolate; a soft guard for free tools) ---------

const buckets = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (!v.some((t) => now - t < windowMs)) buckets.delete(k);
  }
  return true;
}

// ---------- sitemap discovery ------------------------------------------------

export async function discoverSitemapUrls(origin: URL, cap = 300): Promise<{ urls: string[]; sitemap?: string }> {
  const candidates: string[] = [];
  try {
    const robots = await fetchText(`${origin.origin}/robots.txt`, 5000, 50_000, "text/plain,*/*");
    if (robots.ok) {
      for (const line of robots.text.split("\n")) {
        const m = line.match(/^\s*sitemap:\s*(\S+)/i);
        if (m) candidates.push(m[1]!);
      }
    }
  } catch {
    /* no robots */
  }
  candidates.push(`${origin.origin}/sitemap.xml`, `${origin.origin}/sitemap_index.xml`, `${origin.origin}/sitemap-index.xml`);
  const seen = new Set<string>();
  const out: string[] = [];
  let used: string | undefined;
  for (const cand of candidates) {
    if (seen.has(cand)) continue;
    seen.add(cand);
    try {
      const res = await fetchText(cand, 6000, 1_500_000, "application/xml,text/xml,*/*");
      if (!res.ok || !/<(urlset|sitemapindex)\b/i.test(res.text)) continue;
      used = cand;
      const locs = Array.from(res.text.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)).map((m) => decodeEntities(m[1]!));
      if (/<sitemapindex\b/i.test(res.text)) {
        for (const child of locs.slice(0, 4)) {
          try {
            const c = await fetchText(child, 6000, 1_500_000, "application/xml,text/xml,*/*");
            if (!c.ok) continue;
            for (const m of c.text.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)) {
              out.push(decodeEntities(m[1]!));
              if (out.length >= cap) break;
            }
          } catch {
            /* skip child */
          }
          if (out.length >= cap) break;
        }
      } else {
        out.push(...locs.slice(0, cap));
      }
      if (out.length) break;
    } catch {
      /* try next */
    }
  }
  const host = origin.hostname.replace(/^www\./, "");
  const urls = Array.from(
    new Set(
      out
        .map((u) => u.trim())
        .filter((u) => {
          try {
            const p = new URL(u);
            return p.hostname.replace(/^www\./, "") === host && !/\.(png|jpe?g|gif|webp|svg|pdf|zip|mp4|xml|css|js)$/i.test(p.pathname);
          } catch {
            return false;
          }
        }),
    ),
  );
  return { urls, sitemap: used };
}

export function internalLinks(html: string, base: URL, cap = 60): string[] {
  const host = base.hostname.replace(/^www\./, "");
  const out = new Set<string>();
  for (const m of html.matchAll(/<a\b[^>]*href=("([^"]*)"|'([^']*)')/gi)) {
    const href = decodeEntities(m[2] ?? m[3] ?? "");
    if (!href || href.startsWith("#") || /^(mailto|tel|javascript):/i.test(href)) continue;
    const abs = resolveUrl(href, base.toString());
    if (!abs) continue;
    try {
      const u = new URL(abs);
      if (u.hostname.replace(/^www\./, "") !== host) continue;
      if (/\.(png|jpe?g|gif|webp|svg|pdf|zip|mp4|xml|css|js)$/i.test(u.pathname)) continue;
      u.hash = "";
      u.search = "";
      out.add(u.toString());
      if (out.size >= cap) break;
    } catch {
      /* skip */
    }
  }
  return Array.from(out);
}
