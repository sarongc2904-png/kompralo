'use client';

import { useState } from 'react';
import type { InvitationContent } from '@/domain/invitations/types';
import type { PlanId } from '@/domain/plans/types';
import { evaluateWeddingCompletion } from '@/lib/invitations/completion-score';

interface Props {
  invitation: InvitationContent;
  plan: PlanId;
  previewUrl: string;
}

type PublishState = 'idle' | 'loading' | 'done' | 'error';

const MISSING_LABELS: Record<string, string> = {
  'protagonists (names of bride & groom)': 'Nombres de novios',
  'event_time (wedding time)':             'Hora del evento',
  'hero.emotionalPhrase':                  'Frase emocional principal',
  'final_message (quote or message)':      'Mensaje final',
  'location (venue name or address)':      'Ubicación del evento',
  'gallery.images':                        'Fotos de galería',
  'itinerary':                             'Itinerario del día',
  'dress_code':                            'Código de vestimenta',
  'timeline':                              'Línea de tiempo',
  'gift_registry.items':                   'Mesa de regalos',
  'parents':                               'Datos de padres',
  'padrinos':                              'Padrinos',
  'hotels':                                'Hospedaje',
  'social.hashtag':                        'Hashtag de redes',
};

export function WizardReviewStep({ invitation, plan, previewUrl }: Props) {
  const [publishState, setPublishState] = useState<PublishState>('idle');
  const [publishError, setPublishError] = useState<string | null>(null);

  const isWedding = invitation.category === 'wedding' || !invitation.category;
  const score = isWedding ? evaluateWeddingCompletion(invitation, plan) : null;

  const isAlreadyPublished = invitation.status === 'published';

  async function handlePublish() {
    setPublishState('loading');
    setPublishError(null);
    try {
      const res = await fetch(`/api/invitations/${invitation.id}/publish`, {
        method: 'POST',
      });
      const body = await res.json() as { success?: boolean; error?: string };
      if (!res.ok || !body.success) {
        throw new Error(body.error ?? 'Error desconocido al publicar.');
      }
      setPublishState('done');
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : 'Error al publicar.');
      setPublishState('error');
    }
  }

  return (
    <div>
      {/* Completion card */}
      {score && (
        <div
          className="rounded-xl p-5 mb-6"
          style={{ background: '#FFFFFF', border: '1px solid #E8E2DA' }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold" style={{ color: '#1A1410' }}>
              Progreso de tu invitación
            </h3>
            <span
              className="text-2xl font-bold"
              style={{ color: score.percentage >= 80 ? '#388E3C' : score.percentage >= 50 ? '#B99752' : '#C62828' }}
            >
              {score.percentage}%
            </span>
          </div>

          <div className="rounded-full h-2 overflow-hidden mb-4" style={{ background: '#F0EBE3' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${score.percentage}%`,
                background: score.percentage >= 80 ? '#388E3C' : score.percentage >= 50 ? '#C5A880' : '#C62828',
              }}
            />
          </div>

          {score.missing.length > 0 && (
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: '#9B8878' }}>
                Secciones pendientes ({score.missing.length}):
              </p>
              <ul className="space-y-1">
                {score.missing.map((key) => (
                  <li key={key} className="flex items-center gap-2 text-xs" style={{ color: '#6B5B4E' }}>
                    <span style={{ color: '#C62828' }}>○</span>
                    {MISSING_LABELS[key] ?? key}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {score.missing.length === 0 && (
            <p className="text-xs font-medium" style={{ color: '#388E3C' }}>
              ✓ Tu invitación está completa y lista para publicar
            </p>
          )}
        </div>
      )}

      {/* Preview link */}
      <div
        className="rounded-xl p-5 mb-6"
        style={{ background: '#F5F3F0', border: '1px solid #E8E2DA' }}
      >
        <p className="text-sm font-semibold mb-1" style={{ color: '#1A1410' }}>
          Previsualiza antes de publicar
        </p>
        <p className="text-xs mb-3" style={{ color: '#9B8878' }}>
          Revisa cómo se verá tu invitación tal como la verán tus invitados.
        </p>
        <a
          href={previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
          style={{ background: '#1A1410', color: '#F5F3F0', textDecoration: 'none' }}
        >
          ✨ Ver previsualización
        </a>
      </div>

      {/* Publish section */}
      <div
        className="rounded-xl p-5"
        style={{ background: '#FFFFFF', border: '1px solid #E8E2DA' }}
      >
        {isAlreadyPublished || publishState === 'done' ? (
          <div>
            <p className="text-sm font-semibold mb-1" style={{ color: '#388E3C' }}>
              ✓ Invitación publicada
            </p>
            <p className="text-xs mb-3" style={{ color: '#9B8878' }}>
              Tu invitación ya está visible para tus invitados.
            </p>
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ background: '#388E3C', color: '#FFFFFF', textDecoration: 'none' }}
            >
              Ver invitación pública ↗
            </a>
          </div>
        ) : (
          <div>
            <p className="text-sm font-semibold mb-1" style={{ color: '#1A1410' }}>
              Publicar invitación
            </p>
            <p className="text-xs mb-3" style={{ color: '#9B8878' }}>
              Al publicar, tu invitación quedará visible para todos con el enlace.
              Podrás seguir editando después de publicar.
            </p>

            {publishError && (
              <p className="text-xs mb-3 p-2 rounded-lg" style={{ color: '#C62828', background: '#FFF3F3', border: '1px solid #FFCDD2' }}>
                {publishError}
              </p>
            )}

            <button
              type="button"
              onClick={handlePublish}
              disabled={publishState === 'loading'}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-opacity"
              style={{
                background: publishState === 'loading' ? '#9B8878' : '#C5A880',
                color: '#0D0A07',
                opacity: publishState === 'loading' ? 0.7 : 1,
              }}
            >
              {publishState === 'loading' ? 'Publicando…' : '🚀 Publicar invitación'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
