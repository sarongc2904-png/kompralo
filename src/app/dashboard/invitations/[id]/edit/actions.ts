'use server';

import { revalidatePath } from 'next/cache';
import type { IInvitationRepository } from '@/domain/invitations';
import { SupabaseInvitationRepository } from '@/domain/invitations/supabase.repository';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import { requireInvitationWriteAccess, WRITE_ACCESS_DENIED_MESSAGE } from '@/lib/access/requireInvitationWriteAccess';
import type { FeatureOverrides, InvitationFeatureKey } from '@/domain/plans/types';
import { normalizePlanId } from '@/domain/plans/types';
import { getFeaturesForPlan } from '@/domain/plans/registry';
import type {
  GalleryImageItem,
  InvitationProtagonistInput,
  InvitationItineraryItemInput,
  InvitationGiftProviderInput,
  InvitationDressCodeInput,
  InvitationSponsorInput,
  InvitationSponsorsInput,
  InvitationStorySlideInput,
  InvitationHotelInput,
  InvitationSocialInput,
  InvitationFinalMessageInput,
  InvitationTimelineEventInput,
  InvitationGalleryInput,
  InvitationItineraryInput,
  InvitationTimelineInput,
  InvitationGiftRegistryInput,
  InvitationAccommodationInput,
} from '@/domain/invitations';
import type { InvitationHeroVideoInput, ParentCouple } from '@/domain/invitations/types';
import { generateWeddingTemplate } from '@/lib/invitations/generators/wedding-template-generator';
import { resolveWeddingThemeId, type WeddingStyle } from '@/domain/themes-v2/style-to-theme-map';

// ─── Shared result type ───────────────────────────────────────────────────────

export type UpdateInvitationResult =
  | { success: true; message: string }
  | { success: false; error: string };

const INLINE_EDIT_COLUMNS = [
  'protagonists',
  'hero',
  'location',
  'story',
  'timeline',
  'itinerary',
  'dress_code',
  'gift_registry',
  'parents',
  'padrinos',
  'hotels',
  'social',
  'final_message',
] as const;

type InlineEditColumn = typeof INLINE_EDIT_COLUMNS[number];

const INLINE_EDIT_ALLOWED_PATHS = [
  /^protagonists\.\d+\.name$/,
  /^hero\.(eventLabel|emotionalPhrase|connectorText|itinerarySectionEyebrow|itinerarySectionTitle|timelineSectionEyebrow|timelineSectionTitle|parentsSectionEyebrow|parentsSectionTitle|parentsSectionSubtitle|hospedajeSectionEyebrow|hospedajeSectionTitle|padrinosSectionEyebrow|padrinosSectionTitle|introTitle|introSubtitle|introButtonText)$/,
  /^location\.(sectionEyebrow|sectionTitle|venueName|address)$/,
  /^story\.(sectionEyebrow|sectionTitle)$/,
  /^story\.slides\.\d+\.(title|subtitle|text|date)$/,
  /^timeline\.\d+\.(year|title|description)$/,
  /^itinerary\.\d+\.(time|title|location|description)$/,
  /^dress_code\.(sectionEyebrow|title|type|description|suggestions)$/,
  /^gift_registry\.(sectionEyebrow|sectionTitle|subtitle)$/,
  /^gift_registry\.items\.\d+\.(provider|description|link)$/,
  /^gift_registry\.items\.\d+\.bankDetails\.(bankName|accountOwner|clabe)$/,
  /^parents\.(groomTitle|groomFatherLabel|groomFatherName|groomMotherLabel|groomMotherName|brideTitle|brideFatherLabel|brideFatherName|brideMotherLabel|brideMotherName)$/,
  /^padrinos\.\d+\.rubro$/,
  /^padrinos\.\d+\.names\.\d+$/,
  /^hotels\.\d+\.(name|description|address|distance|priceRange|phone|bookingLink)$/,
  /^social\.(sectionEyebrow|hashtag|note|instagramHandle|tiktokHandle|facebookUrl|youtubeUrl)$/,
  /^final_message\.(title|message|quote|signature)$/,
];

function getInlineEditColumn(fieldPath: string): InlineEditColumn | null {
  if (!INLINE_EDIT_ALLOWED_PATHS.some((pattern) => pattern.test(fieldPath))) return null;
  const root = fieldPath.split('.')[0];
  return INLINE_EDIT_COLUMNS.find((column) => column === root) ?? null;
}

async function markWizardExpressCompleted(invitationId: string): Promise<void> {
  const db = createServiceRoleSupabaseClient();
  const now = new Date().toISOString();

  const { data: contentRow, error: readError } = await db
    .from('invitation_content')
    .select('hero')
    .eq('invitation_id', invitationId)
    .maybeSingle();

  if (readError) {
    throw new Error(`[QuickStart] wizard completion read failed: ${readError.message}`);
  }

  const existingHero =
    contentRow?.hero && typeof contentRow.hero === 'object' && !Array.isArray(contentRow.hero)
      ? contentRow.hero as Record<string, unknown>
      : {};

  const { error: contentError } = await db
    .from('invitation_content')
    .update({
      hero: {
        ...existingHero,
        wizardExpressCompleted: true,
      },
      updated_at: now,
    })
    .eq('invitation_id', invitationId);

  if (contentError) {
    throw new Error(`[QuickStart] wizard completion content update failed: ${contentError.message}`);
  }

  const { error: invitationError } = await db
    .from('invitations')
    .update({
      wizard_step_completed: 3,
      updated_at: now,
    })
    .eq('id', invitationId);

  if (invitationError) {
    throw new Error(`[QuickStart] wizard completion invitation update failed: ${invitationError.message}`);
  }
}

function setNestedTextValue(target: unknown, pathParts: string[], value: string): unknown {
  const root = Array.isArray(target)
    ? [...target]
    : target && typeof target === 'object'
      ? { ...(target as Record<string, unknown>) }
      : {};

  let cursor: Record<string, unknown> | unknown[] = root as Record<string, unknown> | unknown[];
  for (let index = 0; index < pathParts.length - 1; index += 1) {
    const key = pathParts[index];
    const nextKey = pathParts[index + 1];
    const isArrayIndex = /^\d+$/.test(nextKey);
    const currentValue = Array.isArray(cursor)
      ? cursor[Number(key)]
      : (cursor as Record<string, unknown>)[key];
    const nextValue = Array.isArray(currentValue)
      ? [...currentValue]
      : currentValue && typeof currentValue === 'object'
        ? { ...(currentValue as Record<string, unknown>) }
        : isArrayIndex
          ? []
          : {};

    if (Array.isArray(cursor)) {
      cursor[Number(key)] = nextValue;
    } else {
      (cursor as Record<string, unknown>)[key] = nextValue;
    }
    cursor = nextValue as Record<string, unknown> | unknown[];
  }

  const finalKey = pathParts[pathParts.length - 1];
  if (Array.isArray(cursor)) {
    cursor[Number(finalKey)] = value;
  } else {
    (cursor as Record<string, unknown>)[finalKey] = value;
  }

  return root;
}

function setParentsTextValue(target: unknown, fieldPath: string, value: string): unknown {
  const parents = Array.isArray(target) ? [...target] : [];
  const fieldName = fieldPath.split('.')[1] ?? '';
  const side = fieldName.startsWith('groom') ? 'groom' : 'bride';
  const rawKey = fieldName.replace(/^(groom|bride)/, '');
  const key = rawKey.charAt(0).toLowerCase() + rawKey.slice(1);
  const existingIndex = parents.findIndex((item) => {
    return item && typeof item === 'object' && (item as { side?: unknown }).side === side;
  });
  const index = existingIndex >= 0 ? existingIndex : parents.length;
  const existing = parents[index] && typeof parents[index] === 'object'
    ? { ...(parents[index] as Record<string, unknown>) }
    : { side, protagonistId: '', fatherName: '', motherName: '' };

  parents[index] = { ...existing, side, [key]: value };
  return parents;
}

async function getAuthorizedInvitationRepository(invitationId: string): Promise<IInvitationRepository> {
  const serviceSupabase = createServiceRoleSupabaseClient();
  const repository = new SupabaseInvitationRepository(serviceSupabase);
  const invitation = await repository.getById(invitationId);

  if (!invitation) {
    throw new Error('Invitación no encontrada.');
  }

  // Dual gate — Auth owner/admin OR the scoped access cookie. This is the
  // choke point for every editor action (incl. the wizard submit); an
  // auth-only check here locks out cookie-only customers who paid.
  const access = await requireInvitationWriteAccess(invitationId, {
    user_id: invitation.ownerUserId ?? null,
    customer_email: invitation.customerEmail ?? null,
  });

  if (!access.authorized) {
    throw new Error(WRITE_ACCESS_DENIED_MESSAGE);
  }

  return repository;
}

function getServiceInvitationRepository(): IInvitationRepository {
  return new SupabaseInvitationRepository(createServiceRoleSupabaseClient());
}

