/**
 * Supabase implementation of IInvitationRepository.
 *
 * NOT ACTIVE — invitationRepository in repository.ts still points to
 * LocalInvitationRepository. Swap in FASE 6D once the schema is applied
 * and environment variables are set.
 *
 * Schema layout (see supabase/schema.sql):
 *   - `invitations`        — master record (metadata, status, slug, plan, theme)
 *   - `invitation_content` — editable content (JSONB sections), 1:1 FK
 *
 * Queries use a PostgREST embedded resource join:
 *   select('*, invitation_content(*)')
 * The adapter merges both rows into a flat InvitationContent object.
 *
 * JSONB columns parsed automatically by the Supabase JS client:
 *   protagonists, location, hero, story, gallery, timeline, itinerary,
 *   dress_code, gift_registry, music, final_message, parents, padrinos,
 *   hotels, social, feature_overrides
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { IInvitationRepository, ActivateAfterPaymentInput, CreateFromPaidOrderInput, CreateFromPaidOrderResult } from '@/domain/invitations/repository.types';
import type { FeatureOverrides } from '@/domain/plans/types';
import type {
  InvitationContent,
  InvitationBasicInfoInput,
  InvitationMediaInput,
  InvitationGalleryInput,
  InvitationProtagonistsInput,
  InvitationItineraryInput,
  InvitationGiftRegistryInput,
  InvitationDressCodeInput,
  InvitationSponsorsInput,
  InvitationStoryBookInput,
  InvitationAccommodationInput,
  InvitationSocialInput,
  InvitationFinalMessageInput,
  InvitationTimelineInput,
  InvitationThemeSelectionInput,
} from '@/domain/invitations/types';
import type { Database } from '@/lib/supabase/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Supabase returns timestamptz as "2026-10-24T00:00:00+00:00".
 *  <input type="date"> needs exactly "YYYY-MM-DD" — strip the time part. */
function normalizeDateString(value: string | null | undefined): string {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  if (value.includes('T')) return value.split('T')[0];
  return value;
}

// ─── Row type ────────────────────────────────────────────────────────────────
// Until `supabase gen types` is run, rows come back as `any` from the client.
// The adapter below narrows the shape before returning InvitationContent.
// TODO: replace `SupabaseInvitationRow` with the generated type once available.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseInvitationRow = Record<string, any>;

// ─── Normalizers ─────────────────────────────────────────────────────────────

// Handles both camelCase (imageUrl) and legacy snake_case (image_url) JSONB slide data.
function normalizeStory(raw: Record<string, unknown> | null | undefined): { slides: { id: string; imageUrl: string; title: string; text: string; subtitle?: string; date?: string }[] } {
  if (!raw || !Array.isArray((raw as Record<string, unknown>).slides)) return { slides: [] };
  const slides = ((raw as Record<string, unknown>).slides as Record<string, unknown>[]).map((s) => ({
    id:       String(s.id ?? crypto.randomUUID()),
    title:    String(s.title ?? ''),
    text:     String(s.text ?? ''),
    imageUrl: String(s.imageUrl ?? s.image_url ?? ''),
    ...(s.subtitle !== undefined ? { subtitle: String(s.subtitle) } : {}),
    ...(s.date     !== undefined ? { date:     String(s.date) }     : {}),
  }));
  return { slides };
}

// ─── Adapter ─────────────────────────────────────────────────────────────────

// PostgREST embedded join selector — fetches invitations + invitation_content in one round trip.
const INVITATION_SELECT = '*, invitation_content(*)' as const;

/**
 * Maps a PostgREST row (invitations JOIN invitation_content) to InvitationContent.
 * `row`     — columns from `invitations` table
 * `content` — embedded object from `invitation_content` (snake_case)
 */
