'use client';

import { useState } from 'react';
import type { InvitationContent, InvitationItineraryItemInput, ItineraryIcon } from '@/domain/invitations';
import { updateInvitationItinerary } from './actions';
import type { UpdateInvitationResult } from './actions';
import { notifyPreviewRefresh } from './previewRefresh';

// ─── Icon catalogue ───────────────────────────────────────────────────────────

const ICON_OPTIONS: { value: ItineraryIcon; label: string; emoji: string }[] = [
  { value: 'church',   label: 'Iglesia',   emoji: '⛪' },
  { value: 'rings',    label: 'Anillos',   emoji: '💍' },
  { value: 'glass',    label: 'Brindis',   emoji: '🥂' },
  { value: 'music',    label: 'Música',    emoji: '🎵' },
  { value: 'utensils', label: 'Cena',      emoji: '🍽️' },
];

const ICON_EMOJI: Record<ItineraryIcon, string> = Object.fromEntries(
  ICON_OPTIONS.map((o) => [o.value, o.emoji]),
) as Record<ItineraryIcon, string>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildInitialItems(raw: InvitationContent['itinerary']): InvitationItineraryItemInput[] {
  return (raw ?? []).map((item) => ({
    id:          item.id,
    time:        item.time,
    title:       item.title,
    location:    item.location,
    icon:        item.icon,
    description: item.description ?? '',
  }));
}

function newItem(): InvitationItineraryItemInput {
  return {
    id:          crypto.randomUUID(),
    time:        '',
    title:       '',
    location:    '',
    icon:        'rings',
    description: '',
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <span className="block text-[10px] uppercase tracking-widest mb-1" style={{ color: '#9B8878' }}>
      {children}
      {required && <span className="ml-0.5" style={{ color: '#C5A880' }}>*</span>}
    </span>
  );
}

function SmallInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  hasError,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  hasError?: boolean;
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
        border: `1px solid ${hasError ? '#FFCDD2' : '#E8E2DA'}`,
        color: '#1A1410',
        outline: 'none',
      }}
      onFocus={(e) => { e.currentTarget.style.borderColor = '#C5A880'; }}
      onBlur={(e)  => { e.currentTarget.style.borderColor = hasError ? '#FFCDD2' : '#E8E2DA'; }}
    />
  );
}

// ─── Item card ────────────────────────────────────────────────────────────────

