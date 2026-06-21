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

  // Fetch auth users via admin API
  const { data: authData } = await svc.auth.admin.listUsers({ perPage: 500 });
  const authUsers = authData?.users ?? [];

  // Fetch invitations grouped by user_id
  const { data: invitations = [] } = await svc
    .from('invitations')
    .select('id, user_id, customer_email, plan_id, status')
    .not('user_id', 'is', null);

  // Fetch orders grouped by owner_user_id
  const { data: orders = [] } = await svc
    .from('orders')
    .select('id, owner_user_id, customer_email, amount_total, status')
    .not('owner_user_id', 'is', null);

  // Build index
  const invsByUser = new Map<string, typeof invitations>();
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

  // Merge into rows (auth users + any user_id in invitations not in auth)
  const seenIds = new Set<string>();
  const rows: { id: string; email: string; createdAt: string; invCount: number; orderCount: number; totalSpent: number; isAdmin: boolean }[] = [];

  // Fetch admin_users set
  const { data: adminRows = [] } = await svc.from('admin_users').select('user_id');
  const adminIds = new Set((adminRows as Record<string, unknown>[]).map(r => r.user_id as string));

  for (const u of authUsers) {
    seenIds.add(u.id);
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

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1610', margin: '0 0 .25rem' }}>Usuarios</h1>
        <p style={{ fontSize: '.8125rem', color: '#8a8580', margin: 0 }}>{rows.length} usuario(s) en auth.users</p>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', border: '1px solid #e5e2dc', borderRadius: 10, overflow: 'hidden' }}>
          <thead>
            <tr style={{ background: '#f8f7f5', borderBottom: '1px solid #e5e2dc' }}>
              {['Registro', 'Email', 'User ID', 'Invitaciones', 'Órdenes', 'Total pagado', 'Rol'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#8a8580' }}>Sin usuarios</td></tr>
            )}
            {rows.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid #f0ede8' }}>
                <td style={tdStyle}><span style={{ fontSize: '.75rem', color: '#8a8580', whiteSpace: 'nowrap' }}>{fmtDate(r.createdAt)}</span></td>
                <td style={tdStyle}><span style={{ fontSize: '.8rem' }}>{r.email}</span></td>
                <td style={tdStyle}><span style={{ fontFamily: 'monospace', fontSize: '.7rem', color: '#8a8580' }}>{r.id.slice(0, 8)}…</span></td>
                <td style={{ ...tdStyle, textAlign: 'center' }}><span style={{ fontWeight: 700 }}>{r.invCount}</span></td>
                <td style={{ ...tdStyle, textAlign: 'center' }}><span style={{ fontWeight: 700 }}>{r.orderCount}</span></td>
                <td style={tdStyle}><span style={{ fontWeight: 700, color: r.totalSpent > 0 ? '#16a34a' : '#8a8580' }}>{r.totalSpent > 0 ? fmtCurrency(r.totalSpent) : '—'}</span></td>
                <td style={tdStyle}>
                  {r.isAdmin
                    ? <span style={{ fontSize: '.7rem', fontWeight: 700, color: '#b45309', background: '#fef3c7', padding: '2px 8px', borderRadius: 20 }}>ADMIN</span>
                    : <span style={{ fontSize: '.7rem', color: '#8a8580' }}>usuario</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = { padding: '.625rem .875rem', fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.1em', color: '#8a8580', fontWeight: 700, textAlign: 'left', whiteSpace: 'nowrap' };
const tdStyle: React.CSSProperties = { padding: '.625rem .875rem', fontSize: '.8125rem', color: '#2c2a26', verticalAlign: 'middle' };
