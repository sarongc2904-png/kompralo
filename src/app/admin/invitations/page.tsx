import type { Metadata } from 'next';
import Link from 'next/link';
import { requireAdmin } from '@/lib/admin';
import { publicUrl } from '@/lib/admin';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import { AdminInvitationActions } from './_components/AdminInvitationActions';

export const metadata: Metadata = { title: 'Invitaciones — Admin Kompralo' };

const STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  paid:            { bg: '#DCFCE7', color: '#16A34A', label: 'Pagado' },
  published:       { bg: '#D1FAE5', color: '#059669', label: 'Publicado' },
  draft:           { bg: '#FEF3C7', color: '#D97706', label: 'Borrador' },
  pending_payment: { bg: '#FEF9C3', color: '#CA8A04', label: 'Pend. pago' },
  paused:          { bg: '#F3F4F6', color: '#6B7280', label: 'Pausado' },
  cancelled:       { bg: '#FEE2E2', color: '#DC2626', label: 'Cancelado' },
  archived:        { bg: '#F3F4F6', color: '#6B7280', label: 'Archivado' },
  deleted:         { bg: '#FEE2E2', color: '#EF4444', label: 'Eliminado' },
  preview:         { bg: '#EDE9FE', color: '#8B5CF6', label: 'Preview' },
};

const PLAN_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  basic:   { bg: '#DBEAFE', color: '#2563EB', label: 'Elegante' },
  premium: { bg: '#EDE9FE', color: '#7C3AED', label: 'Sin Caos' },
  deluxe:  { bg: '#FEF3C7', color: '#B45309', label: 'Premium' },
};

