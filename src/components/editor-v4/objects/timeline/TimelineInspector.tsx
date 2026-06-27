'use client';

import React, { useState } from 'react';
import type { InspectorProps } from '../../core/editor-types';
import { updateTimeline } from '@/app/dashboard/invitations/[id]/edit/actions';

// ─── Types ───────────────────────────────────────────────────────────────────

interface TimelineEventLocal {
  id: string;
  year: string;
  title: string;
  description: string;
}

function parseEvents(raw?: string): TimelineEventLocal[] {
  try {
    const parsed = JSON.parse(raw || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.map((e) => ({
      id:          String(e.id ?? crypto.randomUUID()),
      year:        String(e.year ?? ''),
      title:       String(e.title ?? ''),
      description: String(e.description ?? ''),
    }));
  } catch { return []; }
}

function newEvent(): TimelineEventLocal {
  return { id: String(Date.now()), year: '', title: '', description: '' };
}

// ─── Collapsible event card ───────────────────────────────────────────────────

function EventCard({
  event, index, total, onChange, onRemove,
}: {
  event: TimelineEventLocal;
  index: number;
  total: number;
  onChange: (patch: Partial<TimelineEventLocal>) => void;
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
          <span style={{ fontSize: 13 }}>💛</span>
          <span style={{ fontSize: 12, color: '#3D2B1F', fontWeight: 500 }}>
            {event.title.trim() || `Momento ${index + 1}`}
          </span>
          {event.year && (
            <span style={{ fontSize: 11, color: '#C9A96E', fontFamily: 'monospace' }}>{event.year}</span>
          )}
        </div>
        <span style={{ fontSize: 12, color: '#9B8878', display: 'inline-block', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 180ms' }}>▾</span>
      </button>

      {open && (
        <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid rgba(200,167,93,0.12)' }}>
          <div style={fieldS}>
            <label style={labelS}>Año *</label>
            <input type="text" value={event.year} onChange={(e) => onChange({ year: e.target.value })} placeholder="Ej: 2019" style={inputS} />
          </div>
          <div style={fieldS}>
            <label style={labelS}>Título *</label>
            <input type="text" value={event.title} onChange={(e) => onChange({ title: e.target.value })} placeholder="Ej: Nos conocimos" style={inputS} />
          </div>
          <div style={fieldS}>
            <label style={labelS}>Descripción *</label>
            <textarea
              value={event.description}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder="Cuenta lo que pasó en ese momento…"
              rows={3}
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
              Eliminar momento
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main inspector ───────────────────────────────────────────────────────────

export function TimelineInspector({ element, invitationId, isMobileSheet, onSaved }: InspectorProps) {
  const slug     = element.meta?.slug   ?? '';
  const planId   = element.meta?.planId ?? '';
  const isDeluxe = planId === 'deluxe';

  const [events, setEvents] = useState<TimelineEventLocal[]>(() => parseEvents(element.meta?.timelineJson));
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);
  const [saved,  setSaved]  = useState(false);

  function updateEvent(idx: number, patch: Partial<TimelineEventLocal>) {
    setSaved(false);
    setEvents((prev) => prev.map((e, i) => i === idx ? { ...e, ...patch } : e));
  }

  async function handleSave() {
    for (let i = 0; i < events.length; i++) {
      const e = events[i];
      if (!e.year.trim())        { setError(`El momento #${i + 1} necesita un año.`);         return; }
      if (!e.title.trim())       { setError(`El momento #${i + 1} necesita un título.`);       return; }
      if (!e.description.trim()) { setError(`El momento #${i + 1} necesita una descripción.`); return; }
    }
    setError(null);
    setSaving(true);
    const res = await updateTimeline({
      id: invitationId,
      slug,
      events: events.map((e) => ({ id: e.id, year: e.year, title: e.title, description: e.description, imageUrl: '' })),
    });
    setSaving(false);
    if (res.success) { setSaved(true); onSaved(); }
    else setError(res.error ?? 'Error al guardar.');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: isMobileSheet ? 12 : undefined }}>
      {!isMobileSheet && <div style={{ height: 1, background: 'rgba(200,167,93,0.15)', marginBottom: 4 }} />}

      {/* Plan gate */}
      {!isDeluxe && (
        <div style={{
          background: 'rgba(116,84,38,0.06)', border: '1px solid rgba(116,84,38,0.18)',
          borderRadius: 10, padding: 14, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#7B5E3A', background: 'rgba(116,84,38,0.12)', borderRadius: 6, padding: '2px 8px', letterSpacing: '0.04em' }}>
            🔒 Requiere Plan Deluxe
          </span>
          <p style={{ fontSize: 12, color: '#9B8878', lineHeight: 1.5, margin: 0 }}>
            La Línea del Tiempo muestra los momentos más especiales de su historia. Mejora tu plan para editarla.
          </p>
        </div>
      )}

      {isDeluxe && (
        <>
          <div style={{ background: 'rgba(200,167,93,0.07)', border: '1px solid rgba(200,167,93,0.2)', borderRadius: 8, padding: '10px 12px' }}>
            <p style={{ fontSize: 12, color: '#9B8878', lineHeight: 1.5, margin: 0 }}>
              El año, título y descripción también se editan tocando el texto en la invitación.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: '#9B8878', fontWeight: 600 }}>
              {events.length} momento{events.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {events.map((ev, i) => (
              <EventCard
                key={ev.id}
                event={ev}
                index={i}
                total={events.length}
                onChange={(patch) => updateEvent(i, patch)}
                onRemove={() => { setSaved(false); setEvents((prev) => prev.filter((_, j) => j !== i)); }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => { setSaved(false); setEvents((prev) => [...prev, newEvent()]); }}
            style={{ padding: '8px 0', borderRadius: 8, border: '1.5px dashed rgba(200,167,93,0.4)', background: 'transparent', color: '#C9A96E', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            ＋ Agregar momento
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
            {saving ? 'Guardando…' : saved ? '✓ Guardado' : 'Guardar línea del tiempo'}
          </button>
        </>
      )}
    </div>
  );
}
