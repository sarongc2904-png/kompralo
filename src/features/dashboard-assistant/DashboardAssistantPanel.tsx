'use client';

import { useEffect, useRef, useState } from 'react';
import type { AssistantApiResponse } from '@/features/virtual-assistant/types';
import {
  buildDashboardAssistantPrompt,
  DASHBOARD_ASSISTANT_PROMPT_OPTIONS,
} from './dashboardAssistantPrompts';
import { DashboardAssistantPromptCard } from './DashboardAssistantPromptCard';
import type {
  DashboardAssistantEventType,
  DashboardAssistantGeneratedText,
  DashboardAssistantPromptOption,
  DashboardAssistantStatus,
} from './types';

interface DashboardAssistantPanelProps {
  eventType?: DashboardAssistantEventType;
  pathname?: string;
  onClose: () => void;
}

async function requestGeneratedText(message: string, pathname?: string): Promise<string> {
  const response = await fetch('/api/assistant', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      pageContext: {
        pathname,
      },
    }),
  });

  if (!response.ok) {
    throw new Error('dashboard_assistant_api_failed');
  }

  const data = (await response.json()) as AssistantApiResponse;
  if (!data || typeof data.answer !== 'string' || !data.answer.trim()) {
    throw new Error('dashboard_assistant_empty_response');
  }

  return data.answer.trim();
}

