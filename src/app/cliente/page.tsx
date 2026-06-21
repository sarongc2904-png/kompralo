import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SupabaseOrderRepository } from '@/domain/orders';
import type { Order } from '@/domain/orders';
import { createServiceRoleSupabaseClient, createServerSupabaseClient } from '@/lib/supabase/server';

interface RsvpStats { total: number; yes: number; no: number; people: number }

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

export const metadata: Metadata = { title: 'Mis invitaciones — Kompralo' };

const T = {
  ivory:     '#E8D7B8',
  cream:     '#F1E3C8',
  dark:      '#0D0A07',
  mid:       '#1A1612',
  light:     '#6B4A35',
  gold:      '#C4A962',
  champagne: '#EAD7A3',
  white:     '#F1E3C8',
  border:    '#EAD7A3',
} as const;

const planLabels: Record<string, string> = {
  basic:    'Basic',
  premium:  'Premium',
  gold:     'Premium',
  deluxe:   'Deluxe',
  platinum: 'Deluxe',
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

function isAdminMode(): boolean {
  return process.env.ADMIN_ACCESS_ENABLED === 'true';
}

async function getSessionEmail(): Promise<string | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.email ?? null;
  } catch {
    return null;
  }
}

async function fetchOrders(email: string): Promise<Order[]> {
  try {
    const supabase   = createServiceRoleSupabaseClient();
    const orderRepo  = new SupabaseOrderRepository(supabase);
    return await orderRepo.findByCustomerEmail(email);
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

function OrderCard({ order, rsvpStats }: { order: Order; rsvpStats?: { total: number; yes: number; no: number; people: number } }) {
  const statusColor: Record<string, string> = {
    pending:  '#8A6D3B',
    paid:     '#238636',
    failed:   '#D32F2F',
    refunded: '#6A1B9A',
  };

  const statusBg: Record<string, string> = {
    pending:  '#FCF8E3',
    paid:     '#E6F4EA',
    failed:   '#FCE8E6',
    refunded: '#F3E5F5',
  };

  const isPaid = order.status === 'paid';

  const appUrl       = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kompralo.vercel.app';
  const publicUrl    = order.invitationId ? `${appUrl}/preview/${order.invitationId}` : null;
  const shareMessage = publicUrl
    ? `Hola, queremos invitarte a nuestro evento.\n\nAbre nuestra invitación digital aquí:\n${publicUrl}\n\nPor favor confirma tu asistencia desde la invitación. ¡Te esperamos!`
    : '';
  const whatsappUrl  = shareMessage ? `https://wa.me/?text=${encodeURIComponent(shareMessage)}` : null;

  return (
    <div
      className="cl-card"
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
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'1rem', flexWrap:'wrap', marginBottom:'1rem' }}>
        <div>
          <p style={{ margin:'0 0 4px', fontSize:'1.125rem', fontWeight:700, color:T.dark, fontFamily:'var(--font-playfair, Georgia, serif)' }}>
            Plan {planLabels[order.planId] ?? order.planId}
          </p>
          <p style={{ margin:0, fontSize:'.8125rem', color:T.mid }}>
            {formatPrice(order.amountTotal, order.currency)} MXN · Adquirido el {formatDate(order.createdAt)}
          </p>
        </div>
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
      </div>

      {/* Email confirmation */}
      <p style={{ margin:'0 0 1.25rem', fontSize:'0.8125rem', color: order.confirmationEmailSentAt ? '#238636' : T.light, display:'flex', alignItems:'center', gap:'0.375rem', fontWeight:500 }}>
        <span style={{ fontSize:'1rem', lineHeight:1 }}>{order.confirmationEmailSentAt ? '✓' : '○'}</span>
        {order.confirmationEmailSentAt
          ? `Correo de acceso enviado el ${formatDate(order.confirmationEmailSentAt)}`
          : 'Preparando correo de confirmación'}
      </p>

      {/* RSVP mini-stats */}
      {order.invitationId && isPaid && rsvpStats !== undefined && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '.5rem',
          marginBottom: '1.25rem',
          padding: '.875rem', background: T.cream,
          border: `1px solid ${T.border}`, borderRadius: '.875rem',
        }}>
          {[
            { label: 'Respuestas', value: rsvpStats.total, color: T.dark },
            { label: 'Sí asistirán', value: rsvpStats.yes, color: '#238636' },
            { label: 'No asistirán', value: rsvpStats.no, color: '#D32F2F' },
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
          <Link
            href={`/cliente/invitaciones/${order.invitationId}`}
            className="cl-btn"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
              padding: '0.75rem 1.5rem', background: T.dark, color: T.cream,
              borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 700,
              textDecoration: 'none', minHeight: '46px', textAlign: 'center',
            }}
          >
            📊 Administrar evento
          </Link>
          <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
            <Link
              href={`/dashboard/invitations/${order.invitationId}/edit`}
              className="cl-btn"
              style={{
                flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                padding: '0.625rem 1rem', background: T.gold, color: T.dark,
                borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 700,
                textDecoration: 'none', minHeight: '44px', textAlign: 'center',
                boxShadow: '0 4px 12px rgba(184,150,106,0.2)',
              }}
            >
              ✏️ Editar invitación
            </Link>
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cl-btn"
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
  const sessionEmail = await getSessionEmail();
  const adminMode = isAdminMode();

  if (!sessionEmail && !adminMode) {
    redirect('/login?redirect=/cliente');
  }

  // Authenticated session always wins. Query email is only a local/admin fallback.
  const adminEmail = adminMode ? emailParam?.trim() : undefined;
  const trimmedEmail = sessionEmail ?? adminEmail;
  const isAuthenticated = !!sessionEmail;
  const isAdminEmailFallback = !isAuthenticated && adminMode;

  const hasValidEmail = trimmedEmail && isValidEmail(trimmedEmail);
  const orders = hasValidEmail ? await fetchOrders(trimmedEmail) : [];

  const paidInvitationIds = orders
    .filter((o) => o.status === 'paid' && !!o.invitationId)
    .map((o) => o.invitationId as string);
  const rsvpStatsMap = await fetchRsvpStats(paidInvitationIds);

  return (
    <main
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
        {isAuthenticated && (
          <Link href="/auth/signout" style={{
            fontSize:'.8125rem', color:T.light, textDecoration:'none', fontWeight:500,
          }}
          className="pr2-nav-link"
          >
            Cerrar sesión
          </Link>
        )}
      </nav>

      <div style={{ maxWidth: '640px', margin: '2rem auto 0', position:'relative', zIndex:2 }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p style={{ fontSize:'.6875rem', fontWeight:700, letterSpacing:'.2em', color:T.gold, textTransform:'uppercase', margin:'0 0 .5rem' }}>
            Panel de Cliente
          </p>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#1A1410', margin: '0 0 0.5rem', fontFamily:'var(--font-playfair, Georgia, serif)' }}>
            Mis invitaciones
          </h1>
          <p style={{ color: T.mid, fontSize: '0.9rem', margin: 0 }}>
            Aquí aparecen tus invitaciones compradas y su estado.
          </p>
        </div>

        {/* Admin/dev email lookup — disabled in production mode */}
        {isAdminEmailFallback && (
          <div style={{ background: T.white, border: `1.5px solid ${T.border}`, borderRadius: '1.25rem', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <p
              style={{
                textAlign: 'center',
                color: T.light,
                fontSize: '0.8125rem',
                marginBottom: '1rem',
                fontWeight: 600,
                letterSpacing: '.05em',
                textTransform: 'uppercase',
              }}
            >
              Modo Administrador/Desarrollador
            </p>
            <EmailSearchForm currentEmail={trimmedEmail} />
          </div>
        )}

        {/* Authenticated identity badge */}
        {isAuthenticated && (
          <div style={{
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
            <span style={{ fontSize: '.5rem', color: '#238636' }}>●</span>
            Sesión activa: <strong>{trimmedEmail}</strong>
          </div>
        )}

        {/* Results */}
        {!trimmedEmail && (
          <p style={{ textAlign: 'center', color: T.light, fontSize: '0.9rem', marginTop:'2rem' }}>
            Inicia sesión para poder visualizar tus invitaciones.
          </p>
        )}

        {trimmedEmail && !hasValidEmail && (
          <p style={{ textAlign: 'center', color: '#D32F2F', fontSize: '0.875rem', marginTop:'2rem' }}>
            La dirección de correo electrónico es inválida. Verifica e intenta nuevamente.
          </p>
        )}

        {hasValidEmail && orders.length === 0 && (
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

        {hasValidEmail && orders.length > 0 && (
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
    </main>
  );
}