export function mapSupabaseInvitationToInvitationContent(
  row: SupabaseInvitationRow,
): InvitationContent {
  // PostgREST returns the embedded 1:1 relation as a nested object.
  const c: SupabaseInvitationRow = row.invitation_content ?? {};

  return {
    // ── From invitations ──
    id: row.id,
    slug: row.slug,
    category: row.category,
    variant: row.variant,
    templateId: row.template_id,
    planId: row.plan_id,
    status: row.status,
    themeId: row.theme_id,
    title: row.title,
    subtitle: row.subtitle,
    eventDate: normalizeDateString(row.event_date),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at ?? null,
    customerEmail: row.customer_email ?? null,
    // ── From invitation_content ──
    featureOverrides: c.feature_overrides ?? undefined,
    protagonists: c.protagonists ?? [],
    eventTime: c.event_time ?? '',
    location: c.location,
    hero: c.hero,
    story: normalizeStory(c.story),
    gallery: c.gallery ?? { images: [] },
    timeline: c.timeline ?? [],
    itinerary: c.itinerary ?? [],
    dressCode: c.dress_code,
    giftRegistry: c.gift_registry ?? { items: [] },
    music: c.music,
    finalMessage: c.final_message,
    parents: c.parents ?? [],
    padrinos: c.padrinos ?? [],
    hotels: c.hotels ?? [],
    social: c.social,
    rsvpWhatsAppNumber: c.rsvp_whatsapp_number ?? '',
    rsvpMode: (row.rsvp_mode === 'passes_only' ? 'passes_only' : 'open') as 'open' | 'passes_only',
  };
}

// ─── Repository ───────────────────────────────────────────────────────────────
// NOT ACTIVE — invitationRepository in repository.ts still points to
// LocalInvitationRepository. Swap in FASE 6D.

