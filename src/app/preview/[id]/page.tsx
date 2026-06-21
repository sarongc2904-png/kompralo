import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import InvitationRouteRenderer from '@/components/invitation/InvitationRouteRenderer';
import { SupabaseInvitationRepository } from '@/domain/invitations/supabase.repository';
import {
  resolveInvitationContext,
  isPreviewableInvitationStatus,
  buildNoIndexMetadata,
} from '@/domain/invitations';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';

// Never cache the preview — always re-fetch so saved changes appear immediately.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PreviewInvitationPageProps {
  params:      Promise<{ id: string }>;
  searchParams: Promise<{ from?: string; themePreview?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return buildNoIndexMetadata();
}

export default async function PreviewInvitationPage({ params, searchParams }: PreviewInvitationPageProps) {
  const { id }                    = await params;
  const { from, themePreview }    = await searchParams;
  const isFromEditor              = from === 'editor';

  // Use service role so RLS does not block preview reads (editor-only route).
  const repo       = new SupabaseInvitationRepository(createServiceRoleSupabaseClient());
  const invitation = await repo.getPreviewById(id);

  console.log('[PreviewPage] id=%s found=%s status=%s',
    id, !!invitation, invitation?.status ?? 'n/a');

  if (!invitation || !isPreviewableInvitationStatus(invitation.status)) {
    notFound();
  }

  const { theme, plan, features } = resolveInvitationContext(invitation);

  return (
    <>
      {/* Back-to-editor button — only when opened from the editor */}
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
        themePreviewId={themePreview}
      />
    </>
  );
}
