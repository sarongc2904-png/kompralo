'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { InvitationContent } from '@/domain/invitations/types';
import type { PlanId } from '@/domain/plans/types';
import { getStepsForPlan } from './wizardSteps';
import { WizardReviewStep } from './WizardReviewStep';
import EditForm from './EditForm';
import MediaForm from './MediaForm';
import ProtagonistsForm from './ProtagonistsForm';
import ParentsForm from './ParentsForm';
import ItineraryForm from './ItineraryForm';
import LocationForm from './LocationForm';
import DressCodeForm from './DressCodeForm';
import GalleryForm from './GalleryForm';
import GiftRegistryForm from './GiftRegistryForm';
import { StoryBookForm } from './StoryBookForm';
import { TimelineForm } from './TimelineForm';
import { SponsorsForm } from './SponsorsForm';
import { AccommodationForm } from './AccommodationForm';
import { SocialForm } from './SocialForm';
import { FinalMessageForm } from './FinalMessageForm';
import { ThemeSelectorForm } from './ThemeSelectorForm';

const MSG_TYPE = 'KOMPRALO_PREVIEW_REFRESH';

type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

const SAVE_LABELS: Record<SaveStatus, string> = {
  idle:    '',
  pending: 'Sin guardar',
  saving:  'Guardando…',
  saved:   '✓ Guardado',
  error:   'Error — revisa el formulario',
};

const SAVE_COLORS: Record<SaveStatus, string> = {
  idle:    '#9B8878',
  pending: '#B99752',
  saving:  '#9B8878',
  saved:   '#388E3C',
  error:   '#C62828',
};

interface Props {
  invitation: InvitationContent;
  plan: PlanId;
  previewUrl: string;
}

