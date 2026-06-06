// Runs before vite dev and vite build; writes public/sitemap.xml.

import { writeFileSync } from "fs"
import { resolve } from "path"

const BASE_URL = "https://sitescoper.com"

// Blog post slugs — keep in sync with src/content/blog.ts. The sitemap
// generator runs in a Node context before Vite, so we list slugs here
// rather than importing the TS module (which would need a TS loader).
const blogSlugs = [
  "how-to-audit-a-website-for-seo",
  "ai-website-audit-vs-traditional-seo-tools",
  "core-web-vitals-explained-for-founders",
  "free-website-audit-checklist",
  "small-business-seo-guide",
  "white-label-seo-reports-for-agencies",
]

interface SitemapEntry {
  path: string
  lastmod?: string
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"
  priority?: string
}

const entries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/pricing", changefreq: "weekly", priority: "0.8" },
  { path: "/ai-website-audit-tool", changefreq: "monthly", priority: "0.9" },
  { path: "/white-label-seo-reports", changefreq: "monthly", priority: "0.9" },
  { path: "/blog", changefreq: "weekly", priority: "0.8" },
  ...blogSlugs.map((slug) => ({
    path: `/blog/${slug}`,
    changefreq: "monthly" as const,
    priority: "0.7",
  })),
  { path: "/compare", changefreq: "monthly", priority: "0.7" },
  { path: "/auth", changefreq: "monthly", priority: "0.5" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
  // Authenticated app routes — listed for crawl discovery; pages themselves
  // carry <meta name="robots" content="noindex"> so they won't be indexed.
  { path: "/dashboard", changefreq: "weekly", priority: "0.4" },
  { path: "/onboarding", changefreq: "yearly", priority: "0.2" },
  { path: "/checkout/return", changefreq: "yearly", priority: "0.1" },
  // Dynamic routes (/share/:token, /analysis/:id) are per-user and gated;
  // omitted intentionally — they shouldn't be in a public sitemap.
]

function generateSitemap(entries: SitemapEntry[]) {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  )

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n")
}

writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries))
console.log(`sitemap.xml written (${entries.length} entries)`)
