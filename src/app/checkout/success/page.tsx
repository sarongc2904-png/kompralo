import type { Metadata } from 'next';
import Link from 'next/link';
import { SupabaseOrderRepository } from '@/domain/orders';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Pago exitoso — Kompralo' };

// ─── CSS ─────────────────────────────────────────────────────────────────────
function PageStyles() {
  return (
    <style>{`
      @keyframes cs-pop {
        from { opacity:0; transform:scale(.8) translateY(12px); }
        to   { opacity:1; transform:scale(1) translateY(0); }
      }
      @keyframes cs-fadeUp {
        from { opacity:0; transform:translateY(16px); }
        to   { opacity:1; transform:translateY(0); }
      }
      @media (prefers-reduced-motion: reduce) {
        .cs-anim, .cs-pop { animation:none !important; }
        .cs-btn { transition:none !important; }
      }
      .cs-pop   { animation: cs-pop .5s cubic-bezier(.34,1.56,.64,1) both; }
      .cs-anim  { animation: cs-fadeUp .45s ease both; }
      .cs-d1    { animation-delay:.12s; }
      .cs-d2    { animation-delay:.22s; }
      .cs-d3    { animation-delay:.32s; }
      .cs-d4    { animation-delay:.42s; }

      .cs-btn {
        transition: transform .15s ease, box-shadow .15s ease;
      }
      .cs-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(26,20,16,0.16);
      }
      .cs-btn:active { transform: translateY(0); }

      .cs-step-row {
        display: flex;
        flex-direction: column;
        gap: .625rem;
      }
    `}</style>
  );
}

// ─── Order lookup ─────────────────────────────────────────────────────────────
interface OrderSummary {
  planId:        string;
  invitationId:  string | null;
  amountTotal:   number;
  currency:      string;
  customerEmail: string | null;
}

async function tryGetOrder(sessionId: string | undefined): Promise<OrderSummary | null> {
  if (!sessionId) return null;
  try {
    const supabase  = createServiceRoleSupabaseClient();
    const orderRepo = new SupabaseOrderRepository(supabase);
    const order     = await orderRepo.getBySessionId(sessionId);
    if (!order) return null;
    return {
      planId:        order.planId,
      invitationId:  order.invitationId,
      amountTotal:   order.amountTotal,
      currency:      order.currency,
      customerEmail: order.customerEmail,
    };
  } catch {
    return null;
  }
}

function formatPrice(centavos: number, currency: string): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency', currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(centavos / 100);
}

const planLabels: Record<string, string> = {
  basic:    'Basic',
  gold:     'Premium',
  platinum: 'Deluxe',
};

// ─── Next steps ───────────────────────────────────────────────────────────────
function NextSteps({ email }: { email?: string | null }) {
  return (
    <div className="cs-anim cs-d3" style={{
      background:'#FDF8F2', border:'1px solid #E8E2DA',
      borderRadius:'0.875rem', padding:'1.25rem 1.375rem',
      textAlign:'left', maxWidth:'26rem', width:'100%',
    }}>
      <p style={{ margin:'0 0 0.875rem', fontSize:'0.8125rem', fontWeight:700, color:'#1A1410', letterSpacing:'0.04em', textTransform:'uppercase' }}>
        Próximos pasos
      </p>
      <div className="cs-step-row">
        {[
          { n:'1', icon:'📧', text: email ? `Revisa tu correo en ${email}` : 'Revisa tu correo electrónico' },
          { n:'2', icon:'🔗', text:'Haz clic en el enlace de acceso que te enviamos' },
          { n:'3', icon:'✏️', text:'Edita tu invitación con tu nombre, fecha y fotos' },
          { n:'4', icon:'💬', text:'Comparte el link por WhatsApp con todos tus invitados' },
        ].map(({ n, icon, text }) => (
          <div key={n} style={{ display:'flex', alignItems:'flex-start', gap:'0.75rem' }}>
            <div style={{
              width:'1.625rem', height:'1.625rem', borderRadius:'50%', flexShrink:0,
              background:'#1A1410', display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'0.75rem', color:'#C5A880', fontWeight:800,
            }}>{n}</div>
            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', paddingTop:'0.1875rem' }}>
              <span style={{ fontSize:'1rem' }}>{icon}</span>
              <span style={{ fontSize:'0.8125rem', color:'#4B3A2C', lineHeight:1.45 }}>{text}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams;
  const order = await tryGetOrder(session_id);

  return (
    <main style={{
      minHeight:'100dvh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      background:'linear-gradient(160deg, #F9F3EC 0%, #F5F0EB 100%)',
      padding:'2.5rem 1rem',
      fontFamily:'var(--font-inter, system-ui, sans-serif)',
      textAlign:'center',
      gap:'1.25rem',
      position:'relative', overflow:'hidden',
    }}>
      <PageStyles />

      {/* Decorative blob */}
      <div aria-hidden style={{
        position:'absolute', top:'-80px', right:'-80px', width:'300px', height:'300px', borderRadius:'50%',
        background:'radial-gradient(circle, rgba(197,168,128,0.1) 0%, transparent 70%)', pointerEvents:'none',
      }} />

      {/* Check icon */}
      <div className="cs-pop" style={{
        width:'4.5rem', height:'4.5rem', borderRadius:'50%',
        background:'#1A1410', display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:'1.875rem', boxShadow:'0 12px 40px rgba(26,20,16,0.2)',
      }}>
        ✓
      </div>

      <div className="cs-anim cs-d1">
        <h1 style={{ fontSize:'clamp(1.5rem,4vw,2rem)', fontWeight:800, color:'#1A1410', margin:'0 0 0.5rem', fontFamily:'var(--font-playfair, Georgia, serif)' }}>
          ¡Pago recibido!
        </h1>

        {order ? (
          <p style={{ color:'#6B5B4E', fontSize:'0.9375rem', lineHeight:1.6, maxWidth:'26rem', margin:0 }}>
            Plan <strong style={{ color:'#1A1410' }}>{planLabels[order.planId] ?? order.planId}</strong> activado
            por <strong style={{ color:'#1A1410' }}>{formatPrice(order.amountTotal, order.currency)}</strong> MXN.
          </p>
        ) : (
          <p style={{ color:'#6B5B4E', fontSize:'0.9375rem', lineHeight:1.6, maxWidth:'26rem', margin:0 }}>
            Tu pago fue procesado. Tu invitación estará lista en breve.
          </p>
        )}
      </div>

      {/* Next steps */}
      <NextSteps email={order?.customerEmail} />

      {/* CTAs */}
      <div className="cs-anim cs-d4" style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap', justifyContent:'center' }}>
        <Link href="/login" className="cs-btn" style={{
          display:'inline-block', padding:'0.75rem 1.625rem',
          background:'#1A1410', color:'#F5EDD8',
          borderRadius:'0.625rem', fontSize:'0.875rem', fontWeight:700, textDecoration:'none',
        }}>
          Iniciar sesión →
        </Link>
        <Link href="/cliente" className="cs-btn" style={{
          display:'inline-block', padding:'0.75rem 1.625rem',
          background:'#FFFFFF', color:'#1A1410',
          borderRadius:'0.625rem', fontSize:'0.875rem', fontWeight:600,
          textDecoration:'none', border:'1px solid #D4C9BC',
        }}>
          Ver mis invitaciones
        </Link>
      </div>

      <p style={{ fontSize:'0.78rem', color:'#9B8878', margin:0 }}>
        ¿No llegó el correo? Revisa spam o escríbenos.
      </p>
    </main>
  );
}
