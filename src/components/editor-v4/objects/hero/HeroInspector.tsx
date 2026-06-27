'use client';

import { useState } from 'react';
import type { InspectorProps } from '../../core/editor-types';
import { useSaveManager } from '../../core/SaveManager';
import {
  updateInlineEditableText,
  updateEventDateTime,
  updateInvitationMediaInfo,
  updateInvitationMusicTrack,
} from '@/app/dashboard/invitations/[id]/edit/actions';

// ── Text fields (existing — do not reorder) ───────────────────────────────────

interface HeroField {
  key: string;
  label: string;
  placeholder: string;
  type?: 'text' | 'date' | 'time';
}

const HERO_FIELDS: HeroField[] = [
  { key: 'name1',           label: 'Nombre 1',          placeholder: 'María',               type: 'text' },
  { key: 'name2',           label: 'Nombre 2',          placeholder: 'José',                type: 'text' },
  { key: 'emotionalPhrase', label: 'Frase de portada',  placeholder: 'Juntos para siempre', type: 'text' },
  { key: 'venueName',       label: 'Venue / Lugar',     placeholder: 'Jardín Las Palmas',   type: 'text' },
  { key: 'date',            label: 'Fecha del evento',  placeholder: '',                    type: 'date' },
  { key: 'time',            label: 'Hora del evento',   placeholder: '',                    type: 'time' },
];

const EXTRA_TEXT_FIELDS: HeroField[] = [
  { key: 'eventLabel',    label: 'Eyebrow (ej. NUESTRA BODA)', placeholder: 'NUESTRA BODA', type: 'text' },
  { key: 'connectorText', label: 'Conector (ej. &)',           placeholder: '&',            type: 'text' },
];

const TEXT_FIELD_PATHS: Record<string, string> = {
  name1:           'protagonists.0.name',
  name2:           'protagonists.1.name',
  emotionalPhrase: 'hero.emotionalPhrase',
  venueName:       'location.venueName',
  eventLabel:      'hero.eventLabel',
  connectorText:   'hero.connectorText',
};

