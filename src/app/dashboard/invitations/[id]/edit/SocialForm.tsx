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
  required,
  type = 'text',
  value,
  placeholder,
  onChange,
}: {
  label: string;
  hint?: string;
  prefix?: string;
  required?: boolean;
  type?: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}{' '}
        {required
          ? <span className="text-red-500">*</span>
          : <span className="text-gray-400">(opcional)</span>}
      </label>
      <div className={`flex rounded-md border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-transparent`}>
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

    const res = await updateSocial({ id: invitationId, slug, social: form });

    setSaving(false);
    if (res.success) notifyPreviewRefresh();
    setResult({ success: res.success, message: res.success ? res.message : res.error });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Hashtag */}
      <Field
        label="Hashtag"
        required
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
        />
        <Field
          label="TikTok"
          prefix="@"
          value={form.tiktokHandle}
          placeholder="usuario"
          hint="Solo el nombre de usuario, sin @."
          onChange={(v) => patch('tiktokHandle', v.replace(/^@/, ''))}
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
        />
        <Field
          label="YouTube"
          type="url"
          value={form.youtubeUrl}
          placeholder="https://youtube.com/…"
          onChange={(v) => patch('youtubeUrl', v)}
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
