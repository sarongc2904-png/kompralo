'use client';

import { useState } from 'react';
import type { InvitationContent } from '@/domain/invitations/types';
import { shouldShowWeddingWizard } from '@/lib/invitations/completion-score';
import { WeddingQuickStartBanner } from './WeddingQuickStartBanner';
import type { WizardInitialData } from './WeddingQuickStartBanner';
import type { ThemeIdV2 } from '@/domain/themes-v2/types';

export interface WeddingQuickStartSetupProps {
  invitation: InvitationContent;
  children: React.ReactNode;
}

/**
 * Client wrapper para el Quick Start de bodas.
 * - Muestra el banner completo cuando la invitación está incompleta y no fue descartada.
 * - Siempre muestra el botón "Editar con asistente rápido" para invitaciones de boda.
 */
export function WeddingQuickStartSetup({
  invitation,
  children,
}: WeddingQuickStartSetupProps) {
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window === 'undefined') return true;
    const dismissKey = `kompralo:quickstart-dismissed:${invitation.id}`;
    return localStorage.getItem(dismissKey) === 'true';
  });

  const isWedding = invitation.category === 'wedding';

  if (!isWedding) {
    return <>{children}</>;
  }

  const showFullBanner =
    !isDismissed && shouldShowWeddingWizard(invitation, invitation.planId);

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  const existingData: WizardInitialData = {
    brideName:     invitation.protagonists?.[0]?.name || '',
    groomName:     invitation.protagonists?.[1]?.name || '',
    weddingDate:   invitation.eventDate || '',
    ceremonyTime:  invitation.eventTime || '',
    venueName:     invitation.location?.venueName || '',
    address:       invitation.location?.address || '',
    googleMapsUrl: invitation.location?.googleMapsLink || '',
    wazeUrl:       invitation.location?.wazeLink || '',
    themeId:       (invitation.themeId as ThemeIdV2) || undefined,
    whatsappNumber: invitation.rsvpWhatsAppNumber || '',
  };

  return (
    <>
      <WeddingQuickStartBanner
        invitationId={invitation.id}
        planId={invitation.planId}
        onDismiss={handleDismiss}
        existingData={existingData}
        showFullBanner={showFullBanner}
      />
      {children}
    </>
  );
}
