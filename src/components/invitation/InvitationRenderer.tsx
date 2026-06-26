'use client';

import React, { useEffect } from 'react';
import type { InvitationContent } from '@/domain/invitations/types';
import type { InvitationFeatures, InvitationPlan } from '@/domain/plans/types';
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
// Shown instead of the open RSVP form when rsvpMode === 'passes_only'.
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
}: InvitationRendererProps) {
  const protagonists = invitation.protagonists;
  const galleryImages = invitation.gallery.images;

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

  const handleEnterInvitation = () => {
    // Platinum: CinematicIntro calls this when user taps "Entrar"
  };

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

  return (
    <div
      className={`min-h-screen relative min-w-0 overflow-x-hidden transition-colors duration-1000 ${effectiveTheme.bodyText}`}
      data-render-mode={mode}
      data-plan-id={plan.id}
      data-theme-v2={themeV2.id}
      style={{ ...themeVariables, ...(themeV2.cssVariables as React.CSSProperties) }}
    >
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
      <MultilayerBackground theme={effectiveTheme} />

      {(effectiveTheme.paperTexture || themeV2.effects.paperTexture) && <div className="paper-noise" />}

      {!skipIntro && (
        <FeatureGate feature="showIntro" features={features}>
          <CinematicIntro
            protagonists={protagonists}
            title={invitation.title}
            subtitle={invitation.subtitle}
            eventDate={invitation.eventDate}
            theme={effectiveTheme}
            onEnter={handleEnterInvitation}
          />
        </FeatureGate>
      )}

      <FeatureGate feature="showMusic" features={features}>
        <BackgroundMusicPlayer key={invitation.music?.audioUrl} music={invitation.music} />
      </FeatureGate>

      <FeatureGate feature="showHero" features={features}>
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
              emotionalPhrase={invitation.hero?.emotionalPhrase ?? ''}
              imageUrl={invitation.hero?.imageUrl ?? ''}
              videoUrl={invitation.hero?.videoUrl}
              heroVideoUrl={heroVideoUrl}
              eventLabel={invitation.hero?.eventLabel || 'Nos casamos'}
              theme={effectiveTheme}
              editablePreview={editablePreview}
              connectorText={(invitation.hero as { connectorText?: string } | undefined)?.connectorText}
            />
          );
        })()}
      </FeatureGate>

      <FeatureGate feature="showCountdown" features={features}>
        <Countdown eventDate={invitation.eventDate} theme={effectiveTheme} />
      </FeatureGate>

      <FeatureGate feature="showParents" features={features}>
        <Parents parents={invitation.parents} theme={effectiveTheme} />
      </FeatureGate>

      <FeatureGate feature="showStoryBook" features={features}>
        <StoryBook slides={invitation.story.slides} theme={effectiveTheme} protagonists={protagonists} editablePreview={editablePreview} />
      </FeatureGate>

      <FeatureGate feature="showGallery" features={features}>
        <HorizontalGallery images={galleryImages} theme={effectiveTheme} />
      </FeatureGate>

      <FeatureGate feature="showTimeline" features={features}>
        <Timeline events={invitation.timeline} theme={effectiveTheme} editablePreview={editablePreview} />
      </FeatureGate>

      <FeatureGate feature="showItinerary" features={features}>
        <Itinerary items={invitation.itinerary} theme={effectiveTheme} editablePreview={editablePreview} />
      </FeatureGate>

      <FeatureGate feature="showMaps" features={features}>
        <Location location={invitation.location} theme={effectiveTheme} editablePreview={editablePreview} />
      </FeatureGate>

      <FeatureGate feature="showQRCode" features={features}>
        {/* QR is a planned feature flag. No public QR UI is rendered until a real component exists. */}
      </FeatureGate>

      <FeatureGate feature="showDressCode" features={features}>
        <DressCode dressCode={invitation.dressCode} theme={effectiveTheme} editablePreview={editablePreview} />
      </FeatureGate>

      <FeatureGate feature="showGiftRegistry" features={features}>
        <GiftRegistry items={invitation.giftRegistry.items} theme={effectiveTheme} editablePreview={editablePreview} />
      </FeatureGate>

      <FeatureGate feature="showPadrinos" features={features}>
        <Padrinos padrinos={invitation.padrinos} theme={effectiveTheme} editablePreview={editablePreview} />
      </FeatureGate>

      <FeatureGate feature="showAccommodation" features={features}>
        <Hospedaje hotels={invitation.hotels} theme={effectiveTheme} editablePreview={editablePreview} />
      </FeatureGate>

      <FeatureGate feature="showHashtag" features={features}>
        <Hashtag
          social={invitation.social}
          imageUrl={galleryImages[1] || galleryImages[0]}
          theme={effectiveTheme}
          editablePreview={editablePreview}
        />
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
      </FeatureGate>
    </ThemeProviderV2>
    </div>
  );
}
