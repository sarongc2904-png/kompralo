'use client';

import { useState } from 'react';
import { startWeddingQuickStart } from '@/app/dashboard/invitations/[id]/edit/actions';
import { WIZARD_THEME_OPTIONS } from '@/domain/themes-v2/style-to-theme-map';
import type { ThemeIdV2 } from '@/domain/themes-v2/types';
import { formatWeddingHashtag } from '@/lib/invitations/formatWeddingHashtag';

export interface WeddingQuickStartWizardProps {
  invitationId: string;
  planId: string;
  onClose: () => void;
  onComplete?: () => void;
  mode?: 'initial' | 'update';
  initialData?: Partial<WizardData>;
}

interface WizardData {
  brideName: string;
  groomName: string;
  weddingDate: string;
  ceremonyTime: string;
  receptionTime: string;
  venueName: string;
  address: string;
  googleMapsUrl: string;
  wazeUrl: string;
  locationSkipped: boolean;
  themeId: ThemeIdV2;
  whatsappNumber: string;
}

const DEFAULT_THEME: ThemeIdV2 = 'ivory-editorial';

const PENDING_CHECKLIST = [
  'Subir fotos de portada y galería',
  'Personalizar el mensaje de bienvenida',
  'Revisar el itinerario del día',
  'Compartir el link con tus invitados',
];

