# Roadmap — Organic search growth (Sep 21, 2026)

Diagnosis (start of run): indexed but invisible. 258 impressions / 0 clicks last 28 days, only query was a competitor brand. 1 organic keyword in Semrush. Blog bodies were not server-rendered, 12 of 18 posts missing from sitemap, 6 posts were ~150 words, homepage claimed fake proof numbers.

## Done this run
- [x] Server-render blog posts + blog index (full body in HTML)
- [x] Dynamic sitemap (router-derived + all published posts, real lastmod); removed the stale static generator that overrode it
- [x] Blog schema: updated_at, status, faq, category, author, source; richer markdown
- [x] Rewrote thin legacy posts into full guides (1,800–2,000 words each)
- [x] Removed fabricated proof claims
- [x] Landing pages: /ux-audit, /cro-audit, /landing-page-audit, /seo-audit-report
- [x] Free tools: /tools/open-graph-checker, /tools/llms-txt-generator, /tools hub
- [x] New long-form posts: open graph tags guide, what is llms.txt, what is a UX audit (autopilot)
- [x] SEO autopilot (Tue/Fri 05:30 UTC): topic queue -> quality-gated long-form post -> IndexNow; refreshes thin posts when the queue is empty; 402/403 circuit breaker pauses the job
- [x] IndexNow key + ping helper
- [x] Internal linking: crawlable header links, footer Product/Audits/Tools/Resources columns, related posts, breadcrumbs, author byline -> /about
- [x] /about page (methodology, limitations, editorial policy) + Organization/AboutPage schema
- [x] Mobile header fits at 360–390px (icon-only sign-in, no logo collapse)
- [x] Verified SSR output, typecheck, build, Playwright

## Blocked on user
- [ ] Publish so Google can crawl the new pages, sitemap and metadata (only the user can publish)

## Ready (next)
- [ ] After publish: resubmit sitemap in Search Console; re-check impressions/queries in 2 weeks
- [ ] Locale-prefixed marketing pages (/es, /de, ...) with hreflang
- [ ] Score badge embed on shared reports (earns backlinks)
- [ ] Remaining topic queue: cro audit checklist, website design audit, ux audit template, technical seo audit (autopilot will publish these twice weekly)
- [ ] Directory listings kit (Product Hunt, AlternativeTo, SaaSHub, G2) — needs user accounts
