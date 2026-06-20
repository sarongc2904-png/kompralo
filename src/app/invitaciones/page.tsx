import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarClock,
  Check,
  Clock3,
  Gift,
  Images,
  MapPin,
  MessageCircle,
  Palette,
  Play,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
} from 'lucide-react';
import { CheckoutButton } from '@/components/checkout/CheckoutButton';
import { HoverCard, Item, Reveal, Stagger } from '@/components/public/Motion';
import { availableProducts } from '@/domain/products';
import type { Product } from '@/domain/products';

export const metadata: Metadata = {
  title: 'Organiza tu evento desde un solo enlace | Kompralo',
  description:
    'Crea una invitación premium, confirma asistentes y comparte ubicación, horarios, galería y más desde un solo enlace. Planes desde $499 MXN.',
};

const T = {
  ink: '#0D0A07',
  paper: '#FFFDFC',
  ivory: '#F6F2EC',
  mist: '#ECE8E2',
  green: '#36584A',
  gold: '#B99752',
  rose: '#A85D58',
  text: '#302A25',
  muted: '#746B62',
  border: '#DED7CE',
} as const;

function LandingStyles() {
  return (
    <style>{`
      html { scroll-behavior:smooth; }
      .cro-page { overflow-x:hidden; background:${T.paper}; color:${T.text}; }
      .cro-shell { width:min(1160px, calc(100% - 40px)); margin-inline:auto; }
      .cro-section { padding:clamp(4.5rem,8vw,7rem) 0; }
      .cro-eyebrow { margin:0 0 .8rem; color:${T.gold}; font-size:.72rem; font-weight:800; letter-spacing:0; text-transform:uppercase; }
      .cro-title { margin:0; color:${T.ink}; font-family:var(--font-playfair, Georgia, serif); font-size:3.55rem; line-height:1.08; font-weight:650; }
      .cro-copy { color:${T.muted}; font-size:1.12rem; line-height:1.72; }
      .cro-btn { min-height:48px; display:inline-flex; align-items:center; justify-content:center; gap:.55rem; padding:.82rem 1.35rem; border-radius:6px; font-size:.9rem; font-weight:750; text-decoration:none; transition:transform .2s ease, box-shadow .2s ease, background .2s ease; }
      .cro-btn:hover { transform:translateY(-2px); }
      .cro-btn-dark { color:white; background:${T.ink}; box-shadow:0 12px 28px rgba(13,10,7,.16); }
      .cro-btn-light { color:${T.ink}; background:rgba(255,255,255,.9); border:1px solid rgba(255,255,255,.7); }
      .cro-card { border:1px solid ${T.border}; border-radius:8px; background:${T.paper}; box-shadow:0 10px 34px rgba(27,21,16,.05); }

      .cro-nav { position:sticky; top:0; z-index:100; background:rgba(255,253,252,.92); backdrop-filter:blur(14px); border-bottom:1px solid ${T.border}; }
      .cro-nav-inner { min-height:60px; display:flex; align-items:center; justify-content:space-between; gap:1rem; }
      .cro-logo { color:${T.ink}; font-size:.8rem; font-weight:900; letter-spacing:0; text-decoration:none; }
      .cro-nav-links { display:flex; align-items:center; gap:1.4rem; }
      .cro-nav-link { color:${T.muted}; font-size:.82rem; font-weight:650; text-decoration:none; }
      .cro-nav-cta { padding:.58rem 1rem; color:white; background:${T.ink}; border-radius:5px; }
      .cro-nav-acceder { padding:.52rem 1.25rem; font-size:.82rem; font-weight:650; color:${T.ink}; border:1.5px solid ${T.ink}; border-radius:5px; text-decoration:none; white-space:nowrap; }
      .cro-nav-acceder-mobile { display:none; }
      .cro-nav-acceder-desktop { display:inline; }

      .cro-hero { position:relative; height:min(760px, calc(100svh - 72px)); min-height:620px; display:flex; align-items:center; isolation:isolate; color:white; }
      .cro-hero-media { object-fit:cover; object-position:center 42%; z-index:-3; }
      .cro-hero::before { content:''; position:absolute; inset:0; z-index:-2; background:linear-gradient(90deg, rgba(10,8,6,.86) 0%, rgba(10,8,6,.67) 48%, rgba(10,8,6,.2) 82%); }
      .cro-hero::after { content:''; position:absolute; inset:0; z-index:-1; background:linear-gradient(0deg, rgba(10,8,6,.35), transparent 45%); }
      .cro-hero-content { max-width:720px; padding:3rem 0; }
      .cro-hero h1 { max-width:700px; margin:0 0 1.25rem; font-family:var(--font-playfair, Georgia, serif); font-size:5rem; line-height:1.02; font-weight:650; }
      .cro-hero-copy { max-width:620px; margin:0 0 1.8rem; color:rgba(255,255,255,.86); font-size:1.25rem; line-height:1.6; }
      .cro-hero-actions { display:flex; flex-wrap:wrap; gap:.7rem; }
      .cro-hero-benefits { margin-top:1.5rem; display:flex; flex-wrap:wrap; gap:.55rem 1.2rem; color:rgba(255,255,255,.82); font-size:.78rem; }
      .cro-hero-benefits span { display:inline-flex; align-items:center; gap:.35rem; }

      .cro-demo-layout { display:grid; grid-template-columns:minmax(0,1.25fr) minmax(280px,.75fr); gap:clamp(2rem,5vw,4.5rem); align-items:center; }
      .cro-demo-screen { position:relative; aspect-ratio:16/9; overflow:hidden; border-radius:8px; background:${T.ink}; box-shadow:0 28px 70px rgba(13,10,7,.2); }
      .cro-demo-screen img { object-fit:cover; opacity:.68; }
      .cro-demo-screen::after { content:''; position:absolute; inset:0; background:linear-gradient(135deg, rgba(13,10,7,.08), rgba(13,10,7,.6)); }
      .cro-play { position:absolute; z-index:2; inset:50% auto auto 50%; transform:translate(-50%,-50%); width:68px; height:68px; border:0; border-radius:50%; display:grid; place-items:center; color:${T.ink}; background:white; box-shadow:0 12px 35px rgba(0,0,0,.24); }
      .cro-demo-caption { position:absolute; z-index:2; left:1.3rem; bottom:1.15rem; color:white; }
      .cro-demo-caption strong { display:block; font-family:var(--font-playfair, Georgia, serif); font-size:1.25rem; }
      .cro-demo-caption span { color:rgba(255,255,255,.74); font-size:.75rem; }
      .cro-flow { display:grid; gap:.72rem; margin:1.5rem 0 1.8rem; }
      .cro-flow-row { display:flex; gap:.8rem; align-items:center; color:${T.text}; font-size:.88rem; }
      .cro-flow-n { width:29px; height:29px; flex:none; display:grid; place-items:center; border-radius:50%; color:white; background:${T.green}; font-size:.7rem; font-weight:800; }

      .cro-trust-band { background:${T.ink}; color:white; padding:1.1rem 0; }
      .cro-trust-items { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; }
      .cro-trust-item { display:flex; align-items:center; justify-content:center; gap:.5rem; color:rgba(255,255,255,.78); font-size:.8rem; }

      .cro-grid-3 { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:1rem; }
      .cro-value-card { padding:1.5rem; min-height:190px; }
      .cro-value-icon { width:42px; height:42px; display:grid; place-items:center; border-radius:6px; color:${T.green}; background:#E7EEE9; }
      .cro-value-card h3 { margin:1.1rem 0 .55rem; color:${T.ink}; font-size:1.05rem; }
      .cro-value-card p { margin:0; color:${T.muted}; font-size:.9rem; line-height:1.6; }

      .cro-benefits { background:${T.green}; color:white; }
      .cro-benefit-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1px; background:rgba(255,255,255,.18); border:1px solid rgba(255,255,255,.18); }
      .cro-benefit { padding:1.5rem; background:${T.green}; display:flex; gap:1rem; }
      .cro-benefit svg { flex:none; color:#D9C28F; }
      .cro-benefit h3 { margin:0 0 .35rem; font-size:1rem; }
      .cro-benefit p { margin:0; color:rgba(255,255,255,.7); font-size:.86rem; line-height:1.55; }

      .cro-compare { display:grid; grid-template-columns:1fr 1fr; overflow:hidden; }
      .cro-compare-col { padding:clamp(1.5rem,4vw,2.6rem); }
      .cro-compare-col:first-child { background:#F2EFEB; }
      .cro-compare-col:last-child { color:white; background:${T.ink}; }
      .cro-compare h3 { margin:0 0 1.2rem; font-family:var(--font-playfair, Georgia, serif); font-size:1.55rem; }
      .cro-compare-list { display:grid; gap:.8rem; }
      .cro-compare-row { display:flex; align-items:center; gap:.65rem; font-size:.88rem; }

      .cro-events { display:grid; grid-template-columns:repeat(5,1fr); gap:.8rem; }
      .cro-event { position:relative; min-height:330px; overflow:hidden; border-radius:8px; color:white; }
      .cro-event img { object-fit:cover; transition:transform .5s ease; }
      .cro-event:hover img { transform:scale(1.04); }
      .cro-event::after { content:''; position:absolute; inset:0; background:linear-gradient(0deg, rgba(10,8,6,.88), rgba(10,8,6,.05) 65%); }
      .cro-event-body { position:absolute; z-index:2; inset:auto 1rem 1rem; }
      .cro-event h3 { margin:0 0 .35rem; font-family:var(--font-playfair, Georgia, serif); font-size:1.35rem; }
      .cro-event p { margin:0 0 .7rem; color:rgba(255,255,255,.72); font-size:.78rem; line-height:1.45; }
      .cro-event a { color:white; font-size:.78rem; font-weight:750; }

      .cro-pricing { background:${T.ivory}; }
      .cro-plans { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; align-items:center; }
      .cro-plan { position:relative; padding:2rem 1.5rem; }
      .cro-plan-featured { border:2px solid ${T.gold}; background:${T.ink}; color:white; box-shadow:0 28px 68px rgba(13,10,7,.22); }
      .cro-plan-badge { position:absolute; top:0; left:50%; transform:translate(-50%,-50%); padding:.38rem .8rem; border-radius:20px; color:${T.ink}; background:${T.gold}; font-size:.66rem; font-weight:900; letter-spacing:0; text-transform:uppercase; }
      .cro-plan h3 { margin:.2rem 0 .55rem; color:${T.ink}; font-family:var(--font-playfair, Georgia, serif); font-size:1.65rem; }
      .cro-plan-featured h3 { color:white; }
      .cro-plan-copy { min-height:66px; margin:0 0 1.2rem; color:${T.muted}; font-size:.84rem; line-height:1.55; }
      .cro-plan-featured .cro-plan-copy { color:rgba(255,255,255,.66); }
      .cro-price { margin-bottom:1.35rem; color:${T.ink}; font-family:var(--font-playfair, Georgia, serif); font-size:2.45rem; font-weight:700; }
      .cro-plan-featured .cro-price { color:white; }
      .cro-price small { color:${T.muted}; font-family:system-ui,sans-serif; font-size:.72rem; font-weight:500; }
      .cro-plan-featured .cro-price small { color:rgba(255,255,255,.55); }
      .cro-plan-list { min-height:168px; display:grid; align-content:start; gap:.62rem; margin:0 0 1.5rem; padding:0; list-style:none; }
      .cro-plan-list li { display:flex; gap:.45rem; color:${T.text}; font-size:.82rem; }
      .cro-plan-featured .cro-plan-list li { color:rgba(255,255,255,.8); }
      .cro-checkout { width:100%; min-height:48px; border:0; border-radius:6px; font-size:.88rem; font-weight:800; cursor:pointer; }
      .cro-checkout-standard { color:white; background:${T.ink}; }
      .cro-checkout-featured { color:${T.ink}; background:${T.gold}; }

      .cro-testimonial { padding:1.5rem; }
      .cro-stars { color:${T.gold}; letter-spacing:0; }
      .cro-testimonial blockquote { margin:1rem 0 1.2rem; color:${T.ink}; font-family:var(--font-playfair, Georgia, serif); font-size:1.1rem; line-height:1.55; }
      .cro-testimonial strong, .cro-testimonial span { display:block; }
      .cro-testimonial span { margin-top:.2rem; color:${T.muted}; font-size:.75rem; }

      .cro-guarantee { display:grid; grid-template-columns:.85fr 1.15fr; gap:clamp(2rem,6vw,5rem); align-items:center; padding:clamp(2rem,5vw,4rem); background:#E7EEE9; border:1px solid #CAD8D0; border-radius:8px; }
      .cro-guarantee-mark { width:110px; height:110px; display:grid; place-items:center; margin:auto; border:1px solid ${T.green}; border-radius:50%; color:${T.green}; }
      .cro-guarantee-list { display:grid; grid-template-columns:1fr 1fr; gap:.75rem 1.25rem; margin-top:1.3rem; }
      .cro-guarantee-item { display:flex; gap:.5rem; color:${T.text}; font-size:.84rem; }

      .cro-urgency { padding:2.25rem; display:flex; align-items:center; justify-content:space-between; gap:1.5rem; border-left:4px solid ${T.rose}; background:#FAF0EF; }
      .cro-urgency h2 { margin:0 0 .45rem; color:${T.ink}; font-family:var(--font-playfair, Georgia, serif); font-size:1.65rem; }
      .cro-urgency p { max-width:700px; margin:0; color:${T.muted}; line-height:1.6; }

      .cro-faq { max-width:860px; margin:2rem auto 0; border-top:1px solid ${T.border}; }
      .cro-faq details { border-bottom:1px solid ${T.border}; }
      .cro-faq summary { min-height:64px; display:flex; align-items:center; justify-content:space-between; gap:1rem; cursor:pointer; color:${T.ink}; font-weight:750; list-style:none; }
      .cro-faq summary::-webkit-details-marker { display:none; }
      .cro-faq p { margin:-.2rem 0 1.4rem; color:${T.muted}; line-height:1.65; }
      .cro-faq-plus { color:${T.gold}; font-size:1.35rem; transition:transform .2s ease; }
      .cro-faq details[open] .cro-faq-plus { transform:rotate(45deg); }

      .cro-final { position:relative; isolation:isolate; color:white; background:${T.ink}; }
      .cro-final img { object-fit:cover; opacity:.22; z-index:-2; }
      .cro-final::after { content:''; position:absolute; inset:0; z-index:-1; background:linear-gradient(90deg, rgba(13,10,7,.98), rgba(13,10,7,.62)); }
      .cro-final-inner { max-width:800px; padding:clamp(5rem,10vw,8rem) 0; }
      .cro-final h2 { margin:0 0 1rem; font-family:var(--font-playfair, Georgia, serif); font-size:4rem; line-height:1.05; }
      .cro-final p { max-width:620px; margin:0 0 1.6rem; color:rgba(255,255,255,.72); font-size:1.05rem; line-height:1.65; }
      .cro-footer { padding:1.5rem 0; border-top:1px solid ${T.border}; color:${T.muted}; font-size:.75rem; }
      .cro-footer-inner { display:flex; justify-content:space-between; gap:1rem; flex-wrap:wrap; }

      @media (min-width:900px) { .cro-plan-featured { transform:scale(1.06); z-index:2; } }
      @media (max-width:980px) {
        .cro-events { grid-template-columns:repeat(3,1fr); }
        .cro-event:nth-child(4), .cro-event:nth-child(5) { min-height:270px; }
        .cro-trust-items { grid-template-columns:repeat(2,1fr); }
      }
      @media (max-width:780px) {
        .cro-shell { width:min(100% - 28px, 680px); }
        .cro-nav-link { display:none; }
        .cro-nav-cta { display:inline-flex; }
        .cro-nav-acceder { display:inline-flex; }
        .cro-nav-acceder-mobile { display:inline; }
        .cro-nav-acceder-desktop { display:none; }
        .cro-hero { height:calc(100svh - 64px); min-height:650px; align-items:flex-end; }
        .cro-hero-media { object-position:62% center; }
        .cro-hero::before { background:linear-gradient(0deg, rgba(10,8,6,.94) 0%, rgba(10,8,6,.58) 62%, rgba(10,8,6,.12)); }
        .cro-hero-content { padding:2.5rem 0 3rem; }
        .cro-title { font-size:2.5rem; }
        .cro-hero h1 { font-size:3.7rem; }
        .cro-final h2 { font-size:3rem; }
        .cro-demo-layout, .cro-guarantee { grid-template-columns:1fr; }
        .cro-grid-3 { grid-template-columns:1fr 1fr; }
        .cro-events { grid-template-columns:1fr 1fr; }
        .cro-event { min-height:280px; }
        .cro-plans { grid-template-columns:1fr; max-width:420px; margin-inline:auto; gap:1.3rem; }
        .cro-plan-featured { order:-1; }
        .cro-benefit-grid, .cro-compare { grid-template-columns:1fr; }
        .cro-guarantee-list { grid-template-columns:1fr; }
        .cro-urgency { align-items:flex-start; flex-direction:column; }
      }
      @media (max-width:480px) {
        .cro-nav-cta { padding:.52rem .75rem; }
        .cro-title { font-size:2.1rem; }
        .cro-copy { font-size:1rem; }
        .cro-hero h1 { font-size:2.65rem; }
        .cro-hero-copy { font-size:1.02rem; }
        .cro-final h2 { font-size:2.4rem; }
        .cro-hero-actions .cro-btn { width:100%; }
        .cro-hero-benefits { display:grid; grid-template-columns:1fr 1fr; gap:.5rem; }
        .cro-trust-items { grid-template-columns:1fr; }
        .cro-trust-item { justify-content:flex-start; }
        .cro-grid-3, .cro-events { grid-template-columns:1fr; }
        .cro-value-card { min-height:0; }
        .cro-event { min-height:300px !important; }
      }
      @media (prefers-reduced-motion:reduce) {
        html { scroll-behavior:auto; }
        .cro-btn, .cro-event img, .cro-faq-plus { transition:none !important; }
        .cro-btn:hover, .cro-event:hover img { transform:none; }
      }
    `}</style>
  );
}

