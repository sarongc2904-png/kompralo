import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/admin';
import { publicUrl, previewUrl, editorUrl, clientDashboardUrl } from '@/lib/admin';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Detalle orden — Admin Kompralo' };

function fmt(cents: number, currency: string): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: currency.toUpperCase(), minimumFractionDigits: 0 }).format(cents / 100);
}
function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('es-MX', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <tr style={{ borderBottom: '1px solid #f0ede8' }}>
      <td style={{ padding: '.625rem .875rem', fontSize: '.75rem', color: '#8a8580', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', whiteSpace: 'nowrap', width: 180 }}>
        {label}
      </td>
      <td style={{ padding: '.625rem .875rem', fontSize: '.8125rem', color: '#1a1610', wordBreak: 'break-all' }}>
        {value}
      </td>
    </tr>
  );
}

interface Props { params: Promise<{ id: string }> }

export default async function AdminOrderDetailPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;

  const svc = createServiceRoleSupabaseClient();
  const { data: order } = await svc
    .from('orders')
    .select('*, invitations(id, slug, status, plan_id, category, title, user_id, customer_email)')
    .eq('id', id)
    .maybeSingle();

  if (!order) notFound();

  const inv = order.invitations as Record<string, string> | null;
  const slug = inv?.slug ?? null;

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/admin/orders" style={{ fontSize: '.8rem', color: '#8a8580', textDecoration: 'none' }}>← Órdenes</Link>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1a1610', margin: '.5rem 0 .25rem' }}>
          Orden
        </h1>
        <p style={{ fontSize: '.8125rem', fontFamily: 'monospace', color: '#8a8580', margin: 0 }}>{order.id}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 260px', gap: '1.5rem', alignItems: 'start' }}>

        {/* Main data */}
        <div style={{ background: '#fff', border: '1px solid #e5e2dc', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <Row label="Creado"                  value={fmtDate(order.created_at)} />
              <Row label="Actualizado"             value={fmtDate(order.updated_at)} />
              <Row label="Email cliente"           value={order.customer_email ?? '—'} />
              <Row label="Nombre cliente"          value={order.customer_name ?? '—'} />
              <Row label="Plan"                    value={<b style={{ textTransform: 'uppercase' }}>{order.plan_id}</b>} />
              <Row label="Monto"                   value={fmt(order.amount_total, order.currency)} />
              <Row label="Currency"                value={order.currency?.toUpperCase() ?? '—'} />
              <Row label="Status"                  value={<span style={{ fontWeight: 700, color: order.status === 'paid' ? '#16a34a' : '#dc2626' }}>{order.status}</span>} />
              <Row label="Stripe Session ID"       value={<span style={{ fontFamily: 'monospace', fontSize: '.75rem' }}>{order.stripe_session_id}</span>} />
              <Row label="Stripe Payment Intent"   value={<span style={{ fontFamily: 'monospace', fontSize: '.75rem' }}>{order.stripe_payment_intent_id ?? '—'}</span>} />
              <Row label="Owner User ID"           value={<span style={{ fontFamily: 'monospace', fontSize: '.75rem' }}>{order.owner_user_id ?? '—'}</span>} />
              <Row label="Invitation ID"           value={<span style={{ fontFamily: 'monospace', fontSize: '.75rem' }}>{order.invitation_id ?? '—'}</span>} />
              <Row label="Email enviado"           value={fmtDate(order.confirmation_email_sent_at)} />
              <Row label="Error email"             value={order.confirmation_email_error ? <span style={{ color: '#dc2626', fontSize: '.8rem' }}>{order.confirmation_email_error}</span> : '—'} />
              {order.metadata && Object.keys(order.metadata).length > 0 && (
                <Row label="Metadata" value={<pre style={{ fontSize: '.7rem', margin: 0, color: '#4a4742', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{JSON.stringify(order.metadata, null, 2)}</pre>} />
              )}
            </tbody>
          </table>
        </div>

        {/* Links & actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {inv && (
            <div style={{ background: '#fff', border: '1px solid #e5e2dc', borderRadius: 12, padding: '1rem' }}>
              <p style={{ fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.1em', color: '#8a8580', fontWeight: 700, margin: '0 0 .75rem' }}>
                Invitación vinculada
              </p>
              <p style={{ fontSize: '.875rem', fontWeight: 700, color: '#1a1610', margin: '0 0 .25rem' }}>{inv.title ?? 'Sin título'}</p>
              <p style={{ fontSize: '.75rem', color: '#8a8580', fontFamily: 'monospace', margin: '0 0 .75rem' }}>/{slug}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                {slug && <a href={publicUrl(slug)} target="_blank" rel="noopener noreferrer" style={linkBtn}>🔗 Link público</a>}
                {inv.id && <a href={previewUrl(inv.id)} target="_blank" rel="noopener noreferrer" style={{ ...linkBtn, background: '#f0ede8', color: '#4a4742' }}>👁 Preview</a>}
                {inv.id && <a href={editorUrl(inv.id)} target="_blank" rel="noopener noreferrer" style={{ ...linkBtn, background: '#f0ede8', color: '#4a4742' }}>✏️ Editor</a>}
                {inv.id && <a href={clientDashboardUrl(inv.id)} target="_blank" rel="noopener noreferrer" style={{ ...linkBtn, background: '#f0ede8', color: '#4a4742' }}>📊 Panel cliente</a>}
                {inv.id && <Link href={`/admin/invitations/${inv.id}`} style={{ ...linkBtn, background: '#f0ede8', color: '#4a4742' }}>⚙️ Gestionar</Link>}
              </div>
            </div>
          )}

          {!inv && order.stripe_session_id && (
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '1rem' }}>
              <p style={{ fontSize: '.75rem', color: '#92400e', fontWeight: 600, margin: '0 0 .5rem' }}>Sin invitación vinculada</p>
              <p style={{ fontSize: '.75rem', color: '#92400e', margin: '0 0 .75rem' }}>Esta orden no tiene una invitación. Usa la recovery para crearla.</p>
              <Link href={`/admin/recovery?session=${encodeURIComponent(order.stripe_session_id)}`} style={linkBtn}>
                🔧 Recuperar compra
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const linkBtn: React.CSSProperties = {
  display: 'block', padding: '.5rem .875rem', background: '#1a1610', color: '#f1e3c8',
  borderRadius: 8, fontSize: '.8rem', fontWeight: 600, textDecoration: 'none', textAlign: 'center',
};
