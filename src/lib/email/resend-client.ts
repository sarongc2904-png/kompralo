import { getResendClient, getFromEmail } from '@/lib/resend/resend';

// Re-export unified interface so email templates and API routes import from one place.
export const resend   = getResendClient;   // call to get the Resend instance
export const FROM_EMAIL = getFromEmail;    // call to get the from address

// Convenience alias for route handlers that need the instance directly.
export { getResendClient, getFromEmail };