export class SupabaseInvitationRepository implements IInvitationRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async list(): Promise<InvitationContent[]> {
    const { data, error } = await this.supabase
      .from('invitations')
      .select(INVITATION_SELECT)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map(mapSupabaseInvitationToInvitationContent);
  }

  async getBySlug(slug: string): Promise<InvitationContent | null> {
    const { data, error } = await this.supabase
      .from('invitations')
      .select(INVITATION_SELECT)
      .eq('slug', slug)
      .single();

    if (error || !data) return null;
    return mapSupabaseInvitationToInvitationContent(data);
  }

  async getById(id: string): Promise<InvitationContent | null> {
    const { data, error } = await this.supabase
      .from('invitations')
      .select(INVITATION_SELECT)
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return mapSupabaseInvitationToInvitationContent(data);
  }

  async getPreviewById(id: string): Promise<InvitationContent | null> {
    // Preview resolves by id without status filter — same query as getById.
    return this.getById(id);
  }

  async updateBasicInfo(id: string, input: InvitationBasicInfoInput): Promise<InvitationContent> {
    const now = new Date().toISOString();

    // ── 1. Update `invitations` table (scalar columns) ────────────────────────
    const { error: invError } = await this.supabase
      .from('invitations')
      .update({
        title:      input.title,
        subtitle:   input.subtitle,
        slug:       input.slug,
        event_date: input.eventDate || null,
        updated_at: now,
      })
      .eq('id', id);

    if (invError) {
      throw new Error(`[Supabase] updateBasicInfo invitations update failed: ${invError.message}`);
    }

    // ── 2. Read current invitation_content to safely merge JSONB fields ───────
    // We only overwrite specific nested keys; other keys (googleMapsLink, wazeLink,
    // finalMessage.imageUrl, etc.) are preserved from the current row.
    const { data: currentContent, error: readError } = await this.supabase
      .from('invitation_content')
      .select('location, final_message')
      .eq('invitation_id', id)
      .single();

    if (readError || !currentContent) {
      throw new Error(`[Supabase] updateBasicInfo content read failed: ${readError?.message ?? 'not found'}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingLocation     = (currentContent.location     as Record<string, any>) ?? {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingFinalMessage = (currentContent.final_message as Record<string, any>) ?? {};

    const mergedLocation = {
      ...existingLocation,
      venueName: input.venueName,
      address:   input.address,
    };

    const mergedFinalMessage = {
      ...existingFinalMessage,
      quote: input.finalMessageQuote,
    };

    // ── 3. Update `invitation_content` table ─────────────────────────────────
    const { error: contentError } = await this.supabase
      .from('invitation_content')
      .update({
        event_time:           input.eventTime,
        location:             mergedLocation,
        rsvp_whatsapp_number: input.rsvpWhatsAppNumber,
        final_message:        mergedFinalMessage,
        updated_at:           now,
      })
      .eq('invitation_id', id);

    if (contentError) {
      throw new Error(`[Supabase] updateBasicInfo content update failed: ${contentError.message}`);
    }

    // ── 4. Return the updated full invitation ─────────────────────────────────
    const updated = await this.getById(id);
    if (!updated) {
      throw new Error(`[Supabase] updateBasicInfo: could not re-fetch invitation "${id}" after update`);
    }
    return updated;
  }

  async updateMediaInfo(id: string, input: InvitationMediaInput): Promise<InvitationContent> {
    const now = new Date().toISOString();

    // Read current JSONB columns that require deep merge.
    const { data: current, error: readError } = await this.supabase
      .from('invitation_content')
      .select('hero, music, location')
      .eq('invitation_id', id)
      .single();

    if (readError || !current) {
      throw new Error(`[Supabase] updateMediaInfo content read failed: ${readError?.message ?? 'not found'}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingHero     = (current.hero     as Record<string, any>) ?? {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingMusic    = (current.music    as Record<string, any>) ?? {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingLocation = (current.location as Record<string, any>) ?? {};

    // Merge: only overwrite keys the editor manages; preserve everything else.
    const mergedHero = {
      ...existingHero,
      ...(input.heroImageUrl ? { imageUrl: input.heroImageUrl }   : {}),
      ...(input.heroVideoUrl ? { videoUrl: input.heroVideoUrl }   : { videoUrl: null }),
      ...(input.youtubeUrl   ? { youtubeUrl: input.youtubeUrl }   : { youtubeUrl: null }),
    };

    const mergedMusic = {
      ...existingMusic,
      ...(input.clearMusicUrl
        ? { audioUrl: '', selectedTrackId: 'none', title: null, enabled: false }
        : {
            ...(input.musicUrl   ? { audioUrl: input.musicUrl, enabled: true } : {}),
            ...(input.musicTitle ? { title: input.musicTitle }                 : { title: null }),
            ...(input.musicTrackId !== undefined ? { selectedTrackId: input.musicTrackId } : {}),
          }),
    };

    const mergedLocation = {
      ...existingLocation,
      ...(input.googleMapsUrl ? { googleMapsLink: input.googleMapsUrl } : {}),
      ...(input.wazeUrl       ? { wazeLink: input.wazeUrl }             : {}),
    };

    const { error: updateError } = await this.supabase
      .from('invitation_content')
      .update({
        hero:       mergedHero,
        music:      mergedMusic,
        location:   mergedLocation,
        updated_at: now,
      })
      .eq('invitation_id', id);

    if (updateError) {
      throw new Error(`[Supabase] updateMediaInfo content update failed: ${updateError.message}`);
    }

    // Also bump invitations.updated_at so list views reflect the change.
    await this.supabase
      .from('invitations')
      .update({ updated_at: now })
      .eq('id', id);

    const updated = await this.getById(id);
    if (!updated) {
      throw new Error(`[Supabase] updateMediaInfo: could not re-fetch invitation "${id}" after update`);
    }
    return updated;
  }

  async updateHeroVideo(id: string, input: import('@/domain/invitations/types').InvitationHeroVideoInput): Promise<InvitationContent> {
    const now = new Date().toISOString();
    const isNone = input.videoId === 'none' || !input.videoUrl;

    // Read current hero JSONB to merge non-video fields.
    const { data: current, error: readError } = await this.supabase
      .from('invitation_content')
      .select('hero')
      .eq('invitation_id', id)
      .single();

    if (readError || !current) {
      throw new Error(`[Supabase] updateHeroVideo read failed: ${readError?.message ?? 'not found'}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingHero = (current.hero as Record<string, any>) ?? {};

    const mergedHero = {
      ...existingHero,
      selectedVideoId:    isNone ? 'none'         : input.videoId,
      videoLibraryUrl:    isNone ? null            : input.videoUrl,
      videoLibraryEnabled: !isNone,
      videoLibraryTitle:  isNone ? null            : input.videoTitle,
    };

    const { error: updateError } = await this.supabase
      .from('invitation_content')
      .update({ hero: mergedHero, updated_at: now })
      .eq('invitation_id', id);

    if (updateError) {
      throw new Error(`[Supabase] updateHeroVideo update failed: ${updateError.message}`);
    }

    await this.supabase
      .from('invitations')
      .update({ updated_at: now })
      .eq('id', id);

    const updated = await this.getById(id);
    if (!updated) throw new Error(`[Supabase] updateHeroVideo: could not re-fetch "${id}" after update`);
    return updated;
  }

  async updateGallery(id: string, input: InvitationGalleryInput): Promise<InvitationContent> {
    const now = new Date().toISOString();

    // gallery JSONB stores { images: string[], captions: string[] }.
    // The renderer only reads `images`; `captions` is editor-only metadata.
    const gallery = {
      images:   input.items.map((item) => item.url),
      captions: input.items.map((item) => item.caption),
    };

    const { error } = await this.supabase
      .from('invitation_content')
      .update({ gallery, updated_at: now })
      .eq('invitation_id', id);

    if (error) {
      throw new Error(`[Supabase] updateGallery failed: ${error.message}`);
    }

    await this.supabase
      .from('invitations')
      .update({ updated_at: now })
      .eq('id', id);

    const updated = await this.getById(id);
    if (!updated) {
      throw new Error(`[Supabase] updateGallery: could not re-fetch invitation "${id}" after update`);
    }
    return updated;
  }

  async updateProtagonists(id: string, input: InvitationProtagonistsInput): Promise<InvitationContent> {
    const now = new Date().toISOString();

    // protagonists is a JSONB array on invitation_content.
    // Strip empty optional strings to keep the stored objects clean.
    const protagonists = input.protagonists.map((p) => ({
      id:          p.id,
      name:        p.name,
      ...(p.role        ? { role: p.role }               : {}),
      ...(p.familyLabel ? { familyLabel: p.familyLabel } : {}),
      ...(p.imageUrl    ? { imageUrl: p.imageUrl }        : {}),
      ...(p.quote       ? { quote: p.quote }              : {}),
    }));

    const { error } = await this.supabase
      .from('invitation_content')
      .update({ protagonists, updated_at: now })
      .eq('invitation_id', id);

    if (error) {
      throw new Error(`[Supabase] updateProtagonists failed: ${error.message}`);
    }

    await this.supabase
      .from('invitations')
      .update({ updated_at: now })
      .eq('id', id);

    const updated = await this.getById(id);
    if (!updated) {
      throw new Error(`[Supabase] updateProtagonists: could not re-fetch invitation "${id}" after update`);
    }
    return updated;
  }

  async updateItinerary(id: string, input: InvitationItineraryInput): Promise<InvitationContent> {
    const now = new Date().toISOString();

    // itinerary is a JSONB array on invitation_content.
    // Strip empty description to keep objects clean.
    const itinerary = input.items.map((item) => ({
      id:       item.id,
      time:     item.time,
      title:    item.title,
      location: item.location,
      icon:     item.icon,
      ...(item.description ? { description: item.description } : {}),
    }));

    const { error } = await this.supabase
      .from('invitation_content')
      .update({ itinerary, updated_at: now })
      .eq('invitation_id', id);

    if (error) {
      throw new Error(`[Supabase] updateItinerary failed: ${error.message}`);
    }

    await this.supabase
      .from('invitations')
      .update({ updated_at: now })
      .eq('id', id);

    const updated = await this.getById(id);
    if (!updated) {
      throw new Error(`[Supabase] updateItinerary: could not re-fetch invitation "${id}" after update`);
    }
    return updated;
  }

  async updateGiftRegistry(id: string, input: InvitationGiftRegistryInput): Promise<InvitationContent> {
    const now = new Date().toISOString();

    const gift_registry = {
      items: input.items.map((item) => ({
        id:       item.id,
        provider: item.provider,
        logoType: item.logoType,
        ...(item.link        ? { link: item.link }               : {}),
        ...(item.description ? { description: item.description } : {}),
        ...(item.logoType === 'bank' ? {
          bankDetails: {
            bankName:     item.bankName,
            clabe:        item.clabe,
            accountOwner: item.accountOwner,
          },
        } : {}),
      })),
    };

    const { error } = await this.supabase
      .from('invitation_content')
      .update({ gift_registry, updated_at: now })
      .eq('invitation_id', id);

    if (error) {
      throw new Error(`[Supabase] updateGiftRegistry failed: ${error.message}`);
    }

    await this.supabase
      .from('invitations')
      .update({ updated_at: now })
      .eq('id', id);

    const updated = await this.getById(id);
    if (!updated) {
      throw new Error(`[Supabase] updateGiftRegistry: could not re-fetch invitation "${id}" after update`);
    }
    return updated;
  }

  async updateDressCode(id: string, input: InvitationDressCodeInput): Promise<InvitationContent> {
    const now = new Date().toISOString();

    // Join list → string so renderer (which reads suggestions as a plain string) stays intact.
    const suggestions = input.suggestionsList.filter(Boolean).join('. ');

    const dress_code = {
      type:        input.type,
      description: input.description,
      suggestions,
      ...(input.title          ? { title: input.title }                   : {}),
      ...(input.observations   ? { observations: input.observations }     : {}),
      ...(input.primaryColor   ? { primaryColor: input.primaryColor }     : {}),
      ...(input.secondaryColor ? { secondaryColor: input.secondaryColor } : {}),
      suggestionsList: input.suggestionsList.filter(Boolean),
    };

    const { error } = await this.supabase
      .from('invitation_content')
      .update({ dress_code, updated_at: now })
      .eq('invitation_id', id);

    if (error) {
      throw new Error(`[Supabase] updateDressCode failed: ${error.message}`);
    }

    await this.supabase
      .from('invitations')
      .update({ updated_at: now })
      .eq('id', id);

    const updated = await this.getById(id);
    if (!updated) {
      throw new Error(`[Supabase] updateDressCode: could not re-fetch invitation "${id}" after update`);
    }
    return updated;
  }

  async updatePadrinos(id: string, input: InvitationSponsorsInput): Promise<InvitationContent> {
    const now = new Date().toISOString();

    const padrinos = input.padrinos.map((p) => ({
      id:    p.id,
      rubro: p.rubro,
      icon:  p.icon,
      names: p.names.filter(Boolean),
    }));

    const { error } = await this.supabase
      .from('invitation_content')
      .update({ padrinos, updated_at: now })
      .eq('invitation_id', id);

    if (error) {
      throw new Error(`[Supabase] updatePadrinos failed: ${error.message}`);
    }

    await this.supabase
      .from('invitations')
      .update({ updated_at: now })
      .eq('id', id);

    const updated = await this.getById(id);
    if (!updated) {
      throw new Error(`[Supabase] updatePadrinos: could not re-fetch invitation "${id}" after update`);
    }
    return updated;
  }

  async updateStoryBook(id: string, input: InvitationStoryBookInput): Promise<InvitationContent> {
    const now = new Date().toISOString();

    const story = {
      slides: input.slides.map((s) => ({
        id:       s.id,
        title:    s.title,
        text:     s.text,
        imageUrl: s.imageUrl,
        ...(s.subtitle ? { subtitle: s.subtitle } : {}),
        ...(s.date     ? { date: s.date }         : {}),
      })),
    };

    const { error } = await this.supabase
      .from('invitation_content')
      .update({ story, updated_at: now })
      .eq('invitation_id', id);

    if (error) {
      throw new Error(`[Supabase] updateStoryBook failed: ${error.message}`);
    }

    await this.supabase
      .from('invitations')
      .update({ updated_at: now })
      .eq('id', id);

    const updated = await this.getById(id);
    if (!updated) {
      throw new Error(`[Supabase] updateStoryBook: could not re-fetch invitation "${id}" after update`);
    }
    return updated;
  }

  async updateAccommodation(id: string, input: InvitationAccommodationInput): Promise<InvitationContent> {
    const now = new Date().toISOString();

    const hotels = input.hotels.map((h) => ({
      id:         h.id,
      name:       h.name,
      stars:      h.stars,
      address:    h.address,
      distance:   h.distance,
      priceRange: h.priceRange,
      ...(h.phone       ? { phone:       h.phone       } : {}),
      ...(h.bookingLink ? { bookingLink: h.bookingLink } : {}),
      ...(h.imageUrl    ? { imageUrl:    h.imageUrl    } : {}),
      ...(h.description ? { description: h.description } : {}),
    }));

    const { error } = await this.supabase
      .from('invitation_content')
      .update({ hotels, updated_at: now })
      .eq('invitation_id', id);

    if (error) {
      throw new Error(`[Supabase] updateAccommodation failed: ${error.message}`);
    }

    await this.supabase
      .from('invitations')
      .update({ updated_at: now })
      .eq('id', id);

    const updated = await this.getById(id);
    if (!updated) {
      throw new Error(`[Supabase] updateAccommodation: could not re-fetch invitation "${id}" after update`);
    }
    return updated;
  }

  async updateSocial(id: string, input: InvitationSocialInput): Promise<InvitationContent> {
    const now = new Date().toISOString();

    const social = {
      hashtag: input.hashtag,
      ...(input.instagramHandle ? { instagramHandle: input.instagramHandle } : {}),
      ...(input.tiktokHandle    ? { tiktokHandle:    input.tiktokHandle    } : {}),
      ...(input.facebookUrl     ? { facebookUrl:     input.facebookUrl     } : {}),
      ...(input.youtubeUrl      ? { youtubeUrl:      input.youtubeUrl      } : {}),
      ...(input.note            ? { note:            input.note            } : {}),
    };

    const { error } = await this.supabase
      .from('invitation_content')
      .update({ social, updated_at: now })
      .eq('invitation_id', id);

    if (error) {
      throw new Error(`[Supabase] updateSocial failed: ${error.message}`);
    }

    await this.supabase
      .from('invitations')
      .update({ updated_at: now })
      .eq('id', id);

    const updated = await this.getById(id);
    if (!updated) {
      throw new Error(`[Supabase] updateSocial: could not re-fetch invitation "${id}" after update`);
    }
    return updated;
  }

  async updateFinalMessage(id: string, input: InvitationFinalMessageInput): Promise<InvitationContent> {
    const now = new Date().toISOString();

    // Read-merge-write: preserve any keys the editor doesn't expose (future-proof).
    const { data: currentContent, error: readError } = await this.supabase
      .from('invitation_content')
      .select('final_message')
      .eq('invitation_id', id)
      .single();

    if (readError) {
      throw new Error(`[Supabase] updateFinalMessage read failed: ${readError.message}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = (currentContent?.final_message as Record<string, any>) ?? {};

    const final_message = {
      ...existing,
      quote: input.quote,
      ...(input.imageUrl  ? { imageUrl:  input.imageUrl  } : { imageUrl:  undefined }),
      ...(input.title     ? { title:     input.title     } : {}),
      ...(input.message   ? { message:   input.message   } : {}),
      ...(input.signature ? { signature: input.signature } : {}),
    };

    const { error } = await this.supabase
      .from('invitation_content')
      .update({ final_message, updated_at: now })
      .eq('invitation_id', id);

    if (error) {
      throw new Error(`[Supabase] updateFinalMessage failed: ${error.message}`);
    }

    await this.supabase
      .from('invitations')
      .update({ updated_at: now })
      .eq('id', id);

    const updated = await this.getById(id);
    if (!updated) {
      throw new Error(`[Supabase] updateFinalMessage: could not re-fetch invitation "${id}" after update`);
    }
    return updated;
  }

  async updateTimeline(id: string, input: InvitationTimelineInput): Promise<InvitationContent> {
    const now = new Date().toISOString();

    const timeline = input.events.map((e) => ({
      id:          e.id,
      year:        e.year,
      title:       e.title,
      description: e.description,
      ...(e.imageUrl ? { imageUrl: e.imageUrl } : {}),
    }));

    const { error } = await this.supabase
      .from('invitation_content')
      .update({ timeline, updated_at: now })
      .eq('invitation_id', id);

    if (error) {
      throw new Error(`[Supabase] updateTimeline failed: ${error.message}`);
    }

    await this.supabase
      .from('invitations')
      .update({ updated_at: now })
      .eq('id', id);

    const updated = await this.getById(id);
    if (!updated) {
      throw new Error(`[Supabase] updateTimeline: could not re-fetch invitation "${id}" after update`);
    }
    return updated;
  }

  async updateFeatureOverrides(id: string, overrides: FeatureOverrides): Promise<InvitationContent> {
    const now = new Date().toISOString();

    const { error } = await this.supabase
      .from('invitation_content')
      .update({ feature_overrides: overrides, updated_at: now })
      .eq('invitation_id', id);

    if (error) {
      throw new Error(`[Supabase] updateFeatureOverrides failed: ${error.message}`);
    }

    await this.supabase
      .from('invitations')
      .update({ updated_at: now })
      .eq('id', id);

    const updated = await this.getById(id);
    if (!updated) {
      throw new Error(`[Supabase] updateFeatureOverrides: could not re-fetch invitation "${id}" after update`);
    }
    return updated;
  }

  async updateThemeSelection(id: string, input: InvitationThemeSelectionInput): Promise<InvitationContent> {
    const now = new Date().toISOString();

    const { error } = await this.supabase
      .from('invitations')
      .update({ theme_id: input.themeId, updated_at: now })
      .eq('id', id);

    if (error) {
      throw new Error(`[Supabase] updateThemeSelection failed: ${error.message}`);
    }

    const updated = await this.getById(id);
    if (!updated) {
      throw new Error(`[Supabase] updateThemeSelection: could not re-fetch invitation "${id}" after update`);
    }
    return updated;
  }

  async activateAfterPayment(input: ActivateAfterPaymentInput): Promise<InvitationContent> {
    const now = new Date().toISOString();

    // Fetch current status to compute the new one without regressing.
    const { data: current, error: readError } = await this.supabase
      .from('invitations')
      .select('status')
      .eq('id', input.invitationId)
      .single();

    if (readError || !current) {
      throw new Error(
        `[Supabase] activateAfterPayment: invitation "${input.invitationId}" not found — ${readError?.message ?? 'no data'}`,
      );
    }

    const currentStatus: string = current.status;
    // Do not regress paid or published invitations.
    const newStatus = (currentStatus === 'paid' || currentStatus === 'published')
      ? currentStatus
      : 'paid';

    const { error: updateError } = await this.supabase
      .from('invitations')
      .update({
        plan_id:    input.planId,
        status:     newStatus,
        updated_at: now,
      })
      .eq('id', input.invitationId);

    if (updateError) {
      throw new Error(`[Supabase] activateAfterPayment update failed: ${updateError.message}`);
    }

    const updated = await this.getById(input.invitationId);
    if (!updated) {
      throw new Error(`[Supabase] activateAfterPayment: could not re-fetch invitation "${input.invitationId}" after update`);
    }
    return updated;
  }

  async createFromPaidOrder(input: CreateFromPaidOrderInput): Promise<CreateFromPaidOrderResult> {
    const now = new Date().toISOString();

    // Generate a slug that is virtually guaranteed to be unique.
    const randomPart = Math.random().toString(36).slice(2, 8);
    const slug = `invitacion-${Date.now().toString(36)}-${randomPart}`;

    // ── 1. Insert into invitations ───────────────────────────────────────────
    // user_id is null — requires invitations_7y6_auto_create_patch.sql to have been applied.
    const { data: invRow, error: invError } = await this.supabase
      .from('invitations')
      .insert({
        user_id:        input.ownerUserId ?? null,
        slug,
        category:       'wedding',
        variant:        'couple',
        template_id:    'kompralo-master-wedding-v1',
        plan_id:        input.planId,
        status:         'paid',
        theme_id:       'champagne',
        title:          'Mi invitación digital',
        subtitle:       '',
        customer_email: input.customerEmail,
        created_at:     now,
        updated_at:     now,
      })
      .select('id')
      .single();

    if (invError || !invRow) {
      throw new Error(`[Supabase] createFromPaidOrder: invitations insert failed — ${invError?.message ?? 'no data'}`);
    }

    const invitationId: string = invRow.id;

    // ── 2. Insert into invitation_content ────────────────────────────────────
    const { error: contentError } = await this.supabase
      .from('invitation_content')
      .insert({
        invitation_id:        invitationId,
        protagonists:         [],
        event_time:           '',
        location:             { venueName: '', address: '', googleMapsLink: '', wazeLink: '' },
        hero:                 { emotionalPhrase: '', imageUrl: '', eventLabel: '' },
        story:                { slides: [] },
        gallery:              { images: [] },
        timeline:             [],
        itinerary:            [],
        dress_code:           { type: '', description: '', suggestions: '' },
        gift_registry:        { items: [] },
        music:                { audioUrl: '' },
        final_message:        { quote: '¡Los esperamos!' },
        parents:              [],
        padrinos:             [],
        hotels:               [],
        social:               { hashtag: '' },
        rsvp_whatsapp_number: '',
        updated_at:           now,
      });

    if (contentError) {
      throw new Error(`[Supabase] createFromPaidOrder: invitation_content insert failed — ${contentError.message}`);
    }

    console.log('[Supabase] createFromPaidOrder — created invitation %s for %s', invitationId, input.customerEmail);
    return { invitationId };
  }
}
