import type React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import { isAdminUser } from '@/lib/admin';
import type { RSVPResponse } from '@/domain/rsvp/types';
import { SignOutButton } from '@/components/auth/SignOutButton';
import GuestPassSection from './GuestPassSection';
import QrCard from './QrCard';
import ShareButtons from './ShareButtons';
import RsvpModeSelector from './RsvpModeSelector';
import { MiEventoTour } from './MiEventoTour';

export const dynamic  = 'force-dynamic';
export const revalidate = 0;
export const metadata: Metadata = { title: 'Dashboard de invitación — Kompralo' };

const T = {
  bg:     '#FAF7F2',
  card:   '#ffffff',
  dark:   '#1a1208',
  mid:    '#1a1208',
  light:  '#6b6050',
  gold:   '#C9A96E',
  border: '#E8DFC8',
  white:  '#ffffff',
} as const;

const planLabels: Record<string, string> = {
  basic: 'Basic', premium: 'Premium', deluxe: 'Deluxe',
};

const categoryLabels: Record<string, string> = {
  wedding: 'Boda', baptism: 'Bautizo', 'baby-shower': 'Baby Shower', birthday: 'Cumpleaños',
};

const attendanceLabels: Record<string, string> = {
  yes: 'Asistirá', no: 'No asistirá', maybe: 'Tal vez',
};

const attendanceColors: Record<string, string> = {
  yes: '#1a7a45', no: '#b43232', maybe: '#6b6050',
};

const attendanceBg: Record<string, string> = {
  yes: '#e7f5ec', no: '#fbeaea', maybe: '#fbf5e3',
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

function getDaysUntil(iso?: string | null): number | null {
  if (!iso) return null;
  const [year, month, day] = iso.split('T')[0].split('-').map(Number);
  if (!year || !month || !day) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(year, month - 1, day);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000);
}

function getEventStatus(input: { publicUrl: string | null; title?: string | null; eventDate?: string | null; status?: string | null }) {
  if (!input.publicUrl || !input.status) {
    return { label: '🔴 Requiere atención', color: '#b43232', bg: '#fbeaea', border: '#f0c4c4' };
  }

  if (!input.title || !input.eventDate) {
    return { label: '🟡 Faltan detalles', color: '#6b6050', bg: '#fbf5e3', border: '#E8DFC8' };
  }

  return { label: '🟢 Listo para compartir', color: '#1a7a45', bg: '#e7f5ec', border: '#b8dfc4' };
}

type EventPhase = 'configurando' | 'lista' | 'confirmaciones' | 'semana' | 'dia';