function ItineraryItemCard({
  item,
  index,
  total,
  onChange,
  onMoveUp,
  onMoveDown,
  onDelete,
  showErrors,
}: {
  item: InvitationItineraryItemInput;
  index: number;
  total: number;
  onChange: (field: keyof InvitationItineraryItemInput, value: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  showErrors: boolean;
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: '#FAFAF8', border: '1px solid #E8E2DA' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl leading-none">{ICON_EMOJI[item.icon]}</span>
        <p className="flex-1 text-sm font-medium truncate" style={{ color: '#1A1410' }}>
          {item.title || `Evento ${index + 1}`}
        </p>
        <span className="text-xs" style={{ color: '#B0A090' }}>{item.time || '--:--'}</span>
        <div className="flex gap-1">
          <button type="button" onClick={onMoveUp} disabled={index === 0}
            className="px-2 py-1 rounded text-xs" title="Mover arriba"
            style={{ background: '#F0EBE4', color: '#6B5B4E', opacity: index === 0 ? 0.3 : 1 }}>
            ↑
          </button>
          <button type="button" onClick={onMoveDown} disabled={index === total - 1}
            className="px-2 py-1 rounded text-xs" title="Mover abajo"
            style={{ background: '#F0EBE4', color: '#6B5B4E', opacity: index === total - 1 ? 0.3 : 1 }}>
            ↓
          </button>
          <button type="button" onClick={onDelete}
            className="px-2 py-1 rounded text-xs" title="Eliminar"
            style={{ background: '#FFEBEE', color: '#C62828' }}>
            ✕
          </button>
        </div>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label required>Hora</Label>
          <SmallInput
            value={item.time}
            onChange={(v) => onChange('time', v)}
            placeholder="Ej: 13:00"
            hasError={showErrors && !item.time.trim()}
          />
        </div>
        <div>
          <Label required>Título</Label>
          <SmallInput
            value={item.title}
            onChange={(v) => onChange('title', v)}
            placeholder="Ej: Ceremonia religiosa"
            hasError={showErrors && !item.title.trim()}
          />
        </div>
        <div>
          <Label>Ubicación</Label>
          <SmallInput
            value={item.location}
            onChange={(v) => onChange('location', v)}
            placeholder="Ej: Catedral de…"
          />
        </div>
        <div>
          <Label>Ícono</Label>
          <select
            value={item.icon}
            onChange={(e) => onChange('icon', e.target.value)}
            className="w-full px-2.5 py-1.5 rounded text-sm"
            style={{
              background: '#FFFFFF',
              border: '1px solid #E8E2DA',
              color: '#1A1410',
              outline: 'none',
            }}
          >
            {ICON_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.emoji} {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <Label>Descripción (opcional)</Label>
          <SmallInput
            value={item.description}
            onChange={(v) => onChange('description', v)}
            placeholder="Notas adicionales para los invitados…"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Form ─────────────────────────────────────────────────────────────────────

interface ItineraryFormProps {
  invitation: InvitationContent;
}

export default function ItineraryForm({ invitation }: ItineraryFormProps) {
  const [items, setItems] = useState<InvitationItineraryItemInput[]>(
    () => buildInitialItems(invitation.itinerary),
  );
  const [result, setResult] = useState<UpdateInvitationResult | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  function handleChange(index: number, field: keyof InvitationItineraryItemInput, value: string) {
    setItems((prev) => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
    setResult(null);
  }

  function handleMoveUp(index: number) {
    if (index === 0) return;
    setItems((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }

  function handleMoveDown(index: number) {
    setItems((prev) => {
      if (index === prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }

  function handleDelete(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
    setResult(null);
  }

  function handleAdd() {
    setItems((prev) => [...prev, newItem()]);
    setResult(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowErrors(true);

    // Client-side pre-check so we don't fire the action with known-bad data.
    const hasEmpty = items.some((item) => !item.time.trim() || !item.title.trim());
    if (hasEmpty) {
      setResult({ success: false, error: 'Completa la hora y el título de todos los eventos.' });
      return;
    }

    setIsPending(true);
    setResult(null);
    const res = await updateInvitationItinerary({ id: invitation.id, slug: invitation.slug, items });
    if (res.success) notifyPreviewRefresh();
    setResult(res);
    setIsPending(false);
    if (res.success) setShowErrors(false);
  }

  return (
    <form onSubmit={handleSubmit}>
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

      <div className="flex flex-col gap-3 mb-4">
        {items.length === 0 && (
          <p className="text-sm py-4 text-center" style={{ color: '#B0A090' }}>
            No hay eventos en el itinerario. Agrega uno para comenzar.
          </p>
        )}
        {items.map((item, i) => (
          <ItineraryItemCard
            key={item.id}
            item={item}
            index={i}
            total={items.length}
            onChange={(field, value) => handleChange(i, field, value)}
            onMoveUp={() => handleMoveUp(i)}
            onMoveDown={() => handleMoveDown(i)}
            onDelete={() => handleDelete(i)}
            showErrors={showErrors}
          />
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleAdd}
          className="px-4 py-2 rounded-lg text-sm"
          style={{ background: '#F0EBE4', color: '#3D2B1A', border: '1px dashed #C5A880' }}
        >
          + Agregar evento
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 rounded-lg text-sm font-medium transition-opacity"
          style={{ background: '#1A1410', color: '#F5F3F0', opacity: isPending ? 0.6 : 1 }}
        >
          {isPending ? 'Guardando…' : `Guardar itinerario (${items.length})`}
        </button>
      </div>
    </form>
  );
}
