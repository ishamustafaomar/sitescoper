/**
 * Postbuild: generate per-route static HTML files in dist/ so non-JS
 * crawlers (Bing, GPTBot, ClaudeBot, Slack/X/LinkedIn link previews) see
 * real per-page <title>, <meta description>, <link rel=canonical>, and
 * og:* tags instead of the homepage shell.
 *
 * Strategy: read dist/index.html (the SPA shell) and rewrite the head for
 * each route, then write to dist/<path>/index.html. Lovable's SPA fallback
 * serves a real file when one exists, otherwise falls back to index.html
 * for client routing — so the SPA still works for users.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs"
import { resolve, join } from "path"

const BASE_URL = "https://sitescoper.com"
const DIST = resolve("dist")
const SHELL_PATH = join(DIST, "index.html")

if (!existsSync(SHELL_PATH)) {
  console.warn(`[prerender] ${SHELL_PATH} not found — skipping (likely not a production build).`)
  process.exit(0)
}

interface RouteMeta {
  path: string
  title: string
  description: string
  ogType?: "website" | "article"
  publishedTime?: string
  noindex?: boolean
}

const blogPosts: { slug: string; title: string; description: string; publishedTime: string }[] = [
  {
    slug: "how-to-audit-a-website-for-seo",
    title: "How to Audit a Website for SEO (2026 Guide)",
    description: "A founder-friendly walkthrough: crawl, on-page, technical, content, and prioritisation. Audit your site in under an hour.",
    publishedTime: "2026-01-15",
  },
  {
    slug: "ai-website-audit-vs-traditional-seo-tools",
    title: "AI Website Audit vs Traditional SEO Tools",
    description: "Why AI-native auditors find issues legacy tools miss — and where Semrush/Ahrefs still win.",
    publishedTime: "2026-02-04",
  },
  {
    slug: "core-web-vitals-explained-for-founders",
    title: "Core Web Vitals Explained for Founders",
    description: "LCP, INP, CLS — what they mean, why Google ranks on them, and how to fix the common offenders.",
    publishedTime: "2026-02-22",
  },
  {
    slug: "free-website-audit-checklist",
    title: "Free Website Audit Checklist (60 Checks)",
    description: "The same checks SiteScoper runs in 60 seconds — printable, free, no signup.",
    publishedTime: "2026-03-10",
  },
  {
    slug: "small-business-seo-guide",
    title: "Small Business SEO: A Practical Guide",
    description: "How small teams beat bigger competitors on local + long-tail search without a full-time SEO.",
    publishedTime: "2026-04-01",
  },
  {
    slug: "white-label-seo-reports-for-agencies",
    title: "White-Label SEO Reports for Agencies",
    description: "Deliver branded SEO audits in minutes — pricing, workflow, and templates that close clients.",
    publishedTime: "2026-05-12",
  },
]

const routes: RouteMeta[] = [
  {
    path: "/",
    title: "AI Website UX Auditor & Instant SEO Checker | SiteScoper",
    description: "SiteScoper is the AI website UX auditor and instant SEO checker founders use to find what's hurting conversions — full report in 60 seconds, free to start.",
  },
  {
    path: "/pricing",
    title: "Pricing — SiteScoper",
    description: "Simple pricing for SiteScoper. Free audits to start, Pro plans for agencies and serious operators.",
  },
  {
    path: "/ai-website-audit-tool",
    title: "AI Website Audit Tool — Free & Instant | SiteScoper",
    description: "The fastest AI website audit tool. Paste your URL, get a prioritized UX, SEO and conversion report in 60 seconds.",
  },
  {
    path: "/white-label-seo-reports",
    title: "White-Label SEO Reports for Agencies | SiteScoper",
    description: "Deliver branded, client-ready SEO audits in minutes. White-label exports, custom logos, agency pricing.",
  },
  {
    path: "/blog",
    title: "Blog — SiteScoper",
    description: "Practical guides on SEO, conversion, performance, and AI-powered website audits.",
  },
  ...blogPosts.map<RouteMeta>((p) => ({
    path: `/blog/${p.slug}`,
    title: `${p.title} | SiteScoper`,
    description: p.description,
    ogType: "article",
    publishedTime: p.publishedTime,
  })),
  { path: "/privacy", title: "Privacy Policy — SiteScoper", description: "How SiteScoper handles your data.", noindex: false },
  { path: "/terms", title: "Terms of Service — SiteScoper", description: "Terms of using SiteScoper.", noindex: false },
  { path: "/auth", title: "Sign in — SiteScoper", description: "Sign in to SiteScoper to run AI website audits.", noindex: true },
  { path: "/compare", title: "Compare websites — SiteScoper", description: "Compare two websites side-by-side with AI.", noindex: true },
]

const shell = readFileSync(SHELL_PATH, "utf8")

function escapeAttr(s: string) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function buildHead(route: RouteMeta) {
  const url = `${BASE_URL}${route.path === "/" ? "/" : route.path}`
  const ogType = route.ogType || "website"
  const desc = escapeAttr(route.description)
  const title = escapeAttr(route.title)
  return {
    title,
    desc,
    url,
    ogType,
    publishedTime: route.publishedTime,
    noindex: !!route.noindex,
  }
}

function rewriteShell(html: string, route: RouteMeta) {
  const m = buildHead(route)
  let out = html

  // <title>
  out = out.replace(/<title>[\s\S]*?<\/title>/, `<title>${m.title}</title>`)

  // meta description
  out = out.replace(
    /<meta\s+name=["']description["'][^>]*>/i,
    `<meta name="description" content="${m.desc}">`,
  )

  // canonical
  if (/<link[^>]+rel=["']canonical["']/i.test(out)) {
    out = out.replace(/<link[^>]+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${m.url}">`)
  } else {
    out = out.replace(/<\/head>/i, `  <link rel="canonical" href="${m.url}">\n  </head>`)
  }

  // og:url
  out = out.replace(
    /<meta\s+property=["']og:url["'][^>]*>/i,
    `<meta property="og:url" content="${m.url}" />`,
  )
  // og:title
  out = out.replace(
    /<meta\s+property=["']og:title["'][^>]*>/i,
    `<meta property="og:title" content="${m.title}">`,
  )
  // og:description
  out = out.replace(
    /<meta\s+property=["']og:description["'][^>]*>/i,
    `<meta property="og:description" content="${m.desc}">`,
  )
  // og:type
  out = out.replace(
    /<meta\s+property=["']og:type["'][^>]*>/i,
    `<meta property="og:type" content="${m.ogType}" />`,
  )
  // twitter title/desc
  out = out.replace(
    /<meta\s+name=["']twitter:title["'][^>]*>/i,
    `<meta name="twitter:title" content="${m.title}">`,
  )
  out = out.replace(
    /<meta\s+name=["']twitter:description["'][^>]*>/i,
    `<meta name="twitter:description" content="${m.desc}">`,
  )

  // article:published_time for blog posts
  if (m.publishedTime) {
    out = out.replace(
      /<\/head>/i,
      `  <meta property="article:published_time" content="${m.publishedTime}" />\n  </head>`,
    )
  }

  // noindex for gated/utility routes
  if (m.noindex) {
    out = out.replace(
      /<\/head>/i,
      `  <meta name="robots" content="noindex, nofollow" />\n  </head>`,
    )
  }

  // Swap the FCP fallback H1/paragraph so crawlers see real content.
  // The shell ships a generic "Loading…" block; replace with route-specific text.
  out = out.replace(
    /<h1[^>]*>[\s\S]*?<\/h1>\s*<p[^>]*>[\s\S]*?<\/p>/,
    `<h1 style="font-size:2rem;margin:0 0 12px;font-weight:700">${m.title}</h1>\n          <p style="margin:0;opacity:.7;font-size:1rem">${m.desc}</p>`,
  )

  return out
}

function writeRoute(route: RouteMeta, html: string) {
  const cleanPath = route.path === "/" ? "/" : route.path
  const outDir = cleanPath === "/" ? DIST : join(DIST, cleanPath)
  mkdirSync(outDir, { recursive: true })
  const outPath = join(outDir, "index.html")
  writeFileSync(outPath, html)
}

let count = 0
for (const route of routes) {
  const html = rewriteShell(shell, route)
  writeRoute(route, html)
  count++
}

// 404.html — many static hosts serve this for unknown paths.
const notFound: RouteMeta = {
  path: "/404",
  title: "Page not found — SiteScoper",
  description: "The page you were looking for doesn't exist on SiteScoper.",
  noindex: true,
}
writeFileSync(join(DIST, "404.html"), rewriteShell(shell, notFound))
count++

console.log(`[prerender] wrote ${count} per-route HTML files into dist/`)