export function DashboardAssistantPanel({
  eventType = 'wedding',
  pathname,
  onClose,
}: DashboardAssistantPanelProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const responseRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<DashboardAssistantStatus>('idle');
  const [selectedOption, setSelectedOption] = useState<DashboardAssistantPromptOption | null>(null);
  const [generated, setGenerated] = useState<DashboardAssistantGeneratedText | null>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  // Scroll response area into view when text is generated
  useEffect(() => {
    if (status === 'generated' || status === 'copied' || status === 'copy_error') {
      responseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [status]);

  async function generate(option: DashboardAssistantPromptOption) {
    setSelectedOption(option);
    setStatus('generating');
    setGenerated(null);

    try {
      const prompt = buildDashboardAssistantPrompt({
        promptType: option.type,
        eventType,
      });
      const text = await requestGeneratedText(prompt, pathname);

      setGenerated({
        promptType: option.type,
        text,
        createdAt: Date.now(),
      });
      setStatus('generated');
    } catch {
      setStatus('error');
    }
  }

  async function copyGeneratedText() {
    if (!generated?.text) return;

    try {
      await navigator.clipboard.writeText(generated.text);
      setStatus('copied');
    } catch {
      setStatus('copy_error');
    }
  }

  const isGenerating = status === 'generating';
  const hasResponse = status === 'generated' || status === 'copied' || status === 'copy_error';

  return (
    <aside
      aria-label="Asistente de textos del dashboard"
      style={{
        position: 'fixed',
        right: '16px',
        bottom: '88px',
        zIndex: 1040,
        width: 'min(420px, calc(100vw - 24px))',
        maxHeight: 'min(680px, 75vh)',
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
      <header
        style={{
          flexShrink: 0,
          padding: '16px 18px',
          background: '#1A1410',
          color: '#F7EFE2',
          display: 'flex',
          justifyContent: 'space-between',
          gap: '12px',
          alignItems: 'flex-start',
        }}
      >
        <div>
          <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700 }}>
            Asistente de textos
          </p>
          <p style={{ margin: '3px 0 0', fontSize: '0.75rem', color: '#D9C7A5' }}>
            Genera textos listos para copiar en tu invitación
          </p>
        </div>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Cerrar asistente de textos"
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '999px',
            border: '1px solid rgba(245,237,216,0.28)',
            background: 'transparent',
            color: '#F5EDD8',
            cursor: 'pointer',
            fontSize: '1rem',
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          ×
        </button>
      </header>

      {/* ── Scrollable body ─────────────────────────────────────────────────── */}
      <div style={{ overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

        {/* Instruction microcopy */}
        <p
          style={{
            margin: 0,
            fontSize: '0.78rem',
            color: '#7C6A5C',
            lineHeight: 1.45,
            padding: '8px 10px',
            background: '#FAF6F0',
            borderRadius: '8px',
            border: '1px solid #EFE8DF',
          }}
        >
          Haz clic en una tarjeta para generar el texto. Aparecerá abajo para que lo copies.
        </p>

        {/* Prompt cards */}
        <div style={{ display: 'grid', gap: '8px' }}>
          {DASHBOARD_ASSISTANT_PROMPT_OPTIONS.map((option) => (
            <DashboardAssistantPromptCard
              key={option.type}
              option={option}
              disabled={isGenerating}
              isSelected={selectedOption?.type === option.type}
              isGenerating={isGenerating && selectedOption?.type === option.type}
              onSelect={generate}
            />
          ))}
        </div>

        {/* ── Response area ──────────────────────────────────────────────────── */}
        <div
          ref={responseRef}
          aria-live="polite"
          style={{
            borderTop: '1px solid #EFE8DF',
            paddingTop: '14px',
          }}
        >
          {/* Idle hint — shown before first interaction */}
          {status === 'idle' && (
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#B0A090', lineHeight: 1.45, textAlign: 'center' }}>
              El texto generado aparecerá aquí.
            </p>
          )}

          {/* Generating */}
          {status === 'generating' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px',
                background: '#FAF6F0',
                border: '1px solid #EFE8DF',
                borderRadius: '12px',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  border: '2px solid #C5A880',
                  borderTopColor: 'transparent',
                  animation: 'da-spin 0.7s linear infinite',
                  flexShrink: 0,
                }}
              />
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#7C6A5C', fontWeight: 600 }}>
                Generando texto…
              </p>
              <style>{`@keyframes da-spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div
              style={{
                padding: '12px',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '12px',
              }}
            >
              <p style={{ margin: '0 0 8px', fontSize: '0.8rem', color: '#991B1B', fontWeight: 600 }}>
                No pudimos generar el texto
              </p>
              <p style={{ margin: '0 0 10px', fontSize: '0.75rem', color: '#B91C1C', lineHeight: 1.45 }}>
                Ocurrió un error al conectar. Intenta de nuevo en unos segundos.
              </p>
              {selectedOption && (
                <button
                  type="button"
                  onClick={() => generate(selectedOption)}
                  style={{
                    border: '1px solid #FECACA',
                    borderRadius: '999px',
                    padding: '6px 12px',
                    background: '#FFFFFF',
                    color: '#991B1B',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  Intentar de nuevo
                </button>
              )}
            </div>
          )}

          {/* Generated text */}
          {hasResponse && generated && (
            <div>
              <p
                style={{
                  margin: '0 0 8px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#9B8878',
                }}
              >
                Texto generado · {selectedOption?.label}
              </p>

              <div
                style={{
                  whiteSpace: 'pre-wrap',
                  color: '#1A1410',
                  fontSize: '0.8125rem',
                  lineHeight: 1.6,
                  background: '#FCFAF6',
                  border: '1px solid #E8E2DA',
                  borderRadius: '12px',
                  padding: '14px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                }}
              >
                {generated.text}
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={copyGeneratedText}
                  style={{
                    border: 'none',
                    borderRadius: '999px',
                    padding: '8px 16px',
                    background: status === 'copied' ? '#2F6B3C' : '#1A1410',
                    color: '#F5EDD8',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    transition: 'background 0.2s',
                  }}
                >
                  {status === 'copied' ? '✓ Texto copiado' : 'Copiar texto'}
                </button>

                {selectedOption && (
                  <button
                    type="button"
                    onClick={() => generate(selectedOption)}
                    style={{
                      border: '1px solid #D4C9BC',
                      borderRadius: '999px',
                      padding: '8px 13px',
                      background: '#FFFFFF',
                      color: '#3D2B1A',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    Otra versión
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setSelectedOption(null);
                    setGenerated(null);
                    setStatus('idle');
                  }}
                  style={{
                    border: '1px solid #E8E2DA',
                    borderRadius: '999px',
                    padding: '8px 13px',
                    background: '#FFFFFF',
                    color: '#9B8878',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  Elegir otra opción
                </button>
              </div>

              {status === 'copy_error' && (
                <p style={{ margin: '8px 0 0', fontSize: '0.74rem', color: '#9B2C2C', lineHeight: 1.4 }}>
                  No se pudo copiar automáticamente. Selecciona el texto manualmente.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
