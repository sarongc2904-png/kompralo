'use client';

import { useState } from 'react';
import type { PadrinoIcon, InvitationSponsorInput } from '@/domain/invitations';
import { updateInvitationPadrinos } from './actions';
import { notifyPreviewRefresh } from './previewRefresh';

// ─── Icon options ─────────────────────────────────────────────────────────────

const ICON_OPTIONS: { value: PadrinoIcon; label: string }[] = [
  { value: 'flowers',  label: '🌸 Flores'       },
  { value: 'cake',     label: '🎂 Pastel'        },
  { value: 'music',    label: '🎵 Música'        },
  { value: 'rings',    label: '💍 Argollas'      },
  { value: 'photo',    label: '📷 Fotografía'    },
  { value: 'video',    label: '🎥 Video'         },
  { value: 'lights',   label: '💡 Iluminación'   },
  { value: 'bar',      label: '🍸 Bar'           },
  { value: 'car',      label: '🚗 Transporte'    },
  { value: 'church',   label: '⛪ Iglesia'       },
  { value: 'dress',    label: '👗 Vestido'       },
  { value: 'gift',     label: '🎁 Regalo'        },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function newSponsor(): InvitationSponsorInput {
  return { id: crypto.randomUUID(), rubro: '', icon: 'rings', names: [''] };
}

function initSponsors(raw: InvitationSponsorInput[]): InvitationSponsorInput[] {
  if (!raw || raw.length === 0) return [newSponsor()];
  return raw.map((s) => ({
    ...s,
    names: s.names.length > 0 ? s.names : [''],
  }));
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  invitationId: string;
  slug: string;
  initialPadrinos: InvitationSponsorInput[];
}

// ─── Component ───────────────────────────────────────────────────────────────

export function SponsorsForm({ invitationId, slug, initialPadrinos }: Props) {
  const [items, setItems]     = useState<InvitationSponsorInput[]>(() => initSponsors(initialPadrinos));
  const [saving, setSaving]   = useState(false);
  const [result, setResult]   = useState<{ success: boolean; message: string } | null>(null);

  // ── Category-level helpers ────────────────────────────────────────────────

  function updateItem(index: number, patch: Partial<InvitationSponsorInput>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function addCategory() {
    setItems((prev) => [...prev, newSponsor()]);
  }

  function removeCategory(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function moveUp(index: number) {
    if (index === 0) return;
    setItems((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }

  function moveDown(index: number) {
    setItems((prev) => {
      if (index === prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }

  // ── Name-level helpers ────────────────────────────────────────────────────

  function updateName(catIndex: number, nameIndex: number, value: string) {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== catIndex) return item;
        const names = [...item.names];
        names[nameIndex] = value;
        return { ...item, names };
      }),
    );
  }

  function addName(catIndex: number) {
    setItems((prev) =>
      prev.map((item, i) =>
        i === catIndex ? { ...item, names: [...item.names, ''] } : item,
      ),
    );
  }

  function removeName(catIndex: number, nameIndex: number) {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== catIndex) return item;
        const names = item.names.filter((_, j) => j !== nameIndex);
        return { ...item, names: names.length > 0 ? names : [''] };
      }),
    );
  }

  function moveNameUp(catIndex: number, nameIndex: number) {
    if (nameIndex === 0) return;
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== catIndex) return item;
        const names = [...item.names];
        [names[nameIndex - 1], names[nameIndex]] = [names[nameIndex], names[nameIndex - 1]];
        return { ...item, names };
      }),
    );
  }

  function moveNameDown(catIndex: number, nameIndex: number) {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== catIndex) return item;
        if (nameIndex === item.names.length - 1) return item;
        const names = [...item.names];
        [names[nameIndex], names[nameIndex + 1]] = [names[nameIndex + 1], names[nameIndex]];
        return { ...item, names };
      }),
    );
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setResult(null);

    const res = await updateInvitationPadrinos({
      id:       invitationId,
      slug,
      padrinos: items,
    });

    setSaving(false);
    if (res.success) notifyPreviewRefresh();
    setResult({ success: res.success, message: res.success ? res.message : res.error });
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {items.map((item, ci) => (
        <div key={item.id} className="border border-gray-200 rounded-lg p-4 space-y-4 bg-white">
          {/* Category header controls */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-gray-700">Categoría {ci + 1}</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => moveUp(ci)}
                disabled={ci === 0}
                className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-40"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveDown(ci)}
                disabled={ci === items.length - 1}
                className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-40"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeCategory(ci)}
                className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
              >
                Eliminar
              </button>
            </div>
          </div>

          {/* Rubro + Icon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Rubro <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={item.rubro}
                onChange={(e) => updateItem(ci, { rubro: e.target.value })}
                placeholder="Ej: Flores, Pastel, Música…"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Icono</label>
              <select
                value={item.icon}
                onChange={(e) => updateItem(ci, { icon: e.target.value as PadrinoIcon })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Names list */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Nombres <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {item.names.map((name, ni) => (
                <div key={ni} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => updateName(ci, ni, e.target.value)}
                    placeholder={`Nombre ${ni + 1}`}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    type="button"
                    onClick={() => moveNameUp(ci, ni)}
                    disabled={ni === 0}
                    className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-40"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveNameDown(ci, ni)}
                    disabled={ni === item.names.length - 1}
                    className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-40"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeName(ci, ni)}
                    disabled={item.names.length === 1}
                    className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200 disabled:opacity-40"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => addName(ci)}
              className="mt-2 text-xs text-blue-600 hover:underline"
            >
              + Agregar nombre
            </button>
          </div>
        </div>
      ))}

      {/* Add category */}
      <button
        type="button"
        onClick={addCategory}
        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
      >
        + Agregar categoría
      </button>

      {/* Feedback */}
      {result && (
        <p
          className={`text-sm font-medium ${result.success ? 'text-green-600' : 'text-red-600'}`}
        >
          {result.message}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={saving}
        className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors"
      >
        {saving ? 'Guardando…' : 'Guardar padrinos'}
      </button>
    </form>
  );
}