function Header() {
  return (
    <nav className="cro-nav" aria-label="Navegación principal">
      <div className="cro-shell cro-nav-inner">
        <Link href="/invitaciones" className="cro-logo">KOMPRALO</Link>
        <div className="cro-nav-links">
          <Link href="#como-funciona" className="cro-nav-link">Cómo funciona</Link>
          <Link href="/sofia-y-alejandro" className="cro-nav-link">Demo real</Link>
          <Link href="/login" className="cro-nav-acceder">
            <span className="cro-nav-acceder-desktop">Acceder</span>
            <span className="cro-nav-acceder-mobile">Acceder a mi invitación</span>
          </Link>
          <Link href="/invitaciones/precios" className="cro-nav-link cro-nav-cta">Ver planes</Link>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="cro-hero">
      <Image
        className="cro-hero-media"
        src="/images/invitaciones/social-proof-event-1.webp"
        alt="Celebración elegante de boda"
        fill
        priority
        sizes="100vw"
      />
      <div className="cro-shell">
        <div className="cro-hero-content">
          <p className="cro-eyebrow" style={{ color:'#E4C988' }}>Centro inteligente para eventos</p>
          <h1>La forma más elegante de organizar tu evento desde un solo enlace.</h1>
          <p className="cro-hero-copy">
            Crea una invitación premium, confirma asistentes automáticamente y comparte toda la información de tu evento en segundos.
          </p>
          <div className="cro-hero-actions">
            <Link href="#planes" className="cro-btn cro-btn-dark">Ver invitaciones <ArrowRight size={17} /></Link>
            <Link href="/sofia-y-alejandro" className="cro-btn cro-btn-light">Ver demo real <Play size={16} fill="currentColor" /></Link>
          </div>
          <div className="cro-hero-benefits">
            {['Sin instalar apps','Lista para WhatsApp','RSVP según plan','Pago seguro','Editable desde celular'].map((item) => (
              <span key={item}><Check size={13} />{item}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const DEMO_STEPS = [
  'Elige el plan ideal',
  'Paga de forma segura',
  'Personaliza desde tu celular',
  'Comparte la invitación terminada',
  'Tus invitados confirman',
  'Consulta tus asistentes',
];

function DemoSection() {
  return (
    <section id="como-funciona" className="cro-section" style={{ background:T.ivory }}>
      <div className="cro-shell cro-demo-layout">
        <Reveal>
          <div className="cro-demo-screen">
            <Image src="/images/invitaciones/wedding-details.webp" alt="Vista del flujo de una invitación Kompralo" fill sizes="(max-width: 780px) 100vw, 65vw" />
            <span className="cro-play" aria-hidden="true"><Play size={25} fill="currentColor" /></span>
            <div className="cro-demo-caption"><strong>Demo del flujo Kompralo</strong><span>Video de 20 segundos · próximamente</span></div>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="cro-eyebrow">Una experiencia simple</p>
          <h2 className="cro-title">Mira cómo funciona en menos de 20 segundos</h2>
          <div className="cro-flow">
            {DEMO_STEPS.map((step, index) => <div className="cro-flow-row" key={step}><span className="cro-flow-n">{index + 1}</span>{step}</div>)}
          </div>
          <Link href="#planes" className="cro-btn cro-btn-dark">Ver planes <ArrowRight size={16} /></Link>
        </Reveal>
      </div>
    </section>
  );
}

function TrustBand() {
  const items = [
    [ShieldCheck, 'Pago protegido con Stripe'],
    [Smartphone, 'Sin instalar aplicaciones'],
    [MessageCircle, 'Lista para compartir'],
    [Palette, 'Editable desde celular'],
  ] as const;
  return <div className="cro-trust-band"><div className="cro-shell cro-trust-items">{items.map(([Icon,label]) => <div className="cro-trust-item" key={label}><Icon size={17} />{label}</div>)}</div></div>;
}

const CORE_VALUES = [
  { icon:Sparkles, title:'Invitación premium', text:'Una presentación elegante para compartir tu evento.' },
  { icon:Users, title:'RSVP organizado', text:'Olvídate de perseguir invitados por WhatsApp.' },
  { icon:MapPin, title:'Ubicación clara', text:'Nadie llegará tarde por perderse.' },
  { icon:Gift, title:'Mesa de regalos', text:'Tus invitados saben exactamente qué regalarte.' },
  { icon:CalendarClock, title:'Itinerario', text:'Todos conocen los horarios importantes.' },
  { icon:Images, title:'Galería e historia', text:'Haz que tu invitación se sienta personal y memorable.' },
];

function WhyKompralo() {
  return (
    <section className="cro-section">
      <div className="cro-shell">
        <Reveal style={{ maxWidth:760, marginBottom:'2.5rem' }}><p className="cro-eyebrow">Todo conectado</p><h2 className="cro-title">No es solo una invitación. Es el centro digital de tu evento.</h2></Reveal>
        <Stagger className="cro-grid-3">
          {CORE_VALUES.map(({ icon:Icon,title,text }) => <Item key={title}><HoverCard className="cro-card cro-value-card" style={{ height:'100%' }}><span className="cro-value-icon"><Icon size={21} /></span><h3>{title}</h3><p>{text}</p></HoverCard></Item>)}
        </Stagger>
      </div>
    </section>
  );
}

const BENEFITS = [
  { icon:Users, title:'Confirma sin perseguir mensajes', text:'Centraliza la confirmación de asistencia según el plan elegido.' },
  { icon:Gift, title:'Facilita los regalos', text:'Tus invitados encuentran opciones y datos en el mismo enlace.' },
  { icon:MapPin, title:'Evita confusiones de ubicación', text:'Comparte mapa, dirección y referencias con claridad.' },
  { icon:Images, title:'Cuenta tu historia', text:'Comparte la emoción antes del evento con fotos y momentos.' },
  { icon:Clock3, title:'Crea expectativa', text:'La cuenta regresiva mantiene presente la fecha importante.' },
  { icon:Palette, title:'Actualiza sin rediseñar', text:'Cambia datos importantes desde el editor sin empezar de nuevo.' },
];

function BenefitsSection() {
  return (
    <section className="cro-section cro-benefits">
      <div className="cro-shell">
        <Reveal style={{ maxWidth:760, marginBottom:'2.5rem' }}><p className="cro-eyebrow" style={{ color:'#D9C28F' }}>Menos pendientes, más emoción</p><h2 className="cro-title" style={{ color:'white' }}>Todo lo que tus invitados necesitan, sin conversaciones dispersas.</h2></Reveal>
        <Stagger className="cro-benefit-grid">{BENEFITS.map(({icon:Icon,title,text}) => <Item key={title}><div className="cro-benefit"><Icon size={23}/><div><h3>{title}</h3><p>{text}</p></div></div></Item>)}</Stagger>
      </div>
    </section>
  );
}

function Comparison() {
  const traditional = ['Impresión y entrega física','Reimpresiones si algo cambia','Confirmación manual','Información dispersa','Entrega lenta','Costos variables'];
  const kompralo = ['Formato digital','Cambios instantáneos','RSVP automático según plan','Todo en un solo enlace','Entrega después del pago','Pago único'];
  return (
    <section className="cro-section">
      <div className="cro-shell">
        <Reveal style={{ textAlign:'center', maxWidth:760, margin:'0 auto 2.5rem' }}><p className="cro-eyebrow">Compara la experiencia</p><h2 className="cro-title">Una invitación tradicional informa. Kompralo organiza.</h2></Reveal>
        <Reveal><div className="cro-card cro-compare">
          <div className="cro-compare-col"><h3>Invitación tradicional</h3><div className="cro-compare-list">{traditional.map(x => <div className="cro-compare-row" key={x}><span aria-hidden="true">—</span>{x}</div>)}</div></div>
          <div className="cro-compare-col"><h3>Con Kompralo</h3><div className="cro-compare-list">{kompralo.map(x => <div className="cro-compare-row" key={x}><Check size={16} color="#D9C28F" />{x}</div>)}</div></div>
        </div></Reveal>
        <div style={{ textAlign:'center', marginTop:'1.5rem' }}><Link href="#planes" className="cro-btn cro-btn-dark">Crear mi invitación <ArrowRight size={16}/></Link></div>
      </div>
    </section>
  );
}

const EVENTS = [
  { name:'Bodas', image:'/images/invitaciones/social-proof-event-1.webp', text:'Una experiencia romántica, elegante y completa.' },
  { name:'XV años', image:'/images/invitaciones/xv-event-editorial.webp', text:'Presenta cada detalle de una celebración inolvidable.' },
  { name:'Bautizos', image:'/images/invitaciones/baptism-soft-event.webp', text:'Comparte con claridad un momento especial en familia.' },
  { name:'Baby shower', image:'/images/invitaciones/baby-shower-pastel.webp', text:'Reúne ubicación, regalos y confirmaciones en un enlace.' },
  { name:'Cumpleaños', image:'/images/invitaciones/birthday-premium.webp', text:'Convierte la invitación en el inicio de la celebración.' },
];

function EventsSection() {
  return (
    <section className="cro-section" style={{ background:T.ivory }}>
      <div className="cro-shell">
        <Reveal style={{ maxWidth:700, marginBottom:'2.5rem' }}><p className="cro-eyebrow">Para cada ocasión</p><h2 className="cro-title">Una experiencia para cada tipo de evento</h2></Reveal>
        <Stagger className="cro-events">{EVENTS.map(event => <Item key={event.name}><article className="cro-event"><Image src={event.image} alt={`Invitación para ${event.name}`} fill sizes="(max-width: 480px) 100vw, (max-width: 980px) 50vw, 20vw"/><div className="cro-event-body"><h3>{event.name}</h3><p>{event.text}</p><Link href="#planes">Ver planes</Link></div></article></Item>)}</Stagger>
      </div>
    </section>
  );
}

const PLAN_COPY: Record<string,string> = {
  basic:'Para quien quiere una invitación elegante, clara y fácil de compartir.',
  premium:'Para quien quiere organizar mejor su evento con RSVP, galería, historia y más personalización.',
  deluxe:'Para eventos formales que necesitan una experiencia más completa y premium.',
};

function formatPrice(product: Product) {
  // en-US locale with MXN outputs "MX$499" — unambiguous vs USD "$499"
  return new Intl.NumberFormat('en-US',{ style:'currency', currency:product.currency.toUpperCase(), maximumFractionDigits:0 }).format(product.price / 100);
}

function PlanCard({ product }: { product: Product }) {
  const featured = product.id === 'premium';
  return (
    <HoverCard className={`cro-card cro-plan${featured ? ' cro-plan-featured' : ''}`} lift={featured ? 7 : 4}>
      {featured && <span className="cro-plan-badge">Más vendido</span>}
      <h3>{product.name}</h3>
      <p className="cro-plan-copy">{PLAN_COPY[product.id]}</p>
      <div className="cro-price">{formatPrice(product)} <small>MXN · pago único</small></div>
      <ul className="cro-plan-list">{product.features.map(feature => <li key={feature}><Check size={15} color={T.gold}/>{feature}</li>)}</ul>
      <CheckoutButton productId={product.id} label={`Comprar ${product.name}`} className={`cro-checkout ${featured ? 'cro-checkout-featured' : 'cro-checkout-standard'}`} />
    </HoverCard>
  );
}

function AlreadyBought() {
  return (
    <div style={{ background:T.ink, padding:'1.25rem 1.75rem', borderRadius:'.75rem', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1rem', flexWrap:'wrap', maxWidth:760, margin:'0 auto -1.5rem', position:'relative', zIndex:2 }}>
      <div>
        <p style={{ margin:0, color:'#F1E3C8', fontSize:'.82rem', fontWeight:700 }}>¿Ya compraste tu invitación?</p>
        <p style={{ margin:'.2rem 0 0', color:'rgba(241,227,200,.65)', fontSize:'.78rem' }}>Accede a tu panel para seguir editando, ver tu enlace o compartir tu invitación.</p>
      </div>
      <Link href="/login" style={{ padding:'.6rem 1.25rem', background:'#C4A962', color:T.ink, borderRadius:'5px', fontSize:'.82rem', fontWeight:700, textDecoration:'none', whiteSpace:'nowrap' as const }}>
        Acceder a mi panel →
      </Link>
    </div>
  );
}

function Pricing() {
  return (
    <section id="planes" className="cro-section cro-pricing">
      <div className="cro-shell">
        <Reveal style={{ textAlign:'center', maxWidth:720, margin:'0 auto 3rem' }}><p className="cro-eyebrow">Pago único, sin mensualidades</p><h2 className="cro-title">Elige cuánto quieres organizar desde tu invitación</h2><p className="cro-copy">Premium concentra las herramientas que más ayudan a organizar eventos familiares y celebraciones grandes.</p></Reveal>
        <Stagger className="cro-plans" gap={0.12}>{availableProducts.map(product => <Item key={product.id}><PlanCard product={product}/></Item>)}</Stagger>
        <p style={{ textAlign:'center', margin:'2rem 0 0', color:T.muted, fontSize:'.78rem' }}>Pago seguro con Stripe · Acceso por correo · Sin instalar apps</p>
      </div>
    </section>
  );
}

// Casos representativos para composición CRO. Sustituir por reseñas verificadas antes de mostrar métricas reales.
const TESTIMONIALS = [
  { quote:'Confirmamos invitados sin estar persiguiendo mensajes por WhatsApp.', name:'María y Daniel', meta:'Boda · Veracruz' },
  { quote:'Todo quedó en un solo enlace: ubicación, horario, fotos y confirmación.', name:'Anfitriona de XV años', meta:'XV años · México' },
  { quote:'La familia pudo abrir la invitación desde el celular sin complicaciones.', name:'Evento familiar', meta:'Bautizo · Puebla' },
];

function Testimonials() {
  return (
    <section className="cro-section">
      <div className="cro-shell">
        <Reveal style={{ textAlign:'center', maxWidth:720, margin:'0 auto 2.5rem' }}><p className="cro-eyebrow">Diseñado para compartir bonito</p><h2 className="cro-title">Menos coordinación manual. Más tranquilidad antes del evento.</h2></Reveal>
        <Stagger className="cro-grid-3">{TESTIMONIALS.map(item => <Item key={item.name}><HoverCard className="cro-card cro-testimonial" style={{ height:'100%' }}><div className="cro-stars" aria-label="Cinco estrellas">★★★★★</div><blockquote>“{item.quote}”</blockquote><strong>{item.name}</strong><span>{item.meta}</span></HoverCard></Item>)}</Stagger>
      </div>
    </section>
  );
}

function Guarantee() {
  const items = ['Soporte para acceder a tu invitación','Ayuda si no sabes qué texto poner','Acceso seguro después del pago','Puedes editar desde tu celular'];
  return (
    <section className="cro-section" style={{ paddingTop:0 }}><div className="cro-shell"><Reveal><div className="cro-guarantee"><div className="cro-guarantee-mark"><ShieldCheck size={48}/></div><div><p className="cro-eyebrow" style={{ color:T.green }}>Garantía Kompralo</p><h2 className="cro-title">No te dejamos sola con el editor.</h2><p className="cro-copy">Si tienes problemas para personalizar tu invitación, te ayudamos a dejarla lista.</p><div className="cro-guarantee-list">{items.map(item => <div className="cro-guarantee-item" key={item}><Check size={16} color={T.green}/>{item}</div>)}</div></div></div></Reveal></div></section>
  );
}

function Urgency() {
  return <section style={{ padding:'0 0 clamp(4.5rem,8vw,7rem)' }}><div className="cro-shell"><Reveal><div className="cro-urgency"><div><h2>¿Tu evento está cerca?</h2><p>Si tu evento es dentro de los próximos 60 días, te recomendamos personalizar tu invitación esta semana para compartirla con tiempo y confirmar asistentes sin presión.</p></div><Link href="#planes" className="cro-btn cro-btn-dark">Ver planes <ArrowRight size={16}/></Link></div></Reveal></div></section>;
}

const FAQS = [
  ['¿Necesito instalar una app?','No. Tus invitados abren la invitación directamente desde un enlace.'],
  ['¿Puedo editar desde celular?','Sí. Puedes cambiar la información principal desde tu panel.'],
  ['¿Qué pasa después de pagar?','Se genera tu invitación y recibes un correo con acceso seguro.'],
  ['¿Puedo compartirla por WhatsApp?','Sí. Recibes un enlace que puedes enviar por WhatsApp.'],
  ['¿Tiene confirmación de asistencia?','Está disponible según el plan seleccionado.'],
  ['¿Qué pasa si necesito ayuda?','Te apoyamos si tienes problemas para acceder o personalizar tu invitación.'],
  ['¿Puedo cambiar información después?','Sí. Puedes actualizar datos importantes desde el editor sin volver a diseñar todo.'],
];

function FAQ() {
  return (
    <section className="cro-section" style={{ background:T.ivory }}><div className="cro-shell"><Reveal style={{ textAlign:'center' }}><p className="cro-eyebrow">Resolvemos tus dudas</p><h2 className="cro-title">Antes de elegir tu invitación</h2></Reveal><div className="cro-faq">{FAQS.map(([q,a]) => <details key={q}><summary>{q}<span className="cro-faq-plus">+</span></summary><p>{a}</p></details>)}</div></div></section>
  );
}

function FinalCTA() {
  return (
    <section className="cro-final"><Image src="/images/invitaciones/wedding-details.webp" alt="Detalles elegantes para un evento" fill sizes="100vw"/><div className="cro-shell"><div className="cro-final-inner"><p className="cro-eyebrow" style={{ color:'#E4C988' }}>Empieza hoy</p><h2>Tu evento merece algo más que una imagen por WhatsApp.</h2><p>Crea una invitación premium, editable y lista para compartir en minutos.</p><div className="cro-hero-actions"><Link href="#planes" className="cro-btn" style={{ background:T.gold, color:T.ink }}>Ver invitaciones <ArrowRight size={16}/></Link><Link href="/sofia-y-alejandro" className="cro-btn cro-btn-light">Ver demo real <Play size={15} fill="currentColor"/></Link></div></div></div></section>
  );
}

function Footer() {
  return <footer className="cro-footer"><div className="cro-shell cro-footer-inner"><strong style={{ color:T.ink, letterSpacing:0 }}>KOMPRALO</strong><span>Invitaciones digitales y organización desde un solo enlace.</span><Link href="/login" style={{ color:T.muted, fontSize:'.8rem', textDecoration:'none', fontWeight:600 }}>Acceso clientes</Link><span>© {new Date().getFullYear()}</span></div></footer>;
}

export default function InvitacionesPage() {
  return (
    <main className="cro-page">
      <LandingStyles />
      <Header />
      <Hero />
      <DemoSection />
      <TrustBand />
      <WhyKompralo />
      <BenefitsSection />
      <Comparison />
      <EventsSection />
      <div className="cro-shell" style={{ paddingTop:'3.5rem' }}><AlreadyBought /></div>
      <Pricing />
      <Testimonials />
      <Guarantee />
      <Urgency />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
