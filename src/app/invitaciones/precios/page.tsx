import type { Metadata } from 'next';
import { availableProducts } from '@/domain/products';
import type { Product } from '@/domain/products';
import { CheckoutButton } from '@/components/checkout/CheckoutButton';

export const metadata: Metadata = {
  title: 'Planes y Precios — Kompralo',
  description: 'Elige el plan ideal para tu invitación digital. Basic, Premium o Deluxe.',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(centavos: number, currency: string): string {
  return new Intl.NumberFormat('es-MX', {
    style:    'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(centavos / 100);
}

// ─── Feature check list ───────────────────────────────────────────────────────

function FeatureList({ features }: { features: string[] }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {features.map((feat) => (
        <li
          key={feat}
          style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', color: '#4B3A2C' }}
        >
          <span style={{ color: '#C5A880', flexShrink: 0, marginTop: '0.1rem' }}>✓</span>
          {feat}
        </li>
      ))}
    </ul>
  );
}

// ─── Product card ─────────────────────────────────────────────────────────────

function ProductCard({ product, featured }: { product: Product; featured?: boolean }) {
  const priceStr = formatPrice(product.price, product.currency);

  return (
    <div
      style={{
        position:      'relative',
        display:       'flex',
        flexDirection: 'column',
        background:    featured ? '#1A1410' : '#FAFAF8',
        border:        featured ? '2px solid #C5A880' : '1px solid #E8E2DA',
        borderRadius:  '1rem',
        padding:       '2rem 1.5rem',
        boxShadow:     featured
          ? '0 8px 32px rgba(197,168,128,0.18)'
          : '0 2px 8px rgba(26,20,16,0.06)',
        transition:    'box-shadow 0.2s',
        flex:          1,
        minWidth:      0,
      }}
    >
      {/* Popular badge */}
      {featured && (
        <div
          style={{
            position:   'absolute',
            top:        '-1px',
            left:       '50%',
            transform:  'translateX(-50%)',
            background: '#C5A880',
            color:      '#1A1410',
            fontSize:   '0.6875rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            padding:    '0.25rem 0.875rem',
            borderRadius: '0 0 0.5rem 0.5rem',
            whiteSpace: 'nowrap',
          }}
        >
          MÁS POPULAR
        </div>
      )}

      {/* Plan name */}
      <h3
        style={{
          margin:      0,
          fontSize:    '1.25rem',
          fontWeight:  600,
          color:       featured ? '#F5EDD8' : '#1A1410',
          letterSpacing: '0.02em',
          marginBottom: '0.25rem',
        }}
      >
        {product.name}
      </h3>

      {/* Description */}
      <p
        style={{
          margin:      0,
          fontSize:    '0.8125rem',
          color:       featured ? '#C5B8A8' : '#6B5B4E',
          lineHeight:  1.5,
          marginBottom: '1.25rem',
          minHeight:   '2.5em',
        }}
      >
        {product.description}
      </p>

      {/* Price */}
      <div style={{ marginBottom: '1.5rem' }}>
        <span
          style={{
            fontSize:   '2.25rem',
            fontWeight: 700,
            color:      featured ? '#F5EDD8' : '#1A1410',
            lineHeight: 1,
          }}
        >
          {priceStr}
        </span>
        <span style={{ fontSize: '0.875rem', color: featured ? '#C5B8A8' : '#9B8878', marginLeft: '0.25rem' }}>
          MXN / pago único
        </span>
      </div>

      {/* Feature list */}
      <div style={{ flex: 1, marginBottom: '2rem' }}>
        <FeatureList features={product.features} />
      </div>

      {/* CTA */}
      <CheckoutButton
        productId={product.id}
        label={`Comprar ${product.name}`}
        className={[
          'w-full py-3 rounded-lg text-sm font-semibold transition-opacity',
          featured
            ? 'bg-[#C5A880] text-[#1A1410] hover:opacity-90'
            : 'bg-[#1A1410] text-[#F5F3F0] hover:opacity-80',
        ].join(' ')}
      />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PreciosPage() {
  // Source of truth: domain catalog. No hardcoded prices here.
  const [basic, premium, deluxe] = availableProducts;

  return (
    <main
      style={{
        minHeight:   '100dvh',
        background:  '#F5F0EB',
        padding:     'clamp(2rem, 8vw, 5rem) 1rem',
        fontFamily:  'var(--font-inter, system-ui, sans-serif)',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem', maxWidth: '36rem', margin: '0 auto 3rem' }}>
        <p
          style={{
            fontSize:    '0.75rem',
            fontWeight:  600,
            letterSpacing: '0.2em',
            color:       '#C5A880',
            textTransform: 'uppercase',
            marginBottom: '0.75rem',
          }}
        >
          Planes
        </p>
        <h1
          style={{
            fontSize:    'clamp(1.75rem, 5vw, 2.5rem)',
            fontWeight:  700,
            color:       '#1A1410',
            margin:      '0 0 1rem',
            lineHeight:  1.15,
          }}
        >
          Tu invitación digital, sin complicaciones
        </h1>
        <p style={{ color: '#6B5B4E', fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>
          Elige el plan que mejor se adapte a tu evento. Pago único, sin suscripción.
        </p>
      </div>

      {/* Cards grid */}
      <div
        style={{
          display:       'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap:           '1.5rem',
          maxWidth:      '960px',
          margin:        '0 auto',
          alignItems:    'stretch',
        }}
      >
        <ProductCard product={basic}   />
        <ProductCard product={premium} featured />
        <ProductCard product={deluxe}  />
      </div>

      {/* Trust footer */}
      <p
        style={{
          textAlign:   'center',
          marginTop:   '2.5rem',
          fontSize:    '0.8125rem',
          color:       '#9B8878',
          lineHeight:  1.5,
        }}
      >
        Pago seguro procesado por Stripe · Soporte en español · Entrega inmediata
      </p>
    </main>
  );
}
