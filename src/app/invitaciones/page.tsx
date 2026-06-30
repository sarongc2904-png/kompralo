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
  Link2,
  QrCode,
  Music,
  Shirt,
  Hotel,
  Hash,
  Sparkles,
} from 'lucide-react';
import { Item, Reveal, Stagger } from '@/components/public/Motion';
import Hero3D from '@/components/public/Hero3D';
import { InvitacionesHeader } from '@/components/public/InvitacionesHeader';
import { availableProducts } from '@/domain/products';
import { PlanSelector } from '@/components/plans/PlanSelector';

export const metadata: Metadata = {
  title: 'Invitaciones Digitales de Boda Premium | Kompralo',
  description:
    'La invitación digital de boda que hará que sus invitados se enamoren de su boda desde el primer clic. Diseños elegantes, personalizados y fáciles de compartir por WhatsApp.',
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
      .cro-sol-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.5rem; margin-top: 3.5rem; }
      .cro-sol-card { background: ${T.onyx}; padding: 2.2rem 1.8rem; border-radius: 4px; border: 1px solid ${T.border}; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      .cro-sol-card:hover { border-color: ${T.cyan}; transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,0.4); }
      .cro-sol-icon { color: ${T.cyan}; margin-bottom: 1.25rem; display: inline-block; }
      .cro-sol-card h3 { margin: 0 0 0.5rem; font-size: 1.15rem; font-weight: 600; color: ${T.ink}; }
      .cro-sol-card p { margin: 0; font-size: 0.9rem; color: ${T.muted}; line-height: 1.55; }

      /* ── Comparison Section ───────────────────────────────── */
      .cro-compare-grid { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid ${T.border}; border-radius: 4px; overflow: hidden; margin-top: 3rem; }
      .cro-compare-col { padding: 3rem 2.5rem; }
      .cro-compare-col-bad { border-right: 1px solid ${T.border}; background: rgba(255,255,255,0.01); }
      .cro-compare-col-good { background: rgba(197, 168, 128, 0.05); }
      .cro-compare-header { font-size: 0.8rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 2rem; padding-bottom: 1rem; border-bottom: 1px solid ${T.border}; }
      .cro-compare-row { display: flex; align-items: flex-start; gap: 0.75rem; padding: 1rem 0; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 0.95rem; line-height: 1.5; }
      .cro-compare-row:last-child { border-bottom: 0; }

      /* ── Guarantee Section ────────────────────────────────── */
      .cro-guarantee { text-align: center; max-width: 720px; margin: 0 auto; padding: 2rem; }
      .cro-guarantee-badge { display: inline-flex; align-items: center; gap: 0.625rem; background: rgba(197, 168, 128, 0.08); border: 1px solid rgba(197, 168, 128, 0.25); border-radius: 4px; padding: 0.625rem 1.25rem; margin-bottom: 2rem; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: ${T.cyan}; }

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
        .cro-compare-grid { grid-template-columns: 1fr; max-width: 600px; margin-inline: auto; }
        .cro-compare-col-bad { border-right: 0; border-bottom: 1px solid ${T.border}; }
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
                  Oye, ¿dónde es la recepción? Es que se me perdió la imagen entre tantos chats 🥺
                </div>
                
                <div className="cro-chat-bubble">
                  <span className="cro-chat-sender">Carlos (Amigo)</span>
                  Hola, ¿a qué hora empieza la misa? ¿Me pasas el horario porfa?
                </div>

                <div className="cro-chat-bubble">
                  <span className="cro-chat-sender">Prima Gaby</span>
                  Prima bella, ¿puedo llevar acompañante? ¿El pase es familiar? 💖
                </div>

                <div className="cro-chat-bubble">
                  <span className="cro-chat-sender">Tío Juan</span>
                  ¿Me mandas otra vez la ubicación de Google Maps? Ya voy en camino pero no la encuentro.
                </div>
                <div className="cro-chat-bubble">
                  <span className="cro-chat-sender">Sofía (Dama de Honor)</span>
                  Amiga, ¿cómo confirmo mi asistencia? ¿Te aviso a ti o a quién?
                </div>
              </div>
            </div>
          </Reveal>

          {/* Right Side: Copywriting details */}
          <Reveal>
            <span className="cro-eyebrow">La realidad de organizar tu boda</span>
            <h2 className="cro-title-xl">
              Mandar una imagen por WhatsApp parece fácil… hasta que empiezan las preguntas
            </h2>
            <p className="cro-copy mt-6">
              Enviar una imagen o un PDF estático genera dudas constantes. Tus invitados te preguntan las mismas cosas decenas de veces y terminas persiguiéndolos uno por uno para saber si van a asistir.
            </p>
            <div className="mt-8 p-6 rounded-lg border border-[rgba(197,168,128,0.2)] bg-[rgba(197,168,128,0.03)]">
              <p className="text-[#F5F5F4] text-base md:text-lg font-medium leading-relaxed m-0">
                <strong>Kompralo</strong> convierte tu invitación en un link vivo con toda la información de tu boda y confirmaciones en tiempo real.
              </p>
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
}

