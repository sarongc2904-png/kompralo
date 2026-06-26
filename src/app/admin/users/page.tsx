import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/admin';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Usuarios — Admin Kompralo' };

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat('es-MX', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(iso));
}

function fmtCurrency(cents: number): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(cents / 100);
}

export default async function AdminUsersPage() {
  await requireAdmin();

  const svc = createServiceRoleSupabaseClient();

  const { data: authData } = await svc.auth.admin.listUsers({ perPage: 500 });
  const authUsers = authData?.users ?? [];

  const { data: invitations = [] } = await svc
    .from('invitations')
    .select('id, user_id, customer_email, plan_id, status')
    .not('user_id', 'is', null);

  const { data: orders = [] } = await svc
    .from('orders')
    .select('id, owner_user_id, customer_email, amount_total, status')
    .not('owner_user_id', 'is', null);

  const invsByUser   = new Map<string, typeof invitations>();
  const ordersByUser = new Map<string, typeof orders>();

  for (const inv of invitations as Record<string, unknown>[]) {
    const uid = inv.user_id as string;
    if (!invsByUser.has(uid)) invsByUser.set(uid, []);
    invsByUser.get(uid)!.push(inv as never);
  }
  for (const ord of orders as Record<string, unknown>[]) {
    const uid = ord.owner_user_id as string;
    if (!ordersByUser.has(uid)) ordersByUser.set(uid, []);
    ordersByUser.get(uid)!.push(ord as never);
  }

  const { data: adminRows = [] } = await svc.from('admin_users').select('user_id');
  const adminIds = new Set((adminRows as Record<string, unknown>[]).map(r => r.user_id as string));

  const rows: { id: string; email: string; createdAt: string; invCount: number; orderCount: number; totalSpent: number; isAdmin: boolean }[] = [];

  for (const u of authUsers) {
    const userOrders = ordersByUser.get(u.id) ?? [];
    const totalSpent = (userOrders as Record<string, unknown>[])
      .filter(o => o.status === 'paid')
      .reduce((sum, o) => sum + (Number(o.amount_total) || 0), 0);
    rows.push({
      id:         u.id,
      email:      u.email ?? '(sin email)',
      createdAt:  u.created_at,
      invCount:   (invsByUser.get(u.id) ?? []).length,
      orderCount: userOrders.length,
      totalSpent,
      isAdmin:    adminIds.has(u.id),
    });
  }

  rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const admins   = rows.filter(r => r.isAdmin).length;
  const buyers   = rows.filter(r => r.totalSpent > 0).length;
  const totalRev = rows.reduce((s, r) => s + r.totalSpent, 0);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '.65rem', fontWeight: 800, letterSpacing: '.22em', textTransform: 'uppercase', color: '#C8A95B', margin: '0 0 .25rem' }}>
          Admin
        </p>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#241A14', margin: '0 0 .25rem' }}>Usuarios</h1>
        <p style={{ fontSize: '.8125rem', color: '#7A6A5B', margin: 0 }}>
          {rows.length} en auth.users
          {buyers > 0 && <> · <span style={{ color: '#247A45', fontWeight: 600 }}>{buyers} con compras</span></>}
          {admins > 0 && <> · <span style={{ color: '#A07C2E', fontWeight: 600 }}>{admins} admin{admins > 1 ? 's' : ''}</span></>}
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total usuarios',   value: rows.length,         color: '#241A14' },
          { label: 'Con compras',      value: buyers,              color: '#247A45' },
          { label: 'Ingresos totales', value: fmtCurrency(totalRev), color: '#7C3AED' },
          { label: 'Admins',           value: admins,              color: '#A07C2E' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#FFFBF4', border: '1px solid #E5D2A8', borderRadius: 12, padding: '1.125rem' }}>
            <p style={{ margin: '0 0 .25rem', fontSize: '.65rem', textTransform: 'uppercase', letterSpacing: '.14em', color: '#7A6A5B', fontWeight: 700 }}>{label}</p>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', background: '#FFFBF4', border: '1px solid #E5D2A8', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#FAF3E6', borderBottom: '1px solid #E5D2A8' }}>
              {['Registro','Email','User ID','Invitaciones','Órdenes','Total pagado','Rol'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#7A6A5B' }}>Sin usuarios</td></tr>
            )}
            {rows.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid rgba(200,169,91,0.12)' }}>
                <td style={tdStyle}>
                  <span style={{ fontSize: '.75rem', color: '#7A6A5B', whiteSpace: 'nowrap' }}>{fmtDate(r.createdAt)}</span>
                </td>
                <td style={tdStyle}>
                  <span style={{ fontSize: '.8rem', color: '#241A14' }}>{r.email}</span>
                </td>
                <td style={tdStyle}>
                  <span style={{ fontFamily: 'monospace', fontSize: '.7rem', color: '#7A6A5B' }}>{r.id.slice(0, 8)}…</span>
                </td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <span style={{ fontWeight: 700, color: r.invCount > 0 ? '#2563EB' : '#7A6A5B' }}>{r.invCount}</span>
                </td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <span style={{ fontWeight: 700, color: r.orderCount > 0 ? '#241A14' : '#7A6A5B' }}>{r.orderCount}</span>
                </td>
                <td style={tdStyle}>
                  <span style={{ fontWeight: 700, color: r.totalSpent > 0 ? '#247A45' : '#7A6A5B' }}>
                    {r.totalSpent > 0 ? fmtCurrency(r.totalSpent) : '—'}
                  </span>
                </td>
                <td style={tdStyle}>
                  {r.isAdmin ? (
                    <span style={{ display: 'inline-block', background: '#FBF5E3', color: '#A07C2E', fontSize: '.7rem', fontWeight: 800, padding: '.2rem .65rem', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '.1em' }}>
                      Admin
                    </span>
                  ) : (
                    <span style={{ fontSize: '.75rem', color: '#7A6A5B' }}>usuario</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = { padding: '.625rem 1rem', fontSize: '.68rem', textTransform: 'uppercase', letterSpacing: '.1em', color: '#7A6A5B', fontWeight: 700, textAlign: 'left', whiteSpace: 'nowrap' };
const tdStyle: React.CSSProperties = { padding: '.75rem 1rem', fontSize: '.8125rem', color: '#241A14', verticalAlign: 'middle' };
