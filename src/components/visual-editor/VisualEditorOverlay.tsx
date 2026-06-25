'use client';

import type { EditableElement } from '@/domain/visual-editor';

interface VisualEditorOverlayProps {
  editableElements: EditableElement[];
}

export function VisualEditorOverlay(props: VisualEditorOverlayProps) {
  void props.editableElements;
  return null;
}
