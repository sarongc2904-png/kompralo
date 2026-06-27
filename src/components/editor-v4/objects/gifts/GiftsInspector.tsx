'use client';

import React, { useState } from 'react';
import type { InspectorProps } from '../../core/editor-types';
import { SectionVisibilityToggle } from '../../components/SectionVisibilityToggle';
import { updateInvitationGiftRegistry } from '@/app/dashboard/invitations/[id]/edit/actions';
import type { GiftLogoType } from '@/domain/invitations/types';

// ─── Types ───────────────────────────────────────────────────────────────────

interface GiftItemLocal {
  id: string;
  provider: string;
  logoType: GiftLogoType;
  link: string;
  description: string;
  bankDetails: {
    bankName: string;
    accountOwner: string;
    clabe: string;
  };
}

const STORE_OPTIONS: { value: GiftLogoType; label: string }[] = [
  { value: 'liverpool',    label: 'Liverpool' },
  { value: 'palacio',      label: 'Palacio de Hierro' },
  { value: 'amazon',       label: 'Amazon' },
  { value: 'mercadolibre', label: 'MercadoLibre' },
  { value: 'paypal',       label: 'PayPal' },
  { value: 'custom',       label: 'Otra tienda' },
];

function parseItems(raw?: string): GiftItemLocal[] {
  try {
    const parsed = JSON.parse(raw || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.map((it) => ({
      id:          String(it.id ?? crypto.randomUUID()),
      provider:    String(it.provider ?? ''),
      logoType:    (it.logoType as GiftLogoType) ?? 'custom',
      link:        String(it.link ?? ''),
      description: String(it.description ?? ''),
      bankDetails: {
        bankName:     String(it.bankDetails?.bankName ?? ''),
        accountOwner: String(it.bankDetails?.accountOwner ?? ''),
        clabe:        String(it.bankDetails?.clabe ?? ''),
      },
    }));
  } catch { return []; }
}

function newStore(logoType: GiftLogoType = 'liverpool'): GiftItemLocal {
  const labels: Record<GiftLogoType, string> = {
    liverpool: 'Liverpool', palacio: 'Palacio de Hierro', amazon: 'Amazon',
    mercadolibre: 'MercadoLibre', paypal: 'PayPal', custom: '', bank: '',
  };
  return {
    id: String(Date.now()), provider: labels[logoType] ?? '', logoType,
    link: '', description: '', bankDetails: { bankName: '', accountOwner: '', clabe: '' },
  };
}

function itemLabel(item: GiftItemLocal): string {
  if (item.logoType === 'bank') return item.provider || 'Transferencia';
  if (item.logoType === 'custom' && item.provider === 'Lluvia de sobres') return 'Lluvia de sobres';
  return item.provider || 'Tienda';
}

function itemEmoji(item: GiftItemLocal): string {
  if (item.logoType === 'bank') return '🏦';
  if (item.provider === 'Lluvia de sobres') return '✉️';
  return '🎁';
}

// ─── Item card ────────────────────────────────────────────────────────────────

function GiftCard({
  item, index, total, onChange, onRemove,
}: {
  item: GiftItemLocal;
  index: number;
  total: number;
  onChange: (patch: Partial<GiftItemLocal>) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(index === 0);
  const isEnvelope = item.logoType === 'custom';

  const inputS: React.CSSProperties = {
    width: '100%', border: '1px solid rgba(200,167,93,0.3)', borderRadius: 6,
    padding: '6px 9px', fontSize: 12, color: '#3D2B1F', background: '#FFFDF9',
    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  };
  const labelS: React.CSSProperties = {
    fontSize: 10, fontWeight: 700, color: '#9B8878',
    textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3, display: 'block',
  };
  const fieldS: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 3 };

  return (
    <div style={{ border: '1px solid rgba(200,167,93,0.2)', borderRadius: 10, overflow: 'hidden', background: '#FFFDF9' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', padding: '9px 12px',
          background: open ? 'rgba(200,167,93,0.09)' : 'transparent',
          border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13 }}>{itemEmoji(item)}</span>
          <span style={{ fontSize: 12, color: '#3D2B1F', fontWeight: 500 }}>{itemLabel(item)}</span>
        </div>
        <span style={{ fontSize: 12, color: '#9B8878', display: 'inline-block', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 180ms' }}>▾</span>
      </button>

      {open && (
        <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid rgba(200,167,93,0.12)' }}>

          {/* TIPO A — Lluvia de sobres */}
          {isEnvelope && (
            <div style={{ background: 'rgba(200,167,93,0.07)', border: '1px solid rgba(200,167,93,0.2)', borderRadius: 8, padding: '10px 12px' }}>
              <p style={{ fontSize: 12, color: '#5C4A3E', fontWeight: 600, margin: '0 0 4px' }}>✓ Lluvia de sobres activada</p>
              <p style={{ fontSize: 11, color: '#9B8878', margin: 0, lineHeight: 1.5 }}>
                El renderer mostrará el botón de confirmación de asistencia como enlace principal.
              </p>
            </div>
          )}

          {/* TIPO B — Tienda */}
          {item.logoType !== 'bank' && !isEnvelope && (
            <>
              <div style={fieldS}>
                <label style={labelS}>Nombre de la tienda</label>
                <select
                  value={item.logoType}
                  onChange={(e) => {
                    const t = e.target.value as GiftLogoType;
                    const labels: Partial<Record<GiftLogoType, string>> = {
                      liverpool: 'Liverpool', palacio: 'Palacio de Hierro', amazon: 'Amazon',
                      mercadolibre: 'MercadoLibre', paypal: 'PayPal',
                    };
                    onChange({ logoType: t, provider: labels[t] ?? item.provider });
                  }}
                  style={{ ...inputS, cursor: 'pointer' }}
                >
                  {STORE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              {item.logoType === 'custom' && (
                <div style={fieldS}>
                  <label style={labelS}>Nombre de la tienda *</label>
                  <input type="text" value={item.provider} onChange={(e) => onChange({ provider: e.target.value })} placeholder="Ej: Liverpool, Amazon, etc." style={inputS} />
                </div>
              )}
              <div style={fieldS}>
                <label style={labelS}>Link de la mesa de regalos *</label>
                <input type="url" value={item.link} onChange={(e) => onChange({ link: e.target.value })} placeholder="https://…" style={inputS} />
              </div>
              <div style={fieldS}>
                <label style={labelS}>Descripción <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span></label>
                <input type="text" value={item.description} onChange={(e) => onChange({ description: e.target.value })} placeholder="Ej: Escanea el QR o visita el link" style={inputS} />
              </div>
            </>
          )}

          {/* TIPO C — Transferencia bancaria */}
          {item.logoType === 'bank' && (
            <>
              <div style={fieldS}>
                <label style={labelS}>Nombre / Banco *</label>
                <input type="text" value={item.provider} onChange={(e) => onChange({ provider: e.target.value })} placeholder="Ej: BBVA" style={inputS} />
              </div>
              <div style={fieldS}>
                <label style={labelS}>Banco *</label>
                <input
                  type="text"
                  value={item.bankDetails.bankName}
                  onChange={(e) => onChange({ bankDetails: { ...item.bankDetails, bankName: e.target.value } })}
                  placeholder="Ej: BBVA Bancomer"
                  style={inputS}
                />
              </div>
              <div style={fieldS}>
                <label style={labelS}>Titular de la cuenta *</label>
                <input
                  type="text"
                  value={item.bankDetails.accountOwner}
                  onChange={(e) => onChange({ bankDetails: { ...item.bankDetails, accountOwner: e.target.value } })}
                  placeholder="Ej: María García López"
                  style={inputS}
                />
              </div>
              <div style={fieldS}>
                <label style={labelS}>CLABE * <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(18 dígitos)</span></label>
                <input
                  type="text"
                  value={item.bankDetails.clabe}
                  onChange={(e) => onChange({ bankDetails: { ...item.bankDetails, clabe: e.target.value.replace(/\D/g, '').slice(0, 18) } })}
                  placeholder="000000000000000000"
                  maxLength={18}
                  style={{ ...inputS, fontFamily: 'monospace', letterSpacing: '0.1em' }}
                />
                <span style={{ fontSize: 10, color: item.bankDetails.clabe.length === 18 ? '#2A8040' : '#9B8878' }}>
                  {item.bankDetails.clabe.length}/18 dígitos
                </span>
              </div>
            </>
          )}

          {total > 1 && (
            <button
              type="button"
              onClick={onRemove}
              style={{
                marginTop: 4, padding: '6px 0', borderRadius: 7,
                border: '1px solid rgba(180,60,60,0.25)', background: 'rgba(180,60,60,0.06)',
                color: '#B04040', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Eliminar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main inspector ───────────────────────────────────────────────────────────

export function GiftsInspector({ element, invitationId, isMobileSheet, onSaved }: InspectorProps) {
  const slug     = element.meta?.slug     ?? '';
  const planId   = element.meta?.planId   ?? '';
  const isHidden = element.meta?.isHidden === 'true';
  const isDeluxe = planId === 'deluxe';

  const [items,      setItems]      = useState<GiftItemLocal[]>(() => parseItems(element.meta?.giftRegistryJson));
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [saved,      setSaved]      = useState(false);
  const [dupMsg,     setDupMsg]     = useState<string | null>(null);

  function alreadyExists(logoType: string) {
    return items.some((it) => it.logoType === logoType);
  }

  function showDup(label: string) {
    setDupMsg(`"${label}" ya está agregado`);
    setTimeout(() => setDupMsg(null), 2000);
  }

  function updateItem(idx: number, patch: Partial<GiftItemLocal>) {
    setSaved(false);
    setItems((prev) => prev.map((it, i) => i === idx ? { ...it, ...patch } : it));
  }

  function addItem(type: 'envelope' | 'store' | 'bank') {
    setSaved(false);
    if (type === 'envelope') {
      if (alreadyExists('custom')) { showDup('Lluvia de sobres'); return; }
      setItems((prev) => [...prev, { id: String(Date.now()), provider: 'Lluvia de sobres', logoType: 'custom', link: '#rsvp-name', description: '', bankDetails: { bankName: '', accountOwner: '', clabe: '' } }]);
    } else if (type === 'store') {
      if (alreadyExists('liverpool')) { showDup('Mesa de regalo'); return; }
      setItems((prev) => [...prev, newStore('liverpool')]);
    } else {
      if (alreadyExists('bank')) { showDup('Transferencia'); return; }
      setItems((prev) => [...prev, { id: String(Date.now()), provider: '', logoType: 'bank', link: '', description: '', bankDetails: { bankName: '', accountOwner: '', clabe: '' } }]);
    }
  }

  async function handleSave() {
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.provider.trim()) { setError(`El proveedor #${i + 1} necesita un nombre.`); return; }
      if (it.logoType !== 'bank' && it.logoType !== 'custom') {
        if (!it.link.trim()) { setError(`"${it.provider}" necesita una URL.`); return; }
      } else if (it.logoType === 'bank') {
        if (!it.bankDetails.bankName.trim())     { setError(`La transferencia "${it.provider || `#${i + 1}`}" necesita nombre de banco.`); return; }
        if (!it.bankDetails.accountOwner.trim()) { setError(`La transferencia "${it.provider || `#${i + 1}`}" necesita titular.`); return; }
        if (!/^\d{18}$/.test(it.bankDetails.clabe)) { setError(`La CLABE de "${it.provider || `#${i + 1}`}" debe tener exactamente 18 dígitos.`); return; }
      }
    }
    setError(null);
    setSaving(true);
    const res = await updateInvitationGiftRegistry({
      id: invitationId,
      slug,
      items: items.map((it) => ({
        id:           it.id,
        provider:     it.provider,
        logoType:     it.logoType,
        link:         it.link,
        description:  it.description,
        bankName:     it.bankDetails.bankName,
        accountOwner: it.bankDetails.accountOwner,
        clabe:        it.bankDetails.clabe,
      })),
    });
    setSaving(false);
    if (res.success) { setSaved(true); onSaved(); }
    else setError(res.error ?? 'Error al guardar.');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: isMobileSheet ? 12 : undefined }}>
      {!isMobileSheet && <div style={{ height: 1, background: 'rgba(200,167,93,0.15)', marginBottom: 4 }} />}

      <SectionVisibilityToggle sectionId="gifts" hidden={isHidden} invitationId={invitationId} slug={slug} onSaved={onSaved} />

      {/* Plan gate */}
      {!isDeluxe && (
        <div style={{
          background: 'rgba(116,84,38,0.06)', border: '1px solid rgba(116,84,38,0.18)',
          borderRadius: 10, padding: 14, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#7B5E3A', background: 'rgba(116,84,38,0.12)', borderRadius: 6, padding: '2px 8px', letterSpacing: '0.04em' }}>
            🔒 Requiere Plan Deluxe
          </span>
          <p style={{ fontSize: 12, color: '#9B8878', lineHeight: 1.5, margin: 0 }}>
            La Mesa de Regalos permite agregar tiendas, transferencias y lluvia de sobres. Mejora tu plan para activarla.
          </p>
        </div>
      )}

      {isDeluxe && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: '#9B8878', fontWeight: 600 }}>
              {items.length} opción{items.length !== 1 ? 'es' : ''}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map((item, i) => (
              <GiftCard
                key={item.id}
                item={item}
                index={i}
                total={items.length}
                onChange={(patch) => updateItem(i, patch)}
                onRemove={() => { setSaved(false); setItems((prev) => prev.filter((_, j) => j !== i)); }}
              />
            ))}
          </div>

          {/* Add buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#9B8878', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>Agregar opción</p>
            {dupMsg && <p style={{ fontSize: 11, color: '#B07A40', margin: 0 }}>{dupMsg}</p>}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {([
                { type: 'envelope' as const, label: '✉️ Lluvia de sobres', logoType: 'custom'    },
                { type: 'store'    as const, label: '🛍 Mesa de regalo',    logoType: 'liverpool' },
                { type: 'bank'     as const, label: '🏦 Transferencia',     logoType: 'bank'      },
              ]).map(({ type, label, logoType }) => {
                const taken = alreadyExists(logoType);
                return (
                <button
                  key={type}
                  type="button"
                  onClick={() => addItem(type)}
                  disabled={taken}
                  style={{
                    padding: '5px 10px', borderRadius: 7,
                    border: '1.5px dashed rgba(200,167,93,0.4)', background: 'transparent',
                    color: taken ? '#C9A96E' : '#C9A96E',
                    fontSize: 11, fontWeight: 600,
                    cursor: taken ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit',
                    opacity: taken ? 0.4 : 1,
                  }}
                >
                  {label}
                </button>
              );
              })}
            </div>
          </div>

          {error && <p style={{ fontSize: 12, color: '#B04040', margin: 0 }}>{error}</p>}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '9px 0', borderRadius: 8, border: 'none',
              background: saved ? 'rgba(60,160,80,0.15)' : '#1A1208',
              color: saved ? '#2A8040' : '#C9A96E',
              fontSize: 13, fontWeight: 700, cursor: saving ? 'default' : 'pointer',
              opacity: saving ? 0.6 : 1, fontFamily: 'inherit', transition: 'background 200ms, color 200ms',
            }}
          >
            {saving ? 'Guardando…' : saved ? '✓ Guardado' : 'Guardar mesa de regalos'}
          </button>
        </>
      )}
    </div>
  );
}
