import React from 'react';
import type { InvitationFeatureKey, InvitationFeatures } from '@/domain/plans/types';

interface InvitationSectionGateProps {
  feature: InvitationFeatureKey;
  features: InvitationFeatures;
  children?: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function InvitationSectionGate({
  feature,
  features,
  children,
  fallback = null,
}: InvitationSectionGateProps) {
  if (!features[feature]) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
