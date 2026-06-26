'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { wizardQuickSetup } from '@/app/actions/wizard-quick-setup';
import type { WizardMinimalInput, WizardStyle } from '@/lib/invitations/generate-smart-defaults';
import { WizardWhatsAppShareLink } from '@/components/wizard/WizardWhatsAppShareLink';

interface Props {
  invitationId: string;
  invitationTitle?: string;
  isCompleted?: boolean;
  publicUrl?: string | null;
  editorUrl?: string;
  dashboardUrl?: string;
}

const TOTAL_STEPS = 5;

const STYLES: Array<{ id: WizardStyle; label: string; description: string; swatches: [string, string] }> = [
  { id: 'editorial', label: 'Editorial', description: 'Marfil y dorado suave', swatches: ['#FBF7EF', '#C8A75D'] },
  { id: 'romantico', label: 'Romántico', description: 'Rosa pastel y champagne', swatches: ['#FFF7F8', '#B76E79'] },
  { id: 'minimalista', label: 'Minimalista', description: 'Limpio y luminoso', swatches: ['#FAF8F6', '#BDAE9A'] },
  { id: 'floral', label: 'Floral', description: 'Verde sage y blush', swatches: ['#F8FAF7', '#A8BFAA'] },
  { id: 'moderno', label: 'Moderno', description: 'Celeste suave editorial', swatches: ['#F5FAFF', '#6F8FBF'] },
];

