CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  keyword text NOT NULL,
  body text NOT NULL,
  reading_time text NOT NULL DEFAULT '6 min',
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX blog_posts_published_at_idx ON public.blog_posts (published_at DESC);

GRANT SELECT ON public.blog_posts TO anon;
GRANT SELECT ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Blog posts are publicly readable"
  ON public.blog_posts FOR SELECT
  TO anon, authenticated
  USING (true);

INSERT INTO public.blog_posts (slug, title, description, keyword, reading_time, published_at, body) VALUES
('how-to-audit-a-website-for-seo',
 'How to Audit a Website for SEO in 2026 (Step-by-Step)',
 'A practical, founder-friendly website SEO audit you can run in 30 minutes — covering technical SEO, on-page, content, and Core Web Vitals.',
 'how to audit a website for seo', '9 min', '2026-05-12',
 E'Most SEO audit guides are written for agencies running quarterly retainers. This one is for the founder who wants a clear, prioritised list of fixes before lunch.\n\n## Why most website audits fail\n\nThe typical SEO audit produces an 80-page PDF, a colour-coded spreadsheet, and zero shipped changes. A useful audit answers three questions and nothing else — what is broken, what does it cost me, and what do I ship first.\n\n## The 5-layer website audit\n\n### 1. Technical SEO\nCheck that Google can crawl, render and index your pages. The non-negotiables: a valid robots.txt, a clean sitemap.xml, no accidental noindex tags, HTTPS everywhere, a single canonical per URL.\n\n### 2. On-page SEO\nEvery indexable page needs a unique title under 60 characters, a meta description under 160, a single H1, and headings that describe the content.\n\n### 3. Content quality\nOpen the page and read it out loud. If the first sentence doesn''t tell a visitor what you do, the AI doesn''t know either.\n\n### 4. Core Web Vitals\nLCP under 2.5 s, INP under 200 ms, CLS under 0.1.\n\n### 5. Off-page signals\nClaim your Google Business Profile, get listed in two or three category directories, and ask happy customers for a review.\n\n## Run a free audit in 60 seconds\n\nIf you''d rather not do this by hand, [SiteScoper''s AI website audit tool](/ai-website-audit-tool) runs all five layers automatically.'),
('ai-website-audit-vs-traditional-seo-tools',
 'AI Website Audit vs. Traditional SEO Tools: Which Should You Use?',
 'AI website audit tools read your copy like a human. Traditional SEO tools crawl like a robot. Here''s when to use each — and where they overlap.',
 'ai website audit vs traditional seo tools', '7 min', '2026-05-19',
 E'Semrush and Ahrefs have ruled SEO for a decade. AI-native tools like SiteScoper have shown up in the last 18 months. Which one belongs in your stack?\n\n## What traditional SEO tools do well\n\nRules-based scanners are unmatched for breadth. They crawl thousands of URLs, surface every broken link, and benchmark you against the full SERP.\n\n## Where AI audits pull ahead\n\nAI tools read your page the way a human does. They flag a hero headline that doesn''t say what the product actually is, a CTA that asks for too much commitment, a paragraph of jargon nobody will finish.\n\n- **Plain-English findings** instead of cryptic ranking codes\n- **Copy and conversion review** alongside technical SEO\n- **Prioritisation by impact**, not severity colour\n- **Speed** — a single-URL report in under a minute\n\n## Use both\n\nRun an [AI website audit](/ai-website-audit-tool) weekly on your top pages, and use a traditional crawler quarterly when you need a site-wide sweep.'),
