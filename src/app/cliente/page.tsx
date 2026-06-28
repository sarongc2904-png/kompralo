import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SupabaseOrderRepository } from '@/domain/orders';
import type { Order } from '@/domain/orders';
import { createServiceRoleSupabaseClient, createServerSupabaseClient } from '@/lib/supabase/server';
import { MisEventosTour, MisEventosTourNavButton } from './MisEventosTour';
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
  ivory:     '#FAF6EB',
  cream:     '#FFFFFF',
  dark:      '#1A1208',
  mid:       '#1A1208',
  light:     '#7A6A5B',
  gold:      '#C9A84C',
  champagne: '#E5D2A8',
  white:     '#FFFFFF',
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
        box-shadow: 0 6px 20px rgba(15,12,9,0.08);
      }
      .cl-btn:active {
        transform: translateY(0);
      }
      .cl-card {
        transition: transform .25s ease, box-shadow .25s ease;
      }
      .cl-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(26,18,8,0.04);
      }
      .db-btn-gold {
        background: linear-gradient(135deg, #C9A84C 0%, #A38235 100%) !important;
        border: 1px solid #B99752 !important;
        color: #FFFFFF !important;
        text-shadow: 0 1px 2px rgba(0,0,0,0.1);
      }
      .db-btn-gold:hover {
        background: linear-gradient(135deg, #D9B85C 0%, #B39245 100%) !important;
        box-shadow: 0 4px 14px rgba(185,151,82,0.3) !important;
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

function OrderCard({ order, rsvpStats, invitationSlug, invitationStatus, invitationTitle, isAuthenticated, index }: { order: Order; rsvpStats?: { total: number; yes: number; no: number; people: number }; invitationSlug?: string | null; invitationStatus?: string | null; invitationTitle?: string | null; isAuthenticated: boolean; index?: number }) {
  const statusColor: Record<string, string> = {
    pending:  '#7A6A5B',
    paid:     '#1A7A45',
    failed:   '#B43232',
    refunded: '#6A1B9A',
  };

  const statusBg: Record<string, string> = {
    pending:  '#FAF6EB',
    paid:     '#E7F5EC',
    failed:   '#FBEAEA',
    refunded: '#F3E5F5',
  };

  const statusBorder: Record<string, string> = {
    pending:  '#EAD7A3',
    paid:     '#B8DFC4',
    failed:   '#F0C4C4',
    refunded: '#E1BEE7',
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
      id={index === 0 ? 'mis-eventos-card' : undefined}
      style={{
        background:   '#FFFFFF',
        border:       '1px solid #E5D2A8',
        borderRadius: '1.5rem',
        padding:      '1.5rem',
        marginBottom: '1.5rem',
        boxShadow:    '0 4px 20px rgba(26,18,8,0.02)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="md:flex-row">
        
        {/* Left Column - Thumbnail */}
        <div style={{ position: 'relative', width: '100%' }} className="md:w-44 h-44 flex-shrink-0">
          <img
            src="/images/invitaciones/invitation-paper-detail.webp"
            alt="Detalle de invitación"
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '1.125rem', border: '1px solid #E5D2A8' }}
          />
          <div style={{
            position: 'absolute', bottom: '0.5rem', right: '0.5rem',
            width: '1.75rem', height: '1.75rem', borderRadius: '50%',
            background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'pointer'
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7A6A5B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
        </div>

        {/* Right Column - Details */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          
          {/* Header Row inside card */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
            <div>
              <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.25rem', fontWeight: 700, color: '#1A1208', fontFamily: 'var(--font-playfair, Georgia, serif)', lineHeight: 1.2 }}>
                {eventName}
              </h2>
              <p style={{ margin: '0 0 0.35rem', fontSize: '0.75rem', color: '#C9A84C', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                PLAN {planLabels[order.planId] ?? order.planId} <svg width="10" height="10" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="6 3 18 3 22 9 12 21 2 9 6 3"></polygon></svg>
              </p>
              <p style={{ margin: 0, fontSize: '.8125rem', color: '#7A6A5B' }}>
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
                  border:       `1px solid ${statusBorder[order.status] ?? '#E5D2A8'}`,
                  letterSpacing:'.02em',
                  display:      'inline-flex',
                  alignItems:   'center',
                  gap:          '0.25rem'
                }}
              >
                {order.status === 'paid' && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                )}
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
                    color:        invitationStatus === 'published' ? '#1A7A45' : '#C9A84C',
                    background:   invitationStatus === 'published' ? '#E7F5EC' : '#FAF6EB',
                    border:       `1px solid ${invitationStatus === 'published' ? '#B8DFC4' : '#EAD7A3'}`,
                    display:      'inline-flex',
                    alignItems:   'center',
                    gap:          '0.25rem'
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: invitationStatus === 'published' ? '#1A7A45' : '#C9A84C' }}></span>
                  {invitationStatus === 'published' ? 'Publicada' : 'Borrador'}
                </span>
              )}
            </div>
          </div>

          {/* Email confirmation */}
          <div style={{ margin: '0.25rem 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '14px', height: '14px', borderRadius: '50%',
              background: order.confirmationEmailSentAt ? '#E7F5EC' : '#FAF6EB',
              border: `1px solid ${order.confirmationEmailSentAt ? '#B8DFC4' : '#EAD7A3'}`,
              color: order.confirmationEmailSentAt ? '#1A7A45' : '#C9A84C',
              fontSize: '8px', fontWeight: 'bold'
            }}>
              {order.confirmationEmailSentAt ? '✓' : '○'}
            </span>
            <span style={{ fontSize: '0.8125rem', color: order.confirmationEmailSentAt ? '#1A7A45' : '#7A6A5B', fontWeight: 500 }}>
              {order.confirmationEmailSentAt
                ? `Correo de acceso enviado el ${formatDate(order.confirmationEmailSentAt)}`
                : 'Preparando correo de confirmación'}
            </span>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '0.5rem 0 0.75rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, #EAD7A3, transparent)' }} />
            <svg width="20" height="10" viewBox="0 0 24 12" fill="none" style={{ color: '#C9A84C', margin: '0 0.5rem', opacity: 0.8 }}>
              <path d="M12 2L9 6L12 10L15 6L12 2Z" fill="currentColor" />
              <line x1="2" y1="6" x2="8" y2="6" stroke="currentColor" strokeWidth="1" />
              <line x1="16" y1="6" x2="22" y2="6" stroke="currentColor" strokeWidth="1" />
            </svg>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, #EAD7A3, transparent)' }} />
          </div>

          {/* RSVP stats grid */}
          {order.invitationId && isPaid && rsvpStats !== undefined && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {[
                {
                  label: 'Respuestas',
                  value: rsvpStats.total,
                  iconBg: '#E7F5EC',
                  iconColor: '#1A7A45',
                  icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                },
                {
                  label: 'Sí asistirán',
                  value: rsvpStats.yes,
                  iconBg: '#E7F5EC',
                  iconColor: '#1A7A45',
                  icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                },
                {
                  label: 'No asistirán',
                  value: rsvpStats.no,
                  iconBg: '#FBEAEA',
                  iconColor: '#B43232',
                  icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                },
                {
                  label: 'Personas',
                  value: rsvpStats.people,
                  iconBg: '#FAF6EB',
                  iconColor: '#C9A84C',
                  icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                },
              ].map(({ label, value, iconBg, iconColor, icon }) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.5rem 0.625rem', background: '#FFFFFF',
                  border: '1px solid #E5D2A8', borderRadius: '0.75rem',
                  boxShadow: '0 2px 8px rgba(26,18,8,0.01)'
                }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: iconBg, color: iconColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {icon}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: '#1A1208', lineHeight: 1 }}>{value}</span>
                    <span style={{ fontSize: '0.625rem', color: '#7A6A5B', lineHeight: 1.1, marginTop: '0.125rem' }}>{label}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action buttons */}
          {order.invitationId && isPaid && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {isAuthenticated ? (
                <>
                  <a
                    href={`/cliente/invitaciones/${order.invitationId}`}
                    id={index === 0 ? 'mis-eventos-btn-abrir' : undefined}
                    className="cl-btn db-btn-gold"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      padding: '0.75rem 1.5rem', borderRadius: '0.75rem', fontSize: '0.9rem', fontWeight: 700,
                      textDecoration: 'none', minHeight: '48px', textAlign: 'center',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
                    Abrir Mi Evento
                  </a>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    {publicUrl && (
                      <a
                        href={publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        id={index === 0 ? 'mis-eventos-btn-ver' : undefined}
                        className="cl-btn"
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                          padding: '0.625rem 0.25rem', background: '#FFFFFF', color: '#1A1208',
                          border: '1px solid #E5D2A8', borderRadius: '0.75rem', fontSize: '0.8125rem', fontWeight: 700,
                          textDecoration: 'none', minHeight: '44px', textAlign: 'center',
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        Ver invitación
                      </a>
                    )}
                    <a
                      href={`/dashboard/invitations/${order.invitationId}/edit`}
                      id={index === 0 ? 'mis-eventos-btn-editar' : undefined}
                      className="cl-btn"
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                        padding: '0.625rem 0.25rem', background: '#FAF6EB', color: '#1A1208',
                        border: '1px solid #E5D2A8', borderRadius: '0.75rem', fontSize: '0.8125rem', fontWeight: 700,
                        textDecoration: 'none', minHeight: '44px', textAlign: 'center',
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      Editar
                    </a>
                    {whatsappUrl && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        id={index === 0 ? 'mis-eventos-btn-compartir' : undefined}
                        className="cl-btn"
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                          padding: '0.625rem 0.25rem', background: '#E7F5EC', color: '#1A7A45',
                          border: '1px solid #B8DFC4', borderRadius: '0.75rem', fontSize: '0.8125rem', fontWeight: 700,
                          textDecoration: 'none', minHeight: '44px', textAlign: 'center',
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                        Compartir
                      </a>
                    )}
                  </div>
                </>
              ) : (
                <Link
                  href={`/login?redirect=${encodeURIComponent(`/cliente/invitaciones/${order.invitationId}`)}`}
                  className="cl-btn"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0.75rem 1.5rem', background: T.dark, color: '#FFFFFF',
                    borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 700,
                    textDecoration: 'none', minHeight: '48px', textAlign: 'center',
                  }}
                >
                  Inicia sesión para administrar →
                </Link>
              )}
            </div>
          )}

        </div>
      </div>
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
        background:    '#FAF6EB',
        backgroundImage: `radial-gradient(ellipse at 50% 0%, rgba(184,150,106,0.06) 0%, transparent 60%)`,
        padding:       '5rem 1.25rem 3rem',
        fontFamily:    'var(--font-inter, system-ui, sans-serif)',
        position:      'relative',
        overflow:      'hidden'
      }}
    >
      <div className="paper-noise" />
      <PageStyles />

      {/* Elegant Floral Watermark - Top Right */}
      <div style={{ position: 'absolute', top: 0, right: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.08 }} className="select-none hidden md:block">
        <svg width="320" height="320" viewBox="0 0 120 120" fill="none" stroke="currentColor" style={{ color: '#C9A84C' }}>
          <path d="M120,0 C100,10 90,30 95,50 C80,45 70,60 65,80 C50,85 40,100 0,120" strokeWidth="0.5" />
          <path d="M95,30 C90,20 70,25 75,40 C65,35 55,45 60,55" strokeWidth="0.5" />
          <circle cx="95" cy="30" r="4" fill="currentColor" opacity="0.3" />
          <path d="M95,26 C93,28 91,30 95,34 C99,30 97,28 95,26 Z" fill="currentColor" opacity="0.1" />
          <circle cx="75" cy="40" r="3" fill="currentColor" opacity="0.3" />
          <circle cx="60" cy="55" r="3" fill="currentColor" opacity="0.3" />
        </svg>
      </div>

      {/* Elegant Floral Watermark - Top Left */}
      <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.05 }} className="select-none hidden md:block">
        <svg width="220" height="220" viewBox="0 0 120 120" fill="none" stroke="currentColor" style={{ color: '#C9A84C', transform: 'scaleX(-1)' }}>
          <path d="M120,0 C100,10 90,30 95,50 C80,45 70,60 65,80" strokeWidth="0.5" />
          <circle cx="95" cy="30" r="4" fill="currentColor" opacity="0.3" />
          <circle cx="75" cy="40" r="3" fill="currentColor" opacity="0.3" />
        </svg>
      </div>

      {/* Monogram A&M in script gold */}
      <div style={{ position: 'absolute', left: 'clamp(1rem, 5vw, 3rem)', top: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem', zIndex: 12 }}>
        <span style={{ fontFamily: 'var(--font-pinyon)', color: '#C9A84C', fontSize: '38px', lineHeight: 1 }}>A&M</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(15deg) translateY(-2px)', opacity: 0.7 }}><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
      </div>

      {/* Navigation bar header */}
      <nav style={{
        position:'absolute', top:0, left:0, right:0,
        display:'flex', alignItems:'center', justifyContent:'flex-end',
        padding:'.875rem clamp(1.25rem,5vw,3rem)',
        background:'transparent',
        zIndex:10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <MisEventosTourNavButton />
          {isAuthenticated && (
            <SignOutButton style={{ fontSize:'.8125rem', color:T.light, fontWeight:500 }} className="pr2-nav-link">
              Cerrar sesión
            </SignOutButton>
          )}
        </div>
      </nav>

      <div className="client-shell" style={{ maxWidth: '640px', margin: '2rem auto 0', position:'relative', zIndex:2 }}>
        
        {/* Title */}
        <div className="client-title-wrap" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p className="client-kicker" style={{ fontSize:'.6875rem', fontWeight:700, letterSpacing:'.2em', color:T.gold, textTransform:'uppercase', margin:'0 0 .5rem' }}>
            Panel de Cliente
          </p>
          
          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0.25rem auto 0.75rem', maxWidth: '200px' }}>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, #EAD7A3, transparent)' }} />
            <svg width="16" height="8" viewBox="0 0 24 12" fill="none" style={{ color: '#C9A84C', margin: '0 0.4rem', opacity: 0.8 }}>
              <path d="M12 2L9 6L12 10L15 6L12 2Z" fill="currentColor" />
            </svg>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, #EAD7A3, transparent)' }} />
          </div>

          <h1 className="client-title" style={{ fontSize: '2.25rem', fontWeight: 700, color: '#1A1208', margin: '0 0 0.5rem', fontFamily:'var(--font-playfair, Georgia, serif)' }}>
            Mis Eventos
          </h1>
          <p className="client-subtitle" style={{ color: T.light, fontSize: '0.9rem', margin: 0, fontWeight: 500 }}>
            Administra tus invitaciones, confirma RSVP y comparte cada evento desde un solo lugar.
          </p>
        </div>

        {/* Authenticated identity badge */}
        {isAuthenticated && (
          <div className="client-session-badge" style={{
            textAlign: 'center',
            marginBottom: '1rem',
            padding: '0.45rem 1rem',
            background: '#FFFFFF',
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
            boxShadow: '0 2px 6px rgba(26,18,8,0.01)'
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            Sesión activa: <strong>{trimmedEmail}</strong>
          </div>
        )}

        {/* Count text with Calendar Icon */}
        {orders.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', color: '#7A6A5B', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '2.25rem' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            {orders.length} {orders.length === 1 ? 'invitación encontrada' : 'invitaciones encontradas'} para <strong>{trimmedEmail}</strong>
          </div>
        )}

        {/* Email search — only for unauthenticated users */}
        {!isAuthenticated && <EmailSearchForm currentEmail={emailParam} />}

        {/* Results */}
        {orders.length === 0 && (
          <div style={{
            textAlign:'center', padding:'3rem 2rem',
            background: T.white, border:`1px solid ${T.border}`,
            borderRadius:'1.5rem',
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
              background: T.dark, color:'#FFFFFF',
              borderRadius:'0.625rem', fontSize:'0.875rem', fontWeight:700, textDecoration:'none',
            }}>
              Ver planes y precios →
            </Link>
          </div>
        )}

        {orders.length > 0 && (
          <>
            {orders.map((order, i) => (
              <OrderCard
                key={order.id}
                order={order}
                index={i}
                rsvpStats={order.invitationId ? rsvpStatsMap[order.invitationId] : undefined}
                invitationSlug={order.invitationId ? invitationDataMap[order.invitationId]?.slug : null}
                invitationStatus={order.invitationId ? invitationDataMap[order.invitationId]?.status : null}
                invitationTitle={order.invitationId ? invitationDataMap[order.invitationId]?.title : null}
                isAuthenticated={isAuthenticated}
              />
            ))}

            {/* Buy another CTA */}
            <div style={{
              marginTop: '2rem', padding: '1.5rem',
              background: '#FFFFFF', border: '1px solid #E5D2A8',
              borderRadius: '1.5rem', textAlign: 'center',
              boxShadow: '0 4px 20px rgba(26,18,8,0.01)'
            }}>
              <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: '#7A6A5B', lineHeight: 1.6, fontWeight: 500 }}>
                ¿Necesitas otra invitación para un nuevo evento?
              </p>
              <Link href="/invitaciones/precios" className="cl-btn" style={{
                display: 'inline-block', padding: '0.75rem 2rem',
                background: '#1A1208', color: '#FFFFFF',
                borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 700, textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(26,18,8,0.15)', transition: 'all 0.15s'
              }}>
                Comprar otra invitación →
              </Link>
            </div>
          </>
        )}
      </div>

      <MisEventosTour />
    </main>
  );
}
