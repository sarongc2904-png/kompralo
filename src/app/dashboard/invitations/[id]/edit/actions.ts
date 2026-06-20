'use server';

import { revalidatePath } from 'next/cache';
import type { IInvitationRepository } from '@/domain/invitations';
import { SupabaseInvitationRepository } from '@/domain/invitations/supabase.repository';
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import { verifyInvitationAccess } from '@/lib/access/verifyInvitationAccess';
import type { FeatureOverrides, InvitationFeatureKey } from '@/domain/plans/types';
import type {
  GalleryImageItem,
  InvitationProtagonistInput,
  InvitationItineraryItemInput,
  InvitationGiftProviderInput,
  InvitationDressCodeInput,
  InvitationSponsorInput,
  InvitationStorySlideInput,
  InvitationHotelInput,
  InvitationSocialInput,
  InvitationFinalMessageInput,
  InvitationTimelineEventInput,
} from '@/domain/invitations';

// ─── Shared result type ───────────────────────────────────────────────────────

export type UpdateInvitationResult =
  | { success: true; message: string }
  | { success: false; error: string };

function isAdminMode(): boolean {
  return process.env.ADMIN_ACCESS_ENABLED === 'true';
}

async function getAuthorizedInvitationRepository(invitationId: string): Promise<IInvitationRepository> {
  const serviceSupabase = createServiceRoleSupabaseClient();
  const repository = new SupabaseInvitationRepository(serviceSupabase);
  const invitation = await repository.getById(invitationId);

  if (!invitation) {
    throw new Error('Invitación no encontrada.');
  }

  if (isAdminMode()) {
    return repository;
  }

  let sessionEmail: string | null = null;
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    sessionEmail = user?.email?.toLowerCase() ?? null;
  } catch {
    sessionEmail = null;
  }
  const ownerEmail = invitation.customerEmail?.toLowerCase() ?? null;
  const hasScopedAccess = await verifyInvitationAccess(invitationId);

  if (!sessionEmail && !hasScopedAccess) {
    throw new Error('Sesión requerida para guardar cambios.');
  }
  if (!hasScopedAccess && ownerEmail && ownerEmail !== sessionEmail) {
    throw new Error('No tienes permiso para editar esta invitación.');
  }

  return repository;
}

function getServiceInvitationRepository(): IInvitationRepository {
  return new SupabaseInvitationRepository(createServiceRoleSupabaseClient());
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
  async activateAfterPayment() {
    throw new Error('Editor actions cannot activate invitations after payment.');
  },
  async createFromPaidOrder() {
    throw new Error('Editor actions cannot create invitations from paid orders.');
  },
};

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
  if (input.rsvpWhatsAppNumber && !/^\d{10,15}$/.test(input.rsvpWhatsAppNumber.trim())) {
    return 'El número de WhatsApp debe tener entre 10 y 15 dígitos.';
  }
  return null;
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

  try {
    await invitationRepository.updateBasicInfo(id, {
      title:              input.title.trim(),
      subtitle:           input.subtitle.trim(),
      slug:               newSlug,
      eventDate:          input.eventDate,
      eventTime:          input.eventTime,
      venueName:          input.venueName.trim(),
      address:            input.address.trim(),
      rsvpWhatsAppNumber: input.rsvpWhatsAppNumber.trim(),
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

  try {
    await invitationRepository.updateMediaInfo(id, {
      heroImageUrl:  input.heroImageUrl.trim(),
      heroVideoUrl:  input.heroVideoUrl.trim(),
      musicUrl:      input.musicUrl.trim(),
      musicTitle:    input.musicTitle.trim(),
      youtubeUrl:    input.youtubeUrl.trim(),
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
  const { id } = input;

  const isNone = input.trackId === '' || input.trackId === 'none';

  try {
    const invitationRepository = await getAuthorizedInvitationRepository(id);
    await invitationRepository.updateMediaInfo(id, {
      heroImageUrl:   '',
      heroVideoUrl:   '',
      musicUrl:       isNone ? '' : (input.audioUrl ?? ''),
      musicTitle:     isNone ? '' : input.title,
      musicTrackId:   isNone ? 'none' : input.trackId,
      clearMusicUrl:  isNone,
      youtubeUrl:     '',
      googleMapsUrl:  '',
      wazeUrl:        '',
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
  for (let i = 0; i < input.items.length; i++) {
    const item = input.items[i];
    if (!item.provider.trim()) {
      return { success: false, error: `El proveedor #${i + 1} necesita un nombre.` };
    }
    if (item.logoType !== 'bank') {
      if (!item.link.trim()) {
        return { success: false, error: `El proveedor "${item.provider}" necesita una URL.` };
      }
      if (!isValidUrl(item.link.trim())) {
        return { success: false, error: `La URL del proveedor "${item.provider}" no es válida.` };
      }
    } else {
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
  const s = input.social;

  if (!s.hashtag.trim()) {
    return { success: false, error: 'El hashtag es requerido.' };
  }
  if (s.facebookUrl.trim() && !isValidUrl(s.facebookUrl.trim())) {
    return { success: false, error: 'La URL de Facebook no es válida.' };
  }
  if (s.youtubeUrl.trim() && !isValidUrl(s.youtubeUrl.trim())) {
    return { success: false, error: 'La URL de YouTube no es válida.' };
  }

  const { id } = input;

  try {
    await invitationRepository.updateSocial(id, {
      hashtag:         s.hashtag.trim().replace(/^#/, ''),
      instagramHandle: stripAt(s.instagramHandle.trim()),
      tiktokHandle:    stripAt(s.tiktokHandle.trim()),
      facebookUrl:     s.facebookUrl.trim(),
      youtubeUrl:      s.youtubeUrl.trim(),
      note:            s.note.trim(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Editor] updateSocial error:', message);
    return { success: false, error: `Error al guardar redes sociales: ${message}` };
  }

  revalidatePath(`/i/${input.slug}`);
  revalidatePath(`/preview/${id}`);
  revalidatePath(`/dashboard/invitations/${id}/edit`);

  return { success: true, message: 'Hashtag y redes guardados correctamente.' };
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
  const overrides: FeatureOverrides = Object.fromEntries(
    Object.entries(input.overrides).filter(([, v]) => v !== undefined),
  ) as FeatureOverrides;

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
// updateThemeSelection
// =============================================================================

export interface UpdateThemeSelectionInput {
  id: string;
  slug: string;
  themeId: string;
}

const VALID_THEME_IDS = new Set([
  // V2
  'luxury-gold', 'editorial', 'floral', 'modern-dark',
  // V1 legacy — still accepted so existing invitations don't break
  'champagne', 'modern', 'azure',
]);

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
