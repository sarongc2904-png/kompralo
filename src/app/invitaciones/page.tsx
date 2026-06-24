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

      .cro-editions-wrapper { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; margin-top: 4rem; align-items: stretch; }
      .cro-edition { padding: 4rem 3rem; display: flex; flex-direction: column; position: relative; overflow: hidden; height: 100%; }
      .cro-edition::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 100%); pointer-events: none; }
      .cro-edition-pro { border-color: rgba(197, 168, 128, 0.5) !important; box-shadow: 0 10px 40px rgba(197, 168, 128, 0.1) !important; }
      .cro-edition-pro::after { background: linear-gradient(135deg, rgba(197, 168, 128, 0.08) 0%, transparent 100%); }
      .cro-edition-badge { position: absolute; top: 0; right: 2rem; background: ${T.cyan}; color: ${T.black}; padding: 0.5rem 1rem; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; border-bottom-left-radius: 4px; border-bottom-right-radius: 4px; }
      .cro-edition h3 { margin: 0; font-size: 2rem; font-weight: 300; letter-spacing: -0.02em; color: ${T.ink}; }
      .cro-edition-pro h3 { font-weight: 700; color: ${T.cyan}; }
      .cro-edition-desc { margin: 1rem 0 2rem; color: ${T.muted}; font-size: 0.95rem; line-height: 1.6; min-height: 70px; }
      .cro-edition-price { font-size: 4rem; font-weight: 800; line-height: 1; letter-spacing: -0.04em; margin-bottom: 2.5rem; display: flex; flex-direction: column; color: ${T.ink}; }
      .cro-edition-price small { font-size: 0.8rem; font-weight: 400; letter-spacing: 0.1em; text-transform: uppercase; color: ${T.muted}; margin-top: 0.75rem; }
      .cro-edition-features { list-style: none; padding: 0; margin: 0 0 3rem; flex-grow: 1; display: flex; flex-direction: column; gap: 0.85rem; }
      .cro-edition-features li { display: flex; align-items: flex-start; gap: 0.75rem; font-size: 0.9rem; color: ${T.silver}; line-height: 1.4; }
      .cro-edition span.inline-flex { width: 100%; display: flex; }
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
        .cro-editions-wrapper { grid-template-columns: 1fr; max-width: 500px; margin-inline: auto; }
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
  { icon: Sparkles, title: 'Invitación profesional', text: 'Diseño elegante y moderno adaptado a cualquier celular.' },
  { icon: Link2, title: 'Link personalizado', text: 'Un enlace único y fácil de recordar para compartir por WhatsApp.' },
  { icon: Users, title: 'Confirmación RSVP', text: 'Tus invitados confirman asistencia y acompañantes en segundos.' },
  { icon: MapPin, title: 'Ubicación con mapa', text: 'Botones con acceso directo a Google Maps, Waze y Apple Maps.' },
  { icon: QrCode, title: 'Pases QR', text: 'Controla el acceso a tu evento con pases digitales individuales.' },
  { icon: Images, title: 'Galería', text: 'Espacio hermoso para subir las mejores fotos de su historia de amor.' },
  { icon: Music, title: 'Música', text: 'Melodía de fondo seleccionada por ti para ambientar la experiencia.' },
  { icon: CalendarClock, title: 'Itinerario', text: 'Cronograma con horarios detallados de la misa, recepción y fiesta.' },
  { icon: Shirt, title: 'Código de vestimenta', text: 'Indicaciones claras de etiqueta y paleta de colores sugerida.' },
  { icon: Gift, title: 'Mesa de regalos', text: 'Enlaces directos a tus mesas (Amazon, Liverpool, etc.) o datos bancarios.' },
  { icon: Hotel, title: 'Hospedaje', text: 'Recomendaciones de hoteles y tarifas para tus invitados foráneos.' },
  { icon: Hash, title: 'Redes / hashtag', text: 'Comparte el hashtag oficial de tu boda y reúne todas las fotos.' },
];

