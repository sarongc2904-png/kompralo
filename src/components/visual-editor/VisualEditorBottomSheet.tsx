'use client';

import type { EditableElement } from '@/domain/visual-editor';

interface VisualEditorBottomSheetProps {
  element: EditableElement | null;
  open: boolean;
  targetId?: string;
  title?: string;
  description?: string;
  onEdit?: () => void;
  onClose: () => void;
}

export function VisualEditorBottomSheet({
  element,
  open,
  targetId,
  title,
  description,
  onEdit,
  onClose,
}: VisualEditorBottomSheetProps) {
  if (!open || !element) return null;

  function handleEdit() {
    if (onEdit) {
      onEdit();
      onClose();
      return;
    }

    if (targetId) {
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    }

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 h-full w-full bg-black/25"
        aria-label="Cerrar editor visual"
        onClick={onClose}
      />

      <div
        className="absolute inset-x-0 bottom-0 rounded-t-[28px] border px-5 pb-6 pt-4 shadow-2xl"
        style={{ background: '#FFFDF8', borderColor: '#E6D8BD' }}
      >
        <div className="mx-auto mb-4 h-1 w-12 rounded-full" style={{ background: '#D6C6AA' }} />

        <p className="text-xs uppercase tracking-[0.22em]" style={{ color: '#B99752' }}>
          Elemento editable
        </p>
        <h2 className="mt-2 text-xl font-semibold" style={{ color: '#2F2419' }}>
          {title ?? element.label}
        </h2>
        {description && (
          <p className="mt-2 text-sm" style={{ color: '#5F4B35' }}>
            {description}
          </p>
        )}
        <p className="mt-2 text-sm" style={{ color: '#7A6A5B' }}>
          Abre la sección correspondiente del editor para ajustar este contenido.
        </p>

        <div className="mt-5 grid grid-cols-[0.8fr_1.2fr] gap-3">
          <button
            type="button"
            className="rounded-2xl px-4 py-3 text-sm font-semibold"
            style={{ background: '#F2E9DA', color: '#5F4B35' }}
            onClick={onClose}
          >
            Cerrar
          </button>
          <button
            type="button"
            className="rounded-2xl px-4 py-3 text-sm font-semibold shadow-sm"
            style={{ background: '#C4A962', color: '#1D160E' }}
            onClick={handleEdit}
          >
            Editar
          </button>
        </div>
      </div>
    </div>
  );
}
