'use client';

import { useState } from 'react';
import type { InvitationStorySlideInput } from '@/domain/invitations';
import { updateStoryBook } from './actions';
import { ImageUploadButton } from '@/components/dashboard/ImageUploadButton';
import { notifyPreviewRefresh } from './previewRefresh';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function newSlide(): InvitationStorySlideInput {
  return { id: crypto.randomUUID(), title: '', subtitle: '', text: '', imageUrl: '', date: '' };
}

function initSlides(raw: InvitationStorySlideInput[]): InvitationStorySlideInput[] {
  if (!raw || raw.length === 0) return [newSlide()];
  return raw;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  invitationId: string;
  slug: string;
  initialSlides: InvitationStorySlideInput[];
}

// ─── Component ───────────────────────────────────────────────────────────────

export function StoryBookForm({ invitationId, slug, initialSlides }: Props) {
  const [slides, setSlides]   = useState<InvitationStorySlideInput[]>(() => initSlides(initialSlides));
  const [saving, setSaving]   = useState(false);
  const [result, setResult]   = useState<{ success: boolean; message: string } | null>(null);

  // ── Slide-level helpers ───────────────────────────────────────────────────

  function updateSlide(index: number, patch: Partial<InvitationStorySlideInput>) {
    setSlides((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function addSlide() {
    setSlides((prev) => [...prev, newSlide()]);
  }

  function removeSlide(index: number) {
    setSlides((prev) => prev.filter((_, i) => i !== index));
  }

  function moveUp(index: number) {
    if (index === 0) return;
    setSlides((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }

  function moveDown(index: number) {
    setSlides((prev) => {
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

    const res = await updateStoryBook({ id: invitationId, slug, slides });

    setSaving(false);
    if (res.success) notifyPreviewRefresh();
    setResult({ success: res.success, message: res.success ? res.message : res.error });
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {slides.map((slide, i) => (
        <div key={slide.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          {/* Card header with controls */}
          <div className="flex items-center justify-between gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200">
            <span className="text-sm font-semibold text-gray-700">Slide {i + 1}</span>
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
                disabled={i === slides.length - 1}
                className="px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-40"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeSlide(i)}
                className="px-2 py-1 text-xs bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100"
              >
                Eliminar
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Image preview + URL */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                URL de imagen <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="url"
                  value={slide.imageUrl}
                  onChange={(e) => updateSlide(i, { imageUrl: e.target.value })}
                  placeholder="https://…"
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <ImageUploadButton
                  folder="storybook"
                  invitationId={invitationId}
                  onUpload={(url) => updateSlide(i, { imageUrl: url })}
                />
              </div>
              {slide.imageUrl && (() => { try { new URL(slide.imageUrl); return true; } catch { return false; } })() && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={slide.imageUrl}
                  alt={`Preview slide ${i + 1}`}
                  className="mt-2 h-32 w-full object-cover rounded-md border border-gray-200"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
              )}
            </div>

            {/* Title + Subtitle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={slide.title}
                  onChange={(e) => updateSlide(i, { title: e.target.value })}
                  placeholder="Ej: Nos conocimos"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Subtítulo <span className="text-gray-400">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={slide.subtitle}
                  onChange={(e) => updateSlide(i, { subtitle: e.target.value })}
                  placeholder="Ej: Una tarde de verano"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            {/* Text */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Texto principal <span className="text-red-500">*</span>
              </label>
              <textarea
                value={slide.text}
                onChange={(e) => updateSlide(i, { text: e.target.value })}
                placeholder="Escribe la historia de este momento…"
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              />
            </div>

            {/* Date */}
            <div className="max-w-xs">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Fecha <span className="text-gray-400">(opcional)</span>
              </label>
              <input
                type="text"
                value={slide.date}
                onChange={(e) => updateSlide(i, { date: e.target.value })}
                placeholder="Ej: Marzo 2019"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
        </div>
      ))}

      {/* Add slide */}
      <button
        type="button"
        onClick={addSlide}
        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
      >
        + Agregar slide
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
        {saving ? 'Guardando…' : 'Guardar StoryBook'}
      </button>
    </form>
  );
}
