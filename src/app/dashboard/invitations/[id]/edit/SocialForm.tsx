'use client';

import { useState } from 'react';
import type { InvitationSocialInput } from '@/domain/invitations';
import { updateSocial } from './actions';
import { notifyPreviewRefresh } from './previewRefresh';

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  invitationId: string;
  slug: string;
  initialSocial: InvitationSocialInput;
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({
  label,
  hint,
  prefix,
  type = 'text',
  value,
  placeholder,
  onChange,
  onClear,
}: {
  label: string;
  hint?: string;
  prefix?: string;
  type?: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  onClear?: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-xs font-medium text-gray-600">
          {label} <span className="text-gray-400">(opcional)</span>
        </label>
        {onClear && value && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            ✕ Quitar
          </button>
        )}
      </div>
      <div className="flex rounded-md border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-transparent">
        {prefix && (
          <span className="flex items-center px-3 text-sm text-gray-500 bg-gray-50 border-r border-gray-300 select-none">
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 text-sm outline-none bg-white"
        />
      </div>
      {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function SocialForm({ invitationId, slug, initialSocial }: Props) {
  const [form, setForm]     = useState<InvitationSocialInput>(initialSocial);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  function patch(key: keyof InvitationSocialInput, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setResult(null);

    try {
      const res = await updateSocial({ id: invitationId, slug, social: form });
      if (res.success) {
        notifyPreviewRefresh();
        setResult({ success: true, message: res.message });
      } else {
        setResult({ success: false, message: res.error });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error inesperado al guardar.';
      setResult({ success: false, message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Hashtag */}
      <Field
        label="Hashtag"
        prefix="#"
        value={form.hashtag}
        placeholder="NuestraBoda2025"
        hint="Sin el símbolo # — se agrega automáticamente."
        onChange={(v) => patch('hashtag', v.replace(/^#/, ''))}
      />

      {/* Instagram + TikTok */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Instagram"
          prefix="@"
          value={form.instagramHandle}
          placeholder="usuario"
          hint="Solo el nombre de usuario, sin @."
          onChange={(v) => patch('instagramHandle', v.replace(/^@/, ''))}
          onClear={() => patch('instagramHandle', '')}
        />
        <Field
          label="TikTok"
          prefix="@"
          value={form.tiktokHandle}
          placeholder="usuario"
          hint="Solo el nombre de usuario, sin @."
          onChange={(v) => patch('tiktokHandle', v.replace(/^@/, ''))}
          onClear={() => patch('tiktokHandle', '')}
        />
      </div>

      {/* Facebook + YouTube */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Facebook"
          type="url"
          value={form.facebookUrl}
          placeholder="https://facebook.com/…"
          onChange={(v) => patch('facebookUrl', v)}
          onClear={() => patch('facebookUrl', '')}
        />
        <Field
          label="YouTube"
          type="url"
          value={form.youtubeUrl}
          placeholder="https://youtube.com/…"
          onChange={(v) => patch('youtubeUrl', v)}
          onClear={() => patch('youtubeUrl', '')}
        />
      </div>

      {/* Nota */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Nota <span className="text-gray-400">(opcional)</span>
        </label>
        <textarea
          value={form.note}
          onChange={(e) => patch('note', e.target.value)}
          placeholder="Ej: Comparte tus fotos con nuestro hashtag y etiquétanos en Instagram"
          rows={2}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
        />
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
        {saving ? 'Guardando…' : 'Guardar redes'}
      </button>
    </form>
  );
}