function getEventPhase(input: {
  publicUrl: string | null;
  statsTotal: number;
  daysUntilEvent: number | null;
  title?: string | null;
  eventDate?: string | null;
}): EventPhase {
  if (input.daysUntilEvent === 0) return 'dia';
  if (input.daysUntilEvent !== null && input.daysUntilEvent > 0 && input.daysUntilEvent <= 7) return 'semana';
  if (input.statsTotal > 0) return 'confirmaciones';
  if (input.publicUrl) return 'lista';
  return 'configurando';
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
      * { box-sizing: border-box; }
      .db-btn { transition: transform .13s ease, box-shadow .13s ease, opacity .13s ease; }
      .db-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(26,18,8,0.13); }
      .db-btn:active { transform: translateY(0); box-shadow: none; }
      .db-stat-card { transition: transform .2s ease, box-shadow .2s ease; }
      .db-stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(26,18,8,0.08); }

      .cc-card {
        background: #ffffff;
        border: 1px solid #E8DFC8;
        border-radius: 1rem;
        box-shadow: 0 1px 4px rgba(26,18,8,0.04);
      }

      .cc-pill {
        display: inline-flex; align-items: center; gap: .35rem;
        padding: .45rem .875rem;
        border-radius: 2rem;
        font-size: .8125rem; font-weight: 600;
        text-decoration: none; cursor: pointer;
        border: 1.5px solid #1a1208; color: #1a1208;
        background: transparent;
        transition: background .12s, color .12s;
        font-family: inherit;
      }
      .cc-pill:hover { background: #1a1208; color: #C9A96E; }
      .cc-pill-gold {
        background: #1a1208; color: #C9A96E; border-color: #1a1208;
      }
      .cc-pill-gold:hover { background: #2d1f0a; }

      .stat-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: .875rem;
      }
      @media (min-width: 640px) {
        .stat-grid { grid-template-columns: repeat(4, 1fr); }
      }

      .event-actions-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: .75rem;
      }

      .rsvp-table { width: 100%; border-collapse: collapse; font-size: .875rem; table-layout: auto; }
      .rsvp-table th {
        padding: .75rem 1rem; text-align: left;
        font-size: .75rem; font-weight: 700;
        letter-spacing: .06em; text-transform: uppercase;
        color: #6b6050; border-bottom: 1px solid #E8DFC8;
        white-space: nowrap;
      }
      .rsvp-table td {
        padding: .625rem 1rem; border-bottom: 1px solid rgba(232,223,200,0.6);
        color: #1a1208; vertical-align: middle;
      }
      .rsvp-table tr:last-child td { border-bottom: none; }
      .rsvp-table tr:hover td { background: rgba(232,223,200,0.12); }

      .rsvp-table .col-name  { min-width: 160px; max-width: 260px; white-space: normal; word-break: break-word; }
      .rsvp-table .col-badge { white-space: nowrap; }
      .rsvp-table .col-num   { width: 54px; text-align: center; white-space: nowrap; }
      .rsvp-table .col-phone { white-space: nowrap; min-width: 100px; }
      .rsvp-table .col-msg   { max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .rsvp-table .col-pass  { white-space: nowrap; }
      .rsvp-table .col-checkin { white-space: nowrap; font-size: .75rem; }

      @media (max-width: 767px) {
        .rsvp-table-wrap { display: none; }
        .rsvp-cards-wrap { display: block; }
      }
      @media (min-width: 768px) {
        .rsvp-table-wrap { display: block; }
        .rsvp-cards-wrap { display: none; }
      }
    `}</style>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, iconBg }: { icon: string; label: string; value: number; iconBg: string }) {
  return (
    <div className="db-stat-card cc-card" style={{ padding: '1rem 1.125rem', display: 'flex', alignItems: 'center', gap: '.875rem' }}>
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.125rem', flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: T.dark, lineHeight: 1, letterSpacing: '-.02em' }}>{value}</p>
        <p style={{ margin: '.15rem 0 0', fontSize: '.8rem', fontWeight: 600, color: T.light }}>{label}</p>
      </div>
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
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '.5rem', marginBottom: '.5rem' }}>
        <p style={{ margin: 0, fontWeight: 700, color: T.dark, fontSize: '.9375rem' }}>{r.name}</p>
        <span style={{
          padding: '.2rem .625rem', borderRadius: '2rem',
          fontSize: '.6875rem', fontWeight: 700, whiteSpace: 'nowrap',
          color: attendanceColors[r.attendance] ?? T.light,
          background: attendanceBg[r.attendance] ?? '#fbf5e3',
        }}>
          {attendanceLabels[r.attendance] ?? r.attendance}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.375rem .75rem', fontSize: '.8125rem', color: T.mid }}>
        {isAttending(r) && (
          <>
            <span style={{ color: T.light, fontSize: '.75rem' }}>Acompañantes</span>
            <span style={{ fontWeight: 600 }}>{validComp}</span>
            <span style={{ color: T.light, fontSize: '.75rem' }}>Asistentes</span>
            <span style={{ fontWeight: 600, color: '#1a7a45' }}>{total}</span>
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
              background: r.checkedInAt ? '#e7f5ec' : T.dark,
              color: r.checkedInAt ? '#1a7a45' : '#fffdf9',
              border: `1px solid ${r.checkedInAt ? '#b8dfc4' : 'transparent'}`,
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

  // Derived from existing responses — no new API calls
  const arrivedGuests  = responses.filter(r => !!r.checkedInAt);
  const pendingGuests  = responses.filter(r => r.attendance === 'yes' && !r.checkedInAt);
  const checkedInCount = arrivedGuests.length;
  const lastCheckIn = responses
    .filter((r): r is RSVPResponse & { checkedInAt: string } => !!r.checkedInAt)
    .sort((a, b) => new Date(b.checkedInAt).getTime() - new Date(a.checkedInAt).getTime())[0];

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
  const daysUntilEvent = getDaysUntil(inv.event_date);
  const eventStatus = getEventStatus({
    publicUrl,
    title: inv.title,
    eventDate: inv.event_date,
    status: inv.status,
  });
  const phase = getEventPhase({
    publicUrl,
    statsTotal: stats.total,
    daysUntilEvent,
    title: inv.title,
    eventDate: inv.event_date,
  });

  // ── Button style helpers ──────────────────────────────────────────────────────
  const btnBase: React.CSSProperties = {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    minHeight: '48px', padding: '.8rem 1.25rem',
    borderRadius: '8px', fontSize: '.9rem', fontWeight: 700,
    textDecoration: 'none', border: '1.5px solid transparent',
    letterSpacing: '.005em', transition: 'all .13s ease',
  };
  const btnPrimary: React.CSSProperties   = { ...btnBase, background: '#1a1208', color: '#C9A96E', boxShadow: '0 2px 8px rgba(26,18,8,0.18)' };
  const btnGold: React.CSSProperties      = { ...btnBase, background: T.gold, color: '#1a1208', fontWeight: 800 };
  const btnSecondary: React.CSSProperties = { ...btnBase, background: 'transparent', border: '1.5px solid #1a1208', color: '#1a1208', fontWeight: 600 };

  return (
    <main style={{
      minHeight:  '100dvh',
      background: T.bg,
      padding:    '4rem 1.25rem 3rem',
      fontFamily: 'var(--font-inter, system-ui, sans-serif)',
      position:   'relative',
    }}>
      <PageStyles />

      {/* Nav */}
      <nav style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '.875rem clamp(1.25rem,5vw,3rem)',
        borderBottom: `1px solid ${T.border}`,
        background: 'rgba(250,247,242,0.9)', backdropFilter: 'blur(10px)',
        zIndex: 10,
      }}>
        <Link href="/cliente" style={{ fontSize: '.75rem', fontWeight: 800, letterSpacing: '.2em', textTransform: 'uppercase', color: T.dark, textDecoration: 'none' }}>
          ← Mis invitaciones
        </Link>
        <SignOutButton style={{ fontSize: '.8125rem', color: T.light, fontWeight: 500 }}>
          Cerrar sesión
        </SignOutButton>
      </nav>

      <div style={{ maxWidth: '860px', margin: '2rem auto 0', position: 'relative', zIndex: 2 }}>

        {/* ── Header ── */}
        <section id="mi-evento-header" style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: '.6875rem', fontWeight: 800, letterSpacing: '.22em', color: T.gold, textTransform: 'uppercase', margin: '0 0 .375rem' }}>
            Centro de Control
          </p>
          <h1 style={{ fontSize: 'clamp(2rem, 8vw, 3rem)', fontWeight: 700, color: T.dark, margin: '0 0 .375rem', fontFamily: 'var(--font-playfair, Georgia, serif)', lineHeight: 1.05 }}>
            {eventTitle}
          </h1>
          {eventDate !== '—' && (
            <p style={{ margin: '0 0 1rem', fontSize: '.9375rem', color: T.light, fontWeight: 500 }}>
              📅 {eventDate}
            </p>
          )}

          {/* 4 pill actions */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', alignItems: 'center' }}>
            {publicUrl && (
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cc-pill db-btn"
              >
                👁 Ver invitación
              </a>
            )}
            {publicUrl && (
              <a href="#compartir" className="cc-pill db-btn">
                🔗 Compartir enlace
              </a>
            )}
            {stats.total > 0 && (
              <a href="#mi-evento-metricas" className="cc-pill db-btn">
                📊 Estadísticas
              </a>
            )}
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '.35rem',
              padding: '.45rem .875rem', borderRadius: '2rem',
              fontSize: '.8125rem', fontWeight: 700,
              background: '#1a1208', color: T.gold,
              border: '1.5px solid #1a1208',
            }}>
              👑 Plan {planLabel}
            </span>
          </div>
        </section>

        {/* ════════════════════════════════════════════════
            ESTADO 5 — DÍA DEL EVENTO
        ════════════════════════════════════════════════ */}
        {phase === 'dia' && (
          <>
            <div className="cc-card" style={{ background: '#1a1208', border: '1px solid rgba(201,169,110,0.25)', padding: 'clamp(1.75rem,5vw,2.5rem)', marginBottom: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '.875rem' }}>🎉</div>
              <h2 style={{ margin: '0 0 .75rem', fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', fontWeight: 700, color: '#fffdf9', fontFamily: 'var(--font-playfair, Georgia, serif)', lineHeight: 1.08 }}>
                Hoy es tu gran día
              </h2>
              <p style={{ margin: '0 auto 1.75rem', color: 'rgba(255,253,249,0.65)', fontSize: '.9375rem', lineHeight: 1.7, maxWidth: '440px' }}>
                Todo está listo. Controla la entrada de tus invitados y sigue las confirmaciones en tiempo real.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '.75rem' }}>
                <a href="#mis-invitados" className="db-btn" style={{ ...btnGold, padding: '.9rem 2rem', fontSize: '.9375rem', minHeight: '50px' }}>
                  Preparar entrada
                </a>
                {publicUrl && (
                  <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="db-btn"
                    style={{ ...btnBase, background: 'rgba(255,253,249,0.1)', border: '1.5px solid rgba(255,253,249,0.22)', color: '#fffdf9', minHeight: '50px', fontSize: '.9375rem', fontWeight: 600 }}
                  >
                    Ver invitación
                  </a>
                )}
              </div>
            </div>

            {/* Control de acceso */}
            <div className="cc-card" id="control-acceso" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <p style={{ margin: '0 0 1rem', fontSize: '.65rem', fontWeight: 800, letterSpacing: '.22em', textTransform: 'uppercase', color: T.gold }}>
                Control del evento
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '.75rem', marginBottom: '1.25rem' }}>
                <div className="db-stat-card" style={{ background: '#e7f5ec', border: '1px solid #b8dfc4', borderRadius: '1rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#b8dfc4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.125rem', flexShrink: 0 }}>✅</div>
                  <div>
                    <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#1a7a45', lineHeight: 1 }}>{stats.yesCount}</p>
                    <p style={{ margin: '.1rem 0 0', fontSize: '.8rem', fontWeight: 600, color: '#1a7a45' }}>Confirmados</p>
                  </div>
                </div>
                <div className="db-stat-card" style={{ background: '#fbf5e3', border: `1px solid #e8d8ad`, borderRadius: '1rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e8d8ad', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.125rem', flexShrink: 0 }}>🚪</div>
                  <div>
                    <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#8a6d3b', lineHeight: 1 }}>{checkedInCount}</p>
                    <p style={{ margin: '.1rem 0 0', fontSize: '.8rem', fontWeight: 600, color: '#8a6d3b' }}>Dentro</p>
                  </div>
                </div>
              </div>

              {lastCheckIn ? (
                <div style={{ background: '#e7f5ec', border: '1px solid #b8dfc4', borderRadius: '.875rem', padding: '.875rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                  <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>✅</span>
                  <div>
                    <p style={{ margin: '0 0 .1rem', fontSize: '.625rem', fontWeight: 700, color: '#4f7d5a', letterSpacing: '.1em', textTransform: 'uppercase' }}>Último ingreso</p>
                    <p style={{ margin: '0 0 .1rem', fontSize: '.9375rem', fontWeight: 700, color: T.dark }}>{lastCheckIn.name}</p>
                    <p style={{ margin: 0, fontSize: '.75rem', color: T.light }}>{formatDateTime(lastCheckIn.checkedInAt)}</p>
                  </div>
                </div>
              ) : (
                <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: '.875rem', padding: '.875rem 1rem', marginBottom: '1rem' }}>
                  <p style={{ margin: 0, fontSize: '.875rem', color: T.light, lineHeight: 1.55 }}>Aún no ha ingresado nadie. Los accesos aparecerán aquí conforme lleguen.</p>
                </div>
              )}

              <a id="mi-evento-scanner" href={`/cliente/invitaciones/${id}/scan`} className="db-btn" style={{ ...btnGold, display: 'flex' }}>
                📷 Escanear invitados al entrar
              </a>
            </div>
          </>
        )}

        {/* ════════════════════════════════════════════════
            ESTADO 4 — SEMANA DEL EVENTO
        ════════════════════════════════════════════════ */}
        {phase === 'semana' && (
          <>
            {/* Countdown banner */}
            <div className="cc-card" style={{ padding: '1.5rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fbf5e3', border: '1px solid #e8d8ad', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                ⏳
              </div>
              <div>
                <p style={{ margin: '0 0 .2rem', fontSize: '.6875rem', fontWeight: 800, letterSpacing: '.2em', textTransform: 'uppercase', color: T.gold }}>
                  Ya casi llega el gran día
                </p>
                <p style={{ margin: '0 0 .2rem', fontSize: '1.0625rem', fontWeight: 700, color: T.dark }}>
                  {(daysUntilEvent ?? 0) === 1 ? 'Mañana es tu boda.' : `Faltan ${daysUntilEvent} días.`}
                </p>
                <p style={{ margin: 0, fontSize: '.875rem', color: T.light, lineHeight: 1.5 }}>
                  Revisa las últimas confirmaciones y prepara los pases de entrada.
                </p>
              </div>
            </div>

            {/* Invitation horizontal card */}
            <div className="cc-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {/* Thumbnail placeholder */}
              <div style={{ width: 88, height: 88, borderRadius: '.75rem', background: 'linear-gradient(135deg, #C9A96E 0%, #8a6d3b 100%)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                💌
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 .2rem', fontSize: '.75rem', fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: T.gold }}>
                  {categoryLabel}
                </p>
                <h2 style={{ margin: '0 0 .25rem', color: T.dark, fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-playfair, Georgia, serif)' }}>
                  {eventTitle}
                </h2>
                <p style={{ margin: '0 0 1rem', fontSize: '.875rem', color: T.light }}>📅 {eventDate}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.625rem' }}>
                  <a href="#mis-invitados" className="db-btn" style={{ ...btnPrimary, fontSize: '.875rem', minHeight: '40px', padding: '.6rem 1.125rem' }}>
                    👥 Administrar invitados
                  </a>
                  {publicUrl && (
                    <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="db-btn" style={{ ...btnSecondary, fontSize: '.875rem', minHeight: '40px', padding: '.6rem 1.125rem' }}>
                      👁 Ver como mis invitados
                    </a>
                  )}
                  {daysUntilEvent !== null && daysUntilEvent <= 2 && (
                    <a id="mi-evento-scanner" href={`/cliente/invitaciones/${id}/scan`} className="db-btn" style={{ ...btnGold, fontSize: '.875rem', minHeight: '40px', padding: '.6rem 1.125rem' }}>
                      📷 Escanear invitados al entrar
                    </a>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ════════════════════════════════════════════════
            ESTADO 1 — CONFIGURANDO
        ════════════════════════════════════════════════ */}
        {phase === 'configurando' && (
          <div className="cc-card" style={{ padding: '2.25rem 1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '.75rem' }}>✍️</div>
            <h2 style={{ margin: '0 0 .625rem', fontSize: 'clamp(1.4rem, 5vw, 2rem)', fontWeight: 700, color: T.dark, fontFamily: 'var(--font-playfair, Georgia, serif)', lineHeight: 1.15 }}>
              Tu invitación aún no está lista.
            </h2>
            <p style={{ margin: '0 auto 1.5rem', color: T.light, fontSize: '.9375rem', lineHeight: 1.65, maxWidth: '440px' }}>
              Completa los datos principales para poder compartirla con tus invitados.
            </p>
            <a href={editUrl} className="db-btn" style={{ ...btnPrimary, display: 'inline-flex', gap: '.4rem', padding: '.875rem 2rem', borderRadius: '8px', fontSize: '.9375rem', minHeight: '52px' }}>
              ✨ Personalizar invitación
            </a>
          </div>
        )}

        {/* ════════════════════════════════════════════════
            ESTADOS 2 & 3 — LISTA / CONFIRMACIONES
        ════════════════════════════════════════════════ */}
        {(phase === 'lista' || phase === 'confirmaciones') && (
          <>
            {/* Horizontal invitation card */}
            <div className="cc-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ width: 88, height: 88, borderRadius: '.75rem', background: 'linear-gradient(135deg, #C9A96E 0%, #8a6d3b 100%)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                💌
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 .2rem', fontSize: '.75rem', fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: T.gold }}>
                  {categoryLabel}
                </p>
                <h2 style={{ margin: '0 0 .25rem', color: T.dark, fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-playfair, Georgia, serif)' }}>
                  {eventTitle}
                </h2>
                <p style={{ margin: '0 0 1rem', fontSize: '.875rem', color: T.light }}>📅 {eventDate}</p>
                <div id="mi-evento-acciones" className="event-actions-grid" style={{ maxWidth: '520px' }}>
                  <a href="#compartir" className="db-btn" style={btnPrimary}>
                    📤 Compartir con confirmación
                  </a>
                  <a href="#compartir" className="db-btn" style={btnPrimary}>
                    🎫 Compartir con pases
                  </a>
                  <a href={editUrl} className="db-btn" style={btnSecondary}>
                    ✨ Personalizar invitación
                  </a>
                  <a
                    href={publicUrl ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="db-btn"
                    style={{ ...btnSecondary, opacity: publicUrl ? 1 : .45, pointerEvents: publicUrl ? 'auto' : 'none' }}
                  >
                    👁 Ver como mis invitados
                  </a>
                </div>
              </div>
            </div>

            {/* Last confirmation hint for confirmaciones phase */}
            {phase === 'confirmaciones' && responses.length > 0 && (
              <div className="cc-card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e7f5ec', border: '1px solid #b8dfc4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                  ✅
                </div>
                <div>
                  <p style={{ margin: '0 0 .1rem', fontSize: '.75rem', fontWeight: 700, color: T.light, letterSpacing: '.05em', textTransform: 'uppercase' }}>Última confirmación</p>
                  <p style={{ margin: 0, fontSize: '.9375rem', fontWeight: 700, color: T.dark }}>
                    {responses[0].name} —{' '}
                    <span style={{ color: attendanceColors[responses[0].attendance] ?? T.light, fontSize: '.875rem' }}>
                      {attendanceLabels[responses[0].attendance] ?? responses[0].attendance}
                    </span>
                  </p>
                </div>
                <p style={{ margin: '0 0 0 auto', fontSize: '.875rem', color: T.light, fontWeight: 500, flexShrink: 0 }}>
                  {stats.totalPeople} {stats.totalPeople === 1 ? 'persona' : 'personas'}
                </p>
              </div>
            )}

            {/* Lista phase: publicUrl display */}
            {phase === 'lista' && publicUrl && (
              <div style={{ marginBottom: '1.5rem', padding: '.875rem 1.125rem', background: T.white, border: `1px solid ${T.border}`, borderRadius: '1rem', fontSize: '.8rem', color: T.light, wordBreak: 'break-all', lineHeight: 1.5 }}>
                {publicUrl}
              </div>
            )}
          </>
        )}

        {/* Mode selector — configurando/lista */}
        {(phase === 'configurando' || phase === 'lista') && (
          <div id="configuracion" className="cc-card" style={{ padding: '1.25rem 1.25rem .875rem', marginBottom: '1.5rem' }}>
            <RsvpModeSelector
              invitationId={id}
              initialMode={rsvpMode}
              publicUrl={publicUrl ?? ''}
              eventTitle={eventTitle}
            />
          </div>
        )}

        {/* ── Stats ── */}
        {stats.total > 0 && phase !== 'configurando' && (
          <div id="mi-evento-metricas" className="stat-grid" style={{ marginBottom: '2rem' }}>
            <StatCard icon="👥" label="Confirmaron"   value={stats.total}       iconBg="#e3eeff" />
            <StatCard icon="✓"  label="Asistirán"     value={stats.yesCount}    iconBg="#e7f5ec" />
            <StatCard icon="✗"  label="No asistirán"  value={stats.noCount}     iconBg="#fbeaea" />
            <StatCard icon="👥" label="Asistentes"    value={stats.totalPeople} iconBg="#fbf5e3" />
          </div>
        )}

        {/* Empty state */}
        {stats.total === 0 && phase === 'lista' && (
          <div style={{ marginBottom: '2rem', padding: '1.25rem 1.5rem', background: T.white, border: `1px solid ${T.border}`, borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>📭</span>
            <p style={{ margin: 0, fontSize: '.9rem', color: T.light, lineHeight: 1.6 }}>
              Todavía nadie ha confirmado.{' '}
              <a href="#compartir" style={{ color: T.gold, fontWeight: 700, textDecoration: 'none' }}>
                Comparte tu invitación
              </a>{' '}
              para comenzar.
            </p>
          </div>
        )}

        {/* ── RSVP section ── */}
        {(phase === 'confirmaciones' || phase === 'semana' || phase === 'dia') && (
          <>
            {/* Section header */}
            <div id="mi-evento-invitados" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e3eeff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                  👥
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: T.dark }}>
                    Invitados confirmados
                  </h2>
                  <p style={{ margin: 0, fontSize: '.8rem', color: T.light }}>
                    {responses.length} {responses.length === 1 ? 'invitado' : 'invitados'}
                  </p>
                </div>
              </div>
              {/* QR button — right side, visible in semana/dia */}
              {(phase === 'semana' || phase === 'dia') && publicUrl && (
                <div style={{ flexShrink: 0 }}>
                  <QrCard publicUrl={publicUrl} eventSlug={eventSlug} />
                </div>
              )}
            </div>

            {responses.length === 0 ? (
              <div className="cc-card" style={{ padding: '2.5rem 1.5rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '2.25rem', marginBottom: '.75rem' }}>📭</div>
                <p style={{ margin: '0 0 .5rem', fontWeight: 700, color: T.dark, fontSize: '1rem' }}>Aún nadie ha confirmado</p>
                <p style={{ margin: '0 0 1.25rem', color: T.light, fontSize: '.875rem', lineHeight: 1.6 }}>
                  Cuando tus invitados respondan aparecerán aquí.
                </p>
                {(phase === 'confirmaciones' || phase === 'semana') && (
                  <a href="#compartir" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '.625rem 1.5rem', background: T.dark, color: '#fffdf9', borderRadius: '8px', fontSize: '.875rem', fontWeight: 700, textDecoration: 'none' }}>
                    Compartir invitación
                  </a>
                )}
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="rsvp-table-wrap cc-card" style={{ overflow: 'auto', marginBottom: '1.5rem' }}>
                  <table className="rsvp-table">
                    <thead>
                      <tr>
                        <th className="col-name">Nombre</th>
                        <th className="col-badge">Asistencia</th>
                        <th className="col-num">Acomp.</th>
                        <th className="col-num">Asistentes</th>
                        <th className="col-phone">Teléfono</th>
                        <th className="col-msg">Mensaje</th>
                        <th className="col-pass">Pase</th>
                        <th className="col-checkin">Entró</th>
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
                              <span style={{ padding: '.2rem .625rem', borderRadius: '2rem', fontSize: '.75rem', fontWeight: 700, color: attendanceColors[r.attendance] ?? T.light, background: attendanceBg[r.attendance] ?? '#fbf5e3', whiteSpace: 'nowrap' }}>
                                {attendanceLabels[r.attendance] ?? r.attendance}
                              </span>
                            </td>
                            <td className="col-num">{vComp}</td>
                            <td className="col-num" style={{ fontWeight: 600, color: isAttending(r) ? '#1a7a45' : T.light }}>
                              {ppl > 0 ? ppl : '—'}
                            </td>
                            <td className="col-phone">{r.phone ?? '—'}</td>
                            <td className="col-msg" style={{ fontSize: '.8125rem', fontStyle: r.message ? 'italic' : 'normal', color: T.light }}>
                              {r.message ? `"${r.message}"` : '—'}
                            </td>
                            <td className="col-pass">
                              {r.passToken ? (
                                <a href={`${appUrl}/pass/${r.passToken}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '.25rem', padding: '.3rem .625rem', background: r.checkedInAt ? '#e7f5ec' : T.bg, color: r.checkedInAt ? '#1a7a45' : T.dark, border: `1px solid ${r.checkedInAt ? '#b8dfc4' : T.border}`, borderRadius: '.5rem', fontSize: '.75rem', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                                  {r.checkedInAt ? '✓ Usado' : '🎫 Ver pase'}
                                </a>
                              ) : (
                                <span style={{ fontSize: '.75rem', color: T.light, opacity: 0.5 }}>—</span>
                              )}
                            </td>
                            <td className="col-checkin" style={{ color: r.checkedInAt ? '#1a7a45' : T.light }}>
                              {r.checkedInAt ? formatDateTime(r.checkedInAt) : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="rsvp-cards-wrap" style={{ marginBottom: '1.5rem' }}>
                  {responses.map((r) => <RsvpCard key={r.id} r={r} appUrl={appUrl} />)}
                </div>
              </>
            )}
          </>
        )}

        {/* Check-in dos columnas — 2 días antes y el día del evento */}
        {(phase === 'confirmaciones' || phase === 'semana' || phase === 'dia') &&
          daysUntilEvent !== null && daysUntilEvent <= 2 && daysUntilEvent >= 0 && (
          <div className="cc-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
            <p style={{ margin: '0 0 1rem', fontSize: '.65rem', fontWeight: 800, letterSpacing: '.22em', textTransform: 'uppercase', color: T.gold }}>
              Control de acceso
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <p style={{ margin: '0 0 .625rem', fontSize: '.8125rem', fontWeight: 700, color: '#1a7a45' }}>
                  ✅ Ya llegaron ({arrivedGuests.length})
                </p>
                {arrivedGuests.length === 0 ? (
                  <p style={{ margin: 0, fontSize: '.8rem', color: T.light, lineHeight: 1.5 }}>Aún no ha llegado nadie.</p>
                ) : (
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '.3rem' }}>
                    {arrivedGuests.map(r => (
                      <li key={r.id} style={{ fontSize: '.8125rem', color: T.dark, fontWeight: 500 }}>{r.name}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <p style={{ margin: '0 0 .625rem', fontSize: '.8125rem', fontWeight: 700, color: '#b43232' }}>
                  ⏳ Aún no llegan ({pendingGuests.length})
                </p>
                {pendingGuests.length === 0 ? (
                  <p style={{ margin: 0, fontSize: '.8rem', color: T.light, lineHeight: 1.5 }}>¡Todos han llegado!</p>
                ) : (
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '.3rem' }}>
                    {pendingGuests.map(r => (
                      <li key={r.id} style={{ fontSize: '.8125rem', color: T.dark, fontWeight: 500 }}>{r.name}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Mis invitados (GuestPassSection) ── */}
        {(phase === 'confirmaciones' || phase === 'semana' || phase === 'dia') && (
          <div id="mi-evento-pases">
            <GuestPassSection invitationId={id} appUrl={appUrl} eventTitle={eventTitle} publicUrl={publicUrl} />
          </div>
        )}

        {/* ── Compartir ── */}
        {publicUrl && (phase === 'lista' || phase === 'confirmaciones' || phase === 'semana') && (
          <div id="compartir" className="cc-card" style={{ padding: '1.5rem', marginTop: '2rem' }}>
            <p style={{ margin: '0 0 .875rem', fontSize: '.6875rem', fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: T.gold }}>
              Compartir invitación
            </p>
            <ShareButtons publicUrl={publicUrl} eventTitle={eventTitle} />
          </div>
        )}

        {/* QR — lista/confirmaciones (semana/dia → shown inline in RSVP header) */}
        {(phase === 'lista' || phase === 'confirmaciones') && publicUrl && (
          <div style={{ marginTop: '1.5rem' }}>
            <QrCard publicUrl={publicUrl} eventSlug={eventSlug} />
          </div>
        )}

        <div style={{ height: '2rem' }} />
      </div>

      <MiEventoTour />
    </main>
  );
}
