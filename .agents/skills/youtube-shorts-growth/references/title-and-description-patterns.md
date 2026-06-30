# YouTube Shorts — title, description, tags

## Title rules

- **≤ 60 characters.** Shorts truncates the title on mobile around 40 chars; keep the hook in the first 40.
- **No emojis in the title.** They get downranked by Shorts ranking and look spammy.
- **No clickbait punctuation** (no `!!!`, no all-caps words). One question mark max.
- **Lead with the specific.** "Notion's homepage is shipping 3MB" beats "You won't believe what I found".

## Proven title patterns

| Pattern | Example |
| --- | --- |
| Site callout + finding | `Notion's homepage ships a 3MB image` |
| Number-led list | `3 SEO issues costing you traffic` |
| Test framing | `Does your homepage pass the 5-second test?` |
| Before/after | `I fixed this site's LCP in 30 seconds` |
| Lighthouse gap | `Lighthouse said 98. SiteScoper said no.` |
| Stat hook | `87% of homepages fail this one check` |

## Description template

First line is the hook — Shorts shows ~100 chars before "more". Put the value prop and the link there.

```
{One-sentence hook restating the finding}.

Run a free audit on your site: https://sitescoper.com/?utm_source=youtube&utm_medium=shorts&utm_campaign={short_id}

SiteScoper is an AI website auditor — it checks SEO, performance, content, and conversion in one pass. Free during early access.

{3–5 bullet takeaways from the Short}

#seo #webdev #shorts #sitescoper #websiteaudit
```

## UTM

- `utm_source=youtube`
- `utm_medium=shorts`
- `utm_campaign={short_id}` — the `youtube_shorts.id` row uuid, so analytics can join straight back.

Never reuse a `utm_campaign` across Shorts. One-to-one with the row.

## Tag set

Always include: `seo`, `webdev`, `shorts`, `sitescoper`, `websiteaudit`.

Rotate in 2–3 topical tags per Short based on the finding: `pagespeed`, `corewebvitals`, `lighthouse`, `nextjs`, `react`, `webflow`, `framer`, `shopify`, `wordpress`, `accessibility`, `lcp`, `cls`.

Cap at 10 tags total. More than that is treated as keyword stuffing.

## Thumbnail

Shorts mostly ignores custom thumbnails on mobile (it autoplays into the feed), but the channel page and shared links use them. Generate one anyway:
- Big readable text matching the title's hook (≥80px font).
- One screenshot or one number, never both.
- Brand color background, not pure white/black.