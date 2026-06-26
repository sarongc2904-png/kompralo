import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SupabaseOrderRepository } from '@/domain/orders';
import type { Order } from '@/domain/orders';
import { createServiceRoleSupabaseClient, createServerSupabaseClient } from '@/lib/supabase/server';
import { DashboardManualTour } from '@/components/dashboard/DashboardManualTour';
import { DashboardManualNavButton } from '@/components/dashboard/DashboardManualNavButton';
import { SignOutButton } from '@/components/auth/SignOutButton';

interface RsvpStats { total: number; yes: number; no: number; people: number }
interface InvitationListData { slug: string; status: string; title: string | null }

async function fetchInvitationData(ids: string[]): Promise<Record<string, InvitationListData>> {
  if (ids.length === 0) return {};
  try {
    const svc = createServiceRoleSupabaseClient();
    const { data } = await svc
      .from('invitations')
      .select('id, slug, status, title, deleted_at')
      .in('id', ids)
      .is('deleted_at', null); // exclude soft-deleted invitations
    if (!data) return {};
    return Object.fromEntries(
      data.map((r) => [r.id, { slug: r.slug as string, status: r.status as string, title: r.title as string | null }]),
    );
  } catch { return {}; }
}

async function fetchRsvpStats(invitationIds: string[]): Promise<Record<string, RsvpStats>> {
  if (invitationIds.length === 0) return {};
  try {
    const svc = createServiceRoleSupabaseClient();
    const { data } = await svc
      .from('rsvp_responses')
      .select('invitation_id, attendance, guest_count')
      .in('invitation_id', invitationIds);
    if (!data) return {};

    const map: Record<string, RsvpStats> = {};
    for (const id of invitationIds) map[id] = { total: 0, yes: 0, no: 0, people: 0 };

    for (const r of data) {
      const s = map[r.invitation_id];
      if (!s) continue;
      s.total++;
      if (r.attendance === 'yes') {
        s.yes++;
        s.people += Math.max(0, Number(r.guest_count ?? 0)) + 1;
      } else if (r.attendance === 'no') {
        s.no++;
      }
    }
    return map;
  } catch { return {}; }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const metadata: Metadata = { title: 'Mis invitaciones — Kompralo' };

const T = {
  ivory:     '#FAF3E6',
  cream:     '#FFFBF4',
  dark:      '#1C1713',
  mid:       '#1C1713',
  light:     '#7A6A5B',
  gold:      '#C8A95B',
  champagne: '#E5D2A8',
  white:     '#FFFBF4',
  border:    '#E5D2A8',
} as const;

const planLabels: Record<string, string> = {
  basic:    'Basic',
  premium:  'Premium',
  deluxe:   'Deluxe',
};

const statusLabels: Record<string, string> = {
  pending: 'Pendiente de pago',
  paid:    'Pagado',
  failed:  'Pago fallido',
  refunded:'Reembolsado',
};

function formatPrice(centavos: number, currency: string): string {
  return new Intl.NumberFormat('es-MX', {
    style:    'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(centavos / 100);
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric', month: 'long', day: 'numeric',
  }).format(new Date(iso));
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function getSession(): Promise<{ email: string; userId: string } | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    console.log('[cliente] getSession userId=%s email=%s error=%s',
      user?.id ?? 'null', user?.email ?? 'null', error?.message ?? 'none');
    if (!user?.email || !user?.id) return null;
    return { email: user.email, userId: user.id };
  } catch (e) {
    console.error('[cliente] getSession threw:', e);
    return null;
  }
}

async function fetchOrders(userId: string, email: string): Promise<Order[]> {
  try {
    const supabase  = createServiceRoleSupabaseClient();
    const orderRepo = new SupabaseOrderRepository(supabase);

    // Query by Auth user ID first (authoritative owner) and by customer_email
    // (for purchases made before owner_user_id was introduced). Merge and deduplicate.
    const [byUserId, byEmail] = await Promise.all([
      orderRepo.findByOwnerUserId(userId),
      orderRepo.findByCustomerEmail(email),
    ]);

    const seen = new Set<string>();
    const merged: Order[] = [];
    for (const o of [...byUserId, ...byEmail]) {
      if (!seen.has(o.id)) { seen.add(o.id); merged.push(o); }
    }
    merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    console.log('[Cliente] session user id:', userId);
    console.log('[Cliente] session email:', email);
    console.log('[Cliente] invitations count:', merged.length);
    return merged;
  } catch {
    return [];
  }
}

