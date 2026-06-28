'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

const LS_KEY = 'kompralo:mi-evento-tour-seen';

interface Step {
  id:    string;
  label: string;
  title: string;
  desc:  string;
}

const STEPS: Step[] = [
  {
    id:    'mi-evento-header',
    label: 'Tu evento',
    title: 'Resumen de tu evento',
    desc:  'Aquí ves el nombre, fecha, plan y estado de tu invitación de un vistazo.',
  },
  {
    id:    'mi-evento-acciones',
    label: 'Acciones',
    title: 'Comparte y personaliza',
    desc:  'Comparte tu invitación con confirmación de asistencia o con pases, personaliza el diseño o véla como la verán tus invitados.',
  },
  {
    id:    'mi-evento-metricas',
    label: 'Métricas',
    title: 'Confirmaciones en tiempo real',
    desc:  'Aquí se actualizan los números conforme tus invitados responden: cuántos asistirán, cuántos declinaron y el total de personas.',
  },
  {
    id:    'mi-evento-invitados',
    label: 'Invitados',
    title: 'Lista de invitados',
    desc:  'Todos los que respondieron aparecen aquí con su asistencia, acompañantes, mensaje y pase de entrada.',
  },
  {
    id:    'mi-evento-pases',
    label: 'Pases',
    title: 'Pases de entrada',
    desc:  'Gestiona los pases digitales para el acceso al evento. Cada invitado confirmado puede tener su propio pase con QR.',
  },
  {
    id:    'mi-evento-scanner',
    label: 'Escáner',
    title: 'Escanear invitados al entrar',
    desc:  'El día del evento escanea el QR de cada pase para registrar la llegada de tus invitados en tiempo real.',
  },
];

const TT_W  = 300;
const TT_H  = 220;
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

  let top: number;
  const spaceBelow = wh - rect.top - rect.height;
  const spaceAbove = rect.top;

  if (spaceBelow >= TT_H + MARGIN) {
    top = rect.top + rect.height + MARGIN;
  } else if (spaceAbove >= TT_H + MARGIN) {
    top = rect.top - TT_H - MARGIN;
  } else {
    top = clamp((wh - TT_H) / 2, 12, wh - TT_H - 12);
  }

  let left = rect.left;
  left = clamp(left, 12, ww - TT_W - 12);

  return { top, left };
}

function TourUI({ onClose }: { onClose: () => void }) {
  const [step,    setStep]    = useState(0);
  const [rect,    setRect]    = useState<Rect | null>(null);
  const [ttPos,   setTtPos]   = useState({ top: 0, left: 0 });
  const [visible, setVisible] = useState(false);

  // Skip steps whose target element doesn't exist in current page phase
  const availableSteps = STEPS.filter(s => !!document.getElementById(s.id));
  const activeSteps = availableSteps.length > 0 ? availableSteps : STEPS;

  const updatePositions = useCallback((idx: number) => {
    const id = activeSteps[idx]?.id ?? '';
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'instant', block: 'center' });
    }
    // Wait one frame for scroll to settle before measuring
    requestAnimationFrame(() => {
      const r = getRect(id);
      if (!r) return;
      setRect(r);
      setTtPos(tooltipPos(r));
    });
  }, [activeSteps]);

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
    if (step < activeSteps.length - 1) setStep(s => s + 1);
    else onClose();
  }

  function prev() {
    if (step > 0) setStep(s => s - 1);
  }

  if (!visible || !rect) return null;

  const spotStyle: React.CSSProperties = {
    position:    'fixed',
    pointerEvents: 'none',
    zIndex:      1000,
    top:         rect.top  - PAD,
    left:        rect.left - PAD,
    width:       rect.width  + PAD * 2,
    height:      rect.height + PAD * 2,
    borderRadius: 10,
    background:  'transparent',
    boxShadow:   '0 0 0 9999px rgba(10,8,4,0.82)',
    border:      '2px solid #C9A96E',
    transition:  `top ${EASE}, left ${EASE}, width ${EASE}, height ${EASE}`,
  };

  const ttStyle: React.CSSProperties = {
    position:   'fixed',
    zIndex:     1001,
    top:        ttPos.top,
    left:       ttPos.left,
    width:      TT_W,
    background: '#FFFDF9',
    border:     '1px solid #E8DFC8',
    borderRadius: 14,
    padding:    20,
    boxShadow:  '0 8px 32px rgba(0,0,0,0.18)',
    transition: `top ${EASE}, left ${EASE}`,
  };

  const btnBase: React.CSSProperties = {
    padding: '6px 13px', borderRadius: 7,
    fontSize: 12, fontWeight: 600, cursor: 'pointer',
    border: 'none', fontFamily: 'inherit',
  };

  return (
    <>
      <div style={spotStyle} aria-hidden="true" />

      <div style={ttStyle} role="dialog" aria-modal="true" aria-label={`Paso ${step + 1} del tour`}>
        {/* Progress bars */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
          {activeSteps.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: i <= step ? '#C9A96E' : '#EDE0CC',
              transition: 'background 0.25s',
            }} />
          ))}
        </div>

        <p style={{ fontSize: 10, fontWeight: 700, color: '#C9A96E', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
          {activeSteps[step].label}
        </p>
        <p style={{ fontSize: 15, fontWeight: 700, color: '#1A1410', marginBottom: 6 }}>
          {activeSteps[step].title}
        </p>
        <p style={{ fontSize: 12, color: '#7B5E3A', lineHeight: 1.6, marginBottom: 16 }}>
          {activeSteps[step].desc}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: '#B0A090', fontWeight: 600 }}>
            {step + 1} / {activeSteps.length}
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button type="button" onClick={onClose} style={{ ...btnBase, background: 'transparent', color: '#9B8878' }}>
              Saltar
            </button>
            {step > 0 && (
              <button type="button" onClick={prev} style={{ ...btnBase, background: '#EDE0CC', color: '#3D2B1F' }}>
                Atrás
              </button>
            )}
            <button type="button" onClick={next} style={{ ...btnBase, background: '#C9A96E', color: '#1A1410' }}>
              {step === activeSteps.length - 1 ? '¡Listo!' : 'Siguiente'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export function MiEventoTour() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(LS_KEY)) {
      const t = setTimeout(() => setShow(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  if (!show) return null;

  return (
    <TourUI
      onClose={() => {
        localStorage.setItem(LS_KEY, '1');
        setShow(false);
      }}
    />
  );
}
