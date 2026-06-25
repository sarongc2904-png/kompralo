'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { wizardQuickSetup } from '@/app/actions/wizard-quick-setup';
import type { WizardMinimalInput, WizardStyle, CeremonyType } from '@/lib/invitations/generate-smart-defaults';

interface Props {
  invitationId: string;
  invitationTitle?: string;
}

const STYLES: Array<{ id: WizardStyle; label: string; description: string; primary: string; accent: string }> = [
  { id: 'jardin_secreto', label: 'Jardín Secreto',  description: 'Verde jardín, dorado suave',  primary: '#2D5016', accent: '#C9A84C' },
  { id: 'cielo_nocturno', label: 'Cielo Nocturno',  description: 'Azul noche, plateado',         primary: '#0D1B2A', accent: '#A8B8C8' },
  { id: 'arena_y_miel',   label: 'Arena y Miel',    description: 'Terracota, dorado cálido',     primary: '#8B4513', accent: '#D4AF7A' },
];

const CEREMONY_TYPES: Array<{ id: CeremonyType; label: string; icon: string }> = [
  { id: 'solo_civil',       label: 'Solo civil',          icon: '📋' },
  { id: 'civil_e_iglesia',  label: 'Civil e iglesia',     icon: '⛪' },
  { id: 'solo_religiosa',   label: 'Solo religiosa',      icon: '🕊️' },
];

