import {
  sofiaAlejandroWeddingInvitation,
  babyShowerDemoInvitation,
  birthdayDemoInvitation,
  baptismDemoInvitation,
} from '@/domain/invitations/fixtures';
import { normalizeInvitation } from '@/domain/invitations/adapters';
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
import type { IInvitationRepository, ActivateAfterPaymentInput, CreateFromPaidOrderInput, CreateFromPaidOrderResult } from '@/domain/invitations/repository.types';
import type { FeatureOverrides, PlanId } from '@/domain/plans/types';
import type { InvitationStatus } from '@/domain/invitations/status';
import { SupabaseInvitationRepository } from '@/domain/invitations/supabase.repository';
import { tryGetSupabaseEnv } from '@/lib/supabase/env';
import { createClient } from '@supabase/supabase-js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Status lifecycle after payment: draft | pending_payment → paid; paid | published → unchanged.
function resolveActivationStatus(current: InvitationStatus): InvitationStatus {
  if (current === 'paid' || current === 'published') return current;
  return 'paid';
}

// ─── Local repository (fallback) ─────────────────────────────────────────────

const localInvitations: InvitationContent[] = [
  sofiaAlejandroWeddingInvitation,
  babyShowerDemoInvitation,
  birthdayDemoInvitation,
  baptismDemoInvitation,
].map(normalizeInvitation);

const previewAliases: Record<string, string> = {
  demo: sofiaAlejandroWeddingInvitation.id,
  'baby-shower-demo': babyShowerDemoInvitation.id,
  'birthday-demo': birthdayDemoInvitation.id,
  'baptism-demo': baptismDemoInvitation.id,
};

class LocalInvitationRepository implements IInvitationRepository {
  async list(): Promise<InvitationContent[]> {
    return localInvitations;
  }

  async getBySlug(slug: string): Promise<InvitationContent | null> {
    return localInvitations.find((inv) => inv.slug === slug) ?? null;
  }

  async getById(id: string): Promise<InvitationContent | null> {
    return localInvitations.find((inv) => inv.id === id) ?? null;
  }

  async getPreviewById(id: string): Promise<InvitationContent | null> {
    const resolvedId = previewAliases[id] ?? id;
    return localInvitations.find((inv) => inv.id === resolvedId) ?? null;
  }

  async updateBasicInfo(id: string, input: InvitationBasicInfoInput): Promise<InvitationContent> {
    // In-memory mutation — changes are visible for the lifetime of this server process
    // but do NOT persist across restarts. This is intentional dev-only behaviour.
    const idx = localInvitations.findIndex((inv) => inv.id === id);
    if (idx === -1) throw new Error(`[Local] updateBasicInfo: invitation "${id}" not found`);

    const existing = localInvitations[idx];
    const updated: InvitationContent = {
      ...existing,
      title:    input.title,
      subtitle: input.subtitle,
      slug:     input.slug,
      eventDate: input.eventDate,
      eventTime: input.eventTime,
      location: {
        ...existing.location,
        venueName: input.venueName,
        address:   input.address,
      },
      rsvpWhatsAppNumber: input.rsvpWhatsAppNumber,
      finalMessage: {
        ...existing.finalMessage,
        quote: input.finalMessageQuote,
      },
      updatedAt: new Date().toISOString(),
    };

    localInvitations[idx] = updated;
    console.log('[Local] updateBasicInfo(%s) — updated in memory (not persisted)', id);
    return updated;
  }

  async updateMediaInfo(id: string, input: InvitationMediaInput): Promise<InvitationContent> {
    const idx = localInvitations.findIndex((inv) => inv.id === id);
    if (idx === -1) throw new Error(`[Local] updateMediaInfo: invitation "${id}" not found`);

    const existing = localInvitations[idx];
    const updated: InvitationContent = {
      ...existing,
      hero: {
        ...existing.hero,
        imageUrl:   input.heroImageUrl  || existing.hero?.imageUrl  || '',
        videoUrl:   input.heroVideoUrl  || undefined,
        youtubeUrl: input.youtubeUrl    || undefined,
      },
      music: {
        audioUrl:        input.clearMusicUrl ? '' : (input.musicUrl || existing.music?.audioUrl || ''),
        title:           input.clearMusicUrl ? undefined : (input.musicTitle || undefined),
        selectedTrackId: input.clearMusicUrl ? 'none' : (input.musicTrackId ?? existing.music?.selectedTrackId),
        enabled:         input.clearMusicUrl ? false : (input.musicUrl ? true : existing.music?.enabled),
      },
      location: {
        ...existing.location,
        googleMapsLink: input.googleMapsUrl || existing.location?.googleMapsLink || '',
        wazeLink:       input.wazeUrl       || existing.location?.wazeLink       || '',
      },
      updatedAt: new Date().toISOString(),
    };

    localInvitations[idx] = updated;
    console.log('[Local] updateMediaInfo(%s) — updated in memory (not persisted)', id);
    return updated;
  }

