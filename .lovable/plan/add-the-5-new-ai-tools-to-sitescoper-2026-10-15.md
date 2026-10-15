# Add the 5 new AI tools to SiteScoper

Built in this order, each shipped and checked before the next.

## 1. Firecrawl scraping (all audits)
- Audits use Firecrawl first, so JavaScript-heavy sites (React, Vue, Lovable apps) return real content.
- Current scraper stays as automatic backup if Firecrawl fails or runs out of credits.
- You approve one Firecrawl connect card.

## 2. Claude for fixes and copy
- Copy-paste code fixes on reports and the Fix Pass page are written by Claude Sonnet 5 (more accurate code).
- Headline rewrites and the Copywriter tool switch to Claude.
- Main audit scoring stays on the current model (no change to scores people already compared).

## 3. Live competitor research (Pro only)
- New "Competitor intel" panel on reports: finds 3 real competitors and what they do now, with clickable sources.
- Uses Perplexity through a connect card. Runs only when a Pro user clicks it (keeps costs down).
- Every claim shows its source and date; nothing invented.

## 4. Instant preview score (Jev)
- Seconds after pasting a URL, show a quick "first look" score and 3 quick flags while the full audit runs.
- Clearly labeled "Quick preview — full score coming", so it never looks like the final score.

## 5. Shareable video roast (Pro + Fix Pass)
- Button on finished reports: "Make a 20-second video roast" using Gemini Omni, with Lyria music.
- Vertical video for Shorts/TikTok/X, downloadable. Limit 3 per day per user (videos are the most expensive part).

## Also
- All new text in all 9 languages, What's New entry, ShippedIn post.

## Costs to know
- Every audit uses Firecrawl credits. Competitor research and videos cost the most, so they are Pro-only, click-to-run, and capped.

## Technical details
- Firecrawl in `supabase/functions/scrape-website` (gateway or direct mode per connection flag), fallback to existing fetch.
- Claude via `/v1/messages` streamed, in `fix-pass`, `rewrite-headlines`, `copywriter` server functions.
- Perplexity via connector gateway in a new authenticated server function, Pro check server-side.
- Jev (`typesafe/jev-latest`) in a public server function with IP rate limit, on the homepage.
- Video: background job with status polling, stored in storage, daily cap table.
