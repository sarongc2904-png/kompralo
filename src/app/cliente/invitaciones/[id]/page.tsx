import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import { isAdminUser } from '@/lib/admin';
import type { RSVPResponse } from '@/domain/rsvp/types';
import GuestPassSection from './GuestPassSection';
import QrCard from './QrCard';
import ShareButtons from './ShareButtons';
import RsvpModeSelector from './RsvpModeSelector';

export const dynamic  = 'force-dynamic';
export const revalidate = 0;
export const metadata: Metadata = { title: 'Dashboard de invitación — Kompralo' };

const T = {
  ivory:     '#E8D7B8',
  cream:     '#F1E3C8',
  dark:      '#0D0A07',
  mid:       '#1A1612',
  light:     '#6B4A35',
  gold:      '#C4A962',
  border:    '#EAD7A3',
  white:     '#F1E3C8',
} as const;

const planLabels: Record<string, string> = {
  basic: 'Basic', premium: 'Premium', deluxe: 'Deluxe',
};

const categoryLabels: Record<string, string> = {
  wedding: 'Boda', baptism: 'Bautizo', 'baby-shower': 'Baby Shower', birthday: 'Cumpleaños',
};

const attendanceLabels: Record<string, string> = {
  yes: 'Sí asistirá', no: 'No asistirá', maybe: 'Tal vez',
};

const attendanceColors: Record<string, string> = {
  yes: '#238636', no: '#D32F2F', maybe: '#8A6D3B',
};

const attendanceBg: Record<string, string> = {
  yes: '#E6F4EA', no: '#FCE8E6', maybe: '#FCF8E3',
};

function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
      .format(new Date(iso.includes('T') ? iso : iso + 'T12:00:00'));
  } catch { return iso; }
}

function formatDateTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat('es-MX', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      .format(new Date(iso));
  } catch { return iso; }
}

// ─── RSVP helpers ─────────────────────────────────────────────────────────────

function isAttending(r: RSVPResponse): boolean {
  return r.attendance === 'yes';
}

function isNotAttending(r: RSVPResponse): boolean {
  return r.attendance === 'no';
}

function getTotalPeople(r: RSVPResponse): number {
  if (!isAttending(r)) return 0;
  const n = Number(r.guestCount ?? 0);
  return (Number.isFinite(n) && n > 0 ? n : 0) + 1;
}

