import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/admin';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Resumen — Admin Kompralo' };

function fmt(cents: number | null, currency = 'MXN'): string {
  const n = cents ?? 0;
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency, minimumFractionDigits: 0 }).format(n / 100);
}

function MetricCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div style={{
      background: accent ? '#1a1610' : '#ffffff',
      border: '1px solid #e5e2dc',
      borderRadius: 12, padding: '1.25rem',
      display: 'flex', flexDirection: 'column', gap: '.25rem',
    }}>
      <p style={{ fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.12em', color: accent ? '#C4A962' : '#8a8580', margin: 0, fontWeight: 600 }}>
        {label}
      </p>
      <p style={{ fontSize: '1.75rem', fontWeight: 800, color: accent ? '#f1e3c8' : '#1a1610', margin: 0, lineHeight: 1.1 }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: '.75rem', color: accent ? '#c4a47a' : '#8a8580', margin: 0 }}>{sub}</p>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: '.75rem', textTransform: 'uppercase', letterSpacing: '.15em', color: '#8a8580', fontWeight: 700, margin: '2rem 0 .875rem' }}>
      {children}
    </h2>
  );
}

export default async function AdminDashboardPage() {
  await requireAdmin();
  const svc = createServiceRoleSupabaseClient();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekStart  = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [ordersRes, invRes, usersRes, logsRes] = await Promise.all([
    svc.from('orders').select('id, status, plan_id, amount_total, currency, confirmation_email_sent_at, confirmation_email_error, created_at'),
    svc.from('invitations').select('id, status, created_at'),
    svc.from('users').select('id', { count: 'exact', head: true }),
    svc.from('admin_audit_logs').select('id', { count: 'exact', head: true }),
  ]);

  const orders     = ordersRes.data ?? [];
  const invitations = invRes.data   ?? [];
  const userCount  = usersRes.count ?? 0;

  const paid       = orders.filter(o => o.status === 'paid');
  const failed     = orders.filter(o => o.status === 'failed');

  const totalRev   = paid.reduce((s, o) => s + (o.amount_total ?? 0), 0);
  const todayRev   = paid.filter(o => o.created_at >= todayStart).reduce((s, o) => s + (o.amount_total ?? 0), 0);
  const weekRev    = paid.filter(o => o.created_at >= weekStart).reduce((s, o) => s + (o.amount_total ?? 0), 0);
  const monthRev   = paid.filter(o => o.created_at >= monthStart).reduce((s, o) => s + (o.amount_total ?? 0), 0);

  const basicPaid  = paid.filter(o => o.plan_id === 'basic');
  const premiumPaid = paid.filter(o => o.plan_id === 'premium');
  const deluxePaid  = paid.filter(o => o.plan_id === 'deluxe');

  const basicRev   = basicPaid.reduce((s, o) => s + (o.amount_total ?? 0), 0);
  const premiumRev = premiumPaid.reduce((s, o) => s + (o.amount_total ?? 0), 0);
  const deluxeRev  = deluxePaid.reduce((s, o) => s + (o.amount_total ?? 0), 0);

  const emailsSent = orders.filter(o => !!o.confirmation_email_sent_at).length;
  const emailsErr  = orders.filter(o => !!o.confirmation_email_error).length;

  const activeInvs = invitations.filter(i => i.status === 'paid' || i.status === 'published').length;

  const currency = paid[0]?.currency?.toUpperCase() ?? 'MXN';

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1610', margin: '0 0 .25rem' }}>
        Resumen
      </h1>
      <p style={{ fontSize: '.8125rem', color: '#8a8580', margin: '0 0 2rem' }}>
        Métricas generales de KOMPRALO
      </p>

      <SectionTitle>Ventas</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
        <MetricCard label="Total ingresos" value={fmt(totalRev, currency)} accent />
        <MetricCard label="Hoy" value={fmt(todayRev, currency)} />
        <MetricCard label="Últimos 7 días" value={fmt(weekRev, currency)} />
        <MetricCard label="Este mes" value={fmt(monthRev, currency)} />
        <MetricCard label="Órdenes pagadas" value={paid.length} />
        <MetricCard label="Órdenes con error" value={failed.length} sub="fallidas / reembolsadas" />
      </div>

      <SectionTitle>Por plan</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
        <MetricCard label="Basic vendidos" value={basicPaid.length} sub={fmt(basicRev, currency)} />
        <MetricCard label="Premium vendidos" value={premiumPaid.length} sub={fmt(premiumRev, currency)} />
        <MetricCard label="Deluxe vendidos" value={deluxePaid.length} sub={fmt(deluxeRev, currency)} />
      </div>

      <SectionTitle>Invitaciones y usuarios</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
        <MetricCard label="Invitaciones creadas" value={invitations.length} />
        <MetricCard label="Invitaciones activas" value={activeInvs} sub="paid / published" />
        <MetricCard label="Usuarios registrados" value={userCount} />
        <MetricCard label="Emails enviados" value={emailsSent} />
        <MetricCard label="Emails con error" value={emailsErr} />
        <MetricCard label="Logs de auditoría" value={logsRes.count ?? 0} />
      </div>
    </div>
  );
}
