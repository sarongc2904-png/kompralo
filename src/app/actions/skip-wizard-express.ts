'use server';

import { createServerSupabaseClient, createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import { canWriteInvitation } from '@/lib/auth/invitation-ownership';
import { verifyInvitationAccess } from '@/lib/access/verifyInvitationAccess';

export interface SkipWizardExpressResult {
  success: boolean;
  error?: string;
}

/**
 * Marks the WizardExpress as completed without filling any data, so the
 * editor gate in /dashboard/invitations/[id]/edit stops re-rendering the
 * wizard. Merges hero.wizardExpressCompleted = true preserving every other
 * hero key.
 *
 * Access mirrors the edit page gate: authenticated owner (user_id or
 * customer_email match, or admin) OR the scoped 7-day access cookie.
 */
export async function skipWizardExpress(invitationId: string): Promise<SkipWizardExpressResult> {
  if (!invitationId || typeof invitationId !== 'string') {
    return { success: false, error: 'Invitación inválida.' };
  }

  const db = createServiceRoleSupabaseClient();

  const { data: invitation, error: invErr } = await db
    .from('invitations')
    .select('id, user_id, customer_email')
    .eq('id', invitationId)
    .maybeSingle();

  if (invErr || !invitation) {
    return { success: false, error: 'Invitación no encontrada.' };
  }

  let authorized = false;
  try {
    const authClient = await createServerSupabaseClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (user?.id) {
      authorized = await canWriteInvitation(invitation, { id: user.id, email: user.email });
    }
  } catch {
    // No session — fall through to cookie check.
  }

  if (!authorized) {
    authorized = await verifyInvitationAccess(invitationId);
  }

  if (!authorized) {
    return { success: false, error: 'No autorizado.' };
  }

  const { data: contentRow, error: readErr } = await db
    .from('invitation_content')
    .select('hero')
    .eq('invitation_id', invitationId)
    .maybeSingle();

  if (readErr) {
    return { success: false, error: `Error leyendo contenido: ${readErr.message}` };
  }

  const existingHero =
    contentRow?.hero && typeof contentRow.hero === 'object' && !Array.isArray(contentRow.hero)
      ? (contentRow.hero as Record<string, unknown>)
      : {};

  const mergedHero = { ...existingHero, wizardExpressCompleted: true };
  const now = new Date().toISOString();

  const { error: updateErr } = await db
    .from('invitation_content')
    .upsert(
      { invitation_id: invitationId, hero: mergedHero, updated_at: now },
      { onConflict: 'invitation_id' },
    );

  if (updateErr) {
    return { success: false, error: `Error al omitir el wizard: ${updateErr.message}` };
  }

  return { success: true };
}
