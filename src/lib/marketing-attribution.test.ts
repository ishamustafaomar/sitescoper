import { describe, expect, it } from 'vitest';
import { landingAttribution, visitAttribution, visitSchema, safeReferrer, reserveVisit } from './marketing-attribution';

describe('first-party attribution rules', () => {
  const landing = landingAttribution(new URL('https://sitescoper.com/?utm_source=test&utm_medium=test&utm_campaign=launch'), 'https://example.com/article?email=private#secret', '2026-10-17T05:18:00.000Z');
  it('records concrete landing UTM values', () => {
    expect(landing).toMatchObject({ utm_source: 'test', utm_medium: 'test', utm_campaign: 'launch', landing_page: '/' });
  });
  it('retains UTMs on subsequent pages without a query string', () => {
    expect(visitAttribution(new URL('https://sitescoper.com/auth'), landing)).toEqual({ utm_source: 'test', utm_medium: 'test', utm_campaign: 'launch' });
  });
  it('uses current URL UTMs before stored landing UTMs', () => {
    expect(visitAttribution(new URL('https://sitescoper.com/blog?utm_source=referral'), landing).utm_source).toBe('referral');
  });
  it('records direct/none when absent', () => {
    expect(landingAttribution(new URL('https://sitescoper.com/'), '', '2026-10-17T05:18:00.000Z')).toMatchObject({ utm_source: 'direct', utm_medium: 'none', utm_campaign: null });
  });
  it('logs once per session per path and permits a different session or path', () => {
    expect(reserveVisit('session-a', '/compare')).toBe(true);
    expect(reserveVisit('session-a', '/compare')).toBe(false);
    expect(reserveVisit('session-a', '/pricing')).toBe(true);
    expect(reserveVisit('session-b', '/compare')).toBe(true);
  });
  it('does not collect referrer query strings or fragments', () => {
    expect(safeReferrer('https://example.com/article?email=private#secret')).toBe('https://example.com/article');
  });
  it('rejects external paths and forged user IDs are stripped', () => {
    const input = { path: '/', ...landing, session_id: '31bd3112-dbb7-40fc-8f32-4e86b4acdb6c', user_id: 'forged' };
    expect(visitSchema.safeParse({ ...input, path: '//external.com' }).success).toBe(false);
    expect(visitSchema.parse(input)).not.toHaveProperty('user_id');
  });
});