export function QuickSetupWizard({
  invitationId,
  invitationTitle,
  isCompleted = false,
  publicUrl,
  editorUrl = `/dashboard/invitations/${invitationId}/edit`,
  dashboardUrl = `/cliente/invitaciones/${invitationId}`,
}: Props) {
  const [step, setStep] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [savedPublicUrl, setSavedPublicUrl] = useState<string | null>(publicUrl ?? null);

  const [noviaName, setNoviaName] = useState('');
  const [novioName, setNovioName] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [eventTime, setEventTime] = useState('18:00');
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [showMapLinks, setShowMapLinks] = useState(false);
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [wazeUrl, setWazeUrl] = useState('');

  const [style, setStyle] = useState<WizardStyle>('editorial');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [heroMessage, setHeroMessage] = useState('');

  const [dressCodeType, setDressCodeType] = useState('Formal');
  const [rsvpMode, setRsvpMode] = useState<'open' | 'passes_only'>('open');
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [mesaRegalosType] = useState<WizardMinimalInput['mesaRegalosType']>('ninguna');

  const hasNames = noviaName.trim().length > 0 && novioName.trim().length > 0;
  const hasDatePlace =
    weddingDate.length > 0 &&
    eventTime.length > 0 &&
    venueName.trim().length > 0 &&
    venueAddress.trim().length > 0;
  const canSubmit = hasNames && hasDatePlace;

  function goTo(nextStep: number) {
    setErrorMsg(null);
    setStep(Math.max(0, Math.min(TOTAL_STEPS - 1, nextStep)));
  }

  function submitWizard() {
    if (!canSubmit) {
      setErrorMsg('Completa nombres, fecha, hora, lugar y dirección para crear tu invitación.');
      setStep(hasNames ? 2 : 1);
      return;
    }

    const input: WizardMinimalInput = {
      novioName: novioName.trim(),
      noviaName: noviaName.trim(),
      weddingDate,
      style,
      ceremonyType: 'civil_e_iglesia',
      civilAlreadyDone: false,
      ceremonyLocation: venueName.trim(),
      ceremonyTime: eventTime,
      receptionLocation: venueName.trim(),
      receptionTime: eventTime,
      venueName: venueName.trim(),
      venueAddress: venueAddress.trim(),
      googleMapsUrl: googleMapsUrl.trim(),
      wazeUrl: wazeUrl.trim(),
      coverImageUrl: coverImageUrl.trim(),
      heroMessage: heroMessage.trim(),
      dressCodeType: dressCodeType.trim(),
      rsvpMode,
      whatsappMessage: whatsappMessage.trim(),
      mesaRegalosType,
      notasNinos: null,
    };

    setErrorMsg(null);
    startTransition(async () => {
      const result = await wizardQuickSetup(invitationId, input);
      if (result.ok) {
        if (result.publicUrl) setSavedPublicUrl(result.publicUrl);
        setSaved(true);
        return;
      }
      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
        return;
      }
      setErrorMsg(result.error ?? 'No pudimos guardar el wizard. Intenta de nuevo.');
    });
  }

  if (saved) {
    return (
      <main style={shellStyle}>
        <section style={successCardStyle}>
          <p style={eyebrowStyle}>KOMPRALO</p>
          <h1 style={successTitleStyle}>Tu invitación ya está lista</h1>
          <p style={mutedStyle}>Entra a Mi Evento para compartirla, revisar RSVP y completar detalles cuando quieras.</p>

          <div style={{ display: 'grid', gap: 12, marginTop: 24 }}>
            <Link href={dashboardUrl} style={primaryLinkStyle}>Ir a Mi Evento</Link>
            {savedPublicUrl && <Link href={savedPublicUrl} style={secondaryLinkStyle}>Ver mi invitación</Link>}
            <WizardWhatsAppShareLink publicPath={savedPublicUrl} style={secondaryLinkStyle} />
            <Link href={editorUrl} style={secondaryLinkStyle}>Personalizar más</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main style={shellStyle}>
      <style>{wizardResponsiveCss}</style>
      <section style={cardStyle}>
        <div style={{ marginBottom: 18, textAlign: 'center' }}>
          {invitationTitle && <p style={eyebrowStyle}>{invitationTitle}</p>}
          <Progress step={step} />
        </div>

        {step === 0 && (
          <StepFrame
            title={isCompleted ? 'Actualiza tu invitación' : 'Hagamos tu invitación en minutos'}
            subtitle="Te haremos pocas preguntas y al final guardaremos todo en tu invitación real."
            preview={<WizardLivePreview step={step} noviaName={noviaName} novioName={novioName} weddingDate={weddingDate} eventTime={eventTime} venueName={venueName} styleId={style} heroMessage={heroMessage} />}
          >
            <button type="button" onClick={() => goTo(1)} style={primaryButtonStyle}>
              Comenzar
            </button>
          </StepFrame>
        )}

        {step === 1 && (
          <StepFrame
            title="¿Quiénes se casan?"
            subtitle="Esto crea el título y la portada base de la invitación."
            preview={<WizardLivePreview step={step} noviaName={noviaName} novioName={novioName} weddingDate={weddingDate} eventTime={eventTime} venueName={venueName} styleId={style} heroMessage={heroMessage} />}
          >
            <Field label="Novia" value={noviaName} onChange={setNoviaName} placeholder="Sofía" />
            <Field label="Novio" value={novioName} onChange={setNovioName} placeholder="Alejandro" />
            <NavButtons onBack={() => goTo(0)} onNext={() => goTo(2)} nextLabel="Continuar" disabled={!hasNames} />
          </StepFrame>
        )}

        {step === 2 && (
          <StepFrame
            title="¿Cuándo y dónde?"
            subtitle="Con esto tus invitados ya sabrán lo esencial del evento."
            preview={<WizardLivePreview step={step} noviaName={noviaName} novioName={novioName} weddingDate={weddingDate} eventTime={eventTime} venueName={venueName} styleId={style} heroMessage={heroMessage} />}
          >
            <div style={twoColumnStyle}>
              <Field label="Fecha" type="date" value={weddingDate} onChange={setWeddingDate} />
              <Field label="Hora" type="time" value={eventTime} onChange={setEventTime} />
            </div>
            <Field label="Lugar" value={venueName} onChange={setVenueName} placeholder="Hacienda, jardín o salón" />
            <Field label="Dirección" value={venueAddress} onChange={setVenueAddress} placeholder="Calle, ciudad, estado" />
            <button type="button" onClick={() => setShowMapLinks((current) => !current)} style={plainButtonStyle}>
              {showMapLinks ? 'Ocultar links de mapas' : 'Agregar Maps/Waze opcional'}
            </button>
            {showMapLinks && (
              <div style={{ marginTop: 12 }}>
                <Field label="Google Maps URL opcional" value={googleMapsUrl} onChange={setGoogleMapsUrl} placeholder="https://maps.google.com/..." />
                <Field label="Waze URL opcional" value={wazeUrl} onChange={setWazeUrl} placeholder="https://waze.com/..." />
              </div>
            )}
            <NavButtons onBack={() => goTo(1)} onNext={() => goTo(3)} nextLabel="Continuar" disabled={!hasDatePlace} />
          </StepFrame>
        )}

        {step === 3 && (
          <StepFrame
            title="Elige el estilo"
            subtitle="Selecciona una dirección visual. Después podrás personalizar más."
            preview={<WizardLivePreview step={step} noviaName={noviaName} novioName={novioName} weddingDate={weddingDate} eventTime={eventTime} venueName={venueName} styleId={style} heroMessage={heroMessage} />}
          >
            <div style={styleGridStyle}>
              {STYLES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setStyle(item.id)}
                  style={{
                    ...styleButtonStyle,
                    borderColor: style === item.id ? '#B99752' : '#E8DED2',
                    background: style === item.id ? '#FFF9EF' : '#FFFFFF',
                  }}
                >
                  <span style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 8 }}>
                    <span style={{ ...swatchStyle, background: item.swatches[0] }} />
                    <span style={{ ...swatchStyle, background: item.swatches[1] }} />
                  </span>
                  <strong style={{ display: 'block', color: '#3D2B1A', fontSize: 13 }}>{item.label}</strong>
                  <span style={{ color: '#8A7663', fontSize: 11 }}>{item.description}</span>
                </button>
              ))}
            </div>
            <TextArea label="Mensaje de portada opcional" value={heroMessage} onChange={setHeroMessage} placeholder="Dos almas, un destino" />
            <details style={detailsStyle}>
              <summary style={{ cursor: 'pointer', color: '#6B5137', fontSize: 13, fontWeight: 750 }}>Tengo URL de foto de portada</summary>
              <div style={{ marginTop: 12 }}>
                <Field label="URL de portada opcional" value={coverImageUrl} onChange={setCoverImageUrl} placeholder="https://..." />
              </div>
            </details>
            <NavButtons onBack={() => goTo(2)} onNext={() => goTo(4)} nextLabel="Continuar" />
          </StepFrame>
        )}

        {step === 4 && (
          <StepFrame
            title="Revisar y activar"
            subtitle="Guardaremos todo al pulsar el botón final. Podrás editar cualquier detalle después."
            preview={<WizardLivePreview step={step} noviaName={noviaName} novioName={novioName} weddingDate={weddingDate} eventTime={eventTime} venueName={venueName} styleId={style} heroMessage={heroMessage} />}
          >
            <Field label="Dress code" value={dressCodeType} onChange={setDressCodeType} placeholder="Formal" />
            <p style={labelStyle}>RSVP</p>
            <div style={segmentedStyle}>
              <ChoiceButton active={rsvpMode === 'open'} onClick={() => setRsvpMode('open')} title="Libre" subtitle="Confirmación simple para invitados." />
              <ChoiceButton active={rsvpMode === 'passes_only'} onClick={() => setRsvpMode('passes_only')} title="Controlada" subtitle="Control básico por invitación. QR se configura aparte si tu plan lo permite." />
            </div>
            <TextArea label="Mensaje de WhatsApp opcional" value={whatsappMessage} onChange={setWhatsappMessage} placeholder="Nos encantará celebrar contigo." />
            <div style={summaryStyle}>
              <p style={{ ...labelStyle, marginBottom: 8 }}>Resumen</p>
              <p style={summaryLineStyle}>{noviaName || 'Novia'} & {novioName || 'Novio'}</p>
              <p style={summaryMutedStyle}>{weddingDate || 'Fecha pendiente'} · {eventTime || 'Hora pendiente'}</p>
              <p style={summaryMutedStyle}>{venueName || 'Lugar pendiente'}</p>
            </div>
            {errorMsg && <p style={errorStyle}>{errorMsg}</p>}
            <NavButtons
              onBack={() => goTo(3)}
              onNext={submitWizard}
              nextLabel={isPending ? 'Guardando...' : isCompleted ? 'Actualizar invitación' : 'Crear mi invitación'}
              disabled={isPending || !canSubmit}
            />
          </StepFrame>
        )}
      </section>
    </main>
  );
}

