import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  CalendarClock,
  Check,
  Gift,
  Images,
  MapPin,
  ShieldCheck,
  Smartphone,
  Users,
} from 'lucide-react';
import { CheckoutButton } from '@/components/checkout/CheckoutButton';
import { Item, Reveal, Stagger } from '@/components/public/Motion';
import Hero3D from '@/components/public/Hero3D';
import { InvitacionesHeader } from '@/components/public/InvitacionesHeader';
import { availableProducts } from '@/domain/products';
import type { Product } from '@/domain/products';

export const metadata: Metadata = {
  title: 'Invitaciones Digitales Premium con RSVP Automático | Kompralo',
  description:
    'Crea tu invitación web premium en minutos. Confirmación de asistencia (RSVP) en tiempo real, mapas, mesa de regalos y música en un solo enlace elegante.',
};

const T = {
  black:  '#000000',
  onyx:   '#050505',
  ink:    '#FFFFFF',
  cyan:   '#A67B5B',
  silver: '#E0E0E0',
  muted:  '#8A8A8A',
  glass:  'rgba(255,255,255,0.03)',
  border: 'rgba(255,255,255,0.1)',
} as const;

function LandingStyles() {
  return (
    <style>{`
      html { scroll-behavior: smooth; background: ${T.black}; color: ${T.ink}; }

      .cro-page { overflow-x: hidden; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      .cro-shell { width: min(1400px, calc(100% - 40px)); margin-inline: auto; }

      .cro-title-mega { margin: 0; font-size: clamp(3rem, 10vw, 8rem); font-weight: 800; letter-spacing: -0.04em; line-height: 0.95; text-transform: uppercase; color: ${T.ink}; }
      .cro-title-xl { margin: 0; font-size: clamp(2rem, 5vw, 4rem); font-weight: 700; letter-spacing: -0.02em; line-height: 1.05; }
      .cro-eyebrow { margin: 0 0 1rem; color: ${T.cyan}; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.25em; text-transform: uppercase; }
      .cro-copy { color: ${T.silver}; font-size: clamp(1.1rem, 2vw, 1.3rem); line-height: 1.6; font-weight: 300; }

      .cro-btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.75rem; padding: 1rem 2.5rem; font-size: 0.85rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); border-radius: 4px; position: relative; overflow: hidden; }
      .cro-btn::before { content:''; position: absolute; inset:0; background: ${T.ink}; z-index: -1; transform: scaleX(0); transform-origin: right; transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
      .cro-btn:hover::before { transform: scaleX(1); transform-origin: left; }
      .cro-btn-primary { color: ${T.black}; background: ${T.ink}; }
      .cro-btn-primary:hover { color: ${T.ink}; box-shadow: 0 0 20px rgba(255,255,255,0.4); }
      .cro-btn-primary::before { background: ${T.black}; }
      .cro-btn-outline { color: ${T.ink}; background: transparent; border: 1px solid ${T.border}; backdrop-filter: blur(10px); }
      .cro-btn-outline:hover { color: ${T.black}; border-color: ${T.ink}; }
      .cro-btn-cyan { color: ${T.black}; background: ${T.cyan}; box-shadow: 0 0 30px rgba(166,123,91,0.3); }
      .cro-btn-cyan:hover { color: ${T.cyan}; background: transparent; border: 1px solid ${T.cyan}; box-shadow: 0 0 40px rgba(166,123,91,0.6); }
      .cro-btn-cyan::before { background: ${T.black}; }

      .cro-section-vh { min-height: 100svh; display: flex; flex-direction: column; justify-content: center; position: relative; overflow: hidden; padding: 8rem 0; scroll-margin-top: 80px; }
      .cro-section { padding: clamp(6rem, 15vw, 12rem) 0; position: relative; border-bottom: 1px solid ${T.border}; scroll-margin-top: 80px; }
      .cro-glass { background: ${T.glass}; backdrop-filter: blur(30px); border: 1px solid ${T.border}; border-radius: 2px; }

      .cro-mobile-sticky-cta { display: none; position: fixed; bottom: 0; left: 0; width: 100%; z-index: 999; background: rgba(0,0,0,0.85); backdrop-filter: blur(20px); border-top: 1px solid ${T.border}; padding: 1rem; align-items: center; justify-content: space-between; text-decoration: none; color: ${T.ink}; transition: transform 0.5s; }
      @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

      .cro-nav { position: fixed; top: 0; width: 100%; z-index: 1000; transition: all 0.5s; background: linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%); padding: 1.5rem 0; }
      .cro-nav-inner { display: flex; align-items: center; justify-content: space-between; }
      .cro-logo { color: ${T.ink}; font-size: 1.2rem; font-weight: 800; letter-spacing: 0.25em; text-decoration: none; text-transform: uppercase; }
      .cro-nav-links { display: flex; align-items: center; gap: 3rem; }
      .cro-nav-link { color: ${T.silver}; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; text-decoration: none; transition: color 0.3s; }
      .cro-nav-link:hover { color: ${T.ink}; }

      /* Mobile menu button & menu */
      .cro-mobile-menu-btn { display: none; background: none; border: none; color: ${T.ink}; cursor: pointer; padding: 0.5rem; z-index: 1001; }
      .cro-mobile-menu { display: none; position: fixed; top: 70px; left: 0; right: 0; background: rgba(0,0,0,0.95); backdrop-filter: blur(20px); border-bottom: 1px solid ${T.border}; flex-direction: column; z-index: 1000; padding: 1rem 0; }
      .cro-mobile-menu-link { display: block; padding: 1rem 20px; color: ${T.silver}; font-size: 0.9rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; border-bottom: 1px solid rgba(255,255,255,0.05); transition: color 0.3s; }
      .cro-mobile-menu-link:hover { color: ${T.ink}; background: rgba(255,255,255,0.02); }

      .cro-hero-bg { position: absolute; inset: 0; z-index: -2; background: #000; }
      .cro-hero-img { object-fit: cover; opacity: 0.6; transform: scale(1.05); animation: tagHeuerZoom 30s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
      @keyframes tagHeuerZoom { from { transform: scale(1); } to { transform: scale(1.2); } }
      .cro-hero-overlay { position: absolute; inset: 0; z-index: -1; background: radial-gradient(circle at center, transparent 0%, #000 100%); }
      .cro-hero-content { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; text-align: center; max-width: 1200px; margin: 0 auto; }
      .cro-hero-actions { display: flex; gap: 2rem; margin-top: 4rem; }

      .cro-block-split { display: grid; grid-template-columns: 1fr 1fr; min-height: 80svh; border-bottom: 1px solid ${T.border}; }
      .cro-block-media { position: relative; overflow: hidden; background: #000; }
      .cro-block-media img { object-fit: cover; opacity: 0.7; transition: transform 1.5s cubic-bezier(0.16, 1, 0.3, 1); }
      .cro-block-split:hover .cro-block-media img { transform: scale(1.05); }
      .cro-block-content { padding: clamp(3rem, 8vw, 6rem); display: flex; flex-direction: column; justify-content: center; background: ${T.onyx}; }

      .cro-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: ${T.border}; border: 1px solid ${T.border}; }
      .cro-value-card { background: ${T.black}; padding: 4rem 2rem; text-align: center; display: flex; flex-direction: column; align-items: center; transition: background 0.4s; }
      .cro-value-card:hover { background: rgba(166,123,91,0.02); }
      .cro-value-icon { margin-bottom: 2rem; color: ${T.ink}; transition: transform 0.4s, color 0.4s; }
      .cro-value-card:hover .cro-value-icon { transform: translateY(-5px) scale(1.1); color: ${T.cyan}; }
      .cro-value-card h3 { margin: 0 0 1rem; font-size: 1.25rem; font-weight: 500; letter-spacing: 0.05em; }
      .cro-value-card p { margin: 0; color: ${T.muted}; font-size: 0.95rem; line-height: 1.6; font-weight: 300; }

      .cro-events-gallery { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: ${T.border}; border-top: 1px solid ${T.border}; border-bottom: 1px solid ${T.border}; }
      .cro-gallery-item { position: relative; aspect-ratio: 9/16; overflow: hidden; background: #000; display: flex; align-items: flex-end; padding: 2rem; }
      .cro-gallery-item img { object-fit: cover; opacity: 0.5; transition: all 1s cubic-bezier(0.16,1,0.3,1); }
      .cro-gallery-item:hover img { opacity: 0.8; transform: scale(1.08); }
      .cro-gallery-content { position: relative; z-index: 2; transform: translateY(20px); opacity: 0; transition: all 0.5s cubic-bezier(0.16,1,0.3,1); }
      .cro-gallery-item:hover .cro-gallery-content { transform: translateY(0); opacity: 1; }
      .cro-gallery-content h3 { margin: 0; font-size: 1.5rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; }
      .cro-gallery-content p { margin: 0.5rem 0 0; color: ${T.cyan}; font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase; }

      .cro-editions-wrapper { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; margin-top: 4rem; }
      .cro-edition { padding: 4rem 3rem; display: flex; flex-direction: column; position: relative; overflow: hidden; }
      .cro-edition::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%); pointer-events: none; }
      .cro-edition-pro { border-color: rgba(166,123,91,0.3); box-shadow: 0 0 50px rgba(166,123,91,0.05); }
      .cro-edition-pro::after { background: linear-gradient(135deg, rgba(166,123,91,0.1) 0%, transparent 100%); }
      .cro-edition-badge { position: absolute; top: 0; right: 2rem; background: ${T.cyan}; color: ${T.black}; padding: 0.5rem 1rem; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; }
      .cro-edition h3 { margin: 0; font-size: 2.5rem; font-weight: 300; letter-spacing: -0.02em; }
      .cro-edition-pro h3 { font-weight: 600; color: ${T.cyan}; }
      .cro-edition-desc { margin: 1rem 0 3rem; color: ${T.muted}; font-size: 1rem; line-height: 1.6; min-height: 50px; }
      .cro-edition-price { font-size: 4.5rem; font-weight: 800; line-height: 1; letter-spacing: -0.05em; margin-bottom: 3rem; display: flex; flex-direction: column; }
      .cro-edition-price small { font-size: 0.85rem; font-weight: 400; letter-spacing: 0.1em; text-transform: uppercase; color: ${T.muted}; margin-top: 1rem; }
      .cro-edition-features { list-style: none; padding: 0; margin: 0 0 3rem; flex-grow: 1; display: flex; flex-direction: column; gap: 1rem; }
      .cro-edition-features li { display: flex; align-items: center; gap: 1rem; font-size: 0.95rem; color: ${T.silver}; }
      .cro-edition span.inline-flex { width: 100%; display: flex; }
      .cro-checkout { width: 100%; min-height: 60px; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; cursor: pointer; transition: all 0.4s; border-radius: 2px; }
      .cro-checkout-std { background: transparent; border: 1px solid ${T.border}; color: ${T.ink}; }
      .cro-checkout-std:hover { background: ${T.ink}; color: ${T.black}; }
      .cro-checkout-pro { background: ${T.cyan}; border: 1px solid ${T.cyan}; color: ${T.black}; }
      .cro-checkout-pro:hover { background: transparent; color: ${T.cyan}; box-shadow: 0 0 30px rgba(166,123,91,0.4); }

      .cro-table-wrapper { overflow-x: auto; margin-top: 4rem; }
      .cro-table { width: 100%; min-width: 800px; border-collapse: collapse; }
      .cro-table th, .cro-table td { padding: 1.5rem; border-bottom: 1px solid ${T.border}; text-align: center; }
      .cro-table th:first-child, .cro-table td:first-child { text-align: left; }
      .cro-table th { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: ${T.muted}; }
      .cro-table th.col-pro { color: ${T.cyan}; }
      .cro-table td { font-size: 0.95rem; color: ${T.silver}; }
      .cro-table td:first-child { font-weight: 300; }

      .cro-footer { padding: 4rem 0; border-top: 1px solid ${T.border}; background: #000; text-align: center; }
      .cro-footer-logo { font-size: 1.5rem; font-weight: 800; letter-spacing: 0.3em; margin-bottom: 2rem; display: block; text-decoration: none; color: ${T.ink}; }
      .cro-footer-links { display: flex; justify-content: center; gap: 3rem; margin-bottom: 3rem; }
      .cro-footer-links a { color: ${T.muted}; text-decoration: none; font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase; transition: color 0.3s; }
      .cro-footer-links a:hover { color: ${T.ink}; }

      /* ── Problem Section ──────────────────────────────────── */
      .cro-problem-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin-top: 4rem; }
      .cro-problem-card { padding: 2.5rem 2rem; border: 1px solid ${T.border}; border-radius: 2px; background: rgba(255,255,255,0.02); }
      .cro-problem-num { display: block; font-size: 3rem; font-weight: 800; color: rgba(255,255,255,0.06); margin-bottom: 1rem; letter-spacing: -0.04em; line-height: 1; }
      .cro-problem-card p { margin: 0; color: ${T.muted}; font-size: 1rem; line-height: 1.65; }

      /* ── Comparison Section ───────────────────────────────── */
      .cro-compare-grid { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid ${T.border}; border-radius: 2px; overflow: hidden; margin-top: 3rem; }
      .cro-compare-col { padding: 2.5rem 2rem; }
      .cro-compare-col-bad { border-right: 1px solid ${T.border}; background: rgba(255,255,255,0.01); }
      .cro-compare-col-good { background: rgba(166,123,91,0.04); }
      .cro-compare-header { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; margin: 0 0 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid ${T.border}; }
      .cro-compare-row { display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.875rem 0; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 0.9rem; line-height: 1.45; }
      .cro-compare-row:last-child { border-bottom: 0; }

      /* ── Guarantee Section ────────────────────────────────── */
      .cro-guarantee { text-align: center; max-width: 680px; margin: 0 auto; padding: 2rem; }
      .cro-guarantee-badge { display: inline-flex; align-items: center; gap: 0.625rem; background: rgba(166,123,91,0.1); border: 1px solid rgba(166,123,91,0.25); border-radius: 2px; padding: 0.625rem 1.25rem; margin-bottom: 2rem; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: ${T.cyan}; }

      /* ── FAQ ──────────────────────────────────────────────── */
      .cro-faq-item { border-bottom: 1px solid ${T.border}; }
      .cro-faq-q { display: flex; align-items: center; justify-content: space-between; padding: 1.75rem 0; cursor: pointer; list-style: none; font-size: 1rem; font-weight: 500; color: ${T.ink}; gap: 1rem; }
      .cro-faq-q::-webkit-details-marker { display: none; }
      .cro-faq-chevron { color: ${T.cyan}; transition: transform 0.3s ease; flex-shrink: 0; font-size: 1.1rem; line-height: 1; }
      details[open] .cro-faq-chevron { transform: rotate(180deg); }
      .cro-faq-a { padding: 0 2rem 1.75rem 0; color: ${T.muted}; line-height: 1.7; font-size: 0.95rem; }

      /* ── Editions reassurance ─────────────────────────────── */
      .cro-reassurance { text-align: center; margin-top: 2.5rem; padding: 1.5rem 2rem; border: 1px solid ${T.border}; border-radius: 2px; background: rgba(255,255,255,0.02); }

      /* ── Process Section ──────────────────────────────────── */
      .cro-process-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; margin-top: 4rem; }
      .cro-process-card { padding: 3rem 2.5rem; border: 1px solid ${T.border}; border-radius: 2px; background: rgba(255,255,255,0.02); display: flex; flex-direction: column; height: 100%; transition: background 0.4s; }
      .cro-process-card:hover { background: rgba(166,123,91,0.02); }
      .cro-process-step { display: inline-flex; align-items: center; justify-content: center; width: 3rem; height: 3rem; border-radius: 50%; border: 1px solid ${T.cyan}; color: ${T.cyan}; font-size: 1.1rem; font-weight: 700; margin-bottom: 1.5rem; }
      .cro-process-card h3 { margin: 0 0 1rem; font-size: 1.25rem; font-weight: 600; letter-spacing: 0.05em; }
      .cro-process-card p { margin: 0; color: ${T.muted}; font-size: 0.95rem; line-height: 1.6; font-weight: 300; }

      @media (max-width: 1024px) {
        .cro-block-split { grid-template-columns: 1fr; min-height: auto; }
        .cro-block-media { height: 50vh; }
        .cro-editions-wrapper { grid-template-columns: 1fr; max-width: 600px; margin-inline: auto; }
        .cro-events-gallery { grid-template-columns: repeat(2, 1fr); }
        .cro-problem-grid { grid-template-columns: 1fr; }
        .cro-compare-grid { grid-template-columns: 1fr; }
        .cro-compare-col-bad { border-right: 0; border-bottom: 1px solid ${T.border}; }
        .cro-process-grid { grid-template-columns: 1fr; max-width: 500px; margin-inline: auto; }
      }
      @media (max-width: 780px) {
        .cro-mobile-sticky-cta { display: flex; animation: slideUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards; }
        .cro-nav-links { display: none; }
        .cro-mobile-menu-btn { display: flex; }
        .cro-mobile-menu { display: flex; }
        .cro-grid-3 { grid-template-columns: 1fr; }
        .cro-hero-actions { flex-direction: column; width: 100%; max-width: 300px; }
        .cro-hero-actions .cro-btn { width: 100%; }
        .cro-events-gallery { grid-template-columns: 1fr; }
        .cro-gallery-item { aspect-ratio: 16/9; }
        .cro-hero-actions { gap: 1rem; }
        .cro-hero-actions .cro-btn { padding: 0.8rem 1.5rem; }
      }

      @media (prefers-reduced-motion: reduce) {
        .cro-hero-img, .cro-btn::before, .cro-gallery-item img, .cro-block-media img, .cro-faq-chevron { animation: none !important; transition: none !important; transform: none !important; }
      }
    `}</style>
  );
}

