'use client';

import React, { useRef, useState } from 'react';
import type { InspectorProps } from '../../core/editor-types';
import { useSaveManager } from '../../core/SaveManager';
import {
  updateInlineEditableText,
  updateEventDateTime,
  updateInvitationMediaInfo,
  updateInvitationMusicTrack,
  updateInvitationHeroVideo,
} from '@/app/dashboard/invitations/[id]/edit/actions';
import { HERO_VIDEO_LIBRARY, getHeroVideoById } from '@/lib/video/heroVideoLibrary';
import { MUSIC_LIBRARY } from '@/lib/music/musicLibrary';
import { uploadInvitationAsset } from '@/lib/storage';

// ── Field definitions ─────────────────────────────────────────────────────────

const TEXT_FIELD_PATHS: Record<string, string> = {
  name1:           'protagonists.0.name',
  name2:           'protagonists.1.name',
  emotionalPhrase: 'hero.emotionalPhrase',
  venueName:       'location.venueName',
  eventLabel:      'hero.eventLabel',
  connectorText:   'hero.connectorText',
};

// ── Shared styles ─────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,252,245,0.8)',
  border: '1px solid rgba(200,167,93,0.3)',
  borderRadius: 8, padding: '9px 12px',
  fontSize: 13, color: '#1F1A16', fontFamily: 'inherit',
  lineHeight: 1.5, outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 150ms',
};

function btnStyle(active: boolean): React.CSSProperties {
  return {
    padding: '7px 0', borderRadius: 8, border: 'none',
    background: active ? '#1A1410' : 'rgba(200,167,93,0.15)',
    color:      active ? '#F5EDD8' : '#9B8878',
    fontSize: 11, fontWeight: 600,
    cursor: active ? 'pointer' : 'not-allowed',
    transition: 'all 150ms',
    width: '100%',
  };
}

// ── CollapsibleSection ────────────────────────────────────────────────────────

function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid rgba(200,167,93,0.15)', marginBottom: 4 }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 11,
          fontWeight: 600,
          color: '#9B8878',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {title}
        <span style={{ fontSize: 16, lineHeight: 1 }}>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div style={{ paddingBottom: 12, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ── TextField ─────────────────────────────────────────────────────────────────

function TextField({
  label, value, placeholder, type = 'text', dirty, saved, saving,
  onChange, onSave,
}: {
  label: string; value: string; placeholder: string;
  type?: 'text' | 'date' | 'time'; dirty: boolean; saved: boolean; saving: boolean;
  onChange: (v: string) => void; onSave: () => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ fontSize: 11, color: '#9B8878', fontWeight: 500 }}>{label}</label>
        {saved && !saving && <span style={{ fontSize: 10, color: '#C5A880' }}>✓ Guardado</span>}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(200,167,93,0.7)'; }}
        onBlur={(e)  => { e.currentTarget.style.borderColor = 'rgba(200,167,93,0.3)'; }}
      />
      <button type="button" onClick={onSave} disabled={saving || !dirty} style={btnStyle(dirty && !saving)}>
        {saving ? 'Guardando…' : 'Guardar'}
      </button>
    </div>
  );
}

// ── HeroImageUploader ─────────────────────────────────────────────────────────

