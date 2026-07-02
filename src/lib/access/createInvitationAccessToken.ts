import 'server-only';

import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import {
  createInvitationAccessTokenWithClient,
  hashInvitationAccessTokenCore,
} from '@/lib/access/token-core';

export function hashInvitationAccessToken(rawToken: string): string {
  return hashInvitationAccessTokenCore(rawToken);
}

export async function createInvitationAccessToken(params: {
  invitationId: string;
  orderId: string;
  customerEmail: string;
}): Promise<{ rawToken: string; expiresAt: Date }> {
  const supabase = createServiceRoleSupabaseClient();
  return createInvitationAccessTokenWithClient(supabase, params);
}
