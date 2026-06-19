import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Invitaciones Digitales Editables — Kompralo',
  description:
    'Crea tu invitación digital para boda, XV años, bautizo, baby shower o cumpleaños. Edítala en línea y compártela por WhatsApp. Desde $499 MXN.',
};

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:     '#F5F0EB',
  dark:   '#1A1410',
  mid:    '#6B5B4E',
  light:  '#9B8878',
  gold:   '#C5A880',
  white:  '#FFFFFF',
  border: '#E8E2DA',
  cream:  '#FDF8F2',
} as const;

// ─── Global page CSS (animations + hover states) ─────────────────────────────
function PageStyles() {
  return (
    <style>{`
      /* ── Keyframes ─────────────────────────────────── */
      @keyframes kp-fadeUp {
        from { opacity:0; transform:translateY(20px); }
        to   { opacity:1; transform:translateY(0); }
      }
      @keyframes kp-float {
        0%,100% { transform:translateY(0) rotate(-2deg); }
        50%      { transform:translateY(-14px) rotate(-2deg); }
      }
      @keyframes kp-badge-a {
        0%,100% { transform:translateY(0); }
        50%      { transform:translateY(-7px); }
      }
      @keyframes kp-badge-b {
        0%,100% { transform:translateY(0); }
        50%      { transform:translateY(-5px); }
      }
      @keyframes kp-badge-c {
        0%,100% { transform:translateY(0); }
        50%      { transform:translateY(-9px); }
      }

      /* ── Prefers reduced motion ────────────────────── */
      @media (prefers-reduced-motion: reduce) {
        .kp-anim, .kp-float, .kp-badge-a, .kp-badge-b, .kp-badge-c {
          animation: none !important;
        }
        .kp-hover-lift, .kp-plan-card, .kp-step-card, .kp-event-card, .kp-benefit-card {
          transition: none !important;
        }
      }

      /* ── Reveal ────────────────────────────────────── */
      .kp-anim  { animation: kp-fadeUp .55s ease both; }
      .kp-d1    { animation-delay:.08s; }
      .kp-d2    { animation-delay:.16s; }
      .kp-d3    { animation-delay:.24s; }
      .kp-d4    { animation-delay:.32s; }
      .kp-d5    { animation-delay:.40s; }
      .kp-d6    { animation-delay:.48s; }

      /* ── Phone ─────────────────────────────────────── */
      .kp-float   { animation: kp-float 5.5s ease-in-out infinite; }
      .kp-badge-a { animation: kp-badge-a 4s ease-in-out infinite; }
      .kp-badge-b { animation: kp-badge-b 5s 1s ease-in-out infinite; }
      .kp-badge-c { animation: kp-badge-c 4.5s .5s ease-in-out infinite; }

      /* ── Card hovers ───────────────────────────────── */
      .kp-hover-lift {
        transition: transform .2s ease, box-shadow .2s ease;
      }
      .kp-hover-lift:hover {
        transform: translateY(-4px);
        box-shadow: 0 14px 42px rgba(26,20,16,0.14);
      }
      .kp-plan-card {
        transition: transform .25s ease, box-shadow .25s ease;
      }
      .kp-plan-card:hover {
        transform: translateY(-6px);
        box-shadow: 0 18px 52px rgba(26,20,16,0.16);
      }
      .kp-plan-card-dark:hover {
        box-shadow: 0 22px 60px rgba(197,168,128,0.25);
      }
      .kp-step-card {
        transition: transform .2s ease;
      }
      .kp-step-card:hover { transform: translateY(-3px); }
      .kp-event-card {
        transition: transform .2s ease, box-shadow .2s ease;
      }
      .kp-event-card:hover {
        transform: translateY(-4px) scale(1.02);
        box-shadow: 0 12px 32px rgba(26,20,16,0.12);
      }
      .kp-benefit-card {
        transition: background .2s ease, border-color .2s ease, transform .2s ease;
      }
      .kp-benefit-card:hover {
        background: rgba(255,255,255,0.08) !important;
        border-color: rgba(197,168,128,0.4) !important;
        transform: translateY(-2px);
      }
      .kp-btn {
        transition: transform .15s ease, opacity .15s ease, box-shadow .15s ease;
      }
      .kp-btn:hover {
        transform: translateY(-2px);
        opacity: .92;
        box-shadow: 0 8px 24px rgba(26,20,16,0.18);
      }
      .kp-btn:active { transform: translateY(0); }

      /* ── Hero grid ─────────────────────────────────── */
      .kp-hero-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: clamp(2rem,5vw,4rem);
        align-items: center;
        max-width: 980px;
        margin: 0 auto;
      }
      @media (max-width: 700px) {
        .kp-hero-grid { grid-template-columns: 1fr; text-align: center; }
        .kp-hero-ctas { justify-content: center !important; }
        .kp-hero-trust { justify-content: center !important; }
        .kp-visual-col { order: -1; }
      }

      /* ── Steps grid ────────────────────────────────── */
      .kp-steps-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1rem;
      }
      @media (max-width: 680px) { .kp-steps-grid { grid-template-columns: repeat(2,1fr); } }
      @media (max-width: 400px) { .kp-steps-grid { grid-template-columns: 1fr; } }

      /* ── Events grid ───────────────────────────────── */
      .kp-events-grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 1rem;
      }
      @media (max-width: 800px) { .kp-events-grid { grid-template-columns: repeat(3,1fr); } }
      @media (max-width: 500px) { .kp-events-grid { grid-template-columns: repeat(2,1fr); } }

      /* ── Plans grid ────────────────────────────────── */
      .kp-plans-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.25rem;
        align-items: stretch;
      }
      @media (max-width: 720px) {
        .kp-plans-grid { grid-template-columns: 1fr; max-width: 360px; margin-left: auto; margin-right: auto; }
      }

      /* ── Benefits grid ─────────────────────────────── */
      .kp-benefits-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }
      @media (max-width: 700px) { .kp-benefits-grid { grid-template-columns: repeat(2,1fr); } }
      @media (max-width: 420px) { .kp-benefits-grid { grid-template-columns: 1fr; } }

      /* ── Trust strip ───────────────────────────────── */
      .kp-trust-strip {
        display: flex;
        gap: clamp(1rem,3vw,2.5rem);
        justify-content: center;
        flex-wrap: wrap;
        overflow-x: auto;
      }

      /* ── FAQ ───────────────────────────────────────── */
      details.kp-faq summary::-webkit-details-marker { display:none; }
      details.kp-faq[open] summary .kp-faq-icon { transform: rotate(45deg); }
      .kp-faq-icon { transition: transform .2s ease; display:inline-block; }
    `}</style>
  );
}

