'use client';

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { EditableElement, EditableElementId } from '@/domain/visual-editor';
import { VisualEditorBottomSheet } from './VisualEditorBottomSheet';

const EDITOR_SECTION_TARGETS: Record<EditableElementId, string> = {
  hero: 'visual-editor-media',
  event: 'visual-editor-event',
  location: 'visual-editor-location',
  gallery: 'visual-editor-gallery',
  music: 'visual-editor-media',
};

const QUICK_ACTION_LABELS: Record<EditableElementId, string> = {
  hero: 'Editar portada',
  event: 'Editar datos',
  location: 'Editar ubicación',
  gallery: 'Galería',
  music: 'Música',
};

interface VisualEditorMobileEntryProps {
  invitationId: string;
  editableElements: EditableElement[];
  children: ReactNode;
}

export function VisualEditorMobileEntry({
  invitationId,
  editableElements,
  children,
}: VisualEditorMobileEntryProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [selectedElement, setSelectedElement] = useState<EditableElement | null>(null);
  const previewUrl = `/preview/${invitationId}`;

  const visibleElements = useMemo(
    () => editableElements.filter((element) => element.editable),
    [editableElements],
  );

  function scrollToElement(element: EditableElement | null) {
    if (!element) return;

    const targetId = EDITOR_SECTION_TARGETS[element.id];
    window.setTimeout(() => {
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    }, 80);
  }

  function handleEditSelected() {
    setAdvancedOpen(true);
    scrollToElement(selectedElement);
  }

  return (
    <>
      <div className="md:hidden">
        <section
          className="mb-6 rounded-[28px] border p-4 shadow-sm"
          style={{ background: '#FFFDF8', borderColor: '#E6D8BD' }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: '#B99752' }}>
            Editor visual
          </p>
          <h2 className="mt-2 text-2xl font-light" style={{ color: '#2F2419' }}>
            Personaliza tu invitación
          </h2>
          <p className="mt-2 text-sm" style={{ color: '#7A6A5B' }}>
            Revisa cómo se ve y elige qué quieres ajustar.
          </p>

          <div
            className="mt-5 overflow-hidden rounded-[24px] border shadow-inner"
            style={{ borderColor: '#E8E2DA', background: '#F6F2EC' }}
          >
            <iframe
              src={previewUrl}
              title="Vista previa de la invitación"
              className="h-[560px] w-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        </section>

        <section
          className="mb-6 rounded-[28px] border p-4"
          style={{ background: '#FFFFFF', borderColor: '#E8E2DA' }}
        >
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: '#3D2B1A' }}>
            Acciones rápidas
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-3">
            {visibleElements.map((element) => (
              <button
                key={element.id}
                type="button"
                className="flex min-h-14 items-center justify-between rounded-2xl px-4 py-3 text-left text-base font-semibold"
                style={{ background: '#F6F2EC', color: '#3D2B1A' }}
                onClick={() => setSelectedElement(element)}
              >
                <span>{QUICK_ACTION_LABELS[element.id]}</span>
                <span aria-hidden="true" style={{ color: '#B99752' }}>→</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            className="mt-5 w-full rounded-2xl px-5 py-4 text-base font-bold"
            style={{ background: advancedOpen ? '#F2E9DA' : '#1A1410', color: advancedOpen ? '#5F4B35' : '#FFFDF8' }}
            onClick={() => setAdvancedOpen((current) => !current)}
          >
            {advancedOpen ? 'Ocultar editor avanzado' : 'Editor avanzado'}
          </button>
        </section>
      </div>

      <div className={advancedOpen ? 'block' : 'hidden md:block'}>
        {children}
      </div>

      <VisualEditorBottomSheet
        element={selectedElement}
        open={selectedElement !== null}
        targetId={selectedElement ? EDITOR_SECTION_TARGETS[selectedElement.id] : undefined}
        onEdit={handleEditSelected}
        onClose={() => setSelectedElement(null)}
      />
    </>
  );
}
