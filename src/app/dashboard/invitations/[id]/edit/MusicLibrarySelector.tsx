'use client';

import React, { useRef, useState } from 'react';
import { MUSIC_TRACKS, getMusicTrackUrl, findTrackById } from '@/lib/music/musicLibrary';
import type { InvitationContent } from '@/domain/invitations';
import { updateInvitationMusicTrack } from './actions';
import { notifyPreviewRefresh } from './previewRefresh';
import { Play, Pause, Check, Music } from 'lucide-react';

interface MusicLibrarySelectorProps {
  invitation: InvitationContent;
}

export function MusicLibrarySelector({ invitation }: MusicLibrarySelectorProps) {
  const currentTrackId = invitation.music?.selectedTrackId ?? '';
  const [selectedId, setSelectedId] = useState<string>(currentTrackId === 'none' ? '' : currentTrackId);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopPreview = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPreviewingId(null);
  };

  const togglePreview = (trackId: string) => {
    if (previewingId === trackId) {
      stopPreview();
      return;
    }
    stopPreview();
    const track = findTrackById(trackId);
    if (!track) return;
    const url = getMusicTrackUrl(track);
    const audio = new Audio(url);
    audio.volume = 0.5;
    audio.play().catch(() => {});
    audio.addEventListener('ended', () => setPreviewingId(null));
    audioRef.current = audio;
    setPreviewingId(trackId);
  };

  const handleSelect = async (trackId: string) => {
    stopPreview();
    setSelectedId(trackId);
    setSaving(true);
    setResult(null);

    const track = trackId ? findTrackById(trackId) : null;
    const res = await updateInvitationMusicTrack({
      id:       invitation.id,
      slug:     invitation.slug,
      trackId:  trackId,
      audioUrl: track ? getMusicTrackUrl(track) : '',
      title:    track?.title ?? '',
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

  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.2em] mb-3 pb-2"
        style={{ color: '#C5A880', borderBottom: '1px solid #F0EBE4' }}>
        Música
      </p>
      <p className="text-xs mb-4" style={{ color: '#9B8878' }}>
        Elige una pista de la librería. El audio se activa en la invitación cuando el invitado lo elige.
      </p>

      {/* Feedback */}
      {result && (
        <div className="mb-4 px-3 py-2 rounded-lg text-xs"
          style={{
            background: result.success ? '#E8F5E9' : '#FFEBEE',
            color:      result.success ? '#388E3C'  : '#C62828',
            border:     `1px solid ${result.success ? '#C8E6C9' : '#FFCDD2'}`,
          }}>
          {result.message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-2">
        {/* Sin música option */}
        <TrackCard
          trackId=""
          title="Sin música"
          description="No se mostrará el reproductor de música"
          isSelected={selectedId === ''}
          isPreviewing={false}
          saving={saving}
          onSelect={handleSelect}
          onPreview={null}
        />

        {/* Library tracks */}
        {MUSIC_TRACKS.map((track) => (
          <TrackCard
            key={track.id}
            trackId={track.id}
            title={track.title}
            description={track.description}
            isSelected={selectedId === track.id}
            isPreviewing={previewingId === track.id}
            saving={saving}
            onSelect={handleSelect}
            onPreview={togglePreview}
          />
        ))}
      </div>
    </div>
  );
}

function TrackCard({
  trackId,
  title,
  description,
  isSelected,
  isPreviewing,
  saving,
  onSelect,
  onPreview,
}: {
  trackId: string;
  title: string;
  description: string;
  isSelected: boolean;
  isPreviewing: boolean;
  saving: boolean;
  onSelect: (id: string) => void;
  onPreview: ((id: string) => void) | null;
}) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-3 rounded-lg transition-all cursor-pointer select-none"
      style={{
        background: isSelected ? '#FBF6EF' : '#FAFAF8',
        border: `1px solid ${isSelected ? '#C5A880' : '#E8E2DA'}`,
      }}
      onClick={() => !saving && onSelect(trackId)}
    >
      {/* Selected indicator */}
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
      {trackId ? (
        <Music className="flex-shrink-0 w-4 h-4" style={{ color: '#C5A880', opacity: 0.7 }} strokeWidth={1.5} />
      ) : (
        <div className="flex-shrink-0 w-4 h-4" />
      )}

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: '#1A1410' }}>{title}</p>
        <p className="text-[11px] truncate" style={{ color: '#9B8878' }}>{description}</p>
      </div>

      {/* Preview button */}
      {onPreview && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onPreview(trackId); }}
          className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
          style={{
            background: isPreviewing ? '#1A1410' : 'transparent',
            color:      isPreviewing ? '#F5F3F0' : '#9B8878',
            border:     `1px solid ${isPreviewing ? '#1A1410' : '#E8E2DA'}`,
          }}
          title={isPreviewing ? 'Detener' : 'Probar'}
        >
          {isPreviewing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          {isPreviewing ? 'Detener' : 'Probar'}
        </button>
      )}
    </div>
  );
}
