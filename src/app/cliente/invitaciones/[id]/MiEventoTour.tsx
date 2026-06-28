'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

const LS_KEY  = 'kompralo_centro_control_tour_done';
const EV_OPEN = 'kompralo:centro-control-tour-open';

interface Step {
  id:    string;
  label: string;
  title: string;
  desc:  string;
}

const STEPS: Step[] = [
  {
    id:    'tour-header',
    label: 'Tu boda',
    title: 'Aquí ves el nombre y fecha de tu boda',
    desc:  'Este es tu Centro de Control. Desde aquí gestionas todo lo relacionado con tu evento.',
  },
  {
    id:    'tour-btn-ver',
    label: 'Ver invitación',
    title: 'Previsualiza tu invitación',
    desc:  'Previsualiza tu invitación exactamente como la verán tus invitados.',
  },
  {
    id:    'tour-btn-compartir',
    label: 'Compartir',
    title: 'Comparte tu invitación',
    desc:  'Copia y comparte el link de tu invitación por WhatsApp o redes sociales.',
  },
  {
    id:    'tour-btn-stats',
    label: 'Estadísticas',
    title: 'Tus estadísticas',
    desc:  'Consulta cuántas personas han abierto tu invitación.',
  },
  {
    id:    'tour-btn-plan',
    label: 'Plan activo',
    title: 'Tu plan activo',
    desc:  'Tu plan activo. Aquí puedes ver todos los beneficios incluidos.',
  },
  {
    id:    'tour-countdown',
    label: 'Cuenta regresiva',
    title: 'Faltan X días para tu boda',
    desc:  'Cuenta regresiva a tu boda. Se actualiza automáticamente cada día.',
  },
  {
    id:    'tour-card-invitacion',
    label: 'Tu invitación',
    title: 'Acceso rápido a tu invitación',
    desc:  'Acceso rápido a tu invitación: adminístrala o ve cómo la ven tus invitados.',
  },
  {
    id:    'tour-btn-administrar',
    label: 'Invitados',
    title: 'Administrar invitados',
    desc:  'Gestiona tu lista completa de invitados: agrega, edita y controla asistencia.',
  },
  {
    id:    'tour-btn-ver-invitados',
    label: 'Vista invitado',
    title: 'Como ven tus invitados',
    desc:  'Ve exactamente cómo verá tu invitación cada invitado con su pase personalizado.',
  },
  {
    id:    'tour-stats-row',
    label: 'Métricas',
    title: 'Confirmaciones en tiempo real',
    desc:  'Resumen en tiempo real: cuántos confirmaron, declinaron y el total de personas.',
  },
  {
    id:    'tour-tabla-confirmados',
    label: 'Confirmados',
    title: 'Lista de invitados confirmados',
    desc:  'Lista de quienes ya respondieron. Puedes ver su pase de entrada desde aquí.',
  },
  {
    id:    'tour-btn-qr',
    label: 'Código QR',
    title: 'Ver código QR',
    desc:  'Genera el QR general para verificar pases de entrada en la puerta del evento.',
  },
  {
    id:    'tour-mis-invitados',
    label: 'Mis invitados',
    title: 'Sección Mis Invitados',
    desc:  'Administra todos tus invitados: crea nuevos, filtra por estado y envía invitaciones por WhatsApp.',
  },
  {
    id:    'tour-btn-crear',
    label: 'Crear invitado',
    title: 'Agregar invitados',
    desc:  'Agrega nuevos invitados uno por uno o en familia.',
  },
  {
    id:    'tour-tabs-filtro',
    label: 'Filtros',
    title: 'Filtros de lista',
    desc:  'Filtra tu lista para ver pendientes de respuesta o invitados sin WhatsApp registrado.',
  },
  {
    id:    'tour-acciones-fila',
    label: 'Acciones',
    title: 'Acciones por invitado',
    desc:  'Por cada invitado puedes ver su QR, su pase personalizado o enviarle la invitación por WhatsApp.',
  },
];

const TT_W   = 300;
const TT_H   = 230;
const MARGIN = 14;
const PAD    = 6;
const EASE   = '380ms cubic-bezier(0.4,0,0.2,1)';

interface Rect { top: number; left: number; width: number; height: number }

