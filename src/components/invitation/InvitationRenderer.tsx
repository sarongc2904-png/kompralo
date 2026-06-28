'use client';

import React, { useEffect, useCallback } from 'react';
import type { InvitationContent } from '@/domain/invitations/types';
import type { InvitationFeatureKey, InvitationFeatures, InvitationPlan } from '@/domain/plans/types';
import { createThemeCssVariables, type Theme } from '@/domain/themes/types';
import { resolveTheme, ThemeProviderV2 } from '@/domain/themes-v2';
import { ivoryEditorialThemeV1 } from '@/domain/themes-v2/themes/ivory-editorial';
import CinematicIntro from '@/components/invitation/CinematicIntro';
import Countdown from '@/components/invitation/Countdown';
import DressCode from '@/components/invitation/DressCode';
import FeatureGate from '@/components/invitation/FeatureGate';
import FinalMessage from '@/components/invitation/FinalMessage';
import GiftRegistry from '@/components/invitation/GiftRegistry';
import Hashtag from '@/components/invitation/Hashtag';
import Hero from '@/components/invitation/Hero';
import HorizontalGallery from '@/components/invitation/HorizontalGallery';
import Hospedaje from '@/components/invitation/Hospedaje';
import Itinerary from '@/components/invitation/Itinerary';
import Location from '@/components/invitation/Location';
import MultilayerBackground from '@/components/invitation/MultilayerBackground';
import BackgroundMusicPlayer from '@/components/invitation/BackgroundMusicPlayer';
import Padrinos from '@/components/invitation/Padrinos';
import Parents from '@/components/invitation/Parents';
import RSVPForm from '@/components/invitation/RSVPForm';
import StoryBook from '@/components/invitation/StoryBook';
import Timeline from '@/components/invitation/Timeline';

export type InvitationRenderMode = 'public' | 'preview' | 'dev';

// ─── Passes-only notice ───────────────────────────────────────────────────────
// Shown on /i/<slug> when rsvpMode === 'passes_only'. Guests must use their
// personal pass (/pass/<token>) to confirm — the open RSVP form is hidden.
function PassesOnlyNotice({ theme }: { theme: Theme }) {
  return (
    <section
      className="relative py-20 px-4 flex flex-col items-center justify-center text-center"
      style={{ background: `var(--v2-background-sections, ${theme.backgrounds.sections})` }}
    >
      <div
        style={{
          maxWidth: 440,
          padding: '2.5rem 2rem',
          border: `1px solid var(--v2-color-border, ${theme.colors.border})`,
          borderRadius: '1.5rem',
          background: `var(--v2-color-surface, ${theme.colors.surface})`,
          boxShadow: theme.shadows.card,
        }}
      >
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎟️</div>
        <h3
          style={{
            margin: '0 0 .75rem',
            fontSize: '1.25rem',
            fontWeight: 700,
            fontFamily: 'Georgia, "Times New Roman", serif',
            color: `var(--v2-color-text-primary, ${theme.colors.textPrimary})`,
          }}
        >
          Confirmación de asistencia
        </h3>
        <p
          style={{
            margin: '0 0 .625rem',
            fontSize: '.9375rem',
            lineHeight: 1.65,
            color: `var(--v2-color-text-primary, ${theme.colors.textPrimary})`,
            opacity: 0.85,
          }}
        >
          Para confirmar tu asistencia usa el pase personalizado que te envió el anfitrión.
        </p>
        <p
          style={{
            margin: 0,
            fontSize: '.8125rem',
            color: `var(--v2-color-text-secondary, ${theme.colors.textSecondary})`,
          }}
        >
          Si no tienes tu pase, contacta al anfitrión.
        </p>
      </div>
    </section>
  );
}

