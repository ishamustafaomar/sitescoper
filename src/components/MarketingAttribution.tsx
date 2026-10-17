import { useEffect } from 'react';
import { useLocation } from '@tanstack/react-router';
import { useAuth } from '@/components/AuthProvider';
import { marketingSession, readLandingAttribution, reserveVisit, safeReferrer, visitAttribution } from '@/lib/marketing-attribution';

/** Non-blocking observation only; never owns or changes auth state. */
export function MarketingAttribution() {
  const location = useLocation();
  const { session, loading } = useAuth();
  useEffect(() => {
    const landing = readLandingAttribution();
    if (loading) return;
    const id = marketingSession();
    const url = new URL(window.location.href);
    if (!reserveVisit(id, url.pathname)) return;
    void fetch('/api/public/page-visit', {
      method: 'POST', keepalive: true,
      headers: { 'Content-Type': 'application/json', ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}) },
      body: JSON.stringify({ path: url.pathname, ...visitAttribution(url, landing), referrer: safeReferrer(document.referrer), session_id: id }),
    }).catch(() => { /* Attribution never interrupts navigation. */ });
  }, [location.pathname, location.searchStr, loading, session]);

  useEffect(() => {
    if (!session) return;
    const landing = readLandingAttribution();
    const created = Date.parse(session.user.created_at);
    if (created < Date.parse(landing.captured_at) - 5 * 60 * 1000 || Date.now() - created > 24 * 60 * 60 * 1000) return;
    const key = `sitescoper:signup-attributed:${session.user.id}`;
    try { if (localStorage.getItem(key)) return; } catch { /* Best effort. */ }
    void fetch('/api/marketing-signup', {
      method: 'POST', keepalive: true,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify(landing),
    }).then(response => {
      if (response.ok) try { localStorage.setItem(key, '1'); } catch { /* Best effort. */ }
    }).catch(() => { /* The next load can retry; signup is not blocked. */ });
  }, [session]);
  return null;
}