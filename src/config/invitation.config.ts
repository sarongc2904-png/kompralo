import { sofiaAlejandroWeddingInvitation } from '@/domain/invitations/fixtures';
import type { InvitationContent as InvitationContentType } from '@/domain/invitations/types';

export type { Theme } from '@/domain/themes/types';

export type {
  GiftRegistryItem,
  Hotel,
  InvitationContent,
  InvitationDressCode,
  InvitationFinalMessage,
  InvitationGallery,
  InvitationHero,
  InvitationLocation,
  InvitationMusic,
  InvitationProtagonist,
  InvitationStory,
  ItineraryItem,
  Padrino,
  ParentCouple,
  SocialConfig,
  StorySlide,
  TimelineEvent,
} from '@/domain/invitations/types';

export type { InvitationStatus } from '@/domain/invitations/status';

export const invitationConfig = {
  ...sofiaAlejandroWeddingInvitation,
  planId: 'deluxe',
  themeId: 'ivory-editorial',
} satisfies InvitationContentType;
