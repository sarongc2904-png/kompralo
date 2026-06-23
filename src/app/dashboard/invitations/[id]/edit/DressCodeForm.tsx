'use client';

import { useState } from 'react';
import type { InvitationContent } from '@/domain/invitations';
import { updateInvitationDressCode } from './actions';
import type { UpdateInvitationResult } from './actions';
import { notifyPreviewRefresh } from './previewRefresh';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildInitialState(dc: InvitationContent['dressCode']) {
  return {
    type:           dc?.type           ?? '',
    title:          dc?.title          ?? '',
    description:    dc?.description    ?? '',
    observations:   dc?.observations   ?? '',
    primaryColor:   dc?.primaryColor   ?? '',
    secondaryColor: dc?.secondaryColor ?? '',
    suggestionsList: dc?.suggestionsList?.length
      ? dc.suggestionsList
      : dc?.suggestions
        ? [dc.suggestions]
        : [],
    colors:         dc?.colors         ?? [],
  };
}

const HEX_RE = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

// ─── Sub-components ───────────────────────────────────────────────────────────

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <span className="block text-[10px] uppercase tracking-widest mb-1" style={{ color: '#9B8878' }}>
      {children}
      {required && <span className="ml-0.5" style={{ color: '#C5A880' }}>*</span>}
    </span>
  );
}

