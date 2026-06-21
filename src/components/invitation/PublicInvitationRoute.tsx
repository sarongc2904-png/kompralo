import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import InvitationRouteRenderer from '@/components/invitation/InvitationRouteRenderer';
import { SupabaseInvitationRepository } from '@/domain/invitations/supabase.repository';
import {
  resolveInvitationContext,
  isPublicInvitationStatus,
  buildInvitationMetadata,
} from '@/domain/invitations';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';

/**
 * Service-role backed repository for public invitation reads.
 * This is a Server Component file — the service role key never reaches the browser.
 * Using service role bypasses RLS so public (paid/published) invitations are
 * readable without requiring the anon role to have SELECT policies.
 * Access control is enforced here: only paid/published + not-deleted are served.
 */
function createPublicRepo() {
  return new SupabaseInvitationRepository(createServiceRoleSupabaseClient());
}

export const getPublicInvitation = cache(async (slug: string) => {
  const repo = createPublicRepo();
  const invitation = await repo.getBySlug(slug);

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