// ─── NAV ─────────────────────────────────────────────────────────────────────
function TopNav() {
  return (
    <nav style={{
      position:'sticky', top:0, zIndex:100,
      background:'rgba(245,240,235,0.92)', backdropFilter:'blur(10px)',
      borderBottom:`1px solid ${C.border}`,
      padding:'0.875rem clamp(1rem,4vw,2rem)',
      display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1rem',
    }}>
      <Link href="/invitaciones" style={{ fontSize:'1rem', fontWeight:700, color:C.dark, letterSpacing:'0.1em', textTransform:'uppercase', textDecoration:'none' }}>
        Kompralo
      </Link>
      <div style={{ display:'flex', gap:'0.625rem', alignItems:'center', flexWrap:'wrap' }}>
        <Link href="/sofia-y-alejandro" style={{ fontSize:'0.8125rem', color:C.mid, textDecoration:'none', fontWeight:500 }}>Ver demo</Link>
        <Link href="/invitaciones/precios" className="kp-btn" style={{
          fontSize:'0.8125rem', fontWeight:700, color:C.dark,
          background:C.gold, padding:'0.5rem 1.125rem', borderRadius:'6rem', textDecoration:'none', whiteSpace:'nowrap',
        }}>
          Ver planes
        </Link>
      </div>
    </nav>
  );
}

