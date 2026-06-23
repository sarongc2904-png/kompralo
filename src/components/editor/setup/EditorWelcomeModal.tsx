'use client';

import { useState, useEffect } from 'react';
import { WeddingQuickStartWizard } from './WeddingQuickStartWizard';
import type { WizardInitialData } from './WeddingQuickStartBanner';

interface EditorWelcomeModalProps {
  invitationId: string;
  planId: string;
  existingData?: WizardInitialData;
}

const STORAGE_KEY_PREFIX = 'kompralo:editor-welcomed:';

export function EditorWelcomeModal({ invitationId, planId, existingData }: EditorWelcomeModalProps) {
  const [visible, setVisible] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    const key = `${STORAGE_KEY_PREFIX}${invitationId}`;
    const seen = localStorage.getItem(key) === 'true';
    if (!seen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
    }
  }, [invitationId]);

  function dismiss() {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${invitationId}`, 'true');
    setVisible(false);
  }

  function openWizard() {
    dismiss();
    setShowWizard(true);
  }

  if (!visible && !showWizard) return null;

  return (
    <>
      {visible && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4"
          style={{ background: 'rgba(0,0,0,0.45)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) dismiss();
          }}
        >
          <div
            className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col"
            style={{
              background: '#FFFFFF',
              maxHeight: '90vh',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="px-5 pt-6 pb-4 flex-shrink-0"
              style={{ borderBottom: '1px solid #F0EBE3' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: '#B99752' }}>
                    KOMPRALO
                  </p>
                  <h2 className="text-lg font-semibold leading-snug" style={{ color: '#1A1410' }}>
                    Bienvenido al editor de tu invitación
                  </h2>
                </div>
                <button
                  onClick={dismiss}
                  className="w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center mt-0.5"
                  style={{ background: '#F5F0E8', color: '#746B62' }}
                  aria-label="Cerrar"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <p className="text-sm mb-5" style={{ color: '#746B62', lineHeight: 1.65 }}>
                Para empezar más rápido, puedes usar el asistente rápido. Te ayudará a completar o
                actualizar los datos principales de tu invitación: nombres, fecha, lugar, estilo y
                WhatsApp.
              </p>

              <ul className="space-y-3 mb-5">
                {[
                  'Completa tu invitación en pocos pasos',
                  'Puedes editar todo manualmente después',
                  'No borra tus fotos ni configuraciones existentes',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm" style={{ color: '#5C4A32' }}>
                    <span
                      className="mt-0.5 w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
                      style={{ background: '#F5EDD8', color: '#B99752' }}
                    >
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer */}
            <div
              className="flex flex-col gap-2.5 px-5 py-4 flex-shrink-0"
              style={{ borderTop: '1px solid #F0EBE3' }}
            >
              <button
                onClick={openWizard}
                className="w-full rounded-xl font-semibold text-sm transition-colors"
                style={{
                  minHeight: 44,
                  background: '#B99752',
                  color: '#FFFFFF',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#A8845E')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#B99752')}
              >
                Usar asistente rápido
              </button>
              <button
                onClick={dismiss}
                className="w-full rounded-xl font-semibold text-sm transition-colors"
                style={{
                  minHeight: 44,
                  background: '#F5F0E8',
                  color: '#746B62',
                  border: '1px solid #E8DFD5',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#EDE5D8')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#F5F0E8')}
              >
                Editar manualmente
              </button>
            </div>
          </div>
        </div>
      )}

      {showWizard && (
        <WeddingQuickStartWizard
          invitationId={invitationId}
          planId={planId}
          onClose={() => setShowWizard(false)}
          onComplete={() => {
            localStorage.setItem(`kompralo:quickstart-dismissed:${invitationId}`, 'true');
          }}
          mode="initial"
          initialData={existingData}
        />
      )}
    </>
  );
}
