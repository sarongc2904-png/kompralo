import type { Metadata } from 'next';
import Link from 'next/link';
import { availableProducts } from '@/domain/products';
import type { Product } from '@/domain/products';
import { CheckoutButton } from '@/components/checkout/CheckoutButton';
import { Reveal, Stagger, Item, HoverCard } from '@/components/public/Motion';

export const metadata: Metadata = {
  title: 'Planes y Precios — Kompralo',
  description: 'Elige el plan ideal para tu invitación digital. Basic, Premium o Deluxe. Desde $499 MXN.',
};

// ─── Tokens ───────────────────────────────────────────────────────────────────
const T = {
  ivory:     '#FAF7F2',
  cream:     '#F2EBD8',
  dark:      '#0F0C09',
  mid:       '#5C4A37',
  light:     '#9B8165',
  gold:      '#B8966A',
  champagne: '#D4B896',
  white:     '#FFFFFF',
  border:    '#E5DDD2',
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

      .pr2-trust-row {
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
    style:'currency', currency:currency.toUpperCase(),
    minimumFractionDigits:0, maximumFractionDigits:0,
  }).format(centavos / 100);
}

const planMeta: Record<string, { ideal:string; highlight:string }> = {
  basic: {
    ideal:     'Ideal para bautizos, baby showers y cumpleaños',
    highlight: 'Lo esencial para una invitación bonita y funcional.',
  },
  premium: {
    ideal:     'Ideal para bodas y XV años · el más elegido',
    highlight: 'Galería, música, itinerario y mapa incluidos.',
  },
  deluxe: {
    ideal:     'La experiencia completa para bodas formales',
    highlight: 'StoryBook animado, padrinos, hospedaje y más.',
  },
};