interface InvitationRendererProps {
  invitation: InvitationContent;
  theme: Theme;
  plan: InvitationPlan;
  features: InvitationFeatures;
  mode?: InvitationRenderMode;
  /** When set, overrides the saved theme for visual preview. Does not persist. */
  themePreviewId?: string;
  /** Skips the public tap-to-open intro in editor previews only. */
  skipIntro?: boolean;
  /** Enables contentEditable text only inside editor preview iframe. */
  editablePreview?: boolean;
  /** Renders only the CinematicIntro (isolated, for editor intro-editing mode). */
  showIntroOnly?: boolean;
}

export default function InvitationRenderer({
  invitation,
  theme,
  plan,
  features,
  mode = 'public',
  themePreviewId,
  skipIntro = false,
  editablePreview = false,
  showIntroOnly = false,
}: InvitationRendererProps) {
  const protagonists = invitation.protagonists;
  const galleryImages = invitation.gallery.images;

  // User-controlled section visibility — overrides plan-level feature flags.
  const hiddenSections: string[] = (invitation.featureOverrides as { hiddenSections?: string[] } | undefined)?.hiddenSections ?? [];
  const SECTION_FEATURE_MAP: Partial<Record<string, InvitationFeatureKey>> = {
    parents:   'showParents',
    padrinos:  'showPadrinos',
    hashtag:   'showHashtag',
    gifts:     'showGiftRegistry',
    itinerary: 'showItinerary',
    hotels:    'showAccommodation',
  };
  const effectiveFeatures: InvitationFeatures = hiddenSections.length === 0
    ? features
    : (() => {
        const ef = { ...features };
        for (const [sid, fKey] of Object.entries(SECTION_FEATURE_MAP)) {
          if (fKey && hiddenSections.includes(sid)) ef[fKey] = false;
        }
        return ef;
      })();

  // Derive display names for components that accept brideName/groomName props.
  // Role-based lookup (novia/bride first, novio/groom second) takes priority over index order.
  const storyBrideName =
    protagonists.find((p) => p.role === 'novia' || p.role === 'bride')?.name ??
    protagonists[0]?.name;
  const storyGroomName =
    protagonists.find((p) => p.role === 'novio' || p.role === 'groom')?.name ??
    protagonists[1]?.name;

  // V2 theme — resolved from the preview override (if any) or the invitation's saved themeId.
  // Priority: preview override > saved invitation theme > fallback to 'editorial'
  const resolvedThemeId = themePreviewId ?? invitation.themeId;
  const themeV2 = resolveTheme(resolvedThemeId);

  // For V1 compatibility: if resolved theme is ivory-editorial, use V1 ivory version.
  // Otherwise use the passed-in theme (which was resolved from invitation.planId).
  const effectiveTheme = resolvedThemeId === 'ivory-editorial' || themeV2.id === 'ivory-editorial'
    ? ivoryEditorialThemeV1
    : theme;

  const themeVariables = createThemeCssVariables(effectiveTheme);
  const invitationPaperVariables = {
    ...themeVariables,
    '--kompralo-invitation-paper-bg': "url('/images/invitaciones/editorial-paper-background.jpg')",
    '--v2-background-main': 'rgba(251, 247, 239, 0.18)',
    '--v2-background-story': 'rgba(251, 247, 239, 0.12)',
    '--v2-background-sections': 'rgba(251, 247, 239, 0.1)',
    '--v2-background-final': 'rgba(251, 247, 239, 0.14)',
    '--v2-color-surface': 'rgba(255, 253, 248, 0.76)',
    '--v2-card-ivory-bg': 'rgba(255, 253, 248, 0.72)',
    '--v2-glass-bg': 'rgba(255, 253, 248, 0.68)',
    '--v2-color-overlay': 'rgba(255, 253, 248, 0.34)',
  } as React.CSSProperties & Record<string, string>;

  const handleEnterInvitation = () => {
    // Platinum: CinematicIntro calls this when user taps "Entrar"
  };

  // Intro-only mode: render just the CinematicIntro for the editor's isolated intro canvas
  if (showIntroOnly) {
    return (
      <ThemeProviderV2 theme={themeV2} injectCssVariables={false}>
        <CinematicIntro
          protagonists={invitation.protagonists}
          title={invitation.title}
          subtitle={invitation.subtitle}
          eventDate={invitation.eventDate ?? ''}
          theme={effectiveTheme}
          onEnter={() => {}}
          introTitle={invitation.hero?.introTitle}
          introSubtitle={invitation.hero?.introSubtitle}
          introButtonText={invitation.hero?.introButtonText}
        />
      </ThemeProviderV2>
    );
  }

  // ── Editor hover bridge ───────────────────────────────────────────────────
  // Fires EDITOR_V4_SECTION_HOVER / _END / _CLICK postMessages to the parent
  // editor shell so it can render a bounding-box overlay over the canvas iframe.
  //
  // Uses document-level delegation (mouseover) + closest('[data-section]') so
  // the rect is ALWAYS taken from the root section wrapper, never from an inner
  // child (e.g. EditableText). Per-element mouseenter with capture had a race
  // where re-renders invalidated the static `sections` list.
  useEffect(() => {
    if (!editablePreview) return;

    let activeSectionId: string | null = null;

    const sendHover = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      window.parent?.postMessage(
        { type: 'EDITOR_V4_SECTION_HOVER', sectionId: el.dataset.section ?? '', rect: { top: r.top, left: r.left, width: r.width, height: r.height } },
        window.location.origin,
      );
    };

    const sendEnd = () => {
      window.parent?.postMessage({ type: 'EDITOR_V4_SECTION_HOVER_END' }, window.location.origin);
    };

    const onMouseOver = (e: MouseEvent) => {
      const sectionEl = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-section]');
      const newId = sectionEl?.dataset.section ?? null;
      if (newId === activeSectionId) return;
      activeSectionId = newId;
      if (sectionEl && newId) {
        sendHover(sectionEl);
      } else {
        sendEnd();
      }
    };

    const onMouseOut = (e: MouseEvent) => {
      // Only send END when leaving the document entirely (relatedTarget is null or outside)
      if (!e.relatedTarget || !(e.relatedTarget as Node).isConnected) {
        activeSectionId = null;
        sendEnd();
      }
    };

    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest('[data-editable-field]')) return;
      const sectionEl = t?.closest<HTMLElement>('[data-section]');
      if (!sectionEl) return;
      window.parent?.postMessage(
        { type: 'EDITOR_V4_SECTION_CLICK', sectionId: sectionEl.dataset.section ?? '' },
        window.location.origin,
      );
    };

    document.addEventListener('mouseover', onMouseOver);
    document.addEventListener('mouseout',  onMouseOut);
    document.addEventListener('click',     onClick, true);

    return () => {
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout',  onMouseOut);
      document.removeEventListener('click',     onClick, true);
    };
  }, [editablePreview]);

  // ── Scroll-to-section + highlight (triggered by parent LayersPanel click) ──
  useEffect(() => {
    if (!editablePreview) return;

    let clearTimer = 0;

    function handleMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type !== 'KOMPRALO_SCROLL_TO_SECTION') return;

      const sectionId = e.data.sectionId as string;
      const el = document.querySelector<HTMLElement>(`[data-section="${sectionId}"]`);
      if (!el) return;

      el.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // After scroll settles, report the rect so the canvas overlay appears
      clearTimeout(clearTimer);
      setTimeout(() => {
        const r = el.getBoundingClientRect();
        window.parent?.postMessage(
          { type: 'EDITOR_V4_SECTION_HOVER', sectionId, rect: { top: r.top, left: r.left, width: r.width, height: r.height } },
          window.location.origin,
        );
        // Auto-clear the highlight after 2 s
        clearTimer = window.setTimeout(() => {
          window.parent?.postMessage({ type: 'EDITOR_V4_SECTION_HOVER_END' }, window.location.origin);
        }, 2000);
      }, 450);
    }

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(clearTimer);
    };
  }, [editablePreview]);

  // ── Preview height ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!editablePreview) return;

    let frame = 0;
    const sendHeight = () => {
      window.parent?.postMessage(
        {
          type: 'KOMPRALO_PREVIEW_HEIGHT',
          height: document.documentElement.scrollHeight,
        },
        window.location.origin,
      );
    };
    const scheduleSendHeight = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(sendHeight);
    };

    scheduleSendHeight();
    window.addEventListener('load', scheduleSendHeight);
    window.addEventListener('resize', scheduleSendHeight);

    const observer = new ResizeObserver(scheduleSendHeight);
    observer.observe(document.body);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('load', scheduleSendHeight);
      window.removeEventListener('resize', scheduleSendHeight);
      observer.disconnect();
    };
  }, [editablePreview]);

  // Diagnostic logs for debugging theme resolution
  if (typeof window !== 'undefined') {
    console.log('[theme] input themeId:', invitation.themeId, '| preview override:', themePreviewId);
    console.log('[theme] resolved themeId:', resolvedThemeId);
    console.log('[theme] V2 theme resolved to:', themeV2.id, '| expected: ivory-editorial');
    console.log('[theme] effectiveTheme (V1):', effectiveTheme.id);
    console.log('[features] plan:', plan.id);
    console.log('[features] showTimeline:', features.showTimeline, '| items:', invitation.timeline?.length ?? 0);
    console.log('[features] showStoryBook:', features.showStoryBook, '| slides:', invitation.story?.slides?.length ?? 0);
    console.log('[features] showPadrinos:', features.showPadrinos, '| groups:', invitation.padrinos?.length ?? 0);
    console.log('[features] showHashtag:', features.showHashtag);
    console.log('[features] showAccommodation:', features.showAccommodation, '| hotels:', invitation.hotels?.length ?? 0);
    console.log('[features] showGiftRegistry:', features.showGiftRegistry);
  }

  // Transparent wrapper that marks a section for the editor hover bridge.
  // Only active in editablePreview — no DOM overhead in public mode.
  const S = useCallback(
    ({ id, children }: { id: string; children: React.ReactNode }) =>
      editablePreview
        ? <div data-section={id}>{children}</div>
        : <>{children}</>,
    [editablePreview],
  );

  return (
    <div
      className={`min-h-screen relative min-w-0 overflow-x-hidden transition-colors duration-1000 ${effectiveTheme.bodyText}`}
      data-render-mode={mode}
      data-plan-id={plan.id}
      data-theme-v2={themeV2.id}
      style={{
        ...(themeV2.cssVariables as React.CSSProperties),
        ...(themeV2.id === 'ivory-editorial' ? invitationPaperVariables : themeVariables),
      }}
    >
      {!!themeV2.assets?.texture && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundImage: `url(${themeV2.assets.texture})`,
            backgroundSize: '100% auto',
            backgroundPosition: 'top center',
            backgroundRepeat: 'repeat-y',
            opacity: 0.35,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>
      {editablePreview && (
        <style>{`
          [data-editable-field] {
            cursor: text;
            border-radius: 8px;
            outline: 1px dashed transparent;
            outline-offset: 4px;
            transition: outline-color 160ms ease, background-color 160ms ease;
            -webkit-user-select: text;
            user-select: text;
          }
          [data-editable-field]:hover,
          [data-editable-field]:focus {
            outline-color: rgba(200, 167, 93, 0.72);
            background-color: rgba(255, 253, 248, 0.12);
          }
          [data-editable-field]:focus {
            outline-style: dotted;
          }
        `}</style>
      )}
    <ThemeProviderV2 theme={themeV2} injectCssVariables={false}>
      {!skipIntro && (
        <FeatureGate feature="showIntro" features={features}>
          <CinematicIntro
            protagonists={protagonists}
            title={invitation.title}
            subtitle={invitation.subtitle}
            eventDate={invitation.eventDate}
            theme={effectiveTheme}
            onEnter={handleEnterInvitation}
            introTitle={invitation.hero?.introTitle}
            introSubtitle={invitation.hero?.introSubtitle}
            introButtonText={invitation.hero?.introButtonText}
          />
        </FeatureGate>
      )}

      <FeatureGate feature="showMusic" features={features}>
        <BackgroundMusicPlayer key={invitation.music?.audioUrl} music={invitation.music} />
      </FeatureGate>

      <FeatureGate feature="showHero" features={features}>
        <S id="hero">
          {(() => {
            const heroVideoUrl = features.showVideo && invitation.hero?.videoLibraryEnabled
              ? (invitation.hero.videoLibraryUrl ?? null)
              : null;
            console.log('[heroVideo/renderer] showVideo:', features.showVideo);
            console.log('[heroVideo/renderer] videoLibraryEnabled:', invitation.hero?.videoLibraryEnabled);
            console.log('[heroVideo/renderer] heroVideoUrl:', heroVideoUrl);
            return (
              <Hero
                protagonists={protagonists}
                eventDate={invitation.eventDate}
                eventTime={invitation.eventTime}
                emotionalPhrase={invitation.hero?.emotionalPhrase ?? ''}
                imageUrl={invitation.hero?.imageUrl ?? ''}
                videoUrl={invitation.hero?.videoUrl}
                heroVideoUrl={heroVideoUrl}
                eventLabel={invitation.hero?.eventLabel || 'Nos casamos'}
                theme={effectiveTheme}
                editablePreview={editablePreview}
                connectorText={invitation.hero?.connectorText}
              />
            );
          })()}
        </S>
      </FeatureGate>

      <MultilayerBackground theme={effectiveTheme}>
        {(effectiveTheme.paperTexture || themeV2.effects.paperTexture) && (
          <div className="paper-noise" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 2 }} />
        )}

        {features.showCountdown && (
          <S id="countdown">
            <Countdown eventDate={invitation.eventDate ?? ''} eventTime={invitation.eventTime} theme={effectiveTheme} />
          </S>
        )}

      <FeatureGate feature="showParents" features={effectiveFeatures}>
        <S id="parents">
          <Parents
            parents={invitation.parents}
            theme={effectiveTheme}
            editablePreview={editablePreview}
            sectionEyebrow={invitation.hero?.parentsSectionEyebrow}
            sectionTitle={invitation.hero?.parentsSectionTitle}
            sectionSubtitle={invitation.hero?.parentsSectionSubtitle}
          />
        </S>
      </FeatureGate>

      <FeatureGate feature="showStoryBook" features={features}>
        <S id="story">
          <StoryBook
            slides={invitation.story.slides}
            theme={effectiveTheme}
            protagonists={protagonists}
            brideName={storyBrideName}
            groomName={storyGroomName}
            editablePreview={editablePreview}
            sectionEyebrow={invitation.story.sectionEyebrow}
            sectionTitle={invitation.story.sectionTitle}
          />
        </S>
      </FeatureGate>

      <FeatureGate feature="showGallery" features={features}>
        <S id="gallery">
          <HorizontalGallery images={galleryImages} theme={effectiveTheme} />
        </S>
      </FeatureGate>

      <FeatureGate feature="showTimeline" features={features}>
        <S id="timeline">
          <Timeline
            events={invitation.timeline}
            theme={effectiveTheme}
            editablePreview={editablePreview}
            sectionEyebrow={invitation.hero?.timelineSectionEyebrow}
            sectionTitle={invitation.hero?.timelineSectionTitle}
          />
        </S>
      </FeatureGate>

      <FeatureGate feature="showItinerary" features={effectiveFeatures}>
        <S id="itinerary">
          <Itinerary
            items={invitation.itinerary}
            theme={effectiveTheme}
            editablePreview={editablePreview}
            sectionEyebrow={invitation.hero?.itinerarySectionEyebrow}
            sectionTitle={invitation.hero?.itinerarySectionTitle}
          />
        </S>
      </FeatureGate>

      <FeatureGate feature="showMaps" features={features}>
        <S id="location">
          <Location location={invitation.location} theme={effectiveTheme} editablePreview={editablePreview} />
        </S>
      </FeatureGate>

      <FeatureGate feature="showQRCode" features={features}>
        {/* QR is a planned feature flag. No public QR UI is rendered until a real component exists. */}
      </FeatureGate>

      <FeatureGate feature="showDressCode" features={features}>
        <S id="dresscode">
          <DressCode dressCode={invitation.dressCode} theme={effectiveTheme} editablePreview={editablePreview} />
        </S>
      </FeatureGate>

      <FeatureGate feature="showGiftRegistry" features={effectiveFeatures}>
        <S id="gifts">
          <GiftRegistry
            items={invitation.giftRegistry.items}
            theme={effectiveTheme}
            editablePreview={editablePreview}
            sectionEyebrow={invitation.giftRegistry.sectionEyebrow}
            sectionTitle={invitation.giftRegistry.sectionTitle}
            subtitle={invitation.giftRegistry.subtitle}
          />
        </S>
      </FeatureGate>

      <FeatureGate feature="showPadrinos" features={effectiveFeatures}>
        <S id="padrinos">
          <Padrinos
            padrinos={invitation.padrinos}
            theme={effectiveTheme}
            editablePreview={editablePreview}
            sectionEyebrow={invitation.hero?.padrinosSectionEyebrow}
            sectionTitle={invitation.hero?.padrinosSectionTitle}
          />
        </S>
      </FeatureGate>

      <FeatureGate feature="showAccommodation" features={effectiveFeatures}>
        <S id="hotels">
          <Hospedaje
            hotels={invitation.hotels}
            theme={effectiveTheme}
            editablePreview={editablePreview}
            sectionEyebrow={invitation.hero?.hospedajeSectionEyebrow}
            sectionTitle={invitation.hero?.hospedajeSectionTitle}
          />
        </S>
      </FeatureGate>

      <FeatureGate feature="showHashtag" features={effectiveFeatures}>
        <S id="hashtag">
          <Hashtag
            social={invitation.social}
            imageUrl={galleryImages[1] || galleryImages[0]}
            theme={effectiveTheme}
            editablePreview={editablePreview}
          />
        </S>
      </FeatureGate>

      <FeatureGate feature="showRSVP" features={features}>
        {invitation.rsvpMode === 'passes_only' ? (
          <PassesOnlyNotice theme={effectiveTheme} />
        ) : (
          <RSVPForm
            invitationId={invitation.id}
            rsvpWhatsAppNumber={invitation.rsvpWhatsAppNumber}
            theme={effectiveTheme}
            eventTitle={invitation.title}
            eventDate={invitation.eventDate}
          />
        )}
      </FeatureGate>

      <FeatureGate feature="showWhatsApp" features={features}>
        {/* WhatsApp confirmation currently lives inside RSVP success state; no standalone WhatsApp UI exists yet. */}
      </FeatureGate>

      <FeatureGate feature="showGuestbook" features={features}>
        {/* Guestbook is a planned Platinum feature. No UI is rendered until persistence exists. */}
      </FeatureGate>

      <FeatureGate feature="showMessages" features={features}>
        {/* Messages are a planned Platinum feature. No UI is rendered until persistence exists. */}
      </FeatureGate>

      <FeatureGate feature="showFinalMessage" features={features}>
        <S id="message">
          <FinalMessage
            protagonists={protagonists}
            imageUrl={invitation.finalMessage.imageUrl ?? galleryImages[0]}
            quote={invitation.finalMessage.quote}
            message={invitation.finalMessage.message}
            title={invitation.finalMessage.title}
            signature={invitation.finalMessage.signature}
            theme={effectiveTheme}
            editablePreview={editablePreview}
          />
        </S>
      </FeatureGate>
      </MultilayerBackground>
    </ThemeProviderV2>
      </div>
    </div>
  );
}