function Progress({ step }: { step: number }) {
  return (
    <div>
      <p style={{ ...labelStyle, marginBottom: 10 }}>Paso {step + 1} de {TOTAL_STEPS}</p>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${TOTAL_STEPS}, 1fr)`, gap: 8 }}>
        {Array.from({ length: TOTAL_STEPS }, (_, index) => (
          <div key={index} style={{ height: 7, borderRadius: 99, background: index <= step ? '#C5A880' : '#E8DED2' }} />
        ))}
      </div>
    </div>
  );
}

function StepFrame({
  title,
  subtitle,
  preview,
  children,
}: {
  title: string;
  subtitle: string;
  preview: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <StepHeading title={title} subtitle={subtitle} />
      <div className="wizard-step-body">
        <div className="wizard-preview-pane">{preview}</div>
        <div className="wizard-fields-pane">{children}</div>
      </div>
    </div>
  );
}

function WizardLivePreview({
  step,
  noviaName,
  novioName,
  weddingDate,
  eventTime,
  venueName,
  styleId,
  heroMessage,
}: {
  step: number;
  noviaName: string;
  novioName: string;
  weddingDate: string;
  eventTime: string;
  venueName: string;
  styleId: WizardStyle;
  heroMessage: string;
}) {
  const styleMeta = STYLES.find((item) => item.id === styleId) ?? STYLES[0];
  const names = noviaName || novioName ? `${noviaName || 'Novia'} & ${novioName || 'Novio'}` : step === 0 ? 'Sofía & Alejandro' : 'Tu boda';
  const dateLabel = weddingDate || (step === 0 ? '25 de junio de 2026' : 'Fecha por definir');
  const timeLabel = eventTime || 'Hora por definir';
  const placeLabel = venueName || (step === 0 ? 'Hacienda Kompralo' : 'Lugar por confirmar');
  const phrase = heroMessage.trim() || (step === 0 ? 'Dos almas, un destino' : 'Tu frase de portada aparecerá aquí');
  const stepLabel = ['Ejemplo elegante', 'Portada', 'Fecha y lugar', styleMeta.label, 'Resumen'][step] ?? 'Preview';

  return (
    <div style={{ ...previewStyle, background: `linear-gradient(145deg, ${styleMeta.swatches[0]} 0%, #FFFFFF 62%, #FBF7EF 100%)` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', marginBottom: 14 }}>
        <p style={{ ...previewEyebrowStyle, marginBottom: 0 }}>{stepLabel}</p>
        <span style={{ display: 'inline-flex', gap: 5 }}>
          <span style={{ ...swatchStyle, width: 15, height: 15, background: styleMeta.swatches[0] }} />
          <span style={{ ...swatchStyle, width: 15, height: 15, background: styleMeta.swatches[1] }} />
        </span>
      </div>
      <p style={previewEyebrowStyle}>{styleMeta.description}</p>
      <h3 style={previewTitleStyle}>{names}</h3>
      <p style={previewPhraseStyle}>{phrase}</p>
      <div style={previewDividerStyle} />
      <div style={previewDetailsGridStyle}>
        <div>
          <strong style={previewDetailLabelStyle}>Fecha</strong>
          <span style={previewMutedStyle}>{dateLabel}</span>
        </div>
        <div>
          <strong style={previewDetailLabelStyle}>Hora</strong>
          <span style={previewMutedStyle}>{timeLabel}</span>
        </div>
      </div>
      <p style={{ ...previewMutedStyle, marginTop: 12 }}>{placeLabel}</p>
    </div>
  );
}

function StepHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: 18, textAlign: 'center' }}>
      <h2 style={{ color: '#3D2B1A', fontSize: 26, lineHeight: 1.1, fontWeight: 680, marginBottom: 8 }}>{title}</h2>
      <p style={{ color: '#8A7663', fontSize: 14, lineHeight: 1.5 }}>{subtitle}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label style={{ display: 'block', marginBottom: 14 }}>
      <span style={labelStyle}>{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} style={inputStyle} />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label style={{ display: 'block', marginBottom: 14 }}>
      <span style={labelStyle}>{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
    </label>
  );
}

function ChoiceButton({
  active,
  onClick,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: `1.5px solid ${active ? '#B99752' : '#E8DED2'}`,
        background: active ? '#FFF9EF' : '#FFFFFF',
        borderRadius: 14,
        padding: '13px 14px',
        textAlign: 'left',
        cursor: 'pointer',
      }}
    >
      <strong style={{ display: 'block', color: '#3D2B1A', fontSize: 14 }}>{title}</strong>
      <span style={{ color: '#8A7663', fontSize: 12 }}>{subtitle}</span>
    </button>
  );
}

function NavButtons({
  onBack,
  onNext,
  nextLabel,
  disabled = false,
}: {
  onBack: () => void;
  onNext: () => void;
  nextLabel: string;
  disabled?: boolean;
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 10, marginTop: 22 }}>
      <button type="button" onClick={onBack} style={backButtonStyle}>Atrás</button>
      <button type="button" onClick={onNext} disabled={disabled} style={{ ...primaryButtonStyle, marginTop: 0, opacity: disabled ? 0.55 : 1 }}>{nextLabel}</button>
    </div>
  );
}

