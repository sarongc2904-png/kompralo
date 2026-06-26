import type { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import { canManageInvitation } from '@/lib/invitations/can-manage';
import ScannerView from './ScannerView';

export const dynamic  = 'force-dynamic';
export const revalidate = 0;
export const metadata: Metadata = { title: 'Control de acceso — Kompralo' };

interface Props {
  params: Promise<{ id: string }>;
}

const T = {
  dark:   '#1C1713',
  light:  '#7A6A5B',
  gold:   '#C8A95B',
  cream:  '#FFFBF4',
  white:  '#FFFBF4',
  border: '#E5D2A8',
} as const;

export default async function ScanPage({ params }: Props) {
  const { id } = await params;

  // Auth check
  let user: { id: string; email?: string } | null = null;
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user: u } } = await supabase.auth.getUser();
    user = u;
  } catch { /* fall through to redirect */ }

  if (!user?.id || !user?.email) {
    redirect(`/login?redirect=${encodeURIComponent(`/cliente/invitaciones/${id}/scan`)}`);
  }

  // Ownership check
  const hasAccess = await canManageInvitation(id, user.id, user.email!);
  if (!hasAccess) notFound();

  // Fetch event title for display
  const svc = createServiceRoleSupabaseClient();
  const { data: inv } = await svc
    .from('invitations')
    .select('title')
    .eq('id', id)
    .single();

  const eventTitle = inv?.title ?? 'Mi evento';

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#FAF3E6',
      fontFamily: 'var(--font-inter, system-ui, sans-serif)',
    }}>
      {/* Header */}
      <div style={{
        background: T.dark,
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <Link
          href={`/cliente/invitaciones/${id}`}
          style={{
            color: T.cream, textDecoration: 'none',
            fontSize: '.875rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: '.375rem',
            opacity: 0.8,
          }}
        >
          ← Volver
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: '.625rem', fontWeight: 800, letterSpacing: '.2em', textTransform: 'uppercase', color: T.gold }}>
            Control de acceso
          </p>
          <p style={{ margin: 0, fontSize: '.875rem', fontWeight: 700, color: T.cream, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {eventTitle}
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div style={{
        background: T.white,
        borderBottom: `1px solid ${T.border}`,
        padding: '1rem 1.25rem',
        maxWidth: '480px',
        margin: '0 auto',
      }}>
        <p style={{ margin: 0, fontSize: '.8125rem', color: T.light, lineHeight: 1.6 }}>
          Para registrar la entrada de un invitado, pide que te muestre su pase y copia el enlace o el código que aparece en la pantalla.
        </p>
      </div>

      {/* Scanner */}
      <ScannerView invitationId={id} />
    </div>
  );
}
