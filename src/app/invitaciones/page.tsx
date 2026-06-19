import type { Metadata } from 'next';
import Link from 'next/link';
import { Reveal, Stagger, Item, HoverCard } from '@/components/public/Motion';

export const metadata: Metadata = {
  title: 'Invitaciones Digitales Editables — Kompralo',
  description:
    'Crea tu invitación digital para boda, XV años, bautizo, baby shower o cumpleaños. Edítala en línea y compártela por WhatsApp. Desde $499 MXN.',
};

// ─── Design system ────────────────────────────────────────────────────────────
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

// ─── Global CSS (hover states + CSS animations for above-fold) ────────────────
function PageStyles() {
  return (
    <style>{`
      /* ── Keyframes ─────────────────────────── */
      @keyframes aw-float {
        0%,100% { transform:translateY(0) rotate(-2deg); }
        50%      { transform:translateY(-13px) rotate(-2deg); }
      }
      @keyframes aw-badge-a {
        0%,100% { transform:translateY(0) rotate(3deg); }
        50%      { transform:translateY(-8px) rotate(3deg); }
      }
      @keyframes aw-badge-b {
        0%,100% { transform:translateY(0) rotate(-4deg); }
        50%      { transform:translateY(-6px) rotate(-4deg); }
      }
      @keyframes aw-badge-c {
        0%,100% { transform:translateY(0) rotate(2deg); }
        50%      { transform:translateY(-10px) rotate(2deg); }
      }
      @keyframes aw-hero-fade {
        from { opacity:0; transform:translateY(22px); }
        to   { opacity:1; transform:translateY(0); }
      }
      @keyframes aw-hero-label {
        from { opacity:0; transform:translateX(-10px); }
        to   { opacity:1; transform:translateX(0); }
      }
      @keyframes aw-phone-in {
        from { opacity:0; transform:translateY(40px) rotate(-2deg); }
        to   { opacity:1; transform:translateY(0) rotate(-2deg); }
      }

      /* ── Reduce motion ─────────────────────── */
      @media (prefers-reduced-motion: reduce) {
        .aw-float, .aw-badge-a, .aw-badge-b, .aw-badge-c,
        .aw-hero-label, .aw-hero-h1, .aw-hero-body, .aw-hero-cta,
        .aw-phone-in { animation:none !important; }
      }

      /* ── Hero reveals ──────────────────────── */
      .aw-hero-label { animation:aw-hero-label .6s cubic-bezier(0.65,0,.35,1) .1s both; }
      .aw-hero-h1    { animation:aw-hero-fade  .75s cubic-bezier(0.65,0,.35,1) .2s both; }
      .aw-hero-body  { animation:aw-hero-fade  .7s  cubic-bezier(0.65,0,.35,1) .35s both; }
      .aw-hero-cta   { animation:aw-hero-fade  .65s cubic-bezier(0.65,0,.35,1) .5s both; }
      .aw-phone-in   { animation:aw-phone-in   .9s  cubic-bezier(0.22,1,.36,1) .3s both; }

      /* ── Phone float ───────────────────────── */
      .aw-float   { animation:aw-float   6s ease-in-out infinite; }
      .aw-badge-a { animation:aw-badge-a 4.5s ease-in-out infinite; }
      .aw-badge-b { animation:aw-badge-b 5.5s 1.2s ease-in-out infinite; }
      .aw-badge-c { animation:aw-badge-c 4s .6s ease-in-out infinite; }

      /* ── Hover states ──────────────────────── */
      .aw-nav-link { transition:color .2s ease; }
      .aw-nav-link:hover { color:#0F0C09 !important; }

      .aw-faq-item { transition:background .2s ease; }
      .aw-faq-item:hover { background:#F7F2EA !important; }
      details.aw-faq[open] summary .aw-faq-plus { transform:rotate(45deg); }
      .aw-faq-plus { transition:transform .25s cubic-bezier(0.65,0,.35,1); display:inline-block; }
      details.aw-faq summary::-webkit-details-marker { display:none; }

      /* ── Grids ─────────────────────────────── */
      .aw-hero-grid {
        display: grid;
        grid-template-columns: 1.1fr .9fr;
        gap: clamp(2rem,5vw,5rem);
        align-items: center;
        max-width: 1040px;
        margin: 0 auto;
      }
      @media (max-width:720px) {
        .aw-hero-grid { grid-template-columns:1fr; text-align:center; }
        .aw-hero-trust { justify-content:center !important; }
        .aw-hero-ctas  { justify-content:center !important; }
        .aw-visual-col { order:-1; margin-bottom:.5rem; }
        .aw-phone-scene { margin:0 auto; }
      }

      .aw-steps-grid {
        display: grid;
        grid-template-columns: repeat(4,1fr);
        gap: 1.25rem;
        position: relative;
      }
      @media (max-width:700px) { .aw-steps-grid { grid-template-columns:repeat(2,1fr); } }
      @media (max-width:400px) { .aw-steps-grid { grid-template-columns:1fr; } }

      .aw-events-grid {
        display: grid;
        grid-template-columns: repeat(5,1fr);
        gap: 1rem;
      }
      @media (max-width:840px) { .aw-events-grid { grid-template-columns:repeat(3,1fr); } }
      @media (max-width:520px) { .aw-events-grid { grid-template-columns:repeat(2,1fr); } }

      .aw-benefits-grid {
        display: grid;
        grid-template-columns: repeat(3,1fr);
        gap: 1rem;
      }
      @media (max-width:740px) { .aw-benefits-grid { grid-template-columns:repeat(2,1fr); } }
      @media (max-width:440px) { .aw-benefits-grid { grid-template-columns:1fr; } }

      .aw-plans-grid {
        display: grid;
        grid-template-columns: repeat(3,1fr);
        gap: 1.375rem;
        align-items: stretch;
      }
      @media (max-width:760px) {
        .aw-plans-grid {
          grid-template-columns:1fr;
          max-width:360px;
          margin-left:auto; margin-right:auto;
        }
      }

      /* ── Trust strip ───────────────────────── */
      .aw-trust-row {
        display: flex;
        gap: clamp(.875rem,3vw,2.5rem);
        justify-content: center;
        flex-wrap: wrap;
      }
    `}</style>
  );
}

