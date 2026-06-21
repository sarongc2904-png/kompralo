import { normalizePlanId } from '@/domain/plans/types';
import { defaultThemeId, getThemeById } from '@/domain/themes/registry';
import type { InvitationContent } from '@/domain/invitations/types';

export function applyInvitationFallbacks(input: InvitationContent): InvitationContent {
  const planId = normalizePlanId(input.planId);
  const themeId = getThemeById(input.themeId).id ?? defaultThemeId;

  return {
    ...input,
    planId,
    themeId,
    featureOverrides: input.featureOverrides ?? {},
    gallery: input.gallery ?? { images: [] },
    story: input.story ?? { slides: [] },
    timeline: input.timeline ?? [],
    itinerary: input.itinerary ?? [],
    giftRegistry: input.giftRegistry ?? { items: [] },
    parents: input.parents ?? [],
    padrinos: input.padrinos ?? [],
    hotels: input.hotels ?? [],
  };
}

export function normalizeInvitation(input: InvitationContent): InvitationContent {
  return applyInvitationFallbacks(input);
}
