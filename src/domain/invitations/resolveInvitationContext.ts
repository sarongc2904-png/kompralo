import type { InvitationContent } from '@/domain/invitations/types';
import type { InvitationFeatures, InvitationPlan } from '@/domain/plans';
import type { InvitationTheme } from '@/domain/themes';
import { getFeaturesForPlan, getPlanById } from '@/domain/plans';
import { getThemeById } from '@/domain/themes';

export interface InvitationContext {
  invitation: InvitationContent;
  theme: InvitationTheme;
  plan: InvitationPlan;
  features: InvitationFeatures;
}

export function resolveInvitationContext(invitation: InvitationContent): InvitationContext {
  const plan = getPlanById(invitation.planId);
  const theme = getThemeById(invitation.themeId);
  const features = getFeaturesForPlan(plan.id, invitation.featureOverrides);

  return { invitation, theme, plan, features };
}