// ── Shared style helpers ──────────────────────────────────────────────────────

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
  };
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{ borderTop: '1px solid rgba(200,167,93,0.15)', paddingTop: 12 }}>
      <p style={{
        fontSize: 11, fontWeight: 600, color: '#9B8878',
        textTransform: 'uppercase', letterSpacing: '0.05em',
        marginBottom: 8,
      }}>
        {label}
      </p>
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
  // Text drafts — includes both HERO_FIELDS and EXTRA_TEXT_FIELDS keys
  const [drafts, setDrafts] = useState<Record<string, string>>(() => {
    const all = [...HERO_FIELDS, ...EXTRA_TEXT_FIELDS];
    return Object.fromEntries(all.map((f) => [f.key, element.meta?.[f.key] ?? '']));
  });

  // Media drafts
  const [media, setMedia] = useState({
    imageUrl:   element.meta?.imageUrl   ?? '',
    videoUrl:   element.meta?.videoUrl   ?? '',
    youtubeUrl: element.meta?.youtubeUrl ?? '',
    musicUrl:   element.meta?.musicUrl   ?? '',
  });

  const [videoMode, setVideoMode] = useState<'youtube' | 'direct'>(
    element.meta?.youtubeUrl ? 'youtube' : 'direct',
  );

  // Text save state
  const { saving, savedKey, error, save } = useSaveManager();
  // Media save state (independent from text)
  const { saving: mSaving, savedKey: mSavedKey, error: mError, save: mSave } = useSaveManager();

  // ── Text helpers ────────────────────────────────────────────────────────────

  function setDraft(key: string, value: string) {
    setDrafts((prev) => ({ ...prev, [key]: value }));
  }

  function isDirty(key: string) {
    return drafts[key] !== (element.meta?.[key] ?? '');
  }

  async function handleSave(key: string) {
    const value = drafts[key] ?? '';

    if (key === 'date' || key === 'time') {
      await save(
        'datetime',
        () => updateEventDateTime({
          id:        invitationId,
          eventDate: key === 'date' ? value : drafts['date'] ?? element.meta?.date ?? '',
          eventTime: key === 'time' ? value : drafts['time'] ?? element.meta?.time ?? '',
        }),
        () => onSaved(),
      );
      return;
    }

    const fieldPath = TEXT_FIELD_PATHS[key];
    if (!fieldPath) return;
    await save(
      key,
      () => updateInlineEditableText({ id: invitationId, fieldPath, value }),
      () => onSaved(fieldPath, value),
    );
  }

  // ── Media helpers ───────────────────────────────────────────────────────────

  function setMediaField(key: keyof typeof media, value: string) {
    setMedia((prev) => ({ ...prev, [key]: value }));
  }

  function isMediaDirty(key: keyof typeof media) {
    return media[key] !== (element.meta?.[key] ?? '');
  }

  async function handleMediaSave(key: 'imageUrl' | 'videoUrl' | 'youtubeUrl' | 'musicUrl') {
    if (key === 'musicUrl') {
      const url = media.musicUrl.trim();
      await mSave(
        'musicUrl',
        () => updateInvitationMusicTrack({
          id:       invitationId,
          slug:     element.meta?.slug ?? '',
          trackId:  url ? 'custom' : 'none',
          audioUrl: url || null,
          title:    'Audio personalizado',
        }),
        () => onSaved(),
      );
      return;
    }

    // Image or video — must pass ALL current media to avoid clearing unrelated fields
    await mSave(
      key,
      () => updateInvitationMediaInfo({
        id:           invitationId,
        slug:         element.meta?.slug          ?? '',
        heroImageUrl:  key === 'imageUrl'   ? media.imageUrl.trim()   : (element.meta?.imageUrl   ?? ''),
        heroVideoUrl:  key === 'videoUrl'   ? media.videoUrl.trim()   : (element.meta?.videoUrl   ?? ''),
        youtubeUrl:    key === 'youtubeUrl' ? media.youtubeUrl.trim() : (element.meta?.youtubeUrl ?? ''),
        musicUrl:      element.meta?.musicUrl      ?? '',
        musicTitle:    element.meta?.musicTitle    ?? '',
        googleMapsUrl: element.meta?.googleMapsLink ?? '',
        wazeUrl:       element.meta?.wazeLink      ?? '',
      }),
      () => onSaved(),
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {!isMobileSheet && (
        <>
          <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#C5A880', fontWeight: 600 }}>
            Portada
          </p>
          <div style={{ height: 1, background: 'rgba(200,167,93,0.15)' }} />
        </>
      )}

      {error && !saving && (
        <p style={{ fontSize: 11, color: '#c0392b', margin: 0 }}>{error}</p>
      )}

      {/* ── Existing text fields (name1, name2, emotionalPhrase, venueName, date, time) ── */}
      {HERO_FIELDS.map((field) => {
        const dirty = isDirty(field.key);
        const isSaved = savedKey === field.key ||
          ((field.key === 'date' || field.key === 'time') ? savedKey === 'datetime' : false);
        return (
          <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: 11, color: '#9B8878', fontWeight: 500 }}>{field.label}</label>
              {isSaved && !saving && <span style={{ fontSize: 10, color: '#C5A880' }}>✓ Guardado</span>}
            </div>
            <input
              type={field.type ?? 'text'}
              value={drafts[field.key] ?? ''}
              onChange={(e) => setDraft(field.key, e.target.value)}
              placeholder={field.placeholder}
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(200,167,93,0.7)'; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = 'rgba(200,167,93,0.3)'; }}
            />
            <button
              type="button"
              onClick={() => handleSave(field.key)}
              disabled={saving || !dirty}
              style={btnStyle(dirty && !saving)}
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        );
      })}

      {/* ── SECCIÓN 1: Textos adicionales ─────────────────────────────────────── */}
      <SectionHeader label="Textos adicionales" />

      {EXTRA_TEXT_FIELDS.map((field) => {
        const dirty = isDirty(field.key);
        const isSaved = savedKey === field.key;
        return (
          <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: 11, color: '#9B8878', fontWeight: 500 }}>{field.label}</label>
              {isSaved && !saving && <span style={{ fontSize: 10, color: '#C5A880' }}>✓ Guardado</span>}
            </div>
            <input
              type="text"
              value={drafts[field.key] ?? ''}
              onChange={(e) => setDraft(field.key, e.target.value)}
              placeholder={field.placeholder}
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(200,167,93,0.7)'; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = 'rgba(200,167,93,0.3)'; }}
            />
            <button
              type="button"
              onClick={() => handleSave(field.key)}
              disabled={saving || !dirty}
              style={btnStyle(dirty && !saving)}
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        );
      })}

      {mError && !mSaving && (
        <p style={{ fontSize: 11, color: '#c0392b', margin: 0 }}>{mError}</p>
      )}

      {/* ── SECCIÓN 2: Foto de fondo ──────────────────────────────────────────── */}
      <SectionHeader label="Foto de fondo" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: 11, color: '#9B8878', fontWeight: 500 }}>URL de foto de fondo</label>
          {mSavedKey === 'imageUrl' && !mSaving && <span style={{ fontSize: 10, color: '#C5A880' }}>✓ Guardado</span>}
        </div>
        <input
          type="url"
          value={media.imageUrl}
          onChange={(e) => setMediaField('imageUrl', e.target.value)}
          placeholder="https://..."
          style={inputStyle}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(200,167,93,0.7)'; }}
          onBlur={(e)  => { e.currentTarget.style.borderColor = 'rgba(200,167,93,0.3)'; }}
        />
        <button
          type="button"
          onClick={() => handleMediaSave('imageUrl')}
          disabled={mSaving || !isMediaDirty('imageUrl')}
          style={btnStyle(isMediaDirty('imageUrl') && !mSaving)}
        >
          {mSaving ? 'Guardando…' : 'Guardar'}
        </button>
      </div>

      {/* ── SECCIÓN 3: Video de fondo ─────────────────────────────────────────── */}
      <SectionHeader label="Video de fondo" />

      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 4, background: 'rgba(200,167,93,0.08)', borderRadius: 8, padding: 3 }}>
        {(['youtube', 'direct'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setVideoMode(mode)}
            style={{
              flex: 1, padding: '5px 8px', borderRadius: 6, border: 'none',
              fontSize: 11, fontWeight: 500, cursor: 'pointer',
              background: videoMode === mode ? '#1A1410' : 'transparent',
              color:      videoMode === mode ? '#F5EDD8' : '#9B8878',
              transition: 'all 120ms',
            }}
          >
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
          <input
            type="url"
            value={media.youtubeUrl}
            onChange={(e) => setMediaField('youtubeUrl', e.target.value)}
            placeholder="https://youtube.com/..."
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(200,167,93,0.7)'; }}
            onBlur={(e)  => { e.currentTarget.style.borderColor = 'rgba(200,167,93,0.3)'; }}
          />
          <button
            type="button"
            onClick={() => handleMediaSave('youtubeUrl')}
            disabled={mSaving || !isMediaDirty('youtubeUrl')}
            style={btnStyle(isMediaDirty('youtubeUrl') && !mSaving)}
          >
            {mSaving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: 11, color: '#9B8878', fontWeight: 500 }}>URL de video directo (MP4)</label>
            {mSavedKey === 'videoUrl' && !mSaving && <span style={{ fontSize: 10, color: '#C5A880' }}>✓ Guardado</span>}
          </div>
          <input
            type="url"
            value={media.videoUrl}
            onChange={(e) => setMediaField('videoUrl', e.target.value)}
            placeholder="https://..."
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(200,167,93,0.7)'; }}
            onBlur={(e)  => { e.currentTarget.style.borderColor = 'rgba(200,167,93,0.3)'; }}
          />
          <button
            type="button"
            onClick={() => handleMediaSave('videoUrl')}
            disabled={mSaving || !isMediaDirty('videoUrl')}
            style={btnStyle(isMediaDirty('videoUrl') && !mSaving)}
          >
            {mSaving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      )}

      {/* ── SECCIÓN 4: Música ─────────────────────────────────────────────────── */}
      <SectionHeader label="Música" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: 11, color: '#9B8878', fontWeight: 500 }}>URL de música (MP3/audio)</label>
          {mSavedKey === 'musicUrl' && !mSaving && <span style={{ fontSize: 10, color: '#C5A880' }}>✓ Guardado</span>}
        </div>
        <input
          type="url"
          value={media.musicUrl}
          onChange={(e) => setMediaField('musicUrl', e.target.value)}
          placeholder="https://..."
          style={inputStyle}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(200,167,93,0.7)'; }}
          onBlur={(e)  => { e.currentTarget.style.borderColor = 'rgba(200,167,93,0.3)'; }}
        />
        <button
          type="button"
          onClick={() => handleMediaSave('musicUrl')}
          disabled={mSaving || !isMediaDirty('musicUrl')}
          style={btnStyle(isMediaDirty('musicUrl') && !mSaving)}
        >
          {mSaving ? 'Guardando…' : 'Guardar'}
        </button>
      </div>

    </div>
  );
}
