import type { Metadata } from 'next';
import Link from 'next/link';
import { availableProducts } from '@/domain/products';
import type { Product } from '@/domain/products';
import { CheckoutButton } from '@/components/checkout/CheckoutButton';
import { Reveal, Stagger, Item, HoverCard } from '@/components/public/Motion';

export const metadata: Metadata = {
  title: 'Planes para organizar tu evento — Kompralo',
  description: 'Elige cuánto quieres organizar desde un solo enlace. Basic $499, Premium $899 y Deluxe $1,499 MXN. Pago único.',
};

// ─── Tokens ───────────────────────────────────────────────────────────────────
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
} as const;

// ─── CSS ─────────────────────────────────────────────────────────────────────
function PageStyles() {
  return (
    <style>{`
      @keyframes pr2-fadeUp {
        from { opacity:0; transform:translateY(18px); }
        to   { opacity:1; transform:translateY(0); }
      }
      @media (prefers-reduced-motion: reduce) {
        .pr2-anim { animation:none !important; }
      }
      .pr2-anim { animation:pr2-fadeUp .5s cubic-bezier(0.65,0,.35,1) both; }
      .pr2-d1   { animation-delay:.08s; }
      .pr2-d2   { animation-delay:.16s; }

      .pr2-nav-link { transition:color .2s ease; }
      .pr2-nav-link:hover { color:#0F0C09 !important; }

      .pr2-cards-grid {
        display: grid;
        grid-template-columns: repeat(3,1fr);
        gap: 1.5rem;
        align-items: stretch;
      }
      @media (max-width:800px) {
        .pr2-cards-grid {
          grid-template-columns: 1fr;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
        }
      }

      @media (min-width:801px) {
        .pr2-featured-card {
          transform: scale(1.07);
          position: relative;
          z-index: 2;
        }
      }

      .pr2-trust-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.25rem;
        justify-content: center;
      }
    `}</style>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatPrice(centavos: number, currency: string): string {
  return new Intl.NumberFormat('es-MX', {
    style:'currency', currency:currency.toUpperCase(),
    minimumFractionDigits:0, maximumFractionDigits:0,
  }).format(centavos / 100);
}

const planMeta: Record<string, { ideal:string; highlight:string }> = {
  basic: {
    ideal:     'Una invitación clara y fácil de compartir',
    highlight: 'Para quien quiere una invitación elegante, clara y fácil de compartir.',
  },
  premium: {
    ideal:     'Más vendido · Recomendado para Bodas y XV años',
    highlight: 'Para organizar mejor tu evento con RSVP, galería, música, itinerario y más personalización.',
  },
  deluxe: {
    ideal:     'La experiencia más completa',
    highlight: 'Para eventos formales que necesitan una experiencia completa, StoryBook, hospedaje y más.',
  },
};

// ─── Feature list ─────────────────────────────────────────────────────────────
function FeatureList({ features, dark }: { features:string[]; dark?:boolean }) {
  return (
    <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:'.5rem' }}>
      {features.map((f) => (
        <li key={f} style={{ display:'flex', alignItems:'flex-start', gap:'.5rem', fontSize:'.875rem', color: dark ? '#C5B0A0' : T.mid, lineHeight:1.4 }}>
          <span style={{ color:T.gold, flexShrink:0, marginTop:'.15rem' }}>✓</span> {f}
        </li>
      ))}
    </ul>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product, featured }: { product:Product; featured?:boolean }) {
  const priceStr = formatPrice(product.price, product.currency);
  const meta = planMeta[product.id] ?? { ideal:'', highlight:'' };

  return (
    <HoverCard lift={featured ? 8 : 5} style={{ height:'100%' }} className={featured ? 'pr2-featured-card' : undefined}>
      <div style={{
        position:'relative', display:'flex', flexDirection:'column', height:'100%',
        background: featured ? T.dark : T.white,
        border: featured ? `2px solid ${T.gold}` : `1px solid ${T.border}`,
        borderRadius:'8px', padding:'2.25rem 1.75rem',
        boxShadow: featured
          ? `0 14px 56px rgba(184,150,106,0.22), 0 2px 0 rgba(184,150,106,0.25) inset`
          : '0 2px 12px rgba(15,12,9,0.04)',
      }}>
        {/* Popular badge */}
        {featured && (
          <div style={{
            position:'absolute', top:'-1px', left:'50%', transform:'translateX(-50%)',
            background:T.gold, color:T.dark,
            fontSize:'.6875rem', fontWeight:800, letterSpacing:0,
            padding:'.25rem 1.125rem', borderRadius:'0 0 .625rem .625rem', whiteSpace:'nowrap',
          }}>
            MÁS VENDIDO
          </div>
        )}

        {/* Ideal label */}
        {meta.ideal && (
          <p style={{ margin:'0 0 .375rem', fontSize:'.72rem', fontWeight:600, color: featured ? T.champagne : T.light, letterSpacing:0 }}>
            {meta.ideal}
          </p>
        )}

        {/* Plan name */}
        <h2 style={{ margin:'0 0 .375rem', fontSize:'1.625rem', fontWeight:700, color: featured ? '#F1E3C8' : T.dark, fontFamily:'var(--font-playfair, Georgia, serif)' }}>
          {product.name}
        </h2>

        {/* Highlight */}
        <p style={{ margin:'0 0 1.5rem', fontSize:'.875rem', color: featured ? '#C5B0A0' : T.mid, lineHeight:1.55, minHeight:'2.5em' }}>
          {meta.highlight || product.description}
        </p>

        {/* Price */}
        <div style={{ marginBottom:'1.625rem' }}>
          <span style={{ fontSize:'2.75rem', fontWeight:800, color: featured ? '#F1E3C8' : T.dark, lineHeight:1, fontFamily:'var(--font-playfair, Georgia, serif)' }}>
            {priceStr}
          </span>
          <span style={{ fontSize:'.875rem', color: featured ? '#C5B0A0' : T.light, marginLeft:'.375rem' }}>
            MXN / pago único
          </span>
        </div>

        {/* Feature list */}
        <div style={{ flex:1, marginBottom:'2.125rem' }}>
          <FeatureList features={product.features} dark={featured} />
        </div>

        {/* CTA — CheckoutButton is unchanged */}
        <CheckoutButton
          productId={product.id}
          label={`Comprar ${product.name}`}
          className={[
            'w-full py-3 rounded-md text-sm font-bold transition-opacity cursor-pointer text-center',
            featured
              ? 'bg-[#C4A962] text-[#0D0A07] hover:opacity-90'
              : 'bg-[#0D0A07] text-[#F1E3C8] hover:opacity-85',
          ].join(' ')}
        />
      </div>
    </HoverCard>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PreciosPage() {
  const [basic, premium, deluxe] = availableProducts;

  return (
    <main style={{ minHeight:'100dvh', background:T.ivory, fontFamily:'var(--font-inter, system-ui, sans-serif)', position:'relative' }}>
      <div className="paper-noise" />
      <PageStyles />

      {/* Sticky nav */}
      <nav style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'.875rem clamp(1.25rem,5vw,3rem)',
        borderBottom:`1px solid ${T.border}`,
        background:'rgba(250,247,242,0.92)', backdropFilter:'blur(14px)',
        position:'sticky', top:0, zIndex:100,
      }}>
        <Link href="/invitaciones" className="pr2-nav-link" style={{
          fontSize:'.8125rem', color:T.light, textDecoration:'none', fontWeight:500,
          display:'flex', alignItems:'center', gap:'.375rem',
        }}>
          ← Volver
        </Link>
        <span style={{ fontSize:'.6875rem', fontWeight:800, letterSpacing:0, textTransform:'uppercase', color:T.dark }}>
          Kompralo
        </span>
        <Link href="/login" className="pr2-nav-link" style={{ fontSize:'.8125rem', color:T.light, textDecoration:'none', fontWeight:500 }}>
          Iniciar sesión
        </Link>
      </nav>

      <div style={{ padding:'clamp(3rem,8vw,5rem) clamp(1.25rem,5vw,3rem)' }}>

        {/* Header */}
        <Reveal style={{ textAlign:'center', marginBottom:'3.5rem', maxWidth:'38rem', margin:'0 auto 3.5rem' }}>
          <p style={{ fontSize:'.6875rem', fontWeight:700, letterSpacing:0, color:T.gold, textTransform:'uppercase', margin:'0 0 .875rem', fontFamily:'var(--font-inter, system-ui, sans-serif)' }}>
            Planes
          </p>
          <h1 style={{
            fontSize:'3rem', fontWeight:700, color:T.dark,
            margin:'0 0 1.125rem', lineHeight:1.1,
            fontFamily:'var(--font-playfair, Georgia, serif)',
          }}>
            Organiza tu evento desde un solo enlace
          </h1>
          <p style={{ color:T.mid, fontSize:'1rem', lineHeight:1.65, margin:0 }}>
            Elige las herramientas que necesitas para compartir, confirmar y mantener informados a tus invitados.<br />Pago único, sin suscripción ni mensualidades.
          </p>
        </Reveal>

        {/* Cards */}
        <Stagger className="pr2-cards-grid" style={{ maxWidth:'1040px', margin:'0 auto' }} gap={0.12}>
          <Item><ProductCard product={basic}   /></Item>
          <Item><ProductCard product={premium} featured /></Item>
          <Item><ProductCard product={deluxe}  /></Item>
        </Stagger>

        {/* Post-purchase trust indicators block */}
        <Reveal delay={0.15} style={{ maxWidth:'1040px', margin:'2.5rem auto 0' }}>
          <div style={{
            background:T.cream, border:`1px solid ${T.border}`,
            borderRadius:'1rem', padding:'1.375rem 1.75rem',
          }}>
            <div className="pr2-trust-row">
              {[
                { icon:'🔒', text:'Pago seguro con Stripe' },
                { icon:'📧', text:'Después del pago recibirás acceso inmediato para editar tu invitación' },
                { icon:'💬', text:'Comparte tu link por WhatsApp con tus invitados' },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display:'flex', alignItems:'center', gap:'.5rem', fontSize:'.8125rem', color:T.mid, fontWeight:500 }}>
                  <span>{icon}</span> <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <p style={{ textAlign:'center', marginTop:'1.375rem', fontSize:'.78rem', color:T.light, lineHeight:1.6 }}>
            Pago único sin cargos adicionales · Sin instalar apps · Edita cuantas veces quieras
          </p>
        </Reveal>

      </div>
    </main>
  );
}
