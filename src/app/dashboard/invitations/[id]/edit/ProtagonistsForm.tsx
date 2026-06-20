'use client';

import { useState } from 'react';
import type { InvitationContent } from '@/domain/invitations';
import type { InvitationProtagonistInput } from '@/domain/invitations';
import { updateInvitationProtagonists } from './actions';
import { ImageUploadButton } from '@/components/dashboard/ImageUploadButton';
import type { UpdateInvitationResult } from './actions';
import { notifyPreviewRefresh } from './previewRefresh';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildInitialProtagonists(
  raw: InvitationContent['protagonists'],
): InvitationProtagonistInput[] {
  return (raw ?? []).map((p) => ({
    id:          p.id,
    name:        p.name,
    role:        p.role        ?? '',
    familyLabel: p.familyLabel ?? '',
    imageUrl:    p.imageUrl    ?? '',
    quote:       p.quote       ?? '',
  }));
}

function newProtagonist(): InvitationProtagonistInput {
  return {
    id:          crypto.randomUUID(),
    name:        '',
    role:        '',
    familyLabel: '',
    imageUrl:    '',
    quote:       '',
  };
}

// ─── Inline label ─────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-[10px] uppercase tracking-widest mb-1" style={{ color: '#9B8878' }}>
      {children}
    </span>
  );
}

function InlineInput({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-2.5 py-1.5 rounded text-sm"
      style={{
        background: '#FFFFFF',
        border: '1px solid #E8E2DA',
        color: '#1A1410',
        outline: 'none',
      }}
      onFocus={(e) => { e.currentTarget.style.borderColor = '#C5A880'; }}
      onBlur={(e)  => { e.currentTarget.style.borderColor = '#E8E2DA'; }}
    />
  );
}

// ─── Protagonist card ─────────────────────────────────────────────────────────

