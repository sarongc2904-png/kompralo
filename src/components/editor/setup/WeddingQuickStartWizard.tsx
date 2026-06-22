'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { startWeddingQuickStart } from '@/app/dashboard/invitations/[id]/edit/actions';
import { WEDDING_STYLES, type WeddingStyle } from '@/domain/themes-v2/style-to-theme-map';

export interface WeddingQuickStartWizardProps {
  invitationId: string;
  onClose: () => void;
}

const STYLE_LABELS: Record<WeddingStyle, string> = {
  elegante: '✨ Elegante',
  minimalista: '□ Minimalista',
  jardín: '🌿 Jardín',
  playa: '🏖️ Playa',
  clásico: '♔ Clásico',
  moderno: '◆ Moderno',
};

/**
 * Wizard de 3 pasos para crear una invitación wedding rápidamente.
 * Pasos:
 * 1. Nombres (novia/novio)
 * 2. Fecha y hora
 * 3. Estilo visual
 *
 * Al terminar, llama startWeddingQuickStart() y refresca el editor.
 */
export function WeddingQuickStartWizard({
  invitationId,
  onClose,
}: WeddingQuickStartWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Nombres
  const [brideName, setBrideName] = useState('');
  const [groomName, setGroomName] = useState('');

  // Step 2: Fecha y hora
  const [weddingDate, setWeddingDate] = useState('');
  const [weddingTime, setWeddingTime] = useState('');

  // Step 3: Estilo
  const [selectedStyle, setSelectedStyle] = useState<WeddingStyle | null>(null);

  // Validación Step 1
  const canAdvanceStep1 = brideName.trim().length > 0 && groomName.trim().length > 0;

  // Validación Step 2
  const canAdvanceStep2 = weddingDate.trim().length > 0;

  // Validación Step 3
  const canAdvanceStep3 = selectedStyle !== null;

  const handleNext = () => {
    setError(null);
    if (step === 1 && !canAdvanceStep1) {
      setError('Por favor, completa los nombres de ambos novios.');
      return;
    }
    if (step === 2 && !canAdvanceStep2) {
      setError('Por favor, ingresa la fecha de la boda.');
      return;
    }
    if (step === 3 && !canAdvanceStep3) {
      setError('Por favor, selecciona un estilo.');
      return;
    }

    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    setError(null);
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    if (!canAdvanceStep3 || !selectedStyle) {
      setError('Por favor, completa todos los campos.');
      setLoading(false);
      return;
    }

    try {
      const result = await startWeddingQuickStart({
        invitationId,
        brideName: brideName.trim(),
        groomName: groomName.trim(),
        weddingDate,
        weddingTime: weddingTime.trim() || undefined,
        selectedStyle,
      });

      if (result.success) {
        // Cerrar wizard
        onClose();
        // Esperar 500ms para que el usuario vea un cierre suave
        await new Promise((resolve) => setTimeout(resolve, 500));
        // Refrescar la página para ver el contenido generado
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-lg overflow-hidden"
        style={{ background: '#FFFFFF' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: '#E8DFD5' }}>
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
          <div
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: '#B99752' }}
          >
            Paso {step} de 3
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Nombres */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: '#1A1410' }}
                >
                  ¿Cómo se llaman?
                </label>
              </div>

              <div>
                <label
                  htmlFor="bride-name"
                  className="block text-xs font-semibold mb-1"
                  style={{ color: '#746B62' }}
                >
                  Novia
                </label>
                <input
                  id="bride-name"
                  type="text"
                  placeholder="Ej: María"
                  value={brideName}
                  onChange={(e) => setBrideName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border transition-colors text-base"
                  style={{
                    borderColor: '#E8DFD5',
                    color: '#1A1410',
                    minHeight: '44px',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#B99752')}
                  onBlur={(e) => (e.target.style.borderColor = '#E8DFD5')}
                  disabled={loading}
                />
              </div>

              <div>
                <label
                  htmlFor="groom-name"
                  className="block text-xs font-semibold mb-1"
                  style={{ color: '#746B62' }}
                >
                  Novio
                </label>
                <input
                  id="groom-name"
                  type="text"
                  placeholder="Ej: Juan"
                  value={groomName}
                  onChange={(e) => setGroomName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border transition-colors text-base"
                  style={{
                    borderColor: '#E8DFD5',
                    color: '#1A1410',
                    minHeight: '44px',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#B99752')}
                  onBlur={(e) => (e.target.style.borderColor = '#E8DFD5')}
                  disabled={loading}
                />
              </div>

              {brideName.trim() || groomName.trim() ? (
                <div className="mt-4 p-3 rounded-lg" style={{ background: '#F9F7F3' }}>
                  <p className="text-sm font-semibold text-center" style={{ color: '#1A1410' }}>
                    {brideName.trim()} & {groomName.trim()}
                  </p>
                </div>
              ) : null}
            </div>
          )}

          {/* Step 2: Fecha y hora */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: '#1A1410' }}
                >
                  ¿Cuándo se casan?
                </label>
              </div>

              <div>
                <label
                  htmlFor="wedding-date"
                  className="block text-xs font-semibold mb-1"
                  style={{ color: '#746B62' }}
                >
                  Fecha
                </label>
                <input
                  id="wedding-date"
                  type="date"
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border transition-colors text-base"
                  style={{
                    borderColor: '#E8DFD5',
                    color: '#1A1410',
                    minHeight: '44px',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#B99752')}
                  onBlur={(e) => (e.target.style.borderColor = '#E8DFD5')}
                  disabled={loading}
                />
              </div>

              <div>
                <label
                  htmlFor="wedding-time"
                  className="block text-xs font-semibold mb-1"
                  style={{ color: '#746B62' }}
                >
                  Hora (opcional)
                </label>
                <input
                  id="wedding-time"
                  type="time"
                  value={weddingTime}
                  onChange={(e) => setWeddingTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border transition-colors text-base"
                  style={{
                    borderColor: '#E8DFD5',
                    color: '#1A1410',
                    minHeight: '44px',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#B99752')}
                  onBlur={(e) => (e.target.style.borderColor = '#E8DFD5')}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Step 3: Estilo */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label
                  className="block text-sm font-semibold mb-4"
                  style={{ color: '#1A1410' }}
                >
                  ¿Qué estilo les gusta?
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {WEDDING_STYLES.map((style) => (
                  <button
                    key={style}
                    onClick={() => setSelectedStyle(style)}
                    className={`px-3 py-3 rounded-lg border-2 font-medium text-sm transition-all ${
                      selectedStyle === style ? 'border-b-2' : ''
                    }`}
                    style={{
                      background:
                        selectedStyle === style
                          ? '#FAF7F2'
                          : '#FFFFFF',
                      borderColor:
                        selectedStyle === style
                          ? '#B99752'
                          : '#E8DFD5',
                      color: selectedStyle === style ? '#B99752' : '#746B62',
                      minHeight: '44px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    disabled={loading}
                  >
                    {STYLE_LABELS[style]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error message */}
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
        <div className="p-4 border-t flex gap-3" style={{ borderColor: '#E8DFD5' }}>
          {step > 1 ? (
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

          <button
            onClick={handleNext}
            className="flex-1 px-4 py-3 rounded-lg font-semibold text-sm transition-colors"
            style={{
              background: loading ? '#D4C4B0' : '#B99752',
              color: '#FFFFFF',
              minHeight: '44px',
            }}
            disabled={
              loading ||
              (step === 1 && !canAdvanceStep1) ||
              (step === 2 && !canAdvanceStep2) ||
              (step === 3 && !canAdvanceStep3)
            }
            onMouseEnter={(e) =>
              !loading && (e.currentTarget.style.background = '#A8845E')
            }
            onMouseLeave={(e) =>
              !loading && (e.currentTarget.style.background = '#B99752')
            }
          >
            {loading
              ? 'Creando...'
              : step === 3
              ? 'Crear invitación'
              : 'Continuar'}
          </button>
        </div>
      </div>
    </div>
  );
}