// ─── Feature list ─────────────────────────────────────────────────────────────
function FeatureList({ features, dark }: { features:string[]; dark?:boolean }) {
  return (
    <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:'.5rem' }}>
      {features.map((f) => (
        <li key={f} style={{ display:'flex', alignItems:'flex-start', gap:'.5rem', fontSize:'.875rem', color: dark ? '#C5B0A0' : T.mid }}>
          <span style={{ color:T.gold, flexShrink:0, marginTop:'.1rem' }}>✓</span> {f}
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
    <HoverCard lift={featured ? 8 : 5} style={{ height:'100%' }}>
      <div style={{
        position:'relative', display:'flex', flexDirection:'column', height:'100%',
        background: featured ? T.dark : T.ivory,
        border: featured ? `2px solid ${T.gold}` : `1px solid ${T.border}`,
        borderRadius:'1.25rem', padding:'2.25rem 1.75rem',
        boxShadow: featured
          ? `0 14px 56px rgba(184,150,106,0.22), 0 2px 0 rgba(184,150,106,0.25) inset`
          : '0 2px 12px rgba(15,12,9,0.06)',
      }}>
        {/* Popular badge */}
        {featured && (
          <div style={{
            position:'absolute', top:'-1px', left:'50%', transform:'translateX(-50%)',
            background:T.gold, color:T.dark,
            fontSize:'.6875rem', fontWeight:800, letterSpacing:'.1em',
            padding:'.25rem 1.125rem', borderRadius:'0 0 .625rem .625rem', whiteSpace:'nowrap',
          }}>
            MÁS POPULAR
          </div>
        )}

        {/* Ideal label */}
        {meta.ideal && (
          <p style={{ margin:'0 0 .375rem', fontSize:'.72rem', fontWeight:600, color: featured ? T.champagne : T.light, letterSpacing:'.04em' }}>
            {meta.ideal}
          </p>
        )}

        {/* Plan name */}
        <h2 style={{ margin:'0 0 .375rem', fontSize:'1.5rem', fontWeight:700, color: featured ? '#F5EDD8' : T.dark, fontFamily:'var(--font-playfair, Georgia, serif)' }}>
          {product.name}
        </h2>

        {/* Highlight */}
        <p style={{ margin:'0 0 1.5rem', fontSize:'.8125rem', color: featured ? '#C5B0A0' : T.mid, lineHeight:1.55, minHeight:'2.5em' }}>
          {meta.highlight || product.description}
        </p>

        {/* Price */}
        <div style={{ marginBottom:'1.625rem' }}>
          <span style={{ fontSize:'2.625rem', fontWeight:800, color: featured ? '#F5EDD8' : T.dark, lineHeight:1, fontFamily:'var(--font-playfair, Georgia, serif)' }}>
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
            'w-full py-3 rounded-xl text-sm font-bold transition-opacity',
            featured
              ? 'bg-[#B8966A] text-[#0F0C09] hover:opacity-90'
              : 'bg-[#0F0C09] text-[#F5EDD8] hover:opacity-85',
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
    <main style={{ minHeight:'100dvh', background:T.ivory, fontFamily:'var(--font-inter, system-ui, sans-serif)' }}>
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
        <span style={{ fontSize:'.6875rem', fontWeight:800, letterSpacing:'.22em', textTransform:'uppercase', color:T.dark }}>
          Kompralo
        </span>
        <Link href="/login" className="pr2-nav-link" style={{ fontSize:'.8125rem', color:T.light, textDecoration:'none', fontWeight:500 }}>
          Iniciar sesión
        </Link>
      </nav>

      <div style={{ padding:'clamp(3rem,8vw,5rem) clamp(1.25rem,5vw,3rem)' }}>

        {/* Header */}
        <Reveal style={{ textAlign:'center', marginBottom:'3.5rem', maxWidth:'38rem', margin:'0 auto 3.5rem' }}>
          <p style={{ fontSize:'.6875rem', fontWeight:700, letterSpacing:'.22em', color:T.gold, textTransform:'uppercase', margin:'0 0 .875rem', fontFamily:'var(--font-inter, system-ui, sans-serif)' }}>
            Planes
          </p>
          <h1 style={{
            fontSize:'clamp(1.875rem,5.5vw,3rem)', fontWeight:700, color:T.dark,
            margin:'0 0 1.125rem', lineHeight:1.1,
            fontFamily:'var(--font-playfair, Georgia, serif)',
          }}>
            Tu invitación digital, sin complicaciones
          </h1>
          <p style={{ color:T.mid, fontSize:'1rem', lineHeight:1.65, margin:0 }}>
            Elige el plan que mejor se adapte a tu evento.<br />Pago único, sin suscripción.
          </p>
        </Reveal>

        {/* Cards */}
        <Stagger className="pr2-cards-grid" style={{ maxWidth:'1040px', margin:'0 auto' }} gap={0.12}>
          <Item><ProductCard product={basic}   /></Item>
          <Item><ProductCard product={premium} featured /></Item>
          <Item><ProductCard product={deluxe}  /></Item>
        </Stagger>

        {/* Post-purchase microcopy block */}
        <Reveal delay={0.15} style={{ maxWidth:'1040px', margin:'2.5rem auto 0' }}>
          <div style={{
            background:T.cream, border:`1px solid ${T.border}`,
            borderRadius:'1rem', padding:'1.375rem 1.75rem',
          }}>
            <div className="pr2-trust-row">
              {[
                { icon:'🔒', text:'Pago seguro con Stripe' },
                { icon:'📧', text:'Acceso inmediato al correo después del pago' },
                { icon:'✏️', text:'Edita desde tu celular cuando quieras' },
                { icon:'💬', text:'Comparte el link por WhatsApp con tus invitados' },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display:'flex', alignItems:'center', gap:'.5rem', fontSize:'.8125rem', color:T.mid }}>
                  <span>{icon}</span> <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <p style={{ textAlign:'center', marginTop:'1.375rem', fontSize:'.78rem', color:T.light, lineHeight:1.6 }}>
            Pago único sin suscripción · Sin instalar apps · Soporte en español
          </p>
        </Reveal>

      </div>
    </main>
  );
}