function TextField({
  value, onChange, placeholder, hasError,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; hasError?: boolean;
}) {
  return (
    <input
      type="text" value={value} onChange={(e) => onChange(e.target.value)}
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

function TextArea({
  value, onChange, placeholder, rows = 3,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder} rows={rows}
      className="w-full px-2.5 py-1.5 rounded text-sm resize-none"
      style={{ background: '#FFFFFF', border: '1px solid #E8E2DA', color: '#1A1410', outline: 'none' }}
      onFocus={(e) => { e.currentTarget.style.borderColor = '#C5A880'; }}
      onBlur={(e)  => { e.currentTarget.style.borderColor = '#E8E2DA'; }}
    />
  );
}

// ─── Color picker field ───────────────────────────────────────────────────────

function ColorField({
  label, value, onChange,
}: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  const isValid = !value || HEX_RE.test(value);
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        {/* Native color picker as visual aid */}
        <input
          type="color"
          value={HEX_RE.test(value) ? value : '#C5A880'}
          onChange={(e) => onChange(e.target.value)}
          className="w-9 h-9 rounded cursor-pointer flex-shrink-0"
          style={{ border: '1px solid #E8E2DA', padding: 2 }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#C5A880"
          maxLength={7}
          className="flex-1 px-2.5 py-1.5 rounded text-sm font-mono"
          style={{
            background: '#FFFFFF',
            border: `1px solid ${!isValid ? '#FFCDD2' : '#E8E2DA'}`,
            color: '#1A1410', outline: 'none',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#C5A880'; }}
          onBlur={(e)  => { e.currentTarget.style.borderColor = !isValid ? '#FFCDD2' : '#E8E2DA'; }}
        />
        {value && (
          <div
            className="w-8 h-8 rounded-full flex-shrink-0 border border-black/10"
            style={{ backgroundColor: HEX_RE.test(value) ? value : 'transparent' }}
          />
        )}
      </div>
      {value && !isValid && (
        <p className="text-[10px] mt-1" style={{ color: '#C62828' }}>
          Formato inválido. Usa #RGB o #RRGGBB.
        </p>
      )}
    </div>
  );
}

// ─── Colors list ──────────────────────────────────────────────────────────────

function ColorsList({
  items, onChange,
}: {
  items: string[]; onChange: (list: string[]) => void;
}) {
  function update(index: number, value: string) {
    onChange(items.map((item, i) => i === index ? value : item));
  }
  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }
  function add() {
    onChange([...items, '']);
  }

  return (
    <div>
      <Label>Paleta de colores</Label>
      <div
        className="mb-3 px-3 py-2 rounded-lg text-xs"
        style={{ background: '#FFF8E1', color: '#B8860B', border: '1px solid #FFE082' }}
      >
        Los colores aqui aparecen en la invitacion publica. Si los dejas en blanco, se usara la paleta del tema visual.
      </div>
      <div className="flex flex-col gap-2 mb-2">
        {items.length === 0 && (
          <p className="text-xs py-2" style={{ color: '#B0A090' }}>
            Sin colores. Agrega uno para mostrar en la paleta de dress code.
          </p>
        )}
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="color"
              value={HEX_RE.test(item) ? item : '#C5A880'}
              onChange={(e) => update(i, e.target.value)}
              className="w-10 h-10 rounded cursor-pointer flex-shrink-0"
              style={{ border: '1px solid #E8E2DA', padding: 2 }}
            />
            <input
              type="text"
              value={item}
              onChange={(e) => update(i, e.target.value)}
              placeholder="#C5A880"
              maxLength={7}
              className="flex-1 px-2.5 py-1.5 rounded text-sm font-mono"
              style={{
                background: '#FFFFFF',
                border: `1px solid ${!HEX_RE.test(item) && item ? '#FFCDD2' : '#E8E2DA'}`,
                color: '#1A1410', outline: 'none',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#C5A880'; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = !HEX_RE.test(item) && item ? '#FFCDD2' : '#E8E2DA'; }}
            />
            <button type="button" onClick={() => remove(i)}
              className="px-2 py-1 rounded text-xs"
              style={{ background: '#FFEBEE', color: '#C62828' }}>X</button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="px-3 py-1.5 rounded-lg text-xs"
        style={{ background: '#F0EBE4', color: '#3D2B1A', border: '1px dashed #C5A880' }}
      >
        + Agregar color
      </button>
    </div>
  );
}

// ─── Suggestions list ─────────────────────────────────────────────────────────

function SuggestionsList({
  items, onChange,
}: {
  items: string[]; onChange: (list: string[]) => void;
}) {
  function update(index: number, value: string) {
    onChange(items.map((item, i) => i === index ? value : item));
  }
  function moveUp(index: number) {
    if (index === 0) return;
    const next = [...items];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  }
  function moveDown(index: number) {
    if (index === items.length - 1) return;
    const next = [...items];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next);
  }
  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }
  function add() {
    onChange([...items, '']);
  }

  return (
    <div>
      <Label>Sugerencias de vestimenta</Label>
      <div className="flex flex-col gap-2 mb-2">
        {items.length === 0 && (
          <p className="text-xs py-2" style={{ color: '#B0A090' }}>
            Sin sugerencias. Agrega una para mostrarla en la nota de pie.
          </p>
        )}
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => update(i, e.target.value)}
              placeholder={`Ej: Se sugiere color ${i === 0 ? 'champagne' : 'marfil'}`}
              className="flex-1 px-2.5 py-1.5 rounded text-sm"
              style={{
                background: '#FFFFFF',
                border: `1px solid ${!item.trim() ? '#FFCDD2' : '#E8E2DA'}`,
                color: '#1A1410', outline: 'none',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#C5A880'; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = !item.trim() ? '#FFCDD2' : '#E8E2DA'; }}
            />
            <button type="button" onClick={() => moveUp(i)} disabled={i === 0}
              className="px-2 py-1 rounded text-xs"
              style={{ background: '#F0EBE4', color: '#6B5B4E', opacity: i === 0 ? 0.3 : 1 }}>↑</button>
            <button type="button" onClick={() => moveDown(i)} disabled={i === items.length - 1}
              className="px-2 py-1 rounded text-xs"
              style={{ background: '#F0EBE4', color: '#6B5B4E', opacity: i === items.length - 1 ? 0.3 : 1 }}>↓</button>
            <button type="button" onClick={() => remove(i)}
              className="px-2 py-1 rounded text-xs"
              style={{ background: '#FFEBEE', color: '#C62828' }}>✕</button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="px-3 py-1.5 rounded-lg text-xs"
        style={{ background: '#F0EBE4', color: '#3D2B1A', border: '1px dashed #C5A880' }}
      >
        + Agregar sugerencia
      </button>
      {items.length > 0 && (
        <p className="text-[10px] mt-2" style={{ color: '#B0A090' }}>
          {'Se muestran como nota de pie separadas por punto. Ej: "' + items.filter(Boolean).join('. ') + '"'}
        </p>
      )}
    </div>
  );
}

// ─── Form ─────────────────────────────────────────────────────────────────────

interface DressCodeFormProps {
  invitation: InvitationContent;
}

export default function DressCodeForm({ invitation }: DressCodeFormProps) {
  const [state, setState] = useState(() => buildInitialState(invitation.dressCode));
  const [result, setResult] = useState<UpdateInvitationResult | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  function set<K extends keyof typeof state>(key: K, value: typeof state[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
    setResult(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowErrors(true);
    setIsPending(true);
    setResult(null);

    const res = await updateInvitationDressCode({
      id:   invitation.id,
      slug: invitation.slug,
      dressCode: state,
    });

    if (res.success) notifyPreviewRefresh();
    setResult(res);
    setIsPending(false);
    if (res.success) setShowErrors(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      {result && (
        <div
          className="mb-5 px-4 py-3 rounded-lg text-sm"
          style={{
            background: result.success ? '#E8F5E9' : '#FFEBEE',
            color:      result.success ? '#388E3C'  : '#C62828',
            border:     `1px solid ${result.success ? '#C8E6C9' : '#FFCDD2'}`,
          }}
        >
          {result.success ? result.message : result.error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5">

        {/* Etiqueta + Título */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label required>Etiqueta principal</Label>
            <TextField
              value={state.type}
              onChange={(v) => set('type', v)}
              placeholder="Ej: Formal, Coctel, Casual"
              hasError={showErrors && !state.type.trim()}
            />
            <p className="text-[10px] mt-1" style={{ color: '#B0A090' }}>
              Se muestra como heading en la tarjeta.
            </p>
          </div>
          <div>
            <Label>Título de sección</Label>
            <TextField
              value={state.title}
              onChange={(v) => set('title', v)}
              placeholder="Ej: Código de Vestimenta"
            />
            <p className="text-[10px] mt-1" style={{ color: '#B0A090' }}>
              Opcional — almacenado para uso futuro.
            </p>
          </div>
        </div>

        {/* Descripción */}
        <div>
          <Label>Descripción</Label>
          <TextArea
            value={state.description}
            onChange={(v) => set('description', v)}
            placeholder="Ej: Agradecemos a los caballeros asistir con traje oscuro y a las damas en vestido largo o coctel."
            rows={3}
          />
        </div>

        {/* Observaciones */}
        <div>
          <Label>Observaciones</Label>
          <TextArea
            value={state.observations}
            onChange={(v) => set('observations', v)}
            placeholder="Notas adicionales para los invitados…"
            rows={2}
          />
          <p className="text-[10px] mt-1" style={{ color: '#B0A090' }}>
            Almacenado — visible en editor y exportaciones futuras.
          </p>
        </div>

        {/* Colors */}
        <ColorsList
          items={state.colors}
          onChange={(list) => set('colors', list)}
        />

        {/* Legacy color fields */}
        <div>
          <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: '#C5A880', borderBottom: '1px solid #F0EBE4', paddingBottom: '0.5rem' }}>
            Colores heredados (legacy)
          </p>
          <p className="text-xs mb-3" style={{ color: '#B0A090' }}>
            Estos campos se mantienen por compatibilidad. Usa la paleta de colores arriba en su lugar.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ColorField
              label="Color principal"
              value={state.primaryColor}
              onChange={(v) => set('primaryColor', v)}
            />
            <ColorField
              label="Color secundario"
              value={state.secondaryColor}
              onChange={(v) => set('secondaryColor', v)}
            />
          </div>
        </div>

        {/* Suggestions list */}
        <SuggestionsList
          items={state.suggestionsList}
          onChange={(list) => set('suggestionsList', list)}
        />
      </div>

      <div className="mt-6">
        <button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto px-5 py-3 rounded-lg text-sm font-medium transition-opacity"
          style={{
            background: '#1A1410',
            color: '#F5F3F0',
            opacity: isPending ? 0.6 : 1,
            minHeight: 44,
          }}
        >
          {isPending ? 'Guardando…' : 'Guardar dress code'}
        </button>
      </div>
    </form>
  );
}
