## Goal

Ship a self-driving Reddit growth loop for SiteScoper that:
1. Picks subreddits that fit *whatever* SiteScoper is currently about (so it adapts if you pivot).
2. Auto-posts on a schedule.
3. Watches for removals/bans/shadowbans and stops posting to that sub, swapping in a new one.
4. Tracks upvotes, comments, click-through, and **actual signups** per post, then biases future posts toward what works.

Delivered as two parts: a **skill** (so I can run the loop on demand from chat) + **Cloud backend** (so it runs on a schedule without me).

## How it works

```text
                ┌──────────────────────────┐
   pg_cron ───▶ │  reddit-autopost (edge)  │ ─ pick sub ─▶ draft ─▶ post ─▶ log
                └──────────────────────────┘                                │
                                                                            ▼
                ┌──────────────────────────┐                       reddit_posts table
   pg_cron ───▶ │  reddit-analytics (edge) │ ◀── poll Reddit ──────────────┘
                └──────────────────────────┘
                          │
                          ├─ removed / banned?  → mark sub "burned", pick new one next run
                          ├─ score, comments    → reddit_post_metrics
                          └─ UTM ?utm_source=reddit&utm_campaign=<post_id>
                                  │
                                  ▼
                          join → auth.users signups in last N hours
                                  │
                                  ▼
                          subreddit_performance (score, ctr, signups/post)
                                  │
                                  ▼
                  next run weights subs/titles by performance
```

## Subreddit targeting (adaptive)

- Skill keeps a `subreddit_pool` JSON: `{ subreddit, status: active|burned|cooling, last_post_at, signups_per_post, removal_rate }`.
- On each run, an LLM call (Lovable AI) reads the current SiteScoper landing copy + recent blog topics and proposes 5 candidate subs. Pool is merged, deduped, and ranked by past performance; burned ones excluded.
- If you pivot the site, the pool naturally drifts because the LLM re-reads your copy each cycle.

## Ban / removal handling

- After each post, `reddit-analytics` checks `/api/info` for the post: if `removed_by_category` is set, or post 404s within 1h, or the account hits a sub's karma/age filter → mark `subreddit_pool.status = 'burned'` and log reason.
- If 2+ subs burn in 24h, pause all posting for 24h (shadowban risk) and notify you via the existing `send-transactional-email` (reply-to your gmail).

## Analytics → optimization

- `reddit_post_metrics`: post_id, score, num_comments, click_count (from UTM hits via a tiny tracking endpoint or `analysis_history` referer), signups_attributed (join UTM campaign → `auth.users.created_at` within 24h of post).
- Weekly digest emailed to you: top 3 subs, top 3 title patterns, signups per post.
- Next post's title/body drafted by LLM with the top-performing patterns in context.

## Backend (Lovable Cloud)

New tables (migration with proper GRANTs + RLS — admin-only read, service_role write):
- `reddit_subreddit_pool` — sub, status, stats
- `reddit_posts` — id, subreddit, title, body, posted_at, reddit_post_id, utm_campaign, status
- `reddit_post_metrics` — post_id, score, comments, clicks, signups, checked_at

New edge functions:
- `reddit-autopost` — picks sub, drafts post (Lovable AI), posts via Reddit API, inserts row
- `reddit-analytics` — polls Reddit for recent posts, updates metrics, marks burned subs, attributes signups
- `reddit-track` (optional) — 302 redirect endpoint that logs UTM clicks before redirecting to sitescoper.com

`pg_cron`:
- `reddit-autopost` once/day at a randomized window 14:00–20:00 UTC
- `reddit-analytics` every 2h

Admin UI page `/admin/reddit` showing the pool, recent posts, metrics, and a "post now" button.

## Skill (`.agents/skills/reddit-growth`)

Loads when you say "post to reddit", "reddit performance", "why aren't my reddit posts working", etc. Contains:
- `SKILL.md` — when to trigger, how to read the pool, how to draft a non-spammy post (Reddit-style, no marketing voice, lead with problem not product), self-promo ratio rules per sub.
- `references/subreddit-rules.md` — known rules for r/SaaS, r/SideProject, r/Entrepreneur, r/SEO, r/marketing, r/EntrepreneurRideAlong, r/indiehackers, r/webdev, r/startups (flair requirements, self-promo days, karma minimums).
- `references/title-patterns.md` — patterns that have worked + ones that get removed.
- `scripts/draft_post.py` — uses Lovable AI gateway to draft a post given subreddit + site context.
- `scripts/check_health.py` — quick CLI to print pool status, recent removals, signups-per-post.

## Auth (deferred per your answer)

I'll scaffold everything assuming two secrets: `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `REDDIT_USERNAME`, `REDDIT_PASSWORD` (script-app flow — simplest). Posting will be wired but disabled until you add them via `add_secret`. Until then, the skill works in **draft-only** mode: I generate the post in chat, you paste manually.

## Out of scope (call out now)

- Commenting/replying to your own posts (high ban risk; can add later behind a flag).
- Posting to multiple Reddit accounts.
- Cross-posting to other platforms (separate skill).

## Deliverables

1. Migration: 3 tables + RLS + GRANTs.
2. 2 edge functions (`reddit-autopost`, `reddit-analytics`) + `supabase/config.toml` entries.
3. `pg_cron` schedules (via `supabase--insert`).
4. `.agents/skills/reddit-growth/` with SKILL.md, 2 references, 2 scripts; applied via `skills--apply_draft`.
5. Admin UI page at `/admin/reddit`.
6. README note on adding the 4 Reddit secrets when you're ready to go live.