function getRect(id: string): Rect | null {
  const el = document.getElementById(id);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

function tooltipPos(rect: Rect): { top: number; left: number } {
  const wh = window.innerHeight;
  const ww = window.innerWidth;

  const centerY    = rect.top + rect.height / 2;
  const inLowerHalf = centerY > wh / 2;

  let top: number;
  if (inLowerHalf && rect.top >= TT_H + MARGIN) {
    top = rect.top - TT_H - MARGIN;
  } else if (!inLowerHalf && wh - rect.top - rect.height >= TT_H + MARGIN) {
    top = rect.top + rect.height + MARGIN;
  } else if (rect.top >= TT_H + MARGIN) {
    top = rect.top - TT_H - MARGIN;
  } else {
    top = rect.top + rect.height + MARGIN;
  }

  top = clamp(top, 12, wh - TT_H - 12);
  const left = clamp(rect.left, 12, ww - TT_W - 12);
  return { top, left };
}

// ─── HELP HINT (post-tour spotlight on the ? button) ──────────────────────────

function HelpHint({ onDismiss }: { onDismiss: () => void }) {
  const [rect, setRect] = useState<Rect | null>(null);

  useEffect(() => {
    const el = document.getElementById('centro-control-help-btn');
    if (el) {
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    }
    const t = setTimeout(onDismiss, 6000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  if (!rect) return null;

  const rPad = 8;
  const ww   = typeof window !== 'undefined' ? window.innerWidth : 375;
  const wh   = typeof window !== 'undefined' ? window.innerHeight : 812;

  // Place tooltip above or below the button
  const tipH     = 72;
  const tipW     = 200;
  const belowY   = rect.top + rect.height + 10;
  const aboveY   = rect.top - tipH - 10;
  const tipTop   = belowY + tipH < wh - 12 ? belowY : aboveY;
  const tipLeft  = clamp(rect.left + rect.width / 2 - tipW / 2, 8, ww - tipW - 8);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes hint-ring { 0%,100% { box-shadow: 0 0 0 0 rgba(201,169,110,0.55); } 60% { box-shadow: 0 0 0 10px rgba(201,169,110,0); } }
        @keyframes hint-fade-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      ` }} />

      {/* Dim overlay — tap to dismiss */}
      <div
        onClick={onDismiss}
        style={{
          position: 'fixed', inset: 0, zIndex: 1490,
          background: 'rgba(10,8,4,0.40)',
        }}
      />

      {/* Pulsing ring around ? button */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top:    rect.top  - rPad,
          left:   rect.left - rPad,
          width:  rect.width  + rPad * 2,
          height: rect.height + rPad * 2,
          borderRadius: '50%',
          border: '2px solid #C9A96E',
          zIndex: 1492,
          pointerEvents: 'none',
          animation: 'hint-ring 1.4s ease-out infinite',
        }}
      />

      {/* Tooltip */}
      <div
        style={{
          position: 'fixed',
          top:  tipTop,
          left: tipLeft,
          width: tipW,
          zIndex: 1493,
          background: '#FFFDF9',
          border: '1px solid #E8DFC8',
          borderRadius: 12,
          padding: '11px 15px',
          boxShadow: '0 8px 28px rgba(0,0,0,0.18)',
          animation: 'hint-fade-in 0.3s ease',
          pointerEvents: 'none',
        }}
      >
        <p style={{ fontSize: 13, fontWeight: 700, color: '#1A1410', margin: '0 0 4px' }}>
          ¿Tienes dudas?
        </p>
        <p style={{ fontSize: 11.5, color: '#7B5E3A', lineHeight: 1.55, margin: 0 }}>
          Toca <strong>?</strong> para abrir la guía del Centro de Control.
        </p>
      </div>
    </>
  );
}

// ─── TOUR UI ──────────────────────────────────────────────────────────────────

function TourUI({ onClose }: { onClose: (completed: boolean) => void }) {
  const [step,    setStep]    = useState(0);
  const [rect,    setRect]    = useState<Rect | null>(null);
  const [ttPos,   setTtPos]   = useState({ top: 0, left: 0 });
  const [visible, setVisible] = useState(false);

  const steps = useMemo(() => {
    const available = STEPS.filter(s => !!document.getElementById(s.id));
    return available.length > 0 ? available : STEPS.slice(0, 5);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updatePositions = useCallback((idx: number) => {
    const id = steps[idx]?.id ?? '';
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'instant', block: 'center' });
    }
    requestAnimationFrame(() => {
      const r = getRect(id);
      if (!r) return;
      setRect(r);
      setTtPos(tooltipPos(r));
    });
  }, [steps]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      updatePositions(step);
      setVisible(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [step, updatePositions]);

  useEffect(() => {
    function onResizeScroll() { updatePositions(step); }
    window.addEventListener('resize', onResizeScroll);
    window.addEventListener('scroll', onResizeScroll, true);
    return () => {
      window.removeEventListener('resize', onResizeScroll);
      window.removeEventListener('scroll', onResizeScroll, true);
    };
  }, [step, updatePositions]);

  function next() {
    if (step < steps.length - 1) setStep(s => s + 1);
    else onClose(true);
  }

  function prev() {
    if (step > 0) setStep(s => s - 1);
  }

  if (!visible || !rect) return null;

  const spotStyle: React.CSSProperties = {
    position:      'fixed',
    pointerEvents: 'none',
    zIndex:        1000,
    top:           rect.top  - PAD,
    left:          rect.left - PAD,
    width:         rect.width  + PAD * 2,
    height:        rect.height + PAD * 2,
    borderRadius:  10,
    background:    'transparent',
    boxShadow:     '0 0 0 9999px rgba(10,8,4,0.82)',
    border:        '2px solid #C9A96E',
    transition:    `top ${EASE}, left ${EASE}, width ${EASE}, height ${EASE}`,
  };

  const ttStyle: React.CSSProperties = {
    position:     'fixed',
    zIndex:       1001,
    top:          ttPos.top,
    left:         ttPos.left,
    width:        TT_W,
    background:   '#FFFDF9',
    border:       '1px solid #E8DFC8',
    borderRadius: 14,
    padding:      20,
    boxShadow:    '0 8px 32px rgba(0,0,0,0.18)',
    transition:   `top ${EASE}, left ${EASE}`,
  };

  const btnBase: React.CSSProperties = {
    padding: '6px 13px', borderRadius: 7,
    fontSize: 12, fontWeight: 600, cursor: 'pointer',
    border: 'none', fontFamily: 'inherit',
  };

  const isLast = step === steps.length - 1;

  return (
    <>
      <div style={spotStyle} aria-hidden="true" />

      <div style={ttStyle} role="dialog" aria-modal="true" aria-label={`Paso ${step + 1} del tour`}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: i <= step ? '#C9A96E' : '#EDE0CC',
              transition: 'background 0.25s',
            }} />
          ))}
        </div>

        <p style={{ fontSize: 10, fontWeight: 700, color: '#C9A96E', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
          {steps[step].label}
        </p>
        <p style={{ fontSize: 15, fontWeight: 700, color: '#1A1410', marginBottom: 6 }}>
          {steps[step].title}
        </p>
        <p style={{ fontSize: 12, color: '#7B5E3A', lineHeight: 1.6, marginBottom: 16 }}>
          {steps[step].desc}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: '#B0A090', fontWeight: 600 }}>
            {step + 1} / {steps.length}
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button type="button" onClick={() => onClose(false)} style={{ ...btnBase, background: 'transparent', color: '#9B8878' }}>
              Saltar
            </button>
            {step > 0 && (
              <button type="button" onClick={prev} style={{ ...btnBase, background: '#EDE0CC', color: '#3D2B1F' }}>
                Atrás
              </button>
            )}
            <button type="button" onClick={next} style={{ ...btnBase, background: '#C9A96E', color: '#1A1410' }}>
              {isLast ? 'Finalizar' : 'Siguiente →'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── EXPORTED COMPONENT ───────────────────────────────────────────────────────

export function MiEventoTour() {
  const [show,     setShow]     = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(LS_KEY)) {
      const t = setTimeout(() => setShow(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    function handleOpen() {
      localStorage.removeItem(LS_KEY);
      setShow(true);
    }
    window.addEventListener(EV_OPEN, handleOpen);
    return () => window.removeEventListener(EV_OPEN, handleOpen);
  }, []);

  if (!show && !showHint) return null;

  return (
    <>
      {show && (
        <TourUI
          onClose={(completed) => {
            localStorage.setItem(LS_KEY, '1');
            setShow(false);
            if (completed) {
              // Brief delay to let tour UI unmount before showing hint
              setTimeout(() => setShowHint(true), 350);
            }
          }}
        />
      )}

      {showHint && (
        <HelpHint onDismiss={() => setShowHint(false)} />
      )}
    </>
  );
}

export function MiEventoTourHelpButton() {
  function handleClick() {
    window.dispatchEvent(new Event(EV_OPEN));
  }
  return (
    <button
      onClick={handleClick}
      aria-label="Ver tutorial del Centro de Control"
      title="Ver tutorial"
      style={{
        width: 28, height: 28,
        borderRadius: '50%',
        border: '1.5px solid #E5D2A8',
        background: 'transparent',
        color: '#7A6A5B',
        fontSize: 13, fontWeight: 700,
        cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        transition: 'border-color .15s, color .15s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#C9A84C'; (e.currentTarget as HTMLButtonElement).style.color = '#C9A84C'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E5D2A8'; (e.currentTarget as HTMLButtonElement).style.color = '#7A6A5B'; }}
    >
      ?
    </button>
  );
}
