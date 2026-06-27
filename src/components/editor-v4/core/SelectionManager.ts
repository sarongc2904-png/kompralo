'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  type EditorV4ElementSelectedEvent,
  isEditorV4Event,
  EDITOR_V4_ELEMENT_SELECTED,
  EDITOR_V4_ELEMENT_DESELECTED,
} from '../editor-v4-events';

/** The full event shape (superset of EditorElement — adds `type` discriminant) */
export type SelectedElement = EditorV4ElementSelectedEvent | null;

export function useSelectionManager() {
  const [selectedElement, setSelectedElement] = useState<SelectedElement>(null);
  const clearSelection = useCallback(() => setSelectedElement(null), []);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (!isEditorV4Event(event.data)) return;
      if (event.data.type === EDITOR_V4_ELEMENT_SELECTED) {
        setSelectedElement(event.data);
      } else if (event.data.type === EDITOR_V4_ELEMENT_DESELECTED) {
        setSelectedElement(null);
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return { selectedElement, setSelectedElement, clearSelection };
}
