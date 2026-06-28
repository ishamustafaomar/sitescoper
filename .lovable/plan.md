## Goal

Let you paste a list of recipients (and optional per-person tweaks) into chat, and I'll send a personal 1-to-1 SiteScoper email to each one — from `notify.sitescoper.com`, using the email infrastructure that's already set up.

## How it will work

1. You give me, in chat:
   - The list of email addresses (and optional names)
   - The message you want sent (I can also draft it and you approve)
   - A subject line (or I'll suggest one)
2. I send each email individually through the existing `send-transactional-email` function, with each recipient's name merged in so it reads as a personal note — not a blast.
3. I report back: how many sent, any that bounced or were on the suppression list.

No new UI, no new tables. Nothing automated or recurring.

## What I'll add to the project (one small thing)

A new email template `personal-outreach` under `supabase/functions/_shared/transactional-email-templates/`:
- Plain-text-feeling layout (no big buttons, no marketing chrome) so it reads like a personal email from you
- Props: `name`, `body` (the message), optional `signature`
- Registered in `registry.ts` and deployed

## Guardrails

- I'll cap each batch at ~50 recipients per send and pace them so we don't trip rate limits or hurt your new-domain reputation.
- Suppressed/unsubscribed addresses are skipped automatically by the existing send function.
- Marketing blasts (same generic pitch to a big list) aren't supported — if a request looks like that, I'll flag it and suggest a dedicated marketing tool instead.

## What I need from you next message

- The list of emails (+ names if you have them)
- The message body (or "draft it for me" + a few bullets on what to say)
- Subject line (or "you pick")