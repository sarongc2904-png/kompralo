'use client';

import { useState } from 'react';
import type { InvitationFinalMessageInput } from '@/domain/invitations';
import { updateFinalMessage } from './actions';
import { ImageUploadButton } from '@/components/dashboard/ImageUploadButton';
import { notifyPreviewRefresh } from './previewRefresh';

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  invitationId: string;
  slug: string;
  initial: InvitationFinalMessageInput;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function FinalMessageForm({ invitationId, slug, initial }: Props) {
  const [form, setForm]     = useState<InvitationFinalMessageInput>(initial);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  function patch(key: keyof InvitationFinalMessageInput, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const imagePreview = form.imageUrl.trim() && (() => {
    try { new URL(form.imageUrl.trim()); return true; } catch { return false; }
  })();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setResult(null);

    const res = await updateFinalMessage({ id: invitationId, slug, finalMessage: form });

    setSaving(false);
    if (res.success) notifyPreviewRefresh();
    setResult({ success: res.success, message: res.success ? res.message : res.error });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Título */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Título <span className="text-gray-400">(opcional)</span>
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => patch('title', e.target.value)}
          placeholder="Ej: Con todo nuestro amor"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Mensaje */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Mensaje <span className="text-gray-400">(opcional)</span>
        </label>
        <textarea
          value={form.message}
          onChange={(e) => patch('message', e.target.value)}
          placeholder="Ej: Su presencia es el mejor regalo que nos pueden dar en este día tan especial."
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
        />
      </div>

      {/* Cita */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Cita / frase <span className="text-red-500">*</span>
        </label>
        <textarea
          value={form.quote}
          onChange={(e) => patch('quote', e.target.value)}
          placeholder={'Ej: "El amor no consiste en mirarse el uno al otro, sino en mirar juntos en la misma dirección."'}
          rows={2}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
        />
        <p className="text-xs text-gray-400 mt-0.5">
          Frase que aparece destacada en el cierre de la invitación.
        </p>
      </div>

      {/* Firma */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Firma <span className="text-gray-400">(opcional)</span>
        </label>
        <input
          type="text"
          value={form.signature}
          onChange={(e) => patch('signature', e.target.value)}
          placeholder="Ej: Sofía & Alejandro"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Imagen + preview */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Imagen de cierre <span className="text-gray-400">(opcional)</span>
        </label>
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <input
            type="url"
            value={form.imageUrl}
            onChange={(e) => patch('imageUrl', e.target.value)}
            placeholder="https://…"
            className="flex-1 min-w-0 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <ImageUploadButton
            folder="final-message"
            invitationId={invitationId}
            onUpload={(url) => patch('imageUrl', url)}
            className="w-full sm:w-auto"
          />
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          Fotografía que aparece como fondo o imagen principal en el mensaje final.
        </p>
        {imagePreview && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={form.imageUrl.trim()}
            alt="Preview imagen de cierre"
            className="mt-2 h-40 w-full object-cover rounded-md border border-gray-200"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        )}
      </div>

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
        {saving ? 'Guardando…' : 'Guardar mensaje final'}
      </button>
    </form>
  );
}
