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
  ink: '#111111',       // Soft black
  paper: '#FAF9F6',     // Fine paper
  ivory: '#F4F2EC',
  mist: '#EAE6DF',
  green: '#2A3026',     // Dark elegant tone
  gold: '#C4A962',      // Champagne / Gold
  rose: '#B58D89',
  text: '#2C2A28',
  muted: '#6B655F',
  border: '#D8D1C7',
} as const;

function LandingStyles() {
  return (
    <style>{`
      html { scroll-behavior:smooth; }
      .cro-page { overflow-x:hidden; background:${T.paper}; color:${T.text}; }
      .cro-shell { width:min(1160px, calc(100% - 40px)); margin-inline:auto; }
      .cro-section { padding:clamp(5rem,10vw,8rem) 0; }
      .cro-eyebrow { margin:0 0 .8rem; color:${T.gold}; font-size:.75rem; font-weight:800; letter-spacing:.05em; text-transform:uppercase; }
      .cro-title { margin:0; color:${T.ink}; font-family:var(--font-playfair, Georgia, serif); font-size:clamp(2.5rem, 5vw, 4rem); line-height:1.05; font-weight:500; letter-spacing:-0.02em; }
      .cro-copy { color:${T.muted}; font-size:1.15rem; line-height:1.6; }
      
      /* Botones Motion */
      .cro-btn { min-height:54px; display:inline-flex; align-items:center; justify-content:center; gap:.55rem; padding:.85rem 1.8rem; border-radius:30px; font-size:1rem; font-weight:600; text-decoration:none; transition:all .3s cubic-bezier(0.25, 1, 0.5, 1); }
      .cro-btn:hover { transform:translateY(-2px); box-shadow:0 10px 20px rgba(0,0,0,0.1); }
      .cro-btn-dark { color:${T.paper}; background:${T.ink}; }
      .cro-btn-dark:hover { background:#000; box-shadow:0 15px 30px rgba(17,17,17,.2); }
      .cro-btn-light { color:${T.ink}; background:rgba(255,255,255,.9); border:1px solid rgba(0,0,0,.05); backdrop-filter:blur(10px); }
      .cro-btn-light:hover { background:white; }
      .cro-btn-gold { color:${T.ink}; background:${T.gold}; }
      .cro-btn-gold:hover { background:#B39851; box-shadow:0 15px 30px rgba(196,169,98,.3); }

      /* Tarjetas */
      .cro-card { border:1px solid ${T.border}; border-radius:12px; background:${T.paper}; box-shadow:0 4px 20px rgba(0,0,0,.03); transition:all 0.4s cubic-bezier(0.25,1,0.5,1); }
      .cro-card:hover { border-color:${T.gold}; box-shadow:0 20px 40px rgba(0,0,0,.06); transform:translateY(-4px); }

      /* Sticky CTA en Mobile */
      .cro-mobile-sticky-cta { display:none; position:fixed; bottom:1.5rem; left:50%; transform:translateX(-50%); z-index:999; background:${T.ink}; color:white; padding:1rem 2rem; border-radius:30px; font-weight:600; font-size:1rem; white-space:nowrap; box-shadow:0 20px 40px rgba(0,0,0,0.25); text-decoration:none; align-items:center; gap:0.5rem; transition:background 0.3s, transform 0.3s; }
      .cro-mobile-sticky-cta:hover { background:#000; transform:translateX(-50%) translateY(-2px); }
      @media (max-width:780px) {
        .cro-mobile-sticky-cta { display:flex; animation:slideUp 0.6s cubic-bezier(0.25,1,0.5,1) forwards; }
      }
      @keyframes slideUp { from { bottom:-100px; opacity:0; } to { bottom:1.5rem; opacity:1; } }

      /* Header */
      .cro-nav { position:sticky; top:0; z-index:100; background:rgba(250,249,246,.85); backdrop-filter:blur(16px); border-bottom:1px solid rgba(0,0,0,0.05); }
      .cro-nav-inner { min-height:70px; display:flex; align-items:center; justify-content:space-between; gap:1rem; }
      .cro-logo { color:${T.ink}; font-size:.9rem; font-weight:800; letter-spacing:.1em; text-decoration:none; text-transform:uppercase; }
      .cro-nav-links { display:flex; align-items:center; gap:2rem; }
      .cro-nav-link { color:${T.ink}; font-size:.85rem; font-weight:500; text-decoration:none; transition:color .2s; }
      .cro-nav-link:hover { color:${T.gold}; }
      .cro-nav-cta { padding:.6rem 1.2rem; color:white; background:${T.ink}; border-radius:24px; transition:all 0.3s; }
      .cro-nav-cta:hover { background:#000; }
      .cro-nav-acceder { padding:.55rem 1.2rem; font-size:.85rem; font-weight:500; color:${T.ink}; border:1px solid ${T.border}; border-radius:24px; text-decoration:none; transition:all .2s; }
      .cro-nav-acceder:hover { background:${T.ink}; color:white; border-color:${T.ink}; }
      .cro-nav-acceder-mobile { display:none; }
      .cro-nav-acceder-desktop { display:inline; }

      /* Hero Cinematográfico */
      .cro-hero { position:relative; min-height:90svh; display:flex; align-items:center; color:white; overflow:hidden; }
      .cro-hero-bg { position:absolute; inset:0; z-index:-2; background:#000; }
      .cro-hero-media { object-fit:cover; opacity:0.75; transform:scale(1.05); animation:slowZoom 20s ease-out forwards; }
      @keyframes slowZoom { from { transform:scale(1.05); } to { transform:scale(1.15); } }
      .cro-hero::before { content:''; position:absolute; inset:0; z-index:-1; background:linear-gradient(to top, rgba(17,17,17,0.95) 0%, rgba(17,17,17,0.4) 50%, rgba(17,17,17,0.1) 100%); }
      .cro-hero-content { max-width:800px; padding:4rem 0; position:relative; z-index:1; }
      .cro-hero h1 { margin:0 0 1.5rem; font-family:var(--font-playfair, Georgia, serif); font-size:clamp(3rem, 7vw, 5.5rem); line-height:1.05; font-weight:400; }
      .cro-hero-copy { max-width:600px; margin:0 0 2.5rem; color:rgba(255,255,255,.8); font-size:1.2rem; line-height:1.6; font-weight:300; }
      .cro-hero-actions { display:flex; flex-wrap:wrap; gap:1rem; }
      .cro-hero-benefits { margin-top:2.5rem; display:flex; flex-wrap:wrap; gap:1rem 2rem; color:rgba(255,255,255,.6); font-size:.85rem; font-weight:500; }
      .cro-hero-benefits span { display:inline-flex; align-items:center; gap:.4rem; }

      /* Demo Section / Layout */
      .cro-demo-layout { display:grid; grid-template-columns:1fr 1fr; gap:4rem; align-items:center; }
      .cro-demo-screen { position:relative; aspect-ratio:9/16; max-height:600px; max-width:320px; margin:0 auto; overflow:hidden; border-radius:24px; background:${T.ink}; box-shadow:0 30px 60px rgba(0,0,0,.15); border:8px solid #FFF; }
      .cro-demo-screen img { object-fit:cover; }
      .cro-play { position:absolute; z-index:2; inset:50% auto auto 50%; transform:translate(-50%,-50%); width:72px; height:72px; border-radius:50%; display:grid; place-items:center; color:${T.ink}; background:rgba(255,255,255,.9); backdrop-filter:blur(5px); box-shadow:0 15px 30px rgba(0,0,0,.2); transition:transform .3s; }
      .cro-play:hover { transform:translate(-50%,-50%) scale(1.1); }
      .cro-flow { display:grid; gap:1rem; margin:2rem 0; }
      .cro-flow-row { display:flex; gap:1rem; align-items:center; color:${T.ink}; font-size:1.05rem; font-weight:500; }
      .cro-flow-n { width:32px; height:32px; flex:none; display:grid; place-items:center; border-radius:50%; color:${T.gold}; border:1px solid ${T.gold}; font-size:.8rem; font-weight:600; }

      /* Trust Band */
      .cro-trust-band { border-y:1px solid ${T.border}; padding:2rem 0; background:white; }
      .cro-trust-items { display:flex; flex-wrap:wrap; justify-content:space-between; gap:2rem; }
      .cro-trust-item { display:flex; align-items:center; gap:.6rem; color:${T.muted}; font-size:.9rem; font-weight:500; }

      /* Features Grid */
      .cro-grid-3 { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:1.5rem; }
      .cro-value-card { padding:2.5rem 2rem; text-align:center; display:flex; flex-direction:column; align-items:center; }
      .cro-value-icon { width:56px; height:56px; display:grid; place-items:center; border-radius:50%; color:${T.gold}; background:rgba(196,169,98,0.1); margin-bottom:1.5rem; }
      .cro-value-card h3 { margin:0 0 .8rem; color:${T.ink}; font-size:1.25rem; font-family:var(--font-playfair, Georgia, serif); font-weight:500; }
      .cro-value-card p { margin:0; color:${T.muted}; font-size:.95rem; line-height:1.6; }

      /* Dark Benefits Section */
      .cro-benefits { background:${T.ink}; color:white; }
      .cro-benefit-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:2rem; }
      .cro-benefit { display:flex; gap:1.5rem; align-items:flex-start; }
      .cro-benefit svg { flex:none; color:${T.gold}; }
      .cro-benefit h3 { margin:0 0 .5rem; font-size:1.15rem; font-weight:500; }
      .cro-benefit p { margin:0; color:rgba(255,255,255,.6); font-size:.95rem; line-height:1.6; }

      /* Comparison */
      .cro-compare { display:grid; grid-template-columns:1fr 1fr; border-radius:20px; overflow:hidden; border:none; box-shadow:0 30px 60px rgba(0,0,0,0.08); }
      .cro-compare-col { padding:4rem; }
      .cro-compare-col:first-child { background:${T.mist}; }
      .cro-compare-col:last-child { color:white; background:${T.ink}; }
      .cro-compare h3 { margin:0 0 2rem; font-family:var(--font-playfair, Georgia, serif); font-size:1.8rem; font-weight:500; }
      .cro-compare-list { display:grid; gap:1.2rem; }
      .cro-compare-row { display:flex; align-items:center; gap:.8rem; font-size:1rem; font-weight:500; }

      /* Events Slider/Grid */
      .cro-events { display:grid; grid-template-columns:repeat(5,1fr); gap:1rem; }
      .cro-event { position:relative; aspect-ratio:3/4; overflow:hidden; border-radius:16px; color:white; }
      .cro-event img { object-fit:cover; transition:transform .7s cubic-bezier(0.25,1,0.5,1); }
      .cro-event:hover img { transform:scale(1.08); }
      .cro-event::after { content:''; position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,.8) 0%, rgba(0,0,0,0) 50%); }
      .cro-event-body { position:absolute; z-index:2; inset:auto 1.5rem 1.5rem; }
      .cro-event h3 { margin:0 0 .4rem; font-family:var(--font-playfair, Georgia, serif); font-size:1.4rem; font-weight:500; }
      .cro-event p { margin:0 0 1rem; color:rgba(255,255,255,.8); font-size:.85rem; line-height:1.5; }
      .cro-event a { display:inline-block; padding:0.4rem 1rem; border:1px solid rgba(255,255,255,0.4); border-radius:20px; color:white; font-size:.8rem; font-weight:600; text-decoration:none; backdrop-filter:blur(4px); transition:background 0.3s; }
      .cro-event a:hover { background:white; color:${T.ink}; }

      /* Pricing */
      .cro-pricing { background:${T.paper}; }
      .cro-plans { display:grid; grid-template-columns:repeat(3,1fr); gap:2rem; align-items:end; margin-top:3rem; }
      .cro-plan { position:relative; padding:3rem 2rem; border-radius:20px; }
      .cro-plan-featured { border:1px solid ${T.gold}; background:${T.ink}; color:white; box-shadow:0 30px 60px rgba(13,10,7,.15); transform:scale(1.03); z-index:2; }
      .cro-plan-badge { position:absolute; top:-15px; left:50%; transform:translateX(-50%); padding:.4rem 1rem; border-radius:20px; color:${T.ink}; background:${T.gold}; font-size:.75rem; font-weight:700; letter-spacing:.05em; text-transform:uppercase; box-shadow:0 4px 10px rgba(196,169,98,.3); }
      .cro-plan h3 { margin:0 0 .5rem; color:${T.ink}; font-family:var(--font-playfair, Georgia, serif); font-size:2rem; font-weight:500; }
      .cro-plan-featured h3 { color:white; }
      .cro-plan-copy { min-height:60px; margin:0 0 2rem; color:${T.muted}; font-size:.95rem; line-height:1.6; }
      .cro-plan-featured .cro-plan-copy { color:rgba(255,255,255,.7); }
      .cro-price { margin-bottom:2rem; color:${T.ink}; font-family:var(--font-playfair, Georgia, serif); font-size:3.5rem; font-weight:400; line-height:1; }
      .cro-plan-featured .cro-price { color:white; }
      .cro-price small { display:block; margin-top:0.5rem; color:${T.muted}; font-family:system-ui,sans-serif; font-size:.85rem; font-weight:500; }
      .cro-plan-featured .cro-price small { color:rgba(255,255,255,.5); }
      .cro-plan-list { display:grid; gap:.8rem; margin:0 0 2.5rem; padding:0; list-style:none; }
      .cro-plan-list li { display:flex; gap:.6rem; color:${T.text}; font-size:.9rem; align-items:start; }
      .cro-plan-featured .cro-plan-list li { color:rgba(255,255,255,.8); }
      .cro-checkout { width:100%; min-height:54px; border:0; border-radius:30px; font-size:.95rem; font-weight:600; cursor:pointer; transition:all 0.3s; }
      .cro-checkout-standard { color:${T.paper}; background:${T.ink}; }
      .cro-checkout-standard:hover { background:#000; box-shadow:0 10px 20px rgba(0,0,0,.1); }
      .cro-checkout-featured { color:${T.ink}; background:${T.gold}; }
      .cro-checkout-featured:hover { background:#B39851; box-shadow:0 10px 20px rgba(196,169,98,.2); }

      /* Pricing Comparison Table */
      .cro-comptable-wrap { overflow-x:auto; margin-top:3rem; border-radius:16px; border:1px solid ${T.border}; background:white; }
      .cro-comptable { width:100%; min-width:760px; border-collapse:collapse; font-size:.95rem; }
      .cro-comptable thead th { padding:1.5rem 1rem; text-align:center; font-size:.85rem; font-weight:600; text-transform:uppercase; border-bottom:1px solid ${T.border}; }
      .cro-comptable thead th:first-child { text-align:left; padding-left:2rem; }
      .cro-comptable thead th.cth-featured { background:${T.ivory}; color:${T.ink}; }
      .cro-comptable tbody tr { border-bottom:1px solid ${T.border}; transition:background 0.2s; }
      .cro-comptable tbody tr:hover { background:${T.paper}; }
      .cro-comptable td { padding:1rem; text-align:center; color:${T.muted}; }
      .cro-comptable td:first-child { text-align:left; padding-left:2rem; color:${T.ink}; font-weight:500; }
      .cro-comptable td.cth-featured { background:rgba(244,242,236,0.5); }
      .cro-comptable .ct-yes { color:${T.gold}; font-size:1.2rem; font-weight:bold; }
      .cro-comptable .ct-no  { color:${T.border}; font-size:1rem; }

      /* Testimonials */
      .cro-testimonial { padding:2.5rem; text-align:left; display:flex; flex-direction:column; justify-content:space-between; }
      .cro-stars { color:${T.gold}; font-size:1.2rem; margin-bottom:1rem; }
      .cro-testimonial blockquote { margin:0 0 2rem; color:${T.ink}; font-family:var(--font-playfair, Georgia, serif); font-size:1.25rem; line-height:1.5; font-style:italic; }
      .cro-testimonial strong { display:block; font-size:.95rem; }
      .cro-testimonial span { display:block; color:${T.muted}; font-size:.85rem; margin-top:.2rem; }

      /* Guarantee */
      .cro-guarantee { display:grid; grid-template-columns:auto 1fr; gap:4rem; align-items:center; padding:4rem; background:white; border:1px solid ${T.border}; border-radius:24px; box-shadow:0 20px 40px rgba(0,0,0,0.02); }
      .cro-guarantee-mark { width:120px; height:120px; display:grid; place-items:center; border:2px solid ${T.gold}; border-radius:50%; color:${T.gold}; background:rgba(196,169,98,0.05); }
      .cro-guarantee-list { display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-top:2rem; }
      .cro-guarantee-item { display:flex; gap:.8rem; color:${T.text}; font-size:.95rem; align-items:center; }

      /* FAQ */
      .cro-faq { max-width:800px; margin:4rem auto 0; }
      .cro-faq details { border-bottom:1px solid ${T.border}; }
      .cro-faq summary { padding:1.5rem 0; display:flex; align-items:center; justify-content:space-between; gap:1rem; cursor:pointer; color:${T.ink}; font-weight:500; font-size:1.1rem; list-style:none; transition:color 0.2s; }
      .cro-faq summary:hover { color:${T.gold}; }
      .cro-faq summary::-webkit-details-marker { display:none; }
      .cro-faq p { margin:0 0 1.5rem; color:${T.muted}; line-height:1.7; font-size:1rem; }
      .cro-faq-plus { color:${T.gold}; font-size:1.5rem; font-weight:300; transition:transform .3s ease; }
      .cro-faq details[open] .cro-faq-plus { transform:rotate(45deg); }

      /* Final CTA Cinematic */
      .cro-final { position:relative; min-height:70svh; display:flex; align-items:center; text-align:center; color:white; overflow:hidden; }
      .cro-final-bg { position:absolute; inset:0; z-index:-2; background:#000; }
      .cro-final img { object-fit:cover; opacity:0.6; transform:scale(1.05); animation:slowZoom 20s ease-out forwards; }
      .cro-final::after { content:''; position:absolute; inset:0; z-index:-1; background:linear-gradient(0deg, rgba(17,17,17,0.9), rgba(17,17,17,0.5)); }
      .cro-final-inner { max-width:800px; margin:0 auto; padding:6rem 20px; position:relative; z-index:1; }
      .cro-final h2 { margin:0 0 1.5rem; font-family:var(--font-playfair, Georgia, serif); font-size:clamp(3rem, 6vw, 4.5rem); line-height:1.1; font-weight:400; }
      .cro-final p { margin:0 auto 2.5rem; color:rgba(255,255,255,.8); font-size:1.25rem; line-height:1.6; font-weight:300; max-width:600px; }
      
      /* Footer */
      .cro-footer { padding:2rem 0; border-top:1px solid ${T.border}; color:${T.muted}; font-size:.85rem; }
      .cro-footer-inner { display:flex; justify-content:space-between; gap:1rem; flex-wrap:wrap; }

      @media (max-width:980px) {
        .cro-events { grid-template-columns:repeat(3,1fr); }
        .cro-demo-layout { grid-template-columns:1fr; gap:3rem; }
        .cro-demo-screen { max-width:400px; margin:0 auto; }
        .cro-plans { grid-template-columns:1fr; max-width:500px; margin:3rem auto 0; gap:2rem; }
        .cro-plan-featured { transform:none; }
        .cro-guarantee { grid-template-columns:1fr; text-align:center; padding:3rem 2rem; }
        .cro-guarantee-mark { margin:0 auto; }
        .cro-guarantee-list { grid-template-columns:1fr; text-align:left; }
      }
      @media (max-width:780px) {
        .cro-nav-link { display:none; }
        .cro-nav-cta { display:none; } /* Hide in header for mobile, use sticky */
        .cro-nav-acceder-mobile { display:inline; }
        .cro-nav-acceder-desktop { display:none; }
        .cro-grid-3 { grid-template-columns:1fr; }
        .cro-benefit-grid, .cro-compare { grid-template-columns:1fr; }
        .cro-compare-col { padding:2.5rem 2rem; }
        .cro-events { grid-template-columns:1fr 1fr; }
        .cro-trust-items { justify-content:center; }
      }
      @media (max-width:480px) {
        .cro-events { grid-template-columns:1fr; }
        .cro-hero-actions { flex-direction:column; }
        .cro-hero-actions .cro-btn { width:100%; }
        .cro-final .cro-hero-actions { justify-content:center; }
      }
      
      @media (prefers-reduced-motion:reduce) {
        html { scroll-behavior:auto; }
        .cro-btn, .cro-event img, .cro-faq-plus, .cro-hero-media, .cro-final img { transition:none !important; animation:none !important; }
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
          <Link href="#planes" className="cro-nav-link cro-nav-cta">Ver planes</Link>
        </div>
      </div>
    </nav>
  );
}

function MobileStickyCTA() {
  return (
    <Link href="#planes" className="cro-mobile-sticky-cta">
      Crear mi invitación <ArrowRight size={16} />
    </Link>
  );
}

function Hero() {
  return (
    <section className="cro-hero">
      <div className="cro-hero-bg"></div>
      <Image
        className="cro-hero-media"
        src="/images/invitaciones/social-proof-event-1.webp"
        alt="Celebración elegante de boda"
        fill
        priority
        sizes="100vw"
      />
      <div className="cro-shell">
        <Reveal className="cro-hero-content">
          <p className="cro-eyebrow" style={{ color: T.gold }}>Centro inteligente para eventos</p>
          <h1>La forma más elegante de organizar tu evento.</h1>
          <p className="cro-hero-copy">
            Crea una invitación premium, confirma asistentes automáticamente y comparte toda la información desde un solo enlace.
          </p>
          <div className="cro-hero-actions">
            <Link href="#planes" className="cro-btn cro-btn-gold">Ver planes <ArrowRight size={17} /></Link>
            <Link href="/sofia-y-alejandro" className="cro-btn cro-btn-light">Ver demo real <Play size={16} fill="currentColor" /></Link>
          </div>
          <div className="cro-hero-benefits">
            {['Sin instalar apps', 'Lista para WhatsApp', 'RSVP según plan', 'Pago seguro', 'Editable desde celular'].map((item) => (
              <span key={item}><Check size={14} color={T.gold} /> {item}</span>
            ))}
          </div>
        </Reveal>
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
    <section id="como-funciona" className="cro-section">
      <div className="cro-shell cro-demo-layout">
        <Reveal>
          <div className="cro-demo-screen">
            <Image src="/images/invitaciones/wedding-details.webp" alt="Vista del flujo de una invitación Kompralo" fill sizes="(max-width: 780px) 100vw, 320px" />
            <Link href="/sofia-y-alejandro" className="cro-play" aria-label="Ver demo interactiva"><Play size={28} fill="currentColor" style={{ marginLeft: 4 }} /></Link>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="cro-eyebrow">Una experiencia simple</p>
          <h2 className="cro-title" style={{ marginBottom: '1.5rem' }}>Crea tu invitación digital en minutos.</h2>
          <p className="cro-copy">Personaliza tu diseño, añade la información clave y compártelo por WhatsApp. Todo desde tu celular.</p>
          <div className="cro-flow">
            {DEMO_STEPS.map((step, index) => <div className="cro-flow-row" key={step}><span className="cro-flow-n">{index + 1}</span>{step}</div>)}
          </div>
          <Link href="#planes" className="cro-btn cro-btn-dark">Elegir plan <ArrowRight size={16} /></Link>
        </Reveal>
      </div>
    </section>
  );
}

function TrustBand() {
  const items = [
    [ShieldCheck, 'Pago protegido con Stripe'],
    [Smartphone, 'Sin instalar aplicaciones'],
    [MessageCircle, 'Lista para WhatsApp'],
    [Palette, 'Editable desde celular'],
  ] as const;
  return (
    <div className="cro-trust-band">
      <div className="cro-shell cro-trust-items">
        {items.map(([Icon, label]) => (
          <div className="cro-trust-item" key={label}>
            <Icon size={18} color={T.gold} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

const CORE_VALUES = [
  { icon: Sparkles, title: 'Invitación premium', text: 'Una presentación elegante para compartir tu evento.' },
  { icon: Users, title: 'RSVP organizado', text: 'Olvídate de perseguir invitados por WhatsApp.' },
  { icon: MapPin, title: 'Ubicación clara', text: 'Nadie llegará tarde por perderse en el camino.' },
  { icon: Gift, title: 'Mesa de regalos', text: 'Tus invitados saben exactamente qué regalarte.' },
  { icon: CalendarClock, title: 'Itinerario', text: 'Todos conocen los horarios importantes.' },
  { icon: Images, title: 'Galería e historia', text: 'Haz que tu invitación se sienta personal y memorable.' },
];

function WhyKompralo() {
  return (
    <section className="cro-section" style={{ background: T.ivory }}>
      <div className="cro-shell">
        <Reveal style={{ maxWidth: 760, marginBottom: '3rem', textAlign: 'center', marginInline: 'auto' }}>
          <p className="cro-eyebrow">Todo conectado</p>
          <h2 className="cro-title">No es solo una invitación. Es el centro digital de tu evento.</h2>
        </Reveal>
        <Stagger className="cro-grid-3">
          {CORE_VALUES.map(({ icon: Icon, title, text }) => (
            <Item key={title}>
              <HoverCard className="cro-card cro-value-card" style={{ height: '100%' }}>
                <span className="cro-value-icon"><Icon size={26} /></span>
                <h3>{title}</h3>
                <p>{text}</p>
              </HoverCard>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

const BENEFITS = [
  { icon: Users, title: 'Confirma sin perseguir mensajes', text: 'Recibe confirmaciones de asistencia automáticamente según el plan elegido.' },
  { icon: Palette, title: 'Actualiza sin rediseñar', text: 'Cambia datos importantes desde el editor sin empezar de nuevo ni reimprimir.' },
  { icon: Clock3, title: 'Crea expectativa', text: 'La cuenta regresiva interactiva mantiene presente la fecha importante.' },
  { icon: Images, title: 'Cuenta tu historia', text: 'Comparte la emoción antes del evento con fotos y momentos inolvidables.' },
];

function BenefitsSection() {
  return (
    <section className="cro-section cro-benefits">
      <div className="cro-shell">
        <Reveal style={{ maxWidth: 760, marginBottom: '3.5rem' }}>
          <p className="cro-eyebrow" style={{ color: T.gold }}>Menos estrés, más emoción</p>
          <h2 className="cro-title" style={{ color: 'white' }}>Todo lo que tus invitados necesitan, centralizado en un lugar hermoso.</h2>
        </Reveal>
        <Stagger className="cro-benefit-grid">
          {BENEFITS.map(({ icon: Icon, title, text }) => (
            <Item key={title}>
              <div className="cro-benefit">
                <Icon size={28} />
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </div>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function Comparison() {
  const traditional = ['Impresión y entrega física', 'Reimpresiones por errores', 'Confirmación manual lenta', 'Información dispersa', 'Altos costos variables'];
  const kompralo = ['Formato digital inmediato', 'Cambios instantáneos gratis', 'RSVP automático (según plan)', 'Todo en un solo enlace', 'Pago único predecible'];
  return (
    <section className="cro-section">
      <div className="cro-shell">
        <Reveal style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 3rem' }}>
          <p className="cro-eyebrow">Compara la experiencia</p>
          <h2 className="cro-title">Una invitación tradicional informa. Kompralo organiza.</h2>
        </Reveal>
        <Reveal>
          <div className="cro-card cro-compare">
            <div className="cro-compare-col">
              <h3>Invitación tradicional</h3>
              <div className="cro-compare-list">
                {traditional.map(x => <div className="cro-compare-row" key={x}><span aria-hidden="true" style={{ color: T.muted }}>—</span>{x}</div>)}
              </div>
            </div>
            <div className="cro-compare-col">
              <h3>Con Kompralo</h3>
              <div className="cro-compare-list">
                {kompralo.map(x => <div className="cro-compare-row" key={x}><Check size={18} color={T.gold} />{x}</div>)}
              </div>
            </div>
          </div>
        </Reveal>
        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <Link href="#planes" className="cro-btn cro-btn-dark">Crear mi invitación <ArrowRight size={16} /></Link>
        </div>
      </div>
    </section>
  );
}

const EVENTS = [
  { name: 'Bodas', image: '/images/invitaciones/social-proof-event-1.webp', text: 'Una experiencia romántica, elegante y completa.' },
  { name: 'XV años', image: '/images/invitaciones/xv-event-editorial.webp', text: 'Presenta cada detalle de una celebración inolvidable.' },
  { name: 'Bautizos', image: '/images/invitaciones/baptism-soft-event.webp', text: 'Comparte con claridad un momento especial en familia.' },
  { name: 'Baby shower', image: '/images/invitaciones/baby-shower-pastel.webp', text: 'Reúne ubicación, regalos y confirmaciones.' },
  { name: 'Cumpleaños', image: '/images/invitaciones/birthday-premium.webp', text: 'El inicio perfecto para la gran celebración.' },
];

function EventsSection() {
  return (
    <section className="cro-section" style={{ background: T.mist }}>
      <div className="cro-shell">
        <Reveal style={{ maxWidth: 700, marginBottom: '3rem' }}>
          <p className="cro-eyebrow">Para cada ocasión</p>
          <h2 className="cro-title">Ideal para bodas, XV años, bautizos, baby shower y cumpleaños.</h2>
        </Reveal>
        <Stagger className="cro-events">
          {EVENTS.map(event => (
            <Item key={event.name}>
              <article className="cro-event">
                <Image src={event.image} alt={`Invitación para ${event.name}`} fill sizes="(max-width: 480px) 100vw, (max-width: 980px) 33vw, 20vw" />
                <div className="cro-event-body">
                  <h3>{event.name}</h3>
                  <p>{event.text}</p>
                  <Link href="#planes">Ver modelos</Link>
                </div>
              </article>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

const PLAN_COPY: Record<string, string> = {
  basic: 'Para quien quiere una invitación elegante, clara y fácil de compartir.',
  premium: 'Para quien quiere organizar mejor su evento con RSVP, galería e historia.',
  deluxe: 'Para eventos formales que necesitan una experiencia más completa y premium.',
};

function formatPrice(product: Product) {
  const amount = product.price / 100;
  return '$' + amount.toLocaleString('es-MX', { maximumFractionDigits: 0 });
}

function PlanCard({ product }: { product: Product }) {
  const featured = product.id === 'premium';
  return (
    <HoverCard className={`cro-card cro-plan${featured ? ' cro-plan-featured' : ''}`} lift={featured ? 5 : 2}>
      {featured && <span className="cro-plan-badge">Recomendado</span>}
      <h3>{product.name}</h3>
      <p className="cro-plan-copy">{PLAN_COPY[product.id]}</p>
      <div className="cro-price">{formatPrice(product)} <small>MXN · pago único</small></div>
      <ul className="cro-plan-list">
        {product.features.map(feature => <li key={feature}><Check size={18} color={T.gold} />{feature}</li>)}
      </ul>
      <CheckoutButton productId={product.id} label={`Elegir ${product.name}`} className={`cro-checkout ${featured ? 'cro-checkout-featured' : 'cro-checkout-standard'}`} />
    </HoverCard>
  );
}

function Pricing() {
  return (
    <section id="planes" className="cro-section cro-pricing">
      <div className="cro-shell">
        <Reveal style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 1rem' }}>
          <p className="cro-eyebrow">Pago único, sin mensualidades</p>
          <h2 className="cro-title">Elige cuánto quieres organizar desde tu invitación</h2>
          <p className="cro-copy" style={{ marginTop: '1rem' }}>Desbloquea las herramientas que más te ayudan a gestionar tu evento.</p>
        </Reveal>
        <Stagger className="cro-plans" gap={0.1}>
          {availableProducts.map(product => (
            <Item key={product.id}>
              <PlanCard product={product} />
            </Item>
          ))}
        </Stagger>
        <p style={{ textAlign: 'center', margin: '3rem 0 0', color: T.muted, fontSize: '.9rem', fontWeight: 500 }}>
          Pago protegido por Stripe · Acceso inmediato al editor · Sin instalar apps
        </p>
      </div>
    </section>
  );
}

const COMP_ROWS: [string, boolean, boolean, boolean][] = [
  ['Portada animada',           true,  true,  true ],
  ['Cuenta regresiva',          true,  true,  true ],
  ['Confirmación de asistencia',true,  true,  true ],
  ['Botón WhatsApp RSVP',       true,  true,  true ],
  ['Mapa / Ubicación',          true,  true,  true ],
  ['Itinerario del evento',     true,  true,  true ],
  ['Código de vestimenta',      true,  true,  true ],
  ['Mensaje final',             true,  true,  true ],
  ['Enlace para compartir',     true,  true,  true ],
  ['Galería de fotos',          false, true,  true ],
  ['Música de fondo',           false, true,  true ],
  ['Video hero',                false, true,  true ],
  ['Código QR',                 false, true,  true ],
  ['Historia de la pareja',     false, true,  true ],
  ['Línea del tiempo',          false, true,  true ],
  ['Mesa de regalos',           false, true,  true ],
  ['Padres y familia',          false, true,  true ],
  ['Padrinos',                  false, true,  true ],
  ['Hospedaje / Hotel',         false, true,  true ],
  ['Hashtag social',            false, true,  true ],
  ['Intro cinemática',          false, false, true ],
  ['Libro de visitas',          false, false, true ],
  ['Mensajes de invitados',     false, false, true ],
];

function PricingComparison() {
  return (
    <section className="cro-section" style={{ paddingTop: 0, background: T.paper }}>
      <div className="cro-shell">
        <Reveal style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 3rem' }}>
          <p className="cro-eyebrow">Compara a detalle</p>
          <h2 className="cro-title">Encuentra el plan ideal para tu evento</h2>
        </Reveal>
        <div className="cro-comptable-wrap">
          <table className="cro-comptable">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Características</th>
                <th style={{ width: '20%' }}>Basic</th>
                <th className="cth-featured" style={{ width: '20%' }}>Premium</th>
                <th style={{ width: '20%' }}>Deluxe</th>
              </tr>
            </thead>
            <tbody>
              {COMP_ROWS.map(([label, basic, gold, plat]) => (
                <tr key={label}>
                  <td>{label}</td>
                  <td>{basic ? <span className="ct-yes">✓</span> : <span className="ct-no">—</span>}</td>
                  <td className="cth-featured">{gold ? <span className="ct-yes">✓</span> : <span className="ct-no">—</span>}</td>
                  <td>{plat ? <span className="ct-yes">✓</span> : <span className="ct-no">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

const TESTIMONIALS = [
  { quote: 'Confirmamos invitados sin estar persiguiendo mensajes por WhatsApp. Todo desde el celular.', name: 'María y Daniel', meta: 'Boda · Veracruz' },
  { quote: 'Todo quedó en un solo enlace: ubicación, horario, fotos y confirmación. Fue muy elegante.', name: 'Fernanda L.', meta: 'XV años · CDMX' },
  { quote: 'La familia pudo abrir la invitación y ver la mesa de regalos sin complicaciones.', name: 'Alejandra V.', meta: 'Bautizo · Puebla' },
];

function Testimonials() {
  return (
    <section className="cro-section" style={{ background: T.ivory }}>
      <div className="cro-shell">
        <Reveal style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 3rem' }}>
          <p className="cro-eyebrow">Prueba social</p>
          <h2 className="cro-title">Menos coordinación manual. Más tranquilidad antes del evento.</h2>
        </Reveal>
        <Stagger className="cro-grid-3">
          {TESTIMONIALS.map(item => (
            <Item key={item.name}>
              <HoverCard className="cro-card cro-testimonial" style={{ height: '100%', background: 'white' }}>
                <div className="cro-stars" aria-label="Cinco estrellas">★★★★★</div>
                <blockquote>“{item.quote}”</blockquote>
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.meta}</span>
                </div>
              </HoverCard>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function Guarantee() {
  const items = [
    'Soporte para acceder a tu panel',
    'Ayuda con el editor',
    'Acceso seguro garantizado',
    'Actualizaciones ilimitadas',
  ];
  return (
    <section className="cro-section" style={{ paddingTop: 0, background: T.ivory }}>
      <div className="cro-shell">
        <Reveal>
          <div className="cro-guarantee">
            <div className="cro-guarantee-mark"><ShieldCheck size={56} /></div>
            <div>
              <p className="cro-eyebrow" style={{ color: T.gold }}>Soporte incluido</p>
              <h2 className="cro-title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>No te dejamos sola.</h2>
              <p className="cro-copy">Si tienes problemas para personalizar o compartir tu invitación, nuestro equipo te ayuda a dejarla lista.</p>
              <div className="cro-guarantee-list">
                {items.map(item => <div className="cro-guarantee-item" key={item}><Check size={18} color={T.gold} />{item}</div>)}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const FAQS = [
  ['¿Necesito instalar una app?', 'No. Tus invitados abren la invitación directamente desde cualquier navegador web usando el enlace que les compartas.'],
  ['¿Puedo personalizarla desde mi celular?', 'Sí. Nuestro editor está optimizado para que puedas agregar tus datos, fotos y ajustes desde la comodidad de tu smartphone.'],
  ['¿Qué pasa después de pagar?', 'Se habilita tu invitación de forma inmediata y recibes un correo con acceso seguro a tu panel de control.'],
  ['¿Puedo compartirla por WhatsApp?', 'Por supuesto. Una vez lista, tendrás un enlace corto ideal para enviarlo a todos tus contactos por WhatsApp.'],
  ['¿Cómo funciona la confirmación de asistencia?', 'Dependiendo de tu plan, los invitados verán un botón para confirmar. Sus respuestas se guardarán en tu panel o se enviarán directamente a tu WhatsApp.'],
  ['¿Puedo cambiar información si me equivoco?', 'Sí, puedes actualizar datos como la hora, dirección o fotos cuantas veces quieras, y tus invitados verán los cambios al instante al abrir el enlace.'],
];

function FAQ() {
  return (
    <section className="cro-section" style={{ background: T.paper }}>
      <div className="cro-shell">
        <Reveal style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto' }}>
          <p className="cro-eyebrow">Preguntas frecuentes</p>
          <h2 className="cro-title">Resolvemos tus dudas</h2>
        </Reveal>
        <div className="cro-faq">
          {FAQS.map(([q, a]) => (
            <details key={q}>
              <summary>{q} <span className="cro-faq-plus">+</span></summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="cro-final">
      <div className="cro-final-bg"></div>
      <Image src="/images/invitaciones/wedding-details.webp" alt="Detalles elegantes para un evento" fill sizes="100vw" />
      <div className="cro-shell">
        <Reveal className="cro-final-inner">
          <p className="cro-eyebrow" style={{ color: T.gold }}>Empieza hoy mismo</p>
          <h2>Tu evento merece algo más que una simple imagen.</h2>
          <p>Crea una invitación premium, editable y lista para sorprender a tus invitados en minutos.</p>
          <div className="cro-hero-actions" style={{ justifyContent: 'center' }}>
            <Link href="#planes" className="cro-btn cro-btn-gold">Elegir plan <ArrowRight size={16} /></Link>
            <Link href="/sofia-y-alejandro" className="cro-btn cro-btn-light">Ver demo real <Play size={15} fill="currentColor" /></Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="cro-footer">
      <div className="cro-shell cro-footer-inner">
        <strong style={{ color: T.ink, letterSpacing: '.1em', fontSize: '.9rem' }}>KOMPRALO</strong>
        <span>Invitaciones digitales y organización premium.</span>
        <Link href="/login" style={{ color: T.ink, textDecoration: 'none', fontWeight: 600 }}>Acceso a clientes</Link>
        <span>© {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
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
      <Pricing />
      <PricingComparison />
      <Testimonials />
      <Guarantee />
      <FAQ />
      <FinalCTA />
      <Footer />
      <MobileStickyCTA />
    </main>
  );
}
