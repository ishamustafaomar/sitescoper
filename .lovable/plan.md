# Fix: user can pay twice on the same email

## Why it happened
1. `create-checkout` passes `customer_email` instead of resolving a Stripe **Customer** and passing `customer:`. Every checkout creates a brand-new Customer under the same email, so Stripe has no idea the user already subscribed.
2. The Pricing page only hides the "Upgrade to Pro" button when `isPro === true`. `isPro` is driven by the `subscriptions` table, which is only written by the webhook. If the webhook is slow, missed, or the user clicks again before it lands (second tab, back button after return URL), the button is still live and a second checkout session succeeds.
3. There is no server-side guard in `create-checkout` that refuses to start a new subscription checkout when the user already has an active one in Stripe.

## Changes

### 1. `supabase/functions/create-checkout/index.ts`
- Add a `resolveOrCreateCustomer` helper (per the knowledge doc): search Stripe customers by `metadata['userId']`, fall back to email match, backfill `metadata.userId` on legacy matches, else create. Pass `customer: customerId` to `checkout.sessions.create` and drop `customer_email`.
- For subscription-mode prices, before creating the session, call `stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 5 })` and reject with `409 { error: "already_subscribed" }` if any subscription has status `active`, `trialing`, or `past_due` on the same `price.lookup_key`.
- Keep `allow_promotion_codes: true` and existing metadata on session + `subscription_data`.

### 2. `src/pages/Pricing.tsx`
- When the checkout invoke returns `error: "already_subscribed"` (or the edge function returns 409), close the dialog and show a toast: "You already have an active Pro subscription — manage it from Account." Link to `/account`.
- Disable the Upgrade button while the dialog is open to prevent a same-session double-click starting two sessions.

### 3. No schema / webhook changes
The webhook already upserts on `stripe_subscription_id`. The duplicate rows would still land as two rows historically, but the new guard prevents *creating* a second subscription in Stripe in the first place, which is the actual money problem.

## Manual cleanup (out of scope of this code change)
Refund + cancel the duplicate subscription for the affected user in Stripe. This plan does not touch existing data.

## Technical notes
- The `resolveOrCreateCustomer` helper is the exact pattern from the Stripe checkout knowledge — putting `userId` on the Customer makes future `customers.search` reads reliable and is what makes the "already subscribed" check work across sessions and devices.
- Guard is server-side so it survives any client-side race (fast double click, second tab, stale `isPro`).
