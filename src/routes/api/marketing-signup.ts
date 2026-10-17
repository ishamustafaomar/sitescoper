import { createFileRoute } from '@tanstack/react-router';
import { attributionSchema, safeReferrer } from '@/lib/marketing-attribution';

export const Route = createFileRoute('/api/marketing-signup')({
  server: { handlers: { POST: async ({ request }) => {
    const { sameOriginRequest, verifiedMarketingCaller } = await import('@/lib/marketing-attribution.server');
    if (!sameOriginRequest(request)) return new Response(null, { status: 403 });
    const text = await request.text();
    if (text.length > 8192) return new Response(null, { status: 413 });
    let raw: unknown;
    try { raw = JSON.parse(text); } catch { return new Response(null, { status: 400 }); }
    const parsed = attributionSchema.safeParse(raw);
    if (!parsed.success) return new Response(null, { status: 400 });
    try {
      const caller = await verifiedMarketingCaller(request);
      if (!caller) return new Response(null, { status: 401 });
      const { error } = await caller.client.rpc('record_signup_attribution', { a: { ...parsed.data, referrer: safeReferrer(parsed.data.referrer) } });
      return new Response(null, { status: error ? 503 : 204, headers: { 'Cache-Control': 'no-store' } });
    } catch { return new Response(null, { status: 401 }); }
  } } },
});