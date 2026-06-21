'use client';

import { useEffect, useRef, useState } from 'react';
import type { AssistantApiResponse } from '@/features/virtual-assistant/types';
import {
  ASSISTANT_CATEGORIES,
  DASHBOARD_ASSISTANT_PROMPT_OPTIONS,
  buildDashboardAssistantPrompt,
  cleanGeneratedText,
} from './dashboardAssistantPrompts';
import type { AssistantCategory } from './dashboardAssistantPrompts';
import type {
  AssistantLength,
  AssistantTone,
  DashboardAssistantStatus,
  InvitationAssistantContext,
} from './types';

interface DashboardAssistantPanelProps {
  invitationContext: InvitationAssistantContext;
  pathname?: string;
  onClose: () => void;
}

async function requestGeneratedText(message: string, pathname?: string): Promise<string> {
  const response = await fetch('/api/assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, pageContext: { pathname } }),
  });
  if (!response.ok) throw new Error('dashboard_assistant_api_failed');
  const data = (await response.json()) as AssistantApiResponse;
  if (!data?.answer?.trim()) throw new Error('dashboard_assistant_empty_response');
  return cleanGeneratedText(data.answer.trim());
}

const TONE_OPTIONS: { value: AssistantTone; label: string }[] = [
  { value: 'elegant',   label: 'Elegante'   },
  { value: 'romantic',  label: 'Romántico'  },
  { value: 'formal',    label: 'Formal'     },
  { value: 'emotional', label: 'Emotivo'    },
  { value: 'modern',    label: 'Moderno'    },
  { value: 'religious', label: 'Religioso'  },
  { value: 'fun',       label: 'Divertido'  },
  { value: 'brief',     label: 'Breve'      },
];

const LENGTH_OPTIONS: { value: AssistantLength; label: string }[] = [
  { value: 'short',  label: 'Corto'  },
  { value: 'medium', label: 'Medio'  },
  { value: 'long',   label: 'Largo'  },
];

