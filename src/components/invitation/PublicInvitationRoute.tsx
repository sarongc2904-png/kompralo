import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import InvitationRouteRenderer from '@/components/invitation/InvitationRouteRenderer';
import { SupabaseInvitationRepository } from '@/domain/invitations/supabase.repository';
import {
  resolveInvitationContext,
  isPublicInvitationStatus,
  buildInvitationMetadata,
  invitationRepository,
} from '@/domain/invitations';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import { tryGetSupabaseEnv } from '@/lib/supabase/env';

export const getPublicInvitation = cache(async (slug: string) => {
  let invitation = null;
  const env = tryGetSupabaseEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (env && serviceRoleKey) {
    const repo = new SupabaseInvitationRepository(createServiceRoleSupabaseClient());
    invitation = await repo.getBySlug(slug);
  } else {
    invitation = await invitationRepository.getBySlug(slug);
  }

  console.log('[PublicInvitationRoute] slug=%s found=%s status=%s',
    slug, !!invitation, invitation?.status ?? 'n/a');

  if (!invitation) return null;
  if (!isPublicInvitationStatus(invitation.status)) {
    console.log('[PublicInvitationRoute] blocked — non-public status: %s', invitation.status);
    return null;
  }
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
