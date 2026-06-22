'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { startWeddingQuickStart } from '@/app/dashboard/invitations/[id]/edit/actions';
import { resolveWeddingThemeId, type WeddingStyle, WEDDING_STYLES } from '@/domain/themes-v2/style-to-theme-map';

export interface WeddingQuickStartWizardProps {
  invitationId: string;
  planId: string;
  onClose: () => void;
}

const STYLE_LABELS: Record<WeddingStyle, string> = {
  elegante: '🌹 Romántico floral',
  minimalista: '🌿 Natural elegante',
  jardín: '💙 Cielo pastel',
  playa: '🌟 Editorial clásico',
  clásico: '✨ Champagne elegante',
  moderno: '◆ Minimalista moderno',
};

interface WizardState {
  brideName: string;
  groomName: string;
  weddingDate: string;
  receptionTime: string;
  ceremonyTime: string;
  venueName: string;
  address: string;
  googleMapsUrl: string;
  wazeUrl: string;
  selectedStyle: WeddingStyle | null;
  heroTitle: string;
  heroSubtitle: string;
  galleryTitle: string;
  galleryDescription: string;
  storyQuestion1: string;
  storyQuestion2: string;
  storyQuestion3: string;
  itineraryItems: Array<{ time: string; activity: string }>;
  dressCodeType: string;
  dressCodeNote: string;
  dressCodeColors: string[];
  giftRegistryItems: Array<{ name: string; link: string; note: string }>;
  parents: { brideSide: string; groomSide: string };
  padrinos: string;
  hotels: Array<{ name: string; address: string; link: string; note: string }>;
  hashtag: string;
  instagramHandle: string;
  tiktokHandle: string;
  whatsappNumber: string;
  finalMessage: string;
}

const DRESS_CODE_TYPES = [
  'Formal',
  'Etiqueta',
  'Cóctel',
  'Playa formal',
  'Casual elegante',
];

const ITINERARY_DEFAULTS = [
  { time: '17:00', activity: 'Ceremonia' },
  { time: '18:30', activity: 'Recepción' },
  { time: '20:00', activity: 'Cena' },
  { time: '22:00', activity: 'Baile' },
];

