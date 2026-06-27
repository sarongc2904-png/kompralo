'use client';

import React, { useState } from 'react';
import type { InspectorProps } from '../../core/editor-types';
import type { PadrinoIcon } from '@/domain/invitations';
import { updateInvitationPadrinos } from '@/app/dashboard/invitations/[id]/edit/actions';
import { SectionVisibilityToggle } from '../../components/SectionVisibilityToggle';

// ─── Icon options ─────────────────────────────────────────────────────────────

const ICON_OPTIONS: { value: PadrinoIcon; label: string }[] = [
  { value: 'flowers', label: '🌸 Flores'      },
  { value: 'cake',    label: '🎂 Pastel'       },
  { value: 'music',   label: '🎵 Música'       },
  { value: 'rings',   label: '💍 Argollas'     },
  { value: 'photo',   label: '📷 Fotografía'   },
  { value: 'video',   label: '🎥 Video'        },
  { value: 'lights',  label: '💡 Iluminación'  },
  { value: 'bar',     label: '🍸 Bar'          },
  { value: 'car',     label: '🚗 Transporte'   },
  { value: 'church',  label: '⛪ Iglesia'      },
  { value: 'dress',   label: '👗 Vestido'      },
  { value: 'gift',    label: '🎁 Regalo'       },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface PadrinoEntry {
  id:    string;
  rubro: string;
  icon:  PadrinoIcon;
  names: string[];
}

function parsePadrinos(raw?: string): PadrinoEntry[] {
  try {
    const arr = JSON.parse(raw || '[]') as PadrinoEntry[];
    return arr.map((p) => ({
      id:    p.id    ?? crypto.randomUUID(),
      rubro: p.rubro ?? '',
      icon:  p.icon  ?? 'rings',
      names: Array.isArray(p.names) && p.names.length > 0 ? p.names : [''],
    }));
  } catch {
    return [];
  }
}

function newEntry(): PadrinoEntry {
  return { id: crypto.randomUUID(), rubro: '', icon: 'rings', names: [''] };
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: '#9B8878',
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  marginBottom: 4,
  display: 'block',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '7px 10px',
  borderRadius: 7,
  border: '1px solid rgba(200,167,93,0.3)',
  background: '#FFFDF9',
  fontSize: 12,
  color: '#1A1410',
  outline: 'none',
  boxSizing: 'border-box',
};

// ─── Component ────────────────────────────────────────────────────────────────

export function PadrinosInspector({
  element,
  invitationId,
  isMobileSheet,
  onSaved,
}: InspectorProps) {
  const planId   = element.meta?.planId   ?? '';
  const slug     = element.meta?.slug     ?? '';
  const isHidden = element.meta?.isHidden === 'true';
  const isDeluxe = planId === 'deluxe';

  const [items,   setItems]   = useState<PadrinoEntry[]>(() => parsePadrinos(element.meta?.padrinosJson));
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [saved,   setSaved]   = useState(false);

  // ── Category helpers ───────────────────────────────────────────────────────

  function updateItem(idx: number, patch: Partial<PadrinoEntry>) {
    setItems((prev) => prev.map((it, i) => i === idx ? { ...it, ...patch } : it));
  }

  function addCategory() {
    setItems((prev) => [...prev, newEntry()]);
  }

  function removeCategory(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  // ── Name helpers ───────────────────────────────────────────────────────────

  function updateName(ci: number, ni: number, val: string) {
    setItems((prev) => prev.map((it, i) => {
      if (i !== ci) return it;
      const names = [...it.names];
      names[ni] = val;
      return { ...it, names };
    }));
  }

  function addName(ci: number) {
    setItems((prev) => prev.map((it, i) =>
      i === ci ? { ...it, names: [...it.names, ''] } : it,
    ));
  }

  function removeName(ci: number, ni: number) {
    setItems((prev) => prev.map((it, i) => {
      if (i !== ci) return it;
      const names = it.names.filter((_, j) => j !== ni);
      return { ...it, names: names.length > 0 ? names : [''] };
    }));
  }

  // ── Save ───────────────────────────────────────────────────────────────────

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      const res = await updateInvitationPadrinos({ id: invitationId, slug, padrinos: items });
      if (res.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
        onSaved();
      } else {
        setError(res.error ?? 'Error al guardar');
      }
    } catch {
      setError('Error de red. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      paddingBottom: isMobileSheet ? 12 : undefined,
    }}>
      {!isMobileSheet && (
        <div style={{ height: 1, background: 'rgba(200,167,93,0.15)', marginBottom: 4 }} />
      )}

      {/* Visibility toggle */}
      {isDeluxe && (
        <SectionVisibilityToggle
          sectionId="padrinos"
          hidden={isHidden}
          invitationId={invitationId}
          slug={slug}
          onSaved={onSaved}
        />
      )}

      {/* Plan gate */}
      {!isDeluxe && (
        <div style={{
          background: 'rgba(116,84,38,0.06)',
          border: '1px solid rgba(116,84,38,0.18)',
          borderRadius: 10,
          padding: '14px',
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

      {/* CRUD */}
      {isDeluxe && (
        <>
          {/* Category cards */}
          {items.map((item, ci) => (
            <div key={item.id} style={{
              background: '#FAFAF8',
              borderRadius: 10,
              border: '1px solid rgba(200,167,93,0.2)',
              padding: '12px 12px 10px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}>
              {/* Rubro */}
              <div>
                <span style={labelStyle}>Rubro</span>
                <input
                  style={inputStyle}
                  type="text"
                  value={item.rubro}
                  placeholder="Ej: Flores, Pastel, Música…"
                  onChange={(e) => updateItem(ci, { rubro: e.target.value })}
                />
              </div>

              {/* Icon */}
              <div>
                <span style={labelStyle}>Ícono</span>
                <select
                  style={{ ...inputStyle, cursor: 'pointer' }}
                  value={item.icon}
                  onChange={(e) => updateItem(ci, { icon: e.target.value as PadrinoIcon })}
                >
                  {ICON_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Names */}
              <div>
                <span style={labelStyle}>Nombres</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {item.names.map((name, ni) => (
                    <div key={ni} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input
                        style={{ ...inputStyle, flex: 1 }}
                        type="text"
                        value={name}
                        placeholder={`Nombre ${ni + 1}`}
                        onChange={(e) => updateName(ci, ni, e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => removeName(ci, ni)}
                        disabled={item.names.length === 1}
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 6,
                          border: '1px solid rgba(192,57,43,0.25)',
                          background: 'rgba(192,57,43,0.07)',
                          color: '#c0392b',
                          fontSize: 12,
                          cursor: item.names.length === 1 ? 'default' : 'pointer',
                          opacity: item.names.length === 1 ? 0.35 : 1,
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addName(ci)}
                  style={{
                    marginTop: 6,
                    fontSize: 11,
                    color: '#C5A880',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    fontWeight: 600,
                  }}
                >
                  + Agregar nombre
                </button>
              </div>

              {/* Delete category */}
              <button
                type="button"
                onClick={() => removeCategory(ci)}
                disabled={items.length === 1}
                style={{
                  width: '100%',
                  padding: '7px 0',
                  borderRadius: 7,
                  border: '1px solid rgba(192,57,43,0.25)',
                  background: 'rgba(192,57,43,0.06)',
                  color: '#c0392b',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: items.length === 1 ? 'not-allowed' : 'pointer',
                  opacity: items.length === 1 ? 0.4 : 1,
                }}
              >
                Eliminar categoría
              </button>
            </div>
          ))}

          {/* Add category */}
          <button
            type="button"
            onClick={addCategory}
            style={{
              width: '100%',
              padding: '9px 0',
              borderRadius: 8,
              border: '1.5px dashed rgba(200,167,93,0.4)',
              background: 'transparent',
              color: '#C5A880',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ＋ Agregar categoría
          </button>

          {/* Save */}
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            style={{
              width: '100%',
              padding: '10px 0',
              borderRadius: 8,
              border: 'none',
              background: saving ? 'rgba(200,167,93,0.4)' : 'rgba(200,167,93,0.85)',
              color: '#1A1410',
              fontSize: 13,
              fontWeight: 700,
              cursor: saving ? 'default' : 'pointer',
            }}
          >
            {saving ? 'Guardando…' : 'Guardar padrinos'}
          </button>

          {/* Feedback */}
          {error && <p style={{ fontSize: 11, color: '#c0392b', margin: 0 }}>{error}</p>}
          {saved && !error && <p style={{ fontSize: 11, color: '#C5A880', margin: 0 }}>✓ Guardado</p>}
        </>
      )}
    </div>
  );
}

