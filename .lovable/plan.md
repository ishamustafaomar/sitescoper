

## Plan: Deep Product Analysis via Multi-Page Crawling

### Problem
Currently the analyzer only scrapes a single page's static content. The AI has no visibility into the actual product experience — navigation flows, onboarding, feature pages, pricing, documentation, etc.

### Solution
Upgrade the scraping and analysis pipeline to crawl multiple pages and give the AI a much richer picture of the product.

### Changes

**1. Upgrade scrape-website edge function to multi-page crawl**
- Use Firecrawl's **map** endpoint first to discover all URLs on the site (up to 50)
- Then **scrape** the top 5-10 most important pages (homepage, pricing, features, docs, about, signup)
- Smart page selection: prioritize pages by URL patterns (`/pricing`, `/features`, `/about`, `/docs`, `/signup`, `/login`)
- Collect markdown from each page and concatenate with clear page separators
- Also extract **branding** data (colors, fonts, logos) from the homepage for design analysis

**2. Upgrade analyze-website edge function**
- Increase markdown limit to handle multi-page content (~30-40K chars)
- Update the AI prompt to explicitly instruct it to:
  - Evaluate the **signup/onboarding flow** based on the signup page content
  - Assess **navigation and information architecture** across pages
  - Analyze **pricing strategy** from the pricing page
  - Evaluate **documentation quality** if docs pages exist
  - Check **feature communication** across feature pages
  - Identify **missing pages** (e.g., no pricing page, no docs, no about page)
- Add a new category: **Product Experience** covering signup friction, feature discoverability, page flow logic

**3. Update frontend to show multi-page context**
- Show which pages were crawled in the Website Preview section
- Add a "Pages crawled" list so users see the analysis scope
- Update the Page Info card to show crawled page count

### Technical Details

```text
Current flow:
  URL → scrape 1 page → 15K chars markdown → AI analysis

New flow:
  URL → map site (discover URLs) → scrape top 5-10 pages → 
  ~30K chars combined markdown → enhanced AI analysis
```

- Firecrawl map is fast and cheap (1 credit)
- Each additional scrape costs 1 credit
- Total per analysis: ~6-11 credits instead of 1
- No new database changes needed — the analysis result structure stays the same

### Files to modify
- `supabase/functions/scrape-website/index.ts` — add map + multi-page scrape
- `supabase/functions/analyze-website/index.ts` — enhanced prompt + higher char limit
- `src/pages/Index.tsx` — show crawled pages info
- `src/components/WebsitePreview.tsx` — display page list
- `src/lib/api.ts` — update ScrapeResult type for multi-page data

