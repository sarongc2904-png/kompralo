'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Theme } from '@/domain/themes/types';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, MessageSquare, Copy, Check, ChevronDown, User, Phone, FileText } from 'lucide-react';
import QRCode from 'react-qr-code';
import LiquidCard from './LiquidCard';
import SectionShell from './SectionShell';
import SectionHeader from './SectionHeader';

// ─── WhatsApp URL helper ──────────────────────────────────────────────────────

/**
 * Builds a wa.me deep-link.
 * - No phone → wa.me/?text=… (user picks recipient — works on all platforms)
 * - Mexico 10-digit numbers get the 52 country-code prepended automatically.
 * - Numbers that already start with 52 (12 digits) are left as-is.
 * - All non-digit characters (spaces, +, dashes) are stripped before use.
 */
function buildWhatsAppUrl(message: string, rawPhone?: string | null): string {
  const encoded = encodeURIComponent(message);
  if (!rawPhone) return `https://wa.me/?text=${encoded}`;

  const digits = rawPhone.replace(/\D/g, '');
  if (!digits) return `https://wa.me/?text=${encoded}`;

  let phone = digits;
  if (digits.length === 10) {
    // Mexico local number — prepend country code
    phone = `52${digits}`;
  }
  // 12-digit starting with 52 → already correct
  // 11-digit US numbers, 13+ international → pass as-is

  return `https://wa.me/${phone}?text=${encoded}`;
}

type FormState = 'idle' | 'submitting' | 'success' | 'error';

interface RSVPFormProps {
  invitationId: string;
  rsvpWhatsAppNumber: string;
  theme: Theme;
  eventTitle?: string;
  eventDate?: string;
}

// ─── SVG GOOEY FILTER ─────────────────────────────────────────────────────────
function GooFilter() {
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
      <defs>
        <filter id="goo-rsvp" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
          <feColorMatrix
            in="blur" type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
  );
}

// ─── MORPHING BLOB ─────────────────────────────────────────────────────────────
const BLOB_KEYFRAMES = [
  '62% 38% 46% 54% / 60% 44% 56% 40%',
  '38% 62% 54% 46% / 44% 58% 42% 56%',
  '54% 46% 38% 62% / 56% 38% 62% 44%',
  '46% 54% 62% 38% / 40% 62% 38% 60%',
  '62% 38% 46% 54% / 60% 44% 56% 40%',
];

