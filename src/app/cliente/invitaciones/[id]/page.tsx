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
import { CentroControlHelpButton } from './CentroControlHelpButton';
import { ChecklistCard } from './ChecklistCard';

export const dynamic  = 'force-dynamic';
export const revalidate = 0;
export const metadata: Metadata = { title: 'Dashboard de invitación — Kompralo' };

const T = {
  bg:     '#ffffff',
  card:   '#ffffff',
  dark:   '#1A1208',
  mid:    '#1A1208',
  light:  '#7A6A5B',
  gold:   '#C9A84C',
  border: '#E5D2A8',
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

function renderStyledTitle(title: string) {
  if (title.includes('&')) {
    const [left, right] = title.split('&');
    const leftTrimmed = left.trim();
    const name2 = right.trim();
    const preMatch = leftTrimmed.match(/^(.+?\bde\b\s+)(.+)$/i);
    const prefix = preMatch ? preMatch[1].trim() : null;
    const name1  = preMatch ? preMatch[2].trim() : leftTrimmed;
    const scriptSpan: React.CSSProperties = {
      fontFamily: 'var(--font-pinyon)',
      fontWeight: 'normal',
      color: T.dark,
      display: 'inline-block',
      lineHeight: 1.6,
      paddingTop: '0.1em',
      paddingBottom: '0.2em',
    };
    return (
      <>
        {prefix && (
          <span style={{ fontFamily: 'inherit', fontWeight: 700, fontSize: '0.4em', color: '#9B8878', display: 'block', letterSpacing: '0.18em', textTransform: 'uppercase', lineHeight: 1.4, marginBottom: '0.2em' }}>
            {prefix}
          </span>
        )}
        <span style={scriptSpan}>{name1}</span>
        <span style={{ ...scriptSpan, margin: '0 0.12em' }}>&</span>
        <span style={scriptSpan}>{name2}</span>
      </>
    );
  }
  return title;
}

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
      .db-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(26,18,8,0.06); }
      .db-btn:active { transform: translateY(0); box-shadow: none; }
      .db-stat-card { transition: transform .2s ease, box-shadow .2s ease; }
      .db-stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(26,18,8,0.04); }

      .cc-card {
        background: #ffffff;
        border: 1px solid #E5D2A8;
        border-radius: 1.25rem;
        box-shadow: 0 4px 20px rgba(26,18,8,0.02);
      }

      .cc-pill {
        display: inline-flex; align-items: center; gap: .35rem;
        padding: .45rem .875rem;
        border-radius: 2rem;
        font-size: .8125rem; font-weight: 600;
        text-decoration: none; cursor: pointer;
        border: 1px solid #E5D2A8; color: #1A1208;
        background: #ffffff;
        transition: all .15s;
        font-family: inherit;
      }
      .cc-pill:hover { background: #FAF6EB; border-color: #C9A84C; color: #B99752; }

      .stat-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
      }
      @media (min-width: 640px) {
        .stat-grid { grid-template-columns: repeat(4, 1fr); }
      }

      .event-actions-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: .75rem;
      }
      @media (min-width: 640px) {
        .event-actions-grid {
          grid-template-columns: 1fr 1fr;
        }
      }

      .rsvp-table { width: 100%; border-collapse: collapse; font-size: .875rem; table-layout: auto; }
      .rsvp-table th {
        padding: 1rem .75rem; text-align: left;
        font-size: .75rem; font-weight: 700;
        letter-spacing: .06em; text-transform: uppercase;
        color: #7A6A5B; border-bottom: 1px solid #E5D2A8;
        white-space: nowrap;
      }
      .rsvp-table td {
        padding: 1rem .75rem; border-bottom: 1px solid rgba(229,210,168,0.3);
        color: #1A1208; vertical-align: middle;
      }
      .rsvp-table tr:last-child td { border-bottom: none; }
      .rsvp-table tr:hover td { background: rgba(229,210,168,0.08); }

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
    `}</style>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sublabel, iconBg, iconColor, textColor }: { icon: React.ReactNode; label: string; value: number; sublabel: string; iconBg: string; iconColor: string; textColor: string }) {
  return (
    <div className="db-stat-card cc-card" style={{ padding: '1.25rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #E5D2A8', borderRadius: '1rem', background: '#FFFFFF', boxShadow: '0 4px 12px rgba(26,18,8,0.02)' }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        background: iconBg, color: iconColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.25rem', flexShrink: 0,
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
      background: '#FFFFFF',
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
        borderBottom: '1px solid #E5D2A8',
        background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <Link href="/cliente" style={{ fontSize: '.75rem', fontWeight: 800, letterSpacing: '.2em', textTransform: 'uppercase', color: T.dark, textDecoration: 'none' }}>
            ← Mis invitaciones
          </Link>
          <CentroControlHelpButton />
        </div>
        <SignOutButton style={{ fontSize: '.8125rem', color: T.light, fontWeight: 500 }}>
          Cerrar sesión
        </SignOutButton>
      </nav>

      <div style={{ maxWidth: '860px', margin: '2rem auto 0', position: 'relative', zIndex: 2 }}>

        {/* ── Header ── */}
        <section id="tour-header" style={{ marginBottom: '2.5rem', position: 'relative' }}>
          <p style={{ fontSize: '.75rem', fontWeight: 800, letterSpacing: '.25em', color: '#B99752', textTransform: 'uppercase', margin: '0 0 .5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            👑 CENTRO DE CONTROL
          </p>
          <h1 style={{ fontSize: 'clamp(2.25rem, 6vw, 3.25rem)', fontWeight: 700, color: T.dark, margin: '0 0 .5rem', fontFamily: 'var(--font-playfair, Georgia, serif)', lineHeight: 1.6, overflow: 'visible' }}>
            {renderStyledTitle(eventTitle)}
          </h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1.25rem', fontSize: '0.9rem', color: T.light, fontWeight: 500 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#B99752' }}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>{eventDate}</span>
          </div>

          {/* 4 pill actions */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.625rem', alignItems: 'center' }}>
            {publicUrl && (
              <a
                id="tour-btn-ver"
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cc-pill db-btn"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.5rem 1.25rem', borderRadius: '9999px',
                  border: '1px solid #E5D2A8', background: '#FFFFFF',
                  color: '#1A1208', fontSize: '0.85rem', fontWeight: 600,
                  textDecoration: 'none', transition: 'all 0.2s',
                  boxShadow: '0 2px 6px rgba(26,18,8,0.02)'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                Ver invitación
              </a>
            )}
            {stats.total > 0 && (
              <a
                id="tour-btn-stats"
                href="#tour-stats-row"
                className="cc-pill db-btn"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.5rem 1.25rem', borderRadius: '9999px',
                  border: '1px solid #E5D2A8', background: '#FFFFFF',
                  color: '#1A1208', fontSize: '0.85rem', fontWeight: 600,
                  textDecoration: 'none', transition: 'all 0.2s',
                  boxShadow: '0 2px 6px rgba(26,18,8,0.02)'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                Estadísticas
              </a>
            )}
            <span
              id="tour-btn-plan"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.5rem 1.25rem', borderRadius: '9999px',
                border: '1px solid #EAD7A3', background: '#FAF6EB',
                color: '#B99752', fontSize: '0.85rem', fontWeight: 700,
                boxShadow: '0 2px 6px rgba(26,18,8,0.02)'
              }}
            >
              👑 Plan {planLabel}
            </span>
          </div>
        </section>

        {/* ── Checklist de inicio ── */}
        {phase === 'configurando' && (
          <ChecklistCard
            slug={inv.slug}
            publishedAt={inv.published_at}
            rsvpMode={inv.rsvp_mode}
            rsvpTotal={stats.total}
            eventDate={inv.event_date}
            editUrl={editUrl}
            publicUrl={publicUrl}
            planId={inv.plan_id}
          />
        )}

        {/* ════════════════════════════════════════════════
            ESTADO 5 — DÍA DEL EVENTO
        ════════════════════════════════════════════════ */}
        {(phase === 'semana' || phase === 'dia') && (
          <>
            <div className="cc-card" style={{ background: '#1A1208', border: '1px solid rgba(201,169,110,0.25)', padding: 'clamp(1.75rem,5vw,2.5rem)', marginBottom: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '.875rem' }}>🎉</div>
              <h2 style={{ margin: '0 0 .75rem', fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', fontWeight: 700, color: '#fffdf9', fontFamily: 'var(--font-playfair, Georgia, serif)', lineHeight: 1.08 }}>
                Hoy es tu gran día
              </h2>
              <p style={{ margin: '0 auto 1.75rem', color: 'rgba(255,253,249,0.65)', fontSize: '.9375rem', lineHeight: 1.7, maxWidth: '440px' }}>
                Todo está listo. Controla la entrada de tus invitados y sigue las confirmaciones en tiempo real.
              </p>
              {publicUrl && (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="db-btn"
                    style={{
                      background: '#C9A96E', color: '#1a1a1a',
                      border: 'none', borderRadius: '8px',
                      padding: '0.75rem 1.5rem', fontWeight: 600,
                      fontSize: '0.95rem', cursor: 'pointer',
                      textDecoration: 'none', display: 'inline-block',
                    }}
                  >
                    Ver invitación
                  </a>
                </div>
              )}
            </div>

            {/* Control de acceso */}
            <div className="cc-card" id="tour-control-evento" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
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
            <div id="tour-countdown" className="cc-card" style={{ padding: '1.5rem 1.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', background: '#FAF6EB', border: '1px solid #EAD7A3', borderRadius: '1.25rem', boxShadow: '0 4px 20px rgba(26,18,8,0.03)' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FFFFFF', border: '1px solid #EAD7A3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', flexShrink: 0, boxShadow: '0 2px 8px rgba(185,151,82,0.08)' }} className="text-[#C9A84C]">
                ⏳
              </div>
              <div>
                <p style={{ margin: '0 0 .25rem', fontSize: '.75rem', fontWeight: 800, letterSpacing: '.2em', textTransform: 'uppercase', color: '#B99752' }}>
                  Ya casi llega el gran día
                </p>
                <p style={{ margin: '0 0 .25rem', fontSize: '1.5rem', fontWeight: 800, color: T.dark, fontFamily: 'var(--font-playfair, Georgia, serif)' }}>
                  {(daysUntilEvent ?? 0) === 1 ? 'Mañana es tu boda.' : `Faltan ${daysUntilEvent} días.`}
                </p>
                <p style={{ margin: 0, fontSize: '.8125rem', color: T.light, lineHeight: 1.55 }}>
                  Todo está listo. Revisa las últimas confirmaciones y prepara los pases de entrada.
                </p>
              </div>
              <div style={{ marginLeft: 'auto', flexShrink: 0 }} className="hidden sm:flex">
                <img
                  src="/images/invitaciones/invitation-paper-detail.webp"
                  alt="Miniatura invitación"
                  style={{ width: 72, height: 72, borderRadius: '0.625rem', objectFit: 'cover', border: '1px solid #EAD7A3', display: 'block' }}
                />
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
          <div id="tour-stats-row" className="stat-grid" style={{ marginBottom: '2rem' }}>
            <StatCard
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>}
              label="Confirmaron"
              value={stats.total}
              sublabel="respondieron a la invitación"
              iconBg="#E7F5EC"
              iconColor="#1A7A45"
              textColor="#1A7A45"
            />
            <StatCard
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>}
              label="Asistirán"
              value={stats.yesCount}
              sublabel="confirmaciones positivas"
              iconBg="#E7F5EC"
              iconColor="#1A7A45"
              textColor="#1A7A45"
            />
            <StatCard
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>}
              label="No asistirán"
              value={stats.noCount}
              sublabel="declinaron la invitación"
              iconBg="#FBEAEA"
              iconColor="#B43232"
              textColor="#B43232"
            />
            <StatCard
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>}
              label="Asistentes"
              value={stats.totalPeople}
              sublabel="personas en total"
              iconBg="#FAF6EB"
              iconColor="#C9A84C"
              textColor="#B99752"
            />
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
            <div id="tour-tabla-confirmados" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#FAF6EB', border: '1px solid #EAD7A3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B99752', flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: T.dark, fontFamily: 'var(--font-playfair, Georgia, serif)' }}>
                    Invitados confirmados
                  </h2>
                  <p style={{ margin: 0, fontSize: '.8rem', color: T.light }}>
                    {responses.length} {responses.length === 1 ? 'invitado' : 'invitados'}
                  </p>
                </div>
              </div>
              {/* QR button — right side, always visible if publicUrl is present */}
              {publicUrl && (
                <div id="tour-btn-qr" style={{ flexShrink: 0 }}>
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
                        <th className="col-name">NOMBRE</th>
                        <th className="col-badge">ASISTENCIA</th>
                        <th className="col-num">ACOMP.</th>
                        <th className="col-num">ASISTENTES</th>
                        <th className="col-phone">TELÉFONO</th>
                        <th className="col-msg">MENSAJE</th>
                        <th className="col-pass">PASE</th>
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
                              <span style={{ padding: '.35rem .75rem', borderRadius: '2rem', fontSize: '.75rem', fontWeight: 700, color: attendanceColors[r.attendance] ?? T.light, background: attendanceBg[r.attendance] ?? '#fbf5e3', whiteSpace: 'nowrap' }}>
                                {attendanceLabels[r.attendance] ?? r.attendance}
                              </span>
                            </td>
                            <td className="col-num">{vComp}</td>
                            <td className="col-num" style={{ fontWeight: 700, color: isAttending(r) ? '#1a7a45' : T.light }}>
                              {ppl > 0 ? ppl : '—'}
                            </td>
                            <td className="col-phone">{r.phone ?? '—'}</td>
                            <td className="col-msg" style={{ fontSize: '.8125rem', fontStyle: r.message ? 'italic' : 'normal', color: T.light }}>
                              {r.message ? `"${r.message}"` : '—'}
                            </td>
                            <td className="col-pass">
                              {r.passToken ? (
                                <a href={`${appUrl}/pass/${r.passToken}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '.35rem', padding: '0.375rem 0.75rem', background: 'transparent', color: '#B99752', border: '1px solid #EAD7A3', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }} className="hover:bg-[#FAF6EB]">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h6v6H3V3zm2 2v2h2V5H5zm8-2h6v6h-6V3zm2 2v2h2V5h-2zM3 13h6v6H3v-6zm2 2v2h2v-2H5zm13-2h2v2h-2v-2zm-4 0h2v2h-2v-2zm4 4h2v4h-6v-2h2v-2h2zm-4 2h2v2h-2v-2z"/></svg>
                                  Ver pase
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
                <div className="rsvp-cards-wrap" style={{ marginBottom: '1.5rem' }}>
                  {responses.map((r) => <RsvpCard key={r.id} r={r} appUrl={appUrl} />)}
                </div>
              </>
            )}
          </>
        )}

        {/* ── Mis invitados (GuestPassSection) ── */}
        {(phase === 'confirmaciones' || phase === 'semana' || phase === 'dia'
          || rsvpMode === 'passes_only') && (
          <div id="tour-mis-invitados">
            <GuestPassSection invitationId={id} appUrl={appUrl} eventTitle={eventTitle} publicUrl={publicUrl} />
          </div>
        )}

        {/* ── Compartir ── */}
        {publicUrl && (phase === 'lista' || phase === 'confirmaciones' || phase === 'semana') && (
          <div id="compartir" className="cc-card" style={{ padding: '1.5rem', marginTop: '2rem' }}>
            {/* Opción A — Con pase personalizado (destacada) */}
            <div style={{
              background: '#f9f5ee',
              border: '1px solid #C9A96E',
              borderRadius: '10px',
              padding: '1rem 1.25rem',
              marginBottom: '1rem',
            }}>
              <p style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1a1a1a', margin: '0 0 0.25rem' }}>
                ✨ Envía invitación + pase personalizado
              </p>
              <p style={{ fontSize: '0.8rem', color: '#666', margin: '0 0 0.75rem', lineHeight: 1.55 }}>
                Desde la sección &ldquo;Mis invitados&rdquo; puedes enviar a cada familia su invitación junto con su pase de acceso personalizado por WhatsApp.
              </p>
              <a
                href="#tour-mis-invitados"
                style={{
                  display: 'inline-block',
                  background: '#1a1a1a',
                  color: '#fff',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  textDecoration: 'none',
                  fontWeight: 700,
                }}
              >
                Ir a Mis invitados →
              </a>
            </div>

            {/* Separador */}
            <p style={{ fontSize: '0.75rem', color: '#999', textAlign: 'center', margin: '0.75rem 0' }}>
              O comparte la invitación general (sin pase)
            </p>

            {/* Opción B — ShareButtons */}
            <ShareButtons publicUrl={publicUrl} eventTitle={eventTitle} />
          </div>
        )}

        <div style={{ height: '2rem' }} />
      </div>

      <MiEventoTour />
    </main>
  );
}
