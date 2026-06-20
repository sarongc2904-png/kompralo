'use client';

import React, { useRef, useState } from 'react';
import { HERO_VIDEO_LIBRARY, getHeroVideoById } from '@/lib/video/heroVideoLibrary';
import type { InvitationContent } from '@/domain/invitations';
import { updateInvitationHeroVideo } from './actions';
import { notifyPreviewRefresh } from './previewRefresh';
import { Play, Square, Check, Video, Lock } from 'lucide-react';

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
  const savedId  = invitation.hero?.selectedVideoId;
  const initialId = savedId && savedId !== 'none' ? savedId : 'none';

  const [selectedId,     setSelectedId]     = useState<string>(initialId);
  const [previewVideoId, setPreviewVideoId] = useState<string | null>(null);
  const [saving,         setSaving]         = useState(false);
  const [result,         setResult]         = useState<{ success: boolean; message: string } | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // ── Stop preview ─────────────────────────────────────────────────────────
  const stopPreview = () => {
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
    setPreviewVideoId(null);
  };

  // ── Row click: select + save, never plays ─────────────────────────────
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
    } else {
      setResult({ success: false, message: res.error });
    }
    setTimeout(() => setResult(null), 3000);
  };

  // ── "Ver preview" button: the ONLY place that calls play() ───────────
  const handleTogglePreview = (videoId: string) => {
    const v = videoRef.current;
    if (!v) return;

    if (previewVideoId === videoId) {
      stopPreview();
      return;
    }

    const track = getHeroVideoById(videoId);
    if (!track || !track.url) return;

    v.pause();
    v.src         = track.url;
    v.currentTime = 0;

    v.play()
      .then(() => setPreviewVideoId(videoId))
      .catch((err) => console.warn('[HeroVideoSelector] preview error:', err));
  };

  const previewingTrack = previewVideoId ? getHeroVideoById(previewVideoId) : null;

  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.2em] mb-3 pb-2"
        style={{ color: '#C5A880', borderBottom: '1px solid #F0EBE4' }}>
        Video de portada sugerido
      </p>
      <p className="text-xs mb-4" style={{ color: '#9B8878' }}>
        Elige un video para el fondo del hero. Usa <strong>Ver preview</strong> para ver antes de seleccionar.
      </p>

      {/* Hidden video element for inline preview */}
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="none"
        onEnded={() => setPreviewVideoId(null)}
        style={{ display: 'none' }}
      />

      {/* Inline preview panel — shown while a video is playing */}
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

      <div className="flex flex-col gap-2">
        {HERO_VIDEO_LIBRARY.map((track) => {
          const isSelected   = selectedId    === track.id;
          const isPreviewing = previewVideoId === track.id;
          const isNoneTrack  = track.id      === 'none';

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
              {/* Radio indicator */}
              <div
                className="flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center"
                style={{
                  borderColor: isSelected ? '#C5A880' : '#D6CFC6',
                  background:  isSelected ? '#C5A880' : 'transparent',
                }}
              >
                {isSelected && <Check className="w-3 h-3" style={{ color: '#FFF' }} strokeWidth={2.5} />}
              </div>

              {/* Icon */}
              {!isNoneTrack ? (
                <Video className="flex-shrink-0 w-4 h-4" style={{ color: '#C5A880', opacity: 0.7 }} strokeWidth={1.5} />
              ) : (
                <div className="flex-shrink-0 w-4 h-4" />
              )}

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: '#1A1410' }}>{track.title}</p>
              </div>

              {/* Preview button — only on real videos */}
              {!isNoneTrack && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTogglePreview(track.id);
                  }}
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
    </div>
  );
}