function buildStats(responses: RSVPResponse[]) {
  const total       = responses.length;
  const yesCount    = responses.filter(isAttending).length;
  const noCount     = responses.filter(isNotAttending).length;
  const totalPeople = responses.reduce((sum, r) => sum + getTotalPeople(r), 0);
  return { total, yesCount, noCount, totalPeople };
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function PageStyles() {
  return (
    <style>{`
      .db-btn { transition: transform .15s ease, box-shadow .15s ease, opacity .15s ease; }
      .db-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(15,12,9,0.1); }
      .db-btn:active { transform: translateY(0); }
      .db-stat-card { transition: transform .2s ease, box-shadow .2s ease; }
      .db-stat-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(15,12,9,0.06); }

      /* Main two-column layout — single column on mobile, sidebar on desktop */
      .db-main-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.5rem;
        align-items: start;
      }
      @media (min-width: 768px) {
        .db-main-grid {
          grid-template-columns: minmax(0, 1fr) 280px;
        }
      }

      /* Desktop table */
      .rsvp-table { width: 100%; border-collapse: collapse; font-size: .875rem; table-layout: auto; }
      .rsvp-table th {
        padding: .75rem 1rem; text-align: left;
        font-size: .75rem; font-weight: 700;
        letter-spacing: .06em; text-transform: uppercase;
        color: ${T.light}; border-bottom: 1px solid ${T.border};
        white-space: nowrap;
      }
      .rsvp-table td {
        padding: .625rem 1rem; border-bottom: 1px solid rgba(234,215,163,0.45);
        color: ${T.mid}; vertical-align: middle;
      }
      .rsvp-table tr:last-child td { border-bottom: none; }
      .rsvp-table tr:hover td { background: rgba(234,215,163,0.12); }

      /* Column width rules — applied to both th and td via class */
      .rsvp-table .col-name  { min-width: 160px; max-width: 260px; white-space: normal; word-break: break-word; }
      .rsvp-table .col-badge { white-space: nowrap; }
      .rsvp-table .col-num   { width: 54px; text-align: center; white-space: nowrap; }
      .rsvp-table .col-phone { white-space: nowrap; min-width: 100px; }
      .rsvp-table .col-msg   { max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .rsvp-table .col-pass  { white-space: nowrap; }

      @media (max-width: 767px) {
        .rsvp-table-wrap { display: none; }
        .rsvp-cards-wrap { display: block; }
      }
      @media (min-width: 768px) {
        .rsvp-table-wrap { display: block; }
        .rsvp-cards-wrap { display: none; }
      }

      /* Sticky sidebar — stays in view as the left column scrolls */
      @media (min-width: 768px) {
        .db-sidebar { position: sticky; top: 5rem; align-self: start; }
      }
    `}</style>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, accent }: { label: string; value: number; sub: string; accent?: string }) {
  return (
    <div
      className="db-stat-card"
      style={{
        background: T.white, border: `1px solid ${T.border}`,
        borderRadius: '1rem', padding: '1.25rem 1rem',
        textAlign: 'center', boxShadow: '0 2px 8px rgba(15,12,9,0.03)',
        borderTop: accent ? `3px solid ${accent}` : undefined,
      }}
    >
      <p style={{ margin: '0 0 .25rem', fontSize: '2rem', fontWeight: 800, color: accent ?? T.dark, lineHeight: 1 }}>
        {value}
      </p>
      <p style={{ margin: '0 0 .25rem', fontSize: '.8125rem', fontWeight: 700, color: T.dark }}>
        {label}
      </p>
      <p style={{ margin: 0, fontSize: '.75rem', color: T.light }}>{sub}</p>
    </div>
  );
}

// ─── RSVP mobile card ─────────────────────────────────────────────────────────

function RsvpCard({ r, appUrl }: { r: RSVPResponse; appUrl: string }) {
  const companions = Number(r.guestCount ?? 0);
  const validComp  = Number.isFinite(companions) && companions > 0 ? companions : 0;
  const total      = isAttending(r) ? validComp + 1 : 0;

  return (
    <div style={{
      background: T.white, border: `1px solid ${T.border}`,
      borderRadius: '1rem', padding: '1.125rem 1.25rem',
      marginBottom: '.75rem',
      borderLeft: `3px solid ${attendanceColors[r.attendance] ?? T.border}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '.5rem', marginBottom: '.5rem' }}>
        <p style={{ margin: 0, fontWeight: 700, color: T.dark, fontSize: '.9375rem' }}>{r.name}</p>
        <span style={{
          padding: '.2rem .625rem', borderRadius: '2rem',
          fontSize: '.6875rem', fontWeight: 700, whiteSpace: 'nowrap',
          color: attendanceColors[r.attendance] ?? T.mid,
          background: attendanceBg[r.attendance] ?? T.cream,
        }}>
          {attendanceLabels[r.attendance] ?? r.attendance}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.375rem .75rem', fontSize: '.8125rem', color: T.mid }}>
        {isAttending(r) && (
          <>
            <span style={{ color: T.light, fontSize: '.75rem' }}>Acompañantes</span>
            <span style={{ fontWeight: 600 }}>{validComp}</span>
            <span style={{ color: T.light, fontSize: '.75rem' }}>Total personas</span>
            <span style={{ fontWeight: 600, color: '#238636' }}>{total}</span>
          </>
        )}
        {r.phone && (
          <>
            <span style={{ color: T.light, fontSize: '.75rem' }}>Teléfono</span>
            <span>{r.phone}</span>
          </>
        )}
      </div>

      {r.message && (
        <p style={{ margin: '.5rem 0 0', fontSize: '.8125rem', color: T.mid, fontStyle: 'italic', borderTop: `1px solid ${T.border}`, paddingTop: '.5rem' }}>
          &ldquo;{r.message}&rdquo;
        </p>
      )}

      <p style={{ margin: '.5rem 0 0', fontSize: '.75rem', color: T.light }}>
        {formatDateTime(r.createdAt)}
      </p>

      {r.passToken && (
        <div style={{ marginTop: '.625rem', paddingTop: '.5rem', borderTop: `1px solid ${T.border}` }}>
          <a
            href={`${appUrl}/pass/${r.passToken}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '.375rem',
              padding: '.4rem .875rem',
              background: r.checkedInAt ? '#E6F4EA' : T.dark,
              color: r.checkedInAt ? '#238636' : T.cream,
              border: `1px solid ${r.checkedInAt ? '#A7D7B0' : 'transparent'}`,
              borderRadius: '.625rem', fontSize: '.8125rem', fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            {r.checkedInAt ? '✓ Pase usado' : '🎫 Ver pase de entrada'}
          </a>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ id: string }>;
}

export default async function InvitationDashboard({ params }: Props) {
  const { id } = await params;

  // 1. Auth check — wrapped in try-catch so a Supabase config error shows a clean redirect.
  let sessionUser: { id: string; email: string } | null = null;
  let _getUserError: string | null = null;
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    _getUserError = error?.message ?? null;
    if (user?.id && user?.email) {
      sessionUser = { id: user.id, email: user.email };
    }
    console.log('[session-debug]', JSON.stringify({
      route:       `/cliente/invitaciones/${id}`,
      methodUsed:  'getUser',
      hasSession:  !!sessionUser,
      hasUser:     !!user,
      userId:      user?.id ?? null,
      userEmail:   user?.email ?? null,
      error:       _getUserError,
    }));
  } catch (e) {
    console.error('[clienteInv] createServerSupabaseClient threw:', e);
    console.log('[session-debug]', JSON.stringify({
      route:      `/cliente/invitaciones/${id}`,
      methodUsed: 'getUser',
      hasSession: false,
      hasUser:    false,
      userId:     null,
      userEmail:  null,
      error:      String(e),
    }));
  }

  if (!sessionUser) {
    const dest = encodeURIComponent(`/cliente/invitaciones/${id}`);
    console.log('[clienteInv] no session → redirect /login?redirect=%s', dest);
    redirect(`/login?redirect=${dest}`);
  }

  const email  = sessionUser.email;
  const userId = sessionUser.id;

  const svc = (() => {
    try {
      return createServiceRoleSupabaseClient();
    } catch (e) {
      console.error('[clienteInv] createServiceRoleSupabaseClient threw (check SUPABASE_SERVICE_ROLE_KEY):', e);
      return null;
    }
  })();

  if (!svc) notFound();

  // 2. Fetch invitation, verify ownership.
  // Ownership = Auth user ID matches (authoritative) OR customer_email matches (legacy/guest).
  const { data: inv } = await svc
    .from('invitations')
    .select('id, slug, customer_email, user_id, plan_id, status, title, subtitle, event_date, category, published_at, rsvp_mode')
    .eq('id', id)
    .single();

  const isOwnerByUserId = !!(inv && inv.user_id && inv.user_id === userId);
  const isOwnerByEmail  = !!(inv && typeof inv.customer_email === 'string' &&
    inv.customer_email.toLowerCase() === email.toLowerCase());

  console.log('[clienteInv] sessionUserId=%s sessionEmail=%s', userId, email);
  console.log('[clienteInv] invOwnerUserId=%s invCustomerEmail=%s', inv?.user_id ?? 'null', inv?.customer_email ?? 'null');
  console.log('[clienteInv] isOwnerByUserId=%s isOwnerByEmail=%s', isOwnerByUserId, isOwnerByEmail);

  const hasAccess = isOwnerByUserId || isOwnerByEmail;

  if (!hasAccess) {
    const isAdmin = await isAdminUser(userId, email);
    const authorized = isAdmin;
    console.log('[clienteInv] isAdmin=%s authorized=%s', isAdmin, authorized);
    if (isAdmin) {
      console.log('[clienteInv] redirectTarget=/admin/invitations/%s reason=admin-redirect', id);
      redirect(`/admin/invitations/${id}`);
    }
    console.log('[clienteInv] authorized=false reason=not-owner-not-admin');
    notFound();
  }

  const grantReason = isOwnerByUserId ? 'user_id-match' : 'email-match';
  console.log('[clienteInv] authorized=true reason=%s', grantReason);

  // 3. Fetch RSVP responses
  const { data: rsvpRows } = await svc
    .from('rsvp_responses')
    .select('id, invitation_id, name, phone, attendance, guest_count, message, status, pass_token, pass_created_at, checked_in_at, created_at, updated_at')
    .eq('invitation_id', id)
    .order('created_at', { ascending: false });

  const responses: RSVPResponse[] = (rsvpRows ?? []).map((r) => ({
    id:           r.id,
    invitationId: r.invitation_id,
    name:         r.name,
    phone:        r.phone ?? undefined,
    attendance:   r.attendance,
    guestCount:   Number(r.guest_count ?? 0),
    message:      r.message ?? undefined,
    status:       r.status,
    passToken:    r.pass_token ?? undefined,
    passCreatedAt: r.pass_created_at ?? undefined,
    checkedInAt:  r.checked_in_at ?? undefined,
    createdAt:    r.created_at,
    updatedAt:    r.updated_at,
  }));

  const stats = buildStats(responses);

  // 4. Build URLs
  const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kompralo.vercel.app';
  const publicUrl = inv.slug ? `${appUrl}/i/${inv.slug}` : null;
  const editUrl   = `/dashboard/invitations/${id}/edit`;

  // 5. Display helpers
  const eventTitle   = inv.title ?? 'Mi invitación';
  const eventSlug    = (inv.slug ?? id).replace(/[^a-z0-9-]/gi, '-').toLowerCase();
  const planLabel    = planLabels[inv.plan_id] ?? inv.plan_id ?? '—';
  const categoryLabel = categoryLabels[inv.category] ?? inv.category ?? '—';
  const eventDate    = formatDate(inv.event_date);
  const rsvpMode     = (inv.rsvp_mode === 'passes_only' ? 'passes_only' : 'open') as 'open' | 'passes_only';

  return (
    <main style={{
      minHeight:  '100dvh',
      background: T.ivory,
      backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(184,150,106,0.06) 0%, transparent 60%)',
      padding:    '4rem 1.25rem 3rem',
      fontFamily: 'var(--font-inter, system-ui, sans-serif)',
      position:   'relative',
    }}>
      <div className="paper-noise" />
      <PageStyles />


      {/* Nav */}
      <nav style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '.875rem clamp(1.25rem,5vw,3rem)',
        borderBottom: `1px solid ${T.border}`,
        background: 'rgba(250,247,242,0.85)', backdropFilter: 'blur(10px)',
        zIndex: 10,
      }}>
        <Link href="/cliente" style={{ fontSize: '.75rem', fontWeight: 800, letterSpacing: '.2em', textTransform: 'uppercase', color: T.dark, textDecoration: 'none' }}>
          ← Mis invitaciones
        </Link>
        <Link href="/auth/signout" style={{ fontSize: '.8125rem', color: T.light, textDecoration: 'none', fontWeight: 500 }}>
          Cerrar sesión
        </Link>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '2rem auto 0', position: 'relative', zIndex: 2 }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: '.6875rem', fontWeight: 700, letterSpacing: '.2em', color: T.gold, textTransform: 'uppercase', margin: '0 0 .375rem' }}>
            Dashboard del evento
          </p>
          <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 700, color: T.dark, margin: '0 0 .5rem', fontFamily: 'var(--font-playfair, Georgia, serif)', lineHeight: 1.2 }}>
            {eventTitle}
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem .75rem', fontSize: '.8125rem', color: T.mid, marginBottom: '1.25rem' }}>
            <span>{categoryLabel}</span>
            <span style={{ color: T.border }}>·</span>
            <span>{eventDate}</span>
            <span style={{ color: T.border }}>·</span>
            <span style={{ background: T.cream, border: `1px solid ${T.border}`, borderRadius: '2rem', padding: '.1rem .625rem', fontSize: '.75rem', fontWeight: 700, color: T.gold }}>
              Plan {planLabel}
            </span>
          </div>

          {/* Action buttons row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.625rem' }}>
            <Link href={editUrl} className="db-btn" style={{
              display: 'inline-flex', alignItems: 'center', gap: '.375rem',
              padding: '.625rem 1.25rem', background: T.gold, color: T.dark,
              borderRadius: '.75rem', fontSize: '.875rem', fontWeight: 700,
              textDecoration: 'none', boxShadow: '0 4px 12px rgba(196,169,98,0.25)',
            }}>
              ✏️ Editar invitación
            </Link>
            <a href={publicUrl ?? undefined} target="_blank" rel="noopener noreferrer" className="db-btn" style={{
              display: 'inline-flex', alignItems: 'center', gap: '.375rem',
              padding: '.625rem 1.25rem', background: T.cream,
              border: `1px solid ${T.border}`, color: T.dark,
              borderRadius: '.75rem', fontSize: '.875rem', fontWeight: 700,
              textDecoration: 'none',
            }}>
              👁 Ver invitación
            </a>
            <a href={`/api/invitations/${id}/rsvp/export`} className="db-btn" style={{
              display: 'inline-flex', alignItems: 'center', gap: '.375rem',
              padding: '.625rem 1.25rem', background: T.dark, color: T.cream,
              borderRadius: '.75rem', fontSize: '.875rem', fontWeight: 700,
              textDecoration: 'none',
            }}>
              ⬇ Descargar Excel
            </a>
          </div>
        </div>

        {/* ── Stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '.875rem', marginBottom: '2rem' }}>
          <StatCard label="Respuestas" value={stats.total} sub="confirmaciones totales" />
          <StatCard label="Sí asistirán" value={stats.yesCount} sub="respuestas positivas" accent="#238636" />
          <StatCard label="No asistirán" value={stats.noCount} sub="respuestas negativas" accent="#D32F2F" />
          <StatCard label="Personas" value={stats.totalPeople} sub="total real confirmado" accent={T.gold} />
        </div>

        {/* ── Two-column layout: full-width on mobile, sidebar on desktop ── */}
        <div className="db-main-grid">

          {/* Left: mode selector + RSVP list + passes */}
          <div>
            {/* ── Confirmation mode selector ── */}
            <div style={{
              background: T.white, border: `1px solid ${T.border}`,
              borderRadius: '1.25rem', padding: '1.25rem 1.25rem .875rem',
              marginBottom: '1.5rem',
            }}>
              <RsvpModeSelector
                invitationId={id}
                initialMode={rsvpMode}
                publicUrl={publicUrl ?? ''}
                eventTitle={eventTitle}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 700, color: T.dark, fontFamily: 'var(--font-playfair, Georgia, serif)' }}>
                Confirmaciones RSVP
              </h2>
              <span style={{ fontSize: '.8125rem', color: T.light, fontWeight: 600 }}>
                {responses.length} {responses.length === 1 ? 'respuesta' : 'respuestas'}
              </span>
            </div>

            {responses.length === 0 ? (
              <div style={{
                background: T.white, border: `1px solid ${T.border}`,
                borderRadius: '1.25rem', padding: '2.5rem 1.5rem',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '2.25rem', marginBottom: '.75rem' }}>📭</div>
                <p style={{ margin: '0 0 .5rem', fontWeight: 700, color: T.dark, fontSize: '1rem' }}>
                  Aún no hay confirmaciones
                </p>
                <p style={{ margin: 0, color: T.light, fontSize: '.875rem', lineHeight: 1.6 }}>
                  Cuando tus invitados respondan, aparecerán aquí.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="rsvp-table-wrap" style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: '1.25rem', overflow: 'auto' }}>
                  <table className="rsvp-table">
                    <thead>
                      <tr>
                        <th className="col-name">Nombre</th>
                        <th className="col-badge">Asistencia</th>
                        <th className="col-num">Acomp.</th>
                        <th className="col-num">Personas</th>
                        <th className="col-phone">Teléfono</th>
                        <th className="col-msg">Mensaje</th>
                        <th className="col-pass">Pase</th>
                      </tr>
                    </thead>
                    <tbody>
                      {responses.map((r) => {
                        const comp  = Number(r.guestCount ?? 0);
                        const vComp = Number.isFinite(comp) && comp > 0 ? comp : 0;
                        const ppl   = isAttending(r) ? vComp + 1 : 0;
                        return (
                          <tr key={r.id}>
                            <td className="col-name" style={{ fontWeight: 600, color: T.dark }}>{r.name}</td>
                            <td className="col-badge">
                              <span style={{
                                padding: '.2rem .625rem', borderRadius: '2rem',
                                fontSize: '.75rem', fontWeight: 700,
                                color: attendanceColors[r.attendance] ?? T.mid,
                                background: attendanceBg[r.attendance] ?? T.cream,
                                whiteSpace: 'nowrap',
                              }}>
                                {attendanceLabels[r.attendance] ?? r.attendance}
                              </span>
                            </td>
                            <td className="col-num">{vComp}</td>
                            <td className="col-num" style={{ fontWeight: 600, color: isAttending(r) ? '#238636' : T.light }}>
                              {ppl > 0 ? ppl : '—'}
                            </td>
                            <td className="col-phone">{r.phone ?? '—'}</td>
                            <td className="col-msg" style={{ fontSize: '.8125rem', fontStyle: r.message ? 'italic' : 'normal', color: T.mid }}>
                              {r.message ? `"${r.message}"` : '—'}
                            </td>
                            <td className="col-pass">
                              {r.passToken ? (
                                <a
                                  href={`${appUrl}/pass/${r.passToken}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '.25rem',
                                    padding: '.3rem .625rem',
                                    background: r.checkedInAt ? '#E6F4EA' : T.cream,
                                    color: r.checkedInAt ? '#238636' : T.dark,
                                    border: `1px solid ${r.checkedInAt ? '#A7D7B0' : T.border}`,
                                    borderRadius: '.5rem', fontSize: '.75rem', fontWeight: 700,
                                    textDecoration: 'none', whiteSpace: 'nowrap',
                                  }}
                                >
                                  {r.checkedInAt ? '✓ Usado' : '🎫 Ver pase'}
                                </a>
                              ) : (
                                <span style={{ fontSize: '.75rem', color: T.light, opacity: 0.5 }}>—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="rsvp-cards-wrap">
                  {responses.map((r) => <RsvpCard key={r.id} r={r} appUrl={appUrl} />)}
                </div>
              </>
            )}
            {/* Guest passes section — inside left column so it scrolls with RSVP */}
            <GuestPassSection invitationId={id} appUrl={appUrl} eventTitle={eventTitle} />
          </div>

          {/* Right sidebar: QR + share */}
          <div className="db-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {publicUrl && <QrCard publicUrl={publicUrl} eventSlug={eventSlug} />}

            {publicUrl && (
              <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: '1.25rem', padding: '1.25rem' }}>
                <p style={{ margin: '0 0 .875rem', fontSize: '.6875rem', fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: T.gold }}>
                  Compartir invitación
                </p>
                <ShareButtons publicUrl={publicUrl} eventTitle={eventTitle} />
              </div>
            )}
          </div>
        </div>

        {/* Bottom padding for mobile */}
        <div style={{ height: '2rem' }} />
      </div>
    </main>
  );
}
