export interface ToolFaq {
  q: string;
  a: string;
}

export const openGraphArticle = `
## What this Open Graph checker actually tests

Most "OG preview" tools read the tags and draw a card. That misses the failures that matter in practice, so this checker goes further:

- **Fetches the share image** and reads its real pixel dimensions and file size. A 1200×630 tag on a 300 KB PNG passes; the same tag on a 4 MB PNG fails on WhatsApp and looks fine everywhere else, which is exactly the kind of bug nobody notices for months.
- **Compares canonical and og:url.** When they disagree, LinkedIn and Facebook can attribute your share to the wrong URL and the share counts split.
- **Checks the fallbacks.** If og:title is missing, platforms fall back to the <title>, which is usually written for Google and too long for a card. We flag when the fallback will look bad, not just when the tag is absent.
- **Reads robots and JSON-LD** so you also learn if the page is quietly blocked from indexing or has broken structured data.

Each issue comes with a concrete fix, and the generated head block at the bottom is built from what the page already has so you only need to fill in the gaps.

## The tags that matter, in priority order

| Tag | Used by | Why it matters |
| --- | --- | --- |
| og:image | Everyone | Determines whether a link gets a large card or a grey box. Biggest driver of click-through. |
| og:title | Everyone | Card headline. 60 characters or fewer survives truncation on every platform. |
| og:description | Facebook, LinkedIn, Slack, iMessage | Shown under the title. X ignores it in the large card format. |
| twitter:card | X | Must be summary_large_image or X renders a small thumbnail. |
| og:url | Facebook, LinkedIn | Canonical URL for share counts and deduplication. |
| og:site_name | LinkedIn, Slack, Discord | Brand line above the title. |
| og:type | Facebook | website or article. Affects how the object is stored in the graph. |
| og:image:alt | X, Mastodon, Bluesky | Accessibility text for the image. |

## Share image specs that work everywhere

- **Size:** 1200×630 px. This is the 1.91:1 ratio Facebook and LinkedIn crop to, X accepts it for summary_large_image, and Slack scales it down cleanly.
- **Minimum:** 600×315 px for a large card. Anything below 200×200 is rejected outright.
- **Weight:** under 300 KB is safe on every platform. WhatsApp regularly refuses images above about 600 KB, X and LinkedIn cap at 5 MB.
- **Format:** JPEG for photos, PNG for graphics with text. WebP is supported by Facebook, X and LinkedIn but not by every messaging app, so keep a PNG/JPEG fallback if WhatsApp matters to you.
- **Safe area:** keep text at least 60 px from the edges. Square crops (Slack, some mobile clients) cut off the sides.
- **HTTPS only.** An http:// image URL is silently dropped by Facebook and X.

## Common mistakes this tool catches

1. **Relative image path.** \`og:image="/og.png"\` is not valid; crawlers need an absolute URL.
2. **Image behind a redirect or an auth wall.** The tag is correct but the image returns 302 or 403 to the crawler.
3. **Different image per platform, none of them right.** twitter:image points at one file, og:image at another; both are 800 px wide.
4. **Duplicate tags from two plugins.** The first one wins on most platforms, and it is usually the default one your theme injected.
5. **Canonical pointing at the staging domain.** Copy-pasted from a template and never updated.
6. **noindex left on after launch.** Not a social issue, but you will be glad you found it.

## How to refresh a cached preview

Crawlers cache previews aggressively. After fixing your tags:

- **Facebook and Instagram:** paste the URL into the Sharing Debugger and press "Scrape again".
- **LinkedIn:** use the Post Inspector; it re-fetches on demand.
- **X:** there is no public validator any more; caching lasts about seven days. Adding a harmless query parameter (\`?v=2\`) forces a fresh card immediately.
- **Slack and Discord:** cache per workspace or server for a few hours; there is no manual purge.
- **WhatsApp and iMessage:** cache per device. Send the link from another device to confirm.
`.trim();

export const openGraphFaq: ToolFaq[] = [
  {
    q: "Why does my link show no image even though og:image is set?",
    a: "The most common causes are: the image URL is relative or http://, the file is over the platform's size limit (about 600 KB for WhatsApp, 5 MB for X and LinkedIn), the image is smaller than 200×200 px, or the crawler gets a 403/redirect when it fetches the file. This tool fetches the image the same way a crawler does and reports which one it is.",
  },
  {
    q: "What size should an Open Graph image be?",
    a: "1200×630 pixels, under 300 KB, JPEG or PNG. That single file renders correctly on Facebook, LinkedIn, X (with twitter:card set to summary_large_image), Slack, Discord, WhatsApp and iMessage.",
  },
  {
    q: "Do I need both og: and twitter: tags?",
    a: "You need twitter:card, otherwise X shows a small thumbnail card. For everything else X falls back to the og: equivalents, so twitter:title, twitter:description and twitter:image are optional unless you want X-specific copy.",
  },
  {
    q: "I fixed the tags but the preview still looks old.",
    a: "Platforms cache previews for days. Use Facebook's Sharing Debugger or LinkedIn's Post Inspector to force a re-scrape. On X, add a query parameter such as ?v=2 to the URL to bypass the cache.",
  },
  {
    q: "Does this tool store the pages I check?",
    a: "No. The page and its image are fetched once to produce the report and are not stored. Requests are rate limited per network to keep the tool free.",
  },
  {
    q: "Can I check pages behind a login?",
    a: "No, and neither can Facebook or Google. Social crawlers fetch pages anonymously, so any page that needs a session will show whatever your login page's tags say.",
  },
];

