import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import InvitationRouteRenderer from '@/components/invitation/InvitationRouteRenderer';
import {
  invitationRepository,
  resolveInvitationContext,
  isPreviewableInvitationStatus,
  buildNoIndexMetadata,
} from '@/domain/invitations';

// Never cache the preview — always re-fetch so saved changes appear immediately.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PreviewInvitationPageProps {
  params:       Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return buildNoIndexMetadata();
}

export default async function PreviewInvitationPage({ params, searchParams }: PreviewInvitationPageProps) {
  const { id }   = await params;
  const { from } = await searchParams;
  const isFromEditor = from === 'editor';

  const invitation = await invitationRepository.getPreviewById(id);
  console.log('[heroVideo/preview] hero:', JSON.stringify(invitation?.hero));
  console.log('[heroVideo/preview] enabled:', invitation?.hero?.videoLibraryEnabled);
  console.log('[heroVideo/preview] selectedVideoId:', invitation?.hero?.selectedVideoId);
  console.log('[heroVideo/preview] url:', invitation?.hero?.videoLibraryUrl);

  if (!invitation || !isPreviewableInvitationStatus(invitation.status)) {
    notFound();
  }

  const { theme, plan, features } = resolveInvitationContext(invitation);

  return (
    <>
      {/* Back-to-editor button — only when opened from the editor, never on public links */}
      {isFromEditor && (
        <a
          href={`/dashboard/invitations/${invitation.id}/edit`}
          style={{
            position: 'fixed', top: '1rem', left: '1rem', zIndex: 9999,
            background: 'rgba(13,10,7,0.82)', color: '#F5EDD8',
            padding: '.6rem 1.125rem', borderRadius: '9999px',
            fontSize: '.8125rem', fontWeight: 600, textDecoration: 'none',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            display: 'inline-flex', alignItems: 'center', gap: '.35rem',
          }}
        >
          ← Regresar a edición
        </a>
      )}
      <InvitationRouteRenderer
        invitation={invitation}
        theme={theme}
        plan={plan}
        features={features}
        mode="preview"
        showPreviewBadge={isFromEditor}
      />
    </>
  );
}
