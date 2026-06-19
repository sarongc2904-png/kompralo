import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import InvitationRouteRenderer from '@/components/invitation/InvitationRouteRenderer';
import {
  invitationRepository,
  resolveInvitationContext,
  isPreviewableInvitationStatus,
  buildNoIndexMetadata,
} from '@/domain/invitations';

interface PreviewInvitationPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return buildNoIndexMetadata();
}

export default async function PreviewInvitationPage({ params }: PreviewInvitationPageProps) {
  const { id } = await params;
  const invitation = await invitationRepository.getPreviewById(id);

  if (!invitation || !isPreviewableInvitationStatus(invitation.status)) {
    notFound();
  }

  const { theme, plan, features } = resolveInvitationContext(invitation);

  return (
    <InvitationRouteRenderer
      invitation={invitation}
      theme={theme}
      plan={plan}
      features={features}
      mode="preview"
      showPreviewBadge
    />
  );
}
