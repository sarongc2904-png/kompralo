'use server';

import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import { requireInvitationWriteAccess, WRITE_ACCESS_DENIED_MESSAGE } from '@/lib/access/requireInvitationWriteAccess';

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

  const access = await requireInvitationWriteAccess(invitationId, {
    user_id: (invitation as { user_id?: string | null }).user_id ?? null,
    customer_email: (invitation as { customer_email?: string | null }).customer_email ?? null,
  });
  if (!access.authorized) {
    return { success: false, error: WRITE_ACCESS_DENIED_MESSAGE };
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
