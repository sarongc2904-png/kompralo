'use client';

import React, { useState } from 'react';
import type { InspectorProps } from '../../core/editor-types';
import { updateInvitationDressCode } from '@/app/dashboard/invitations/[id]/edit/actions';
import type { InvitationDressCode } from '@/domain/invitations';

const MAX_COLORS = 6;
const HEX_RE = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: '#9B8878',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  display: 'block',
  marginBottom: 6,
};

function parseDressCode(raw?: string): InvitationDressCode {
  try {
    const parsed = JSON.parse(raw || '{}') as Partial<InvitationDressCode>;
    return {
      type:           parsed.type           ?? '',
      description:    parsed.description    ?? '',
      suggestions:    parsed.suggestions    ?? '',
      title:          parsed.title          ?? '',
      sectionEyebrow: parsed.sectionEyebrow ?? '',
      observations:   parsed.observations   ?? '',
      primaryColor:   parsed.primaryColor   ?? '',
      secondaryColor: parsed.secondaryColor ?? '',
      suggestionsList: Array.isArray(parsed.suggestionsList) ? parsed.suggestionsList : [],
      colors:          Array.isArray(parsed.colors)          ? parsed.colors          : [],
    };
  } catch {
    return {
      type: '', description: '', suggestions: '',
      title: '', sectionEyebrow: '', observations: '',
      primaryColor: '', secondaryColor: '',
      suggestionsList: [], colors: [],
    };
  }
}

export function DresscodeInspector({
  element,
  invitationId,
  isMobileSheet,
  onSaved,
}: InspectorProps) {
  const slug        = element.meta?.slug ?? '';
  const baseDc      = parseDressCode(element.meta?.dressCodeJson);

  const [colors,   setColors]   = useState<string[]>(baseDc.colors ?? []);
  const [pickerHex, setPickerHex] = useState('#C5A880');
  const [textHex,   setTextHex]   = useState('');
  const [hexError,  setHexError]  = useState<string | null>(null);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [saved,     setSaved]     = useState(false);

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function removeColor(i: number) {
    setColors((prev) => prev.filter((_, idx) => idx !== i));
    setSaved(false);
  }

  function handleAddColor() {
    setHexError(null);
    const hex = (textHex.trim() || pickerHex).toUpperCase();
    if (!HEX_RE.test(hex)) {
      setHexError('Formato inválido. Usa #RGB o #RRGGBB.');
      return;
    }
    if (colors.length >= MAX_COLORS) {
      setHexError(`Máximo ${MAX_COLORS} colores.`);
      return;
    }
    setColors((prev) => [...prev, hex]);
    setTextHex('');
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    const result = await updateInvitationDressCode({
      id:   invitationId,
      slug,
      dressCode: {
        type:           baseDc.type,
        title:          baseDc.title          ?? '',
        description:    baseDc.description,
        observations:   baseDc.observations   ?? '',
        primaryColor:   baseDc.primaryColor   ?? '',
        secondaryColor: baseDc.secondaryColor ?? '',
        suggestionsList: baseDc.suggestionsList ?? [],
        colors,
      },
    });
    setSaving(false);
    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      onSaved();
    } else {
      setError(result.error ?? 'Error al guardar');
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

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

      {/* Hint */}
      <div style={{
        background: 'rgba(200,167,93,0.07)',
        border: '1px solid rgba(200,167,93,0.2)',
        borderRadius: 8,
        padding: '10px 12px',
      }}>
        <p style={{ fontSize: 12, color: '#9B8878', lineHeight: 1.5, margin: 0 }}>
          El tipo, descripción y sugerencias se editan tocando directamente el texto en la invitación.
        </p>
      </div>

      {/* Current swatches */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={labelStyle}>Paleta de colores</span>
          <span style={{ fontSize: 11, color: colors.length >= MAX_COLORS ? '#c0392b' : '#9B8878' }}>
            {colors.length} / {MAX_COLORS}
          </span>
        </div>

        {colors.length === 0 ? (
          <p style={{ fontSize: 12, color: '#B0A090', margin: '0 0 4px' }}>
            Sin colores. Se usará la paleta del tema visual.
          </p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
            {colors.map((hex, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: hex,
                    border: '1px solid rgba(0,0,0,0.12)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                  }}
                  title={hex}
                />
                <button
                  type="button"
                  onClick={() => removeColor(i)}
                  title={`Eliminar ${hex}`}
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    border: 'none',
                    background: 'rgba(26,20,16,0.7)',
                    color: '#F5EDD8',
                    fontSize: 9,
                    fontWeight: 700,
                    lineHeight: 1,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add color */}
      {colors.length < MAX_COLORS && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={labelStyle}>Agregar color</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
            <input
              type="color"
              value={HEX_RE.test(pickerHex) ? pickerHex : '#C5A880'}
              onChange={(e) => {
                setPickerHex(e.target.value);
                setTextHex(e.target.value.toUpperCase());
                setHexError(null);
              }}
              style={{
                width: 40,
                height: 36,
                borderRadius: 6,
                border: '1px solid rgba(200,167,93,0.3)',
                padding: 2,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            />
            <input
              type="text"
              value={textHex}
              onChange={(e) => {
                setTextHex(e.target.value);
                setHexError(null);
                if (HEX_RE.test(e.target.value)) setPickerHex(e.target.value);
              }}
              placeholder="#C5A880"
              maxLength={7}
              style={{
                flex: 1,
                padding: '8px 10px',
                border: `1px solid ${hexError ? '#FFCDD2' : 'rgba(200,167,93,0.3)'}`,
                borderRadius: 8,
                fontSize: 13,
                color: '#1F1A16',
                background: 'rgba(255,252,245,0.8)',
                outline: 'none',
                fontFamily: 'monospace',
              }}
            />
          </div>
          <button
              type="button"
              onClick={handleAddColor}
              style={{
                width: '100%',
                padding: '9px 0',
                borderRadius: 8,
                border: 'none',
                background: '#1A1410',
                color: '#F5EDD8',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Agregar color
            </button>
          {hexError && (
            <p style={{ fontSize: 11, color: '#c0392b', margin: 0 }}>{hexError}</p>
          )}
        </div>
      )}

      {/* Feedback */}
      {error && (
        <p style={{ fontSize: 11, color: '#c0392b', margin: 0 }}>{error}</p>
      )}
      {saved && !error && (
        <p style={{ fontSize: 11, color: '#C5A880', margin: 0 }}>✓ Guardado</p>
      )}

      {/* Save button */}
      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={saving}
        style={{
          width: '100%',
          padding: '10px 0',
          borderRadius: 8,
          border: 'none',
          background: saving ? 'rgba(200,167,93,0.15)' : '#1A1410',
          color: saving ? '#9B8878' : '#F5EDD8',
          fontSize: 13,
          fontWeight: 600,
          cursor: saving ? 'default' : 'pointer',
          transition: 'all 150ms',
        }}
      >
        {saving ? 'Guardando…' : 'Guardar paleta'}
      </button>
    </div>
  );
}
