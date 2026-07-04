'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Product } from '@/domain/products';
import { SiteButton } from '@/components/public/Button';
import { useKompraloCart, CART_PLANS, type CartItem } from '@/components/cart/useKompraloCart';
import { trackInitiateCheckout } from '@/lib/pixel';

// ─── Design tokens ────────────────────────────────────────────────────────────
// Claves legadas remapeadas a la paleta Editorial Elegante:
// gold/champagne/blue actúan como acento rosa antiguo; dark/mid como marrón.
const T = {
  ivory:     'var(--site-color-crema)',
  cream:     'var(--site-color-crema)',
  dark:      'var(--site-color-marron)',
  mid:       'var(--site-color-marron)',
  light:     '#7A6A63',
  gold:      'var(--site-color-rosa-antiguo)',
  champagne: 'var(--site-color-rosa-antiguo)',
  white:     'var(--site-color-blanco)',
  border:    'var(--site-color-border-subtle)',
  blue:      'var(--site-color-rosa-antiguo)',
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
  basic:   { name: 'Karla M.',   city: 'Monterrey',   text: 'Súper fácil de usar, mis invitados encontraron todos los detalles de la boda.', event: 'Boda · Feb 2025' },
  premium: { name: 'Sofía R.',   city: 'CDMX',        text: 'La galería y la música hicieron llorar a mi mamá. Totalmente recomendado.',      event: 'Boda · Abr 2025' },
  deluxe:  { name: 'Daniela G.', city: 'Guadalajara', text: 'La intro cinemática hizo que la invitación se sintiera muy especial.', event: 'Boda · Mar 2025' },
};

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
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

  /* Drawer */
  .ps-drawer-backdrop {
    position: fixed; inset: 0; z-index: 9998;
    background: rgba(0,0,0,0.5);
    transition: opacity 300ms ease;
  }
  .ps-drawer-panel {
    position: fixed; top: 0; right: 0; bottom: 0; z-index: 9999;
    width: min(440px, 100vw);
    background: ${T.cream};
    box-shadow: -8px 0 48px rgba(0,0,0,0.22);
    transition: transform 300ms ease;
    display: flex; flex-direction: column;
    overflow-y: auto;
    overscroll-behavior: contain;
  }
  .ps-drawer-panel:focus { outline: none; }
  .ps-drawer-header {
    flex-shrink: 0;
    display: flex; align-items: center; gap: .75rem;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid ${T.border};
    background: ${T.cream};
    position: sticky; top: 0; z-index: 1;
  }
  .ps-trust-grid {
    display: flex; flex-wrap: wrap; gap: .5rem 1.5rem;
  }