// ─── ORNAMENT ─────────────────────────────────────────────────────────────────
function Ornament({ color = T.gold }: { color?: string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1.5rem' }}>
      <div style={{ flex:1, height:'1px', background:color, opacity:.3 }} />
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
        <rect x="4.24" y=".5" width="4.95" height="4.95" transform="rotate(45 4.24 .5)" fill={color} opacity=".7"/>
      </svg>
      <div style={{ flex:1, height:'1px', background:color, opacity:.3 }} />
    </div>
  );
}

// ─── SECTION LABEL ────────────────────────────────────────────────────────────
function SectionLabel({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p style={{
      fontSize:'0.6875rem', fontWeight:700, letterSpacing:'0.22em',
      textTransform:'uppercase', color: light ? T.champagne : T.gold,
      margin:'0 0 1rem', fontFamily:'var(--font-inter, system-ui, sans-serif)',
    }}>
      {children}
    </p>
  );
}

// ─── SECTION HEADING ─────────────────────────────────────────────────────────
function SectionHeading({ children, light, large }: { children: React.ReactNode; light?: boolean; large?: boolean }) {
  return (
    <h2 style={{
      fontSize: large ? 'clamp(2rem,5vw,3.5rem)' : 'clamp(1.75rem,4.2vw,2.75rem)',
      fontWeight: 700, lineHeight: 1.15,
      color: light ? '#F5EDD8' : T.dark,
      margin: '0 0 1rem',
      fontFamily: 'var(--font-playfair, Georgia, serif)',
    }}>
      {children}
    </h2>
  );
}