const wizardResponsiveCss = `
  .wizard-step-body {
    display: grid;
    gap: 18px;
  }

  .wizard-fields-pane {
    min-width: 0;
  }

  @media (min-width: 860px) {
    .wizard-step-body {
      grid-template-columns: minmax(0, 1fr) 340px;
      align-items: start;
      gap: 28px;
    }

    .wizard-fields-pane {
      order: 1;
    }

    .wizard-preview-pane {
      order: 2;
      position: sticky;
      top: 24px;
    }
  }
`;

const shellStyle: React.CSSProperties = {
  minHeight: '100vh',
  width: '100%',
  background: 'linear-gradient(180deg, #FFFDF8 0%, #F6F2EC 100%)',
  padding: '18px 12px',
};

const cardStyle: React.CSSProperties = {
  maxWidth: 940,
  margin: '0 auto',
  background: '#FFFCF7',
  border: '1px solid #E8DED2',
  borderRadius: 28,
  boxShadow: '0 24px 70px rgba(72, 55, 38, 0.10)',
  padding: '22px 16px',
};

const successCardStyle: React.CSSProperties = {
  ...cardStyle,
  textAlign: 'center',
  padding: '34px 18px',
};

const eyebrowStyle: React.CSSProperties = {
  color: '#B99752',
  fontSize: 11,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  marginBottom: 8,
};

const successTitleStyle: React.CSSProperties = {
  color: '#3D2B1A',
  fontSize: 31,
  lineHeight: 1.08,
  fontWeight: 680,
  marginBottom: 10,
};

const mutedStyle: React.CSSProperties = {
  color: '#8A7663',
  fontSize: 14,
  lineHeight: 1.5,
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  color: '#8A7663',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  marginBottom: 7,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  color: '#3D2B1A',
  background: '#FFFFFF',
  border: '1px solid #E8DED2',
  borderRadius: 16,
  fontSize: 16,
  padding: '15px 14px',
  outlineColor: '#C5A880',
};

const twoColumnStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: 10,
};

const styleGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 10,
  marginBottom: 18,
};

