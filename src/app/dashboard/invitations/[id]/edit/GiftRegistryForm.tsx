'use client';

import { useState } from 'react';
import type { InvitationContent, InvitationGiftProviderInput, GiftLogoType } from '@/domain/invitations';
import { updateInvitationGiftRegistry } from './actions';
import type { UpdateInvitationResult } from './actions';
import { notifyPreviewRefresh } from './previewRefresh';

// ─── Provider catalogue (suggestions only — user can use custom) ──────────────

const PROVIDER_SUGGESTIONS: { label: string; logoType: GiftLogoType; hint: string }[] = [
  { label: 'Amazon',             logoType: 'amazon',       hint: 'amazon.com.mx/...' },
  { label: 'Liverpool',          logoType: 'liverpool',    hint: 'mesaderegalos.liverpool.com.mx/...' },
  { label: 'El Palacio de Hierro', logoType: 'palacio',    hint: 'bodas.elpalaciodehierro.com/...' },
  { label: 'Mercado Libre',      logoType: 'mercadolibre', hint: 'mesaderegalos.mercadolibre.com.mx/...' },
  { label: 'PayPal',             logoType: 'paypal',       hint: 'paypal.me/...' },
  { label: 'Transferencia',      logoType: 'bank',         hint: 'CLABE interbancaria' },
  { label: 'Otro',               logoType: 'custom',       hint: 'URL de tu mesa de regalos' },
];

