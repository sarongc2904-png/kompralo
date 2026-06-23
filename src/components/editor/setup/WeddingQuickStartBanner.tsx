'use client';

import { useState, useEffect } from 'react';
import { WeddingQuickStartWizard } from './WeddingQuickStartWizard';
import type { WeddingQuickStartWizardProps } from './WeddingQuickStartWizard';

export type WizardInitialData = WeddingQuickStartWizardProps['initialData'];

export interface WeddingQuickStartBannerProps {
  invitationId: string;
  planId: string;
  /** Called when the user dismisses the banner or completes the wizard */
  onDismiss?: () => void;
  /** Existing invitation data to preload in the wizard when reopened */
  existingData?: WizardInitialData;
  /** Whether the full promotional banner should be shown (controlled by parent) */
  showFullBanner?: boolean;
}

export function WeddingQuickStartBanner({
  invitationId,
  planId,
  onDismiss,
  existingData,
  showFullBanner = false,
}: WeddingQuickStartBannerProps) {
  const [showWizard, setShowWizard] = useState(false);
  const [wizardMode, setWizardMode] = useState<'initial' | 'update'>('initial');
  const [highlighted, setHighlighted] = useState(false);

  const handleDismiss = () => {
    const dismissKey = `kompralo:quickstart-dismissed:${invitationId}`;
    localStorage.setItem(dismissKey, 'true');
    onDismiss?.();
  };

  const handleWizardComplete = () => {
    handleDismiss();
    // Briefly highlight the reopen button after wizard finishes
    setHighlighted(true);
  };

  useEffect(() => {
    if (!highlighted) return;
    const t = setTimeout(() => setHighlighted(false), 3000);
    return () => clearTimeout(t);
  }, [highlighted]);

  const handleEditManually = () => {
    handleDismiss();
  };

  const handleOpenWizard = (m: 'initial' | 'update' = 'initial') => {
    setWizardMode(m);
    setShowWizard(true);
  };

  const handleWizardClose = () => {
    setShowWizard(false);
  };

  return (
    <>
      {/* Full promotional banner — only when invitation is still incomplete */}
      {showFullBanner && (
        <div
          className="mb-6 rounded-xl overflow-hidden shadow-sm"
          style={{
            background: 'linear-gradient(135deg, #FAF7F2 0%, #F5F0E8 100%)',
            border: '1px solid #E8DFD5',
          }}
        >
          <div className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-1" style={{ color: '#1A1410' }}>
                Vamos a crear el 80% de tu invitación en menos de 1 minuto.
              </h2>
              <p className="text-sm" style={{ color: '#746B62' }}>
                Solo necesitamos nombres, fecha y estilo. Después podrás personalizar todo.
              </p>
            </div>

            <div className="flex gap-3 sm:flex-col sm:items-stretch">
              <button
                onClick={() => handleOpenWizard('initial')}
                className="px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                style={{ background: '#B99752', color: '#FFFFFF' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#A8845E')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#B99752')}
              >
                Crear mi invitación
              </button>
              <button
                onClick={handleEditManually}
                className="px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                style={{ background: '#FFFFFF', color: '#746B62', border: '1px solid #E8DFD5' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#F9F7F3')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
              >
                Editar manualmente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent reopen button — always visible for wedding invitations */}
      <style>{`
        @keyframes kq-pulse-border {
          0%, 100% { box-shadow: 0 0 0 0 rgba(185,151,82,0.4); }
          50%       { box-shadow: 0 0 0 5px rgba(185,151,82,0); }
        }
        .kq-highlight-pulse {
          animation: kq-pulse-border 0.8s ease-out 3;
          border-color: #B99752 !important;
        }
      `}</style>
      <div className="mb-5">
        <button
          onClick={() => handleOpenWizard('update')}
          className={`flex items-center gap-2 w-full sm:w-auto sm:min-w-[260px] px-4 py-3 rounded-xl font-medium text-sm transition-colors${highlighted ? ' kq-highlight-pulse' : ''}`}
          style={{
            background: '#FAF7F2',
            color: '#5C4A32',
            border: '1.5px solid #DDD0BE',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#F0E8DC'; e.currentTarget.style.borderColor = '#B99752'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#FAF7F2'; e.currentTarget.style.borderColor = highlighted ? '#B99752' : '#DDD0BE'; }}
        >
          <span
            className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: '#B99752' }}
            aria-hidden="true"
          >
            <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
              <path d="M8.5 1.5L10.5 3.5L4 10H2V8L8.5 1.5Z" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </span>
          <span className="flex flex-col text-left">
            <span className="font-semibold leading-tight">Editar con asistente rápido</span>
            <span className="text-xs font-normal mt-0.5" style={{ color: '#9B8878' }}>
              Actualiza nombres, fecha, lugar y WhatsApp.
            </span>
          </span>
        </button>
      </div>

      {/* Wizard Modal */}
      {showWizard && (
        <WeddingQuickStartWizard
          invitationId={invitationId}
          planId={planId}
          onClose={handleWizardClose}
          onComplete={handleWizardComplete}
          mode={wizardMode}
          initialData={wizardMode === 'update' ? existingData : undefined}
        />
      )}
    </>
  );
}
