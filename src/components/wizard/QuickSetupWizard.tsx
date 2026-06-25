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

const STYLES: Array<{ id: WizardStyle; label: string; description: string; swatches: [string, string] }> = [
  { id: 'editorial', label: 'Editorial', description: 'Marfil, dorado suave', swatches: ['#FBF7EF', '#C8A75D'] },
  { id: 'romantico', label: 'Romántico', description: 'Rosa pastel, champagne', swatches: ['#FFF7F8', '#B76E79'] },
  { id: 'minimalista', label: 'Minimalista', description: 'Limpio y luminoso', swatches: ['#FAF8F6', '#BDAE9A'] },
  { id: 'floral', label: 'Floral', description: 'Verde sage, blush', swatches: ['#F8FAF7', '#A8BFAA'] },
  { id: 'moderno', label: 'Moderno', description: 'Celeste suave, editorial', swatches: ['#F5FAFF', '#6F8FBF'] },
];

const GIFT_OPTIONS: Array<{
  id: WizardMinimalInput['mesaRegalosType'];
  label: string;
  description: string;
}> = [
  { id: 'ninguna', label: 'No mostrar aún', description: 'Puedes activarlo después.' },
  { id: 'sobres', label: 'Lluvia de sobres', description: 'Mensaje elegante para sobres.' },
  { id: 'link', label: 'Mesa después', description: 'Placeholder para configurar luego.' },
];

export function QuickSetupWizard({
  invitationId,
  invitationTitle,
  isCompleted = false,
  publicUrl,
  editorUrl = `/dashboard/invitations/${invitationId}/edit`,
  dashboardUrl = `/cliente/invitaciones/${invitationId}`,
}: Props) {
  const [step, setStep] = useState(1);
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
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [wazeUrl, setWazeUrl] = useState('');

  const [style, setStyle] = useState<WizardStyle>('editorial');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [heroMessage, setHeroMessage] = useState('');

  const [dressCodeType, setDressCodeType] = useState('Formal');
  const [rsvpMode, setRsvpMode] = useState<'open' | 'passes_only'>('open');
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [mesaRegalosType, setMesaRegalosType] = useState<WizardMinimalInput['mesaRegalosType']>('ninguna');

  const canContinueEvent =
    noviaName.trim().length > 0 &&
    novioName.trim().length > 0 &&
    weddingDate.length > 0 &&
    eventTime.length > 0 &&
    venueName.trim().length > 0 &&
    venueAddress.trim().length > 0;

  function submitWizard() {
    if (!canContinueEvent) {
      setErrorMsg('Completa nombres, fecha, hora, lugar y dirección para continuar.');
      setStep(1);
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
        if (result.publicUrl) {
          setSavedPublicUrl(result.publicUrl);
        }
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
          <h1 style={successTitleStyle}>Tu invitación ya está lista.</h1>
          <p style={mutedStyle}>Ya puedes verla, compartirla o seguir personalizando los detalles.</p>

          <div style={{ display: 'grid', gap: 12, marginTop: 24 }}>
            {savedPublicUrl && <Link href={savedPublicUrl} style={primaryLinkStyle}>Ver invitación</Link>}
            <WizardWhatsAppShareLink publicPath={savedPublicUrl} style={secondaryLinkStyle} />
            <Link href={editorUrl} style={secondaryLinkStyle}>Personalizar detalles</Link>
          </div>

          <div style={quickActionsStyle}>
            <Link href={editorUrl} style={miniActionStyle}>Agregar fotos</Link>
            <Link href={editorUrl} style={miniActionStyle}>Agregar música</Link>
            <Link href={dashboardUrl} style={miniActionStyle}>Agregar invitados</Link>
            <Link href={dashboardUrl} style={miniActionStyle}>Configurar QR</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main style={shellStyle}>
      <section style={cardStyle}>
        <div style={{ marginBottom: 22, textAlign: 'center' }}>
          {invitationTitle && <p style={eyebrowStyle}>{invitationTitle}</p>}
          <h1 style={titleStyle}>{isCompleted ? 'Actualizar datos' : 'Configura tu invitación'}</h1>
          <p style={mutedStyle}>{isCompleted ? 'Ajusta la base de tu invitación.' : '3 pasos · menos de 3 minutos'}</p>
          <Progress step={step} />
        </div>

        {step === 1 && (
          <div>
            <StepHeading title="Evento" subtitle="Lo esencial para mostrar tu boda correctamente." />
            <div style={twoColumnStyle}>
              <Field label="Novia" value={noviaName} onChange={setNoviaName} placeholder="Sofía" />
              <Field label="Novio" value={novioName} onChange={setNovioName} placeholder="Alejandro" />
            </div>
            <div style={twoColumnStyle}>
              <Field label="Fecha" type="date" value={weddingDate} onChange={setWeddingDate} />
              <Field label="Hora" type="time" value={eventTime} onChange={setEventTime} />
            </div>
            <Field label="Lugar" value={venueName} onChange={setVenueName} placeholder="Hacienda, jardín o salón" />
            <Field label="Dirección" value={venueAddress} onChange={setVenueAddress} placeholder="Calle, ciudad, estado" />
            <Field label="Google Maps URL opcional" value={googleMapsUrl} onChange={setGoogleMapsUrl} placeholder="https://maps.google.com/..." />
            <Field label="Waze URL opcional" value={wazeUrl} onChange={setWazeUrl} placeholder="https://waze.com/..." />
            <button type="button" disabled={!canContinueEvent} onClick={() => setStep(2)} style={{ ...primaryButtonStyle, opacity: canContinueEvent ? 1 : 0.45 }}>
              Continuar
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <StepHeading title="Estilo" subtitle="Elige una dirección visual. Podrás cambiarla después." />
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
            <Field label="Foto principal o URL de portada opcional" value={coverImageUrl} onChange={setCoverImageUrl} placeholder="https://..." />
            <TextArea label="Mensaje de portada opcional" value={heroMessage} onChange={setHeroMessage} placeholder="Dos almas, un destino" />
            <NavButtons onBack={() => setStep(1)} onNext={() => setStep(3)} nextLabel="Continuar" />
          </div>
        )}

        {step === 3 && (
          <div>
            <StepHeading title="Confirmación" subtitle="Revisa la base antes de guardar." />
            <Field label="Dress code" value={dressCodeType} onChange={setDressCodeType} placeholder="Formal" />

            <p style={labelStyle}>RSVP</p>
            <div style={segmentedStyle}>
              <ChoiceButton active={rsvpMode === 'open'} onClick={() => setRsvpMode('open')} title="Libre" subtitle="Cualquier invitado confirma." />
              <ChoiceButton active={rsvpMode === 'passes_only'} onClick={() => setRsvpMode('passes_only')} title="Controlada" subtitle="Por familia / pases." />
            </div>

            <TextArea label="Mensaje de WhatsApp opcional" value={whatsappMessage} onChange={setWhatsappMessage} placeholder="Nos encantará celebrar contigo." />

            <p style={labelStyle}>Regalos</p>
            <div style={{ display: 'grid', gap: 8, marginBottom: 18 }}>
              {GIFT_OPTIONS.map((option) => (
                <ChoiceButton
                  key={option.id}
                  active={mesaRegalosType === option.id}
                  onClick={() => setMesaRegalosType(option.id)}
                  title={option.label}
                  subtitle={option.description}
                />
              ))}
            </div>

            <div style={summaryStyle}>
              <p style={{ ...labelStyle, marginBottom: 8 }}>Resumen</p>
              <p style={summaryLineStyle}>{noviaName || 'Novia'} & {novioName || 'Novio'}</p>
              <p style={summaryMutedStyle}>{weddingDate || 'Fecha pendiente'} · {eventTime || 'Hora pendiente'}</p>
              <p style={summaryMutedStyle}>{venueName || 'Lugar pendiente'}</p>
            </div>

            {errorMsg && <p style={errorStyle}>{errorMsg}</p>}
            <NavButtons onBack={() => setStep(2)} onNext={submitWizard} nextLabel={isPending ? 'Guardando...' : isCompleted ? 'Actualizar datos' : 'Dejar lista mi invitación'} disabled={isPending} />
          </div>
        )}
      </section>
    </main>
  );
}

function Progress({ step }: { step: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 18 }}>
      {[1, 2, 3].map((item) => (
        <div key={item} style={{ height: 7, borderRadius: 99, background: item <= step ? '#C5A880' : '#E8DED2' }} />
      ))}
    </div>
  );
}

function StepHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h2 style={{ color: '#3D2B1A', fontSize: 20, fontWeight: 650, marginBottom: 4 }}>{title}</h2>
      <p style={{ color: '#8A7663', fontSize: 13, lineHeight: 1.5 }}>{subtitle}</p>
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
      <button type="button" onClick={onNext} disabled={disabled} style={{ ...primaryButtonStyle, marginTop: 0, opacity: disabled ? 0.6 : 1 }}>{nextLabel}</button>
    </div>
  );
}

const shellStyle: React.CSSProperties = {
  minHeight: '100vh',
  width: '100%',
  background: 'linear-gradient(180deg, #FFFDF8 0%, #F6F2EC 100%)',
  padding: '24px 14px',
};

const cardStyle: React.CSSProperties = {
  maxWidth: 560,
  margin: '0 auto',
  background: '#FFFCF7',
  border: '1px solid #E8DED2',
  borderRadius: 26,
  boxShadow: '0 24px 70px rgba(72, 55, 38, 0.10)',
  padding: '24px 18px',
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

const titleStyle: React.CSSProperties = {
  color: '#3D2B1A',
  fontSize: 28,
  lineHeight: 1.1,
  fontWeight: 650,
  marginBottom: 8,
};

const successTitleStyle: React.CSSProperties = {
  ...titleStyle,
  fontSize: 30,
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
  borderRadius: 14,
  fontSize: 16,
  padding: '14px 14px',
  outlineColor: '#C5A880',
};

const twoColumnStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 10,
};

const styleGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
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
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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

const quickActionsStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 8,
  marginTop: 20,
};

const miniActionStyle: React.CSSProperties = {
  color: '#8A7663',
  background: '#F8F2E8',
  borderRadius: 14,
  padding: '12px 10px',
  fontSize: 12,
  textDecoration: 'none',
};