const LOGO_TYPE_OPTIONS: { value: GiftLogoType; label: string }[] = [
  { value: 'amazon',       label: 'Amazon' },
  { value: 'liverpool',    label: 'Liverpool' },
  { value: 'palacio',      label: 'El Palacio de Hierro' },
  { value: 'mercadolibre', label: 'Mercado Libre' },
  { value: 'paypal',       label: 'PayPal' },
  { value: 'bank',         label: 'Transferencia bancaria (CLABE)' },
  { value: 'custom',       label: 'Otro (enlace personalizado)' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildInitialItems(registry: InvitationContent['giftRegistry']): InvitationGiftProviderInput[] {
  return (registry?.items ?? []).map((item) => ({
    id:           item.id,
    provider:     item.provider,
    logoType:     item.logoType,
    link:         item.link         ?? '',
    description:  item.description  ?? '',
    bankName:     item.bankDetails?.bankName     ?? '',
    clabe:        item.bankDetails?.clabe        ?? '',
    accountOwner: item.bankDetails?.accountOwner ?? '',
  }));
}

function newItem(logoType: GiftLogoType = 'custom', provider = ''): InvitationGiftProviderInput {
  return {
    id:           crypto.randomUUID(),
    provider,
    logoType,
    link:         '',
    description:  '',
    bankName:     '',
    clabe:        '',
    accountOwner: '',
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
  value, onChange, placeholder, type = 'text', hasError,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  type?: string; hasError?: boolean;
}) {
  return (
    <input
      type={type} value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-2.5 py-1.5 rounded text-sm"
      style={{
        background: '#FFFFFF',
        border: `1px solid ${hasError ? '#FFCDD2' : '#E8E2DA'}`,
        color: '#1A1410', outline: 'none',
      }}
      onFocus={(e) => { e.currentTarget.style.borderColor = '#C5A880'; }}
      onBlur={(e)  => { e.currentTarget.style.borderColor = hasError ? '#FFCDD2' : '#E8E2DA'; }}
    />
  );
}

// ─── Provider card ────────────────────────────────────────────────────────────

function ProviderCard({
  item, index, total, onChange, onMoveUp, onMoveDown, onDelete, showErrors,
}: {
  item: InvitationGiftProviderInput;
  index: number; total: number;
  onChange: (field: keyof InvitationGiftProviderInput, value: string) => void;
  onMoveUp: () => void; onMoveDown: () => void; onDelete: () => void;
  showErrors: boolean;
}) {
  const isBank = item.logoType === 'bank';

  return (
    <div className="rounded-xl p-4" style={{ background: '#FAFAF8', border: '1px solid #E8E2DA' }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <p className="flex-1 text-sm font-medium truncate" style={{ color: '#1A1410' }}>
          {item.provider || `Proveedor ${index + 1}`}
        </p>
        <div className="flex gap-1">
          <button type="button" onClick={onMoveUp} disabled={index === 0}
            className="px-2 py-1 rounded text-xs" title="Mover arriba"
            style={{ background: '#F0EBE4', color: '#6B5B4E', opacity: index === 0 ? 0.3 : 1 }}>↑</button>
          <button type="button" onClick={onMoveDown} disabled={index === total - 1}
            className="px-2 py-1 rounded text-xs" title="Mover abajo"
            style={{ background: '#F0EBE4', color: '#6B5B4E', opacity: index === total - 1 ? 0.3 : 1 }}>↓</button>
          <button type="button" onClick={onDelete}
            className="px-2 py-1 rounded text-xs" title="Eliminar"
            style={{ background: '#FFEBEE', color: '#C62828' }}>✕</button>
        </div>
      </div>

      {/* Common fields */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <Label required>Nombre</Label>
          <SmallInput
            value={item.provider}
            onChange={(v) => onChange('provider', v)}
            placeholder="Ej: Liverpool"
            hasError={showErrors && !item.provider.trim()}
          />
        </div>
        <div>
          <Label required>Tipo</Label>
          <select
            value={item.logoType}
            onChange={(e) => onChange('logoType', e.target.value)}
            className="w-full px-2.5 py-1.5 rounded text-sm"
            style={{ background: '#FFFFFF', border: '1px solid #E8E2DA', color: '#1A1410', outline: 'none' }}
          >
            {LOGO_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bank fields */}
      {isBank ? (
        <div className="grid grid-cols-1 gap-3">
          <div
            className="px-3 py-2 rounded-lg text-xs mb-1"
            style={{ background: '#FFF8E1', color: '#B8860B', border: '1px solid #FFE082' }}
          >
            Ingresa los datos bancarios. Los invitados podrán copiar la CLABE desde la invitación.
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label required>Banco</Label>
              <SmallInput value={item.bankName} onChange={(v) => onChange('bankName', v)}
                placeholder="Ej: BBVA, Banamex" hasError={showErrors && isBank && !item.bankName.trim()} />
            </div>
            <div>
              <Label required>Titular</Label>
              <SmallInput value={item.accountOwner} onChange={(v) => onChange('accountOwner', v)}
                placeholder="Nombre del dueño de la cuenta" hasError={showErrors && isBank && !item.accountOwner.trim()} />
            </div>
          </div>
          <div>
            <Label required>CLABE interbancaria (18 dígitos)</Label>
            <SmallInput value={item.clabe} onChange={(v) => onChange('clabe', v)}
              placeholder="000000000000000000" type="text"
              hasError={showErrors && isBank && !/^\d{18}$/.test(item.clabe.trim())} />
            {item.clabe && !/^\d{18}$/.test(item.clabe.trim()) && (
              <p className="text-[10px] mt-1" style={{ color: '#C62828' }}>
                Debe tener exactamente 18 dígitos.
              </p>
            )}
          </div>
        </div>
      ) : (
        /* Link + description fields */
        <div className="grid grid-cols-1 gap-3">
          <div>
            <Label required>URL</Label>
            <SmallInput value={item.link} onChange={(v) => onChange('link', v)}
              placeholder="https://..."  type="url"
              hasError={showErrors && !isBank && !item.link.trim()} />
          </div>
          <div>
            <Label>Descripción (opcional)</Label>
            <SmallInput value={item.description} onChange={(v) => onChange('description', v)}
              placeholder="Ej: Busca la lista bajo el nombre..." />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Form ─────────────────────────────────────────────────────────────────────

interface GiftRegistryFormProps {
  invitation: InvitationContent;
}

export default function GiftRegistryForm({ invitation }: GiftRegistryFormProps) {
  const [items, setItems] = useState<InvitationGiftProviderInput[]>(
    () => buildInitialItems(invitation.giftRegistry),
  );
  const [result, setResult]   = useState<UpdateInvitationResult | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  function handleChange(index: number, field: keyof InvitationGiftProviderInput, value: string) {
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

  function handleAddSuggestion(logoType: GiftLogoType, label: string) {
    setItems((prev) => [...prev, newItem(logoType, label === 'Otro' ? '' : label)]);
    setResult(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowErrors(true);
    setIsPending(true);
    setResult(null);
    const res = await updateInvitationGiftRegistry({ id: invitation.id, slug: invitation.slug, items });
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

      {/* Provider list */}
      <div className="flex flex-col gap-3 mb-5">
        {items.length === 0 && (
          <p className="text-sm py-4 text-center" style={{ color: '#B0A090' }}>
            No hay proveedores. Usa los botones de abajo para agregar uno.
          </p>
        )}
        {items.map((item, i) => (
          <ProviderCard
            key={item.id}
            item={item} index={i} total={items.length}
            onChange={(field, value) => handleChange(i, field, value)}
            onMoveUp={() => handleMoveUp(i)}
            onMoveDown={() => handleMoveDown(i)}
            onDelete={() => handleDelete(i)}
            showErrors={showErrors}
          />
        ))}
      </div>

      {/* Quick-add suggestions */}
      <div className="mb-5">
        <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: '#B0A090' }}>
          Agregar rápido:
        </p>
        <div className="flex flex-wrap gap-2">
          {PROVIDER_SUGGESTIONS.map((s) => (
            <button
              key={s.logoType + s.label}
              type="button"
              onClick={() => handleAddSuggestion(s.logoType, s.label)}
              className="px-3 py-1.5 rounded-lg text-xs transition-colors"
              style={{ background: '#F0EBE4', color: '#3D2B1A', border: '1px solid #E8E2DA' }}
            >
              + {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="px-5 py-2.5 rounded-lg text-sm font-medium transition-opacity"
        style={{ background: '#1A1410', color: '#F5F3F0', opacity: isPending ? 0.6 : 1 }}
      >
        {isPending ? 'Guardando…' : `Guardar mesa de regalos (${items.length})`}
      </button>
    </form>
  );
}