export function WeddingQuickStartWizard({
  invitationId,
  planId,
  onClose,
  onComplete,
  mode = 'initial',
  initialData,
}: WeddingQuickStartWizardProps) {
  const isBasic = planId === 'basic';
  const isUpdateMode = mode === 'update';

  // Steps: Basic = 4, Premium/Deluxe = 5
  // Basic:            1=Names, 2=DateTime, 3=Style, 4=WhatsApp
  // Premium/Deluxe:   1=Names, 2=DateTime, 3=Location, 4=Style, 5=WhatsApp
  const totalSteps = isBasic ? 4 : 5;

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Preload existing data when reopening in update mode
  const [data, setData] = useState<WizardData>({
    brideName: initialData?.brideName ?? '',
    groomName: initialData?.groomName ?? '',
    weddingDate: initialData?.weddingDate ?? '',
    ceremonyTime: initialData?.ceremonyTime ?? '',
    receptionTime: initialData?.receptionTime ?? '',
    venueName: initialData?.venueName ?? '',
    address: initialData?.address ?? '',
    googleMapsUrl: initialData?.googleMapsUrl ?? '',
    wazeUrl: initialData?.wazeUrl ?? '',
    locationSkipped: initialData?.locationSkipped ?? false,
    themeId: initialData?.themeId ?? DEFAULT_THEME,
    whatsappNumber: initialData?.whatsappNumber ?? '',
  });

  // Marker visible in browser console to confirm v2 is loaded in production
  console.info('[KOMPRALO] Quick Start Wizard v2 loaded — planId:', planId, '— mode:', mode);

  const update = (field: keyof WizardData, value: string | boolean | ThemeIdV2) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  // ─── Step label helpers ────────────────────────────────────────────────────

  function getStepLabel(n: number): string {
    if (isBasic) {
      return ['Nombres', 'Fecha', 'Estilo', 'WhatsApp'][n - 1] ?? '';
    }
    return ['Nombres', 'Fecha', 'Lugar', 'Estilo', 'WhatsApp'][n - 1] ?? '';
  }

  // ─── Validation per step ──────────────────────────────────────────────────

  function canProceed(): boolean {
    if (step === 1) return data.brideName.trim().length > 0 && data.groomName.trim().length > 0;
    if (step === 2) return data.weddingDate.trim().length > 0;
    // Location step (Premium+, step 3)
    if (!isBasic && step === 3) return true; // always skippable
    // Style step
    const styleStep = isBasic ? 3 : 4;
    if (step === styleStep) return true; // always has a default
    return true;
  }

  // ─── Navigation ───────────────────────────────────────────────────────────

  const goNext = () => {
    if (!canProceed()) {
      if (step === 1) setError('Por favor ingresa los nombres de los novios.');
      if (step === 2) setError('Por favor selecciona la fecha de la boda.');
      return;
    }
    if (step < totalSteps) {
      setStep((s) => s + 1);
    } else {
      handleSubmit();
    }
  };

  const goBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  // ─── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      console.info('[KOMPRALO] QuickStart submit data:', JSON.stringify(data));
      const result = await startWeddingQuickStart({
        invitationId,
        brideName: data.brideName.trim(),
        groomName: data.groomName.trim(),
        weddingDate: data.weddingDate,
        ceremonyTime: data.ceremonyTime || undefined,
        receptionTime: data.receptionTime || undefined,
        venueName: data.venueName || undefined,
        address: data.address || undefined,
        googleMapsUrl: data.googleMapsUrl || undefined,
        wazeUrl: data.wazeUrl || undefined,
        themeId: data.themeId,
        whatsappNumber: data.whatsappNumber || undefined,
        locationSkipped: isBasic ? true : data.locationSkipped,
        mode,
      });
      if (result.success) {
        onComplete?.();
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

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div
        className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden"
        style={{
          background: '#FFFFFF',
          maxHeight: '90vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          <SuccessScreen
            brideName={data.brideName}
            groomName={data.groomName}
            invitationId={invitationId}
            isUpdate={isUpdateMode}
          />
        ) : (
          <>
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
              style={{ borderColor: '#F0EBE3' }}
            >
              <div>
                <p className="text-xs font-medium mb-0.5" style={{ color: '#B99752' }}>
                  Paso {step} de {totalSteps} · {getStepLabel(step)}
                </p>
                <h2 className="text-base font-semibold" style={{ color: '#1A1410' }}>
                  Crea tu invitación en minutos
                </h2>
              </div>
              <button
                onClick={onClose}
                disabled={submitting}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ background: '#F5F0E8', color: '#746B62' }}
                aria-label="Cerrar"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Progress bar */}
            <div className="h-1 flex-shrink-0" style={{ background: '#F5F0E8' }}>
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${(step / totalSteps) * 100}%`,
                  background: '#B99752',
                }}
              />
            </div>

            {/* Step dots */}
            <div className="flex justify-center gap-2 py-3 flex-shrink-0">
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map((n) => (
                <div
                  key={n}
                  className="rounded-full transition-all duration-200"
                  style={{
                    width: n === step ? 20 : 8,
                    height: 8,
                    background: n <= step ? '#B99752' : '#E8DFD5',
                  }}
                />
              ))}
            </div>

            {/* Step content (scrollable) */}
            <div className="flex-1 overflow-y-auto px-5 pb-4">
              {step === 1 && <StepNames data={data} update={update} />}
              {step === 2 && <StepDateTime data={data} update={update} />}
              {!isBasic && step === 3 && <StepLocation data={data} update={update} />}
              {step === (isBasic ? 3 : 4) && <StepStyle data={data} update={update} />}
              {step === (isBasic ? 4 : 5) && <StepWhatsApp data={data} update={update} />}

              {error && (
                <p
                  className="mt-3 text-sm rounded-lg px-3 py-2"
                  style={{ color: '#C0392B', background: '#FDF2F2' }}
                >
                  {error}
                </p>
              )}
            </div>

            {/* Footer */}
            <div
              className="flex gap-3 px-5 py-4 border-t flex-shrink-0"
              style={{ borderColor: '#F0EBE3' }}
            >
              {step > 1 ? (
                <button
                  onClick={goBack}
                  disabled={submitting}
                  className="flex-1 rounded-xl font-semibold text-sm transition-colors"
                  style={{
                    minHeight: 44,
                    background: '#F5F0E8',
                    color: '#746B62',
                    border: '1px solid #E8DFD5',
                  }}
                >
                  Atrás
                </button>
              ) : (
                <button
                  onClick={onClose}
                  disabled={submitting}
                  className="flex-1 rounded-xl font-semibold text-sm transition-colors"
                  style={{
                    minHeight: 44,
                    background: '#F5F0E8',
                    color: '#746B62',
                    border: '1px solid #E8DFD5',
                  }}
                >
                  Cancelar
                </button>
              )}

              <button
                onClick={goNext}
                disabled={submitting}
                className="flex-2 rounded-xl font-semibold text-sm transition-colors"
                style={{
                  minHeight: 44,
                  flex: 2,
                  background: submitting ? '#D4B97A' : '#B99752',
                  color: '#FFFFFF',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting
                  ? 'Guardando…'
                  : step === totalSteps
                  ? (isUpdateMode ? 'Actualizar invitación' : 'Crear mi invitación')
                  : 'Siguiente →'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Step 1: Names ────────────────────────────────────────────────────────────

function StepNames({
  data,
  update,
}: {
  data: WizardData;
  update: (f: keyof WizardData, v: string) => void;
}) {
  return (
    <div className="pt-2 space-y-5">
      <div>
        <p className="text-sm mb-4" style={{ color: '#746B62' }}>
          Estos nombres aparecerán en tu invitación como protagonistas.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#3D3530' }}>
          Nombre de la novia *
        </label>
        <input
          type="text"
          value={data.brideName}
          onChange={(e) => update('brideName', e.target.value)}
          placeholder="Ej. María"
          autoFocus
          className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-shadow"
          style={{
            border: '1.5px solid #E8DFD5',
            background: '#FDFBF8',
            color: '#1A1410',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#B99752')}
          onBlur={(e) => (e.currentTarget.style.borderColor = '#E8DFD5')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#3D3530' }}>
          Nombre del novio *
        </label>
        <input
          type="text"
          value={data.groomName}
          onChange={(e) => update('groomName', e.target.value)}
          placeholder="Ej. Carlos"
          className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-shadow"
          style={{
            border: '1.5px solid #E8DFD5',
            background: '#FDFBF8',
            color: '#1A1410',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#B99752')}
          onBlur={(e) => (e.currentTarget.style.borderColor = '#E8DFD5')}
        />
      </div>

      {data.brideName && data.groomName && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{ background: '#FBF8F2', border: '1px solid #E8DFD5', color: '#746B62' }}
        >
          Tu hashtag: <strong style={{ color: '#B99752' }}>#{formatWeddingHashtag(data.brideName, data.groomName)}</strong>
        </div>
      )}
    </div>
  );
}

// ─── Step 2: Date & Time ──────────────────────────────────────────────────────

function StepDateTime({
  data,
  update,
}: {
  data: WizardData;
  update: (f: keyof WizardData, v: string) => void;
}) {
  return (
    <div className="pt-2 space-y-5">
      <p className="text-sm" style={{ color: '#746B62' }}>
        Con la hora de ceremonia generaremos el itinerario automáticamente.
      </p>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#3D3530' }}>
          Fecha de la boda *
        </label>
        <input
          type="date"
          value={data.weddingDate}
          onChange={(e) => update('weddingDate', e.target.value)}
          className="w-full rounded-xl px-4 py-3 text-sm outline-none"
          style={{
            border: '1.5px solid #E8DFD5',
            background: '#FDFBF8',
            color: '#1A1410',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#B99752')}
          onBlur={(e) => (e.currentTarget.style.borderColor = '#E8DFD5')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#3D3530' }}>
          Hora de ceremonia
        </label>
        <input
          type="time"
          value={data.ceremonyTime}
          onChange={(e) => update('ceremonyTime', e.target.value)}
          className="w-full rounded-xl px-4 py-3 text-sm outline-none"
          style={{
            border: '1.5px solid #E8DFD5',
            background: '#FDFBF8',
            color: '#1A1410',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#B99752')}
          onBlur={(e) => (e.currentTarget.style.borderColor = '#E8DFD5')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#3D3530' }}>
          Hora de recepción{' '}
          <span className="font-normal" style={{ color: '#A09080' }}>
            (opcional)
          </span>
        </label>
        <input
          type="time"
          value={data.receptionTime}
          onChange={(e) => update('receptionTime', e.target.value)}
          className="w-full rounded-xl px-4 py-3 text-sm outline-none"
          style={{
            border: '1.5px solid #E8DFD5',
            background: '#FDFBF8',
            color: '#1A1410',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#B99752')}
          onBlur={(e) => (e.currentTarget.style.borderColor = '#E8DFD5')}
        />
        {data.ceremonyTime && !data.receptionTime && (
          <p className="text-xs mt-1" style={{ color: '#A09080' }}>
            Si no la indicas, la calculamos +2h desde la ceremonia.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Step 3: Location (Premium+) ─────────────────────────────────────────────

function StepLocation({
  data,
  update,
}: {
  data: WizardData;
  update: (f: keyof WizardData, v: string | boolean) => void;
}) {
  return (
    <div className="pt-2 space-y-5">
      <div className="flex items-start justify-between">
        <p className="text-sm flex-1" style={{ color: '#746B62' }}>
          El lugar del evento. Puedes completarlo después.
        </p>
        <button
          onClick={() => update('locationSkipped', !data.locationSkipped)}
          className="text-xs ml-3 flex-shrink-0 underline"
          style={{ color: data.locationSkipped ? '#B99752' : '#A09080' }}
        >
          {data.locationSkipped ? 'Agregar lugar' : 'Omitir por ahora'}
        </button>
      </div>

      {!data.locationSkipped && (
        <>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#3D3530' }}>
              Nombre del venue
            </label>
            <input
              type="text"
              value={data.venueName}
              onChange={(e) => update('venueName', e.target.value)}
              placeholder="Ej. Hacienda San Miguel"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={{
                border: '1.5px solid #E8DFD5',
                background: '#FDFBF8',
                color: '#1A1410',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#B99752')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#E8DFD5')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#3D3530' }}>
              Dirección
            </label>
            <input
              type="text"
              value={data.address}
              onChange={(e) => update('address', e.target.value)}
              placeholder="Ej. Av. Principal 123, Ciudad"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={{
                border: '1.5px solid #E8DFD5',
                background: '#FDFBF8',
                color: '#1A1410',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#B99752')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#E8DFD5')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#3D3530' }}>
              Link Google Maps{' '}
              <span className="font-normal" style={{ color: '#A09080' }}>
                (opcional)
              </span>
            </label>
            <input
              type="url"
              value={data.googleMapsUrl}
              onChange={(e) => update('googleMapsUrl', e.target.value)}
              placeholder="https://maps.google.com/..."
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={{
                border: '1.5px solid #E8DFD5',
                background: '#FDFBF8',
                color: '#1A1410',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#B99752')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#E8DFD5')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#3D3530' }}>
              Link Waze{' '}
              <span className="font-normal" style={{ color: '#A09080' }}>
                (opcional)
              </span>
            </label>
            <input
              type="url"
              value={data.wazeUrl}
              onChange={(e) => update('wazeUrl', e.target.value)}
              placeholder="https://waze.com/ul/..."
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={{
                border: '1.5px solid #E8DFD5',
                background: '#FDFBF8',
                color: '#1A1410',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#B99752')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#E8DFD5')}
            />
          </div>
        </>
      )}

      {data.locationSkipped && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{ background: '#FBF8F2', border: '1px dashed #E8DFD5', color: '#A09080' }}
        >
          Podrás agregar el lugar desde el editor después.
        </div>
      )}
    </div>
  );
}

// ─── Step 4 (Basic: 3): Style ─────────────────────────────────────────────────

function StepStyle({
  data,
  update,
}: {
  data: WizardData;
  update: (f: keyof WizardData, v: ThemeIdV2) => void;
}) {
  return (
    <div className="pt-2 space-y-3">
      <p className="text-sm mb-4" style={{ color: '#746B62' }}>
        Elige el estilo visual de tu invitación. Puedes cambiarlo después.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {WIZARD_THEME_OPTIONS.map((theme) => {
          const selected = data.themeId === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => update('themeId', theme.id)}
              className="rounded-xl p-3 text-left transition-all"
              style={{
                background: theme.bg,
                border: selected ? `2px solid ${theme.accent}` : '2px solid transparent',
                boxShadow: selected ? `0 0 0 1px ${theme.accent}` : 'none',
              }}
            >
              {/* Color swatch */}
              <div
                className="w-full rounded-lg mb-2"
                style={{ height: 36, background: theme.accent, opacity: 0.25 }}
              />
              <div
                className="w-8 h-8 rounded-full mb-2"
                style={{ background: theme.accent }}
              />
              <p className="text-xs font-semibold leading-tight" style={{ color: '#1A1410' }}>
                {theme.label}
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#746B62' }}>
                {theme.desc}
              </p>
              {selected && (
                <div
                  className="mt-2 text-xs font-medium"
                  style={{ color: theme.accent }}
                >
                  ✓ Seleccionado
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 5 (Basic: 4): WhatsApp ─────────────────────────────────────────────

function StepWhatsApp({
  data,
  update,
}: {
  data: WizardData;
  update: (f: keyof WizardData, v: string) => void;
}) {
  return (
    <div className="pt-2 space-y-5">
      <p className="text-sm" style={{ color: '#746B62' }}>
        Tus invitados podrán confirmar asistencia por WhatsApp. Puedes omitirlo si no tienes aún.
      </p>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#3D3530' }}>
          Número de WhatsApp{' '}
          <span className="font-normal" style={{ color: '#A09080' }}>
            (opcional)
          </span>
        </label>
        <input
          type="tel"
          value={data.whatsappNumber}
          onChange={(e) => update('whatsappNumber', e.target.value)}
          placeholder="+52 55 1234 5678"
          className="w-full rounded-xl px-4 py-3 text-sm outline-none"
          style={{
            border: '1.5px solid #E8DFD5',
            background: '#FDFBF8',
            color: '#1A1410',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#B99752')}
          onBlur={(e) => (e.currentTarget.style.borderColor = '#E8DFD5')}
        />
        <p className="text-xs mt-1.5" style={{ color: '#A09080' }}>
          Incluye el código de país (ej. +52 para México).
        </p>
      </div>

      <div
        className="rounded-xl px-4 py-3"
        style={{ background: '#FBF8F2', border: '1px solid #E8DFD5' }}
      >
        <p className="text-xs font-medium mb-1" style={{ color: '#3D3530' }}>
          Resumen de tu invitación
        </p>
        <ul className="text-xs space-y-1" style={{ color: '#746B62' }}>
          <li>👰 {data.brideName} & {data.groomName}</li>
          {data.weddingDate && (
            <li>📅 {new Date(data.weddingDate + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</li>
          )}
          {data.ceremonyTime && <li>⏰ Ceremonia a las {data.ceremonyTime}</li>}
          {data.venueName && <li>📍 {data.venueName}</li>}
        </ul>
      </div>
    </div>
  );
}

// ─── Success screen ───────────────────────────────────────────────────────────

function SuccessScreen({
  brideName,
  groomName,
  invitationId,
  isUpdate,
}: {
  brideName: string;
  groomName: string;
  invitationId: string;
  isUpdate?: boolean;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-6 text-center">
        {/* Celebration icon */}
        <div
          className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl"
          style={{ background: '#FBF8F2', border: '1px solid #E8DFD5' }}
        >
          {isUpdate ? '✏️' : '🎉'}
        </div>

        <h2 className="text-xl font-semibold mb-2" style={{ color: '#1A1410' }}>
          {isUpdate ? '¡Invitación actualizada!' : '¡Tu invitación está lista!'}
        </h2>
        <p className="text-sm mb-6" style={{ color: '#746B62' }}>
          {isUpdate
            ? `Actualizamos la invitación de ${brideName} & ${groomName}.`
            : `Creamos la base de la invitación de ${brideName} & ${groomName}. Ahora puedes personalizarla.`}
        </p>

        {/* Reopen hint */}
        <div
          className="rounded-xl px-4 py-3 mb-4 text-left"
          style={{ background: '#F0EBE4', border: '1px solid #DDD0BE' }}
        >
          <p className="text-xs" style={{ color: '#6B5B4E' }}>
            💡 Puedes volver a usar este asistente cuando quieras desde el botón{' '}
            <strong style={{ color: '#5C4A32' }}>&ldquo;Editar con asistente rápido&rdquo;</strong>{' '}
            en la parte superior del editor.
          </p>
        </div>

        {/* Pending checklist */}
        <div
          className="rounded-xl px-4 py-4 text-left mb-6"
          style={{ background: '#FBF8F2', border: '1px solid #E8DFD5' }}
        >
          <p className="text-xs font-semibold mb-3" style={{ color: '#3D3530' }}>
            Para completar tu invitación:
          </p>
          <ul className="space-y-2">
            {PENDING_CHECKLIST.map((item) => (
              <li key={item} className="flex items-center gap-2 text-xs" style={{ color: '#746B62' }}>
                <span
                  className="w-4 h-4 rounded border flex-shrink-0"
                  style={{ border: '1.5px solid #D4B97A' }}
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer CTA */}
      <div
        className="flex flex-col gap-3 px-5 py-4 border-t"
        style={{ borderColor: '#F0EBE3' }}
      >
        <button
          onClick={() => {
            window.location.href = `/preview/${invitationId}`;
          }}
          className="w-full rounded-xl font-semibold text-sm transition-colors"
          style={{
            minHeight: 44,
            background: '#B99752',
            color: '#FFFFFF',
          }}
        >
          Ver vista previa
        </button>
        <button
          onClick={() => {
            window.location.href = `/dashboard/invitations/${invitationId}/edit`;
          }}
          className="w-full rounded-xl font-semibold text-sm transition-colors"
          style={{
            minHeight: 44,
            background: '#F5F0E8',
            color: '#746B62',
            border: '1px solid #E8DFD5',
          }}
        >
          Seguir editando
        </button>
      </div>
    </div>
  );
}
