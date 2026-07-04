'use client';

import { useState } from 'react';
import {
  useKompraloCart,
  CART_EVENT_TYPES as EVENT_TYPES,
  CART_PLANS as PLANS,
  AVAILABLE_EVENT_TYPES,
  type CartPlanId as PlanId,
} from './useKompraloCart';

import { trackInitiateCheckout } from '@/lib/pixel';

// Re-export para consumidores existentes (p.ej. /api/checkout/multi importa el tipo desde aquí)
export type { CartItem } from './useKompraloCart';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtPrice(centavos: number) {
  return `$${(centavos / 100).toLocaleString('es-MX', { maximumFractionDigits: 0 })}`;
}

// ─── Payment method badges ────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  {
    label: 'VISA',
    bg: '#1A1F71',
    color: '#fff',
    svg: (
      <svg width="28" height="10" viewBox="0 0 28 10" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text x="0" y="9" fontFamily="Arial" fontWeight="800" fontSize="10" fill="white" letterSpacing="0.5">VISA</text>
      </svg>
    ),
  },
  {
    label: 'MC',
    bg: '#252525',
    color: '#fff',
    svg: (
      <svg width="28" height="18" viewBox="0 0 28 18" fill="none">
        <circle cx="10" cy="9" r="8" fill="#EB001B" />
        <circle cx="18" cy="9" r="8" fill="#F79E1B" />
        <path d="M14 3.5a8 8 0 0 1 0 11A8 8 0 0 1 14 3.5z" fill="#FF5F00" />
      </svg>
    ),
  },
  { label: 'AMEX',  bg: '#007BC1', color: '#fff', svg: null },
  { label: 'OXXO',  bg: '#DA0000', color: '#fff', svg: null },
  { label: 'SPEI',  bg: '#004A87', color: '#fff', svg: null },
  { label: 'Stripe',bg: '#6772E5', color: '#fff', svg: null },
];

