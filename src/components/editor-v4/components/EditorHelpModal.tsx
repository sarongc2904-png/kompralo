'use client';

import React, { useEffect, useState } from 'react';

interface EditorHelpModalProps {
  onClose:            () => void;
  onNavigate:         (sectionId: string) => void;
  onStartSectionTour: (sectionId: string) => void;
}

// ─── Section list ─────────────────────────────────────────────────────────────

interface NavItem {
  id:    string;
  icon:  string;
  label: string;
  plan?: 'Premium' | 'Deluxe';
}

const NAV: NavItem[] = [
  { id: 'portada',    icon: '💍', label: 'Portada' },
  { id: 'intro',      icon: '🎬', label: 'Intro' },
  { id: 'countdown',  icon: '⏳', label: 'Cuenta regresiva' },
  { id: 'story',      icon: '📖', label: 'Historia' },
  { id: 'gallery',    icon: '🖼',  label: 'Galería',          plan: 'Premium' },
  { id: 'location',   icon: '📍', label: 'Ubicación' },
  { id: 'dresscode',  icon: '👗', label: 'Vestimenta' },
  { id: 'parents',    icon: '👨‍👩‍👧', label: 'Familias',         plan: 'Deluxe' },
  { id: 'godparents', icon: '⭐', label: 'Padrinos',          plan: 'Deluxe' },
  { id: 'gifts',      icon: '🎁', label: 'Mesa de regalos' },
  { id: 'message',    icon: '💌', label: 'Mensaje final' },
];

// ─── Section help content ─────────────────────────────────────────────────────

interface SectionHelp {
  title:         string;
  steps:         string[];
  tourSectionId: string;
}

const SECTION_HELP: Record<string, SectionHelp> = {
  portada: {
    title: 'Portada',
    tourSectionId: 'hero',
    steps: [
      'Toca el nombre de la novia o el novio directamente en la invitación para editarlo.',
      'Para cambiar la fecha, abre el inspector → sección "Fecha y lugar".',
      'Para cambiar foto o video de fondo, inspector → sección "Fondo".',
      'La música se configura en inspector → sección "Música".',
    ],
  },
  intro: {
    title: 'Intro Cinematográfico',
    tourSectionId: 'intro',
    steps: [
      'Toca el título o el texto del botón directamente en la pantalla de intro.',
      'El inspector de Intro permite editar el título, subtítulo y texto del botón.',
    ],
  },
  countdown: {
    title: 'Cuenta Regresiva',
    tourSectionId: 'countdown',
    steps: [
      'La cuenta regresiva se actualiza automáticamente con la fecha que configures en Portada.',
      'No necesitas editar nada aquí — solo asegúrate de tener la fecha correcta en Portada.',
    ],
  },
  story: {
    title: 'Historia',
    tourSectionId: 'story',
    steps: [
      'La sección Historia tiene 3 momentos. Haz clic en "Historia" en el panel izquierdo.',
      'En el inspector verás "Momento 1", "Momento 2" y "Momento 3" — expande cada uno.',
      'Edita el texto de cada momento y sube una foto tocando "Cambiar foto".',
      'El título de la sección se edita tocando directamente el texto en la invitación.',
    ],
  },
  gallery: {
    title: 'Galería',
    tourSectionId: 'gallery',
    steps: [
      'Haz clic en "Galería" en el panel izquierdo para abrir el inspector.',
      'Toca "+ Agregar foto" para subir una imagen desde tu teléfono o computadora.',
      'Para eliminar una foto, toca la ✕ en la esquina de cada imagen.',
      'Puedes agregar hasta 20 fotos.',
    ],
  },
  location: {
    title: 'Ubicación',
    tourSectionId: 'location',
    steps: [
      'El nombre del lugar y la dirección se editan tocando el texto directamente.',
      'Para agregar Google Maps: abre el inspector → pega el link de Maps → Guardar.',
      'Para agregar Waze: igual, pega el link de Waze en el inspector.',
    ],
  },
  dresscode: {
    title: 'Código de Vestimenta',
    tourSectionId: 'dresscode',
    steps: [
      'El tipo de vestimenta (Formal, Semi-formal, etc.) se edita tocando el texto.',
      'La descripción y sugerencias también se editan tocando el texto.',
      'Para cambiar los colores de la paleta, abre el inspector → usa el selector de color.',
    ],
  },
  parents: {
    title: 'Familias',
    tourSectionId: 'parents',
    steps: [
      'Los nombres de los padres se editan tocando directamente el texto en la invitación.',
      'Esta sección requiere Plan Deluxe.',
    ],
  },
  godparents: {
    title: 'Padrinos',
    tourSectionId: 'godparents',
    steps: [
      'Abre el inspector de Padrinos para ver todas las categorías.',
      'Puedes editar el rubro, los nombres, agregar nuevas categorías o eliminarlas.',
      'Presiona "Guardar todo" cuando termines.',
      'Esta sección requiere Plan Deluxe.',
    ],
  },
  gifts: {
    title: 'Mesa de Regalos',
    tourSectionId: 'gifts',
    steps: [
      'Toca el nombre de la tienda directamente en la invitación para editarlo.',
      'El link de la tienda y los datos bancarios también se editan tocando el texto.',
    ],
  },
  message: {
    title: 'Mensaje Final',
    tourSectionId: 'message',
    steps: [
      'El título y el mensaje se editan tocando directamente el texto.',
      'Para cambiar la foto de fondo, abre el inspector → sube una foto.',
    ],
  },
};

