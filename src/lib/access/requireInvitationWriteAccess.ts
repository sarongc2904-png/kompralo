import 'server-only';

import { createServerSupabaseClient, createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import { canWriteInvitation } from '@/lib/auth/invitation-ownership';
import { verifyInvitationAccess } from '@/lib/access/verifyInvitationAccess';

export type InvitationWriteAccessVia = 'auth' | 'cookie';

export interface InvitationWriteAccessResult {
  authorized: boolean;
  via: InvitationWriteAccessVia | null;
}

/**
 * Dual write-access check for customer-facing invitation mutations.
 * Mirrors the edit-page gate exactly:
 *   1. Auth session — owner by user_id or customer_email, or admin.
 *   2. Scoped 7-day access cookie (kompralo_access) bound to this invitation.
 *
 * Every server action or route that mutates an invitation reachable from the
 * cookie-accessible editor MUST use this instead of an auth-only check.
 *
 * `ownership` lets callers that already fetched the invitation row skip a
 * second lookup; when omitted the row is fetched with the service role.
 */
export async function requireInvitationWriteAccess(
  invitationId: string,
  ownership?: { user_id?: string | null; customer_email?: string | null },
): Promise<InvitationWriteAccessResult> {
  // ── Via 1: Auth session ─────────────────────────────────────────────────────
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) {
      let row = ownership;
      if (!row) {
        const { data } = await createServiceRoleSupabaseClient()
          .from('invitations')
          .select('user_id, customer_email')
          .eq('id', invitationId)
          .maybeSingle();
        row = (data as { user_id?: string | null; customer_email?: string | null } | null) ?? undefined;
      }
      if (row && await canWriteInvitation(row, { id: user.id, email: user.email })) {
        return { authorized: true, via: 'auth' };
      }
    }
  } catch { /* fall through to cookie */ }

  // ── Via 2: scoped access cookie ─────────────────────────────────────────────
  const cookieValid = await verifyInvitationAccess(invitationId);
  if (cookieValid) return { authorized: true, via: 'cookie' };
  return { authorized: false, via: null };
}

/** Error message with a real way out for the customer. */
export const WRITE_ACCESS_DENIED_MESSAGE =
  'No pudimos verificar tu acceso. Abre tu invitación desde el enlace de tu correo, ' +
  'o solicita un enlace nuevo en /recuperar-acceso.';
