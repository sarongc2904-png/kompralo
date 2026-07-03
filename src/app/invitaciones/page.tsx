import type { Metadata } from 'next';
import Image from 'next/image';
import {
  CalendarClock,
  Check,
  Gift,
  Images,
  MapPin,
  Smartphone,
  Users,
  Link2,
  QrCode,
  Music,
  Shirt,
  Hotel,
  Hash,
  Sparkles,
  Heart,
} from 'lucide-react';
import { Item, Reveal, Stagger } from '@/components/public/Motion';
import { SolutionCarousel } from '@/components/public/SolutionCarousel';
import Hero3D from '@/components/public/Hero3D';
import { InvitacionesHeader } from '@/components/public/InvitacionesHeader';
import { InvitacionesFooter } from '@/components/public/InvitacionesFooter';
import { TestimonialsSection } from '@/components/public/TestimonialsSection';
import { FadeIn } from '@/components/public/FadeIn';
import { SiteButton } from '@/components/public/Button';
import { availableProducts } from '@/domain/products';
import { PlanSelector } from '@/components/plans/PlanSelector';

export const metadata: Metadata = {
  title: 'Invitaciones digitales de boda | Kompralo',
  description:
    'Invitaciones digitales de boda listas para personalizar. Pago único, sin mensualidades y fáciles de compartir por WhatsApp.',
};

const T = {
  black:  '#0C0A09', // Warm Charcoal Black
  onyx:   '#1C1917', // Warm Stone Onyx
  ink:    '#F5F5F4', // Ivory Off-White
  cyan:   '#C5A880', // Champagne / Soft Gold
  silver: '#E7E5E4', // Soft warm grey-white
  muted:  '#A8A29E', // Warm Grey
  glass:  'rgba(255,255,255,0.02)',
  border: 'rgba(197, 168, 128, 0.15)', // Fine gold line border
} as const;

