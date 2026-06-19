import Stripe from 'stripe';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}.\n` +
        'Add it to .env.local — see .env.example for reference.',
    );
  }
  return value;
}

// Lazily initialized singleton — throws only when first used, not at module load.
// This prevents build-time crashes when env vars are not available (e.g. CI without secrets).
let _stripe: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (_stripe) return _stripe;
  _stripe = new Stripe(requireEnv('STRIPE_SECRET_KEY'), {
    apiVersion: '2026-05-27.dahlia',
    typescript: true,
  });
  return _stripe;
}

/** @deprecated Use getStripeClient() instead. Kept for backward compatibility. */
export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripeClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
