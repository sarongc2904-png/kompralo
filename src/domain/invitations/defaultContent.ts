import { sofiaAlejandroWeddingInvitation } from '@/domain/invitations/fixtures';
import type { InvitationContent } from '@/domain/invitations/types';

/**
 * Build default invitation content based on the final approved template fixture
 * (src/domain/invitations/fixtures/wedding.sofia-alejandro.ts).
 *
 * This is used for all new invitations created via checkout or admin panel.
 * The result is a complete, editable invitation with demo data,
 * not the sparse empty content that was generated before.
 *
 * Note: Does NOT copy id, slug, planId, status — those are set by the caller.
 */
export function buildDefaultInvitationContent(): Omit<
  InvitationContent,
  'id' | 'slug' | 'planId' | 'status'
> {
  const fixture = sofiaAlejandroWeddingInvitation;

  return {
    category: fixture.category,
    variant: fixture.variant,
    templateId: fixture.templateId,
    themeId: fixture.themeId, // ivory-editorial
    featureOverrides: fixture.featureOverrides,

    title: fixture.title,
    subtitle: fixture.subtitle,

    protagonists: fixture.protagonists,
    eventDate: fixture.eventDate,
    eventTime: fixture.eventTime,

    location: fixture.location,
    hero: fixture.hero,
    music: fixture.music,
    story: fixture.story,
    gallery: fixture.gallery,
    timeline: fixture.timeline,
    itinerary: fixture.itinerary,
    dressCode: fixture.dressCode,
    giftRegistry: fixture.giftRegistry,
    finalMessage: fixture.finalMessage,
    parents: fixture.parents,
    padrinos: fixture.padrinos,
    hotels: fixture.hotels,
    social: { ...fixture.social, hashtag: '', instagramHandle: undefined, tiktokHandle: undefined },

    rsvpWhatsAppNumber: fixture.rsvpWhatsAppNumber,
    rsvpMode: 'open',

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: null, // new invitations start unpublished
  };
}

/**
 * Build invitation_content for Supabase table insertion.
 * Uses snake_case field names and structure required by the table schema.
 */
export function buildDefaultInvitationContentForSupabase(invitationId: string) {
  const fixture = sofiaAlejandroWeddingInvitation;
  const now = new Date().toISOString();

  return {
    invitation_id: invitationId,
    protagonists: fixture.protagonists,
    event_time: fixture.eventTime,
    location: fixture.location,
    hero: fixture.hero,
    story: fixture.story,
    gallery: fixture.gallery,
    timeline: fixture.timeline,
    itinerary: fixture.itinerary,
    dress_code: fixture.dressCode,
    gift_registry: fixture.giftRegistry,
    music: fixture.music,
    final_message: fixture.finalMessage,
    parents: fixture.parents,
    padrinos: fixture.padrinos,
    hotels: fixture.hotels,
    social: { ...fixture.social, hashtag: '', instagramHandle: undefined, tiktokHandle: undefined },
    rsvp_whatsapp_number: fixture.rsvpWhatsAppNumber,
    updated_at: now,
  };
}
