'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import InvitationRenderer, { type InvitationRenderMode } from '@/components/invitation/InvitationRenderer';
import type { InvitationContent } from '@/domain/invitations/types';
import type { InvitationFeatures, InvitationPlan } from '@/domain/plans/types';
import type { Theme } from '@/domain/themes/types';
import { getThemeCatalogEntry } from '@/domain/themes-v2/themesCatalog';
import type { ThemeIdV2 } from '@/domain/themes-v2/types';

interface InvitationRouteRendererProps {
  invitation: InvitationContent;
  theme: Theme;
  plan: InvitationPlan;
  features: InvitationFeatures;
  mode: InvitationRenderMode;
  showPreviewBadge?: boolean;
  /** When set, overrides the invitation's saved theme for visual preview only. */
  themePreviewId?: string;
  /** Editor preview can bypass the public tap-to-open intro. */
  skipIntro?: boolean;
  /** Enables inline editing only for editor iframe previews. */
  editablePreview?: boolean;
  /** Renders only the CinematicIntro for isolated editor intro-editing mode. */
  showIntroOnly?: boolean;
}

export default function InvitationRouteRenderer({
  invitation,
  theme,
  plan,
  features,
  mode,
  showPreviewBadge = false,
  themePreviewId,
  skipIntro = false,
  editablePreview = false,
  showIntroOnly = false,
}: InvitationRouteRendererProps) {
  const pathname    = usePathname();
  const searchParams = useSearchParams();

  // Build "ver original" URL by removing the themePreview param
  const cleanParams = new URLSearchParams(searchParams.toString());
  cleanParams.delete('themePreview');
  const cleanUrl = cleanParams.size > 0 ? `${pathname}?${cleanParams.toString()}` : pathname;

  const isPreview = !!themePreviewId;
  const themeCatalogEntry = themePreviewId ? getThemeCatalogEntry(themePreviewId as ThemeIdV2) : null;

  return (
    <>
      {showPreviewBadge && !isPreview && (
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

      {/* Theme preview banner — visible only when ?themePreview is active */}
      {isPreview && (
        <div
          style={{
            position: 'fixed',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10000,
            background: 'rgba(251,247,239,0.97)',
            border: '1px solid rgba(200,167,93,0.50)',
            borderRadius: 999,
            padding: '9px 22px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            boxShadow: '0 4px 24px rgba(116,84,38,0.18)',
            fontSize: '0.75rem',
            color: '#5C4A3E',
            whiteSpace: 'nowrap',
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#C8A75D',
              flexShrink: 0,
            }}
          />
          <span style={{ fontWeight: 500 }}>Vista previa:</span>
          <strong style={{ color: '#1F1A16', fontWeight: 700 }}>
            {themeCatalogEntry?.label ?? 'Tema desconocido'}
          </strong>
          <span style={{ color: 'rgba(92,74,62,0.4)' }}>·</span>
          <a
            href={cleanUrl}
            style={{
              color: '#C8A75D',
              fontWeight: 700,
              textDecoration: 'none',
              letterSpacing: '0.04em',
            }}
          >
            Ver original
          </a>
        </div>
      )}

      <InvitationRenderer
        invitation={invitation}
        theme={theme}
        plan={plan}
        features={features}
        mode={mode}
        themePreviewId={themePreviewId}
        skipIntro={skipIntro}
        editablePreview={editablePreview}
        showIntroOnly={showIntroOnly}
      />
    </>
  );
}
