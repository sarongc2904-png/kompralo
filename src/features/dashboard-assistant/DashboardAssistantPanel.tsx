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
  const [status, setStatus] = useState<DashboardAssistantStatus>('idle');
  const [selectedOption, setSelectedOption] = useState<DashboardAssistantPromptOption | null>(null);
  const [generated, setGenerated] = useState<DashboardAssistantGeneratedText | null>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  async function generate(option: DashboardAssistantPromptOption) {
    setSelectedOption(option);
    setStatus('generating');

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

  return (
    <aside
      aria-label="Asistente de textos del dashboard"
      style={{
        position: 'fixed',
        right: '16px',
        bottom: '88px',
        zIndex: 1040,
        width: 'min(410px, calc(100vw - 24px))',
        maxHeight: 'min(680px, 70vh)',
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
            Genera textos elegantes para tu invitación
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
          }}
        >
          ×
        </button>
      </header>

      <div
        style={{
          overflowY: 'auto',
          padding: '14px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gap: '8px',
          }}
        >
          {DASHBOARD_ASSISTANT_PROMPT_OPTIONS.map((option) => (
            <DashboardAssistantPromptCard
              key={option.type}
              option={option}
              disabled={isGenerating}
              onSelect={generate}
            />
          ))}
        </div>

        <div
          aria-live="polite"
          style={{
            marginTop: '14px',
            borderTop: '1px solid #EFE8DF',
            paddingTop: '14px',
          }}
        >
          {status === 'idle' && (
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#7C6A5C', lineHeight: 1.45 }}>
              Elige una opción. El texto generado aparecerá aquí para que lo copies manualmente.
            </p>
          )}

          {status === 'generating' && (
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#7C6A5C' }}>
              Generando texto...
            </p>
          )}

          {status === 'error' && (
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#9B2C2C', lineHeight: 1.45 }}>
              No pude generar el texto en este momento. Intenta de nuevo en unos segundos.
            </p>
          )}

          {status === 'copy_error' && (
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#9B2C2C', lineHeight: 1.45 }}>
              No se pudo copiar automáticamente. Puedes seleccionar el texto manualmente.
            </p>
          )}

          {(status === 'generated' || status === 'copied' || status === 'copy_error') && generated && (
            <div>
              <div
                style={{
                  whiteSpace: 'pre-wrap',
                  color: '#1A1410',
                  fontSize: '0.8125rem',
                  lineHeight: 1.55,
                  background: '#FCFAF6',
                  border: '1px solid #E8E2DA',
                  borderRadius: '12px',
                  padding: '12px',
                  maxHeight: '190px',
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
                    padding: '8px 13px',
                    background: '#1A1410',
                    color: '#F5EDD8',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  Copiar texto
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
                    Generar otra versión
                  </button>
                )}
              </div>

              {status === 'copied' && (
                <p style={{ margin: '8px 0 0', fontSize: '0.74rem', color: '#2F6B3C' }}>
                  Texto copiado
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