export function WizardShell({ invitation, plan, previewUrl }: Props) {
  const steps = getStepsForPlan(plan);
  const stepKey = `kompralo:wizard-step:${invitation.id}`;
  const totalSteps = steps.length;

  const [stepIndex, setStepIndex] = useState(() => {
    if (typeof window === 'undefined') return 0;
    const saved = localStorage.getItem(stepKey);
    const idx = saved ? parseInt(saved, 10) : 0;
    return Number.isNaN(idx) || idx >= totalSteps ? 0 : idx;
  });

  const [saveStatus, setSaveStatus]               = useState<SaveStatus>('idle');
  const [isSavingAndAdvancing, setIsSaving]       = useState(false);

  const stepContentRef  = useRef<HTMLDivElement>(null);
  const draftTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSaveRef  = useRef(false);

  const currentStep     = steps[stepIndex];
  const isReviewStep    = currentStep?.id === 'review';
  const isLastContent   = stepIndex === totalSteps - 2;
  const progress        = ((stepIndex + 1) / totalSteps) * 100;

  // Persist current step index
  useEffect(() => {
    localStorage.setItem(stepKey, String(stepIndex));
  }, [stepIndex, stepKey]);

  // Listen for successful-save postMessages from form actions
  useEffect(() => {
    function onMessage(evt: MessageEvent) {
      if (evt.origin !== window.location.origin) return;
      if ((evt.data as { type?: string })?.type !== MSG_TYPE) return;
      setSaveStatus('saved');
      if (pendingSaveRef.current) {
        pendingSaveRef.current = false;
        if (advanceTimerRef.current) {
          clearTimeout(advanceTimerRef.current);
          advanceTimerRef.current = null;
        }
        setIsSaving(false);
        setStepIndex((i) => Math.min(i + 1, totalSteps - 1));
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [totalSteps]);

  // Draft autosave to localStorage (1.5 s debounce)
  useEffect(() => {
    const container = stepContentRef.current;
    if (!container || isReviewStep) return;
    const draftKey = `kompralo:draft:${invitation.id}:${currentStep?.id}`;

    function onInput() {
      setSaveStatus((s) => (s === 'idle' ? 'pending' : s));
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
      draftTimerRef.current = setTimeout(() => {
        if (!container) return;
        const els = container.querySelectorAll<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >('input, textarea, select');
        const draft: Record<string, string> = {};
        els.forEach((el) => { if (el.name) draft[el.name] = el.value; });
        try { localStorage.setItem(draftKey, JSON.stringify(draft)); } catch { /* quota */ }
      }, 1500);
    }

    container.addEventListener('input', onInput);
    return () => {
      container.removeEventListener('input', onInput);
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    };
  }, [stepIndex, currentStep?.id, invitation.id, isReviewStep]);

  const goTo = useCallback((idx: number) => {
    const target = Math.max(0, Math.min(idx, totalSteps - 1));
    pendingSaveRef.current = false;
    setIsSaving(false);
    if (advanceTimerRef.current) { clearTimeout(advanceTimerRef.current); advanceTimerRef.current = null; }
    setStepIndex(target);
    setSaveStatus('idle');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [totalSteps]);

  const handleSaveAndAdvance = useCallback(() => {
    const container = stepContentRef.current;
    if (!container) return;
    const forms = Array.from(container.querySelectorAll('form'));
    if (forms.length === 0) { goTo(stepIndex + 1); return; }

    setSaveStatus('saving');
    setIsSaving(true);
    pendingSaveRef.current = true;
    forms.forEach((f) => { try { f.requestSubmit(); } catch { /* noop */ } });

    // Timeout fallback if no KOMPRALO_PREVIEW_REFRESH within 7 s
    advanceTimerRef.current = setTimeout(() => {
      pendingSaveRef.current = false;
      setIsSaving(false);
      setSaveStatus('error');
    }, 7000);
  }, [stepIndex, goTo]);

  function renderContent() {
    if (!currentStep) return null;
    switch (currentStep.id) {
      case 'basics':
        return <EditForm invitation={invitation} />;

      case 'media':
        return <MediaForm invitation={invitation} plan={plan} />;

      case 'protagonists':
        return <ProtagonistsForm invitation={invitation} />;

      case 'itinerary':
        return <ItineraryForm invitation={invitation} />;

      case 'location':
        return <LocationForm invitation={invitation} />;

      case 'dresscode':
        return <DressCodeForm invitation={invitation} />;

      case 'gallery':
        return <GalleryForm invitation={invitation} />;

      case 'story':
        return (
          <StoryBookForm
            invitationId={invitation.id}
            slug={invitation.slug}
            initialSlides={invitation.story.slides.map((s) => ({
              id:       s.id,
              title:    s.title,
              subtitle: s.subtitle ?? '',
              text:     s.text,
              imageUrl: s.imageUrl,
              date:     s.date ?? '',
            }))}
          />
        );

      case 'timeline':
        return (
          <TimelineForm
            invitationId={invitation.id}
            slug={invitation.slug}
            initialEvents={invitation.timeline.map((e) => ({
              id:          e.id,
              year:        e.year,
              title:       e.title,
              description: e.description,
              imageUrl:    e.imageUrl ?? '',
            }))}
          />
        );

      case 'gifts':
        return <GiftRegistryForm invitation={invitation} />;

      case 'sponsors':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {(invitation.category === 'wedding' || !invitation.category) && (
              <ParentsForm invitation={invitation} />
            )}
            <SponsorsForm
              invitationId={invitation.id}
              slug={invitation.slug}
              initialPadrinos={invitation.padrinos.map((p) => ({
                id:    p.id,
                rubro: p.rubro,
                icon:  p.icon,
                names: p.names,
              }))}
            />
          </div>
        );

      case 'accommodation':
        return (
          <AccommodationForm
            invitationId={invitation.id}
            slug={invitation.slug}
            initialHotels={invitation.hotels.map((h) => ({
              id:          h.id,
              name:        h.name,
              stars:       h.stars,
              address:     h.address,
              distance:    h.distance,
              priceRange:  h.priceRange,
              phone:       h.phone       ?? '',
              bookingLink: h.bookingLink ?? '',
              imageUrl:    h.imageUrl    ?? '',
              description: h.description ?? '',
            }))}
          />
        );

      case 'social':
        return (
          <SocialForm
            invitationId={invitation.id}
            slug={invitation.slug}
            initialSocial={{
              hashtag:         invitation.social.hashtag              ?? '',
              instagramHandle: invitation.social.instagramHandle      ?? '',
              tiktokHandle:    invitation.social.tiktokHandle         ?? '',
              facebookUrl:     invitation.social.facebookUrl          ?? '',
              youtubeUrl:      invitation.social.youtubeUrl           ?? '',
              note:            invitation.social.note                 ?? '',
            }}
          />
        );

      case 'final':
        return (
          <FinalMessageForm
            invitationId={invitation.id}
            slug={invitation.slug}
            initial={{
              title:     invitation.finalMessage.title     ?? '',
              message:   invitation.finalMessage.message   ?? '',
              quote:     invitation.finalMessage.quote     ?? '',
              imageUrl:  invitation.finalMessage.imageUrl  ?? '',
              signature: invitation.finalMessage.signature ?? '',
            }}
            protagonists={invitation.protagonists.map((p) => ({
              id:          p.id,
              name:        p.name,
              role:        p.role        ?? '',
              familyLabel: p.familyLabel ?? '',
              imageUrl:    p.imageUrl    ?? '',
              quote:       p.quote       ?? '',
            }))}
          />
        );

      case 'theme':
        return (
          <ThemeSelectorForm
            invitationId={invitation.id}
            slug={invitation.slug}
            currentThemeId={invitation.themeId}
          />
        );

      case 'review':
        return (
          <WizardReviewStep
            invitation={invitation}
            plan={plan}
            previewUrl={previewUrl}
          />
        );

      default:
        return null;
    }
  }

  return (
    <div>
      {/* Hide redundant form action buttons while inside wizard */}
      <style>{`
        [data-wizard-content] button[type="submit"] { display: none !important; }
        [data-wizard-content] a[href*="/preview/"]  { display: none !important; }
        [data-wizard-content] a[href*="/dashboard/invitations"] { display: none !important; }
      `}</style>

      {/* ── Progress header ── */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E8E2DA',
          borderRadius: 12,
          padding: '20px 20px 16px',
          marginBottom: 24,
        }}
      >
        {/* Title row + preview link */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#C5A880' }}>
              Paso {stepIndex + 1} de {totalSteps}
            </p>
            <h2 style={{ margin: '4px 0 0', fontSize: '1rem', fontWeight: 600, color: '#1A1410', lineHeight: 1.25 }}>
              {currentStep?.title}
            </h2>
            {saveStatus !== 'idle' && (
              <span style={{ fontSize: '0.68rem', fontWeight: 500, color: SAVE_COLORS[saveStatus], display: 'block', marginTop: 3 }}>
                {SAVE_LABELS[saveStatus]}
              </span>
            )}
          </div>
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Ver previsualización"
            style={{
              flexShrink: 0,
              padding: '6px 10px',
              borderRadius: 8,
              fontSize: '0.75rem',
              fontWeight: 600,
              background: '#F5F0E8',
              color: '#8A6D3B',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              border: '1px solid #E8DFD5',
              whiteSpace: 'nowrap',
            }}
          >
            ✨ Preview
          </a>
        </div>

        {/* Progress bar */}
        <div style={{ background: '#F0EBE3', borderRadius: 9999, height: 6, overflow: 'hidden', marginBottom: 12 }}>
          <div
            style={{
              height: '100%',
              borderRadius: 9999,
              background: '#C5A880',
              width: `${progress}%`,
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        {/* Step chips */}
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 2 }}>
          {steps.map((step, idx) => (
            <button
              key={step.id}
              type="button"
              onClick={() => goTo(idx)}
              style={{
                flexShrink: 0,
                padding: '4px 10px',
                borderRadius: 8,
                fontSize: '0.68rem',
                fontWeight: idx === stepIndex ? 600 : 500,
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                background: idx === stepIndex ? '#1A1410' : idx < stepIndex ? '#E8F5E9' : '#F5F3F0',
                color:      idx === stepIndex ? '#F5F3F0' : idx < stepIndex ? '#2E7D32' : '#9B8878',
              }}
            >
              {idx < stepIndex ? `✓ ${step.shortTitle}` : step.shortTitle}
            </button>
          ))}
        </div>
      </div>

      {/* ── Step content — key remounts on step change ── */}
      <div key={stepIndex} ref={stepContentRef} data-wizard-content="true">
        {renderContent()}
      </div>

      {/* ── Navigation ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 32, marginBottom: 48, alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => goTo(stepIndex - 1)}
          disabled={stepIndex === 0}
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            fontSize: '0.875rem',
            fontWeight: 500,
            border: 'none',
            cursor: stepIndex === 0 ? 'not-allowed' : 'pointer',
            background: '#F5F3F0',
            color: '#6B5B4E',
            opacity: stepIndex === 0 ? 0.4 : 1,
          }}
        >
          ← Anterior
        </button>

        {!isReviewStep && (
          <button
            type="button"
            onClick={handleSaveAndAdvance}
            disabled={isSavingAndAdvancing}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              fontSize: '0.875rem',
              fontWeight: 600,
              border: 'none',
              cursor: isSavingAndAdvancing ? 'not-allowed' : 'pointer',
              background: isSavingAndAdvancing ? '#9B8878' : '#1A1410',
              color: '#F5F3F0',
              opacity: isSavingAndAdvancing ? 0.7 : 1,
            }}
          >
            {isSavingAndAdvancing
              ? 'Guardando…'
              : isLastContent
                ? 'Guardar y revisar →'
                : 'Guardar y avanzar →'}
          </button>
        )}

      </div>
    </div>
  );
}
