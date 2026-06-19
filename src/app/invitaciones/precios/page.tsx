import type { Metadata } from 'next';
import Link from 'next/link';
import { availableProducts } from '@/domain/products';
import type { Product } from '@/domain/products';
import { CheckoutButton } from '@/components/checkout/CheckoutButton';

export const metadata: Metadata = {
  title: 'Planes y Precios — Kompralo',
  description: 'Elige el plan ideal para tu invitación digital. Basic, Premium o Deluxe.',
};

// ─── Per-plan extra copy ──────────────────────────────────────────────────────
const planMeta: Record<string, { ideal: string; highlight: string }> = {
  basic: {
    ideal:     'Ideal para bautizos, baby showers y cumpleaños',
    highlight: 'Lo esencial para una invitación bonita y funcional.',
  },
  premium: {
    ideal:     'Ideal para bodas y XV años · el más elegido',
    highlight: 'Galería, música, itinerario y mapa incluidos.',
  },
  deluxe: {
    ideal:     'Ideal para bodas y quinces de alto impacto',
    highlight: 'La experiencia más completa con StoryBook animado.',
  },
};

// ─── CSS ─────────────────────────────────────────────────────────────────────
function PageStyles() {
  return (
    <style>{`
      @keyframes pr-fadeUp {
        from { opacity:0; transform:translateY(18px); }
        to   { opacity:1; transform:translateY(0); }
      }
      @media (prefers-reduced-motion: reduce) {
        .pr-anim, .pr-card { animation:none !important; transition:none !important; }
      }
      .pr-anim  { animation: pr-fadeUp .5s ease both; }
      .pr-d1    { animation-delay:.08s; }
      .pr-d2    { animation-delay:.16s; }
      .pr-d3    { animation-delay:.24s; }

      .pr-card {
        transition: transform .25s ease, box-shadow .25s ease;
      }
      .pr-card:hover {
        transform: translateY(-6px);
        box-shadow: 0 20px 54px rgba(26,20,16,0.16);
      }
      .pr-card-dark:hover {
        box-shadow: 0 24px 64px rgba(197,168,128,0.28);
      }

      .pr-btn {
        transition: transform .15s ease, opacity .15s ease;
      }
      .pr-btn:hover {
        transform: translateY(-2px);
        opacity: .9;
      }
      .pr-btn:active { transform: translateY(0); }

      .pr-cards-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.5rem;
        align-items: stretch;
      }
      @media (max-width: 780px) {
        .pr-cards-grid {
          grid-template-columns: 1fr;
          max-width: 380px;
          margin-left: auto;
          margin-right: auto;
        }
      }

      .pr-trust-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        justify-content: center;
      }
    `}</style>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatPrice(centavos: number, currency: string): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency', currency: currency.toUpperCase(),
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(centavos / 100);
}

// ─── Feature list ─────────────────────────────────────────────────────────────
function FeatureList({ features, dark }: { features: string[]; dark?: boolean }) {
  return (
    <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:'0.5rem' }}>
      {features.map((feat) => (
        <li key={feat} style={{ display:'flex', alignItems:'flex-start', gap:'0.5rem', fontSize:'0.875rem', color: dark ? '#C5B8A8' : '#4B3A2C' }}>
          <span style={{ color:'#C5A880', flexShrink:0, marginTop:'0.1rem' }}>✓</span>
          {feat}
        </li>
      ))}
    </ul>
  );
}

