# Auto-generated fix PRs — v1

## Decisions locked

- **Surface**: GitHub only in v1, but the code is structured around a `FixProvider` interface so Webflow / Shopify / WordPress can be added later without touching the audit, planner, or UI layers.
- **Scope**: mechanical SEO fixes + AI copy rewrites. No layout, no new sections.
- **Flow**: every audit gets a "Fix it" tab → user checks the boxes they want → one PR with all selected changes, opened against the default branch as a draft.
- **Gating**: Pro-only. Free users see the tab and the diffs but the "Create PR" button is locked behind the existing `ProGate`.

## Shape of the feature

```text
SiteScoper audit
   |
   v
[Fix it] tab  ────────────────►  Planner (generates proposed file changes)
                                    |
                                    v
                              Selectable diff list
                                    |
                user picks subset + clicks "Create PR"
                                    |
                                    v
                          fix-provider:github (GitHub App)
                                    |
                                    v
                              Branch + commits + PR
```

## What's auto-fixable in v1

Mechanical (deterministic file edits — no AI required, except to draft new copy):
- `<title>` rewrite / add
- meta description rewrite / add
- canonical link add
- `<html lang>` add
- viewport meta add
- Open Graph + Twitter card tags
- robots.txt edits (e.g. add `Sitemap:` line, remove accidental `Disallow: /`)
- sitemap.xml stub generation
- image `alt` text fill-in (per image, file-aware)
- JSON-LD block insert (Organization, WebSite, Article)
- `<h1>` text rewrite (single, unambiguous match)

AI copy rewrites (planner asks the model for a before/after, user sees both):
- headline / sub-headline rewrites
- CTA button copy rewrites
- short paragraph rewrites (≤ 280 chars, single unambiguous match)

Each fix carries `{ id, type, file, before, after, confidence, source_finding_id }` so the UI can render a real diff and the PR body can credit the audit category.

## High-level work

### 1. GitHub App + connection storage

- Register one Lovable-owned GitHub App ("SiteScoper Fix Bot") with `contents: write`, `pull_requests: write`, `metadata: read`. The user installs it on their repos via the standard GitHub install flow; no per-user PAT.
- New table `repo_connections` (per-user): `provider` (`github`), `installation_id`, `account_login`, `default_repo` (nullable), `default_branch`, `created_at`. RLS scoped to `auth.uid()`. GRANTed to `authenticated` + `service_role`.
- Two edge functions:
  - `github-install-callback` — receives GitHub's `installation_id` after the user installs the app, persists the row.
  - `github-list-repos` — server-side `installation_id` → repo list using a JWT minted from the App's private key (stored as `GITHUB_APP_PRIVATE_KEY` + `GITHUB_APP_ID` secrets).
- Account page gets a "Connected repos" section: "Connect GitHub" button → GitHub install URL → pick repo + branch → save.

### 2. Provider abstraction

`supabase/functions/_shared/fix-providers/` with:

- `types.ts` — `FixProvider` interface: `listFiles(paths)`, `readFile(path)`, `createPullRequest({ title, body, branch, changes })`.
- `github.ts` — implements `FixProvider` against the GitHub Contents API, using an installation access token minted from the App credentials.
- `index.ts` — `getProvider(connection) => FixProvider`.

Webflow / Shopify / WordPress are not implemented in v1 but the interface is designed so each one becomes a single new file in this folder.

### 3. Fix planner edge function

New `plan-fixes` function. Inputs: `{ analysisHistoryId, repoConnectionId }`. It:

1. Loads the analysis row (server-side; RLS already protects it).
2. Re-fetches `index.html` and any referenced template/page files from the connected repo via the provider, so it operates on the actual source — not the rendered HTML.
3. For each audit finding it knows how to fix, generates a candidate `Fix` object (mechanical fixes are deterministic; copy rewrites call Lovable AI with the existing `gemini-3-flash-preview` default and a tight JSON schema).
4. Returns `{ fixes: Fix[] }`. No writes yet.

