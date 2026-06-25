import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

const THEME_GRADIENTS: Record<string, string> = {
  'ivory-editorial': 'linear-gradient(135deg, #2D5016 0%, #4A7C23 50%, #C9A84C 100%)',
  'modern-dark':     'linear-gradient(135deg, #0D1B2A 0%, #1E3A5F 60%, #A8B8C8 100%)',
  'luxury-gold':     'linear-gradient(135deg, #8B4513 0%, #A0522D 55%, #D4AF7A 100%)',
};

function formatDate(iso: string): string {
  if (!iso) return 'Fecha por confirmar';
  const [year, month, day] = iso.split('-').map(Number);
  if (!year || !month || !day) return 'Fecha por confirmar';
  const d = new Date(year, month - 1, day);
  return isNaN(d.getTime())
    ? 'Fecha por confirmar'
    : d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function daysUntil(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [year, month, day] = iso.split('-').map(Number);
  const target = new Date(year, month - 1, day);
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
}

const ICON_EMOJI: Record<string, string> = {
  church: '⛪',
  rings:  '💍',
  glass:  '🥂',
  music:  '🎵',
  utensils: '🍽️',
};

export default async function PreviewWizardPage({ params }: Props) {
  const { id } = await params;

  // Auth check
  const authClient = await createServerSupabaseClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) {
    redirect(`/login?redirect=/cliente/invitaciones/${id}/preview-wizard`);
  }

  const db = createServiceRoleSupabaseClient();

  const [{ data: inv }, { data: content }] = await Promise.all([
    db.from('invitations').select('id, title, event_date, plan_id, status, theme_id, customer_email, user_id').eq('id', id).single(),
    db.from('invitation_content').select('protagonists, itinerary, social').eq('invitation_id', id).maybeSingle(),
  ]);

  if (!inv) notFound();

  // Ownership check
  const isOwner = (inv.user_id && inv.user_id === user.id) ||
                  (inv.customer_email && inv.customer_email.toLowerCase() === user.email?.toLowerCase());
  if (!isOwner) notFound();

  const protagonists = (content?.protagonists as Array<{ name: string; role: string }> | null) ?? [];
  const itinerary    = (content?.itinerary   as Array<{ id: string; time: string; title: string; location: string; icon: string }> | null) ?? [];
  const social = (content?.social as { hashtag?: string } | null) ?? {};

  const names = protagonists.length >= 2
    ? `${protagonists[0].name} & ${protagonists[1].name}`
    : inv.title;

  const gradient = THEME_GRADIENTS[inv.theme_id ?? ''] ?? THEME_GRADIENTS['ivory-editorial'];
  const days     = inv.event_date ? daysUntil(inv.event_date) : null;
  const editorUrl = `/dashboard/invitations/${id}/edit`;

  return (
    <div style={{ minHeight: '100vh', background: '#F6F2EC', fontFamily: 'system-ui, sans-serif' }}>

      {/* Top bar */}
      <div style={{ background: '#1A1410', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/cliente" style={{ color: '#C5A880', fontSize: '0.75rem', textDecoration: 'none' }}>
          ← Mis invitaciones
        </Link>
        <p style={{ color: '#F5F3F0', fontSize: '0.75rem', opacity: 0.6 }}>Vista previa</p>
      </div>

      {/* Hero banner */}
      <div style={{ background: gradient, padding: '3rem 1.5rem', textAlign: 'center', color: '#fff' }}>
        <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.2em', opacity: 0.7, marginBottom: 12 }}>
          Tu invitación digital
        </p>
        <h1 style={{ fontSize: '2rem', fontWeight: 300, marginBottom: 8, lineHeight: 1.2 }}>
          {names}
        </h1>
        <p style={{ fontSize: '0.9rem', opacity: 0.75, fontStyle: 'italic', marginBottom: 16 }}>
          Nos casamos
        </p>
        {inv.event_date && (
          <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: 6 }}>
            {formatDate(inv.event_date)}
          </p>
        )}
        {days !== null && days > 0 && (
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '6px 20px', marginTop: 8 }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{days}</span>
            <span style={{ fontSize: '0.75rem', marginLeft: 6, opacity: 0.8 }}>días restantes</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '2rem 1.25rem' }}>

        {/* Itinerary */}
        {itinerary.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#C5A880', marginBottom: 16 }}>
              Itinerario
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {itinerary.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: 14, alignItems: 'flex-start',
                                             background: '#fff', borderRadius: 12, padding: '14px 16px',
                                             border: '1px solid #E8E2DA' }}>
                  <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{ICON_EMOJI[item.icon] ?? '•'}</span>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1A1410', marginBottom: 2 }}>{item.title}</p>
                    <p style={{ fontSize: '0.75rem', color: '#9B8878' }}>{item.time} · {item.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hashtag */}
        {social.hashtag && (
          <div style={{ textAlign: 'center', marginBottom: '2rem', padding: '20px', background: '#fff', borderRadius: 12, border: '1px solid #E8E2DA' }}>
            <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9B8878', marginBottom: 8 }}>
              Comparte tus momentos
            </p>
            <p style={{ fontSize: '1.4rem', fontWeight: 700, color: '#3D2B1A' }}>{social.hashtag}</p>
          </div>
        )}

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Link
            href={editorUrl}
            style={{ display: 'block', textAlign: 'center', padding: '14px 20px', background: '#1A1410',
                     color: '#F5F3F0', borderRadius: 12, textDecoration: 'none',
                     fontSize: '0.9rem', fontWeight: 700 }}
          >
            ✏️ Personalizar mi invitación
          </Link>
          <Link
            href="/cliente"
            style={{ display: 'block', textAlign: 'center', padding: '14px 20px', background: 'transparent',
                     color: '#9B8878', borderRadius: 12, textDecoration: 'none',
                     fontSize: '0.85rem', border: '1px solid #E8E2DA' }}
          >
            Ir a mis invitaciones
          </Link>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.7rem', color: '#C5A880', marginTop: 20 }}>
          Esta es una vista previa. Tu invitación pública está en construcción.
        </p>
      </div>
    </div>
  );
}
