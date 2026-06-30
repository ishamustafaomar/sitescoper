## Switch Reddit auth from script-app credentials to Composio

Yes — Composio handles the OAuth dance (that screenshot is its consent flow), so you just click **Allow** once and we never touch your Reddit password or client secret. Much simpler than the 4-secret script-app setup.

### What changes

**Auth model**
- Drop the 4 secrets we were going to need: `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `REDDIT_USERNAME`, `REDDIT_PASSWORD`.
- Add 1 secret: `COMPOSIO_API_KEY` (from composio.dev → Settings → API Keys).
- You connect your Reddit account once in Composio's dashboard (the screen you screenshotted). Composio stores the OAuth tokens and refreshes them automatically.

**Edge functions (`reddit-autopost`, `reddit-analytics`)**
- Remove `getRedditToken()` (the password-grant flow).
- Replace direct `oauth.reddit.com/api/submit` and `/api/info` calls with Composio action calls:
  - `REDDIT_CREATE_POST` (or `REDDIT_SUBMIT_POST`) for posting
  - `REDDIT_GET_POST_BY_ID` for analytics polling
- Calls go to `https://backend.composio.dev/api/v3/...` with header `x-api-key: $COMPOSIO_API_KEY` and your `entity_id` (your user ID in Composio, defaults to `default`).
- No `User-Agent` juggling, no token refresh code, no shadowban-from-password-auth risk.

**Everything else stays the same**
- Same 3 tables (`reddit_subreddit_pool`, `reddit_posts`, `reddit_post_metrics`).
- Same admin UI at `/admin/reddit`.
- Same pg_cron schedule.
- Same LLM-driven subreddit picking + drafting.

### Steps

1. You sign up at composio.dev (free tier is fine for this volume), connect your Reddit account there (the Allow screen), and grab your API key.
2. I add `COMPOSIO_API_KEY` via the secret tool.
3. I rewrite `reddit-autopost/index.ts` and `reddit-analytics/index.ts` to call Composio instead of Reddit directly.
4. I redeploy both functions.
5. You hit **Post now** on `/admin/reddit` to test.

### Tradeoff to know

- Composio free tier has action-call limits (currently 2k/month, plenty for 1 post/day + analytics every 2h ≈ ~400 calls/month).
- If Composio is ever down, posting pauses until it's back. With the script-app flow we'd talk to Reddit directly — slightly more reliable, but you'd own credential rotation and ban risk.

Want me to go ahead with the Composio swap?
