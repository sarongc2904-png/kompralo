'use client';

import React, { useEffect, useState } from 'react';

interface NavItem {
  id:   string;
  icon: string;
  label: string;
}

const NAV: NavItem[] = [
  { id: 'resumen',         icon: '📊', label: 'Resumen' },
  { id: 'countdown',      icon: '⏳', label: 'Cuenta regresiva' },
  { id: 'confirmaciones', icon: '👥', label: 'Confirmaciones' },
  { id: 'confirmados',    icon: '✅', label: 'Invitados confirmados' },
  { id: 'mis-invitados',  icon: '❤️', label: 'Mis invitados' },
  { id: 'pases',          icon: '🎫', label: 'Pases de entrada' },
  { id: 'compartir',      icon: '📤', label: 'Compartir' },
];

interface Block { header: string; items: string[] }

interface SectionHelp {
  title:   string;
  steps?:  string[];
  blocks?: Block[];
}

const HELP: Record<string, SectionHelp> = {
  resumen: {
    title: 'Resumen',
    steps: [
      'Aquí ves el nombre de tu boda, fecha y accesos rápidos.',
      '"Ver invitación" previsualiza tu invitación como invitado.',
      '"Compartir enlace" copia el link para enviar por WhatsApp.',
      '"Estadísticas" muestra cuántas veces han abierto tu invitación.',
    ],
  },
  countdown: {
    title: 'Cuenta regresiva',
    steps: [
      'Muestra los días que faltan para tu boda.',
      'Se actualiza automáticamente cada día.',
      'La imagen de tu invitación aparece a la derecha.',
    ],
  },
  confirmaciones: {
    title: 'Confirmaciones',
    steps: [
      'Ve cuántos invitados confirmaron, declinaron y el total.',
      'Los números se actualizan en tiempo real.',
    ],
  },
  confirmados: {
    title: 'Invitados confirmados',
    steps: [
      'Lista de todos los que ya respondieron.',
      '"Ver pase" muestra el pase QR de cada invitado.',
      '"Ver código QR" genera el QR general para la entrada.',
    ],
  },
  'mis-invitados': {
    title: 'Mis invitados',
    steps: [
      'Administra tu lista completa de invitados.',
      '"+ Crear invitado" para agregar nuevos.',
      'Filtra por Pendientes, Confirmados o Sin WhatsApp.',
      'Desde ACCIONES envía la invitación por WhatsApp a cada invitado.',
    ],
  },
  pases: {
    title: 'Pases de entrada',
    blocks: [
      {
        header: 'PASE PERSONALIZADO POR FAMILIA',
        items: [
          'Cada familia invitada recibe un pase QR único con su nombre.',
          'Al escanearlo en la entrada, confirma quién es el invitado.',
          'Se genera automáticamente al crear un invitado.',
          'Accede desde ACCIONES → "Ver pase" en la tabla de Mis Invitados.',
        ],
      },
      {
        header: 'PASE DE CONFIRMACIÓN DE ASISTENCIA',
        items: [
          'Se genera cuando el invitado confirma su asistencia en la invitación digital.',
          'Aparece en la tabla "Invitados confirmados".',
          'Accede desde la columna PASE → "Ver pase".',
          'Incluye nombre, número de acompañantes y asistentes.',
        ],
      },
      {
        header: 'VERIFICAR EN LA PUERTA',
        items: [
          'Usa "Ver código QR" para el escáner general de entrada.',
          'Escanea el pase del invitado para validar su acceso.',
        ],
      },
    ],
  },
  compartir: {
    title: 'Compartir',
    steps: [
      '"Compartir por WhatsApp" abre WhatsApp con el link listo.',
      '"Copiar link" copia el link al portapapeles.',
      'Comparte el link con todos tus invitados para que abran su invitación personalizada.',
    ],
  },
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const CSS = `
.cchm-dialog {
  background: #FAF7F2;
  border-radius: 16px;
  width: 100%;
  max-width: 580px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(0,0,0,0.32);
}
.cchm-body {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}
.cchm-nav {
  width: 152px;
  flex-shrink: 0;
  border-right: 1px solid rgba(200,167,93,0.15);
  overflow-y: auto;
  background: #F5F0E8;
}
.cchm-nav-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-left: 3px solid transparent;
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;
  font-family: inherit;
  flex-shrink: 0;
}
.cchm-nav-btn[data-active="true"] {
  border-left-color: #C9A96E;
  background: #FFF8EE;
}
.cchm-nav-label {
  font-size: 12px;
  font-weight: 400;
  color: #5C4A3E;
  line-height: 1.3;
}
.cchm-nav-btn[data-active="true"] .cchm-nav-label {
  font-weight: 600;
  color: #8B5E00;
}
.cchm-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 20px 24px;
  min-width: 0;
}

@media (max-width: 640px) {
  .cchm-dialog {
    width: 90vw;
    max-height: 80vh;
  }
  .cchm-body {
    flex-direction: column;
    overflow: hidden;
  }
  .cchm-nav {
    width: 100%;
    height: auto;
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    border-right: none;
    border-bottom: 1px solid rgba(200,167,93,0.15);
    display: flex;
    flex-direction: row;
    flex-shrink: 0;
  }
  .cchm-nav-btn {
    display: inline-flex;
    width: auto;
    padding: 10px 14px;
    border-left: none;
    border-bottom: 3px solid transparent;
  }
  .cchm-nav-btn[data-active="true"] {
    border-left-color: transparent;
    border-bottom-color: #C9A96E;
  }
  .cchm-content {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 14px 14px 18px;
  }
  .cchm-step-text {
    font-size: 12px !important;
  }
  .cchm-block-text {
    font-size: 11.5px !important;
  }
}
`;

// ─── Component ────────────────────────────────────────────────────────────────

interface Props { onClose: () => void }

export function CentroControlHelpModal({ onClose }: Props) {
  const [selected, setSelected] = useState<string>('resumen');

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const help = HELP[selected];

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(10,8,4,0.72)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Guía del Centro de Control"
        className="cchm-dialog"
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
            <p style={{ fontSize: 15, fontWeight: 700, color: '#F5EDD8', margin: 0, marginBottom: 2 }}>
              Guía del Centro de Control
            </p>
            <p style={{ fontSize: 11, color: '#9B8878', margin: 0 }}>
              Selecciona una sección para ver cómo usarla
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar guía"
            style={{
              width: 30, height: 30, borderRadius: '50%',
              border: '1px solid rgba(200,167,93,0.25)',
              background: 'rgba(200,167,93,0.1)',
              color: '#C5A880', fontSize: 18, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              lineHeight: 1, flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>

        {/* Body: nav + content */}
        <div className="cchm-body">

          {/* Nav (desktop: left column | mobile: top tab bar) */}
          <div className="cchm-nav">
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelected(item.id)}
                className="cchm-nav-btn"
                data-active={String(item.id === selected)}
              >
                <span style={{ fontSize: 13, flexShrink: 0 }}>{item.icon}</span>
                <span className="cchm-nav-label">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Content panel */}
          <div className="cchm-content">

            <p style={{ fontSize: 15, fontWeight: 600, color: '#1A1410', margin: '0 0 16px' }}>
              {help.title}
            </p>

            {/* Numbered steps */}
            {help.steps && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {help.steps.map((step, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '9px 0' }}>
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
                      <p className="cchm-step-text" style={{ fontSize: 13, color: '#5C4A3E', lineHeight: 1.6, flex: 1, margin: 0 }}>
                        {step}
                      </p>
                    </div>
                    {i < help.steps!.length - 1 && (
                      <div style={{ height: 1, background: 'rgba(200,167,93,0.1)', marginLeft: 34 }} />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Blocks (for Pases de entrada) */}
            {help.blocks && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {help.blocks.map((block, bi) => (
                  <div key={bi}>
                    <p style={{
                      fontSize: 10, fontWeight: 700, color: '#C9A96E',
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                      margin: '0 0 10px',
                    }}>
                      {block.header}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                      {block.items.map((item, ii) => (
                        <div key={ii}>
                          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '7px 0' }}>
                            <div style={{
                              width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                              background: 'rgba(200,167,93,0.12)',
                              border: '1px solid rgba(200,167,93,0.35)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 9, fontWeight: 700, color: '#C9A96E',
                              marginTop: 1,
                            }}>
                              {ii + 1}
                            </div>
                            <p className="cchm-block-text" style={{ fontSize: 12.5, color: '#5C4A3E', lineHeight: 1.6, flex: 1, margin: 0 }}>
                              {item}
                            </p>
                          </div>
                          {ii < block.items.length - 1 && (
                            <div style={{ height: 1, background: 'rgba(200,167,93,0.08)', marginLeft: 30 }} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