function HeroImageUploader({
  invitationId,
  slug,
  currentImageUrl,
  currentVideoUrl,
  currentYoutubeUrl,
  currentMusicUrl,
  currentMusicTitle,
  currentGoogleMapsLink,
  currentWazeLink,
  onSaved,
}: {
  invitationId: string;
  slug: string;
  currentImageUrl: string;
  currentVideoUrl: string;
  currentYoutubeUrl: string;
  currentMusicUrl: string;
  currentMusicTitle: string;
  currentGoogleMapsLink: string;
  currentWazeLink: string;
  onSaved: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading,  setUploading]  = useState(false);
  const [uploadErr,  setUploadErr]  = useState<string | null>(null);
  const [savedOk,    setSavedOk]    = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadErr(null);
    setSavedOk(false);

    try {
      const { url } = await uploadInvitationAsset(file, 'hero', invitationId);
      await updateInvitationMediaInfo({
        id:           invitationId,
        slug,
        heroImageUrl:  url,
        heroVideoUrl:  currentVideoUrl,
        youtubeUrl:    currentYoutubeUrl,
        musicUrl:      currentMusicUrl,
        musicTitle:    currentMusicTitle,
        googleMapsUrl: currentGoogleMapsLink,
        wazeUrl:       currentWazeLink,
      });
      setPreviewUrl(url);
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 3000);
      onSaved();
    } catch (err) {
      setUploadErr(err instanceof Error ? err.message : 'Error al subir la imagen.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ fontSize: 11, color: '#9B8878', fontWeight: 500 }}>Foto de fondo</label>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Thumbnail + upload button row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {previewUrl && (
          <div style={{ flexShrink: 0, width: 60, height: 60, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(200,167,93,0.3)', background: '#EEE' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Foto de fondo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        <button
          type="button"
          disabled={uploading}
          onClick={() => { setUploadErr(null); fileInputRef.current?.click(); }}
          style={{
            flex: 1, padding: '9px 12px', borderRadius: 8,
            border: `1px solid ${savedOk ? '#A5D6A7' : 'rgba(200,167,93,0.4)'}`,
            background: savedOk ? '#E8F5E9' : '#FAFAF8',
            color:      savedOk ? '#2E7D32' : '#1A1410',
            fontSize: 13, fontWeight: 500, cursor: uploading ? 'default' : 'pointer',
            opacity: uploading ? 0.7 : 1, transition: 'all 150ms',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          {uploading ? (
            <>
              <span style={{
                display: 'inline-block', width: 14, height: 14, borderRadius: '50%',
                border: '2px solid currentColor', borderTopColor: 'transparent',
                animation: 'spin 0.7s linear infinite',
              }} />
              Subiendo…
            </>
          ) : savedOk ? (
            '✓ Foto guardada'
          ) : previewUrl ? (
            '📷 Cambiar foto'
          ) : (
            '📷 Subir foto'
          )}
        </button>
      </div>

      {uploadErr && (
        <p style={{ fontSize: 11, color: '#C62828', margin: 0 }}>{uploadErr}</p>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── MiniVideoSelector ─────────────────────────────────────────────────────────

function MiniVideoSelector({
  invitationId,
  slug,
  initialVideoId,
  planId,
  onSaved,
}: {
  invitationId: string;
  slug: string;
  initialVideoId: string;
  planId: string;
  onSaved: () => void;
}) {
  const [selectedId,     setSelectedId]     = useState(initialVideoId || 'none');
  const [previewVideoId, setPreviewVideoId] = useState<string | null>(null);
  const [expanded,       setExpanded]       = useState(false);
  const [saving,         setSaving]         = useState(false);
  const [savedMsg,       setSavedMsg]       = useState<string | null>(null);
  const [errMsg,         setErrMsg]         = useState<string | null>(null);

  if (planId === 'basic') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 8, background: '#FAFAF8', border: '1px solid #E8E2DA' }}>
        <span style={{ fontSize: 16, opacity: 0.5 }}>🔒</span>
        <p style={{ fontSize: 12, color: '#9B8878', margin: 0 }}>Video de portada disponible en Plan Premium.</p>
      </div>
    );
  }

  const selectedTrack = getHeroVideoById(selectedId);
  const hasVideo      = selectedId !== 'none';

  async function handleSelect(videoId: string) {
    if (videoId === selectedId || saving) return;
    setPreviewVideoId(null);
    setSelectedId(videoId);
    setSaving(true);
    setSavedMsg(null);
    setErrMsg(null);

    const track  = getHeroVideoById(videoId);
    const isNone = track.id === 'none' || !track.url;

    const res = await updateInvitationHeroVideo({
      id:         invitationId,
      slug,
      videoId:    isNone ? 'none' : track.id,
      videoUrl:   track.url,
      videoTitle: isNone ? '' : track.title,
    });

    setSaving(false);
    if (res.success) {
      setSavedMsg(res.message);
      if (isNone) setExpanded(false);
      onSaved();
    } else {
      setErrMsg(res.error ?? 'Error al guardar');
    }
    setTimeout(() => { setSavedMsg(null); setErrMsg(null); }, 3000);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ fontSize: 11, color: '#9B8878', fontWeight: 500 }}>Video de portada</label>

      {savedMsg && (
        <div style={{ padding: '6px 10px', borderRadius: 6, fontSize: 11, background: '#E8F5E9', color: '#388E3C', border: '1px solid #C8E6C9' }}>
          {savedMsg}
        </div>
      )}
      {errMsg && (
        <div style={{ padding: '6px 10px', borderRadius: 6, fontSize: 11, background: '#FFEBEE', color: '#C62828', border: '1px solid #FFCDD2' }}>
          {errMsg}
        </div>
      )}

      {/* Collapsed view */}
      {!expanded && (
        <div>
          <button
            type="button"
            onClick={() => setExpanded(true)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 8, textAlign: 'left', cursor: 'pointer',
              background: '#FAFAF8', border: '1px solid #E8E2DA',
            }}
          >
            <span style={{ fontSize: 16, flexShrink: 0, opacity: hasVideo ? 1 : 0.4 }}>🎬</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 500, margin: 0, color: '#1A1410', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {hasVideo ? selectedTrack.title : 'Sin video'}
              </p>
            </div>
            <span style={{ fontSize: 11, color: '#C5A880', flexShrink: 0 }}>
              {hasVideo ? 'Cambiar ▾' : 'Elegir ▾'}
            </span>
          </button>

          {hasVideo && selectedTrack.url && (
            <div style={{ marginTop: 6, borderRadius: 8, overflow: 'hidden', aspectRatio: '16/9', background: '#0D0A07' }}>
              <video
                key={selectedTrack.url}
                src={selectedTrack.url}
                autoPlay
                muted
                loop
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}
        </div>
      )}

      {/* Expanded list */}
      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {previewVideoId && (() => {
            const pt = getHeroVideoById(previewVideoId);
            return pt?.url ? (
              <div style={{ borderRadius: 8, overflow: 'hidden', aspectRatio: '16/9', background: '#0D0A07', position: 'relative' }}>
                <video src={pt.url} autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  type="button"
                  onClick={() => setPreviewVideoId(null)}
                  style={{ position: 'absolute', top: 6, right: 6, padding: '3px 8px', borderRadius: 4, fontSize: 10, background: 'rgba(0,0,0,0.6)', color: '#FFF', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}
                >
                  ✕ Detener
                </button>
                <p style={{ position: 'absolute', bottom: 6, left: 10, fontSize: 10, color: 'rgba(255,255,255,0.8)', margin: 0 }}>{pt.title}</p>
              </div>
            ) : null;
          })()}

          {HERO_VIDEO_LIBRARY.map((track) => {
            const isSelected   = selectedId    === track.id;
            const isPreviewing = previewVideoId === track.id;
            const isNone       = track.id       === 'none';

            return (
              <div
                key={track.id}
                onClick={() => !saving && handleSelect(track.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 8, cursor: saving ? 'default' : 'pointer',
                  background: isSelected ? '#FBF6EF' : '#FAFAF8',
                  border: `1px solid ${isSelected ? '#C5A880' : '#E8E2DA'}`,
                  opacity: saving ? 0.7 : 1,
                  userSelect: 'none',
                }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                  border: `2px solid ${isSelected ? '#C5A880' : '#D6CFC6'}`,
                  background: isSelected ? '#C5A880' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {isSelected && <span style={{ fontSize: 10, color: '#FFF', fontWeight: 700 }}>✓</span>}
                </div>

                <span style={{ fontSize: 14, opacity: isNone ? 0.4 : 0.8, flexShrink: 0 }}>🎬</span>

                <p style={{ flex: 1, fontSize: 13, fontWeight: 500, margin: 0, color: '#1A1410', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {track.title}
                </p>

                {!isNone && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewVideoId(isPreviewing ? null : track.id);
                    }}
                    style={{
                      flexShrink: 0, padding: '3px 8px', borderRadius: 4,
                      fontSize: 10, cursor: 'pointer', fontWeight: 500,
                      background: isPreviewing ? '#1A1410' : 'transparent',
                      color:      isPreviewing ? '#F5F3F0' : '#9B8878',
                      border:     `1px solid ${isPreviewing ? '#1A1410' : '#E8E2DA'}`,
                    }}
                  >
                    {isPreviewing ? '✕ Detener' : '▶ Preview'}
                  </button>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => { setPreviewVideoId(null); setExpanded(false); }}
            style={{ fontSize: 11, color: '#9B8878', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '2px 0' }}
          >
            ▲ Colapsar
          </button>
        </div>
      )}
    </div>
  );
}

// ── MiniMusicSelector ─────────────────────────────────────────────────────────

function MiniMusicSelector({
  invitationId,
  slug,
  currentMusicUrl,
  onSaved,
}: {
  invitationId: string;
  slug: string;
  currentMusicUrl: string;
  onSaved: () => void;
}) {
  const initialTrack = MUSIC_LIBRARY.find((t) => t.url === currentMusicUrl) ?? MUSIC_LIBRARY[0];

  const [selectedId, setSelectedId] = useState(initialTrack.id);
  const [playingId,  setPlayingId]  = useState<string | null>(null);
  const [expanded,   setExpanded]   = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [savedMsg,   setSavedMsg]   = useState<string | null>(null);
  const [errMsg,     setErrMsg]     = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const selectedTrack = MUSIC_LIBRARY.find((t) => t.id === selectedId) ?? MUSIC_LIBRARY[0];
  const hasMusic      = selectedId !== 'none';

  function togglePlay(trackId: string, url: string | null) {
    if (!url) return;
    if (playingId === trackId) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = url;
      audioRef.current.play().catch(() => {});
    }
    setPlayingId(trackId);
  }

  async function handleSelect(trackId: string) {
    if (trackId === selectedId || saving) return;
    if (audioRef.current) { audioRef.current.pause(); }
    setPlayingId(null);
    setSelectedId(trackId);
    setSaving(true);
    setSavedMsg(null);
    setErrMsg(null);

    const track  = MUSIC_LIBRARY.find((t) => t.id === trackId) ?? MUSIC_LIBRARY[0];
    const isNone = track.id === 'none' || !track.url;

    const res = await updateInvitationMusicTrack({
      id:       invitationId,
      slug,
      trackId:  isNone ? 'none' : track.id,
      audioUrl: track.url,
      title:    isNone ? '' : track.title,
    });

    setSaving(false);
    if (res.success) {
      setSavedMsg(res.message ?? '✓ Guardado');
      if (isNone) setExpanded(false);
      onSaved();
    } else {
      setErrMsg(res.error ?? 'Error al guardar');
    }
    setTimeout(() => { setSavedMsg(null); setErrMsg(null); }, 3000);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Hidden audio element for preview */}
      <audio
        ref={audioRef}
        onEnded={() => setPlayingId(null)}
        style={{ display: 'none' }}
      />

      <label style={{ fontSize: 11, color: '#9B8878', fontWeight: 500 }}>Música de fondo</label>

      {savedMsg && (
        <div style={{ padding: '6px 10px', borderRadius: 6, fontSize: 11, background: '#E8F5E9', color: '#388E3C', border: '1px solid #C8E6C9' }}>
          {savedMsg}
        </div>
      )}
      {errMsg && (
        <div style={{ padding: '6px 10px', borderRadius: 6, fontSize: 11, background: '#FFEBEE', color: '#C62828', border: '1px solid #FFCDD2' }}>
          {errMsg}
        </div>
      )}

      {/* Collapsed view */}
      {!expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 8, textAlign: 'left', cursor: 'pointer',
            background: '#FAFAF8', border: '1px solid #E8E2DA',
          }}
        >
          <span style={{ fontSize: 16, flexShrink: 0, opacity: hasMusic ? 1 : 0.4 }}>🎵</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 500, margin: 0, color: '#1A1410', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {hasMusic ? selectedTrack.title : 'Sin música'}
            </p>
            {hasMusic && (
              <p style={{ fontSize: 11, margin: 0, color: '#9B8878' }}>{selectedTrack.mood}</p>
            )}
          </div>
          <span style={{ fontSize: 11, color: '#C5A880', flexShrink: 0 }}>
            {hasMusic ? 'Cambiar ▾' : 'Elegir ▾'}
          </span>
        </button>
      )}

      {/* Expanded list */}
      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {MUSIC_LIBRARY.map((track) => {
            const isSelected  = selectedId === track.id;
            const isPlaying   = playingId  === track.id;
            const isNone      = track.id   === 'none';

            return (
              <div
                key={track.id}
                onClick={() => !saving && handleSelect(track.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 8, cursor: saving ? 'default' : 'pointer',
                  background: isSelected ? '#FBF6EF' : '#FAFAF8',
                  border: `1px solid ${isSelected ? '#C5A880' : '#E8E2DA'}`,
                  opacity: saving ? 0.7 : 1,
                  userSelect: 'none',
                }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                  border: `2px solid ${isSelected ? '#C5A880' : '#D6CFC6'}`,
                  background: isSelected ? '#C5A880' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {isSelected && <span style={{ fontSize: 10, color: '#FFF', fontWeight: 700 }}>✓</span>}
                </div>

                <span style={{ fontSize: 14, opacity: isNone ? 0.4 : 0.8, flexShrink: 0 }}>🎵</span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, margin: 0, color: '#1A1410', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {track.title}
                  </p>
                  {!isNone && (
                    <p style={{ fontSize: 11, margin: 0, color: '#9B8878' }}>{track.mood}</p>
                  )}
                </div>

                {!isNone && track.url && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlay(track.id, track.url);
                    }}
                    style={{
                      flexShrink: 0, padding: '3px 8px', borderRadius: 4,
                      fontSize: 10, cursor: 'pointer', fontWeight: 500,
                      background: isPlaying ? '#1A1410' : 'transparent',
                      color:      isPlaying ? '#F5F3F0' : '#9B8878',
                      border:     `1px solid ${isPlaying ? '#1A1410' : '#E8E2DA'}`,
                    }}
                  >
                    {isPlaying ? '■ Detener' : '▶ Escuchar'}
                  </button>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => {
              audioRef.current?.pause();
              setPlayingId(null);
              setExpanded(false);
            }}
            style={{ fontSize: 11, color: '#9B8878', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '2px 0' }}
          >
            ▲ Colapsar
          </button>
        </div>
      )}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function HeroInspector({
  element,
  invitationId,
  isMobileSheet,
  onSaved,
}: InspectorProps) {
  const [drafts, setDrafts] = useState<Record<string, string>>(() => ({
    name1:           element.meta?.name1           ?? '',
    name2:           element.meta?.name2           ?? '',
    emotionalPhrase: element.meta?.emotionalPhrase ?? '',
    venueName:       element.meta?.venueName       ?? '',
    date:            element.meta?.date            ?? '',
    time:            element.meta?.time            ?? '',
    eventLabel:      element.meta?.eventLabel      ?? '',
    connectorText:   element.meta?.connectorText   ?? '',
  }));

  const { saving, savedKey, error, save } = useSaveManager();
  const { saving: mSaving, savedKey: mSavedKey, error: mError, save: mSave } = useSaveManager();

  // ── Text helpers ─────────────────────────────────────────────────────────────

  function setDraft(key: string, value: string) {
    setDrafts((prev) => ({ ...prev, [key]: value }));
  }

  function isDirty(key: string) {
    return drafts[key] !== (element.meta?.[key] ?? '');
  }

  function isSavedKey(key: string) {
    return savedKey === key || ((key === 'date' || key === 'time') ? savedKey === 'datetime' : false);
  }

  async function handleSave(key: string) {
    const value = drafts[key] ?? '';
    if (key === 'date' || key === 'time') {
      await save('datetime', () => updateEventDateTime({
        id:        invitationId,
        eventDate: key === 'date' ? value : drafts['date'] ?? element.meta?.date ?? '',
        eventTime: key === 'time' ? value : drafts['time'] ?? element.meta?.time ?? '',
      }), () => onSaved());
      return;
    }
    const fieldPath = TEXT_FIELD_PATHS[key];
    if (!fieldPath) return;
    await save(key, () => updateInlineEditableText({ id: invitationId, fieldPath, value }),
      () => onSaved(fieldPath, value));
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', padding: '0 16px 16px' }}>
      {!isMobileSheet && (
        <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#C5A880', fontWeight: 600, padding: '14px 0 10px', margin: 0 }}>
          Portada
        </p>
      )}

      {error && !saving && <p style={{ fontSize: 11, color: '#c0392b', margin: '0 0 8px' }}>{error}</p>}
      {mError && !mSaving && <p style={{ fontSize: 11, color: '#c0392b', margin: '0 0 8px' }}>{mError}</p>}

      {/* ── 1. Nombres y texto ─────────────────────────────────────── */}
      <CollapsibleSection title="Nombres y texto" defaultOpen>
        <TextField label="Nombre 1"        value={drafts.name1}           placeholder="María"               dirty={isDirty('name1')}           saved={isSavedKey('name1')}           saving={saving} onChange={(v) => setDraft('name1', v)}           onSave={() => handleSave('name1')} />
        <TextField label="Nombre 2"        value={drafts.name2}           placeholder="José"                dirty={isDirty('name2')}           saved={isSavedKey('name2')}           saving={saving} onChange={(v) => setDraft('name2', v)}           onSave={() => handleSave('name2')} />
        <TextField label="Eyebrow (ej. NUESTRA BODA)" value={drafts.eventLabel}    placeholder="NUESTRA BODA"        dirty={isDirty('eventLabel')}    saved={isSavedKey('eventLabel')}    saving={saving} onChange={(v) => setDraft('eventLabel', v)}    onSave={() => handleSave('eventLabel')} />
        <TextField label="Conector (ej. &)"           value={drafts.connectorText} placeholder="&"                   dirty={isDirty('connectorText')} saved={isSavedKey('connectorText')} saving={saving} onChange={(v) => setDraft('connectorText', v)} onSave={() => handleSave('connectorText')} />
        <TextField label="Frase de portada"           value={drafts.emotionalPhrase} placeholder="Juntos para siempre" dirty={isDirty('emotionalPhrase')} saved={isSavedKey('emotionalPhrase')} saving={saving} onChange={(v) => setDraft('emotionalPhrase', v)} onSave={() => handleSave('emotionalPhrase')} />
      </CollapsibleSection>

      {/* ── 2. Fecha y lugar ───────────────────────────────────────── */}
      <CollapsibleSection title="Fecha y lugar" defaultOpen>
        <TextField label="Venue / Lugar"    value={drafts.venueName} placeholder="Jardín Las Palmas" dirty={isDirty('venueName')} saved={isSavedKey('venueName')} saving={saving} onChange={(v) => setDraft('venueName', v)} onSave={() => handleSave('venueName')} />
        <TextField label="Fecha del evento" value={drafts.date}      placeholder=""                  type="date" dirty={isDirty('date')} saved={isSavedKey('date')} saving={saving} onChange={(v) => setDraft('date', v)} onSave={() => handleSave('date')} />
        <TextField label="Hora del evento"  value={drafts.time}      placeholder=""                  type="time" dirty={isDirty('time')} saved={isSavedKey('time')} saving={saving} onChange={(v) => setDraft('time', v)} onSave={() => handleSave('time')} />
      </CollapsibleSection>

      {/* ── 3. Fondo ───────────────────────────────────────────────── */}
      <CollapsibleSection title="Fondo" defaultOpen={false}>
        {/* Foto */}
        <HeroImageUploader
          invitationId={invitationId}
          slug={element.meta?.slug ?? ''}
          currentImageUrl={element.meta?.imageUrl ?? ''}
          currentVideoUrl={element.meta?.videoUrl ?? ''}
          currentYoutubeUrl={element.meta?.youtubeUrl ?? ''}
          currentMusicUrl={element.meta?.musicUrl ?? ''}
          currentMusicTitle={element.meta?.musicTitle ?? ''}
          currentGoogleMapsLink={element.meta?.googleMapsLink ?? ''}
          currentWazeLink={element.meta?.wazeLink ?? ''}
          onSaved={onSaved}
        />

        {/* Video selector */}
        <MiniVideoSelector
          invitationId={invitationId}
          slug={element.meta?.slug ?? ''}
          initialVideoId={element.meta?.selectedVideoId ?? ''}
          planId={element.meta?.planId ?? ''}
          onSaved={onSaved}
        />
      </CollapsibleSection>

      {/* ── 4. Música ──────────────────────────────────────────────── */}
      <CollapsibleSection title="Música" defaultOpen={false}>
        <MiniMusicSelector
          invitationId={invitationId}
          slug={element.meta?.slug ?? ''}
          currentMusicUrl={element.meta?.musicUrl ?? ''}
          onSaved={onSaved}
        />
      </CollapsibleSection>
    </div>
  );
}
