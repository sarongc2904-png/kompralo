'use client';

import React from 'react';
import type { InspectorProps } from '../../core/editor-types';

interface ParentsData {
  brideFather: string;
  brideMother: string;
  groomFather: string;
  groomMother: string;
}

function parseParents(raw?: string): ParentsData {
  try {
    const parsed = JSON.parse(raw || '{}') as Partial<ParentsData>;
    return {
      brideFather: parsed.brideFather ?? '',
      brideMother: parsed.brideMother ?? '',
      groomFather: parsed.groomFather ?? '',
      groomMother: parsed.groomMother ?? '',
    };
  } catch {
    return { brideFather: '', brideMother: '', groomFather: '', groomMother: '' };
  }
}

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: '#9B8878',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: 2,
};

const nameStyle: React.CSSProperties = {
  fontSize: 13,
  color: '#3D2B1F',
  fontWeight: 500,
};

const emptyStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#C0AF9F',
  fontStyle: 'italic',
};

export function ParentsInspector({ element, isMobileSheet }: InspectorProps) {
  const planId = element.meta?.planId ?? '';
  const parents = parseParents(element.meta?.parentsJson);

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
            La sección de Familias muestra a los padres de los novios. Mejora tu plan para activarla.
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
            Toca los nombres directamente en la invitación para editarlos.
          </p>
        </div>
      )}

      {/* Parents grid */}
      {isDeluxe && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Bride side */}
          <div style={{
            background: '#FAFAF8',
            borderRadius: 8,
            border: '1px solid rgba(200,167,93,0.15)',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}>
            <p style={{ ...labelStyle, color: '#C5A880', marginBottom: 4 }}>Familia de la novia</p>

            <div>
              <p style={labelStyle}>Papá</p>
              {parents.brideFather
                ? <p style={nameStyle}>{parents.brideFather}</p>
                : <p style={emptyStyle}>Sin nombre</p>}
            </div>

            <div>
              <p style={labelStyle}>Mamá</p>
              {parents.brideMother
                ? <p style={nameStyle}>{parents.brideMother}</p>
                : <p style={emptyStyle}>Sin nombre</p>}
            </div>
          </div>

          {/* Groom side */}
          <div style={{
            background: '#FAFAF8',
            borderRadius: 8,
            border: '1px solid rgba(200,167,93,0.15)',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}>
            <p style={{ ...labelStyle, color: '#C5A880', marginBottom: 4 }}>Familia del novio</p>

            <div>
              <p style={labelStyle}>Papá</p>
              {parents.groomFather
                ? <p style={nameStyle}>{parents.groomFather}</p>
                : <p style={emptyStyle}>Sin nombre</p>}
            </div>

            <div>
              <p style={labelStyle}>Mamá</p>
              {parents.groomMother
                ? <p style={nameStyle}>{parents.groomMother}</p>
                : <p style={emptyStyle}>Sin nombre</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
