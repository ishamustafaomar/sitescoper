// Tiny, dependency-free module so callers that only need to know
// sandbox-vs-live (e.g. landing page passing `environment` to edge
// functions) don't pull `@stripe/stripe-js` into their chunk.
import { FREE_PRO_MODE } from './free-access';

export type StripeEnv = 'sandbox' | 'live';

const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN;

export function getStripeEnvironment(): StripeEnv {
  // Early access: while Pro is free for everyone, never resolve to `live`,
  // even if the deployment is configured with a live publishable key. This
  // guarantees no real money can be charged if a checkout flow is reached.
  if (FREE_PRO_MODE) return 'sandbox';
  return clientToken?.startsWith('pk_test_') ? 'sandbox' : 'live';
}