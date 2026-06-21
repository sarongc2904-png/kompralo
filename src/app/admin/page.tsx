import type { Metadata } from 'next';
import Link from 'next/link';
import { requireAdmin } from '@/lib/admin';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Resumen — Admin Kompralo' };

function fmt(cents: number | null, currency = 'MXN'): string {
  const n = cents ?? 0;
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency, minimumFractionDigits: 0 }).format(n / 100);
}

function fmtShort(iso: string): string {
  try {
    return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
  } catch { return iso; }
}

const STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  paid:            { bg: '#DCFCE7', color: '#16A34A', label: 'Pagado' },
  published:       { bg: '#D1FAE5', color: '#059669', label: 'Publicado' },
  draft:           { bg: '#FEF3C7', color: '#D97706', label: 'Borrador' },
  pending:         { bg: '#FEF9C3', color: '#CA8A04', label: 'Pendiente' },
  pending_payment: { bg: '#FEF3C7', color: '#D97706', label: 'Pend. pago' },
  failed:          { bg: '#FEE2E2', color: '#DC2626', label: 'Fallido' },
  refunded:        { bg: '#F3F4F6', color: '#6B7280', label: 'Reembolsado' },
  cancelled:       { bg: '#FEE2E2', color: '#DC2626', label: 'Cancelado' },
  archived:        { bg: '#F3F4F6', color: '#6B7280', label: 'Archivado' },
};

