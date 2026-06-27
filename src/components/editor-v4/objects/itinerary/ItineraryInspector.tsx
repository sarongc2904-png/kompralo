'use client';

import React, { useState } from 'react';
import type { InspectorProps } from '../../core/editor-types';
import { SectionVisibilityToggle } from '../../components/SectionVisibilityToggle';
import { updateInvitationItinerary } from '@/app/dashboard/invitations/[id]/edit/actions';
import type { ItineraryIcon } from '@/domain/invitations/types';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ItineraryItemLocal {
  id: string;
  time: string;
  title: string;
  location: string;
  icon: ItineraryIcon;
  description: string;
}

const ICON_OPTIONS: { value: ItineraryIcon; emoji: string; label: string }[] = [
  { value: 'church',   emoji: '⛪', label: 'Ceremonia' },
  { value: 'rings',    emoji: '💍', label: 'Anillos' },
  { value: 'glass',    emoji: '🥂', label: 'Brindis' },
  { value: 'music',    emoji: '🎵', label: 'Música' },
  { value: 'utensils', emoji: '🍽', label: 'Banquete' },
];

function parseItems(raw?: string): ItineraryItemLocal[] {
  try {
    const parsed = JSON.parse(raw || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.map((it) => ({
      id:          String(it.id ?? crypto.randomUUID()),
      time:        String(it.time ?? ''),
      title:       String(it.title ?? ''),
      location:    String(it.location ?? ''),
      icon:        (it.icon as ItineraryIcon) ?? 'rings',
      description: String(it.description ?? ''),
    }));
  } catch { return []; }
}

function newItem(): ItineraryItemLocal {
  return { id: String(Date.now()), time: '', title: '', location: '', icon: 'rings', description: '' };
}

// ─── Collapsible item card ────────────────────────────────────────────────────

function ItemCard({
  item, index, total, onChange, onRemove,
}: {
  item: ItineraryItemLocal;
  index: number;
  total: number;
  onChange: (patch: Partial<ItineraryItemLocal>) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(index === 0);

  const inputS: React.CSSProperties = {
    width: '100%', border: '1px solid rgba(200,167,93,0.3)', borderRadius: 6,
    padding: '6px 9px', fontSize: 12, color: '#3D2B1F', background: '#FFFDF9',
    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  };
  const labelS: React.CSSProperties = {
    fontSize: 10, fontWeight: 700, color: '#9B8878',
    textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3, display: 'block',
  };
  const fieldS: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 3 };

  const iconOpt = ICON_OPTIONS.find((o) => o.value === item.icon);

  return (
    <div style={{ border: '1px solid rgba(200,167,93,0.2)', borderRadius: 10, overflow: 'hidden', background: '#FFFDF9' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', padding: '9px 12px',
          background: open ? 'rgba(200,167,93,0.09)' : 'transparent',
          border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13 }}>{iconOpt?.emoji ?? '✦'}</span>
          <span style={{ fontSize: 12, color: '#3D2B1F', fontWeight: 500 }}>
            {item.title.trim() || `Evento ${index + 1}`}
          </span>
          {item.time && (
            <span style={{ fontSize: 11, color: '#C9A96E', fontFamily: 'monospace' }}>{item.time}</span>
          )}
        </div>
        <span style={{ fontSize: 12, color: '#9B8878', display: 'inline-block', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 180ms' }}>▾</span>
      </button>

      {open && (
        <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid rgba(200,167,93,0.12)' }}>
          <div style={fieldS}>
            <label style={labelS}>Hora *</label>
            <input type="text" value={item.time} onChange={(e) => onChange({ time: e.target.value })} placeholder="Ej: 13:00" style={inputS} />
          </div>
          <div style={fieldS}>
            <label style={labelS}>Título *</label>
            <input type="text" value={item.title} onChange={(e) => onChange({ title: e.target.value })} placeholder="Ej: Ceremonia religiosa" style={inputS} />
          </div>
          <div style={fieldS}>
            <label style={labelS}>Lugar</label>
            <input type="text" value={item.location} onChange={(e) => onChange({ location: e.target.value })} placeholder="Ej: Parroquia San Miguel" style={inputS} />
          </div>
          <div style={fieldS}>
            <label style={labelS}>Ícono</label>
            <select
              value={item.icon}
              onChange={(e) => onChange({ icon: e.target.value as ItineraryIcon })}
              style={{ ...inputS, cursor: 'pointer' }}
            >
              {ICON_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.emoji} {o.label}</option>
              ))}
            </select>
          </div>
          <div style={fieldS}>
            <label style={labelS}>Descripción <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span></label>
            <textarea
              value={item.description}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder="Detalles adicionales…"
              rows={2}
              style={{ ...inputS, resize: 'none' }}
            />
          </div>
          {total > 1 && (
            <button
              type="button"
              onClick={onRemove}
              style={{
                marginTop: 4, padding: '6px 0', borderRadius: 7,
                border: '1px solid rgba(180,60,60,0.25)', background: 'rgba(180,60,60,0.06)',
                color: '#B04040', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Eliminar evento
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main inspector ───────────────────────────────────────────────────────────

export function ItineraryInspector({ element, invitationId, isMobileSheet, onSaved }: InspectorProps) {
  const slug     = element.meta?.slug     ?? '';
  const isHidden = element.meta?.isHidden === 'true';

  const [items,  setItems]  = useState<ItineraryItemLocal[]>(() => parseItems(element.meta?.itineraryJson));
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);
  const [saved,  setSaved]  = useState(false);

  function updateItem(idx: number, patch: Partial<ItineraryItemLocal>) {
    setSaved(false);
    setItems((prev) => prev.map((it, i) => i === idx ? { ...it, ...patch } : it));
  }

  async function handleSave() {
    for (let i = 0; i < items.length; i++) {
      if (!items[i].time.trim())  { setError(`El evento #${i + 1} necesita una hora.`);   return; }
      if (!items[i].title.trim()) { setError(`El evento #${i + 1} necesita un título.`); return; }
    }
    setError(null);
    setSaving(true);
    const res = await updateInvitationItinerary({ id: invitationId, slug, items });
    setSaving(false);
    if (res.success) { setSaved(true); onSaved(); }
    else setError(res.error ?? 'Error al guardar.');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: isMobileSheet ? 12 : undefined }}>
      {!isMobileSheet && <div style={{ height: 1, background: 'rgba(200,167,93,0.15)', marginBottom: 4 }} />}

      <SectionVisibilityToggle sectionId="itinerary" hidden={isHidden} invitationId={invitationId} slug={slug} onSaved={onSaved} />

      <div style={{ background: 'rgba(200,167,93,0.07)', border: '1px solid rgba(200,167,93,0.2)', borderRadius: 8, padding: '10px 12px' }}>
        <p style={{ fontSize: 12, color: '#9B8878', lineHeight: 1.5, margin: 0 }}>
          La hora, título y lugar también se editan tocando el texto en la invitación.
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: '#9B8878', fontWeight: 600 }}>
          {items.length} evento{items.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((item, i) => (
          <ItemCard
            key={item.id}
            item={item}
            index={i}
            total={items.length}
            onChange={(patch) => updateItem(i, patch)}
            onRemove={() => { setSaved(false); setItems((prev) => prev.filter((_, j) => j !== i)); }}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => { setSaved(false); setItems((prev) => [...prev, newItem()]); }}
        style={{ padding: '8px 0', borderRadius: 8, border: '1.5px dashed rgba(200,167,93,0.4)', background: 'transparent', color: '#C9A96E', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
      >
        ＋ Agregar evento
      </button>

      {error && <p style={{ fontSize: 12, color: '#B04040', margin: 0 }}>{error}</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        style={{
          padding: '9px 0', borderRadius: 8, border: 'none',
          background: saved ? 'rgba(60,160,80,0.15)' : '#1A1208',
          color: saved ? '#2A8040' : '#C9A96E',
          fontSize: 13, fontWeight: 700, cursor: saving ? 'default' : 'pointer',
          opacity: saving ? 0.6 : 1, fontFamily: 'inherit', transition: 'background 200ms, color 200ms',
        }}
      >
        {saving ? 'Guardando…' : saved ? '✓ Guardado' : 'Guardar itinerario'}
      </button>
    </div>
  );
}
