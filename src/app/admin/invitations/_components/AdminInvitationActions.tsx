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
          background: canRestore ? '#DCFCE7' : '#F3F4F6',
          color: canRestore ? '#16A34A' : '#9CA3AF',
          borderRadius: 6,
          fontSize: '.7rem',
          fontWeight: 700,
          border: 'none',
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
        <span style={{ fontSize: '.65rem', color: '#DC2626', fontWeight: 600, whiteSpace: 'nowrap' }}>¿Eliminar?</span>
        <button
          onClick={() => {
            setConfirming(false);
            startTransition(async () => {
              await softDeleteInvitation(id);
            });
          }}
          disabled={pending}
          style={{ padding: '.25rem .5rem', background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: 6, fontSize: '.65rem', fontWeight: 700, cursor: 'pointer' }}
        >
          Sí
        </button>
        <button
          onClick={() => setConfirming(false)}
          style={{ padding: '.25rem .5rem', background: '#F3F4F6', color: '#6B7280', border: 'none', borderRadius: 6, fontSize: '.65rem', fontWeight: 600, cursor: 'pointer' }}
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
        background: '#FEE2E2',
        color: '#DC2626',
        borderRadius: 6,
        fontSize: '.7rem',
        fontWeight: 700,
        border: 'none',
        cursor: 'pointer',
        opacity: pending ? 0.6 : 1,
        whiteSpace: 'nowrap',
      }}
    >
      Eliminar
    </button>
  );
}
