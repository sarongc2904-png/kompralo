'use client';

import { useState } from 'react';
import type { InvitationContent } from '@/domain/invitations';
import type { GalleryImageItem } from '@/domain/invitations';
import { updateInvitationGallery } from './actions';
import type { UpdateInvitationResult } from './actions';
import { notifyPreviewRefresh } from './previewRefresh';
import { ImageUploadButton } from '@/components/dashboard/ImageUploadButton';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildInitialItems(gallery: InvitationContent['gallery']): GalleryImageItem[] {
  const images   = gallery?.images   ?? [];
  const captions = gallery?.captions ?? [];
  return images.map((url, i) => ({ url, caption: captions[i] ?? '' }));
}

// ─── Row component ────────────────────────────────────────────────────────────

function ImageRow({
  item,
  index,
  total,
  invitationId,
  onChange,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  item: GalleryImageItem;
  index: number;
  total: number;
  invitationId: string;
  onChange: (field: 'url' | 'caption', value: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}) {
  const [imgError, setImgError] = useState(false);

  const isValidUrl = (() => {
    try { new URL(item.url); return true; } catch { return false; }
  })();

  return (
    <div
      className="flex gap-3 p-3 rounded-lg"
      style={{ background: '#FAFAF8', border: '1px solid #F0EBE4' }}
    >
      {/* Thumbnail */}
      <div
        className="flex-shrink-0 rounded overflow-hidden"
        style={{ width: 64, height: 64, background: '#F0EBE4' }}
      >
        {isValidUrl && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.url}
            alt={`Imagen ${index + 1}`}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span style={{ color: '#C0B0A0', fontSize: 22 }}>🖼</span>
          </div>
        )}
      </div>

      {/* Inputs */}
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="flex gap-2 items-center">
          <input
            type="url"
            value={item.url}
            onChange={(e) => { setImgError(false); onChange('url', e.target.value); }}
            placeholder="https://..."
            className="flex-1 px-2.5 py-1.5 rounded text-sm"
            style={{
              background: '#FFFFFF',
              border: `1px solid ${item.url && !isValidUrl ? '#FFCDD2' : '#E8E2DA'}`,
              color: '#1A1410',
              outline: 'none',
            }}
          />
          <ImageUploadButton
            folder="gallery"
            invitationId={invitationId}
            onUpload={(url) => { setImgError(false); onChange('url', url); }}
          />
        </div>
        <input
          type="text"
          value={item.caption}
          onChange={(e) => onChange('caption', e.target.value)}
          placeholder="Descripción opcional…"
          className="w-full px-2.5 py-1.5 rounded text-xs"
          style={{
            background: '#FFFFFF',
            border: '1px solid #E8E2DA',
            color: '#6B5B4E',
            outline: 'none',
          }}
        />
      </div>

      {/* Controls */}
      <div className="flex-shrink-0 flex flex-col gap-1 justify-center">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={index === 0}
          title="Mover arriba"
          className="px-2 py-1 rounded text-xs transition-opacity"
          style={{
            background: '#F0EBE4',
            color: '#6B5B4E',
            opacity: index === 0 ? 0.3 : 1,
          }}
        >
          ↑
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={index === total - 1}
          title="Mover abajo"
          className="px-2 py-1 rounded text-xs transition-opacity"
          style={{
            background: '#F0EBE4',
            color: '#6B5B4E',
            opacity: index === total - 1 ? 0.3 : 1,
          }}
        >
          ↓
        </button>
        <button
          type="button"
          onClick={onDelete}
          title="Eliminar"
          className="px-2 py-1 rounded text-xs transition-colors"
          style={{ background: '#FFEBEE', color: '#C62828' }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// ─── Form ─────────────────────────────────────────────────────────────────────

interface GalleryFormProps {
  invitation: InvitationContent;
}

export default function GalleryForm({ invitation }: GalleryFormProps) {
  const [items, setItems] = useState<GalleryImageItem[]>(
    () => buildInitialItems(invitation.gallery),
  );
  const [result, setResult] = useState<UpdateInvitationResult | null>(null);
  const [isPending, setIsPending] = useState(false);

  // ── Item mutations ──────────────────────────────────────────────────────────

  function handleChange(index: number, field: 'url' | 'caption', value: string) {
    setItems((prev) => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
    setResult(null);
  }

  function handleMoveUp(index: number) {
    if (index === 0) return;
    setItems((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
    setResult(null);
  }

  function handleMoveDown(index: number) {
    setItems((prev) => {
      if (index === prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
    setResult(null);
  }

  function handleDelete(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
    setResult(null);
  }

  function handleAdd() {
    setItems((prev) => [...prev, { url: '', caption: '' }]);
    setResult(null);
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);
    setResult(null);
    const res = await updateInvitationGallery({
      id:    invitation.id,
      slug:  invitation.slug,
      items,
    });
    if (res.success) notifyPreviewRefresh();
    setResult(res);
    setIsPending(false);
  }

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit}>
      {/* Feedback */}
      {result && (
        <div
          className="mb-4 px-4 py-3 rounded-lg text-sm"
          style={{
            background: result.success ? '#E8F5E9' : '#FFEBEE',
            color:      result.success ? '#388E3C'  : '#C62828',
            border:     `1px solid ${result.success ? '#C8E6C9' : '#FFCDD2'}`,
          }}
        >
          {result.success ? result.message : result.error}
        </div>
      )}

      {/* Image list */}
      <div className="flex flex-col gap-2 mb-4">
        {items.length === 0 && (
          <p className="text-sm py-4 text-center" style={{ color: '#B0A090' }}>
            No hay imágenes. Agrega una para comenzar.
          </p>
        )}
        {items.map((item, i) => (
          <ImageRow
            key={i}
            item={item}
            index={i}
            total={items.length}
            invitationId={invitation.id}
            onChange={(field, value) => handleChange(i, field, value)}
            onMoveUp={() => handleMoveUp(i)}
            onMoveDown={() => handleMoveDown(i)}
            onDelete={() => handleDelete(i)}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleAdd}
          className="px-4 py-2 rounded-lg text-sm transition-colors"
          style={{ background: '#F0EBE4', color: '#3D2B1A', border: '1px dashed #C5A880' }}
        >
          + Agregar imagen
        </button>

        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 rounded-lg text-sm font-medium transition-opacity"
          style={{ background: '#1A1410', color: '#F5F3F0', opacity: isPending ? 0.6 : 1 }}
        >
          {isPending ? 'Guardando…' : `Guardar galería (${items.length})`}
        </button>
      </div>
    </form>
  );
}
