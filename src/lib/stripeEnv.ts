// Tiny, dependency-free module so callers that only need to know
// sandbox-vs-live (e.g. landing page passing `environment` to edge
// functions) don't pull `@stripe/stripe-js` into their chunk.
export type StripeEnv = 'sandbox' | 'live';

const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN;

export function getStripeEnvironment(): StripeEnv {
  return clientToken?.startsWith('pk_test_') ? 'sandbox' : 'live';
}