const PLAN_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  basic:   { bg: '#DBEAFE', color: '#2563EB', label: 'Elegante' },
  premium: { bg: '#EDE9FE', color: '#7C3AED', label: 'Sin Caos' },
  deluxe:  { bg: '#FEF3C7', color: '#B45309', label: 'Premium' },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_BADGE[status] ?? { bg: '#F3F4F6', color: '#6B7280', label: status };
  return (
    <span style={{ display: 'inline-block', background: s.bg, color: s.color, fontSize: '.7rem', fontWeight: 700, padding: '.2rem .6rem', borderRadius: 20, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const p = PLAN_BADGE[plan] ?? { bg: '#F3F4F6', color: '#6B7280', label: plan };
  return (
    <span style={{ display: 'inline-block', background: p.bg, color: p.color, fontSize: '.7rem', fontWeight: 700, padding: '.2rem .6rem', borderRadius: 20, whiteSpace: 'nowrap' }}>
      {p.label}
    </span>
  );
}

export default async function AdminDashboardPage() {
  await requireAdmin();
  const svc = createServiceRoleSupabaseClient();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekStart  = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [ordersRes, invRes, usersRes, logsRes, recentOrdersRes, recentInvRes] = await Promise.all([
    svc.from('orders').select('id, status, plan_id, amount_total, currency, confirmation_email_sent_at, confirmation_email_error, invitation_id, created_at'),
    svc.from('invitations').select('id, status, user_id, customer_email, created_at'),
    svc.from('users').select('id', { count: 'exact', head: true }),
    svc.from('admin_audit_logs').select('id', { count: 'exact', head: true }),
    svc.from('orders').select('id, status, plan_id, amount_total, currency, customer_email, customer_name, invitation_id, created_at').order('created_at', { ascending: false }).limit(5),
    svc.from('invitations').select('id, slug, title, status, plan_id, customer_email, created_at').order('created_at', { ascending: false }).limit(5),
  ]);

  const orders       = (ordersRes.data ?? []) as Record<string, unknown>[];
  const invitations  = (invRes.data    ?? []) as Record<string, unknown>[];
  const recentOrders = (recentOrdersRes.data ?? []) as Record<string, unknown>[];
  const recentInvs   = (recentInvRes.data    ?? []) as Record<string, unknown>[];
  const userCount    = usersRes.count ?? 0;
  const logCount     = logsRes.count  ?? 0;

  const paid   = orders.filter(o => o.status === 'paid');
  const failed = orders.filter(o => o.status === 'failed');

  const totalRev = paid.reduce((s, o) => s + (Number(o.amount_total) || 0), 0);
  const todayRev = paid.filter(o => (o.created_at as string) >= todayStart).reduce((s, o) => s + (Number(o.amount_total) || 0), 0);
  const weekRev  = paid.filter(o => (o.created_at as string) >= weekStart).reduce((s, o) => s + (Number(o.amount_total) || 0), 0);
  const monthRev = paid.filter(o => (o.created_at as string) >= monthStart).reduce((s, o) => s + (Number(o.amount_total) || 0), 0);

  const basicPaid   = paid.filter(o => o.plan_id === 'basic');
  const premiumPaid = paid.filter(o => o.plan_id === 'gold' || o.plan_id === 'premium');
  const deluxePaid  = paid.filter(o => o.plan_id === 'deluxe');

  const basicRev   = basicPaid.reduce((s, o) => s + (Number(o.amount_total) || 0), 0);
  const premiumRev = premiumPaid.reduce((s, o) => s + (Number(o.amount_total) || 0), 0);
  const deluxeRev  = deluxePaid.reduce((s, o) => s + (Number(o.amount_total) || 0), 0);

  const emailsSent     = orders.filter(o => !!o.confirmation_email_sent_at).length;
  const emailsErr      = orders.filter(o => !!o.confirmation_email_error).length;
  const activeInvs     = invitations.filter(i => i.status === 'paid' || i.status === 'published').length;
  const orphanedOrders = paid.filter(o => !o.invitation_id).length;
  const unownedInvs    = invitations.filter(i => !i.user_id && !!i.customer_email).length;

  const currency      = (paid[0]?.currency as string | undefined)?.toUpperCase() ?? 'MXN';
  const totalPaid     = paid.length;
  const basicPct      = totalPaid > 0 ? Math.round((basicPaid.length   / totalPaid) * 100) : 0;
  const premiumPct    = totalPaid > 0 ? Math.round((premiumPaid.length / totalPaid) * 100) : 0;
  const deluxePct     = totalPaid > 0 ? Math.round((deluxePaid.length  / totalPaid) * 100) : 0;

  const totalAlerts = emailsErr + orphanedOrders + unownedInvs;

  return (
    <div style={{ maxWidth: 1200 }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontSize: '.65rem', fontWeight: 800, letterSpacing: '.22em', textTransform: 'uppercase', color: '#C9A45C', margin: '0 0 .375rem' }}>
            Centro de operaciones
          </p>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#1A1510', margin: '0 0 .25rem', lineHeight: 1.2 }}>
            Resumen general
          </h1>
          <p style={{ fontSize: '.8125rem', color: '#766B60', margin: 0 }}>
            Estado de ventas, invitaciones y operación de KOMPRALO
          </p>
        </div>
        <div style={{ display: 'flex', gap: '.625rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <Link href="/admin/invitations/new" style={{ ...quickBtn, background: '#17120E', color: '#F5F0E8' }}>
            + Crear invitación
          </Link>
          <Link href="/admin/recovery" style={{ ...quickBtn, background: '#fff', color: '#1A1510', border: '1px solid #E0DBD4' }}>
            Recuperar compra
          </Link>
          <Link href="/admin/orders" style={{ ...quickBtn, background: '#fff', color: '#1A1510', border: '1px solid #E0DBD4' }}>
            Ver órdenes
          </Link>
        </div>
      </div>

      {/* Hero status card */}
      <div style={{
        background: 'linear-gradient(135deg, #1F1712 0%, #2E1E12 50%, #1A140E 100%)',
        borderRadius: 16,
        padding: '2rem 2.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '2rem',
        flexWrap: 'wrap',
        boxShadow: '0 4px 24px rgba(23,18,14,0.18)',
      }}>
        <div>
          <span style={{
            display: 'inline-block',
            background: 'rgba(201,164,92,0.2)',
            color: '#C9A45C',
            fontSize: '.6rem',
            fontWeight: 800,
            letterSpacing: '.2em',
            textTransform: 'uppercase',
            padding: '.25rem .75rem',
            borderRadius: 20,
            marginBottom: '.75rem',
          }}>
            Producción
          </span>
          <p style={{ fontSize: '.75rem', color: 'rgba(255,255,255,0.5)', margin: '0 0 .375rem', letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 600 }}>
            Ingresos totales
          </p>
          <p style={{ fontSize: '2.5rem', fontWeight: 900, color: '#F5F0E8', margin: '0 0 .375rem', lineHeight: 1 }}>
            {fmt(totalRev, currency)}
          </p>
          <p style={{ fontSize: '.8rem', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
            {totalPaid} órdenes pagadas · {invitations.length} invitaciones creadas
          </p>
        </div>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Este mes', value: fmt(monthRev, currency) },
            { label: 'Esta semana', value: fmt(weekRev, currency) },
            { label: 'Inv. activas', value: String(activeInvs) },
            { label: 'Emails error', value: String(emailsErr), alert: emailsErr > 0 },
          ].map(({ label, value, alert }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 .25rem', fontSize: '.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 600 }}>
                {label}
              </p>
              <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: alert ? '#FCA5A5' : 'rgba(255,255,255,0.9)' }}>
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {totalAlerts > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <SectionLabel>Alertas y pendientes</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.625rem' }}>
            {emailsErr > 0 && (
              <AlertCard
                tone="danger"
                title={`${emailsErr} email${emailsErr > 1 ? 's' : ''} de confirmación con error`}
                description="Las órdenes afectadas no recibieron su email de bienvenida."
                action={<Link href="/admin/orders?email_error=1" style={alertAction}>Ver órdenes afectadas →</Link>}
              />
            )}
            {orphanedOrders > 0 && (
              <AlertCard
                tone="warning"
                title={`${orphanedOrders} orden${orphanedOrders > 1 ? 'es' : ''} pagada sin invitación asociada`}
                description="La orden fue cobrada pero no generó una invitación. Puede requerir creación manual."
                action={<Link href="/admin/orders" style={alertAction}>Revisar órdenes →</Link>}
              />
            )}
            {unownedInvs > 0 && (
              <AlertCard
                tone="info"
                title={`${unownedInvs} invitación${unownedInvs > 1 ? 'es' : ''} sin propietario (user_id nulo)`}
                description="Tienen email de cliente pero no están vinculadas a ninguna cuenta."
                action={<Link href="/admin/invitations" style={alertAction}>Ver invitaciones →</Link>}
              />
            )}
          </div>
        </div>
      )}

      {/* Revenue metrics */}
      <SectionLabel>Ingresos</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <MetricCard label="Total histórico" value={fmt(totalRev, currency)} sub={`${totalPaid} órdenes pagadas`} tone="premium" />
        <MetricCard label="Este mes"         value={fmt(monthRev, currency)} sub={`${paid.filter(o => (o.created_at as string) >= monthStart).length} ventas`} />
        <MetricCard label="Últimos 7 días"   value={fmt(weekRev, currency)}  sub={`${paid.filter(o => (o.created_at as string) >= weekStart).length} ventas`} />
        <MetricCard label="Hoy"              value={fmt(todayRev, currency)} sub={`${paid.filter(o => (o.created_at as string) >= todayStart).length} ventas`} />
      </div>

      {/* Operations metrics */}
      <SectionLabel>Operación</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <MetricCard label="Órdenes pagadas"    value={paid.length}   sub="total histórico"  tone="success" />
        <MetricCard label="Órdenes fallidas"   value={failed.length} sub="failed / refunded" tone={failed.length > 0 ? 'danger' : 'default'} />
        <MetricCard label="Inv. activas"       value={activeInvs}    sub="paid + published"  tone="success" />
        <MetricCard label="Emails con error"   value={emailsErr}     sub={`${emailsSent} enviados`} tone={emailsErr > 0 ? 'danger' : 'default'} />
        <MetricCard label="Usuarios"           value={userCount}     sub="en auth.users" />
        <MetricCard label="Logs de auditoría"  value={logCount}      sub="acciones admin" />
      </div>

      {/* Plan breakdown */}
      <SectionLabel>Ventas por plan</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <PlanCard
          label="Invitación Elegante"
          sublabel="basic"
          count={basicPaid.length}
          revenue={basicRev}
          currency={currency}
          pct={basicPct}
          color="#2563EB"
          bgColor="#DBEAFE"
        />
        <PlanCard
          label="Organización Sin Caos"
          sublabel="premium"
          count={premiumPaid.length}
          revenue={premiumRev}
          currency={currency}
          pct={premiumPct}
          color="#7C3AED"
          bgColor="#EDE9FE"
        />
        <PlanCard
          label="Experiencia Premium Total"
          sublabel="deluxe"
          count={deluxePaid.length}
          revenue={deluxeRev}
          currency={currency}
          pct={deluxePct}
          color="#B45309"
          bgColor="#FEF3C7"
        />
      </div>

      {/* Recent activity */}
      <SectionLabel>Actividad reciente</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>

        {/* Recent orders */}
        <div style={{ background: '#fff', border: '1px solid #E8E4DE', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '.875rem 1.25rem', borderBottom: '1px solid #F0EDE8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ margin: 0, fontSize: '.75rem', fontWeight: 700, color: '#1A1510', textTransform: 'uppercase', letterSpacing: '.1em' }}>Últimas órdenes</p>
            <Link href="/admin/orders" style={{ fontSize: '.7rem', color: '#C9A45C', textDecoration: 'none', fontWeight: 600 }}>Ver todas →</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p style={{ padding: '1.5rem', textAlign: 'center', color: '#B0A898', fontSize: '.8125rem', margin: 0 }}>Sin órdenes</p>
          ) : (
            recentOrders.map((o) => (
              <div key={o.id as string} style={{ padding: '.75rem 1.25rem', borderBottom: '1px solid #F7F4F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '.75rem' }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: '0 0 .2rem', fontSize: '.8rem', color: '#1A1510', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {(o.customer_email as string) ?? '—'}
                  </p>
                  <p style={{ margin: 0, fontSize: '.7rem', color: '#B0A898' }}>{fmtShort(o.created_at as string)}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexShrink: 0 }}>
                  <PlanBadge plan={o.plan_id as string} />
                  <StatusBadge status={o.status as string} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Recent invitations */}
        <div style={{ background: '#fff', border: '1px solid #E8E4DE', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '.875rem 1.25rem', borderBottom: '1px solid #F0EDE8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ margin: 0, fontSize: '.75rem', fontWeight: 700, color: '#1A1510', textTransform: 'uppercase', letterSpacing: '.1em' }}>Últimas invitaciones</p>
            <Link href="/admin/invitations" style={{ fontSize: '.7rem', color: '#C9A45C', textDecoration: 'none', fontWeight: 600 }}>Ver todas →</Link>
          </div>
          {recentInvs.length === 0 ? (
            <p style={{ padding: '1.5rem', textAlign: 'center', color: '#B0A898', fontSize: '.8125rem', margin: 0 }}>Sin invitaciones</p>
          ) : (
            recentInvs.map((inv) => (
              <div key={inv.id as string} style={{ padding: '.75rem 1.25rem', borderBottom: '1px solid #F7F4F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '.75rem' }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: '0 0 .2rem', fontSize: '.8rem', color: '#1A1510', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {(inv.title as string) || (inv.customer_email as string) || '—'}
                  </p>
                  <p style={{ margin: 0, fontSize: '.7rem', color: '#B0A898', fontFamily: 'monospace' }}>/{inv.slug as string}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexShrink: 0 }}>
                  <PlanBadge plan={inv.plan_id as string} />
                  <StatusBadge status={inv.status as string} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick actions */}
      <SectionLabel>Acciones rápidas</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
        {[
          { href: '/admin/invitations/new', label: 'Crear invitación manual', desc: 'Sin pasar por Stripe', icon: '+', color: '#17120E' },
          { href: '/admin/recovery',        label: 'Recuperar compra',       desc: 'Reenviar acceso a cliente', icon: '↺', color: '#7C3AED' },
          { href: '/admin/orders',          label: 'Gestionar órdenes',      desc: `${orders.length} total`, icon: '◫', color: '#2563EB' },
          { href: '/admin/invitations',     label: 'Ver invitaciones',       desc: `${invitations.length} total`, icon: '✉', color: '#059669' },
          { href: '/admin/users',           label: 'Ver usuarios',           desc: `${userCount} registrados`, icon: '◎', color: '#D97706' },
          { href: '/admin/logs',            label: 'Audit logs',             desc: `${logCount} registros`, icon: '≡', color: '#6B7280' },
        ].map(({ href, label, desc, icon, color }) => (
          <Link key={href} href={href} style={{ textDecoration: 'none' }}>
            <div style={{
              background: '#fff',
              border: '1px solid #E8E4DE',
              borderRadius: 12,
              padding: '1.125rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              transition: 'border-color 0.12s, box-shadow 0.12s',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: color + '14',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.125rem', color,
                flexShrink: 0,
              }}>
                {icon}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: '0 0 .125rem', fontSize: '.875rem', fontWeight: 700, color: '#1A1510' }}>{label}</p>
                <p style={{ margin: 0, fontSize: '.75rem', color: '#B0A898' }}>{desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}

/* ─── Reusable components ─── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: '.65rem',
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '.18em',
      color: '#B0A898',
      margin: '0 0 .75rem',
    }}>
      {children}
    </p>
  );
}

function MetricCard({ label, value, sub, tone = 'default' }: {
  label: string;
  value: string | number;
  sub?: string;
  tone?: 'default' | 'premium' | 'success' | 'danger';
}) {
  const isPremium = tone === 'premium';
  const isSuccess = tone === 'success';
  const isDanger  = tone === 'danger';

  const bg      = isPremium ? '#1A1510' : '#fff';
  const border  = isPremium ? 'none'   : `1px solid ${isDanger ? '#FECACA' : '#E8E4DE'}`;
  const lblClr  = isPremium ? '#C9A45C' : isDanger ? '#DC2626' : '#B0A898';
  const valClr  = isPremium ? '#F5F0E8' : isDanger ? '#DC2626' : isSuccess ? '#16A34A' : '#1A1510';
  const subClr  = isPremium ? 'rgba(255,255,255,0.4)' : '#B0A898';

  return (
    <div style={{
      background: bg,
      border,
      borderRadius: 12,
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '.25rem',
    }}>
      <p style={{ fontSize: '.65rem', textTransform: 'uppercase', letterSpacing: '.14em', color: lblClr, margin: 0, fontWeight: 700 }}>
        {label}
      </p>
      <p style={{ fontSize: '1.75rem', fontWeight: 900, color: valClr, margin: 0, lineHeight: 1.1 }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: '.7rem', color: subClr, margin: 0 }}>{sub}</p>}
    </div>
  );
}

function PlanCard({ label, sublabel, count, revenue, currency, pct, color, bgColor }: {
  label: string;
  sublabel: string;
  count: number;
  revenue: number;
  currency: string;
  pct: number;
  color: string;
  bgColor: string;
}) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E8E4DE', borderRadius: 12, padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem', marginBottom: '.75rem' }}>
        <span style={{
          display: 'inline-block',
          background: bgColor,
          color,
          fontSize: '.65rem',
          fontWeight: 800,
          padding: '.2rem .6rem',
          borderRadius: 20,
          textTransform: 'uppercase',
          letterSpacing: '.1em',
        }}>
          {sublabel}
        </span>
      </div>
      <p style={{ margin: '0 0 .125rem', fontSize: '.8125rem', fontWeight: 700, color: '#1A1510' }}>{label}</p>
      <p style={{ margin: '0 0 .875rem', fontSize: '1.5rem', fontWeight: 900, color }}>
        {count} <span style={{ fontSize: '.9rem', color: '#B0A898', fontWeight: 400 }}>vendidas</span>
      </p>
      <p style={{ margin: '0 0 .5rem', fontSize: '.75rem', color: '#766B60' }}>
        {new Intl.NumberFormat('es-MX', { style: 'currency', currency, minimumFractionDigits: 0 }).format(revenue / 100)} ingresos
      </p>
      {/* Progress bar */}
      <div style={{ background: '#F0EDE8', borderRadius: 99, height: 6, overflow: 'hidden' }}>
        <div style={{ background: color, width: `${pct}%`, height: '100%', borderRadius: 99, transition: 'width 0.4s' }} />
      </div>
      <p style={{ margin: '.375rem 0 0', fontSize: '.7rem', color: '#B0A898' }}>{pct}% de las ventas</p>
    </div>
  );
}

function AlertCard({ tone, title, description, action }: {
  tone: 'danger' | 'warning' | 'info';
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  const styles = {
    danger:  { bg: '#FEF2F2', border: '#FECACA', icon: '⚠', iconColor: '#DC2626', titleColor: '#B91C1C' },
    warning: { bg: '#FFFBEB', border: '#FDE68A', icon: '⚠', iconColor: '#D97706', titleColor: '#B45309' },
    info:    { bg: '#EFF6FF', border: '#BFDBFE', icon: 'ℹ', iconColor: '#2563EB', titleColor: '#1D4ED8' },
  }[tone];

  return (
    <div style={{
      background: styles.bg,
      border: `1px solid ${styles.border}`,
      borderRadius: 10,
      padding: '.875rem 1.125rem',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '.875rem',
    }}>
      <span style={{ fontSize: '1rem', color: styles.iconColor, flexShrink: 0, marginTop: '1px' }}>{styles.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: '0 0 .2rem', fontSize: '.875rem', fontWeight: 700, color: styles.titleColor }}>{title}</p>
        <p style={{ margin: 0, fontSize: '.8rem', color: '#4B5563' }}>{description}</p>
        {action && <div style={{ marginTop: '.5rem' }}>{action}</div>}
      </div>
    </div>
  );
}

const quickBtn: React.CSSProperties = {
  padding: '.5rem 1rem',
  borderRadius: 8,
  fontSize: '.8125rem',
  fontWeight: 600,
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  cursor: 'pointer',
  border: 'none',
};

const alertAction: React.CSSProperties = {
  fontSize: '.8rem',
  fontWeight: 600,
  color: '#1D4ED8',
  textDecoration: 'none',
};
