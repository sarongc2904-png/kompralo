'use client';

import { useState } from 'react';
import { startWeddingQuickStart } from '@/app/dashboard/invitations/[id]/edit/actions';

// ─── Types ────────────────────────────────────────────────────────────────────

type CeremonyType = 'religiosa' | 'civil' | 'ambas' | 'simbolica';

interface WizardState {
  // Card 1 – Lo esencial
  brideName: string;
  groomName: string;
  weddingDate: string;
  ceremonyTime: string;
  venueName: string;
  address: string;
  // Card 2 – Ceremonia
  ceremonyType: CeremonyType;
  receptionTime: string;
  churchName: string;
  googleMapsUrl: string;
  wazeUrl: string;
  // Card 3 – Familia (Deluxe only — not saved; user fills in editor)
  motherBride: string;
  fatherBride: string;
  motherGroom: string;
  fatherGroom: string;
}

export interface WizardExpressProps {
  invitationId: string;
  planId: string;
  invitationTitle?: string;
  editorUrl?: string;
  /** Pre-filled names/data from existing invitation, used to seed inputs */
  prefilled?: {
    brideName?: string;
    groomName?: string;
    eventDate?: string;
    venueName?: string;
  };
}

const CEREMONY_OPTIONS: Array<{ id: CeremonyType; label: string; icon: string }> = [
  { id: 'religiosa', label: 'Religiosa',          icon: '⛪' },
  { id: 'civil',     label: 'Civil',              icon: '🏛️' },
  { id: 'ambas',     label: 'Religiosa + Civil',  icon: '💍' },
  { id: 'simbolica', label: 'Simbólica',          icon: '🌿' },
];

// ─── Main component ───────────────────────────────────────────────────────────

