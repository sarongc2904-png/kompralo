'use client';

import React, { useState } from 'react';
import { HERO_VIDEO_LIBRARY, getHeroVideoById } from '@/lib/video/heroVideoLibrary';
import type { InvitationContent } from '@/domain/invitations';
import { updateInvitationHeroVideo } from './actions';
import { notifyPreviewRefresh } from './previewRefresh';
import { Play, Square, Check, Video, Lock, ChevronDown, ChevronUp } from 'lucide-react';

interface HeroVideoSelectorProps {
  invitation: InvitationContent;
}

// ─── Plan gate ────────────────────────────────────────────────────────────────

export function HeroVideoSelector({ invitation }: HeroVideoSelectorProps) {
  if (invitation.planId === 'basic') {
    return (
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] mb-3 pb-2"
          style={{ color: '#C5A880', borderBottom: '1px solid #F0EBE4' }}>
          Video de portada sugerido
        </p>
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg"
          style={{ background: '#FAFAF8', border: '1px solid #E8E2DA' }}>
          <Lock className="w-4 h-4 flex-shrink-0" style={{ color: '#C5A880', opacity: 0.6 }} />
          <p className="text-xs" style={{ color: '#9B8878' }}>
            El video de portada está disponible en los planes Gold y Deluxe.
          </p>
        </div>
      </div>
    );
  }

  return <HeroVideoSelectorInner invitation={invitation} />;
}

// ─── Inner selector (Gold / Platinum) ────────────────────────────────────────