const CAT_LABEL: Record<string, string> = {
  wedding:       'Boda',
  baptism:       'Bautizo',
  'baby-shower': 'Baby shower',
  birthday:      'Cumpleaños',
};

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso));
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_BADGE[status] ?? { bg: '#F3F4F6', color: '#6B7280', label: status };
  return (
    <span style={{ display: 'inline-block', background: s.bg, color: s.color, fontSize: '.7rem', fontWeight: 700, padding: '.2rem .65rem', borderRadius: 20, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const p = PLAN_BADGE[plan] ?? { bg: '#F3F4F6', color: '#6B7280', label: plan };
  return (
    <span style={{ display: 'inline-block', background: p.bg, color: p.color, fontSize: '.7rem', fontWeight: 700, padding: '.2rem .65rem', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '.05em' }}>
      {p.label}
    </span>
  );
}

interface Inv {
  id: string;
  slug: string;
  category: string;
  plan_id: string;
  status: string;
  title: string | null;
  customer_email: string | null;
  created_at: string;
  deleted_at: string | null;
}

interface Props { searchParams: Promise<Record<string, string | undefined>> }

export default async function AdminInvitationsPage({ searchParams }: Props) {
  await requireAdmin();
  const sp = await searchParams;

  const filterDeleted  = (sp.deleted ?? 'active') as 'active' | 'deleted' | 'all';
  const filterStatus   = sp.status   ?? '';
  const filterPlan     = sp.plan     ?? '';
  const filterEmail    = sp.email    ?? '';
  const filterCategory = sp.category ?? '';

  const svc = createServiceRoleSupabaseClient();
  let query = svc
    .from('invitations')
    .select('id, slug, category, plan_id, status, title, customer_email, created_at, deleted_at')
    .order('created_at', { ascending: false })
    .limit(200);

  if (filterDeleted === 'active')  query = query.is('deleted_at', null);
  if (filterDeleted === 'deleted') query = query.not('deleted_at', 'is', null);

  if (filterStatus)   query = query.eq('status', filterStatus);
  if (filterPlan)     query = query.eq('plan_id', filterPlan);
  if (filterEmail)    query = query.ilike('customer_email', `%${filterEmail}%`);
  if (filterCategory) query = query.eq('category', filterCategory);

  const { data: invRaw } = await query;
  const invitations = (invRaw ?? []) as Inv[];

  const totalCount   = invitations.length;
  const activeCount  = invitations.filter((i) => i.status === 'paid' || i.status === 'published').length;
  const deletedCount = invitations.filter((i) => !!i.deleted_at).length;

  function tabHref(deleted: string) {
    const params = new URLSearchParams();
    params.set('deleted', deleted);
    if (filterEmail)    params.set('email',    filterEmail);
    if (filterStatus)   params.set('status',   filterStatus);
    if (filterPlan)     params.set('plan',     filterPlan);
    if (filterCategory) params.set('category', filterCategory);
    return `/admin/invitations?${params.toString()}`;
  }

  return (
    <div>
      {/* ── Styles ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        .adm-inv-cards { display: none }
        .adm-inv-table { display: block }
        @media (max-width: 768px) {
          .adm-inv-cards { display: flex; flex-direction: column; gap: .75rem }
          .adm-inv-table { display: none }
        }
      `}} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ fontSize: '.65rem', fontWeight: 800, letterSpacing: '.22em', textTransform: 'uppercase', color: '#C9A45C', margin: '0 0 .25rem' }}>
            Admin
          </p>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1A1510', margin: '0 0 .25rem' }}>Invitaciones</h1>
          <p style={{ fontSize: '.8125rem', color: '#766B60', margin: 0 }}>
            {totalCount} resultado{totalCount !== 1 ? 's' : ''}
            {activeCount > 0 && <> · <span style={{ color: '#16A34A', fontWeight: 600 }}>{activeCount} activas</span></>}
            {deletedCount > 0 && <> · <span style={{ color: '#EF4444', fontWeight: 600 }}>{deletedCount} eliminadas</span></>}
          </p>
        </div>
        <Link href="/admin/invitations/new" style={btnPrimary}>+ Crear invitación</Link>
      </div>

      {/* Tabs active / deleted / all */}
      <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1rem', borderBottom: '1px solid #E8E4DE', paddingBottom: '.75rem', overflowX: 'auto' }}>
        {(['active', 'deleted', 'all'] as const).map((tab) => {
          const labels = { active: 'Activas', deleted: 'Eliminadas', all: 'Todas' };
          const active = filterDeleted === tab;
          return (
            <Link
              key={tab}
              href={tabHref(tab)}
              style={{
                padding: '.375rem .875rem',
                borderRadius: 20,
                fontSize: '.8125rem',
                fontWeight: active ? 700 : 500,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                background: active ? '#17120E' : 'transparent',
                color: active ? '#F5F0E8' : '#766B60',
                border: active ? 'none' : '1px solid #E8E4DE',
              }}
            >
              {labels[tab]}
            </Link>
          );
        })}
      </div>

      {/* Filters */}
      <form method="get" style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', marginBottom: '1.5rem', padding: '1rem 1.25rem', background: '#fff', border: '1px solid #E8E4DE', borderRadius: 12 }}>
        <input type="hidden" name="deleted" value={filterDeleted} />
        <input name="email" defaultValue={filterEmail} placeholder="Email o nombre" style={inputStyle} />
        <select name="status" defaultValue={filterStatus} style={selectStyle}>
          <option value="">Todos los status</option>
          {['draft','pending_payment','paid','published','paused','cancelled','archived','deleted'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select name="plan" defaultValue={filterPlan} style={selectStyle}>
          <option value="">Todos los planes</option>
          {['basic','premium','deluxe'].map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select name="category" defaultValue={filterCategory} style={selectStyle}>
          <option value="">Todas las categorías</option>
          {['wedding','baptism','baby-shower','birthday'].map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button type="submit" style={btnDark}>Filtrar</button>
        <Link href={tabHref(filterDeleted)} style={{ ...btnLight, display: 'inline-flex', alignItems: 'center' }}>Limpiar</Link>
      </form>

      {/* ── Mobile cards ── */}
      <div className="adm-inv-cards">
        {invitations.length === 0 && (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#B0A898', fontSize: '.875rem' }}>
            No hay invitaciones que coincidan
          </p>
        )}
        {invitations.map((inv) => {
          const isDeleted = !!inv.deleted_at;
          return (
            <div
              key={inv.id}
              style={{
                background: '#fff',
                border: '1px solid #E8E4DE',
                borderRadius: 12,
                padding: '1rem',
                opacity: isDeleted ? 0.7 : 1,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '.5rem', marginBottom: '.75rem' }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: '0 0 .2rem', fontWeight: 700, fontSize: '.875rem', color: '#1A1510', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {inv.title || 'Sin título'}
                  </p>
                  <p style={{ margin: 0, fontFamily: 'monospace', fontSize: '.7rem', color: '#B0A898' }}>/{inv.slug}</p>
                </div>
                <div style={{ display: 'flex', gap: '.375rem', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <StatusBadge status={inv.status} />
                  <PlanBadge plan={inv.plan_id} />
                </div>
              </div>
              <div style={{ fontSize: '.75rem', color: '#766B60', marginBottom: '.75rem' }}>
                {inv.customer_email ?? '—'} · {CAT_LABEL[inv.category] ?? inv.category} · {fmtDate(inv.created_at)}
              </div>
              <div style={{ display: 'flex', gap: '.375rem', flexWrap: 'wrap' }}>
                <Link href={`/admin/invitations/${inv.id}`} style={btnAction}>Ver</Link>
                <a href={publicUrl(inv.slug)} target="_blank" rel="noopener noreferrer" style={btnActionLight}>Público</a>
                <Link href={`/admin/invitations/${inv.id}/edit`} style={btnActionEdit}>Editar</Link>
                <AdminInvitationActions id={inv.id} isDeleted={isDeleted} deletedAt={inv.deleted_at} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Desktop table ── */}
      <div className="adm-inv-table" style={{ overflowX: 'auto', background: '#fff', border: '1px solid #E8E4DE', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8F5F1', borderBottom: '1px solid #E8E4DE' }}>
              {['Fecha', 'Título / Slug', 'Email', 'Plan', 'Status', 'Categoría', 'Acciones'].map((h) => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invitations.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#B0A898', fontSize: '.875rem' }}>
                  No hay invitaciones que coincidan
                </td>
              </tr>
            )}
            {invitations.map((inv) => {
              const isDeleted = !!inv.deleted_at;
              return (
                <tr key={inv.id} style={{ borderBottom: '1px solid #F5F2ED', opacity: isDeleted ? 0.55 : 1 }}>
                  <td style={tdStyle}>
                    <span style={{ fontSize: '.75rem', color: '#8A8580', whiteSpace: 'nowrap' }}>
                      {fmtDate(inv.created_at)}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <p style={{ margin: '0 0 .2rem', fontWeight: 700, fontSize: '.8rem', color: '#1A1510', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {inv.title || 'Sin título'}
                    </p>
                    <p style={{ margin: 0, fontFamily: 'monospace', fontSize: '.7rem', color: '#B0A898' }}>/{inv.slug}</p>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: '.8rem', color: '#4A4742' }}>{inv.customer_email ?? '—'}</span>
                  </td>
                  <td style={tdStyle}><PlanBadge plan={inv.plan_id} /></td>
                  <td style={tdStyle}><StatusBadge status={inv.status} /></td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: '.75rem', color: '#766B60' }}>
                      {CAT_LABEL[inv.category] ?? inv.category}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: '.375rem', alignItems: 'center' }}>
                      <Link href={`/admin/invitations/${inv.id}`} style={btnAction}>Ver</Link>
                      <a href={publicUrl(inv.slug)} target="_blank" rel="noopener noreferrer" style={btnActionLight}>Público</a>
                      <Link href={`/admin/invitations/${inv.id}/edit`} style={btnActionEdit}>Editar</Link>
                      <AdminInvitationActions id={inv.id} isDeleted={isDeleted} deletedAt={inv.deleted_at} />
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

const inputStyle:     React.CSSProperties = { padding: '.5rem .75rem', border: '1px solid #E8E4DE', borderRadius: 8, fontSize: '.8125rem', color: '#1A1510', background: '#FAFAF8', minWidth: 140 };
const selectStyle:    React.CSSProperties = { ...inputStyle };
const btnDark:        React.CSSProperties = { padding: '.5rem 1.125rem', background: '#17120E', color: '#F5F0E8', border: 'none', borderRadius: 8, fontSize: '.8125rem', cursor: 'pointer', fontWeight: 700 };
const btnLight:       React.CSSProperties = { padding: '.5rem 1rem', background: '#F0ECE7', color: '#4A4742', border: 'none', borderRadius: 8, fontSize: '.8125rem', cursor: 'pointer', fontWeight: 600, textDecoration: 'none' };
const btnPrimary:     React.CSSProperties = { padding: '.625rem 1.25rem', background: '#17120E', color: '#F5F0E8', border: 'none', borderRadius: 8, fontSize: '.875rem', cursor: 'pointer', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' };
const thStyle:        React.CSSProperties = { padding: '.625rem 1rem', fontSize: '.68rem', textTransform: 'uppercase', letterSpacing: '.1em', color: '#B0A898', fontWeight: 700, textAlign: 'left', whiteSpace: 'nowrap' };
const tdStyle:        React.CSSProperties = { padding: '.75rem 1rem', fontSize: '.8125rem', color: '#2C2A26', verticalAlign: 'middle' };
const btnAction:      React.CSSProperties = { padding: '.3rem .75rem', background: '#17120E', color: '#F5F0E8', borderRadius: 6, fontSize: '.7rem', fontWeight: 700, textDecoration: 'none' };
const btnActionLight: React.CSSProperties = { padding: '.3rem .75rem', background: '#F0ECE7', color: '#4A4742', borderRadius: 6, fontSize: '.7rem', fontWeight: 600, textDecoration: 'none' };
const btnActionEdit:  React.CSSProperties = { padding: '.3rem .75rem', background: '#FEF3C7', color: '#B45309', borderRadius: 6, fontSize: '.7rem', fontWeight: 700, textDecoration: 'none' };
