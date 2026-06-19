'use client';

import { useState } from 'react';
import { invitationConfig } from '@/config/invitation.config';
import InvitationRenderer from '@/components/invitation/InvitationRenderer';
import InvitationDevToolbar from '@/components/invitation/dev/InvitationDevToolbar';
import { getFeaturesForPlan, getPlanById } from '@/domain/plans/registry';
import type { PlanId } from '@/domain/plans/types';
import { getThemeById } from '@/domain/themes/registry';
import type { ThemeId } from '@/domain/themes/types';

export default function DevPlayground() {
  const [activePlanId, setActivePlanId] = useState<PlanId>(() => getPlanById(invitationConfig.planId).id);
  // themeId is stored as string in InvitationContent; cast to ThemeId for the v1 dev toolbar
  const [activeThemeId, setActiveThemeId] = useState<ThemeId>(invitationConfig.themeId as ThemeId);
  const [isToolbarOpen, setIsToolbarOpen] = useState(false);

  const plan = getPlanById(activePlanId);
  const theme = getThemeById(activeThemeId);
  const features = getFeaturesForPlan(plan.id, invitationConfig.featureOverrides);

  return (
    <>
      <InvitationRenderer
        invitation={invitationConfig}
        theme={theme}
        plan={plan}
        features={features}
        mode="dev"
      />
      <InvitationDevToolbar
        activePlanId={activePlanId}
        activeThemeId={activeThemeId}
        onPlanChange={setActivePlanId}
        onThemeChange={setActiveThemeId}
        isOpen={isToolbarOpen}
        onOpenChange={setIsToolbarOpen}
      />
    </>
  );
}
