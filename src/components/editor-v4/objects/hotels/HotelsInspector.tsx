'use client';

import React, { useState } from 'react';
import type { InspectorProps } from '../../core/editor-types';
import { SectionVisibilityToggle } from '../../components/SectionVisibilityToggle';
import { updateAccommodation } from '@/app/dashboard/invitations/[id]/edit/actions';

// ─── Types ────────────────────────────────────────────────────────────────────

interface HotelItem {
  id: string;
  name: string;
  stars: number;
  address: string;
  distance: string;
  priceRange: string;
  phone: string;
  bookingLink: string;
}

function parseHotels(raw?: string): HotelItem[] {
  try {
    const parsed = JSON.parse(raw || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.map((h) => ({
      id:          String(h.id ?? crypto.randomUUID()),
      name:        String(h.name ?? ''),
      stars:       Number(h.stars ?? 4),
      address:     String(h.address ?? ''),
      distance:    String(h.distance ?? ''),
      priceRange:  String(h.priceRange ?? ''),
      phone:       String(h.phone ?? ''),
      bookingLink: String(h.bookingLink ?? ''),
    }));
  } catch {
    return [];
  }
}

function newHotel(): HotelItem {
  return {
    id:          crypto.randomUUID(),
    name:        '',
    stars:       4,
    address:     '',
    distance:    '',
    priceRange:  '',
    phone:       '',
    bookingLink: '',
  };
}

// ─── Star selector ────────────────────────────────────────────────────────────

function StarSelector({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          style={{
            fontSize: 18,
            lineHeight: 1,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: n <= value ? '#C9A96E' : '#DDD0BC',
            padding: '0 1px',
            transition: 'color 120ms',
          }}
          aria-label={`${n} estrella${n !== 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

// ─── Collapsible hotel card ───────────────────────────────────────────────────

interface HotelCardProps {
  hotel: HotelItem;
  index: number;
  total: number;
  onChange: (patch: Partial<HotelItem>) => void;
  onRemove: () => void;
}

function HotelCard({ hotel, index, total, onChange, onRemove }: HotelCardProps) {
  const [open, setOpen] = useState(index === 0);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    border: '1px solid rgba(200,167,93,0.3)',
    borderRadius: 6,
    padding: '6px 9px',
    fontSize: 12,
    color: '#3D2B1F',
    background: '#FFFDF9',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 700,
    color: '#9B8878',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    marginBottom: 3,
    display: 'block',
  };

  const fieldStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  };

  return (
    <div style={{
      border: '1px solid rgba(200,167,93,0.2)',
      borderRadius: 10,
      overflow: 'hidden',
      background: '#FFFDF9',
    }}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '9px 12px',
          background: open ? 'rgba(200,167,93,0.09)' : 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#C9A96E', fontWeight: 700 }}>🏨</span>
          <span style={{ fontSize: 12, color: '#3D2B1F', fontWeight: 500 }}>
            {hotel.name.trim() || `Hotel ${index + 1}`}
          </span>
          {hotel.stars > 0 && (
            <span style={{ fontSize: 10, color: '#C9A96E' }}>
              {'★'.repeat(hotel.stars)}
            </span>
          )}
        </div>
        <span style={{ fontSize: 12, color: '#9B8878', transition: 'transform 180ms', display: 'inline-block', transform: open ? 'rotate(180deg)' : 'none' }}>
          ▾
        </span>
      </button>

      {/* Body */}
      {open && (
        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid rgba(200,167,93,0.12)' }}>

          {/* Nombre */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Nombre *</label>
            <input
              type="text"
              value={hotel.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="Ej: Hotel Fiesta Americana"
              style={inputStyle}
            />
          </div>

          {/* Estrellas */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Estrellas</label>
            <StarSelector value={hotel.stars} onChange={(n) => onChange({ stars: n })} />
          </div>

          {/* Precio */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Precio referencia</label>
            <input
              type="text"
              value={hotel.priceRange}
              onChange={(e) => onChange({ priceRange: e.target.value })}
              placeholder="Ej: $800–1,200/noche"
              style={inputStyle}
            />
          </div>

          {/* Dirección */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Dirección</label>
            <input
              type="text"
              value={hotel.address}
              onChange={(e) => onChange({ address: e.target.value })}
              placeholder="Ej: Av. López Mateos 2500"
              style={inputStyle}
            />
          </div>

          {/* Distancia */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Distancia al venue</label>
            <input
              type="text"
              value={hotel.distance}
              onChange={(e) => onChange({ distance: e.target.value })}
              placeholder="Ej: 5 min en auto"
              style={inputStyle}
            />
          </div>

          {/* Teléfono */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Teléfono <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span></label>
            <input
              type="text"
              value={hotel.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              placeholder="Ej: 3312345678"
              style={inputStyle}
            />
          </div>

          {/* Link reserva */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Link de reserva <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span></label>
            <input
              type="url"
              value={hotel.bookingLink}
              onChange={(e) => onChange({ bookingLink: e.target.value })}
              placeholder="https://…"
              style={inputStyle}
            />
          </div>

          {/* Eliminar */}
          {total > 1 && (
            <button
              type="button"
              onClick={onRemove}
              style={{
                marginTop: 4,
                padding: '6px 0',
                borderRadius: 7,
                border: '1px solid rgba(180,60,60,0.25)',
                background: 'rgba(180,60,60,0.06)',
                color: '#B04040',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Eliminar hotel
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main inspector ───────────────────────────────────────────────────────────

export function HotelsInspector({ element, invitationId, isMobileSheet, onSaved }: InspectorProps) {
  const slug     = element.meta?.slug     ?? '';
  const planId   = element.meta?.planId   ?? '';
  const isHidden = element.meta?.isHidden === 'true';
  const isDeluxe = planId === 'deluxe';

  const [hotels, setHotels] = useState<HotelItem[]>(() => parseHotels(element.meta?.hotelsJson));
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);
  const [saved,  setSaved]  = useState(false);

  function updateHotel(idx: number, patch: Partial<HotelItem>) {
    setSaved(false);
    setHotels((prev) => prev.map((h, i) => i === idx ? { ...h, ...patch } : h));
  }

  function addHotel() {
    setSaved(false);
    setHotels((prev) => [...prev, newHotel()]);
  }

  function removeHotel(idx: number) {
    setSaved(false);
    setHotels((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    for (let i = 0; i < hotels.length; i++) {
      const h = hotels[i];
      if (!h.name.trim()) {
        setError(`El hotel #${i + 1} necesita un nombre.`);
        return;
      }
      if (h.stars < 1 || h.stars > 5) {
        setError(`El hotel "${h.name}" debe tener entre 1 y 5 estrellas.`);
        return;
      }
    }
    setError(null);
    setSaving(true);
    const res = await updateAccommodation({
      id:     invitationId,
      slug,
      hotels: hotels.map((h) => ({
        id:          h.id,
        name:        h.name,
        stars:       h.stars,
        address:     h.address,
        distance:    h.distance,
        priceRange:  h.priceRange,
        phone:       h.phone,
        bookingLink: h.bookingLink,
        imageUrl:    '',
        description: '',
      })),
    });
    setSaving(false);
    if (res.success) {
      setSaved(true);
      onSaved();
    } else {
      setError(res.error ?? 'Error al guardar.');
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: isMobileSheet ? 12 : undefined }}>
      {!isMobileSheet && (
        <div style={{ height: 1, background: 'rgba(200,167,93,0.15)', marginBottom: 4 }} />
      )}

      {/* Visibility toggle */}
      <SectionVisibilityToggle
        sectionId="hotels"
        hidden={isHidden}
        invitationId={invitationId}
        slug={slug}
        onSaved={onSaved}
      />

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
            fontSize: 11, fontWeight: 700, color: '#7B5E3A',
            background: 'rgba(116,84,38,0.12)', borderRadius: 6,
            padding: '2px 8px', letterSpacing: '0.04em',
          }}>
            🔒 Requiere Plan Deluxe
          </span>
          <p style={{ fontSize: 12, color: '#9B8878', lineHeight: 1.5, margin: 0 }}>
            La sección de Hospedaje muestra hoteles recomendados para tus invitados foráneos. Mejora tu plan para activarla.
          </p>
        </div>
      )}

      {/* CRUD — Deluxe only */}
      {isDeluxe && (
        <>
          {/* Hint */}
          <div style={{
            background: 'rgba(200,167,93,0.07)',
            border: '1px solid rgba(200,167,93,0.2)',
            borderRadius: 8,
            padding: '10px 12px',
          }}>
            <p style={{ fontSize: 12, color: '#9B8878', lineHeight: 1.5, margin: 0 }}>
              Los textos también se editan tocando directamente en la invitación. Usa este panel para agregar o eliminar hoteles.
            </p>
          </div>

          {/* Counter */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: '#9B8878', fontWeight: 600 }}>
              {hotels.length} hotel{hotels.length !== 1 ? 'es' : ''}
              {hotels.length >= 5 && (
                <span style={{ color: '#C9A96E', marginLeft: 6 }}>· recomendado máx 5</span>
              )}
            </span>
          </div>

          {/* Hotel cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {hotels.map((hotel, i) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                index={i}
                total={hotels.length}
                onChange={(patch) => updateHotel(i, patch)}
                onRemove={() => removeHotel(i)}
              />
            ))}
          </div>

          {/* Add hotel */}
          <button
            type="button"
            onClick={addHotel}
            style={{
              padding: '8px 0',
              borderRadius: 8,
              border: '1.5px dashed rgba(200,167,93,0.4)',
              background: 'transparent',
              color: '#C9A96E',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            ＋ Agregar hotel
          </button>

          {/* Error */}
          {error && (
            <p style={{ fontSize: 12, color: '#B04040', margin: 0 }}>{error}</p>
          )}

          {/* Save */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '9px 0',
              borderRadius: 8,
              border: 'none',
              background: saved ? 'rgba(60,160,80,0.15)' : '#1A1208',
              color: saved ? '#2A8040' : '#C9A96E',
              fontSize: 13,
              fontWeight: 700,
              cursor: saving ? 'default' : 'pointer',
              opacity: saving ? 0.6 : 1,
              fontFamily: 'inherit',
              transition: 'background 200ms, color 200ms',
            }}
          >
            {saving ? 'Guardando…' : saved ? '✓ Guardado' : 'Guardar hoteles'}
          </button>
        </>
      )}
    </div>
  );
}
