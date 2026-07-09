import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FIRECRAWL_V2 = "https://api.firecrawl.dev/v2";

// Lightweight tech-SEO checks computed from raw HTML — runs fast, before AI.
// These are deterministic and don't need an LLM call.
function runTechSeoChecks(html: string, url: string): {
  score: number;
  checks: { name: string; passed: boolean; detail: string }[];
} {
  const checks: { name: string; passed: boolean; detail: string }[] = [];
  const lower = (html || "").toLowerCase();
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch?.[1]?.trim() || "";
  checks.push({
    name: "Title tag",
    passed: title.length >= 10 && title.length <= 70,
    detail: title ? `${title.length} chars` : "missing",
  });
  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i);
  const desc = descMatch?.[1]?.trim() || "";
  checks.push({
    name: "Meta description",
    passed: desc.length >= 50 && desc.length <= 170,
    detail: desc ? `${desc.length} chars` : "missing",
  });
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  checks.push({
    name: "Single H1",
    passed: h1Count === 1,
    detail: `${h1Count} H1 tags`,
  });
  const hasViewport = /<meta[^>]+name=["']viewport["']/i.test(html);
  checks.push({ name: "Viewport meta", passed: hasViewport, detail: hasViewport ? "present" : "missing" });
  const hasLang = /<html[^>]+\blang=["'][^"']+["']/i.test(html);
  checks.push({ name: "HTML lang attr", passed: hasLang, detail: hasLang ? "present" : "missing" });
  const hasCanonical = /<link[^>]+rel=["']canonical["']/i.test(html);
  checks.push({ name: "Canonical link", passed: hasCanonical, detail: hasCanonical ? "present" : "missing" });
  const hasOg = /<meta[^>]+property=["']og:title["']/i.test(html);
  checks.push({ name: "Open Graph tags", passed: hasOg, detail: hasOg ? "present" : "missing" });
  const isHttps = url.startsWith("https://");
  checks.push({ name: "HTTPS", passed: isHttps, detail: isHttps ? "secure" : "not HTTPS" });
  const imgs = html.match(/<img\b[^>]*>/gi) || [];
  const imgsWithAlt = imgs.filter((t) => /\balt\s*=\s*["'][^"']+["']/i.test(t)).length;
  const altCoverage = imgs.length === 0 ? 1 : imgsWithAlt / imgs.length;
  checks.push({
    name: "Image alt text",
    passed: altCoverage >= 0.8,
    detail: imgs.length === 0 ? "no images" : `${imgsWithAlt}/${imgs.length} have alt`,
  });
  const passed = checks.filter((c) => c.passed).length;
  const score = Math.round((passed / checks.length) * 100);
  return { score, checks };
}

// Patterns suggesting a page is gated behind a login / auth wall.
const LOGIN_WALL_PATTERNS: RegExp[] = [
  /\bsign\s*in\s+to\s+continue\b/i,
  /\blog\s*in\s+to\s+(view|continue|access)\b/i,
  /\byou\s+must\s+be\s+(logged|signed)\s+in\b/i,
  /\bauthenticate\s+to\s+(view|continue|access)\b/i,
  /\b(please|kindly)\s+(log|sign)\s*in\b/i,
  /\bplease\s+enable\s+javascript\b/i,
];

function detectLoginWall(markdown: string, html: string, title?: string): boolean {
  const haystack = `${title || ""} ${markdown.slice(0, 4000)} ${html.slice(0, 4000)}`;
  // Multiple patterns + a password input suggests login wall, not just a login link
  const patternHits = LOGIN_WALL_PATTERNS.filter((p) => p.test(haystack)).length;
  const hasPasswordField = /<input[^>]*type=["']password["']/i.test(html);
  const looksLikeAuthTitle = /^(sign|log)\s*in|login|authentication\b/i.test((title || "").trim());
  return (patternHits >= 1 && hasPasswordField) || looksLikeAuthTitle;
}

// Priority patterns for page selection — higher index = higher priority
const PAGE_PRIORITY: [RegExp, number][] = [
  [/\/(pricing|plans|packages)/i, 10],
  [/\/(features|product|capabilities)/i, 9],
  [/\/(about|team|company|story)/i, 8],
  [/\/(signup|sign-up|register|join|get-started)/i, 7],
  [/\/(login|sign-in|signin)/i, 6],
  [/\/(docs|documentation|guide|help|faq)/i, 5],
  [/\/(blog|resources|learn)/i, 4],
  [/\/(contact|support)/i, 3],
  [/\/(demo|tour|how-it-works)/i, 3],
  [/\/(integrations|partners|customers|testimonials|case-studies)/i, 2],
];

function scorePage(url: string): number {
  for (const [pattern, score] of PAGE_PRIORITY) {
    if (pattern.test(url)) return score;
  }
  return 0;
}

function selectPages(urls: string[], baseUrl: string, max = 8): string[] {
  const base = new URL(baseUrl);
  // Filter to same origin, remove anchors/query noise, deduplicate
  const seen = new Set<string>();
  const candidates: { url: string; score: number }[] = [];

  for (const raw of urls) {
    try {
      const u = new URL(raw);
      if (u.origin !== base.origin) continue;
      // Skip auth/account/admin pages — likely login walls or noise
      if (/\/(login|signin|sign-in|account|admin|dashboard|logout|auth)(\/|$)/i.test(u.pathname)) continue;
      // Skip non-HTML assets
      if (/\.(pdf|zip|jpg|jpeg|png|gif|svg|webp|mp4|webm|css|js|xml|json)$/i.test(u.pathname)) continue;
      const clean = u.origin + u.pathname.replace(/\/+$/, "");
      if (seen.has(clean)) continue;
      seen.add(clean);
      candidates.push({ url: raw, score: scorePage(u.pathname) });
    } catch {
      continue;
    }
  }

  // Sort by score descending, take top N (homepage already scraped separately).
  // Pages with score 0 still included as fallback if we don't have enough scored pages.
  candidates.sort((a, b) => b.score - a.score);
  const homeClean = base.origin + base.pathname.replace(/\/+$/, "");
  const filtered = candidates
    .filter((c) => {
      const clean = new URL(c.url).origin + new URL(c.url).pathname.replace(/\/+$/, "");
      return clean !== homeClean;
    })
    .slice(0, max);
  return filtered.map((c) => c.url);
}

async function firecrawlRequest(path: string, body: object, apiKey: string) {
  const res = await fetch(`${FIRECRAWL_V2}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const rawText = await res.text();
  let data: any = null;
  try { data = rawText ? JSON.parse(rawText) : null; } catch { /* non-JSON body */ }
  if (!res.ok) {
    if (res.status === 402) {
      throw { status: 402, message: "Firecrawl credits exhausted. Please top up your Firecrawl account." };
    }
    const rawMsg = String(
      data?.error?.message || data?.error || data?.message || data?.details || rawText || ""
    );
    if (/do not support this site|not supported|unsupported (site|url)|blocked|forbidden/i.test(rawMsg) || res.status === 403 || res.status === 422) {
      throw { status: 422, message: "This site can't be scanned — it blocks automated crawlers (common for large news sites, social networks, and sites behind logins). Try a different URL." };
    }
    if (res.status === 408 || /timeout/i.test(rawMsg)) {
      throw { status: 504, message: "The site took too long to respond. Try again, or try a different URL." };
    }
    throw { status: 502, message: "Couldn't load this site. It may be down, blocking crawlers, or temporarily unavailable. Try again or use a different URL." };
  }
  return data;
}

// Extract <img> tags from HTML, returning {src, alt, context} for visual overlay analysis
function extractImages(html: string, baseUrl: string): { src: string; alt: string; context: string }[] {
  if (!html) return [];
  const results: { src: string; alt: string; context: string }[] = [];
  const seen = new Set<string>();
  const base = (() => { try { return new URL(baseUrl); } catch { return null; } })();

  // Match <img ...> tags
  const imgRegex = /<img\b([^>]*)>/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    const attrs = match[1];
    const srcMatch = attrs.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
    const altMatch = attrs.match(/\balt\s*=\s*["']([^"']*)["']/i);
    if (!srcMatch) continue;
    let src = srcMatch[1].trim();
    if (!src || src.startsWith("data:")) continue;
    // Resolve relative URLs
    if (base) {
      try { src = new URL(src, base).toString(); } catch { /* skip */ }
    }
    if (seen.has(src)) continue;
    seen.add(src);

    // Try to grab a small text context (next 80 chars after the tag, stripped of tags)
    const after = html.slice(match.index + match[0].length, match.index + match[0].length + 200);
    const context = after.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);

    results.push({ src, alt: altMatch?.[1] ?? "", context });
  }
  return results;
}

// Detect semantic sections on the homepage so the AI doesn't claim missing-when-present
// (e.g. testimonials, pricing, FAQ). Looks at headings, ids, classes, and section labels.
const SECTION_PATTERNS: { name: string; pattern: RegExp }[] = [
  { name: "testimonials", pattern: /testimonial|reviews?|loved by|trusted by|what (our )?(users|customers|clients) say|kind words/i },
  { name: "pricing", pattern: /pricing|plans?|tiers?|subscriptions?|cost|how much/i },
  { name: "faq", pattern: /\bfaq\b|frequently asked|questions? & answers?|common questions/i },
  { name: "features", pattern: /features?|what you get|capabilities|benefits/i },
  { name: "social_proof", pattern: /as (seen|featured) (in|on)|trusted by|customers|logos|press/i },
  { name: "cta", pattern: /get started|start free|sign up|try (it )?free|book a (demo|call)|contact us|join now/i },
  { name: "integrations", pattern: /integrations?|works with|connects? to/i },
  { name: "case_studies", pattern: /case stud|success stor|customer stor/i },
  { name: "team", pattern: /our team|meet the team|founders?|about us/i },
  { name: "blog", pattern: /blog|articles?|recent posts|from the blog/i },
  { name: "newsletter", pattern: /newsletter|subscribe|stay updated|join our list/i },
  { name: "comparison", pattern: /compared? to|vs\.|why (us|choose)|alternatives?/i },
  { name: "stats", pattern: /\b\d{2,}[,.]?\d*\s*(users?|customers?|companies|websites?|reviews?)\b|\b\d+\s*\+\s*(users?|customers?|countries|teams)\b/i },
  { name: "video_demo", pattern: /watch (the )?(demo|video)|see it in action|product tour/i },
  { name: "trust_badges", pattern: /soc\s?2|gdpr|hipaa|iso\s?27001|pci|secure by/i },
];

function detectSections(html: string, markdown: string): { name: string; evidence: string }[] {
  const found: { name: string; evidence: string }[] = [];
  if (!html && !markdown) return found;

  // Extract headings (h1-h4) + id/class hints from HTML
  const headings: string[] = [];
  if (html) {
    const headingRe = /<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/gi;
    let m;
    while ((m = headingRe.exec(html)) !== null) {
      const text = m[1].replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      if (text) headings.push(text);
    }
    // section ids/classes
    const idClassRe = /\b(?:id|class)\s*=\s*["']([^"']+)["']/gi;
    let m2;
    while ((m2 = idClassRe.exec(html)) !== null) {
      const v = m2[1];
      if (/(testimonial|pricing|faq|feature|integration|case-stud|newsletter|stats?|trust|team|hero|cta)/i.test(v)) {
        headings.push(v.replace(/[-_]/g, " "));
      }
    }
  }

  // Markdown headings
  const mdHeadingRe = /^#{1,4}\s+(.+)$/gm;
  let mm;
  while ((mm = mdHeadingRe.exec(markdown || "")) !== null) {
    headings.push(mm[1].trim());
  }

  const haystack = headings.join(" \n ") + " \n " + (markdown || "").slice(0, 8000);

  for (const { name, pattern } of SECTION_PATTERNS) {
    const match = haystack.match(pattern);
    if (match) {
      // Find a representative snippet (the matching heading if any)
      const heading = headings.find((h) => pattern.test(h));
      found.push({ name, evidence: (heading ?? match[0]).slice(0, 120) });
    }
  }
  return found;
}


serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Streaming NDJSON response — auth & validation happen synchronously up-front,
  // then progress events are emitted as the crawl progresses.
  let userId: string | null = null;
  let inputUrl: string | null = null;
  try {
    // Require authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );
    const { data: claims, error: authErr } = await sb.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (authErr || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    userId = claims.claims.sub as string;

    // Free tier is limited to N scans per rolling 30 days. Pro is unlimited.
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Server-side quota enforcement. Duplicated intentionally so callers can't
    // skip the check-scan-quota function by invoking scrape-website directly.
    const FREE_SCANS_PER_MONTH = 3;
    const { data: subRow } = await admin
      .from("subscriptions")
      .select("status,current_period_end")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const isPro = !!subRow && ["active", "trialing", "past_due"].includes(subRow.status) &&
      (!subRow.current_period_end || new Date(subRow.current_period_end).getTime() > Date.now());
    if (!isPro) {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { count } = await admin
        .from("scan_usage")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", since);
      if ((count ?? 0) >= FREE_SCANS_PER_MONTH) {
        return new Response(
          JSON.stringify({
            error: "Free scan limit reached. Upgrade to SiteScoper Pro for unlimited scans.",
            reason: "quota_exceeded",
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return new Response(JSON.stringify({ error: "URL is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    inputUrl = url;
    if (url.length > 2048) {
      return new Response(JSON.stringify({ error: "URL too long" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid URL" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return new Response(JSON.stringify({ error: "Only HTTP(S) URLs are allowed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const host = parsedUrl.hostname.toLowerCase();
    const blockedHost =
      host === "localhost" ||
      host === "0.0.0.0" ||
      host.endsWith(".local") ||
      /^127\./.test(host) ||
      /^10\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^169\.254\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(host) ||
      host.startsWith("[::1]") ||
      host === "::1";
    if (blockedHost) {
      return new Response(JSON.stringify({ error: "Private/internal URLs are not allowed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) {
      throw new Error("FIRECRAWL_API_KEY is not configured");
    }

    // Record the scan attempt server-side BEFORE any external API call. This makes
    // the free-tier quota self-enforcing: callers cannot skip the client-side
    // analysis_history insert (e.g. direct invoke, Compare page) to get unlimited scans.
    try {
      await admin.from("scan_usage").insert({ user_id: userId, url: inputUrl });
    } catch (logErr) {
      console.error("scan_usage insert failed:", logErr);
    }

    // Switch to streaming response from here on. Each event is one JSON line.
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const send = (obj: unknown) => {
          try { controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n")); } catch { /* closed */ }
        };
        const sendProgress = (step: string, label: string, percent: number) =>
          send({ type: "progress", step, label, percent });

        try {
          // Step 1: homepage with branding + screenshot
          sendProgress("connect", "Connecting to site", 5);
          console.log("Scraping homepage:", inputUrl);
          const scrapeHome = async (waitFor: number) => {
            const data = await firecrawlRequest("/scrape", {
              url: inputUrl,
              formats: ["markdown", "html", "screenshot", "links"],
              onlyMainContent: false,
              waitFor,
            }, FIRECRAWL_API_KEY);
            return data.data || data;
          };

          sendProgress("homepage", "Loading homepage", 15);
          let homeResult = await scrapeHome(3000);
          let partialReason: string | null = null;
          let loginWall = false;
          const isEmpty = (r: any) =>
            !r || !((r.markdown || "").trim().length > 60 || (r.html || "").length > 500);

          if (isEmpty(homeResult)) {
            sendProgress("homepage", "JS-heavy site — retrying with longer wait", 20);
            try { homeResult = await scrapeHome(8000); } catch (e) { console.warn("retry failed", e); }
          }

          if (homeResult && detectLoginWall(homeResult.markdown || "", homeResult.html || "", homeResult.metadata?.title)) {
            loginWall = true;
            partialReason = "This site appears to be behind a login wall. We can only see the public sign-in page, so the analysis below is based on limited content.";
          }
          if (isEmpty(homeResult)) {
            partialReason = loginWall ? partialReason : "We couldn't load much content from this page. The site may rely heavily on JavaScript, use scroll-triggered loading, or block crawlers. Results below are based on partial data.";
          }

          // Tier 1: fast deterministic tech-SEO checks (no AI)
          sendProgress("tech_seo", "Running tech SEO checks", 30);
          const techSeo = runTechSeoChecks(homeResult.html || "", inputUrl!);
          send({ type: "tech_seo", data: techSeo });

          // Step 2: map site
          sendProgress("map", "Discovering pages on this site", 40);
          let siteUrls: string[] = [];
          try {
            const mapData = await firecrawlRequest("/map", { url: inputUrl, limit: 50 }, FIRECRAWL_API_KEY);
            siteUrls = mapData.links || mapData.data?.links || [];
          } catch (e) { console.warn("Map failed:", e); }
          sendProgress("map", `Found ${siteUrls.length} pages`, 45);

          // Step 3: scrape selected pages
          const pagesToScrape = selectPages(siteUrls, inputUrl!);
          sendProgress("pages", `Reading ${pagesToScrape.length + 1} key pages in parallel`, 55);

          const pages: { url: string; markdown: string; title?: string }[] = [{
            url: inputUrl!,
            markdown: homeResult.markdown || "",
            title: homeResult.metadata?.title || "Homepage",
          }];
          const brokenLinks: { url: string; reason: string }[] = [];
          let completed = 0;
          const total = pagesToScrape.length;
          const scrapePromises = pagesToScrape.map(async (pageUrl) => {
            try {
              const pageData = await firecrawlRequest("/scrape", {
                url: pageUrl,
                formats: ["markdown"],
                onlyMainContent: true,
              }, FIRECRAWL_API_KEY);
              const result = pageData.data || pageData;
              const status = result.metadata?.statusCode;
              if (status && (status === 404 || status >= 500)) {
                brokenLinks.push({ url: pageUrl, reason: `HTTP ${status}` });
                return null;
              }
              if (!(result.markdown || "").trim()) {
                brokenLinks.push({ url: pageUrl, reason: "Empty page" });
                return null;
              }
              return { url: pageUrl, markdown: result.markdown || "", title: result.metadata?.title || new URL(pageUrl).pathname };
            } catch (e) {
              brokenLinks.push({ url: pageUrl, reason: e instanceof Error ? e.message : "Failed" });
              return null;
            } finally {
              completed++;
              const pct = 55 + Math.round((completed / Math.max(1, total)) * 25);
              sendProgress("pages", `Read ${completed}/${total} sub-pages`, pct);
            }
          });
          const additionalPages = (await Promise.all(scrapePromises)).filter(Boolean);
          pages.push(...(additionalPages as typeof pages));

          sendProgress("assemble", "Assembling crawl report", 90);
          const combinedMarkdown = pages
            .map((p) => `\n\n===== PAGE: ${p.title} (${p.url}) =====\n\n${p.markdown}`)
            .join("\n");
          const images = extractImages(homeResult.html || "", inputUrl!).slice(0, 30);
          const detectedSections = detectSections(homeResult.html || "", homeResult.markdown || "");

          sendProgress("done", "Crawl complete", 100);
          send({
            type: "result",
            data: {
              markdown: combinedMarkdown,
              screenshot: homeResult.screenshot,
              links: homeResult.links,
              metadata: homeResult.metadata,
              pages: pages.map((p) => ({ url: p.url, title: p.title })),
              pagesCount: pages.length,
              siteUrlsDiscovered: siteUrls.length,
              images,
              detectedSections,
              brokenLinks,
              loginWall,
              partial: !!partialReason,
              partialReason,
              tech_seo: techSeo,
            },
          });
        } catch (e: any) {
          console.error("stream error:", e);
          const status = e?.status || 500;
          const message = [402, 422, 502, 504].includes(status) && typeof e?.message === "string"
            ? e.message
            : "Scrape failed. Please try again.";
          send({ type: "error", message, status });
        } finally {
          try { controller.close(); } catch { /* already closed */ }
        }
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "application/x-ndjson; charset=utf-8" },
    });
  } catch (e: any) {
    console.error("scrape error:", e);
    const status = e?.status || 500;
    // Only forward 402 (insufficient credits) message; mask all other internals
    const userMsg = status === 402 && typeof e?.message === "string"
      ? e.message
      : "Analysis failed. Please try again.";
    return new Response(
      JSON.stringify({ error: userMsg }),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
