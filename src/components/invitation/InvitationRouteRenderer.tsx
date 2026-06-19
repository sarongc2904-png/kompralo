'use client';

import InvitationRenderer, { type InvitationRenderMode } from '@/components/invitation/InvitationRenderer';
import type { InvitationContent } from '@/domain/invitations/types';
import type { InvitationFeatures, InvitationPlan } from '@/domain/plans/types';
import type { Theme } from '@/domain/themes/types';

interface InvitationRouteRendererProps {
  invitation: InvitationContent;
  theme: Theme;
  plan: InvitationPlan;
  features: InvitationFeatures;
  mode: InvitationRenderMode;
  showPreviewBadge?: boolean;
}

export default function InvitationRouteRenderer({
  invitation,
  theme,
  plan,
  features,
  mode,
  showPreviewBadge = false,
}: InvitationRouteRendererProps) {
  return (
    <>
      {showPreviewBadge && (
        <div
          className="fixed right-4 top-4 z-[10000] rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.2em] shadow-sm backdrop-blur-md"
          style={{
            background: 'rgba(255,255,255,0.82)',
            borderColor: 'rgba(197,168,128,0.35)',
            color: '#8B7355',
          }}
        >
          Vista previa
        </div>
      )}
      <InvitationRenderer
        invitation={invitation}
        theme={theme}
        plan={plan}
        features={features}
        mode={mode}
      />
    </>
  );
}
