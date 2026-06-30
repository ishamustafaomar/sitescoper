---
name: youtube-shorts-growth
description: Use when the user asks about posting to YouTube, YouTube Shorts performance, why Shorts aren't getting views, drafting a Short for SiteScoper, or growing SiteScoper traffic via YouTube. Covers the planned daily Shorts autopost loop, formats, upload pipeline, and signup attribution.
---

# SiteScoper YouTube Shorts growth loop

SiteScoper will auto-publish one ~20s vertical Short per day promoting a single concrete insight (an audit finding, a before/after, a "what your homepage is leaking" hook). This skill is the playbook.

## Status

The skill is live, but the pipeline is **not yet built**. Tables, edge functions, Composio YouTube connection, and pg_cron schedule are out of scope until the user says "build the pipeline". Until then, treat any request as either (a) drafting a Short manually, or (b) scoping the build.

## Planned data model

- `youtube_shorts` — `id`, `title`, `description`, `tags text[]`, `format` (one of the formats in `references/short-formats.md`), `video_url`, `youtube_video_id`, `status` (`draft` | `rendered` | `uploaded` | `removed`), `utm_campaign`, `posted_at`, `created_at`.
- `youtube_shorts_metrics` — time-series: `short_id`, `views`, `likes`, `comments`, `subs_gained`, `signups`, `polled_at`.

`utm_campaign` is how we tie a sitescoper.com signup back to a specific Short. Always set it to the short id.

## Pipeline (planned)

1. `youtube-autopost` edge function picks the next format from `references/short-formats.md` (rotate, weight by signups-per-Short).
2. Drafts script + on-screen captions via Lovable AI (Gemini).
3. Renders 9:16 1080x1920 MP4 with the existing `remotion/` setup (reuse fonts + brand colors).
4. Uploads via Composio action `YOUTUBE_UPLOAD_VIDEO` (preferred — Composio is already wired with `COMPOSIO_API_KEY`). Fallback: direct YouTube Data API v3 `videos.insert` with an OAuth refresh token.
5. `youtube-analytics` polls `videos.list?part=statistics` every 2h for 14 days, writes `youtube_shorts_metrics`, attributes signups via `analysis_history` filtered by the row's `utm_campaign`.

## Auth (planned)

- Prefer Composio. The user already connected Reddit via Composio; YouTube uses the same flow — they connect their YouTube account in the Composio dashboard once, then we call `tools/execute/YOUTUBE_UPLOAD_VIDEO` with the right `user_id` (entity id).
- If Composio doesn't expose the upload action, fall back to Google OAuth: store `YOUTUBE_REFRESH_TOKEN` + `YOUTUBE_CLIENT_ID` + `YOUTUBE_CLIENT_SECRET` as Lovable secrets and exchange for an access token on each upload.

## Quota reality

YouTube Data API default quota is 10,000 units/day. `videos.insert` costs ~1,600 units. That caps us at ~6 uploads/day before requesting a quota increase. **Schedule once per day** (one autopost run, one Short). Don't loop.

## Rules for drafting a Short

YouTube Shorts is brutal in the first 1 second. Always:
- **Hook in frame 0–15** (0.5s at 30fps). No logo intro, no "Hey guys".
- 9:16, 1080x1920, 30fps, 15–30s total.
- Captions are huge, high-contrast, and on-screen the entire time — most viewers watch muted.
- One concrete insight per Short. Not "SiteScoper is great", but "this site is shipping a 4MB hero image".
- No marketing voice. Talk like a developer showing a friend a bug.
- Single CTA card at the very end: "sitescoper.com — free" with the UTM-tagged short URL. One frame, ~1s, then cut.
- See `references/short-formats.md` for the five repeatable formats and `references/title-and-description-patterns.md` for title/description/tag rules.

## When the user asks "what's working?"

Once metrics exist, rank `youtube_shorts` by **signups per Short**, not views. A 2k-view Short that drove 4 signups beats a 50k-view Short that drove 0. Surface signups first, then views, then likes.

## When a Short gets removed or strikes

If a Short is removed (copyright, policy, spam), pause `youtube-autopost` for at least 7 days and surface it to the user as a **policy review**, not a code bug. A second strike inside 90 days risks the whole channel.

## When the user asks about a competing channel

Don't try to scrape YouTube. Use the existing Semrush tools (`semrush--competitive_analysis`, `semrush--top_pages`) on the channel's website, or ask the user to paste the channel handle and we'll plan content gaps from there.