// ─── CSS PHONE MOCKUP ─────────────────────────────────────────────────────────
function PhoneMockup() {
  return (
    <div style={{ position:'relative', width:'180px', height:'360px', margin:'0 auto', flexShrink:0 }}>
      {/* Phone shell */}
      <div className="kp-float" style={{
        width:'180px', height:'360px',
        background:'linear-gradient(160deg, #2A1C12 0%, #1A1410 100%)',
        borderRadius:'30px',
        border:'2px solid rgba(197,168,128,0.5)',
        boxShadow:'0 40px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(197,168,128,0.08), inset 0 1px 0 rgba(197,168,128,0.12)',
        position:'relative', overflow:'hidden',
      }}>
        {/* Notch */}
        <div style={{
          position:'absolute', top:0, left:'50%', transform:'translateX(-50%)',
          width:'56px', height:'18px',
          background:'#0D0A07', borderRadius:'0 0 12px 12px', zIndex:2,
        }} />

        {/* Screen content */}
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column' }}>
          {/* Photo header */}
          <div style={{
            height:'110px', flexShrink:0, position:'relative',
            background:'linear-gradient(160deg, #3D2B1E 0%, #2A1C12 100%)',
          }}>
            <div style={{ position:'absolute', inset:0, opacity:.15, backgroundImage:'repeating-linear-gradient(0deg, transparent, transparent 12px, rgba(197,168,128,0.5) 12px, rgba(197,168,128,0.5) 13px)' }} />
            <div style={{ position:'absolute', bottom:'12px', left:0, right:0, textAlign:'center' }}>
              <div style={{ fontSize:'6.5px', letterSpacing:'0.2em', color:'rgba(197,168,128,0.6)', textTransform:'uppercase', marginBottom:'3px' }}>nos casamos</div>
              <div style={{ fontSize:'11px', fontWeight:700, color:'#F5EDD8', letterSpacing:'0.06em', fontFamily:'var(--font-playfair, Georgia, serif)' }}>Sofía & Alejandro</div>
            </div>
          </div>

          {/* Body */}
          <div style={{ flex:1, background:'#FAF6F0', padding:'10px 12px', display:'flex', flexDirection:'column', gap:'7px' }}>
            <div style={{ textAlign:'center', fontSize:'9px', fontWeight:700, color:C.gold, letterSpacing:'0.1em', textTransform:'uppercase' }}>
              14 · Febrero · 2026
            </div>

            {/* Divider with dot */}
            <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>
              <div style={{ flex:1, height:'1px', background:C.border }} />
              <div style={{ width:'4px', height:'4px', borderRadius:'50%', background:C.gold }} />
              <div style={{ flex:1, height:'1px', background:C.border }} />
            </div>

            {/* Countdown */}
            <div style={{ display:'flex', justifyContent:'center', gap:'10px' }}>
              {[['03','días'],['14','hrs'],['22','min']].map(([n,l]) => (
                <div key={l} style={{ textAlign:'center' }}>
                  <div style={{ fontSize:'13px', fontWeight:800, color:C.dark, lineHeight:1 }}>{n}</div>
                  <div style={{ fontSize:'6px', color:C.light, marginTop:'2px', letterSpacing:'0.04em' }}>{l}</div>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div style={{ background:C.dark, borderRadius:'7px', padding:'5px', textAlign:'center' }}>
              <span style={{ fontSize:'7.5px', fontWeight:700, color:'#F5EDD8', letterSpacing:'0.06em', textTransform:'uppercase' }}>Confirmar Asistencia</span>
            </div>
            <div style={{ background:'#25D366', borderRadius:'7px', padding:'4px', textAlign:'center' }}>
              <span style={{ fontSize:'7px', fontWeight:700, color:'#fff', letterSpacing:'0.04em' }}>Compartir por WhatsApp</span>
            </div>
          </div>
        </div>
      </div>

      {/* Side buttons */}
      <div style={{ position:'absolute', left:'-3px', top:'80px', width:'3px', height:'18px', background:'rgba(197,168,128,0.25)', borderRadius:'2px 0 0 2px' }} />
      <div style={{ position:'absolute', left:'-3px', top:'106px', width:'3px', height:'18px', background:'rgba(197,168,128,0.25)', borderRadius:'2px 0 0 2px' }} />
      <div style={{ position:'absolute', right:'-3px', top:'92px', width:'3px', height:'28px', background:'rgba(197,168,128,0.25)', borderRadius:'0 2px 2px 0' }} />

      {/* Floating event badges */}
      <div className="kp-badge-a" style={{
        position:'absolute', top:'5%', right:'-58px',
        background:C.white, borderRadius:'10px', padding:'7px 10px',
        boxShadow:'0 6px 20px rgba(0,0,0,0.12)', fontSize:'11px', fontWeight:700, color:C.dark,
        whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:'5px',
      }}>💍 Boda</div>

      <div className="kp-badge-b" style={{
        position:'absolute', top:'40%', left:'-70px',
        background:C.white, borderRadius:'10px', padding:'7px 10px',
        boxShadow:'0 6px 20px rgba(0,0,0,0.12)', fontSize:'11px', fontWeight:700, color:C.dark,
        whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:'5px',
      }}>👑 XV Años</div>

      <div className="kp-badge-c" style={{
        position:'absolute', bottom:'10%', right:'-72px',
        background:C.white, borderRadius:'10px', padding:'7px 10px',
        boxShadow:'0 6px 20px rgba(0,0,0,0.12)', fontSize:'11px', fontWeight:700, color:C.dark,
        whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:'5px',
      }}>🍼 Baby Shower</div>
    </div>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section style={{
      background:'linear-gradient(145deg, #F9F3EC 0%, #F5F0EB 55%, #EDE5DA 100%)',
      padding:'clamp(3rem,8vw,5.5rem) clamp(1.25rem,4vw,2.5rem)',
      position:'relative', overflow:'hidden',
    }}>
      {/* Decorative blur orbs */}
      <div aria-hidden style={{ position:'absolute', top:'-80px', right:'-80px', width:'360px', height:'360px', borderRadius:'50%', background:'radial-gradient(circle, rgba(197,168,128,0.12) 0%, transparent 70%)', pointerEvents:'none' }} />
      <div aria-hidden style={{ position:'absolute', bottom:'-60px', left:'-60px', width:'260px', height:'260px', borderRadius:'50%', background:'radial-gradient(circle, rgba(197,168,128,0.08) 0%, transparent 70%)', pointerEvents:'none' }} />

      <div className="kp-hero-grid">
        {/* Text */}
        <div>
          <div className="kp-anim" style={{
            display:'inline-flex', alignItems:'center', gap:'0.5rem',
            background:'rgba(197,168,128,0.12)', border:'1px solid rgba(197,168,128,0.28)',
            borderRadius:'6rem', padding:'0.3rem 0.875rem',
            fontSize:'0.6875rem', fontWeight:700, letterSpacing:'0.16em', textTransform:'uppercase', color:C.gold,
            marginBottom:'1.25rem',
          }}>
            <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:C.gold, flexShrink:0 }} />
            Invitaciones digitales · Desde $499 MXN
          </div>

          <h1 className="kp-anim kp-d1" style={{
            fontSize:'clamp(2rem,5.5vw,3.25rem)',
            fontWeight:800, color:C.dark, lineHeight:1.1, margin:'0 0 1.125rem',
            fontFamily:'var(--font-playfair, Georgia, serif)',
          }}>
            Invitaciones digitales editables para eventos inolvidables
          </h1>

          <p className="kp-anim kp-d2" style={{
            fontSize:'clamp(0.9375rem,2vw,1.0625rem)',
            color:C.mid, lineHeight:1.65, margin:'0 0 2rem',
          }}>
            Compra, personaliza y comparte por WhatsApp. Sin instalar apps. Todo desde tu celular.
          </p>

          <div className="kp-anim kp-d3 kp-hero-ctas" style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap', marginBottom:'2rem' }}>
            <Link href="/invitaciones/precios" className="kp-btn" style={{
              display:'inline-block', padding:'0.875rem 1.875rem',
              background:C.dark, color:'#F5EDD8',
              borderRadius:'0.625rem', fontSize:'0.9375rem', fontWeight:700, textDecoration:'none',
            }}>
              Ver planes →
            </Link>
            <Link href="/sofia-y-alejandro" className="kp-btn" style={{
              display:'inline-block', padding:'0.875rem 1.875rem',
              background:C.white, color:C.dark,
              borderRadius:'0.625rem', fontSize:'0.9375rem', fontWeight:600,
              textDecoration:'none', border:`1.5px solid ${C.border}`,
            }}>
              Ver demo
            </Link>
          </div>

          <div className="kp-anim kp-d4 kp-hero-trust" style={{ display:'flex', gap:'1.25rem', flexWrap:'wrap', fontSize:'0.78rem', color:C.light }}>
            {['Pago único · Sin suscripción','Pago seguro con Stripe','Acceso inmediato'].map((t) => (
              <span key={t} style={{ display:'flex', alignItems:'center', gap:'0.35rem' }}>
                <span style={{ color:C.gold, fontSize:'0.7rem' }}>✓</span> {t}
              </span>
            ))}
          </div>
        </div>

        {/* Visual */}
        <div className="kp-anim kp-d2 kp-visual-col" style={{ display:'flex', justifyContent:'center', alignItems:'center', padding:'1rem 3.5rem' }}>
          <PhoneMockup />
        </div>
      </div>
    </section>
  );
}

// ─── TRUST STRIP ─────────────────────────────────────────────────────────────
function TrustStrip() {
  return (
    <div style={{ background:C.cream, borderTop:`1px solid ${C.border}`, borderBottom:`1px solid ${C.border}`, padding:'1.125rem clamp(1rem,4vw,2rem)' }}>
      <div className="kp-trust-strip">
        {['🔒 Pago seguro con Stripe','📲 Compatible con cualquier celular','✏️ Editable en línea','💬 Compartir por WhatsApp','🇲🇽 Soporte en español'].map((t) => (
          <span key={t} style={{ fontSize:'0.8rem', color:C.mid, whiteSpace:'nowrap', fontWeight:500 }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

// ─── CÓMO FUNCIONA ────────────────────────────────────────────────────────────
const STEPS = [
  { n:'1', icon:'🛒', title:'Elige tu plan',         desc:'Basic, Premium o Deluxe según lo que necesitas para tu evento.' },
  { n:'2', icon:'🔒', title:'Paga seguro',            desc:'Pago con tarjeta mediante Stripe. Rápido, seguro y sin sorpresas.' },
  { n:'3', icon:'✏️', title:'Edita en línea',         desc:'Personaliza textos, fotos, itinerario y más desde tu celular.' },
  { n:'4', icon:'💬', title:'Comparte por WhatsApp',  desc:'Envía el link a tus invitados. Nada que descargar.' },
];

function HowItWorks() {
  return (
    <section style={{ background:C.white, padding:'clamp(3rem,7vw,4.5rem) clamp(1.25rem,4vw,2.5rem)' }}>
      <div style={{ maxWidth:'960px', margin:'0 auto' }}>
        <div className="kp-anim" style={{ textAlign:'center', marginBottom:'2.75rem' }}>
          <p style={{ fontSize:'0.6875rem', fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:C.gold, margin:'0 0 0.625rem' }}>¿Cómo funciona?</p>
          <h2 style={{ fontSize:'clamp(1.5rem,4vw,2.125rem)', fontWeight:700, color:C.dark, margin:'0 0 0.75rem', fontFamily:'var(--font-playfair, Georgia, serif)', lineHeight:1.2 }}>
            Listo en minutos, desde tu celular
          </h2>
          <p style={{ color:C.mid, fontSize:'0.9375rem', lineHeight:1.6, maxWidth:'34rem', margin:'0 auto' }}>
            Sin instalar nada. Sin complicaciones técnicas. Un proceso sencillo de cuatro pasos.
          </p>
        </div>

        <div className="kp-steps-grid">
          {STEPS.map((s, i) => (
            <div key={s.n} className={`kp-step-card kp-hover-lift kp-anim kp-d${i + 1}`} style={{
              background: i % 2 === 0 ? C.cream : C.white,
              border:`1px solid ${C.border}`, borderRadius:'1rem', padding:'1.625rem 1.25rem',
              position:'relative',
            }}>
              {/* Ghost step number */}
              <div aria-hidden style={{
                position:'absolute', top:'0.75rem', right:'1rem',
                fontSize:'2.75rem', fontWeight:900, color:'rgba(197,168,128,0.1)',
                lineHeight:1, userSelect:'none',
              }}>{s.n}</div>

              {/* Icon */}
              <div style={{
                width:'2.5rem', height:'2.5rem', borderRadius:'50%',
                background:C.dark, display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'1rem', marginBottom:'1rem',
              }}>{s.icon}</div>

              <h3 style={{ margin:'0 0 0.5rem', fontSize:'0.9375rem', fontWeight:700, color:C.dark }}>{s.title}</h3>
              <p style={{ margin:0, fontSize:'0.8125rem', color:C.mid, lineHeight:1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── EVENT TYPES ─────────────────────────────────────────────────────────────
const EVENTS = [
  { emoji:'💍', name:'Bodas',        desc:'Elegante, eterno y personalizado.',    gradient:'linear-gradient(135deg,#F9F0E6,#EFE3CF)', dot:'#B8946A' },
  { emoji:'👑', name:'XV Años',      desc:'Glamour y magia para el día más especial.', gradient:'linear-gradient(135deg,#F5E8F5,#E8D0E8)', dot:'#8A58A8' },
  { emoji:'🕊️', name:'Bautizos',    desc:'Suave, puro y lleno de amor familiar.',gradient:'linear-gradient(135deg,#E6EFF9,#CFDEF0)', dot:'#4A7EAA' },
  { emoji:'🍼', name:'Baby Shower',  desc:'Dulce y tierno para la nueva vida.',   gradient:'linear-gradient(135deg,#F0F5E6,#DDF0D0)', dot:'#5A9A61' },
  { emoji:'🎂', name:'Cumpleaños',   desc:'Colorido, festivo y lleno de alegría.',gradient:'linear-gradient(135deg,#FEF0E6,#F5DCCB)', dot:'#C07A3A' },
];

function EventTypes() {
  return (
    <section style={{ background:C.bg, padding:'clamp(3rem,7vw,4.5rem) clamp(1.25rem,4vw,2.5rem)' }}>
      <div style={{ maxWidth:'960px', margin:'0 auto' }}>
        <div className="kp-anim" style={{ textAlign:'center', marginBottom:'2.75rem' }}>
          <p style={{ fontSize:'0.6875rem', fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:C.gold, margin:'0 0 0.625rem' }}>Para cada ocasión</p>
          <h2 style={{ fontSize:'clamp(1.5rem,4vw,2.125rem)', fontWeight:700, color:C.dark, margin:0, fontFamily:'var(--font-playfair, Georgia, serif)', lineHeight:1.2 }}>
            Una invitación para cada momento especial
          </h2>
        </div>

        <div className="kp-events-grid">
          {EVENTS.map((ev, i) => (
            <div key={ev.name} className={`kp-event-card kp-anim kp-d${i + 1}`} style={{
              background:ev.gradient, border:'1px solid rgba(0,0,0,0.05)',
              borderRadius:'1rem', padding:'1.5rem 1.125rem', textAlign:'center', cursor:'default',
            }}>
              <div style={{
                width:'2.75rem', height:'2.75rem', borderRadius:'50%',
                background:'rgba(255,255,255,0.7)', margin:'0 auto 0.875rem',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'1.25rem', boxShadow:'0 2px 8px rgba(0,0,0,0.07)',
              }}>{ev.emoji}</div>
              <h3 style={{ margin:'0 0 0.375rem', fontSize:'0.9rem', fontWeight:700, color:C.dark }}>{ev.name}</h3>
              <p style={{ margin:'0 0 0.875rem', fontSize:'0.75rem', color:C.mid, lineHeight:1.5 }}>{ev.desc}</p>
              <div style={{ width:'5px', height:'5px', borderRadius:'50%', background:ev.dot, margin:'0 auto' }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── BENEFITS ─────────────────────────────────────────────────────────────────
const BENEFITS = [
  { icon:'📱', title:'100% digital',         desc:'Tus invitados la abren desde su celular. Sin papel, sin impresión.' },
  { icon:'✏️', title:'Editable en línea',    desc:'Cambia textos, fechas y fotos desde el editor cuando quieras.' },
  { icon:'✨', title:'Diseño elegante',       desc:'Plantillas premium con animaciones suaves y estética sofisticada.' },
  { icon:'💬', title:'Comparte por WhatsApp', desc:'Un link que tus invitados reciben directo en su teléfono.' },
  { icon:'📋', title:'RSVP integrado',        desc:'Tus invitados confirman asistencia sin salir de la invitación.' },
  { icon:'🤖', title:'Asistente de textos',   desc:'Genera textos elegantes con IA para cada sección de tu invitación.' },
];

function Benefits() {
  return (
    <section style={{ background:C.dark, padding:'clamp(3rem,7vw,4.5rem) clamp(1.25rem,4vw,2.5rem)' }}>
      <div style={{ maxWidth:'960px', margin:'0 auto' }}>
        <div className="kp-anim" style={{ textAlign:'center', marginBottom:'2.75rem' }}>
          <p style={{ fontSize:'0.6875rem', fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:C.gold, margin:'0 0 0.625rem' }}>Beneficios</p>
          <h2 style={{ fontSize:'clamp(1.5rem,4vw,2.125rem)', fontWeight:700, color:'#F5EDD8', margin:'0 0 0.75rem', fontFamily:'var(--font-playfair, Georgia, serif)', lineHeight:1.2 }}>
            Todo lo que necesitas en una sola invitación
          </h2>
          <p style={{ color:'#C5B8A8', fontSize:'0.9375rem', lineHeight:1.6, maxWidth:'34rem', margin:'0 auto' }}>
            Diseñado para quienes quieren una invitación bonita, clara y fácil de compartir.
          </p>
        </div>

        <div className="kp-benefits-grid">
          {BENEFITS.map((b, i) => (
            <div key={b.title} className={`kp-benefit-card kp-anim kp-d${i + 1}`} style={{
              background:'rgba(255,255,255,0.05)', border:'1px solid rgba(197,168,128,0.14)',
              borderRadius:'0.875rem', padding:'1.375rem 1.125rem',
            }}>
              <div style={{
                width:'2.25rem', height:'2.25rem', borderRadius:'50%',
                background:'rgba(197,168,128,0.1)', border:'1px solid rgba(197,168,128,0.18)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'1rem', marginBottom:'0.875rem',
              }}>{b.icon}</div>
              <h3 style={{ margin:'0 0 0.3rem', fontSize:'0.9rem', fontWeight:700, color:'#F5EDD8' }}>{b.title}</h3>
              <p style={{ margin:0, fontSize:'0.8rem', color:'#C5B8A8', lineHeight:1.55 }}>{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── PRICING PREVIEW ─────────────────────────────────────────────────────────
const PLANS = [
  {
    id:'basic', name:'Basic', price:'$499',
    ideal:'Para bautizos, baby showers y cumpleaños',
    features:['Portada con foto','Cuenta regresiva','RSVP','Botón WhatsApp','Mensaje final'],
    dark:false, badge:null,
  },
  {
    id:'premium', name:'Premium', price:'$899',
    ideal:'El más elegido · Bodas y XV años',
    features:['Todo lo de Basic','Galería de fotos','Música de fondo','Itinerario + Mapas','Código QR'],
    dark:true, badge:'MÁS POPULAR',
  },
  {
    id:'deluxe', name:'Deluxe', price:'$1,499',
    ideal:'Para bodas y quinces de alto impacto',
    features:['Todo lo de Premium','StoryBook animado','Padrinos','Hospedaje','Mesa de regalos'],
    dark:false, badge:null,
  },
];

function PricingPreview() {
  return (
    <section style={{ background:C.white, padding:'clamp(3rem,7vw,4.5rem) clamp(1.25rem,4vw,2.5rem)' }}>
      <div style={{ maxWidth:'960px', margin:'0 auto' }}>
        <div className="kp-anim" style={{ textAlign:'center', marginBottom:'2.75rem' }}>
          <p style={{ fontSize:'0.6875rem', fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:C.gold, margin:'0 0 0.625rem' }}>Planes</p>
          <h2 style={{ fontSize:'clamp(1.5rem,4vw,2.125rem)', fontWeight:700, color:C.dark, margin:'0 0 0.75rem', fontFamily:'var(--font-playfair, Georgia, serif)', lineHeight:1.2 }}>
            Elige el plan ideal para tu evento
          </h2>
          <p style={{ color:C.mid, fontSize:'0.9375rem', lineHeight:1.6 }}>Pago único, sin mensualidades ni sorpresas.</p>
        </div>

        <div className="kp-plans-grid">
          {PLANS.map((plan, i) => (
            <div key={plan.id} className={`kp-plan-card ${plan.dark ? 'kp-plan-card-dark' : ''} kp-anim kp-d${i + 1}`} style={{
              position:'relative', display:'flex', flexDirection:'column',
              background:plan.dark ? C.dark : C.cream,
              border:plan.dark ? `2px solid ${C.gold}` : `1px solid ${C.border}`,
              borderRadius:'1rem', padding:'2rem 1.5rem',
              boxShadow:plan.dark ? '0 8px 32px rgba(197,168,128,0.15)' : '0 2px 10px rgba(26,20,16,0.05)',
            }}>
              {plan.badge && (
                <div style={{
                  position:'absolute', top:'-1px', left:'50%', transform:'translateX(-50%)',
                  background:C.gold, color:C.dark,
                  fontSize:'0.6rem', fontWeight:800, letterSpacing:'0.12em',
                  padding:'0.25rem 0.875rem', borderRadius:'0 0 0.5rem 0.5rem', whiteSpace:'nowrap',
                }}>{plan.badge}</div>
              )}

              <h3 style={{ margin:'0 0 0.25rem', fontSize:'1.25rem', fontWeight:700, color:plan.dark ? '#F5EDD8' : C.dark }}>{plan.name}</h3>
              <p style={{ margin:'0 0 1rem', fontSize:'0.78rem', color:plan.dark ? '#C5B8A8' : C.light }}>{plan.ideal}</p>

              <div style={{ marginBottom:'1.25rem' }}>
                <span style={{ fontSize:'2rem', fontWeight:800, color:plan.dark ? '#F5EDD8' : C.dark }}>{plan.price}</span>
                <span style={{ fontSize:'0.8rem', color:plan.dark ? '#C5B8A8' : C.light, marginLeft:'0.25rem' }}>MXN · pago único</span>
              </div>

              <ul style={{ listStyle:'none', padding:0, margin:'0 0 1.5rem', display:'flex', flexDirection:'column', gap:'0.5rem', flex:1 }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ display:'flex', gap:'0.5rem', fontSize:'0.8125rem', color:plan.dark ? '#C5B8A8' : C.mid }}>
                    <span style={{ color:C.gold, flexShrink:0 }}>✓</span> {f}
                  </li>
                ))}
              </ul>

              <Link href="/invitaciones/precios" className="kp-btn" style={{
                display:'block', textAlign:'center', padding:'0.75rem',
                background:plan.dark ? C.gold : C.dark,
                color:plan.dark ? C.dark : '#F5EDD8',
                borderRadius:'0.5rem', fontSize:'0.875rem', fontWeight:700, textDecoration:'none',
              }}>
                Ver detalles y comprar
              </Link>
            </div>
          ))}
        </div>

        <p className="kp-anim" style={{ textAlign:'center', marginTop:'1.75rem', fontSize:'0.8rem', color:C.light }}>
          Pago seguro con Stripe · Acceso inmediato · Soporte en español
        </p>
      </div>
    </section>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────
const FAQS = [
  { q:'¿Cómo recibo mi invitación después de pagar?', a:'Recibirás un correo con un enlace de acceso. Al abrirlo, entrarás directo a tu editor para personalizar tu invitación.' },
  { q:'¿Puedo editarla después de comprarla?',        a:'Sí. Puedes editar textos, fechas, fotos, itinerario y más desde el editor en línea cuando quieras.' },
  { q:'¿Cómo se comparte con los invitados?',         a:'Una vez lista, copias el enlace de tu invitación y lo envías por WhatsApp, mensaje o donde prefieras.' },
  { q:'¿Tiene confirmación de asistencia (RSVP)?',    a:'Sí. Todos los planes incluyen RSVP para que tus invitados confirmen su asistencia directamente en la invitación.' },
  { q:'¿Puedo usarla desde mi celular?',              a:'Sí, tanto el editor como la invitación están diseñados para funcionar perfectamente en cualquier celular.' },
  { q:'¿Qué pasa si necesito ayuda?',                 a:'Tenemos soporte en español. Si tienes dudas sobre tu invitación, podemos ayudarte por WhatsApp.' },
];

function FAQ() {
  return (
    <section style={{ background:C.bg, padding:'clamp(3rem,7vw,4.5rem) clamp(1.25rem,4vw,2.5rem)' }}>
      <div style={{ maxWidth:'640px', margin:'0 auto' }}>
        <div className="kp-anim" style={{ textAlign:'center', marginBottom:'2.5rem' }}>
          <p style={{ fontSize:'0.6875rem', fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:C.gold, margin:'0 0 0.625rem' }}>Preguntas frecuentes</p>
          <h2 style={{ fontSize:'clamp(1.5rem,4vw,2.125rem)', fontWeight:700, color:C.dark, margin:0, fontFamily:'var(--font-playfair, Georgia, serif)', lineHeight:1.2 }}>
            Todo lo que necesitas saber
          </h2>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'0.625rem' }}>
          {FAQS.map((faq, i) => (
            <details key={faq.q} className={`kp-faq kp-anim kp-d${Math.min(i + 1, 6)}`} style={{
              background:C.white, border:`1px solid ${C.border}`, borderRadius:'0.75rem', overflow:'hidden',
            }}>
              <summary style={{
                padding:'1.125rem 1.25rem', cursor:'pointer',
                fontWeight:600, fontSize:'0.9375rem', color:C.dark,
                display:'flex', justifyContent:'space-between', alignItems:'center', gap:'1rem',
                userSelect:'none', listStyle:'none',
              }}>
                {faq.q}
                <span className="kp-faq-icon" style={{ fontSize:'1.1rem', color:C.gold, flexShrink:0, fontWeight:300 }}>+</span>
              </summary>
              <p style={{
                margin:0, padding:'0 1.25rem 1.125rem',
                fontSize:'0.875rem', color:C.mid, lineHeight:1.65,
                borderTop:`1px solid ${C.border}`, paddingTop:'1rem',
              }}>{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FINAL CTA ────────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section style={{
      background:'linear-gradient(140deg,#1A1410 0%,#2D1F12 100%)',
      padding:'clamp(3rem,7vw,5rem) clamp(1.25rem,4vw,2.5rem)',
      textAlign:'center', position:'relative', overflow:'hidden',
    }}>
      <div aria-hidden style={{
        position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
        width:'400px', height:'200px', borderRadius:'50%',
        background:'radial-gradient(ellipse, rgba(197,168,128,0.07) 0%, transparent 70%)',
        pointerEvents:'none',
      }} />

      <div style={{ maxWidth:'560px', margin:'0 auto', position:'relative' }}>
        <p className="kp-anim" style={{ fontSize:'0.6875rem', fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:C.gold, margin:'0 0 1rem' }}>Empieza hoy</p>
        <h2 className="kp-anim kp-d1" style={{ fontSize:'clamp(1.75rem,5vw,2.625rem)', fontWeight:800, color:'#F5EDD8', margin:'0 0 1rem', lineHeight:1.15, fontFamily:'var(--font-playfair, Georgia, serif)' }}>
          Tu invitación digital lista en minutos
        </h2>
        <p className="kp-anim kp-d2" style={{ color:'#C5B8A8', fontSize:'1rem', lineHeight:1.6, margin:'0 0 2.25rem' }}>
          Paga, edita y comparte. Sin instalar apps. Desde <strong style={{ color:C.gold }}>$499 MXN</strong>.
        </p>

        <div className="kp-anim kp-d3" style={{ display:'flex', gap:'0.875rem', justifyContent:'center', flexWrap:'wrap' }}>
          <Link href="/invitaciones/precios" className="kp-btn" style={{
            display:'inline-block', padding:'0.9375rem 2.25rem',
            background:C.gold, color:C.dark,
            borderRadius:'0.625rem', fontSize:'1rem', fontWeight:700, textDecoration:'none',
          }}>
            Crear mi invitación →
          </Link>
          <Link href="/sofia-y-alejandro" className="kp-btn" style={{
            display:'inline-block', padding:'0.9375rem 2.25rem',
            background:'transparent', color:'#F5EDD8',
            borderRadius:'0.625rem', fontSize:'1rem', fontWeight:600,
            textDecoration:'none', border:'1.5px solid rgba(245,237,216,0.25)',
          }}>
            Ver demo
          </Link>
        </div>

        <p className="kp-anim kp-d4" style={{ marginTop:'2rem', fontSize:'0.78rem', color:'#6B5B4E' }}>
          Después del pago recibirás acceso para editar tu invitación · Pago seguro con Stripe
        </p>
      </div>
    </section>
  );
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{
      background:C.dark, borderTop:'1px solid rgba(255,255,255,0.05)',
      padding:'1.375rem clamp(1rem,4vw,2rem)',
      display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'0.75rem',
    }}>
      <span style={{ fontSize:'0.75rem', color:'#4B3A2C', letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:700 }}>Kompralo</span>
      <div style={{ display:'flex', gap:'1.5rem', flexWrap:'wrap' }}>
        {[{href:'/invitaciones/precios',label:'Precios'},{href:'/sofia-y-alejandro',label:'Demo'},{href:'/login',label:'Acceder'}].map(({ href, label }) => (
          <Link key={href} href={href} style={{ fontSize:'0.8125rem', color:'#6B5B4E', textDecoration:'none' }}>{label}</Link>
        ))}
      </div>
      <span style={{ fontSize:'0.75rem', color:'#3D2B1A' }}>© 2026 Kompralo</span>
    </footer>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function InvitacionesPage() {
  return (
    <div style={{ fontFamily:'var(--font-inter, system-ui, sans-serif)', background:C.bg }}>
      <PageStyles />
      <TopNav />
      <HeroSection />
      <TrustStrip />
      <HowItWorks />
      <EventTypes />
      <Benefits />
      <PricingPreview />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}
