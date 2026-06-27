'use client';

import React, { useState } from 'react';
import { updateSectionVisibility } from '@/app/dashboard/invitations/[id]/edit/actions';

interface SectionVisibilityToggleProps {
  sectionId: string;
  hidden: boolean;
  invitationId: string;
  slug: string;
  onSaved: () => void;
}

export function SectionVisibilityToggle({
  sectionId,
  hidden,
  invitationId,
  slug,
  onSaved,
}: SectionVisibilityToggleProps) {
  const [loading, setLoading] = useState(false);
  const [localHidden, setLocalHidden] = useState(hidden);

  async function toggle() {
    setLoading(true);
    const nextHidden = !localHidden;
    const result = await updateSectionVisibility({
      id: invitationId,
      slug,
      sectionId,
      hidden: nextHidden,
    });
    setLoading(false);
    if (result.success) {
      setLocalHidden(nextHidden);
      onSaved();
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        width: '100%',
        padding: '8px 0',
        borderRadius: 8,
        border: localHidden
          ? '1px solid rgba(200,167,93,0.4)'
          : '1px solid rgba(180,60,60,0.25)',
        background: localHidden
          ? 'rgba(200,167,93,0.08)'
          : 'rgba(180,60,60,0.06)',
        color: localHidden ? '#C9A96E' : '#B04040',
        fontSize: 12,
        fontWeight: 600,
        cursor: loading ? 'default' : 'pointer',
        opacity: loading ? 0.6 : 1,
        fontFamily: 'inherit',
        transition: 'opacity 150ms',
      }}
    >
      <span style={{ fontSize: 14 }}>{localHidden ? '👁' : '🙈'}</span>
      {loading
        ? 'Guardando…'
        : localHidden
          ? 'Mostrar sección'
          : 'Ocultar sección'}
    </button>
  );
}
