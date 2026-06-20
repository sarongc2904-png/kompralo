'use client';

import { useState } from 'react';
import type { InvitationTimelineEventInput } from '@/domain/invitations';
import { ImageUploadButton } from '@/components/dashboard/ImageUploadButton';
import { updateTimeline } from './actions';
import { notifyPreviewRefresh } from './previewRefresh';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function newEvent(): InvitationTimelineEventInput {
  return { id: crypto.randomUUID(), year: '', title: '', description: '', imageUrl: '' };
}

function initEvents(raw: InvitationTimelineEventInput[]): InvitationTimelineEventInput[] {
  if (!raw || raw.length === 0) return [newEvent()];
  return raw;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  invitationId: string;
  slug: string;
  initialEvents: InvitationTimelineEventInput[];
}

// ─── Component ───────────────────────────────────────────────────────────────

export function TimelineForm({ invitationId, slug, initialEvents }: Props) {
  const [events, setEvents] = useState<InvitationTimelineEventInput[]>(() => initEvents(initialEvents));
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  // ── Event-level helpers ───────────────────────────────────────────────────

  function updateEvent(index: number, patch: Partial<InvitationTimelineEventInput>) {
    setEvents((prev) => prev.map((e, i) => (i === index ? { ...e, ...patch } : e)));
  }

  function addEvent() {
    setEvents((prev) => [...prev, newEvent()]);
  }

  function removeEvent(index: number) {
    setEvents((prev) => prev.filter((_, i) => i !== index));
  }

  function moveUp(index: number) {
    if (index === 0) return;
    setEvents((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }

  function moveDown(index: number) {
    setEvents((prev) => {
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

    const res = await updateTimeline({ id: invitationId, slug, events });

    setSaving(false);
    if (res.success) notifyPreviewRefresh();
    setResult({ success: res.success, message: res.success ? res.message : res.error });
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {events.map((event, i) => (
        <div key={event.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          {/* Card header */}
          <div className="flex items-center justify-between gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200">
            <span className="text-sm font-semibold text-gray-700">
              {event.year ? `${event.year}` : `Evento ${i + 1}`}
              {event.title ? ` — ${event.title}` : ''}
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
                disabled={i === events.length - 1}
                className="px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-40"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeEvent(i)}
                className="px-2 py-1 text-xs bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100"
              >
                Eliminar
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Year + Title */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Año <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={event.year}
                  onChange={(e) => updateEvent(i, { year: e.target.value })}
                  placeholder="Ej: 2019"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={event.title}
                  onChange={(e) => updateEvent(i, { title: e.target.value })}
                  placeholder="Ej: Nos conocimos en Guadalajara"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Descripción <span className="text-red-500">*</span>
              </label>
              <textarea
                value={event.description}
                onChange={(e) => updateEvent(i, { description: e.target.value })}
                placeholder="Cuéntanos sobre este momento…"
                rows={2}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              />
            </div>

            {/* Image URL + upload + preview */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-gray-600">
                  Imagen <span className="text-gray-400">(opcional)</span>
                </label>
                <ImageUploadButton
                  folder="timeline"
                  invitationId={invitationId}
                  onUpload={(url) => updateEvent(i, { imageUrl: url })}
                  label="Subir foto"
                />
              </div>
              <input
                type="url"
                value={event.imageUrl}
                onChange={(e) => updateEvent(i, { imageUrl: e.target.value })}
                placeholder="https://… o sube una foto arriba"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {event.imageUrl && (() => { try { new URL(event.imageUrl); return true; } catch { return false; } })() && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={event.imageUrl}
                  alt={`Preview ${event.title}`}
                  className="mt-2 h-28 w-full object-cover rounded-md border border-gray-200"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Add event */}
      <button
        type="button"
        onClick={addEvent}
        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
      >
        + Agregar evento
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
        {saving ? 'Guardando…' : 'Guardar timeline'}
      </button>
    </form>
  );
}