const styleButtonStyle: React.CSSProperties = {
  border: '1.5px solid #E8DED2',
  borderRadius: 16,
  padding: '15px 10px',
  cursor: 'pointer',
};

const swatchStyle: React.CSSProperties = {
  width: 22,
  height: 22,
  borderRadius: 999,
  border: '1px solid rgba(61, 43, 26, 0.10)',
};

const segmentedStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: 8,
  marginBottom: 14,
};

const primaryButtonStyle: React.CSSProperties = {
  width: '100%',
  marginTop: 18,
  border: 'none',
  borderRadius: 16,
  background: '#C5A880',
  color: '#2F2418',
  cursor: 'pointer',
  fontSize: 15,
  fontWeight: 800,
  padding: '15px 18px',
};

const backButtonStyle: React.CSSProperties = {
  border: '1px solid #E8DED2',
  borderRadius: 16,
  background: '#FFFFFF',
  color: '#8A7663',
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 700,
  padding: '15px 12px',
};

const plainButtonStyle: React.CSSProperties = {
  border: 'none',
  background: 'transparent',
  color: '#6B5137',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 750,
  padding: '4px 0',
};

const detailsStyle: React.CSSProperties = {
  background: '#F8F2E8',
  border: '1px solid #E8DED2',
  borderRadius: 16,
  padding: 14,
  marginBottom: 14,
};

const summaryStyle: React.CSSProperties = {
  background: '#F8F2E8',
  border: '1px solid #E8DED2',
  borderRadius: 18,
  padding: 16,
  marginTop: 16,
};

const summaryLineStyle: React.CSSProperties = {
  color: '#3D2B1A',
  fontSize: 18,
  fontWeight: 700,
  marginBottom: 4,
};

const summaryMutedStyle: React.CSSProperties = {
  color: '#8A7663',
  fontSize: 13,
  lineHeight: 1.5,
};

const errorStyle: React.CSSProperties = {
  color: '#9F2A2A',
  background: '#FFF0F0',
  border: '1px solid #F0CACA',
  borderRadius: 14,
  padding: 12,
  fontSize: 13,
  marginTop: 14,
};

const previewStyle: React.CSSProperties = {
  border: '1px solid #E8DED2',
  borderRadius: 24,
  padding: '22px 16px',
  textAlign: 'center',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.75)',
};

const previewEyebrowStyle: React.CSSProperties = {
  color: '#B99752',
  fontSize: 11,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  marginBottom: 8,
};

const previewTitleStyle: React.CSSProperties = {
  color: '#3D2B1A',
  fontSize: 25,
  lineHeight: 1.1,
  fontWeight: 540,
  marginBottom: 8,
};

const previewMutedStyle: React.CSSProperties = {
  display: 'block',
  color: '#8A7663',
  fontSize: 13,
};

const previewPhraseStyle: React.CSSProperties = {
  color: '#6B5137',
  fontSize: 14,
  fontStyle: 'italic',
  lineHeight: 1.5,
  margin: '8px auto 0',
  maxWidth: 260,
};

const previewDividerStyle: React.CSSProperties = {
  width: 48,
  height: 1,
  background: '#D9C8AE',
  margin: '16px auto',
};

const previewDetailsGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 10,
  textAlign: 'center',
};

const previewDetailLabelStyle: React.CSSProperties = {
  display: 'block',
  color: '#B99752',
  fontSize: 10,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  marginBottom: 4,
};

const primaryLinkStyle: React.CSSProperties = {
  display: 'block',
  borderRadius: 16,
  background: '#C5A880',
  color: '#2F2418',
  fontWeight: 800,
  padding: '15px 18px',
  textDecoration: 'none',
};

const secondaryLinkStyle: React.CSSProperties = {
  display: 'block',
  borderRadius: 16,
  background: '#FFFFFF',
  border: '1px solid #E8DED2',
  color: '#6B5137',
  fontWeight: 750,
  padding: '14px 18px',
  textDecoration: 'none',
};
