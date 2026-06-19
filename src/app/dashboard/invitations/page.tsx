import Link from 'next/link';
import { invitationRepository } from '@/domain/invitations';
import type { InvitationContent } from '@/domain/invitations';

export const metadata = { title: 'Invitaciones — Kompralo Admin' };

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  published:       { bg: '#E8F5E9', text: '#388E3C' },
  paid:            { bg: '#E3F2FD', text: '#1565C0' },
  draft:           { bg: '#F3F3F3', text: '#757575' },
  preview:         { bg: '#FFF8E1', text: '#F57F17' },
  pending_payment: { bg: '#FFF3E0', text: '#E65100' },
  archived:        { bg: '#EFEBE9', text: '#4E342E' },
  deleted:         { bg: '#FCE4EC', text: '#B71C1C' },
};

function statusStyle(status: string) {
  return STATUS_COLORS[status] ?? { bg: '#F3F3F3', text: '#757575' };
}

function Row({ inv }: { inv: InvitationContent }) {
  const { bg, text } = statusStyle(inv.status);
  return (
    <tr style={{ borderBottom: '1px solid #F0EBE4' }}>
      <td className="py-3 pr-4">
        <p className="text-sm font-medium" style={{ color: '#1A1410' }}>
          {inv.title}
        </p>
        <p className="text-xs mt-0.5" style={{ color: '#9B8878' }}>
          /{inv.slug}
        </p>
      </td>
      <td className="py-3 pr-4">
        <span className="text-xs capitalize" style={{ color: '#6B5B4E' }}>
          {inv.category}
        </span>
      </td>
      <td className="py-3 pr-4">
        <span className="text-xs" style={{ color: '#6B5B4E' }}>
          {inv.themeId}
        </span>
      </td>
      <td className="py-3 pr-4">
        <span className="text-xs uppercase" style={{ color: '#6B5B4E' }}>
          {inv.planId}
        </span>
      </td>
      <td className="py-3 pr-4">
        <span
          className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded"
          style={{ background: bg, color: text }}
        >
          {inv.status}
        </span>
      </td>
      <td className="py-3">
        <div className="flex gap-3">
          <Link
            href={`/dashboard/invitations/${inv.id}/edit`}
            className="text-xs underline"
            style={{ color: '#388E3C' }}
          >
            Editar
          </Link>
          <Link
            href={`/i/${inv.slug}`}
            target="_blank"
            className="text-xs underline"
            style={{ color: '#C5A880' }}
          >
            Público
          </Link>
          <Link
            href={`/preview/${inv.id}`}
            target="_blank"
            className="text-xs underline"
            style={{ color: '#8B9DC3' }}
          >
            Preview
          </Link>
        </div>
      </td>
    </tr>
  );
}

export default async function InvitationsPage() {
  const invitations = await invitationRepository.list();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-light" style={{ color: '#1A1410' }}>
          Invitaciones
        </h1>
        <p className="text-sm mt-1" style={{ color: '#9B8878' }}>
          {invitations.length} invitación{invitations.length !== 1 ? 'es' : ''} en total
        </p>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #E8E2DA' }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid #F0EBE4', background: '#FAFAF8' }}>
              {['Título / Slug', 'Categoría', 'Tema', 'Plan', 'Estado', 'Acciones'].map((h) => (
                <th
                  key={h}
                  className="py-3 pr-4 text-left text-[10px] uppercase tracking-widest"
                  style={{ color: '#9B8878' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invitations.map((inv) => (
              <Row key={inv.id} inv={inv} />
            ))}
          </tbody>
        </table>

        {invitations.length === 0 && (
          <p className="text-center py-12 text-sm" style={{ color: '#9B8878' }}>
            No hay invitaciones todavía.
          </p>
        )}
      </div>
    </div>
  );
}
