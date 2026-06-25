'use server';

import { redirect } from 'next/navigation';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { generateSmartDefaults, mergeWithExisting } from '@/lib/invitations/generate-smart-defaults';
import type { WizardMinimalInput } from '@/lib/invitations/generate-smart-defaults';

export async function wizardQuickSetup(
  invitationId: string,
  input: WizardMinimalInput,
): Promise<void> {
  // Verify auth
  const authClient = await createServerSupabaseClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) {
    redirect(`/login?redirect=/dashboard/invitations/${invitationId}/edit`);
  }

  const db = createServiceRoleSupabaseClient();

  // Read current content (safe merge — never overwrite existing data)
  const { data: currentContent } = await db
    .from('invitation_content')
    .select('protagonists, event_time, location, hero, itinerary, social, final_message, gift_registry, dress_code')
    .eq('invitation_id', invitationId)
    .maybeSingle();

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
  await db
    .from('invitation_content')
    .upsert(
      { invitation_id: invitationId, ...merged, updated_at: new Date().toISOString() },
      { onConflict: 'invitation_id' },
    );

  // Update invitations: wizard progress + ceremony details + date + theme
  await db
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

  redirect(`/cliente/invitaciones/${invitationId}/preview-wizard`);
}
