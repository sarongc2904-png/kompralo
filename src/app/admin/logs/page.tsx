import type { Metadata } from 'next';
import Link from 'next/link';
import { requireAdmin } from '@/lib/admin';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Audit Logs — Admin Kompralo' };

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat('es-MX', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

interface Props { searchParams: Promise<Record<string, string | undefined>> }

export default async function AdminLogsPage({ searchParams }: Props) {
  await requireAdmin();
  const sp = await searchParams;
  const filterAction     = sp.action     ?? '';
  const filterEmail      = sp.email      ?? '';
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

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1610', margin: '0 0 .25rem' }}>Audit Logs</h1>
        <p style={{ fontSize: '.8125rem', color: '#8a8580', margin: 0 }}>{logs.length} registro(s)</p>
      </div>

      {/* Filters */}
      <form method="get" style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', marginBottom: '1.5rem', padding: '1rem', background: '#fff', border: '1px solid #e5e2dc', borderRadius: 10 }}>
        <input name="email"       defaultValue={filterEmail}      placeholder="Admin email"   style={inputStyle} />
        <input name="action"      defaultValue={filterAction}     placeholder="Acción"        style={inputStyle} />
        <select name="entity_type" defaultValue={filterEntityType} style={selectStyle}>
          <option value="">Todos los tipos</option>
          {['invitation', 'order', 'recovery'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <input name="entity_id" defaultValue={filterEntityId} placeholder="Entity ID" style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '.8rem' }} />
        <button type="submit" style={btnStyle}>Filtrar</button>
        <Link href="/admin/logs" style={{ ...btnStyle, background: '#f0ede8', color: '#4a4742', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>Limpiar</Link>
      </form>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', border: '1px solid #e5e2dc', borderRadius: 10, overflow: 'hidden' }}>
          <thead>
            <tr style={{ background: '#f8f7f5', borderBottom: '1px solid #e5e2dc' }}>
              {['Fecha', 'Admin', 'Acción', 'Entidad', 'Entity ID', 'Detalle'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#8a8580' }}>Sin registros</td></tr>
            )}
            {(logs as Record<string, unknown>[]).map(log => {
              const entityId = log.entity_id as string | null;
              const entityType = log.entity_type as string;
              const afterObj = log.after as Record<string, unknown> | null;
              return (
                <tr key={log.id as string} style={{ borderBottom: '1px solid #f0ede8' }}>
                  <td style={tdStyle}><span style={{ fontSize: '.75rem', color: '#8a8580', whiteSpace: 'nowrap' }}>{fmtDate(log.created_at as string)}</span></td>
                  <td style={tdStyle}><span style={{ fontSize: '.8rem' }}>{log.admin_email as string}</span></td>
                  <td style={tdStyle}>
                    <code style={{ fontSize: '.75rem', color: '#1a1610', background: '#f0ede8', padding: '2px 6px', borderRadius: 4 }}>{log.action as string}</code>
                  </td>
                  <td style={tdStyle}><span style={{ fontSize: '.75rem', color: '#8a8580' }}>{entityType}</span></td>
                  <td style={tdStyle}>
                    {entityId && entityType === 'invitation' ? (
                      <Link href={`/admin/invitations/${entityId}`} style={{ fontFamily: 'monospace', fontSize: '.7rem', color: '#2563eb' }}>{entityId.slice(0, 8)}…</Link>
                    ) : entityId ? (
                      <span style={{ fontFamily: 'monospace', fontSize: '.7rem', color: '#8a8580' }}>{entityId.slice(0, 8)}…</span>
                    ) : '—'}
                  </td>
                  <td style={tdStyle}>
                    {afterObj ? (
                      <details style={{ cursor: 'pointer' }}>
                        <summary style={{ fontSize: '.75rem', color: '#4a4742' }}>ver</summary>
                        <pre style={{ fontSize: '.65rem', margin: '.25rem 0 0', color: '#4a4742', whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxWidth: 300 }}>
                          {JSON.stringify(afterObj, null, 2)}
                        </pre>
                      </details>
                    ) : '—'}
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

const inputStyle: React.CSSProperties  = { padding: '.5rem .75rem', border: '1px solid #e5e2dc', borderRadius: 8, fontSize: '.8125rem', color: '#1a1610', background: '#fafaf8', minWidth: 140 };
const selectStyle: React.CSSProperties = { ...inputStyle };
const btnStyle: React.CSSProperties    = { padding: '.5rem 1rem', background: '#1a1610', color: '#f1e3c8', border: 'none', borderRadius: 8, fontSize: '.8125rem', cursor: 'pointer', fontWeight: 600 };
const thStyle: React.CSSProperties     = { padding: '.625rem .875rem', fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.1em', color: '#8a8580', fontWeight: 700, textAlign: 'left', whiteSpace: 'nowrap' };
const tdStyle: React.CSSProperties     = { padding: '.625rem .875rem', fontSize: '.8125rem', color: '#2c2a26', verticalAlign: 'middle' };
