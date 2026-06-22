'use client';

import { useState } from 'react';
import type { InvitationContent } from '@/domain/invitations/types';
import { shouldShowWeddingWizard } from '@/lib/invitations/completion-score';
import { WeddingQuickStartBanner } from './WeddingQuickStartBanner';

export interface WeddingQuickStartSetupProps {
  invitation: InvitationContent;
  children: React.ReactNode;
}

/**
 * Client wrapper que decide si mostrar el banner Quick Start.
 * Valida:
 * - category === 'wedding'
 * - invitación incompleta
 * - no fue descartada en localStorage
 */
export function WeddingQuickStartSetup({
  invitation,
  children,
}: WeddingQuickStartSetupProps) {
  // Inicializar desde localStorage de forma lazy
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window === 'undefined') return true;
    const dismissKey = `kompralo:quickstart-dismissed:${invitation.id}`;
    return localStorage.getItem(dismissKey) === 'true';
  });

  // Decidir si mostrar banner
  const shouldShow =
    invitation.category === 'wedding' &&
    !isDismissed &&
    shouldShowWeddingWizard(invitation, invitation.planId);

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  return (
    <>
      {shouldShow && (
        <WeddingQuickStartBanner
          invitationId={invitation.id}
          planId={invitation.planId}
          onDismiss={handleDismiss}
        />
      )}
      {children}
    </>
  );
}
