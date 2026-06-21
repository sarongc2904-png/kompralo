'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { DashboardAssistantWidget } from './DashboardAssistantWidget';
import type { InvitationAssistantContext } from './types';

interface DashboardAssistantMountProps {
  enabledByEnv: boolean;
  enabledForPlan: boolean;
  invitationContext: InvitationAssistantContext;
}

function isDashboardAssistantRoute(pathname: string): boolean {
  return /^\/dashboard\/invitations\/[^/]+\/edit\/?$/.test(pathname);
}

export function DashboardAssistantMount({
  enabledByEnv,
  enabledForPlan,
  invitationContext,
}: DashboardAssistantMountProps) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setIsMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  if (!isMounted) return null;
  if (!enabledByEnv || !enabledForPlan) return null;
  if (!isDashboardAssistantRoute(pathname)) return null;

  return (
    <DashboardAssistantWidget
      enabledForPlan={enabledForPlan}
      invitationContext={invitationContext}
      pathname={pathname}
    />
  );
}
