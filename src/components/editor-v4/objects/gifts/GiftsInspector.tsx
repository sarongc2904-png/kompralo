'use client';

import React from 'react';
import type { InspectorProps } from '../../core/editor-types';
import { SectionVisibilityToggle } from '../../components/SectionVisibilityToggle';

export function GiftsInspector({ element, invitationId, isMobileSheet, onSaved }: InspectorProps) {
  const slug     = element.meta?.slug     ?? '';
  const isHidden = element.meta?.isHidden === 'true';
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      paddingBottom: isMobileSheet ? 12 : undefined,
    }}>
      {!isMobileSheet && (
        <div style={{ height: 1, background: 'rgba(200,167,93,0.15)', marginBottom: 4 }} />
      )}

      <SectionVisibilityToggle
        sectionId="gifts"
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
        <p style={{ fontSize: 13, color: '#5C4A3E', fontWeight: 600, margin: '0 0 6px' }}>
          Mesa de Regalos
        </p>
        <p style={{ fontSize: 12, color: '#9B8878', lineHeight: 1.6, margin: 0 }}>
          Toca directamente el texto en la invitación para editar el proveedor, descripción, link y datos bancarios de cada opción de regalo.
        </p>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        padding: '10px 14px',
        background: '#FAFAF8',
        borderRadius: 8,
        border: '1px solid rgba(200,167,93,0.15)',
      }}>
        <p style={{ fontSize: 11, color: '#9B8878', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
          Campos editables inline
        </p>
        {[
          'Proveedor (Amazon, Liverpool, etc.)',
          'Descripción',
          'Link / URL',
          'Banco, titular, CLABE',
        ].map((field) => (
          <div key={field} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#C5A880', fontSize: 12 }}>✓</span>
            <span style={{ fontSize: 12, color: '#6B5B4E' }}>{field}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