function HeroVideoSelectorInner({ invitation }: HeroVideoSelectorProps) {
  const savedId   = invitation.hero?.selectedVideoId;
  const initialId = savedId && savedId !== 'none' ? savedId : 'none';

  const [selectedId,     setSelectedId]     = useState<string>(initialId);
  const [previewVideoId, setPreviewVideoId] = useState<string | null>(null);
  const [saving,         setSaving]         = useState(false);
  const [result,         setResult]         = useState<{ success: boolean; message: string } | null>(null);
  // Expanded: show full video list. Collapsed when none selected or after save.
  const [expanded,       setExpanded]       = useState(initialId !== 'none');

  const stopPreview = () => {
    setPreviewVideoId(null);
  };

  const handleSelect = async (videoId: string) => {
    if (videoId === selectedId || saving) return;
    stopPreview();
    setSelectedId(videoId);
    setSaving(true);
    setResult(null);

    const track  = getHeroVideoById(videoId);
    const isNone = track.id === 'none' || !track.url;

    const res = await updateInvitationHeroVideo({
      id:         invitation.id,
      slug:       invitation.slug,
      videoId:    isNone ? 'none' : track.id,
      videoUrl:   track.url,
      videoTitle: isNone ? '' : track.title,
    });

    setSaving(false);
    if (res.success) {
      notifyPreviewRefresh();
      setResult({ success: true, message: res.message });
      // Collapse after selecting "Sin video"
      if (isNone) setExpanded(false);
    } else {
      setResult({ success: false, message: res.error });
    }
    setTimeout(() => setResult(null), 3000);
  };

  const handleTogglePreview = (videoId: string) => {
    if (previewVideoId === videoId) { stopPreview(); return; }
    const track = getHeroVideoById(videoId);
    if (!track || !track.url) return;
    setPreviewVideoId(videoId);
  };

  const selectedTrack    = getHeroVideoById(selectedId);
  const hasVideo         = selectedId !== 'none';
  const previewingTrack  = previewVideoId ? getHeroVideoById(previewVideoId) : null;

  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.2em] mb-3 pb-2"
        style={{ color: '#C5A880', borderBottom: '1px solid #F0EBE4' }}>
        Video de portada sugerido
      </p>

      {/* Feedback */}
      {result && (
        <div className="mb-3 px-3 py-2 rounded-lg text-xs"
          style={{
            background: result.success ? '#E8F5E9' : '#FFEBEE',
            color:      result.success ? '#388E3C'  : '#C62828',
            border:     `1px solid ${result.success ? '#C8E6C9' : '#FFCDD2'}`,
          }}>
          {result.message}
        </div>
      )}

      {/* ── Collapsed view ─────────────────────────────────────────────────── */}
      {!expanded && (
        <div>
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all"
            style={{ background: '#FAFAF8', border: '1px solid #E8E2DA' }}
          >
            {hasVideo
              ? <Video className="flex-shrink-0 w-4 h-4" style={{ color: '#C5A880' }} strokeWidth={1.5} />
              : <div className="flex-shrink-0 w-4 h-4" />
            }
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: '#1A1410' }}>
                {hasVideo ? selectedTrack.title : 'Sin video'}
              </p>
              {hasVideo && (
                <p className="text-[11px]" style={{ color: '#9B8878' }}>
                  Reemplaza la imagen principal en el hero
                </p>
              )}
            </div>
            <span className="text-[11px] flex items-center gap-1" style={{ color: '#C5A880' }}>
              {hasVideo ? 'Cambiar' : 'Elegir video'}
              <ChevronDown className="w-3.5 h-3.5" />
            </span>
          </button>

          {/* Small inline preview when collapsed and video selected */}
          {hasVideo && selectedTrack.url && (
            <div className="mt-2 rounded-xl overflow-hidden relative"
              style={{ aspectRatio: '16/9', background: '#0D0A07' }}>
              <video
                key={selectedTrack.url}
                src={selectedTrack.url}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
              <p className="absolute bottom-2 left-3 text-[10px]" style={{ color: 'rgba(255,255,255,0.8)' }}>
                {selectedTrack.title}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Expanded video list ────────────────────────────────────────────── */}
      {expanded && (
        <div>
          <p className="text-xs mb-4" style={{ color: '#9B8878' }}>
            Elige un video para el fondo del hero. Usa <strong>Ver preview</strong> para ver antes de seleccionar.
          </p>

          {/* Inline preview panel */}
          {previewVideoId && previewingTrack?.url && (
            <div className="mb-4 rounded-xl overflow-hidden relative"
              style={{ aspectRatio: '16/9', background: '#0D0A07' }}>
              <video
                src={previewingTrack.url}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={stopPreview}
                className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded text-[10px] uppercase tracking-wider cursor-pointer"
                style={{ background: 'rgba(0,0,0,0.6)', color: '#FFF', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                <Square className="w-3 h-3" /> Detener
              </button>
              <p className="absolute bottom-2 left-3 text-[10px]" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {previewingTrack.title}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {HERO_VIDEO_LIBRARY.map((track) => {
              const isSelected   = selectedId    === track.id;
              const isPreviewing = previewVideoId === track.id;
              const isNoneTrack  = track.id       === 'none';

              return (
                <div
                  key={track.id}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg transition-all cursor-pointer select-none"
                  style={{
                    background: isSelected ? '#FBF6EF' : '#FAFAF8',
                    border:     `1px solid ${isSelected ? '#C5A880' : '#E8E2DA'}`,
                    opacity:    saving ? 0.7 : 1,
                  }}
                  onClick={() => !saving && handleSelect(track.id)}
                >
                  <div
                    className="flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center"
                    style={{
                      borderColor: isSelected ? '#C5A880' : '#D6CFC6',
                      background:  isSelected ? '#C5A880' : 'transparent',
                    }}
                  >
                    {isSelected && <Check className="w-3 h-3" style={{ color: '#FFF' }} strokeWidth={2.5} />}
                  </div>

                  {!isNoneTrack
                    ? <Video className="flex-shrink-0 w-4 h-4" style={{ color: '#C5A880', opacity: 0.7 }} strokeWidth={1.5} />
                    : <div className="flex-shrink-0 w-4 h-4" />
                  }

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: '#1A1410' }}>{track.title}</p>
                  </div>

                  {!isNoneTrack && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleTogglePreview(track.id); }}
                      className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                      style={{
                        background: isPreviewing ? '#1A1410' : 'transparent',
                        color:      isPreviewing ? '#F5F3F0' : '#9B8878',
                        border:     `1px solid ${isPreviewing ? '#1A1410' : '#E8E2DA'}`,
                      }}
                    >
                      {isPreviewing
                        ? <><Square className="w-3 h-3" /> Detener</>
                        : <><Play   className="w-3 h-3" /> Ver preview</>
                      }
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => { stopPreview(); setExpanded(false); }}
            className="mt-3 flex items-center gap-1 text-[11px] cursor-pointer"
            style={{ color: '#9B8878' }}
          >
            <ChevronUp className="w-3.5 h-3.5" /> Colapsar
          </button>
        </div>
      )}
    </div>
  );
}
