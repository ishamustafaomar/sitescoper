import { createFileRoute } from '@tanstack/react-router';
import { safeReferrer, visitSchema } from '@/lib/marketing-attribution';

export const Route = createFileRoute('/api/public/page-visit')({
  staticData: { sitemap: false },
  server: { handlers: { POST: async ({ request }) => {
    const { sameOriginRequest, verifiedMarketingCaller } = await import('@/lib/marketing-attribution.server');
    // Anonymous telemetry is write-only, same-origin, bounded and uniquely deduplicated.
    if (!sameOriginRequest(request)) return new Response(null, { status: 403 });
    const text = await request.text();
    if (text.length > 8192) return new Response(null, { status: 413 });
    let raw: unknown;
    try { raw = JSON.parse(text); } catch { return new Response(null, { status: 400 }); }
    const parsed = visitSchema.safeParse(raw);
    if (!parsed.success) return new Response(null, { status: 400 });
    try {
      const caller = await verifiedMarketingCaller(request);
      const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
      const { error } = await supabaseAdmin.from('page_visits').upsert({
        ...parsed.data, referrer: safeReferrer(parsed.data.referrer), user_id: caller?.user.id ?? null,
      }, { onConflict: 'session_id,path', ignoreDuplicates: true });
      if (error) return new Response(null, { status: 503 });
      return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
    } catch { return new Response(null, { status: 401 }); }
  } } },
});