function Header() {
  return <InvitacionesHeader />;
}

// ─── Problem Section ──────────────────────────────────────────────────────────

const PAIN_POINTS = [
  'Se pierden en el chat: Los invitados olvidan descargar la imagen y esta se pierde entre miles de mensajes.',
  'Preguntas repetitivas: "¿A qué hora empieza?", "¿Dónde es la ubicación?" — respondes lo mismo decenas de veces.',
  'Caos de confirmación: Tienes que registrar de forma manual en papel o Excel a cada persona que te escribe.',
  'Cuentas inciertas: No sabes cuántos invitados reales asistirán, lo que causa desperdicio o falta de platillos.',
];

function ProblemSection() {
  return (
    <section className="cro-section" style={{ background: T.onyx }}>
      <div className="cro-shell">
        <Reveal style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto' }}>
          <p className="cro-eyebrow">El problema de las invitaciones tradicionales</p>
          <h2 className="cro-title-xl">
            ¿Por qué las invitaciones en imagen o PDF ya no funcionan?
          </h2>
          <p className="cro-copy" style={{ marginTop: '1.5rem' }}>
            Enviar una imagen estática por WhatsApp genera fricción y desorganización en tu evento:
          </p>
        </Reveal>
        <Stagger className="cro-problem-grid" gap={0.08}>
          {PAIN_POINTS.map((text, i) => (
            <Item key={i}>
              <div className="cro-problem-card">
                <span className="cro-problem-num">{String(i + 1).padStart(2, '0')}</span>
                <p>{text}</p>
              </div>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

// ─── Discover blocks ──────────────────────────────────────────────────────────

function DiscoverBlock1() {
  return (
    <section id="como-funciona" className="cro-block-split">
      <div className="cro-block-content">
        <Reveal>
          <p className="cro-eyebrow">Todo conectado</p>
          <h2 className="cro-title-xl" style={{ marginBottom: '2rem' }}>El centro digital<br/>de tu evento.</h2>
          <p className="cro-copy">
            No es solo una invitación. Crea tu diseño en minutos, añade la información clave y compártelo por WhatsApp. Todo desde tu celular.
          </p>
        </Reveal>
      </div>
      <div className="cro-block-media">
        <Image src="/images/invitaciones/wedding-details.webp" alt="Precisión RSVP" fill sizes="(max-width: 1024px) 100vw, 50vw" />
      </div>
    </section>
  );
}

function DiscoverBlock2() {
  return (
    <section className="cro-block-split">
      <div className="cro-block-media" style={{ order: -1 }}>
        <Image src="/images/invitaciones/baptism-soft-event.webp" alt="Diseño inmersivo" fill sizes="(max-width: 1024px) 100vw, 50vw" />
      </div>
      <div className="cro-block-content" style={{ background: '#000' }}>
        <Reveal>
          <p className="cro-eyebrow">Menos estrés, más emoción</p>
          <h2 className="cro-title-xl" style={{ marginBottom: '2rem' }}>Todo lo que tus invitados necesitan.</h2>
          <p className="cro-copy">
            Centralizado en un lugar hermoso. Recibe confirmaciones automáticamente, actualiza sin rediseñar y cuenta tu historia para crear la máxima expectativa.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Comparison Section ───────────────────────────────────────────────────────

const COMPARE_ROWS: [string, string][] = [
  ['Imagen borrosa o PDF pesado de abrir',     'Invitación web ultra-rápida y adaptable a móviles'],
  ['Tú registras y sumas cada confirmación',    'RSVP inteligente con panel de asistencia en vivo'],
  ['Ubicaciones que no abren o confunden',      'Mapa interactivo con botones directos a Google Maps y Waze'],
  ['Si hay cambios, debes reenviar la imagen',  'Ediciones instantáneas e itinerarios siempre actualizados'],
  ['Mesa de regalos dispersa o incómoda',       'Sección elegante con enlaces a tiendas o datos bancarios'],
];

function ComparisonSection() {
  return (
    <section className="cro-section" style={{ background: T.black }}>
      <div className="cro-shell">
        <Reveal style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto' }}>
          <p className="cro-eyebrow">El contraste</p>
          <h2 className="cro-title-xl">
            Compara la experiencia tradicional<br />frente a una invitación inteligente.
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="cro-compare-grid">
            <div className="cro-compare-col cro-compare-col-bad">
              <p className="cro-compare-header" style={{ color: T.muted }}>Sin Kompralo</p>
              {COMPARE_ROWS.map(([bad]) => (
                <div className="cro-compare-row" key={bad}>
                  <span style={{ color: '#555', flexShrink: 0, marginTop: '0.1em' }}>✕</span>
                  <span style={{ color: T.muted }}>{bad}</span>
                </div>
              ))}
            </div>
            <div className="cro-compare-col cro-compare-col-good">
              <p className="cro-compare-header" style={{ color: T.cyan }}>Con Kompralo</p>
              {COMPARE_ROWS.map(([, good]) => (
                <div className="cro-compare-row" key={good}>
                  <Check size={15} color={T.cyan} style={{ flexShrink: 0, marginTop: '0.15em' }} />
                  <span style={{ color: T.silver }}>{good}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Process Section (Cómo funciona) ──────────────────────────────────────────

const PROCESS_STEPS = [
  {
    num: '1',
    title: 'Eliges tu invitación',
    text: 'Selecciona el plan ideal para tu evento y realiza tu pago de forma segura.',
  },
  {
    num: '2',
    title: 'Completas la información',
    text: 'Te pedimos nombres, fecha, ubicación, fotos y detalles importantes para preparar tu invitación.',
  },
  {
    num: '3',
    title: 'Recibes y compartes tu enlace',
    text: 'Te entregamos una invitación lista para compartir por WhatsApp. Tus invitados pueden ver los detalles y confirmar asistencia desde su celular.',
  },
];

function ProcessSection() {
  return (
    <section id="como-funciona" className="cro-section" style={{ background: T.onyx }}>
      <div className="cro-shell">
        <Reveal style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto' }}>
          <p className="cro-eyebrow">Paso a paso</p>
          <h2 className="cro-title-xl">
            Cómo funciona en 3 simples pasos
          </h2>
        </Reveal>
        <Stagger className="cro-process-grid" gap={0.12}>
          {PROCESS_STEPS.map(({ num, title, text }) => (
            <Item key={num} style={{ display: 'flex' }}>
              <div className="cro-process-card">
                <span className="cro-process-step">{num}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

// ─── Values Grid (6 features with benefit copy) ───────────────────────────────

const VALUES = [
  {
    icon: Smartphone,
    title: 'Diseño Exclusivo y Premium',
    text: 'Una página web interactiva con tipografía elegante y animaciones fluidas que se adapta a cualquier pantalla.',
  },
  {
    icon: Users,
    title: 'Confirmaciones RSVP en Vivo',
    text: 'Tus invitados confirman su asistencia y de sus acompañantes. Tu lista se actualiza al instante en tu panel.',
  },
  {
    icon: MapPin,
    title: 'Guía GPS Integrada',
    text: 'Ubicaciones interactivas con botones directos para abrir en Waze, Google Maps y Apple Maps con un toque.',
  },
  {
    icon: Gift,
    title: 'Mesa de Regalos Elegante',
    text: 'Vincula tus mesas de regalos (Amazon, Liverpool, etc.) o agrega tus datos bancarios y buzón de efectivo.',
  },
  {
    icon: CalendarClock,
    title: 'Cronograma y Detalles',
    text: 'Informa sobre horarios de misa, recepción y fiesta para que tus invitados disfruten cada momento del evento.',
  },
  {
    icon: Images,
    title: 'Galería y Música',
    text: 'Sube tus mejores fotografías y añade una melodía de fondo para crear expectativa antes del gran día.',
  },
];

function ValuesGrid() {
  return (
    <section className="cro-section" style={{ padding: 0 }}>
      <Stagger className="cro-grid-3">
        {VALUES.map(({ icon: Icon, title, text }) => (
          <Item key={title}>
            <div className="cro-value-card">
              <Icon size={48} strokeWidth={1} className="cro-value-icon" />
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          </Item>
        ))}
      </Stagger>
    </section>
  );
}

// ─── Events Gallery ───────────────────────────────────────────────────────────

const GALLERY = [
  { title: 'Bodas',    cat: 'Ceremonia',   img: '/images/invitaciones/social-proof-event-1.webp' },
  { title: 'XV Años',  cat: 'Gala',        img: '/images/invitaciones/xv-event-editorial.webp'   },
  { title: 'Bautizos', cat: 'Celebración', img: '/images/invitaciones/baptism-soft-event.webp'   },
  { title: 'Eventos',  cat: 'Privado',     img: '/images/invitaciones/birthday-premium.webp'     },
];

function EventsGallery() {
  return (
    <section className="cro-section" style={{ padding: 0 }}>
      <div className="cro-events-gallery">
        {GALLERY.map(({ title, cat, img }) => (
          <div className="cro-gallery-item" key={title}>
            <Image src={img} alt={title} fill sizes="(max-width: 780px) 100vw, 25vw" />
            <div className="cro-gallery-content">
              <h3>{title}</h3>
              <p>{cat}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Guarantee Section ────────────────────────────────────────────────────────

function GuaranteeSection() {
  return (
    <section className="cro-section" style={{ background: T.onyx }}>
      <div className="cro-shell">
        <Reveal className="cro-guarantee">
          <div className="cro-guarantee-badge">
            <ShieldCheck size={18} />
            Garantía de Satisfacción y Entrega Rápida
          </div>
          <h2 className="cro-title-xl" style={{ marginBottom: '1.5rem' }}>
            Tu invitación lista en menos de 48 horas<br />o te devolvemos el 100% de tu dinero.
          </h2>
          <p className="cro-copy" style={{ maxWidth: 640, margin: '0 auto' }}>
            Sabemos que los tiempos de tu boda o evento son sagrados. Nuestro equipo de soporte premium revisa y optimiza cada detalle para asegurar que tu invitación funcione a la perfección desde el primer día.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Editions (Pricing) ───────────────────────────────────────────────────────

const PLAN_NAMES: Record<string, string> = {
  basic:   'Invitación Elegante',
  premium: 'Organización Sin Caos',
  deluxe:  'Experiencia Premium Total',
};

const PLAN_DESCS: Record<string, string> = {
  basic:   'La opción perfecta para eventos sencillos que buscan elegancia, claridad y confirmación básica sin complicaciones.',
  premium: 'La favorita de las parejas y organizadores. Agrega música, galería de fotos e itinerario para una experiencia inolvidable y controlada.',
  deluxe:  'Para quienes buscan el máximo nivel de distinción. Incluye StoryBook animado, intro cinemática y funciones avanzadas.',
};

function formatPrice(product: Product) {
  const amount = product.price / 100;
  return '$' + amount.toLocaleString('es-MX', { maximumFractionDigits: 0 });
}

function Editions() {
  return (
    <section id="planes" className="cro-section" style={{ background: '#000' }}>
      <div className="cro-shell">
        <Reveal style={{ textAlign: 'center', maxWidth: 800, margin: '0 auto' }}>
          <p className="cro-eyebrow">Elige tu plan ideal</p>
          <h2 className="cro-title-xl">Sin sorpresas. Pago único.</h2>
          <p className="cro-copy" style={{ marginTop: '1.5rem' }}>Un pago único para un evento inolvidable. Sin mensualidades.</p>
        </Reveal>

        <Stagger className="cro-editions-wrapper" gap={0.2}>
          {availableProducts.map(product => {
            const isPro = product.id === 'premium';
            const marketingName = PLAN_NAMES[product.id] ?? product.name;
            const desc = PLAN_DESCS[product.id];
            return (
              <Item key={product.id} style={{ display: 'flex' }}>
                <div className={`cro-glass cro-edition ${isPro ? 'cro-edition-pro' : ''}`}>
                  {isPro && <span className="cro-edition-badge">Más popular</span>}
                  <h3>{marketingName}</h3>
                  <p className="cro-edition-desc">{desc}</p>

                  <div className="cro-edition-price">
                    {formatPrice(product)}
                    <small>MXN · pago único</small>
                  </div>

                  <ul className="cro-edition-features">
                    {product.features.map(f => (
                      <li key={f}><Check size={16} color={isPro ? T.cyan : T.muted} /> {f}</li>
                    ))}
                  </ul>

                  <CheckoutButton
                    productId={product.id}
                    label={`Comenzar — ${marketingName}`}
                    className={`cro-checkout ${isPro ? 'cro-checkout-pro' : 'cro-checkout-std'}`}
                    data-event={`click-pricing-${product.id}`}
                  />
                </div>
              </Item>
            );
          })}
        </Stagger>

        <Reveal delay={0.3}>
          <div className="cro-reassurance">
            <p style={{ margin: 0, color: T.muted, fontSize: '0.875rem', letterSpacing: '0.05em' }}>
              Pago único, sin sorpresas · Edita cuántas veces quieras antes de tu evento · Sin instalar apps · Sin contratos
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Technical Specs ──────────────────────────────────────────────────────────

const TECH_SPECS: [string, boolean, boolean, boolean][] = [
  ['RSVP Inteligente',          true,  true,  true ],
  ['Ubicación Satelital',       true,  true,  true ],
  ['Cuenta Regresiva',          true,  true,  true ],
  ['Interfaz Móvil',            true,  true,  true ],
  ['Galería Inmersiva',         false, true,  true ],
  ['Audio de Alta Fidelidad',   false, true,  true ],
  ['Mesa de Regalos',           false, true,  true ],
  ['Línea de Tiempo',           false, true,  true ],
  ['Video Cinemático',          false, false, true ],
  ['Libro de Visitas Digital',  false, false, true ],
];

function TechnicalSpecs() {
  return (
    <section className="cro-section" style={{ background: T.onyx }}>
      <div className="cro-shell">
        <Reveal style={{ textAlign: 'center' }}>
          <p className="cro-eyebrow">Comparativa</p>
          <h2 className="cro-title-xl">Detalles de planes.</h2>
        </Reveal>

        <Reveal className="cro-table-wrapper" delay={0.2}>
          <table className="cro-table">
            <thead>
              <tr>
                <th>Capacidad</th>
                <th>Invitación Elegante</th>
                <th className="col-pro">Organización Sin Caos</th>
                <th>Experiencia Premium Total</th>
              </tr>
            </thead>
            <tbody>
              {TECH_SPECS.map(([label, basic, pro, deluxe]) => (
                <tr key={label}>
                  <td>{label}</td>
                  <td>{basic  ? <span style={{ color: T.ink }}>✓</span>  : <span>—</span>}</td>
                  <td className="col-pro">{pro ? <span>✓</span> : <span style={{ color: T.muted }}>—</span>}</td>
                  <td>{deluxe ? <span style={{ color: T.ink }}>✓</span> : <span>—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: '¿Necesito saber de diseño para crear mi invitación?',
    a: 'No. Nosotros diseñamos tu invitación por ti. Solo necesitas darnos la información de tu evento — nuestro equipo se encarga del resto.',
  },
  {
    q: '¿Cuánto tiempo tarda en estar lista mi invitación?',
    a: 'Tu invitación estará activa y lista para compartir en menos de 48 horas. En la mayoría de los casos, mucho antes.',
  },
  {
    q: '¿Puedo editar la invitación después de publicarla?',
    a: 'Sí. Puedes editar la información cuantas veces quieras antes y durante tu evento — sin costo adicional y sin rediseñar nada.',
  },
  {
    q: '¿Cómo confirman la asistencia mis invitados?',
    a: 'Directamente desde la invitación. Tus invitados hacen clic en "Confirmar asistencia", ingresan su nombre y listo. Tú ves la lista actualizada en tiempo real desde tu panel.',
  },
  {
    q: '¿Cuántos invitados pueden ver la invitación?',
    a: 'Ilimitados. No hay tope en la cantidad de personas que pueden visitar tu invitación. Comparte el enlace con quien quieras.',
  },
  {
    q: '¿Los invitados necesitan descargar una app?',
    a: 'No. La invitación funciona directamente en el navegador del celular o computadora. Sin apps, sin registros, sin complicaciones para tus invitados.',
  },
  {
    q: '¿Cómo recibo mi acceso y comienzo a crear?',
    a: 'Inmediatamente después de tu pago seguro, recibirás un correo con tus credenciales de acceso a tu panel. Desde ahí podrás llenar los datos del evento paso a paso. Si tienes dudas, nuestro equipo de soporte te asistirá de inmediato.',
  },
  {
    q: '¿Los datos de mis invitados están seguros?',
    a: 'Totalmente. La privacidad es nuestra prioridad. Las confirmaciones de asistencia y datos de contacto de tus invitados se almacenan de forma segura y solo tú tienes acceso a ellos desde tu panel privado.',
  },
  {
    q: '¿Qué pasa si quiero más funciones después de comprar?',
    a: 'Puedes escribirnos y hacemos el upgrade por ti. Solo pagas la diferencia entre planes — sin perder nada de lo que ya tienes.',
  },
];

function FAQ() {
  return (
    <section className="cro-section" style={{ background: T.black }}>
      <div className="cro-shell">
        <Reveal style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
          <p className="cro-eyebrow">Preguntas frecuentes</p>
          <h2 className="cro-title-xl">Todo lo que necesitas saber.</h2>
        </Reveal>
        <Reveal delay={0.15}>
          <div style={{ maxWidth: 780, margin: '4rem auto 0' }}>
            {FAQ_ITEMS.map(({ q, a }) => (
              <details key={q} className="cro-faq-item">
                <summary className="cro-faq-q">
                  <span>{q}</span>
                  <span className="cro-faq-chevron">▾</span>
                </summary>
                <div className="cro-faq-a">{a}</div>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────

function CallToAction() {
  return (
    <section className="cro-section-vh" style={{ minHeight: '60svh', borderBottom: 0 }}>
      <div className="cro-hero-bg">
        <Image
          className="cro-hero-img"
          src="/images/invitaciones/xv-event-editorial.webp"
          alt="Kompralo Final"
          fill
          sizes="100vw"
        />
        <div className="cro-hero-overlay" style={{ background: 'radial-gradient(circle at center, rgba(0,0,0,0.4) 0%, #000 100%)' }}></div>
      </div>
      <div className="cro-shell">
        <Reveal className="cro-hero-content">
          <h2 className="cro-title-mega" style={{ fontSize: 'clamp(1.8rem, 5vw, 4.5rem)' }}>
            Comienza hoy a organizar<br />el evento de tus sueños
          </h2>
          <p className="cro-copy" style={{ marginTop: '2rem', maxWidth: 600 }}>
            Únete a las cientos de parejas y organizadores que eliminaron las confirmaciones manuales y el desorden de WhatsApp.
          </p>
          <div className="cro-hero-actions" style={{ justifyContent: 'center', marginTop: '2rem' }}>
            <Link href="#planes" className="cro-btn cro-btn-cyan" data-cta="cta-final" data-event="click-cta-final">Crear mi invitación ahora</Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="cro-footer">
      <div className="cro-shell">
        <Link href="/" className="cro-footer-logo">KOMPRALO</Link>
        <div className="cro-footer-links">
          <Link href="#como-funciona">Cómo funciona</Link>
          <Link href="#planes">Planes</Link>
          <Link href="/login">Acceder</Link>
        </div>
        <p style={{ color: T.muted, fontSize: '0.75rem', letterSpacing: '0.1em' }}>
          © {new Date().getFullYear()} KOMPRALO. TODOS LOS DERECHOS RESERVADOS.
        </p>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InvitacionesPage() {
  return (
    <main className="cro-page">
      <LandingStyles />
      <Header />
      <Hero3D />
      <ProblemSection />
      <DiscoverBlock1 />
      <DiscoverBlock2 />
      <ComparisonSection />
      <ProcessSection />
      <ValuesGrid />
      <EventsGallery />
      <GuaranteeSection />
      <Editions />
      <TechnicalSpecs />
      <FAQ />
      <CallToAction />
      <Footer />
    </main>
  );
}
