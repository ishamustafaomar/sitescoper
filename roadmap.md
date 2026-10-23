# Roadmap — Organic search growth (Sep 21, 2026)

## Google Ads connection (Oct 23, 2026)
- [x] Linked the existing Google connection and confirmed the SiteScoper ad account (USD, America/New_York) is selected and ready to create campaigns; billing not yet active in Google Ads.
- [ ] Uneed directory: free-queue rejection received Oct 22 (saturated category); advised skipping the $39.99 paid queue. Awaiting owner decision.

## First-party marketing attribution (Oct 17, 2026)
- [x] Add private visit records, landing attribution, signup profile fields, and admin-only daily/weekly summaries without changing existing flows.
- [x] Seven attribution tests passed; deployed and verified live test/test visits (one row per path) and test signup profile values with landing page /. Signed-out signup writes return 401; summaries enforce admin checks in both server function and database. Test account retained as Attribution QA Test.

## Analytics assistant (Oct 16, 2026)
- [ ] Add account-owned threaded Analytics chats with real report research and promotional-image handoff; verify two saved conversations.
- [x] Auto model routing (image→ChatGPT, code/copy→Claude, quick→Gemini) with manual override; verified typecheck.
- [x] Homepage promo section for the assistant in 9 locales; browser-verified.
- [x] Motion-graphics promo video for the assistant (30s, 1920×1080, /mnt/documents/videos/sitescoper-analytics-assistant-promo.mp4); chat and editor shots are mock-ups, not screen recordings.
- [ ] Verify official muse.ai connection capabilities and connect only a supported endpoint; posting remains blocked until the service exposes a suitable connection.

## Image creation and separate outreach (Oct 16, 2026)
- [x] Image submission now focuses missing required name/headline fields and shows the localized missing-photo error; verified on a signed-in saved report, 2 prompt tests passed, build OK. No new paid generation request was needed.
- [x] Outreach sender and feedback/testimonial campaign CANCELLED by the owner on Oct 16, 2026 — no address created, no emails sent. Existing Mailgun sandbox and inactive Brevo credentials left untouched; notify.sitescoper.com sign-in email unchanged.

## Website promotional images (Oct 15, 2026)
- [x] Replace score cards with website-grounded AI social ads, real source uploads, editable wording and square/story downloads; verified signed-in square generation at 1280/375/390/768px without publishing. Story generation and remote-photo availability remain unverified.

## Preview UI refinement (Oct 15, 2026)
- [x] Refine shared controls, homepage rhythm, dashboard accessibility and report hierarchy; preserve all flows and nine-language copy.
- [x] Apply bounded Compare/Pricing presentation fixes and verify desktop/mobile in two QA rounds; preview only, not published.
- [ ] Separately resolve the existing stored-language hydration warning; requires an out-of-scope internationalization initialization change.

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

## Compare search page (Oct 13, 2026)
- [x] Add public SEO explanation, clearly illustrative comparison and FAQs in all nine languages; preserve paid comparison access.
- [x] Include Compare in search metadata and sitemap; verify public page and sign-in return link.

## Website roast comparison (Oct 13, 2026)
- [x] Create a sourced public comparison of SiteScoper, RoastFast, PageRoast and Roast My Web in nine languages; verify public rendering and links.
