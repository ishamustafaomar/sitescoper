import { createClient } from '@supabase/supabase-js';

export function sameOriginRequest(request: Request): boolean {
  const origin = request.headers.get('origin');
  const site = request.headers.get('sec-fetch-site');
  return origin === new URL(request.url).origin && (!site || site === 'same-origin');
}

export async function verifiedMarketingCaller(request: Request) {
  const header = request.headers.get('authorization');
  if (!header) return null;
  if (!header.startsWith('Bearer ')) throw new Error('Unauthorized');
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Auth unavailable');
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: header }, fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      headers.set('apikey', key);
      return fetch(input, { ...init, headers });
    } },
  });
  const { data, error } = await client.auth.getUser(header.slice(7));
  if (error || !data.user) throw new Error('Unauthorized');
  return { client, user: data.user };
}