function MorphBlob({
  color, size, top, left, right, bottom, delay, duration, opacity,
}: {
  color: string; size: number; top?: string; left?: string;
  right?: string; bottom?: string; delay?: number; duration?: number; opacity?: number;
}) {
  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: 'absolute',
        width: size, height: size,
        background: color,
        top, left, right, bottom,
        filter: 'blur(32px)',
        opacity: opacity ?? 0.18,
        pointerEvents: 'none',
      }}
      animate={{ borderRadius: BLOB_KEYFRAMES }}
      transition={{
        duration: duration ?? 9,
        delay: delay ?? 0,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

// ─── LIQUID ATTEND BUTTONS ────────────────────────────────────────────────────
function LiquidButtons({
  attending, setAttending, theme,
}: {
  attending: boolean | null;
  setAttending: (v: boolean) => void;
  theme: Theme;
}) {
  const yesRef = useRef<HTMLButtonElement>(null);
  const noRef  = useRef<HTMLButtonElement>(null);
  const [blobStyle, setBlobStyle] = useState<React.CSSProperties>({ opacity: 0 });

  useEffect(() => {
    const btn = attending === true ? yesRef.current : attending === false ? noRef.current : null;
    if (!btn) { setBlobStyle({ opacity: 0 }); return; }
    const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = btn;
    setBlobStyle({
      opacity: 1,
      left: offsetLeft,
      top: offsetTop,
      width: offsetWidth,
      height: offsetHeight,
    });
  }, [attending]);

  const base =
    'relative z-10 py-4 text-[11px] uppercase tracking-[0.22em] font-semibold transition-colors duration-300 cursor-pointer outline-none border-0 bg-transparent w-full';

  return (
    <div
      className="relative rounded-xl overflow-hidden"
      style={{
        filter: 'url(#goo-rsvp)',
        background: `var(--v2-glass-bg, ${theme.colors.surface || 'rgba(255,255,255,0.55)'})`,
        border: '1.5px solid var(--v2-color-border, rgba(200, 167, 93, 0.40))',
        boxShadow: `var(--v2-shadow-card, none)`,
      }}
    >
      {/* Morphing liquid blob selector */}
      <motion.div
        aria-hidden="true"
        animate={{
          left: blobStyle.left,
          top: blobStyle.top,
          width: blobStyle.width,
          height: blobStyle.height,
          opacity: blobStyle.opacity,
        }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        style={{
          position: 'absolute',
          background: `linear-gradient(135deg, var(--v2-color-accent, ${theme.colors.accent || '#C5A880'}) 0%, var(--v2-color-accent-hover, ${theme.borders.strong || '#B4966E'}) 100%)`,
          borderRadius: `var(--v2-radius-sm, 10px)`,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      <div className="grid grid-cols-2 relative">
        {/* Vertical separator */}
        <div 
          className="absolute top-0 bottom-0 left-1/2 w-[1px] pointer-events-none" 
          style={{ background: 'var(--v2-color-border, rgba(200, 167, 93, 0.25))', zIndex: 5 }} 
        />
        
        <button
          ref={yesRef}
          type="button"
          onClick={() => setAttending(true)}
          className={base}
          style={{ 
            color: attending === true ? '#fff' : 'var(--v2-color-text-secondary, #5C4A3E)',
            zIndex: 10,
            textShadow: attending === true ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          Sí asistiré
        </button>
        <button
          ref={noRef}
          type="button"
          onClick={() => setAttending(false)}
          className={base}
          style={{ 
            color: attending === false ? '#fff' : 'var(--v2-color-text-secondary, #5C4A3E)',
            zIndex: 10,
            textShadow: attending === false ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          No podré asistir
        </button>
      </div>
    </div>
  );
}

// ─── GLASS INPUT ──────────────────────────────────────────────────────────────
function GlassInput({
  id, type = 'text', value, onChange, placeholder, required, label, theme, icon: Icon,
}: {
  id: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder: string;
  required?: boolean; label: string;
  theme: Theme;
  icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs uppercase tracking-[0.22em] mb-2 font-semibold flex items-center gap-1.5"
        style={{ color: 'var(--v2-color-text-secondary, #5C4A3E)' }}
      >
        {label}
        {required && <span style={{ color: 'var(--v2-color-accent, #C8A75D)' }}>✦</span>}
      </label>
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 pointer-events-none" style={{ color: 'var(--v2-color-accent, #C8A75D)', opacity: 0.8 }}>
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={id} type={type} value={value} required={required}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className={`w-full py-3.5 pr-4 text-sm outline-none transition-all duration-300 ${Icon ? 'pl-10' : 'pl-4'}`}
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,252,246,0.70) 100%)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${focused ? `var(--v2-color-accent, #C8A75D)` : `var(--v2-color-border, rgba(200, 167, 93, 0.22))`}`,
            borderRadius: '12px',
            color: `var(--v2-color-text-primary, #1F1A16)`,
            boxShadow: focused
              ? `0 0 0 3px var(--v2-color-accent-soft, rgba(200, 167, 93, 0.12))`
              : '0 1px 4px rgba(0,0,0,0.02)',
          }}
        />
        {/* Focus glow border */}
        <motion.div
          aria-hidden="true"
          animate={{ opacity: focused ? 1 : 0, scaleX: focused ? 1 : 0.4 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'absolute', bottom: 0, left: '10%', right: '10%', height: 1.5,
            background: `linear-gradient(90deg, transparent, var(--v2-color-accent, #C8A75D), transparent)`,
            transformOrigin: 'center',
          }}
        />
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function RSVPForm({ invitationId, rsvpWhatsAppNumber, theme, eventTitle, eventDate }: RSVPFormProps) {
  const [name,        setName]        = useState('');
  const [phone,       setPhone]       = useState('');
  const [attending,   setAttending]   = useState<boolean | null>(null);
  const [guests,      setGuests]      = useState(1);
  const [notes,       setNotes]       = useState('');
  const [formState,   setFormState]   = useState<FormState>('idle');
  const [errorMsg,    setErrorMsg]    = useState('');
  const [noteFocused, setNoteFocused] = useState(false);
  const [copied,      setCopied]      = useState(false);
  const [passCopied,  setPassCopied]  = useState(false);
  const [passUrl,     setPassUrl]     = useState<string | null>(null);
  const passCardRef                   = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || attending === null) return;

    setFormState('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitationId,
          name: name.trim(),
          phone: phone.trim() || undefined,
          attendance: attending ? 'yes' : 'no',
          guestCount: attending ? guests : 0,
          message: notes.trim() || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({})) as { passUrl?: string };
        setPassUrl(data.passUrl ?? null);
        setFormState('success');
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg((data as { error?: string }).error ?? 'No pudimos registrar tu respuesta. Intenta de nuevo.');
        setFormState('error');
      }
    } catch {
      setErrorMsg('Sin conexión. Verifica tu internet e intenta de nuevo.');
      setFormState('error');
    }
  };

  const handleReset = () => {
    setFormState('idle');
    setErrorMsg('');
    setAttending(null);
    setName('');
    setPhone('');
    setNotes('');
    setGuests(1);
  };

  const buildRsvpMessage = () => {
    const status = attending ? 'Sí asistiré ✓' : 'No podré asistir';
    return [
      `Hola, confirmo mi asistencia.`,
      ``,
      `Nombre: ${name}`,
      `Asistencia: ${status}`,
      attending ? `Invitados: ${guests} persona${guests !== 1 ? 's' : ''}` : null,
      phone ? `Teléfono: ${phone}` : null,
      notes ? `Mensaje: ${notes}` : null,
    ]
      .filter((l) => l !== null)
      .join('\n');
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(buildRsvpMessage());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // clipboard not available — silent fail
    }
  };

  const handleCopyPass = async () => {
    if (!passUrl) return;
    try {
      await navigator.clipboard.writeText(passUrl);
      setPassCopied(true);
      setTimeout(() => setPassCopied(false), 2500);
    } catch {
      window.prompt('Copia el link de tu pase:', passUrl);
    }
  };

  const handleDownloadPass = async () => {
    if (!passCardRef.current) return;
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(passCardRef.current, {
        cacheBust: true,
        backgroundColor: '#ffffff',
        pixelRatio: 2,
      });
      const a    = document.createElement('a');
      a.download = `pase-${name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.png`;
      a.href     = dataUrl;
      a.click();
    } catch (err) {
      console.error('Error al descargar pase:', err);
    }
  };

  const buildPassWhatsAppMessage = () => {
    const total = attending ? guests : 0;
    return [
      `Hola, este es mi pase de entrada al evento:`,
      ``,
      `Nombre: ${name}`,
      attending ? `Personas confirmadas: ${total}` : null,
      ``,
      `Ver pase:`,
      passUrl ?? '',
    ]
      .filter((l) => l !== null)
      .join('\n');
  };

  return (
    <SectionShell className="select-none" contentClassName="max-w-2xl mx-auto">
      <GooFilter />

      {/* Header */}
      <SectionHeader eyebrow="Confirmación" title="Confirmar Asistencia" theme={theme} className="mb-12" />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="relative"
      >
        <LiquidCard theme={theme} style={{ padding: '48px 40px' }}>
          {/* Morphing blob decorations */}
          <MorphBlob color={theme.colors.accentSoft} size={220} top="-80px" left="-80px" delay={0}   duration={10} opacity={0.06} />
          <MorphBlob color={theme.colors.accent} size={180} bottom="-60px" right="-60px" delay={3} duration={12} opacity={0.04} />
          <MorphBlob color={theme.colors.overlay} size={150} top="40%" left="60%" delay={1.5} duration={9} opacity={0.03} />

          {/* Inner luxury gold framing */}
          <div className="absolute inset-4 border border-[rgba(200,167,93,0.22)] rounded-2xl pointer-events-none z-0" />
          <div className="absolute inset-5 border border-[rgba(200,167,93,0.10)] rounded-xl pointer-events-none z-0" />

          {/* Golden Corner Flourishes */}
          <div className="absolute top-6 left-6 text-[rgba(200,167,93,0.45)] pointer-events-none z-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M0,24 L0,0 L24,0 M0,0 L12,12" />
            </svg>
          </div>
          <div className="absolute top-6 right-6 text-[rgba(200,167,93,0.45)] pointer-events-none z-0 rotate-90">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M0,24 L0,0 L24,0 M0,0 L12,12" />
            </svg>
          </div>
          <div className="absolute bottom-6 left-6 text-[rgba(200,167,93,0.45)] pointer-events-none z-0 -rotate-90">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M0,24 L0,0 L24,0 M0,0 L12,12" />
            </svg>
          </div>
          <div className="absolute bottom-6 right-6 text-[rgba(200,167,93,0.45)] pointer-events-none z-0 rotate-180">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M0,24 L0,0 L24,0 M0,0 L12,12" />
            </svg>
          </div>

          {/* Top gloss stripe */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.32) 0%, transparent 100%)',
              borderRadius: '28px 28px 0 0',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />

          <AnimatePresence mode="wait">
            {formState !== 'success' ? (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleSubmit}
                className="relative z-10 space-y-6"
              >
                <GlassInput
                  id="rsvp-name" label="Nombre Completo"
                  value={name} onChange={setName}
                  placeholder="Escribe tu nombre" required
                  theme={theme} icon={User}
                />

                <GlassInput
                  id="rsvp-phone" label="Teléfono Celular" type="tel"
                  value={phone} onChange={setPhone}
                  placeholder="Escribe tu número de teléfono"
                  theme={theme} icon={Phone}
                />

                {/* Attend buttons */}
                <div>
                  <span
                    className="block text-xs uppercase tracking-[0.22em] mb-3 font-semibold"
                    style={{ color: 'var(--v2-color-text-secondary, #5C4A3E)' }}
                  >
                    ¿Asistirás al evento? *
                  </span>
                  <LiquidButtons attending={attending} setAttending={setAttending} theme={theme} />
                </div>

                {/* Guests */}
                <AnimatePresence>
                  {attending === true && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <label
                        htmlFor="rsvp-guests"
                        className="block text-xs uppercase tracking-[0.22em] mb-2 font-semibold"
                        style={{ color: 'var(--v2-color-text-secondary, #5C4A3E)' }}
                      >
                        Cantidad de Invitados
                      </label>
                      <div className="relative">
                        <select
                          id="rsvp-guests"
                          value={guests}
                          onChange={(e) => setGuests(Number(e.target.value))}
                          className="w-full py-3.5 pr-10 pl-4 text-sm outline-none appearance-none cursor-pointer"
                          style={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,252,246,0.70) 100%)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid var(--v2-color-border, rgba(200, 167, 93, 0.22))',
                            borderRadius: '12px',
                            color: 'var(--v2-color-text-primary, #1F1A16)',
                          }}
                        >
                          {[1, 2, 3, 4].map((n) => (
                            <option key={n} value={n}>{n} {n === 1 ? 'Persona' : 'Personas'}</option>
                          ))}
                        </select>
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--v2-color-accent, #C8A75D)' }}>
                          <ChevronDown size={16} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Notes */}
                <div>
                  <label
                    htmlFor="rsvp-notes"
                    className="block text-xs uppercase tracking-[0.22em] mb-2 font-semibold"
                    style={{ color: 'var(--v2-color-text-secondary, #5C4A3E)' }}
                  >
                    Notas / Mensaje especial
                  </label>
                  <div className="relative flex items-start">
                    <div className="absolute left-3.5 top-3.5 pointer-events-none" style={{ color: 'var(--v2-color-accent, #C8A75D)', opacity: 0.8 }}>
                      <FileText className="w-4 h-4" />
                    </div>
                    <textarea
                      id="rsvp-notes" rows={3} value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      onFocus={() => setNoteFocused(true)}
                      onBlur={() => setNoteFocused(false)}
                      placeholder="Algún mensaje o restricción alimentaria..."
                      className="w-full py-3.5 pr-4 pl-10 text-sm outline-none resize-none transition-all duration-300"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,252,246,0.70) 100%)',
                        backdropFilter: 'blur(12px)',
                        border: `1px solid ${noteFocused ? `var(--v2-color-accent, #C8A75D)` : `var(--v2-color-border, rgba(200, 167, 93, 0.22))`}`,
                        borderRadius: '12px',
                        color: 'var(--v2-color-text-primary, #1F1A16)',
                        boxShadow: noteFocused
                          ? `0 0 0 3px var(--v2-color-accent-soft, rgba(200, 167, 93, 0.12))`
                          : '0 1px 4px rgba(0,0,0,0.02)',
                      }}
                    />
                    <motion.div
                      aria-hidden="true"
                      animate={{ opacity: noteFocused ? 1 : 0, scaleX: noteFocused ? 1 : 0.4 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        position: 'absolute', bottom: 0, left: '10%', right: '10%', height: 1,
                        background: `linear-gradient(90deg, transparent, var(--v2-color-accent, #C8A75D), transparent)`,
                        transformOrigin: 'center',
                      }}
                    />
                  </div>
                </div>

                {/* Error inline */}
                <AnimatePresence>
                  {formState === 'error' && (
                    <motion.p
                      key="error-msg"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-center px-2 py-2 rounded-lg"
                      style={{
                        color: '#c0392b',
                        background: 'rgba(192,57,43,0.08)',
                        border: '1px solid rgba(192,57,43,0.18)',
                      }}
                    >
                      {errorMsg}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={attending === null || !name || formState === 'submitting'}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 text-[11px] uppercase tracking-[0.3em] font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    color: '#ffffff',
                    background: 'linear-gradient(135deg, var(--v2-color-accent, #C8A75D) 0%, var(--v2-color-accent-hover, #D4B870) 100%)',
                    borderRadius: '30px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 8px 25px rgba(200, 167, 93, 0.25)',
                    letterSpacing: '0.3em',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.15)',
                  }}
                >
                  {formState === 'submitting' ? 'Enviando…' : 'Confirmar Asistencia'}
                </motion.button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 text-center flex flex-col items-center"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mt-4"
                  style={{ background: theme.colors.accentSoft, color: theme.colors.accent }}
                >
                  <CheckCircle2 className="w-10 h-10" />
                </motion.div>

                <h4 className={`text-2xl font-light tracking-wide mb-2 ${theme.headingFont}`} style={{ color: theme.colors.textPrimary }}>
                  ¡Confirmación Recibida!
                </h4>
                <p className="text-sm opacity-70 mb-6 max-w-sm leading-relaxed" style={{ color: theme.colors.textSecondary }}>
                  Muchas gracias por responder. Tu asistencia ha sido registrada.
                </p>

                {/* ── Pass card ── */}
                {passUrl && (
                  <div className="w-full max-w-sm mb-6">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-semibold mb-3" style={{ color: theme.colors.textSecondary }}>
                      Tu pase de entrada
                    </p>

                    {/* Card captured for PNG download */}
                    <div
                      ref={passCardRef}
                      style={{
                        background:   '#ffffff',
                        border:       '1px solid #EAD7A3',
                        borderRadius: '1.125rem',
                        overflow:     'hidden',
                        textAlign:    'center',
                      }}
                    >
                      {/* Gold header */}
                      <div style={{ background: 'linear-gradient(135deg, #C4A962 0%, #B4966E 100%)', padding: '.875rem 1.25rem' }}>
                        <p style={{ margin: 0, fontSize: '.5625rem', fontWeight: 800, letterSpacing: '.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)' }}>KOMPRALO</p>
                        <p style={{ margin: '.125rem 0 0', fontSize: '.6875rem', fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: '#ffffff' }}>Pase de entrada</p>
                      </div>

                      <div style={{ padding: '1.25rem' }}>
                        {eventTitle && (
                          <p style={{ margin: '0 0 .875rem', fontSize: '.625rem', fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: '#C4A962' }}>
                            {eventTitle}
                          </p>
                        )}

                        <p style={{ margin: '0 0 .125rem', fontSize: '.5625rem', fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: '#6B4A35' }}>Invitado</p>
                        <p style={{ margin: '0 0 1rem', fontSize: '1.125rem', fontWeight: 700, color: '#0D0A07', lineHeight: 1.2, wordBreak: 'break-word' }}>
                          {name}
                        </p>

                        {attending && (
                          <p style={{ margin: '0 0 1rem', fontSize: '.8125rem', color: '#238636', fontWeight: 600 }}>
                            {guests} persona{guests !== 1 ? 's' : ''} confirmada{guests !== 1 ? 's' : ''}
                          </p>
                        )}

                        <div style={{ display: 'inline-flex', background: '#fff', padding: '.75rem', border: '1px solid #EAD7A3', borderRadius: '.625rem', marginBottom: '.75rem' }}>
                          <QRCode value={passUrl} size={140} level="M" />
                        </div>

                        <p style={{ margin: 0, fontSize: '.5625rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#C4A962' }}>
                          Presenta este pase en la entrada
                        </p>
                      </div>
                    </div>

                    {/* Pass action buttons */}
                    <div className="space-y-2 mt-3">
                      <button
                        type="button"
                        onClick={handleDownloadPass}
                        className="w-full min-h-[46px] px-4 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-semibold leading-tight whitespace-normal break-words"
                        style={{
                          background: '#0D0A07',
                          color: '#F1E3C8',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        ⬇ Descargar pase
                      </button>

                      <a
                        href={buildWhatsAppUrl(buildPassWhatsAppMessage(), undefined)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full min-h-[46px] px-4 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-semibold leading-tight whitespace-normal break-words no-underline"
                        style={{ background: '#25D366', color: '#fff', textDecoration: 'none' }}
                      >
                        <MessageSquare className="w-4 h-4 flex-shrink-0" />
                        Enviar pase por WhatsApp
                      </a>

                      <button
                        type="button"
                        onClick={handleCopyPass}
                        className="w-full min-h-[46px] px-4 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-semibold leading-tight whitespace-normal break-words"
                        style={{
                          background: passCopied ? '#E6F4EA' : `var(--v2-glass-bg, ${theme.colors.surface})`,
                          color: passCopied ? '#238636' : `var(--v2-color-text-secondary, ${theme.colors.textSecondary})`,
                          border: `1px solid ${passCopied ? '#A7D7B0' : `var(--v2-color-border, ${theme.borders.subtle})`}`,
                          cursor: 'pointer',
                          transition: 'background .2s, color .2s, border-color .2s',
                        }}
                      >
                        {passCopied
                          ? <><Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#238636' }} /> Link copiado</>
                          : <><Copy className="w-3.5 h-3.5 flex-shrink-0" /> Copiar link del pase</>
                        }
                      </button>
                    </div>
                  </div>
                )}

                {/* Divider */}
                <div className="w-full max-w-sm" style={{ height: '1px', background: `var(--v2-color-border, ${theme.borders.subtle})`, marginBottom: '1.25rem' }} />

                {/* Secondary actions */}
                <div className="w-full max-w-sm space-y-2">
                  <a
                    href={buildWhatsAppUrl(buildRsvpMessage(), rsvpWhatsAppNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3.5 text-[10px] uppercase tracking-widest transition-all duration-300 no-underline"
                    style={{
                      background: `var(--v2-glass-bg, ${theme.colors.surface})`,
                      border: `1px solid var(--v2-color-border, ${theme.borders.subtle})`,
                      borderRadius: 10,
                      color: `var(--v2-color-text-secondary, ${theme.colors.textSecondary})`,
                      minHeight: 46,
                      textDecoration: 'none',
                    }}
                  >
                    <MessageSquare className="w-4 h-4 flex-shrink-0" style={{ color: '#25D366' }} />
                    Enviar confirmación por WhatsApp
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="flex items-center justify-center gap-2 w-full py-3 text-[9px] uppercase tracking-widest transition-opacity"
                    style={{
                      background: 'none',
                      border: `1px solid var(--v2-color-border, ${theme.borders.subtle})`,
                      borderRadius: 10,
                      cursor: 'pointer',
                      color: theme.colors.textSecondary,
                      minHeight: 40,
                      opacity: copied ? 1 : 0.6,
                    }}
                  >
                    {copied
                      ? <><Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#25D366' }} /> Mensaje Copiado</>
                      : <><Copy className="w-3.5 h-3.5 flex-shrink-0" /> Copiar Mensaje</>
                    }
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full py-3 text-[9px] uppercase tracking-widest opacity-50 hover:opacity-80 transition-opacity"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.textSecondary }}
                  >
                    Modificar Respuesta
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </LiquidCard>
        </motion.div>
    </SectionShell>
  );
}
