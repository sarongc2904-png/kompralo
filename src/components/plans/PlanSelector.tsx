'use client';

import { useState, useRef, useEffect } from 'react';
import type { Product } from '@/domain/products';

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  ivory:     '#E8D7B8',
  cream:     '#F1E3C8',
  dark:      '#0D0A07',
  mid:       '#1A1612',
  light:     '#6B4A35',
  gold:      '#C4A962',
  champagne: '#EAD7A3',
  white:     '#F1E3C8',
  border:    '#EAD7A3',
  blue:      '#2563EB',
  green:     '#15803D',
  greenBg:   '#F0FDF4',
  successText: '#166534',
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────
type PlanId = 'basic' | 'premium' | 'deluxe';

interface PlanSelectorProps {
  products: Product[];
  featuredId?: PlanId;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtPrice(centavos: number): string {
  return `$${(centavos / 100).toLocaleString('es-MX', { maximumFractionDigits: 0 })}`;
}

// ─── Reviews per plan ─────────────────────────────────────────────────────────
const REVIEWS: Record<string, { name: string; city: string; text: string; event: string }> = {
  basic:   { name: 'Karla M.',   city: 'Monterrey',   text: 'Súper fácil de usar, mis invitados adoraron el link. Vale cada peso.',           event: 'Boda · Feb 2025' },
  premium: { name: 'Sofía R.',   city: 'CDMX',        text: 'La galería y la música hicieron llorar a mi mamá. Totalmente recomendado.',      event: 'Boda · Abr 2025' },
  deluxe:  { name: 'Daniela G.', city: 'Guadalajara', text: 'La intro cinemática fue el wow de mi boda. Todos me preguntaron cómo la hice.', event: 'Boda · Mar 2025' },
};

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  @keyframes ps-fadeIn {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @media (prefers-reduced-motion: reduce) {
    .ps-cart-panel { animation: none !important; }
  }
  .ps-cart-panel { animation: ps-fadeIn 200ms ease both; }

  .ps-cards-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    align-items: stretch;
  }
  @media (max-width: 800px) {
    .ps-cards-grid {
      grid-template-columns: 1fr;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    }
    .ps-featured-scale { transform: none !important; }
  }
  @media (min-width: 801px) {
    .ps-featured-scale { transform: scale(1.07); position: relative; z-index: 2; }
  }
  .ps-add-btn { transition: opacity 0.15s, background 0.15s, color 0.15s; }
  .ps-add-btn:hover:not(:disabled) { opacity: 0.88; }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

// ─── FeatureList ──────────────────────────────────────────────────────────────
function FeatureList({ features, dark }: { features: string[]; dark?: boolean }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
      {features.map((f) => (
        <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '.5rem', fontSize: '.875rem', color: dark ? '#C5B0A0' : T.mid, lineHeight: 1.4 }}>
          <span style={{ color: T.gold, flexShrink: 0, marginTop: '.15rem' }}>✓</span> {f}
        </li>
      ))}
    </ul>
  );
}

