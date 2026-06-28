import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/semrush';

function rowsToObjects(payload: any): any[] {
  const cols: string[] = payload?.data?.columnNames ?? [];
  const rows: any[][] = payload?.data?.rows ?? [];
  return rows.map((r) => Object.fromEntries(cols.map((c, i) => [c, r[i]])));
}

async function semrushGet(path: string, params: Record<string, string>) {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  const SEMRUSH_API_KEY = Deno.env.get('SEMRUSH_API_KEY');
  if (!LOVABLE_API_KEY || !SEMRUSH_API_KEY) return null;
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${GATEWAY_URL}${path}?${qs}`, {
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      'X-Connection-Api-Key': SEMRUSH_API_KEY,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`Semrush ${path} failed [${res.status}]: ${text}`);
    return { error: text, status: res.status };
  }
  return await res.json();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    // Require an authenticated user before calling out to Semrush.
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const sb = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    );
    const { data: claims, error: authErr } = await sb.auth.getClaims(
      authHeader.replace('Bearer ', ''),
    );
    if (authErr || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const SEMRUSH_API_KEY = Deno.env.get('SEMRUSH_API_KEY');
    if (!SEMRUSH_API_KEY) {
      return new Response(JSON.stringify({ connected: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { url, database = 'us' } = await req.json();
    if (!url || typeof url !== 'string') {
      return new Response(JSON.stringify({ error: 'url required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    let domain: string;
    try { domain = new URL(url).hostname.replace(/^www\./, ''); }
    catch { return new Response(JSON.stringify({ error: 'invalid url' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }); }

    const [ranksRes, organicRes, blOverviewRes, blRefdomainsRes] = await Promise.all([
      semrushGet('/domains/domain_ranks', { domain, database, export_columns: 'Db,Dn,Rk,Or,Ot,Oc,Ad,At,Ac' }),
      semrushGet('/domains/domain_organic', { domain, database, display_limit: '15', export_columns: 'Ph,Po,Nq,Cp,Tr,Ur' }),
      semrushGet('/backlinks/backlinks_overview', { target: domain, target_type: 'root_domain' }),
      semrushGet('/backlinks/backlinks_refdomains', { target: domain, target_type: 'root_domain', display_limit: '10' }),
    ]);

    const quotaError = [ranksRes, organicRes, blOverviewRes, blRefdomainsRes]
      .find((r: any) => r?.error && /TOTAL LIMIT EXCEEDED|limit exceeded/i.test(String(r.error)));

    const ranks = rowsToObjects(ranksRes)[0] || null;
    const organic = rowsToObjects(organicRes);
    const blOverview = rowsToObjects(blOverviewRes)[0] || null;
    const blRefdomains = rowsToObjects(blRefdomainsRes);

    return new Response(JSON.stringify({
      connected: true,
      domain,
      quotaExceeded: !!quotaError,
      ranks,
      organic,
      backlinks: blOverview,
      refdomains: blRefdomains,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err: any) {
    console.error('semrush-overview error', err);
    return new Response(JSON.stringify({ error: 'SEMrush lookup failed. Please try again.' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});