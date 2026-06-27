'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

interface Step {
  id:    string;
  label: string;
  title: string;
  desc:  string;
}

// ─── Section-specific mini-tour steps ────────────────────────────────────────

type SectionStepMap = Record<string, Step[]>;

const SECTION_TOUR_STEPS: SectionStepMap = {
  hero: [
    { id: 'editor-v4-canvas',    label: 'Texto inline',  title: 'Toca el nombre',        desc: 'Haz clic directamente sobre el nombre en la invitación para editarlo.' },
    { id: 'editor-v4-inspector', label: 'Inspector',     title: 'Inspector de Portada',   desc: 'Aquí cambias foto de fondo, video, música y fecha del evento.' },
  ],
  intro: [
    { id: 'editor-v4-canvas',    label: 'Texto inline',  title: 'Edita el intro',         desc: 'Toca el título o el botón directamente en la pantalla de intro para editarlos.' },
    { id: 'editor-v4-inspector', label: 'Inspector',     title: 'Inspector de Intro',     desc: 'Aquí ajustas el título, subtítulo y texto del botón de apertura.' },
  ],
  countdown: [
    { id: 'editor-v4-layers',    label: 'Navegación',    title: 'Sección de Portada',     desc: 'La cuenta regresiva usa la fecha de Portada. Ve ahí para actualizarla.' },
    { id: 'editor-v4-inspector', label: 'Inspector',     title: 'Fecha del evento',       desc: 'Cambia la fecha aquí y la cuenta regresiva se actualiza automáticamente.' },
  ],
  story: [
    { id: 'editor-v4-layers',    label: 'Navegación',    title: 'Sección Historia',       desc: 'Haz clic en "Historia" en el panel para abrir sus opciones.' },
    { id: 'editor-v4-inspector', label: 'Inspector',     title: 'Momentos de la historia', desc: 'Expande cada momento para editar su texto y subir una foto.' },
    { id: 'editor-v4-canvas',    label: 'Texto inline',  title: 'Título de la sección',   desc: 'El título "Nuestra Historia" se edita tocando el texto en la invitación.' },
  ],
  gallery: [
    { id: 'editor-v4-layers',    label: 'Navegación',    title: 'Sección Galería',        desc: 'Haz clic en "Galería" para abrir el inspector de fotos.' },
    { id: 'editor-v4-inspector', label: 'Inspector',     title: 'Agregar y eliminar fotos', desc: 'Usa "+ Agregar foto" para subir y la ✕ en cada miniatura para eliminar. Máximo 20.' },
  ],
  location: [
    { id: 'editor-v4-canvas',    label: 'Texto inline',  title: 'Nombre del lugar',       desc: 'Toca el nombre del venue o la dirección para editarlos directamente.' },
    { id: 'editor-v4-inspector', label: 'Inspector',     title: 'Links de navegación',    desc: 'Pega el link de Google Maps y el link de Waze aquí, luego guarda.' },
  ],
  dresscode: [
    { id: 'editor-v4-canvas',    label: 'Texto inline',  title: 'Tipo de vestimenta',     desc: 'Toca el texto del dress code en la invitación para editarlo.' },
    { id: 'editor-v4-inspector', label: 'Inspector',     title: 'Paleta de colores',      desc: 'Usa el selector de color para cambiar o agregar colores a la paleta (máx 6).' },
  ],
  parents: [
    { id: 'editor-v4-canvas',    label: 'Texto inline',  title: 'Nombres de los padres',  desc: 'Toca directamente los nombres en la invitación para editarlos.' },
    { id: 'editor-v4-inspector', label: 'Inspector',     title: 'Inspector de Familias',  desc: 'Aquí ves los nombres actuales. Esta sección requiere Plan Deluxe.' },
  ],
  godparents: [
    { id: 'editor-v4-layers',    label: 'Navegación',    title: 'Sección Padrinos',       desc: 'Haz clic en "Padrinos" para abrir el editor de categorías.' },
    { id: 'editor-v4-inspector', label: 'Inspector',     title: 'Editor de Padrinos',     desc: 'Agrega o elimina categorías, cambia el rubro, ícono y lista de nombres.' },
  ],
  gifts: [
    { id: 'editor-v4-canvas',    label: 'Texto inline',  title: 'Mesa de regalos',        desc: 'Toca el nombre de la tienda, el link o los datos bancarios para editarlos.' },
  ],
  message: [
    { id: 'editor-v4-canvas',    label: 'Texto inline',  title: 'Texto del mensaje',      desc: 'Toca el título o el mensaje para editarlos directamente.' },
    { id: 'editor-v4-inspector', label: 'Inspector',     title: 'Foto de fondo',          desc: 'Sube una foto de fondo desde el inspector de Mensaje Final.' },
  ],
};