`;

// ─── LockIcon ─────────────────────────────────────────────────────────────────
function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

// ─── FeatureList ──────────────────────────────────────────────────────────────
function FeatureList({ features }: { features: string[] }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
      {features.map((f) => (
        <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '.5rem', fontSize: '.875rem', color: T.mid, lineHeight: 1.4 }}>
          <span style={{ color: T.gold, flexShrink: 0, marginTop: '.15rem' }}>✓</span> {f}
        </li>
      ))}
    </ul>
  );
}

// ─── PlanCard ─────────────────────────────────────────────────────────────────
function PlanCard({
  product, featured, selected, onSelect, onPayDirect, paying,
}: {
  product: Product;
  featured?: boolean;
  selected: boolean;
  onSelect: (id: PlanId) => void;
  onPayDirect: (id: PlanId) => void;
  paying: boolean;
}) {
  const imageUrl =
    product.id === 'basic'   ? '/images/invitaciones/invitation-paper-detail.webp' :
    product.id === 'premium' ? '/images/invitaciones/wedding-details.webp' :
                               '/images/invitaciones/xv-event-editorial.webp';

  return (
    <div className={featured ? 'ps-featured-scale' : undefined} style={{ height: '100%' }}>
      <div style={{
        position: 'relative', display: 'flex', flexDirection: 'column', height: '100%',
        background: featured ? '#F7F3F4' : T.white,
        border: `${selected ? '2px' : featured ? '2px' : '1px'} solid ${(selected || featured) ? 'var(--site-color-rosa-antiguo)' : T.border}`,
        borderRadius: '1rem', padding: 0, overflow: 'hidden',
        boxShadow: selected
          ? '0 0 0 3px rgba(156,107,112,0.2), 0 14px 56px rgba(156,107,112,0.12)'
          : featured
            ? '0 8px 30px rgba(74,59,53,0.1)'
            : '0 2px 12px rgba(74,59,53,0.05)',
        transition: 'border-color 0.18s, box-shadow 0.18s',
      }}>
        {/* Image */}
        <div style={{ height: 160, position: 'relative', marginBottom: '1.25rem', background: T.cream }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />
          <div style={{ position: 'absolute', inset: 0, background: featured ? 'linear-gradient(to bottom, transparent, #F7F3F4)' : 'linear-gradient(to bottom, transparent, #FFFFFF)' }} />
          {featured && (
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', background: 'var(--site-color-rosa-antiguo)', color: 'var(--site-color-crema)', fontSize: '.6875rem', fontWeight: 800, padding: '.35rem 1.125rem', borderRadius: '0 0 .625rem .625rem', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(74,59,53,0.18)', zIndex: 10 }}>
              MÁS VENDIDO
            </div>
          )}
          {selected && (
            <div style={{ position: 'absolute', top: 10, right: 10, background: T.blue, color: 'var(--site-color-crema)', fontSize: '.6875rem', fontWeight: 700, padding: '.25rem .625rem', borderRadius: '999px', zIndex: 10 }}>
              En carrito ✓
            </div>
          )}
        </div>

        <div style={{ padding: '0 1.75rem 2.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <h2 style={{ margin: '0 0 .375rem', fontSize: '1.625rem', fontWeight: 600, color: T.dark, fontFamily: 'var(--site-font-serif)' }}>
            {product.name}
          </h2>
          <p style={{ margin: '0 0 1.5rem', fontSize: '.875rem', color: T.mid, lineHeight: 1.55, minHeight: '2.5em' }}>
            {product.description}
          </p>
          <div style={{ marginBottom: '1.625rem' }}>
            <span style={{ fontSize: '2.75rem', fontWeight: 600, color: T.dark, lineHeight: 1, fontFamily: 'var(--site-font-serif)' }}>
              <span style={{ fontFamily: 'var(--site-font-sans)', fontWeight: 500, marginRight: '0.05em' }}>$</span>
              {(product.price / 100).toLocaleString('es-MX', { maximumFractionDigits: 0 })}
            </span>
            <span style={{ fontSize: '.875rem', color: T.light, marginLeft: '.375rem' }}>MXN · Pago único</span>
          </div>
          <div style={{ flex: 1, marginBottom: '2.125rem' }}>
            <FeatureList features={product.features} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
            <SiteButton
              type="button"
              variant="primary"
              onClick={() => onPayDirect(product.id as PlanId)}
              disabled={paying}
              style={{
                width: '100%',
                cursor: paying ? 'not-allowed' : 'pointer',
                opacity: paying ? 0.65 : 1,
              }}
            >
              {paying
                ? <><span style={{ display: 'inline-block', width: '1rem', height: '1rem', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />Procesando…</>
                : <><LockIcon />Pagar ahora</>}
            </SiteButton>
            <SiteButton
              type="button"
              variant="secondary"
              onClick={() => onSelect(product.id as PlanId)}
              style={{
                width: '100%',
                background: selected ? 'rgba(156,107,112,0.08)' : undefined,
              }}
            >
              {selected ? '✓ En carrito' : '+ Agregar al carrito'}
            </SiteButton>
            <p style={{
              margin: '.35rem 0 0',
              fontSize: '.68rem',
              lineHeight: 1.45,
              color: T.light,
              textAlign: 'center',
            }}>
              ✓ Cambios ilimitados&nbsp;&nbsp;✓ Pago único, sin mensualidades&nbsp;&nbsp;✓ Soporte por WhatsApp
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CartDrawerContent ────────────────────────────────────────────────────────
function CartDrawerContent({ items, total, onRemove, onClear, onClose }: {
  items: CartItem[];
  total: number;
  onRemove: (id: string) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const [checkoutState, setCheckoutState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg,      setErrorMsg]      = useState<string | null>(null);

  const [showEmailInput, setShowEmailInput] = useState(false);
  const [savedEmail,     setSavedEmail]     = useState('');
  const [saveLoading,    setSaveLoading]    = useState(false);
  const [saveSuccess,    setSaveSuccess]    = useState(false);

  const lastItem = items[items.length - 1];
  const review = lastItem ? REVIEWS[lastItem.plan] : undefined;

  async function handlePay() {
    if (!items.length) return;
    setCheckoutState('loading');
    setErrorMsg(null);
    try {
      trackInitiateCheckout({ value: total / 100, numItems: items.length });
      const res  = await fetch('/api/checkout/multi', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items }) });
      const data = await res.json() as unknown;
      if (!res.ok) throw new Error(data && typeof data === 'object' && 'error' in data ? String((data as Record<string, unknown>).error) : `Error del servidor (${res.status})`);
      if (!data || typeof data !== 'object' || !('url' in data) || typeof (data as Record<string, unknown>).url !== 'string') throw new Error('Respuesta inválida del servidor. Intenta de nuevo.');
      // Vaciar carrito antes de redirigir (mismo comportamiento que MultiEventCart)
      onClear();
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
      await fetch('/api/leads/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: savedEmail.trim(), plan: lastItem?.plan ?? 'premium', source: 'save_for_later' }) });
      setSaveSuccess(true);
    } finally {
      setSaveLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>

      {/* Urgency bar */}
      <div style={{ background: T.dark, color: T.cream, padding: '.5rem 1.25rem', fontSize: '.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexShrink: 0 }}>
        <span>🔥 Más de 80 eventos creados este mes · Disponibilidad limitada</span>
        <span style={{ whiteSpace: 'nowrap', opacity: 0.65 }}>Sin IVA adicional</span>
      </div>

      {/* Order summary */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${T.border}` }}>
        <p style={{ margin: '0 0 .25rem', fontSize: '.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: T.light }}>
          Resumen del pedido ({items.length} {items.length === 1 ? 'invitación' : 'invitaciones'})
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: '.5rem 0 .75rem', display: 'flex', flexDirection: 'column' }}>
          {items.map((item) => (
            <li key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '.625rem', padding: '.5rem 0', borderBottom: '1px solid rgba(74,59,53,0.06)' }}>
              <span style={{ fontSize: '1.375rem', lineHeight: 1, flexShrink: 0 }}>{item.eventIcon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: '.875rem', fontWeight: 600, color: T.dark, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.eventLabel}
                </p>
                <p style={{ margin: '1px 0 0', fontSize: '.75rem', color: T.light }}>Plan {item.planLabel}</p>
              </div>
              <span style={{ fontSize: '.875rem', fontWeight: 700, color: T.dark, whiteSpace: 'nowrap', flexShrink: 0 }}>
                {fmtPrice(item.price)}
              </span>
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                aria-label={`Eliminar ${item.eventLabel} — Plan ${item.planLabel}`}
                style={{ background: 'none', border: 'none', color: T.light, cursor: 'pointer', padding: 4, fontSize: '1rem', lineHeight: 1, flexShrink: 0 }}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '1rem' }}>
          <span style={{ fontSize: '.8125rem', color: T.light }}>Total</span>
          <span style={{ fontSize: '1.375rem', fontWeight: 600, color: T.dark, fontFamily: 'var(--site-font-serif)', whiteSpace: 'nowrap' }}>
            {fmtPrice(total)} <span style={{ fontSize: '.75rem', fontWeight: 500, color: T.light }}>MXN</span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => { onClear(); onClose(); }}
          style={{ marginTop: '.375rem', background: 'none', border: 'none', padding: 0, fontSize: '.78rem', color: T.light, cursor: 'pointer', textDecoration: 'underline' }}
        >
          Vaciar carrito
        </button>
      </div>

      {/* Pay CTA */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
        <button
          type="button"
          onClick={handlePay}
          disabled={checkoutState === 'loading'}
          className="ps-add-btn"
          style={{
            padding: '.875rem 2rem', borderRadius: '8px', border: 'none',
            background: checkoutState === 'loading' ? '#6B5A52' : T.dark,
            color: T.cream, fontSize: '1rem', fontWeight: 700,
            cursor: checkoutState === 'loading' ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
            opacity: checkoutState === 'loading' ? 0.7 : 1,
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

        {/* Métodos de pago */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
            {['Visa', 'Mastercard', 'AMEX', 'OXXO', 'SPEI'].map((m) => (
              <span key={m} style={{ background: '#fff', border: '0.5px solid rgba(74,59,53,0.18)', borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 500, color: T.light }}>
                {m}
              </span>
            ))}
          </div>
          <p style={{ fontSize: 11, color: T.light, margin: 0 }}>🔒 Procesado por Stripe · Encriptación SSL 256-bit</p>
        </div>

        {/* Guardar para después */}
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

        {/* Garantía */}
        <div style={{ background: T.greenBg, borderRadius: 8, padding: '10px 12px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 20 }}>🏆</span>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: T.successText }}>Pago único y sin mensualidades</p>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: T.successText, lineHeight: 1.4 }}>
              Elige tu plan, paga una sola vez y personaliza tu invitación para compartirla por WhatsApp.
            </p>
          </div>
        </div>
      </div>

      {/* Testimonio */}
      {review && (
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 4 }}>
            <span style={{ fontSize: '.875rem', fontWeight: 700, color: T.dark }}>{review.name} · {review.city}</span>
            <span style={{ fontSize: '.875rem', color: '#BA7517', letterSpacing: 1 }}>★★★★★</span>
          </div>
          <p style={{ margin: '0 0 .375rem', fontSize: '.875rem', color: T.mid, lineHeight: 1.5 }}>&ldquo;{review.text}&rdquo;</p>
          <p style={{ margin: 0, fontSize: '.75rem', color: T.light }}>{review.event}</p>
          <p style={{ margin: '.75rem 0 0', fontSize: '.8125rem', color: T.mid, fontWeight: 500 }}>👥 +320 parejas ya compartieron su invitación con Kompralo</p>
        </div>
      )}

      {/* Trust items */}
      <div style={{ background: T.cream, padding: '1rem 1.5rem' }} className="ps-trust-grid">
        {[
          'Acceso para personalizar después del pago',
          'Edita tu invitación cuantas veces necesites',
          'Funciona en cualquier celular sin instalar apps',
          'Fácil de compartir por WhatsApp',
        ].map((item) => (
          <span key={item} style={{ fontSize: '.8125rem', color: T.mid, display: 'flex', alignItems: 'center', gap: '.375rem' }}>
            <span style={{ color: T.green, fontWeight: 700 }}>✓</span> {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── CartDrawer ───────────────────────────────────────────────────────────────
function CartDrawer({
  isOpen, onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { items, total, removeItem, clear } = useKompraloCart();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Body scroll lock — compensate scrollbar width to prevent layout shift
  useEffect(() => {
    if (!isOpen) return;
    const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarW}px`;
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="ps-drawer-backdrop"
        style={{ opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none' }}
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Tu carrito"
        tabIndex={-1}
        className="ps-drawer-panel"
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
      >
        {/* Sticky header */}
        <div className="ps-drawer-header">
          <span style={{ flex: 1, fontSize: '1rem', fontWeight: 700, color: T.dark }}>
            🛒 Tu carrito
          </span>
          {items.length > 0 && (
            <span style={{ fontSize: '.8125rem', color: T.light }}>
              {items.length} {items.length === 1 ? 'item' : 'items'} · {fmtPrice(total)} MXN
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar carrito"
            style={{
              flexShrink: 0,
              width: 32, height: 32, borderRadius: '50%',
              border: `1px solid ${T.border}`,
              background: 'rgba(156,107,112,0.1)',
              color: T.light, fontSize: 20, lineHeight: 1,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>

        {/* Scrollable content */}
        {items.length > 0 ? (
          <CartDrawerContent items={items} total={total} onRemove={removeItem} onClear={clear} onClose={onClose} />
        ) : (
          <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', color: T.light, fontSize: '.875rem' }}>
            Tu carrito está vacío. Agrega un plan para continuar.
          </div>
        )}
      </div>
    </>,
    document.body,
  );
}

// ─── PlanSelector (main export) ───────────────────────────────────────────────
export function PlanSelector({ products, featuredId = 'premium' }: PlanSelectorProps) {
  const { items, addItem } = useKompraloCart();
  const [isDrawerOpen,  setIsDrawerOpen]  = useState(false);
  const [payingId,      setPayingId]      = useState<PlanId | null>(null);
  const [directError,   setDirectError]   = useState<string | null>(null);

  // Un plan se marca "En carrito" si el carrito compartido tiene un item con
  // ese plan (agregado desde estas cards o desde el multi-carrito).
  const plansInCart = new Set(items.map((i) => i.plan));

  function handleSelect(id: PlanId) {
    // Las cards de planes son de boda; evitar duplicar si ya está ese plan
    if (!plansInCart.has(id)) addItem('boda', id);
    setIsDrawerOpen(true);
  }

  async function handlePayDirect(id: PlanId) {
    if (payingId) return;
    setPayingId(id);
    setDirectError(null);
    try {
      trackInitiateCheckout({ value: (CART_PLANS[id]?.price ?? 0) / 100, numItems: 1 });
      const res  = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id }),
      });
      const data = await res.json() as unknown;
      if (!res.ok) {
        throw new Error(
          data && typeof data === 'object' && 'error' in data
            ? String((data as Record<string, unknown>).error)
            : `Error del servidor (${res.status})`
        );
      }
      if (!data || typeof data !== 'object' || !('url' in data) || typeof (data as Record<string, unknown>).url !== 'string') {
        throw new Error('Respuesta inválida del servidor.');
      }
      window.location.href = (data as { url: string }).url;
    } catch (err) {
      setDirectError(
        err instanceof TypeError
          ? 'Sin conexión. Verifica tu red.'
          : err instanceof Error ? err.message : 'Error inesperado.'
      );
      setPayingId(null);
    }
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="ps-cards-grid" style={{ maxWidth: '1040px', margin: '0 auto' }}>
        {products.map((p) => (
          <PlanCard
            key={p.id}
            product={p}
            featured={p.id === featuredId}
            selected={plansInCart.has(p.id as PlanId)}
            onSelect={handleSelect}
            onPayDirect={handlePayDirect}
            paying={payingId === p.id}
          />
        ))}
      </div>

      {directError && (
        <p style={{ textAlign: 'center', marginTop: '.75rem', fontSize: '.8125rem', color: '#C62828' }} role="alert">
          {directError}
        </p>
      )}

      <CartDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}
