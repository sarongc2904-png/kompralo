import type { Metadata } from 'next';
import Link from 'next/link';
import { SupabaseOrderRepository } from '@/domain/orders';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import { AccessFromSessionButton } from './AccessFromSessionButton';
import { ClearCartOnSuccess } from './ClearCartOnSuccess';
import { PurchaseTracker } from '@/components/pixel/PurchaseTracker';

export const metadata: Metadata = { title: 'Pago exitoso — Kompralo' };

// â”€â”€â”€ CSS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function PageStyles() {
  return (
    <style>{`
      @keyframes cs2-check {
        0%   { opacity:0; transform:scale(.5) rotate(-10deg); }
        70%  { transform:scale(1.08) rotate(2deg); }
        100% { opacity:1; transform:scale(1) rotate(0deg); }
      }
      @keyframes cs2-fadeUp {
        from { opacity:0; transform:translateY(18px); }
        to   { opacity:1; transform:translateY(0); }
      }
      @media (prefers-reduced-motion: reduce) {
        .cs2-check, .cs2-anim { animation:none !important; }
        .cs2-btn { transition:none !important; }
      }
      .cs2-check { animation:cs2-check .6s cubic-bezier(.22,1,.36,1) .1s both; }
      .cs2-anim  { animation:cs2-fadeUp .55s cubic-bezier(0.65,0,.35,1) both; }
      .cs2-d1    { animation-delay:.18s; }
      .cs2-d2    { animation-delay:.30s; }
      .cs2-d3    { animation-delay:.42s; }
      .cs2-d4    { animation-delay:.54s; }

      .cs2-btn {
        transition: transform .18s ease, box-shadow .18s ease, opacity .18s ease;
      }
      .cs2-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 28px rgba(15,12,9,0.12);
      }
      .cs2-btn:active { transform:translateY(0); }
    `}</style>
  );
}

// â”€â”€â”€ Order lookup â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface OrderSummary {
  planId:       string;
  amountTotal:  number;
  currency:     string;
  customerEmail:string | null;
  /** One entry per purchased invitation (multi-cart = N entries). */
  items:        { planId: string; amount: number }[];
  /** Test purchase (livemode=false) — no dispara Pixel Purchase. */
  isTest:       boolean;
}

async function tryGetOrder(sessionId:string|undefined): Promise<OrderSummary|null> {
  if (!sessionId) return null;
  try {
    const supabase  = createServiceRoleSupabaseClient();
    const orderRepo = new SupabaseOrderRepository(supabase);
    const orders    = await orderRepo.listBySessionId(sessionId);
    if (orders.length === 0) return null;
    const first = orders[0];
    return {
      planId:        first.planId,
      amountTotal:   orders.reduce((sum, o) => sum + o.amountTotal, 0),
      currency:      first.currency,
      customerEmail: first.customerEmail,
      items:         orders.map((o) => ({ planId: o.planId, amount: o.amountTotal })),
      isTest:        orders.some((o) => o.isTest),
    };
  } catch { return null; }
}

function formatPrice(centavos:number, currency:string) {
  return new Intl.NumberFormat('es-MX',{ style:'currency', currency:currency.toUpperCase(), minimumFractionDigits:0 }).format(centavos/100);
}

const planLabels: Record<string,string> = { basic:'Basic', premium:'Premium', deluxe:'Deluxe' };

