import { z } from 'zod';

export const ATTRIBUTION_KEY = 'sitescoper:marketing-landing:v1';
export const SESSION_KEY = 'sitescoper:marketing-session:v1';
export const VISITS_KEY = 'sitescoper:marketing-paths:v1';
export const attributionSchema = z.object({
  utm_source: z.string().min(1).max(200),
  utm_medium: z.string().min(1).max(200),
  utm_campaign: z.string().max(200).nullable(),
  landing_page: z.string().min(1).max(2048).refine(p => p.startsWith('/') && !p.startsWith('//') && !/[?#]/.test(p)),
  referrer: z.string().max(2048),
  captured_at: z.string().datetime(),
});
export type MarketingAttribution = z.infer<typeof attributionSchema>;
export const visitSchema = attributionSchema.pick({ utm_source: true, utm_medium: true, utm_campaign: true, referrer: true }).extend({
  path: attributionSchema.shape.landing_page,
  session_id: z.string().uuid(),
});

export function safeReferrer(raw: string): string {
  try {
    const url = new URL(raw);
    return ['http:', 'https:'].includes(url.protocol) ? `${url.origin}${url.pathname}`.slice(0, 2048) : '';
  } catch { return ''; }
}

export function landingAttribution(url: URL, referrer: string, now: string): MarketingAttribution {
  return {
    utm_source: url.searchParams.get('utm_source')?.trim().slice(0, 200) || 'direct',
    utm_medium: url.searchParams.get('utm_medium')?.trim().slice(0, 200) || 'none',
    utm_campaign: url.searchParams.get('utm_campaign')?.trim().slice(0, 200) || null,
    landing_page: url.pathname.slice(0, 2048),
    referrer: safeReferrer(referrer),
    captured_at: now,
  };
}

export function visitAttribution(url: URL, stored: MarketingAttribution) {
  return {
    utm_source: url.searchParams.get('utm_source')?.trim().slice(0, 200) || stored.utm_source,
    utm_medium: url.searchParams.get('utm_medium')?.trim().slice(0, 200) || stored.utm_medium,
    utm_campaign: url.searchParams.get('utm_campaign')?.trim().slice(0, 200) || stored.utm_campaign,
  };
}

let fallbackLanding: MarketingAttribution | undefined;
let fallbackSession: string | undefined;
const fallbackPaths = new Set<string>();

export function readLandingAttribution(): MarketingAttribution {
  try {
    const raw = localStorage.getItem(ATTRIBUTION_KEY);
    if (raw) {
      const parsed = attributionSchema.safeParse(JSON.parse(raw));
      if (parsed.success) return parsed.data;
    }
  } catch { /* Storage denial must not block the app. */ }
  fallbackLanding ??= landingAttribution(new URL(window.location.href), document.referrer, new Date().toISOString());
  try { localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(fallbackLanding)); } catch { /* Best effort. */ }
  return fallbackLanding;
}

/** A random identifier expires after 30 minutes of inactivity; no device characteristics are collected. */
export function marketingSession(): string {
  const now = Date.now();
  try {
    const raw = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    const active = raw && z.string().uuid().safeParse(raw.id).success && now - raw.last_seen < 30 * 60 * 1000;
    const id: string = active ? raw.id : crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, JSON.stringify({ id, last_seen: now }));
    return id;
  } catch {
    fallbackSession ??= crypto.randomUUID();
    return fallbackSession;
  }
}

export function reserveVisit(sessionId: string, path: string): boolean {
  const key = `${sessionId}:${path}`;
  if (fallbackPaths.has(key)) return false;
  try {
    const data = JSON.parse(localStorage.getItem(VISITS_KEY) || 'null');
    const paths: string[] = data?.session_id === sessionId && Array.isArray(data.paths) ? data.paths : [];
    if (paths.includes(path)) return false;
    localStorage.setItem(VISITS_KEY, JSON.stringify({ session_id: sessionId, paths: [...paths, path] }));
  } catch { /* In-memory dedupe remains available. */ }
  fallbackPaths.add(key);
  return true;
}