// ─── TOP NAV ─────────────────────────────────────────────────────────────────
function TopNav() {
  return (
    <nav style={{
      position:'sticky', top:0, zIndex:200,
      background:'rgba(250,247,242,0.88)',
      backdropFilter:'blur(14px)',
      borderBottom:`1px solid ${T.border}`,
      padding:'.875rem clamp(1.25rem,5vw,3rem)',
      display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1rem',
    }}>
      <Link href="/invitaciones" style={{
        fontSize:'.75rem', fontWeight:800, letterSpacing:'.2em',
        textTransform:'uppercase', color:T.dark, textDecoration:'none',
        fontFamily:'var(--font-inter, system-ui, sans-serif)',
      }}>
        Kompralo
      </Link>

      <div style={{ display:'flex', gap:'1.75rem', alignItems:'center' }}>
        <Link href="/sofia-y-alejandro" className="aw-nav-link" style={{ fontSize:'.8125rem', color:T.light, textDecoration:'none', fontWeight:500 }}>
          Ver demo
        </Link>
        <Link href="/invitaciones/precios" style={{
          display:'inline-flex', alignItems:'center', gap:'.375rem',
          fontSize:'.8125rem', fontWeight:700,
          background:T.dark, color:'#F5EDD8',
          padding:'.45rem 1.125rem', borderRadius:'6rem', textDecoration:'none',
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
    <div className="aw-phone-in" style={{ position:'relative', width:'195px', flexShrink:0 }}>
      {/* Glow behind phone */}
      <div aria-hidden style={{
        position:'absolute', top:'10%', left:'50%', transform:'translateX(-50%)',
        width:'160px', height:'280px',
        background:`radial-gradient(ellipse, rgba(184,150,106,0.22) 0%, transparent 75%)`,
        filter:'blur(20px)', zIndex:0, pointerEvents:'none',
      }} />

      {/* Phone shell */}
      <div className="aw-float" style={{
        position:'relative', zIndex:1,
        width:'195px', height:'395px',
        background:'linear-gradient(170deg, #2A1C12 0%, #141009 100%)',
        borderRadius:'38px',
        border:'2.5px solid rgba(184,150,106,0.55)',
        boxShadow:`
          0 50px 100px rgba(0,0,0,0.5),
          0 0 0 1px rgba(184,150,106,0.08),
          inset 0 1px 0 rgba(184,150,106,0.15),
          inset 0 -1px 0 rgba(0,0,0,0.5)
        `,
        overflow:'hidden',
      }}>
        {/* Dynamic Island */}
        <div style={{
          position:'absolute', top:'10px', left:'50%', transform:'translateX(-50%)',
          width:'72px', height:'22px', background:'#080604',
          borderRadius:'12px', zIndex:10,
        }} />

        {/* Screen content */}
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', paddingTop:'10px' }}>

          {/* Photo header with simulated image */}
          <div style={{
            height:'130px', flexShrink:0, position:'relative',
            background:`linear-gradient(170deg, #3D2615 0%, #251508 60%, #4A3020 100%)`,
          }}>
            {/* Linen texture simulation */}
            <div style={{ position:'absolute', inset:0, opacity:.08,
              backgroundImage:'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,.3) 3px, rgba(255,255,255,.3) 4px)',
            }} />
            {/* Photo light leak */}
            <div style={{
              position:'absolute', top:'-20px', right:'-10px', width:'120px', height:'120px', borderRadius:'50%',
              background:'radial-gradient(circle, rgba(212,184,150,0.25) 0%, transparent 70%)',
            }} />

            <div style={{ position:'absolute', bottom:'14px', left:0, right:0, textAlign:'center' }}>
              <div style={{
                fontSize:'6.5px', letterSpacing:'.25em', textTransform:'uppercase',
                color:'rgba(212,184,150,0.7)', marginBottom:'4px',
                fontFamily:'var(--font-inter, system-ui, sans-serif)',
              }}>nos casamos</div>
              <div style={{
                fontSize:'13px', fontWeight:600, color:'#F5EDD8', letterSpacing:'.06em',
                fontFamily:'var(--font-playfair, Georgia, serif)',
              }}>
                Sofía & Alejandro
              </div>
            </div>
          </div>

          {/* Body */}
          <div style={{
            flex:1, background:'#FAF7F2', padding:'11px 14px',
            display:'flex', flexDirection:'column', gap:'8px',
          }}>
            {/* Date */}
            <div style={{
              textAlign:'center', fontSize:'8.5px', fontWeight:700, color:T.gold,
              letterSpacing:'.12em', textTransform:'uppercase',
            }}>
              14 · Febrero · 2026
            </div>

            {/* Ornamental divider */}
            <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>
              <div style={{ flex:1, height:'1px', background:T.border }} />
              <svg width="6" height="6" viewBox="0 0 6 6" aria-hidden>
                <rect x="1.5" y=".5" width="4.24" height="4.24" transform="rotate(45 1.5 .5)" fill={T.gold} opacity=".6"/>
              </svg>
              <div style={{ flex:1, height:'1px', background:T.border }} />
            </div>

            {/* Countdown */}
            <div style={{ display:'flex', justifyContent:'center', gap:'12px' }}>
              {[['03','días'],['14','hrs'],['22','min']].map(([n,l]) => (
                <div key={l} style={{ textAlign:'center' }}>
                  <div style={{ fontSize:'14px', fontWeight:800, color:T.dark, lineHeight:1, fontFamily:'var(--font-playfair, Georgia, serif)' }}>{n}</div>
                  <div style={{ fontSize:'6px', color:T.light, letterSpacing:'.06em', marginTop:'2px', textTransform:'uppercase' }}>{l}</div>
                </div>
              ))}
            </div>

            {/* RSVP button */}
            <div style={{
              background:T.dark, borderRadius:'8px', padding:'5.5px', textAlign:'center',
              boxShadow:'0 2px 8px rgba(15,12,9,0.25)',
            }}>
              <span style={{ fontSize:'7.5px', fontWeight:700, color:'#F5EDD8', letterSpacing:'.08em', textTransform:'uppercase' }}>Confirmar Asistencia</span>
            </div>

            {/* WhatsApp */}
            <div style={{ background:'#22C55E', borderRadius:'8px', padding:'4.5px', textAlign:'center' }}>
              <span style={{ fontSize:'7px', fontWeight:700, color:'#fff', letterSpacing:'.04em' }}>Compartir por WhatsApp</span>
            </div>

            {/* Info row */}
            <div style={{ display:'flex', gap:'6px', justifyContent:'center' }}>
              {['Itinerario','Galería','Mapa'].map((t) => (
                <div key={t} style={{ fontSize:'6px', color:T.light, padding:'2px 5px', border:`1px solid ${T.border}`, borderRadius:'4px' }}>{t}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Side buttons */}
      <div style={{ position:'absolute', left:'-4px', top:'88px', width:'3px', height:'22px', background:'rgba(184,150,106,0.3)', borderRadius:'2px 0 0 2px', zIndex:2 }} />
      <div style={{ position:'absolute', left:'-4px', top:'118px', width:'3px', height:'22px', background:'rgba(184,150,106,0.3)', borderRadius:'2px 0 0 2px', zIndex:2 }} />
      <div style={{ position:'absolute', right:'-4px', top:'102px', width:'3px', height:'34px', background:'rgba(184,150,106,0.3)', borderRadius:'0 2px 2px 0', zIndex:2 }} />

      {/* Floating event badges */}
      <div className="aw-badge-a" style={{
        position:'absolute', top:'8%', right:'-68px', zIndex:20,
        background:T.white, borderRadius:'12px', padding:'8px 12px',
        boxShadow:'0 8px 28px rgba(15,12,9,0.14), 0 1px 0 rgba(229,221,210,1)',
        fontSize:'11.5px', fontWeight:700, color:T.dark, whiteSpace:'nowrap',
        display:'flex', alignItems:'center', gap:'6px',
        fontFamily:'var(--font-inter, system-ui, sans-serif)',
        border:`1px solid ${T.border}`,
      }}>
        <span style={{ fontSize:'13px' }}>💍</span> Boda
      </div>

      <div className="aw-badge-b" style={{
        position:'absolute', top:'44%', left:'-78px', zIndex:20,
        background:T.white, borderRadius:'12px', padding:'8px 12px',
        boxShadow:'0 8px 28px rgba(15,12,9,0.14), 0 1px 0 rgba(229,221,210,1)',
        fontSize:'11.5px', fontWeight:700, color:T.dark, whiteSpace:'nowrap',
        display:'flex', alignItems:'center', gap:'6px',
        fontFamily:'var(--font-inter, system-ui, sans-serif)',
        border:`1px solid ${T.border}`,
      }}>
        <span style={{ fontSize:'13px' }}>👑</span> XV Años
      </div>

      <div className="aw-badge-c" style={{
        position:'absolute', bottom:'14%', right:'-80px', zIndex:20,
        background:T.white, borderRadius:'12px', padding:'8px 12px',
        boxShadow:'0 8px 28px rgba(15,12,9,0.14), 0 1px 0 rgba(229,221,210,1)',
        fontSize:'11.5px', fontWeight:700, color:T.dark, whiteSpace:'nowrap',
        display:'flex', alignItems:'center', gap:'6px',
        fontFamily:'var(--font-inter, system-ui, sans-serif)',
        border:`1px solid ${T.border}`,
      }}>
        <span style={{ fontSize:'13px' }}>🍼</span> Baby Shower
      </div>
    </div>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section style={{
      background:T.ivory,
      backgroundImage:`
        radial-gradient(ellipse at 75% 15%, rgba(184,150,106,0.08) 0%, transparent 55%),
        radial-gradient(ellipse at 10% 85%, rgba(184,150,106,0.05) 0%, transparent 50%)
      `,
      padding:'clamp(3.5rem,9vw,6rem) clamp(1.25rem,5vw,3rem)',
      borderBottom:`1px solid ${T.border}`,
    }}>
      <div className="aw-hero-grid">
        {/* Text side */}
        <div>
          {/* Label + editorial number */}
          <div className="aw-hero-label" style={{ display:'flex', alignItems:'center', gap:'.875rem', marginBottom:'1.5rem' }}>
            <span style={{
              fontSize:'.6875rem', fontWeight:800, letterSpacing:'.22em',
              textTransform:'uppercase', color:T.gold,
              fontFamily:'var(--font-inter, system-ui, sans-serif)',
            }}>
              Invitaciones digitales
            </span>
            <div style={{ height:'1px', width:'2rem', background:T.gold, opacity:.4 }} />
          </div>

          {/* H1 editorial */}
          <h1 className="aw-hero-h1" style={{
            fontSize:'clamp(2.375rem,6.5vw,5rem)',
            fontWeight:700, lineHeight:1.06,
            color:T.dark,
            margin:'0 0 1.375rem',
            fontFamily:'var(--font-playfair, Georgia, serif)',
            letterSpacing:'-.01em',
          }}>
            Invitaciones<br />
            <em style={{ fontStyle:'italic', fontWeight:600 }}>digitales editables</em><br />
            para eventos<br />
            inolvidables.
          </h1>

          {/* Subtitle in Cormorant for elegance */}
          <p className="aw-hero-body" style={{
            fontSize:'clamp(1rem,2vw,1.1875rem)',
            color:T.mid, lineHeight:1.7,
            margin:'0 0 2.25rem',
            maxWidth:'36rem',
            fontFamily:'var(--font-cormorant, Georgia, serif)',
            fontStyle:'italic',
            fontWeight:500,
          }}>
            "Compra tu invitación, personalízala en línea y compártela por WhatsApp con todos tus invitados."
          </p>

          {/* CTAs */}
          <div className="aw-hero-ctas aw-hero-cta" style={{ display:'flex', gap:'.875rem', flexWrap:'wrap', marginBottom:'2.25rem' }}>
            <HoverButton
              href="/invitaciones/precios"
              style={{
                display:'inline-block', padding:'.875rem 2rem',
                background:T.dark, color:'#F5EDD8',
                borderRadius:'.625rem', fontSize:'.9375rem', fontWeight:700,
                textDecoration:'none', letterSpacing:'.02em',
              }}
            >
              Ver planes →
            </HoverButton>
            <HoverButton
              href="/sofia-y-alejandro"
              style={{
                display:'inline-block', padding:'.875rem 2rem',
                background:'transparent', color:T.dark,
                borderRadius:'.625rem', fontSize:'.9375rem', fontWeight:600,
                textDecoration:'none',
                border:`1.5px solid ${T.border}`,
              }}
            >
              Ver demo
            </HoverButton>
          </div>

          {/* Trust dots */}
          <div className="aw-hero-trust" style={{ display:'flex', gap:'1.375rem', flexWrap:'wrap', fontSize:'.78rem', color:T.light }}>
            {['Editable en línea','Lista para WhatsApp','Pago seguro','Acceso en celular'].map((t, i) => (
              <span key={t} style={{ display:'flex', alignItems:'center', gap:'.35rem' }}>
                {i > 0 && <span style={{ color:T.border, marginRight:'.25rem' }}>·</span>}
                <span style={{ color:T.gold, fontWeight:700, fontSize:'.65rem' }}>✓</span>
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Visual side */}
        <div className="aw-visual-col" style={{ display:'flex', justifyContent:'center', alignItems:'center', padding:'1rem clamp(2rem,6vw,4rem)' }}>
          <PhoneMockup />
        </div>
      </div>
    </section>
  );
}

// Inline link component for hero CTAs (server-renderable button wrapper)
function HoverButton({ href, children, style }: { href: string; children: React.ReactNode; style: React.CSSProperties }) {
  return <Link href={href} style={style}>{children}</Link>;
}

// ─── TRUST STRIP ─────────────────────────────────────────────────────────────
function TrustStrip() {
  return (
    <div style={{ background:T.cream, borderBottom:`1px solid ${T.border}`, padding:'.875rem clamp(1.25rem,5vw,3rem)' }}>
      <div className="aw-trust-row">
        {[
          '🔒 Pago seguro con Stripe',
          '📲 Compatible con cualquier celular',
          '✏️ Editable en línea',
          '💬 Comparte por WhatsApp',
          '🇲🇽 Soporte en español',
        ].map((t) => (
          <span key={t} style={{ fontSize:'.78rem', color:T.mid, whiteSpace:'nowrap', fontWeight:500 }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

// ─── CÓMO FUNCIONA ────────────────────────────────────────────────────────────
const STEPS = [
  { n:'01', icon:'🛒', title:'Elige tu plan',         desc:'Basic, Premium o Deluxe según tu evento y presupuesto.' },
  { n:'02', icon:'🔒', title:'Paga seguro',            desc:'Pago con tarjeta mediante Stripe. Inmediato y sin sorpresas.' },
  { n:'03', icon:'✏️', title:'Edita en línea',         desc:'Personaliza textos, fotos, itinerario y más desde tu celular.' },
  { n:'04', icon:'💬', title:'Comparte por WhatsApp',  desc:'Envía el link a todos tus invitados. Sin descargas.' },
];

function HowItWorks() {
  return (
    <section style={{ background:T.white, padding:'clamp(3.5rem,8vw,5.5rem) clamp(1.25rem,5vw,3rem)', borderBottom:`1px solid ${T.border}` }}>
      <div style={{ maxWidth:'1040px', margin:'0 auto' }}>
        <Reveal style={{ textAlign:'center', marginBottom:'3.5rem' }}>
          <SectionLabel>Cómo funciona</SectionLabel>
          <SectionHeading>Listo en minutos, desde tu celular</SectionHeading>
          <p style={{ color:T.mid, fontSize:'.9375rem', lineHeight:1.65, maxWidth:'34rem', margin:'0 auto' }}>
            Sin instalar nada. Sin complicaciones técnicas. Cuatro pasos y tu invitación está lista.
          </p>
        </Reveal>

        <Stagger className="aw-steps-grid">
          {STEPS.map((s) => (
            <Item key={s.n}>
              <HoverCard lift={5} style={{
                background: T.ivory,
                border:`1px solid ${T.border}`,
                borderRadius:'1rem', padding:'1.75rem 1.375rem',
                height:'100%', position:'relative', overflow:'hidden',
              }}>
                {/* Ghost number */}
                <div aria-hidden style={{
                  position:'absolute', top:'-8px', right:'10px',
                  fontSize:'4.5rem', fontWeight:900,
                  color:`rgba(184,150,106,0.08)`,
                  lineHeight:1, userSelect:'none',
                  fontFamily:'var(--font-playfair, Georgia, serif)',
                }}>{s.n}</div>

                {/* Icon in circle */}
                <div style={{
                  width:'2.625rem', height:'2.625rem', borderRadius:'50%',
                  background:T.dark,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'1.0625rem', marginBottom:'1.125rem',
                  boxShadow:'0 4px 14px rgba(15,12,9,0.2)',
                }}>{s.icon}</div>

                <h3 style={{ margin:'0 0 .5rem', fontSize:'.9375rem', fontWeight:700, color:T.dark }}>{s.title}</h3>
                <p style={{ margin:0, fontSize:'.8125rem', color:T.mid, lineHeight:1.65 }}>{s.desc}</p>
              </HoverCard>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

// ─── TIPOS DE EVENTO ─────────────────────────────────────────────────────────
const EVENTS = [
  {
    initial:'B', name:'Bodas',
    desc:'Elegante y atemporable para el día más importante.',
    bg:'linear-gradient(150deg,#F9F3E8 0%,#EDE3CF 100%)',
    accent:'#B8966A', text:'#5C4A37', border:'rgba(184,150,106,0.25)',
  },
  {
    initial:'Q', name:'XV Años',
    desc:'Glamour y magia para el cumpleaños más especial.',
    bg:'linear-gradient(150deg,#F5E4F0 0%,#E2CCDC 100%)',
    accent:'#9B6BB5', text:'#5C3A6B', border:'rgba(155,107,181,0.2)',
  },
  {
    initial:'B', name:'Bautizo',
    desc:'Suave, puro y lleno de amor familiar.',
    bg:'linear-gradient(150deg,#E6EFF9 0%,#CDD8ED 100%)',
    accent:'#5B8EB5', text:'#2D5070', border:'rgba(91,142,181,0.2)',
  },
  {
    initial:'B', name:'Baby Shower',
    desc:'Dulce y tierno para recibir la nueva vida.',
    bg:'linear-gradient(150deg,#F0F5E6 0%,#D8EDCC 100%)',
    accent:'#6BAA72', text:'#3A6640', border:'rgba(107,170,114,0.2)',
  },
  {
    initial:'C', name:'Cumpleaños',
    desc:'Colorido y festivo para celebrar con estilo.',
    bg:'linear-gradient(150deg,#FEF0E6 0%,#F5DCCB 100%)',
    accent:'#D4884A', text:'#7A4020', border:'rgba(212,136,74,0.2)',
  },
];

function EventTypes() {
  return (
    <section style={{ background:T.ivory, padding:'clamp(3.5rem,8vw,5.5rem) clamp(1.25rem,5vw,3rem)', borderBottom:`1px solid ${T.border}` }}>
      <div style={{ maxWidth:'1040px', margin:'0 auto' }}>
        <Reveal style={{ textAlign:'center', marginBottom:'3rem' }}>
          <SectionLabel>Para cada ocasión</SectionLabel>
          <SectionHeading>Una invitación para cada momento especial</SectionHeading>
        </Reveal>

        <Stagger className="aw-events-grid">
          {EVENTS.map((ev) => (
            <Item key={ev.name}>
              <HoverCard lift={5} style={{
                background:ev.bg,
                border:`1px solid ${ev.border}`,
                borderRadius:'1rem', padding:'1.5rem 1.125rem',
                textAlign:'center', position:'relative', overflow:'hidden',
                height:'100%',
              }}>
                {/* Decorative initial (low opacity) */}
                <div aria-hidden style={{
                  position:'absolute', bottom:'-8px', right:'-4px',
                  fontSize:'4.5rem', fontWeight:800,
                  color:ev.accent, opacity:.08, lineHeight:1,
                  fontFamily:'var(--font-playfair, Georgia, serif)',
                  userSelect:'none',
                }}>{ev.initial}</div>

                {/* Icon frame */}
                <div style={{
                  width:'2.875rem', height:'2.875rem', borderRadius:'50%',
                  background:'rgba(255,255,255,0.75)',
                  margin:'0 auto .875rem',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  boxShadow:'0 2px 12px rgba(0,0,0,0.08)',
                  border:`1.5px solid ${ev.border}`,
                  position:'relative',
                }}>
                  {/* Color dot inside */}
                  <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:ev.accent }} />
                </div>

                <h3 style={{ margin:'0 0 .375rem', fontSize:'.9375rem', fontWeight:700, color:ev.text }}>{ev.name}</h3>
                <p style={{ margin:0, fontSize:'.75rem', color:ev.text, lineHeight:1.55, opacity:.75 }}>{ev.desc}</p>

                {/* Bottom accent bar */}
                <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'2.5px', background:`linear-gradient(90deg, transparent, ${ev.accent}, transparent)`, opacity:.4 }} />
              </HoverCard>
            </Item>
          ))}
        </Stagger>
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
    <section style={{
      background:T.dark,
      backgroundImage:`radial-gradient(ellipse at 80% 20%, rgba(184,150,106,0.06) 0%, transparent 60%)`,
      padding:'clamp(3.5rem,8vw,5.5rem) clamp(1.25rem,5vw,3rem)',
      borderBottom:`1px solid rgba(255,255,255,0.05)`,
    }}>
      <div style={{ maxWidth:'1040px', margin:'0 auto' }}>
        <Reveal style={{ textAlign:'center', marginBottom:'3rem' }}>
          <SectionLabel light>Beneficios</SectionLabel>
          <SectionHeading light>Todo lo que necesitas en una sola invitación</SectionHeading>
          <p style={{ color:'#C5B0A0', fontSize:'.9375rem', lineHeight:1.65, maxWidth:'34rem', margin:'0 auto' }}>
            Diseñado para quienes quieren una invitación bonita, clara y fácil de compartir.
          </p>
        </Reveal>

        <Stagger className="aw-benefits-grid">
          {BENEFITS.map((b) => (
            <Item key={b.title}>
              <HoverCard lift={4} style={{
                background:'rgba(255,255,255,0.04)',
                border:'1px solid rgba(184,150,106,0.15)',
                borderRadius:'.875rem', padding:'1.5rem 1.25rem',
                height:'100%',
              }}>
                {/* Gold-ring icon */}
                <div style={{
                  width:'2.5rem', height:'2.5rem', borderRadius:'50%',
                  background:'rgba(184,150,106,0.1)',
                  border:'1px solid rgba(184,150,106,0.2)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'1.125rem', marginBottom:'1rem',
                }}>{b.icon}</div>

                <h3 style={{ margin:'0 0 .3rem', fontSize:'.9rem', fontWeight:700, color:'#F5EDD8' }}>{b.title}</h3>
                <p style={{ margin:0, fontSize:'.8rem', color:'#C5B0A0', lineHeight:1.6 }}>{b.desc}</p>
              </HoverCard>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

// ─── PRICING PREVIEW ─────────────────────────────────────────────────────────
const PLANS = [
  {
    id:'basic', name:'Basic', price:'$499',
    ideal:'Ideal para bautizos, baby showers y cumpleaños',
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
    <section style={{ background:T.white, padding:'clamp(3.5rem,8vw,5.5rem) clamp(1.25rem,5vw,3rem)', borderBottom:`1px solid ${T.border}` }}>
      <div style={{ maxWidth:'1040px', margin:'0 auto' }}>
        <Reveal style={{ textAlign:'center', marginBottom:'3rem' }}>
          <SectionLabel>Planes</SectionLabel>
          <SectionHeading>Elige el plan ideal para tu evento</SectionHeading>
          <p style={{ color:T.mid, fontSize:'.9375rem', lineHeight:1.65 }}>
            Pago único. Sin suscripción. Sin sorpresas.
          </p>
        </Reveal>

        <Stagger className="aw-plans-grid" gap={0.12}>
          {PLANS.map((plan) => (
            <Item key={plan.id}>
              <HoverCard lift={plan.dark ? 8 : 5} style={{ height:'100%' }}>
                <div style={{
                  position:'relative', display:'flex', flexDirection:'column', height:'100%',
                  background:plan.dark ? T.dark : T.ivory,
                  border:plan.dark ? `2px solid ${T.gold}` : `1px solid ${T.border}`,
                  borderRadius:'1.125rem', padding:'2.125rem 1.625rem',
                  boxShadow:plan.dark
                    ? `0 12px 48px rgba(184,150,106,0.2), 0 2px 0 rgba(184,150,106,0.3) inset`
                    : '0 2px 12px rgba(15,12,9,0.05)',
                }}>
                  {plan.badge && (
                    <div style={{
                      position:'absolute', top:'-1px', left:'50%', transform:'translateX(-50%)',
                      background:T.gold, color:T.dark,
                      fontSize:'.625rem', fontWeight:800, letterSpacing:'.12em',
                      padding:'.25rem .875rem', borderRadius:'0 0 .5rem .5rem', whiteSpace:'nowrap',
                    }}>{plan.badge}</div>
                  )}

                  <p style={{ margin:'0 0 .25rem', fontSize:'.72rem', fontWeight:600, color: plan.dark ? T.champagne : T.light, letterSpacing:'.05em' }}>
                    {plan.ideal}
                  </p>
                  <h3 style={{ margin:'0 0 1rem', fontSize:'1.375rem', fontWeight:700, color: plan.dark ? '#F5EDD8' : T.dark }}>{plan.name}</h3>

                  <div style={{ marginBottom:'1.375rem' }}>
                    <span style={{ fontSize:'2.25rem', fontWeight:800, lineHeight:1, color: plan.dark ? '#F5EDD8' : T.dark }}>{plan.price}</span>
                    <span style={{ fontSize:'.8rem', color: plan.dark ? '#C5B0A0' : T.light, marginLeft:'.3rem' }}>MXN · pago único</span>
                  </div>

                  <ul style={{ listStyle:'none', padding:0, margin:'0 0 1.625rem', display:'flex', flexDirection:'column', gap:'.5rem', flex:1 }}>
                    {plan.features.map((f) => (
                      <li key={f} style={{ display:'flex', gap:'.5rem', fontSize:'.8125rem', color: plan.dark ? '#C5B0A0' : T.mid }}>
                        <span style={{ color:T.gold, flexShrink:0, marginTop:'.05rem' }}>✓</span> {f}
                      </li>
                    ))}
                  </ul>

                  <Link href="/invitaciones/precios" style={{
                    display:'block', textAlign:'center', padding:'.8125rem',
                    background:plan.dark ? T.gold : T.dark,
                    color:plan.dark ? T.dark : '#F5EDD8',
                    borderRadius:'.625rem', fontSize:'.875rem', fontWeight:700, textDecoration:'none',
                  }}>
                    Ver detalles y comprar
                  </Link>
                </div>
              </HoverCard>
            </Item>
          ))}
        </Stagger>

        <Reveal delay={0.2}>
          <p style={{ textAlign:'center', marginTop:'1.75rem', fontSize:'.78rem', color:T.light }}>
            Pago seguro con Stripe · Acceso inmediato · Soporte en español
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ─── DEMO TEASER ─────────────────────────────────────────────────────────────
function DemoTeaser() {
  return (
    <section style={{ background:T.cream, padding:'clamp(3rem,7vw,4.5rem) clamp(1.25rem,5vw,3rem)', borderBottom:`1px solid ${T.border}` }}>
      <div style={{ maxWidth:'1040px', margin:'0 auto' }}>
        <Reveal style={{ textAlign:'center' }}>
          <Ornament />
          <SectionLabel>Demo</SectionLabel>
          <SectionHeading>¿Cómo se ve una invitación real?</SectionHeading>
          <p style={{ color:T.mid, fontSize:'.9375rem', lineHeight:1.65, maxWidth:'32rem', margin:'0 auto 2rem' }}>
            Ve la invitación de demostración de Sofía y Alejandro — la misma calidad y experiencia que recibirás.
          </p>

          <HoverCard lift={4} style={{ display:'inline-block' }}>
            <Link href="/sofia-y-alejandro" style={{
              display:'inline-flex', alignItems:'center', gap:'.75rem',
              padding:'1rem 2rem',
              background:T.dark, color:'#F5EDD8',
              borderRadius:'.75rem', fontSize:'.9375rem', fontWeight:700,
              textDecoration:'none',
            }}>
              <span>Ver invitación demo</span>
              <span style={{ fontSize:'1.125rem' }}>→</span>
            </Link>
          </HoverCard>

          <div style={{ marginTop:'1.375rem', display:'flex', gap:'1.5rem', justifyContent:'center', flexWrap:'wrap' }}>
            {['Galería de fotos','Cuenta regresiva','RSVP','Música','Itinerario','Mapa'].map((f) => (
              <span key={f} style={{ fontSize:'.78rem', color:T.light, display:'flex', alignItems:'center', gap:'.35rem' }}>
                <span style={{ color:T.gold, fontSize:'.65rem' }}>✦</span> {f}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────
const FAQS = [
  { q:'¿Cómo recibo mi invitación después de pagar?', a:'Recibirás un correo con un enlace de acceso. Al abrirlo, entrarás directo a tu editor para personalizar tu invitación desde cualquier celular.' },
  { q:'¿Puedo editarla después de comprarla?',        a:'Sí. Puedes editar textos, fechas, fotos, itinerario y más desde el editor en línea cuando quieras.' },
  { q:'¿Cómo se comparte con los invitados?',         a:'Una vez lista, copias el enlace de tu invitación y lo envías por WhatsApp, mensaje o donde prefieras. Sin descargas para tus invitados.' },
  { q:'¿Tiene confirmación de asistencia (RSVP)?',    a:'Sí. Todos los planes incluyen RSVP para que tus invitados confirmen su asistencia directamente en la invitación.' },
  { q:'¿Puedo usarla desde mi celular?',              a:'Sí, tanto el editor como la invitación están diseñados para funcionar perfectamente en cualquier celular, sin instalar apps.' },
  { q:'¿Qué diferencia hay entre los planes?',        a:'Basic incluye lo esencial. Premium agrega galería, música, itinerario y mapa. Deluxe incluye todo lo anterior más StoryBook animado, padrinos, hospedaje y mesa de regalos.' },
];

function FAQ() {
  return (
    <section style={{ background:T.white, padding:'clamp(3.5rem,8vw,5.5rem) clamp(1.25rem,5vw,3rem)', borderBottom:`1px solid ${T.border}` }}>
      <div style={{ maxWidth:'680px', margin:'0 auto' }}>
        <Reveal style={{ textAlign:'center', marginBottom:'2.75rem' }}>
          <SectionLabel>Preguntas frecuentes</SectionLabel>
          <SectionHeading>Todo lo que necesitas saber</SectionHeading>
        </Reveal>

        <Stagger gap={0.06}>
          {FAQS.map((faq) => (
            <Item key={faq.q}>
              <details className="aw-faq aw-faq-item" style={{
                background:T.ivory, border:`1px solid ${T.border}`,
                borderRadius:'.75rem', overflow:'hidden', marginBottom:'.5rem',
              }}>
                <summary style={{
                  padding:'1.125rem 1.375rem', cursor:'pointer',
                  fontWeight:600, fontSize:'.9375rem', color:T.dark,
                  display:'flex', justifyContent:'space-between', alignItems:'center',
                  gap:'1rem', userSelect:'none', listStyle:'none',
                }}>
                  {faq.q}
                  <span className="aw-faq-plus" style={{ fontSize:'1.25rem', color:T.gold, flexShrink:0, fontWeight:300, lineHeight:1 }}>+</span>
                </summary>
                <p style={{
                  margin:0, padding:'0 1.375rem 1.125rem',
                  fontSize:'.875rem', color:T.mid, lineHeight:1.7,
                  borderTop:`1px solid ${T.border}`, paddingTop:'.875rem',
                }}>{faq.a}</p>
              </details>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

// ─── FINAL CTA ────────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section style={{
      background:`linear-gradient(145deg, #0F0C09 0%, #1C1208 60%, #0F0C09 100%)`,
      backgroundImage:`radial-gradient(ellipse at 50% 60%, rgba(184,150,106,0.06) 0%, transparent 65%)`,
      padding:'clamp(4rem,9vw,6.5rem) clamp(1.25rem,5vw,3rem)',
      textAlign:'center',
    }}>
      <div style={{ maxWidth:'600px', margin:'0 auto' }}>
        <Reveal>
          <Ornament color={T.champagne} />
          <SectionLabel light>Empieza hoy</SectionLabel>
        </Reveal>

        <Reveal delay={0.1}>
          <h2 style={{
            fontSize:'clamp(2rem,5.5vw,3.5rem)',
            fontWeight:700, color:'#F5EDD8', margin:'0 0 1.125rem',
            lineHeight:1.12,
            fontFamily:'var(--font-playfair, Georgia, serif)',
            letterSpacing:'-.01em',
          }}>
            Tu invitación digital<br /><em style={{ fontStyle:'italic', fontWeight:600 }}>lista en minutos.</em>
          </h2>
        </Reveal>

        <Reveal delay={0.18}>
          <p style={{ color:'#C5B0A0', fontSize:'clamp(.9375rem,1.8vw,1.0625rem)', lineHeight:1.7, margin:'0 0 2.5rem' }}>
            Paga una sola vez. Edita desde tu celular. Comparte por WhatsApp.
            Desde <strong style={{ color:T.gold }}>$499 MXN</strong>.
          </p>
        </Reveal>

        <Reveal delay={0.26}>
          <div style={{ display:'flex', gap:'.875rem', justifyContent:'center', flexWrap:'wrap' }}>
            <HoverCard lift={4} style={{ display:'inline-block' }}>
              <Link href="/invitaciones/precios" style={{
                display:'inline-block', padding:'.9375rem 2.25rem',
                background:T.gold, color:T.dark,
                borderRadius:'.625rem', fontSize:'1rem', fontWeight:700, textDecoration:'none',
              }}>
                Crear mi invitación →
              </Link>
            </HoverCard>
            <HoverCard lift={4} style={{ display:'inline-block' }}>
              <Link href="/sofia-y-alejandro" style={{
                display:'inline-block', padding:'.9375rem 2.25rem',
                background:'transparent', color:'#F5EDD8',
                borderRadius:'.625rem', fontSize:'1rem', fontWeight:600,
                textDecoration:'none', border:'1.5px solid rgba(245,237,216,0.2)',
              }}>
                Ver demo
              </Link>
            </HoverCard>
          </div>
        </Reveal>

        <Reveal delay={0.34}>
          <p style={{ marginTop:'2rem', fontSize:'.78rem', color:'#6B5540' }}>
            Después del pago recibirás acceso para editar tu invitación · Pago seguro con Stripe
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{
      background:T.dark, borderTop:'1px solid rgba(255,255,255,0.05)',
      padding:'1.5rem clamp(1.25rem,5vw,3rem)',
      display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'.75rem',
    }}>
      <span style={{ fontSize:'.6875rem', fontWeight:800, letterSpacing:'.22em', textTransform:'uppercase', color:'#3D2B1A' }}>Kompralo</span>
      <div style={{ display:'flex', gap:'1.75rem', flexWrap:'wrap' }}>
        {[{href:'/invitaciones/precios',label:'Precios'},{href:'/sofia-y-alejandro',label:'Demo'},{href:'/login',label:'Acceder'}].map(({ href, label }) => (
          <Link key={href} href={href} className="aw-nav-link" style={{ fontSize:'.8125rem', color:'#6B5540', textDecoration:'none' }}>{label}</Link>
        ))}
      </div>
      <span style={{ fontSize:'.6875rem', color:'#3D2B1A' }}>© 2026 Kompralo</span>
    </footer>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function InvitacionesPage() {
  return (
    <div style={{ fontFamily:'var(--font-inter, system-ui, sans-serif)', background:T.ivory }}>
      <PageStyles />
      <TopNav />
      <HeroSection />
      <TrustStrip />
      <HowItWorks />
      <EventTypes />
      <Benefits />
      <PricingPreview />
      <DemoTeaser />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}