// â”€â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface Props { searchParams: Promise<{ session_id?:string }>; }

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams;
  const order = await tryGetOrder(session_id);

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
  };

  return (
    <main style={{
      minHeight:'100dvh',
      background:`radial-gradient(ellipse at 50% 0%, rgba(196,169,98,0.08) 0%, transparent 55%), linear-gradient(160deg, #E8D7B8 0%, #F1E3C8 100%)`,
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      padding:'3rem 1.25rem',
      fontFamily:'var(--font-inter, system-ui, sans-serif)',
      textAlign:'center', gap:'1.5rem',
      position:'relative', overflow:'hidden',
    }}>
      <div className="paper-noise" />
      <PageStyles />
      <ClearCartOnSuccess />
      {order && session_id && (
        <PurchaseTracker
          sessionId={session_id}
          value={order.amountTotal / 100}
          isTest={order.isTest}
        />
      )}

      {/* Decorative label */}
      <div aria-hidden style={{
        position:'absolute', top:'2.5rem', left:'50%', transform:'translateX(-50%)',
        fontSize:'.6875rem', fontWeight:800, letterSpacing:'.22em', textTransform:'uppercase', color:T.gold,
        opacity:.6,
      }}>
        Kompralo
      </div>

      {/* Animated check */}
      <div className="cs2-check" style={{
        width:'4.75rem', height:'4.75rem', borderRadius:'50%',
        background:T.dark,
        display:'flex', alignItems:'center', justifyContent:'center',
        boxShadow:`0 16px 52px rgba(15,12,9,0.18)`,
        border:`2px solid rgba(196,169,98,0.35)`,
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M4 12.5L9.5 18L20 7" stroke="#C4A962" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Heading */}
      <div className="cs2-anim cs2-d1">
        <h1 style={{
          fontSize:'clamp(1.75rem,4.5vw,2.5rem)',
          fontWeight:700, color:T.dark, margin:'0 0 .5rem',
          fontFamily:'var(--font-playfair, Georgia, serif)',
        }}>
          ¡Pago recibido!
        </h1>
        {order && order.items.length > 1 ? (
          <div style={{ maxWidth:'28rem', margin:'0 auto' }}>
            <p style={{ color:T.mid, fontSize:'.9375rem', lineHeight:1.65, margin:'0 0 .75rem' }}>
              <strong style={{ color:T.dark }}>{order.items.length} invitaciones</strong> activadas por{' '}
              <strong style={{ color:T.dark }}>{formatPrice(order.amountTotal, order.currency)}</strong> MXN:
            </p>
            <ul style={{ listStyle:'none', padding:0, margin:0, textAlign:'left', display:'inline-block' }}>
              {order.items.map((item, i) => (
                <li key={i} style={{ color:T.mid, fontSize:'.875rem', lineHeight:1.9 }}>
                  ✓ Invitación {i + 1} — Plan <strong style={{ color:T.dark }}>{planLabels[item.planId] ?? item.planId}</strong>{' '}
                  ({formatPrice(item.amount, order.currency)})
                </li>
              ))}
            </ul>
            <p style={{ color:T.mid, fontSize:'.8125rem', lineHeight:1.6, margin:'.75rem 0 0' }}>
              Tu correo incluye un enlace de edición para cada una.
            </p>
          </div>
        ) : order ? (
          <p style={{ color:T.mid, fontSize:'.9375rem', lineHeight:1.65, maxWidth:'28rem', margin:'0 auto' }}>
            Plan <strong style={{ color:T.dark }}>{planLabels[order.planId] ?? order.planId}</strong> activado exitosamente por{' '}
            <strong style={{ color:T.dark }}>{formatPrice(order.amountTotal, order.currency)}</strong> MXN. Tu invitación digital se está preparando.
          </p>
        ) : (
          <p style={{ color:T.mid, fontSize:'.9375rem', lineHeight:1.65, maxWidth:'28rem', margin:'0 auto' }}>
            Tu pago fue procesado correctamente. Tu invitación se está preparando automáticamente en segundo plano.
          </p>
        )}
      </div>

      {/* Next steps card */}
      <div className="cs2-anim cs2-d2" style={{
        background:T.white, border:`1px solid ${T.border}`,
        borderRadius:'1.25rem', padding:'1.75rem 2rem',
        maxWidth:'28rem', width:'100%', textAlign:'left',
        boxShadow:'0 4px 24px rgba(15,12,9,0.05)',
      }}>
        <p style={{ margin:'0 0 1.25rem', fontSize:'.6875rem', fontWeight:800, letterSpacing:'.18em', textTransform:'uppercase', color:T.gold }}>
          ¿QUÉ SIGUE?
        </p>

        {[
          { n:'1', icon:'\u{1F4DD}', text:'Personaliza tu invitación: nombres, fecha, lugar y todo lo que necesites' },
          { n:'2', icon:'\u{1F4E4}', text:'Comparte el enlace con tus invitados por WhatsApp' },
          {
            n:'3',
            icon:'\u{1F4E7}',
            text: order?.customerEmail
              ? `Revisa tu correo en ${order.customerEmail} y crea tu contraseña para acceder siempre que quieras`
              : 'Revisa tu correo y crea tu contraseña para acceder siempre que quieras',
          },
        ].map(({ n, icon, text }) => (
          <div key={n} style={{ display:'flex', alignItems:'flex-start', gap:'.875rem', marginBottom: n !== '3' ? '1rem' : 0 }}>
            <div style={{
              width:'1.75rem', height:'1.75rem', borderRadius:'50%', flexShrink:0,
              background:T.dark, display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'.6875rem', fontWeight:800, color:T.gold,
            }}>{n}</div>
            <div style={{ display:'flex', alignItems:'center', gap:'.5rem', paddingTop:'.2rem' }}>
              <span style={{ fontSize:'1rem' }}>{icon}</span>
              <span style={{ fontSize:'.875rem', color:T.mid, lineHeight:1.45 }}>{text}</span>
            </div>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div className="cs2-anim cs2-d3" style={{ display:'flex', gap:'.75rem', flexWrap:'wrap', justifyContent:'center' }}>
        <AccessFromSessionButton sessionId={session_id} className="cs2-btn" style={{
          display:'inline-block', padding:'.95rem 2.25rem',
          background:T.dark, color:'#F1E3C8',
          borderRadius:'.625rem', fontSize:'.875rem', fontWeight:700, textDecoration:'none',
        }}>
          {'Personalizar mi invitación \u2192'}
        </AccessFromSessionButton>
        <Link href="/login" className="cs2-btn" style={{
          display:'inline-block', padding:'.875rem 2rem',
          background:'transparent', color:T.dark,
          borderRadius:'.625rem', fontSize:'.875rem', fontWeight:600,
          textDecoration:'none', border:`1px solid ${T.border}`,
        }}>
          {'Ya tengo contraseña \u2192 Iniciar sesión'}
        </Link>
      </div>
      <div className="cs2-anim cs2-d4" style={{ marginTop:'.5rem' }}>
        <p style={{ fontSize:'.78rem', color:T.light, margin:0 }}>
          Te enviamos un solo correo de acceso. Si no aparece, revisa spam o escríbenos a soporte.
        </p>
        <p style={{ fontSize:'.78rem', color:T.light, margin:'.35rem 0 0' }}>
          ¿Perdiste tu acceso?{' '}
          <Link href="/recuperar-acceso" style={{ color:T.gold, fontWeight:700, textDecoration:'none' }}>
            Recupéralo aquí →
          </Link>
        </p>
      </div>
    </main>
  );
}