  async updateGallery(id: string, input: InvitationGalleryInput): Promise<InvitationContent> {
    const idx = localInvitations.findIndex((inv) => inv.id === id);
    if (idx === -1) throw new Error(`[Local] updateGallery: invitation "${id}" not found`);

    const existing = localInvitations[idx];
    const updated: InvitationContent = {
      ...existing,
      gallery: {
        images:   input.items.map((item) => item.url),
        captions: input.items.map((item) => item.caption),
      },
      updatedAt: new Date().toISOString(),
    };

    localInvitations[idx] = updated;
    console.log('[Local] updateGallery(%s) — %d images, updated in memory (not persisted)', id, input.items.length);
    return updated;
  }

  async updateProtagonists(id: string, input: InvitationProtagonistsInput): Promise<InvitationContent> {
    const idx = localInvitations.findIndex((inv) => inv.id === id);
    if (idx === -1) throw new Error(`[Local] updateProtagonists: invitation "${id}" not found`);

    const existing = localInvitations[idx];
    const updated: InvitationContent = {
      ...existing,
      protagonists: input.protagonists.map((p) => ({
        id:          p.id,
        name:        p.name,
        role:        p.role        || undefined,
        familyLabel: p.familyLabel || undefined,
        imageUrl:    p.imageUrl    || undefined,
        quote:       p.quote       || undefined,
      })),
      updatedAt: new Date().toISOString(),
    };

    localInvitations[idx] = updated;
    console.log('[Local] updateProtagonists(%s) — %d protagonists, updated in memory (not persisted)', id, input.protagonists.length);
    return updated;
  }

  async updateItinerary(id: string, input: InvitationItineraryInput): Promise<InvitationContent> {
    const idx = localInvitations.findIndex((inv) => inv.id === id);
    if (idx === -1) throw new Error(`[Local] updateItinerary: invitation "${id}" not found`);

    const existing = localInvitations[idx];
    const updated: InvitationContent = {
      ...existing,
      itinerary: input.items.map((item) => ({
        id:          item.id,
        time:        item.time,
        title:       item.title,
        location:    item.location,
        icon:        item.icon,
        ...(item.description ? { description: item.description } : {}),
      })),
      updatedAt: new Date().toISOString(),
    };

    localInvitations[idx] = updated;
    console.log('[Local] updateItinerary(%s) — %d items, updated in memory (not persisted)', id, input.items.length);
    return updated;
  }

