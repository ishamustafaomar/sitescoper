# Roadmap — Organic search growth (Sep 21, 2026)

Diagnosis: indexed but invisible. 258 impressions / 0 clicks last 28 days, only query is a competitor brand. 1 organic keyword in Semrush. Blog bodies are not server-rendered (103 words in HTML), 12 of 18 posts missing from sitemap, 6 posts are ~150 words (thin), homepage claims fake proof numbers.

## In progress
- [ ] Server-render blog posts + blog index (full body in HTML)
- [ ] Dynamic sitemap (router-derived + all published posts, real lastmod)
- [ ] Blog schema: updated_at, status, faq, category; richer markdown (tables, numbered lists, quotes, code, TOC, FAQ schema)
- [ ] Rewrite the 6 thin posts into full guides targeting winnable keywords
- [ ] Remove fabricated proof claims ("2,400+ sites this month")
- [ ] New landing pages: /ux-audit, /cro-audit, /landing-page-audit, /seo-audit-report (embedded URL input, FAQ schema)
- [ ] Free tools: /tools/open-graph-checker, /tools/llms-txt-generator (+ /tools hub)
- [ ] New long-form posts: how to do a website audit, what is a UX audit, CRO audit checklist, SEO audit checklist, what is llms.txt, Open Graph tags guide
- [ ] SEO autopilot cron (weekly): topic queue -> long-form post with quality gates -> IndexNow ping; refresh thin posts when queue empty; replace dead daily-blog-post job
- [ ] IndexNow key + ping helper
- [ ] Internal linking: footer Tools/Guides columns, related posts, breadcrumbs, contextual links
- [ ] Author/E-E-A-T: /about page, Person schema, author byline
- [ ] Verify SSR output, build, Playwright; publish

## Ready (next)
- [ ] Locale-prefixed marketing pages (/es, /de, ...) with hreflang
- [ ] Score badge embed (backlink loop) on reports
- [ ] Resubmit sitemap in Search Console after publish; re-check GSC in 2 weeks
- [ ] Directory listings kit (Product Hunt, AlternativeTo, SaaSHub, G2) — needs user accounts
