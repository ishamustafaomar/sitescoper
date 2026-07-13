## Goal

Port the v2 design bundle (currently sitting untouched at `public/ui-v2.html`) into the real React routes so the live site reflects the new visual system. All existing data flows (auth, scans, subscriptions, Stripe, Supabase queries) stay wired — only presentation changes.

## Screens in scope

The v2 bundle contains 5 screens; each maps to an existing route:

| v2 screen  | Real route                                | File(s) to rebuild |
|------------|-------------------------------------------|--------------------|
| Landing    | `/`                                       | `src/pages/Index.tsx` + landing components |
| Scanning   | in-progress state of `/` after submit     | `src/components/ScanningAnimation.tsx` + `StreamingProgress.tsx` |
| Report     | `/analysis/:id`                           | `src/pages/AnalysisDetail.tsx` + `AnalysisPanel.tsx`, `ScoreRing.tsx`, `VerdictCard.tsx`, `ImpactMatrix.tsx`, `SuggestionCard.tsx` |
| Dashboard  | `/dashboard`                              | `src/pages/Dashboard.tsx` + `dashboard/*` panels, `WebsiteCard.tsx`, `StatsOverview.tsx` |
| Pricing    | `/pricing`                                | `src/pages/Pricing.tsx` |

Global chrome:
- `src/components/AppHeader.tsx` — sticky blurred header with pill nav (Analyze / Dashboard / Compare-PRO / Pricing), theme toggle, avatar menu.
- `src/components/SiteFooter.tsx` — refined footer to match.

## Approach

1. **Design tokens (small edit, high leverage).** The v2 bundle uses the same token names we already have (`--background`, `--card`, `--primary`, `--muted`, `--border`, `--font-heading`, `--font-body`) plus one new one (`--primary-alt` for the secondary blur/gradient stop). Update `src/index.css`:
   - Add `--primary-alt` in light and dark.
   - Tune `--radius`, shadow tokens, and dark `--background`/`--card` values to match the v2 palette.
   - Keep Space Grotesk + Inter (already declared). No Google Fonts change needed.
2. **Rebuild routes top-down.** For each screen:
   - Replicate the v2 layout using existing shadcn primitives + Tailwind utilities driven by tokens (no hard-coded hex, no `text-white`/`bg-black`).
   - Wire the same hooks/queries the current page uses (`useAuth`, `useSubscription`, analysis fetch, etc.) into the new markup.
   - Keep all routes, guards, and side effects (`ProtectedRoute`, `OnboardingGuard`, canonical/SEO tags) unchanged.
3. **Motion.** Convert v2's `ssRise` / `ssBob` / `ssPing` keyframes into Framer Motion variants where components already use `framer-motion`; keep CSS keyframes for the scanning halo.
4. **Cleanup.** Delete `public/ui-v2.html` once ports land (leave until final step in case we want to diff).

## Non-goals

- No new features, no schema changes, no edge-function edits.
- No copy rewrites beyond what the v2 design shows.
- Compare page, blog, admin, onboarding, account, auth — left as-is (not in the v2 bundle).
- Mobile-specific redesign beyond what v2 already implies via its responsive inline styles.

## Technical notes

- v2 uses heavy inline styles because it was exported from a design tool. In the port we translate those to Tailwind classes + token references so dark mode, theming, and the existing `next-themes` toggle keep working.
- The header avatar circle currently shows `I` in v2 — we'll wire it to the user's initial from `useAuth`.
- The "PRO" lock chip on the Compare nav item will use `useSubscription().isPro` to hide/show, matching current behavior.
- Scanning screen will read from the existing `StreamingProgress` state; no new backend hooks.
- Report screen keeps `AnalysisPanel`'s data contract; we restyle the sub-cards (`ScoreRing`, `VerdictCard`, `ImpactMatrix`, `SuggestionCard`) rather than replace their props.

## Suggested execution order (each is a self-contained commit)

```text
1. Tokens + header + footer         (foundation, visible everywhere)
2. Landing (/)
3. Scanning state (mid-analysis)
4. Report (/analysis/:id)
5. Dashboard (/dashboard)
6. Pricing (/pricing)
7. Remove public/ui-v2.html
```

## Risks

- Large diff surface across ~20 files; visual regressions likely on sub-views not shown in v2 (e.g. shared analysis, PDF export). Will spot-check `/share/:token` and PDF render after the port and patch styling deltas.
- Framer Motion + `motion` usages in current components need to keep working with the new markup — we reuse existing motion wrappers where possible instead of rewriting them.