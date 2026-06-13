import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3.23.8';

const BodySchema = z.object({ url: z.string().url().max(2048) });

type CheckStatus = 'pass' | 'warn' | 'fail';
interface Check {
  id: string;
  name: string;
  status: CheckStatus;
  detail: string;
  fix?: string;
  group: 'meta' | 'social' | 'structure' | 'indexing';
}

function matchAll(html: string, re: RegExp): RegExpMatchArray[] {
  return Array.from(html.matchAll(re));
}

function getMeta(html: string, attr: 'name' | 'property', key: string): string[] {
  const re = new RegExp(
    `<meta[^>]*\\s${attr}=["']${key.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}["'][^>]*>`,
    'gi',
  );
  return matchAll(html, re)
    .map((m) => {
      const cm = m[0].match(/content=["']([^"']*)["']/i);
      return cm ? cm[1] : '';
    })
    .filter((v) => v !== undefined);
}

function parseHead(html: string, pageUrl: string) {
  const headMatch = html.match(/<head[\s\S]*?<\/head>/i);
  const head = headMatch ? headMatch[0] : html;

  const titleMatch = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';

  const descriptions = getMeta(head, 'name', 'description');
  const robots = getMeta(head, 'name', 'robots');
  const viewport = getMeta(head, 'name', 'viewport');

  const canonicalMatches = matchAll(head, /<link[^>]*rel=["']canonical["'][^>]*>/gi).map((m) => {
    const cm = m[0].match(/href=["']([^"']*)["']/i);
    return cm ? cm[1] : '';
  });

  const faviconMatches = matchAll(head, /<link[^>]*rel=["'][^"']*icon[^"']*["'][^>]*>/gi);

  const langMatch = html.match(/<html[^>]*\blang=["']([^"']+)["']/i);
  const lang = langMatch ? langMatch[1] : '';

  const og = {
    title: getMeta(head, 'property', 'og:title'),
    description: getMeta(head, 'property', 'og:description'),
    image: getMeta(head, 'property', 'og:image'),
    url: getMeta(head, 'property', 'og:url'),
    type: getMeta(head, 'property', 'og:type'),
  };
  const tw = {
    card: getMeta(head, 'name', 'twitter:card'),
    title: getMeta(head, 'name', 'twitter:title'),
    description: getMeta(head, 'name', 'twitter:description'),
  };

  const jsonLdBlocks = matchAll(html, /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
    .map((m) => {
      try {
        const parsed = JSON.parse(m[1].trim());
        const arr = Array.isArray(parsed) ? parsed : [parsed];
        return arr.map((x: any) => x?.['@type'] ?? 'Unknown');
      } catch {
        return ['Invalid JSON-LD'];
      }
    })
    .flat();

  const h1s = matchAll(html, /<h1[^>]*>([\s\S]*?)<\/h1>/gi).map((m) => m[1].replace(/<[^>]+>/g, '').trim());
  const headings = matchAll(html, /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi).map((m) => ({
    level: Number(m[1]),
    text: m[2].replace(/<[^>]+>/g, '').trim(),
  }));

  return {
    title,
    description: descriptions[0] ?? '',
    descriptions,
    canonical: canonicalMatches[0] ?? '',
    canonicalCount: canonicalMatches.length,
    favicon: faviconMatches.length > 0,
    lang,
    robots: robots[0] ?? '',
    viewport: viewport[0] ?? '',
    og,
    twitter: tw,
    jsonLd: jsonLdBlocks,
    h1s,
    headings,
    pageUrl,
  };
}

function runChecks(p: ReturnType<typeof parseHead>): Check[] {
  const checks: Check[] = [];
  const generic = ['home', 'untitled', 'document', 'index'];

  // Title
  if (!p.title) {
    checks.push({ id: 'title', name: 'Title tag', status: 'fail', detail: 'Missing <title> tag.', fix: 'Add a unique <title> 30–60 characters long.', group: 'meta' });
  } else if (p.title.length < 30) {
    checks.push({ id: 'title', name: 'Title tag', status: 'warn', detail: `Title is short (${p.title.length} chars): "${p.title}"`, fix: 'Aim for 30–60 characters.', group: 'meta' });
  } else if (p.title.length > 60) {
    checks.push({ id: 'title', name: 'Title tag', status: 'warn', detail: `Title is long (${p.title.length} chars) — may be truncated in search results.`, fix: 'Trim to ≤60 characters.', group: 'meta' });
  } else if (generic.includes(p.title.toLowerCase())) {
    checks.push({ id: 'title', name: 'Title tag', status: 'warn', detail: `Generic title: "${p.title}"`, fix: 'Use a descriptive, keyword-rich title.', group: 'meta' });
  } else {
    checks.push({ id: 'title', name: 'Title tag', status: 'pass', detail: `"${p.title}" (${p.title.length} chars)`, group: 'meta' });
  }

  // Description
  if (!p.description) {
    checks.push({ id: 'desc', name: 'Meta description', status: 'fail', detail: 'Missing <meta name="description">.', fix: 'Add a 70–160 character meta description summarising the page.', group: 'meta' });
  } else if (p.descriptions.length > 1) {
    checks.push({ id: 'desc', name: 'Meta description', status: 'fail', detail: `${p.descriptions.length} description tags found — only one is allowed.`, fix: 'Remove duplicate <meta name="description"> tags.', group: 'meta' });
  } else if (p.description.length < 70) {
    checks.push({ id: 'desc', name: 'Meta description', status: 'warn', detail: `Description is short (${p.description.length} chars).`, fix: 'Aim for 70–160 characters.', group: 'meta' });
  } else if (p.description.length > 160) {
    checks.push({ id: 'desc', name: 'Meta description', status: 'warn', detail: `Description is long (${p.description.length} chars) — may be truncated.`, fix: 'Trim to ≤160 characters.', group: 'meta' });
  } else {
    checks.push({ id: 'desc', name: 'Meta description', status: 'pass', detail: `${p.description.length} characters.`, group: 'meta' });
  }

  // Canonical
  if (!p.canonical) {
    checks.push({ id: 'canonical', name: 'Canonical URL', status: 'warn', detail: 'No <link rel="canonical"> found.', fix: 'Add a canonical link pointing to the preferred URL of this page.', group: 'indexing' });
  } else if (p.canonicalCount > 1) {
    checks.push({ id: 'canonical', name: 'Canonical URL', status: 'fail', detail: `${p.canonicalCount} canonical tags found — only one is allowed.`, fix: 'Remove duplicate canonical tags.', group: 'indexing' });
  } else if (!/^https?:\/\//i.test(p.canonical)) {
    checks.push({ id: 'canonical', name: 'Canonical URL', status: 'warn', detail: `Canonical is not an absolute URL: "${p.canonical}"`, fix: 'Use an absolute https URL.', group: 'indexing' });
  } else {
    checks.push({ id: 'canonical', name: 'Canonical URL', status: 'pass', detail: p.canonical, group: 'indexing' });
  }

  // H1
  if (p.h1s.length === 0) {
    checks.push({ id: 'h1', name: 'H1 heading', status: 'fail', detail: 'No <h1> on the page.', fix: 'Add exactly one descriptive <h1>.', group: 'structure' });
  } else if (p.h1s.length > 1) {
    checks.push({ id: 'h1', name: 'H1 heading', status: 'warn', detail: `${p.h1s.length} <h1> tags found.`, fix: 'Use a single <h1>; promote the rest to <h2>.', group: 'structure' });
  } else {
    checks.push({ id: 'h1', name: 'H1 heading', status: 'pass', detail: `"${p.h1s[0].slice(0, 80)}"`, group: 'structure' });
  }

  // Heading hierarchy
  let skipped = false;
  let prev = 0;
  for (const h of p.headings) {
    if (prev && h.level > prev + 1) { skipped = true; break; }
    prev = h.level;
  }
  if (p.headings.length === 0) {
    checks.push({ id: 'headings', name: 'Heading hierarchy', status: 'warn', detail: 'No headings detected.', group: 'structure' });
  } else if (skipped) {
    checks.push({ id: 'headings', name: 'Heading hierarchy', status: 'warn', detail: 'Heading levels are skipped (e.g. h2 → h4).', fix: 'Keep heading order sequential.', group: 'structure' });
  } else {
    checks.push({ id: 'headings', name: 'Heading hierarchy', status: 'pass', detail: `${p.headings.length} headings, sequential order.`, group: 'structure' });
  }

  // Lang
  if (!p.lang) {
    checks.push({ id: 'lang', name: 'Language attribute', status: 'warn', detail: 'No lang="" on <html>.', fix: 'Add lang="en" (or appropriate language) to the <html> tag.', group: 'structure' });
  } else {
    checks.push({ id: 'lang', name: 'Language attribute', status: 'pass', detail: `lang="${p.lang}"`, group: 'structure' });
  }

  // Viewport
  if (!p.viewport) {
    checks.push({ id: 'viewport', name: 'Viewport meta', status: 'warn', detail: 'No viewport meta tag — page may not be mobile-friendly.', fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">.', group: 'structure' });
  } else {
    checks.push({ id: 'viewport', name: 'Viewport meta', status: 'pass', detail: p.viewport, group: 'structure' });
  }

  // Favicon
  checks.push({
    id: 'favicon',
    name: 'Favicon',
    status: p.favicon ? 'pass' : 'warn',
    detail: p.favicon ? 'Favicon link present.' : 'No favicon link found.',
    fix: p.favicon ? undefined : 'Add <link rel="icon" href="/favicon.ico">.',
    group: 'structure',
  });

  // Robots / indexability
  const noindex = /noindex/i.test(p.robots);
  if (noindex) {
    checks.push({ id: 'robots', name: 'Indexability', status: 'fail', detail: `Page is blocked from indexing: "${p.robots}"`, fix: 'Remove "noindex" from the robots meta if you want this page in search results.', group: 'indexing' });
  } else {
    checks.push({ id: 'robots', name: 'Indexability', status: 'pass', detail: p.robots ? `robots: ${p.robots}` : 'No robots meta — page is indexable by default.', group: 'indexing' });
  }

  // Open Graph
  const ogMissing = ['title', 'description', 'image', 'url'].filter((k) => !(p.og as any)[k]?.length);
  if (ogMissing.length === 4) {
    checks.push({ id: 'og', name: 'Open Graph tags', status: 'fail', detail: 'No Open Graph tags found.', fix: 'Add og:title, og:description, og:image and og:url for rich social previews.', group: 'social' });
  } else if (ogMissing.length > 0) {
    checks.push({ id: 'og', name: 'Open Graph tags', status: 'warn', detail: `Missing: ${ogMissing.map((k) => `og:${k}`).join(', ')}`, fix: 'Add the missing Open Graph tags.', group: 'social' });
  } else {
    checks.push({ id: 'og', name: 'Open Graph tags', status: 'pass', detail: 'All core og:* tags present.', group: 'social' });
  }

  // Twitter
  const twMissing = ['card', 'title', 'description'].filter((k) => !(p.twitter as any)[k]?.length);
  if (twMissing.length === 3) {
    checks.push({ id: 'twitter', name: 'Twitter Card', status: 'warn', detail: 'No Twitter Card tags found.', fix: 'Add twitter:card, twitter:title and twitter:description.', group: 'social' });
  } else if (twMissing.length > 0) {
    checks.push({ id: 'twitter', name: 'Twitter Card', status: 'warn', detail: `Missing: ${twMissing.map((k) => `twitter:${k}`).join(', ')}`, group: 'social' });
  } else {
    checks.push({ id: 'twitter', name: 'Twitter Card', status: 'pass', detail: `card=${p.twitter.card[0]}`, group: 'social' });
  }

  // Structured data
  if (p.jsonLd.length === 0) {
    checks.push({ id: 'jsonld', name: 'Structured data (JSON-LD)', status: 'warn', detail: 'No JSON-LD structured data found.', fix: 'Add schema.org JSON-LD (Organization, WebSite, Article, etc.) for rich results.', group: 'social' });
  } else {
    checks.push({ id: 'jsonld', name: 'Structured data (JSON-LD)', status: 'pass', detail: `${p.jsonLd.length} block(s): ${p.jsonLd.join(', ')}`, group: 'social' });
  }

  return checks;
}

function computeScore(checks: Check[]) {
  const weights: Record<CheckStatus, number> = { pass: 1, warn: 0.5, fail: 0 };
  const total = checks.length;
  if (!total) return 0;
  const sum = checks.reduce((acc, c) => acc + weights[c.status], 0);
  return Math.round((sum / total) * 100);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Invalid url' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const { url } = parsed.data;

    const fcKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!fcKey) {
      return new Response(JSON.stringify({ error: 'Audit service is not configured.' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const fcRes = await fetch('https://api.firecrawl.dev/v2/scrape', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${fcKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        formats: ['html', 'links'],
        onlyMainContent: false,
      }),
    });
    const fcJson = await fcRes.json();
    if (!fcRes.ok) {
      console.error('firecrawl error', fcRes.status, fcJson);
      const msg = fcRes.status === 402 ? 'Audit service is out of credits.' : 'Could not fetch the page.';
      return new Response(JSON.stringify({ error: msg }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const doc = fcJson.data ?? fcJson;
    const html: string = doc.html ?? doc.rawHtml ?? '';
    const metadata = doc.metadata ?? {};
    const finalUrl = metadata.sourceURL ?? metadata.url ?? url;

    if (!html) {
      return new Response(JSON.stringify({ error: 'Page returned no HTML.' }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const parsedHead = parseHead(html, finalUrl);
    const checks = runChecks(parsedHead);
    const score = computeScore(checks);

    return new Response(JSON.stringify({
      success: true,
      url: finalUrl,
      score,
      checks,
      head: {
        title: parsedHead.title,
        description: parsedHead.description,
        canonical: parsedHead.canonical,
        lang: parsedHead.lang,
        robots: parsedHead.robots,
        viewport: parsedHead.viewport,
        og: parsedHead.og,
        twitter: parsedHead.twitter,
        jsonLdTypes: parsedHead.jsonLd,
      },
      headings: parsedHead.headings.slice(0, 50),
      statusCode: metadata.statusCode,
    }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('seo-audit error', e);
    return new Response(JSON.stringify({ error: 'SEO audit failed. Please try again.' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});