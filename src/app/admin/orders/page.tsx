import type { Metadata } from 'next';
import Link from 'next/link';
import { requireAdmin } from '@/lib/admin';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Órdenes — Admin Kompralo' };

const STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  paid:      { bg: '#E7F5EC', color: '#247A45', label: 'Pagado' },
  pending:   { bg: '#FBF5E3', color: '#7A6A5B', label: 'Pendiente' },
  failed:    { bg: '#FBEAEA', color: '#B43232', label: 'Fallido' },
  refunded:  { bg: '#F2F2F0', color: '#7A6A5B', label: 'Reembolsado' },
};

const PLAN_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  basic:   { bg: 'rgba(37,99,235,0.1)',   color: '#2563EB', label: 'Elegante' },
  premium: { bg: 'rgba(124,58,237,0.1)',  color: '#7C3AED', label: 'Sin Caos' },
  deluxe:  { bg: 'rgba(200,169,91,0.15)', color: '#A07C2E', label: 'Premium' },
};

function fmt(cents: number, currency: string): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: currency.toUpperCase(), minimumFractionDigits: 0 }).format(cents / 100);
}

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_BADGE[status] ?? { bg: '#F2F2F0', color: '#7A6A5B', label: status };
  return <span style={{ display: 'inline-block', background: s.bg, color: s.color, fontSize: '.7rem', fontWeight: 700, padding: '.2rem .65rem', borderRadius: 20, whiteSpace: 'nowrap' }}>{s.label}</span>;
}

function PlanBadge({ plan }: { plan: string }) {
  const p = PLAN_BADGE[plan] ?? { bg: '#F2F2F0', color: '#7A6A5B', label: plan };
  return <span style={{ display: 'inline-block', background: p.bg, color: p.color, fontSize: '.7rem', fontWeight: 700, padding: '.2rem .65rem', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '.05em' }}>{p.label}</span>;
}

interface Props { searchParams: Promise<Record<string, string | undefined>> }

