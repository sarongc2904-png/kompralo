'use client';

import React, { useEffect } from 'react';

interface EditorHelpModalProps {
  onClose: () => void;
}

interface SectionItem {
  icon:  string;
  name:  string;
  desc:  string;
  plan?: 'premium' | 'deluxe';
}

const SECTIONS: SectionItem[] = [
  { icon: '💍', name: 'Portada',            desc: 'Nombres, fecha, lugar, foto de fondo, video y música.' },
  { icon: '🎬', name: 'Intro',              desc: 'Título de bienvenida y botón animado para abrir la invitación.' },
  { icon: '⏳', name: 'Cuenta regresiva',   desc: 'Se actualiza automáticamente con la fecha que configures en Portada.' },
  { icon: '📖', name: 'Nuestra historia',   desc: 'Hasta 10 momentos con texto, foto y fecha cada uno.',           plan: 'premium' },
  { icon: '🖼',  name: 'Galería',            desc: 'Sube hasta 20 fotos desde tu dispositivo.',                     plan: 'premium' },
  { icon: '📍', name: 'Ubicación',          desc: 'Links de Google Maps y Waze; textos editables al tocar.' },
  { icon: '👗', name: 'Código de vestimenta', desc: 'Tipo de dress code y paleta de colores (máx 6).' },
  { icon: '👨‍👩‍👧', name: 'Familias',           desc: 'Nombres de los padres de los novios.',                         plan: 'deluxe' },
  { icon: '⭐', name: 'Padrinos',           desc: 'Categorías editables: rubro, ícono y lista de nombres.',         plan: 'deluxe' },
  { icon: '🎁', name: 'Mesa de regalos',    desc: 'Links de tiendas y datos bancarios editables al tocar.' },
  { icon: '💌', name: 'Mensaje final',      desc: 'Texto de cierre y foto de fondo.' },
];

const PLAN_STYLE: Record<string, React.CSSProperties> = {
  premium: { background: '#EDE8FF', color: '#5340A8' },
  deluxe:  { background: '#FFF3DC', color: '#8B5E00' },
};

const PLAN_LABEL: Record<string, string> = {
  premium: 'Premium',
  deluxe:  'Deluxe',
};

export function EditorHelpModal({ onClose }: EditorHelpModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const head: React.CSSProperties = {
    fontSize: 10, fontWeight: 700, color: '#9B8878',
    textTransform: 'uppercase', letterSpacing: '0.09em',
    margin: '20px 0 10px',
  };

  const tip: React.CSSProperties = {
    background: 'rgba(200,167,93,0.08)',
    border: '1px solid rgba(200,167,93,0.22)',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 12,
    color: '#7B5E3A',
    lineHeight: 1.55,
    marginBottom: 10,
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(10,8,4,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
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
          maxWidth: 480,
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
        }}
      >
        {/* Header */}
        <div style={{
          background: '#1a1208',
          padding: '18px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#F5EDD8', marginBottom: 2 }}>
              Guía del editor
            </p>
            <p style={{ fontSize: 11, color: '#9B8878' }}>Editor V4 · KOMPRALO</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar guía"
            style={{
              width: 32, height: 32, borderRadius: '50%',
              border: '1px solid rgba(200,167,93,0.25)',
              background: 'rgba(200,167,93,0.1)',
              color: '#C5A880', fontSize: 16,
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 20px' }}>

          {/* Cómo funciona */}
          <p style={head}>Cómo funciona</p>
          <div style={tip}>
            Toca cualquier texto en la invitación (nombres, fechas, frases) para editarlo al instante. Sin formularios, sin guardar manualmente.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 4 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>📋</span>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#1A1410', marginBottom: 2 }}>Panel de secciones</p>
                <p style={{ fontSize: 11, color: '#9B8878', lineHeight: 1.5 }}>
                  El panel izquierdo lista todas las secciones de tu invitación. Haz clic para navegar y ver las opciones de edición.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>🎛️</span>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#1A1410', marginBottom: 2 }}>Inspector</p>
                <p style={{ fontSize: 11, color: '#9B8878', lineHeight: 1.5 }}>
                  El panel derecho muestra controles para fotos, videos, colores y links — cosas que no son texto simple.
                </p>
              </div>
            </div>
          </div>

          {/* Secciones */}
          <p style={head}>Secciones disponibles</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {SECTIONS.map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '9px 10px', borderRadius: 8,
                background: i % 2 === 0 ? 'rgba(200,167,93,0.04)' : 'transparent',
              }}>
                <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{s.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#1A1410' }}>{s.name}</span>
                    {s.plan && (
                      <span style={{
                        fontSize: 9, fontWeight: 700, padding: '1px 6px',
                        borderRadius: 4, letterSpacing: '0.04em',
                        ...PLAN_STYLE[s.plan],
                      }}>
                        {PLAN_LABEL[s.plan]}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 11, color: '#9B8878', lineHeight: 1.4 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Compartir */}
          <p style={head}>Compartir tu invitación</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>↗</span>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#1A1410', marginBottom: 2 }}>Vista previa</p>
                <p style={{ fontSize: 11, color: '#9B8878', lineHeight: 1.4 }}>
                  Ve exactamente cómo la verán tus invitados antes de compartirla.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>🔗</span>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#1A1410', marginBottom: 2 }}>Compartir</p>
                <p style={{ fontSize: 11, color: '#9B8878', lineHeight: 1.4 }}>
                  Copia el link y envíalo por WhatsApp, Instagram o el medio que prefieras.
                </p>
              </div>
            </div>
          </div>
          <div style={tip}>
            Los cambios se reflejan automáticamente. No necesitas reenviar el link cada vez que editas.
          </div>
        </div>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid rgba(200,167,93,0.15)',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          background: '#FAF7F2',
        }}>
          <span style={{ fontSize: 11, color: '#B0A090' }}>¿Más dudas? kompralo.com.mx</span>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '7px 18px', borderRadius: 8, border: 'none',
              background: 'rgba(200,167,93,0.85)', color: '#1A1410',
              fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
