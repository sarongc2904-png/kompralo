import { redirect } from 'next/navigation';
import { invitationRepository } from '@/domain/invitations';
import { rsvpRepository } from '@/domain/rsvp';
import type { RSVPResponse } from '@/domain/rsvp';

function isAdminMode(): boolean {
  return process.env.ADMIN_ACCESS_ENABLED === 'true';
}

export const metadata = { title: 'RSVPs — Kompralo Admin' };

const ATTENDANCE_LABEL: Record<string, string> = {
  yes:   'Asiste',
  no:    'No asiste',
  maybe: 'Tal vez',
};

const ATTENDANCE_COLOR: Record<string, { bg: string; text: string }> = {
  yes:   { bg: '#E8F5E9', text: '#388E3C' },
  no:    { bg: '#FCE4EC', text: '#B71C1C' },
  maybe: { bg: '#FFF8E1', text: '#F57F17' },
};

function RSVPRow({ rsvp }: { rsvp: RSVPResponse }) {
  const { bg, text } = ATTENDANCE_COLOR[rsvp.attendance] ?? { bg: '#F3F3F3', text: '#757575' };
  return (
    <tr style={{ borderBottom: '1px solid #F0EBE4' }}>
      <td className="py-3 pr-4 text-sm" style={{ color: '#1A1410' }}>
        {rsvp.name}
      </td>
      <td className="py-3 pr-4">
        <span
          className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded"
          style={{ background: bg, color: text }}
        >
          {ATTENDANCE_LABEL[rsvp.attendance] ?? rsvp.attendance}
        </span>
      </td>
      <td className="py-3 pr-4 text-sm text-center" style={{ color: '#6B5B4E' }}>
        {rsvp.guestCount}
      </td>
      <td className="py-3 pr-4 text-xs" style={{ color: '#9B8878' }}>
        {rsvp.phone ?? '—'}
      </td>
      <td className="py-3 text-xs" style={{ color: '#9B8878' }}>
        {rsvp.message ?? '—'}
      </td>
    </tr>
  );
}

interface InvitationRSVPGroup {
  invitationId: string;
  title: string;
  slug: string;
  rsvps: RSVPResponse[];
  yesCount: number;
  noCount: number;
  maybeCount: number;
}

export default async function RSVPsPage() {
  if (!isAdminMode()) redirect('/cliente');

  const invitations = await invitationRepository.list();

  const groups: InvitationRSVPGroup[] = await Promise.all(
    invitations.map(async (inv) => {
      const rsvps = await rsvpRepository.listByInvitationId(inv.id);
      return {
        invitationId: inv.id,
        title: inv.title,
        slug: inv.slug,
        rsvps,
        yesCount:   rsvps.filter((r) => r.attendance === 'yes').length,
        noCount:    rsvps.filter((r) => r.attendance === 'no').length,
        maybeCount: rsvps.filter((r) => r.attendance === 'maybe').length,
      };
    }),
  );

  const totalRSVPs = groups.reduce((sum, g) => sum + g.rsvps.length, 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-light" style={{ color: '#1A1410' }}>
          RSVPs
        </h1>
        <p className="text-sm mt-1" style={{ color: '#9B8878' }}>
          {totalRSVPs} respuesta{totalRSVPs !== 1 ? 's' : ''} en total
        </p>
      </div>

      {totalRSVPs === 0 && (
        <div
          className="rounded-xl p-8 text-center"
          style={{ background: '#FFFFFF', border: '1px solid #E8E2DA' }}
        >
          <p className="text-sm" style={{ color: '#9B8878' }}>
            RSVPs conectados al repository — pendientes de datos reales.
          </p>
          <p className="text-xs mt-2" style={{ color: '#C0B0A0' }}>
            Cuando los invitados confirmen asistencia aparecerán aquí.
          </p>
        </div>
      )}

      <div className="space-y-8">
        {groups.filter((g) => g.rsvps.length > 0).map((group) => (
          <div
            key={group.invitationId}
            className="rounded-xl overflow-hidden"
            style={{ background: '#FFFFFF', border: '1px solid #E8E2DA' }}
          >
            {/* Group header */}
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{ borderBottom: '1px solid #F0EBE4', background: '#FAFAF8' }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: '#1A1410' }}>
                  {group.title}
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#9B8878' }}>
                  /{group.slug}
                </p>
              </div>
              <div className="flex gap-4 text-xs">
                <span style={{ color: '#388E3C' }}>✓ {group.yesCount} asisten</span>
                <span style={{ color: '#F57F17' }}>? {group.maybeCount} tal vez</span>
                <span style={{ color: '#B71C1C' }}>✗ {group.noCount} no asisten</span>
              </div>
            </div>

            {/* RSVP table */}
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid #F0EBE4' }}>
                  {['Nombre', 'Asistencia', 'Invitados', 'Teléfono', 'Mensaje'].map((h) => (
                    <th
                      key={h}
                      className="px-0 py-2 pr-4 text-left text-[10px] uppercase tracking-widest"
                      style={{ color: '#9B8878', paddingLeft: h === 'Nombre' ? '1.5rem' : 0 }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {group.rsvps.map((rsvp) => (
                  <RSVPRow key={rsvp.id} rsvp={rsvp} />
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
