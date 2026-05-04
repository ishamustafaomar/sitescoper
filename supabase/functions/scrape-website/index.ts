import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FIRECRAWL_V2 = "https://api.firecrawl.dev/v2";

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
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 402) {
      throw { status: 402, message: "Firecrawl credits exhausted. Please top up your Firecrawl account." };
    }
    throw new Error(data.error || `Firecrawl error: ${res.status}`);
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

    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return new Response(JSON.stringify({ error: "URL is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
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

    // Step 1: Scrape homepage with screenshot + branding
    // Wait for JS rendering (helps SPAs) + auto-retry once if markdown is empty.
    console.log("Scraping homepage:", url);
    const scrapeHome = async (waitFor: number) => {
      const data = await firecrawlRequest("/scrape", {
        url,
        formats: ["markdown", "html", "screenshot", "links"],
        onlyMainContent: false,
        waitFor,
      }, FIRECRAWL_API_KEY);
      return data.data || data;
    };

    let homeResult = await scrapeHome(3000);
    let partialReason: string | null = null;
    let loginWall = false;

    const isEmpty = (r: any) =>
      !r || !((r.markdown || "").trim().length > 60 || (r.html || "").length > 500);

    if (isEmpty(homeResult)) {
      console.warn("Homepage scrape returned empty — retrying with longer wait for JS-heavy site");
      try {
        // Heavy-JS / parallax / scroll-triggered sites need much longer
        homeResult = await scrapeHome(8000);
      } catch (e) {
        console.warn("Retry failed:", e);
      }
    }

    // Detect login wall on homepage
    if (homeResult && detectLoginWall(homeResult.markdown || "", homeResult.html || "", homeResult.metadata?.title)) {
      loginWall = true;
      partialReason =
        "This site appears to be behind a login wall. We can only see the public sign-in page, so the analysis below is based on limited content.";
    }

    if (isEmpty(homeResult)) {
      partialReason =
        loginWall
          ? partialReason
          : "We couldn't load much content from this page. The site may rely heavily on JavaScript, use scroll-triggered loading, or block crawlers. Results below are based on partial data.";
    }

    // Step 2: Map the site to discover pages
    console.log("Mapping site:", url);
    let siteUrls: string[] = [];
    try {
      const mapData = await firecrawlRequest("/map", { url, limit: 50 }, FIRECRAWL_API_KEY);
      siteUrls = mapData.links || mapData.data?.links || [];
      console.log(`Found ${siteUrls.length} URLs on site`);
    } catch (e) {
      console.warn("Map failed, continuing with homepage only:", e);
    }

    // Step 3: Select and scrape important pages
    const pagesToScrape = selectPages(siteUrls, url);
    console.log("Selected pages to scrape:", pagesToScrape);

    const pages: { url: string; markdown: string; title?: string }[] = [
      {
        url,
        markdown: homeResult.markdown || "",
        title: homeResult.metadata?.title || "Homepage",
      },
    ];

    // Scrape additional pages in parallel (max 5 concurrent).
    // Track broken / unreachable pages so the AI can flag them.
    const brokenLinks: { url: string; reason: string }[] = [];
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
        return {
          url: pageUrl,
          markdown: result.markdown || "",
          title: result.metadata?.title || new URL(pageUrl).pathname,
        };
      } catch (e) {
        brokenLinks.push({ url: pageUrl, reason: e instanceof Error ? e.message : "Failed to load" });
        console.warn(`Failed to scrape ${pageUrl}:`, e);
        return null;
      }
    });

    const additionalPages = (await Promise.all(scrapePromises)).filter(Boolean);
    pages.push(...additionalPages as typeof pages);

    // Build combined markdown with page separators
    const combinedMarkdown = pages
      .map((p) => `\n\n===== PAGE: ${p.title} (${p.url}) =====\n\n${p.markdown}`)
      .join("\n");

    // Extract images from homepage HTML for visual overlay analysis
    const images = extractImages(homeResult.html || "", url).slice(0, 30);

    // Detect sections on homepage so AI doesn't claim missing-when-present
    const detectedSections = detectSections(homeResult.html || "", homeResult.markdown || "");

    return new Response(JSON.stringify({
      success: true,
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
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("scrape error:", e);
    const status = e?.status || 500;
    return new Response(
      JSON.stringify({ error: e?.message || (e instanceof Error ? e.message : "Unknown error") }),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
