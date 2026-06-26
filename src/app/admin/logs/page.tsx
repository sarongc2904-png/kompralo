import type { Metadata } from 'next';
import Link from 'next/link';
import { requireAdmin } from '@/lib/admin';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Audit Logs — Admin Kompralo' };

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat('es-MX', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

const ACTION_BADGE: Record<string, { bg: string; color: string }> = {
  'invitation.create': { bg: '#E7F5EC', color: '#247A45' },
  'invitation.update': { bg: 'rgba(37,99,235,0.1)', color: '#2563EB' },
  'invitation.delete': { bg: '#FBEAEA', color: '#B43232' },
  'order.create':      { bg: '#E7F5EC', color: '#247A45' },
  'order.update':      { bg: 'rgba(37,99,235,0.1)', color: '#2563EB' },
  'recovery.create':   { bg: 'rgba(124,58,237,0.1)', color: '#7C3AED' },
};

const ENTITY_BADGE: Record<string, { bg: string; color: string }> = {
  invitation: { bg: '#FBF5E3', color: '#A07C2E' },
  order:      { bg: 'rgba(37,99,235,0.1)', color: '#2563EB' },
  recovery:   { bg: 'rgba(124,58,237,0.1)', color: '#7C3AED' },
};

interface Props { searchParams: Promise<Record<string, string | undefined>> }

export default async function AdminLogsPage({ searchParams }: Props) {
  await requireAdmin();
  const sp = await searchParams;
  const filterAction     = sp.action      ?? '';
  const filterEmail      = sp.email       ?? '';
  const filterEntityType = sp.entity_type ?? '';
  const filterEntityId   = sp.entity_id   ?? '';

  const svc = createServiceRoleSupabaseClient();
  let query = svc
    .from('admin_audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  if (filterAction)     query = query.ilike('action', `%${filterAction}%`);
  if (filterEmail)      query = query.ilike('admin_email', `%${filterEmail}%`);
  if (filterEntityType) query = query.eq('entity_type', filterEntityType);
  if (filterEntityId)   query = query.eq('entity_id', filterEntityId);

  const { data: logsRaw } = await query;
  const logs = logsRaw ?? [];

  const hasFilters = !!(filterAction || filterEmail || filterEntityType || filterEntityId);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '.65rem', fontWeight: 800, letterSpacing: '.22em', textTransform: 'uppercase', color: '#C8A95B', margin: '0 0 .25rem' }}>
          Admin
        </p>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#241A14', margin: '0 0 .25rem' }}>Audit Logs</h1>
        <p style={{ fontSize: '.8125rem', color: '#7A6A5B', margin: 0 }}>
          {logs.length} registro{logs.length !== 1 ? 's' : ''}
          {hasFilters && <> · <span style={{ color: '#C8A95B', fontWeight: 600 }}>Filtros activos</span></>}
        </p>
      </div>

      {/* Filters */}
      <form method="get" style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', marginBottom: '1.5rem', padding: '1rem 1.25rem', background: '#FFFBF4', border: '1px solid #E5D2A8', borderRadius: 12 }}>
        <input name="email"      defaultValue={filterEmail}      placeholder="Admin email"       style={inputStyle} />
        <input name="action"     defaultValue={filterAction}     placeholder="Acción (ej. invitation.create)" style={inputStyle} />
        <select name="entity_type" defaultValue={filterEntityType} style={selectStyle}>
          <option value="">Todos los tipos</option>
          {['invitation', 'order', 'recovery'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <input name="entity_id" defaultValue={filterEntityId} placeholder="Entity ID (UUID)" style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '.8rem', minWidth: 200 }} />
        <button type="submit" style={btnDark}>Filtrar</button>
        <Link href="/admin/logs" style={{ ...btnLight, display: 'inline-flex', alignItems: 'center' }}>Limpiar</Link>
      </form>

      {/* Table */}
      <div style={{ overflowX: 'auto', background: '#FFFBF4', border: '1px solid #E5D2A8', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#FAF3E6', borderBottom: '1px solid #E5D2A8' }}>
              {['Fecha','Admin','Acción','Entidad','Entity ID','Detalle'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#7A6A5B', fontSize: '.875rem' }}>
                  Sin registros que coincidan
                </td>
              </tr>
            )}
            {(logs as Record<string, unknown>[]).map(log => {
              const entityId   = log.entity_id as string | null;
              const entityType = log.entity_type as string;
              const action     = log.action as string;
              const afterObj   = log.after as Record<string, unknown> | null;
              const actionBadge = ACTION_BADGE[action];
              const entityBadge = ENTITY_BADGE[entityType];

              return (
                <tr key={log.id as string} style={{ borderBottom: '1px solid rgba(200,169,91,0.12)' }}>
                  <td style={tdStyle}>
                    <span style={{ fontSize: '.75rem', color: '#7A6A5B', whiteSpace: 'nowrap' }}>
                      {fmtDate(log.created_at as string)}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: '.8rem', color: '#241A14' }}>{log.admin_email as string}</span>
                  </td>
                  <td style={tdStyle}>
                    {actionBadge ? (
                      <span style={{ display: 'inline-block', background: actionBadge.bg, color: actionBadge.color, fontSize: '.7rem', fontWeight: 700, padding: '.2rem .65rem', borderRadius: 20, whiteSpace: 'nowrap' }}>
                        {action}
                      </span>
                    ) : (
                      <code style={{ fontSize: '.75rem', color: '#241A14', background: '#FAF3E6', padding: '.2rem .5rem', borderRadius: 4 }}>{action}</code>
                    )}
                  </td>
                  <td style={tdStyle}>
                    {entityBadge ? (
                      <span style={{ display: 'inline-block', background: entityBadge.bg, color: entityBadge.color, fontSize: '.7rem', fontWeight: 700, padding: '.2rem .65rem', borderRadius: 20 }}>
                        {entityType}
                      </span>
                    ) : (
                      <span style={{ fontSize: '.75rem', color: '#7A6A5B' }}>{entityType}</span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    {entityId && entityType === 'invitation' ? (
                      <Link href={`/admin/invitations/${entityId}`} style={{ fontFamily: 'monospace', fontSize: '.7rem', color: '#2563EB', textDecoration: 'none' }}>
                        {entityId.slice(0, 8)}…
                      </Link>
                    ) : entityId ? (
                      <span style={{ fontFamily: 'monospace', fontSize: '.7rem', color: '#7A6A5B' }}>{entityId.slice(0, 8)}…</span>
                    ) : (
                      <span style={{ color: '#E5D2A8' }}>—</span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    {afterObj ? (
                      <details style={{ cursor: 'pointer' }}>
                        <summary style={{ fontSize: '.75rem', color: '#7A6A5B', fontWeight: 600 }}>Ver detalle</summary>
                        <pre style={{ fontSize: '.65rem', margin: '.375rem 0 0', color: '#241A14', whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxWidth: 280, background: '#FAF3E6', padding: '.5rem', borderRadius: 6 }}>
                          {JSON.stringify(afterObj, null, 2)}
                        </pre>
                      </details>
                    ) : (
                      <span style={{ color: '#E5D2A8' }}>—</span>
                    )}
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

const inputStyle:  React.CSSProperties = { padding: '.5rem .75rem', border: '1px solid #E5D2A8', borderRadius: 8, fontSize: '.8125rem', color: '#241A14', background: '#FAF3E6', minWidth: 160 };
const selectStyle: React.CSSProperties = { ...inputStyle };
const btnDark:     React.CSSProperties = { padding: '.5rem 1.125rem', background: '#1C1713', color: '#FFF7EA', border: 'none', borderRadius: 8, fontSize: '.8125rem', cursor: 'pointer', fontWeight: 700 };
const btnLight:    React.CSSProperties = { padding: '.5rem 1rem', background: '#FFFBF4', color: '#1C1713', border: '1px solid #C8A95B', borderRadius: 8, fontSize: '.8125rem', cursor: 'pointer', fontWeight: 600, textDecoration: 'none' };
const thStyle:     React.CSSProperties = { padding: '.625rem 1rem', fontSize: '.68rem', textTransform: 'uppercase', letterSpacing: '.1em', color: '#7A6A5B', fontWeight: 700, textAlign: 'left', whiteSpace: 'nowrap' };
const tdStyle:     React.CSSProperties = { padding: '.75rem 1rem', fontSize: '.8125rem', color: '#241A14', verticalAlign: 'middle' };