// ─── Product card ─────────────────────────────────────────────────────────────
function ProductCard({ product, featured }: { product: Product; featured?: boolean }) {
  const priceStr = formatPrice(product.price, product.currency);
  const meta = planMeta[product.id] ?? { ideal: '', highlight: '' };

  return (
    <div
      className={`pr-card ${featured ? 'pr-card-dark' : ''}`}
      style={{
        position:      'relative',
        display:       'flex',
        flexDirection: 'column',
        background:    featured ? '#1A1410' : '#FAFAF8',
        border:        featured ? '2px solid #C5A880' : '1px solid #E8E2DA',
        borderRadius:  '1.125rem',
        padding:       '2.25rem 1.625rem',
        boxShadow:     featured
          ? '0 10px 40px rgba(197,168,128,0.2)'
          : '0 2px 10px rgba(26,20,16,0.06)',
        flex: 1, minWidth: 0,
      }}
    >
      {/* Popular badge */}
      {featured && (
        <div style={{
          position:'absolute', top:'-1px', left:'50%', transform:'translateX(-50%)',
          background:'#C5A880', color:'#1A1410',
          fontSize:'0.6875rem', fontWeight:800, letterSpacing:'0.1em',
          padding:'0.25rem 1rem', borderRadius:'0 0 0.625rem 0.625rem',
          whiteSpace:'nowrap',
        }}>
          MÁS POPULAR
        </div>
      )}

      {/* Ideal para */}
      {meta.ideal && (
        <p style={{
          margin:'0 0 0.375rem', fontSize:'0.75rem', fontWeight:600,
          color: featured ? '#C5A880' : '#9B8878', letterSpacing:'0.04em',
        }}>{meta.ideal}</p>
      )}

      {/* Plan name */}
      <h3 style={{
        margin:'0 0 0.375rem', fontSize:'1.375rem', fontWeight:700,
        color: featured ? '#F5EDD8' : '#1A1410',
      }}>{product.name}</h3>

      {/* Highlight description */}
      <p style={{
        margin:'0 0 1.375rem', fontSize:'0.8125rem',
        color: featured ? '#C5B8A8' : '#6B5B4E', lineHeight:1.55, minHeight:'2.2em',
      }}>
        {meta.highlight || product.description}
      </p>

      {/* Price */}
      <div style={{ marginBottom:'1.625rem' }}>
        <span style={{ fontSize:'2.5rem', fontWeight:800, color: featured ? '#F5EDD8' : '#1A1410', lineHeight:1 }}>
          {priceStr}
        </span>
        <span style={{ fontSize:'0.875rem', color: featured ? '#C5B8A8' : '#9B8878', marginLeft:'0.375rem' }}>
          MXN / pago único
        </span>
      </div>

      {/* Features */}
      <div style={{ flex:1, marginBottom:'2rem' }}>
        <FeatureList features={product.features} dark={featured} />
      </div>

      {/* CTA — CheckoutButton, must not be modified */}
      <CheckoutButton
        productId={product.id}
        label={`Comprar ${product.name}`}
        className={[
          'w-full py-3 rounded-lg text-sm font-semibold transition-opacity pr-btn',
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
  const [basic, premium, deluxe] = availableProducts;

  return (
    <main style={{ minHeight:'100dvh', background:'#F5F0EB', fontFamily:'var(--font-inter, system-ui, sans-serif)' }}>
      <PageStyles />

      {/* Nav */}
      <nav style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0.875rem clamp(1rem,4vw,2rem)',
        borderBottom:'1px solid #E8E2DA',
        background:'rgba(245,240,235,0.92)', backdropFilter:'blur(8px)',
        position:'sticky', top:0, zIndex:100,
      }}>
        <Link href="/invitaciones" style={{ fontSize:'0.8125rem', color:'#6B5B4E', textDecoration:'none', fontWeight:500, display:'flex', alignItems:'center', gap:'0.375rem' }}>
          ← Volver
        </Link>
        <span style={{ fontSize:'0.875rem', fontWeight:700, color:'#1A1410', letterSpacing:'0.1em', textTransform:'uppercase' }}>
          Kompralo
        </span>
        <Link href="/login" style={{ fontSize:'0.8125rem', color:'#6B5B4E', textDecoration:'none', fontWeight:500 }}>
          Iniciar sesión
        </Link>
      </nav>

      <div style={{ padding:'clamp(2.5rem,8vw,4.5rem) clamp(1rem,4vw,2rem)' }}>

        {/* Header */}
        <div className="pr-anim" style={{ textAlign:'center', marginBottom:'3.25rem', maxWidth:'36rem', margin:'0 auto 3.25rem' }}>
          <p style={{ fontSize:'0.6875rem', fontWeight:700, letterSpacing:'0.2em', color:'#C5A880', textTransform:'uppercase', margin:'0 0 0.75rem' }}>
            Planes
          </p>
          <h1 style={{ fontSize:'clamp(1.75rem,5vw,2.5rem)', fontWeight:800, color:'#1A1410', margin:'0 0 1rem', lineHeight:1.15, fontFamily:'var(--font-playfair, Georgia, serif)' }}>
            Tu invitación digital, sin complicaciones
          </h1>
          <p style={{ color:'#6B5B4E', fontSize:'1rem', lineHeight:1.6, margin:0 }}>
            Elige el plan que mejor se adapte a tu evento. Pago único, sin suscripción.
          </p>
        </div>

        {/* Cards */}
        <div className="pr-cards-grid" style={{ maxWidth:'960px', margin:'0 auto' }}>
          <div className="pr-anim pr-d1"><ProductCard product={basic}   /></div>
          <div className="pr-anim pr-d2"><ProductCard product={premium} featured /></div>
          <div className="pr-anim pr-d3"><ProductCard product={deluxe}  /></div>
        </div>

        {/* Post-purchase microcopy */}
        <div style={{
          maxWidth:'960px', margin:'2.25rem auto 0',
          background:'#FDF8F2', border:'1px solid #E8E2DA',
          borderRadius:'0.875rem', padding:'1.25rem 1.5rem',
        }}>
          <div className="pr-trust-row">
            {[
              { icon:'🔒', text:'Pago seguro con Stripe' },
              { icon:'📧', text:'Acceso por correo inmediatamente después del pago' },
              { icon:'✏️', text:'Edita desde tu celular cuando quieras' },
              { icon:'💬', text:'Comparte por WhatsApp con tus invitados' },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.8125rem', color:'#6B5B4E' }}>
                <span>{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ textAlign:'center', marginTop:'1.5rem', fontSize:'0.8125rem', color:'#9B8878', lineHeight:1.5 }}>
          Pago único sin suscripción · Sin instalar apps · Soporte en español
        </p>

      </div>
    </main>
  );
}
