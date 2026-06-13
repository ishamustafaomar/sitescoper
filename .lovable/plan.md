## On-Page SEO Audit (Firecrawl)

Add a new **SEO Audit** tab inside the existing analysis detail flow. It runs a focused Firecrawl scrape of the analyzed URL and grades on-page SEO signals — no Semrush, no multi-page crawl.

### What it checks

For the single URL the user analyzed:

- **Title tag** — present, length 30–60 chars, not generic ("Home", "Untitled")
- **Meta description** — present, length 70–160 chars
- **Canonical** — `<link rel="canonical">` present, absolute URL, matches page URL
- **Headings** — exactly one `<h1>`, sensible `<h2>`/`<h3>` hierarchy, no skipped levels
- **Open Graph** — `og:title`, `og:description`, `og:image`, `og:url` present
- **Twitter card** — `twitter:card`, `twitter:title`, `twitter:description`
- **Robots / indexability** — `<meta name="robots">`, `noindex` flag
- **Lang attribute** — `<html lang="…">` present
- **Favicon** — `<link rel="icon">` present
- **Duplicate / missing metadata** — empty title, empty description, duplicate `og:*` tags
- **Structured data** — count of `application/ld+json` blocks and their `@type`s

Each check returns `pass | warn | fail` + a short fix hint. Overall on-page score = weighted pass rate.

### Architecture

```text
[SEO Audit tab] ──► supabase.functions.invoke("seo-audit", { url })
                          │
                          ▼
                Firecrawl /v2/scrape (formats: html, links, metadata)
                          │
                          ▼
                Parse <head> + headings server-side, run rules
                          │
                          ▼
                { score, checks[], head: {...}, headings: [...] }
```

### Files

**New**
- `supabase/functions/seo-audit/index.ts` — auth-checked edge function (JWT required + `verify_jwt = true` in `config.toml`); validates URL with zod; calls Firecrawl REST v2 with `formats: ["html","links","summary"]`; parses head/headings with a small regex-based HTML inspector (no DOM lib needed in Deno); returns the audit JSON.
- `src/components/seo-audit/SeoAuditTab.tsx` — tab content. Loading state, score ring, grouped check list (passed / warnings / failed), raw `<head>` preview, headings outline.
- `src/components/seo-audit/CheckRow.tsx` — single check row (status icon, name, detail, fix hint).
- `src/lib/seoAudit.ts` — client type definitions and `runSeoAudit(url)` wrapper around `supabase.functions.invoke`.

**Edited**
- `src/pages/AnalysisDetail.tsx` — add an "SEO Audit" tab next to the existing categories tabs; lazy-trigger the audit the first time the tab opens so the initial analysis isn't slowed down.
- `supabase/config.toml` — add `[functions.seo-audit] verify_jwt = true`.

### UX

- Tab appears immediately; audit runs on first click and caches the result in component state for the session.
- Score ring + 1-line summary at the top ("8 passed, 2 warnings, 1 failed").
- Collapsible sections: **Failed**, **Warnings**, **Passed** (collapsed by default), **Raw head**.
- Each failed/warning row has a one-line "How to fix" hint.
- Re-run button to re-scrape.

### Out of scope (call out so we don't surprise the user)

- No multi-page duplicate-detection (single URL only).
- No backlink / authority data (that's Semrush, already in the dashboard).
- No automatic fix-application — read-only audit.
- No persistence to `analysis_history` — results are session-only; can be added later if needed.

### Cost

~1 Firecrawl credit per audit run.