export default async function AdminOrdersPage({ searchParams }: Props) {
  await requireAdmin();
  const sp = await searchParams;
  const filterStatus   = sp.status    ?? '';
  const filterPlan     = sp.plan      ?? '';
  const filterEmail    = sp.email     ?? '';
  const filterSession  = sp.session   ?? '';
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

  const paidCount   = orders.filter((o: Record<string, unknown>) => o.status === 'paid').length;
  const errorCount  = orders.filter((o: Record<string, unknown>) => !!o.confirmation_email_error).length;
  const totalRev    = (orders as Record<string, unknown>[])
    .filter(o => o.status === 'paid')
    .reduce((s, o) => s + (Number(o.amount_total) || 0), 0);
  const currency    = ((orders[0] as Record<string, unknown>)?.currency as string ?? 'mxn').toUpperCase();

  const hasFilters = !!(filterStatus || filterPlan || filterEmail || filterSession || filterEmailErr);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ fontSize: '.65rem', fontWeight: 800, letterSpacing: '.22em', textTransform: 'uppercase', color: '#C8A95B', margin: '0 0 .25rem' }}>
            Admin
          </p>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#241A14', margin: '0 0 .25rem' }}>Órdenes</h1>
          <p style={{ fontSize: '.8125rem', color: '#7A6A5B', margin: 0 }}>
            {orders.length} resultado{orders.length !== 1 ? 's' : ''}
            {paidCount > 0 && <> · <span style={{ color: '#247A45', fontWeight: 600 }}>{paidCount} pagadas</span></>}
            {errorCount > 0 && <> · <span style={{ color: '#B43232', fontWeight: 600 }}>{errorCount} con error de email</span></>}
          </p>
        </div>
        {hasFilters && !filterEmailErr && (
          <div style={{ background: '#FBF5E3', border: '1px solid #E8D8AD', borderRadius: 8, padding: '.5rem .875rem', fontSize: '.75rem', color: '#7A6A5B' }}>
            Filtros activos
          </div>
        )}
        {filterEmailErr && paidCount > 0 && (
          <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, padding: '.5rem .875rem' }}>
            <span style={{ fontSize: '.75rem', color: '#1D4ED8', fontWeight: 600 }}>
              {new Intl.NumberFormat('es-MX', { style: 'currency', currency, minimumFractionDigits: 0 }).format(totalRev / 100)} en ventas afectadas
            </span>
          </div>
        )}
      </div>

      {/* Filters */}
      <form method="get" style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', marginBottom: '1.5rem', padding: '1rem 1.25rem', background: '#FFFBF4', border: '1px solid #E5D2A8', borderRadius: 12 }}>
        <input name="email"   defaultValue={filterEmail}   placeholder="Email cliente"             style={inputStyle} />
        <input name="session" defaultValue={filterSession} placeholder="Session ID (cs_...)"        style={{ ...inputStyle, width: 200 }} />
        <select name="status" defaultValue={filterStatus}  style={selectStyle}>
          <option value="">Todos los status</option>
          {['pending','paid','failed','refunded'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select name="plan" defaultValue={filterPlan} style={selectStyle}>
          <option value="">Todos los planes</option>
          {['basic','premium','deluxe'].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.8125rem', color: '#7A6A5B', cursor: 'pointer' }}>
          <input type="checkbox" name="email_error" value="1" defaultChecked={!!filterEmailErr} />
          Solo errores email
        </label>
        <button type="submit" style={btnDark}>Filtrar</button>
        <Link href="/admin/orders" style={{ ...btnLight, display: 'inline-flex', alignItems: 'center' }}>Limpiar</Link>
      </form>

      {/* Table */}
      <div style={{ overflowX: 'auto', background: '#FFFBF4', border: '1px solid #E5D2A8', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#FAF3E6', borderBottom: '1px solid #E5D2A8' }}>
              {['Fecha','Cliente','Plan','Monto','Status','Email confirm.','Session ID','Acciones'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#7A6A5B', fontSize: '.875rem' }}>
                  No hay órdenes que coincidan
                </td>
              </tr>
            )}
            {orders.map((o: Record<string, unknown>) => {
              const slug   = (o.invitations as Record<string, unknown> | null)?.slug as string | undefined;
              const pubUrl = slug ? `${appUrl}/i/${slug}` : null;
              const emailOk  = !!o.confirmation_email_sent_at;
              const emailErr = !!o.confirmation_email_error;

              return (
                <tr key={o.id as string} style={{ borderBottom: '1px solid rgba(200,169,91,0.12)' }}>
                  <td style={tdStyle}>
                    <span style={{ fontSize: '.75rem', color: '#7A6A5B', whiteSpace: 'nowrap' }}>
                      {fmtDate(o.created_at as string)}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <p style={{ margin: '0 0 .125rem', fontSize: '.8rem', fontWeight: 500, color: '#241A14', whiteSpace: 'nowrap' }}>
                      {(o.customer_name as string) || '—'}
                    </p>
                    <p style={{ margin: 0, fontSize: '.75rem', color: '#7A6A5B' }}>{(o.customer_email as string) ?? '—'}</p>
                  </td>
                  <td style={tdStyle}><PlanBadge plan={o.plan_id as string} /></td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: '.875rem', fontWeight: 700, color: o.status === 'paid' ? '#241A14' : '#7A6A5B', whiteSpace: 'nowrap' }}>
                      {fmt(o.amount_total as number, o.currency as string)}
                    </span>
                  </td>
                  <td style={tdStyle}><StatusBadge status={o.status as string} /></td>
                  <td style={tdStyle}>
                    {emailErr ? (
                      <span style={{ fontSize: '.75rem', color: '#B43232', fontWeight: 600 }}>✗ Error</span>
                    ) : emailOk ? (
                      <span style={{ fontSize: '.75rem', color: '#247A45', fontWeight: 600 }}>✓ Enviado</span>
                    ) : (
                      <span style={{ fontSize: '.75rem', color: '#7A6A5B' }}>Pendiente</span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: '.65rem', fontFamily: 'monospace', color: '#7A6A5B', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', whiteSpace: 'nowrap' }}>
                      {(o.stripe_session_id as string) ?? '—'}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: '.375rem' }}>
                      <Link href={`/admin/orders/${o.id}`} style={btnAction}>Ver</Link>
                      {pubUrl && <a href={pubUrl} target="_blank" rel="noopener noreferrer" style={btnActionLight}>Público</a>}
                      {!!(o.invitation_id) && <Link href={`/admin/invitations/${o.invitation_id as string}`} style={btnActionLight}>Inv.</Link>}
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

const inputStyle:     React.CSSProperties = { padding: '.5rem .75rem', border: '1px solid #E5D2A8', borderRadius: 8, fontSize: '.8125rem', color: '#241A14', background: '#FAF3E6', minWidth: 160 };
const selectStyle:    React.CSSProperties = { ...inputStyle };
const btnDark:        React.CSSProperties = { padding: '.5rem 1.125rem', background: '#1C1713', color: '#FFF7EA', border: 'none', borderRadius: 8, fontSize: '.8125rem', cursor: 'pointer', fontWeight: 700 };
const btnLight:       React.CSSProperties = { padding: '.5rem 1rem', background: '#FFFBF4', color: '#1C1713', border: '1px solid #C8A95B', borderRadius: 8, fontSize: '.8125rem', cursor: 'pointer', fontWeight: 600, textDecoration: 'none' };
const thStyle:        React.CSSProperties = { padding: '.625rem 1rem', fontSize: '.68rem', textTransform: 'uppercase', letterSpacing: '.1em', color: '#7A6A5B', fontWeight: 700, textAlign: 'left', whiteSpace: 'nowrap' };
const tdStyle:        React.CSSProperties = { padding: '.75rem 1rem', fontSize: '.8125rem', color: '#241A14', verticalAlign: 'middle' };
const btnAction:      React.CSSProperties = { padding: '.3rem .75rem', background: '#1C1713', color: '#FFF7EA', borderRadius: 6, fontSize: '.7rem', fontWeight: 700, textDecoration: 'none' };
const btnActionLight: React.CSSProperties = { padding: '.3rem .75rem', background: '#FFFBF4', color: '#1C1713', border: '1px solid #E5D2A8', borderRadius: 6, fontSize: '.7rem', fontWeight: 600, textDecoration: 'none' };
