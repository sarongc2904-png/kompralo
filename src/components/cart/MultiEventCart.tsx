'use client';

import { useState, useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface CartItem {
  id: string;
  eventType: string;
  eventLabel: string;
  eventIcon: string;
  plan: 'basic' | 'premium' | 'deluxe';
  planLabel: string;
  price: number;
}

// ─── Catalog ─────────────────────────────────────────────────────────────────
const EVENT_TYPES = [
  { id: 'boda',        label: 'Boda',        icon: '💍' },
  { id: 'xv',         label: 'XV Años',      icon: '👑' },
  { id: 'baby',       label: 'Baby Shower',  icon: '🍼' },
  { id: 'bautizo',    label: 'Bautizo',      icon: '🕊️' },
  { id: 'cumple',     label: 'Cumpleaños',   icon: '🎂' },
  { id: 'graduacion', label: 'Graduación',   icon: '🎓' },
  { id: 'aniversario',label: 'Aniversario',  icon: '💫' },
] as const;

const PLANS = {
  basic:   { price: 49900,  label: 'Basic',   desc: 'Esencial' },
  premium: { price: 89900,  label: 'Premium', desc: 'Control Total' },
  deluxe:  { price: 149900, label: 'Deluxe',  desc: 'Experiencia Completa' },
} as const;

type PlanId = keyof typeof PLANS;

const CART_KEY = 'kompralo_cart';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtPrice(centavos: number) {
  return `$${(centavos / 100).toLocaleString('es-MX', { maximumFractionDigits: 0 })}`;
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
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
    border: 1.5px solid transparent;
    transition: all 0.15s;
    background: rgba(255,255,255,0.06);
    color: #d6d3d1;
    white-space: nowrap;
  }
  .mec-pill:hover { border-color: rgba(245,197,24,0.4); }
  .mec-pill-active {
    background: #0D0A07;
    border-color: #F5C518;
    color: #F5C518;
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
    border: 1.5px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04);
    position: relative;
  }
  .mec-plan-card:hover { border-color: rgba(245,197,24,0.35); }
  .mec-plan-active {
    border-color: #2563EB !important;
    background: rgba(37,99,235,0.08) !important;
    box-shadow: 0 0 0 3px rgba(37,99,235,0.15);
  }
  .mec-add-btn {
    width: 100%; padding: 14px; border-radius: 10px; border: none;
    background: #F5C518; color: #0D0A07;
    font-size: 16px; font-weight: 700; cursor: pointer;
    transition: opacity 0.15s, transform 0.1s;
  }
  .mec-add-btn:hover { opacity: 0.92; transform: translateY(-1px); }
  .mec-add-btn:active { transform: translateY(0); }
  .mec-add-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
  .mec-cart-panel {
    background: #161412; border: 1px solid rgba(255,255,255,0.1);
    border-radius: 14px; overflow: hidden;
  }
  .mec-pay-btn {
    width: 100%; padding: 14px; border-radius: 10px; border: none;
    background: #F5C518; color: #0D0A07;
    font-size: 15px; font-weight: 700; cursor: pointer;
    transition: opacity 0.15s;
    display: flex; align-items: center; justify-content: center; gap: 6px;
  }
  .mec-pay-btn:hover:not(:disabled) { opacity: 0.9; }
  .mec-pay-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .mec-save-btn {
    width: 100%; padding: 11px; border-radius: 10px;
    border: 1.5px solid rgba(255,255,255,0.18);
    background: transparent; color: #d6d3d1;
    font-size: 14px; font-weight: 600; cursor: pointer;
    transition: border-color 0.15s;
  }
  .mec-save-btn:hover { border-color: rgba(255,255,255,0.4); }
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
  const [items, setItems]           = useState<CartItem[]>([]);
  const [selectedEvent, setEvent]   = useState<string>(EVENT_TYPES[0].id);
  const [selectedPlan, setPlan]     = useState<PlanId>('premium');
  const [payState, setPayState]     = useState<'idle' | 'loading' | 'error'>('idle');
  const [payError, setPayError]     = useState<string | null>(null);
  const [showSave, setShowSave]     = useState(false);
  const [saveEmail, setSaveEmail]   = useState('');
  const [saveState, setSaveState]   = useState<'idle' | 'loading' | 'done'>('idle');
  const [flash, setFlash]           = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch { /* ignore corrupt storage */ }
  }, []);

  // Sync to localStorage on change
  const persist = useCallback((next: CartItem[]) => {
    setItems(next);
    try { localStorage.setItem(CART_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }, []);

  function addToCart() {
    const evDef = EVENT_TYPES.find(e => e.id === selectedEvent)!;
    const plDef = PLANS[selectedPlan];
    const item: CartItem = {
      id:         uid(),
      eventType:  evDef.id,
      eventLabel: evDef.label,
      eventIcon:  evDef.icon,
      plan:       selectedPlan,
      planLabel:  plDef.label,
      price:      plDef.price,
    };
    const next = [...items, item];
    persist(next);
    setFlash(true);
    setTimeout(() => setFlash(false), 600);
  }

  function removeItem(id: string) {
    persist(items.filter(i => i.id !== id));
  }

  const total = items.reduce((s, i) => s + i.price, 0);

  async function handlePay() {
    if (!items.length) return;
    setPayState('loading');
    setPayError(null);
    try {
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
      // Clear cart and redirect
      persist([]);
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
            <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af' }}>
              Tipo de evento
            </p>
            <div className="mec-event-pills">
              {EVENT_TYPES.map(ev => (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => setEvent(ev.id)}
                  className={`mec-pill${selectedEvent === ev.id ? ' mec-pill-active' : ''}`}
                >
                  {ev.icon} {ev.label}
                </button>
              ))}
            </div>
          </div>

          {/* Plan selector */}
          <div>
            <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af' }}>
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
                    <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', background: '#F5C518', color: '#0D0A07', fontSize: 9, fontWeight: 800, padding: '2px 10px', borderRadius: '0 0 6px 6px', whiteSpace: 'nowrap', letterSpacing: '0.05em' }}>
                      MÁS POPULAR
                    </div>
                  )}
                  <p style={{ margin: '8px 0 4px', fontSize: 15, fontWeight: 700, color: selectedPlan === id ? '#fff' : '#d6d3d1' }}>{pl.label}</p>
                  <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', lineHeight: 1.3 }}>{pl.desc}</p>
                  <p style={{ margin: '10px 0 0', fontSize: 22, fontWeight: 800, color: selectedPlan === id ? '#F5C518' : '#d6d3d1', fontFamily: 'var(--font-playfair, Georgia, serif)', lineHeight: 1 }}>
                    {fmtPrice(pl.price)}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: 10, color: '#9ca3af' }}>MXN pago único</p>
                </div>
              ))}
            </div>
          </div>

          {/* Add to cart */}
          <button type="button" onClick={addToCart} className="mec-add-btn">
            🛒 Agregar {evDef.icon} {evDef.label} — {PLANS[selectedPlan].label}
          </button>

          {flash && (
            <p style={{ margin: 0, textAlign: 'center', fontSize: 13, color: '#F5C518', fontWeight: 600 }}>
              ✓ Agregado al carrito
            </p>
          )}
        </div>

        {/* ── RIGHT: Cart panel ── */}
        <div className="mec-sticky" style={{ position: 'sticky', top: 88 }}>
          <div className="mec-cart-panel">

            {/* Cart header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#f5f5f4' }}>Tu carrito</span>
              {items.length > 0 && (
                <span style={{ background: '#F5C518', color: '#0D0A07', fontSize: 11, fontWeight: 800, borderRadius: '999px', padding: '2px 8px' }}>
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
                  <div key={item.id} className="mec-item" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>{item.eventIcon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#f5f5f4', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.eventLabel}
                      </p>
                      <p style={{ margin: '1px 0 0', fontSize: 11, color: '#9ca3af' }}>Plan {item.planLabel}</p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#F5C518' }}>{fmtPrice(item.price)}</p>
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
              <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 12 }}>

                {/* Total */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 13, color: '#9ca3af' }}>Total</span>
                  <span style={{ fontSize: 22, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-playfair, Georgia, serif)' }}>
                    {fmtPrice(total)} <span style={{ fontSize: 12, fontWeight: 400, color: '#9ca3af' }}>MXN</span>
                  </span>
                </div>

                {/* Pay button */}
                <button type="button" onClick={handlePay} disabled={payState === 'loading'} className="mec-pay-btn" aria-busy={payState === 'loading'}>
                  {payState === 'loading' ? <><span className="mec-spinner" />Procesando…</> : '🔒 Pagar todo ahora'}
                </button>
                {payState === 'error' && payError && (
                  <p style={{ margin: 0, fontSize: 12, color: '#f87171', textAlign: 'center' }} role="alert">{payError}</p>
                )}

                {/* Save for later */}
                {saveState === 'done' ? (
                  <p style={{ margin: 0, fontSize: 12, color: '#4ade80', textAlign: 'center', fontWeight: 600 }}>
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
                      style={{ flex: 1, minWidth: 0, padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.06)', color: '#f5f5f4', fontSize: 13, outline: 'none' }}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saveState === 'loading' || !saveEmail.trim()}
                      style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: '#F5C518', color: '#0D0A07', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
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
            <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <p style={{ margin: '0 0 8px', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b7280' }}>
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
            <div style={{ margin: '0 12px 8px', background: 'rgba(21,128,61,0.12)', border: '1px solid rgba(21,128,61,0.25)', borderRadius: 8, padding: '10px 12px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <ShieldCheck />
              <div>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#4ade80' }}>Pago 100% seguro</p>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#86efac' }}>Cifrado SSL 256-bit · Stripe</p>
              </div>
            </div>

            {/* Guarantee badge */}
            <div style={{ margin: '0 12px 14px', background: 'rgba(146,64,14,0.12)', border: '1px solid rgba(146,64,14,0.25)', borderRadius: 8, padding: '10px 12px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Clock48 />
              <div>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#fbbf24' }}>Garantía 48 horas</p>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#fcd34d' }}>Devolución completa sin preguntas</p>
              </div>
            </div>

            {/* Trust items */}
            <div style={{ padding: '12px 20px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 7 }}>
              {[
                ['⚡', 'Acceso inmediato al editor'],
                ['✏️', 'Ediciones ilimitadas incluidas'],
                ['📱', 'Funciona sin instalar apps'],
                ['💬', 'Soporte por WhatsApp incluido'],
              ].map(([icon, text]) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#9ca3af' }}>
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
