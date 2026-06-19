import { redirect } from 'next/navigation';
import { invitationRepository } from '@/domain/invitations';
import { rsvpRepository } from '@/domain/rsvp';

// Non-admin customers should go to /cliente, not the admin dashboard.
function isAdminMode(): boolean {
  return process.env.ADMIN_ACCESS_ENABLED === 'true';
}

export const metadata = { title: 'Dashboard — Kompralo Admin' };

interface StatCardProps {
  label: string;
  value: number | string;
  sub?: string;
}

function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div
      className="rounded-xl p-6"
      style={{ background: '#FFFFFF', border: '1px solid #E8E2DA' }}
    >
      <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#9B8878' }}>
        {label}
      </p>
      <p className="text-4xl font-light" style={{ color: '#1A1410' }}>
        {value}
      </p>
      {sub && (
        <p className="text-xs mt-1" style={{ color: '#B0A090' }}>
          {sub}
        </p>
      )}
    </div>
  );
}

export default async function DashboardPage() {
  if (!isAdminMode()) redirect('/cliente');

  const invitations = await invitationRepository.list();

  const total = invitations.length;
  const published = invitations.filter((i) => i.status === 'published').length;
  const pending = invitations.filter((i) =>
    ['draft', 'preview', 'pending_payment'].includes(i.status),
  ).length;

  // Count all RSVPs across all invitations in parallel
  const rsvpCounts = await Promise.all(
    invitations.map((inv) => rsvpRepository.countByInvitationId(inv.id)),
  );
  const totalRSVPs = rsvpCounts.reduce((sum, n) => sum + n, 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-light" style={{ color: '#1A1410' }}>
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: '#9B8878' }}>
          Vista general de Kompralo
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-10" style={{ maxWidth: 640 }}>
        <StatCard label="Invitaciones" value={total} />
        <StatCard label="Publicadas" value={published} />
        <StatCard label="Pendientes" value={pending} sub="draft · preview · pago pendiente" />
        <StatCard label="RSVPs totales" value={totalRSVPs} sub="suma de todas las invitaciones" />
      </div>

      <div className="rounded-xl p-6" style={{ background: '#FFFFFF', border: '1px solid #E8E2DA', maxWidth: 640 }}>
        <p className="text-xs uppercase tracking-widest mb-4" style={{ color: '#9B8878' }}>
          Invitaciones recientes
        </p>
        <ul className="space-y-3">
          {invitations.slice(0, 5).map((inv) => (
            <li key={inv.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: '#1A1410' }}>
                  {inv.title}
                </p>
                <p className="text-xs" style={{ color: '#9B8878' }}>
                  {inv.category} · {inv.planId}
                </p>
              </div>
              <span
                className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded"
                style={{
                  background: inv.status === 'published' ? '#E8F5E9' : '#FFF8E1',
                  color: inv.status === 'published' ? '#388E3C' : '#F57F17',
                }}
              >
                {inv.status}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