('core-web-vitals-explained-for-founders',
 'Core Web Vitals Explained (For Founders Who Hate Performance Jargon)',
 'LCP, INP, CLS — what they actually mean, how Google uses them in ranking, and the three fixes that move the needle for 90% of sites.',
 'core web vitals explained', '6 min', '2026-04-22',
 E'Google has been using Core Web Vitals as a ranking signal since 2021. Most founders still couldn''t define them. Here''s the version you actually need.\n\n## The three metrics\n\n- **LCP (Largest Contentful Paint)** — how long until the biggest thing on screen loads. Target: under 2.5 s.\n- **INP (Interaction to Next Paint)** — how long the page takes to respond. Target: under 200 ms.\n- **CLS (Cumulative Layout Shift)** — how much the page jumps around as it loads. Target: under 0.1.\n\n## The three fixes that move the needle\n\n1. **Compress and lazy-load images.** Use WebP or AVIF. Set explicit width and height.\n2. **Defer non-critical JavaScript.**\n3. **Pre-connect to your fonts and CDN.**\n\nRun a [free Core Web Vitals check](/) and SiteScoper will tell you which of the three is hurting you most.'),
('free-website-audit-checklist',
 'The Free Website Audit Checklist (24 Checks, No Tools Required)',
 'Open the page in a browser and run these 24 checks. No paid SEO tool needed — just a clear list of fixes you can ship this week.',
 'free website audit checklist', '8 min', '2026-04-05',
 E'You don''t need a paid tool to spot the issues hurting your site the most. Open your homepage in a private window and run this list.\n\n## Above the fold\n\n- Does the first sentence say what you do, for whom, and what makes you different?\n- Is there one clear primary CTA?\n- Does the page load in under 3 seconds on 4G?\n\n## Meta and structure\n\n- Is the title unique and under 60 characters?\n- Is the meta description present and under 160?\n- Exactly one H1 per page?\n\n## Technical SEO\n\n- robots.txt exists and doesn''t block the whole site?\n- sitemap.xml exists and lists every public route?\n- All images have descriptive alt text?\n- Schema.org JSON-LD present for Organization / Product / Article?\n\nWant this automated? [Run a free audit on SiteScoper](/) and we''ll check all 24 in under a minute.'),
('small-business-seo-guide',
 'Small Business SEO: A No-Nonsense Guide for 2026',
 'Skip the jargon. This is the small business SEO playbook — local SEO, on-page basics, content cadence, and the tools that actually pay back.',
 'small business seo', '10 min', '2026-03-18',
 E'If you run a small business, SEO advice online is mostly written for either Fortune 500 marketing teams or affiliate bloggers. Neither is you.\n\n## Start with local\n\n- Claim and complete your Google Business Profile.\n- Get listed in 5-10 reputable directories.\n- Ask every happy customer for a Google review.\n\n## Then on-page\n\nPick the 5-10 pages a buyer would actually land on and make them excellent.\n\n## Content cadence beats content volume\n\nOne genuinely useful article a month will out-rank ten thin posts published in a sprint.\n\n## The tools you actually need\n\n- An [AI website audit tool](/ai-website-audit-tool) to flag fixes monthly\n- Google Search Console (free, non-negotiable)\n- A keyword research tool\n- A simple analytics tool'),
('white-label-seo-reports-for-agencies',
 'White Label SEO Reports: What Clients Actually Want to See',
 'Agencies are losing retainers because their SEO reports are unreadable. Here''s what to keep, what to cut, and how to white-label without looking generic.',
 'white label seo reports', '7 min', '2026-02-28',
 E'Most agency SEO reports are bloated, jargon-heavy, and built to impress a CMO who doesn''t exist anymore.\n\n## Cut everything that doesn''t change a decision\n\n- Generic "domain authority" gauges\n- 50-row keyword tables nobody scrolls through\n- Screenshots of crawl errors without a recommended fix\n\n## Keep the three slides that earn the retainer\n\n1. **What changed this month**\n2. **What we did**\n3. **What we''re shipping next**\n\n## White-label without looking white-labelled\n\nUse a [white-label SEO reports tool](/white-label-seo-reports) that lets you set the logo, colours, and language, and add a one-paragraph human summary at the top.');

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;