// ─── Plan guard ───────────────────────────────────────────────────────────────

/**
 * Returns an error result if the invitation's plan does not satisfy the
 * minimum required tier.  Premium features require 'premium' or 'deluxe'.
 * Deluxe features require 'deluxe'.
 */
async function checkPlanAccess(
  invitationId: string,
  requiredTier: 'premium' | 'deluxe',
): Promise<UpdateInvitationResult | null> {
  const inv = await getServiceInvitationRepository().getById(invitationId);
  if (!inv) return { success: false, error: 'Invitación no encontrada.' };
  const plan = normalizePlanId(inv.planId);
  if (requiredTier === 'premium' && plan === 'basic') {
    return { success: false, error: 'Esta función requiere el plan Premium o Deluxe.' };
  }
  if (requiredTier === 'deluxe' && plan !== 'deluxe') {
    return { success: false, error: 'Esta función requiere el plan Deluxe.' };
  }
  return null; // access granted
}

const invitationRepository: IInvitationRepository = {
  async list() {
    throw new Error('Editor actions cannot list invitations.');
  },
  async getBySlug(slug) {
    return getServiceInvitationRepository().getBySlug(slug);
  },
  async getById(id) {
    return getServiceInvitationRepository().getById(id);
  },
  async getPreviewById(id) {
    return getServiceInvitationRepository().getPreviewById(id);
  },
  async updateBasicInfo(id, input) {
    return getAuthorizedInvitationRepository(id).then((repository) => repository.updateBasicInfo(id, input));
  },
  async updateMediaInfo(id, input) {
    return getAuthorizedInvitationRepository(id).then((repository) => repository.updateMediaInfo(id, input));
  },
  async updateGallery(id, input) {
    return getAuthorizedInvitationRepository(id).then((repository) => repository.updateGallery(id, input));
  },
  async updateProtagonists(id, input) {
    return getAuthorizedInvitationRepository(id).then((repository) => repository.updateProtagonists(id, input));
  },
  async updateItinerary(id, input) {
    return getAuthorizedInvitationRepository(id).then((repository) => repository.updateItinerary(id, input));
  },
  async updateGiftRegistry(id, input) {
    return getAuthorizedInvitationRepository(id).then((repository) => repository.updateGiftRegistry(id, input));
  },
  async updateDressCode(id, input) {
    return getAuthorizedInvitationRepository(id).then((repository) => repository.updateDressCode(id, input));
  },
  async updateParents(id, input) {
    return getAuthorizedInvitationRepository(id).then((repository) => repository.updateParents(id, input));
  },
  async updatePadrinos(id, input) {
    return getAuthorizedInvitationRepository(id).then((repository) => repository.updatePadrinos(id, input));
  },
  async updateStoryBook(id, input) {
    return getAuthorizedInvitationRepository(id).then((repository) => repository.updateStoryBook(id, input));
  },
  async updateAccommodation(id, input) {
    return getAuthorizedInvitationRepository(id).then((repository) => repository.updateAccommodation(id, input));
  },
  async updateSocial(id, input) {
    return getAuthorizedInvitationRepository(id).then((repository) => repository.updateSocial(id, input));
  },
  async updateFinalMessage(id, input) {
    return getAuthorizedInvitationRepository(id).then((repository) => repository.updateFinalMessage(id, input));
  },
  async updateTimeline(id, input) {
    return getAuthorizedInvitationRepository(id).then((repository) => repository.updateTimeline(id, input));
  },
  async updateFeatureOverrides(id, overrides) {
    return getAuthorizedInvitationRepository(id).then((repository) => repository.updateFeatureOverrides(id, overrides));
  },
  async updateThemeSelection(id, input) {
    return getAuthorizedInvitationRepository(id).then((repository) => repository.updateThemeSelection(id, input));
  },
  async updateHeroVideo(id, input) {
    return getAuthorizedInvitationRepository(id).then((repository) => repository.updateHeroVideo(id, input));
  },
  async activateAfterPayment() {
    throw new Error('Editor actions cannot activate invitations after payment.');
  },
  async createFromPaidOrder() {
    throw new Error('Editor actions cannot create invitations from paid orders.');
  },
};

// ─── Date helper ─────────────────────────────────────────────────────────────

/** Accepts YYYY-MM-DD or ISO full string; returns YYYY-MM-DD or '' */
function normalizeDateForSave(value?: string | null): string {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  if (value.includes('T')) return value.split('T')[0];
  return value;
}

// ─── Phone helper ─────────────────────────────────────────────────────────────

/**
 * Strips all non-digit characters (spaces, +, -, parens) so that common formats
 * like "+52 961 234 5678" or "961-234-5678" are accepted and normalized.
 * Returns empty string if nothing is left.
 */
function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, '');
}

// =============================================================================
// updateInvitationBasicInfo
// =============================================================================

export interface UpdateInvitationBasicInfoInput {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  address: string;
  rsvpWhatsAppNumber: string;
  finalMessageQuote: string;
}

function validateBasicFormat(input: UpdateInvitationBasicInfoInput): string | null {
  if (!input.title.trim())    return 'El título es requerido.';
  if (!input.subtitle.trim()) return 'El subtítulo es requerido.';
  if (!input.slug.trim())     return 'El slug es requerido.';
  if (!/^[a-z0-9-]+$/.test(input.slug.trim())) {
    return 'El slug solo puede contener letras minúsculas, números y guiones.';
  }
  // Normalize phone before validating so "+52 961 234 5678" is accepted.
  if (input.rsvpWhatsAppNumber) {
    const digits = normalizePhone(input.rsvpWhatsAppNumber);
    if (!digits) return 'Escribe un número de WhatsApp válido (mínimo 10 dígitos).';
    if (digits.length < 10 || digits.length > 15) {
      return 'El número de WhatsApp debe tener entre 10 y 15 dígitos.';
    }
  }
  return null;
}

