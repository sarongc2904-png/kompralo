'use server';

import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { generateSmartDefaults } from '@/lib/invitations/generate-smart-defaults';
import type { WizardMinimalInput } from '@/lib/invitations/generate-smart-defaults';

export interface WizardQuickSetupResult {
  ok: boolean;
  redirectUrl?: string;
  error?: string;
}

export async function wizardQuickSetup(
  invitationId: string,
  input: WizardMinimalInput,
): Promise<WizardQuickSetupResult> {
  try {
    // Verify auth
    const authClient = await createServerSupabaseClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return { ok: false, redirectUrl: `/login?redirect=/dashboard/invitations/${invitationId}/edit` };
    }

    const db = createServiceRoleSupabaseClient();
    const defaults = generateSmartDefaults(input);

    // ── Write invitation_content ──────────────────────────────────────────────
    // wizard_step_completed < 3 means this is still demo/factory data — overwrite
    // everything with wizard-generated content. Do NOT merge with existing demo.
    const { error: upsertErr } = await db
      .from('invitation_content')
      .upsert(
        {
          invitation_id: invitationId,
          protagonists:  defaults.protagonists,
          event_time:    defaults.eventTime,
          location:      defaults.location,
          hero:          defaults.hero,
          itinerary:     defaults.itinerary,
          timeline:      defaults.timeline,
          social:        defaults.social,
          final_message: defaults.finalMessage,
          gift_registry: defaults.giftRegistry,
          dress_code:    defaults.dressCode,
          updated_at:    new Date().toISOString(),
        },
        { onConflict: 'invitation_id' },
      );

    if (upsertErr) {
      console.error('[wizardQuickSetup] upsert invitation_content error:', upsertErr.message);
      return { ok: false, error: `Error guardando contenido: ${upsertErr.message}` };
    }

    // ── Update invitations metadata ───────────────────────────────────────────
    const { error: updateErr } = await db
      .from('invitations')
      .update({
        title:                 defaults.invitationTitle,
        wizard_step_completed: 3,
        ceremony_type:         input.ceremonyType,
        civil_already_done:    input.civilAlreadyDone,
        event_date:            input.weddingDate,
        theme_id:              defaults.themeId,
        updated_at:            new Date().toISOString(),
      })
      .eq('id', invitationId);

    if (updateErr) {
      console.error('[wizardQuickSetup] update invitations error:', updateErr.message);
      return { ok: false, error: `Error actualizando invitación: ${updateErr.message}` };
    }

    return { ok: true, redirectUrl: `/cliente/invitaciones/${invitationId}/preview-wizard` };
  } catch (e) {
    console.error('[wizardQuickSetup] unexpected error:', e);
    return { ok: false, error: 'Error inesperado. Intenta de nuevo.' };
  }
}
