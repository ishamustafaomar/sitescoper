// Blog post catalogue. Body uses a minimal markdown subset rendered in
// BlogPost.tsx (## h2, ### h3, blank-line paragraphs, "- " bullet items,
// [text](url) links, **bold**). Edit titles/descriptions to tune SEO.

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  keyword: string;
  date: string;
  readingTime: string;
  body: string;
}

export const posts: BlogPost[] = [
  {
    slug: "how-to-audit-a-website-for-seo",
    title: "How to Audit a Website for SEO in 2026 (Step-by-Step)",
    description:
      "A practical, founder-friendly website SEO audit you can run in 30 minutes — covering technical SEO, on-page, content, and Core Web Vitals.",
    keyword: "how to audit a website for seo",
    date: "2026-05-12",
    readingTime: "9 min",
    body: `Most SEO audit guides are written for agencies running quarterly retainers. This one is for the founder who wants a clear, prioritised list of fixes before lunch.

## Why most website audits fail

The typical SEO audit produces an 80-page PDF, a colour-coded spreadsheet, and zero shipped changes. The reason is simple: the report is built for the auditor, not the person who has to fix it. A useful audit answers three questions and nothing else — what is broken, what does it cost me, and what do I ship first.

## The 5-layer website audit

### 1. Technical SEO
Check that Google can actually crawl, render and index your pages. The non-negotiables: a valid robots.txt, a clean sitemap.xml, no accidental noindex tags, HTTPS everywhere, a single canonical per URL, and a 200 status code on every page that matters.

### 2. On-page SEO
Every indexable page needs a unique title under 60 characters, a meta description under 160, a single H1, and headings that describe the content (not "Welcome"). Internal links should point at related pages with descriptive anchor text — "read our SEO checker guide" beats "click here" every time.

### 3. Content quality
Open the page and read it out loud. If the first sentence doesn't tell a visitor what you do, the AI doesn't know either. Google's helpful-content systems reward pages written for humans first — so does every modern LLM-powered audit tool.

### 4. Core Web Vitals
LCP under 2.5 seconds, INP under 200 ms, CLS under 0.1. Compress images, defer non-critical JS, and keep your largest hero element static.

### 5. Off-page signals
Backlinks and brand mentions. You can't fix these in an afternoon, but you can stop ignoring them — claim your Google Business Profile, get listed in two or three category directories, and ask happy customers for a review.

## Run a free audit in 60 seconds

If you'd rather not do this by hand, [SiteScoper's AI website audit tool](/ai-website-audit-tool) runs all five layers automatically and returns a prioritised list of fixes you can ship today.`,
  },
  {
    slug: "ai-website-audit-vs-traditional-seo-tools",
    title: "AI Website Audit vs. Traditional SEO Tools: Which Should You Use?",
    description:
      "AI website audit tools read your copy like a human. Traditional SEO tools crawl like a robot. Here's when to use each — and where they overlap.",
    keyword: "ai website audit vs traditional seo tools",
    date: "2026-05-19",
    readingTime: "7 min",
    body: `Semrush and Ahrefs have ruled SEO for a decade. AI-native tools like SiteScoper have shown up in the last 18 months. Which one belongs in your stack?

## What traditional SEO tools do well

Rules-based scanners are unmatched for breadth. They crawl thousands of URLs, surface every broken link, and benchmark you against the full SERP. If you run an enterprise content team, that depth is the job.

## Where AI audits pull ahead

AI tools read your page the way a human does. They flag a hero headline that doesn't say what the product actually is, a CTA that asks for too much commitment, a paragraph of jargon nobody will finish. A traditional crawler will happily mark that page "100/100" because the meta tags are technically valid.

- **Plain-English findings** instead of cryptic ranking codes
- **Copy and conversion review** alongside technical SEO
- **Prioritisation by impact**, not severity colour
- **Speed** — a single-URL report in under a minute

## Use both

The pragmatic answer for most founders: run an [AI website audit](/ai-website-audit-tool) weekly on your top pages, and use a traditional crawler quarterly when you need a site-wide sweep.`,
  },
  {
    slug: "core-web-vitals-explained-for-founders",
    title: "Core Web Vitals Explained (For Founders Who Hate Performance Jargon)",
    description:
      "LCP, INP, CLS — what they actually mean, how Google uses them in ranking, and the three fixes that move the needle for 90% of sites.",
    keyword: "core web vitals explained",
    date: "2026-04-22",
    readingTime: "6 min",
    body: `Google has been using Core Web Vitals as a ranking signal since 2021. Most founders still couldn't define them. Here's the version you actually need.

## The three metrics

- **LCP (Largest Contentful Paint)** — how long until the biggest thing on screen loads. Target: under 2.5 s.
- **INP (Interaction to Next Paint)** — how long the page takes to respond when a user taps or clicks. Target: under 200 ms.
- **CLS (Cumulative Layout Shift)** — how much the page jumps around as it loads. Target: under 0.1.

## The three fixes that move the needle

1. **Compress and lazy-load images.** Use modern formats (WebP, AVIF). Set explicit width and height so the browser reserves space and CLS stops climbing.
2. **Defer non-critical JavaScript.** Analytics, chat widgets, A/B test scripts — all of them belong below the fold or after first paint.
3. **Pre-connect to your fonts and CDN.** A single preconnect link in the head can shave hundreds of milliseconds off LCP.

Run a [free Core Web Vitals check](/) from any URL and SiteScoper will tell you which of the three is hurting you most.`,
  },
  {
    slug: "free-website-audit-checklist",
    title: "The Free Website Audit Checklist (24 Checks, No Tools Required)",
    description:
      "Open the page in a browser and run these 24 checks. No paid SEO tool needed — just a clear list of fixes you can ship this week.",
    keyword: "free website audit checklist",
    date: "2026-04-05",
    readingTime: "8 min",
    body: `You don't need a paid tool to spot the issues hurting your site the most. Open your homepage in a private window and run this list.

## Above the fold

- Does the first sentence say what you do, for whom, and what makes you different?
- Is there one clear primary CTA?
- Does the page load in under 3 seconds on 4G?
- Is the hero image compressed and lazy-loaded?

## Meta and structure

- Is the title unique and under 60 characters?
- Is the meta description present and under 160?
- Exactly one H1 per page?
- Headings describe content, not "Welcome"?
- Canonical tag points at the live URL (no trailing slash mismatch)?

## Technical SEO

- robots.txt exists and doesn't block the whole site?
- sitemap.xml exists and lists every public route?
- All images have descriptive alt text?
- No mixed-content warnings in the console?
- Schema.org JSON-LD present for Organization / Product / Article?

## Conversion

- Pricing visible without a sales call?
- Social proof above the fold (logos, testimonials, counts)?
- Forms ask for the minimum (email is usually enough)?
- Mobile tap targets at least 44x44 px?

## Trust

- Privacy policy and terms linked in the footer?
- Contact method (email, form, or chat) one click away?
- HTTPS with a valid certificate?

## Content

- Every page has at least 200 words of unique copy?
- Internal links point at related pages with descriptive anchors?
- No broken links (check the console Network tab)?
- 404 page exists and links back home?

Want this automated? [Run a free audit on SiteScoper](/) and we'll check all 24 in under a minute.`,
  },
  {
    slug: "small-business-seo-guide",
    title: "Small Business SEO: A No-Nonsense Guide for 2026",
    description:
      "Skip the jargon. This is the small business SEO playbook — local SEO, on-page basics, content cadence, and the tools that actually pay back.",
    keyword: "small business seo",
    date: "2026-03-18",
    readingTime: "10 min",
    body: `If you run a small business, SEO advice online is mostly written for either Fortune 500 marketing teams or affiliate bloggers. Neither is you. Here's the version that fits a 1-20-person company.

## Start with local

If you serve customers in a physical location or region, local SEO is your fastest win. The three things that move the needle:

- Claim and complete your Google Business Profile (photos, hours, categories, services).
- Get listed in 5-10 reputable directories for your category.
- Ask every happy customer for a Google review — politely, by name, and with a direct link.

## Then on-page

Pick the 5-10 pages a buyer would actually land on (homepage, top 3 services, pricing, about, contact) and make them excellent. Unique title, clear H1, one obvious CTA, schema markup, and copy that reads like a human wrote it.

## Content cadence beats content volume

One genuinely useful article a month, indexed and linked from your homepage, will out-rank ten thin posts published in a sprint. Pick keywords from real customer questions — the email subject lines in your inbox are a goldmine.

## The tools you actually need

- An [AI website audit tool](/ai-website-audit-tool) to flag fixes monthly
- Google Search Console (free, non-negotiable)
- A keyword research tool — Semrush, Ahrefs, or the free tier of Ubersuggest
- A simple analytics tool — Plausible, Fathom, or GA4

That's it. Add specialised tools only when you've outgrown these four.`,
  },
  {
    slug: "white-label-seo-reports-for-agencies",
    title: "White Label SEO Reports: What Clients Actually Want to See",
    description:
      "Agencies are losing retainers because their SEO reports are unreadable. Here's what to keep, what to cut, and how to white-label without looking generic.",
    keyword: "white label seo reports",
    date: "2026-02-28",
    readingTime: "7 min",
    body: `Most agency SEO reports are bloated, jargon-heavy, and built to impress a CMO who doesn't exist anymore. Today's client is a founder, a head of growth, or a marketing manager juggling three other roles. Here's what they actually want.

## Cut everything that doesn't change a decision

If a chart doesn't lead the client to a yes/no, ship/don't-ship answer, it doesn't belong in the report. That usually means cutting:

- Generic "domain authority" gauges
- 50-row keyword tables nobody scrolls through
- Screenshots of crawl errors without a recommended fix

## Keep the three slides that earn the retainer

1. **What changed this month** — rankings, traffic, conversions. One chart per metric.
2. **What we did** — three to five concrete actions, each linked to the metric they were meant to move.
3. **What we're shipping next** — the next three priorities, with effort and expected impact.

## White-label without looking white-labelled

The fastest way to look generic is to leave a tool's default styling in the export. Use a [white-label SEO reports tool](/white-label-seo-reports) that lets you set the logo, colours, and language, and then add a one-paragraph human summary at the top. Every time.`,
  },
];

export function findPost(slug: string) {
  return posts.find((p) => p.slug === slug);
}
