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

// Deduplicates getBySlug() between generateMetadata and Page within the same request.
const getPublicInvitation = cache(async (slug: string) => {
  const invitation = await invitationRepository.getBySlug(slug);
  if (!invitation || !isPublicInvitationStatus(invitation.status)) return null;
  return invitation;
});

interface PublicInvitationPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PublicInvitationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const invitation = await getPublicInvitation(slug);
  if (!invitation) return { title: 'Invitación no encontrada' };
  return buildInvitationMetadata(invitation);
}

export default async function PublicInvitationPage({ params }: PublicInvitationPageProps) {
  const { slug } = await params;
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
    />
  );
}
