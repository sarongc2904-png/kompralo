import type { Metadata } from 'next';
import Link from 'next/link';
import { availableProducts } from '@/domain/products';
import { Reveal } from '@/components/public/Motion';
import { PlanSelector } from '@/components/plans/PlanSelector';
import { ExitIntentModal } from '@/components/email/ExitIntentModal';

export const metadata: Metadata = {
  title: 'Planes para organizar tu evento — Kompralo',
  description: 'Elige cuánto quieres organizar desde un solo enlace. Basic $499, Premium $899 y Deluxe $1,499 MXN. Pago único.',
};

const T = {
  ivory:     '#E8D7B8',
  cream:     '#F1E3C8',
  dark:      '#0D0A07',
  mid:       '#1A1612',
  light:     '#6B4A35',
  gold:      '#C4A962',
  champagne: '#EAD7A3',
  border:    '#EAD7A3',
} as const;

function PageStyles() {
  return (
    <style>{`
      .pr2-nav-link { transition:color .2s ease; }
      .pr2-nav-link:hover { color:#0F0C09 !important; }
      .pr2-trust-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.25rem;
        justify-content: center;
      }
    `}</style>
  );
}

export default function PreciosPage() {
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
        <span style={{ fontSize:'.6875rem', fontWeight:800, textTransform:'uppercase', color:T.dark }}>
          Kompralo
        </span>
        <Link href="/login" className="pr2-nav-link" style={{ fontSize:'.8125rem', color:T.light, textDecoration:'none', fontWeight:500 }}>
          Iniciar sesión
        </Link>
      </nav>

      <div style={{ padding:'clamp(3rem,8vw,5rem) clamp(1.25rem,5vw,3rem)' }}>

        {/* Header */}
        <Reveal style={{ textAlign:'center', marginBottom:'3.5rem', maxWidth:'38rem', margin:'0 auto 3.5rem' }}>
          <p style={{ fontSize:'.6875rem', fontWeight:700, color:T.gold, textTransform:'uppercase', margin:'0 0 .875rem', fontFamily:'var(--font-inter, system-ui, sans-serif)' }}>
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

        {/* Interactive plan grid + inline cart */}
        <PlanSelector products={availableProducts} featuredId="premium" />
        <ExitIntentModal />

        {/* Trust indicators */}
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
