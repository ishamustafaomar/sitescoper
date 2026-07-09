## Goal
Correct the sponsorship brief's value prop #3 and update the in-app homepage copy so both accurately reflect SiteScoper's freemium model: **3 free scans/month after sign-up, then $19/mo Pro**.

## Current state
- Sponsorship brief draft has a misleading value prop #3 about pricing/sign-up.
- Homepage hero (`src/i18n/locales/en.json`) says:
  - `"free": "Free forever"`
  - `"noSignup": "No signup for first scan"`
- These conflict with the actual pricing page (`src/pages/Pricing.tsx`): free tier requires sign-up and is limited to 3 scans/month; Pro is $19/mo.

## Plan

### 1. Rewrite sponsorship brief value prop #3
Update the sponsorship brief to use the user's exact framing:

> **Value prop #3 — Freemium that respects your time:** Sign up and get 3 full website audits per month free. Upgrade to Pro for $19/month only when you want unlimited scans, competitor battle mode, AI chat with your report, and 1-click PDF exports.

Leave the rest of the brief (Main Content Message, value props #1–#2, Required Actions, Content examples) unchanged.

### 2. Update homepage hero copy
In `src/i18n/locales/en.json`, replace the inaccurate hero badges:
- `"noSignup": "No signup for first scan"` → `"signUpForThree": "Sign up for 3 free scans/month"`
- `"free": "Free forever"` → `"freemium": "Freemium — no card required"`

Also update the hero subtitle if needed so the offer is clear: free tier is 3 scans/month after sign-up, Pro is $19/mo.

### 3. Sync other locales
Check `src/i18n/locales/es.json` and `src/i18n/locales/fr.json` for the same keys and update them with equivalent translations.

### 4. Verify UI rendering
Confirm the hero badges render correctly in the preview and that no other components break from the key renames.

## Files to change
- Sponsorship brief (delivered in chat)
- `src/i18n/locales/en.json`
- `src/i18n/locales/es.json`
- `src/i18n/locales/fr.json`

## Out of scope
- Pricing page (`src/pages/Pricing.tsx`) is already accurate and will not be changed.
- Checkout, subscription logic, or Stripe configuration.