export function QuickSetupWizard({ invitationId, invitationTitle }: Props) {
  const router = useRouter();
  const [step, setStep]       = useState(1);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Step 1 — Names & Style
  const [noviaName, setNoviaName]   = useState('');
  const [novioName, setNovioName]   = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [style, setStyle]           = useState<WizardStyle>('jardin_secreto');

  // Step 2 — Ceremony
  const [ceremonyType, setCeremonyType]       = useState<CeremonyType>('civil_e_iglesia');
  const [civilAlreadyDone, setCivilAlreadyDone] = useState(false);
  const [ceremonyLocation, setCeremonyLocation] = useState('');
  const [ceremonyTime, setCeremonyTime]         = useState('12:00');
  const [receptionLocation, setReceptionLocation] = useState('');
  const [receptionTime, setReceptionTime]       = useState('14:00');

  // Step 3 — Extras
  const [mesaRegalosType, setMesaRegalosType] = useState<WizardMinimalInput['mesaRegalosType']>('sobres');
  const [notasNinos, setNotasNinos]           = useState<WizardMinimalInput['notasNinos']>(null);

  const canNext1 = noviaName.trim().length > 0 && novioName.trim().length > 0 && weddingDate.length > 0;
  const canNext2 = ceremonyTime.length > 0 && receptionTime.length > 0;

  function handleSubmit() {
    const input: WizardMinimalInput = {
      novioName:         novioName.trim(),
      noviaName:         noviaName.trim(),
      weddingDate,
      style,
      ceremonyType,
      civilAlreadyDone,
      ceremonyLocation:  ceremonyLocation.trim(),
      ceremonyTime,
      receptionLocation: receptionLocation.trim(),
      receptionTime,
      mesaRegalosType,
      notasNinos,
    };
    setErrorMsg(null);
    startTransition(async () => {
      const result = await wizardQuickSetup(invitationId, input);
      if (result.ok && result.redirectUrl) {
        router.push(result.redirectUrl);
      } else if (!result.ok && result.redirectUrl) {
        router.push(result.redirectUrl); // auth redirect (login)
      } else {
        setErrorMsg(result.error ?? 'Error desconocido. Intenta de nuevo.');
      }
    });
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        {invitationTitle && (
          <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#C5A880', marginBottom: 6 }}>
            {invitationTitle}
          </p>
        )}
        <h1 style={{ fontSize: '1.5rem', fontWeight: 300, color: '#1A1410', marginBottom: 4 }}>
          Configuración rápida
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#9B8878' }}>
          3 pasos · menos de 2 minutos
        </p>

        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                width: s === step ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: s === step ? '#C5A880' : s < step ? '#8B6F4E' : '#E8E2DA',
                transition: 'all 0.3s',
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Step 1: Names & Style ─────────────────────────────────────────── */}
      {step === 1 && (
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#3D2B1A', marginBottom: 20 }}>
            ¿Quiénes se casan?
          </h2>

          <label style={labelStyle}>Nombre de la novia</label>
          <input
            value={noviaName}
            onChange={(e) => setNoviaName(e.target.value)}
            placeholder="Sofía"
            style={inputStyle}
          />

          <label style={{ ...labelStyle, marginTop: 14 }}>Nombre del novio</label>
          <input
            value={novioName}
            onChange={(e) => setNovioName(e.target.value)}
            placeholder="Carlos"
            style={inputStyle}
          />

          <label style={{ ...labelStyle, marginTop: 14 }}>Fecha de la boda</label>
          <input
            type="date"
            value={weddingDate}
            onChange={(e) => setWeddingDate(e.target.value)}
            style={inputStyle}
          />

          <label style={{ ...labelStyle, marginTop: 20, marginBottom: 10 }}>Estilo visual</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {STYLES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStyle(s.id)}
                style={{
                  border: `2px solid ${style === s.id ? s.primary : '#E8E2DA'}`,
                  borderRadius: 12,
                  padding: '14px 8px',
                  background: style === s.id ? '#FAF7F2' : '#FFF',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                }}
              >
                {/* Color swatches */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 8 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: s.primary }} />
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: s.accent }} />
                </div>
                <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#3D2B1A', marginBottom: 2 }}>
                  {s.label}
                </p>
                <p style={{ fontSize: '0.6rem', color: '#9B8878', lineHeight: 1.3 }}>
                  {s.description}
                </p>
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={!canNext1}
            onClick={() => setStep(2)}
            style={{ ...ctaStyle, opacity: canNext1 ? 1 : 0.4, marginTop: 28 }}
          >
            Siguiente →
          </button>
        </div>
      )}

      {/* ── Step 2: Ceremony ──────────────────────────────────────────────── */}
      {step === 2 && (
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#3D2B1A', marginBottom: 20 }}>
            ¿Cómo es la ceremonia?
          </h2>

          <label style={labelStyle}>Tipo de ceremonia</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 18 }}>
            {CEREMONY_TYPES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCeremonyType(c.id)}
                style={{
                  border: `2px solid ${ceremonyType === c.id ? '#C5A880' : '#E8E2DA'}`,
                  borderRadius: 10,
                  padding: '12px 6px',
                  background: ceremonyType === c.id ? '#FAF7F2' : '#FFF',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{c.icon}</div>
                <p style={{ fontSize: '0.65rem', fontWeight: 600, color: '#3D2B1A', lineHeight: 1.3 }}>
                  {c.label}
                </p>
              </button>
            ))}
          </div>

          {ceremonyType === 'solo_religiosa' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18,
                          padding: '10px 14px', background: '#F6F2EC', borderRadius: 10 }}>
              <input
                type="checkbox"
                id="civil-done"
                checked={civilAlreadyDone}
                onChange={(e) => setCivilAlreadyDone(e.target.checked)}
                style={{ width: 16, height: 16, cursor: 'pointer' }}
              />
              <label htmlFor="civil-done" style={{ fontSize: '0.8rem', color: '#3D2B1A', cursor: 'pointer' }}>
                El civil ya se realizó previamente
              </label>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>
                {ceremonyType === 'civil_e_iglesia' ? 'Lugar del civil' : 'Lugar de la ceremonia'}
              </label>
              <input
                value={ceremonyLocation}
                onChange={(e) => setCeremonyLocation(e.target.value)}
                placeholder="Salón / Templo"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Hora</label>
              <input
                type="time"
                value={ceremonyTime}
                onChange={(e) => setCeremonyTime(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
            <div>
              <label style={labelStyle}>Lugar de la recepción</label>
              <input
                value={receptionLocation}
                onChange={(e) => setReceptionLocation(e.target.value)}
                placeholder="Salón / Jardín"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Hora</label>
              <input
                type="time"
                value={receptionTime}
                onChange={(e) => setReceptionTime(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
            <button type="button" onClick={() => setStep(1)} style={backStyle}>← Atrás</button>
            <button
              type="button"
              disabled={!canNext2}
              onClick={() => setStep(3)}
              style={{ ...ctaStyle, flex: 1, opacity: canNext2 ? 1 : 0.4 }}
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Extras ────────────────────────────────────────────────── */}
      {step === 3 && (
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#3D2B1A', marginBottom: 20 }}>
            Un par de detalles más
          </h2>

          <label style={labelStyle}>Mesa de regalos</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 20 }}>
            {([
              { id: 'sobres',       label: 'Sobres',        icon: '✉️' },
              { id: 'transferencia',label: 'Transferencia', icon: '🏦' },
              { id: 'link',         label: 'Link externo',  icon: '🔗' },
              { id: 'ninguna',      label: 'Sin mesa',      icon: '🚫' },
            ] as const).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setMesaRegalosType(opt.id)}
                style={{
                  border: `2px solid ${mesaRegalosType === opt.id ? '#C5A880' : '#E8E2DA'}`,
                  borderRadius: 10,
                  padding: '12px 8px',
                  background: mesaRegalosType === opt.id ? '#FAF7F2' : '#FFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{opt.icon}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#3D2B1A' }}>{opt.label}</span>
              </button>
            ))}
          </div>

          <label style={labelStyle}>Niños en el evento</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 28 }}>
            {([
              { id: null,           label: 'No indicar',    icon: '—' },
              { id: 'bienvenidos',  label: 'Bienvenidos',   icon: '👶' },
              { id: 'adultos',      label: 'Solo adultos',  icon: '🔞' },
            ] as const).map((opt) => (
              <button
                key={String(opt.id)}
                type="button"
                onClick={() => setNotasNinos(opt.id)}
                style={{
                  border: `2px solid ${notasNinos === opt.id ? '#C5A880' : '#E8E2DA'}`,
                  borderRadius: 10,
                  padding: '10px 6px',
                  background: notasNinos === opt.id ? '#FAF7F2' : '#FFF',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '1.2rem', marginBottom: 2 }}>{opt.icon}</div>
                <p style={{ fontSize: '0.65rem', fontWeight: 600, color: '#3D2B1A' }}>{opt.label}</p>
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={() => setStep(2)} style={backStyle}>← Atrás</button>
            <button
              type="button"
              disabled={isPending}
              onClick={handleSubmit}
              style={{ ...ctaStyle, flex: 1, opacity: isPending ? 0.6 : 1 }}
            >
              {isPending ? 'Generando tu invitación...' : '✨ Generar mi invitación'}
            </button>
          </div>

          <p style={{ fontSize: '0.7rem', color: '#9B8878', textAlign: 'center', marginTop: 12 }}>
            Podrás personalizar cada detalle después.
          </p>
          {errorMsg && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10 }}>
              <p style={{ fontSize: '0.8rem', color: '#991B1B', margin: 0 }}>{errorMsg}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.7rem',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#9B8878',
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '10px 14px',
  fontSize: '0.9rem',
  color: '#1A1410',
  background: '#FFFFFF',
  border: '1px solid #E8E2DA',
  borderRadius: 10,
  outline: 'none',
  boxSizing: 'border-box',
};

const ctaStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '14px 20px',
  fontSize: '0.9rem',
  fontWeight: 700,
  color: '#0D0A07',
  background: '#C5A880',
  border: 'none',
  borderRadius: 12,
  cursor: 'pointer',
  textAlign: 'center',
};

const backStyle: React.CSSProperties = {
  padding: '14px 18px',
  fontSize: '0.85rem',
  fontWeight: 600,
  color: '#9B8878',
  background: 'transparent',
  border: '1px solid #E8E2DA',
  borderRadius: 12,
  cursor: 'pointer',
};
