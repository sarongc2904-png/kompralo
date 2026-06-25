import { createHmac } from 'crypto';

export function generateUnsubscribeToken(email: string): string {
  const secret = process.env.RESEND_API_KEY;
  if (!secret) throw new Error('Missing RESEND_API_KEY for unsubscribe token');
  return createHmac('sha256', secret).update(email).digest('hex').slice(0, 32);
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  try {
    return generateUnsubscribeToken(email) === token;
  } catch {
    return false;
  }
}

export function buildUnsubscribeUrl(email: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? '';
  const token = generateUnsubscribeToken(email);
  return `${base}/unsubscribed?email=${encodeURIComponent(email)}&token=${token}`;
}
