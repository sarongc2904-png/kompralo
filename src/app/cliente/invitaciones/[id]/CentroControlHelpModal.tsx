'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface NavItem { id: string; icon: string; label: string; anchorId?: string }

const NAV: NavItem[] = [
  { id: 'resumen',         icon: '📊', label: 'Resumen',          anchorId: 'tour-header' },
  { id: 'countdown',       icon: '⏳', label: 'Cuenta regresiva' },
  { id: 'confirmaciones',  icon: '👥', label: 'Confirmaciones',   anchorId: 'tour-stats-row' },
  { id: 'confirmados',     icon: '✅', label: 'Confirmados',      anchorId: 'tour-tabla-confirmados' },
  { id: 'mis-invitados',   icon: '❤️', label: 'Mis invitados',   anchorId: 'tour-mis-invitados' },
  { id: 'pases',           icon: '🎫', label: 'Pases de entrada', anchorId: 'tour-btn-crear' },
  { id: 'compartir',       icon: '📤', label: 'Compartir',        anchorId: 'tour-mis-invitados' },
];

interface Block { header: string; items: string[] }
interface SectionHelp { title: string; steps?: string[]; blocks?: Block[] }

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

// ─── Mobile detection ────────────────────────────────────────────────────────

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    setMobile(mq.matches);
    const fn = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);
  return mobile;
}

// ─── Component ───────────────────────────────────────────────────────────────

interface Props { onClose: () => void }

export function CentroControlHelpModal({ onClose }: Props) {
  const [selected, setSelected] = useState<string>('resumen');
  const [mounted,  setMounted]  = useState(false);
  const isMobile  = useIsMobile();
  const help      = HELP[selected];
  const activeNav = NAV.find(n => n.id === selected);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(10,8,4,0.72)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        overflowY: 'auto',
        padding: isMobile ? 8 : 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Guía del Centro de Control"
        style={{
          background: '#FAF7F2',
          borderRadius: 16,
          width: '90vw',
          maxWidth: 860,
          height: isMobile ? '92vh' : '85vh',
          maxHeight: isMobile ? '92vh' : '85vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0,0,0,0.32)',
          margin: 'auto',
          marginTop: '2rem',
          marginBottom: '2rem',
        }}
      >
        {/* ── Header ── */}
        <div style={{
          background: '#1a1208',
          padding: isMobile ? '14px 16px' : '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <p style={{ fontSize: isMobile ? 14 : 15, fontWeight: 700, color: '#F5EDD8', margin: 0, marginBottom: 2 }}>
              Guía del Centro de Control
            </p>
            <p style={{ fontSize: 11, color: '#9B8878', margin: 0 }}>
              Selecciona una sección para ver cómo usarla
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => {
                onClose();
                setTimeout(() => {
                  window.dispatchEvent(new Event('kompralo:centro-control-tour-open'));
                }, 100);
              }}
              style={{
                background: '#C9A96E', color: '#1a1a1a',
                fontWeight: 600, borderRadius: '8px',
                padding: '0.5rem 1rem', border: 'none', cursor: 'pointer',
                fontSize: '0.85rem', fontFamily: 'inherit', whiteSpace: 'nowrap',
              }}
            >
              🎬 Ver tutorial completo
            </button>
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
        </div>

        {/* ── Body ── */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          overflow: 'hidden',
          minHeight: 0,
        }}>

          {/* Nav — desktop: left column | mobile: horizontal scroll tabs */}
          <div style={isMobile ? {
            flexShrink: 0,
            borderBottom: '1px solid rgba(200,167,93,0.15)',
            overflowX: 'auto',
            overflowY: 'hidden',
            background: '#F5F0E8',
            display: 'flex',
            flexDirection: 'row',
            WebkitOverflowScrolling: 'touch',
          } : {
            width: 200,
            flexShrink: 0,
            borderRight: '1px solid rgba(200,167,93,0.15)',
            overflowY: 'auto',
            background: '#F5F0E8',
          }}>
            {NAV.map((item) => {
              const active = item.id === selected;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelected(item.id)}
                  style={isMobile ? {
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '9px 13px',
                    border: 'none',
                    borderBottom: `3px solid ${active ? '#C9A96E' : 'transparent'}`,
                    background: active ? '#FFF8EE' : 'transparent',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    transition: 'background 0.15s',
                  } : {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '11px 14px',
                    border: 'none',
                    borderLeft: `3px solid ${active ? '#C9A96E' : 'transparent'}`,
                    background: active ? '#FFF8EE' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                    flexShrink: 0,
                    transition: 'background 0.15s',
                  }}
                >
                  <span style={{ fontSize: isMobile ? 14 : 15, flexShrink: 0, lineHeight: 1 }}>{item.icon}</span>
                  <span style={{
                    fontSize: isMobile ? 11 : 12,
                    fontWeight: active ? 600 : 400,
                    color: active ? '#8B5E00' : '#5C4A3E',
                    lineHeight: 1.3,
                  }}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Content panel */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: isMobile ? '14px 16px 20px' : '20px 20px 24px',
            minWidth: 0,
          }}>

            <p style={{ fontSize: 15, fontWeight: 600, color: '#1A1410', margin: '0 0 16px' }}>
              {help.title}
            </p>

            {/* Numbered steps */}
            {help.steps && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
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
                      <p style={{ fontSize: isMobile ? 12 : 13, color: '#5C4A3E', lineHeight: 1.65, flex: 1, margin: 0 }}>
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

            {/* Blocks (Pases de entrada) */}
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
                    <div>
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
                            <p style={{ fontSize: isMobile ? 11.5 : 12.5, color: '#5C4A3E', lineHeight: 1.65, flex: 1, margin: 0 }}>
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

            {/* Ver en mi panel */}
            {activeNav?.anchorId && (
              <button
                type="button"
                onClick={() => {
                  const targetId = activeNav.anchorId!;
                  onClose();
                  setTimeout(() => {
                    const el = document.getElementById(targetId);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      el.style.transition = 'box-shadow 0.3s ease';
                      el.style.boxShadow = '0 0 0 4px rgba(201,169,110,0.6)';
                      setTimeout(() => { el.style.boxShadow = ''; }, 2500);
                    }
                  }, 200);
                }}
                style={{
                  marginTop: '1.5rem',
                  background: '#C9A96E',
                  color: '#1a1a1a',
                  padding: '0.6rem 1.2rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontFamily: 'inherit',
                }}
              >
                👀 Ver en mi panel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  , document.body);
}