function LandingStyles() {
  return (
    <style>{`
      html { scroll-behavior: smooth; background: ${T.black}; color: ${T.ink}; }

      .cro-page { overflow-x: hidden; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: ${T.black}; }
      .cro-shell { width: min(1200px, calc(100% - 40px)); margin-inline: auto; }

      .cro-title-mega { margin: 0; font-size: clamp(2.2rem, 5.5vw, 4.5rem); font-weight: 800; letter-spacing: -0.03em; line-height: 1.05; color: ${T.ink}; }
      .cro-title-xl { margin: 0; font-size: clamp(1.8rem, 4vw, 3rem); font-weight: 700; letter-spacing: -0.02em; line-height: 1.15; color: ${T.ink}; }
      .cro-eyebrow { margin: 0 0 1rem; color: ${T.cyan}; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; }
      .cro-copy { color: ${T.silver}; font-size: clamp(1.05rem, 1.8vw, 1.2rem); line-height: 1.65; font-weight: 300; }

      .cro-btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.75rem; padding: 1rem 2.5rem; font-size: 0.85rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); border-radius: 4px; position: relative; overflow: hidden; }
      .cro-btn::before { content:''; position: absolute; inset:0; background: ${T.ink}; z-index: -1; transform: scaleX(0); transform-origin: right; transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
      .cro-btn:hover::before { transform: scaleX(1); transform-origin: left; }
      .cro-btn-primary { color: ${T.black}; background: ${T.ink}; border: 1px solid ${T.ink}; }
      .cro-btn-primary:hover { color: ${T.ink}; box-shadow: 0 0 20px rgba(255,255,255,0.4); }
      .cro-btn-primary::before { background: ${T.black}; }
      .cro-btn-outline { color: ${T.ink}; background: transparent; border: 1px solid ${T.border}; backdrop-filter: blur(10px); }
      .cro-btn-outline:hover { color: ${T.black}; border-color: ${T.ink}; }
      .cro-btn-cyan { color: ${T.black}; background: ${T.cyan}; border: 1px solid ${T.cyan}; box-shadow: 0 0 30px rgba(197, 168, 128, 0.15); }
      .cro-btn-cyan:hover { color: ${T.cyan}; background: transparent; border: 1px solid ${T.cyan}; box-shadow: 0 0 40px rgba(197, 168, 128, 0.4); }
      .cro-btn-cyan::before { background: ${T.black}; }

      .cro-section-vh { min-height: 100svh; display: flex; flex-direction: column; justify-content: center; position: relative; overflow: hidden; padding: 8rem 0; scroll-margin-top: 80px; }
      .cro-section { padding: clamp(5rem, 10vw, 8rem) 0; position: relative; border-bottom: 1px solid ${T.border}; scroll-margin-top: 80px; }
      .cro-glass { background: ${T.glass}; backdrop-filter: blur(30px); border: 1px solid ${T.border}; border-radius: 4px; }

      .cro-mobile-sticky-cta { display: none; position: fixed; bottom: 0; left: 0; width: 100%; z-index: 999; background: rgba(12,10,9,0.9); backdrop-filter: blur(20px); border-top: 1px solid ${T.border}; padding: 1rem; align-items: center; justify-content: space-between; text-decoration: none; color: ${T.ink}; transition: transform 0.5s; }
      @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

      .cro-nav { position: fixed; top: 0; width: 100%; z-index: 1000; transition: all 0.5s; background: linear-gradient(to bottom, rgba(12,10,9,0.9) 0%, transparent 100%); padding: 1.5rem 0; border-bottom: 1px solid rgba(197,168,128,0.05); backdrop-filter: blur(10px); }
      .cro-nav-inner { display: flex; align-items: center; justify-content: space-between; }
      .cro-logo { color: ${T.ink}; font-size: 1.25rem; font-weight: 800; letter-spacing: 0.25em; text-decoration: none; text-transform: uppercase; }
      .cro-nav-links { display: flex; align-items: center; gap: 3rem; }
      .cro-nav-link { color: ${T.silver}; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; text-decoration: none; transition: color 0.3s; }
      .cro-nav-link:hover { color: ${T.cyan}; }

      /* Mobile menu button & menu */
      .cro-mobile-menu-btn { display: none; background: none; border: none; color: ${T.ink}; cursor: pointer; padding: 0.5rem; z-index: 1001; }
      .cro-mobile-menu { display: none; position: fixed; top: 70px; left: 0; right: 0; background: rgba(12,10,9,0.95); backdrop-filter: blur(20px); border-bottom: 1px solid ${T.border}; flex-direction: column; z-index: 1000; padding: 1rem 0; }
      .cro-mobile-menu-link { display: block; padding: 1rem 20px; color: ${T.silver}; font-size: 0.9rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; border-bottom: 1px solid rgba(255,255,255,0.05); transition: color 0.3s; }
      .cro-mobile-menu-link:hover { color: ${T.cyan}; background: rgba(255,255,255,0.02); }

      .cro-hero-bg { position: absolute; inset: 0; z-index: -2; background: ${T.black}; }
      .cro-hero-img { object-fit: cover; opacity: 0.35; transform: scale(1.02); animation: tagHeuerZoom 30s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
      @keyframes tagHeuerZoom { from { transform: scale(1); } to { transform: scale(1.15); } }
      .cro-hero-overlay { position: absolute; inset: 0; z-index: -1; background: radial-gradient(circle at center, transparent 0%, ${T.black} 100%); }
      .cro-hero-content { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: flex-start; text-align: left; max-width: 100%; }
      .cro-hero-actions { display: flex; gap: 1.5rem; margin-top: 2.5rem; width: 100%; }

      .cro-block-split { display: grid; grid-template-columns: 1fr 1fr; min-height: 80svh; border-bottom: 1px solid ${T.border}; }
      .cro-block-media { position: relative; overflow: hidden; background: #000; }
      .cro-block-media img { object-fit: cover; opacity: 0.6; transition: transform 1.5s cubic-bezier(0.16, 1, 0.3, 1); }
      .cro-block-split:hover .cro-block-media img { transform: scale(1.05); }
      .cro-block-content { padding: clamp(3rem, 8vw, 6rem); display: flex; flex-direction: column; justify-content: center; background: ${T.onyx}; }

      .cro-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: ${T.border}; border: 1px solid ${T.border}; }
      .cro-value-card { background: ${T.black}; padding: 4rem 2rem; text-align: center; display: flex; flex-direction: column; align-items: center; transition: background 0.4s; }
      .cro-value-card:hover { background: rgba(197, 168, 128, 0.02); }
      .cro-value-icon { margin-bottom: 2rem; color: ${T.cyan}; transition: transform 0.4s, color 0.4s; }
      .cro-value-card:hover .cro-value-icon { transform: translateY(-5px) scale(1.1); color: ${T.ink}; }
      .cro-value-card h3 { margin: 0 0 1rem; font-size: 1.25rem; font-weight: 500; letter-spacing: 0.05em; color: ${T.ink}; }
      .cro-value-card p { margin: 0; color: ${T.muted}; font-size: 0.95rem; line-height: 1.6; font-weight: 300; }

      .cro-events-gallery { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: ${T.border}; border-top: 1px solid ${T.border}; border-bottom: 1px solid ${T.border}; }
      .cro-gallery-item { position: relative; aspect-ratio: 9/16; overflow: hidden; background: #000; display: flex; align-items: flex-end; padding: 2rem; }
      .cro-gallery-item img { object-fit: cover; opacity: 0.4; transition: all 1s cubic-bezier(0.16,1,0.3,1); }
      .cro-gallery-item:hover img { opacity: 0.7; transform: scale(1.08); }
      .cro-gallery-content { position: relative; z-index: 2; transform: translateY(20px); opacity: 0; transition: all 0.5s cubic-bezier(0.16,1,0.3,1); }
      .cro-gallery-item:hover .cro-gallery-content { transform: translateY(0); opacity: 1; }
      .cro-gallery-content h3 { margin: 0; font-size: 1.5rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: ${T.ink}; }
      .cro-gallery-content p { margin: 0.5rem 0 0; color: ${T.cyan}; font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase; }

      .cro-checkout { width: 100%; min-height: 60px; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; cursor: pointer; transition: all 0.4s; border-radius: 4px; border: 1px solid ${T.border}; }
      .cro-checkout-std { background: transparent; border: 1px solid ${T.border}; color: ${T.ink}; }
      .cro-checkout-std:hover { background: ${T.ink}; color: ${T.black}; border-color: ${T.ink}; }
      .cro-checkout-pro { background: ${T.cyan}; border: 1px solid ${T.cyan}; color: ${T.black}; }
      .cro-checkout-pro:hover { background: transparent; color: ${T.cyan}; box-shadow: 0 0 30px rgba(197, 168, 128, 0.3); }

      .cro-table-wrapper { overflow-x: auto; margin-top: 4rem; }
      .cro-table { width: 100%; min-width: 800px; border-collapse: collapse; }
      .cro-table th, .cro-table td { padding: 1.5rem; border-bottom: 1px solid ${T.border}; text-align: center; }
      .cro-table th:first-child, .cro-table td:first-child { text-align: left; }
      .cro-table th { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: ${T.muted}; }
      .cro-table th.col-pro { color: ${T.cyan}; }
      .cro-table td { font-size: 0.95rem; color: ${T.silver}; }
      .cro-table td:first-child { font-weight: 300; }

      .cro-footer { padding: 5rem 0; border-top: 1px solid ${T.border}; background: #080706; text-align: center; }
      .cro-footer-logo { font-size: 1.5rem; font-weight: 800; letter-spacing: 0.3em; margin-bottom: 2rem; display: block; text-decoration: none; color: ${T.ink}; }
      .cro-footer-links { display: flex; justify-content: center; gap: 3rem; margin-bottom: 3rem; }
      .cro-footer-links a { color: ${T.muted}; text-decoration: none; font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase; transition: color 0.3s; }
      .cro-footer-links a:hover { color: ${T.cyan}; }

      /* ── Problem Section (WhatsApp bubble simulation) ────────────────────── */
      .cro-chat-container { display: flex; flex-direction: column; gap: 1rem; max-width: 500px; margin: 3rem auto 0; }
      .cro-chat-bubble { position: relative; padding: 0.85rem 1.15rem; border-radius: 16px; border-top-left-radius: 4px; background: #272522; border: 1px solid rgba(197, 168, 128, 0.1); color: ${T.silver}; font-size: 0.95rem; align-self: flex-start; max-width: 85%; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
      .cro-chat-bubble::before { content: ''; position: absolute; left: -8px; top: 0; width: 8px; height: 12px; background: #272522; clip-path: polygon(100% 0, 0 0, 100% 100%); }
      .cro-chat-sender { font-size: 0.75rem; color: ${T.cyan}; font-weight: 600; margin-bottom: 0.25rem; display: block; }
      .cro-problem-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin-top: 4rem; }
      .cro-problem-card { padding: 2.5rem 2rem; border: 1px solid ${T.border}; border-radius: 4px; background: rgba(255,255,255,0.01); }
      .cro-problem-num { display: block; font-size: 3rem; font-weight: 800; color: rgba(197, 168, 128, 0.08); margin-bottom: 1rem; letter-spacing: -0.04em; line-height: 1; }
      .cro-problem-card p { margin: 0; color: ${T.muted}; font-size: 1rem; line-height: 1.65; }

      /* ── Solution Section Cards ────────────────────────────────────────── */
      .cro-sol-grid {
        display: flex;
        gap: 1rem;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        -webkit-overflow-scrolling: touch;
        padding-bottom: 0.5rem;
        margin-top: 0;
        cursor: grab;
        user-select: none;
      }
      .cro-sol-grid:active { cursor: grabbing; }
      .cro-sol-grid::-webkit-scrollbar { display: none; }
      .cro-sol-grid { -ms-overflow-style: none; scrollbar-width: none; }
      .cro-sol-card {
        flex: none;
        width: 200px;
        scroll-snap-align: start;
        background: ${T.onyx}; padding: 1.75rem 1.5rem; border-radius: 4px; border: 1px solid ${T.border};
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .cro-sol-card:hover { border-color: ${T.cyan}; transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,0.4); }
      .cro-sol-icon { color: ${T.cyan}; margin-bottom: 1rem; display: inline-block; }
      .cro-sol-card h3 { margin: 0 0 0.5rem; font-size: 1rem; font-weight: 600; color: ${T.ink}; line-height: 1.3; }
      .cro-sol-card p { margin: 0; font-size: 0.825rem; color: ${T.muted}; line-height: 1.5; }

      /* ── Comparison Section ───────────────────────────────── */

      /* ── Guarantee Section ────────────────────────────────── */

      /* ── FAQ ──────────────────────────────────────────────── */
      .cro-faq-item { border-bottom: 1px solid ${T.border}; }
      .cro-faq-q { display: flex; align-items: center; justify-content: space-between; padding: 1.75rem 0; cursor: pointer; list-style: none; font-size: 1.05rem; font-weight: 500; color: ${T.ink}; gap: 1rem; }
      .cro-faq-q::-webkit-details-marker { display: none; }
      .cro-faq-chevron { color: ${T.cyan}; transition: transform 0.3s ease; flex-shrink: 0; font-size: 1.1rem; line-height: 1; }
      details[open] .cro-faq-chevron { transform: rotate(180deg); }
      .cro-faq-a { padding: 0 2rem 1.75rem 0; color: ${T.muted}; line-height: 1.7; font-size: 0.95rem; }

      /* ── Editions reassurance & trust block ───────────────── */
      .cro-reassurance { text-align: center; margin-top: 2.5rem; padding: 1.5rem 2rem; border: 1px solid ${T.border}; border-radius: 4px; background: rgba(255,255,255,0.01); }
      .cro-trust-container { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-top: 3.5rem; }
      .cro-trust-card { background: ${T.onyx}; padding: 2rem 1.5rem; border-radius: 4px; border: 1px solid ${T.border}; text-align: center; }
      .cro-trust-card-icon { color: ${T.cyan}; margin-bottom: 0.85rem; display: inline-block; }
      .cro-trust-card h4 { margin: 0 0 0.5rem; font-size: 1.05rem; font-weight: 600; color: ${T.ink}; }
      .cro-trust-card p { margin: 0; font-size: 0.85rem; color: ${T.muted}; line-height: 1.45; }

      /* ── Process Section ──────────────────────────────────── */
      .cro-process-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; margin-top: 4rem; }
      .cro-process-card { padding: 3.5rem 2.5rem; border: 1px solid ${T.border}; border-radius: 4px; background: rgba(255,255,255,0.01); display: flex; flex-direction: column; height: 100%; transition: background 0.4s; }
      .cro-process-card:hover { background: rgba(197, 168, 128, 0.02); }
      .cro-process-step { display: inline-flex; align-items: center; justify-content: center; width: 3rem; height: 3rem; border-radius: 50%; border: 1px solid ${T.cyan}; color: ${T.cyan}; font-size: 1.15rem; font-weight: 700; margin-bottom: 1.5rem; }
      .cro-process-card h3 { margin: 0 0 1rem; font-size: 1.25rem; font-weight: 600; letter-spacing: 0.05em; color: ${T.ink}; }
      .cro-process-card p { margin: 0; color: ${T.muted}; font-size: 0.95rem; line-height: 1.6; font-weight: 300; }

      /* ── Timeline Section ─────────────────────────────────── */
      .cro-timeline { position: relative; border-left: 1px solid rgba(197, 168, 128, 0.25); margin: 4rem auto 0; padding-left: 2.5rem; max-width: 680px; }
      .cro-timeline-item { position: relative; margin-bottom: 2.5rem; }
      .cro-timeline-item:last-child { margin-bottom: 0; }
      .cro-timeline-dot { position: absolute; left: calc(-2.5rem - 6px); top: 0.25rem; width: 13px; height: 13px; border-radius: 50%; background: ${T.cyan}; border: 3px solid ${T.black}; }
      .cro-timeline-num { font-size: 0.75rem; font-weight: 700; color: ${T.cyan}; margin-bottom: 0.25rem; text-transform: uppercase; letter-spacing: 0.15em; display: block; }
      .cro-timeline-title { font-size: 1.2rem; font-weight: 600; margin: 0 0 0.5rem; color: ${T.ink}; }
      .cro-timeline-text { font-size: 0.95rem; color: ${T.muted}; margin: 0; line-height: 1.55; }

      /* ── CSS Phone Mockup ────────────────────────────────── */
      .cro-phone-container { width: 100%; display: flex; justify-content: center; align-items: center; position: relative; }

      @media (max-width: 1024px) {
        .cro-block-split { grid-template-columns: 1fr; min-height: auto; }
        .cro-block-media { height: 50vh; }
.cro-events-gallery { grid-template-columns: repeat(2, 1fr); }
        .cro-problem-grid { grid-template-columns: 1fr; max-width: 600px; margin-inline: auto; }
        .cro-process-grid { grid-template-columns: 1fr; max-width: 500px; margin-inline: auto; }
        .cro-trust-container { grid-template-columns: 1fr; max-width: 500px; margin-inline: auto; }
      }
      @media (max-width: 780px) {
        .cro-mobile-sticky-cta { display: flex; animation: slideUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards; }
        .cro-nav-links { display: none; }
        .cro-mobile-menu-btn { display: flex; }
        .cro-mobile-menu { display: flex; }
        .cro-grid-3 { grid-template-columns: 1fr; }
        .cro-hero-actions { flex-direction: column; width: 100%; max-width: 320px; align-items: center; }
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

function ProblemSection() {
  return (
    <section className="cro-section" style={{ background: T.onyx }}>
      <div className="cro-shell">
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16 items-center">
          
          {/* Left Side: Simulated WhatsApp chat log */}
          <Reveal>
            <div className="max-w-[450px] mx-auto bg-[#0C0A09] rounded-2xl border border-[rgba(197,168,128,0.15)] overflow-hidden shadow-2xl">
              {/* WhatsApp chat header */}
              <div className="bg-[#1C1917] px-4 py-3.5 border-b border-[rgba(197,168,128,0.1)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-bold tracking-wider text-[#F5F5F4] uppercase">Chat con Invitados</span>
                </div>
                <span className="text-[10px] text-[#A8A29E] font-medium uppercase tracking-wider">Hoy</span>
              </div>
              
              {/* Chat bubbles container */}
              <div className="p-5 flex flex-col gap-4 max-h-[380px] overflow-y-auto">
                <div className="cro-chat-bubble">
                  <span className="cro-chat-sender">Tía Rosy</span>
                  ¿Dónde es la boda?
                </div>
                
                <div className="cro-chat-bubble">
                  <span className="cro-chat-sender">Carlos (Amigo)</span>
                  ¿A qué hora empieza?
                </div>

                <div className="cro-chat-bubble">
                  <span className="cro-chat-sender">Prima Gaby</span>
                  ¿Cómo confirmo?
                </div>

                <div className="cro-chat-bubble">
                  <span className="cro-chat-sender">Tío Juan</span>
                  ¿Cuál es el código de vestimenta?
                </div>
                <div className="cro-chat-bubble">
                  <span className="cro-chat-sender">Sofía (Dama de Honor)</span>
                  ¿Dónde está la mesa de regalos?
                </div>
              </div>
            </div>
          </Reveal>

          {/* Right Side: Copywriting details */}
          <Reveal>
            <span className="cro-eyebrow">La realidad de organizar tu boda</span>
            <h2 className="cro-title-xl">
              Deja de responder "¿dónde es?" 50 veces
            </h2>
            <p className="cro-copy mt-6">
              Una imagen por WhatsApp genera las mismas preguntas una y otra vez: ¿cómo llego?, ¿puedo llevar niños?, ¿cuál es el código de vestimenta?, ¿dónde está la mesa de regalos? Tu invitación KOMPRALO responde todo por ti. Tú solo ves llegar las confirmaciones.
            </p>
          </Reveal>

        </div>
      </div>
    </section>
  );
}

function SolutionSection() {
  return (
    <section className="bg-site-crema py-16 md:py-24">
      <div className="mx-auto w-[min(1200px,calc(100%-40px))]">
        <FadeIn className="mx-auto max-w-3xl text-center">
          <p className="site-eyebrow">Todo en un solo lugar</p>
          <h2 className="site-h2">Todo lo importante de tu boda en una sola invitación digital</h2>
          <p className="mt-6 font-site-sans text-lg leading-8 text-site-marron/72">
            Incluye secciones para compartir la información que tus invitados necesitan. La disponibilidad de algunas secciones depende del plan que elijas.
          </p>
        </FadeIn>
        <div className="mt-14">
          <SolutionCarousel />
        </div>
      </div>
    </section>
  );
}

// ─── Comparison Section ───────────────────────────────────────────────────────

// ─── Process Section (Cómo funciona) ──────────────────────────────────────────

const PROCESS_STEPS = [
  {
    num: '1',
    title: 'Elige tu plan',
    text: 'Selecciona Basic, Premium o Deluxe según lo que necesites para tu boda.',
  },
  {
    num: '2',
    title: 'Personaliza tu invitación',
    text: 'Agrega los nombres, fecha, horarios, ubicación, fotos y demás detalles importantes.',
  },
  {
    num: '3',
    title: 'Compártela con tus invitados',
    text: 'Envía tu invitación por WhatsApp para que tus invitados puedan verla y confirmar asistencia.',
  },
];

function ProcessSection() {
  return (
    <section id="como-funciona" className="cro-section" style={{ background: T.black }}>
      <div className="cro-shell">
        <FadeIn className="mx-auto max-w-3xl text-center">
          <p className="cro-eyebrow">¿Cómo funciona?</p>
          <h2 className="cro-title-xl">¿Cómo funciona?</h2>
        </FadeIn>
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
        <Reveal className="text-center mt-12" delay={0.3}>
          <p className="text-sm text-[#A8A29E] tracking-wide m-0">
            Puedes hacerlo desde tu celular o computadora.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

const TIMELINE_STEPS = [
  {
    title: 'Todo en un solo link',
    text: 'Toda la información importante vive en una invitación digital que puedes compartir con un solo enlace.',
  },
  {
    title: 'Confirmaciones sin perseguir a nadie',
    text: 'Tus invitados confirman desde la invitación y tú ves las respuestas sin perseguir a nadie por chat.',
  },
  {
    title: 'Mapa directo a tu evento',
    text: 'Incluye ubicación y acceso directo a mapas para que nadie tenga que preguntarte cómo llegar.',
  },
  {
    title: 'Mesa de regalos integrada',
    text: 'Comparte tu mesa de regalos o lluvia de sobres de forma clara dentro de la invitación.',
  },
  {
    title: 'Se ve perfecta en cualquier celular',
    text: 'Se abre desde WhatsApp en cualquier celular, sin descargar apps.',
  },
  {
    title: 'Lista en minutos, no en semanas',
    text: 'El asistente te guía para dejarla lista rápido y editar después lo que necesites.',
  },
  {
    title: 'Pago único, tuya para siempre',
    text: 'Pagas una sola vez y conservas tu invitación activa sin mensualidades.',
  },
];

function WhatHappensSection() {
  return (
    <section className="bg-site-blanco py-16 md:py-24">
      <div className="mx-auto w-[min(1200px,calc(100%-40px))]">
        <FadeIn className="mx-auto max-w-3xl text-center">
          <p className="cro-eyebrow">Diferenciador</p>
          <h2 className="cro-title-xl">Una invitación digital bonita, práctica y sin pagos mensuales</h2>
          <p className="cro-copy" style={{ marginTop: '1.5rem' }}>
            KOMPRALO está pensado para parejas que quieren una invitación elegante sin complicarse. Puedes elegir tu plan, personalizar tu invitación y compartirla por WhatsApp con tus invitados.
          </p>
        </FadeIn>
        
        <div className="cro-timeline">
          {TIMELINE_STEPS.map(({ title, text }) => (
            <Reveal key={title} className="cro-timeline-item">
              <span className="cro-timeline-dot" />
              <h3 className="cro-timeline-title">{title}</h3>
              <p className="cro-timeline-text">{text}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="text-center mt-12" delay={0.2}>
          <p className="text-base md:text-lg font-medium text-[#C5A880] m-0">
            Pago único. Sin mensualidades.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Trust / Reassurance Section ──────────────────────────────────────────────

const TRUST_POINTS = [
  { icon: Sparkles, title: 'Invitación elegante', text: 'Pensada para parejas que quieren una presentación bonita para su boda.' },
  { icon: Smartphone, title: 'Fácil de personalizar', text: 'Agrega tus datos desde celular o computadora sin conocimientos técnicos.' },
  { icon: CalendarClock, title: 'Vista previa en tiempo real', text: 'Revisa cómo se ve tu invitación mientras la personalizas.' },
  { icon: Users, title: 'Confirmación de asistencia', text: 'Tus invitados pueden confirmar su asistencia desde la invitación.' },
  { icon: Gift, title: 'Mesa de regalos', text: 'Organiza la información de regalos en una sección clara.' },
  { icon: MapPin, title: 'Ubicación del evento', text: 'Comparte los datos importantes del lugar de tu boda.' },
];

function TrustSection() {
  return (
    <section className="bg-site-blanco py-16 md:py-24">
      <div className="mx-auto w-[min(1200px,calc(100%-40px))]">
        <FadeIn className="mx-auto max-w-3xl text-center">
          <p className="site-eyebrow">Beneficios</p>
          <h2 className="site-h2">Diseñada para organizar mejor la información de tu boda</h2>
          <p className="mt-6 font-site-sans text-lg leading-8 text-site-marron/72">
            Comparte los detalles importantes en una invitación digital fácil de ver, personalizar y enviar por WhatsApp.
          </p>
        </FadeIn>
        
        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {TRUST_POINTS.map(({ icon: Icon, title, text }, i) => (
            <FadeIn
              key={i}
              className="rounded-2xl border border-site-border-subtle bg-site-crema/55 p-7 shadow-sm"
              style={{ transitionDelay: `${i * 70}ms` }}
            >
              <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-site-blanco text-site-rosa-antiguo shadow-sm">
                <Icon size={24} strokeWidth={1.5} />
              </span>
              <h3 className="m-0 font-site-serif text-2xl font-semibold leading-tight text-site-marron">{title}</h3>
              <p className="mt-4 font-site-sans text-sm leading-6 text-site-marron/70">{text}</p>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Events Gallery ───────────────────────────────────────────────────────────

const GALLERY = [
  { title: 'Románticas',  cat: 'Estilo Clásico',  img: '/images/invitaciones/social-proof-event-1.webp' },
  { title: 'Elegantes',   cat: 'Estilo Premium',  img: '/images/invitaciones/xv-event-editorial.webp'   },
  { title: 'Modernas',    cat: 'Estilo Vanguardia', img: '/images/invitaciones/baptism-soft-event.webp'   },
  { title: 'Minimalistas', cat: 'Estilo Limpio',    img: '/images/invitaciones/birthday-premium.webp'     },
];

function EventsGallery() {
  return (
    <section className="cro-section" style={{ paddingBottom: 0 }}>
      <div className="cro-shell mb-12">
        <Reveal style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto' }}>
          <p className="cro-eyebrow">Galería de diseños</p>
          <h2 className="cro-title-xl">Diseños creados para bodas inolvidables</h2>
          <p className="cro-copy" style={{ marginTop: '1.5rem' }}>
            Desde estilos románticos y clásicos hasta invitaciones modernas, minimalistas y elegantes.
          </p>
        </Reveal>
      </div>
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

// ─── Editions (Pricing) ───────────────────────────────────────────────────────

function Editions() {
  return (
    <section id="planes" className="cro-section" style={{ background: T.black }}>
      <PlanSelector products={availableProducts} featuredId="premium" />
    </section>
  );
}

// ─── Technical Specs ──────────────────────────────────────────────────────────

const TECH_SPECS: [string, boolean, boolean, boolean][] = [
  ['Confirmación de asistencia',       false, false, true ],
  ['Ubicación con mapas GPS',          false, false, true ],
  ['Cuenta regresiva',                 false, false, true ],
  ['Galería de fotos de su historia',  false, false, true ],
  ['Mesa de regalos organizada',       false, false, true ],
  ['Itinerario y horarios',            false, false, true ],
  ['Código de vestimenta sugerido',    false, false, true ],
  ['Fácil de compartir por WhatsApp',  true,  false, true ],
  ['Pago único sin mensualidades',     true,  true,  true ],
];

function TechnicalSpecs() {
  return (
    <section className="cro-section" style={{ background: T.onyx }}>
      <div className="cro-shell">
        <Reveal style={{ textAlign: 'center' }}>
          <p className="cro-eyebrow">Comparativa</p>
          <h2 className="cro-title-xl">¿Por qué elegir KOMPRALO?</h2>
        </Reveal>

        <Reveal className="cro-table-wrapper" delay={0.2}>
          <table className="cro-table">
            <thead>
              <tr>
                <th>Comparación</th>
                <th>Imagen</th>
                <th>Impresa</th>
                <th className="col-pro">KOMPRALO</th>
              </tr>
            </thead>
            <tbody>
              {TECH_SPECS.map(([label, basic, pro, deluxe]) => (
                <tr key={label}>
                  <td>{label}</td>
                  <td>{basic  ? <span style={{ color: T.ink }}>✓</span>  : <span style={{ color: T.muted }}>—</span>}</td>
                  <td>{pro ? <span style={{ color: T.ink }}>✓</span> : <span style={{ color: T.muted }}>—</span>}</td>
                  <td className="col-pro">{deluxe ? <span>✓</span> : <span style={{ color: T.muted }}>—</span>}</td>
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
    q: '¿Qué pasa después de pagar?',
    a: 'Recibes acceso inmediato a tu invitación y un correo con tu link de acceso. Entras al editor, personalizas tus datos con el asistente de 3 pasos y publicas cuando estés lista.',
  },
  {
    q: '¿Puedo hacer cambios después de publicar?',
    a: 'Sí, cambios ilimitados sin costo extra. Cambió el horario, el salón o quieres otra foto: editas y tu link se actualiza al instante para todos tus invitados.',
  },
  {
    q: '¿Cuánto tardo en tenerla lista?',
    a: 'El asistente te guía en 3 pasos y la mayoría de las parejas la tiene lista el mismo día. Puedes publicarla de inmediato o guardarla como borrador.',
  },
  {
    q: '¿Mis invitados necesitan descargar algo?',
    a: 'No. Reciben un link por WhatsApp y la invitación se abre en su navegador, en cualquier celular, tablet o computadora.',
  },
  {
    q: '¿Cómo confirman asistencia mis invitados?',
    a: 'Directo desde la invitación, con un par de toques. Tú ves las confirmaciones en tu panel, sin Excel y sin perseguir a nadie por chat.',
  },
  {
    q: '¿Qué formas de pago aceptan?',
    a: 'Tarjeta de crédito o débito a través de Stripe, con pago 100% seguro. Es un pago único: sin suscripciones ni mensualidades.',
  },
  {
    q: '¿Por cuánto tiempo está activa mi invitación?',
    a: 'Tu invitación queda activa desde que la publicas y hasta 12 meses después de tu boda, sin costo adicional — tiempo de sobra para que tus invitados la revivan y compartan recuerdos.',
  },
  {
    q: '¿Y si necesito ayuda?',
    a: 'Escríbenos por WhatsApp y te acompañamos en el proceso. Estamos para que tu invitación quede perfecta.',
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
    <section className="bg-site-marron py-16 md:py-24">
      <div className="mx-auto w-[min(1200px,calc(100%-40px))]">
        <FadeIn className="mx-auto max-w-3xl text-center">
          <p className="site-eyebrow !text-[#E8B8BE]">Siguiente paso</p>
          <h2 className="font-site-serif text-[clamp(2.2rem,5vw,4.5rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-site-crema">
            ¿Listos para elegir el plan ideal para su boda?
          </h2>
          <p className="mx-auto mt-6 max-w-2xl font-site-sans text-lg leading-8 text-site-crema/78">
            Crea una invitación digital elegante, fácil de personalizar y pensada para compartirse por WhatsApp.
          </p>
          <div className="mt-10 flex justify-center">
            <SiteButton
              href="#planes"
              data-cta="cta-final"
              data-event="click-cta-final"
            >
              Ver planes
            </SiteButton>
          </div>
          <p className="mt-5 font-site-sans text-xs font-semibold uppercase tracking-[0.15em] text-site-crema/55">
            Pago único · Sin mensualidades · Desde $499 MXN
          </p>
        </FadeIn>
      </div>
    </section>
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
      <SolutionSection />
      <ProcessSection />
      <EventsGallery />
      <TestimonialsSection />
      <WhatHappensSection />
      <Editions />
      <TrustSection />
      <TechnicalSpecs />
      <FAQ />
      <CallToAction />
      <InvitacionesFooter />
    </main>
  );
}