export const llmsTxtArticle = `
## What is llms.txt?

\`llms.txt\` is a plain markdown file served at the root of a website (\`https://example.com/llms.txt\`) that tells AI assistants what the site is about and which pages are worth reading. It was proposed by Jeremy Howard in September 2024 as a lighter-weight cousin of \`robots.txt\` and \`sitemap.xml\`: robots.txt says what a crawler *may* read, the sitemap lists *everything*, and llms.txt says what is *worth* reading, with a one-line description of each page.

The format is deliberately simple so that a language model can consume it directly inside its context window:

\`\`\`
# Site name

> One sentence describing the site.

Optional paragraphs with important context.

## Section

- [Page title](https://example.com/page): One-line description.

## Optional

- [Less important page](https://example.com/other): Skippable if context is tight.
\`\`\`

Only the H1 is required. The blockquote summary, the H2 sections and the special \`## Optional\` section are conventions from the spec.

## Does llms.txt help SEO?

Honest answer: not directly, and not yet. As of 2026 none of Google, Bing, OpenAI, Anthropic or Perplexity has publicly committed to reading llms.txt as a ranking or citation signal, and Google's John Mueller has compared it to the keywords meta tag. What it does do:

- **Costs nothing and cannot hurt.** It is a static text file with no effect on your HTML, crawl budget or Core Web Vitals.
- **Is read by developer tooling today.** Documentation hosts such as Mintlify, Fern and GitBook generate it automatically, and code editors that index documentation (Cursor, for example) consume it, so if you sell to developers it is genuinely used.
- **Forces a useful exercise.** Writing a one-line description for each important page is the same work as fixing your meta descriptions and internal linking, which *do* affect search.
- **Positions you for adoption.** If answer engines start reading it, sites that have one get the benefit on day one.

Treat it as cheap insurance and a documentation aid, not as a growth lever.

## How this generator builds your file

1. Reads \`/robots.txt\` and \`/sitemap.xml\` (including sitemap indexes) to find your public URLs. If there is no sitemap it falls back to the internal links on your homepage.
2. Prioritises shallow URLs (\`/pricing\` before \`/blog/2023/05/post\`) and fetches up to 30 of them.
3. Pulls each page's title and meta description, falling back to the first heading and paragraph when those are missing.
4. Skips pages marked noindex, non-HTML responses and anything that errors.
5. Groups pages by their first path segment (\`/docs/*\` becomes "Docs") and moves deep pages into \`## Optional\`.

The result is a solid first draft. You should still read it once: delete login, checkout and legal pages, and rewrite the summary line in your own words.

## Where to put the file

The file must be served at the site root as plain text. Where that lives depends on your stack:

- **Static sites, Vite, Next.js, Astro, TanStack Start:** drop \`llms.txt\` into the \`public/\` folder.
- **WordPress:** upload to the web root via SFTP, or use a dedicated llms.txt plugin; recent versions of Yoast SEO and Rank Math can generate one for you.
- **Webflow, Framer, Squarespace, Wix:** no native file hosting at the root; use a redirect rule to a hosted text file, or a 301 to a page that returns text/plain.
- **Shopify and other hosted commerce platforms:** check the platform's documentation; where the root is locked, a theme-level redirect is usually the only option.

Verify by opening \`https://yourdomain.com/llms.txt\` in a browser. You should see raw markdown with a \`text/plain\` content type, not your app shell or a 404.

## llms.txt vs llms-full.txt

The spec also allows \`llms-full.txt\`: a single file containing the *full text* of every important page, so an assistant can load your whole documentation at once. It is useful for docs sites with under a few hundred pages and worthless for blogs and marketing sites. Start with llms.txt; add llms-full.txt only if you have a real docs set and someone asks for it.
`.trim();

export const llmsTxtFaq: ToolFaq[] = [
  {
    q: "Is llms.txt an official standard?",
    a: "No. It is a community proposal published at llmstxt.org in 2024. It has meaningful adoption among developer documentation tools but no search engine or major AI lab has formally committed to reading it.",
  },
  {
    q: "Will adding llms.txt get my site cited by ChatGPT or Perplexity?",
    a: "There is no evidence that it does today. Citations come from being crawlable, clearly written and linked from pages those systems already trust. llms.txt is a free complement to that work, not a substitute for it.",
  },
  {
    q: "How many pages should I list?",
    a: "Fewer than you think. The file is meant to fit in a model's context window alongside your actual content. Twenty to forty well-described pages beats a dump of five hundred. Put long-tail pages under the Optional heading.",
  },
  {
    q: "Should I block AI crawlers in robots.txt if I have llms.txt?",
    a: "The two are independent. llms.txt is a guide for assistants that are allowed to read your site. If you block GPTBot, ClaudeBot or PerplexityBot in robots.txt, they will not read llms.txt either.",
  },
  {
    q: "Can I include pages behind login?",
    a: "You can list them, but it is pointless: assistants cannot authenticate, and a URL that returns a login page wastes their context. List public pages only.",
  },
  {
    q: "How often should I update it?",
    a: "Whenever you add or remove an important page. Most teams regenerate it monthly or wire it into their build so it stays in sync with the sitemap.",
  },
];

export const toolsHub = [
  {
    href: "/tools/open-graph-checker",
    name: "Open Graph & meta tag checker",
    description: "Preview how a link looks on Google, Facebook, LinkedIn, X, Slack and WhatsApp. Checks real image size and weight and generates the fixed head tags.",
    eyebrow: "Social previews",
  },
  {
    href: "/tools/llms-txt-generator",
    name: "llms.txt generator",
    description: "Build a spec-compliant llms.txt from your sitemap and page metadata, ready to edit and upload.",
    eyebrow: "AI readiness",
  },
  {
    href: "/",
    name: "AI website audit",
    description: "The full report: UX, SEO, copy, conversion and speed with ranked fixes. One free audit, no account needed.",
    eyebrow: "Full audit",
  },
] as const;