export async function updateInlineEditableText(input: {
  id: string;
  fieldPath: string;
  value: string;
}): Promise<UpdateInvitationResult> {
  const id = input.id.trim();
  const fieldPath = input.fieldPath.trim();
  const value = input.value.replace(/\s+/g, ' ').trim();
  const column = getInlineEditColumn(fieldPath);

  if (!id || !column) {
    return { success: false, error: 'Campo inline no permitido.' };
  }
  if (!value) {
    return { success: false, error: 'El texto no puede quedar vacío.' };
  }
  if (value.length > 500) {
    return { success: false, error: 'El texto es demasiado largo.' };
  }
  if (/^gift_registry\.items\.\d+\.link$/.test(fieldPath) && !isValidUrl(value)) {
    return { success: false, error: 'El enlace de mesa de regalos no es una URL válida.' };
  }
  if (/^gift_registry\.items\.\d+\.bankDetails\.clabe$/.test(fieldPath) && !/^\d{18}$/.test(value)) {
    return { success: false, error: 'La CLABE debe tener exactamente 18 dígitos.' };
  }
  if (/^hotels\.\d+\.bookingLink$/.test(fieldPath) && !isValidUrl(value)) {
    return { success: false, error: 'El sitio web del hotel no es una URL válida.' };
  }
  if (/^social\.(facebookUrl|youtubeUrl)$/.test(fieldPath) && !isValidUrl(value)) {
    return { success: false, error: 'La URL de red social no es válida.' };
  }

  try {
    await getAuthorizedInvitationRepository(id);
    const db = createServiceRoleSupabaseClient();
    const { data: row, error: readError } = await db
      .from('invitation_content')
      .select(column)
      .eq('invitation_id', id)
      .maybeSingle();

    if (readError) {
      return { success: false, error: `Error leyendo contenido: ${readError.message}` };
    }

    const contentRow = (row ?? {}) as Partial<Record<InlineEditColumn, unknown>>;
    const pathParts = fieldPath.split('.').slice(1);
    const currentValue = contentRow[column] ?? (/^\d+$/.test(pathParts[0] ?? '') ? [] : {});
    const nextValue = column === 'parents'
      ? setParentsTextValue(currentValue, fieldPath, value)
      : setNestedTextValue(currentValue, pathParts, value);

    const { error: updateError } = await db
      .from('invitation_content')
      .update({ [column]: nextValue, updated_at: new Date().toISOString() })
      .eq('invitation_id', id);

    if (updateError) {
      return { success: false, error: `Error guardando texto: ${updateError.message}` };
    }

    revalidatePath(`/dashboard/invitations/${id}/edit`);
    revalidatePath(`/preview/${id}`);
    return { success: true, message: 'Texto actualizado.' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error inesperado.';
    console.error('[Editor] updateInlineEditableText error:', message);
    return { success: false, error: message };
  }
}

export async function updateInvitationBasicInfo(
  input: UpdateInvitationBasicInfoInput,
): Promise<UpdateInvitationResult> {
  const formatError = validateBasicFormat(input);
  if (formatError) return { success: false, error: formatError };

  const { id } = input;
  const newSlug = input.slug.trim();

  const current = await invitationRepository.getById(id);
  if (!current) return { success: false, error: 'Invitación no encontrada.' };

  const oldSlug = current.slug;

  if (newSlug !== oldSlug) {
    const conflict = await invitationRepository.getBySlug(newSlug);
    if (conflict && conflict.id !== id) {
      return { success: false, error: 'Ese enlace (slug) ya está en uso por otra invitación.' };
    }
  }

  const normalizedEventDate = normalizeDateForSave(input.eventDate);
  console.log('[eventDate/save] incoming:', input.eventDate);
  console.log('[eventDate/save] normalized:', normalizedEventDate);

  // Normalize phone: strip spaces, +, dashes — accept "+52 961 234 5678" etc.
  const normalizedPhone = normalizePhone(input.rsvpWhatsAppNumber);

  try {
    await invitationRepository.updateBasicInfo(id, {
      title:              input.title.trim(),
      subtitle:           input.subtitle.trim(),
      slug:               newSlug,
      eventDate:          normalizedEventDate,
      eventTime:          input.eventTime,
      venueName:          input.venueName.trim(),
      address:            input.address.trim(),
      rsvpWhatsAppNumber: normalizedPhone,   // normalized digits only, '' if empty
      finalMessageQuote:  input.finalMessageQuote.trim(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Editor] updateInvitationBasicInfo error:', message);
    return { success: false, error: `Error al guardar: ${message}` };
  }

  revalidatePath(`/i/${oldSlug}`);
  revalidatePath(`/i/${newSlug}`);
  revalidatePath(`/preview/${id}`);
  revalidatePath('/dashboard/invitations');
  revalidatePath(`/dashboard/invitations/${id}/edit`);

  return { success: true, message: 'Cambios guardados correctamente.' };
}

// =============================================================================
// updateEventDateTime
// =============================================================================

export async function updateEventDateTime(input: {
  id: string;
  eventDate: string;
  eventTime: string;
}): Promise<UpdateInvitationResult> {
  const id = input.id.trim();
  if (!id) return { success: false, error: 'ID de invitación no válido.' };

  const normalizedDate = normalizeDateForSave(input.eventDate);
  const normalizedTime = input.eventTime.trim();

  try {
    await getAuthorizedInvitationRepository(id);
    const db = createServiceRoleSupabaseClient();

    const { error: invError } = await db
      .from('invitations')
      .update({ event_date: normalizedDate || null })
      .eq('id', id);
    if (invError) return { success: false, error: `Error guardando fecha: ${invError.message}` };

    const { error: contentError } = await db
      .from('invitation_content')
      .update({ event_time: normalizedTime || null, updated_at: new Date().toISOString() })
      .eq('invitation_id', id);
    if (contentError) return { success: false, error: `Error guardando hora: ${contentError.message}` };

    revalidatePath(`/preview/${id}`);
    revalidatePath(`/dashboard/invitations/${id}/edit`);
    return { success: true, message: 'Fecha y hora actualizadas.' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error inesperado.';
    return { success: false, error: message };
  }
}

// =============================================================================
// updateInvitationMediaInfo
// =============================================================================

export interface UpdateInvitationMediaInput {
  id: string;
  slug: string;
  heroImageUrl: string;
  heroVideoUrl: string;
  musicUrl: string;
  musicTitle: string;
  youtubeUrl: string;
  googleMapsUrl: string;
  wazeUrl: string;
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function validateMediaFormat(input: UpdateInvitationMediaInput): string | null {
  if (input.heroImageUrl && !isValidUrl(input.heroImageUrl)) {
    return 'La URL de la imagen del hero no es válida.';
  }
  if (input.heroVideoUrl && !isValidUrl(input.heroVideoUrl)) {
    return 'La URL del video del hero no es válida.';
  }
  if (input.musicUrl && !isValidUrl(input.musicUrl)) {
    return 'La URL del audio no es válida.';
  }
  if (input.youtubeUrl) {
    const yt = input.youtubeUrl;
    if (!yt.includes('youtube.com') && !yt.includes('youtu.be')) {
      return 'La URL de YouTube debe ser de youtube.com o youtu.be.';
    }
    if (!isValidUrl(yt)) return 'La URL de YouTube no es válida.';
  }
  if (input.googleMapsUrl) {
    const gm = input.googleMapsUrl;
    if (
      !gm.includes('maps.google') &&
      !gm.includes('google.com/maps') &&
      !gm.includes('goo.gl/maps') &&
      !gm.includes('maps.app.goo.gl')
    ) {
      return 'La URL de Google Maps debe ser un enlace de maps.google.com, google.com/maps o goo.gl/maps.';
    }
    if (!isValidUrl(gm)) return 'La URL de Google Maps no es válida.';
  }
  if (input.wazeUrl) {
    if (!input.wazeUrl.includes('waze.com')) {
      return 'La URL de Waze debe ser de waze.com.';
    }
    if (!isValidUrl(input.wazeUrl)) return 'La URL de Waze no es válida.';
  }
  return null;
}

export async function updateInvitationMediaInfo(
  input: UpdateInvitationMediaInput,
): Promise<UpdateInvitationResult> {
  const formatError = validateMediaFormat(input);
  if (formatError) return { success: false, error: formatError };

  const { id } = input;

  // For Basic plans: preserve existing music/video — these fields are not
  // visible in the editor for Basic, so incoming values are empty strings.
  const plan = normalizePlanId(
    (await getServiceInvitationRepository().getById(id))?.planId,
  );
  let heroVideoUrl = input.heroVideoUrl.trim();
  let musicUrl     = input.musicUrl.trim();
  let musicTitle   = input.musicTitle.trim();
  let youtubeUrl   = input.youtubeUrl.trim();
  if (plan === 'basic') {
    const current = await getServiceInvitationRepository().getById(id);
    heroVideoUrl = current?.hero?.videoUrl   ?? '';
    musicUrl     = current?.music?.audioUrl   ?? '';
    musicTitle   = current?.music?.title     ?? '';
    youtubeUrl   = current?.hero?.youtubeUrl ?? '';
  }

  try {
    await invitationRepository.updateMediaInfo(id, {
      heroImageUrl:  input.heroImageUrl.trim(),
      heroVideoUrl,
      musicUrl,
      musicTitle,
      youtubeUrl,
      googleMapsUrl: input.googleMapsUrl.trim(),
      wazeUrl:       input.wazeUrl.trim(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Editor] updateInvitationMediaInfo error:', message);
    return { success: false, error: `Error al guardar multimedia: ${message}` };
  }

  revalidatePath(`/i/${input.slug}`);
  revalidatePath(`/preview/${id}`);
  revalidatePath(`/dashboard/invitations/${id}/edit`);

  return { success: true, message: 'Multimedia actualizado correctamente.' };
}

// =============================================================================
// updateInvitationMusicTrack
// =============================================================================

export interface UpdateMusicTrackInput {
  id: string;
  slug: string;
  trackId: string;   // 'none' or '' means "Sin música"
  audioUrl: string | null;
  title: string;
}

export async function updateInvitationMusicTrack(
  input: UpdateMusicTrackInput,
): Promise<UpdateInvitationResult> {
  const planError = await checkPlanAccess(input.id, 'premium');
  if (planError) return planError;

  const { id } = input;

  const isNone = input.trackId === '' || input.trackId === 'none';

  try {
    const repo = await getAuthorizedInvitationRepository(id);

    // Read current state so we don't accidentally clear hero video / YouTube /
    // maps URLs that belong to other form sections. Passing '' to updateMediaInfo
    // for heroVideoUrl or youtubeUrl would set them to null in the repository.
    const current = await repo.getById(id);
    const existingHeroVideoUrl  = current?.hero?.videoUrl        ?? '';
    const existingYoutubeUrl    = current?.hero?.youtubeUrl      ?? '';
    const existingHeroImageUrl  = current?.hero?.imageUrl        ?? '';
    const existingGoogleMapsUrl = current?.location?.googleMapsLink ?? '';
    const existingWazeUrl       = current?.location?.wazeLink    ?? '';

    await repo.updateMediaInfo(id, {
      heroImageUrl:   existingHeroImageUrl,
      heroVideoUrl:   existingHeroVideoUrl,
      musicUrl:       isNone ? '' : (input.audioUrl ?? ''),
      musicTitle:     isNone ? '' : input.title,
      musicTrackId:   isNone ? 'none' : input.trackId,
      clearMusicUrl:  isNone,
      youtubeUrl:     existingYoutubeUrl,
      googleMapsUrl:  existingGoogleMapsUrl,
      wazeUrl:        existingWazeUrl,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Editor] updateInvitationMusicTrack error:', message);
    return { success: false, error: `Error al guardar música: ${message}` };
  }

  revalidatePath(`/i/${input.slug}`);
  revalidatePath(`/preview/${id}`);
  revalidatePath(`/dashboard/invitations/${id}/edit`);

  return { success: true, message: 'Música actualizada correctamente.' };
}

// =============================================================================
// updateInvitationHeroVideo
// =============================================================================

export interface UpdateHeroVideoInput {
  id: string;
  slug: string;
  videoId: string;         // 'none' to disable
  videoUrl: string | null;
  videoTitle: string;
}

export async function updateInvitationHeroVideo(
  input: UpdateHeroVideoInput,
): Promise<UpdateInvitationResult> {
  const planError = await checkPlanAccess(input.id, 'premium');
  if (planError) return planError;

  const { id } = input;

  console.log('[heroVideo/save] selectedVideoId:', input.videoId);
  console.log('[heroVideo/save] url:', input.videoUrl);
  console.log('[heroVideo/save] enabled:', input.videoId !== 'none' && !!input.videoUrl);

  try {
    const invitationRepository = await getAuthorizedInvitationRepository(id);
    const heroVideoInput: InvitationHeroVideoInput = {
      videoId:    input.videoId,
      videoUrl:   input.videoUrl,
      videoTitle: input.videoTitle,
    };
    await invitationRepository.updateHeroVideo(id, heroVideoInput);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Editor] updateInvitationHeroVideo error:', message);
    return { success: false, error: `Error al guardar video: ${message}` };
  }

  revalidatePath(`/i/${input.slug}`);
  revalidatePath(`/preview/${id}`);
  revalidatePath(`/dashboard/invitations/${id}/edit`);

  return { success: true, message: 'Video actualizado correctamente.' };
}

// =============================================================================
// updateInvitationGallery
// =============================================================================

export interface UpdateInvitationGalleryInput {
  id: string;
  slug: string;
  items: GalleryImageItem[];
}

export async function updateInvitationGallery(
  input: UpdateInvitationGalleryInput,
): Promise<UpdateInvitationResult> {
  const planError = await checkPlanAccess(input.id, 'premium');
  if (planError) return planError;

  // Validate: no empty URLs, all must be valid absolute URLs.
  for (let i = 0; i < input.items.length; i++) {
    const item = input.items[i];
    if (!item.url.trim()) {
      return { success: false, error: `La imagen #${i + 1} no tiene URL.` };
    }
    try {
      new URL(item.url.trim());
    } catch {
      return { success: false, error: `La URL de la imagen #${i + 1} no es válida.` };
    }
  }

  const { id } = input;

  try {
    await invitationRepository.updateGallery(id, {
      items: input.items.map((item) => ({
        url:     item.url.trim(),
        caption: item.caption.trim(),
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Editor] updateInvitationGallery error:', message);
    return { success: false, error: `Error al guardar la galería: ${message}` };
  }

  revalidatePath(`/i/${input.slug}`);
  revalidatePath(`/preview/${id}`);
  revalidatePath(`/dashboard/invitations/${id}/edit`);

  return {
    success: true,
    message: `Galería guardada: ${input.items.length} imagen${input.items.length !== 1 ? 'es' : ''}.`,
  };
}

// =============================================================================
// updateInvitationProtagonists
// =============================================================================

export interface UpdateInvitationProtagonistsInput {
  id: string;
  slug: string;
  protagonists: InvitationProtagonistInput[];
}

export async function updateInvitationProtagonists(
  input: UpdateInvitationProtagonistsInput,
): Promise<UpdateInvitationResult> {
  if (input.protagonists.length === 0) {
    return { success: false, error: 'Debe haber al menos un protagonista.' };
  }

  for (let i = 0; i < input.protagonists.length; i++) {
    const p = input.protagonists[i];
    if (!p.name.trim()) {
      return { success: false, error: `El nombre del protagonista #${i + 1} es requerido.` };
    }
    if (p.imageUrl && (() => { try { new URL(p.imageUrl); return false; } catch { return true; } })()) {
      return { success: false, error: `La URL de imagen del protagonista "${p.name}" no es válida.` };
    }
  }

  const { id } = input;

  try {
    await invitationRepository.updateProtagonists(id, {
      protagonists: input.protagonists.map((p) => ({
        id:          p.id,
        name:        p.name.trim(),
        role:        p.role.trim(),
        familyLabel: p.familyLabel.trim(),
        imageUrl:    p.imageUrl.trim(),
        quote:       p.quote.trim(),
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Editor] updateInvitationProtagonists error:', message);
    return { success: false, error: `Error al guardar protagonistas: ${message}` };
  }

  revalidatePath(`/i/${input.slug}`);
  revalidatePath(`/preview/${id}`);
  revalidatePath(`/dashboard/invitations/${id}/edit`);

  return {
    success: true,
    message: `${input.protagonists.length} protagonista${input.protagonists.length !== 1 ? 's' : ''} guardado${input.protagonists.length !== 1 ? 's' : ''} correctamente.`,
  };
}

// =============================================================================
// updateInvitationItinerary
// =============================================================================

export interface UpdateInvitationItineraryInput {
  id: string;
  slug: string;
  items: InvitationItineraryItemInput[];
}

export async function updateInvitationItinerary(
  input: UpdateInvitationItineraryInput,
): Promise<UpdateInvitationResult> {
  for (let i = 0; i < input.items.length; i++) {
    const item = input.items[i];
    if (!item.time.trim())  return { success: false, error: `El evento #${i + 1} necesita una hora.` };
    if (!item.title.trim()) return { success: false, error: `El evento #${i + 1} necesita un título.` };
  }

  const { id } = input;

  try {
    await invitationRepository.updateItinerary(id, {
      items: input.items.map((item) => ({
        id:          item.id,
        time:        item.time.trim(),
        title:       item.title.trim(),
        location:    item.location.trim(),
        icon:        item.icon,
        description: item.description.trim(),
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Editor] updateInvitationItinerary error:', message);
    return { success: false, error: `Error al guardar el itinerario: ${message}` };
  }

  revalidatePath(`/i/${input.slug}`);
  revalidatePath(`/preview/${id}`);
  revalidatePath(`/dashboard/invitations/${id}/edit`);

  return {
    success: true,
    message: `Itinerario guardado: ${input.items.length} evento${input.items.length !== 1 ? 's' : ''}.`,
  };
}

// =============================================================================
// updateInvitationGiftRegistry
// =============================================================================

export interface UpdateInvitationGiftRegistryInput {
  id: string;
  slug: string;
  items: InvitationGiftProviderInput[];
}

export async function updateInvitationGiftRegistry(
  input: UpdateInvitationGiftRegistryInput,
): Promise<UpdateInvitationResult> {
  const planError = await checkPlanAccess(input.id, 'deluxe');
  if (planError) return planError;

  for (let i = 0; i < input.items.length; i++) {
    const item = input.items[i];
    if (!item.provider.trim()) {
      return { success: false, error: `El proveedor #${i + 1} necesita un nombre.` };
    }
    if (item.logoType !== 'bank' && item.logoType !== 'custom') {
      if (!item.link.trim()) {
        return { success: false, error: `El proveedor "${item.provider}" necesita una URL.` };
      }
      if (!isValidUrl(item.link.trim())) {
        return { success: false, error: `La URL del proveedor "${item.provider}" no es válida.` };
      }
    } else if (item.logoType === 'bank') {
      if (!item.bankName.trim())     return { success: false, error: `La transferencia "${item.provider}" necesita nombre de banco.` };
      if (!item.accountOwner.trim()) return { success: false, error: `La transferencia "${item.provider}" necesita nombre del titular.` };
      if (!item.clabe.trim())        return { success: false, error: `La transferencia "${item.provider}" necesita la CLABE.` };
      if (!/^\d{18}$/.test(item.clabe.trim())) {
        return { success: false, error: `La CLABE de "${item.provider}" debe tener exactamente 18 dígitos.` };
      }
    }
  }

  const { id } = input;

  try {
    await invitationRepository.updateGiftRegistry(id, { items: input.items });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Editor] updateInvitationGiftRegistry error:', message);
    return { success: false, error: `Error al guardar la mesa de regalos: ${message}` };
  }

  revalidatePath(`/i/${input.slug}`);
  revalidatePath(`/preview/${id}`);
  revalidatePath(`/dashboard/invitations/${id}/edit`);

  return {
    success: true,
    message: `Mesa de regalos guardada: ${input.items.length} proveedor${input.items.length !== 1 ? 'es' : ''}.`,
  };
}

// =============================================================================
// updateInvitationDressCode
// =============================================================================

export interface UpdateInvitationDressCodeInput {
  id: string;
  slug: string;
  dressCode: InvitationDressCodeInput;
}

const HEX_RE = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

export async function updateInvitationDressCode(
  input: UpdateInvitationDressCodeInput,
): Promise<UpdateInvitationResult> {
  const dc = input.dressCode;

  if (!dc.type.trim()) {
    return { success: false, error: 'La etiqueta del dress code es requerida.' };
  }
  if (dc.primaryColor && !HEX_RE.test(dc.primaryColor.trim())) {
    return { success: false, error: 'El color principal debe ser un valor hex válido (ej. #C5A880).' };
  }
  if (dc.secondaryColor && !HEX_RE.test(dc.secondaryColor.trim())) {
    return { success: false, error: 'El color secundario debe ser un valor hex válido (ej. #E8DDD0).' };
  }
  for (let i = 0; i < dc.suggestionsList.length; i++) {
    if (!dc.suggestionsList[i].trim()) {
      return { success: false, error: `La sugerencia #${i + 1} está vacía.` };
    }
  }
  // Validate colors if provided
  if (dc.colors && Array.isArray(dc.colors)) {
    for (let i = 0; i < dc.colors.length; i++) {
      const color = dc.colors[i]?.trim();
      if (color && !HEX_RE.test(color)) {
        return { success: false, error: `El color #${i + 1} debe ser un valor hex válido (ej. #C5A880).` };
      }
    }
  }

  const { id } = input;

  try {
    await invitationRepository.updateDressCode(id, {
      type:           dc.type.trim(),
      title:          dc.title.trim(),
      description:    dc.description.trim(),
      observations:   dc.observations.trim(),
      primaryColor:   dc.primaryColor.trim(),
      secondaryColor: dc.secondaryColor.trim(),
      suggestionsList: dc.suggestionsList.map((s) => s.trim()).filter(Boolean),
      colors:         dc.colors ? dc.colors.map((c) => c.trim()).filter(Boolean) : undefined,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Editor] updateInvitationDressCode error:', message);
    return { success: false, error: `Error al guardar el dress code: ${message}` };
  }

  revalidatePath(`/i/${input.slug}`);
  revalidatePath(`/preview/${id}`);
  revalidatePath(`/dashboard/invitations/${id}/edit`);

  return { success: true, message: 'Dress code guardado correctamente.' };
}

// =============================================================================
// updateInvitationPadrinos
// =============================================================================

export interface UpdateInvitationPadrinosInput {
  id: string;
  slug: string;
  padrinos: InvitationSponsorInput[];
}

export async function updateInvitationPadrinos(
  input: UpdateInvitationPadrinosInput,
): Promise<UpdateInvitationResult> {
  const planError = await checkPlanAccess(input.id, 'deluxe');
  if (planError) return planError;

  if (input.padrinos.length === 0) {
    return { success: false, error: 'Debe haber al menos una categoría de padrinos.' };
  }

  for (let i = 0; i < input.padrinos.length; i++) {
    const p = input.padrinos[i];
    if (!p.rubro.trim()) {
      return { success: false, error: `La categoría #${i + 1} necesita un rubro.` };
    }
    const validNames = p.names.filter((n) => n.trim());
    if (validNames.length === 0) {
      return { success: false, error: `La categoría "${p.rubro}" debe tener al menos un nombre.` };
    }
    for (let j = 0; j < p.names.length; j++) {
      if (!p.names[j].trim()) {
        return { success: false, error: `El nombre #${j + 1} de "${p.rubro}" no puede estar vacío.` };
      }
    }
  }

  const { id } = input;

  try {
    await invitationRepository.updatePadrinos(id, {
      padrinos: input.padrinos.map((p) => ({
        id:    p.id,
        rubro: p.rubro.trim(),
        icon:  p.icon,
        names: p.names.map((n) => n.trim()).filter(Boolean),
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Editor] updateInvitationPadrinos error:', message);
    return { success: false, error: `Error al guardar padrinos: ${message}` };
  }

  revalidatePath(`/i/${input.slug}`);
  revalidatePath(`/preview/${id}`);
  revalidatePath(`/dashboard/invitations/${id}/edit`);

  return {
    success: true,
    message: `Padrinos guardados: ${input.padrinos.length} categoría${input.padrinos.length !== 1 ? 's' : ''}.`,
  };
}

// =============================================================================
// updateStoryBook
// =============================================================================

export interface UpdateInvitationStoryBookInput {
  id: string;
  slug: string;
  slides: InvitationStorySlideInput[];
}

export async function updateStoryBook(
  input: UpdateInvitationStoryBookInput,
): Promise<UpdateInvitationResult> {
  const planError = await checkPlanAccess(input.id, 'deluxe');
  if (planError) return planError;

  if (input.slides.length === 0) {
    return { success: false, error: 'El StoryBook debe tener al menos un slide.' };
  }

  for (let i = 0; i < input.slides.length; i++) {
    const s = input.slides[i];
    if (!s.title.trim()) {
      return { success: false, error: `El slide #${i + 1} necesita un título.` };
    }
    if (!s.text.trim()) {
      return { success: false, error: `El slide #${i + 1} necesita texto principal.` };
    }
    if (!s.imageUrl.trim()) {
      return { success: false, error: `El slide #${i + 1} necesita una URL de imagen.` };
    }
    try {
      new URL(s.imageUrl.trim());
    } catch {
      return { success: false, error: `La URL de imagen del slide #${i + 1} no es válida.` };
    }
  }

  const { id } = input;

  try {
    await invitationRepository.updateStoryBook(id, {
      slides: input.slides.map((s) => ({
        id:       s.id,
        title:    s.title.trim(),
        subtitle: s.subtitle.trim(),
        text:     s.text.trim(),
        imageUrl: s.imageUrl.trim(),
        date:     s.date.trim(),
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Editor] updateStoryBook error:', message);
    return { success: false, error: `Error al guardar el StoryBook: ${message}` };
  }

  revalidatePath(`/i/${input.slug}`);
  revalidatePath(`/preview/${id}`);
  revalidatePath(`/dashboard/invitations/${id}/edit`);

  return {
    success: true,
    message: `StoryBook guardado: ${input.slides.length} slide${input.slides.length !== 1 ? 's' : ''}.`,
  };
}

// =============================================================================
// updateAccommodation
// =============================================================================

export interface UpdateInvitationAccommodationInput {
  id: string;
  slug: string;
  hotels: InvitationHotelInput[];
}

export async function updateAccommodation(
  input: UpdateInvitationAccommodationInput,
): Promise<UpdateInvitationResult> {
  const planError = await checkPlanAccess(input.id, 'deluxe');
  if (planError) return planError;

  for (let i = 0; i < input.hotels.length; i++) {
    const h = input.hotels[i];
    if (!h.name.trim()) {
      return { success: false, error: `El hotel #${i + 1} necesita un nombre.` };
    }
    if (h.stars < 1 || h.stars > 5 || !Number.isInteger(h.stars)) {
      return { success: false, error: `Las estrellas del hotel "${h.name}" deben ser un número entero entre 1 y 5.` };
    }
    if (h.bookingLink.trim() && !isValidUrl(h.bookingLink.trim())) {
      return { success: false, error: `El sitio web del hotel "${h.name}" no es una URL válida.` };
    }
    if (h.imageUrl.trim() && !isValidUrl(h.imageUrl.trim())) {
      return { success: false, error: `La imagen del hotel "${h.name}" no es una URL válida.` };
    }
  }

  const { id } = input;

  try {
    await invitationRepository.updateAccommodation(id, {
      hotels: input.hotels.map((h) => ({
        id:          h.id,
        name:        h.name.trim(),
        stars:       h.stars,
        address:     h.address.trim(),
        distance:    h.distance.trim(),
        priceRange:  h.priceRange.trim(),
        phone:       h.phone.trim(),
        bookingLink: h.bookingLink.trim(),
        imageUrl:    h.imageUrl.trim(),
        description: h.description.trim(),
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Editor] updateAccommodation error:', message);
    return { success: false, error: `Error al guardar hospedaje: ${message}` };
  }

  revalidatePath(`/i/${input.slug}`);
  revalidatePath(`/preview/${id}`);
  revalidatePath(`/dashboard/invitations/${id}/edit`);

  return {
    success: true,
    message: `Hospedaje guardado: ${input.hotels.length} hotel${input.hotels.length !== 1 ? 'es' : ''}.`,
  };
}

// =============================================================================
// updateSocial
// =============================================================================

export interface UpdateInvitationSocialInput {
  id: string;
  slug: string;
  social: InvitationSocialInput;
}

function stripAt(handle: string): string {
  return handle.startsWith('@') ? handle.slice(1) : handle;
}

export async function updateSocial(
  input: UpdateInvitationSocialInput,
): Promise<UpdateInvitationResult> {
  try {
    const planError = await checkPlanAccess(input.id, 'premium');
    if (planError) return planError;

    const s = input.social;

    if (s.facebookUrl.trim() && !isValidUrl(s.facebookUrl.trim())) {
      return { success: false, error: 'La URL de Facebook no es válida.' };
    }
    if (s.youtubeUrl.trim() && !isValidUrl(s.youtubeUrl.trim())) {
      return { success: false, error: 'La URL de YouTube no es válida.' };
    }

    const { id } = input;

    await invitationRepository.updateSocial(id, {
      hashtag:         s.hashtag.trim().replace(/^#/, ''),
      instagramHandle: stripAt(s.instagramHandle.trim()),
      tiktokHandle:    stripAt(s.tiktokHandle.trim()),
      facebookUrl:     s.facebookUrl.trim(),
      youtubeUrl:      s.youtubeUrl.trim(),
      note:            s.note.trim(),
    });

    revalidatePath(`/i/${input.slug}`);
    revalidatePath(`/preview/${id}`);
    revalidatePath(`/dashboard/invitations/${id}/edit`);

    return { success: true, message: 'Hashtag y redes guardados correctamente.' };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Editor] updateSocial error:', message);
    return { success: false, error: `Error al guardar redes sociales: ${message}` };
  }
}

// =============================================================================
// updateFinalMessage
// =============================================================================

export interface UpdateInvitationFinalMessageInput {
  id: string;
  slug: string;
  finalMessage: InvitationFinalMessageInput;
}

export async function updateFinalMessage(
  input: UpdateInvitationFinalMessageInput,
): Promise<UpdateInvitationResult> {
  const fm = input.finalMessage;

  if (!fm.quote.trim()) {
    return { success: false, error: 'La cita/frase del mensaje final es requerida.' };
  }
  if (fm.imageUrl.trim() && !isValidUrl(fm.imageUrl.trim())) {
    return { success: false, error: 'La URL de imagen no es válida.' };
  }

  const { id } = input;

  try {
    await invitationRepository.updateFinalMessage(id, {
      title:     fm.title.trim(),
      message:   fm.message.trim(),
      quote:     fm.quote.trim(),
      imageUrl:  fm.imageUrl.trim(),
      signature: fm.signature.trim(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Editor] updateFinalMessage error:', message);
    return { success: false, error: `Error al guardar el mensaje final: ${message}` };
  }

  revalidatePath(`/i/${input.slug}`);
  revalidatePath(`/preview/${id}`);
  revalidatePath(`/dashboard/invitations/${id}/edit`);

  return { success: true, message: 'Mensaje final guardado correctamente.' };
}

// =============================================================================
// updateTimeline
// =============================================================================

export interface UpdateInvitationTimelineInput {
  id: string;
  slug: string;
  events: InvitationTimelineEventInput[];
}

export async function updateTimeline(
  input: UpdateInvitationTimelineInput,
): Promise<UpdateInvitationResult> {
  const planError = await checkPlanAccess(input.id, 'deluxe');
  if (planError) return planError;

  for (let i = 0; i < input.events.length; i++) {
    const e = input.events[i];
    if (!e.year.trim()) {
      return { success: false, error: `El evento #${i + 1} necesita un año.` };
    }
    if (!e.title.trim()) {
      return { success: false, error: `El evento #${i + 1} necesita un título.` };
    }
    if (!e.description.trim()) {
      return { success: false, error: `El evento #${i + 1} necesita una descripción.` };
    }
    if (e.imageUrl.trim() && !isValidUrl(e.imageUrl.trim())) {
      return { success: false, error: `La URL de imagen del evento "${e.title}" no es válida.` };
    }
  }

  const { id } = input;

  try {
    await invitationRepository.updateTimeline(id, {
      events: input.events.map((e) => ({
        id:          e.id,
        year:        e.year.trim(),
        title:       e.title.trim(),
        description: e.description.trim(),
        imageUrl:    e.imageUrl.trim(),
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Editor] updateTimeline error:', message);
    return { success: false, error: `Error al guardar el timeline: ${message}` };
  }

  revalidatePath(`/i/${input.slug}`);
  revalidatePath(`/preview/${id}`);
  revalidatePath(`/dashboard/invitations/${id}/edit`);

  return {
    success: true,
    message: `Timeline guardado: ${input.events.length} evento${input.events.length !== 1 ? 's' : ''}.`,
  };
}

// =============================================================================
// updateFeatureOverrides
// =============================================================================

export interface UpdateFeatureOverridesInput {
  id: string;
  slug: string;
  /** Only keys explicitly set by the admin. Keys absent = defer to plan default. */
  overrides: Partial<Record<InvitationFeatureKey, boolean>>;
}

export async function updateFeatureOverrides(
  input: UpdateFeatureOverridesInput,
): Promise<UpdateInvitationResult> {
  const { id } = input;

  // Strip undefined values to keep the JSONB clean.
  let overrides: FeatureOverrides = Object.fromEntries(
    Object.entries(input.overrides).filter(([, v]) => v !== undefined),
  ) as FeatureOverrides;

  // Never enable features outside the invitation's purchased plan.
  const inv = await invitationRepository.getById(id);
  if (inv) {
    const planDefaults = getFeaturesForPlan(normalizePlanId(inv.planId));
    overrides = Object.fromEntries(
      Object.entries(overrides).filter(([key, value]) => {
        if (value !== true) return true; // allow disabling any feature
        return planDefaults[key as InvitationFeatureKey] === true;
      }),
    ) as FeatureOverrides;
  }

  try {
    await invitationRepository.updateFeatureOverrides(id, overrides);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Editor] updateFeatureOverrides error:', message);
    return { success: false, error: `Error al guardar configuración: ${message}` };
  }

  revalidatePath(`/i/${input.slug}`);
  revalidatePath(`/preview/${id}`);
  revalidatePath(`/dashboard/invitations/${id}/edit`);

  return { success: true, message: 'Configuración de secciones guardada correctamente.' };
}

// =============================================================================
// updateSectionVisibility
// =============================================================================

export interface UpdateSectionVisibilityInput {
  id: string;
  slug: string;
  sectionId: string;
  hidden: boolean;
}

export async function updateSectionVisibility(
  input: UpdateSectionVisibilityInput,
): Promise<UpdateInvitationResult> {
  const { id, slug, sectionId, hidden } = input;

  const inv = await invitationRepository.getById(id);
  if (!inv) return { success: false, error: 'Invitación no encontrada.' };

  const currentOverrides: FeatureOverrides = (inv.featureOverrides as FeatureOverrides) ?? {};
  const currentHidden = currentOverrides.hiddenSections ?? [];

  const newHidden = hidden
    ? currentHidden.includes(sectionId) ? currentHidden : [...currentHidden, sectionId]
    : currentHidden.filter((s) => s !== sectionId);

  const newOverrides: FeatureOverrides = { ...currentOverrides, hiddenSections: newHidden };

  try {
    await invitationRepository.updateFeatureOverrides(id, newOverrides);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Editor] updateSectionVisibility error:', message);
    return { success: false, error: `Error al guardar visibilidad: ${message}` };
  }

  revalidatePath(`/i/${slug}`);
  revalidatePath(`/preview/${id}`);
  revalidatePath(`/dashboard/invitations/${id}/edit`);

  return { success: true, message: hidden ? 'Sección oculta.' : 'Sección visible.' };
}

// =============================================================================
// updateThemeSelection
// =============================================================================

export interface UpdateThemeSelectionInput {
  id: string;
  slug: string;
  themeId: string;
}

const VALID_THEME_IDS = new Set(['ivory-editorial', 'blanco-deluxe', 'rosa-antiguo']);

export async function updateThemeSelection(
  input: UpdateThemeSelectionInput,
): Promise<UpdateInvitationResult> {
  const themeId = input.themeId.trim();

  if (!themeId) {
    return { success: false, error: 'Debes seleccionar un tema.' };
  }
  if (!VALID_THEME_IDS.has(themeId)) {
    return { success: false, error: `Tema "${themeId}" no reconocido.` };
  }

  const { id } = input;

  try {
    await invitationRepository.updateThemeSelection(id, { themeId });
    console.log('[theme-change] updateThemeSelection complete', { invitationId: id, themeId, onlyUpdatedThemeId: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Editor] updateThemeSelection error:', message);
    return { success: false, error: `Error al guardar el tema: ${message}` };
  }

  revalidatePath(`/i/${input.slug}`);
  revalidatePath(`/preview/${id}`);
  revalidatePath(`/dashboard/invitations/${id}/edit`);

  return { success: true, message: `Tema "${themeId}" aplicado correctamente.` };
}

// =============================================================================
// updateInvitationLocation
// =============================================================================

export interface UpdateInvitationLocationInput {
  id: string;
  slug: string;
  googleMapsUrl: string;
  wazeUrl: string;
}

export async function updateInvitationLocation(
  input: UpdateInvitationLocationInput,
): Promise<UpdateInvitationResult> {
  if (input.googleMapsUrl) {
    const gm = input.googleMapsUrl;
    if (
      !gm.includes('maps.google') &&
      !gm.includes('google.com/maps') &&
      !gm.includes('goo.gl/maps') &&
      !gm.includes('maps.app.goo.gl')
    ) {
      return { success: false, error: 'La URL de Google Maps debe ser un enlace de maps.google.com, google.com/maps o goo.gl/maps.' };
    }
    if (!isValidUrl(gm)) return { success: false, error: 'La URL de Google Maps no es válida.' };
  }
  if (input.wazeUrl) {
    if (!input.wazeUrl.includes('waze.com')) {
      return { success: false, error: 'La URL de Waze debe ser de waze.com.' };
    }
    if (!isValidUrl(input.wazeUrl)) return { success: false, error: 'La URL de Waze no es válida.' };
  }

  const { id } = input;

  // Preserve existing media fields — only update location links.
  const current = await getServiceInvitationRepository().getById(id);
  if (!current) return { success: false, error: 'Invitación no encontrada.' };

  try {
    const repo = await getAuthorizedInvitationRepository(id);
    await repo.updateMediaInfo(id, {
      heroImageUrl:  current.hero?.imageUrl   ?? '',
      heroVideoUrl:  current.hero?.videoUrl   ?? '',
      musicUrl:      current.music?.audioUrl  ?? '',
      musicTitle:    current.music?.title     ?? '',
      youtubeUrl:    current.hero?.youtubeUrl ?? '',
      googleMapsUrl: input.googleMapsUrl.trim(),
      wazeUrl:       input.wazeUrl.trim(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Editor] updateInvitationLocation error:', message);
    return { success: false, error: `Error al guardar la ubicación: ${message}` };
  }

  revalidatePath(`/i/${input.slug}`);
  revalidatePath(`/preview/${id}`);
  revalidatePath(`/dashboard/invitations/${id}/edit`);

  return { success: true, message: 'Ubicación guardada correctamente.' };
}

// =============================================================================
// updateInvitationParents
// =============================================================================

export interface UpdateInvitationParentsInput {
  id: string;
  slug: string;
  brideFather: string;
  brideMother: string;
  groomFather: string;
  groomMother: string;
  brideProtagonistId: string;
  groomProtagonistId: string;
}

export async function updateInvitationParents(
  input: UpdateInvitationParentsInput,
): Promise<UpdateInvitationResult> {
  const { id } = input;

  // Plan guard — parents is Deluxe-only
  const inv = await invitationRepository.getById(id);
  if (!inv || inv.planId !== 'deluxe') {
    return { success: false, error: 'La sección Padres está disponible únicamente en el plan Deluxe.' };
  }

  const parents: ParentCouple[] = [];

  const hasBride = input.brideFather.trim() || input.brideMother.trim();
  const hasGroom = input.groomFather.trim() || input.groomMother.trim();

  if (hasBride) {
    parents.push({
      side:          'bride',
      protagonistId: input.brideProtagonistId || 'bride',
      fatherName:    input.brideFather.trim(),
      motherName:    input.brideMother.trim(),
    });
  }
  if (hasGroom) {
    parents.push({
      side:          'groom',
      protagonistId: input.groomProtagonistId || 'groom',
      fatherName:    input.groomFather.trim(),
      motherName:    input.groomMother.trim(),
    });
  }

  try {
    const repo = await getAuthorizedInvitationRepository(id);
    await repo.updateParents(id, { parents });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Editor] updateInvitationParents error:', message);
    return { success: false, error: `Error al guardar los padres: ${message}` };
  }

  revalidatePath(`/${input.slug}`);
  revalidatePath(`/i/${input.slug}`);
  revalidatePath(`/invitaciones/${input.slug}`);
  revalidatePath(`/preview/${id}`);
  revalidatePath(`/dashboard/invitations/${id}/edit`);

  return { success: true, message: 'Padres guardados correctamente.' };
}

// =============================================================================
// startWeddingQuickStart
// =============================================================================

export interface StartWeddingQuickStartInput {
  invitationId: string;
  brideName: string;
  groomName: string;
  weddingDate: string;
  ceremonyTime?: string;
  receptionTime?: string;
  venueName?: string;
  address?: string;
  googleMapsUrl?: string;
  wazeUrl?: string;
  themeId?: string;
  selectedStyle?: WeddingStyle;
  whatsappNumber?: string;
  locationSkipped?: boolean;
  mode?: 'initial' | 'update';
}

export interface StartWeddingQuickStartResult {
  success: boolean;
  message: string;
  invitationId?: string;
  previewUrl?: string;
  publicUrl?: string;
  error?: string;
}

function validateQuickStartInput(input: StartWeddingQuickStartInput): string | null {
  if (!input.invitationId?.trim()) {
    return 'ID de invitación requerido.';
  }
  if (!input.brideName?.trim()) {
    return 'Nombre de la novia requerido.';
  }
  if (!input.groomName?.trim()) {
    return 'Nombre del novio requerido.';
  }
  if (!input.weddingDate?.trim()) {
    return 'Fecha de la boda requerida.';
  }
  return null;
}

/**
 * FASE 1B: Start a quick-start wizard for wedding invitations.
 *
 * Generates initial invitation_content based on plan tier and user inputs,
 * preserving any existing real data. Sets theme_id via updateThemeSelection.
 *
 * Workflow:
 * 1. Validate input
 * 2. Authorize access (ownership + admin override)
 * 3. Confirm category === 'wedding'
 * 4. Read existing content from DB
 * 5. Call generateWeddingTemplate() with plan-aware logic
 * 6. Save generated sections using existing repository methods (RMW pattern)
 * 7. Update theme_id on invitations table
 * 8. Revalidate all relevant routes
 * 9. Return success with preview/public URLs
 */
export async function startWeddingQuickStart(
  input: StartWeddingQuickStartInput,
): Promise<StartWeddingQuickStartResult> {
  // ─── 1. Validate input ────────────────────────────────────────────────────
  const validationError = validateQuickStartInput(input);
  if (validationError) {
    return { success: false, message: validationError, error: validationError };
  }

  const {
    invitationId,
    brideName,
    groomName,
    weddingDate,
    ceremonyTime,
    receptionTime,
    selectedStyle,
    themeId: inputThemeId,
    venueName,
    address,
    googleMapsUrl,
    wazeUrl,
    whatsappNumber,
    locationSkipped = false,
    mode = 'initial',
  } = input;

  try {
    // ─── 2. Get authorized repository ─────────────────────────────────────
    const repo = await getAuthorizedInvitationRepository(invitationId);

    // ─── 3. Fetch current invitation to verify category & plan ────────────
    const current = await repo.getById(invitationId);
    if (!current) {
      return { success: false, message: 'Invitación no encontrada.', error: 'Invitación no encontrada.' };
    }

    if (current.category !== 'wedding') {
      const msg = 'El asistente Quick Start solo funciona para invitaciones de bodas.';
      return { success: false, message: msg, error: msg };
    }

    const planId = normalizePlanId(current.planId);

    // ─── 4. Generate template content with defaults ────────────────────────
    // Note: protagonists and event_time are NOT passed as existingContent —
    // the wizard always provides them explicitly, so we always regenerate.
    const generatedContent = generateWeddingTemplate({
      brideName: brideName.trim(),
      groomName: groomName.trim(),
      weddingDate,
      weddingTime: ceremonyTime?.trim(),
      receptionTime: receptionTime?.trim(),
      selectedStyle,
      planId,
      existingContent: {
        // protagonists intentionally omitted → always regenerated from wizard input
        // event_time intentionally omitted → updateBasicInfo always writes ceremonyTime
        hero: current.hero,
        final_message: current.finalMessage,
        gallery: current.gallery,
        itinerary: current.itinerary,
        dress_code: current.dressCode,
        location: current.location,
        timeline: current.timeline,
        gift_registry: current.giftRegistry,
        parents: current.parents,
        padrinos: current.padrinos,
        hotels: current.hotels,
        social: current.social,
        music: current.music,
      },
    });

    // ─── 5. Save generated content using repository update methods ───────
    // Use the existing RMW pattern for each section
    // Only save fields that were generated for this plan tier

    if (generatedContent.protagonists !== undefined) {
      const protagonistInputs: InvitationProtagonistInput[] = generatedContent.protagonists.map(
        (p) => ({
          id: p.id,
          name: p.name,
          role: p.role || '',
          familyLabel: p.familyLabel || '',
          imageUrl: p.imageUrl || '',
          quote: p.quote || '',
        }),
      );
      await repo.updateProtagonists(invitationId, { protagonists: protagonistInputs });
      console.log('[QuickStart] Saved protagonists');
    }

    // Always save basic info with wizard data
    const resolvedVenueName = !locationSkipped
      ? (venueName || generatedContent.location?.venueName || current.location?.venueName || '')
      : (current.location?.venueName || '');
    const resolvedAddress = !locationSkipped
      ? (address || generatedContent.location?.address || current.location?.address || '')
      : (current.location?.address || '');

    const basicInput = {
      title: current.title,
      subtitle: current.subtitle,
      slug: current.slug,
      eventDate: normalizeDateForSave(weddingDate),
      eventTime: ceremonyTime?.trim() || generatedContent.event_time || '',
      venueName: resolvedVenueName,
      address: resolvedAddress,
      rsvpWhatsAppNumber: whatsappNumber || current.rsvpWhatsAppNumber || '',
      finalMessageQuote: generatedContent.final_message?.quote || current.finalMessage?.quote || '',
    };
    await repo.updateBasicInfo(invitationId, basicInput);
    console.log('[QuickStart] Saved basic info with wizard data');

    // Update media info: maps links + default music for premium+
    // Always runs for premium/deluxe to set music; conditionally for basic.
    const needsMusicInit = (planId === 'premium' || planId === 'deluxe')
      && generatedContent.music !== undefined
      && !current.music?.audioUrl;
    const needsMapsUpdate = !locationSkipped && (googleMapsUrl || wazeUrl);

    if (needsMusicInit || needsMapsUpdate) {
      const resolvedMusicUrl   = needsMusicInit ? generatedContent.music!.audioUrl : (current.music?.audioUrl || '');
      const resolvedMusicTitle = needsMusicInit ? (generatedContent.music!.title || '') : (current.music?.title || '');
      const resolvedTrackId    = needsMusicInit ? generatedContent.music!.selectedTrackId : current.music?.selectedTrackId;

      await repo.updateMediaInfo(invitationId, {
        heroImageUrl: current.hero?.imageUrl || '',
        heroVideoUrl: current.hero?.videoUrl ?? '',
        musicUrl:     resolvedMusicUrl,
        musicTitle:   resolvedMusicTitle,
        musicTrackId: resolvedTrackId,
        clearMusicUrl: false,
        youtubeUrl:   current.hero?.youtubeUrl || '',
        googleMapsUrl: !locationSkipped ? (googleMapsUrl || current.location?.googleMapsLink || '') : (current.location?.googleMapsLink || ''),
        wazeUrl:       !locationSkipped ? (wazeUrl || current.location?.wazeLink || '') : (current.location?.wazeLink || ''),
      });
      console.log('[QuickStart] Updated media info (maps/music). musicInit:', needsMusicInit);
    }

    if (generatedContent.final_message !== undefined) {
      const finalMessageInput: InvitationFinalMessageInput = {
        title: generatedContent.final_message.title || '',
        message: generatedContent.final_message.message || '',
        quote: generatedContent.final_message.quote || '',
        imageUrl: generatedContent.final_message.imageUrl || '',
        signature: generatedContent.final_message.signature || '',
      };
      await repo.updateFinalMessage(invitationId, finalMessageInput);
      console.log('[QuickStart] Saved final_message');
    }

    // Premium+ sections
    if (planId === 'premium' || planId === 'deluxe') {
      if (generatedContent.gallery !== undefined && !current.gallery?.images?.length) {
        const galleryInput: InvitationGalleryInput = {
          items: generatedContent.gallery.images.map((url, idx) => ({
            url,
            caption: generatedContent.gallery?.captions?.[idx] || '',
          })),
        };
        await repo.updateGallery(invitationId, galleryInput);
        console.log('[QuickStart] Saved gallery');
      }

      if (generatedContent.itinerary !== undefined && !current.itinerary?.length) {
        const itineraryInput: InvitationItineraryInput = {
          items: generatedContent.itinerary.map((item) => ({
            id: item.id,
            time: item.time,
            title: item.title,
            location: item.location,
            icon: item.icon,
            description: item.description || '',
          })),
        };
        await repo.updateItinerary(invitationId, itineraryInput);
        console.log('[QuickStart] Saved itinerary');
      }

      if (generatedContent.dress_code !== undefined && !current.dressCode?.type) {
        const dressCodeInput: InvitationDressCodeInput = {
          type: generatedContent.dress_code.type,
          title: generatedContent.dress_code.title || '',
          description: generatedContent.dress_code.description,
          observations: generatedContent.dress_code.observations || '',
          primaryColor: generatedContent.dress_code.primaryColor || '',
          secondaryColor: generatedContent.dress_code.secondaryColor || '',
          suggestionsList: generatedContent.dress_code.suggestionsList || [],
        };
        await repo.updateDressCode(invitationId, dressCodeInput);
        console.log('[QuickStart] Saved dress_code');
      }
    }

    // Deluxe sections
    if (planId === 'deluxe') {
      if (generatedContent.timeline !== undefined && !current.timeline?.length) {
        const timelineInput: InvitationTimelineInput = {
          events: generatedContent.timeline.map((event) => ({
            id: event.id,
            year: event.year,
            title: event.title,
            description: event.description,
            imageUrl: event.imageUrl || '',
          })),
        };
        await repo.updateTimeline(invitationId, timelineInput);
        console.log('[QuickStart] Saved timeline');
      }

      if (generatedContent.gift_registry !== undefined && !current.giftRegistry?.items?.length) {
        const giftRegistryInput: InvitationGiftRegistryInput = {
          items: generatedContent.gift_registry.items.map((item) => ({
            id: item.id,
            provider: item.provider,
            logoType: item.logoType,
            link: item.link || '',
            description: item.description || '',
            bankName: item.bankDetails?.bankName || '',
            clabe: item.bankDetails?.clabe || '',
            accountOwner: item.bankDetails?.accountOwner || '',
          })),
        };
        await repo.updateGiftRegistry(invitationId, giftRegistryInput);
        console.log('[QuickStart] Saved gift_registry');
      }

      if (generatedContent.parents !== undefined && !current.parents?.length) {
        await repo.updateParents(invitationId, { parents: generatedContent.parents });
        console.log('[QuickStart] Saved parents');
      }

      if (generatedContent.padrinos !== undefined && !current.padrinos?.length) {
        const padrinosInput: InvitationSponsorsInput = {
          padrinos: generatedContent.padrinos.map((p) => ({
            id: p.id,
            rubro: p.rubro,
            icon: p.icon,
            names: p.names,
          })),
        };
        await repo.updatePadrinos(invitationId, padrinosInput);
        console.log('[QuickStart] Saved padrinos');
      }

      if (generatedContent.hotels !== undefined && !current.hotels?.length) {
        const hotelsInput: InvitationAccommodationInput = {
          hotels: generatedContent.hotels.map((h) => ({
            id: h.id,
            name: h.name,
            stars: h.stars,
            address: h.address,
            distance: h.distance,
            priceRange: h.priceRange,
            phone: h.phone || '',
            bookingLink: h.bookingLink || '',
            imageUrl: h.imageUrl || '',
            description: h.description || '',
          })),
        };
        await repo.updateAccommodation(invitationId, hotelsInput);
        console.log('[QuickStart] Saved hotels');
      }

    }

    // Premium+ sections — social (hashtag auto-generated)
    // In update mode: also refresh hashtag if it was auto-generated from old names
    const shouldSaveSocial = (planId === 'premium' || planId === 'deluxe')
      && generatedContent.social !== undefined
      && (!current.social?.hashtag || mode === 'update');
    if (shouldSaveSocial) {
      const socialInput: InvitationSocialInput = {
        hashtag: generatedContent.social!.hashtag,
        instagramHandle: current.social?.instagramHandle || '',
        tiktokHandle: current.social?.tiktokHandle || '',
        facebookUrl: current.social?.facebookUrl || '',
        youtubeUrl: current.social?.youtubeUrl || '',
        note: current.social?.note || '',
      };
      await repo.updateSocial(invitationId, socialInput);
      console.log('[QuickStart] Saved social (hashtag)');
    }

    // ─── 6. Update theme_id in invitations table ──────────────────────────
    const resolvedThemeId = inputThemeId
      ? (inputThemeId as import('@/domain/themes-v2/types').ThemeIdV2)
      : resolveWeddingThemeId(selectedStyle ?? 'elegante');
    await repo.updateThemeSelection(invitationId, { themeId: resolvedThemeId });
    console.log('[QuickStart] Set theme_id to:', resolvedThemeId);

    await markWizardExpressCompleted(invitationId);
    console.log('[QuickStart] Marked WizardExpress completed for invitation:', invitationId);

    // ─── 7. Revalidate all relevant routes ────────────────────────────────
    revalidatePath(`/dashboard/invitations/${invitationId}/edit`);
    revalidatePath(`/preview/${invitationId}`);
    revalidatePath(`/i/${current.slug}`);
    revalidatePath(`/${current.slug}`);
    revalidatePath(`/invitaciones/${current.slug}`);

    console.log('[QuickStart] Wedding quick start completed for invitation:', invitationId);

    return {
      success: true,
      message: 'Tu invitación fue creada correctamente.',
      invitationId,
      previewUrl: `/preview/${invitationId}`,
      publicUrl: `/i/${current.slug}`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[QuickStart] Error:', message);
    return {
      success: false,
      message: `Error al generar la invitación: ${message}`,
      error: message,
    };
  }
}