export function WizardExpress({
  invitationId,
  planId,
  invitationTitle,
  editorUrl,
  prefilled,
}: WizardExpressProps) {
  const isBasic   = planId === 'basic';
  const isDeluxe  = planId === 'deluxe';
  const resolvedEditorUrl = editorUrl ?? `/dashboard/invitations/${invitationId}/edit`;
  // Safe preview URL — does NOT publish the invitation and does NOT require a slug.
  const safePreviewUrl = `/preview/${invitationId}`;

  const [card, setCard] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const [state, setState] = useState<WizardState>({
    brideName:    prefilled?.brideName   ?? '',
    groomName:    prefilled?.groomName   ?? '',
    weddingDate:  prefilled?.eventDate   ?? '',
    ceremonyTime: '',
    venueName:    prefilled?.venueName   ?? '',
    address:      '',
    ceremonyType: 'religiosa',
    receptionTime: '',
    churchName:   '',
    googleMapsUrl: '',
    wazeUrl:      '',
    motherBride:  '',
    fatherBride:  '',
    motherGroom:  '',
    fatherGroom:  '',
  });

  const set = <K extends keyof WizardState>(k: K, v: WizardState[K]) => {
    setState((prev) => ({ ...prev, [k]: v }));
    setError(null);
  };

  // ─── Card 1 validation ────────────────────────────────────────────────────
  const card1Valid =
    state.brideName.trim().length > 0 &&
    state.groomName.trim().length > 0 &&
    state.weddingDate.length > 0;

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!card1Valid) {
      setCard(1);
      setError('Por favor completa los nombres y la fecha de la boda.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // startWeddingQuickStart validates ownership server-side and uses
      // generateWeddingTemplate with the plan-aware RMW (read-modify-write)
      // pattern — it never invents fake phone numbers, addresses, or URLs,
      // and only overwrites sections that were previously empty.
      const result = await startWeddingQuickStart({
        invitationId,
        brideName:    state.brideName.trim(),
        groomName:    state.groomName.trim(),
        weddingDate:  state.weddingDate,
        ceremonyTime:   state.ceremonyTime   || undefined,
        receptionTime:  state.receptionTime  || undefined,
        venueName:      state.venueName.trim()      || undefined,
        address:        state.address.trim()         || undefined,
        googleMapsUrl:  state.googleMapsUrl.trim()   || undefined,
        wazeUrl:        state.wazeUrl.trim()         || undefined,
        // Basic plan: always mark location as skipped (no maps feature)
        locationSkipped: isBasic ? true : !state.venueName.trim(),
        mode: 'initial',
      });

      if (result.success) {
        setDone(true);
      } else {
        setError(result.error ?? 'Ocurrió un error al guardar. Por favor intenta de nuevo.');
      }
    } catch {
      setError('Ocurrió un error inesperado. Por favor intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Done: transition screen ──────────────────────────────────────────────
  if (done) {
    return (
      <TransitionScreen
        brideName={state.brideName}
        groomName={state.groomName}
        invitationId={invitationId}
        editorUrl={resolvedEditorUrl}
        safePreviewUrl={safePreviewUrl}
      />
    );
  }

  // ─── Wizard cards ─────────────────────────────────────────────────────────
  return (
    <div style={shellStyle}>
      <style>{responsiveCss}</style>

      <div style={cardStyle}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          {invitationTitle && <p style={eyebrowStyle}>{invitationTitle}</p>}
          <h1 style={titleStyle}>Configura tu invitación</h1>
          <p style={subtitleStyle}>3 pasos rápidos. Todo se puede editar después.</p>
          <CardProgress card={card} />
        </div>

        {card === 1 && (
          <Card1
            state={state}
            set={set}
            onNext={() => {
              if (!card1Valid) {
                setError('Por favor ingresa los nombres de los novios y la fecha de la boda.');
                return;
              }
              setError(null);
              setCard(2);
            }}
            error={error}
            onSkip={() => { window.location.href = resolvedEditorUrl; }}
          />
        )}

        {card === 2 && (
          <Card2
            state={state}
            set={set}
            isBasic={isBasic}
            onBack={() => { setError(null); setCard(1); }}
            onNext={() => { setError(null); setCard(3); }}
          />
        )}

        {card === 3 && (
          <Card3
            state={state}
            set={set}
            isDeluxe={isDeluxe}
            onBack={() => { setError(null); setCard(2); }}
            onFinish={handleSubmit}
            submitting={submitting}
            error={error}
          />
        )}
      </div>
    </div>
  );
}

// ─── Card progress indicator ──────────────────────────────────────────────────

function CardProgress({ card }: { card: 1 | 2 | 3 }) {
  const labels = ['Lo esencial', 'Ceremonia', 'Confirmar'];
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 16 }}>
      {labels.map((label, i) => {
        const n = (i + 1) as 1 | 2 | 3;
        const active = n === card;
        const completed = n < card;
        return (
          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  background: completed ? '#C5A880' : active ? '#1A1410' : '#E8DED2',
                  color: completed || active ? '#FFFFFF' : '#A09080',
                  transition: 'all 0.2s',
                }}
              >
                {completed ? '✓' : n}
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: active ? 700 : 400,
                  color: active ? '#1A1410' : '#A09080',
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </span>
            </div>
            {n < 3 && (
              <div
                style={{
                  width: 32,
                  height: 2,
                  background: n < card ? '#C5A880' : '#E8DED2',
                  borderRadius: 2,
                  marginBottom: 14,
                  transition: 'background 0.3s',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Card 1: Lo esencial ──────────────────────────────────────────────────────

function Card1({
  state,
  set,
  onNext,
  error,
  onSkip,
}: {
  state: WizardState;
  set: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void;
  onNext: () => void;
  error: string | null;
  onSkip: () => void;
}) {
  const formattedDate = state.weddingDate
    ? new Date(state.weddingDate + 'T12:00:00').toLocaleDateString('es-MX', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : null;

  return (
    <div className="wiz-body">
      {/* Desktop-only live preview */}
      <div className="wiz-preview">
        <InvitationPreview
          brideName={state.brideName}
          groomName={state.groomName}
          date={formattedDate}
          time={state.ceremonyTime}
          venue={state.venueName}
        />
      </div>

      {/* Fields */}
      <div className="wiz-fields">
        <SectionHeading>Los novios</SectionHeading>
        {/* On mobile: stacked. On sm+: 2 columns */}
        <div className="wiz-two-col" style={{ marginBottom: 20 }}>
          <Field
            label="Novia *"
            value={state.brideName}
            onChange={(v) => set('brideName', v)}
            placeholder="Sofía"
            autoFocus
          />
          <Field
            label="Novio *"
            value={state.groomName}
            onChange={(v) => set('groomName', v)}
            placeholder="Alejandro"
          />
        </div>

        <SectionHeading>El gran día</SectionHeading>
        <div className="wiz-two-col" style={{ marginBottom: 20 }}>
          <Field label="Fecha *" type="date" value={state.weddingDate} onChange={(v) => set('weddingDate', v)} />
          <Field label="Hora de ceremonia" type="time" value={state.ceremonyTime} onChange={(v) => set('ceremonyTime', v)} />
        </div>

        <SectionHeading>El lugar</SectionHeading>
        <Field
          label="Nombre del venue"
          value={state.venueName}
          onChange={(v) => set('venueName', v)}
          placeholder="Hacienda San Miguel"
          style={{ marginBottom: 10 }}
        />
        <Field
          label="Dirección"
          value={state.address}
          onChange={(v) => set('address', v)}
          placeholder="Av. Principal 123, Ciudad"
        />

        {error && <ErrorMsg>{error}</ErrorMsg>}

        {/* Buttons sticky on mobile above keyboard */}
        <div className="wiz-footer-btns">
          <button onClick={onSkip} style={ghostButtonStyle}>
            Omitir wizard
          </button>
          <button onClick={onNext} style={primaryButtonStyle}>
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Card 2: Ceremonia ────────────────────────────────────────────────────────

function Card2({
  state,
  set,
  isBasic,
  onBack,
  onNext,
}: {
  state: WizardState;
  set: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void;
  isBasic: boolean;
  onBack: () => void;
  onNext: () => void;
}) {
  const needsChurch = state.ceremonyType === 'religiosa' || state.ceremonyType === 'ambas';

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <SectionHeading>Tipo de ceremonia</SectionHeading>
      <p style={{ ...hintStyle, marginBottom: 16 }}>
        Usamos esto para generar el itinerario automáticamente.
      </p>

      <div className="wiz-two-col" style={{ marginBottom: 24 }}>
        {CEREMONY_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => set('ceremonyType', opt.id)}
            style={{
              ...chipStyle,
              borderColor:  state.ceremonyType === opt.id ? '#B99752' : '#E8DED2',
              background:   state.ceremonyType === opt.id ? '#FFF9EF' : '#FDFBF8',
              boxShadow:    state.ceremonyType === opt.id ? '0 0 0 1px #B99752' : 'none',
            }}
          >
            <span style={{ fontSize: 22, display: 'block', marginBottom: 4 }}>{opt.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1410' }}>{opt.label}</span>
          </button>
        ))}
      </div>

      {needsChurch && (
        <>
          <SectionHeading>Iglesia / Templo</SectionHeading>
          <Field
            label="Nombre de la iglesia"
            value={state.churchName}
            onChange={(v) => set('churchName', v)}
            placeholder="Catedral de San Pablo"
            style={{ marginBottom: 20 }}
          />
        </>
      )}

      <SectionHeading>Horarios</SectionHeading>
      <div className="wiz-two-col" style={{ marginBottom: 20 }}>
        <Field label="Hora de ceremonia" type="time" value={state.ceremonyTime} onChange={(v) => set('ceremonyTime', v)} />
        <Field label="Hora de recepción" type="time" value={state.receptionTime} onChange={(v) => set('receptionTime', v)} />
      </div>

      {/* Maps links: Premium and Deluxe only (not Basic — no maps feature) */}
      {!isBasic && (
        <>
          <SectionHeading>
            Links de navegación{' '}
            <span style={{ fontWeight: 400, color: '#A09080', fontSize: 11, textTransform: 'none', letterSpacing: 0 }}>
              (opcionales)
            </span>
          </SectionHeading>
          <Field
            label="Google Maps"
            type="url"
            value={state.googleMapsUrl}
            onChange={(v) => set('googleMapsUrl', v)}
            placeholder="https://maps.google.com/..."
            style={{ marginBottom: 10 }}
          />
          <Field
            label="Waze"
            type="url"
            value={state.wazeUrl}
            onChange={(v) => set('wazeUrl', v)}
            placeholder="https://waze.com/ul/..."
          />
        </>
      )}

      <div className="wiz-footer-btns">
        <button onClick={onBack} style={ghostButtonStyle}>← Atrás</button>
        <button onClick={onNext} style={primaryButtonStyle}>Siguiente →</button>
      </div>
    </div>
  );
}

// ─── Card 3: Confirmar (+ Familia para Deluxe) ───────────────────────────────

function Card3({
  state,
  set,
  isDeluxe,
  onBack,
  onFinish,
  submitting,
  error,
}: {
  state: WizardState;
  set: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void;
  isDeluxe: boolean;
  onBack: () => void;
  onFinish: () => void;
  submitting: boolean;
  error: string | null;
}) {
  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      {/* Summary — always visible */}
      <SectionHeading>Resumen</SectionHeading>
      <div style={summaryBoxStyle}>
        <p style={{ fontSize: 17, fontWeight: 600, color: '#1A1410', marginBottom: 6 }}>
          {state.brideName} &amp; {state.groomName}
        </p>
        {state.weddingDate && (
          <p style={{ fontSize: 13, color: '#746B62', marginBottom: 2 }}>
            📅{' '}
            {new Date(state.weddingDate + 'T12:00:00').toLocaleDateString('es-MX', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
            {state.ceremonyTime && ` · ${state.ceremonyTime}`}
          </p>
        )}
        {state.venueName && (
          <p style={{ fontSize: 13, color: '#746B62' }}>📍 {state.venueName}</p>
        )}
        <p style={{ fontSize: 12, color: '#B99752', marginTop: 8, fontWeight: 600 }}>
          {state.ceremonyType === 'religiosa' ? 'Ceremonia religiosa' :
           state.ceremonyType === 'civil'     ? 'Ceremonia civil' :
           state.ceremonyType === 'ambas'     ? 'Religiosa + Civil' :
                                               'Ceremonia simbólica'}
        </p>
      </div>

      {/* Parents: Deluxe only — matches ParentsForm gate in editor (page.tsx) */}
      {isDeluxe && (
        <>
          <SectionHeading style={{ marginTop: 20 }}>
            Familia de los novios{' '}
            <span style={{ fontWeight: 400, fontSize: 11, color: '#A09080', textTransform: 'none', letterSpacing: 0 }}>
              (opcional — se edita después)
            </span>
          </SectionHeading>
          <p style={{ ...hintStyle, marginBottom: 14 }}>
            Aparecerá en la sección &ldquo;Nuestras Familias&rdquo;. Puedes dejarlo en blanco.
          </p>
          <div className="wiz-two-col" style={{ marginBottom: 8 }}>
            <Field label="Madre de la novia" value={state.motherBride} onChange={(v) => set('motherBride', v)} placeholder="Elena García" />
            <Field label="Padre de la novia" value={state.fatherBride} onChange={(v) => set('fatherBride', v)} placeholder="Roberto García" />
          </div>
          <div className="wiz-two-col" style={{ marginBottom: 16 }}>
            <Field label="Madre del novio" value={state.motherGroom} onChange={(v) => set('motherGroom', v)} placeholder="Carmen López" />
            <Field label="Padre del novio" value={state.fatherGroom} onChange={(v) => set('fatherGroom', v)} placeholder="José López" />
          </div>
        </>
      )}

      {/* Padrinos note — Deluxe only */}
      {isDeluxe && (
        <div style={infoBoxStyle}>
          <p style={{ fontSize: 12, color: '#746B62', margin: 0 }}>
            Los padrinos se agregan desde el editor visual después de este paso.
          </p>
        </div>
      )}

      {error && <ErrorMsg>{error}</ErrorMsg>}

      <div className="wiz-footer-btns" style={{ marginTop: error ? 8 : 20 }}>
        <button onClick={onBack} disabled={submitting} style={ghostButtonStyle}>
          ← Atrás
        </button>
        <button
          onClick={onFinish}
          disabled={submitting}
          style={{
            ...primaryButtonStyle,
            opacity: submitting ? 0.7 : 1,
            cursor: submitting ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting ? 'Guardando…' : 'Crear invitación ✨'}
        </button>
      </div>
    </div>
  );
}

// ─── Transition screen ────────────────────────────────────────────────────────

function TransitionScreen({
  brideName,
  groomName,
  invitationId,
  editorUrl,
  safePreviewUrl,
}: {
  brideName: string;
  groomName: string;
  invitationId: string;
  editorUrl: string;
  safePreviewUrl: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyPreview = async () => {
    try {
      const fullUrl = `${window.location.origin}${safePreviewUrl}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback: open the preview in a new tab if clipboard API fails
      window.open(safePreviewUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div style={{ ...shellStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ ...cardStyle, maxWidth: 460, textAlign: 'center' }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FFF9EF 0%, #F5E9D0 100%)',
            border: '1px solid #E8DFD5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            margin: '0 auto 20px',
          }}
        >
          ✨
        </div>

        <h1 style={{ ...titleStyle, marginBottom: 10 }}>Tu invitación está casi lista</h1>
        <p style={{ ...subtitleStyle, marginBottom: 8 }}>
          Creamos la base de la invitación de{' '}
          <strong style={{ color: '#1A1410' }}>{brideName} &amp; {groomName}</strong>.
        </p>
        <p style={{ ...subtitleStyle, marginBottom: 32 }}>
          Ahora puedes personalizarla, subir fotos y luego compartirla.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Botón 1: Editar invitación — abre el editor visual directo */}
          <a
            href={editorUrl}
            style={{ ...primaryButtonStyle, display: 'block', textDecoration: 'none', textAlign: 'center' }}
          >
            Editar invitación
          </a>

          {/*
            Botón 2: Compartir vista previa
            - Usa /preview/{id} — URL segura que NO requiere slug ni publica la invitación.
            - Copia el link al portapapeles; si falla, abre en tab nuevo.
            - NO usa /i/[slug] para no exponer invitaciones no publicadas.
          */}
          <button
            onClick={handleCopyPreview}
            style={{
              ...ghostButtonStyle,
              width: '100%',
              textAlign: 'center',
              cursor: 'pointer',
            }}
          >
            {copied ? '✓ Link copiado' : 'Copiar link de vista previa'}
          </button>
          <p style={{ fontSize: 11, color: '#A09080', marginTop: -4 }}>
            Este link es solo de previsualización — no publica tu invitación.
          </p>

          {/*
            Botón 3: Editor avanzado
            - Navega a ?view=wizard (WizardShell de 17 pasos).
            - Como wizard_step_completed ya fue marcado por startWeddingQuickStart,
              el WizardExpress NO reaparece. Se entra directo al WizardShell.
            - No borra ningún dato guardado.
          */}
          <a
            href={`/dashboard/invitations/${invitationId}/edit?view=wizard`}
            style={{
              display: 'block',
              padding: '12px 18px',
              borderRadius: 14,
              background: 'transparent',
              border: 'none',
              color: '#A09080',
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Editor avanzado paso a paso →
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function InvitationPreview({
  brideName,
  groomName,
  date,
  time,
  venue,
}: {
  brideName: string;
  groomName: string;
  date: string | null;
  time: string;
  venue: string;
}) {
  const names = brideName || groomName
    ? `${brideName || 'Novia'} & ${groomName || 'Novio'}`
    : 'Sofía & Alejandro';

  return (
    <div
      style={{
        border: '1px solid #E8DED2',
        borderRadius: 20,
        padding: '24px 20px',
        textAlign: 'center',
        background: 'linear-gradient(145deg, #FFFDF8 0%, #F8F3EC 100%)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)',
      }}
    >
      <p style={eyebrowStyle}>Vista previa</p>
      <div style={{ width: 32, height: 1, background: '#D9C8AE', margin: '10px auto' }} />
      <h3
        style={{
          color: '#3D2B1A',
          fontSize: 22,
          lineHeight: 1.2,
          fontWeight: 400,
          fontFamily: 'Georgia, serif',
          marginBottom: 8,
        }}
      >
        {names}
      </h3>
      <p style={{ color: '#8A7663', fontSize: 12, fontStyle: 'italic', marginBottom: 16 }}>
        Nos casamos
      </p>
      <div style={{ width: 48, height: 1, background: '#D9C8AE', margin: '0 auto 14px' }} />
      {date && <p style={{ color: '#5C4A3E', fontSize: 12, marginBottom: 4 }}>{date}</p>}
      {time && <p style={{ color: '#8A7663', fontSize: 11 }}>{time} hrs</p>}
      {venue && (
        <p style={{ color: '#B99752', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 10 }}>
          {venue}
        </p>
      )}
    </div>
  );
}

function SectionHeading({ children, style: extraStyle }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: '#8A7663',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        marginBottom: 10,
        ...extraStyle,
      }}
    >
      {children}
    </p>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  autoFocus,
  style: extraStyle,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  autoFocus?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <label style={{ display: 'block', ...extraStyle }}>
      <span
        style={{
          display: 'block',
          fontSize: 11,
          fontWeight: 700,
          color: '#8A7663',
          textTransform: 'uppercase',
          letterSpacing: '0.09em',
          marginBottom: 6,
        }}
      >
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          background: '#FFFFFF',
          border: '1.5px solid #E8DED2',
          borderRadius: 12,
          padding: '11px 12px',
          fontSize: 16,   // 16px prevents iOS auto-zoom
          color: '#1A1410',
          outline: 'none',
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = '#B99752')}
        onBlur={(e)  => (e.currentTarget.style.borderColor = '#E8DED2')}
      />
    </label>
  );
}

function ErrorMsg({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: '#FFF0F0',
        border: '1px solid #F0CACA',
        borderRadius: 12,
        padding: '10px 14px',
        fontSize: 13,
        color: '#9F2A2A',
        marginTop: 14,
      }}
    >
      {children}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const shellStyle: React.CSSProperties = {
  minHeight: '100svh',
  width: '100%',
  background: 'linear-gradient(180deg, #FFFDF8 0%, #F6F2EC 100%)',
  padding: '16px 12px 40px',
};

const cardStyle: React.CSSProperties = {
  maxWidth: 860,
  margin: '0 auto',
  background: '#FFFCF7',
  border: '1px solid #E8DED2',
  borderRadius: 24,
  boxShadow: '0 20px 60px rgba(72, 55, 38, 0.09)',
  padding: '24px 16px',
};

const eyebrowStyle: React.CSSProperties = {
  color: '#B99752',
  fontSize: 11,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  marginBottom: 6,
};

const titleStyle: React.CSSProperties = {
  color: '#1A1410',
  fontSize: 24,
  fontWeight: 600,
  lineHeight: 1.2,
  marginBottom: 6,
};

const subtitleStyle: React.CSSProperties = {
  color: '#746B62',
  fontSize: 14,
  lineHeight: 1.5,
};

const hintStyle: React.CSSProperties = {
  color: '#746B62',
  fontSize: 13,
  lineHeight: 1.5,
};

const primaryButtonStyle: React.CSSProperties = {
  border: 'none',
  borderRadius: 14,
  background: '#1A1410',
  color: '#FFFDF8',
  fontSize: 15,
  fontWeight: 700,
  padding: '14px 20px',
  cursor: 'pointer',
  transition: 'opacity 0.15s',
};

const ghostButtonStyle: React.CSSProperties = {
  border: '1.5px solid #E8DED2',
  borderRadius: 14,
  background: '#FFFFFF',
  color: '#746B62',
  fontSize: 15,
  fontWeight: 600,
  padding: '14px 20px',
  cursor: 'pointer',
};

const chipStyle: React.CSSProperties = {
  border: '1.5px solid #E8DED2',
  borderRadius: 14,
  padding: '14px 10px',
  cursor: 'pointer',
  textAlign: 'center' as const,
  transition: 'all 0.15s',
};

const summaryBoxStyle: React.CSSProperties = {
  background: '#F8F4EE',
  border: '1px solid #E0D5C5',
  borderRadius: 16,
  padding: '14px 16px',
  marginBottom: 16,
};

const infoBoxStyle: React.CSSProperties = {
  background: '#FBF8F2',
  border: '1px solid #E8DFD5',
  borderRadius: 14,
  padding: '12px 16px',
  marginBottom: 16,
};

// wiz-two-col: 1 col on mobile, 2 cols on sm+
// wiz-footer-btns: stacked fill on mobile, side by side on sm+
// wiz-preview: hidden on mobile, visible on desktop (md+)
// wiz-body: column on mobile, [fields | preview] grid on md+
const responsiveCss = `
  .wiz-body {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .wiz-preview {
    display: none;
  }
  .wiz-two-col {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .wiz-footer-btns {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 24px;
  }
  .wiz-footer-btns button,
  .wiz-footer-btns a {
    width: 100%;
  }
  @media (min-width: 480px) {
    .wiz-two-col {
      grid-template-columns: 1fr 1fr;
    }
    .wiz-footer-btns {
      flex-direction: row;
    }
    .wiz-footer-btns button,
    .wiz-footer-btns a {
      flex: 1;
    }
  }
  @media (min-width: 720px) {
    .wiz-body {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 260px;
      align-items: start;
      gap: 28px;
    }
    .wiz-preview {
      display: block;
      order: 2;
      position: sticky;
      top: 20px;
    }
    .wiz-fields {
      order: 1;
    }
  }
`;