Heuristics for "do I touch this finding?":
- Mechanical: a known check ID from the existing on-page SEO Audit tab (`seo-audit/index.ts` already produces these).
- Copy: a suggestion with a `rewrite: { before, after }` AND `before` appears verbatim exactly once in a source file.
- Skip everything else and surface a "Not auto-fixable — manual edit" badge on the audit row.

### 4. Apply-fixes edge function

New `apply-fixes` function. Inputs: `{ repoConnectionId, fixIds, title, body }` plus the cached `fixes` payload (or re-plans if expired). It:

1. Branches off the default branch as `sitescoper/fix-<shortId>`.
2. For each selected fix, reads the file, applies the string replacement (mechanical) or before/after substitution (copy), and stages a commit.
3. Opens a draft PR with a body that lists each fix grouped by category and links back to the SiteScoper audit URL.
4. Returns `{ pr_url, branch }`. The UI shows a toast + "Open PR on GitHub" link.

Safety rails:
- Refuse to touch any file outside the repo root or matching a denylist (`.github/`, `package-lock.json`, lockfiles, secrets, anything binary).
- Refuse a fix whose `before` no longer appears in the file or appears more than once.
- Always draft PR, never auto-merge.
- Hard cap: 50 fixes per PR.

### 5. UI — new "Fix it" tab inside `AnalysisDetail.tsx`

Adds a third tab next to "Analysis" and "SEO Audit":

- If no repo connected → small empty state + "Connect GitHub" button → Account page.
- If connected → list of fixes grouped by category (Meta, Social, Structure, Indexing, Copy). Each row shows: title, file, before/after diff (using the existing diff styling pattern from `rewrite-headlines`), checkbox, confidence chip.
- Sticky footer: "Selected: N · Estimated impact: high/med/low · `Create draft PR` button" (gated by `ProGate`).
- After PR creation: success state with the GitHub PR link, plus a "Re-audit after merge" CTA.

The tab reuses `CheckRow` styling from the existing SEO Audit tab for consistency.

### 6. Persistence

- New `fix_pull_requests` table: `analysis_history_id`, `repo_connection_id`, `pr_url`, `branch`, `fixes_applied jsonb`, `status` (`open` / `merged` / `closed`), `created_at`. RLS scoped to user. Used to show "PR opened from this audit" on the detail page and to dedupe.

### 7. Pricing gate

Wrap the "Create draft PR" button and the planner call in the existing `isPro` check (`useSubscription`). Free users can browse the proposed fixes (great upgrade preview) but get the upgrade modal on submit.

## Out of scope (explicit, so we don't scope-creep)

- Webflow / Shopify / WordPress providers — only the interface ships.
- Auto-merge, GitHub Actions integration, scheduled re-audits.
- Layout / design / new-section fixes.
- Fix conflicts when the user has uncommitted changes — we just open the PR; GitHub handles conflicts.
- Multi-page / multi-file global rewrites (e.g. "rewrite this CTA on every page"). v1 is per-file, single-occurrence only.

## Technical notes (for the engineer)

- GitHub App JWT: `jose` (npm) inside the edge function, signed with `GITHUB_APP_PRIVATE_KEY` (PEM, stored as a secret), 10 min TTL.
- Installation access token: `POST /app/installations/{id}/access_tokens` → 1 hour token, never logged.
- All GitHub calls go through a thin wrapper that surfaces 403/404/422 as user-facing errors ("File no longer matches what the audit saw — re-run the audit").
- Mechanical fixes use a small set of regex + AST-free string surgeons keyed by check ID; no general-purpose HTML parser in the function (keeps it fast and predictable).
- Copy rewrites use `response_format: json_object` + zod validation server-side so a hallucinated `after` never gets committed.
- `plan-fixes` and `apply-fixes` are both JWT-required; user ownership of the connection and analysis row is re-verified server-side.

## Rollout

1. Ship the GitHub App + connection UI alone first ("Connect your repo — fix-PR feature coming soon"). Lets us validate install conversion before building the planner.
2. Ship the planner + read-only diff view next ("here's what we'd fix"). Surface upgrade prompt.
3. Ship the actual PR creation last.

Each step is independently shippable and useful for the user.
