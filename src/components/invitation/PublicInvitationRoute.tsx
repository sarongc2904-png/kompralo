import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import InvitationRouteRenderer from '@/components/invitation/InvitationRouteRenderer';
import {
  invitationRepository,
  resolveInvitationContext,
  isPublicInvitationStatus,
  buildInvitationMetadata,
} from '@/domain/invitations';

export const getPublicInvitation = cache(async (slug: string) => {
  const invitation = await invitationRepository.getBySlug(slug);
  if (!invitation || !isPublicInvitationStatus(invitation.status)) return null;
  return invitation;
});

export async function generatePublicInvitationMetadata(slug: string): Promise<Metadata> {
  const invitation = await getPublicInvitation(slug);
  if (!invitation) return { title: 'Invitacion no encontrada' };
  return buildInvitationMetadata(invitation);
}

interface PublicInvitationRouteProps {
  slug: string;
  /** When present, overrides the saved theme for preview purposes only. */
  themePreviewId?: string;
}

export async function PublicInvitationRoute({ slug, themePreviewId }: PublicInvitationRouteProps) {
  const invitation = await getPublicInvitation(slug);
  if (!invitation) notFound();

  const { theme, plan, features } = resolveInvitationContext(invitation);

  return (
    <InvitationRouteRenderer
      invitation={invitation}
      theme={theme}
      plan={plan}
      features={features}
      mode="public"
      themePreviewId={themePreviewId}
    />
  );
}
