'use client';

import { useState } from 'react';
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

  const handleDismiss = () => {
    const dismissKey = `kompralo:quickstart-dismissed:${invitationId}`;
    localStorage.setItem(dismissKey, 'true');
    onDismiss?.();
  };

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
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => handleOpenWizard('update')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          style={{
            background: '#F5F0E8',
            color: '#746B62',
            border: '1px solid #E8DFD5',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#EDE5D8')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#F5F0E8')}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
              d="M8.5 1.5L10.5 3.5L4 10H2V8L8.5 1.5Z"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
          Editar con asistente rápido
        </button>
      </div>

      {/* Wizard Modal */}
      {showWizard && (
        <WeddingQuickStartWizard
          invitationId={invitationId}
          planId={planId}
          onClose={handleWizardClose}
          onComplete={handleDismiss}
          mode={wizardMode}
          initialData={wizardMode === 'update' ? existingData : undefined}
        />
      )}
    </>
  );
}
