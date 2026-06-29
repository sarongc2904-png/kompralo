'use client';

import { useState } from 'react';
import type { InspectorProps } from '../../core/editor-types';
import { updateGlobalTextColor } from '@/app/dashboard/invitations/[id]/edit/actions';

const HEX_RE = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

// Presets que contrastan bien sobre fondo negro Y blanco, incluye dorados
const PRESET_COLORS = [
  { hex: '#FFFFFF', label: 'Blanco' },
  { hex: '#FAF7F2', label: 'Marfil' },
  { hex: '#F5EDD8', label: 'Crema' },
  { hex: '#D4AF37', label: 'Dorado brillante' },
  { hex: '#C8A75D', label: 'Dorado suave' },
  { hex: '#B8860B', label: 'Dorado profundo' },
  { hex: '#8B7355', label: 'Champán oscuro' },
  { hex: '#5C4A3E', label: 'Café cálido' },
  { hex: '#2C2C2C', label: 'Carbón' },
  { hex: '#1A1410', label: 'Negro cálido' },
  { hex: '#000000', label: 'Negro' },
  { hex: '#3D2B1F', label: 'Sepia oscuro' },
];

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: '#9B8878',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  display: 'block',
  marginBottom: 8,
};

export function ColorsInspector({
  element,
  invitationId,
  isMobileSheet,
  onSaved,
}: InspectorProps) {
  const initial = element.meta?.globalTextColor ?? '';
  const [selected, setSelected] = useState(initial);
  const [pickerHex, setPickerHex] = useState(initial || '#C8A75D');
  const [customHex, setCustomHex] = useState('');
  const [hexError, setHexError]   = useState<string | null>(null);
  const [saving,   setSaving]     = useState(false);
  const [saved,    setSaved]      = useState(false);
  const [error,    setError]      = useState<string | null>(null);

  function pickPreset(hex: string) {
    setSelected(hex);
    setPickerHex(hex);
    setCustomHex('');
    setHexError(null);
    setSaved(false);
  }

  function handlePickerChange(hex: string) {
    setPickerHex(hex);
    setCustomHex(hex.toUpperCase());
    setSelected(hex.toUpperCase());
    setHexError(null);
    setSaved(false);
  }

  function handleCustomInput(value: string) {
    setCustomHex(value);
    setHexError(null);
    setSaved(false);
    if (HEX_RE.test(value)) {
      setPickerHex(value);
      setSelected(value.toUpperCase());
    }
  }

  async function handleSave() {
    const colorToSave = customHex.trim() || selected;
    if (colorToSave && !HEX_RE.test(colorToSave)) {
      setHexError('Formato inválido. Usa #RGB o #RRGGBB.');
      return;
    }
    setSaving(true);
    setError(null);
    const result = await updateGlobalTextColor({ id: invitationId, color: colorToSave });
    setSaving(false);
    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      onSaved();
    } else {
      setError(result.error ?? 'Error al guardar');
    }
  }

  async function handleReset() {
    setSaving(true);
    setError(null);
    const result = await updateGlobalTextColor({ id: invitationId, color: '' });
    setSaving(false);
    if (result.success) {
      setSelected('');
      setCustomHex('');
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      onSaved();
    } else {
      setError(result.error ?? 'Error al guardar');
    }
  }

  const currentColor = customHex.trim() || selected;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: isMobileSheet ? 12 : undefined }}>
      {!isMobileSheet && (
        <div style={{ height: 1, background: 'rgba(200,167,93,0.15)', marginBottom: 4 }} />
      )}

      {/* Info */}
      <div style={{
        background: 'rgba(200,167,93,0.07)',
        border: '1px solid rgba(200,167,93,0.2)',
        borderRadius: 8,
        padding: '10px 12px',
      }}>
        <p style={{ fontSize: 12, color: '#9B8878', lineHeight: 1.5, margin: 0 }}>
          Este color se aplica a todos los textos de la invitación. Elige un color que contraste bien con el fondo de tu tema.
        </p>
      </div>

      {/* Preview */}
      {currentColor && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 12px',
          borderRadius: 8,
          background: '#1A1410',
          border: '1px solid rgba(200,167,93,0.2)',
        }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: currentColor,
            border: '1px solid rgba(255,255,255,0.15)',
            flexShrink: 0,
          }} />
          <div>
            <p style={{ fontSize: 13, color: currentColor, margin: 0, fontWeight: 600 }}>
              Texto de ejemplo
            </p>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', margin: '2px 0 0', fontFamily: 'monospace' }}>
              {currentColor}
            </p>
          </div>
        </div>
      )}

      {/* Preset palette */}
      <div>
        <span style={labelStyle}>Colores predefinidos</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {PRESET_COLORS.map(({ hex, label }) => {
            const isActive = selected.toUpperCase() === hex.toUpperCase() && !customHex;
            return (
              <button
                key={hex}
                type="button"
                title={label}
                onClick={() => pickPreset(hex)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: hex,
                  border: isActive
                    ? '3px solid #C8A75D'
                    : '1px solid rgba(0,0,0,0.18)',
                  boxShadow: isActive
                    ? '0 0 0 2px rgba(200,167,93,0.5)'
                    : '0 1px 3px rgba(0,0,0,0.2)',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'box-shadow 120ms, border 120ms',
                  flexShrink: 0,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Custom color picker */}
      <div>
        <span style={labelStyle}>Color personalizado</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="color"
            value={HEX_RE.test(pickerHex) ? pickerHex : '#C8A75D'}
            onChange={(e) => handlePickerChange(e.target.value)}
            style={{
              width: 40,
              height: 36,
              borderRadius: 6,
              border: '1px solid rgba(200,167,93,0.3)',
              padding: 2,
              cursor: 'pointer',
              flexShrink: 0,
              background: 'transparent',
            }}
          />
          <input
            type="text"
            value={customHex}
            onChange={(e) => handleCustomInput(e.target.value)}
            placeholder="#C8A75D"
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
        {hexError && (
          <p style={{ fontSize: 11, color: '#c0392b', margin: '6px 0 0' }}>{hexError}</p>
        )}
      </div>

      {/* Feedback */}
      {error && <p style={{ fontSize: 11, color: '#c0392b', margin: 0 }}>{error}</p>}
      {saved && !error && <p style={{ fontSize: 11, color: '#C5A880', margin: 0 }}>✓ Color guardado</p>}

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving || !currentColor}
          style={{
            width: '100%',
            padding: '10px 0',
            borderRadius: 8,
            border: 'none',
            background: saving || !currentColor ? 'rgba(200,167,93,0.15)' : '#1A1410',
            color: saving || !currentColor ? '#9B8878' : '#F5EDD8',
            fontSize: 13,
            fontWeight: 600,
            cursor: saving || !currentColor ? 'default' : 'pointer',
            transition: 'all 150ms',
          }}
        >
          {saving ? 'Guardando…' : 'Aplicar color'}
        </button>

        {initial && (
          <button
            type="button"
            onClick={() => void handleReset()}
            disabled={saving}
            style={{
              width: '100%',
              padding: '8px 0',
              borderRadius: 8,
              border: '1px solid rgba(200,167,93,0.25)',
              background: 'transparent',
              color: '#9B8878',
              fontSize: 12,
              fontWeight: 500,
              cursor: saving ? 'default' : 'pointer',
            }}
          >
            Restablecer color del tema
          </button>
        )}
      </div>
    </div>
  );
}