export function WeddingQuickStartWizard({
  invitationId,
  planId,
  onClose,
}: WeddingQuickStartWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<WizardState>({
    brideName: '',
    groomName: '',
    weddingDate: '',
    receptionTime: '',
    ceremonyTime: '',
    venueName: '',
    address: '',
    googleMapsUrl: '',
    wazeUrl: '',
    selectedStyle: null,
    heroTitle: '',
    heroSubtitle: '',
    galleryTitle: '',
    galleryDescription: '',
    storyQuestion1: '',
    storyQuestion2: '',
    storyQuestion3: '',
    itineraryItems: ITINERARY_DEFAULTS,
    dressCodeType: '',
    dressCodeNote: '',
    dressCodeColors: [],
    giftRegistryItems: [],
    parents: { brideSide: '', groomSide: '' },
    padrinos: '',
    hotels: [],
    hashtag: '',
    instagramHandle: '',
    tiktokHandle: '',
    whatsappNumber: '',
    finalMessage: '',
  });

  const [skippedSteps, setSkippedSteps] = useState<Set<number>>(new Set());

  // Validaciones por paso
  const stepValidation: Record<number, boolean> = {
    1: data.brideName.trim().length > 0 && data.groomName.trim().length > 0,
    2: data.weddingDate.trim().length > 0,
    3: data.venueName.trim().length > 0,
    4: data.selectedStyle !== null,
    5: true, // Portada es opcional
    6: true, // Galería es opcional
    7: true, // Historia es opcional
    8: true, // Itinerario es opcional
    9: true, // Dress code es opcional
    10: true, // Mesa de regalos es opcional
    11: true, // Familia es opcional
    12: true, // Hospedaje es opcional
    13: true, // Redes es opcional
    14: true, // WhatsApp es opcional
    15: true, // Mensaje final es opcional
  };

  const canAdvance = stepValidation[step] ?? true;

  // Calcular pasos visibles según plan
  const getVisibleSteps = () => {
    const baseSteps = [1, 2, 3, 4, 5, 8, 9, 14, 15];
    if (planId === 'premium' || planId === 'deluxe') {
      baseSteps.push(6, 13);
    }
    if (planId === 'deluxe') {
      baseSteps.push(7, 10, 11, 12);
    }
    return baseSteps.sort((a, b) => a - b);
  };

  const visibleSteps = getVisibleSteps();

  const currentStepIndex = visibleSteps.indexOf(step);
  const totalSteps = visibleSteps.length;

  const handleSkip = () => {
    setError(null);
    setSkippedSteps((prev) => new Set([...prev, step]));
    handleNext();
  };

  const handleNext = () => {
    setError(null);
    if (!canAdvance) {
      if (step === 1) {
        setError('Por favor, completa los nombres de ambos novios.');
      } else if (step === 2) {
        setError('Por favor, ingresa la fecha de la boda.');
      } else if (step === 3) {
        setError('Por favor, ingresa el nombre del lugar.');
      } else if (step === 4) {
        setError('Por favor, selecciona un estilo.');
      }
      return;
    }

    if (currentStepIndex < totalSteps - 1) {
      const nextStep = visibleSteps[currentStepIndex + 1];
      setStep(nextStep);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    setError(null);
    if (currentStepIndex > 0) {
      const prevStep = visibleSteps[currentStepIndex - 1];
      setStep(prevStep);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
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
        selectedStyle: data.selectedStyle!,
        heroTitle: data.heroTitle || undefined,
        heroSubtitle: data.heroSubtitle || undefined,
        galleryTitle: data.galleryTitle || undefined,
        galleryDescription: data.galleryDescription || undefined,
        storyQuestion1: data.storyQuestion1 || undefined,
        storyQuestion2: data.storyQuestion2 || undefined,
        storyQuestion3: data.storyQuestion3 || undefined,
        itineraryItems: data.itineraryItems.length > 0 ? data.itineraryItems : undefined,
        dressCodeType: data.dressCodeType || undefined,
        dressCodeNote: data.dressCodeNote || undefined,
        dressCodeColors: data.dressCodeColors.length > 0 ? data.dressCodeColors : undefined,
        giftRegistryItems: data.giftRegistryItems.length > 0 ? data.giftRegistryItems : undefined,
        parents: data.parents.brideSide || data.parents.groomSide ? data.parents : undefined,
        padrinos: data.padrinos || undefined,
        hotels: data.hotels.length > 0 ? data.hotels : undefined,
        hashtag: data.hashtag || undefined,
        instagramHandle: data.instagramHandle || undefined,
        tiktokHandle: data.tiktokHandle || undefined,
        whatsappNumber: data.whatsappNumber || undefined,
        finalMessage: data.finalMessage || undefined,
        skippedSteps: Array.from(skippedSteps),
      });

      if (result.success) {
        onClose();
        await new Promise((resolve) => setTimeout(resolve, 500));
        router.refresh();
      } else {
        setError(result.message || 'Error al crear la invitación.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape' && !loading) {
      onClose();
    }
  };

  const isLastStep = currentStepIndex === totalSteps - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="presentation"
    >
      <div
        className="w-full max-w-2xl rounded-2xl shadow-lg overflow-hidden flex flex-col"
        style={{
          background: '#FFFFFF',
          maxHeight: '90vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b flex-shrink-0" style={{ borderColor: '#E8DFD5' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold" style={{ color: '#1A1410' }}>
              Crear invitación
            </h2>
            <button
              onClick={onClose}
              className="text-2xl font-light leading-none p-0"
              style={{ color: '#9B8878' }}
              disabled={loading}
            >
              ×
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: '#B99752' }}
            >
              Paso {currentStepIndex + 1} de {totalSteps}
            </div>
            <div
              className="w-32 h-1 rounded-full"
              style={{ background: '#E8DFD5' }}
            >
              <div
                className="h-1 rounded-full transition-all"
                style={{
                  background: '#B99752',
                  width: `${((currentStepIndex + 1) / totalSteps) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && <Step1Names data={data} setData={setData} loading={loading} />}
          {step === 2 && <Step2DateTime data={data} setData={setData} loading={loading} />}
          {step === 3 && <Step3Location data={data} setData={setData} loading={loading} />}
          {step === 4 && <Step4Style data={data} setData={setData} loading={loading} />}
          {step === 5 && <Step5Hero data={data} setData={setData} loading={loading} />}
          {step === 6 && <Step6Gallery data={data} setData={setData} loading={loading} />}
          {step === 7 && <Step7Story data={data} setData={setData} loading={loading} />}
          {step === 8 && <Step8Itinerary data={data} setData={setData} loading={loading} />}
          {step === 9 && <Step9DressCode data={data} setData={setData} loading={loading} />}
          {step === 10 && <Step10Gifts data={data} setData={setData} loading={loading} />}
          {step === 11 && <Step11Family data={data} setData={setData} loading={loading} />}
          {step === 12 && <Step12Hotels data={data} setData={setData} loading={loading} />}
          {step === 13 && <Step13Social data={data} setData={setData} loading={loading} />}
          {step === 14 && <Step14WhatsApp data={data} setData={setData} loading={loading} />}
          {step === 15 && <Step15FinalMessage data={data} setData={setData} loading={loading} />}

          {error && (
            <div
              className="mt-4 p-3 rounded-lg text-sm"
              style={{ background: '#FFEBEE', color: '#C62828' }}
            >
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex gap-3 flex-shrink-0" style={{ borderColor: '#E8DFD5' }}>
          {step > visibleSteps[0] ? (
            <button
              onClick={handleBack}
              className="flex-1 px-4 py-3 rounded-lg font-semibold text-sm transition-colors"
              style={{
                background: '#F9F7F3',
                color: '#746B62',
                minHeight: '44px',
              }}
              disabled={loading}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#F0EBE3')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#F9F7F3')}
            >
              Atrás
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg font-semibold text-sm transition-colors"
              style={{
                background: '#F9F7F3',
                color: '#746B62',
                minHeight: '44px',
              }}
              disabled={loading}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#F0EBE3')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#F9F7F3')}
            >
              Cancelar
            </button>
          )}

          {step > visibleSteps[0] && (
            <button
              onClick={handleSkip}
              className="flex-1 px-4 py-3 rounded-lg font-semibold text-sm transition-colors"
              style={{
                background: '#F0EBE3',
                color: '#746B62',
                minHeight: '44px',
              }}
              disabled={loading}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#E8DFD5')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#F0EBE3')}
            >
              Omitir
            </button>
          )}

          <button
            onClick={handleNext}
            className="flex-1 px-4 py-3 rounded-lg font-semibold text-sm transition-colors"
            style={{
              background: loading ? '#D4C4B0' : '#B99752',
              color: '#FFFFFF',
              minHeight: '44px',
            }}
            disabled={loading || !canAdvance}
            onMouseEnter={(e) =>
              !loading && !(!canAdvance) && (e.currentTarget.style.background = '#A8845E')
            }
            onMouseLeave={(e) =>
              !loading && !(!canAdvance) && (e.currentTarget.style.background = '#B99752')
            }
          >
            {loading
              ? 'Creando...'
              : isLastStep
              ? 'Crear invitación'
              : 'Continuar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Step Components ───────────────────────────────────────────────────────

function Step1Names({
  data,
  setData,
  loading,
}: {
  data: WizardState;
  setData: (data: WizardState) => void;
  loading: boolean;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold" style={{ color: '#1A1410' }}>
        ¿Cómo se llaman?
      </h3>
      <p className="text-sm" style={{ color: '#746B62' }}>
        Estos nombres aparecerán en la portada principal de tu invitación.
      </p>
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: '#746B62' }}>
          Novia
        </label>
        <input
          type="text"
          placeholder="Ej: María"
          value={data.brideName}
          onChange={(e) => setData({ ...data, brideName: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border"
          style={{ borderColor: '#E8DFD5', minHeight: '44px' }}
          disabled={loading}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: '#746B62' }}>
          Novio
        </label>
        <input
          type="text"
          placeholder="Ej: Juan"
          value={data.groomName}
          onChange={(e) => setData({ ...data, groomName: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border"
          style={{ borderColor: '#E8DFD5', minHeight: '44px' }}
          disabled={loading}
        />
      </div>
      {data.brideName.trim() || data.groomName.trim() ? (
        <div className="mt-4 p-3 rounded-lg" style={{ background: '#F9F7F3' }}>
          <p className="text-sm font-semibold text-center" style={{ color: '#1A1410' }}>
            {data.brideName.trim()} & {data.groomName.trim()}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function Step2DateTime({
  data,
  setData,
  loading,
}: {
  data: WizardState;
  setData: (data: WizardState) => void;
  loading: boolean;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold" style={{ color: '#1A1410' }}>
        ¿Cuándo será la boda?
      </h3>
      <p className="text-sm" style={{ color: '#746B62' }}>
        Usaremos esta fecha para crear la cuenta regresiva y mostrar los datos principales del evento.
      </p>
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: '#746B62' }}>
          Fecha de la boda *
        </label>
        <input
          type="date"
          value={data.weddingDate}
          onChange={(e) => setData({ ...data, weddingDate: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border"
          style={{ borderColor: '#E8DFD5', minHeight: '44px' }}
          disabled={loading}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: '#746B62' }}>
          Hora de la ceremonia (opcional)
        </label>
        <input
          type="time"
          value={data.ceremonyTime}
          onChange={(e) => setData({ ...data, ceremonyTime: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border"
          style={{ borderColor: '#E8DFD5', minHeight: '44px' }}
          disabled={loading}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: '#746B62' }}>
          Hora de recepción (opcional)
        </label>
        <input
          type="time"
          value={data.receptionTime}
          onChange={(e) => setData({ ...data, receptionTime: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border"
          style={{ borderColor: '#E8DFD5', minHeight: '44px' }}
          disabled={loading}
        />
      </div>
    </div>
  );
}

function Step3Location({
  data,
  setData,
  loading,
}: {
  data: WizardState;
  setData: (data: WizardState) => void;
  loading: boolean;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold" style={{ color: '#1A1410' }}>
        ¿Dónde será la boda?
      </h3>
      <p className="text-sm" style={{ color: '#746B62' }}>
        Agrega el lugar del evento para que tus invitados puedan llegar fácilmente.
      </p>
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: '#746B62' }}>
          Nombre del lugar *
        </label>
        <input
          type="text"
          placeholder="Ej: Hacienda Santa Rosa"
          value={data.venueName}
          onChange={(e) => setData({ ...data, venueName: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border"
          style={{ borderColor: '#E8DFD5', minHeight: '44px' }}
          disabled={loading}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: '#746B62' }}>
          Dirección
        </label>
        <input
          type="text"
          placeholder="Ej: Calle Principal 123"
          value={data.address}
          onChange={(e) => setData({ ...data, address: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border"
          style={{ borderColor: '#E8DFD5', minHeight: '44px' }}
          disabled={loading}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: '#746B62' }}>
          Link de Google Maps
        </label>
        <input
          type="url"
          placeholder="https://maps.google.com/..."
          value={data.googleMapsUrl}
          onChange={(e) => setData({ ...data, googleMapsUrl: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border"
          style={{ borderColor: '#E8DFD5', minHeight: '44px' }}
          disabled={loading}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: '#746B62' }}>
          Link de Waze (opcional)
        </label>
        <input
          type="url"
          placeholder="https://waze.com/..."
          value={data.wazeUrl}
          onChange={(e) => setData({ ...data, wazeUrl: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border"
          style={{ borderColor: '#E8DFD5', minHeight: '44px' }}
          disabled={loading}
        />
      </div>
    </div>
  );
}

function Step4Style({
  data,
  setData,
  loading,
}: {
  data: WizardState;
  setData: (data: WizardState) => void;
  loading: boolean;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold" style={{ color: '#1A1410' }}>
        ¿Qué estilo les gusta?
      </h3>
      <p className="text-sm" style={{ color: '#746B62' }}>
        Elegiremos un diseño inicial para tu invitación. Podrás cambiarlo después sin perder tus datos.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {WEDDING_STYLES.map((style) => (
          <button
            key={style}
            onClick={() => setData({ ...data, selectedStyle: style })}
            className="px-3 py-3 rounded-lg border-2 font-medium text-sm transition-all"
            style={{
              background:
                data.selectedStyle === style ? '#FAF7F2' : '#FFFFFF',
              borderColor:
                data.selectedStyle === style ? '#B99752' : '#E8DFD5',
              color: data.selectedStyle === style ? '#B99752' : '#746B62',
              minHeight: '44px',
            }}
            disabled={loading}
          >
            {STYLE_LABELS[style]}
          </button>
        ))}
      </div>
    </div>
  );
}

function Step5Hero({
  data,
  setData,
  loading,
}: {
  data: WizardState;
  setData: (data: WizardState) => void;
  loading: boolean;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold" style={{ color: '#1A1410' }}>
        Portada de la invitación
      </h3>
      <p className="text-sm" style={{ color: '#746B62' }}>
        Esta será la primera sección que verán tus invitados. Te recomendamos usar una frase breve, elegante y emocional.
      </p>
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: '#746B62' }}>
          Frase de bienvenida (opcional)
        </label>
        <input
          type="text"
          placeholder="Ej: Nos da la alegría de invitarte..."
          value={data.heroTitle}
          onChange={(e) => setData({ ...data, heroTitle: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border"
          style={{ borderColor: '#E8DFD5', minHeight: '44px' }}
          disabled={loading}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: '#746B62' }}>
          Texto secundario (opcional)
        </label>
        <input
          type="text"
          placeholder="Ej: Acompáñanos en uno de los días más especiales de nuestras vidas"
          value={data.heroSubtitle}
          onChange={(e) => setData({ ...data, heroSubtitle: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border"
          style={{ borderColor: '#E8DFD5', minHeight: '44px' }}
          disabled={loading}
        />
      </div>
      <div className="p-4 rounded-lg" style={{ background: '#F9F7F3' }}>
        <p className="text-xs" style={{ color: '#746B62' }}>
          La foto de portada la podrás subir en el siguiente paso del editor.
        </p>
      </div>
    </div>
  );
}

function Step6Gallery({
  data,
  setData,
  loading,
}: {
  data: WizardState;
  setData: (data: WizardState) => void;
  loading: boolean;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold" style={{ color: '#1A1410' }}>
        Momentos capturados
      </h3>
      <p className="text-sm" style={{ color: '#746B62' }}>
        En esta sección te sugiero usar 4 fotografías de los momentos más felices como pareja: viajes, pedida de mano, sesiones casuales o recuerdos importantes.
      </p>
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: '#746B62' }}>
          Título de galería (opcional)
        </label>
        <input
          type="text"
          placeholder="Ej: Nuestros momentos favoritos"
          value={data.galleryTitle}
          onChange={(e) => setData({ ...data, galleryTitle: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border"
          style={{ borderColor: '#E8DFD5', minHeight: '44px' }}
          disabled={loading}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: '#746B62' }}>
          Descripción breve (opcional)
        </label>
        <textarea
          placeholder="Describe brevemente lo que estas fotos significan para ustedes"
          value={data.galleryDescription}
          onChange={(e) => setData({ ...data, galleryDescription: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border"
          style={{ borderColor: '#E8DFD5', minHeight: '100px' }}
          disabled={loading}
        />
      </div>
      <div className="p-4 rounded-lg" style={{ background: '#F9F7F3' }}>
        <p className="text-xs" style={{ color: '#746B62' }}>
          Podrás subir tus fotos al terminar este asistente.
        </p>
      </div>
    </div>
  );
}

function Step7Story({
  data,
  setData,
  loading,
}: {
  data: WizardState;
  setData: (data: WizardState) => void;
  loading: boolean;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold" style={{ color: '#1A1410' }}>
        Nuestra historia
      </h3>
      <p className="text-sm" style={{ color: '#746B62' }}>
        Cuéntanos en un libro una historia breve del comienzo de su relación hasta el día de la propuesta de matrimonio.
      </p>
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: '#746B62' }}>
          ¿Cómo se conocieron? (opcional)
        </label>
        <textarea
          placeholder="Cuéntanos cómo empezó todo..."
          value={data.storyQuestion1}
          onChange={(e) => setData({ ...data, storyQuestion1: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border"
          style={{ borderColor: '#E8DFD5', minHeight: '80px' }}
          disabled={loading}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: '#746B62' }}>
          ¿Cuál fue un momento especial? (opcional)
        </label>
        <textarea
          placeholder="Cuéntanos de un momento que recuerdes especialmente..."
          value={data.storyQuestion2}
          onChange={(e) => setData({ ...data, storyQuestion2: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border"
          style={{ borderColor: '#E8DFD5', minHeight: '80px' }}
          disabled={loading}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: '#746B62' }}>
          ¿Cómo fue la propuesta? (opcional)
        </label>
        <textarea
          placeholder="Cuéntanos los detalles especiales de tu propuesta..."
          value={data.storyQuestion3}
          onChange={(e) => setData({ ...data, storyQuestion3: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border"
          style={{ borderColor: '#E8DFD5', minHeight: '80px' }}
          disabled={loading}
        />
      </div>
    </div>
  );
}

function Step8Itinerary({
  data,
  setData,
  loading,
}: {
  data: WizardState;
  setData: (data: WizardState) => void;
  loading: boolean;
}) {
  const handleAddItinerary = () => {
    setData({
      ...data,
      itineraryItems: [...data.itineraryItems, { time: '20:00', activity: '' }],
    });
  };

  const handleRemoveItinerary = (index: number) => {
    setData({
      ...data,
      itineraryItems: data.itineraryItems.filter((_, i) => i !== index),
    });
  };

  const handleUpdateItinerary = (index: number, field: 'time' | 'activity', value: string) => {
    const updated = [...data.itineraryItems];
    updated[index] = { ...updated[index], [field]: value };
    setData({ ...data, itineraryItems: updated });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold" style={{ color: '#1A1410' }}>
        Itinerario del evento
      </h3>
      <p className="text-sm" style={{ color: '#746B62' }}>
        Agrega el orden del día para que tus invitados sepan qué pasará y a qué hora.
      </p>
      <div className="space-y-3">
        {data.itineraryItems.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex gap-2">
              <input
                type="time"
                value={item.time}
                onChange={(e) => handleUpdateItinerary(index, 'time', e.target.value)}
                className="w-24 px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: '#E8DFD5' }}
                disabled={loading}
              />
              <input
                type="text"
                placeholder="Actividad"
                value={item.activity}
                onChange={(e) => handleUpdateItinerary(index, 'activity', e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: '#E8DFD5' }}
                disabled={loading}
              />
              <button
                onClick={() => handleRemoveItinerary(index)}
                className="px-3 py-2 rounded-lg text-sm"
                style={{ background: '#FFEBEE', color: '#C62828' }}
                disabled={loading}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={handleAddItinerary}
        className="w-full px-4 py-2 rounded-lg text-sm font-semibold"
        style={{ background: '#F9F7F3', color: '#B99752' }}
        disabled={loading}
      >
        + Agregar actividad
      </button>
    </div>
  );
}

function Step9DressCode({
  data,
  setData,
  loading,
}: {
  data: WizardState;
  setData: (data: WizardState) => void;
  loading: boolean;
}) {
  const handleAddColor = () => {
    const newColor = prompt('Ingresa el código HEX del color (ej: #FF5733):');
    if (newColor && /^#[0-9A-F]{6}$/i.test(newColor)) {
      setData({
        ...data,
        dressCodeColors: [...data.dressCodeColors, newColor],
      });
    } else if (newColor) {
      alert('Formato inválido. Usa #RRGGBB');
    }
  };

  const handleRemoveColor = (index: number) => {
    setData({
      ...data,
      dressCodeColors: data.dressCodeColors.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold" style={{ color: '#1A1410' }}>
        Código de vestimenta
      </h3>
      <p className="text-sm" style={{ color: '#746B62' }}>
        Indica cómo quieres que vistan tus invitados. También puedes sugerir colores si deseas mantener una estética especial.
      </p>
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: '#746B62' }}>
          Tipo de vestimenta (opcional)
        </label>
        <select
          value={data.dressCodeType}
          onChange={(e) => setData({ ...data, dressCodeType: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border"
          style={{ borderColor: '#E8DFD5', minHeight: '44px' }}
          disabled={loading}
        >
          <option value="">Selecciona...</option>
          {DRESS_CODE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: '#746B62' }}>
          Nota para invitados (opcional)
        </label>
        <textarea
          placeholder="Ej: Preferimos tonos tierra y naturales"
          value={data.dressCodeNote}
          onChange={(e) => setData({ ...data, dressCodeNote: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border"
          style={{ borderColor: '#E8DFD5', minHeight: '80px' }}
          disabled={loading}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-2" style={{ color: '#746B62' }}>
          Colores sugeridos (opcional)
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {data.dressCodeColors.map((color, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg border"
                style={{ background: color, borderColor: '#E8DFD5' }}
              />
              <button
                onClick={() => handleRemoveColor(index)}
                className="text-xs px-2 py-1 rounded"
                style={{ background: '#FFEBEE', color: '#C62828' }}
                disabled={loading}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={handleAddColor}
          className="w-full px-4 py-2 rounded-lg text-sm font-semibold"
          style={{ background: '#F9F7F3', color: '#B99752' }}
          disabled={loading}
        >
          + Agregar color
        </button>
      </div>
    </div>
  );
}

function Step10Gifts({
  data,
  setData,
  loading,
}: {
  data: WizardState;
  setData: (data: WizardState) => void;
  loading: boolean;
}) {
  const handleAddGift = () => {
    setData({
      ...data,
      giftRegistryItems: [...data.giftRegistryItems, { name: '', link: '', note: '' }],
    });
  };

  const handleRemoveGift = (index: number) => {
    setData({
      ...data,
      giftRegistryItems: data.giftRegistryItems.filter((_, i) => i !== index),
    });
  };

  const handleUpdateGift = (
    index: number,
    field: 'name' | 'link' | 'note',
    value: string
  ) => {
    const updated = [...data.giftRegistryItems];
    updated[index] = { ...updated[index], [field]: value };
    setData({ ...data, giftRegistryItems: updated });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold" style={{ color: '#1A1410' }}>
        Mesa de regalos
      </h3>
      <p className="text-sm" style={{ color: '#746B62' }}>
        Agrega los enlaces donde tus invitados pueden encontrar tu mesa de regalos o una opción para aportar a su nueva etapa.
      </p>
      <div className="space-y-3">
        {data.giftRegistryItems.map((item, index) => (
          <div key={index} className="space-y-2 p-3 rounded-lg" style={{ background: '#F9F7F3' }}>
            <input
              type="text"
              placeholder="Nombre de tienda, banco o regalo"
              value={item.name}
              onChange={(e) => handleUpdateGift(index, 'name', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{ borderColor: '#E8DFD5' }}
              disabled={loading}
            />
            <input
              type="url"
              placeholder="Link"
              value={item.link}
              onChange={(e) => handleUpdateGift(index, 'link', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{ borderColor: '#E8DFD5' }}
              disabled={loading}
            />
            <input
              type="text"
              placeholder="Mensaje opcional"
              value={item.note}
              onChange={(e) => handleUpdateGift(index, 'note', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{ borderColor: '#E8DFD5' }}
              disabled={loading}
            />
            <button
              onClick={() => handleRemoveGift(index)}
              className="w-full px-3 py-2 rounded-lg text-sm font-semibold"
              style={{ background: '#FFEBEE', color: '#C62828' }}
              disabled={loading}
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={handleAddGift}
        className="w-full px-4 py-2 rounded-lg text-sm font-semibold"
        style={{ background: '#F9F7F3', color: '#B99752' }}
        disabled={loading}
      >
        + Agregar opción de regalo
      </button>
    </div>
  );
}

function Step11Family({
  data,
  setData,
  loading,
}: {
  data: WizardState;
  setData: (data: WizardState) => void;
  loading: boolean;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold" style={{ color: '#1A1410' }}>
        Familia y padrinos
      </h3>
      <p className="text-sm" style={{ color: '#746B62' }}>
        Aquí puedes mencionar a las personas especiales que los acompañarán en este día.
      </p>
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: '#746B62' }}>
          Padres de la novia (opcional)
        </label>
        <input
          type="text"
          placeholder="Ej: Nombre Apellido & Nombre Apellido"
          value={data.parents.brideSide}
          onChange={(e) =>
            setData({ ...data, parents: { ...data.parents, brideSide: e.target.value } })
          }
          className="w-full px-4 py-3 rounded-lg border"
          style={{ borderColor: '#E8DFD5', minHeight: '44px' }}
          disabled={loading}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: '#746B62' }}>
          Padres del novio (opcional)
        </label>
        <input
          type="text"
          placeholder="Ej: Nombre Apellido & Nombre Apellido"
          value={data.parents.groomSide}
          onChange={(e) =>
            setData({ ...data, parents: { ...data.parents, groomSide: e.target.value } })
          }
          className="w-full px-4 py-3 rounded-lg border"
          style={{ borderColor: '#E8DFD5', minHeight: '44px' }}
          disabled={loading}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: '#746B62' }}>
          Padrinos o personas especiales (opcional)
        </label>
        <textarea
          placeholder="Ej: Padrinos de anillos, ceremonia, brindis, etc."
          value={data.padrinos}
          onChange={(e) => setData({ ...data, padrinos: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border"
          style={{ borderColor: '#E8DFD5', minHeight: '80px' }}
          disabled={loading}
        />
      </div>
    </div>
  );
}

function Step12Hotels({
  data,
  setData,
  loading,
}: {
  data: WizardState;
  setData: (data: WizardState) => void;
  loading: boolean;
}) {
  const handleAddHotel = () => {
    setData({
      ...data,
      hotels: [...data.hotels, { name: '', address: '', link: '', note: '' }],
    });
  };

  const handleRemoveHotel = (index: number) => {
    setData({
      ...data,
      hotels: data.hotels.filter((_, i) => i !== index),
    });
  };

  const handleUpdateHotel = (
    index: number,
    field: 'name' | 'address' | 'link' | 'note',
    value: string
  ) => {
    const updated = [...data.hotels];
    updated[index] = { ...updated[index], [field]: value };
    setData({ ...data, hotels: updated });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold" style={{ color: '#1A1410' }}>
        Hospedaje para invitados
      </h3>
      <p className="text-sm" style={{ color: '#746B62' }}>
        Si tienes invitados que vienen de otra ciudad, puedes recomendar hoteles o lugares cercanos al evento.
      </p>
      <div className="space-y-3">
        {data.hotels.map((hotel, index) => (
          <div key={index} className="space-y-2 p-3 rounded-lg" style={{ background: '#F9F7F3' }}>
            <input
              type="text"
              placeholder="Nombre del hotel"
              value={hotel.name}
              onChange={(e) => handleUpdateHotel(index, 'name', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{ borderColor: '#E8DFD5' }}
              disabled={loading}
            />
            <input
              type="text"
              placeholder="Dirección o zona"
              value={hotel.address}
              onChange={(e) => handleUpdateHotel(index, 'address', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{ borderColor: '#E8DFD5' }}
              disabled={loading}
            />
            <input
              type="url"
              placeholder="Link de reserva"
              value={hotel.link}
              onChange={(e) => handleUpdateHotel(index, 'link', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{ borderColor: '#E8DFD5' }}
              disabled={loading}
            />
            <input
              type="text"
              placeholder="Nota opcional"
              value={hotel.note}
              onChange={(e) => handleUpdateHotel(index, 'note', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{ borderColor: '#E8DFD5' }}
              disabled={loading}
            />
            <button
              onClick={() => handleRemoveHotel(index)}
              className="w-full px-3 py-2 rounded-lg text-sm font-semibold"
              style={{ background: '#FFEBEE', color: '#C62828' }}
              disabled={loading}
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={handleAddHotel}
        className="w-full px-4 py-2 rounded-lg text-sm font-semibold"
        style={{ background: '#F9F7F3', color: '#B99752' }}
        disabled={loading}
      >
        + Agregar hospedaje
      </button>
    </div>
  );
}

function Step13Social({
  data,
  setData,
  loading,
}: {
  data: WizardState;
  setData: (data: WizardState) => void;
  loading: boolean;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold" style={{ color: '#1A1410' }}>
        Redes y hashtag
      </h3>
      <p className="text-sm" style={{ color: '#746B62' }}>
        Agrega un hashtag o redes sociales para que tus invitados compartan sus fotos y recuerdos del evento.
      </p>
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: '#746B62' }}>
          Hashtag (opcional)
        </label>
        <input
          type="text"
          placeholder="Ej: #NuestroGranDía"
          value={data.hashtag}
          onChange={(e) => setData({ ...data, hashtag: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border"
          style={{ borderColor: '#E8DFD5', minHeight: '44px' }}
          disabled={loading}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: '#746B62' }}>
          Instagram (opcional)
        </label>
        <input
          type="text"
          placeholder="@usuario"
          value={data.instagramHandle}
          onChange={(e) => setData({ ...data, instagramHandle: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border"
          style={{ borderColor: '#E8DFD5', minHeight: '44px' }}
          disabled={loading}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: '#746B62' }}>
          TikTok (opcional)
        </label>
        <input
          type="text"
          placeholder="@usuario"
          value={data.tiktokHandle}
          onChange={(e) => setData({ ...data, tiktokHandle: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border"
          style={{ borderColor: '#E8DFD5', minHeight: '44px' }}
          disabled={loading}
        />
      </div>
    </div>
  );
}

function Step14WhatsApp({
  data,
  setData,
  loading,
}: {
  data: WizardState;
  setData: (data: WizardState) => void;
  loading: boolean;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold" style={{ color: '#1A1410' }}>
        Confirmaciones
      </h3>
      <p className="text-sm" style={{ color: '#746B62' }}>
        Agrega un número de WhatsApp para recibir dudas o confirmaciones de tus invitados.
      </p>
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: '#746B62' }}>
          Número de WhatsApp (opcional)
        </label>
        <input
          type="tel"
          placeholder="Ej: +56912345678"
          value={data.whatsappNumber}
          onChange={(e) => setData({ ...data, whatsappNumber: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border"
          style={{ borderColor: '#E8DFD5', minHeight: '44px' }}
          disabled={loading}
        />
      </div>
      <div className="p-4 rounded-lg" style={{ background: '#F9F7F3' }}>
        <p className="text-xs" style={{ color: '#746B62' }}>
          Los invitados podrán confirmar su asistencia directamente desde la invitación.
        </p>
      </div>
    </div>
  );
}

function Step15FinalMessage({
  data,
  setData,
  loading,
}: {
  data: WizardState;
  setData: (data: WizardState) => void;
  loading: boolean;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold" style={{ color: '#1A1410' }}>
        Mensaje final
      </h3>
      <p className="text-sm" style={{ color: '#746B62' }}>
        Este mensaje aparecerá al final de tu invitación. Puedes agradecer a tus invitados o dejar una frase especial.
      </p>
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: '#746B62' }}>
          Mensaje final (opcional)
        </label>
        <textarea
          placeholder="Gracias por acompañarnos en uno de los días más importantes de nuestra vida. Su presencia hará este momento aún más especial."
          value={data.finalMessage}
          onChange={(e) => setData({ ...data, finalMessage: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border"
          style={{ borderColor: '#E8DFD5', minHeight: '120px' }}
          disabled={loading}
        />
      </div>
    </div>
  );
}
