import React from 'react';
import type { InvitationFeatureKey, InvitationFeatures } from '@/domain/plans/types';
import InvitationSectionGate from '@/components/invitation/InvitationSectionGate';

interface FeatureGateProps {
  feature: InvitationFeatureKey;
  features?: InvitationFeatures;
  gates?: InvitationFeatures;
  children?: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function FeatureGate({
  feature,
  features,
  gates,
  children,
  fallback = null,
}: FeatureGateProps) {
  return (
    <InvitationSectionGate
      feature={feature}
      features={features ?? gates ?? ({} as InvitationFeatures)}
      fallback={fallback}
    >
      {children}
    </InvitationSectionGate>
  );
}
