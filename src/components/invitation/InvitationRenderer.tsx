'use client';

import React, { useState } from 'react';
import type { InvitationContent } from '@/domain/invitations/types';
import type { InvitationFeatures, InvitationPlan } from '@/domain/plans/types';
import { createThemeCssVariables, type Theme } from '@/domain/themes/types';
import { resolveTheme, ThemeProviderV2 } from '@/domain/themes-v2';
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
import MusicController from '@/components/invitation/MusicController';
import Padrinos from '@/components/invitation/Padrinos';
import Parents from '@/components/invitation/Parents';
import RSVPForm from '@/components/invitation/RSVPForm';
import StoryBook from '@/components/invitation/StoryBook';
import Timeline from '@/components/invitation/Timeline';

export type InvitationRenderMode = 'public' | 'preview' | 'dev';

interface InvitationRendererProps {
  invitation: InvitationContent;
  theme: Theme;
  plan: InvitationPlan;
  features: InvitationFeatures;
  mode?: InvitationRenderMode;
}

export default function InvitationRenderer({
  invitation,
  theme,
  plan,
  features,
  mode = 'public',
}: InvitationRendererProps) {
  const [musicTrigger, setMusicTrigger] = useState(false);
  const protagonists = invitation.protagonists;
  const galleryImages = invitation.gallery.images;
  const themeVariables = createThemeCssVariables(theme);

  // V2 theme — resolved from the invitation's themeId.
  // CSS vars are merged onto the root div; context is available via useThemeV2().
  const themeV2 = resolveTheme(invitation.themeId);

  const handleEnterInvitation = () => {
    setMusicTrigger(true);
  };

  return (
    <div
      className={`min-h-screen relative min-w-0 overflow-x-hidden transition-colors duration-1000 ${theme.bodyText}`}
      data-render-mode={mode}
      data-plan-id={plan.id}
      data-theme-v2={themeV2.id}
      style={{ ...themeVariables, ...(themeV2.cssVariables as React.CSSProperties) }}
    >
    <ThemeProviderV2 theme={themeV2} injectCssVariables={false}>
      <MultilayerBackground theme={theme} />

      {theme.paperTexture && <div className="paper-noise" />}

      <FeatureGate feature="showIntro" features={features}>
        <CinematicIntro
          protagonists={protagonists}
          title={invitation.title}
          subtitle={invitation.subtitle}
          eventDate={invitation.eventDate}
          theme={theme}
          onEnter={handleEnterInvitation}
        />
      </FeatureGate>

      <FeatureGate feature="showMusic" features={features}>
        <MusicController
          audioUrl={invitation.music.audioUrl}
          theme={theme}
          autoPlayTrigger={musicTrigger || !features.showIntro}
        />
      </FeatureGate>

      <FeatureGate feature="showHero" features={features}>
        <Hero
          protagonists={protagonists}
          eventDate={invitation.eventDate}
          emotionalPhrase={invitation.hero.emotionalPhrase}
          imageUrl={invitation.hero.imageUrl}
          videoUrl={invitation.hero.videoUrl}
          eventLabel={invitation.hero.eventLabel}
          theme={theme}
        />
      </FeatureGate>

      <FeatureGate feature="showCountdown" features={features}>
        <Countdown eventDate={invitation.eventDate} theme={theme} />
      </FeatureGate>

      <FeatureGate feature="showParents" features={features}>
        <Parents parents={invitation.parents} protagonists={protagonists} theme={theme} />
      </FeatureGate>

      <FeatureGate feature="showStoryBook" features={features}>
        <StoryBook slides={invitation.story.slides} theme={theme} protagonists={protagonists} />
      </FeatureGate>

      <FeatureGate feature="showGallery" features={features}>
        <HorizontalGallery images={galleryImages} theme={theme} />
      </FeatureGate>

      <FeatureGate feature="showTimeline" features={features}>
        <Timeline events={invitation.timeline} theme={theme} />
      </FeatureGate>

      <FeatureGate feature="showItinerary" features={features}>
        <Itinerary items={invitation.itinerary} theme={theme} />
      </FeatureGate>

      <FeatureGate feature="showMaps" features={features}>
        <Location location={invitation.location} theme={theme} />
      </FeatureGate>

      <FeatureGate feature="showQRCode" features={features}>
        {/* QR is a planned feature flag. No public QR UI is rendered until a real component exists. */}
      </FeatureGate>

      <FeatureGate feature="showDressCode" features={features}>
        <DressCode dressCode={invitation.dressCode} theme={theme} />
      </FeatureGate>

      <FeatureGate feature="showGiftRegistry" features={features}>
        <GiftRegistry items={invitation.giftRegistry.items} theme={theme} />
      </FeatureGate>

      <FeatureGate feature="showPadrinos" features={features}>
        <Padrinos padrinos={invitation.padrinos} theme={theme} />
      </FeatureGate>

      <FeatureGate feature="showAccommodation" features={features}>
        <Hospedaje hotels={invitation.hotels} theme={theme} />
      </FeatureGate>

      <FeatureGate feature="showHashtag" features={features}>
        <Hashtag
          social={invitation.social}
          imageUrl={galleryImages[1] || galleryImages[0]}
          theme={theme}
        />
      </FeatureGate>

      <FeatureGate feature="showRSVP" features={features}>
        <RSVPForm invitationId={invitation.id} rsvpWhatsAppNumber={invitation.rsvpWhatsAppNumber} theme={theme} />
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
          theme={theme}
        />
      </FeatureGate>
    </ThemeProviderV2>
    </div>
  );
}
