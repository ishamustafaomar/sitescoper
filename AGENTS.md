# Project rules

- Analytics conversations use account-owned database threads and route-derived IDs; AI tools read through the caller's RLS client, and publishing or paid generation requires explicit user review.
- Analytics uses AI Elements and the AI SDK UI-message stream; server tools never call server-function RPC stubs or claim unconnected external actions succeeded.

- Generate social promotional artwork through the authenticated streaming image route using source image uploads and owner-reviewed wording; keep audit scoring out of creative inputs so ads reflect the actual business.

- Keep Compare's educational content publicly rendered, with live comparisons inside the existing subscription gate; search visitors need readable content without changing paid access.
- Keep illustrative comparison values separate from live analysis results and label them explicitly; example numbers must never look like measured customer data.
- Competitor comparison pages cite dated public provider claims, distinguish unknown features from absent ones, and never imply a hands-on benchmark without testing; this keeps comparisons checkable.
- Keep dashboard score averaging in the tested browser-safe health helper; missing scores must remain distinct from measured zero scores.
- Marketing attribution lives in a non-blocking root observer with bounded same-origin ingestion, database session/path dedupe, first-write signup capture and an admin-checked aggregate RPC; this preserves product flows and keeps raw visit data private.