'use client';

import React, { useEffect, useRef } from 'react';

type EditableTag = 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'strong' | 'em';

interface EditableTextProps {
  value: string;
  fieldPath: string;
  isEditable?: boolean;
  as?: EditableTag;
  className?: string;
  style?: React.CSSProperties;
  singleLine?: boolean;
  fallback?: string;
  placeholder?: string;
  onCommit?: (fieldPath: string, value: string) => void;
}

function sanitizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

// Injected once into <head> so ::before placeholders work inside contentEditable.
// Using attr() because CSS variables are not accessible inside pseudo-elements on all browsers.
const PLACEHOLDER_CSS = `
[data-editable-empty="true"]::before {
  content: attr(data-placeholder);
  opacity: 0.45;
  pointer-events: none;
  font-style: italic;
}
`;

let placeholderStyleInjected = false;
function ensurePlaceholderStyle() {
  if (placeholderStyleInjected || typeof document === 'undefined') return;
  placeholderStyleInjected = true;
  const el = document.createElement('style');
  el.setAttribute('data-kompralo-editor', '1');
  el.textContent = PLACEHOLDER_CSS;
  document.head.appendChild(el);
}

function syncEmptyAttr(el: HTMLElement) {
  const empty = !(el.textContent ?? '').trim();
  if (empty) {
    el.setAttribute('data-editable-empty', 'true');
  } else {
    el.removeAttribute('data-editable-empty');
  }
}

export function EditableText({
  value,
  fieldPath,
  isEditable = false,
  as = 'span',
  className,
  style,
  singleLine = true,
  fallback = '',
  placeholder = 'Escribe aquí…',
  onCommit,
}: EditableTextProps) {
  const ref = useRef<HTMLElement | null>(null);
  const originalValueRef = useRef(value ?? '');

  // Public mode: fall back to `fallback` when value is empty.
  // Editor mode: show raw value (even empty) — CSS ::before shows placeholder.
  const displayValue = isEditable ? (value ?? '') : (value || fallback);

  useEffect(() => {
    if (isEditable) ensurePlaceholderStyle();
  }, [isEditable]);

  useEffect(() => {
    originalValueRef.current = value ?? '';
    if (ref.current && document.activeElement !== ref.current) {
      ref.current.textContent = displayValue;
      if (isEditable) syncEmptyAttr(ref.current);
    }
  }, [displayValue, isEditable, value]);

  function commit() {
    if (!isEditable || !ref.current) return;
    const nextValue = sanitizeText(ref.current.textContent ?? '');
    // Ensure DOM matches trimmed value (cleans up stray spaces)
    ref.current.textContent = nextValue;
    if (isEditable) syncEmptyAttr(ref.current);

    if (nextValue === originalValueRef.current) return;
    originalValueRef.current = nextValue;

    // Save empty string if user cleared the field — do NOT substitute fallback.
    // The placeholder CSS handles the visual; the real value is ''.
    if (onCommit) {
      onCommit(fieldPath, nextValue);
      return;
    }

    window.parent?.postMessage(
      { type: 'KOMPRALO_INLINE_EDIT', fieldPath, value: nextValue },
      window.location.origin,
    );
  }

  function cancel() {
    if (!ref.current) return;
    ref.current.textContent = originalValueRef.current;
    if (isEditable) syncEmptyAttr(ref.current);
    ref.current.blur();
  }

  const editorStyle: React.CSSProperties | undefined = isEditable
    ? {
        minHeight: '1.2em',
        minWidth: '2ch',
        display: 'inline-block',
        cursor: 'text',
        // Dashed outline only when the field is empty so the editor can see where to click
        outlineOffset: '2px',
        ...style,
      }
    : style;

  const initialEmpty = isEditable && !displayValue;

  return React.createElement(as, {
    ref,
    className,
    style: editorStyle,
    contentEditable: isEditable,
    suppressContentEditableWarning: true,
    spellCheck: isEditable ? true : undefined,
    tabIndex: isEditable ? 0 : undefined,
    role: isEditable ? 'textbox' : undefined,
    'aria-label': isEditable ? `Editar ${fieldPath}` : undefined,
    'data-editable-field': isEditable ? fieldPath : undefined,
    'data-placeholder': isEditable ? placeholder : undefined,
    'data-editable-empty': initialEmpty ? 'true' : undefined,
    onInput: isEditable
      ? (event: React.FormEvent<HTMLElement>) => {
          syncEmptyAttr(event.currentTarget);
        }
      : undefined,
    onFocus: isEditable
      ? () => {
          window.parent?.postMessage(
            {
              type: 'EDITOR_V4_ELEMENT_SELECTED',
              elementType: 'text',
              fieldPath,
              label: fieldPath,
              value: ref.current?.textContent ?? value ?? '',
            },
            window.location.origin,
          );
        }
      : undefined,
    onBlur: isEditable ? commit : undefined,
    onPaste: isEditable
      ? (event: React.ClipboardEvent<HTMLElement>) => {
          event.preventDefault();
          const text = sanitizeText(event.clipboardData.getData('text/plain'));
          document.execCommand('insertText', false, text);
        }
      : undefined,
    onKeyDown: isEditable
      ? (event: React.KeyboardEvent<HTMLElement>) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            cancel();
            return;
          }
          if (singleLine && event.key === 'Enter') {
            event.preventDefault();
            commit();
            ref.current?.blur();
          }
        }
      : undefined,
  }, displayValue);
}
