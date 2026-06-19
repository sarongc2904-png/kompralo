'use client';

import { useState } from 'react';
import type { InvitationHotelInput } from '@/domain/invitations';
import { updateAccommodation } from './actions';
import { ImageUploadButton } from '@/components/dashboard/ImageUploadButton';
import { notifyPreviewRefresh } from './previewRefresh';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function newHotel(): InvitationHotelInput {
  return {
    id:          crypto.randomUUID(),
    name:        '',
    stars:       3,
    address:     '',
    distance:    '',
    priceRange:  '',
    phone:       '',
    bookingLink: '',
    imageUrl:    '',
    description: '',
  };
}

function initHotels(raw: InvitationHotelInput[]): InvitationHotelInput[] {
  if (!raw || raw.length === 0) return [newHotel()];
  return raw;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  invitationId: string;
  slug: string;
  initialHotels: InvitationHotelInput[];
}

// ─── Star selector ────────────────────────────────────────────────────────────

function StarSelector({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`text-lg leading-none transition-colors ${n <= value ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`}
          aria-label={`${n} estrella${n !== 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AccommodationForm({ invitationId, slug, initialHotels }: Props) {
  const [hotels, setHotels]   = useState<InvitationHotelInput[]>(() => initHotels(initialHotels));
  const [saving, setSaving]   = useState(false);
  const [result, setResult]   = useState<{ success: boolean; message: string } | null>(null);

  // ── Hotel-level helpers ───────────────────────────────────────────────────

  function updateHotel(index: number, patch: Partial<InvitationHotelInput>) {
    setHotels((prev) => prev.map((h, i) => (i === index ? { ...h, ...patch } : h)));
  }

  function addHotel() {
    setHotels((prev) => [...prev, newHotel()]);
  }

  function removeHotel(index: number) {
    setHotels((prev) => prev.filter((_, i) => i !== index));
  }

  function moveUp(index: number) {
    if (index === 0) return;
    setHotels((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }

  function moveDown(index: number) {
    setHotels((prev) => {
      if (index === prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setResult(null);

    const res = await updateAccommodation({ id: invitationId, slug, hotels });

    setSaving(false);
    if (res.success) notifyPreviewRefresh();
    setResult({ success: res.success, message: res.success ? res.message : res.error });
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {hotels.map((hotel, i) => (
        <div key={hotel.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          {/* Card header */}
          <div className="flex items-center justify-between gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200">
            <span className="text-sm font-semibold text-gray-700">
              Hotel {i + 1}{hotel.name ? ` — ${hotel.name}` : ''}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => moveUp(i)}
                disabled={i === 0}
                className="px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-40"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveDown(i)}
                disabled={i === hotels.length - 1}
                className="px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-40"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeHotel(i)}
                className="px-2 py-1 text-xs bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100"
              >
                Eliminar
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Name + Stars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={hotel.name}
                  onChange={(e) => updateHotel(i, { name: e.target.value })}
                  placeholder="Ej: Hotel Fiesta Americana"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Estrellas <span className="text-red-500">*</span>
                </label>
                <StarSelector value={hotel.stars} onChange={(n) => updateHotel(i, { stars: n })} />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Dirección</label>
              <input
                type="text"
                value={hotel.address}
                onChange={(e) => updateHotel(i, { address: e.target.value })}
                placeholder="Ej: Av. López Mateos 2500, Guadalajara"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Distance + Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Distancia al venue</label>
                <input
                  type="text"
                  value={hotel.distance}
                  onChange={(e) => updateHotel(i, { distance: e.target.value })}
                  placeholder="Ej: 5 min en auto"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Precio referencia</label>
                <input
                  type="text"
                  value={hotel.priceRange}
                  onChange={(e) => updateHotel(i, { priceRange: e.target.value })}
                  placeholder="Ej: $1,200 – $2,500 / noche"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            {/* Phone + Booking link */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Teléfono <span className="text-gray-400">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={hotel.phone}
                  onChange={(e) => updateHotel(i, { phone: e.target.value })}
                  placeholder="Ej: 3312345678"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Sitio web / reserva <span className="text-gray-400">(opcional)</span>
                </label>
                <input
                  type="url"
                  value={hotel.bookingLink}
                  onChange={(e) => updateHotel(i, { bookingLink: e.target.value })}
                  placeholder="https://…"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            {/* Image URL + preview */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Imagen <span className="text-gray-400">(opcional)</span>
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="url"
                  value={hotel.imageUrl}
                  onChange={(e) => updateHotel(i, { imageUrl: e.target.value })}
                  placeholder="https://…"
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <ImageUploadButton
                  folder="hotels"
                  invitationId={invitationId}
                  onUpload={(url) => updateHotel(i, { imageUrl: url })}
                />
              </div>
              {hotel.imageUrl && (() => { try { new URL(hotel.imageUrl); return true; } catch { return false; } })() && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={hotel.imageUrl}
                  alt={`Preview ${hotel.name}`}
                  className="mt-2 h-28 w-full object-cover rounded-md border border-gray-200"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Descripción <span className="text-gray-400">(opcional)</span>
              </label>
              <textarea
                value={hotel.description}
                onChange={(e) => updateHotel(i, { description: e.target.value })}
                placeholder="Breve descripción del hotel o beneficios para los invitados…"
                rows={2}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              />
            </div>
          </div>
        </div>
      ))}

      {/* Add hotel */}
      <button
        type="button"
        onClick={addHotel}
        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
      >
        + Agregar hotel
      </button>

      {/* Feedback */}
      {result && (
        <p className={`text-sm font-medium ${result.success ? 'text-green-600' : 'text-red-600'}`}>
          {result.message}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={saving}
        className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors"
      >
        {saving ? 'Guardando…' : 'Guardar hospedaje'}
      </button>
    </form>
  );
}
