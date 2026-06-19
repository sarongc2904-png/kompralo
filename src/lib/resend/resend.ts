import { Resend } from 'resend';

// Lazily validated — throws only when a send is actually attempted,
// so missing RESEND_API_KEY does not break the build or dev startup.
let _resend: Resend | null = null;

export function getResendClient(): Resend {
  if (_resend) return _resend;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Missing environment variable: RESEND_API_KEY.\n' +
        'Add it to .env.local — get it from resend.com → API Keys.',
    );
  }

  _resend = new Resend(apiKey);
  return _resend;
}

export function getFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL ?? 'KOMPRALO <hola@kompralo.mx>';
}
