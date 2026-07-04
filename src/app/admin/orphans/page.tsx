import type { Metadata } from 'next';
import Link from 'next/link';
import { requireAdmin } from '@/lib/admin';
import { findOrphanSessions, type OrphanScanResult } from '@/lib/admin/findOrphanSessions';
import { ReprocessButton } from './ReprocessButton';

export const metadata: Metadata = { title: 'Huérfanos — Admin Kompralo' };
export const dynamic = 'force-dynamic';

function fmt(cents: number | null, currency: string | null): string {
  if (cents == null) return '—';
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: (currency ?? 'mxn').toUpperCase(), minimumFractionDigits: 0 }).format(cents / 100);
}
function fmtDate(epoch: number): string {
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(epoch * 1000));
}

export default async function AdminOrphansPage() {
  await requireAdmin();

  let scan: OrphanScanResult | null = null;
  let error: string | null = null;
  try {
    scan = await findOrphanSessions(45);
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  return (
    <div style={{ maxWidth: 1000 }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/admin" style={{ fontSize: '.8rem', color: '#7A6A5B', textDecoration: 'none' }}>← Resumen</Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#241A14', margin: '.5rem 0 .25rem' }}>Pagos huérfanos</h1>
        <p style={{ fontSize: '.8125rem', color: '#7A6A5B', margin: 0 }}>
          Sesiones de Stripe <strong>pagadas</strong> (últimos {scan?.windowDays ?? 45} días) que no tienen orden en la base.
          Reprocesarlas recrea la orden + invitación y reenvía el acceso.
        </p>
      </div>

      {error && (
        <div style={{ background: '#FBEAEA', border: '1px solid #F5C0C0', borderRadius: 10, padding: '1rem', color: '#B43232', fontSize: '.85rem' }}>
          No se pudo consultar Stripe: {error}
        </div>
      )}

      {scan && (
        <>
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '.8125rem', color: '#7A6A5B' }}>
              Sesiones pagadas escaneadas: <strong style={{ color: '#241A14' }}>{scan.scannedPaid}</strong>
            </span>
            <span style={{ fontSize: '.8125rem', color: scan.orphans.length > 0 ? '#B43232' : '#247A45', fontWeight: 700 }}>
              {scan.orphans.length} huérfano{scan.orphans.length === 1 ? '' : 's'}
            </span>
          </div>

          {scan.orphans.length === 0 ? (
            <div style={{ background: '#E7F5EC', border: '1px solid #B8DFC4', borderRadius: 10, padding: '1.25rem', color: '#247A45', fontSize: '.875rem', fontWeight: 600 }}>
              ✓ Sin huérfanos. Todos los pagos recientes tienen su orden.
            </div>
          ) : (
            <div style={{ overflowX: 'auto', background: '#FFFBF4', border: '1px solid #E5D2A8', borderRadius: 12 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#FAF3E6', borderBottom: '1px solid #E5D2A8' }}>
                    {['Fecha', 'Email', 'Monto', 'Session ID', 'Modo', 'Acción'].map((h) => (
                      <th key={h} style={{ padding: '.625rem .875rem', textAlign: 'left', fontSize: '.7rem', color: '#7A6A5B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {scan.orphans.map((o) => (
                    <tr key={o.sessionId} style={{ borderBottom: '1px solid rgba(200,169,91,0.12)' }}>
                      <td style={{ padding: '.625rem .875rem', fontSize: '.75rem', color: '#7A6A5B', whiteSpace: 'nowrap' }}>{fmtDate(o.created)}</td>
                      <td style={{ padding: '.625rem .875rem', fontSize: '.8rem', color: '#241A14' }}>{o.customerEmail ?? '—'}</td>
                      <td style={{ padding: '.625rem .875rem', fontSize: '.8rem', fontWeight: 700, color: '#241A14', whiteSpace: 'nowrap' }}>{fmt(o.amountTotal, o.currency)}</td>
                      <td style={{ padding: '.625rem .875rem', fontFamily: 'monospace', fontSize: '.7rem', color: '#7A6A5B' }}>{o.sessionId}</td>
                      <td style={{ padding: '.625rem .875rem' }}>
                        <span style={{ fontSize: '.65rem', fontWeight: 800, padding: '.15rem .5rem', borderRadius: 20, background: o.livemode ? '#E7F5EC' : '#F2F2F0', color: o.livemode ? '#247A45' : '#7A6A5B' }}>
                          {o.livemode ? 'LIVE' : 'TEST'}
                        </span>
                      </td>
                      <td style={{ padding: '.625rem .875rem', textAlign: 'right' }}>
                        <ReprocessButton sessionId={o.sessionId} email={o.customerEmail} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
