'use client';

import { useState, useTransition } from 'react';
import { softDeleteInvitation, restoreInvitation } from '../actions';

interface Props {
  id: string;
  isDeleted: boolean;
  deletedAt: string | null;
}

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

export function AdminInvitationActions({ id, isDeleted, deletedAt }: Props) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  if (isDeleted) {
    const days = deletedAt ? daysSince(deletedAt) : 0;
    const canRestore = days < 30;
    return (
      <button
        disabled={!canRestore || pending}
        onClick={() => {
          startTransition(async () => {
            await restoreInvitation(id);
          });
        }}
        style={{
          padding: '.3rem .75rem',
          background: canRestore ? '#E7F5EC' : '#FAF3E6',
          color: canRestore ? '#247A45' : '#7A6A5B',
          borderRadius: 6,
          fontSize: '.7rem',
          fontWeight: 700,
          border: `1px solid ${canRestore ? '#B8DFC4' : '#E5D2A8'}`,
          cursor: canRestore ? 'pointer' : 'not-allowed',
          opacity: pending ? 0.6 : 1,
          whiteSpace: 'nowrap',
        }}
        title={!canRestore ? `Eliminado hace ${days} días — no se puede recuperar` : `Recuperar (eliminado hace ${days} días)`}
      >
        {pending ? '...' : `Recuperar${canRestore ? ` (${days}d)` : ' — vencido'}`}
      </button>
    );
  }

  if (confirming) {
    return (
      <div style={{ display: 'flex', gap: '.25rem', alignItems: 'center' }}>
        <span style={{ fontSize: '.65rem', color: '#B43232', fontWeight: 600, whiteSpace: 'nowrap' }}>¿Eliminar?</span>
        <button
          onClick={() => {
            setConfirming(false);
            startTransition(async () => {
              await softDeleteInvitation(id);
            });
          }}
          disabled={pending}
          style={{ padding: '.25rem .5rem', background: '#FBEAEA', color: '#B43232', border: '1px solid #F5C0C0', borderRadius: 6, fontSize: '.65rem', fontWeight: 700, cursor: 'pointer' }}
        >
          Sí
        </button>
        <button
          onClick={() => setConfirming(false)}
          style={{ padding: '.25rem .5rem', background: '#FAF3E6', color: '#7A6A5B', border: '1px solid #E5D2A8', borderRadius: 6, fontSize: '.65rem', fontWeight: 600, cursor: 'pointer' }}
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      disabled={pending}
      style={{
        padding: '.3rem .75rem',
        background: '#FBEAEA',
        color: '#B43232',
        borderRadius: 6,
        fontSize: '.7rem',
        fontWeight: 700,
        border: '1px solid #F5C0C0',
        cursor: 'pointer',
        opacity: pending ? 0.6 : 1,
        whiteSpace: 'nowrap',
      }}
    >
      Eliminar
    </button>
  );
}