const PLAN_STYLE: Record<string, React.CSSProperties> = {
  Premium: { background: '#EDE8FF', color: '#5340A8' },
  Deluxe:  { background: '#FFF3DC', color: '#8B5E00' },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function EditorHelpModal({ onClose, onNavigate, onStartSectionTour }: EditorHelpModalProps) {
  const [selected, setSelected] = useState<string>('portada');

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const help = SECTION_HELP[selected];

  function handleShowInEditor() {
    onClose();
    onNavigate(help.tourSectionId);
    onStartSectionTour(help.tourSectionId);
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(10,8,4,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Guía del editor"
        style={{
          background: '#FAF7F2',
          borderRadius: 16,
          width: '100%',
          maxWidth: 580,
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0,0,0,0.32)',
        }}
      >
        {/* Header */}
        <div style={{
          background: '#1a1208',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#F5EDD8', marginBottom: 1 }}>
              Guía del editor
            </p>
            <p style={{ fontSize: 11, color: '#9B8878' }}>Selecciona una sección para ver cómo editarla</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar guía"
            style={{
              width: 30, height: 30, borderRadius: '50%',
              border: '1px solid rgba(200,167,93,0.25)',
              background: 'rgba(200,167,93,0.1)',
              color: '#C5A880', fontSize: 16, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>

        {/* Two-column body */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

          {/* Left nav */}
          <div style={{
            width: 148,
            flexShrink: 0,
            borderRight: '1px solid rgba(200,167,93,0.15)',
            overflowY: 'auto',
            background: '#F5F0E8',
          }}>
            {NAV.map((item) => {
              const isActive = item.id === selected;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelected(item.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    width: '100%',
                    padding: '9px 12px',
                    border: 'none',
                    borderLeft: isActive ? '3px solid #C9A96E' : '3px solid transparent',
                    background: isActive ? '#FFF8EE' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s',
                    fontFamily: 'inherit',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13 }}>{item.icon}</span>
                    <span style={{
                      fontSize: 12,
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? '#8B5E00' : '#5C4A3E',
                    }}>
                      {item.label}
                    </span>
                  </div>
                  {item.plan && (
                    <span style={{
                      marginTop: 3,
                      marginLeft: 19,
                      fontSize: 9,
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: 4,
                      letterSpacing: '0.03em',
                      ...PLAN_STYLE[item.plan],
                    }}>
                      {item.plan}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right panel */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 12px' }}>

              {/* Section title */}
              <p style={{ fontSize: 16, fontWeight: 500, color: '#1A1410', marginBottom: 18 }}>
                {help.title}
              </p>

              {/* Steps */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {help.steps.map((step, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 0' }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                        background: 'rgba(200,167,93,0.15)',
                        border: '1px solid rgba(200,167,93,0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 700, color: '#C9A96E',
                        marginTop: 1,
                      }}>
                        {i + 1}
                      </div>
                      <p style={{ fontSize: 13, color: '#5C4A3E', lineHeight: 1.6, flex: 1 }}>
                        {step}
                      </p>
                    </div>
                    {i < help.steps.length - 1 && (
                      <div style={{ height: 1, background: 'rgba(200,167,93,0.1)', marginLeft: 34 }} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Show in editor button */}
            <div style={{
              padding: '12px 20px 16px',
              borderTop: '1px solid rgba(200,167,93,0.15)',
              flexShrink: 0,
            }}>
              <button
                type="button"
                onClick={handleShowInEditor}
                style={{
                  width: '100%',
                  padding: '10px 0',
                  borderRadius: 9,
                  border: 'none',
                  background: '#1a1208',
                  color: '#C9A96E',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  letterSpacing: '0.02em',
                }}
              >
                ✦ Mostrar en el editor
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
