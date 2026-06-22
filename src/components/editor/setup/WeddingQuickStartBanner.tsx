'use client';

import { useState } from 'react';
import { WeddingQuickStartWizard } from './WeddingQuickStartWizard';

export interface WeddingQuickStartBannerProps {
  invitationId: string;
  planId: string;
  onDismiss?: () => void;
}

/**
 * Banner para invitar al usuario a usar el wizard Quick Start.
 * Se muestra cuando la invitación wedding está incompleta.
 * Puede ser cerrado — se guarda en localStorage.
 */
export function WeddingQuickStartBanner({
  invitationId,
  planId,
  onDismiss,
}: WeddingQuickStartBannerProps) {
  const [showWizard, setShowWizard] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const handleDismiss = () => {
    const dismissKey = `kompralo:quickstart-dismissed:${invitationId}`;
    localStorage.setItem(dismissKey, 'true');
    setIsDismissed(true);
    onDismiss?.();
  };

  const handleEditManually = () => {
    handleDismiss();
  };

  const handleOpenWizard = () => {
    setShowWizard(true);
  };

  const handleWizardClose = () => {
    setShowWizard(false);
  };

  if (isDismissed) {
    return null;
  }

  return (
    <>
      {/* Banner */}
      <div
        className="mb-8 rounded-xl overflow-hidden shadow-sm"
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
              onClick={handleOpenWizard}
              className="px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
              style={{
                background: '#B99752',
                color: '#FFFFFF',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#A8845E')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#B99752')}
            >
              Crear mi invitación
            </button>

            <button
              onClick={handleEditManually}
              className="px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
              style={{
                background: '#FFFFFF',
                color: '#746B62',
                border: '1px solid #E8DFD5',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F9F7F3';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#FFFFFF';
              }}
            >
              Editar manualmente
            </button>
          </div>
        </div>
      </div>

      {/* Wizard Modal */}
      {showWizard && (
        <WeddingQuickStartWizard
          invitationId={invitationId}
          planId={planId}
          onClose={handleWizardClose}
        />
      )}
    </>
  );
}
