/* eslint-disable @next/next/no-img-element */
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
      @keyframes aw-hero-fade {
        from { opacity:0; transform:translateY(22px); }
        to   { opacity:1; transform:translateY(0); }
      }
      @keyframes aw-hero-label {
        from { opacity:0; transform:translateX(-10px); }
        to   { opacity:1; transform:translateX(0); }
      }

      /* ── Reduce motion ─────────────────────── */
      @media (prefers-reduced-motion: reduce) {
        .aw-hero-label, .aw-hero-h1, .aw-hero-body, .aw-hero-cta {
          animation:none !important;
        }
      }

      /* ── Hero reveals ──────────────────────── */
      .aw-hero-label { animation:aw-hero-label .6s cubic-bezier(0.65,0,.35,1) .1s both; }
      .aw-hero-h1    { animation:aw-hero-fade  .75s cubic-bezier(0.65,0,.35,1) .2s both; }
      .aw-hero-body  { animation:aw-hero-fade  .7s  cubic-bezier(0.65,0,.35,1) .35s both; }
      .aw-hero-cta   { animation:aw-hero-fade  .65s cubic-bezier(0.65,0,.35,1) .5s both; }

      /* ── Hover states ──────────────────────── */
      .aw-nav-link { transition:color .2s ease; }
      .aw-nav-link:hover { color:#0F0C09 !important; }

      .aw-faq-item { transition:background .2s ease; }
      .aw-faq-item:hover { background:#F7F2EA !important; }
      details.aw-faq[open] summary .aw-faq-plus { transform:rotate(45deg); }
      .aw-faq-plus { transition:transform .25s cubic-bezier(0.65,0,.35,1); display:inline-block; }
      details.aw-faq summary::-webkit-details-marker { display:none; }

      .aw-btn-primary {
        display: inline-block;
        padding: .875rem 2rem;
        background: #0F0C09;
        color: #F5EDD8;
        border-radius: .625rem;
        font-size: .9375rem;
        font-weight: 700;
        text-decoration: none;
        letter-spacing: .02em;
        box-shadow: 0 4px 14px rgba(15,12,9,0.15);
        transition: opacity 0.2s ease;
      }
      .aw-btn-primary:hover {
        opacity: 0.9 !important;
      }

      .aw-btn-secondary {
        display: inline-block;
        padding: .875rem 2rem;
        background: transparent;
        color: #0F0C09;
        border-radius: .625rem;
        font-size: .9375rem;
        font-weight: 600;
        text-decoration: none;
        border: 1.5px solid #E5DDD2;
        transition: background 0.2s ease;
      }
      .aw-btn-secondary:hover {
        background: rgba(15, 12, 9, 0.03) !important;
      }

      /* ── Collage editorial ─────────────────── */
      .aw-collage {
        position: relative;
        width: 100%;
        max-width: 500px;
        height: 480px;
        margin: 0 auto;
      }
      .aw-collage-img1 {
        position: absolute;
        top: 0;
        left: 0;
        width: 65%;
        height: 80%;
        border-radius: 2rem;
        box-shadow: 0 20px 40px rgba(15,12,9,0.12);
        object-fit: cover;
      }
      .aw-collage-img2 {
        position: absolute;
        bottom: 5%;
        right: 0;
        width: 52%;
        height: 62%;
        border-radius: 1.5rem;
        border: 6px solid #FAF7F2;
        box-shadow: 0 24px 48px rgba(15,12,9,0.18);
        object-fit: cover;
      }
      .aw-collage-img3 {
        position: absolute;
        top: 8%;
        right: 8%;
        width: 32%;
        height: 32%;
        border-radius: 1rem;
        border: 4px solid #FAF7F2;
        box-shadow: 0 12px 24px rgba(15,12,9,0.1);
        object-fit: cover;
      }

      /* ── Event cards ───────────────────────── */
      .aw-event-card {
        position: relative;
        border-radius: 1.25rem;
        overflow: hidden;
        height: 340px;
        border: 1px solid #E5DDD2;
        box-shadow: 0 4px 12px rgba(15,12,9,0.04);
      }
      .aw-event-card-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        filter: grayscale(0);
      }
      @media (hover: hover) and (min-width: 769px) {
        .aw-event-card-img {
          filter: grayscale(100%);
        }
        .aw-event-card:hover .aw-event-card-img {
          filter: grayscale(0%);
          transform: scale(1.06);
        }
      }
      .aw-event-card-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(to top, rgba(15,12,9,0.95) 0%, rgba(15,12,9,0.4) 50%, rgba(15,12,9,0) 100%);
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        padding: 1.5rem 1.25rem;
        text-align: left;
      }

      /* ── Grids ─────────────────────────────── */
      .aw-hero-grid {
        display: grid;
        grid-template-columns: 1.15fr 0.85fr;
        gap: clamp(2rem,6vw,5rem);
        align-items: center;
        max-width: 1080px;
        margin: 0 auto;
      }
      .aw-social-grid {
        display: grid;
        grid-template-columns: 1fr 1.1fr;
        gap: clamp(2rem,6vw,4.5rem);
        align-items: center;
      }

      @media (max-width:768px) {
        .aw-hero-grid { grid-template-columns:1fr; text-align:center; }
        .aw-hero-trust { justify-content:center !important; }
        .aw-hero-ctas  { justify-content:center !important; }
        .aw-visual-col { order:-1; margin-bottom:1.5rem; }
        .aw-collage {
          height: 320px;
          max-width: 380px;
        }
        .aw-collage-img2 { border-width: 4px; }
        .aw-collage-img3 { border-width: 3px; }
        
        .aw-social-grid { grid-template-columns: 1fr; }
        .aw-social-img-container { order: 1; margin-top: 1.5rem; }
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
        gap: 1.25rem;
      }
      @media (max-width:880px) { .aw-events-grid { grid-template-columns:repeat(3,1fr); } }
      @media (max-width:560px) { .aw-events-grid { grid-template-columns:repeat(2,1fr); } }
      @media (max-width:400px) { .aw-events-grid { grid-template-columns:1fr; } }

      .aw-benefits-grid {
        display: grid;
        grid-template-columns: repeat(3,1fr);
        gap: 1.25rem;
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
        gap: clamp(1rem,4vw,3.5rem);
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

// ─── EDITORIAL COLLAGE ────────────────────────────────────────────────────────
function EditorialCollage() {
  return (
    <div className="aw-collage">
      {/* Background glow */}
      <div aria-hidden style={{
        position:'absolute', top:'10%', left:'50%', transform:'translateX(-50%)',
        width:'280px', height:'280px',
        background:`radial-gradient(circle, rgba(184,150,106,0.15) 0%, transparent 70%)`,
        filter:'blur(30px)', zIndex:0, pointerEvents:'none',
      }} />

      {/* Main Image (Couple) */}
      <div className="aw-collage-img1">
        <img
          src="/images/invitaciones/hero-wedding-editorial.webp"
          alt="Boda editorial premium"
          style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'2rem' }}
          loading="eager"
        />
      </div>

      {/* Overlapping detail (Stationery) */}
      <div className="aw-collage-img2">
        <img
          src="/images/invitaciones/invitation-paper-detail.webp"
          alt="Papelería y detalles"
          style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'1.5rem' }}
          loading="eager"
        />
      </div>

      {/* Small detail (Flowers/Table) */}
      <div className="aw-collage-img3">
        <img
          src="/images/invitaciones/wedding-details.webp"
          alt="Detalles de mesa"
          style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'1rem' }}
          loading="eager"
        />
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
          {/* Label + editorial line */}
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
            fontSize:'clamp(2.375rem,6.5vw,4.5rem)',
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
            fontSize:'clamp(1.05rem,2vw,1.25rem)',
            color:T.mid, lineHeight:1.7,
            margin:'0 0 2.25rem',
            maxWidth:'36rem',
            fontFamily:'var(--font-cormorant, Georgia, serif)',
            fontStyle:'italic',
            fontWeight:500,
          }}>
            Compra tu invitación, personalízala en línea y compártela por WhatsApp con todos tus invitados.
          </p>

          {/* CTAs */}
          <div className="aw-hero-ctas aw-hero-cta" style={{ display:'flex', gap:'.875rem', flexWrap:'wrap', marginBottom:'2.25rem' }}>
            <Link href="/invitaciones/precios" className="aw-btn-primary">
              Ver planes
            </Link>
            <Link href="/sofia-y-alejandro" className="aw-btn-secondary">
              Ver invitación demo
            </Link>
          </div>

          {/* Trust dots */}
          <div className="aw-hero-trust" style={{ display:'flex', gap:'1.375rem', flexWrap:'wrap', fontSize:'.78rem', color:T.light }}>
            {['Editable en línea','Lista para WhatsApp','Pago seguro','Diseños para cada evento'].map((t, i) => (
              <span key={t} style={{ display:'flex', alignItems:'center', gap:'.35rem' }}>
                {i > 0 && <span style={{ color:T.border, marginRight:'.25rem' }}>·</span>}
                <span style={{ color:T.gold, fontWeight:700, fontSize:'.65rem' }}>✓</span>
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Visual side - Collage */}
        <div className="aw-visual-col" style={{ display:'flex', justifyContent:'center', alignItems:'center' }}>
          <EditorialCollage />
        </div>
      </div>
    </section>
  );
}

