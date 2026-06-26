'use server';

import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { generateSmartDefaults } from '@/lib/invitations/generate-smart-defaults';
import type { WizardMinimalInput } from '@/lib/invitations/generate-smart-defaults';
import { canWriteInvitation } from '@/lib/auth/invitation-ownership';

export interface WizardQuickSetupResult {
  ok: boolean;
  redirectUrl?: string;
  publicUrl?: string;
  error?: string;
}

function hasItems(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0;
}

function isMeaningfulValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
}

function mergeGeneratedObject<T extends Record<string, unknown>>(
  existing: unknown,
  generated: T,
): T {
  const existingObject =
    existing && typeof existing === 'object' && !Array.isArray(existing)
      ? existing as Record<string, unknown>
      : {};

  const merged: Record<string, unknown> = { ...existingObject };
  for (const [key, value] of Object.entries(generated)) {
    if (isMeaningfulValue(value)) {
      merged[key] = value;
    }
  }
  return merged as T;
}

export async function wizardQuickSetup(
  invitationId: string,
  input: WizardMinimalInput,
): Promise<WizardQuickSetupResult> {
  try {
    const authClient = await createServerSupabaseClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return { ok: false, redirectUrl: `/login?redirect=/dashboard/invitations/${invitationId}/edit` };
    }

    const db = createServiceRoleSupabaseClient();
    const defaults = generateSmartDefaults(input);
    const now = new Date().toISOString();

    const { data: invitation, error: invitationErr } = await db
      .from('invitations')
      .select('id, user_id, customer_email, wizard_step_completed, slug')
      .eq('id', invitationId)
      .maybeSingle();

    if (invitationErr || !invitation) {
      console.error('[wizardQuickSetup] invitation lookup error:', invitationErr?.message ?? 'not found');
      return { ok: false, error: 'Invitación no encontrada.' };
    }

    const authorized = await canWriteInvitation(invitation, {
      id: user.id,
      email: user.email,
    });

    if (!authorized) {
      return { ok: false, error: 'No autorizado' };
    }

    const wizardCompleted = Number(invitation.wizard_step_completed ?? 0) >= 3;

    const { data: currentContent, error: contentReadErr } = await db
      .from('invitation_content')
      .select('protagonists, location, hero, itinerary, timeline, story, social, final_message, gift_registry, dress_code')
      .eq('invitation_id', invitationId)
      .maybeSingle();

    if (contentReadErr) {
      console.error('[wizardQuickSetup] read invitation_content error:', contentReadErr.message);
      return { ok: false, error: `Error leyendo contenido: ${contentReadErr.message}` };
    }

    const currentGiftRegistry = currentContent?.gift_registry as { items?: unknown[] } | null | undefined;
    const currentProtagonists = currentContent?.protagonists;
    const currentItinerary = currentContent?.itinerary;
    const currentTimeline = currentContent?.timeline;
    const currentStory = currentContent?.story as { slides?: unknown[] } | null | undefined;
    const contentPatch = {
      invitation_id: invitationId,
      protagonists: wizardCompleted && hasItems(currentProtagonists)
        ? currentProtagonists
        : defaults.protagonists,
      event_time: defaults.eventTime,
      location: mergeGeneratedObject(currentContent?.location, defaults.location),
      hero: mergeGeneratedObject(currentContent?.hero, defaults.hero),
      itinerary: wizardCompleted && hasItems(currentItinerary)
        ? currentItinerary
        : defaults.itinerary,
      timeline: wizardCompleted && hasItems(currentTimeline)
        ? currentTimeline
        : defaults.timeline,
      story: wizardCompleted && hasItems(currentStory?.slides)
        ? currentContent?.story
        : defaults.story,
      social: mergeGeneratedObject(currentContent?.social, defaults.social),
      final_message: mergeGeneratedObject(currentContent?.final_message, defaults.finalMessage),
      gift_registry: wizardCompleted && hasItems(currentGiftRegistry?.items)
        ? currentContent?.gift_registry
        : defaults.giftRegistry,
      dress_code: mergeGeneratedObject(currentContent?.dress_code, defaults.dressCode),
      updated_at: now,
    };

    const { error: upsertErr } = await db
      .from('invitation_content')
      .upsert(contentPatch, { onConflict: 'invitation_id' });

    if (upsertErr) {
      console.error('[wizardQuickSetup] upsert invitation_content error:', upsertErr.message);
      return { ok: false, error: `Error guardando contenido: ${upsertErr.message}` };
    }

    const { error: updateErr } = await db
      .from('invitations')
      .update({
        title: defaults.invitationTitle,
        wizard_step_completed: 3,
        ceremony_type: input.ceremonyType,
        civil_already_done: input.civilAlreadyDone,
        event_date: input.weddingDate,
        rsvp_mode: input.rsvpMode === 'passes_only' ? 'passes_only' : 'open',
        theme_id: defaults.themeId,
        updated_at: now,
      })
      .eq('id', invitationId);

    if (updateErr) {
      console.error('[wizardQuickSetup] update invitations error:', updateErr.message);
      return { ok: false, error: `Error actualizando invitación: ${updateErr.message}` };
    }

    return {
      ok: true,
      redirectUrl: `/cliente/invitaciones/${invitationId}/preview-wizard`,
      publicUrl: invitation.slug ? `/i/${invitation.slug}` : undefined,
    };
  } catch (e) {
    console.error('[wizardQuickSetup] unexpected error:', e);
    return { ok: false, error: 'Error inesperado. Intenta de nuevo.' };
  }
}
