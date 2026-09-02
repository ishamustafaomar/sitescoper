// Runs before vite dev and vite build; writes public/sitemap.xml.

import { writeFileSync } from "fs"
import { resolve } from "path"

const BASE_URL = "https://sitescoper.com"
const TODAY = new Date().toISOString().slice(0, 10)

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
  { path: "/", lastmod: TODAY, changefreq: "weekly", priority: "1.0" },
  { path: "/pricing", lastmod: TODAY, changefreq: "weekly", priority: "0.8" },
  { path: "/ai-website-audit-tool", lastmod: TODAY, changefreq: "monthly", priority: "0.9" },
  { path: "/white-label-seo-reports", lastmod: TODAY, changefreq: "monthly", priority: "0.9" },
  { path: "/blog", lastmod: TODAY, changefreq: "weekly", priority: "0.8" },
  ...blogSlugs.map((slug) => ({
    path: `/blog/${slug}`,
    lastmod: TODAY,
    changefreq: "monthly" as const,
    priority: "0.7",
  })),
  { path: "/best-ai-website-audit-tools", lastmod: TODAY, changefreq: "monthly", priority: "0.9" },
  { path: "/website-audit-statistics", lastmod: TODAY, changefreq: "monthly", priority: "0.9" },
  { path: "/compare", lastmod: TODAY, changefreq: "monthly", priority: "0.7" },
  { path: "/auth", lastmod: TODAY, changefreq: "monthly", priority: "0.5" },
  { path: "/privacy", lastmod: TODAY, changefreq: "yearly", priority: "0.3" },
  { path: "/terms", lastmod: TODAY, changefreq: "yearly", priority: "0.3" },
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
