import type { Metadata } from 'next';
import { availableProducts } from '@/domain/products';
import { Reveal } from '@/components/public/Motion';
import { PlanSelector } from '@/components/plans/PlanSelector';
import { ExitIntentModal } from '@/components/email/ExitIntentModal';
import { MultiEventCart } from '@/components/cart/MultiEventCart';
import { InvitacionesHeader } from '@/components/public/InvitacionesHeader';
import { InvitacionesFooter } from '@/components/public/InvitacionesFooter';

export const metadata: Metadata = {
  title: 'Planes de invitaciones digitales de boda | Kompralo',
  description: 'Elige entre Basic $499, Premium $899 y Deluxe $1,499 MXN. Invitaciones digitales de boda con pago único, sin apps y listas para WhatsApp.',
};

// Oculta la sección multi-cart hasta nuevo aviso: con AVAILABLE_EVENT_TYPES
// limitado a boda, las cards + drawer ya cubren pedidos múltiples.
const SHOW_MULTI_CART = process.env.NEXT_PUBLIC_SHOW_MULTI_CART === 'true';

const T = {
  crema:  'var(--site-color-crema)',
  blanco: 'var(--site-color-blanco)',
  marron: 'var(--site-color-marron)',
  rosa:   'var(--site-color-rosa-antiguo)',
  border: 'var(--site-color-border-subtle)',
} as const;

function PageStyles() {
  return (
    <style>{`
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
    <main style={{ minHeight:'100dvh', background:T.crema, fontFamily:'var(--site-font-sans)', position:'relative' }}>
      <PageStyles />

      <InvitacionesHeader />

      <div style={{ padding:'clamp(3rem,8vw,5rem) clamp(1.25rem,5vw,3rem)' }}>

        {/* Header */}
        <Reveal style={{ textAlign:'center', marginBottom:'3.5rem', maxWidth:'38rem', margin:'0 auto 3.5rem' }}>
          <p className="site-eyebrow">Planes</p>
          <h1 className="site-h1" style={{ margin:'0 0 1.125rem', fontSize:'clamp(2.25rem,5vw,3rem)' }}>
            Elige cómo quieres organizar tu boda por WhatsApp
          </h1>
          <p style={{ color:T.marron, fontSize:'1rem', lineHeight:1.65, margin:0 }}>
            Tres planes con pago único para compartir ubicación, horarios, confirmaciones y detalles importantes en un solo link.
          </p>
        </Reveal>

        {/* Interactive plan grid + inline cart */}
        <PlanSelector products={availableProducts} featuredId="premium" />
        <ExitIntentModal />

        {/* Multi-event cart */}
        {SHOW_MULTI_CART && (
        <Reveal delay={0.1} style={{ maxWidth: '1040px', margin: '3rem auto 0' }}>
          <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: '2.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <p className="site-eyebrow">¿Tienes más de un evento?</p>
              <h2 className="site-h2" style={{ fontSize:'clamp(1.5rem,3vw,1.875rem)' }}>
                Arma tu pedido con múltiples invitaciones
              </h2>
            </div>
            <div style={{ background: T.blanco, border: `1px solid ${T.border}`, borderRadius: '1rem', overflow: 'hidden', padding: '2rem' }}>
              <MultiEventCart />
            </div>
          </div>
        </Reveal>
        )}

        {/* Trust indicators */}
        <Reveal delay={0.15} style={{ maxWidth:'1040px', margin:'2.5rem auto 0' }}>
          <div style={{
            background:T.crema, border:`1px solid ${T.border}`,
            borderRadius:'1rem', padding:'1.375rem 1.75rem',
          }}>
            <div className="pr2-trust-row">
              {[
                { icon:'🔒', text:'Pago seguro' },
                { icon:'🏆', text:'Pago único, sin mensualidades' },
                { icon:'📧', text:'Acceso para personalizar tu invitación después del pago' },
                { icon:'💬', text:'Lista para compartir por WhatsApp' },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display:'flex', alignItems:'center', gap:'.5rem', fontSize:'.8125rem', color:T.marron, fontWeight:500 }}>
                  <span>{icon}</span> <span>{text}</span>
                </div>
              ))}
            </div>
            <div className="pr2-trust-row" style={{ marginTop:'.875rem', gap:'.5rem' }}>
              {['Visa', 'Mastercard', 'AMEX', 'OXXO', 'SPEI'].map((m) => (
                <span key={m} style={{
                  background:T.blanco, border:`1px solid ${T.border}`, borderRadius:'4px',
                  padding:'2px 10px', fontSize:'.6875rem', fontWeight:500, color:T.marron, letterSpacing:'.02em',
                }}>
                  {m}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <p style={{ textAlign:'center', marginTop:'1.375rem', fontSize:'.78rem', color:T.rosa, lineHeight:1.6 }}>
            Pago único · Sin mensualidades · Fácil de compartir por WhatsApp
          </p>
        </Reveal>

      </div>

      <InvitacionesFooter />
    </main>
  );
}