// ─── Full tour steps ──────────────────────────────────────────────────────────

const STEPS: Step[] = [
  {
    id:    'editor-v4-layers',
    label: 'Navegación',
    title: 'Panel de secciones',
    desc:  'Haz clic en cualquier sección para navegar a ella y ver sus opciones de edición.',
  },
  {
    id:    'editor-v4-canvas',
    label: 'Vista previa',
    title: 'Invitación en tiempo real',
    desc:  'Toca cualquier texto en la invitación para editarlo directamente. Sin formularios.',
  },
  {
    id:    'editor-v4-inspector',
    label: 'Inspector',
    title: 'Controles de sección',
    desc:  'Aquí aparecen las opciones de cada sección: fotos, videos, colores, links y más.',
  },
  {
    id:    'editor-v4-preview-btn',
    label: 'Vista previa',
    title: 'Ver como invitado',
    desc:  'Ve cómo la verán tus invitados antes de compartir el link.',
  },
  {
    id:    'editor-v4-share-btn',
    label: 'Compartir',
    title: 'Comparte tu invitación',
    desc:  'Copia el link y envíalo por WhatsApp, Instagram o el medio que prefieras.',
  },
  {
    id:    'editor-v4-help-btn',
    label: 'Ayuda',
    title: 'Guía del editor',
    desc:  '¿Tienes dudas? Este botón abre la guía completa con todas las funciones explicadas.',
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

interface EditorTourProps {
  onClose:    () => void;
  sectionId?: string;
}

export function EditorTour({ onClose, sectionId }: EditorTourProps) {
  const activeSteps = sectionId ? (SECTION_TOUR_STEPS[sectionId] ?? STEPS) : STEPS;
  const [step,    setStep]    = useState(0);
  const [rect,    setRect]    = useState<Rect | null>(null);
  const [ttPos,   setTtPos]   = useState({ top: 0, left: 0 });
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updatePositions = useCallback((idx: number) => {
    const r = getRect(activeSteps[idx]?.id ?? '');
    if (!r) return;
    setRect(r);
    setTtPos(tooltipPos(r));
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

  function finish() {
    if (!sectionId && typeof localStorage !== 'undefined') {
      localStorage.setItem('kompralo_editor_tour_seen', '1');
    }
    onClose();
  }

  function next() {
    if (step < activeSteps.length - 1) {
      setStep((s) => s + 1);
    } else {
      finish();
    }
  }

  function prev() {
    if (step > 0) setStep((s) => s - 1);
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
    position:  'fixed',
    zIndex:    1001,
    top:       ttPos.top,
    left:      ttPos.left,
    width:     TT_W,
    background: '#FFFDF9',
    border:    '1px solid #E8DFC8',
    borderRadius: 14,
    padding:   20,
    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
    transition: `top ${EASE}, left ${EASE}`,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 10, fontWeight: 700, color: '#C9A96E',
    textTransform: 'uppercase', letterSpacing: '0.1em',
    marginBottom: 4,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 15, fontWeight: 700, color: '#1A1410', marginBottom: 6,
  };

  const descStyle: React.CSSProperties = {
    fontSize: 12, color: '#7B5E3A', lineHeight: 1.6, marginBottom: 16,
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

        {/* Label */}
        <p style={labelStyle}>{activeSteps[step].label}</p>

        {/* Title */}
        <p style={titleStyle}>{activeSteps[step].title}</p>

        {/* Desc */}
        <p style={descStyle}>{activeSteps[step].desc}</p>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: '#B0A090', fontWeight: 600 }}>
            {step + 1} / {activeSteps.length}
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              onClick={finish}
              style={{ ...btnBase, background: 'transparent', color: '#9B8878' }}
            >
              Saltar
            </button>
            {step > 0 && (
              <button
                type="button"
                onClick={prev}
                style={{ ...btnBase, background: '#EDE0CC', color: '#3D2B1F' }}
              >
                Atrás
              </button>
            )}
            <button
              type="button"
              onClick={next}
              style={{ ...btnBase, background: '#C9A96E', color: '#1A1410' }}
            >
              {step === STEPS.length - 1 ? '¡Listo!' : 'Siguiente'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
