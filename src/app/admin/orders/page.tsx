import type { Metadata } from 'next';
import Link from 'next/link';
import { requireAdmin } from '@/lib/admin';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Órdenes — Admin Kompralo' };

const planColors: Record<string, string> = { basic: '#2563eb', premium: '#7c3aed', deluxe: '#b45309' };
const statusColors: Record<string, string> = { paid: '#16a34a', pending: '#d97706', failed: '#dc2626', refunded: '#6b7280' };

function fmt(cents: number, currency: string): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: currency.toUpperCase(), minimumFractionDigits: 0 }).format(cents / 100);
}
function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat('es-MX', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

interface Props { searchParams: Promise<Record<string, string | undefined>> }

export default async function AdminOrdersPage({ searchParams }: Props) {
  await requireAdmin();
  const sp = await searchParams;
  const filterStatus  = sp.status ?? '';
  const filterPlan    = sp.plan   ?? '';
  const filterEmail   = sp.email  ?? '';
  const filterSession = sp.session ?? '';
  const filterEmailErr = sp.email_error ?? '';

  const svc = createServiceRoleSupabaseClient();
  let query = svc
    .from('orders')
    .select('*, invitations(slug)')
    .order('created_at', { ascending: false })
    .limit(200);

  if (filterStatus)   query = query.eq('status', filterStatus);
  if (filterPlan)     query = query.eq('plan_id', filterPlan);
  if (filterEmail)    query = query.ilike('customer_email', `%${filterEmail}%`);
  if (filterSession)  query = query.ilike('stripe_session_id', `%${filterSession}%`);
  if (filterEmailErr) query = query.not('confirmation_email_error', 'is', null);

  const { data: ordersRaw } = await query;
  const orders = ordersRaw ?? [];

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kompralo.vercel.app';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1610', margin: '0 0 .25rem' }}>Órdenes</h1>
          <p style={{ fontSize: '.8125rem', color: '#8a8580', margin: 0 }}>{orders.length} resultado(s)</p>
        </div>
      </div>

      {/* Filters */}
      <form method="get" style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', marginBottom: '1.5rem', padding: '1rem', background: '#fff', border: '1px solid #e5e2dc', borderRadius: 10 }}>
        <input name="email" defaultValue={filterEmail} placeholder="Email cliente" style={inputStyle} />
        <input name="session" defaultValue={filterSession} placeholder="Stripe Session ID (cs_...)" style={{ ...inputStyle, width: 220 }} />
        <select name="status" defaultValue={filterStatus} style={selectStyle}>
          <option value="">Todos los status</option>
          {['pending','paid','failed','refunded'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select name="plan" defaultValue={filterPlan} style={selectStyle}>
          <option value="">Todos los planes</option>
          {['basic','premium','deluxe'].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.8125rem', color: '#4a4742', cursor: 'pointer' }}>
          <input type="checkbox" name="email_error" value="1" defaultChecked={!!filterEmailErr} />
          Solo con errores email
        </label>
        <button type="submit" style={btnStyle}>Filtrar</button>
        <Link href="/admin/orders" style={{ ...btnStyle, background: '#f0ede8', color: '#4a4742', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
          Limpiar
        </Link>
      </form>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', border: '1px solid #e5e2dc', borderRadius: 10, overflow: 'hidden' }}>
          <thead>
            <tr style={{ background: '#f8f7f5', borderBottom: '1px solid #e5e2dc' }}>
              {['Fecha','Email','Nombre','Plan','Monto','Status','Session ID','Email','Acciones'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: '#8a8580', fontSize: '.875rem' }}>No hay órdenes</td></tr>
            )}
            {orders.map((o: Record<string, unknown>) => {
              const slug = (o.invitations as Record<string, unknown> | null)?.slug as string | undefined;
              const pubUrl = slug ? `${appUrl}/${slug}` : null;
              return (
                <tr key={o.id as string} style={{ borderBottom: '1px solid #f0ede8' }}>
                  <td style={tdStyle}><span style={{ fontSize: '.75rem', color: '#8a8580', whiteSpace: 'nowrap' }}>{fmtDate(o.created_at as string)}</span></td>
                  <td style={tdStyle}><span style={{ fontSize: '.8rem', wordBreak: 'break-all' }}>{(o.customer_email as string) ?? '—'}</span></td>
                  <td style={tdStyle}><span style={{ fontSize: '.8rem' }}>{(o.customer_name as string) ?? '—'}</span></td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: '.7rem', fontWeight: 700, color: planColors[o.plan_id as string] ?? '#333', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                      {o.plan_id as string}
                    </span>
                  </td>
                  <td style={tdStyle}><span style={{ fontSize: '.8rem', whiteSpace: 'nowrap' }}>{fmt(o.amount_total as number, o.currency as string)}</span></td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: '.7rem', fontWeight: 700, color: statusColors[o.status as string] ?? '#333', background: '#f8f7f5', padding: '2px 8px', borderRadius: 20 }}>
                      {o.status as string}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: '.65rem', fontFamily: 'monospace', color: '#8a8580', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', whiteSpace: 'nowrap' }}>
                      {(o.stripe_session_id as string) ?? '—'}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: '.7rem', color: o.confirmation_email_error ? '#dc2626' : o.confirmation_email_sent_at ? '#16a34a' : '#8a8580' }}>
                      {o.confirmation_email_error ? '✗ Error' : o.confirmation_email_sent_at ? '✓ Enviado' : 'Pendiente'}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: '.375rem', flexWrap: 'wrap' }}>
                      <Link href={`/admin/orders/${o.id}`} style={actionBtn}>Ver</Link>
                      {pubUrl && <a href={pubUrl} target="_blank" rel="noopener noreferrer" style={{ ...actionBtn, background: '#f0ede8', color: '#4a4742' }}>Público</a>}
                      {!!(o.invitation_id) && <Link href={`/admin/invitations/${o.invitation_id as string}`} style={{ ...actionBtn, background: '#f0ede8', color: '#4a4742' }}>Inv.</Link>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = { padding: '.5rem .75rem', border: '1px solid #e5e2dc', borderRadius: 8, fontSize: '.8125rem', color: '#1a1610', background: '#fafaf8', minWidth: 160 };
const selectStyle: React.CSSProperties = { ...inputStyle };
const btnStyle: React.CSSProperties = { padding: '.5rem 1rem', background: '#1a1610', color: '#f1e3c8', border: 'none', borderRadius: 8, fontSize: '.8125rem', cursor: 'pointer', fontWeight: 600 };
const thStyle: React.CSSProperties = { padding: '.625rem .875rem', fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.1em', color: '#8a8580', fontWeight: 700, textAlign: 'left', whiteSpace: 'nowrap' };
const tdStyle: React.CSSProperties = { padding: '.625rem .875rem', fontSize: '.8125rem', color: '#2c2a26', verticalAlign: 'middle' };
const actionBtn: React.CSSProperties = { padding: '.25rem .625rem', background: '#1a1610', color: '#f1e3c8', borderRadius: 6, fontSize: '.7rem', fontWeight: 600, textDecoration: 'none', cursor: 'pointer' };