// ─── PlanCard ─────────────────────────────────────────────────────────────────
function PlanCard({
  product, featured, selected, onSelect,
}: {
  product: Product; featured?: boolean; selected: boolean; onSelect: (id: PlanId) => void;
}) {
  const imageUrl =
    product.id === 'basic'   ? '/images/invitaciones/invitation-paper-detail.webp' :
    product.id === 'premium' ? '/images/invitaciones/wedding-details.webp' :
                               '/images/invitaciones/xv-event-editorial.webp';

  return (
    <div className={featured ? 'ps-featured-scale' : undefined} style={{ height: '100%' }}>
      <div style={{
        position: 'relative', display: 'flex', flexDirection: 'column', height: '100%',
        background: featured ? T.dark : T.white,
        border: `${selected ? '2px' : featured ? '2px' : '1px'} solid ${selected ? T.blue : featured ? T.gold : T.border}`,
        borderRadius: '8px', padding: 0, overflow: 'hidden',
        boxShadow: selected
          ? '0 0 0 3px rgba(37,99,235,0.25), 0 14px 56px rgba(37,99,235,0.12)'
          : featured
            ? '0 14px 56px rgba(184,150,106,0.22), 0 2px 0 rgba(184,150,106,0.25) inset'
            : '0 2px 12px rgba(15,12,9,0.04)',
        transition: 'border-color 0.18s, box-shadow 0.18s',
      }}>
        {/* Image */}
        <div style={{ height: 160, position: 'relative', marginBottom: '1.25rem', background: '#000' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: featured ? 0.75 : 0.9 }} />
          <div style={{ position: 'absolute', inset: 0, background: featured ? 'linear-gradient(to bottom, transparent, #0D0A07)' : 'linear-gradient(to bottom, transparent, #F1E3C8)' }} />
          {featured && (
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', background: T.gold, color: T.dark, fontSize: '.6875rem', fontWeight: 800, padding: '.35rem 1.125rem', borderRadius: '0 0 .625rem .625rem', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 10 }}>
              MÁS VENDIDO
            </div>
          )}
          {selected && (
            <div style={{ position: 'absolute', top: 10, right: 10, background: T.blue, color: '#fff', fontSize: '.6875rem', fontWeight: 700, padding: '.25rem .625rem', borderRadius: '999px', zIndex: 10 }}>
              En carrito ✓
            </div>
          )}
        </div>

        <div style={{ padding: '0 1.75rem 2.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <h2 style={{ margin: '0 0 .375rem', fontSize: '1.625rem', fontWeight: 700, color: featured ? '#F1E3C8' : T.dark, fontFamily: 'var(--font-playfair, Georgia, serif)' }}>
            {product.name}
          </h2>
          <p style={{ margin: '0 0 1.5rem', fontSize: '.875rem', color: featured ? '#C5B0A0' : T.mid, lineHeight: 1.55, minHeight: '2.5em' }}>
            {product.description}
          </p>
          <div style={{ marginBottom: '1.625rem' }}>
            <span style={{ fontSize: '2.75rem', fontWeight: 800, color: featured ? '#F1E3C8' : T.dark, lineHeight: 1, fontFamily: 'var(--font-playfair, Georgia, serif)' }}>
              <span style={{ fontFamily: 'var(--font-inter, system-ui, sans-serif)', fontWeight: 500, marginRight: '0.05em' }}>$</span>
              {(product.price / 100).toLocaleString('es-MX', { maximumFractionDigits: 0 })}
            </span>
            <span style={{ fontSize: '.875rem', color: featured ? '#C5B0A0' : T.light, marginLeft: '.375rem' }}>MXN / pago único</span>
          </div>
          <div style={{ flex: 1, marginBottom: '2.125rem' }}>
            <FeatureList features={product.features} dark={featured} />
          </div>
          <button
            type="button"
            onClick={() => onSelect(product.id as PlanId)}
            className="ps-add-btn"
            style={{
              width: '100%', padding: '.75rem 1.5rem', borderRadius: '6px',
              fontSize: '.875rem', fontWeight: 700, cursor: 'pointer',
              border: selected ? `2px solid ${T.blue}` : 'none',
              background: selected ? 'transparent' : featured ? T.gold : T.dark,
              color: selected ? T.blue : featured ? T.dark : T.cream,
              textAlign: 'center',
            }}
          >
            {selected ? 'En carrito ✓' : 'Agregar al carrito'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CartPanel ────────────────────────────────────────────────────────────────
function CartPanel({ product, onClear }: { product: Product; onClear: () => void }) {
  const [checkoutState, setCheckoutState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg,      setErrorMsg]      = useState<string | null>(null);

  // 1B — Save for later
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [savedEmail,     setSavedEmail]     = useState('');
  const [saveLoading,    setSaveLoading]    = useState(false);
  const [saveSuccess,    setSaveSuccess]    = useState(false);

  const review = REVIEWS[product.id];

  async function handlePay() {
    setCheckoutState('loading');
    setErrorMsg(null);
    try {
      const res  = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: product.id }) });
      const data = await res.json() as unknown;
      if (!res.ok) throw new Error(data && typeof data === 'object' && 'error' in data ? String((data as Record<string, unknown>).error) : `Error del servidor (${res.status})`);
      if (!data || typeof data !== 'object' || !('url' in data) || typeof (data as Record<string, unknown>).url !== 'string') throw new Error('Respuesta inválida del servidor. Intenta de nuevo.');
      window.location.href = (data as { url: string }).url;
    } catch (err) {
      setErrorMsg(err instanceof TypeError ? 'Sin conexión. Verifica tu red e intenta de nuevo.' : err instanceof Error ? err.message : 'Error inesperado.');
      setCheckoutState('error');
    }
  }

  async function handleSave() {
    if (!savedEmail.trim()) return;
    setSaveLoading(true);
    try {
      await fetch('/api/leads/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: savedEmail.trim(), plan: product.id, source: 'save_for_later' }) });
      setSaveSuccess(true);
    } finally {
      setSaveLoading(false);
    }
  }

  return (
    <div className="ps-cart-panel" style={{ maxWidth: '1040px', margin: '1.5rem auto 0', background: T.cream, border: `1px solid ${T.champagne}`, borderRadius: '12px', overflow: 'hidden' }}>

      {/* Urgency bar */}
      <div style={{ background: T.dark, color: T.champagne, padding: '.5rem 1.5rem', fontSize: '.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <span>🔥 Más de 80 eventos creados este mes · Disponibilidad limitada</span>
        <span style={{ whiteSpace: 'nowrap', opacity: 0.65 }}>Precios sin IVA adicional</span>
      </div>

      {/* Main body — two columns */}
      <div style={{ padding: '1.5rem 1.75rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-start' }}>

        {/* Left — Order summary */}
        <div style={{ flex: '1 1 260px' }}>
          <p style={{ margin: '0 0 .25rem', fontSize: '.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: T.light }}>
            Resumen del pedido
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '.5rem 0 .875rem', gap: '1rem' }}>
            <span style={{ fontSize: '1.125rem', fontWeight: 700, color: T.dark, fontFamily: 'var(--font-playfair, Georgia, serif)' }}>
              Plan {product.name}
            </span>
            <span style={{ fontSize: '1.375rem', fontWeight: 800, color: T.dark, fontFamily: 'var(--font-playfair, Georgia, serif)', whiteSpace: 'nowrap' }}>
              {fmtPrice(product.price)} <span style={{ fontSize: '.75rem', fontWeight: 500, color: T.light }}>MXN</span>
            </span>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 .5rem', display: 'flex', flexDirection: 'column', gap: '.3rem' }}>
            {product.features.slice(0, 3).map((f) => (
              <li key={f} style={{ fontSize: '.8125rem', color: T.mid, display: 'flex', gap: '.4rem' }}>
                <span style={{ color: T.gold }}>✓</span> {f}
              </li>
            ))}
            {product.features.length > 3 && (
              <li style={{ fontSize: '.8125rem', color: T.light }}>+ {product.features.length - 3} más incluidos</li>
            )}
          </ul>
          <button type="button" onClick={onClear} style={{ marginTop: '.375rem', background: 'none', border: 'none', padding: 0, fontSize: '.78rem', color: T.light, cursor: 'pointer', textDecoration: 'underline' }}>
            Cambiar plan
          </button>
        </div>

        {/* Right — Pay CTA column */}
        <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: '.75rem', minWidth: 220 }}>

          {/* Pagar ahora */}
          <button
            type="button"
            onClick={handlePay}
            disabled={checkoutState === 'loading'}
            className="ps-add-btn"
            style={{
              padding: '.875rem 2rem', borderRadius: '8px', border: 'none',
              background: checkoutState === 'loading' ? '#555' : T.dark,
              color: T.cream, fontSize: '1rem', fontWeight: 700,
              cursor: checkoutState === 'loading' ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
              opacity: checkoutState === 'loading' ? 0.7 : 1, whiteSpace: 'nowrap',
            }}
            aria-busy={checkoutState === 'loading'}
          >
            {checkoutState === 'loading' ? (
              <><span style={{ display: 'inline-block', width: '1rem', height: '1rem', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} aria-hidden="true" />Procesando…</>
            ) : 'Pagar ahora →'}
          </button>
          {checkoutState === 'error' && errorMsg && (
            <span style={{ fontSize: '.75rem', color: '#C62828', lineHeight: 1.4 }} role="alert">{errorMsg}</span>
          )}

          {/* 1A — Métodos de pago */}
          <div style={{ marginTop: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
              {['Visa', 'Mastercard', 'AMEX', 'OXXO', 'SPEI'].map((m) => (
                <span key={m} style={{ background: '#fff', border: '0.5px solid #D4C8B4', borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 500, color: T.light }}>
                  {m}
                </span>
              ))}
            </div>
            <p style={{ fontSize: 11, color: T.light, margin: 0 }}>🔒 Procesado por Stripe · Encriptación SSL 256-bit</p>
          </div>

          {/* 1B — Guardar para después */}
          <div>
            {saveSuccess ? (
              <p style={{ margin: 0, fontSize: '.8125rem', color: T.green, fontWeight: 500 }}>
                ✓ Guardado — te enviamos los detalles a {savedEmail}
              </p>
            ) : showEmailInput ? (
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="email"
                  value={savedEmail}
                  onChange={(e) => setSavedEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  placeholder="tu@email.com"
                  style={{ flex: 1, minWidth: 0, padding: '6px 10px', borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 13, background: '#fff', color: T.dark, outline: 'none' }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saveLoading || !savedEmail.trim()}
                  className="ps-add-btn"
                  style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: T.dark, color: T.cream, fontSize: 13, fontWeight: 600, cursor: saveLoading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
                >
                  {saveLoading ? '…' : 'Guardar'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowEmailInput(true)}
                style={{ background: 'none', border: `1px solid ${T.border}`, borderRadius: 6, padding: '6px 14px', fontSize: '.8125rem', fontWeight: 500, color: T.light, cursor: 'pointer', width: '100%' }}
              >
                ♡ Guardar para después
              </button>
            )}
          </div>

          {/* 1C — Garantía */}
          <div style={{ background: T.greenBg, borderRadius: 8, padding: '10px 12px', display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 4 }}>
            <span style={{ fontSize: 20 }}>🏆</span>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: T.successText }}>Garantía de satisfacción 48 h</p>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: T.successText, lineHeight: 1.4 }}>
                Si tu invitación no está lista en 48 horas, te devolvemos el 100% de tu dinero. Sin preguntas.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 1D — Testimonio */}
      {review && (
        <div style={{ borderTop: `1px solid ${T.border}`, margin: '0 1.75rem', padding: '1.25rem 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 4 }}>
            <span style={{ fontSize: '.875rem', fontWeight: 700, color: T.dark }}>{review.name} · {review.city}</span>
            <span style={{ fontSize: '.875rem', color: '#BA7517', letterSpacing: 1 }}>★★★★★</span>
          </div>
          <p style={{ margin: '0 0 .375rem', fontSize: '.875rem', color: T.mid, lineHeight: 1.5 }}>&ldquo;{review.text}&rdquo;</p>
          <p style={{ margin: 0, fontSize: '.75rem', color: T.light }}>{review.event}</p>
          <p style={{ margin: '.75rem 0 0', fontSize: '.8125rem', color: T.mid, fontWeight: 500 }}>👥 +320 parejas ya compartieron su invitación con Kompralo</p>
        </div>
      )}

      {/* 1E — Trust items */}
      <div style={{ background: '#F5EFE0', borderTop: `1px solid ${T.border}`, padding: '1rem 1.75rem', display: 'flex', flexWrap: 'wrap', gap: '.5rem 2rem' }}>
        {[
          'Acceso inmediato al panel después del pago',
          'Edita tu invitación cuantas veces necesites',
          'Funciona en cualquier celular sin instalar apps',
          'Soporte por WhatsApp incluido',
        ].map((item) => (
          <span key={item} style={{ fontSize: '.8125rem', color: T.mid, display: 'flex', alignItems: 'center', gap: '.375rem' }}>
            <span style={{ color: T.green, fontWeight: 700 }}>✓</span> {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── PlanSelector (main export) ───────────────────────────────────────────────
export function PlanSelector({ products, featuredId = 'premium' }: PlanSelectorProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null);
  const cartRef = useRef<HTMLDivElement>(null);

  const selectedProduct = selectedPlan ? (products.find((p) => p.id === selectedPlan) ?? null) : null;

  useEffect(() => {
    if (selectedPlan && cartRef.current) {
      cartRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedPlan]);

  return (
    <>
      <style>{CSS}</style>
      <div className="ps-cards-grid" style={{ maxWidth: '1040px', margin: '0 auto' }}>
        {products.map((p) => (
          <PlanCard
            key={p.id}
            product={p}
            featured={p.id === featuredId}
            selected={selectedPlan === p.id}
            onSelect={setSelectedPlan}
          />
        ))}
      </div>
      <div ref={cartRef}>
        {selectedProduct && (
          <CartPanel product={selectedProduct} onClear={() => setSelectedPlan(null)} />
        )}
      </div>
    </>
  );
}
