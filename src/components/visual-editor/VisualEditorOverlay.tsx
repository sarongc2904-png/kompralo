'use client';

import { useMemo, useState } from 'react';
import type { EditableElement, EditableElementId } from '@/domain/visual-editor';
import { VisualEditorBottomSheet } from './VisualEditorBottomSheet';

const EDITOR_SECTION_TARGETS: Record<EditableElementId, string> = {
  hero: 'visual-editor-media',
  event: 'visual-editor-event',
  location: 'visual-editor-location',
  gallery: 'visual-editor-gallery',
  music: 'visual-editor-media',
};

interface VisualEditorOverlayProps {
  editableElements: EditableElement[];
}

export function VisualEditorOverlay({ editableElements }: VisualEditorOverlayProps) {
  const [selectedElement, setSelectedElement] = useState<EditableElement | null>(null);
  const visibleElements = useMemo(
    () => editableElements.filter((element) => element.editable),
    [editableElements],
  );

  if (visibleElements.length === 0) return null;

  return (
    <>
      <div
        className="fixed inset-x-3 bottom-4 z-40 rounded-[24px] border p-3 shadow-xl md:hidden"
        style={{ background: 'rgba(255, 253, 248, 0.96)', borderColor: '#E6D8BD' }}
      >
        <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: '#B99752' }}>
          Editor visual
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {visibleElements.map((element) => (
            <button
              key={element.id}
              type="button"
              className="shrink-0 rounded-full px-4 py-2 text-sm font-semibold"
              style={{ background: '#F3E9D8', color: '#4B3826' }}
              onClick={() => setSelectedElement(element)}
            >
              {element.label}
            </button>
          ))}
        </div>
      </div>

      <VisualEditorBottomSheet
        element={selectedElement}
        open={selectedElement !== null}
        targetId={selectedElement ? EDITOR_SECTION_TARGETS[selectedElement.id] : undefined}
        onClose={() => setSelectedElement(null)}
      />
    </>
  );
}