// ─── TRUST STRIP ─────────────────────────────────────────────────────────────
function TrustStrip() {
  return (
    <div style={{ background:T.cream, borderBottom:`1px solid ${T.border}`, padding:'.875rem clamp(1.25rem,5vw,3rem)' }}>
      <div className="aw-trust-row">
        {[
          '🔒 Pago seguro con Stripe',
          '📱 Acceso desde celular',
          '💬 Link listo para WhatsApp',
          '✏️ Edición en línea',
        ].map((t) => (
          <span key={t} style={{ fontSize:'.78rem', color:T.mid, whiteSpace:'nowrap', fontWeight:500, letterSpacing:'.02em' }}>{t}</span>
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
    name: 'Bodas',
    desc: 'Elegancia atemporal para el día más importante.',
    image: '/images/invitaciones/hero-wedding-editorial.webp',
  },
  {
    name: 'XV Años',
    desc: 'Glamour y magia para una celebración inolvidable.',
    image: '/images/invitaciones/xv-event-editorial.webp',
  },
  {
    name: 'Bautizos',
    desc: 'Detalles suaves, puros y llenos de amor familiar.',
    image: '/images/invitaciones/baptism-soft-event.webp',
  },
  {
    name: 'Baby Shower',
    desc: 'Diseños dulces y tiernos para recibir la nueva vida.',
    image: '/images/invitaciones/baby-shower-pastel.webp',
  },
  {
    name: 'Cumpleaños',
    desc: 'Estilo y festividad premium para celebrar con alegría.',
    image: '/images/invitaciones/birthday-premium.webp',
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
              <HoverCard lift={5} style={{ height: '100%' }}>
                <div className="aw-event-card">
                  <img
                    src={ev.image}
                    alt={ev.name}
                    className="aw-event-card-img"
                    loading="lazy"
                  />
                  <div className="aw-event-card-overlay">
                    <h3 style={{
                      margin:'0 0 .375rem',
                      fontSize:'1.25rem',
                      fontWeight:700,
                      color:'#FFFFFF',
                      fontFamily:'var(--font-playfair, Georgia, serif)',
                    }}>{ev.name}</h3>
                    <p style={{
                      margin:0,
                      fontSize:'.8125rem',
                      color:'#FAF7F2',
                      lineHeight:1.4,
                      opacity:.95,
                      fontFamily:'var(--font-inter, system-ui, sans-serif)',
                    }}>{ev.desc}</p>
                  </div>
                </div>
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

// ─── SOCIAL PROOF SECTION ─────────────────────────────────────────────────────
function SocialProofSection() {
  return (
    <section style={{
      background: T.ivory,
      padding: 'clamp(4rem,9vw,6rem) clamp(1.25rem,5vw,3rem)',
      borderBottom: `1px solid ${T.border}`,
      position: 'relative',
    }}>
      <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
        <div className="aw-social-grid">
          {/* Left side: emotional image */}
          <div className="aw-social-img-container">
            <Reveal>
              <div style={{
                position: 'relative',
                borderRadius: '2rem',
                overflow: 'hidden',
                boxShadow: '0 24px 48px rgba(15,12,9,0.12)',
                aspectRatio: '4/5',
                maxHeight: '520px',
              }}>
                <img
                  src="/images/invitaciones/social-proof-event-1.webp"
                  alt="Momentos compartidos con elegancia"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="lazy"
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(15,12,9,0.3) 0%, transparent 40%)',
                }} />
              </div>
            </Reveal>
          </div>

          {/* Right side: testimonials */}
          <div>
            <Reveal>
              <SectionLabel>Historias que facilitamos</SectionLabel>
              <SectionHeading>Creada para momentos que merecen compartirse bonito</SectionHeading>
              <p style={{
                color: T.mid,
                fontSize: '.9375rem',
                lineHeight: 1.65,
                marginBottom: '2.5rem',
                fontFamily: 'var(--font-inter, system-ui, sans-serif)',
              }}>
                Diseñada para parejas, familias y anfitriones que quieren una invitación clara, elegante y fácil de compartir desde el celular.
              </p>
            </Reveal>

            <Stagger style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {[
                {
                  quote: '“Queríamos algo bonito y fácil de mandar por WhatsApp. La invitación se vio elegante y todos pudieron abrirla desde el celular sin instalar nada.”',
                  author: 'Pareja de boda',
                  event: 'Boda Premium',
                },
                {
                  quote: '“Me gustó tener toda la información del evento en un solo link, sin mandar imagen por imagen. Se ve súper formal.”',
                  author: 'Anfitriona de XV años',
                  event: 'XV Años Deluxe',
                },
                {
                  quote: '“La confirmación de asistencia y los mapas quedaron mucho más ordenados. Fue muy práctico para toda la familia.”',
                  author: 'Evento familiar',
                  event: 'Bautizo Basic',
                },
              ].map((t, idx) => (
                <Item key={idx}>
                  <div style={{
                    borderLeft: `2px solid ${T.gold}`,
                    paddingLeft: '1.25rem',
                  }}>
                    <p style={{
                      margin: '0 0 .5rem',
                      fontSize: '1rem',
                      fontStyle: 'italic',
                      color: T.dark,
                      lineHeight: 1.6,
                      fontFamily: 'var(--font-lora, Georgia, serif)',
                    }}>{t.quote}</p>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '.5rem',
                      fontSize: '.75rem',
                      color: T.light,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '.05em',
                    }}>
                      <span style={{ color: T.mid }}>{t.author}</span>
                      <span style={{ color: T.border }}>•</span>
                      <span style={{ color: T.gold }}>{t.event}</span>
                    </div>
                  </div>
                </Item>
              ))}
            </Stagger>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── PRICING PREVIEW ─────────────────────────────────────────────────────────
const PLANS = [
  {
    id:'basic', name:'Basic', price:'$499',
    ideal:'Ideal para bautizos, baby showers y cumpleaños',
    features:['Invitación adaptable a celular','Datos generales, fecha y hora','Ubicación con Google Maps','Dress code y mensaje final','Link para WhatsApp y acceso al editor'],
    dark:false, badge:null,
  },
  {
    id:'premium', name:'Premium', price:'$899',
    ideal:'Recomendado · Bodas y XV años',
    features:['Todo lo de Basic','Galería de fotos y protagonistas','Mesa de regalos y StoryBook','Confirmación de asistencia RSVP','Asistente inteligente de textos con IA'],
    dark:true, badge:'MÁS ELEGIDO',
  },
  {
    id:'deluxe', name:'Deluxe', price:'$1,499',
    ideal:'Para bodas y XV años de gran impacto',
    features:['Todo lo de Premium','Diseño y secciones avanzadas','Módulo de hospedaje','Padrinos y personas especiales','Mayor personalización y asistente completo'],
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
            Pago único. Sin suscripción. Sin cargos ocultos.
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
                      <li key={f} style={{ display:'flex', gap:'.5rem', fontSize:'.8125rem', color: plan.dark ? '#C5B0A0' : T.mid, lineHeight:1.4 }}>
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
            Pago seguro con Stripe · Acceso inmediato para editar · Soporte en español
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
            Ve la invitación de demostración de Sofía y Alejandro — la misma calidad y elegancia que recibirá tu evento.
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
  { q:'¿Cómo recibo mi invitación después de pagar?', a:'El acceso es inmediato. Tras realizar tu pago con Stripe, recibirás un correo con un enlace de acceso para entrar a tu panel cliente y comenzar a editar tu invitación desde el celular o computadora.' },
  { q:'¿Puedo editarla después de comprarla?',        a:'Sí, por supuesto. Puedes editar textos, fechas, fotos, música, mesa de regalos e itinerarios en cualquier momento. Los cambios se actualizan al instante en el mismo link.' },
  { q:'¿Cómo se comparte con los invitados?',         a:'Una vez que tu invitación esté lista en el editor, puedes copiar el link personalizado de tu evento y enviarlo por WhatsApp o redes sociales a todos tus invitados. No necesitan descargar ninguna app para abrirla.' },
  { q:'¿Tiene confirmación de asistencia (RSVP)?',    a:'Sí. Todos los planes incluyen confirmación de asistencia RSVP para que tus invitados elijan si asistirán y te dejen notas directamente desde la invitación. Puedes descargar el reporte en tiempo real.' },
  { q:'¿Puedo usarla y editarla desde mi celular?',   a:'Sí. KOMPRALO está diseñado bajo el enfoque mobile-first. Tanto el editor de invitaciones como la visualización pública de las mismas funcionan de manera óptima en cualquier dispositivo celular.' },
  { q:'¿Qué pasa después de pagar?',                  a:'El sistema genera tu invitación automáticamente en segundo plano. Recibes un correo con tu enlace mágico de acceso (Magic Link). Haces clic en él, entras a tu panel, editas el contenido y está lista para compartir.' },
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
            Crea una invitación que tus invitados sí quieran abrir. Paga una sola vez, edita desde tu celular y comparte por WhatsApp.
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
                Ver planes y precios
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
    <div style={{ fontFamily:'var(--font-inter, system-ui, sans-serif)', background:T.ivory, position:'relative', minHeight:'100vh' }}>
      <div className="paper-noise" />
      <PageStyles />
      <TopNav />
      <HeroSection />
      <TrustStrip />
      <HowItWorks />
      <EventTypes />
      <Benefits />
      <SocialProofSection />
      <PricingPreview />
      <DemoTeaser />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}
