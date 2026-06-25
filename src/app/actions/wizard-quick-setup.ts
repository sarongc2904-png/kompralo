'use server';

import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { generateSmartDefaults, mergeWithExisting } from '@/lib/invitations/generate-smart-defaults';
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

    // Read current content (safe merge — never overwrite existing data)
    const { data: currentContent, error: readErr } = await db
      .from('invitation_content')
      .select('protagonists, event_time, location, hero, itinerary, social, final_message, gift_registry, dress_code')
      .eq('invitation_id', invitationId)
      .maybeSingle();

    if (readErr) {
      console.error('[wizardQuickSetup] read invitation_content error:', readErr.message);
    }

    const defaults = generateSmartDefaults(input);

    const merged = {
      protagonists:  (Array.isArray(currentContent?.protagonists) && (currentContent.protagonists as unknown[]).length > 0)
                       ? currentContent.protagonists
                       : defaults.protagonists,
      event_time:    (currentContent?.event_time && currentContent.event_time !== '') ? currentContent.event_time : defaults.eventTime,
      location:      mergeWithExisting(currentContent?.location as Record<string, unknown> | null, defaults.location as Record<string, unknown>),
      hero:          mergeWithExisting(currentContent?.hero as Record<string, unknown> | null, defaults.hero as Record<string, unknown>),
      itinerary:     (Array.isArray(currentContent?.itinerary) && currentContent.itinerary.length > 0)
                       ? currentContent.itinerary
                       : defaults.itinerary,
      social:        mergeWithExisting(currentContent?.social as Record<string, unknown> | null, defaults.social as Record<string, unknown>),
      final_message: mergeWithExisting(currentContent?.final_message as Record<string, unknown> | null, defaults.finalMessage as Record<string, unknown>),
      gift_registry: (currentContent?.gift_registry && (currentContent.gift_registry as { items?: unknown[] }).items?.length)
                       ? currentContent.gift_registry
                       : defaults.giftRegistry,
      dress_code:    mergeWithExisting(currentContent?.dress_code as Record<string, unknown> | null, defaults.dressCode as Record<string, unknown>),
    };

    // Upsert invitation_content
    const { error: upsertErr } = await db
      .from('invitation_content')
      .upsert(
        { invitation_id: invitationId, ...merged, updated_at: new Date().toISOString() },
        { onConflict: 'invitation_id' },
      );

    if (upsertErr) {
      console.error('[wizardQuickSetup] upsert invitation_content error:', upsertErr.message);
      return { ok: false, error: `Error guardando contenido: ${upsertErr.message}` };
    }

    // Update invitations: wizard progress + ceremony details + date + theme
    const { error: updateErr } = await db
      .from('invitations')
      .update({
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
