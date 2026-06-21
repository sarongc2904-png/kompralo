import type { Metadata } from 'next';
import Link from 'next/link';
import { requireAdmin } from '@/lib/admin';
import { publicUrl } from '@/lib/admin';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Invitaciones — Admin Kompralo' };

const planColors: Record<string, string> = { basic: '#2563eb', premium: '#7c3aed', deluxe: '#b45309' };
const statusColors: Record<string, string> = {
  paid: '#16a34a', published: '#059669', draft: '#d97706', paused: '#6b7280',
  cancelled: '#dc2626', archived: '#6b7280', deleted: '#ef4444', preview: '#8b5cf6', pending_payment: '#d97706',
};

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat('es-MX', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(iso));
}

interface Props { searchParams: Promise<Record<string, string | undefined>> }

export default async function AdminInvitationsPage({ searchParams }: Props) {
  await requireAdmin();
  const sp = await searchParams;
  const filterStatus   = sp.status   ?? '';
  const filterPlan     = sp.plan     ?? '';
  const filterEmail    = sp.email    ?? '';
  const filterCategory = sp.category ?? '';

  const svc = createServiceRoleSupabaseClient();
  let query = svc
    .from('invitations')
    .select('id, slug, category, plan_id, status, title, user_id, customer_email, created_at, updated_at, deleted_at')
    .order('created_at', { ascending: false })
    .limit(200);

  if (filterStatus)   query = query.eq('status', filterStatus);
  if (filterPlan)     query = query.eq('plan_id', filterPlan);
  if (filterEmail)    query = query.ilike('customer_email', `%${filterEmail}%`);
  if (filterCategory) query = query.eq('category', filterCategory);

  const { data: invRaw } = await query;
  const invitations = invRaw ?? [];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1610', margin: '0 0 .25rem' }}>Invitaciones</h1>
          <p style={{ fontSize: '.8125rem', color: '#8a8580', margin: 0 }}>{invitations.length} resultado(s)</p>
        </div>
        <Link href="/admin/invitations/new" style={btnPrimary}>+ Crear invitación</Link>
      </div>

      {/* Filters */}
      <form method="get" style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', marginBottom: '1.5rem', padding: '1rem', background: '#fff', border: '1px solid #e5e2dc', borderRadius: 10 }}>
        <input name="email" defaultValue={filterEmail} placeholder="Email o nombre" style={inputStyle} />
        <select name="status" defaultValue={filterStatus} style={selectStyle}>
          <option value="">Todos los status</option>
          {['draft','pending_payment','paid','published','paused','cancelled','archived','deleted'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select name="plan" defaultValue={filterPlan} style={selectStyle}>
          <option value="">Todos los planes</option>
          {['basic','premium','deluxe'].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select name="category" defaultValue={filterCategory} style={selectStyle}>
          <option value="">Todas las categorías</option>
          {['wedding','baptism','baby-shower','birthday'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button type="submit" style={btnStyle}>Filtrar</button>
        <Link href="/admin/invitations" style={{ ...btnStyle, background: '#f0ede8', color: '#4a4742', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
          Limpiar
        </Link>
      </form>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', border: '1px solid #e5e2dc', borderRadius: 10, overflow: 'hidden' }}>
          <thead>
            <tr style={{ background: '#f8f7f5', borderBottom: '1px solid #e5e2dc' }}>
              {['Fecha','Título / Slug','Email','Plan','Status','Categoría','Acciones'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invitations.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#8a8580' }}>No hay invitaciones</td></tr>
            )}
            {invitations.map((inv: Record<string, unknown>) => {
              const slug = inv.slug as string;
              const isDeleted = !!inv.deleted_at;
              return (
                <tr key={inv.id as string} style={{ borderBottom: '1px solid #f0ede8', opacity: isDeleted ? 0.55 : 1 }}>
                  <td style={tdStyle}><span style={{ fontSize: '.75rem', color: '#8a8580', whiteSpace: 'nowrap' }}>{fmtDate(inv.created_at as string)}</span></td>
                  <td style={tdStyle}>
                    <p style={{ margin: '0 0 .125rem', fontWeight: 600, fontSize: '.8rem', color: '#1a1610' }}>{(inv.title as string) || 'Sin título'}</p>
                    <p style={{ margin: 0, fontFamily: 'monospace', fontSize: '.7rem', color: '#8a8580' }}>/{slug}</p>
                  </td>
                  <td style={tdStyle}><span style={{ fontSize: '.8rem' }}>{(inv.customer_email as string) ?? '—'}</span></td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: '.7rem', fontWeight: 700, color: planColors[inv.plan_id as string] ?? '#333', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                      {inv.plan_id as string}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: '.7rem', fontWeight: 700, color: statusColors[inv.status as string] ?? '#333', background: '#f8f7f5', padding: '2px 8px', borderRadius: 20 }}>
                      {inv.status as string}
                    </span>
                  </td>
                  <td style={tdStyle}><span style={{ fontSize: '.75rem', color: '#8a8580' }}>{inv.category as string}</span></td>
                  <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: '.375rem', flexWrap: 'wrap' }}>
                      <Link href={`/admin/invitations/${inv.id}`} style={actionBtn}>Ver</Link>
                      <a href={publicUrl(slug)} target="_blank" rel="noopener noreferrer" style={{ ...actionBtn, background: '#f0ede8', color: '#4a4742' }}>Público</a>
                      <Link href={`/admin/invitations/${inv.id}/edit`} style={{ ...actionBtn, background: '#f5f0e8', color: '#b45309' }}>Editar</Link>
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
const btnPrimary: React.CSSProperties = { padding: '.625rem 1.25rem', background: '#1a1610', color: '#f1e3c8', border: 'none', borderRadius: 8, fontSize: '.875rem', cursor: 'pointer', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' };
const thStyle: React.CSSProperties = { padding: '.625rem .875rem', fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.1em', color: '#8a8580', fontWeight: 700, textAlign: 'left', whiteSpace: 'nowrap' };
const tdStyle: React.CSSProperties = { padding: '.625rem .875rem', fontSize: '.8125rem', color: '#2c2a26', verticalAlign: 'middle' };
const actionBtn: React.CSSProperties = { padding: '.25rem .625rem', background: '#1a1610', color: '#f1e3c8', borderRadius: 6, fontSize: '.7rem', fontWeight: 600, textDecoration: 'none', cursor: 'pointer' };