export function DashboardAssistantPanel({
  invitationContext,
  pathname,
  onClose,
}: DashboardAssistantPanelProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const responseRef    = useRef<HTMLDivElement>(null);

  const [status,          setStatus]          = useState<DashboardAssistantStatus>('idle');
  const [selectedId,      setSelectedId]      = useState<string | null>(null);
  const [generatedText,   setGeneratedText]   = useState<string | null>(null);
  const [activeCategory,  setActiveCategory]  = useState<AssistantCategory>(ASSISTANT_CATEGORIES[0]);
  const [tone,            setTone]            = useState<AssistantTone>('elegant');
  const [length,          setLength]          = useState<AssistantLength>('medium');

  useEffect(() => { closeButtonRef.current?.focus(); }, []);

  useEffect(() => {
    if (status === 'generated' || status === 'copied' || status === 'copy_error') {
      responseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [status]);

  const visibleOptions = DASHBOARD_ASSISTANT_PROMPT_OPTIONS.filter(
    (o) => o.category === activeCategory,
  );

  async function generate(promptId: string, overrideTone?: AssistantTone) {
    const activeTone = overrideTone ?? tone;
    setSelectedId(promptId);
    setStatus('generating');
    setGeneratedText(null);

    try {
      const prompt = buildDashboardAssistantPrompt({
        promptId,
        context: invitationContext,
        tone:    activeTone,
        length,
      });
      const text = await requestGeneratedText(prompt, pathname);
      setGeneratedText(text);
      setStatus('generated');
    } catch {
      setStatus('error');
    }
  }

  async function copyText() {
    if (!generatedText) return;
    try {
      await navigator.clipboard.writeText(generatedText);
      setStatus('copied');
    } catch {
      setStatus('copy_error');
    }
  }

  const isGenerating = status === 'generating';
  const hasResponse  = status === 'generated' || status === 'copied' || status === 'copy_error';
  const selectedOption = DASHBOARD_ASSISTANT_PROMPT_OPTIONS.find((o) => o.id === selectedId);

  // ── Pill style helpers ────────────────────────────────────────────────────

  function toneStyle(v: AssistantTone) {
    const active = v === tone;
    return {
      padding: '5px 11px',
      borderRadius: '999px',
      border: `1px solid ${active ? '#C5A880' : '#E8E2DA'}`,
      background: active ? '#1A1410' : '#FFFFFF',
      color: active ? '#F5EDD8' : '#7C6A5C',
      cursor: 'pointer',
      fontSize: '0.72rem',
      fontWeight: active ? 700 : 500,
      whiteSpace: 'nowrap' as const,
      transition: 'all 0.15s',
    };
  }

  function lengthStyle(v: AssistantLength) {
    const active = v === length;
    return {
      padding: '5px 11px',
      borderRadius: '999px',
      border: `1px solid ${active ? '#C5A880' : '#E8E2DA'}`,
      background: active ? '#1A1410' : '#FFFFFF',
      color: active ? '#F5EDD8' : '#7C6A5C',
      cursor: 'pointer',
      fontSize: '0.72rem',
      fontWeight: active ? 700 : 500,
      whiteSpace: 'nowrap' as const,
      transition: 'all 0.15s',
    };
  }

  return (
    <aside
      aria-label="Asistente de textos"
      style={{
        position: 'fixed',
        right: '16px',
        bottom: '88px',
        zIndex: 1040,
        width: 'min(460px, calc(100vw - 24px))',
        maxHeight: 'min(82vh, 720px)',
        background: '#FFFFFF',
        border: '1px solid #E8E2DA',
        borderRadius: '16px',
        boxShadow: '0 18px 55px rgba(26,20,16,0.22)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header style={{
        flexShrink: 0,
        padding: '14px 16px',
        background: '#1A1410',
        color: '#F7EFE2',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '12px',
      }}>
        <div>
          <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700 }}>
            Asistente de textos
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#D9C7A5' }}>
            Genera textos listos para copiar en tu invitación
          </p>
        </div>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Cerrar asistente"
          style={{
            width: '28px', height: '28px', borderRadius: '999px',
            border: '1px solid rgba(245,237,216,0.28)', background: 'transparent',
            color: '#F5EDD8', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, flexShrink: 0,
          }}
        >
          ×
        </button>
      </header>

      {/* ── Scrollable body ─────────────────────────────────────────────────── */}
      <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* ── Tone + Length selectors ─────────────────────────────────────── */}
        <div style={{ padding: '12px 14px 0', borderBottom: '1px solid #F0EBE4' }}>
          <div style={{ marginBottom: '8px' }}>
            <p style={{ margin: '0 0 5px', fontSize: '0.68rem', color: '#B0A090', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
              Tono
            </p>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {TONE_OPTIONS.map((t) => (
                <button key={t.value} type="button" style={toneStyle(t.value)}
                  onClick={() => setTone(t.value)}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <p style={{ margin: '0 0 5px', fontSize: '0.68rem', color: '#B0A090', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
              Extensión
            </p>
            <div style={{ display: 'flex', gap: '5px' }}>
              {LENGTH_OPTIONS.map((l) => (
                <button key={l.value} type="button" style={lengthStyle(l.value)}
                  onClick={() => setLength(l.value)}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Category tabs ───────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', gap: '0', overflowX: 'auto', padding: '0 14px',
          borderBottom: '1px solid #F0EBE4', flexShrink: 0,
          scrollbarWidth: 'none',
        }}>
          {ASSISTANT_CATEGORIES.map((cat) => {
            const active = cat === activeCategory;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '9px 10px',
                  border: 'none',
                  borderBottom: active ? '2px solid #C5A880' : '2px solid transparent',
                  background: 'transparent',
                  color: active ? '#1A1410' : '#9B8878',
                  cursor: 'pointer',
                  fontSize: '0.72rem',
                  fontWeight: active ? 700 : 500,
                  whiteSpace: 'nowrap',
                  transition: 'color 0.15s',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* ── Prompt cards ────────────────────────────────────────────────── */}
        <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {visibleOptions.map((option) => {
            const isSelected   = selectedId === option.id;
            const isThisActive = isSelected && isGenerating;

            return (
              <button
                key={option.id}
                type="button"
                disabled={isGenerating}
                aria-pressed={isSelected}
                aria-label={`Generar: ${option.title}`}
                onClick={() => generate(option.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: `1.5px solid ${isSelected ? '#C5A880' : '#E8E2DA'}`,
                  background: isSelected ? '#FDF8F2' : '#FFFFFF',
                  cursor: isGenerating ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '8px',
                  transition: 'border-color 0.15s, background 0.15s',
                  opacity: isGenerating && !isSelected ? 0.55 : 1,
                }}
                onMouseEnter={(e) => {
                  if (isGenerating || isSelected) return;
                  e.currentTarget.style.borderColor = '#C5A880';
                  e.currentTarget.style.background  = '#FCFAF6';
                }}
                onMouseLeave={(e) => {
                  if (isGenerating || isSelected) return;
                  e.currentTarget.style.borderColor = '#E8E2DA';
                  e.currentTarget.style.background  = '#FFFFFF';
                }}
              >
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#1A1410', lineHeight: 1.25 }}>
                    {option.title}
                  </span>
                  <span style={{ display: 'block', marginTop: '2px', fontSize: '0.72rem', color: '#7C6A5C', lineHeight: 1.3 }}>
                    {option.description}
                  </span>
                </span>
                <span style={{
                  flexShrink: 0,
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: isSelected ? '#C5A880' : '#B0A090',
                  paddingTop: '2px',
                  whiteSpace: 'nowrap',
                }}>
                  {isThisActive ? 'Generando…' : isSelected ? '✓ Usar' : 'Generar →'}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Response area ───────────────────────────────────────────────── */}
        <div
          ref={responseRef}
          aria-live="polite"
          style={{ padding: '0 14px 14px', borderTop: '1px solid #F0EBE4' }}
        >

          {status === 'idle' && (
            <p style={{ margin: '12px 0 0', fontSize: '0.76rem', color: '#B0A090', textAlign: 'center', lineHeight: 1.45 }}>
              Selecciona una opción para generar el texto.
            </p>
          )}

          {status === 'generating' && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px', marginTop: '12px',
              background: '#FAF6F0', border: '1px solid #EFE8DF', borderRadius: '10px',
            }}>
              <span style={{
                display: 'inline-block', width: '13px', height: '13px', borderRadius: '50%',
                border: '2px solid #C5A880', borderTopColor: 'transparent',
                animation: 'da-spin 0.7s linear infinite', flexShrink: 0,
              }} />
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#7C6A5C', fontWeight: 600 }}>
                Generando texto…
              </p>
              <style>{`@keyframes da-spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {status === 'error' && (
            <div style={{
              padding: '12px', marginTop: '12px',
              background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px',
            }}>
              <p style={{ margin: '0 0 6px', fontSize: '0.8rem', color: '#991B1B', fontWeight: 600 }}>
                No se pudo generar el texto
              </p>
              <p style={{ margin: '0 0 10px', fontSize: '0.74rem', color: '#B91C1C', lineHeight: 1.4 }}>
                Ocurrió un error. Intenta de nuevo en unos segundos.
              </p>
              {selectedId && (
                <button type="button" onClick={() => generate(selectedId)}
                  style={{
                    border: '1px solid #FECACA', borderRadius: '999px', padding: '5px 12px',
                    background: '#FFFFFF', color: '#991B1B', cursor: 'pointer',
                    fontSize: '0.74rem', fontWeight: 700,
                  }}>
                  Intentar de nuevo
                </button>
              )}
            </div>
          )}

          {hasResponse && generatedText && (
            <div style={{ marginTop: '12px' }}>
              <p style={{ margin: '0 0 6px', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9B8878' }}>
                Texto generado · {selectedOption?.title}
              </p>

              <div style={{
                whiteSpace: 'pre-wrap', color: '#1A1410', fontSize: '0.8rem', lineHeight: 1.65,
                background: '#FCFAF6', border: '1px solid #E8E2DA', borderRadius: '10px',
                padding: '12px', maxHeight: '180px', overflowY: 'auto',
              }}>
                {generatedText}
              </div>

              <p style={{ margin: '6px 0 8px', fontSize: '0.72rem', color: '#9B8878' }}>
                Texto generado. Puedes copiarlo o ajustarlo antes de usarlo.
              </p>

              {/* Primary actions */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button type="button" onClick={copyText} style={{
                  border: 'none', borderRadius: '999px', padding: '7px 14px',
                  background: status === 'copied' ? '#2F6B3C' : '#1A1410',
                  color: '#F5EDD8', cursor: 'pointer', fontSize: '0.74rem', fontWeight: 700,
                  transition: 'background 0.2s',
                }}>
                  {status === 'copied' ? '✓ Copiado' : 'Copiar texto'}
                </button>

                {selectedId && (
                  <button type="button" onClick={() => generate(selectedId)} style={{
                    border: '1px solid #D4C9BC', borderRadius: '999px', padding: '7px 12px',
                    background: '#FFFFFF', color: '#3D2B1A', cursor: 'pointer',
                    fontSize: '0.74rem', fontWeight: 700,
                  }}>
                    Regenerar
                  </button>
                )}
              </div>

              {/* Variant actions */}
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '7px' }}>
                {([
                  { tone: 'elegant'   as AssistantTone, label: 'Más elegante'  },
                  { tone: 'brief'     as AssistantTone, label: 'Más breve'     },
                  { tone: 'emotional' as AssistantTone, label: 'Más emotivo'   },
                  { tone: 'formal'    as AssistantTone, label: 'Más formal'    },
                  { tone: 'modern'    as AssistantTone, label: 'Más moderno'   },
                ] as { tone: AssistantTone; label: string }[]).map(({ tone: t, label }) => (
                  <button key={t} type="button"
                    onClick={() => selectedId && generate(selectedId, t)}
                    style={{
                      border: '1px solid #E8E2DA', borderRadius: '999px', padding: '5px 10px',
                      background: '#FFFFFF', color: '#7C6A5C', cursor: 'pointer',
                      fontSize: '0.7rem', fontWeight: 600,
                    }}>
                    {label}
                  </button>
                ))}
              </div>

              {status === 'copy_error' && (
                <p style={{ margin: '6px 0 0', fontSize: '0.72rem', color: '#9B2C2C' }}>
                  No se pudo copiar. Selecciona el texto manualmente.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
