import type { FeatureOverrides, PlanId } from '@/domain/plans/types';
import type { InvitationStatus } from '@/domain/invitations/status';

export type EventCategory = 'wedding' | 'baptism' | 'baby-shower' | 'birthday';

export type EventVariant = 'couple' | 'girl' | 'boy' | 'woman' | 'man' | 'neutral';

export interface InvitationProtagonist {
  id: string;
  name: string;
  role?: string;
  familyLabel?: string;
  imageUrl?: string;
  quote?: string;
}

export interface InvitationProtagonistInput {
  id: string;
  name: string;
  role: string;
  familyLabel: string;
  imageUrl: string;
  quote: string;
}

export interface InvitationProtagonistsInput {
  protagonists: InvitationProtagonistInput[];
}

export interface StorySlide {
  id: string;
  imageUrl: string;
  title: string;
  text: string;
  subtitle?: string;
  date?: string;
}

export interface InvitationStorySlideInput {
  id: string;
  title: string;
  subtitle: string;
  text: string;
  imageUrl: string;
  date: string;
}

export interface InvitationStoryBookInput {
  slides: InvitationStorySlideInput[];
}

export interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  description: string;
  imageUrl?: string;
}

export interface InvitationTimelineEventInput {
  id: string;
  year: string;
  title: string;
  description: string;
  imageUrl: string;
}

export interface InvitationTimelineInput {
  events: InvitationTimelineEventInput[];
}

export type ItineraryIcon = 'church' | 'rings' | 'glass' | 'music' | 'utensils';

export interface ItineraryItem {
  id: string;
  time: string;
  title: string;
  location: string;
  icon: ItineraryIcon;
  description?: string;
}

export interface InvitationItineraryItemInput {
  id: string;
  time: string;
  title: string;
  location: string;
  icon: ItineraryIcon;
  description: string;
}

export interface InvitationItineraryInput {
  items: InvitationItineraryItemInput[];
}

export interface ParentCouple {
  side: 'bride' | 'groom';
  protagonistId: string;
  fatherName: string;
  motherName: string;
}

export type PadrinoIcon =
  | 'flowers' | 'cake' | 'music' | 'rings' | 'photo'
  | 'video'   | 'lights' | 'bar' | 'car' | 'church' | 'dress' | 'gift';

export interface Padrino {
  id: string;
  rubro: string;
  names: string[];
  icon: PadrinoIcon;
}

export interface InvitationSponsorInput {
  id: string;
  rubro: string;
  icon: PadrinoIcon;
  names: string[];
}

export interface InvitationSponsorsInput {
  padrinos: InvitationSponsorInput[];
}

export interface Hotel {
  id: string;
  name: string;
  stars: number;
  distance: string;
  priceRange: string;
  phone?: string;
  bookingLink?: string;
  address: string;
  imageUrl?: string;
  description?: string;
}

export interface InvitationHotelInput {
  id: string;
  name: string;
  stars: number;
  address: string;
  distance: string;
  priceRange: string;
  phone: string;
  bookingLink: string;
  imageUrl: string;
  description: string;
}

export interface InvitationAccommodationInput {
  hotels: InvitationHotelInput[];
}

export interface SocialConfig {
  hashtag: string;
  instagramHandle?: string;
  tiktokHandle?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  note?: string;
}

export interface InvitationSocialInput {
  hashtag: string;
  instagramHandle: string;
  tiktokHandle: string;
  facebookUrl: string;
  youtubeUrl: string;
  note: string;
}

export type GiftLogoType =
  | 'amazon'
  | 'liverpool'
  | 'palacio'
  | 'mercadolibre'
  | 'paypal'
  | 'bank'
  | 'custom';

export interface GiftRegistryItem {
  id: string;
  provider: string;
  logoType: GiftLogoType;
  link?: string;
  description?: string;
  bankDetails?: {
    bankName: string;
    clabe: string;
    accountOwner: string;
  };
}

export interface InvitationGiftProviderInput {
  id: string;
  provider: string;
  logoType: GiftLogoType;
  link: string;
  description: string;
  bankName: string;
  clabe: string;
  accountOwner: string;
}

export interface InvitationGiftRegistryInput {
  items: InvitationGiftProviderInput[];
}

export interface InvitationLocation {
  venueName: string;
  address: string;
  googleMapsLink: string;
  wazeLink: string;
}

export interface InvitationHero {
  emotionalPhrase: string;
  imageUrl: string;
  videoUrl?: string;
  youtubeUrl?: string;
  eventLabel: string;
}

export interface InvitationStory {
  slides: StorySlide[];
}

export interface InvitationGallery {
  images: string[];
  captions?: string[];
}

export interface GalleryImageItem {
  url: string;
  caption: string;
}

export interface InvitationGalleryInput {
  items: GalleryImageItem[];
}

export interface InvitationDressCode {
  type: string;
  description: string;
  suggestions: string;
  // Editor-managed fields (additive — renderer reads only type/description/suggestions):
  title?: string;
  observations?: string;
  primaryColor?: string;
  secondaryColor?: string;
  suggestionsList?: string[];
}

export interface InvitationDressCodeInput {
  type: string;
  title: string;
  description: string;
  observations: string;
  primaryColor: string;
  secondaryColor: string;
  suggestionsList: string[];
}

export interface InvitationGiftRegistry {
  items: GiftRegistryItem[];
}

export interface InvitationMusic {
  audioUrl: string;
  title?: string;
  selectedTrackId?: string;
}

export interface InvitationFinalMessage {
  quote: string;
  imageUrl?: string;
  title?: string;
  message?: string;
  signature?: string;
}

export interface InvitationFinalMessageInput {
  title: string;
  message: string;
  quote: string;
  imageUrl: string;
  signature: string;
}

// ─── Editor input — 9 campos del formulario básico ───────────────────────────

export interface InvitationBasicInfoInput {
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

export interface InvitationMediaInput {
  heroImageUrl: string;
  heroVideoUrl: string;
  musicUrl: string;
  musicTitle: string;
  musicTrackId?: string;
  clearMusicUrl?: boolean;
  youtubeUrl: string;
  googleMapsUrl: string;
  wazeUrl: string;
}

export interface InvitationContent {
  id: string;
  slug: string;
  category: EventCategory;
  variant: EventVariant;
  templateId: string;
  planId: PlanId;
  status: InvitationStatus;
  /** Accepts both v1 ids (champagne/floral/modern/azure) and v2 ids (luxury-gold/editorial/modern-dark). */
  themeId: string;
  featureOverrides?: FeatureOverrides;
  title: string;
  subtitle: string;
  protagonists: InvitationProtagonist[];
  eventDate: string;
  eventTime: string;
  location: InvitationLocation;
  hero: InvitationHero;
  story: InvitationStory;
  gallery: InvitationGallery;
  timeline: TimelineEvent[];
  itinerary: ItineraryItem[];
  dressCode: InvitationDressCode;
  giftRegistry: InvitationGiftRegistry;
  music: InvitationMusic;
  finalMessage: InvitationFinalMessage;
  parents: ParentCouple[];
  padrinos: Padrino[];
  hotels: Hotel[];
  social: SocialConfig;
  rsvpWhatsAppNumber: string;
  customerEmail?: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface InvitationThemeSelectionInput {
  themeId: string;
}
