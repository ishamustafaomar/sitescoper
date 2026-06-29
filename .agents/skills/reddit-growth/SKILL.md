---
name: reddit-growth
description: Use when the user asks about posting to Reddit, Reddit performance, why Reddit posts aren't working, drafting a Reddit post, or growing SiteScoper traffic via Reddit. Covers the SiteScoper Reddit autopost loop, subreddit pool, removals, and signup attribution.
---

# SiteScoper Reddit growth loop

SiteScoper auto-posts to Reddit daily and learns from what works. This skill explains how to drive that loop from chat.

## Where the data lives

- `reddit_subreddit_pool` — every sub we've considered. `status` is `active`, `burned`, or `cooling`. `total_signups` and `avg_score` drive ranking.
- `reddit_posts` — every drafted/posted/removed post. `utm_campaign` ties signups back to a post.
- `reddit_post_metrics` — time-series of score/comments/signups/removal per post.

Admin UI lives at `/admin/reddit` (Post now + Refresh metrics buttons).

## Edge functions

- `reddit-autopost` — picks a sub, drafts via Lovable AI, posts via Reddit API (if creds set), logs draft otherwise.
- `reddit-analytics` — polls Reddit for each posted post in the last 14 days, updates metrics, marks burned subs, attributes signups.

`pg_cron`: autopost daily 16:17 UTC, analytics every 2h.

## Required secrets (deferred)

Until these are set, posting stays in **draft-only** mode (rows written with `status='draft'`):
- `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET` (Reddit script app)
- `REDDIT_USERNAME`, `REDDIT_PASSWORD`

Add via the `add_secret` tool. After adding, no redeploy needed.

## Rules for drafting Reddit posts

Reddit kills marketing voice on sight. Always:
- Lead with a problem, finding, or story — never the product.
- No emojis. No exclamation marks. No "Hey everyone".
- Mention SiteScoper once, near the end, as "a tool I built" — not "the best AI website auditor".
- 80–180 words body. Title under 290 chars.
- Check `references/subreddit-rules.md` before posting to a specific sub.
- Check `references/title-patterns.md` for what's been working.

## When the user asks "what's working?"

Query `reddit_subreddit_pool` ordered by `total_signups DESC` and the latest `reddit_post_metrics`. Surface signups per post, not raw upvotes — upvotes don't equal signups.

## When a sub burns

`reddit-analytics` automatically sets `status='burned'` and stores the reason in `burn_reason`. Don't manually re-activate without a plan — usually the account was filtered, not the post. Wait 2+ weeks and verify karma/age requirements in the sub's rules.

## Cooldown rule

If 2+ posts get removed in 24h, `reddit-autopost` skips its next run. Surface this to the user as a likely shadowban check, not a code bug.