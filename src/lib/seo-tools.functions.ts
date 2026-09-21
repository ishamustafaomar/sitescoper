import { createServerFn } from "@tanstack/react-start";

// ---------- Open Graph / meta tag checker -----------------------------------

export type CheckLevel = "pass" | "warn" | "fail";

export interface TagCheck {
  id: string;
  label: string;
  level: CheckLevel;
  detail: string;
  fix?: string;
}

export interface OpenGraphResult {
  url: string;
  finalUrl: string;
  status: number;
  title: string;
  description: string;
  canonical: string;
  lang: string;
  robots: string;
  favicon: string;
  og: Record<string, string>;
  twitter: Record<string, string>;
  jsonLdTypes: string[];
  image: {
    url: string;
    width?: number;
    height?: number;
    bytes?: number;
    contentType?: string;
    ok: boolean;
    error?: string;
  } | null;
  checks: TagCheck[];
  score: number;
  suggestedHead: string;
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

export const checkOpenGraph = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const data = (input ?? {}) as { url?: unknown };
    if (typeof data.url !== "string" || data.url.length > 2048) throw new Error("A URL is required");
    return { url: data.url };
  })
  .handler(async ({ data }): Promise<OpenGraphResult> => {
    const tools = await import("@/lib/seo-tools.server");
    const { getRequestHeader } = await import("@tanstack/react-start/server");
    const ip = getRequestHeader("cf-connecting-ip") ?? getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
    if (!tools.rateLimit(`og:${ip}`, 30, 10 * 60_000)) {
      throw new Error("Too many checks from this network. Try again in a few minutes.");
    }

    const target = tools.parsePublicUrl(data.url);
    let page: Awaited<ReturnType<typeof tools.fetchText>>;
    try {
      page = await tools.fetchText(target.toString(), 10_000);
    } catch (err) {
      const msg = err instanceof Error && err.name === "AbortError" ? "The page took too long to respond." : "The page could not be fetched.";
      throw new Error(msg);
    }
    if (!/html|xml/i.test(page.contentType) && !/<html/i.test(page.text.slice(0, 2000))) {
      throw new Error("That URL did not return an HTML page.");
    }

    const head = tools.parseHead(page.text);
    const og: Record<string, string> = {};
    const twitter: Record<string, string> = {};
    for (const m of head.metas) {
      if (m.key.startsWith("og:") && !og[m.key]) og[m.key] = m.value;
      if (m.key.startsWith("twitter:") && !twitter[m.key]) twitter[m.key] = m.value;
    }
    const description = tools.firstMeta(head.metas, "description");
    const robots = tools.firstMeta(head.metas, "robots");
    const canonicalRaw = head.links.find((l) => l.rel.split(/\s+/).includes("canonical"))?.href ?? "";
    const canonical = canonicalRaw ? tools.resolveUrl(canonicalRaw, page.finalUrl) : "";
    const iconRaw = head.links.find((l) => /(^|\s)(icon|shortcut icon|apple-touch-icon)(\s|$)/.test(l.rel))?.href ?? "";
    const favicon = iconRaw ? tools.resolveUrl(iconRaw, page.finalUrl) : "";

    const imageRaw = og["og:image"] || og["og:image:url"] || og["og:image:secure_url"] || twitter["twitter:image"] || twitter["twitter:image:src"] || "";
    const imageUrl = imageRaw ? tools.resolveUrl(imageRaw, page.finalUrl) : "";
    let image: OpenGraphResult["image"] = null;
    if (imageUrl) {
      let probe: Awaited<ReturnType<typeof tools.probeImage>> = { ok: false, error: "Image URL is not public" };
      try {
        tools.parsePublicUrl(imageUrl);
        probe = await tools.probeImage(imageUrl);
      } catch {
        /* keep the not-public error */
      }
      const declaredW = Number(og["og:image:width"]) || undefined;
      const declaredH = Number(og["og:image:height"]) || undefined;
      image = {
        url: imageUrl,
        width: probe.width ?? declaredW,
        height: probe.height ?? declaredH,
        bytes: probe.bytes,
        contentType: probe.contentType,
        ok: probe.ok,
        error: probe.error,
      };
    }

    const checks: TagCheck[] = [];
    const add = (id: string, label: string, level: CheckLevel, detail: string, fix?: string) => checks.push({ id, label, level, detail, fix });

    // Title
    if (!head.title) add("title", "Title tag", "fail", "No <title> found.", "Add a unique, descriptive <title> of 30–60 characters.");
    else if (head.title.length < 20) add("title", "Title tag", "warn", `"${head.title}" is only ${head.title.length} characters.`, "Aim for 30–60 characters that describe the page and include your brand.");
    else if (head.title.length > 65) add("title", "Title tag", "warn", `${head.title.length} characters — Google will truncate it.`, "Keep the most important words in the first 60 characters.");
    else add("title", "Title tag", "pass", `${head.title.length} characters.`);

    // Description
    if (!description) add("description", "Meta description", "fail", "No meta description.", "Add a 70–160 character summary; it is often used as the search snippet and as the social description fallback.");
    else if (description.length < 60) add("description", "Meta description", "warn", `Only ${description.length} characters.`, "Expand to 70–160 characters so the snippet does not look sparse.");
    else if (description.length > 170) add("description", "Meta description", "warn", `${description.length} characters — likely truncated in results.`, "Trim to about 160 characters.");
    else add("description", "Meta description", "pass", `${description.length} characters.`);

    // Canonical
    if (!canonical) add("canonical", "Canonical URL", "warn", "No canonical link.", "Add <link rel=\"canonical\"> pointing at this page's preferred URL.");
    else {
      try {
        const c = new URL(canonical);
        const f = new URL(page.finalUrl);
        if (c.hostname.replace(/^www\./, "") !== f.hostname.replace(/^www\./, "")) add("canonical", "Canonical URL", "warn", `Canonical points at another host: ${canonical}`, "Unless this is intentional syndication, the canonical should be this page.");
        else add("canonical", "Canonical URL", "pass", canonical);
      } catch {
        add("canonical", "Canonical URL", "warn", `Canonical is not an absolute URL: ${canonical}`, "Use a full https:// URL.");
      }
    }

    // Robots
    if (/noindex/i.test(robots)) add("robots", "Robots meta", "fail", `robots="${robots}" — this page asks search engines not to index it.`, "Remove noindex if the page should appear in search.");
    else add("robots", "Robots meta", "pass", robots ? `robots="${robots}"` : "No restrictions.");

    // og basics
    const ogTitle = og["og:title"];
    if (!ogTitle) add("og:title", "og:title", head.title ? "warn" : "fail", "Missing; platforms will fall back to the <title>, which is often too long for a card.", "Add og:title (up to about 60 characters).");
    else if (ogTitle.length > 90) add("og:title", "og:title", "warn", `${ogTitle.length} characters — cards truncate around 60–90.`, "Shorten og:title.");
    else add("og:title", "og:title", "pass", ogTitle);

    const ogDesc = og["og:description"];
    if (!ogDesc) add("og:description", "og:description", description ? "warn" : "fail", "Missing; some platforms show nothing under the title.", "Add og:description (up to about 200 characters).");
    else add("og:description", "og:description", "pass", `${ogDesc.length} characters.`);

    if (!og["og:type"]) add("og:type", "og:type", "warn", "Missing; defaults to website on most platforms.", "Add og:type (website for pages, article for posts).");
    else add("og:type", "og:type", "pass", og["og:type"]);

    if (!og["og:url"]) add("og:url", "og:url", "warn", "Missing; shares may be attributed to the URL with tracking parameters instead of the clean one.", "Add og:url with the canonical URL.");
    else if (canonical && og["og:url"].replace(/\/$/, "") !== canonical.replace(/\/$/, "")) add("og:url", "og:url", "warn", `og:url (${og["og:url"]}) differs from the canonical.`, "Keep og:url and canonical identical so shares and search agree.");
    else add("og:url", "og:url", "pass", og["og:url"]);

    if (!og["og:site_name"]) add("og:site_name", "og:site_name", "warn", "Missing; LinkedIn and Slack show the site name above the title.", "Add og:site_name with your brand.");
    else add("og:site_name", "og:site_name", "pass", og["og:site_name"]);

    // Image
    if (!image) add("og:image", "og:image", "fail", "No share image. Links will render as a bare title or a random page image.", "Add an absolute https og:image, ideally 1200×630 px and under 600 KB.");
    else {
      if (!/^https:\/\//i.test(image.url)) add("og:image:https", "og:image over HTTPS", "fail", "Share image is not served over https; several platforms will refuse it.", "Serve the image from an https URL.");
      if (!image.ok) add("og:image:reachable", "og:image reachable", "fail", `Could not fetch the image (${image.error ?? "unknown error"}).`, "Make sure the image URL is public and returns 200.");
      else {
        if (image.contentType && !/^image\//i.test(image.contentType)) add("og:image:type", "og:image content type", "fail", `Server returned ${image.contentType}, not an image.`, "Point og:image at an actual image file.");
        if (image.width && image.height) {
          if (image.width < 600 || image.height < 315) add("og:image:size", "og:image dimensions", "fail", `${image.width}×${image.height} px is too small for a large card (minimum 600×315, recommended 1200×630).`, "Export a 1200×630 px image.");
          else if (image.width < 1200) add("og:image:size", "og:image dimensions", "warn", `${image.width}×${image.height} px — will look soft on retina displays.`, "Use 1200×630 px for the sharpest previews.");
          else {
            const ratio = image.width / image.height;
            if (ratio < 1.7 || ratio > 2.1) add("og:image:size", "og:image dimensions", "warn", `${image.width}×${image.height} px (ratio ${ratio.toFixed(2)}) — cards crop to about 1.91:1.`, "Use 1200×630 px so nothing important is cropped.");
            else add("og:image:size", "og:image dimensions", "pass", `${image.width}×${image.height} px.`);
          }
        } else add("og:image:size", "og:image dimensions", "warn", "Could not read the image dimensions (unsupported format or truncated response).", "Use PNG, JPEG or WebP and add og:image:width / og:image:height.");
        if (image.bytes) {
          if (image.bytes > 5 * 1024 * 1024) add("og:image:bytes", "og:image file size", "fail", `${(image.bytes / 1024 / 1024).toFixed(1)} MB — X and LinkedIn drop images over 5 MB.`, "Compress to well under 1 MB.");
          else if (image.bytes > 600 * 1024) add("og:image:bytes", "og:image file size", "warn", `${Math.round(image.bytes / 1024)} KB — WhatsApp often shows no preview above roughly 600 KB.`, "Compress to under 300–600 KB.");
          else add("og:image:bytes", "og:image file size", "pass", `${Math.round(image.bytes / 1024)} KB.`);
        }
      }
      if (!og["og:image:alt"] && !twitter["twitter:image:alt"]) add("og:image:alt", "og:image:alt", "warn", "No alt text for the share image.", "Add og:image:alt for accessibility on platforms that support it.");
    }

    // Twitter
    const card = twitter["twitter:card"];
    if (!card) add("twitter:card", "twitter:card", "warn", "Missing; X falls back to a small summary card or no card.", 'Add <meta name="twitter:card" content="summary_large_image">.');
    else if (card !== "summary_large_image" && image) add("twitter:card", "twitter:card", "warn", `"${card}" — you have a large image but are asking for a small card.`, "Use summary_large_image.");
    else add("twitter:card", "twitter:card", "pass", card);

    // Misc
    if (!head.lang) add("lang", "HTML lang attribute", "warn", "No lang attribute on <html>.", 'Add <html lang="en"> (or the page language).');
    else add("lang", "HTML lang attribute", "pass", head.lang);
    if (!favicon) add("favicon", "Favicon", "warn", "No icon link found; Google shows a generic globe in results.", "Add a 48×48+ favicon and an apple-touch-icon.");
    else add("favicon", "Favicon", "pass", favicon);
    if (head.jsonLdTypes.length === 0) add("jsonld", "Structured data", "warn", "No JSON-LD found.", "Add Organization or WebSite JSON-LD; articles should carry Article/BlogPosting.");
    else if (head.jsonLdTypes.includes("(invalid JSON-LD)")) add("jsonld", "Structured data", "fail", "A JSON-LD block does not parse.", "Validate the JSON in the Rich Results Test.");
    else add("jsonld", "Structured data", "pass", head.jsonLdTypes.join(", "));

    const weights: Record<CheckLevel, number> = { pass: 1, warn: 0.5, fail: 0 };
    const score = Math.round((checks.reduce((s, c) => s + weights[c.level], 0) / checks.length) * 100);

    const finalTitle = ogTitle || head.title || "Page title";
    const finalDesc = ogDesc || description || "One or two sentences describing this page.";
    const finalUrl = canonical || page.finalUrl;
    const siteName = og["og:site_name"] || new URL(page.finalUrl).hostname.replace(/^www\./, "");
    const suggestedHead = [
      `<title>${esc(head.title || finalTitle)}</title>`,
      `<meta name="description" content="${esc(description || finalDesc)}">`,
      `<link rel="canonical" href="${esc(finalUrl)}">`,
      `<meta property="og:type" content="${esc(og["og:type"] || "website")}">`,
      `<meta property="og:site_name" content="${esc(siteName)}">`,
      `<meta property="og:title" content="${esc(finalTitle)}">`,
      `<meta property="og:description" content="${esc(finalDesc)}">`,
      `<meta property="og:url" content="${esc(finalUrl)}">`,
      `<meta property="og:image" content="${esc(image?.url || `${new URL(page.finalUrl).origin}/og-image.png`)}">`,
      `<meta property="og:image:width" content="1200">`,
      `<meta property="og:image:height" content="630">`,
      `<meta property="og:image:alt" content="${esc(og["og:image:alt"] || finalTitle)}">`,
      `<meta name="twitter:card" content="summary_large_image">`,
      `<meta name="twitter:title" content="${esc(twitter["twitter:title"] || finalTitle)}">`,
      `<meta name="twitter:description" content="${esc(twitter["twitter:description"] || finalDesc)}">`,
      `<meta name="twitter:image" content="${esc(image?.url || `${new URL(page.finalUrl).origin}/og-image.png`)}">`,
    ].join("\n");

    return {
      url: target.toString(),
      finalUrl: page.finalUrl,
      status: page.status,
      title: head.title,
      description,
      canonical,
      lang: head.lang,
      robots,
      favicon,
      og,
      twitter,
      jsonLdTypes: head.jsonLdTypes,
      image,
      checks,
      score,
      suggestedHead,
    };
  });

// ---------- llms.txt generator ----------------------------------------------

export interface LlmsTxtResult {
  siteName: string;
  origin: string;
  content: string;
  pagesFound: number;
  pagesFetched: number;
  sitemap?: string;
  warnings: string[];
}

interface PageInfo {
  url: string;
  title: string;
  description: string;
  depth: number;
  section: string;
}

function sectionLabel(seg: string): string {
  const map: Record<string, string> = {
    blog: "Blog",
    docs: "Docs",
    documentation: "Docs",
    guides: "Guides",
    guide: "Guides",
    help: "Help",
    support: "Help",
    faq: "FAQ",
    pricing: "Pricing",
    product: "Product",
    products: "Products",
    features: "Features",
    about: "About",
    company: "Company",
    careers: "Careers",
    legal: "Legal",
    privacy: "Legal",
    terms: "Legal",
    tools: "Tools",
    resources: "Resources",
    changelog: "Changelog",
    news: "News",
    case_studies: "Case studies",
    "case-studies": "Case studies",
    customers: "Customers",
    api: "API",
    integrations: "Integrations",
    templates: "Templates",
    compare: "Comparisons",
    vs: "Comparisons",
  };
  if (map[seg]) return map[seg]!;
  const words = seg.replace(/[-_]+/g, " ").trim();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : "Pages";
}

export const generateLlmsTxt = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const data = (input ?? {}) as { url?: unknown; maxPages?: unknown };
    if (typeof data.url !== "string" || data.url.length > 2048) throw new Error("A URL is required");
    const maxPages = Math.min(40, Math.max(5, Number(data.maxPages) || 30));
    return { url: data.url, maxPages };
  })
  .handler(async ({ data }): Promise<LlmsTxtResult> => {
    const tools = await import("@/lib/seo-tools.server");
    const { getRequestHeader } = await import("@tanstack/react-start/server");
    const ip = getRequestHeader("cf-connecting-ip") ?? getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
    if (!tools.rateLimit(`llms:${ip}`, 8, 10 * 60_000)) {
      throw new Error("Too many generations from this network. Try again in a few minutes.");
    }

    const target = tools.parsePublicUrl(data.url);
    const warnings: string[] = [];
    let home: Awaited<ReturnType<typeof tools.fetchText>>;
    try {
      home = await tools.fetchText(target.origin + "/", 10_000);
    } catch (err) {
      throw new Error(err instanceof Error && err.name === "AbortError" ? "The homepage took too long to respond." : "The homepage could not be fetched.");
    }
    if (!home.ok) throw new Error(`The homepage returned HTTP ${home.status}.`);

    const homeHead = tools.parseHead(home.text);
    const homeDesc = tools.firstMeta(homeHead.metas, "description") || tools.firstMeta(homeHead.metas, "og:description") || tools.firstParagraph(home.text);
    const ogSite = tools.firstMeta(homeHead.metas, "og:site_name");
    const rawTitle = homeHead.title || tools.firstHeading(home.text) || target.hostname;
    const siteName = ogSite || rawTitle.split(/\s[|–—-]\s/)[0]!.trim() || target.hostname;

    // Discover URLs: sitemap first, then internal links as a fallback.
    const discovered = await tools.discoverSitemapUrls(target, 400);
    let urls = discovered.urls;
    if (urls.length < 3) {
      warnings.push(discovered.sitemap ? "The sitemap listed very few pages; internal links from the homepage were used as well." : "No sitemap was found; pages were discovered from homepage links. Add a sitemap.xml for better coverage.");
      urls = Array.from(new Set([...urls, ...tools.internalLinks(home.text, target, 80)]));
    }
    const homeUrl = target.origin + "/";
    const ranked = urls
      .filter((u) => u !== homeUrl && u !== homeUrl.slice(0, -1))
      .map((u) => {
        const p = new URL(u);
        const segs = p.pathname.split("/").filter(Boolean);
        return { u, depth: segs.length, len: p.pathname.length };
      })
      .sort((a, b) => a.depth - b.depth || a.len - b.len)
      .slice(0, data.maxPages - 1)
      .map((x) => x.u);

    // Fetch pages with bounded concurrency.
    const pages: PageInfo[] = [
      {
        url: homeUrl,
        title: rawTitle,
        description: homeDesc.slice(0, 200),
        depth: 0,
        section: "Pages",
      },
    ];
    let fetched = 1;
    const queue = [...ranked];
    const worker = async () => {
      while (queue.length) {
        const u = queue.shift()!;
        try {
          const res = await tools.fetchText(u, 6000, 200_000);
          if (!res.ok || !/html/i.test(res.contentType)) continue;
          const h = tools.parseHead(res.text);
          if (/noindex/i.test(tools.firstMeta(h.metas, "robots"))) continue;
          const title = (h.title || tools.firstHeading(res.text) || new URL(u).pathname).split(/\s[|–—]\s/)[0]!.trim();
          const description = (tools.firstMeta(h.metas, "description") || tools.firstMeta(h.metas, "og:description") || tools.firstParagraph(res.text)).slice(0, 200);
          const segs = new URL(u).pathname.split("/").filter(Boolean);
          pages.push({
            url: u,
            title,
            description,
            depth: segs.length,
            section: segs.length >= 2 ? sectionLabel(segs[0]!.toLowerCase()) : "Pages",
          });
          fetched += 1;
        } catch {
          /* skip page */
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(8, queue.length || 1) }, worker));

    // Build the file.
    const bySection = new Map<string, PageInfo[]>();
    for (const p of pages) {
      const list = bySection.get(p.section) ?? [];
      list.push(p);
      bySection.set(p.section, list);
    }
    const sectionOrder = ["Pages", "Product", "Products", "Features", "Pricing", "Docs", "Guides", "Blog", "Help", "FAQ", "Tools", "Resources"];
    const sections = Array.from(bySection.keys()).sort((a, b) => {
      const ia = sectionOrder.indexOf(a);
      const ib = sectionOrder.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.localeCompare(b);
    });

    const line = (p: PageInfo) => `- [${p.title.replace(/[[\]]/g, "")}](${p.url})${p.description ? `: ${p.description.replace(/\s+/g, " ")}` : ""}`;
    const out: string[] = [`# ${siteName}`, ""];
    if (homeDesc) out.push(`> ${homeDesc.replace(/\s+/g, " ").slice(0, 300)}`, "");
    out.push(
      `This file follows the llms.txt proposal (https://llmstxt.org). It lists the pages of ${target.hostname} that are most useful for AI assistants and answer engines, with a one-line summary of each.`,
      "",
    );
    const optional: PageInfo[] = [];
    for (const s of sections) {
      const list = bySection.get(s)!;
      const main = list.filter((p) => p.depth <= 2).slice(0, 12);
      const rest = list.filter((p) => !main.includes(p));
      optional.push(...rest);
      if (!main.length) continue;
      out.push(`## ${s}`, "");
      for (const p of main) out.push(line(p));
      out.push("");
    }
    if (optional.length) {
      out.push("## Optional", "");
      for (const p of optional.slice(0, 40)) out.push(line(p));
      out.push("");
    }

    return {
      siteName,
      origin: target.origin,
      content: out.join("\n").trim() + "\n",
      pagesFound: urls.length + 1,
      pagesFetched: fetched,
      sitemap: discovered.sitemap,
      warnings,
    };
  });
