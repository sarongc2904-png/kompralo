import 'server-only';

import { createHash, randomBytes } from 'node:crypto';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';

const ACCESS_LINK_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

export function hashInvitationAccessToken(rawToken: string): string {
  return createHash('sha256').update(rawToken, 'utf8').digest('hex');
}

export async function createInvitationAccessToken(params: {
  invitationId: string;
  orderId: string;
  customerEmail: string;
}): Promise<{ rawToken: string; expiresAt: Date }> {
  const rawToken = randomBytes(32).toString('base64url');
  const tokenHash = hashInvitationAccessToken(rawToken);
  const expiresAt = new Date(Date.now() + ACCESS_LINK_LIFETIME_MS);
  const supabase = createServiceRoleSupabaseClient();

  const { error } = await supabase.from('invitation_access_tokens').insert({
    invitation_id: params.invitationId,
    order_id: params.orderId,
    customer_email: params.customerEmail.trim().toLowerCase(),
    token_hash: tokenHash,
    purpose: 'post_payment_access',
    expires_at: expiresAt.toISOString(),
  });

  if (error) {
    throw new Error(`Could not create invitation access token: ${error.message}`);
  }

  return { rawToken, expiresAt };
}