// ─── CSS ─────────────────────────────────────────────────────────────────────
function PageStyles() {
  return (
    <style>{`
      .cl-btn {
        transition: transform .15s ease, box-shadow .15s ease, opacity .15s ease;
      }
      .cl-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(15,12,9,0.1);
      }
      .cl-btn:active {
        transform: translateY(0);
      }
      .cl-card {
        transition: transform .25s ease, box-shadow .25s ease;
      }
      .cl-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(15,12,9,0.06);
      }
      .client-subtitle {
        font-size: 0 !important;
      }
      .client-subtitle::after {
        content: 'Administra tus invitaciones, confirma RSVP y comparte cada evento desde un solo lugar.';
        font-size: .9rem;
      }
      .cl-card.client-event-card {
        background: #FFFDF8 !important;
        border-color: #E6D8BD !important;
        border-radius: 1.75rem !important;
        box-shadow: 0 14px 36px rgba(78,61,38,0.08) !important;
      }
      .client-primary-action {
        background: #C4A962 !important;
        color: #241B12 !important;
        min-height: 52px !important;
        border-radius: 1rem !important;
        font-size: 0 !important;
        box-shadow: 0 4px 14px rgba(196,169,98,0.22) !important;
      }
      .client-primary-action::after {
        content: 'Abrir Mi Evento';
        font-size: .95rem;
      }
      .client-secondary-actions {
        display: grid !important;
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
      }
      .client-secondary-action {
        flex: none !important;
        background: #F4EBDD !important;
        color: #4D3A28 !important;
        box-shadow: none !important;
        font-size: 0 !important;
      }
      .client-public-action::after {
        content: 'Ver invitación';
        font-size: .875rem;
      }
      .client-edit-action::after {
        content: 'Editar';
        font-size: .875rem;
      }
      .client-share-action {
        background: #DDEBDD !important;
        color: #2F5F46 !important;
      }
      .client-share-action::after {
        content: 'Compartir';
        font-size: .875rem;
      }
      .client-public-action {
        background: #FFFDF8 !important;
        color: #5F4B35 !important;
        border: 1px solid #E6D8BD !important;
      }
      .client-public-standalone {
        display: none !important;
      }
      @media (max-width: 767px) {
        .client-page {
          background: #F7F1E7 !important;
          background-image:
            radial-gradient(circle at 20% 0%, rgba(196,169,98,0.16) 0%, transparent 38%),
            linear-gradient(180deg, #FFFDF8 0%, #F7F1E7 100%) !important;
          padding: 4.75rem 1rem 2rem !important;
        }
        .client-shell {
          max-width: 100% !important;
          margin-top: 0 !important;
        }
        .client-title-wrap {
          text-align: left !important;
          margin-bottom: 1.5rem !important;
        }
        .client-kicker {
          color: #B99752 !important;
        }
        .client-title {
          font-size: 2.125rem !important;
          color: #2F2419 !important;
        }
        .client-subtitle {
          color: #7A6A5B !important;
          line-height: 1.6 !important;
        }
        .client-session-badge {
          left: auto !important;
          transform: none !important;
          width: 100% !important;
          justify-content: center !important;
          background: #FFFDF8 !important;
          border-color: #E6D8BD !important;
        }
        .cl-card.client-event-card {
          background: #FFFDF8 !important;
          border-color: #E6D8BD !important;
          border-radius: 1.75rem !important;
          padding: 1.25rem !important;
          box-shadow: 0 14px 36px rgba(78,61,38,0.08) !important;
        }
        .client-event-header {
          gap: .875rem !important;
          margin-bottom: 1rem !important;
        }
        .client-event-title {
          font-size: 1.35rem !important;
          color: #2F2419 !important;
        }
        .client-event-meta {
          color: #7A6A5B !important;
        }
        .client-rsvp-grid {
          grid-template-columns: repeat(2, 1fr) !important;
          background: #F6F0E4 !important;
          border-color: #E8D9BB !important;
        }
        .client-primary-action {
          background: #C4A962 !important;
          color: #241B12 !important;
          min-height: 52px !important;
          border-radius: 1rem !important;
          font-size: 0 !important;
        }
        .client-primary-action::after {
          content: 'Abrir Mi Evento';
          font-size: .95rem;
        }
        .client-secondary-actions {
          display: grid !important;
          grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        }
        .client-secondary-action {
          flex: none !important;
          background: #F4EBDD !important;
          color: #4D3A28 !important;
          box-shadow: none !important;
        }
        .client-share-action {
          background: #DDEBDD !important;
          color: #2F5F46 !important;
        }
        .client-public-action {
          background: #FFFDF8 !important;
          color: #5F4B35 !important;
          border: 1px solid #E6D8BD !important;
          box-shadow: none !important;
        }
        .client-edit-action {
          order: 3;
        }
        .client-share-action {
          order: 2;
        }
        .client-public-action {
          order: 1;
        }
        .client-public-standalone {
          display: none !important;
        }
      }
    `}</style>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EmailSearchForm({ currentEmail }: { currentEmail?: string }) {
  return (
    <form
      method="get"
      style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2.5rem' }}
    >
      <input
        type="email"
        name="email"
        defaultValue={currentEmail}
        placeholder="correo@ejemplo.com"
        required
        style={{
          padding:      '0.75rem 1.125rem',
          border:       `1.5px solid ${T.border}`,
          borderRadius: '0.625rem',
          fontSize:     '0.875rem',
          color:        T.dark,
          background:   T.white,
          width:        '18rem',
          maxWidth:     '100%',
          outline:      'none',
        }}
      />
      <button
        type="submit"
        className="cl-btn"
        style={{
          padding:      '0.75rem 1.5rem',
          background:   T.dark,
          color:        '#F5EDD8',
          borderRadius: '0.625rem',
          fontSize:     '0.875rem',
          fontWeight:   700,
          border:       'none',
          cursor:       'pointer',
        }}
      >
        Buscar órdenes
      </button>
    </form>
  );
}

function OrderCard({ order, rsvpStats, invitationSlug, invitationStatus, invitationTitle, isAuthenticated }: { order: Order; rsvpStats?: { total: number; yes: number; no: number; people: number }; invitationSlug?: string | null; invitationStatus?: string | null; invitationTitle?: string | null; isAuthenticated: boolean }) {
  const statusColor: Record<string, string> = {
    pending:  '#7A6A5B',
    paid:     '#247A45',
    failed:   '#B43232',
    refunded: '#6A1B9A',
  };

  const statusBg: Record<string, string> = {
    pending:  '#FBF5E3',
    paid:     '#E7F5EC',
    failed:   '#FBEAEA',
    refunded: '#F3E5F5',
  };

  const isPaid = order.status === 'paid';
  const eventName = invitationTitle || order.customerName || 'Mi evento';

  const appUrl       = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kompralo.vercel.app';
  const publicUrl    = invitationSlug ? `${appUrl}/i/${invitationSlug}` : null;
  const shareMessage = publicUrl
    ? `Hola, queremos invitarte a nuestro evento.\n\nAbre nuestra invitación digital aquí:\n${publicUrl}\n\nPor favor confirma tu asistencia desde la invitación. ¡Te esperamos!`
    : '';
  const whatsappUrl  = shareMessage ? `https://wa.me/?text=${encodeURIComponent(shareMessage)}` : null;

  return (
    <div
      className="cl-card client-event-card"
      style={{
        background:   T.white,
        border:       `1px solid ${isPaid ? 'rgba(35,134,54,0.18)' : T.border}`,
        borderRadius: '1.25rem',
        padding:      '1.75rem 1.5rem',
        marginBottom: '1.25rem',
        boxShadow:    isPaid ? '0 4px 16px rgba(35,134,54,0.04)' : '0 2px 8px rgba(15,12,9,0.03)',
      }}
    >
      {/* Header row */}
      <div className="client-event-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'1rem', flexWrap:'wrap', marginBottom:'1rem' }}>
        <div>
          <p className="client-event-title" style={{ margin:'0 0 4px', fontSize:'1.125rem', fontWeight:700, color:T.dark, fontFamily:'var(--font-playfair, Georgia, serif)' }}>
            {eventName}
          </p>
          <p style={{ margin:'0 0 4px', fontSize:'.75rem', color:'#B99752', fontWeight:800, textTransform:'uppercase', letterSpacing:'.08em' }}>
            Plan {planLabels[order.planId] ?? order.planId}
          </p>
          <p className="client-event-meta" style={{ margin:0, fontSize:'.8125rem', color:T.mid }}>
            {formatPrice(order.amountTotal, order.currency)} MXN · Adquirido el {formatDate(order.createdAt)}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.375rem', alignItems: 'flex-end' }}>
          <span
            style={{
              padding:      '0.35rem 0.875rem',
              borderRadius: '2rem',
              fontSize:     '0.75rem',
              fontWeight:   700,
              color:        statusColor[order.status] ?? T.mid,
              background:   statusBg[order.status] ?? T.cream,
              letterSpacing:'.02em',
            }}
          >
            {statusLabels[order.status] ?? order.status}
          </span>
          {isPaid && (
            <span
              style={{
                padding:      '0.25rem 0.75rem',
                borderRadius: '2rem',
                fontSize:     '0.7rem',
                fontWeight:   700,
                letterSpacing:'.02em',
                color:        invitationStatus === 'published' ? '#247A45' : '#7A6A5B',
                background:   invitationStatus === 'published' ? '#E7F5EC' : '#FBF5E3',
              }}
            >
              {invitationStatus === 'published' ? '🟢 Publicada' : '🟡 Borrador'}
            </span>
          )}
        </div>
      </div>

      {/* Email confirmation */}
      <p style={{ margin:'0 0 1.25rem', fontSize:'0.8125rem', color: order.confirmationEmailSentAt ? '#4F7D5A' : T.light, display:'flex', alignItems:'center', gap:'0.375rem', fontWeight:500 }}>
        <span style={{ fontSize:'1rem', lineHeight:1 }}>{order.confirmationEmailSentAt ? '✓' : '○'}</span>
        {order.confirmationEmailSentAt
          ? `Correo de acceso enviado el ${formatDate(order.confirmationEmailSentAt)}`
          : 'Preparando correo de confirmación'}
      </p>

      {/* RSVP mini-stats */}
      {order.invitationId && isPaid && rsvpStats !== undefined && (
        <div className="client-rsvp-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '.5rem',
          marginBottom: '1.25rem',
          padding: '.875rem', background: T.cream,
          border: `1px solid ${T.border}`, borderRadius: '.875rem',
        }}>
          {[
            { label: 'Respuestas', value: rsvpStats.total, color: T.dark },
            { label: 'Sí asistirán', value: rsvpStats.yes, color: '#247A45' },
            { label: 'No asistirán', value: rsvpStats.no, color: '#B43232' },
            { label: 'Personas', value: rsvpStats.people, color: T.gold },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 .125rem', fontSize: '1.25rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</p>
              <p style={{ margin: 0, fontSize: '.6875rem', color: T.light, lineHeight: 1.3 }}>{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {order.invitationId && isPaid && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
          {isAuthenticated ? (
            <>
              {/* Full page reload — ensures session cookies are sent fresh on the first
                  request to a protected Server Component (client-side RSC nav can skip
                  cookies or serve a stale Router Cache redirect when auth state changed). */}
              <a
                href={`/cliente/invitaciones/${order.invitationId}`}
                className="cl-btn client-primary-action"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                  padding: '0.75rem 1.5rem', background: T.dark, color: T.cream,
                  borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 700,
                  textDecoration: 'none', minHeight: '46px', textAlign: 'center',
                }}
              >
                📊 Ver respuestas RSVP
              </a>
              <div className="client-secondary-actions" style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                {publicUrl && (
                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cl-btn client-secondary-action client-public-action"
                    style={{
                      flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      padding: '0.625rem 1rem',
                      background: '#F6F2EC',
                      color: '#5F4B35',
                      borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 700,
                      textDecoration: 'none', minHeight: '44px', textAlign: 'center',
                      boxShadow: '0 4px 14px rgba(95,75,53,0.08)',
                    }}
                  >
                    Ver invitaciÃ³n
                  </a>
                )}
                <a
                  href={`/dashboard/invitations/${order.invitationId}/edit`}
                  className="cl-btn client-secondary-action client-edit-action"
                  style={{
                    flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                    padding: '0.625rem 1rem', background: T.gold, color: T.dark,
                    borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 700,
                    textDecoration: 'none', minHeight: '44px', textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(184,150,106,0.2)',
                  }}
                >
                  ✏️ Editar invitación
                </a>
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cl-btn client-secondary-action client-share-action"
                    style={{
                      flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                      padding: '0.625rem 1rem', background: '#25D366', color: '#fff',
                      borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 700,
                      textDecoration: 'none', minHeight: '44px', textAlign: 'center',
                    }}
                  >
                    Compartir invitación
                  </a>
                )}
              </div>
              {publicUrl && (
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cl-btn client-secondary-action client-public-action client-public-standalone"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    padding: '0.75rem 1rem',
                    background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
                    color: '#fff',
                    borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 700,
                    textDecoration: 'none', minHeight: '44px', textAlign: 'center',
                    boxShadow: '0 4px 14px rgba(124,58,237,0.35)',
                    letterSpacing: '0.01em',
                  }}
                >
                  👁️ Ver mi invitación →
                </a>
              )}
            </>
          ) : (
            <Link
              href={`/login?redirect=${encodeURIComponent(`/cliente/invitaciones/${order.invitationId}`)}`}
              className="cl-btn"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0.75rem 1.5rem', background: T.dark, color: T.cream,
                borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 700,
                textDecoration: 'none', minHeight: '46px', textAlign: 'center',
              }}
            >
              Inicia sesión para administrar →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface Props {
  searchParams: Promise<{ email?: string }>;
}

export default async function ClientePage({ searchParams }: Props) {
  const { email: emailParam } = await searchParams;
  const session = await getSession();

  if (!session) {
    console.log('[cliente] no session → redirect to login');
    redirect('/login?redirect=%2Fcliente');
  }

  const trimmedEmail = session.email;
  const isAuthenticated = true;
  console.log('[cliente] isAuthenticated=true userId=%s email=%s', session.userId, session.email);

  const hasValidEmail = isValidEmail(trimmedEmail);
  const allOrders = await fetchOrders(session.userId, session.email);

  // Fetch invitation data first so we can filter out orders whose invitation
  // was deleted by admin (invitationDataMap won't have an entry for them).
  const allPaidInvitationIds = allOrders
    .filter((o) => o.status === 'paid' && !!o.invitationId)
    .map((o) => o.invitationId as string);
  const [rsvpStatsMap, invitationDataMap] = await Promise.all([
    fetchRsvpStats(allPaidInvitationIds),
    fetchInvitationData(allPaidInvitationIds),
  ]);

  // Keep only orders that either have no invitation linked (non-paid / pending)
  // or whose invitation still exists in the DB (not deleted by admin).
  const orders = allOrders.filter((o) => {
    if (!o.invitationId) return true;
    if (o.status !== 'paid') return true;
    return !!invitationDataMap[o.invitationId];
  });

  // Skip the listing and go straight to the only paid invitation (after filtering).
  if (orders.length === 1 && orders[0].status === 'paid' && orders[0].invitationId) {
    redirect(`/cliente/invitaciones/${orders[0].invitationId}`);
  }

  return (
    <main
      className="client-page"
      style={{
        minHeight:     '100dvh',
        background:    T.ivory,
        backgroundImage: `radial-gradient(ellipse at 50% 0%, rgba(184,150,106,0.06) 0%, transparent 60%)`,
        padding:       '4rem 1.25rem',
        fontFamily:    'var(--font-inter, system-ui, sans-serif)',
        position:      'relative',
      }}
    >
      <div className="paper-noise" />
      <PageStyles />

      {/* Navigation bar header */}
      <nav style={{
        position:'absolute', top:0, left:0, right:0,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'.875rem clamp(1.25rem,5vw,3rem)',
        borderBottom:`1px solid ${T.border}`,
        background:'rgba(250,247,242,0.85)', backdropFilter:'blur(10px)',
        zIndex:10,
      }}>
        <Link href="/invitaciones" style={{
          fontSize:'.75rem', fontWeight:800, letterSpacing:'.2em',
          textTransform:'uppercase', color:T.dark, textDecoration:'none',
        }}>
          Kompralo
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <DashboardManualNavButton />
          {isAuthenticated && (
            <SignOutButton style={{ fontSize:'.8125rem', color:T.light, fontWeight:500 }} className="pr2-nav-link">
              Cerrar sesión
            </SignOutButton>
          )}
        </div>
      </nav>

      <div className="client-shell" style={{ maxWidth: '640px', margin: '2rem auto 0', position:'relative', zIndex:2 }}>
        {/* Title */}
        <div className="client-title-wrap" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p className="client-kicker" style={{ fontSize:'.6875rem', fontWeight:700, letterSpacing:'.2em', color:T.gold, textTransform:'uppercase', margin:'0 0 .5rem' }}>
            Panel de Cliente
          </p>
          <h1 className="client-title" style={{ fontSize: '1.875rem', fontWeight: 700, color: '#1A1410', margin: '0 0 0.5rem', fontFamily:'var(--font-playfair, Georgia, serif)' }}>
            Mis Eventos
          </h1>
          <p className="client-subtitle" style={{ color: T.mid, fontSize: '0.9rem', margin: 0 }}>
            Aquí aparecen tus invitaciones compradas y su estado.
          </p>
        </div>

        {/* Authenticated identity badge */}
        {isAuthenticated && (
          <div className="client-session-badge" style={{
            textAlign: 'center',
            marginBottom: '2rem',
            padding: '.5rem 1rem',
            background: T.cream,
            border: `1px solid ${T.border}`,
            borderRadius: '2rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '.5rem',
            fontSize: '0.8125rem',
            color: T.mid,
            position: 'relative',
            left: '50%',
            transform: 'translateX(-50%)',
          }}>
            <span style={{ fontSize: '.5rem', color: '#247A45' }}>●</span>
            Sesión activa: <strong>{trimmedEmail}</strong>
          </div>
        )}

        {/* Email search — only for unauthenticated users (authenticated users auto-load their orders above) */}
        {!isAuthenticated && <EmailSearchForm currentEmail={emailParam} />}

        {/* Results */}
        {orders.length === 0 && (
          <div style={{
            textAlign:'center', padding:'3rem 2rem',
            background: T.white, border:`1px solid ${T.border}`,
            borderRadius:'1.25rem',
            boxShadow:'0 4px 20px rgba(15,12,9,0.03)',
          }}>
            <div style={{ fontSize:'2.5rem', marginBottom:'1rem', lineHeight: 1 }}>📬</div>
            <p style={{ margin:'0 0 0.5rem', fontWeight:700, color:T.dark, fontSize:'1.125rem', fontFamily:'var(--font-playfair, Georgia, serif)' }}>
              No encontramos invitaciones
            </p>
            <p style={{ margin:'0 0 1.5rem', color:T.mid, fontSize:'0.875rem', lineHeight:1.6 }}>
              No hay órdenes de compra registradas para <strong>{trimmedEmail}</strong>.
              <br />Si compraste usando otro correo, accede a través del enlace de ese correo.
            </p>
            <Link href="/invitaciones/precios" className="cl-btn" style={{
              display:'inline-block', padding:'0.75rem 1.75rem',
              background: T.dark, color:'#F5EDD8',
              borderRadius:'0.625rem', fontSize:'0.875rem', fontWeight:700, textDecoration:'none',
            }}>
              Ver planes y precios →
            </Link>
          </div>
        )}

        {orders.length > 0 && (
          <>
            <p style={{ color: T.mid, fontSize: '0.8125rem', marginBottom: '1rem', fontWeight: 600, letterSpacing: '.02em' }}>
              {orders.length} {orders.length === 1 ? 'invitación encontrada' : 'invitaciones encontradas'} para{' '}
              <strong>{trimmedEmail}</strong>
            </p>
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                rsvpStats={order.invitationId ? rsvpStatsMap[order.invitationId] : undefined}
                invitationSlug={order.invitationId ? invitationDataMap[order.invitationId]?.slug : null}
                invitationStatus={order.invitationId ? invitationDataMap[order.invitationId]?.status : null}
                invitationTitle={order.invitationId ? invitationDataMap[order.invitationId]?.title : null}
                isAuthenticated={isAuthenticated}
              />
            ))}

            {/* Buy another CTA — no free creation allowed */}
            <div style={{
              marginTop: '1.5rem', padding: '1.25rem 1.5rem',
              background: T.cream, border: `1px solid ${T.border}`,
              borderRadius: '1rem', textAlign: 'center',
            }}>
              <p style={{ margin: '0 0 .75rem', fontSize: '.875rem', color: T.mid, lineHeight: 1.6 }}>
                ¿Necesitas otra invitación para un nuevo evento?
              </p>
              <Link href="/invitaciones/precios" className="cl-btn" style={{
                display: 'inline-block', padding: '0.625rem 1.5rem',
                background: T.dark, color: '#F5EDD8',
                borderRadius: '0.625rem', fontSize: '0.875rem', fontWeight: 700, textDecoration: 'none',
              }}>
                Comprar otra invitación →
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Manual interactivo del cliente */}
      <DashboardManualTour />
    </main>
  );
}
