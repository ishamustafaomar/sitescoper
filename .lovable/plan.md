## What changes

Replace the existing `reddit-growth` skill with a `youtube-shorts-growth` skill focused on auto-posting Remotion-generated Shorts to YouTube to promote SiteScoper. **Skill files only this round** — no infra, edge functions, tables, or cron yet. We can build that out in a follow-up once the skill doc is approved.

## Why skill-only first

The Reddit loop is still wired up and partly working. Spinning up a full YouTube Shorts pipeline (render → upload → analytics) is a big chunk of work and needs decisions (Composio vs direct YouTube Data API OAuth, where renders run, daily quota, topic strategy). The skill captures the playbook so any future agent run executes it consistently.

## Files

Delete:
- `.agents/skills/reddit-growth/references/subreddit-rules.md`
- `.agents/skills/reddit-growth/references/title-patterns.md`
- `.agents/skills/reddit-growth/SKILL.md`
- `.agents/skills/reddit-growth/` (dir)

Create under `.agents/skills/youtube-shorts-growth/`:

1. **SKILL.md** — frontmatter + body covering:
   - Trigger description (asking about YouTube posting, Shorts performance, drafting a Short, growing SiteScoper via YouTube).
   - Goal: auto-generate + upload one ~20s vertical Short per day promoting a single SiteScoper insight (audit finding, before/after, "what your site is leaking", etc.).
   - Where data will live once built: `youtube_shorts` (id, title, description, tags, video_url, youtube_video_id, status, utm_campaign, posted_at) and `youtube_shorts_metrics` (views, likes, comments, subs_gained, signups, polled_at). Note these are **planned** — not yet created.
   - Pipeline: Remotion render (reuse `remotion/` setup) → upload via YouTube Data API v3 `videos.insert` → poll via `videos.list?part=statistics` → attribute signups via UTM.
   - Auth: YouTube Data API OAuth (Composio `YOUTUBE_UPLOAD_VIDEO` action preferred since Composio is already wired; fallback = manual OAuth refresh token).
   - Daily quota note: YouTube API upload costs ~1600 units; 10k/day default cap = ~6 uploads/day max. Schedule once daily.
   - Rules for drafting a Short (hook in 1s, 9:16, large captions, no marketing voice, single CTA card at the end pointing to sitescoper.com).
   - "What's working?" query pattern: rank by signups per Short, not views.
   - Cooldown: if a Short gets a strike or removal, pause autopost and surface it as a policy check, not a bug.

2. **references/short-formats.md** — 5 repeatable Short formats with structure, sample voiceover script, and visual beats:
   - "I scanned [famous site] and here's what's broken"
   - "3 SEO issues costing you traffic right now"
   - "Your homepage fails this 5-second test"
   - "Before/after: fixing [one issue] in 30 seconds"
   - "What Lighthouse won't tell you about your site"

3. **references/title-and-description-patterns.md** — proven YouTube Shorts title patterns (curiosity gap, number-led, callout), description template with UTM link, tag set (`#seo #webdev #shorts #sitescoper #websiteaudit`), and rules (title ≤ 60 chars, first line of description is the hook because Shorts truncates fast).

## Out of scope this turn

- Creating `youtube_shorts*` tables.
- Writing `youtube-autopost` / `youtube-analytics` edge functions.
- Setting up Composio YouTube connection or OAuth secrets.
- pg_cron schedule.
- Admin UI route.

After you approve the skill, say "build the pipeline" and I'll scaffold the tables, edge functions, and Composio call in a second pass.