// ─── SVG icons ────────────────────────────────────────────────────────────────
function ShieldCheck() {
  return (
    <span style={{ flexShrink: 0, display: 'flex' }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L4 5V11C4 15.4 7.4 19.5 12 21C16.6 19.5 20 15.4 20 11V5L12 2Z"
          fill="#15803d" fillOpacity="0.15" stroke="#15803d" strokeWidth="1.5" />
        <path d="M9 12L11 14L15 10" stroke="#15803d" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function Clock48() {
  return (
    <span style={{ flexShrink: 0, display: 'flex' }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#92400e" strokeWidth="1.5" fill="#92400e" fillOpacity="0.1" />
        <text x="12" y="15" textAnchor="middle" fontSize="7" fontWeight="700" fill="#92400e" fontFamily="sans-serif">48H</text>
      </svg>
    </span>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
    </svg>
  );
}

function CartEmptyIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  .mec-grid {
    display: grid;
    grid-template-columns: 1fr 360px;
    gap: 2rem;
    align-items: start;
  }
  @media (max-width: 900px) {
    .mec-grid { grid-template-columns: 1fr; }
    .mec-sticky { position: static !important; }
  }
  .mec-event-pills {
    display: flex; gap: 8px; flex-wrap: wrap;
  }
  .mec-pill {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 14px; border-radius: 999px; cursor: pointer;
    font-size: 13px; font-weight: 600;
    border: 1.5px solid rgba(74,59,53,0.3);
    transition: all 0.15s;
    background: transparent;
    color: var(--site-color-marron);
    white-space: nowrap;
  }
  .mec-pill:hover:not(:disabled) { border-color: var(--site-color-rosa-antiguo); }
  .mec-pill-active {
    background: var(--site-color-rosa-antiguo);
    border-color: var(--site-color-rosa-antiguo);
    color: var(--site-color-crema);
  }
  .mec-pill:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    border-style: dashed;
  }
  .mec-pill-soon {
    font-size: 9px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.04em; line-height: 1;
    background: rgba(74,59,53,0.08); color: #7A6A63;
    border-radius: 999px; padding: 3px 7px;
  }
  .mec-plan-grid {
    display: grid;
    grid-template-columns: repeat(3,1fr);
    gap: 10px;
  }
  @media (max-width: 600px) {
    .mec-plan-grid { grid-template-columns: 1fr; }
  }
  .mec-plan-card {
    border-radius: 10px; padding: 16px 14px;
    cursor: pointer; transition: all 0.15s;
    border: 1.5px solid rgba(74,59,53,0.12);
    background: var(--site-color-blanco);
    position: relative;
  }
  .mec-plan-card:hover { border-color: rgba(156,107,112,0.5); }
  .mec-plan-active {
    border-color: var(--site-color-rosa-antiguo) !important;
    background: rgba(156,107,112,0.06) !important;
    box-shadow: 0 0 0 3px rgba(156,107,112,0.15);
  }
  .mec-add-btn {
    width: 100%; padding: 14px; border-radius: 999px; border: 1px solid var(--site-color-marron);
    background: var(--site-color-marron); color: var(--site-color-crema);
    font-size: 16px; font-weight: 700; cursor: pointer;
    transition: opacity 0.15s, transform 0.1s;
  }
  .mec-add-btn:hover { opacity: 0.92; transform: translateY(-1px); }
  .mec-add-btn:active { transform: translateY(0); }
  .mec-add-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
  .mec-cart-panel {
    background: var(--site-color-blanco); border: 1px solid var(--site-color-border-subtle);
    border-radius: 14px; overflow: hidden;
  }
  .mec-pay-btn {
    width: 100%; padding: 14px; border-radius: 999px; border: 1px solid var(--site-color-marron);
    background: var(--site-color-marron); color: var(--site-color-crema);
    font-size: 15px; font-weight: 700; cursor: pointer;
    transition: opacity 0.15s;
    display: flex; align-items: center; justify-content: center; gap: 6px;
  }
  .mec-pay-btn:hover:not(:disabled) { opacity: 0.9; }
  .mec-pay-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .mec-save-btn {
    width: 100%; padding: 11px; border-radius: 999px;
    border: 1.5px solid rgba(74,59,53,0.25);
    background: transparent; color: var(--site-color-marron);
    font-size: 14px; font-weight: 600; cursor: pointer;
    transition: border-color 0.15s;
  }
  .mec-save-btn:hover { border-color: var(--site-color-rosa-antiguo); }
  @keyframes mec-spin { to { transform: rotate(360deg); } }
  .mec-spinner {
    display: inline-block; width: 16px; height: 16px;
    border: 2px solid currentColor; border-top-color: transparent;
    border-radius: 50%; animation: mec-spin 0.6s linear infinite;
  }
  @keyframes mec-slideIn {
    from { opacity: 0; transform: translateX(8px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  .mec-item { animation: mec-slideIn 0.18s ease both; }
`;

// ─── Component ────────────────────────────────────────────────────────────────
export function MultiEventCart() {
  const { items, total, addItem, removeItem } = useKompraloCart();
  const [selectedEvent, setEvent]   = useState<string>(EVENT_TYPES[0].id);
  const [selectedPlan, setPlan]     = useState<PlanId>('premium');
  const [payState, setPayState]     = useState<'idle' | 'loading' | 'error'>('idle');
  const [payError, setPayError]     = useState<string | null>(null);
  const [showSave, setShowSave]     = useState(false);
  const [saveEmail, setSaveEmail]   = useState('');
  const [saveState, setSaveState]   = useState<'idle' | 'loading' | 'done'>('idle');
  const [flash, setFlash]           = useState(false);

  function addToCart() {
    // Defensa adicional: nunca agregar tipos de evento no disponibles
    if (!AVAILABLE_EVENT_TYPES.includes(selectedEvent)) return;
    addItem(selectedEvent, selectedPlan);
    setFlash(true);
    setTimeout(() => setFlash(false), 600);
  }

  async function handlePay() {
    if (!items.length) return;
    setPayState('loading');
    setPayError(null);
    try {
      trackInitiateCheckout({ value: total / 100, numItems: items.length });
      const res  = await fetch('/api/checkout/multi', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ items }),
      });
      const data = await res.json() as unknown;
      if (!res.ok) {
        const msg = data && typeof data === 'object' && 'error' in data
          ? String((data as Record<string, unknown>).error)
          : `Error del servidor (${res.status})`;
        throw new Error(msg);
      }
      if (!data || typeof data !== 'object' || !('url' in data) || typeof (data as Record<string, unknown>).url !== 'string') {
        throw new Error('Respuesta inválida del servidor.');
      }
      // El carrito NO se vacía aquí: si el usuario cancela en Stripe y regresa,
      // debe encontrar sus items. Se vacía en /checkout/success (pago confirmado).
      window.location.href = (data as { url: string }).url;
    } catch (err) {
      setPayError(err instanceof TypeError ? 'Sin conexión. Verifica tu red.' : err instanceof Error ? err.message : 'Error inesperado.');
      setPayState('error');
    }
  }

  async function handleSave() {
    if (!saveEmail.trim()) return;
    setSaveState('loading');
    try {
      await fetch('/api/leads/save', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: saveEmail.trim(), plan: selectedPlan, source: 'save_for_later' }),
      });
      setSaveState('done');
    } catch {
      setSaveState('idle');
    }
  }

  const evDef  = EVENT_TYPES.find(e => e.id === selectedEvent)!;

  return (
    <>
      <style>{CSS}</style>

      <div className="mec-grid" style={{ maxWidth: 1040, margin: '2.5rem auto 0' }}>

        {/* ── LEFT: Configurator ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* Event type selector */}
          <div>
            <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7A6A63' }}>
              Tipo de evento
            </p>
            <div className="mec-event-pills">
              {EVENT_TYPES.map(ev => {
                const available = AVAILABLE_EVENT_TYPES.includes(ev.id);
                return (
                  <button
                    key={ev.id}
                    type="button"
                    disabled={!available}
                    onClick={() => available && setEvent(ev.id)}
                    className={`mec-pill${selectedEvent === ev.id ? ' mec-pill-active' : ''}`}
                  >
                    {ev.icon} {ev.label}
                    {!available && <span className="mec-pill-soon">Próximamente</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Plan selector */}
          <div>
            <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7A6A63' }}>
              Plan
            </p>
            <div className="mec-plan-grid">
              {(Object.entries(PLANS) as [PlanId, typeof PLANS[PlanId]][]).map(([id, pl]) => (
                <div
                  key={id}
                  onClick={() => setPlan(id)}
                  className={`mec-plan-card${selectedPlan === id ? ' mec-plan-active' : ''}`}
                >
                  {id === 'premium' && (
                    <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', background: 'var(--site-color-rosa-antiguo)', color: 'var(--site-color-crema)', fontSize: 9, fontWeight: 800, padding: '2px 10px', borderRadius: '0 0 6px 6px', whiteSpace: 'nowrap', letterSpacing: '0.05em' }}>
                      MÁS POPULAR
                    </div>
                  )}
                  <p style={{ margin: '8px 0 4px', fontSize: 15, fontWeight: 700, color: 'var(--site-color-marron)' }}>{pl.label}</p>
                  <p style={{ margin: 0, fontSize: 11, color: '#7A6A63', lineHeight: 1.3 }}>{pl.desc}</p>
                  <p style={{ margin: '10px 0 0', fontSize: 22, fontWeight: 600, color: selectedPlan === id ? 'var(--site-color-rosa-antiguo)' : 'var(--site-color-marron)', fontFamily: 'var(--site-font-serif)', lineHeight: 1 }}>
                    {fmtPrice(pl.price)}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: 10, color: '#7A6A63' }}>MXN pago único</p>
                </div>
              ))}
            </div>
          </div>

          {/* Add to cart */}
          <button type="button" onClick={addToCart} className="mec-add-btn">
            🛒 Agregar {evDef.icon} {evDef.label} — {PLANS[selectedPlan].label}
          </button>

          {flash && (
            <p style={{ margin: 0, textAlign: 'center', fontSize: 13, color: 'var(--site-color-rosa-antiguo)', fontWeight: 600 }}>
              ✓ Agregado al carrito
            </p>
          )}
        </div>

        {/* ── RIGHT: Cart panel ── */}
        <div className="mec-sticky" style={{ position: 'sticky', top: 88 }}>
          <div className="mec-cart-panel">

            {/* Cart header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(74,59,53,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--site-color-marron)' }}>Tu carrito</span>
              {items.length > 0 && (
                <span style={{ background: 'var(--site-color-rosa-antiguo)', color: 'var(--site-color-crema)', fontSize: 11, fontWeight: 800, borderRadius: '999px', padding: '2px 8px' }}>
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
              )}
            </div>

            {/* Cart items */}
            <div style={{ padding: items.length ? '8px 0' : '32px 20px', minHeight: 120, maxHeight: 320, overflowY: 'auto' }}>
              {items.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, color: '#6b7280' }}>
                  <CartEmptyIcon />
                  <p style={{ margin: 0, fontSize: 13, textAlign: 'center' }}>Agrega tu primera invitación</p>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.id} className="mec-item" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: '1px solid rgba(74,59,53,0.06)' }}>
                    <span style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>{item.eventIcon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--site-color-marron)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.eventLabel}
                      </p>
                      <p style={{ margin: '1px 0 0', fontSize: 11, color: '#7A6A63' }}>Plan {item.planLabel}</p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--site-color-rosa-antiguo)' }}>{fmtPrice(item.price)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', flexShrink: 0 }}
                      aria-label="Eliminar"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Cart footer (only when items exist) */}
            {items.length > 0 && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(74,59,53,0.1)', display: 'flex', flexDirection: 'column', gap: 12 }}>

                {/* Total */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 13, color: '#7A6A63' }}>Total</span>
                  <span style={{ fontSize: 22, fontWeight: 600, color: 'var(--site-color-marron)', fontFamily: 'var(--site-font-serif)' }}>
                    {fmtPrice(total)} <span style={{ fontSize: 12, fontWeight: 400, color: '#7A6A63' }}>MXN</span>
                  </span>
                </div>

                {/* Pay button */}
                <button type="button" onClick={handlePay} disabled={payState === 'loading'} className="mec-pay-btn" aria-busy={payState === 'loading'}>
                  {payState === 'loading' ? <><span className="mec-spinner" />Procesando…</> : <><LockIcon />Pagar todo ahora</>}
                </button>
                {payState === 'error' && payError && (
                  <p style={{ margin: 0, fontSize: 12, color: '#C62828', textAlign: 'center' }} role="alert">{payError}</p>
                )}

                {/* Save for later */}
                {saveState === 'done' ? (
                  <p style={{ margin: 0, fontSize: 12, color: '#15803D', textAlign: 'center', fontWeight: 600 }}>
                    ✓ Guardado — te avisamos si hay una oferta
                  </p>
                ) : showSave ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      type="email"
                      value={saveEmail}
                      onChange={e => setSaveEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSave()}
                      placeholder="tu@email.com"
                      style={{ flex: 1, minWidth: 0, padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(74,59,53,0.2)', background: '#fff', color: 'var(--site-color-marron)', fontSize: 13, outline: 'none' }}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saveState === 'loading' || !saveEmail.trim()}
                      style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: 'var(--site-color-marron)', color: 'var(--site-color-crema)', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      {saveState === 'loading' ? '…' : 'Guardar'}
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setShowSave(true)} className="mec-save-btn">
                    ♡ Guardar para después
                  </button>
                )}
              </div>
            )}

            {/* Payment methods */}
            <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(74,59,53,0.1)' }}>
              <p style={{ margin: '0 0 8px', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7A6A63' }}>
                Métodos de pago
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {PAYMENT_METHODS.map(m => (
                  <div key={m.label} style={{ height: 24, padding: '0 8px', borderRadius: 4, background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 36 }}>
                    {m.svg ?? <span style={{ fontSize: 9, fontWeight: 700, color: m.color, letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>{m.label}</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* SSL badge */}
            <div style={{ margin: '0 12px 8px', background: '#F0FDF4', border: '1px solid rgba(21,128,61,0.25)', borderRadius: 8, padding: '10px 12px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <ShieldCheck />
              <div>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#166534' }}>Pago 100% seguro</p>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#15803D' }}>Cifrado SSL 256-bit · Stripe</p>
              </div>
            </div>

            {/* Guarantee badge */}
            <div style={{ margin: '0 12px 14px', background: '#FFFBEB', border: '1px solid rgba(146,64,14,0.25)', borderRadius: 8, padding: '10px 12px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Clock48 />
              <div>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#92400E' }}>Garantía 48 horas</p>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#B45309' }}>Devolución completa sin preguntas</p>
              </div>
            </div>

            {/* Trust items */}
            <div style={{ padding: '12px 20px 16px', borderTop: '1px solid rgba(74,59,53,0.06)', display: 'flex', flexDirection: 'column', gap: 7 }}>
              {[
                ['⚡', 'Acceso inmediato al editor'],
                ['✏️', 'Ediciones ilimitadas incluidas'],
                ['📱', 'Funciona sin instalar apps'],
                ['💬', 'Soporte por WhatsApp incluido'],
              ].map(([icon, text]) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#7A6A63' }}>
                  <span style={{ fontSize: 14 }}>{icon}</span> {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