const SOLUTIONS = [
  { icon: Link2, title: 'WhatsApp instantáneo', text: 'Compartan su invitación al instante por WhatsApp.' },
  { icon: MapPin, title: 'Información completa', text: 'Incluyan ubicación, horario, mesa de regalos y código de vestimenta.' },
  { icon: Users, title: 'Confirmación sencilla', text: 'Reciban confirmaciones de asistencia de forma sencilla.' },
  { icon: ShieldCheck, title: 'Sin impresiones', text: 'Eviten gastos de impresión y entregas complicadas.' },
  { icon: Sparkles, title: 'Experiencia premium', text: 'Sorprendan a sus invitados con una experiencia elegante y moderna.' },
];

function SolutionSection() {
  return (
    <section className="cro-section" style={{ background: T.black }}>
      <div className="cro-shell">
        <Reveal style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto' }}>
          <p className="cro-eyebrow">Todo en un solo lugar</p>
          <h2 className="cro-title-xl">Todo lo que necesitan para anunciar su boda con estilo</h2>
          <p className="cro-copy" style={{ marginTop: '1.5rem' }}>
            Olvídense de las invitaciones impresas tradicionales y las entregas complicadas. Una solución digital moderna y sofisticada para su gran día.
          </p>
        </Reveal>
        <Stagger className="cro-sol-grid" gap={0.04}>
          {SOLUTIONS.map(({ icon: Icon, title, text }) => (
            <Item key={title}>
              <div className="cro-sol-card">
                <Icon size={28} className="cro-sol-icon" strokeWidth={1.5} />
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

// ─── Comparison Section ───────────────────────────────────────────────────────

const COMPARE_BAD = [
  'Se pierde o daña fácilmente: Los invitados olvidan o pierden la tarjeta física o el mensaje de texto.',
  'Altos costos y entregas lentas: Gastos en imprenta y horas perdidas entregándolas a domicilio.',
  'Confirmaciones manuales lentas: Tienes que llamar o mensajear a cada invitado uno por uno.',
  'Sin mapas dinámicos: Dificultad para llegar al templo o salón sin links directos de GPS.',
  'Datos inmutables: Si cambia un horario o detalle, debes reimprimir o avisar manualmente.',
];

const COMPARE_GOOD = [
  'Siempre en su celular: Acceso al instante desde cualquier navegador sin descargar nada.',
  'Ahorro de tiempo y dinero: Un solo link listo para enviar de forma ilimitada por WhatsApp.',
  'RSVP automatizado: Tus invitados confirman su asistencia con un clic en segundos.',
  'Ubicación interactiva: Acceso directo a Google Maps, Waze y Apple Maps.',
  'Actualizaciones al instante: Modifica horarios, fotos o ubicaciones cuando lo necesites.',
];

function ComparisonSection() {
  return (
    <section className="cro-section" style={{ background: T.onyx }}>
      <div className="cro-shell">
        <Reveal style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto' }}>
          <p className="cro-eyebrow">La diferencia inteligente</p>
          <h2 className="cro-title-xl">Más práctica que una invitación impresa. Más especial que un simple mensaje.</h2>
          <p className="cro-copy" style={{ marginTop: '1.5rem' }}>
            Con una invitación digital, sus invitados tienen toda la información siempre disponible desde su celular, sin perder direcciones, horarios ni detalles importantes.
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="cro-compare-grid">
            <div className="cro-compare-col cro-compare-col-bad">
              <p className="cro-compare-header" style={{ color: T.muted }}>Invitación Impresa o Mensaje</p>
              {COMPARE_BAD.map((bad) => (
                <div className="cro-compare-row" key={bad}>
                  <span style={{ color: '#EF4444', flexShrink: 0, marginTop: '0.15em', fontWeight: 'bold' }}>✕</span>
                  <span style={{ color: T.muted }}>{bad}</span>
                </div>
              ))}
            </div>
            <div className="cro-compare-col cro-compare-col-good">
              <p className="cro-compare-header" style={{ color: T.cyan }}>Invitación Digital Premium</p>
              {COMPARE_GOOD.map((good) => (
                <div className="cro-compare-row" key={good}>
                  <Check size={16} color={T.cyan} style={{ flexShrink: 0, marginTop: '0.15em' }} />
                  <span style={{ color: T.silver }}>{good}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal className="text-center mt-12" delay={0.3}>
          <Link href="#planes" className="cro-btn cro-btn-cyan text-xs">
            Quiero mi invitación de boda
          </Link>
          <p className="text-xs text-[#A8A29E] mt-3 tracking-wide">
            Fácil de compartir por WhatsApp · Diseños personalizados
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Process Section (Cómo funciona) ──────────────────────────────────────────

const PROCESS_STEPS = [
  {
    num: '1',
    title: 'Elijan su estilo',
    text: 'Elijan el estilo que más represente su boda.',
  },
  {
    num: '2',
    title: 'Envíen sus datos',
    text: 'Envíennos sus datos, fotos y detalles del evento.',
  },
  {
    num: '3',
    title: 'Reciban y compartan',
    text: 'Reciban su invitación digital lista para compartir con sus invitados.',
  },
];

function ProcessSection() {
  return (
    <section id="como-funciona" className="cro-section" style={{ background: T.black }}>
      <div className="cro-shell">
        <Reveal style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto' }}>
          <p className="cro-eyebrow">Proceso sencillo</p>
          <h2 className="cro-title-xl">Su invitación lista en 3 pasos</h2>
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
        <Reveal className="text-center mt-12" delay={0.3}>
          <p className="text-sm text-[#A8A29E] tracking-wide m-0">
            * Coordinación personalizada vía WhatsApp en todo momento.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

const TIMELINE_STEPS = [
  {
    num: '1',
    title: 'Contacto inicial',
    text: 'Escríbannos por WhatsApp para iniciar el proceso de su invitación.',
  },
  {
    num: '2',
    title: 'Definición de estilo',
    text: 'Elijan la plantilla y colores que mejor reflejen la esencia de su boda.',
  },
  {
    num: '3',
    title: 'Envío de información',
    text: 'Compártannos sus fotos, ubicaciones, horarios e itinerario.',
  },
  {
    num: '4',
    title: 'Creación y diseño',
    text: 'Nuestro equipo personaliza cada detalle de su invitación digital.',
  },
  {
    num: '5',
    title: 'Revisión y ajustes',
    text: 'Reciban una vista previa para revisar y solicitar cualquier cambio.',
  },
  {
    num: '6',
    title: 'Entrega final',
    text: 'Les entregamos su link único y personalizado listo para compartir.',
  },
  {
    num: '7',
    title: 'Empiecen a compartir',
    text: 'Compartan el link por WhatsApp y reciban confirmaciones al instante.',
  },
];

function WhatHappensSection() {
  return (
    <section className="cro-section" style={{ background: T.onyx }}>
      <div className="cro-shell">
        <Reveal style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto' }}>
          <p className="cro-eyebrow">El paso a paso</p>
          <h2 className="cro-title-xl">¿Cómo es el proceso de creación?</h2>
          <p className="cro-copy" style={{ marginTop: '1.5rem' }}>
            Los guiaremos paso a paso para que tengan su invitación perfecta de forma rápida y sin estrés.
          </p>
        </Reveal>
        
        <div className="cro-timeline">
          {TIMELINE_STEPS.map(({ num, title, text }) => (
            <Reveal key={num} className="cro-timeline-item">
              <span className="cro-timeline-dot" />
              <span className="cro-timeline-num">Paso {num}</span>
              <h3 className="cro-timeline-title">{title}</h3>
              <p className="cro-timeline-text">{text}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="text-center mt-12" delay={0.2}>
          <p className="text-base md:text-lg font-medium text-[#C5A880] m-0">
            No te preocupes: El flujo te guía paso a paso y puedes hacer cambios ilimitados.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Trust / Reassurance Section ──────────────────────────────────────────────

const TRUST_POINTS = [
  { icon: Sparkles, title: 'Diseño exclusivo', text: 'Colores, música e imágenes seleccionadas para combinar perfectamente con la temática de su boda.' },
  { icon: Smartphone, title: 'Sin instalar aplicaciones', text: 'Sus invitados entran al enlace al instante desde cualquier celular, sin descargas.' },
  { icon: CalendarClock, title: 'Ediciones ilimitadas', text: 'Pueden ajustar y actualizar datos, horarios o fotos durante todo el proceso de creación.' },
  { icon: Users, title: 'Confirmación RSVP instantánea', text: 'Sus invitados confirman asistencia en segundos y todo se organiza automáticamente.' },
  { icon: Gift, title: 'Mesa de regalos y datos', text: 'Muestren sus mesas de regalos de tiendas o datos bancarios para lluvia de sobres de forma sutil.' },
  { icon: MapPin, title: 'Ubicación con mapas GPS', text: 'Botones interactivos para abrir la ubicación en Google Maps, Waze y Apple Maps al instante.' },
];

function TrustSection() {
  return (
    <section className="cro-section" style={{ background: T.onyx }}>
      <div className="cro-shell">
        <Reveal style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto' }}>
          <p className="cro-eyebrow">Tranquilidad absoluta</p>
          <h2 className="cro-title-xl">Diseñada para que su boda se vea tan especial como la imaginaron</h2>
          <p className="cro-copy" style={{ marginTop: '1.5rem' }}>
            Cada invitación se adapta a su estilo, colores, fotos e historia, para que el primer contacto con sus invitados refleje la esencia de su celebración.
          </p>
        </Reveal>
        
        <div className="cro-trust-container">
          {TRUST_POINTS.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={i} className="cro-trust-card">
              <Icon size={32} className="cro-trust-card-icon" strokeWidth={1.5} />
              <h4>{title}</h4>
              <p>{text}</p>
            </Reveal>
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

function Editions() {
  return (
    <section id="planes" className="cro-section" style={{ background: T.black }}>
      <PlanSelector products={availableProducts} featuredId="premium" />
    </section>
  );
}

// ─── Technical Specs ──────────────────────────────────────────────────────────

const TECH_SPECS: [string, boolean, boolean, boolean][] = [
  ['RSVP Inteligente / Confirmación',  false, false, true ],
  ['Ubicación con mapas GPS',          false, false, true ],
  ['Cuenta regresiva',                 false, false, true ],
  ['Galería de fotos de su historia',  false, false, true ],
  ['Mesa de regalos organizada',       false, false, true ],
  ['Itinerario y horarios',            false, false, true ],
  ['Música de fondo opcional',         false, false, true ],
  ['Código de vestimenta sugerido',    false, false, true ],
  ['Link listo para WhatsApp',         true,  false, true ],
  ['Cambios de datos sin costo',       true,  false, true ],
];

function TechnicalSpecs() {
  return (
    <section className="cro-section" style={{ background: T.onyx }}>
      <div className="cro-shell">
        <Reveal style={{ textAlign: 'center' }}>
          <p className="cro-eyebrow">Comparativa</p>
          <h2 className="cro-title-xl">¿Qué opción les conviene más?</h2>
        </Reveal>

        <Reveal className="cro-table-wrapper" delay={0.2}>
          <table className="cro-table">
            <thead>
              <tr>
                <th>Características</th>
                <th>Mensaje Simple</th>
                <th>Invitación Impresa</th>
                <th className="col-pro">Invitación Premium</th>
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
    q: '¿Cuánto tarda en estar lista?',
    a: 'El tiempo puede variar según el nivel de personalización, pero el proceso es rápido y guiado desde el primer contacto.',
  },
  {
    q: '¿Se puede enviar por WhatsApp?',
    a: 'Sí. La invitación se entrega como un link fácil de compartir por WhatsApp, redes sociales o mensaje.',
  },
  {
    q: '¿Puedo incluir ubicación y confirmación de asistencia?',
    a: 'Sí. Puede incluir mapa, horarios, mesa de regalos, código de vestimenta y confirmación de asistencia.',
  },
  {
    q: '¿Puedo hacer cambios?',
    a: 'Sí. Se pueden realizar ajustes durante el proceso de personalización antes de la entrega final.',
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
        <div className="cro-hero-overlay" style={{ background: 'radial-gradient(circle at center, rgba(0,0,0,0.4) 0%, #0C0A09 100%)' }}></div>
      </div>
      <div className="cro-shell">
        <Reveal className="cro-hero-content" style={{ alignItems: 'center', textAlign: 'center', margin: '0 auto', maxWidth: 800 }}>
          <h2 className="cro-title-mega" style={{ fontSize: 'clamp(1.8rem, 5vw, 4rem)', textShadow: '0 4px 15px rgba(0,0,0,0.6)' }}>
            ¿Listos para anunciar su boda de forma elegante?
          </h2>
          <p className="cro-copy mt-6" style={{ maxWidth: 640, color: '#E7E5E4' }}>
            Creemos una invitación digital personalizada para que sus invitados vivan la emoción desde el primer clic.
          </p>
          <div className="cro-hero-actions" style={{ justifyContent: 'center' }}>
            <a
              href="https://wa.me/521234567890?text=Hola!%20Me%20interesa%20la%20Invitaci%C3%B3n%20Digital%20Premium%20para%20Boda"
              target="_blank"
              rel="noopener noreferrer"
              className="cro-btn cro-btn-cyan text-center flex items-center justify-center font-bold tracking-wider"
              style={{ textDecoration: 'none' }}
              data-cta="cta-final"
              data-event="click-cta-final"
            >
              Quiero mi invitación de boda
            </a>
          </div>
          <p className="text-xs text-[#A8A29E] mt-4 tracking-wider uppercase font-semibold">
            Pago único · Sin apps · Editable
          </p>
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
      <SolutionSection />
      <ComparisonSection />
      <ProcessSection />
      <EventsGallery />
      <GuaranteeSection />
      <WhatHappensSection />
      <Editions />
      <TrustSection />
      <TechnicalSpecs />
      <FAQ />
      <CallToAction />
      <Footer />
    </main>
  );
}
