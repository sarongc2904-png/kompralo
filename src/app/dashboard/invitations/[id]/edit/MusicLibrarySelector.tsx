'use client';

import React, { useRef, useState } from 'react';
import { MUSIC_LIBRARY, getMusicTrackById } from '@/lib/music/musicLibrary';
import type { InvitationContent } from '@/domain/invitations';
import { updateInvitationMusicTrack } from './actions';
import { notifyPreviewRefresh } from './previewRefresh';
import { Play, Pause, Check, Music, Lock, ChevronDown, ChevronUp } from 'lucide-react';

interface MusicLibrarySelectorProps {
  invitation: InvitationContent;
}

// ─── Plan gate ────────────────────────────────────────────────────────────────

export function MusicLibrarySelector({ invitation }: MusicLibrarySelectorProps) {
  if (invitation.planId === 'basic') {
    return (
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] mb-3 pb-2"
          style={{ color: '#C5A880', borderBottom: '1px solid #F0EBE4' }}>
          Música de fondo
        </p>
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg"
          style={{ background: '#FAFAF8', border: '1px solid #E8E2DA' }}>
          <Lock className="w-4 h-4 flex-shrink-0" style={{ color: '#C5A880', opacity: 0.6 }} />
          <p className="text-xs" style={{ color: '#9B8878' }}>
            La música de fondo está disponible en los planes Gold y Deluxe.
          </p>
        </div>
      </div>
    );
  }

  return <MusicSelectorInner invitation={invitation} />;
}

// ─── Inner selector (Gold / Platinum) ────────────────────────────────────────

function MusicSelectorInner({ invitation }: MusicLibrarySelectorProps) {
  const savedTrackId = invitation.music?.selectedTrackId;
  const initialId    = savedTrackId && savedTrackId !== 'none' ? savedTrackId : 'none';

  const [selectedId,     setSelectedId]     = useState<string>(initialId);
  const [previewTrackId, setPreviewTrackId] = useState<string | null>(null);
  const [saving,         setSaving]         = useState(false);
  const [result,         setResult]         = useState<{ success: boolean; message: string } | null>(null);
  // Expanded: show full track list. Collapsed when none selected or after save.
  const [expanded,       setExpanded]       = useState(initialId !== 'none');

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopPreview = () => {
    const audio = audioRef.current;
    if (audio) { audio.pause(); audio.currentTime = 0; }
    setPreviewTrackId(null);
  };

  const handleSelect = async (trackId: string) => {
    if (trackId === selectedId || saving) return;
    stopPreview();
    setSelectedId(trackId);
    setSaving(true);
    setResult(null);

    const track  = getMusicTrackById(trackId);
    const isNone = track.id === 'none' || !track.url;

    const res = await updateInvitationMusicTrack({
      id:       invitation.id,
      slug:     invitation.slug,
      trackId:  isNone ? 'none' : track.id,
      audioUrl: track.url,
      title:    isNone ? '' : track.title,
    });

    setSaving(false);
    if (res.success) {
      notifyPreviewRefresh();
      setResult({ success: true, message: res.message });
      // Collapse after selecting "Sin música"
      if (isNone) setExpanded(false);
    } else {
      setResult({ success: false, message: res.error });
    }
    setTimeout(() => setResult(null), 3000);
  };

  const handleTogglePreview = (trackId: string) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (previewTrackId === trackId) { stopPreview(); return; }
    const track = getMusicTrackById(trackId);
    if (!track || !track.url) return;
    audio.pause();
    audio.src         = track.url;
    audio.currentTime = 0;
    audio.volume      = 0.5;
    audio.play()
      .then(() => setPreviewTrackId(trackId))
      .catch((err) => console.warn('[MusicSelector] preview error:', err));
  };

  const selectedTrack = getMusicTrackById(selectedId);
  const hasTrack      = selectedId !== 'none';

  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.2em] mb-3 pb-2"
        style={{ color: '#C5A880', borderBottom: '1px solid #F0EBE4' }}>
        Música de fondo
      </p>

      {/* Single hidden audio element */}
      <audio ref={audioRef} preload="none" onEnded={() => setPreviewTrackId(null)} style={{ display: 'none' }} />

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
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all"
          style={{ background: '#FAFAF8', border: '1px solid #E8E2DA' }}
        >
          {hasTrack
            ? <Music className="flex-shrink-0 w-4 h-4" style={{ color: '#C5A880' }} strokeWidth={1.5} />
            : <div className="flex-shrink-0 w-4 h-4" />
          }
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: '#1A1410' }}>
              {hasTrack ? selectedTrack.title : 'Sin música'}
            </p>
            {hasTrack && (
              <p className="text-[11px]" style={{ color: '#9B8878' }}>{selectedTrack.mood}</p>
            )}
          </div>
          <span className="text-[11px] flex items-center gap-1" style={{ color: '#C5A880' }}>
            {hasTrack ? 'Cambiar' : 'Elegir pista'}
            <ChevronDown className="w-3.5 h-3.5" />
          </span>
        </button>
      )}

      {/* ── Expanded track list ────────────────────────────────────────────── */}
      {expanded && (
        <div>
          <p className="text-xs mb-3" style={{ color: '#9B8878' }}>
            Elige una pista. Usa <strong>Probar</strong> para escucharla — seleccionar no reproduce.
          </p>
          <div className="flex flex-col gap-2">
            {MUSIC_LIBRARY.map((track) => {
              const isSelected   = selectedId    === track.id;
              const isPreviewing = previewTrackId === track.id;
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
                    ? <Music className="flex-shrink-0 w-4 h-4" style={{ color: '#C5A880', opacity: 0.7 }} strokeWidth={1.5} />
                    : <div className="flex-shrink-0 w-4 h-4" />
                  }

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: '#1A1410' }}>{track.title}</p>
                    {!isNoneTrack && (
                      <p className="text-[11px] truncate" style={{ color: '#9B8878' }}>{track.mood}</p>
                    )}
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
                        ? <><Pause className="w-3 h-3" /> Detener</>
                        : <><Play  className="w-3 h-3" /> Probar</>
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
