# Forward email replies to your Gmail

## The problem
The outreach emails go from `noreply@sitescoper.com`. There's no real inbox behind that, so right now if any of the 25 people hit "Reply", their reply hits a black hole.

The Lovable email system goes through Mailgun, but inbound-route forwarding (catch `noreply@sitescoper.com` → forward to Gmail) isn't exposed as a Lovable feature. So we shouldn't try to forward mail to that mailbox — we should make replies go straight to your Gmail in the first place.

## The fix: add a Reply-To header
Email supports a `Reply-To` header that's separate from `From`. When you set it, the recipient still sees the email coming from `noreply@sitescoper.com`, but the moment they hit Reply their mail client addresses it to `omarmlaptop@gmail.com`. Replies land directly in your Gmail inbox — no forwarding, no inbound config, nothing extra to maintain.

## Changes

1. **`send-transactional-email` edge function**
   - Accept an optional `replyTo` field in the request body.
   - Include `reply_to` in the payload enqueued to Mailgun when present.

2. **`process-email-queue` edge function**
   - Pass `reply_to` through to the Mailgun send call (`h:Reply-To` header) when it's in the payload.

3. **Defaults for `personal-outreach` template**
   - Default `replyTo` to `omarmlaptop@gmail.com` for this template specifically, so any future personal-outreach send automatically routes replies to your Gmail without you having to remember.

4. **Re-deploy** both edge functions.

## What this does NOT do
- It does not resend the 25 emails I already sent today — those went out without Reply-To, so any replies to them will bounce/disappear. If you want, after the change I can re-send to the same list (idempotency keys would need bumping).
- It does not create an inbox at `noreply@sitescoper.com`.

## Optional follow-up
If you'd rather show your real Gmail in the From line (so it looks fully personal), I can change the From for `personal-outreach` to `Omar <omarmlaptop@gmail.com>` via SENDER_DOMAIN — but deliverability is worse because Gmail's DKIM isn't signing through your domain. Reply-To is the cleaner option.

## Question
Do you want me to also re-send today's outreach to the same 25 people once Reply-To is in place, so any replies they send actually reach you?
