'use client';

import React from 'react';
import type { InspectorProps } from '../../core/editor-types';

export function CountdownInspector({ element }: InspectorProps) {
  const eventDate = element.meta?.eventDate ?? '';
  const eventTime = element.meta?.eventTime ?? '';

  const formattedDate = eventDate
    ? new Date(eventDate + 'T12:00:00').toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Sin fecha';

  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 16 }}>
        <p style={{
          fontSize: 11, fontWeight: 600, color: '#9B8878',
          textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8,
        }}>
          Fecha del evento
        </p>
        <p style={{ fontSize: 15, fontWeight: 500, color: '#1F1A16', margin: 0 }}>
          {formattedDate}
        </p>
        {eventTime && (
          <p style={{ fontSize: 13, color: '#9B8878', marginTop: 4, marginBottom: 0 }}>
            {eventTime}
          </p>
        )}
      </div>

      <div style={{ borderTop: '1px solid rgba(200,167,93,0.15)', margin: '16px 0' }} />

      <div style={{
        background: '#faf7f2',
        border: '1px solid #e8dfc8',
        borderRadius: 8,
        padding: 12,
      }}>
        <p style={{ fontSize: 12, color: '#9B8878', lineHeight: 1.5, margin: 0 }}>
          Para cambiar la fecha o la hora, ve a la sección{' '}
          <strong style={{ color: '#5C4A3E' }}>Portada</strong>{' '}
          → "Fecha y lugar".
        </p>
      </div>
    </div>
  );
}
