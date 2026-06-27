'use client';

import React, { useState } from 'react';
import type { InspectorProps } from '../../core/editor-types';
import { useSaveManager } from '../../core/SaveManager';
import {
  updateInlineEditableText,
  updateEventDateTime,
  updateInvitationMediaInfo,
  updateInvitationMusicTrack,
} from '@/app/dashboard/invitations/[id]/edit/actions';

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

  const [media, setMedia] = useState({
    imageUrl:   element.meta?.imageUrl   ?? '',
    videoUrl:   element.meta?.videoUrl   ?? '',
    youtubeUrl: element.meta?.youtubeUrl ?? '',
    musicUrl:   element.meta?.musicUrl   ?? '',
  });

  const [videoMode, setVideoMode] = useState<'youtube' | 'direct'>(
    element.meta?.youtubeUrl ? 'youtube' : 'direct',
  );

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

  // ── Media helpers ─────────────────────────────────────────────────────────────

  function setMediaField(key: keyof typeof media, value: string) {
    setMedia((prev) => ({ ...prev, [key]: value }));
  }

  function isMediaDirty(key: keyof typeof media) {
    return media[key] !== (element.meta?.[key] ?? '');
  }

  async function handleMediaSave(key: 'imageUrl' | 'videoUrl' | 'youtubeUrl' | 'musicUrl') {
    if (key === 'musicUrl') {
      const url = media.musicUrl.trim();
      await mSave('musicUrl', () => updateInvitationMusicTrack({
        id: invitationId, slug: element.meta?.slug ?? '',
        trackId: url ? 'custom' : 'none', audioUrl: url || null, title: 'Audio personalizado',
      }), () => onSaved());
      return;
    }
    await mSave(key, () => updateInvitationMediaInfo({
      id:           invitationId,
      slug:         element.meta?.slug          ?? '',
      heroImageUrl:  key === 'imageUrl'   ? media.imageUrl.trim()   : (element.meta?.imageUrl   ?? ''),
      heroVideoUrl:  key === 'videoUrl'   ? media.videoUrl.trim()   : (element.meta?.videoUrl   ?? ''),
      youtubeUrl:    key === 'youtubeUrl' ? media.youtubeUrl.trim() : (element.meta?.youtubeUrl ?? ''),
      musicUrl:      element.meta?.musicUrl      ?? '',
      musicTitle:    element.meta?.musicTitle    ?? '',
      googleMapsUrl: element.meta?.googleMapsLink ?? '',
      wazeUrl:       element.meta?.wazeLink      ?? '',
    }), () => onSaved());
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

      {/* ── 1. Nombres y texto ─────────────────────────────────────────── */}
      <CollapsibleSection title="Nombres y texto" defaultOpen>
        <TextField label="Nombre 1"        value={drafts.name1}           placeholder="María"               dirty={isDirty('name1')}           saved={isSavedKey('name1')}           saving={saving} onChange={(v) => setDraft('name1', v)}           onSave={() => handleSave('name1')} />
        <TextField label="Nombre 2"        value={drafts.name2}           placeholder="José"                dirty={isDirty('name2')}           saved={isSavedKey('name2')}           saving={saving} onChange={(v) => setDraft('name2', v)}           onSave={() => handleSave('name2')} />
        <TextField label="Eyebrow (ej. NUESTRA BODA)" value={drafts.eventLabel}    placeholder="NUESTRA BODA"        dirty={isDirty('eventLabel')}    saved={isSavedKey('eventLabel')}    saving={saving} onChange={(v) => setDraft('eventLabel', v)}    onSave={() => handleSave('eventLabel')} />
        <TextField label="Conector (ej. &)"           value={drafts.connectorText} placeholder="&"                   dirty={isDirty('connectorText')} saved={isSavedKey('connectorText')} saving={saving} onChange={(v) => setDraft('connectorText', v)} onSave={() => handleSave('connectorText')} />
        <TextField label="Frase de portada"           value={drafts.emotionalPhrase} placeholder="Juntos para siempre" dirty={isDirty('emotionalPhrase')} saved={isSavedKey('emotionalPhrase')} saving={saving} onChange={(v) => setDraft('emotionalPhrase', v)} onSave={() => handleSave('emotionalPhrase')} />
      </CollapsibleSection>

      {/* ── 2. Fecha y lugar ───────────────────────────────────────────── */}
      <CollapsibleSection title="Fecha y lugar" defaultOpen>
        <TextField label="Venue / Lugar"    value={drafts.venueName} placeholder="Jardín Las Palmas" dirty={isDirty('venueName')} saved={isSavedKey('venueName')} saving={saving} onChange={(v) => setDraft('venueName', v)} onSave={() => handleSave('venueName')} />
        <TextField label="Fecha del evento" value={drafts.date}      placeholder=""                  type="date" dirty={isDirty('date')} saved={isSavedKey('date')} saving={saving} onChange={(v) => setDraft('date', v)} onSave={() => handleSave('date')} />
        <TextField label="Hora del evento"  value={drafts.time}      placeholder=""                  type="time" dirty={isDirty('time')} saved={isSavedKey('time')} saving={saving} onChange={(v) => setDraft('time', v)} onSave={() => handleSave('time')} />
      </CollapsibleSection>

      {/* ── 3. Fondo ───────────────────────────────────────────────────── */}
      <CollapsibleSection title="Fondo" defaultOpen={false}>
        {/* Foto */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: 11, color: '#9B8878', fontWeight: 500 }}>URL de foto de fondo</label>
            {mSavedKey === 'imageUrl' && !mSaving && <span style={{ fontSize: 10, color: '#C5A880' }}>✓ Guardado</span>}
          </div>
          <input type="url" value={media.imageUrl} onChange={(e) => setMediaField('imageUrl', e.target.value)} placeholder="https://..." style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(200,167,93,0.7)'; }}
            onBlur={(e)  => { e.currentTarget.style.borderColor = 'rgba(200,167,93,0.3)'; }} />
          <button type="button" onClick={() => handleMediaSave('imageUrl')} disabled={mSaving || !isMediaDirty('imageUrl')} style={btnStyle(isMediaDirty('imageUrl') && !mSaving)}>
            {mSaving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>

        {/* Video toggle */}
        <div style={{ display: 'flex', gap: 4, background: 'rgba(200,167,93,0.08)', borderRadius: 8, padding: 3 }}>
          {(['youtube', 'direct'] as const).map((mode) => (
            <button key={mode} type="button" onClick={() => setVideoMode(mode)} style={{
              flex: 1, padding: '5px 8px', borderRadius: 6, border: 'none',
              fontSize: 11, fontWeight: 500, cursor: 'pointer',
              background: videoMode === mode ? '#1A1410' : 'transparent',
              color:      videoMode === mode ? '#F5EDD8' : '#9B8878',
              transition: 'all 120ms',
            }}>
              {mode === 'youtube' ? 'YouTube' : 'Video directo'}
            </button>
          ))}
        </div>

        {videoMode === 'youtube' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: 11, color: '#9B8878', fontWeight: 500 }}>URL de YouTube</label>
              {mSavedKey === 'youtubeUrl' && !mSaving && <span style={{ fontSize: 10, color: '#C5A880' }}>✓ Guardado</span>}
            </div>
            <input type="url" value={media.youtubeUrl} onChange={(e) => setMediaField('youtubeUrl', e.target.value)} placeholder="https://youtube.com/..." style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(200,167,93,0.7)'; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = 'rgba(200,167,93,0.3)'; }} />
            <button type="button" onClick={() => handleMediaSave('youtubeUrl')} disabled={mSaving || !isMediaDirty('youtubeUrl')} style={btnStyle(isMediaDirty('youtubeUrl') && !mSaving)}>
              {mSaving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: 11, color: '#9B8878', fontWeight: 500 }}>URL de video directo (MP4)</label>
              {mSavedKey === 'videoUrl' && !mSaving && <span style={{ fontSize: 10, color: '#C5A880' }}>✓ Guardado</span>}
            </div>
            <input type="url" value={media.videoUrl} onChange={(e) => setMediaField('videoUrl', e.target.value)} placeholder="https://..." style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(200,167,93,0.7)'; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = 'rgba(200,167,93,0.3)'; }} />
            <button type="button" onClick={() => handleMediaSave('videoUrl')} disabled={mSaving || !isMediaDirty('videoUrl')} style={btnStyle(isMediaDirty('videoUrl') && !mSaving)}>
              {mSaving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        )}
      </CollapsibleSection>

      {/* ── 4. Música ──────────────────────────────────────────────────── */}
      <CollapsibleSection title="Música" defaultOpen={false}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: 11, color: '#9B8878', fontWeight: 500 }}>URL de música (MP3/audio)</label>
            {mSavedKey === 'musicUrl' && !mSaving && <span style={{ fontSize: 10, color: '#C5A880' }}>✓ Guardado</span>}
          </div>
          <input type="url" value={media.musicUrl} onChange={(e) => setMediaField('musicUrl', e.target.value)} placeholder="https://..." style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(200,167,93,0.7)'; }}
            onBlur={(e)  => { e.currentTarget.style.borderColor = 'rgba(200,167,93,0.3)'; }} />
          <button type="button" onClick={() => handleMediaSave('musicUrl')} disabled={mSaving || !isMediaDirty('musicUrl')} style={btnStyle(isMediaDirty('musicUrl') && !mSaving)}>
            {mSaving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </CollapsibleSection>
    </div>
  );
}
