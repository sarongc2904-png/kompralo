'use client';

import React from 'react';
import type { InspectorProps } from '../../core/editor-types';
import { SectionVisibilityToggle } from '../../components/SectionVisibilityToggle';

export function HotelsInspector({ element, invitationId, isMobileSheet, onSaved }: InspectorProps) {
  const slug     = element.meta?.slug     ?? '';
  const isHidden = element.meta?.isHidden === 'true';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: isMobileSheet ? 12 : undefined }}>
      {!isMobileSheet && (
        <div style={{ height: 1, background: 'rgba(200,167,93,0.15)', marginBottom: 4 }} />
      )}

      <SectionVisibilityToggle
        sectionId="hotels"
        hidden={isHidden}
        invitationId={invitationId}
        slug={slug}
        onSaved={onSaved}
      />

      <div style={{
        background: 'rgba(200,167,93,0.07)',
        border: '1px solid rgba(200,167,93,0.2)',
        borderRadius: 8,
        padding: '12px 14px',
      }}>
        <p style={{ fontSize: 13, color: '#5C4A3E', fontWeight: 600, margin: '0 0 4px' }}>
          Hospedaje
        </p>
        <p style={{ fontSize: 12, color: '#9B8878', lineHeight: 1.6, margin: 0 }}>
          Toca directamente los nombres y detalles de los hoteles en la invitación para editarlos.
        </p>
      </div>
    </div>
  );
}
