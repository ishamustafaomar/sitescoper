// Editorial landing pages for specific search intents. English-only by
// design, like the blog: they exist to be found by people searching for
// these exact phrases. Bodies use the same markdown subset as blog posts.

export interface LandingPageContent {
  path: string;
  title: string; // <title>
  description: string; // meta description
  breadcrumb: string;
  eyebrow: string;
  h1: string;
  intro: string;
  bullets: string[];
  /** Optional custom focus handed to the audit engine. */
  focus?: string;
  body: string;
  faq: Array<{ q: string; a: string }>;
  ctaTitle: string;
  ctaBody: string;
  related: Array<{ label: string; path: string }>;
}

export const landingPages: Record<string, LandingPageContent> = {
  "ux-audit": {
    path: "/ux-audit",
    title: "Free Website UX Audit Tool — Find What Confuses Visitors | SiteScoper",
    description:
      "Run a UX audit of any website in 60 seconds. SiteScoper reads your pages like a first-time visitor and returns the usability, clarity and trust issues costing you conversions, ranked by impact.",
    breadcrumb: "UX audit",
    eyebrow: "Website UX audit",
    h1: "UX audit tool: see your website the way a first-time visitor does",
    intro:
      "Paste a URL and get a prioritised UX audit: unclear headlines, confusing navigation, weak calls to action, trust gaps and mobile friction — each with a plain-English fix. No account needed for your first audit.",
    bullets: [
      "Clarity check: can a stranger tell what you do in five seconds?",
      "Navigation, forms and CTA friction, page by page",
      "Trust and credibility signals visitors look for before they act",
      "Mobile layout, tap targets and reading order",
      "Every finding ranked by impact and effort, so you know what to ship first",
      "Ask follow-up questions about your own report",
    ],
    focus: "Focus on user experience: clarity, navigation, forms, calls to action, trust signals and mobile usability.",
    body: `## What a UX audit actually checks

A UX audit is a structured review of how easily real people can understand and use your website. It is not a redesign and it is not a Lighthouse score. A good audit answers four questions about every important page:

1. **Comprehension** — does a first-time visitor understand what this is, who it is for and why it matters within a few seconds?
2. **Orientation** — can they tell where they are, where to go next and how to get back?
3. **Action** — is the next step obvious, low-friction and worth taking?
4. **Trust** — is there enough evidence (proof, clarity, professionalism) for them to act?

Most agencies deliver this as a 40-page slide deck after two weeks. SiteScoper runs the same review in about a minute by crawling up to eight of your most important pages, rendering them like a visitor would, and asking frontier AI models to evaluate them against a rubric a senior product designer would use. The result is a scored report with the three to five fixes that matter most, not a wall of nitpicks.

## How the SiteScoper UX audit works

- **Crawl and render.** We load your homepage and follow the links a visitor is most likely to click (pricing, features, signup, contact) — up to eight pages.
- **Read like a human.** The audit uses the actual copy, layout and screenshots, so it catches problems crawlers miss: a headline that describes features instead of outcomes, a pricing table with no anchor, a form asking for a phone number nobody wants to give.
- **Score and rank.** Each category (clarity, navigation, conversion path, trust, mobile, accessibility) gets a 0–100 score. Findings are ranked by expected impact so the report reads as a to-do list.
- **Explain the fix.** Every finding comes with a concrete recommendation, and often a rewrite you can paste in. You can chat with the report to ask "why" or "show me an example".

## The UX problems we see most often

Across the sites audited with SiteScoper, the same handful of issues come up again and again:

| Issue | Why it hurts | Typical fix |
|---|---|---|
| Headline describes the product, not the outcome | Visitors cannot map it to their problem | Lead with the result, follow with the how |
| Primary CTA competes with two or three secondary buttons | Choice paralysis above the fold | One primary action per screen |
| Proof is buried below the fold or missing entirely | No reason to believe the claims | Put one specific proof point next to the CTA |
| Pricing page hides the price | Reads as "expensive" or "enterprise" | Show numbers, anchor the recommended plan |
| Forms ask for more than the step needs | Drop-off at the last mile | Ask only for what you will use today |
| Mobile navigation hides key pages | Most traffic never finds them | Surface the two links that convert |

None of these show up in a performance report. All of them cost conversions.

## UX audit vs. usability testing vs. heuristic review

- **Usability testing** watches real users complete tasks. It is the gold standard and the most expensive. Do it after you have fixed the obvious problems, otherwise you pay people to find things an audit would have caught.
- **Heuristic review** is an expert walking through the site against a checklist (Nielsen's ten heuristics are the classic). Quality depends entirely on the reviewer.
- **An AI UX audit** is a fast, consistent heuristic review that also reads your copy. It is the right first step for a founder or small team: cheap enough to run on every release, opinionated enough to be useful.

## When to run a UX audit

- Before a launch, to catch what you have stopped seeing
- When traffic is fine but signups or sales are flat
- After a redesign, to check nothing important got lost
- Before paying for ads, so you do not send traffic into a leaky page
- Quarterly, as a habit — Pro users can also [watch pages for changes](/monitoring) automatically

## What you get in the report

A UX score, a per-category breakdown, a ranked action plan, side-by-side "before and after" copy suggestions, and a chat panel that knows your report. Pro users can export a branded PDF and compare two sites — useful for benchmarking against a competitor or presenting to a client. Read more about [how we score websites](/website-audit-statistics) or see the [complete list of audit categories](/ai-website-audit-tool).`,
    faq: [
      {
        q: "Is the UX audit really free?",
        a: "Yes. Your first audit needs no account. A free account gives you three audits a month; Pro is unlimited and adds PDF export, competitor compare and weekly site watching.",
      },
      {
        q: "How long does a UX audit take?",
        a: "About 60 seconds for the crawl and analysis of up to eight pages. A manual agency UX audit typically takes one to three weeks.",
      },
      {
        q: "Does it work on web apps behind a login?",
        a: "The audit covers publicly reachable pages: marketing site, pricing, docs, blog and signup flow. Logged-in screens are not crawled.",
      },
      {
        q: "What is the difference between a UX audit and a CRO audit?",
        a: "A UX audit looks at usability and comprehension across the whole site. A CRO audit focuses on the specific path to a conversion — signup, purchase, lead form — and the friction along it. SiteScoper covers both; the CRO audit page explains the differences.",
      },
      {
        q: "Can I audit a competitor's site?",
        a: "Yes, any public URL. Pro users can compare two sites side by side to see where a competitor's experience is stronger.",
      },
    ],
    ctaTitle: "Audit your website's UX now",
    ctaBody: "Paste any URL. You will have a scored, prioritised UX report in about a minute — no account required for the first one.",
    related: [
      { label: "What is a UX audit? A plain-English DIY guide", path: "/blog/what-is-a-ux-audit-a-plain-english-diy-guide" },
      { label: "CRO audit: find the leaks in your conversion path", path: "/cro-audit" },
      { label: "Landing page audit", path: "/landing-page-audit" },
      { label: "How to do a website audit (step by step)", path: "/blog/how-to-audit-a-website-for-seo" },
    ],
  },

  "cro-audit": {
    path: "/cro-audit",
    title: "CRO Audit Tool — Find Conversion Leaks in 60 Seconds | SiteScoper",
    description:
      "Free conversion rate optimization audit. SiteScoper walks your signup or checkout path like a real visitor and returns the friction, messaging and trust problems that are costing you conversions — ranked by impact.",
    breadcrumb: "CRO audit",
    eyebrow: "Conversion rate optimization audit",
    h1: "CRO audit: find out exactly where your visitors stop",
    intro:
      "A conversion rate optimization audit looks at the path from landing to action and asks, at every step, why someone would leave. SiteScoper runs that audit automatically on your homepage, pricing and signup pages and hands you a ranked list of fixes.",
    bullets: [
      "Above-the-fold clarity: value proposition, primary CTA, proof",
      "Pricing page structure, anchoring and objection handling",
      "Signup and checkout friction, form fields and copy",
      "Trust signals: testimonials, guarantees, security cues",
      "Copy rewrites you can paste in, with the reasoning",
      "Benchmarks against similar sites in your category",
    ],
    focus: "Focus on conversion: value proposition, primary call to action, pricing page, signup or checkout friction, objections and trust signals.",
    body: `## What a CRO audit is (and is not)

Conversion rate optimization is the practice of getting more of your existing visitors to take the action you want — start a trial, buy, book a call. A **CRO audit** is the diagnostic step: a systematic review of your conversion path to find where and why people drop off, before you spend money on testing or traffic.

It is not an A/B test. Tests tell you which of two versions wins; an audit tells you what is worth testing in the first place. On a site with modest traffic, an audit is usually the only CRO work that pays back quickly, because most sites do not have the volume to reach significance on more than a handful of tests a year.

## The five layers of a conversion audit

### 1. Message match

Does the page say what the visitor expected when they clicked? Ads, search snippets and social posts set an expectation; the headline has to pay it off in the first line. The most common leak we find is a homepage that talks about the company while the visitor is looking for a solution to their problem.

### 2. Value proposition and proof

Within one screen a visitor should be able to answer: what is it, who is it for, why is it better, and why should I believe you? Proof does not have to be logos — a specific number, a short quote, or a screenshot of the product doing the thing is often stronger than a row of grey logos.

### 3. Call-to-action design

One primary action per screen, phrased as the outcome ("Get my audit") rather than the mechanism ("Submit"). Secondary actions should look secondary. If the button is below the fold on mobile, most visitors never see it.

### 4. Friction in the path

Every field, click and page between intent and completion is a place to lose someone. Audit the signup and checkout as a sequence: how many steps, what is asked when, what happens on error, is the price still visible at the last step, is there a reason to trust the form with a card number?

### 5. Objections and trust

List the reasons someone would hesitate — price, switching cost, "will it work for me", data safety — and check whether the page answers each one close to the moment it arises. Pricing FAQs, guarantees and comparison tables exist to do this job.

## How SiteScoper runs the audit

We crawl your homepage plus the pages on the conversion path (pricing, features, signup, contact — up to eight), capture screenshots, and evaluate each page against the five layers above. The model reads your actual copy, so it can tell you that the headline is feature-led, that the pricing page never names the recommended plan, or that the signup form asks for a company size before it has earned it.

The output is a scored report with a ranked action plan. Each item names the page, the problem, the expected impact and a concrete fix — often with rewritten copy. You can ask the report follow-up questions, and Pro users can compare their conversion path against a competitor's side by side.

## A lean CRO audit you can do yourself in an hour

If you would rather do it by hand first, this is the sequence that finds the most in the least time:

1. Open your homepage on a phone in a private window. Read only the first screen. Write down what you think the product does. Compare with reality.
2. Count the clickable elements above the fold. If the primary action is not visually dominant, fix that first.
3. Walk the signup or checkout with a stopwatch. Note every field and every moment of doubt.
4. Open your pricing page and try to choose a plan in ten seconds. If you cannot, neither can a visitor.
5. Read every testimonial. Delete the ones that could be about any product.
6. Search the page for your competitors' names. If they are absent, your visitors are comparing you somewhere else.

Our [free website audit checklist](/blog/free-website-audit-checklist) expands this into 24 checks you can run by hand.

## What to do with the findings

Sort by impact, not by ease. Ship the top three, wait two weeks, look at the numbers, run the audit again. Pro users can have SiteScoper [watch the page](/monitoring) and get an email digest when something changes — useful when several people ship to the same site.`,
    faq: [
      {
        q: "How is a CRO audit different from an SEO audit?",
        a: "An SEO audit asks whether people can find the page; a CRO audit asks what they do once they arrive. SiteScoper runs both in the same report, with separate scores, because a page that ranks but does not convert is not doing its job.",
      },
      {
        q: "Do I need traffic data or analytics access?",
        a: "No. The audit works from the public pages alone. If you know your funnel numbers, add them as a custom focus and the report will weight its recommendations accordingly.",
      },
      {
        q: "Does the audit cover ecommerce checkouts?",
        a: "It covers every publicly reachable page — product, category, cart and the first checkout step. Steps that require an account or a real payment are not crawled.",
      },
      {
        q: "How much does a CRO audit cost?",
        a: "Your first SiteScoper audit is free with no account. Agencies typically charge $1,500–$10,000 for a manual CRO audit; the value of that work is largely in the interpretation, which is what the AI report gives you in a minute.",
      },
    ],
    ctaTitle: "Run a free CRO audit on your site",
    ctaBody: "Paste your homepage URL. We follow the conversion path from there and rank what is costing you signups or sales.",
    related: [
      { label: "Free website audit checklist: 24 checks you can run", path: "/blog/free-website-audit-checklist" },
      { label: "UX audit tool", path: "/ux-audit" },
      { label: "Landing page audit", path: "/landing-page-audit" },
      { label: "Pricing page and plan structure", path: "/pricing" },
    ],
  },

  "landing-page-audit": {
    path: "/landing-page-audit",
    title: "Free Landing Page Audit — Score Your Page Before You Send Traffic | SiteScoper",
    description:
      "Audit any landing page in 60 seconds: headline, offer, proof, CTA, speed and SEO. SiteScoper scores the page like a conversion strategist and tells you what to fix before you spend on ads.",
    breadcrumb: "Landing page audit",
    eyebrow: "Landing page audit",
    h1: "Landing page audit: know what is wrong before you pay for the traffic",
    intro:
      "A landing page has one job. This audit checks whether yours does it — message, offer, proof, call to action, speed and search visibility — and ranks the fixes by how much they are likely to move conversions.",
    bullets: [
      "Headline and sub-headline clarity, scored from a visitor's point of view",
      "Offer, urgency and objection handling",
      "Proof placement: testimonials, numbers, logos, screenshots",
      "Single-CTA discipline and form friction",
      "Page speed and mobile rendering",
      "Meta tags, Open Graph and indexability for organic traffic",
    ],
    focus: "This is a landing page. Focus on headline clarity, offer, proof, the primary call to action, form friction, mobile rendering and page speed.",
    body: `## Why landing pages fail

Most landing pages do not fail because of design. They fail because the visitor cannot answer three questions fast enough: what is this, is it for me, and what do I do next. Everything else — colours, animations, the length of the page — matters far less than those three answers appearing in the first screen.

The second most common failure is a mismatch between the promise that brought the visitor (an ad, a search result, a post) and what the page says. A visitor who clicked "free website audit" and lands on a page about "enterprise digital experience platforms" leaves in under three seconds. That bounce is invisible in most reports and expensive in every one of them.

## What the landing page audit checks

### Message

- Is the headline a promise the visitor cares about, in their words?
- Does the sub-headline explain how, without repeating the headline?
- Is there one idea per section, in the order a sceptical visitor would ask about it?

### Offer

- Is it clear what you get, what it costs (or that it is free) and what happens next?
- Are the obvious objections — price, time, risk, "will it work for me" — answered near the CTA?
- Is any urgency real? Fake countdowns lower trust more than they raise conversions.

### Proof

- Is there at least one specific piece of evidence within the first screen?
- Are testimonials specific (a name, a result, a context) or generic praise?
- Do numbers have a source?

### Call to action

- One primary action, visually dominant, phrased as the outcome.
- Repeated at natural decision points, not every 300 pixels.
- Form fields limited to what this step needs. Every extra field costs completions.

### Speed and mobile

- Largest Contentful Paint under 2.5 seconds on a mid-range phone.
- No layout shift as fonts, images and embeds load.
- Tap targets large enough, text readable without zooming.

### Search visibility

Even paid landing pages get organic traffic if they are indexable. The audit checks the title tag, meta description, canonical, Open Graph tags (for when the link is shared) and whether the page is accidentally set to noindex. Use the free [Open Graph checker](/tools/open-graph-checker) if you only want to check the share preview.

## How the audit is scored

SiteScoper renders the page, captures a screenshot, reads the copy and evaluates it against the checks above. Each area receives a 0–100 score and the findings are ranked into an action plan. Where the fix is copy, the report proposes a rewrite. Where the fix is structural — move the proof up, remove the second CTA — it explains why.

Because the audit uses the real page rather than a template, it works on any builder: Webflow, Framer, Unbounce, WordPress, Shopify, custom code. If it renders in a browser, it can be audited.

## Landing page audit checklist (short version)

1. The headline states the outcome, not the feature.
2. A stranger can explain the offer after five seconds.
3. One primary CTA above the fold, phrased as the outcome.
4. One specific proof point in the first screen.
5. Objections answered next to the CTA, not in a footer FAQ.
6. Form asks for the minimum.
7. Loads in under 2.5 seconds on mobile.
8. Title, description and Open Graph tags are set and match the page.

For the full version see our [landing page checklist](/blog/free-website-audit-checklist) and the [CRO audit guide](/cro-audit).`,
    faq: [
      {
        q: "Can I audit a page that is not live yet?",
        a: "The page needs a public URL. A staging URL works as long as it is reachable without a password.",
      },
      {
        q: "Does it audit only one page?",
        a: "By default the audit follows the links a visitor would click, up to eight pages. For a standalone landing page that usually means the page itself plus the pricing or signup page it links to.",
      },
      {
        q: "Will it help with Google Ads Quality Score?",
        a: "Landing page experience is one of the three Quality Score components. The audit covers the factors Google names — relevance, transparency and navigability — plus speed and mobile rendering.",
      },
      {
        q: "How often should I audit a landing page?",
        a: "Before launch, after any significant copy or design change, and whenever conversion drops without a traffic change. Pro users can have pages watched automatically and receive a digest when something changes.",
      },
    ],
    ctaTitle: "Audit your landing page now",
    ctaBody: "Paste the URL. In about a minute you will know whether the page is ready for traffic and what to fix if it is not.",
    related: [
      { label: "CRO audit", path: "/cro-audit" },
      { label: "UX audit", path: "/ux-audit" },
      { label: "Open Graph & meta tag checker", path: "/tools/open-graph-checker" },
      { label: "Website audit checklist", path: "/blog/free-website-audit-checklist" },
    ],
  },

  "seo-audit-report": {
    path: "/seo-audit-report",
    title: "Instant SEO Audit Report — Free, Prioritised, Shareable | SiteScoper",
    description:
      "Get an SEO audit report for any website in 60 seconds. Technical checks, on-page issues, content quality and Core Web Vitals in one prioritised report you can share or export as a PDF.",
    breadcrumb: "SEO audit report",
    eyebrow: "SEO audit report",
    h1: "SEO audit report: everything that is holding your pages back, in one prioritised document",
    intro:
      "Paste a URL and get an SEO audit report that a developer can act on the same day: crawlability, indexability, titles and descriptions, headings, internal links, structured data, speed and content quality — scored, ranked and explained.",
    bullets: [
      "Technical SEO: robots, sitemap, canonicals, noindex, redirects, status codes",
      "On-page: title and description length, H1 structure, duplicate metadata",
      "Content: thin pages, keyword focus, readability, internal linking",
      "Core Web Vitals signals and render-blocking assets",
      "Structured data and Open Graph completeness",
      "Shareable link, PDF export and white-label branding for agencies (Pro)",
    ],
    focus: "Focus on SEO: technical crawlability, indexability, on-page metadata, heading structure, internal linking, structured data, content quality and page speed.",
    body: `## What a good SEO audit report contains

An SEO audit report should let someone who did not run the audit fix the site. That means each finding needs four things: **where** it is (URL), **what** is wrong, **why** it matters, and **what to do**. Reports that list 400 warnings without priority are not audits; they are crawler exports.

SiteScoper's report is organised the way a developer or marketer works through it:

1. **Overall score and summary** — one paragraph a stakeholder can read.
2. **Action plan** — the ranked list of fixes, each with impact and effort.
3. **Technical checks** — pass/fail rows for robots.txt, sitemap, canonical tags, noindex, HTTPS, redirects, status codes and mobile viewport.
4. **On-page** — title and description per page with lengths, H1 presence and uniqueness, image alt coverage, internal link counts.
5. **Content quality** — whether each page answers a clear question, how it compares with what ranks, and where it is thin.
6. **Performance** — the Core Web Vitals signals visible from the page: render-blocking scripts, oversized images, missing dimensions, font loading.
7. **Structured data and sharing** — JSON-LD types present, Open Graph and Twitter tags, share image size.

## Technical SEO checks in the report

| Check | What we look for | Why it matters |
|---|---|---|
| robots.txt | Reachable, does not block important paths | A stray Disallow hides the whole site |
| XML sitemap | Present, valid, lists indexable URLs | Discovery for new and deep pages |
| Canonical | Self-referencing on every indexable page | Prevents duplicate-content dilution |
| Robots meta | No accidental noindex | The most common "why am I not ranking" |
| Status codes | 200 on important pages, no soft 404s | Errors waste crawl budget |
| HTTPS and redirects | One version of every URL | Splits authority otherwise |
| Viewport and mobile rendering | Mobile-first indexing | Google indexes the phone version |

## On-page SEO in the report

For every crawled page the report lists the title (with character count), the meta description, the H1, the number of H2s, image alt coverage and internal links in and out. Duplicates across pages are flagged, because two pages with the same title compete with each other. Where a title is missing or weak, the report suggests one that fits the page's evident topic.

## Content quality — the part crawlers cannot do

Traditional SEO tools count words. SiteScoper reads them. The content section asks whether a page would satisfy the visitor who searched for it: does it answer the question directly, does it show experience, is it more useful than what already ranks, is it padded. This is the section that changes rankings, because Google's ranking systems increasingly reward exactly those qualities.

## Sharing, exporting and white-label reports

Every report has a share link. Pro users can export a PDF and, for agencies, brand it with their own logo — see [white-label SEO reports](/white-label-seo-reports). Compare two sites side by side to benchmark a client against a competitor, and use [site watching](/monitoring) to get notified when a client's pages change.

## How to read an SEO audit report in ten minutes

1. Read the summary and the top five actions. That is 80% of the value.
2. Check the technical section for any red rows. Fix those first; they block everything else.
3. Skim the on-page table for missing or duplicate titles.
4. Read the content findings for your three most important pages.
5. Put the rest in a backlog. Re-run the audit after shipping.

If you want to do this by hand first, follow our [step-by-step website audit guide](/blog/how-to-audit-a-website-for-seo) or the [website audit checklist](/blog/free-website-audit-checklist).`,
    faq: [
      {
        q: "How is this different from Google Search Console?",
        a: "Search Console tells you how Google sees pages it already knows about. The audit report tells you what to change on the page. Use both: the audit finds and explains issues, Search Console confirms Google noticed the fix.",
      },
      {
        q: "How many pages does the report cover?",
        a: "Up to eight per audit, chosen by following the links a visitor would take from the URL you enter. That is enough to find site-wide patterns; run additional audits on specific sections if you need more.",
      },
      {
        q: "Can I white-label the report for clients?",
        a: "Yes. Pro includes PDF export and white-label branding with your logo. See the white-label SEO reports page for details.",
      },
      {
        q: "Does the report include backlinks or rankings?",
        a: "No. The report covers what is on the site itself — technical, on-page, content and performance. Rankings and backlinks need a tool with an index of the web; the report tells you what to fix so those investments pay off.",
      },
      {
        q: "Is the SEO audit report free?",
        a: "The first audit needs no account. Free accounts get three audits a month. Pro is $19 a month or $180 a year with a 7-day free trial.",
      },
    ],
    ctaTitle: "Get your SEO audit report",
    ctaBody: "Paste any URL. In about a minute you will have a scored, prioritised report you can share with your developer or client.",
    related: [
      { label: "How to do a website audit (step by step)", path: "/blog/how-to-audit-a-website-for-seo" },
      { label: "Website audit checklist", path: "/blog/free-website-audit-checklist" },
      { label: "White-label SEO reports for agencies", path: "/white-label-seo-reports" },
      { label: "Best AI website audit tools compared", path: "/best-ai-website-audit-tools" },
    ],
  },
};

export const landingPageSlugs = Object.keys(landingPages) as Array<keyof typeof landingPages>;