function ProtagonistCard({
  protagonist,
  index,
  total,
  invitationId,
  onChange,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  protagonist: InvitationProtagonistInput;
  index: number;
  total: number;
  invitationId: string;
  onChange: (field: keyof InvitationProtagonistInput, value: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}) {
  const [imgError, setImgError] = useState(false);

  const isValidImageUrl = (() => {
    if (!protagonist.imageUrl) return false;
    try { new URL(protagonist.imageUrl); return true; } catch { return false; }
  })();

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: '#FAFAF8', border: '1px solid #E8E2DA' }}
    >
      {/* Header row: avatar + number + controls */}
      <div className="flex items-center gap-3 mb-4">
        {/* Avatar preview */}
        <div
          className="flex-shrink-0 rounded-full overflow-hidden"
          style={{ width: 48, height: 48, background: '#F0EBE4' }}
        >
          {isValidImageUrl && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={protagonist.imageUrl}
              alt={protagonist.name || `Protagonista ${index + 1}`}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-lg">
              👤
            </div>
          )}
        </div>

        <p className="flex-1 text-sm font-medium" style={{ color: '#1A1410' }}>
          {protagonist.name || `Protagonista ${index + 1}`}
        </p>

        {/* Order + delete controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            title="Mover arriba"
            className="px-2 py-1 rounded text-xs transition-opacity"
            style={{ background: '#F0EBE4', color: '#6B5B4E', opacity: index === 0 ? 0.3 : 1 }}
          >
            ↑
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            title="Mover abajo"
            className="px-2 py-1 rounded text-xs transition-opacity"
            style={{ background: '#F0EBE4', color: '#6B5B4E', opacity: index === total - 1 ? 0.3 : 1 }}
          >
            ↓
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={total === 1}
            title="Eliminar protagonista"
            className="inline-flex min-h-[36px] items-center justify-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-30"
          >
            ✕ Eliminar
          </button>
        </div>
      </div>

      {/* Fields grid */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Nombre *</Label>
          <InlineInput
            value={protagonist.name}
            onChange={(v) => { setImgError(false); onChange('name', v); }}
            placeholder="Ej: Sofía"
          />
        </div>
        <div>
          <Label>Rol</Label>
          <InlineInput
            value={protagonist.role}
            onChange={(v) => onChange('role', v)}
            placeholder="Ej: Novia, Homenajeada"
          />
        </div>
        <div>
          <Label>Etiqueta familia</Label>
          <InlineInput
            value={protagonist.familyLabel}
            onChange={(v) => onChange('familyLabel', v)}
            placeholder="Ej: hija de…"
          />
        </div>
        <div>
          <Label>Foto (URL)</Label>
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <InlineInput
                value={protagonist.imageUrl}
                onChange={(v) => { setImgError(false); onChange('imageUrl', v); }}
                placeholder="https://..."
                type="url"
              />
            </div>
            <ImageUploadButton
              folder="protagonists"
              invitationId={invitationId}
              onUpload={(url) => { setImgError(false); onChange('imageUrl', url); }}
            />
          </div>
        </div>
        <div className="col-span-2">
          <Label>Cita o frase (opcional)</Label>
          <InlineInput
            value={protagonist.quote}
            onChange={(v) => onChange('quote', v)}
            placeholder={'Ej: “El amor es la respuesta.”'}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Form ─────────────────────────────────────────────────────────────────────

interface ProtagonistsFormProps {
  invitation: InvitationContent;
}

export default function ProtagonistsForm({ invitation }: ProtagonistsFormProps) {
  const [protagonists, setProtagonists] = useState<InvitationProtagonistInput[]>(
    () => buildInitialProtagonists(invitation.protagonists),
  );
  const [result, setResult] = useState<UpdateInvitationResult | null>(null);
  const [isPending, setIsPending] = useState(false);

  // ── Mutations ───────────────────────────────────────────────────────────────

  function handleChange(index: number, field: keyof InvitationProtagonistInput, value: string) {
    setProtagonists((prev) =>
      prev.map((p, i) => i === index ? { ...p, [field]: value } : p),
    );
    setResult(null);
  }

  function handleMoveUp(index: number) {
    if (index === 0) return;
    setProtagonists((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
    setResult(null);
  }

  function handleMoveDown(index: number) {
    setProtagonists((prev) => {
      if (index === prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
    setResult(null);
  }

  function handleDelete(index: number) {
    if (protagonists.length === 1) return;
    setProtagonists((prev) => prev.filter((_, i) => i !== index));
    setResult(null);
  }

  function handleAdd() {
    setProtagonists((prev) => [...prev, newProtagonist()]);
    setResult(null);
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);
    setResult(null);
    const res = await updateInvitationProtagonists({
      id:   invitation.id,
      slug: invitation.slug,
      protagonists,
    });
    if (res.success) notifyPreviewRefresh();
    setResult(res);
    setIsPending(false);
  }

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit}>
      {/* Feedback */}
      {result && (
        <div
          className="mb-4 px-4 py-3 rounded-lg text-sm"
          style={{
            background: result.success ? '#E8F5E9' : '#FFEBEE',
            color:      result.success ? '#388E3C'  : '#C62828',
            border:     `1px solid ${result.success ? '#C8E6C9' : '#FFCDD2'}`,
          }}
        >
          {result.success ? result.message : result.error}
        </div>
      )}

      {/* Cards */}
      <div className="flex flex-col gap-3 mb-4">
        {protagonists.map((p, i) => (
          <ProtagonistCard
            key={p.id}
            protagonist={p}
            index={i}
            total={protagonists.length}
            invitationId={invitation.id}
            onChange={(field, value) => handleChange(i, field, value)}
            onMoveUp={() => handleMoveUp(i)}
            onMoveDown={() => handleMoveDown(i)}
            onDelete={() => handleDelete(i)}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleAdd}
          className="px-4 py-2 rounded-lg text-sm transition-colors"
          style={{ background: '#F0EBE4', color: '#3D2B1A', border: '1px dashed #C5A880' }}
        >
          + Agregar protagonista
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 rounded-lg text-sm font-medium transition-opacity"
          style={{ background: '#1A1410', color: '#F5F3F0', opacity: isPending ? 0.6 : 1 }}
        >
          {isPending ? 'Guardando…' : `Guardar protagonistas (${protagonists.length})`}
        </button>
      </div>
    </form>
  );
}
