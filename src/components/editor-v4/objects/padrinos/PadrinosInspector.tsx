'use client';

import React from 'react';
import type { InspectorProps } from '../../core/editor-types';

interface PadrinoEntry {
  rubro: string;
  names: string[];
}

function parsePadrinos(raw?: string): PadrinoEntry[] {
  try {
    return (JSON.parse(raw || '[]') as PadrinoEntry[]).filter(
      (p) => p && typeof p.rubro === 'string',
    );
  } catch {
    return [];
  }
}

export function PadrinosInspector({ element, isMobileSheet }: InspectorProps) {
  const planId = element.meta?.planId ?? '';
  const padrinos = parsePadrinos(element.meta?.padrinosJson);

  const isDeluxe = planId === 'deluxe';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      paddingBottom: isMobileSheet ? 12 : undefined,
    }}>
      {!isMobileSheet && (
        <div style={{ height: 1, background: 'rgba(200,167,93,0.15)', marginBottom: 4 }} />
      )}

      {/* Plan gate */}
      {!isDeluxe && (
        <div style={{
          background: 'rgba(116,84,38,0.06)',
          border: '1px solid rgba(116,84,38,0.18)',
          borderRadius: 10,
          padding: '14px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          alignItems: 'flex-start',
        }}>
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#7B5E3A',
            background: 'rgba(116,84,38,0.12)',
            borderRadius: 6,
            padding: '2px 8px',
            letterSpacing: '0.04em',
          }}>
            🔒 Requiere Plan Deluxe
          </span>
          <p style={{ fontSize: 12, color: '#9B8878', lineHeight: 1.5, margin: 0 }}>
            La sección de Padrinos agrupa a quienes hacen posible tu celebración. Mejora tu plan para activarla.
          </p>
        </div>
      )}

      {/* Hint */}
      {isDeluxe && (
        <div style={{
          background: 'rgba(200,167,93,0.07)',
          border: '1px solid rgba(200,167,93,0.2)',
          borderRadius: 8,
          padding: '10px 12px',
        }}>
          <p style={{ fontSize: 12, color: '#9B8878', lineHeight: 1.5, margin: 0 }}>
            Toca el rubro o los nombres directamente en la invitación para editarlos. Para agregar o eliminar categorías, usa el editor clásico.
          </p>
        </div>
      )}

      {/* Padrinos list */}
      {isDeluxe && padrinos.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {padrinos.map((p, i) => (
            <div
              key={i}
              style={{
                background: '#FAFAF8',
                borderRadius: 8,
                border: '1px solid rgba(200,167,93,0.15)',
                padding: '10px 14px',
              }}
            >
              <p style={{
                fontSize: 10,
                fontWeight: 700,
                color: '#C5A880',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                margin: '0 0 6px',
              }}>
                {p.rubro}
              </p>
              {p.names.map((name, ni) => (
                <p key={ni} style={{ fontSize: 13, color: '#3D2B1F', margin: '2px 0 0', lineHeight: 1.4 }}>
                  {name}
                </p>
              ))}
            </div>
          ))}
        </div>
      )}

      {isDeluxe && padrinos.length === 0 && (
        <p style={{ fontSize: 12, color: '#C0AF9F', fontStyle: 'italic', margin: 0 }}>
          Aún no hay padrinos registrados.
        </p>
      )}
    </div>
  );
}
