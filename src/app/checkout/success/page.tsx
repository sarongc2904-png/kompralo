import type { Metadata } from 'next';
import Link from 'next/link';
import { SupabaseOrderRepository } from '@/domain/orders';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Pago exitoso — Kompralo' };

// ─── CSS ─────────────────────────────────────────────────────────────────────
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

// ─── Order lookup ─────────────────────────────────────────────────────────────
interface OrderSummary {
  planId:       string;
  amountTotal:  number;
  currency:     string;
  customerEmail:string | null;
}

async function tryGetOrder(sessionId:string|undefined): Promise<OrderSummary|null> {
  if (!sessionId) return null;
  try {
    const supabase  = createServiceRoleSupabaseClient();
    const orderRepo = new SupabaseOrderRepository(supabase);
    const order     = await orderRepo.getBySessionId(sessionId);
    if (!order) return null;
    return { planId:order.planId, amountTotal:order.amountTotal, currency:order.currency, customerEmail:order.customerEmail };
  } catch { return null; }
}

function formatPrice(centavos:number, currency:string) {
  return new Intl.NumberFormat('es-MX',{ style:'currency', currency:currency.toUpperCase(), minimumFractionDigits:0 }).format(centavos/100);
}

const planLabels: Record<string,string> = { basic:'Basic', gold:'Premium', platinum:'Deluxe' };

// ─── Page ─────────────────────────────────────────────────────────────────────
interface Props { searchParams: Promise<{ session_id?:string }>; }

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams;
  const order = await tryGetOrder(session_id);

  const T = { ivory:'#FAF7F2', dark:'#0F0C09', mid:'#5C4A37', light:'#9B8165', gold:'#B8966A', border:'#E5DDD2', cream:'#F2EBD8', white:'#FFFFFF' };

  return (
    <main style={{
      minHeight:'100dvh',
      background:`radial-gradient(ellipse at 50% 0%, rgba(184,150,106,0.08) 0%, transparent 55%), linear-gradient(160deg, #FAF7F2 0%, #F2EBD8 100%)`,
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      padding:'3rem 1.25rem',
      fontFamily:'var(--font-inter, system-ui, sans-serif)',
      textAlign:'center', gap:'1.5rem',
      position:'relative', overflow:'hidden',
    }}>
      <div className="paper-noise" />
      <PageStyles />

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
        border:`2px solid rgba(184,150,106,0.35)`,
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M4 12.5L9.5 18L20 7" stroke="#B8966A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
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
        {order ? (
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
          Pasos a seguir
        </p>

        {[
          { n:'1', icon:'📧', text: order?.customerEmail ? `Revisa tu correo de confirmación en ${order.customerEmail}` : 'Revisa tu bandeja de entrada' },
          { n:'2', icon:'🔗', text:'Accede haciendo clic en el enlace mágico de acceso (Magic Link) que te enviamos' },
          { n:'3', icon:'✏️', text:'Entra a la sección de edición para personalizar la fecha, fotos e información' },
          { n:'4', icon:'💬', text:'Copia el link personalizado y compártelo con tus invitados por WhatsApp' },
        ].map(({ n, icon, text }) => (
          <div key={n} style={{ display:'flex', alignItems:'flex-start', gap:'.875rem', marginBottom: n !== '4' ? '1rem' : 0 }}>
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
        <Link href="/login" className="cs2-btn" style={{
          display:'inline-block', padding:'.875rem 2rem',
          background:T.dark, color:'#F5EDD8',
          borderRadius:'.625rem', fontSize:'.875rem', fontWeight:700, textDecoration:'none',
        }}>
          Iniciar sesión →
        </Link>
        <Link href="/cliente" className="cs2-btn" style={{
          display:'inline-block', padding:'.875rem 2rem',
          background:T.white, color:T.dark,
          borderRadius:'.625rem', fontSize:'.875rem', fontWeight:600,
          textDecoration:'none', border:`1px solid ${T.border}`,
        }}>
          Ver mis invitaciones
        </Link>
      </div>

      <div className="cs2-anim cs2-d4" style={{ marginTop:'.5rem' }}>
        <p style={{ fontSize:'.78rem', color:T.light, margin:0 }}>
          ¿No llegó el correo de acceso? Revisa tu bandeja de spam o escríbenos a soporte.
        </p>
      </div>
    </main>
  );
}
