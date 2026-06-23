'use client';

import { useState, useEffect, useCallback } from 'react';

// ─── Steps ────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    title: 'Bienvenido a tu panel',
    text: 'Aquí encontrarás tus invitaciones digitales, podrás editarlas, revisar su vista previa y compartirlas con tus invitados.',
  },
  {
    title: 'Tus invitaciones',
    text: 'En esta sección verás todas tus invitaciones guardadas. Cada tarjeta muestra el evento, el plan y las acciones disponibles.',
  },
  {
    title: 'Editar invitación',
    text: 'Usa el botón de editar para actualizar nombres, fecha, ubicación, fotos, música, código de vestimenta y demás detalles según tu plan.',
  },
  {
    title: 'Vista previa y enlace',
    text: 'Antes de compartir, revisa cómo se verá la invitación. Cuando esté lista, usa el enlace público para enviarla por WhatsApp.',
  },
  {
    title: 'Confirmaciones y ayuda',
    text: 'Desde tu invitación tus invitados pueden confirmar asistencia. Si necesitas recordar cómo funciona el panel, vuelve a abrir este manual desde el botón "Manual de uso".',
  },
];

const STORAGE_KEY = 'kompralo:dashboard-manual-seen';

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  /** Pass user id or email to scope the seen-key per user. Optional. */
  userId?: string;
}

export function DashboardManualTour({ userId }: Props) {
  const storageKey = userId ? `${STORAGE_KEY}:${userId}` : STORAGE_KEY;

  const [open, setOpen]     = useState(false);
  const [step, setStep]     = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const seen = localStorage.getItem(storageKey);
    if (!seen) {
      setOpen(true);
    }
  }, [storageKey]);

  const close = useCallback(() => {
    localStorage.setItem(storageKey, '1');
    setOpen(false);
    setStep(0);
  }, [storageKey]);

  const openManual = () => {
    setStep(0);
    setOpen(true);
  };

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      close();
    }
  };

  const back = () => setStep((s) => Math.max(0, s - 1));

  if (!mounted) return null;

  const isLast  = step === STEPS.length - 1;
  const current = STEPS[step];

  return (
    <>
      {/* ── Floating "Manual de uso" button ────────────────────── */}
      <button
        onClick={openManual}
        aria-label="Abrir manual de uso"
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold shadow-lg transition-transform hover:scale-105 active:scale-95 sm:bottom-6 sm:right-6"
        style={{
          background: 'linear-gradient(135deg, #C8A75D, #B8972D)',
          color: '#0D0A07',
          boxShadow: '0 4px 18px rgba(200,167,93,0.4)',
          minHeight: 44,
        }}
      >
        <span style={{ fontSize: 16 }}>📖</span>
        <span className="hidden sm:inline">Manual de uso</span>
        <span className="sm:hidden">Manual</span>
      </button>

      {/* ── Modal overlay ───────────────────────────────────────── */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={current.title}
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(10,7,4,0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: '#FDFAF6',
              borderRadius: 20,
              width: '100%', maxWidth: 420,
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
              display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1.25rem 1.5rem 0',
            }}>
              <div style={{
                fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.18em',
                textTransform: 'uppercase', color: '#C8A75D',
              }}>
                Manual de uso — {step + 1} / {STEPS.length}
              </div>
              <button
                onClick={close}
                aria-label="Cerrar manual"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#9B8878', fontSize: 18, lineHeight: 1,
                  padding: '4px 6px', borderRadius: 6,
                }}
              >
                ✕
              </button>
            </div>

            {/* Progress bar */}
            <div style={{ padding: '0.75rem 1.5rem 0' }}>
              <div style={{ height: 3, background: '#EDE7DC', borderRadius: 99 }}>
                <div
                  style={{
                    height: '100%', borderRadius: 99,
                    background: 'linear-gradient(90deg, #C8A75D, #D4B870)',
                    width: `${((step + 1) / STEPS.length) * 100}%`,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '1.5rem', flex: 1 }}>
              <h2 style={{
                fontSize: '1.25rem', fontWeight: 700, color: '#1A1410',
                margin: '0 0 0.75rem',
                fontFamily: 'var(--font-playfair, Georgia, serif)',
              }}>
                {current.title}
              </h2>
              <p style={{
                fontSize: '0.9375rem', color: '#6B5B4E', lineHeight: 1.65,
                margin: 0,
              }}>
                {current.text}
              </p>

              {/* Final screen extra */}
              {isLast && (
                <div style={{
                  marginTop: '1.25rem', padding: '1rem',
                  background: '#F6F2EC', borderRadius: 12,
                  border: '1px solid #E8E2DA',
                }}>
                  <p style={{ fontSize: '0.8125rem', color: '#9B8878', margin: 0 }}>
                    Puedes volver a abrir este manual cuando quieras desde el botón{' '}
                    <strong style={{ color: '#C8A75D' }}>&ldquo;Manual de uso&rdquo;</strong>{' '}
                    que aparece en la esquina inferior derecha.
                  </p>
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div style={{
              padding: '0 1.5rem 1.5rem',
              display: 'flex', gap: '0.75rem',
              flexDirection: 'column',
            }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {step > 0 && (
                  <button
                    onClick={back}
                    style={{
                      flex: 1, minHeight: 44, borderRadius: 10, border: '1px solid #E8E2DA',
                      background: 'transparent', color: '#6B5B4E',
                      fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    ← Atrás
                  </button>
                )}
                <button
                  onClick={next}
                  style={{
                    flex: 2, minHeight: 44, borderRadius: 10, border: 'none',
                    background: 'linear-gradient(135deg, #C8A75D, #B8972D)',
                    color: '#0D0A07',
                    fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(200,167,93,0.3)',
                  }}
                >
                  {isLast ? 'Entendido ✓' : 'Siguiente →'}
                </button>
              </div>
              {!isLast && (
                <button
                  onClick={close}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#B0A090', fontSize: '0.8125rem', textAlign: 'center',
                    padding: '4px', minHeight: 36,
                  }}
                >
                  Saltar manual
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
