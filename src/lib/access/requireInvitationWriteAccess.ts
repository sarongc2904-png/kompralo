import 'server-only';

import { cookies } from 'next/headers';
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import { canWriteInvitation } from '@/lib/auth/invitation-ownership';
import { verifyInvitationAccess, INVITATION_ACCESS_COOKIE } from '@/lib/access/verifyInvitationAccess';

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
  // TEMP LOGGING — remove after the cookie flow is verified in production.
  let cookiePresent = false;
  try {
    cookiePresent = (await cookies()).has(INVITATION_ACCESS_COOKIE);
  } catch { /* outside request scope */ }

  // ── Via 1: Auth session ─────────────────────────────────────────────────────
  let hadSession = false;
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) {
      hadSession = true;
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
        console.log(
          '[writeAccess] inv=%s via=auth user=%s cookiePresent=%s → authorized',
          invitationId, user.id, cookiePresent,
        );
        return { authorized: true, via: 'auth' };
      }
    }
  } catch { /* fall through to cookie */ }

  // ── Via 2: scoped access cookie ─────────────────────────────────────────────
  const cookieValid = await verifyInvitationAccess(invitationId);
  console.log(
    '[writeAccess] inv=%s session=%s cookiePresent=%s cookieValidForInvitation=%s → %s',
    invitationId, hadSession, cookiePresent, cookieValid,
    cookieValid ? 'authorized(cookie)' : 'DENIED',
  );

  if (cookieValid) return { authorized: true, via: 'cookie' };
  return { authorized: false, via: null };
}

/** Error message with a real way out for the customer. */
export const WRITE_ACCESS_DENIED_MESSAGE =
  'No pudimos verificar tu acceso. Abre tu invitación desde el enlace de tu correo, ' +
  'o solicita un enlace nuevo en /recuperar-acceso.';