  async updateGiftRegistry(id: string, input: InvitationGiftRegistryInput): Promise<InvitationContent> {
    const idx = localInvitations.findIndex((inv) => inv.id === id);
    if (idx === -1) throw new Error(`[Local] updateGiftRegistry: invitation "${id}" not found`);

    const existing = localInvitations[idx];
    const updated: InvitationContent = {
      ...existing,
      giftRegistry: {
        items: input.items.map((item) => ({
          id:          item.id,
          provider:    item.provider,
          logoType:    item.logoType,
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
      },
      updatedAt: new Date().toISOString(),
    };

    localInvitations[idx] = updated;
    console.log('[Local] updateGiftRegistry(%s) — %d items, updated in memory (not persisted)', id, input.items.length);
    return updated;
  }

  async updateDressCode(id: string, input: InvitationDressCodeInput): Promise<InvitationContent> {
    const idx = localInvitations.findIndex((inv) => inv.id === id);
    if (idx === -1) throw new Error(`[Local] updateDressCode: invitation "${id}" not found`);

    const existing = localInvitations[idx];
    // Join list into string so the renderer gets a plain string (backwards-compat).
    const suggestions = input.suggestionsList.filter(Boolean).join('. ');
    const updated: InvitationContent = {
      ...existing,
      dressCode: {
        type:           input.type,
        description:    input.description,
        suggestions,
        title:          input.title          || undefined,
        observations:   input.observations   || undefined,
        primaryColor:   input.primaryColor   || undefined,
        secondaryColor: input.secondaryColor || undefined,
        suggestionsList: input.suggestionsList.filter(Boolean),
      },
      updatedAt: new Date().toISOString(),
    };

    localInvitations[idx] = updated;
    console.log('[Local] updateDressCode(%s) — updated in memory (not persisted)', id);
    return updated;
  }

  async updatePadrinos(id: string, input: InvitationSponsorsInput): Promise<InvitationContent> {
    const idx = localInvitations.findIndex((inv) => inv.id === id);
    if (idx === -1) throw new Error(`[Local] updatePadrinos: invitation "${id}" not found`);

    const existing = localInvitations[idx];
    const updated: InvitationContent = {
      ...existing,
      padrinos: input.padrinos.map((p) => ({
        id:    p.id,
        rubro: p.rubro,
        icon:  p.icon,
        names: p.names.filter(Boolean),
      })),
      updatedAt: new Date().toISOString(),
    };

    localInvitations[idx] = updated;
    console.log('[Local] updatePadrinos(%s) — %d groups, updated in memory (not persisted)', id, input.padrinos.length);
    return updated;
  }

  async updateStoryBook(id: string, input: InvitationStoryBookInput): Promise<InvitationContent> {
    const idx = localInvitations.findIndex((inv) => inv.id === id);
    if (idx === -1) throw new Error(`[Local] updateStoryBook: invitation "${id}" not found`);

    const existing = localInvitations[idx];
    const updated: InvitationContent = {
      ...existing,
      story: {
        slides: input.slides.map((s) => ({
          id:       s.id,
          title:    s.title,
          text:     s.text,
          imageUrl: s.imageUrl,
          ...(s.subtitle ? { subtitle: s.subtitle } : {}),
          ...(s.date     ? { date: s.date }         : {}),
        })),
      },
      updatedAt: new Date().toISOString(),
    };

    localInvitations[idx] = updated;
    console.log('[Local] updateStoryBook(%s) — %d slides, updated in memory (not persisted)', id, input.slides.length);
    return updated;
  }

  async updateAccommodation(id: string, input: InvitationAccommodationInput): Promise<InvitationContent> {
    const idx = localInvitations.findIndex((inv) => inv.id === id);
    if (idx === -1) throw new Error(`[Local] updateAccommodation: invitation "${id}" not found`);

    const existing = localInvitations[idx];
    const updated: InvitationContent = {
      ...existing,
      hotels: input.hotels.map((h) => ({
        id:          h.id,
        name:        h.name,
        stars:       h.stars,
        address:     h.address,
        distance:    h.distance,
        priceRange:  h.priceRange,
        ...(h.phone       ? { phone:       h.phone       } : {}),
        ...(h.bookingLink ? { bookingLink: h.bookingLink } : {}),
        ...(h.imageUrl    ? { imageUrl:    h.imageUrl    } : {}),
        ...(h.description ? { description: h.description } : {}),
      })),
      updatedAt: new Date().toISOString(),
    };

    localInvitations[idx] = updated;
    console.log('[Local] updateAccommodation(%s) — %d hotels, updated in memory (not persisted)', id, input.hotels.length);
    return updated;
  }

  async updateSocial(id: string, input: InvitationSocialInput): Promise<InvitationContent> {
    const idx = localInvitations.findIndex((inv) => inv.id === id);
    if (idx === -1) throw new Error(`[Local] updateSocial: invitation "${id}" not found`);

    const existing = localInvitations[idx];
    const updated: InvitationContent = {
      ...existing,
      social: {
        hashtag:         input.hashtag,
        ...(input.instagramHandle ? { instagramHandle: input.instagramHandle } : {}),
        ...(input.tiktokHandle    ? { tiktokHandle:    input.tiktokHandle    } : {}),
        ...(input.facebookUrl     ? { facebookUrl:     input.facebookUrl     } : {}),
        ...(input.youtubeUrl      ? { youtubeUrl:      input.youtubeUrl      } : {}),
        ...(input.note            ? { note:            input.note            } : {}),
      },
      updatedAt: new Date().toISOString(),
    };

    localInvitations[idx] = updated;
    console.log('[Local] updateSocial(%s) — hashtag=%s, updated in memory (not persisted)', id, input.hashtag);
    return updated;
  }

  async updateFinalMessage(id: string, input: InvitationFinalMessageInput): Promise<InvitationContent> {
    const idx = localInvitations.findIndex((inv) => inv.id === id);
    if (idx === -1) throw new Error(`[Local] updateFinalMessage: invitation "${id}" not found`);

    const existing = localInvitations[idx];
    const updated: InvitationContent = {
      ...existing,
      finalMessage: {
        quote:    input.quote,
        ...(input.imageUrl  ? { imageUrl:  input.imageUrl  } : {}),
        ...(input.title     ? { title:     input.title     } : {}),
        ...(input.message   ? { message:   input.message   } : {}),
        ...(input.signature ? { signature: input.signature } : {}),
      },
      updatedAt: new Date().toISOString(),
    };

    localInvitations[idx] = updated;
    console.log('[Local] updateFinalMessage(%s) — updated in memory (not persisted)', id);
    return updated;
  }

  async updateTimeline(id: string, input: InvitationTimelineInput): Promise<InvitationContent> {
    const idx = localInvitations.findIndex((inv) => inv.id === id);
    if (idx === -1) throw new Error(`[Local] updateTimeline: invitation "${id}" not found`);

    const existing = localInvitations[idx];
    const updated: InvitationContent = {
      ...existing,
      timeline: input.events.map((e) => ({
        id:          e.id,
        year:        e.year,
        title:       e.title,
        description: e.description,
        ...(e.imageUrl ? { imageUrl: e.imageUrl } : {}),
      })),
      updatedAt: new Date().toISOString(),
    };

    localInvitations[idx] = updated;
    console.log('[Local] updateTimeline(%s) — %d events, updated in memory (not persisted)', id, input.events.length);
    return updated;
  }

  async updateFeatureOverrides(id: string, overrides: FeatureOverrides): Promise<InvitationContent> {
    const idx = localInvitations.findIndex((inv) => inv.id === id);
    if (idx === -1) throw new Error(`[Local] updateFeatureOverrides: invitation "${id}" not found`);

    const existing = localInvitations[idx];
    const updated: InvitationContent = {
      ...existing,
      featureOverrides: overrides,
      updatedAt: new Date().toISOString(),
    };

    localInvitations[idx] = updated;
    console.log('[Local] updateFeatureOverrides(%s) — %d overrides, updated in memory (not persisted)', id, Object.keys(overrides).length);
    return updated;
  }

  async updateThemeSelection(id: string, input: InvitationThemeSelectionInput): Promise<InvitationContent> {
    const idx = localInvitations.findIndex((inv) => inv.id === id);
    if (idx === -1) throw new Error(`[Local] updateThemeSelection: invitation "${id}" not found`);

    const existing = localInvitations[idx];
    const updated: InvitationContent = {
      ...existing,
      themeId: input.themeId,
      updatedAt: new Date().toISOString(),
    };

    localInvitations[idx] = updated;
    console.log('[Local] updateThemeSelection(%s) — themeId=%s, updated in memory (not persisted)', id, input.themeId);
    return updated;
  }

  async activateAfterPayment(input: ActivateAfterPaymentInput): Promise<InvitationContent> {
    const idx = localInvitations.findIndex((inv) => inv.id === input.invitationId);
    if (idx === -1) throw new Error(`[Local] activateAfterPayment: invitation "${input.invitationId}" not found`);

    const existing = localInvitations[idx];
    const newStatus = resolveActivationStatus(existing.status);

    const updated: InvitationContent = {
      ...existing,
      planId:    input.planId,
      status:    newStatus,
      updatedAt: new Date().toISOString(),
    };

    localInvitations[idx] = updated;
    console.log('[Local] activateAfterPayment(%s) — planId=%s status=%s→%s (not persisted)', input.invitationId, input.planId, existing.status, newStatus);
    return updated;
  }

  async createFromPaidOrder(input: CreateFromPaidOrderInput): Promise<CreateFromPaidOrderResult> {
    const now = new Date().toISOString();
    const randomPart = Math.random().toString(36).slice(2, 8);
    const id = `auto-${Date.now().toString(36)}-${randomPart}`;
    const slug = `invitacion-${id}`;

    const invitation: InvitationContent = {
      id,
      slug,
      category:    'wedding',
      variant:     'couple',
      templateId:  'kompralo-master-wedding-v1',
      planId:      input.planId as PlanId,
      status:      'paid',
      themeId:     'champagne',
      featureOverrides: {},
      title:       'Mi invitación digital',
      subtitle:    '',
      protagonists: [],
      eventDate:   '',
      eventTime:   '',
      location:    { venueName: '', address: '', googleMapsLink: '', wazeLink: '' },
      hero:        { emotionalPhrase: '', imageUrl: '', eventLabel: '' },
      story:       { slides: [] },
      gallery:     { images: [] },
      timeline:    [],
      itinerary:   [],
      dressCode:   { type: '', description: '', suggestions: '' },
      giftRegistry: { items: [] },
      music:       { audioUrl: '' },
      finalMessage: { quote: '¡Los esperamos!' },
      parents:     [],
      padrinos:    [],
      hotels:      [],
      social:      { hashtag: '' },
      rsvpWhatsAppNumber: '',
      createdAt:   now,
      updatedAt:   now,
      publishedAt: null,
    };

    localInvitations.push(invitation);
    console.log('[Local] createFromPaidOrder — created invitation %s for %s (not persisted)', id, input.customerEmail);
    return { invitationId: id };
  }
}

// ─── Fallback-aware repository ────────────────────────────────────────────────
// Tries Supabase for each call; falls back to local on any error.
// Logs [Supabase] on success and [Fallback Local] on error so ops can observe
// which path is active in development and staging.

class FallbackInvitationRepository implements IInvitationRepository {
  constructor(
    private readonly primary: IInvitationRepository,
    private readonly fallback: IInvitationRepository,
  ) {}

  async list(): Promise<InvitationContent[]> {
    try {
      const result = await this.primary.list();
      console.log('[Supabase] invitations.list() OK — %d rows', result.length);
      return result;
    } catch (err) {
      console.warn('[Fallback Local] invitations.list() — Supabase error:', err);
      return this.fallback.list();
    }
  }

  async getBySlug(slug: string): Promise<InvitationContent | null> {
    try {
      const result = await this.primary.getBySlug(slug);
      console.log('[Supabase] invitations.getBySlug(%s) — %s', slug, result ? 'found' : 'null');
      return result;
    } catch (err) {
      console.warn('[Fallback Local] invitations.getBySlug(%s) — Supabase error:', slug, err);
      return this.fallback.getBySlug(slug);
    }
  }

  async getById(id: string): Promise<InvitationContent | null> {
    try {
      const result = await this.primary.getById(id);
      console.log('[Supabase] invitations.getById(%s) — %s', id, result ? 'found' : 'null');
      return result;
    } catch (err) {
      console.warn('[Fallback Local] invitations.getById(%s) — Supabase error:', id, err);
      return this.fallback.getById(id);
    }
  }

  async getPreviewById(id: string): Promise<InvitationContent | null> {
    try {
      const result = await this.primary.getPreviewById(id);
      console.log('[Supabase] invitations.getPreviewById(%s) — %s', id, result ? 'found' : 'null');
      return result;
    } catch (err) {
      console.warn('[Fallback Local] invitations.getPreviewById(%s) — Supabase error:', id, err);
      return this.fallback.getPreviewById(id);
    }
  }

  async updateBasicInfo(id: string, input: InvitationBasicInfoInput): Promise<InvitationContent> {
    try {
      const result = await this.primary.updateBasicInfo(id, input);
      console.log('[Supabase] invitations.updateBasicInfo(%s) OK', id);
      return result;
    } catch (err) {
      console.warn('[Fallback Local] invitations.updateBasicInfo(%s) — Supabase error:', id, err);
      return this.fallback.updateBasicInfo(id, input);
    }
  }

  async updateMediaInfo(id: string, input: InvitationMediaInput): Promise<InvitationContent> {
    try {
      const result = await this.primary.updateMediaInfo(id, input);
      console.log('[Supabase] invitations.updateMediaInfo(%s) OK', id);
      return result;
    } catch (err) {
      console.warn('[Fallback Local] invitations.updateMediaInfo(%s) — Supabase error:', id, err);
      return this.fallback.updateMediaInfo(id, input);
    }
  }

  async updateGallery(id: string, input: InvitationGalleryInput): Promise<InvitationContent> {
    try {
      const result = await this.primary.updateGallery(id, input);
      console.log('[Supabase] invitations.updateGallery(%s) — %d images OK', id, input.items.length);
      return result;
    } catch (err) {
      console.warn('[Fallback Local] invitations.updateGallery(%s) — Supabase error:', id, err);
      return this.fallback.updateGallery(id, input);
    }
  }

  async updateProtagonists(id: string, input: InvitationProtagonistsInput): Promise<InvitationContent> {
    try {
      const result = await this.primary.updateProtagonists(id, input);
      console.log('[Supabase] invitations.updateProtagonists(%s) — %d OK', id, input.protagonists.length);
      return result;
    } catch (err) {
      console.warn('[Fallback Local] invitations.updateProtagonists(%s) — Supabase error:', id, err);
      return this.fallback.updateProtagonists(id, input);
    }
  }

  async updateItinerary(id: string, input: InvitationItineraryInput): Promise<InvitationContent> {
    try {
      const result = await this.primary.updateItinerary(id, input);
      console.log('[Supabase] invitations.updateItinerary(%s) — %d items OK', id, input.items.length);
      return result;
    } catch (err) {
      console.warn('[Fallback Local] invitations.updateItinerary(%s) — Supabase error:', id, err);
      return this.fallback.updateItinerary(id, input);
    }
  }

  async updateGiftRegistry(id: string, input: InvitationGiftRegistryInput): Promise<InvitationContent> {
    try {
      const result = await this.primary.updateGiftRegistry(id, input);
      console.log('[Supabase] invitations.updateGiftRegistry(%s) — %d items OK', id, input.items.length);
      return result;
    } catch (err) {
      console.warn('[Fallback Local] invitations.updateGiftRegistry(%s) — Supabase error:', id, err);
      return this.fallback.updateGiftRegistry(id, input);
    }
  }

  async updateDressCode(id: string, input: InvitationDressCodeInput): Promise<InvitationContent> {
    try {
      const result = await this.primary.updateDressCode(id, input);
      console.log('[Supabase] invitations.updateDressCode(%s) OK', id);
      return result;
    } catch (err) {
      console.warn('[Fallback Local] invitations.updateDressCode(%s) — Supabase error:', id, err);
      return this.fallback.updateDressCode(id, input);
    }
  }

  async updatePadrinos(id: string, input: InvitationSponsorsInput): Promise<InvitationContent> {
    try {
      const result = await this.primary.updatePadrinos(id, input);
      console.log('[Supabase] invitations.updatePadrinos(%s) — %d groups OK', id, input.padrinos.length);
      return result;
    } catch (err) {
      console.warn('[Fallback Local] invitations.updatePadrinos(%s) — Supabase error:', id, err);
      return this.fallback.updatePadrinos(id, input);
    }
  }

  async updateStoryBook(id: string, input: InvitationStoryBookInput): Promise<InvitationContent> {
    try {
      const result = await this.primary.updateStoryBook(id, input);
      console.log('[Supabase] invitations.updateStoryBook(%s) — %d slides OK', id, input.slides.length);
      return result;
    } catch (err) {
      console.warn('[Fallback Local] invitations.updateStoryBook(%s) — Supabase error:', id, err);
      return this.fallback.updateStoryBook(id, input);
    }
  }

  async updateAccommodation(id: string, input: InvitationAccommodationInput): Promise<InvitationContent> {
    try {
      const result = await this.primary.updateAccommodation(id, input);
      console.log('[Supabase] invitations.updateAccommodation(%s) — %d hotels OK', id, input.hotels.length);
      return result;
    } catch (err) {
      console.warn('[Fallback Local] invitations.updateAccommodation(%s) — Supabase error:', id, err);
      return this.fallback.updateAccommodation(id, input);
    }
  }

  async updateSocial(id: string, input: InvitationSocialInput): Promise<InvitationContent> {
    try {
      const result = await this.primary.updateSocial(id, input);
      console.log('[Supabase] invitations.updateSocial(%s) — hashtag=%s OK', id, input.hashtag);
      return result;
    } catch (err) {
      console.warn('[Fallback Local] invitations.updateSocial(%s) — Supabase error:', id, err);
      return this.fallback.updateSocial(id, input);
    }
  }

  async updateFinalMessage(id: string, input: InvitationFinalMessageInput): Promise<InvitationContent> {
    try {
      const result = await this.primary.updateFinalMessage(id, input);
      console.log('[Supabase] invitations.updateFinalMessage(%s) OK', id);
      return result;
    } catch (err) {
      console.warn('[Fallback Local] invitations.updateFinalMessage(%s) — Supabase error:', id, err);
      return this.fallback.updateFinalMessage(id, input);
    }
  }

  async updateTimeline(id: string, input: InvitationTimelineInput): Promise<InvitationContent> {
    try {
      const result = await this.primary.updateTimeline(id, input);
      console.log('[Supabase] invitations.updateTimeline(%s) — %d events OK', id, input.events.length);
      return result;
    } catch (err) {
      console.warn('[Fallback Local] invitations.updateTimeline(%s) — Supabase error:', id, err);
      return this.fallback.updateTimeline(id, input);
    }
  }

  async updateFeatureOverrides(id: string, overrides: FeatureOverrides): Promise<InvitationContent> {
    try {
      const result = await this.primary.updateFeatureOverrides(id, overrides);
      console.log('[Supabase] invitations.updateFeatureOverrides(%s) — %d overrides OK', id, Object.keys(overrides).length);
      return result;
    } catch (err) {
      console.warn('[Fallback Local] invitations.updateFeatureOverrides(%s) — Supabase error:', id, err);
      return this.fallback.updateFeatureOverrides(id, overrides);
    }
  }

  async updateThemeSelection(id: string, input: InvitationThemeSelectionInput): Promise<InvitationContent> {
    try {
      const result = await this.primary.updateThemeSelection(id, input);
      console.log('[Supabase] invitations.updateThemeSelection(%s) — themeId=%s OK', id, input.themeId);
      return result;
    } catch (err) {
      console.warn('[Fallback Local] invitations.updateThemeSelection(%s) — Supabase error:', id, err);
      return this.fallback.updateThemeSelection(id, input);
    }
  }

  async activateAfterPayment(input: ActivateAfterPaymentInput): Promise<InvitationContent> {
    try {
      const result = await this.primary.activateAfterPayment(input);
      console.log('[Supabase] invitations.activateAfterPayment(%s) — planId=%s OK', input.invitationId, input.planId);
      return result;
    } catch (err) {
      console.warn('[Fallback Local] invitations.activateAfterPayment(%s) — Supabase error:', input.invitationId, err);
      return this.fallback.activateAfterPayment(input);
    }
  }

  async createFromPaidOrder(input: CreateFromPaidOrderInput): Promise<CreateFromPaidOrderResult> {
    try {
      const result = await this.primary.createFromPaidOrder(input);
      console.log('[Supabase] invitations.createFromPaidOrder() — invitationId=%s OK', result.invitationId);
      return result;
    } catch (err) {
      console.warn('[Fallback Local] invitations.createFromPaidOrder() — Supabase error:', err);
      return this.fallback.createFromPaidOrder(input);
    }
  }
}

// ─── Singleton factory ────────────────────────────────────────────────────────

function buildInvitationRepository(): IInvitationRepository {
  const local = new LocalInvitationRepository();
  const env = tryGetSupabaseEnv();

  if (!env) {
    console.log('[Fallback Local] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not set — using local repository.');
    return local;
  }

  const supabaseClient = createClient(env.url, env.anonKey);
  const supabase = new SupabaseInvitationRepository(supabaseClient);
  console.log('[Supabase] invitationRepository initialized — primary: Supabase, fallback: Local');
  return new FallbackInvitationRepository(supabase, local);
}

export const invitationRepository: IInvitationRepository = buildInvitationRepository();

// Legacy named exports — kept for any existing callers.
export async function listInvitations(): Promise<InvitationContent[]> {
  return invitationRepository.list();
}

export async function getInvitationBySlug(slug: string): Promise<InvitationContent | null> {
  return invitationRepository.getBySlug(slug);
}

export async function getInvitationById(id: string): Promise<InvitationContent | null> {
  return invitationRepository.getPreviewById(id);
}
