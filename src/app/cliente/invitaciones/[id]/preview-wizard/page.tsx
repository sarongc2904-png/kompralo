import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isAdminUser } from '@/lib/admin';
import { WizardWhatsAppShareLink } from '@/components/wizard/WizardWhatsAppShareLink';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

function formatDate(iso: string | null): string {
  if (!iso) return 'Fecha por confirmar';
  const [year, month, day] = iso.split('-').map(Number);
  if (!year || !month || !day) return 'Fecha por confirmar';
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime())
    ? 'Fecha por confirmar'
    : date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function PreviewWizardPage({ params }: Props) {
  const { id } = await params;

  const authClient = await createServerSupabaseClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) {
    redirect(`/login?redirect=/cliente/invitaciones/${id}/preview-wizard`);
  }

  const db = createServiceRoleSupabaseClient();
  const [{ data: inv }, { data: content }] = await Promise.all([
    db.from('invitations')
      .select('id, title, slug, event_date, theme_id, customer_email, user_id, wizard_step_completed')
      .eq('id', id)
      .single(),
    db.from('invitation_content')
      .select('protagonists, location, hero, social')
      .eq('invitation_id', id)
      .maybeSingle(),
  ]);

  if (!inv) notFound();

  const isOwner = (inv.user_id && inv.user_id === user.id) ||
    (inv.customer_email && inv.customer_email.toLowerCase() === user.email?.toLowerCase());
  const isAdmin = isOwner ? false : await isAdminUser(user.id, user.email);
  if (!isOwner && !isAdmin) notFound();

  const protagonists = (content?.protagonists as Array<{ name?: string }> | null) ?? [];
  const location = (content?.location as { venueName?: string; address?: string } | null) ?? {};
  const hero = (content?.hero as { emotionalPhrase?: string } | null) ?? {};
  const social = (content?.social as { hashtag?: string } | null) ?? {};
  const publicUrl = inv.slug ? `/i/${inv.slug}` : null;
  const editorUrl = `/dashboard/invitations/${id}/edit`;

  const names = protagonists
    .map((item) => item.name)
    .filter(Boolean)
    .join(' & ') || inv.title || 'Tu boda';

  const wizardCompleted = Number(inv.wizard_step_completed ?? 0) >= 3;

  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <Link href="/cliente" style={backLinkStyle}>Mis invitaciones</Link>

        <p style={eyebrowStyle}>{wizardCompleted ? 'Wizard completado' : 'Vista previa'}</p>
        <h1 style={titleStyle}>Tu invitación ya está lista.</h1>
        <p style={mutedStyle}>Revisa la base, compártela o continúa afinando detalles desde el editor.</p>

        <div style={previewCardStyle}>
          <p style={dateStyle}>{formatDate(inv.event_date)}</p>
          <h2 style={namesStyle}>{names}</h2>
          {hero.emotionalPhrase && <p style={phraseStyle}>{hero.emotionalPhrase}</p>}
          <div style={dividerStyle} />
          <p style={detailStyle}>{location.venueName || 'Lugar por confirmar'}</p>
          {location.address && <p style={subtleStyle}>{location.address}</p>}
          {social.hashtag && <p style={hashtagStyle}>{social.hashtag}</p>}
        </div>

        <div style={{ display: 'grid', gap: 12, marginTop: 22 }}>
          {publicUrl && <Link href={publicUrl} style={primaryLinkStyle}>Ver invitación</Link>}
          <WizardWhatsAppShareLink publicPath={publicUrl} style={secondaryLinkStyle} />
          <Link href={editorUrl} style={secondaryLinkStyle}>Personalizar detalles</Link>
        </div>

        <div style={quickActionsStyle}>
          <Link href={editorUrl} style={miniActionStyle}>Agregar fotos</Link>
          <Link href={editorUrl} style={miniActionStyle}>Agregar música</Link>
          <Link href={`/cliente/invitaciones/${id}`} style={miniActionStyle}>Agregar invitados</Link>
          <Link href={`/cliente/invitaciones/${id}`} style={miniActionStyle}>Configurar QR</Link>
        </div>
      </section>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(180deg, #FFFDF8 0%, #F6F2EC 100%)',
  padding: '24px 14px',
  fontFamily: 'system-ui, sans-serif',
};

const cardStyle: React.CSSProperties = {
  maxWidth: 560,
  margin: '0 auto',
  background: '#FFFCF7',
  border: '1px solid #E8DED2',
  borderRadius: 28,
  boxShadow: '0 24px 70px rgba(72, 55, 38, 0.10)',
  padding: '28px 18px',
  textAlign: 'center',
};

const backLinkStyle: React.CSSProperties = {
  display: 'inline-block',
  color: '#8A7663',
  fontSize: 13,
  textDecoration: 'none',
  marginBottom: 18,
};

const eyebrowStyle: React.CSSProperties = {
  color: '#B99752',
  fontSize: 11,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  marginBottom: 8,
};

const titleStyle: React.CSSProperties = {
  color: '#3D2B1A',
  fontSize: 31,
  lineHeight: 1.08,
  fontWeight: 680,
  marginBottom: 10,
};

const mutedStyle: React.CSSProperties = {
  color: '#8A7663',
  fontSize: 14,
  lineHeight: 1.55,
};

const previewCardStyle: React.CSSProperties = {
  marginTop: 24,
  background: '#FFFFFF',
  border: '1px solid #E8DED2',
  borderRadius: 24,
  padding: '24px 16px',
};

const dateStyle: React.CSSProperties = {
  color: '#B99752',
  fontSize: 12,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  marginBottom: 10,
};

const namesStyle: React.CSSProperties = {
  color: '#3D2B1A',
  fontSize: 28,
  lineHeight: 1.12,
  fontWeight: 500,
  marginBottom: 8,
};

const phraseStyle: React.CSSProperties = {
  color: '#8A7663',
  fontSize: 15,
  fontStyle: 'italic',
};

const dividerStyle: React.CSSProperties = {
  width: 52,
  height: 1,
  background: '#D9C8AE',
  margin: '18px auto',
};

const detailStyle: React.CSSProperties = {
  color: '#3D2B1A',
  fontSize: 15,
  fontWeight: 700,
};

const subtleStyle: React.CSSProperties = {
  color: '#8A7663',
  fontSize: 13,
  marginTop: 4,
};

const hashtagStyle: React.CSSProperties = {
  color: '#B99752',
  fontSize: 14,
  fontWeight: 800,
  marginTop: 14,
};

const primaryLinkStyle: React.CSSProperties = {
  display: 'block',
  borderRadius: 16,
  background: '#C5A880',
  color: '#2F2418',
  fontWeight: 800,
  padding: '15px 18px',
  textDecoration: 'none',
};

const secondaryLinkStyle: React.CSSProperties = {
  display: 'block',
  borderRadius: 16,
  background: '#FFFFFF',
  border: '1px solid #E8DED2',
  color: '#6B5137',
  fontWeight: 750,
  padding: '14px 18px',
  textDecoration: 'none',
};

const quickActionsStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 8,
  marginTop: 20,
};

const miniActionStyle: React.CSSProperties = {
  color: '#8A7663',
  background: '#F8F2E8',
  borderRadius: 14,
  padding: '12px 10px',
  fontSize: 12,
  textDecoration: 'none',
};