function SolutionSection() {
  return (
    <section className="cro-section" style={{ background: T.black }}>
      <div className="cro-shell">
        <Reveal style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto' }}>
          <p className="cro-eyebrow">Todo en un solo lugar</p>
          <h2 className="cro-title-xl">Todo lo que tus invitados necesitan, en un solo link</h2>
          <p className="cro-copy" style={{ marginTop: '1.5rem' }}>
            Olvídate de mandar imágenes pesadas o PDF difíciles de abrir. Tu invitación digital reúne todas las funciones esenciales con un diseño de alta gama.
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
  'Se pierde en WhatsApp: Los invitados la olvidan o eliminan el archivo por accidente.',
  'No confirma asistencia: Tienes que registrar de forma manual a cada persona.',
  'No se actualiza fácil: Cualquier cambio requiere corregir el diseño y volver a enviarlo.',
  'No controla accesos: No hay control de cuántos acompañantes lleva cada persona.',
  'No organiza invitados: Terminas con listas desordenadas en papel o Excel.',
];

const COMPARE_GOOD = [
  'Link fácil de compartir: Se abre al instante en cualquier navegador sin instalar nada.',
  'RSVP en tiempo real: Tus invitados confirman y la lista se actualiza sola.',
  'Puedes editar datos: Cambia horarios, ubicaciones o fotos cuando lo necesites.',
  'Pases QR por invitado: Controla exactamente el cupo asignado a cada familia.',
  'Todo en un solo lugar: Itinerario, mapas, regalos y confirmaciones en un solo link.',
];

function ComparisonSection() {
  return (
    <section className="cro-section" style={{ background: T.onyx }}>
      <div className="cro-shell">
        <Reveal style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto' }}>
          <p className="cro-eyebrow">La diferencia inteligente</p>
          <h2 className="cro-title-xl">No es un PDF bonito. Es una invitación inteligente.</h2>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="cro-compare-grid">
            <div className="cro-compare-col cro-compare-col-bad">
              <p className="cro-compare-header" style={{ color: T.muted }}>PDF o Imagen Estática</p>
              {COMPARE_BAD.map((bad) => (
                <div className="cro-compare-row" key={bad}>
                  <span style={{ color: '#EF4444', flexShrink: 0, marginTop: '0.15em', fontWeight: 'bold' }}>✕</span>
                  <span style={{ color: T.muted }}>{bad}</span>
                </div>
              ))}
            </div>
            <div className="cro-compare-col cro-compare-col-good">
              <p className="cro-compare-header" style={{ color: T.cyan }}>Invitación Inteligente Kompralo</p>
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
            Crear una invitación inteligente
          </Link>
          <p className="text-xs text-[#A8A29E] mt-3 tracking-wide">
            Pago único · Sin mensualidades · Comparte por WhatsApp
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
    title: 'Elige tu plan y realiza tu pago seguro',
    text: 'Selecciona el nivel de personalización que deseas y completa tu compra en nuestra pasarela segura sin mensualidades.',
  },
  {
    num: '2',
    title: 'Completa los datos de tu boda en el wizard',
    text: 'Llena un formulario sencillo paso a paso con los nombres, fecha, ubicaciones, fotos y detalles de tu gran día.',
  },
  {
    num: '3',
    title: 'Personaliza, revisa la vista previa y comparte',
    text: 'Ajusta detalles, activa la música, visualiza cómo la verán tus invitados y comparte el link por WhatsApp.',
  },
];

function ProcessSection() {
  return (
    <section id="como-funciona" className="cro-section" style={{ background: T.black }}>
      <div className="cro-shell">
        <Reveal style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto' }}>
          <p className="cro-eyebrow">Proceso fácil y rápido</p>
          <h2 className="cro-title-xl">De idea a invitación lista para compartir</h2>
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
            * Puedes editar toda la información antes de compartir y actualizar datos después si algo cambia.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

const TIMELINE_STEPS = [
  {
    num: '1',
    title: 'Recibes acceso a tu panel',
    text: 'Inmediatamente después del pago, te enviamos tus credenciales de acceso por correo para entrar a tu panel privado.',
  },
  {
    num: '2',
    title: 'Entras al editor de tu invitación',
    text: 'Accedes a nuestro editor digital guiado paso a paso, sin instalar aplicaciones ni programas complicados.',
  },
  {
    num: '3',
    title: 'Llenas los datos de tu evento',
    text: 'Ingresas los nombres, fecha, ubicaciones, mesa de regalos, fotos y toda la información de tu boda.',
  },
  {
    num: '4',
    title: 'Revisas la vista previa',
    text: 'Ves exactamente cómo lucirá tu invitación en tiempo real y realizas los ajustes que creas necesarios.',
  },
  {
    num: '5',
    title: 'Copias tu link personalizado',
    text: 'Generas tu enlace web único (ej. kompralo.com/sofia-y-alejandro) listo para ser compartido.',
  },
  {
    num: '6',
    title: 'Lo compartes por WhatsApp',
    text: 'Envías el link a todos tus invitados directamente desde tu WhatsApp con un mensaje personalizado.',
  },
  {
    num: '7',
    title: 'Empiezas a recibir confirmaciones',
    text: 'Tus invitados confirman su asistencia con un clic y verás todo organizado al instante en tu panel.',
  },
];

function WhatHappensSection() {
  return (
    <section className="cro-section" style={{ background: T.onyx }}>
      <div className="cro-shell">
        <Reveal style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto' }}>
          <p className="cro-eyebrow">El paso a paso</p>
          <h2 className="cro-title-xl">¿Qué pasa después de pagar?</h2>
          <p className="cro-copy" style={{ marginTop: '1.5rem' }}>
            No te quedas perdida después del pago. Nuestro flujo intuitivo te guía de la mano desde el primer segundo.
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
  { icon: ShieldCheck, title: 'Pago 100% seguro', text: 'Tus transacciones están encriptadas y protegidas con la pasarela de pago más segura.' },
  { icon: Smartphone, title: 'Acceso inmediato', text: 'Recibes tus datos de acceso al panel de forma instantánea tras completar tu compra.' },
  { icon: CalendarClock, title: 'Ediciones ilimitadas', text: 'Puedes actualizar horarios, ubicaciones y detalles las veces que quieras sin costo.' },
  { icon: Smartphone, title: 'Sin instalar aplicaciones', text: 'Tú diseñas desde la web y tus invitados acceden sin necesidad de descargar nada.' },
  { icon: Users, title: 'Fácil para tus invitados', text: 'Tus invitados solo abren el link desde WhatsApp y confirman asistencia en un segundo.' },
  { icon: Smartphone, title: 'Compatible con celular', text: 'La invitación y el panel de administración funcionan a la perfección en cualquier móvil.' },
];

function TrustSection() {
  return (
    <section className="cro-section" style={{ background: T.onyx }}>
      <div className="cro-shell">
        <Reveal style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto' }}>
          <p className="cro-eyebrow">Tranquilidad absoluta</p>
          <h2 className="cro-title-xl">Compra segura y acceso claro</h2>
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
  basic:   'Plan Basic / Esencial',
  premium: 'Plan Premium / Control Total',
  deluxe:  'Plan Deluxe / Experiencia Deluxe',
};

const PLAN_DESCS: Record<string, string> = {
  basic:   'Para parejas que quieren una invitación bonita y funcional.',
  premium: 'Para parejas que quieren confirmaciones, experiencia completa y mejor organización.',
  deluxe:  'Para parejas que quieren una invitación más completa, emocional y premium.',
};

function formatPrice(product: Product) {
  const amount = product.price / 100;
  return '$' + amount.toLocaleString('es-MX', { maximumFractionDigits: 0 });
}

function Editions() {
  return (
    <section id="planes" className="cro-section" style={{ background: T.black }}>
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

                  <div className="mt-auto flex flex-col gap-2">
                    <CheckoutButton
                      productId={product.id}
                      label="Elegir este plan"
                      className={`cro-checkout ${isPro ? 'cro-checkout-pro' : 'cro-checkout-std'}`}
                      data-event={`click-pricing-${product.id}`}
                    />
                    <span className="text-[11px] text-[#A8A29E] text-center mt-1.5 tracking-wider uppercase font-semibold">
                      Pago único · Sin mensualidades
                    </span>
                  </div>
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
    q: '¿Mis invitados necesitan instalar alguna app?',
    a: 'No. Tus invitados solo necesitan hacer clic en el enlace desde WhatsApp o cualquier navegador web para abrir tu invitación. Funciona al instante en iPhone, Android y computadoras sin descargas.',
  },
  {
    q: '¿Puedo editar la información de la invitación después de pagar?',
    a: 'Sí, totalmente. Puedes actualizar la fecha, el horario, las ubicaciones, fotos y detalles del evento en cualquier momento desde tu panel de administración. Los cambios se actualizan al instante sin cambiar tu link.',
  },
  {
    q: '¿Qué pasa exactamente después de realizar mi pago?',
    a: 'Recibes un correo de inmediato con tus credenciales para acceder a tu panel. Desde ahí, un asistente (wizard) muy fácil de usar te guiará paso a paso para completar toda la información y fotos de tu evento.',
  },
  {
    q: '¿Cómo comparto la invitación por WhatsApp?',
    a: 'Una vez que tu invitación esté lista, tu panel te dará un link personalizado. Solo cópialo y envíalo a tus invitados por WhatsApp, de forma individual o en grupos. También puedes generar un código QR si deseas imprimirlo.',
  },
  {
    q: '¿Por qué es mejor que mandar un PDF o imagen?',
    a: 'Un PDF o imagen es estático, pesado, no permite confirmar asistencia y si hay algún cambio, tienes que volver a enviarlo a todos. Kompralo ofrece confirmaciones RSVP en tiempo real, mapas interactivos GPS, música de fondo, pases QR controlados y actualizaciones instantáneas sin cambiar el link.',
  },
  {
    q: '¿Tengo que pagar mensualidades?',
    a: 'No. En Kompralo solo haces un pago único por evento. No hay suscripciones, cobros recurrentes ni sorpresas futuras. Tu invitación estará activa hasta el día de tu evento.',
  },
  {
    q: '¿Puedo ver un ejemplo real de cómo queda antes de pagar?',
    a: '¡Claro que sí! Puedes hacer clic en el botón "Ver ejemplo" en el Hero de la página o en la barra de navegación para abrir la demo real de Sofía y Alejandro en una nueva pestaña. Así verás exactamente la experiencia fluida que tendrán tus invitados.',
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
            Tu invitación puede verse increíble sin complicarte
          </h2>
          <p className="cro-copy mt-6" style={{ maxWidth: 640, color: '#E7E5E4' }}>
            Crea una invitación digital elegante, compártela por WhatsApp y empieza a recibir confirmaciones sin perseguir invitados.
          </p>
          <div className="cro-hero-actions" style={{ justifyContent: 'center' }}>
            <Link href="#planes" className="cro-btn cro-btn-cyan" data-cta="cta-final" data-event="click-cta-final">
              Crear mi invitación
            </Link>
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
